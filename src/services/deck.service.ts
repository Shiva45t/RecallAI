import { supabase } from '../lib/supabase';
import { db } from '../lib/dexie';
import type { Deck, CreateDeckInput, UpdateDeckInput } from '../types/deck.types';
import { useAuthStore } from '../stores/auth.store';

export const deckService = {
  async getDecks(): Promise<Deck[]> {
    const { user, isOnline } = useAuthStore.getState();
    if (!user) return [];

    // If online, pull from Supabase and cache
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('decks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // Clear and cache locally
          await db.decks.where('user_id').equals(user.id).delete();
          await db.decks.bulkPut(data as Deck[]);
          return data as Deck[];
        }
      } catch (err) {
        console.error('Failed to fetch decks from Supabase, falling back to cache:', err);
      }
    }

    // Offline fallback: load from local cache
    return db.decks.where('user_id').equals(user.id).toArray();
  },

  async createDeck(input: CreateDeckInput): Promise<Deck> {
    const { user, isOnline } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    const newDeck: Deck = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      subject: input.subject || null,
      color: input.color || '#6366f1',
      card_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Write to local database first (immediate UI update)
    await db.decks.put(newDeck);

    // 2. If online, sync to Supabase. If fail, queue it.
    if (isOnline) {
      try {
        const { error } = await supabase.from('decks').insert(newDeck);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to save deck to Supabase. Queueing sync.', err);
        await db.sync_queue.add({
          table_name: 'decks',
          action: 'CREATE',
          record_id: newDeck.id,
          payload: newDeck,
          created_at: Date.now(),
        });
      }
    } else {
      await db.sync_queue.add({
        table_name: 'decks',
        action: 'CREATE',
        record_id: newDeck.id,
        payload: newDeck,
        created_at: Date.now(),
      });
    }

    return newDeck;
  },

  async updateDeck(deckId: string, input: UpdateDeckInput): Promise<void> {
    const { isOnline } = useAuthStore.getState();
    const updated_at = new Date().toISOString();
    const updates = { ...input, updated_at };

    // 1. Write locally
    const deck = await db.decks.get(deckId);
    if (!deck) throw new Error('Deck not found');

    const updatedDeck = { ...deck, ...updates } as Deck;
    await db.decks.put(updatedDeck);

    // 2. Sync / Queue
    if (isOnline) {
      try {
        const { error } = await supabase
          .from('decks')
          .update(updates)
          .eq('id', deckId);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to update deck in Supabase. Queueing sync.', err);
        await db.sync_queue.add({
          table_name: 'decks',
          action: 'UPDATE',
          record_id: deckId,
          payload: updates,
          created_at: Date.now(),
        });
      }
    } else {
      await db.sync_queue.add({
        table_name: 'decks',
        action: 'UPDATE',
        record_id: deckId,
        payload: updates,
        created_at: Date.now(),
      });
    }
  },

  async deleteDeck(deckId: string): Promise<void> {
    const { isOnline } = useAuthStore.getState();

    // 1. Delete locally (cascade deletes cards)
    await db.decks.delete(deckId);
    await db.cards.where('deck_id').equals(deckId).delete();

    // 2. Sync / Queue
    if (isOnline) {
      try {
        const { error } = await supabase
          .from('decks')
          .delete()
          .eq('id', deckId);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to delete deck in Supabase. Queueing sync.', err);
        await db.sync_queue.add({
          table_name: 'decks',
          action: 'DELETE',
          record_id: deckId,
          payload: null,
          created_at: Date.now(),
        });
      }
    } else {
      await db.sync_queue.add({
        table_name: 'decks',
        action: 'DELETE',
        record_id: deckId,
        payload: null,
        created_at: Date.now(),
      });
    }
  },
};
