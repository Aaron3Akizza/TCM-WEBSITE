import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/auth';
import type { Profile } from '../types';
import type { AdminPermissions } from '../types/database';
import { EMPTY_PERMISSIONS } from '../types/database';

interface UseAuthReturn {
  user:        any;
  profile:     Profile | null;
  permissions: AdminPermissions | null;
  loading:     boolean;
  signOut:     () => Promise<void>;
  // Convenience: is the current user a super admin?
  isSuperAdmin: boolean;
  // Convenience: does the user have at least one admin permission?
  isAnyAdmin:  boolean;
}

// Fetch the admin_permissions row for a given profile id.
// Returns null if the user has no row (i.e. is a normal member).
async function getPermissions(profileId: string): Promise<AdminPermissions | null> {
  const { data, error } = await supabase
    .from('admin_permissions')
    .select('*')
    .eq('profile_id', profileId)
    .single();
  if (error || !data) return null;
  return data as AdminPermissions;
}

export function useAuth(): UseAuthReturn {
  const [user,        setUser]        = useState<any>(null);
  const [profile,     setProfile]     = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loading,     setLoading]     = useState(true);

  const loadUserData = async (authUser: any) => {
    if (!authUser) {
      setProfile(null);
      setPermissions(null);
      return;
    }
    const [userProfile, userPerms] = await Promise.all([
      getProfile(authUser.id),
      getPermissions(authUser.id),
    ]);
    setProfile(userProfile);
    setPermissions(userPerms);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        await loadUserData(currentUser);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user || null;
        setUser(authUser);
        await loadUserData(authUser);
        // Only set loading false once on the first check
      }
    );

    return () => { subscription?.unsubscribe(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPermissions(null);
  };

  const isSuperAdmin = profile?.is_super_admin === true;

  // A user is "any admin" if they have the admin role and at least one
  // permission flag set (or are a super admin)
  const isAnyAdmin =
    isSuperAdmin ||
    (profile?.role === 'admin' && permissions !== null &&
      Object.entries(permissions).some(
        ([k, v]) => k.startsWith('perm_') && v === true
      )
    );

  return {
    user,
    profile,
    permissions,
    loading,
    signOut:     handleSignOut,
    isSuperAdmin,
    isAnyAdmin,
  };
}

// Re-export for convenience so pages can import from one place
export { EMPTY_PERMISSIONS };
export type { AdminPermissions };
