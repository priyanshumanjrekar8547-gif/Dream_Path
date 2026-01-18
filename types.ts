
export enum LearnerProfile {
  ADHD = 'ADHD',
  NON_NATIVE_ENGLISH = 'Non-Native English',
  ADVANCED = 'Advanced',
}

export enum LearningType {
  LESSON = 'Adapted Lesson',
  FLASHCARDS = 'Flash Cards',
  QUIZ = 'Quiz',
  GAME = 'Game',
}

export interface AppState {
  lessonContent: string;
  learnerProfile: LearnerProfile;
  learningType: LearningType;
  question: string;
  fileName: string | null;
}

export interface FlashCard {
  term: string;
  definition: string;
  imageUrl?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface GamePair {
  term: string;
  match: string;
  imageUrl?: string;
}

export type OutputData = string | FlashCard[] | QuizQuestion[] | GamePair[];

export interface OutputType {
  type: 'lesson' | 'flashcards' | 'quiz' | 'game';
  data: OutputData;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface FileHistoryItem {
  fileName: string;
  content: string;
}
