export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  imageUrl: string;
  startDate: string;
  modules: Module[];
  totalLessons: number;
  completedLessons: number;
  progress: number;
  colorCode?: string;
};

export type Module = {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
  quiz?: Quiz;
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading';
  videoUrl?: string; // YouTube search link or direct link
  completed: boolean;
  notes?: string;
};

export type Quiz = {
  id: string;
  title: string;
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
  completed: boolean;
  score?: number;
};

export type CalendarNote = {
  date: string; // YYYY-MM-DD
  note: string;
};

export type QuizResult = {
  id: string;
  courseId: string;
  moduleId: string;
  studentId: string; // "Learner" for now
  score: number;
  totalQuestions: number;
  dateTaken: string;
  answers: {
    questionId: string;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
  feedback?: string; // AI generated summary of performance
};
