-- ============================================================================
-- FIX FOREIGN KEYS FOR CLASSROOM MEMBERS
-- ============================================================================
-- The classroom_members table references auth.users, but for easier joins
-- with profiles, we should explicitly reference public.profiles(id).
-- Since profiles.id is a FK to auth.users.id, this maintains integrity.

-- 1. Drop existing FK to auth.users if it exists (to avoid duplicate constraints/ambiguity)
ALTER TABLE public.classroom_members
DROP CONSTRAINT IF EXISTS classroom_members_user_id_fkey;

-- 2. Add FK to public.profiles
ALTER TABLE public.classroom_members
ADD CONSTRAINT classroom_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Also ensure classroom_id is properly foreign keyed (just in case)
ALTER TABLE public.classroom_members
DROP CONSTRAINT IF EXISTS classroom_members_classroom_id_fkey;

ALTER TABLE public.classroom_members
ADD CONSTRAINT classroom_members_classroom_id_fkey
FOREIGN KEY (classroom_id)
REFERENCES public.classrooms(id)
ON DELETE CASCADE;
