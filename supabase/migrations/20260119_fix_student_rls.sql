-- ============================================================================
-- FIX RLS FOR STUDENT VISIBILITY
-- ============================================================================
-- Students could not see classrooms they joined because the SELECT policy
-- only allowed teachers/admins.

DROP POLICY IF EXISTS "Select classrooms" ON public.classrooms;

CREATE POLICY "Select classrooms" ON public.classrooms
FOR SELECT USING (
  teacher_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.classroom_members 
    WHERE classroom_id = public.classrooms.id 
    AND user_id = auth.uid()
  )
);
