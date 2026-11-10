import { supabase } from '../lib/supabase';
import { db } from '../lib/dexie';
import type { Card, CreateCardInput, UpdateCardInput } from '../types/card.types';
import { useAuthStore } from '../stores/auth.store';

export const cardService = {
  async getCards(deckId: string): Promise<Card[]> {
    const { user, isOnline } = useAuthStore.getState();
    if (!user) return [];

    // If online, fetch from Supabase and cache
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('deck_id', deckId)
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          // Sync local cache
          await db.cards.where('deck_id').equals(deckId).delete();
          await db.cards.bulkPut(data as Card[]);
          return data as Card[];
        }
      } catch (err) {
        console.error('Failed to fetch cards from Supabase, falling back to cache:', err);
      }
    }

    // Offline fallback: load from local cache
    return db.cards.where('deck_id').equals(deckId).toArray();
  },

  async createCard(input: CreateCardInput): Promise<Card> {
    const { user, isOnline } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    const newCard: Card = {
      id: crypto.randomUUID(),
      deck_id: input.deck_id,
      user_id: user.id,
      question: input.question,
      answer: input.answer,
      ease_factor: 2.5,
      interval: 1,
      repetitions: 0,
      next_review_at: new Date().toISOString(),
      last_reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Write card to Dexie
    await db.cards.put(newCard);

    // 2. Increment deck count in Dexie
    const deck = await db.decks.get(input.deck_id);
    if (deck) {
      await db.decks.update(input.deck_id, {
        card_count: (deck.card_count || 0) + 1,
        updated_at: new Date().toISOString()
      });
    }

    // 3. Sync to Supabase or queue
    if (isOnline) {
      try {
        const { error } = await supabase.from('cards').insert(newCard);
        if (error) throw error;

        // Sync deck card count to Supabase
        if (deck) {
          await supabase
            .from('decks')
            .update({ card_count: (deck.card_count || 0) + 1, updated_at: new Date().toISOString() })
            .eq('id', input.deck_id);
        }
      } catch (err) {
        console.error('Failed to save card to Supabase. Queueing sync.', err);
        await db.sync_queue.add({
          table_name: 'cards',
          action: 'CREATE',
          record_id: newCard.id,
          payload: newCard,
          created_at: Date.now(),
        });
      }
    } else {
      await db.sync_queue.add({
        table_name: 'cards',
        action: 'CREATE',
        record_id: newCard.id,
        payload: newCard,
        created_at: Date.now(),
      });
    }

    return newCard;
  },

  async updateCard(cardId: string, input: UpdateCardInput): Promise<void> {
    const { isOnline } = useAuthStore.getState();
    const updated_at = new Date().toISOString();
    const updates = { ...input, updated_at };

    // 1. Fetch current card
    const card = await db.cards.get(cardId);
    if (!card) throw new Error('Card not found');

    const updatedCard = { ...card, ...updates } as Card;
    await db.cards.put(updatedCard);

    // 2. Sync / Queue
    if (isOnline) {
      try {
        const { error } = await supabase
          .from('cards')
          .update(updates)
          .eq('id', cardId);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to update card in Supabase. Queueing sync.', err);
        await db.sync_queue.add({
          table_name: 'cards',
          action: 'UPDATE',
          record_id: cardId,
          payload: updates,
          created_at: Date.now(),
        });
      }
    } else {
      await db.sync_queue.add({
        table_name: 'cards',
        action: 'UPDATE',
        record_id: cardId,
        payload: updates,
        created_at: Date.now(),
      });
    }
  },

  async deleteCard(cardId: string): Promise<void> {
    const { isOnline } = useAuthStore.getState();

    // 1. Fetch current card to get its deck ID
    const card = await db.cards.get(cardId);
    if (!card) throw new Error('Card not found');

    const deckId = card.deck_id;

    // 2. Delete locally
    await db.cards.delete(cardId);

    // 3. Decrement deck count locally
    const deck = await db.decks.get(deckId);
    if (deck) {
      const newCount = Math.max(0, (deck.card_count || 0) - 1);
      await db.decks.update(deckId, {
        card_count: newCount,
        updated_at: new Date().toISOString()
      });
    }

    // 4. Sync / Queue
    if (isOnline) {
      try {
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('id', cardId);
        if (error) throw error;

        if (deck) {
          const newCount = Math.max(0, (deck.card_count || 0) - 1);
          await supabase
            .from('decks')
            .update({ card_count: newCount, updated_at: new Date().toISOString() })
            .eq('id', deckId);
        }
      } catch (err) {
        console.error('Failed to delete card in Supabase. Queueing sync.', err);
        await db.sync_queue.add({
          table_name: 'cards',
          action: 'DELETE',
          record_id: cardId,
          payload: null,
          created_at: Date.now(),
        });
      }
    } else {
      await db.sync_queue.add({
        table_name: 'cards',
        action: 'DELETE',
        record_id: cardId,
        payload: null,
        created_at: Date.now(),
      });
    }
  },
};
