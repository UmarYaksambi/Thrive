-- ============================================================================
-- COMPREHENSIVE LIBRARY WORKFLOW FIX
-- ============================================================================
-- This script fixes the infinite recursion error and enables the full
-- student submission → admin approval workflow.
-- 
-- SAFE TO RUN: This only modifies policies, not data.
-- IDEMPOTENT: Safe to run multiple times.
-- ============================================================================

-- ============================================================================
-- STEP 1: FIX user_roles TABLE (Prevent recursion at source)
-- ============================================================================
-- The user_roles table needs a simple policy that doesn't trigger recursion.
-- Users should be able to read their own roles without any complex checks.

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on user_roles that might cause issues
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;

-- Simple, non-recursive policy: Users can read their own roles
CREATE POLICY "Users read own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Admins can manage roles (using the SECURITY DEFINER function)
-- Note: This uses has_role which is SECURITY DEFINER, so it bypasses RLS
CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
) WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- STEP 2: ENSURE library_items HAS REQUIRED COLUMNS
-- ============================================================================

ALTER TABLE public.library_items 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Ensure RLS is enabled
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: DROP ALL EXISTING library_items POLICIES (Clean slate)
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view approved library items" ON public.library_items;
DROP POLICY IF EXISTS "Users view own library submissions" ON public.library_items;
DROP POLICY IF EXISTS "Users can upload library items" ON public.library_items;
DROP POLICY IF EXISTS "Users delete own pending items" ON public.library_items;
DROP POLICY IF EXISTS "Admins view all library items" ON public.library_items;
DROP POLICY IF EXISTS "Admins manage library items" ON public.library_items;
DROP POLICY IF EXISTS "Admins delete library items" ON public.library_items;

-- ============================================================================
-- STEP 4: CREATE NEW POLICIES USING SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- 4.1: Public can view APPROVED items
CREATE POLICY "Anyone can view approved library items" ON public.library_items
FOR SELECT USING (status = 'approved');

-- 4.2: Users can view their OWN submissions (any status)
CREATE POLICY "Users view own library submissions" ON public.library_items
FOR SELECT USING (submitted_by = auth.uid());

-- 4.3: Authenticated users can INSERT (upload) items
-- The code sets submitted_by and status='pending'
CREATE POLICY "Users can upload library items" ON public.library_items
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND submitted_by = auth.uid()
);

-- 4.4: Users can DELETE their own PENDING items only
CREATE POLICY "Users delete own pending items" ON public.library_items
FOR DELETE USING (
  submitted_by = auth.uid() 
  AND status = 'pending'
);

-- 4.5: Admins/Supervisors can VIEW ALL items (using SECURITY DEFINER function)
-- This is the key fix - uses has_any_role which bypasses user_roles RLS
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
-- STEP 5: REFRESH SCHEMA CACHE (Run this in Supabase Dashboard if needed)
-- ============================================================================
-- After running this script, go to:
-- Supabase Dashboard → Settings → Database → Reload Schema Cache
-- Or: NOTIFY pgrst, 'reload config';

-- ============================================================================
-- VERIFICATION QUERIES (Run these to test)
-- ============================================================================
-- 1. Check if your user has admin role:
--    SELECT * FROM public.user_roles WHERE user_id = auth.uid();
--
-- 2. Check if has_any_role works for you:
--    SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor']);
--
-- 3. View all library items (should work if you're admin):
--    SELECT id, title, status, submitted_by FROM public.library_items;
-- ============================================================================
