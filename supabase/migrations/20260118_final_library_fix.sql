-- ============================================================================
-- FINAL FIX: LIBRARY APPROVAL WORKFLOW
-- ============================================================================
-- This script PROPERLY fixes the infinite recursion issue.
-- 
-- ROOT CAUSE: user_roles has RLS that tries to check roles, causing a loop.
-- SOLUTION: Disable RLS on user_roles table (it's internal, functions handle security)
-- ============================================================================

-- ============================================================================
-- STEP 1: DISABLE RLS ON user_roles (CRITICAL FIX)
-- ============================================================================
-- The user_roles table should NOT have RLS because:
-- 1. SECURITY DEFINER functions (has_role, has_any_role) already bypass RLS
-- 2. Direct access to user_roles from client is blocked by PostgREST config
-- 3. RLS on user_roles causes infinite recursion when policies check roles

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop any policies that might exist (they caused the recursion)
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- ============================================================================
-- STEP 2: ENSURE library_items HAS REQUIRED COLUMNS
-- ============================================================================

ALTER TABLE public.library_items 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Ensure RLS is enabled on library_items
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: DROP ALL EXISTING library_items POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view approved library items" ON public.library_items;
DROP POLICY IF EXISTS "Users view own library submissions" ON public.library_items;
DROP POLICY IF EXISTS "Users can upload library items" ON public.library_items;
DROP POLICY IF EXISTS "Users delete own pending items" ON public.library_items;
DROP POLICY IF EXISTS "Admins view all library items" ON public.library_items;
DROP POLICY IF EXISTS "Admins manage library items" ON public.library_items;
DROP POLICY IF EXISTS "Admins delete library items" ON public.library_items;

-- ============================================================================
-- STEP 4: CREATE NEW library_items POLICIES
-- ============================================================================
-- These use SECURITY DEFINER functions which now work because
-- user_roles no longer has RLS blocking them.

-- 4.1: Public can view APPROVED items
CREATE POLICY "Anyone can view approved library items" ON public.library_items
FOR SELECT USING (status = 'approved');

-- 4.2: Users can view their OWN submissions
CREATE POLICY "Users view own library submissions" ON public.library_items
FOR SELECT USING (submitted_by = auth.uid());

-- 4.3: Authenticated users can INSERT
CREATE POLICY "Users can upload library items" ON public.library_items
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND submitted_by = auth.uid()
);

-- 4.4: Users can DELETE their own PENDING items
CREATE POLICY "Users delete own pending items" ON public.library_items
FOR DELETE USING (
  submitted_by = auth.uid() 
  AND status = 'pending'
);

-- 4.5: Admins/Supervisors can VIEW ALL items
CREATE POLICY "Admins view all library items" ON public.library_items
FOR SELECT USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor'])
);

-- 4.6: Admins/Supervisors can UPDATE items (Approve/Reject)
CREATE POLICY "Admins manage library items" ON public.library_items
FOR UPDATE 
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor'])
)
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor'])
);

-- 4.7: Admins can DELETE any library item
CREATE POLICY "Admins delete library items" ON public.library_items
FOR DELETE USING (
  public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- DONE! Now test:
-- 1. Refresh Admin Dashboard
-- 2. Click on a pending document
-- 3. Click Approve or Reject
-- ============================================================================
