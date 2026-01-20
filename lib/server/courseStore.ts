import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CalendarNote, Course, Module, Lesson, Quiz, QuizResult } from '@/lib/types';

// This mimics a database by storing JSON files in a "data" folder in your project root
const DB_PATH = path.join(process.cwd(), 'data', 'courses.json');
const RESULTS_PATH = path.join(process.cwd(), 'data', 'results.json');
const CALENDAR_NOTES_PATH = path.join(process.cwd(), 'data', 'calendar-notes.json');

const ensureDataDir = async () => {
  await fs.ensureDir(path.join(process.cwd(), 'data'));
};

// --- DATA ACCESSORS ---

// Get All Courses

// Get Calendar Notes
export const getCalendarNotes = async () => {
  await ensureDataDir();
  if (!fs.existsSync(CALENDAR_NOTES_PATH)) return [];
  return fs.readJson(CALENDAR_NOTES_PATH);
};

// Save Calendar Note
export const saveCalendarNote = async (noteEntry: CalendarNote) => {
  await ensureDataDir();
  let notes = await getCalendarNotes();
  // Filter out existing note for the date to update it
  notes = notes.filter((n: CalendarNote) => n.date !== noteEntry.date);
  if (noteEntry.note.trim() !== '') {
    notes.push(noteEntry);
  }
  await fs.writeJson(CALENDAR_NOTES_PATH, notes, { spaces: 2 });
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