import { supabase } from './supabase';
import type { Profile } from '../types';

// ── Sign Up ──────────────────────────────────────────────────
export async function signUp(
  email:    string,
  password: string,
  fullName: string,
  extra?:   Partial<Pick<Profile, 'position' | 'phone'>>
): Promise<{ user: any; error: any }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // After email confirmation Supabase redirects here.
      // AuthCallback.tsx exchanges the token and routes to /profile.
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: fullName,
        position:  extra?.position ?? 'member',
        phone:     extra?.phone    ?? null,
      },
    },
  });
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

// ── Sign In ──────────────────────────────────────────────────
export async function signIn(
  email:    string,
  password: string
): Promise<{ user: any; error: any }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, error };
}

// ── Sign Out ─────────────────────────────────────────────────
export async function signOut(): Promise<{ error: any }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ── Password reset ───────────────────────────────────────────
export async function resetPassword(email: string): Promise<{ error: any }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
}

export async function updatePassword(newPassword: string): Promise<{ error: any }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

// ── Profile CRUD ─────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) { console.error('Error fetching profile:', error); return null; }
  return data as Profile;
}

export async function updateProfile(
  userId:  string,
  updates: Partial<Profile>
): Promise<{ error: any }> {
  // Never allow client to escalate role/position to admin via this function
  const safe = { ...updates };
  delete (safe as any).role;
  const { error } = await supabase.from('profiles').update(safe).eq('id', userId);
  return { error };
}

// ── Upload profile photo ─────────────────────────────────────
export async function uploadProfilePhoto(
  userId: string,
  file:   File
): Promise<{ url: string | null; error: any }> {
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `avatar-${userId}.${ext}`;

  console.log('[upload] bucket: profile-photos | path:', path, '| type:', file.type, '| size:', file.size);

  // First check if the bucket is accessible
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('[upload] Cannot list buckets:', listErr);
    return { url: null, error: { message: `Cannot access storage: ${listErr.message}` } };
  }

  const bucketNames = buckets?.map(b => b.name) ?? [];
  console.log('[upload] Available buckets:', bucketNames);

  if (!bucketNames.includes('profile-photos')) {
    console.error('[upload] profile-photos bucket not in list:', bucketNames);
    return { url: null, error: { message: `Bucket not found. Available: ${bucketNames.join(', ')}` } };
  }

  const { error: uploadErr } = await supabase.storage
    .from('profile-photos')
    .upload(path, file, {
      upsert:       true,
      cacheControl: '3600',
      contentType:  file.type,
    });

  if (uploadErr) {
    console.error('[upload] Upload error:', JSON.stringify(uploadErr));
    return { url: null, error: uploadErr };
  }

  const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
  console.log('[upload] Success. Public URL:', data.publicUrl);
  return { url: data.publicUrl, error: null };
}

export async function getCurrentUser(): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
