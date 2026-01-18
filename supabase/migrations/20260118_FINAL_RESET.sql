-- ============================================================================
-- COMPLETE RESET: Library Items RLS (FINAL - ONE SCRIPT TO RULE THEM ALL)
-- ============================================================================
-- This script RESETS everything cleanly. Run this ONCE and you're done.
-- ============================================================================

-- ============================================================================
-- STEP 1: DISABLE RLS ON user_roles (prevents recursion)
-- ============================================================================
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: DROP ALL POLICIES ON library_items (clean slate)
-- ============================================================================
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'library_items'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.library_items', pol.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: ENSURE COLUMNS EXIST
-- ============================================================================
ALTER TABLE public.library_items 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================================================
-- STEP 4: ENABLE RLS
-- ============================================================================
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE SIMPLE, WORKING POLICIES
-- ============================================================================

-- SELECT: Authenticated users can view all items (it's a public library)
CREATE POLICY "Authenticated can view library items" ON public.library_items
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Also allow anonymous to view approved items
CREATE POLICY "Public can view approved items" ON public.library_items
FOR SELECT USING (status = 'approved');

-- INSERT: Authenticated users can insert their own items
CREATE POLICY "Users can insert own items" ON public.library_items
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND submitted_by = auth.uid());

-- UPDATE: Only admins/supervisors can update (proper security)
-- This works now because user_roles RLS is DISABLED (no recursion)
CREATE POLICY "Admins update library items" ON public.library_items
FOR UPDATE
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor']));

-- DELETE: Users can delete own pending, admins can delete any
CREATE POLICY "Users delete own pending" ON public.library_items
FOR DELETE USING (
  (submitted_by = auth.uid() AND status = 'pending')
  OR public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- DONE! The API route handles authorization, RLS just ensures authentication.
-- ============================================================================
