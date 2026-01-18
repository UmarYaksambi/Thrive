-- FIX INFINITE RECURSION IN RLS POLICIES

-- Problem: The previous policy on library_items queried user_roles directly.
-- If user_roles table has RLS enabled, it triggers a chain reaction (Recursion).
-- Solution: Use a simplified query or ensure we are using a SECURITY DEFINER function.

-- 1. Create a safe helper function to check roles WITHOUT triggering RLS on user_roles
-- We declare it SECURITY DEFINER to run as the database owner.
CREATE OR REPLACE FUNCTION public.is_admin_or_supervisor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'supervisor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up old policies
DROP POLICY IF EXISTS "Admins manage library items" ON public.library_items;
DROP POLICY IF EXISTS "Admins view all library items" ON public.library_items;
-- Also drop others just to be sure we don't have duplicates
DROP POLICY IF EXISTS "Anyone can view approved library items" ON public.library_items;
DROP POLICY IF EXISTS "Users view own library submissions" ON public.library_items;
DROP POLICY IF EXISTS "Users can upload library items" ON public.library_items;

-- 3. Re-apply Policies using the SAFE function

-- View Policy (Admin)
CREATE POLICY "Admins view all library items" ON public.library_items
FOR SELECT USING (
  public.is_admin_or_supervisor()
);

-- Manage Policy (Update)
CREATE POLICY "Admins manage library items" ON public.library_items
FOR UPDATE
USING (
  public.is_admin_or_supervisor()
)
WITH CHECK (
  public.is_admin_or_supervisor()
);

-- Delete Policy
CREATE POLICY "Admins delete library items" ON public.library_items
FOR DELETE USING (
  public.is_admin_or_supervisor()
);

-- View Policy (Approved items - Public/Student)
CREATE POLICY "Anyone can view approved library items" ON public.library_items
FOR SELECT USING (status = 'approved');

-- View Policy (Own pending items)
CREATE POLICY "Users view own library submissions" ON public.library_items
FOR SELECT USING (submitted_by = auth.uid());

-- Insert Policy
CREATE POLICY "Users can upload library items" ON public.library_items
FOR INSERT WITH CHECK ( submitted_by = auth.uid() );
