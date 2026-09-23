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
  const ext      = file.name.split('.').pop();
  const path     = `${userId}/avatar.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from('profile-photos')
    .upload(path, file, { upsert: true });
  if (uploadErr) return { url: null, error: uploadErr };

  const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function getCurrentUser(): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
