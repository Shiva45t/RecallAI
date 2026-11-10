export interface Card {
  id: string;
  deck_id: string;
  user_id: string;
  question: string;
  answer: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCardInput {
  deck_id: string;
  question: string;
  answer: string;
}

export type UpdateCardInput = Partial<Omit<Card, 'id' | 'deck_id' | 'user_id' | 'created_at'>>;
