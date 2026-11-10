import { create } from 'zustand';
import type { Card } from '../types/card.types';
import type { StudySession } from '../types/session.types';
import { cardService } from '../services/card.service';
import { studyService } from '../services/study.service';

interface StudyState {
  deckId: string | null;
  cards: Card[];
  currentIndex: number;
  reviews: { card_id: string; rating: number }[];
  startTime: number | null;
  correctCount: number;
  isLoading: boolean;
  error: string | null;
  studyAllMode: boolean;

  startSession: (deckId: string, studyAll?: boolean) => Promise<void>;
  submitRating: (rating: number) => void;
  finishSession: () => Promise<StudySession | null>;
  resetSession: () => void;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  deckId: null,
  cards: [],
  currentIndex: 0,
  reviews: [],
  startTime: null,
  correctCount: 0,
  isLoading: false,
  error: null,
  studyAllMode: false,

  startSession: async (deckId, studyAll = false) => {
    set({ isLoading: true, error: null, deckId });
    try {
      const allCards = await cardService.getCards(deckId);
      
      const now = new Date();
      // Filter cards where next_review_at <= now
      let filteredCards = allCards.filter(
        (card) => new Date(card.next_review_at) <= now
      );

      let usedAll = false;
      // Fallback: If no cards are due, study all cards so the user is never blocked
      if (filteredCards.length === 0 || studyAll) {
        filteredCards = allCards;
        usedAll = true;
      }

      // Shuffle cards for a better learning experience
      const shuffledCards = [...filteredCards].sort(() => Math.random() - 0.5);

      set({
        cards: shuffledCards,
        currentIndex: 0,
        reviews: [],
        correctCount: 0,
        startTime: Date.now(),
        studyAllMode: usedAll,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to start study session', isLoading: false });
    }
  },

  submitRating: (rating) => {
    const { cards, currentIndex, reviews, correctCount } = get();
    if (currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];
    
    // Increment correctCount if rating is Good (4) or Easy (5)
    const wasCorrect = rating >= 3;
    const nextCorrectCount = wasCorrect ? correctCount + 1 : correctCount;

    set({
      reviews: [...reviews, { card_id: currentCard.id, rating }],
      correctCount: nextCorrectCount,
      currentIndex: currentIndex + 1
    });
  },

  finishSession: async () => {
    const { deckId, reviews, startTime, correctCount } = get();
    if (!deckId || !startTime || reviews.length === 0) return null;

    set({ isLoading: true });
    try {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      
      // Log the session on Supabase & Dexie
      const session = await studyService.logStudySession(
        deckId,
        reviews.length, // total cards studied
        correctCount,   // correct count
        durationSeconds,
        reviews
      );

      set({ isLoading: false });
      return session;
    } catch (err: any) {
      set({ error: err.message || 'Failed to save study session', isLoading: false });
      throw err;
    }
  },

  resetSession: () => {
    set({
      deckId: null,
      cards: [],
      currentIndex: 0,
      reviews: [],
      startTime: null,
      correctCount: 0,
      isLoading: false,
      error: null,
      studyAllMode: false
    });
  }
}));
