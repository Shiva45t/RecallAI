export interface Deck {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  color: string; // hex code default '#6366f1'
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDeckInput {
  title: string;
  description?: string;
  subject?: string;
  color?: string;
}

export type UpdateDeckInput = Partial<CreateDeckInput>;
