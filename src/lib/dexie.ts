import Dexie, { type Table } from 'dexie';
import type { Deck } from '../types/deck.types';
import type { Card } from '../types/card.types';
import type { StudySession, CardReview } from '../types/session.types';

export interface LocalProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  streak_count: number;
  last_studied_at: string | null;
  total_cards_studied: number;
  created_at: string;
}

export interface SyncItem {
  id?: number;
  table_name: 'decks' | 'cards' | 'profiles' | 'study_sessions' | 'card_reviews';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  record_id: string;
  payload: any;
  created_at: number; // epoch milliseconds
}

export class RecallAIDatabase extends Dexie {
  profiles!: Table<LocalProfile, string>;
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;
  study_sessions!: Table<StudySession, string>;
  card_reviews!: Table<CardReview, string>;
  sync_queue!: Table<SyncItem, number>;

  constructor() {
    super('RecallAIDatabase');
    
    this.version(1).stores({
      profiles: 'id, username, streak_count',
      decks: 'id, user_id, title, subject, created_at, updated_at',
      cards: 'id, deck_id, user_id, next_review_at, updated_at',
      study_sessions: 'id, user_id, deck_id, completed_at',
      card_reviews: 'id, session_id, card_id, user_id, rating',
      sync_queue: '++id, table_name, action, record_id, created_at'
    });
  }
}

export const db = new RecallAIDatabase();
