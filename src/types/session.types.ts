export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string;
  cards_studied: number;
  cards_correct: number;
  duration_seconds: number;
  completed_at: string;
}

export interface CardReview {
  id: string;
  session_id: string | null;
  card_id: string;
  user_id: string;
  rating: number; // 1 to 5
  reviewed_at: string;
}

export interface CreateStudySessionInput {
  deck_id: string;
  cards_studied: number;
  cards_correct: number;
  duration_seconds: number;
}

export interface CreateCardReviewInput {
  session_id?: string;
  card_id: string;
  rating: number;
}
