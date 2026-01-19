-- Fix Foreign Key to point to 'profiles' instead of 'auth.users'
-- This allows PostgREST to treat 'profiles' as a related resource for embedding/joining.

ALTER TABLE public.library_items 
DROP CONSTRAINT IF EXISTS library_items_submitted_by_fkey;

-- Re-add constraint referencing public.profiles
ALTER TABLE public.library_items
ADD CONSTRAINT library_items_submitted_by_fkey 
FOREIGN KEY (submitted_by) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Do the same for approved_by if we want to show reviewer name
ALTER TABLE public.library_items 
DROP CONSTRAINT IF EXISTS library_items_approved_by_fkey;

ALTER TABLE public.library_items
ADD CONSTRAINT library_items_approved_by_fkey 
FOREIGN KEY (approved_by) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;
