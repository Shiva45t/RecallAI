import { supabase } from '../lib/supabase';
import { db } from '../lib/dexie';
import { calculateSM2 } from '../lib/sm2';
import { useAuthStore } from '../stores/auth.store';
import { calculateStreak } from '../utils/streak.utils';
import type { StudySession, CardReview } from '../types/session.types';

export const studyService = {
  async logStudySession(
    deckId: string,
    cardsStudied: number,
    cardsCorrect: number,
    durationSeconds: number,
    reviews: { card_id: string; rating: number }[]
  ): Promise<StudySession> {
    const { user, profile, isOnline, updateProfile } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    const sessionId = crypto.randomUUID();
    const completedAt = new Date().toISOString();

    const sessionRecord: StudySession = {
      id: sessionId,
      user_id: user.id,
      deck_id: deckId,
      cards_studied: cardsStudied,
      cards_correct: cardsCorrect,
      duration_seconds: durationSeconds,
      completed_at: completedAt,
    };

    // 1. Log session in Dexie
    await db.study_sessions.put(sessionRecord);

    // 2. Log card reviews in Dexie & update SM-2 card weights
    const reviewRecords: CardReview[] = [];
    const cardUpdates: any[] = [];

    for (const rev of reviews) {
      const reviewId = crypto.randomUUID();
      const reviewRecord: CardReview = {
        id: reviewId,
        session_id: sessionId,
        card_id: rev.card_id,
        user_id: user.id,
        rating: rev.rating,
        reviewed_at: completedAt,
      };
      reviewRecords.push(reviewRecord);

      // Fetch card to run SM-2 algorithm
      const card = await db.cards.get(rev.card_id);
      if (card) {
        const nextSM2 = calculateSM2({
          easeFactor: card.ease_factor,
          interval: card.interval,
          repetitions: card.repetitions,
          rating: rev.rating,
        });

        const updatedFields = {
          ease_factor: nextSM2.easeFactor,
          interval: nextSM2.interval,
          repetitions: nextSM2.repetitions,
          next_review_at: nextSM2.nextReviewAt,
          last_reviewed_at: completedAt,
          updated_at: new Date().toISOString()
        };

        // Update locally
        await db.cards.update(rev.card_id, updatedFields);
        cardUpdates.push({ cardId: rev.card_id, updates: updatedFields });
      }
    }

    if (reviewRecords.length > 0) {
      await db.card_reviews.bulkPut(reviewRecords);
    }

    // 3. Update User Profile streak and total cards studied counts
    if (profile) {
      const streakResult = calculateStreak(profile.last_studied_at, profile.streak_count);
      const totalCards = (profile.total_cards_studied || 0) + cardsStudied;

      await updateProfile({
        streak_count: streakResult.streakCount,
        last_studied_at: streakResult.lastStudiedAt,
        total_cards_studied: totalCards,
      });
    }

    // 4. Push updates to Supabase (if online) or queue them
    if (isOnline) {
      try {
        // Insert study session
        const { error: sessionError } = await supabase
          .from('study_sessions')
          .insert(sessionRecord);
        if (sessionError) throw sessionError;

        // Insert card reviews
        if (reviewRecords.length > 0) {
          const { error: reviewsError } = await supabase
            .from('card_reviews')
            .insert(reviewRecords);
          if (reviewsError) throw reviewsError;
        }

        // Sync individual card reviews and SM-2 changes
        for (const update of cardUpdates) {
          await supabase
            .from('cards')
            .update(update.updates)
            .eq('id', update.cardId);
        }
      } catch (err) {
        console.error('Failed to sync study session data to Supabase. Queueing sync.', err);
        // Queue study session
        await db.sync_queue.add({
          table_name: 'study_sessions',
          action: 'CREATE',
          record_id: sessionRecord.id,
          payload: sessionRecord,
          created_at: Date.now(),
        });

        // Queue card reviews
        for (const review of reviewRecords) {
          await db.sync_queue.add({
            table_name: 'card_reviews',
            action: 'CREATE',
            record_id: review.id,
            payload: review,
            created_at: Date.now(),
          });
        }

        // Queue card SM-2 updates
        for (const update of cardUpdates) {
          await db.sync_queue.add({
            table_name: 'cards',
            action: 'UPDATE',
            record_id: update.cardId,
            payload: update.updates,
            created_at: Date.now(),
          });
        }
      }
    } else {
      // Offline: Queue all transactions
      await db.sync_queue.add({
        table_name: 'study_sessions',
        action: 'CREATE',
        record_id: sessionRecord.id,
        payload: sessionRecord,
        created_at: Date.now(),
      });

      for (const review of reviewRecords) {
        await db.sync_queue.add({
          table_name: 'card_reviews',
          action: 'CREATE',
          record_id: review.id,
          payload: review,
          created_at: Date.now(),
        });
      }

      for (const update of cardUpdates) {
        await db.sync_queue.add({
          table_name: 'cards',
          action: 'UPDATE',
          record_id: update.cardId,
          payload: update.updates,
          created_at: Date.now(),
        });
      }
    }

    return sessionRecord;
  },
};
