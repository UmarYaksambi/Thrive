-- FORCE OVERWRITE RLS POLICIES FOR LIBRARY ITEMS

-- 1. Ensure RLS is ON
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to clear any "deny" conflicts
DROP POLICY IF EXISTS "Admins manage library items" ON public.library_items;
DROP POLICY IF EXISTS "Admins view all library items" ON public.library_items;
DROP POLICY IF EXISTS "Anyone can view approved library items" ON public.library_items;
DROP POLICY IF EXISTS "Users view own library submissions" ON public.library_items;
DROP POLICY IF EXISTS "Users can upload library items" ON public.library_items;

-- 3. Re-create "View" policies
CREATE POLICY "Anyone can view approved library items" ON public.library_items
FOR SELECT USING (status = 'approved');

CREATE POLICY "Users view own library submissions" ON public.library_items
FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Admins view all library items" ON public.library_items
FOR SELECT USING (
  -- Check if user is admin OR supervisor
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
);

-- 4. Re-create "Update" policies (CRITICAL FOR APPROVAL/REJECTION)
CREATE POLICY "Admins manage library items" ON public.library_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
);

-- 5. Insert Policy
CREATE POLICY "Users can upload library items" ON public.library_items
FOR INSERT WITH CHECK (
  submitted_by = auth.uid()
);
