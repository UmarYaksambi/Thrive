import { v4 as uuidv4 } from 'uuid';
import { Course } from '@/lib/types';

// Helper to set dates relative to Jan 19, 2026
const baseDate = new Date('2026-01-19T09:00:00Z');
const getOffsetDate = (days: number) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + days);
    return d.toISOString();
};

// Helper to generate AI Image URLs (Simulating Gemini Prompts)
const getAIImage = (prompt: string) =>
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 100)}`;

export const INITIAL_COURSES: Course[] = [
    {
        id: '1',
        title: 'Creative Writing for Beginners',
        description: 'Learn the art of storytelling, character development, and world-building.',
        category: 'Marketing',
        level: 'Beginner',
        // AI Generated Image
        imageUrl: getAIImage('magical open book with glowing letters flying out, fantasy library background, 3d render, cinematic lighting'),
        startDate: getOffsetDate(0),
        progress: 45,
        totalLessons: 12,
        completedLessons: 5,
        colorCode: '#fccc42',
        modules: [
            {
                id: uuidv4(),
                title: "Module 1: The Hero's Journey",
                duration: "45m",
                lessons: [
                    { id: uuidv4(), title: "The Call to Adventure", duration: "20m", type: 'video', completed: true, videoUrl: "" },
                    { id: uuidv4(), title: "Refusal of the Call", duration: "25m", type: 'video', completed: true, videoUrl: "" }
                ],
                quiz: { id: uuidv4(), title: "Archetypes Assessment", completed: true, score: 85, questions: [] }
            },
            {
                id: uuidv4(),
                title: "Module 2: Character Arcs",
                duration: "1h",
                lessons: [
                    { id: uuidv4(), title: "Creating Flaws", duration: "30m", type: 'video', completed: false }
                ]
            }
        ]
    },
    {
        id: '2',
        title: 'Digital Illustration with Adobe Illustrator',
        description: 'Master vector graphics, pen tool, and digital art composition.',
        category: 'Computer Science',
        level: 'Intermediate',
        // AI Generated Image
        imageUrl: getAIImage('digital vector art workspace, colorful abstract geometric shapes floating, isometric 3d render, vibrant colors, cyberpunk vibes'),
        startDate: getOffsetDate(2),
        progress: 10,
        totalLessons: 24,
        completedLessons: 2,
        colorCode: '#be94f5',
        modules: [
            {
                id: uuidv4(),
                title: "Module 1: Vector Basics",
                duration: "1h 15m",
                lessons: [
                    { id: uuidv4(), title: "Understanding Paths", duration: "45m", type: 'video', completed: true },
                    { id: uuidv4(), title: "The Pen Tool Mastery", duration: "30m", type: 'video', completed: false }
                ],
                quiz: { id: uuidv4(), title: "Vector Tools Quiz", completed: false, score: 0, questions: [] }
            }
        ]
    },
    {
        id: '3',
        title: 'Public Speaking and Leadership',
        description: 'Overcome stage fright and lead with confidence.',
        category: 'Psychology',
        level: 'Advanced',
        // AI Generated Image
        imageUrl: getAIImage('ted talk stage with spotlight, microphone, futuristic auditorium, minimalist, blue and gold lighting, 3d render'),
        startDate: getOffsetDate(4),
        progress: 0,
        totalLessons: 10,
        completedLessons: 0,
        colorCode: '#a8d8ea',
        modules: [
            {
                id: uuidv4(),
                title: "Module 1: Stage Presence",
                duration: "50m",
                lessons: [
                    { id: uuidv4(), title: "Body Language Secrets", duration: "25m", type: 'video', completed: false },
                    { id: uuidv4(), title: "Voice Modulation", duration: "25m", type: 'video', completed: false }
                ],
                quiz: { id: uuidv4(), title: "Non-Verbal Comm. Test", completed: false, score: 0, questions: [] }
            }
        ]
    },
];