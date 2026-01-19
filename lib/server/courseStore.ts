import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// This mimics a database by storing JSON files in a "data" folder in your project root
const DB_PATH = path.join(process.cwd(), 'data', 'courses.json');
const RESULTS_PATH = path.join(process.cwd(), 'data', 'results.json');

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

export const saveQuizResult = async (result: QuizResult) => {
  if (!fs.existsSync(RESULTS_PATH)) {
    await fs.outputJson(RESULTS_PATH, []);
  }
  const results = await fs.readJson(RESULTS_PATH);
  results.push(result);
  await fs.writeJson(RESULTS_PATH, results, { spaces: 2 });
};

export const getQuizResults = async (courseId?: string) => {
  if (!fs.existsSync(RESULTS_PATH)) return [];
  const results: QuizResult[] = await fs.readJson(RESULTS_PATH);
  if (courseId) {
    return results.filter(r => r.courseId === courseId);
  }
  return results;
};



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
  questions: { question: string; options: string[]; answer: string }[];
  completed: boolean;
  score?: number;
};

// Initialize DB
const initDB = async () => {
  if (!fs.existsSync(DB_PATH)) {
    await fs.outputJson(DB_PATH, []);
  }
};

export const getCourses = async (): Promise<Course[]> => {
  await initDB();
  return fs.readJson(DB_PATH);
};

export const getCourseById = async (id: string): Promise<Course | undefined> => {
  const courses = await getCourses();
  return courses.find((c) => c.id === id);
};

export const saveCourse = async (course: Course) => {
  await initDB();
  const courses = await getCourses();
  courses.push(course);
  await fs.writeJson(DB_PATH, courses, { spaces: 2 });
};

export const updateCourse = async (id: string, updates: Partial<Course>) => {
  await initDB();
  const courses = await getCourses();
  const index = courses.findIndex((c) => c.id === id);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...updates };
    await fs.writeJson(DB_PATH, courses, { spaces: 2 });
    return courses[index];
  }
  return null;
};