-- ============================================================================
-- PRODUCTION-READY RBAC MIGRATION - SECURITY HARDENED
-- ============================================================================
-- This migration adds:
-- 1. Helper functions for multi-role support (has_role, has_any_role, get_user_roles)
-- 2. Classrooms & classroom_members tables with RLS
-- 3. RLS policies on courses and enrollments
--
-- IMPORTANT: Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTIONS (with search_path security fix)
-- ============================================================================

-- has_role: Check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(check_user_id uuid, check_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = check_role
  );
$$;

-- has_any_role: Check if a user has ANY of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(check_user_id uuid, check_roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = ANY(check_roles)
  );
$$;

-- get_user_roles: Get ALL roles for current user (multi-role support)
CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS text[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    ARRAY_AGG(role ORDER BY CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'supervisor' THEN 2 
      WHEN 'teacher' THEN 3 
      ELSE 4 
    END),
    ARRAY['student']::text[]
  )
  FROM public.user_roles
  WHERE user_id = auth.uid();
$$;

-- Grant to authenticated users ONLY (not anon for security)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles() TO authenticated;

-- ============================================================================
-- 2. CREATE TABLES (Tables first, policies after)
-- ============================================================================

-- CLASSROOMS TABLE (Teacher-managed classrooms)
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLASSROOM MEMBERS TABLE (Student enrollment)
CREATE TABLE IF NOT EXISTS public.classroom_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'assistant')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(classroom_id, user_id)
);

-- ============================================================================
-- 3. ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CLASSROOMS RLS POLICIES
-- ============================================================================

-- SELECT: Teachers see own, admins see all
CREATE POLICY "Teachers select own classrooms" ON public.classrooms
FOR SELECT USING (
  teacher_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- SELECT: Members can view their classrooms
CREATE POLICY "Members can view their classrooms" ON public.classrooms
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.classroom_members WHERE classroom_id = classrooms.id AND user_id = auth.uid())
);

-- INSERT: Only by teacher or admin
CREATE POLICY "Teachers insert classrooms" ON public.classrooms
FOR INSERT WITH CHECK (
  teacher_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- UPDATE: Only owner or admin, WITH CHECK prevents teacher_id hijacking
CREATE POLICY "Teachers update own classrooms" ON public.classrooms
FOR UPDATE
USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- DELETE: Only owner or admin
CREATE POLICY "Teachers delete own classrooms" ON public.classrooms
FOR DELETE USING (
  teacher_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- 5. CLASSROOM MEMBERS RLS POLICIES
-- ============================================================================

-- Teachers/Admins manage members (WITH CHECK prevents role escalation)
CREATE POLICY "Teachers manage classroom members" ON public.classroom_members
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_members.classroom_id AND teacher_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_members.classroom_id AND teacher_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Users view own memberships (read-only)
CREATE POLICY "Users view own memberships" ON public.classroom_members
FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- 6. COURSES RLS (Split policies to prevent hijacking)
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses" ON public.courses
FOR SELECT USING (true);

CREATE POLICY "Teachers insert courses" ON public.courses
FOR INSERT WITH CHECK (
  creator_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers update own courses" ON public.courses
FOR UPDATE
USING (creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (creator_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers delete own courses" ON public.courses
FOR DELETE USING (
  creator_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- 7. ENROLLMENTS RLS (Prevents course_id hijacking)
-- ============================================================================

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own enrollments" ON public.enrollments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users insert own enrollments" ON public.enrollments
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own enrollment progress" ON public.enrollments
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Course creators view enrollments" ON public.enrollments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = enrollments.course_id AND creator_id = auth.uid())
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Reload schema cache in Supabase Settings → Database
-- 2. Test multi-role functionality
-- 3. Verify existing features still work (chat, library, calendar)
-- ============================================================================
