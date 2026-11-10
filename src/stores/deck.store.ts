import { create } from 'zustand';
import type { Deck, CreateDeckInput, UpdateDeckInput } from '../types/deck.types';
import { deckService } from '../services/deck.service';

interface DeckState {
  decks: Deck[];
  isLoading: boolean;
  error: string | null;
  loadDecks: () => Promise<void>;
  createDeck: (input: CreateDeckInput) => Promise<Deck>;
  updateDeck: (id: string, input: UpdateDeckInput) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
}

export const useDeckStore = create<DeckState>((set) => ({
  decks: [],
  isLoading: false,
  error: null,

  loadDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const decks = await deckService.getDecks();
      set({ decks, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load decks', isLoading: false });
    }
  },

  createDeck: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const newDeck = await deckService.createDeck(input);
      set((state) => ({
        decks: [newDeck, ...state.decks],
        isLoading: false
      }));
      return newDeck;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create deck', isLoading: false });
      throw err;
    }
  },

  updateDeck: async (id, input) => {
    try {
      await deckService.updateDeck(id, input);
      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === id
            ? { ...deck, ...input, updated_at: new Date().toISOString() }
            : deck
        )
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update deck' });
      throw err;
    }
  },

  deleteDeck: async (id) => {
    try {
      await deckService.deleteDeck(id);
      set((state) => ({
        decks: state.decks.filter((deck) => deck.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete deck' });
      throw err;
    }
  }
}));
