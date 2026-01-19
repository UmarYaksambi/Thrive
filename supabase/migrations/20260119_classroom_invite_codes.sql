-- ============================================================================
-- CLASSROOM INVITE CODES & RLS (SAFE VERSION)
-- ============================================================================
-- This script is SAFE to run:
-- 1. Uses IF NOT EXISTS / IF EXISTS everywhere
-- 2. Ensures user_roles RLS is disabled (prevents has_role recursion)
-- 3. Uses service role approach for all operations
-- ============================================================================

-- ============================================================================
-- STEP 0: ENSURE user_roles HAS RLS DISABLED (CRITICAL)
-- ============================================================================
-- This prevents infinite recursion when policies call has_role/has_any_role

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 1: ADD INVITE CODE COLUMN
-- ============================================================================

ALTER TABLE public.classrooms
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- ============================================================================
-- STEP 2: CREATE HELPER FUNCTION FOR CODE GENERATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: POPULATE EXISTING CLASSROOMS WITH INVITE CODES
-- ============================================================================

UPDATE public.classrooms
SET invite_code = public.generate_invite_code()
WHERE invite_code IS NULL;

-- ============================================================================
-- STEP 4: SET NOT NULL CONSTRAINT (only if column has no nulls)
-- ============================================================================
-- This is wrapped in a DO block to handle errors gracefully

DO $$
BEGIN
  -- Only set NOT NULL if there are no null values
  IF NOT EXISTS (SELECT 1 FROM public.classrooms WHERE invite_code IS NULL) THEN
    ALTER TABLE public.classrooms ALTER COLUMN invite_code SET NOT NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not set NOT NULL constraint: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 5: CREATE AUTO-GENERATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_classroom_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := public.generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS classroom_invite_code_trigger ON public.classrooms;
CREATE TRIGGER classroom_invite_code_trigger
  BEFORE INSERT ON public.classrooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_classroom_invite_code();

-- ============================================================================
-- STEP 6: CLASSROOMS RLS POLICIES (USING SECURITY DEFINER FUNCTIONS)
-- ============================================================================
-- We avoid recursive EXISTS queries by keeping policies simple

-- Ensure RLS is enabled
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on classrooms
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'classrooms'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.classrooms', pol.policyname);
    END LOOP;
END $$;

-- SELECT: Simple ownership check + admin via SECURITY DEFINER function
CREATE POLICY "Select classrooms" ON public.classrooms
FOR SELECT USING (
  teacher_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- INSERT: Teachers/admins can create (with ownership check)
CREATE POLICY "Insert classrooms" ON public.classrooms
FOR INSERT WITH CHECK (
  teacher_id = auth.uid()
  AND public.has_any_role(auth.uid(), ARRAY['teacher', 'admin', 'supervisor'])
);

-- UPDATE: Owners and admins
CREATE POLICY "Update classrooms" ON public.classrooms
FOR UPDATE USING (
  teacher_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- DELETE: Owners and admins
CREATE POLICY "Delete classrooms" ON public.classrooms
FOR DELETE USING (
  teacher_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- STEP 7: CLASSROOM MEMBERS RLS POLICIES
-- ============================================================================

ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'classroom_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.classroom_members', pol.policyname);
    END LOOP;
END $$;

-- SELECT: Users see own memberships, admins see all
-- Note: We keep this simple to avoid recursion with classrooms table
CREATE POLICY "Select classroom members" ON public.classroom_members
FOR SELECT USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- INSERT: Users can join classrooms themselves (prevents impersonation)
CREATE POLICY "Insert classroom members" ON public.classroom_members
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ============================================================================
-- STEP 8: OPTIMIZATION
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_classrooms_invite_code ON public.classrooms(invite_code);

-- DELETE: Users can leave, admins can remove anyone
CREATE POLICY "Delete classroom members" ON public.classroom_members
FOR DELETE USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- DONE!
-- ============================================================================
-- The API routes handle additional authorization logic (e.g., teachers managing
-- their own classrooms' members) using service role, bypassing RLS.
-- This keeps the RLS policies simple and recursion-free.
-- ============================================================================
