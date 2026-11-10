export interface GeneratedCard {
  question: string;
  answer: string;
}

export interface WeakSpot {
  topic: string;
  description: string;
  recommendation: string;
}

export interface WeakSpotAnalysisResponse {
  gaps: WeakSpot[];
}

export interface QuizEvaluation {
  score: number; // 0 to 100
  strengths: string[];
  weaknesses: string[];
  feedback: string;
}

export interface ConceptMapNode {
  id: string;
  label: string;
  color: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky';
  description: string;
}

export interface ConceptMapEdge {
  from: string;
  to: string;
  label: string;
}

export interface ConceptMapData {
  title: string;
  nodes: ConceptMapNode[];
  edges: ConceptMapEdge[];
}
