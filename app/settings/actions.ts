'use server';

import {
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

async function getSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(
          name: string,
          value: string,
          options: CookieOptions
        ) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );
}

async function deleteUserStorageFiles(
  supabase: any,
  userId: string
) {
  const { data: files, error } = await supabase.storage
    .from('avatars')
    .list(userId);

  if (error) {
    console.error('Error listing files:', error.message);
    return;
  }

  if (!files || files.length === 0) return;

  const filesToRemove = files.map(
    (x: any) => `${userId}/${x.name}`
  );

  const { error: removeError } = await supabase.storage
    .from('avatars')
    .remove(filesToRemove);

  if (removeError) {
    console.error(
      'Error removing files:',
      removeError.message
    );
  }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await getSupabase();
  const file = formData.get('file') as File;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !file)
    throw new Error('Unauthorized or missing file');

  if (file.size > MAX_FILE_SIZE)
    throw new Error('File size exceeds 2MB limit');

  if (!ALLOWED_TYPES.includes(file.type))
    throw new Error('Invalid file type');

  await deleteUserStorageFiles(supabase, user.id);

  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateError) throw updateError;

  revalidatePath('/settings');
  return publicUrl;
}

export async function removeAvatar() {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  await deleteUserStorageFiles(supabase, user.id);

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id);

  if (error) throw error;

  revalidatePath('/settings');
}

export async function deleteAccountAction() {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await deleteUserStorageFiles(supabase, user.id);

  const { error } = await supabase.rpc('delete_user');
  if (error) throw new Error('Could not delete account');

  await supabase.auth.signOut();
  redirect('/');
}

export async function updateProfile(formData: FormData) {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const updates = {
    id: user.id,
    full_name: formData.get('fullName') as string,
    preferred_language: formData.get('language') as string,
    learning_level: formData.get('learningLevel') as string,
    interests: formData.getAll('interests') as string[],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(updates);

  if (error) throw new Error(error.message);

  revalidatePath('/settings');
  revalidatePath('/dashboard');
}
