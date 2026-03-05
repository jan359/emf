export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-3)
  explanation: string;
  topic: string;
  difficulty: DifficultyLevel;
}

export interface QuizResult {
  score: number;
  total: number;
  weakTopics: string[];
  feedbackSummary: string;
}

export interface UserProgress {
  weakTopics: string[];
  history: QuizResult[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  topic: string;
}
