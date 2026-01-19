-- Enable RLS on library_items
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- Add helper columns if they don't exist
ALTER TABLE public.library_items 
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Policy 1: Anyone can view APPROVED items (Global Library)
CREATE POLICY "Anyone can view approved library items" ON public.library_items
FOR SELECT USING (status = 'approved');

-- Policy 2: Users can view their own submissions (Personal Uploads)
CREATE POLICY "Users view own library submissions" ON public.library_items
FOR SELECT USING (submitted_by = auth.uid());

-- Policy 3: Users can upload items (Defaults to 'pending' via code or trigger, or checked here)
CREATE POLICY "Users can upload library items" ON public.library_items
FOR INSERT WITH CHECK (
  submitted_by = auth.uid() AND (status = 'pending' OR status IS NULL)
);

-- Policy 4: Users can delete their own PENDING items (Undo upload)
CREATE POLICY "Users delete own pending items" ON public.library_items
FOR DELETE USING (submitted_by = auth.uid() AND status = 'pending');

-- Policy 5: Admins/Supervisors can view ALL items (for approval queue)
CREATE POLICY "Admins view all library items" ON public.library_items
FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor']));

-- Policy 6: Admins/Supervisors can UPDATE items (Approve/Reject)
CREATE POLICY "Admins manage library items" ON public.library_items
FOR UPDATE 
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'supervisor']));

-- Policy 7: Admins can DELETE items
CREATE POLICY "Admins delete library items" ON public.library_items
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
