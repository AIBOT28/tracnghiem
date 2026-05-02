
export interface Subject {
  id: number;
  ten: string;
  soCau?: number;
}

export interface Chapter {
  name: string;
}

export interface Answer {
  key: string;
  text: string;
}

export interface Question {
  text: string;
  answers: Answer[];
  correct: string;
  explanation?: string;
}

export enum ExamMode {
  THI_THU = 'thithu',
  ON_NGAU_NHIEN = 'on_ngaunhien',
  ON_CHUONG = 'on_chuong'
}

export interface HistoryItem {
  date: string;
  mode: string;
  correct: number;
  total: number;
  score: string;
  questions: Question[];
  userAnswers: Record<number, string>;
}

export interface SessionData {
  subject: Subject;
  mode: ExamMode;
  questions: Question[];
  index: number;
  answers: Record<number, string>;
  timeLeft: number;
  isReviewMode: boolean;
  timestamp: number;
}

export type View = 'subjects' | 'modes' | 'quiz' | 'history';
