import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Ensure the types directory exists
const typesDir = join(process.cwd(), 'types');
if (!existsSync(typesDir)) {
  mkdirSync(typesDir, { recursive: true });
}

// Run the Supabase CLI to generate types
const command = `npx supabase gen types typescript --project-id ${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID} --schema public > ${join(typesDir, 'supabase-generated.ts')}`;

try {
  console.log('Generating Supabase types...');
  execSync(command, { stdio: 'inherit' });
  
  // Add a type augmentation for the auth schema
  const typeAugmentation = `
// Type definitions for @supabase/supabase-js
import { Database as DatabaseGenerated } from './supabase-generated';

declare global {
  type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

  interface Database extends DatabaseGenerated {
    public: {
      Tables: {
        user_roles: {
          Row: {
            id: string;
            user_id: string;
            role: 'admin' | 'teacher' | 'supervisor' | 'student';
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            role: 'admin' | 'teacher' | 'supervisor' | 'student';
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            user_id?: string;
            role?: 'admin' | 'teacher' | 'supervisor' | 'student';
            created_at?: string;
            updated_at?: string;
          };
        };
        student_progress: {
          Row: {
            id: string;
            student_id: string;
            course_id: string;
            progress_percentage: number;
            completed_lessons: number;
            total_lessons: number;
            last_accessed: string;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            student_id: string;
            course_id: string;
            progress_percentage?: number;
            completed_lessons?: number;
            total_lessons?: number;
            last_accessed?: string;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            student_id?: string;
            course_id?: string;
            progress_percentage?: number;
            completed_lessons?: number;
            total_lessons?: number;
            last_accessed?: string;
            created_at?: string;
            updated_at?: string;
          };
        };
      };
    };
  }
}
`;

  // Append the type augmentation to the generated file
  writeFileSync(
    join(typesDir, 'supabase-generated.ts'),
    typeAugmentation,
    { flag: 'a' }
  );

  console.log('Successfully generated and augmented Supabase types!');
} catch (error) {
  console.error('Error generating Supabase types:', error);
  process.exit(1);
}
