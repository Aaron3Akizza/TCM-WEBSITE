import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar }        from '../components/layout/Navbar';
import { Footer }        from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PhotoUpload }   from '../components/ui/PhotoUpload';
import { useAuth }       from '../hooks/useAuth';
import { updateProfile, uploadProfilePhoto, changePassword } from '../lib/auth';
import { supabase } from '../lib/supabase';
import {
  User, Mail, Shield, Calendar,
  Save, LogOut,
  Edit3, X, CheckCircle2, Loader2, Lock, Eye, EyeOff,
  UserCircle2, KeyRound, AlertTriangle, Bell, ArrowRight,
} from 'lucide-react';
import type { MemberPosition, CareerStatus, Gender } from '../types';

// ── Option lists ─────────────────────────────────────────────
const POSITIONS: { value: MemberPosition; label: string }[] = [
  { value: 'member',          label: 'Member'          },
  { value: 'pastor',          label: 'Pastor'          },
  { value: 'ministry_leader', label: 'Ministry Leader' },
  { value: 'media',           label: 'Media'           },
  { value: 'worship',         label: 'Worship'         },
  { value: 'ushering',        label: 'Ushering'        },
  { value: 'evangelism',      label: 'Evangelism'      },
  { value: 'youth',           label: 'Youth'           },
  { value: 'administration',  label: 'Administration'  },
  { value: 'other',           label: 'Other'           },
];
const CAREER_OPTIONS: { value: CareerStatus; label: string }[] = [
  { value: 'student',        label: 'Student'        },
  { value: 'employed',       label: 'Employed'       },
  { value: 'self_employed',  label: 'Self-Employed'  },
  { value: 'unemployed',     label: 'Unemployed'     },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'other',          label: 'Other'          },
];
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',              label: 'Male'              },
  { value: 'female',            label: 'Female'            },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// ── Shared helpers ────────────────────────────────────────────
/** Read-only info row used in the view-mode display */
const InfoRow: React.FC<{
  icon:   React.ElementType;
  label:  string;
  value?: string | null;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 py-3.5 border-b border-gray-50 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-tcm-gray-soft flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-tcm-gold" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-[0.15em] mb-0.5">
        {label}
      </p>
      <p className="font-semibold text-tcm-navy text-sm break-words">{value || '—'}</p>
    </div>
  </div>
);

/** Labelled form field wrapper */
const Field: React.FC<{
  label:    string;
  hint?:    string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-tcm-navy">
      {label}
      {hint && (
        <span className="font-normal text-tcm-gray-mid ml-2 text-xs">({hint})</span>
      )}
    </label>
    {children}
  </div>
);

/** Success banner */
const SuccessBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
    <p className="text-green-700 text-sm font-semibold">{message}</p>
  </div>
);

/** Error banner */
const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-red-600 text-sm font-medium leading-snug">{message}</p>
  </div>
);

// ── Tab definitions ───────────────────────────────────────────
type Tab = 'profile' | 'security';

// ═══════════════════════════════════════════════════════════════
//  Main Profile component
// ═══════════════════════════════════════════════════════════════
export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  // ── Active tab ──
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // ── Admin notification banner ──
  const [notification,    setNotification]    = useState<{ id: string; title: string; body: string; type: string } | null>(null);
  const [dismissingNotif, setDismissingNotif] = useState(false);

  // ── Profile photo state ──
  const [photoError,   setPhotoError]   = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  // ── Personal info edit state ──
  const [editing,   setEditing]  = useState(false);
  const [saving,    setSaving]   = useState(false);
  const [saveOk,    setSaveOk]   = useState('');
  const [saveErr,   setSaveErr]  = useState('');

  // Personal Info fields
  const [fullName,  setFullName]  = useState('');
  const [username,  setUsername]  = useState('');
  const [gender,    setGender]    = useState<Gender | ''>('');
  const [dob,       setDob]       = useState('');
  const [faith,     setFaith]     = useState('');

  // Contact fields
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');

  // Career fields
  const [position,      setPosition]      = useState<MemberPosition>('member');
  const [careerStatus,  setCareerStatus]  = useState<CareerStatus | ''>('');
  const [occupation,    setOccupation]    = useState('');
  const [studentStatus, setStudentStatus] = useState('');
  const [school,        setSchool]        = useState('');

  // ── Change Password state ──
  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [showCur,     setShowCur]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showCon,     setShowCon]     = useState(false);
  const [pwdSaving,   setPwdSaving]   = useState(false);
  const [pwdOk,       setPwdOk]       = useState('');
  const [pwdErr,      setPwdErr]      = useState('');

  // ── Auth guard ──
  useEffect(() => {
    if (!loading && !user) navigate('/sign-in');
  }, [user, loading, navigate]);

  // ── Fetch unread admin notification ──
  useEffect(() => {
    if (!user) return;
    supabase
      .from('admin_notifications')
      .select('id, title, body, type')
      .eq('profile_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setNotification(data as any);
      });
  }, [user]);

  // ── Populate edit fields when profile loads ──
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name   || '');
    setUsername(profile.username    || '');
    setPhone(profile.phone          || '');
    setPosition((profile.position as MemberPosition) || 'member');
    setCareerStatus((profile.career_status as CareerStatus) || '');
    setOccupation(profile.occupation    || '');
    setStudentStatus(profile.student_status || '');
    setSchool(profile.school        || '');
    setAddress(profile.address      || '');
    setFaith(profile.faith          || '');
    setGender((profile.gender as Gender) || '');
    setDob(profile.date_of_birth    || '');
  }, [profile]);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  // ── Dismiss admin notification ──
  const dismissNotification = async () => {
    if (!notification) return;
    setDismissingNotif(true);
    await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', notification.id);
    setNotification(null);
    setDismissingNotif(false);
  };

  // ── Photo save (called by PhotoUpload component) ─────────
  const handleSavePhoto = async (file: File) => {
    setPhotoError('');
    setPhotoSuccess('');
    const { url, error: uploadErr } = await uploadProfilePhoto(user!.id, file);
    if (uploadErr) {
      const msg: string = uploadErr?.message || uploadErr?.error || JSON.stringify(uploadErr);
      if (msg.includes('not authorized') || msg.includes('policy') || msg.includes('row-level')) {
        throw new Error('Permission denied. Please contact IT Admin.');
      } else if (msg.includes('not found') || msg.includes('bucket')) {
        throw new Error('Storage bucket not found. Please contact IT Admin.');
      } else {
        throw new Error(`Upload failed: ${msg}`);
      }
    }
    if (url) {
      const { error: saveErr } = await updateProfile(user!.id, { avatar_url: url });
      if (saveErr) throw new Error('Photo uploaded but could not be saved. Please try again.');
      setPhotoSuccess('Profile photo updated successfully.');
      setTimeout(() => { setPhotoSuccess(''); window.location.reload(); }, 1500);
    }
  };

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true); setSaveErr(''); setSaveOk('');

    // Validate username format if changed
    if (username.trim() && !/^[a-z0-9_]{3,20}$/.test(username.trim())) {
      setSaveErr('Username must be 3–20 characters and contain only lowercase letters, numbers, or underscores.');
      setSaving(false);
      return;
    }

    if (!fullName.trim()) {
      setSaveErr('Full name is required.');
      setSaving(false);
      return;
    }

    const { error } = await updateProfile(user.id, {
      full_name:      fullName.trim(),
      username:       username.trim().toLowerCase() || null,
      phone:          phone    || null,
      position,
      gender:         (gender  || null) as Gender | null,
      date_of_birth:  dob      || null,
      faith:          faith    || null,
      career_status:  (careerStatus || null) as CareerStatus | null,
      occupation:     occupation    || null,
      student_status: studentStatus || null,
      school:         school        || null,
      address:        address       || null,
    });

    if (error) {
      const raw: string = error?.message || error?.details || JSON.stringify(error);
      console.error('[handleSave] error:', raw);
      if (raw.includes('duplicate') || raw.includes('unique') || raw.includes('profiles_username_key')) {
        setSaveErr('That username is already taken. Please choose a different one.');
      } else if (raw.includes('row-level') || raw.includes('policy') || raw.includes('not authorized')) {
        setSaveErr('Permission denied. Please sign out and sign back in, then try again.');
      } else {
        setSaveErr(`Could not save: ${raw}`);
      }
    } else {
      setSaveOk('Your information has been updated successfully.');
      setEditing(false);
      setTimeout(() => setSaveOk(''), 5000);
    }
    setSaving(false);
  };

  const cancelEdit = () => {
    // Reset fields back to current profile values
    if (profile) {
      setFullName(profile.full_name          || '');
      setUsername(profile.username           || '');
      setPhone(profile.phone                 || '');
      setPosition((profile.position as MemberPosition) || 'member');
      setCareerStatus((profile.career_status as CareerStatus) || '');
      setOccupation(profile.occupation       || '');
      setStudentStatus(profile.student_status || '');
      setSchool(profile.school               || '');
      setAddress(profile.address             || '');
      setFaith(profile.faith                 || '');
      setGender((profile.gender as Gender)   || '');
      setDob(profile.date_of_birth           || '');
    }
    setSaveErr('');
    setEditing(false);
  };

  // ── Change password ───────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr(''); setPwdOk('');

    if (!currentPwd) { setPwdErr('Please enter your current password.'); return; }
    if (newPwd.length < 8) { setPwdErr('New password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdErr('New passwords do not match.'); return; }
    if (newPwd === currentPwd) { setPwdErr('Your new password must be different from your current password.'); return; }

    setPwdSaving(true);
    const { error } = await changePassword(user!.email!, currentPwd, newPwd);
    setPwdSaving(false);

    if (error) {
      const raw: string = error?.message || '';
      if (raw.includes('incorrect') || raw.includes('current password')) {
        setPwdErr('Your current password is incorrect. Please check and try again.');
      } else if (raw.includes('same password') || raw.includes('different')) {
        setPwdErr('Your new password must be different from your current password.');
      } else if (raw.includes('weak') || raw.includes('strength')) {
        setPwdErr('Password is too weak. Use a mix of letters, numbers, and symbols.');
      } else {
        setPwdErr(raw || 'Password could not be changed. Please try again.');
      }
    } else {
      setPwdOk('Password changed successfully. Use your new password next time you sign in.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => setPwdOk(''), 7000);
    }
  };

  // ── Loading / unauthenticated guards ─────────────────────
  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px]"><LoadingSpinner /></main>
      <Footer />
    </div>
  );
  if (!user) return null;

  // ── Derived display values ────────────────────────────────
  const avatarInitial   = (profile?.full_name || user.email || 'M')[0].toUpperCase();
  const posLabel        = POSITIONS.find(p => p.value === profile?.position)?.label;
  const genderLabel     = GENDER_OPTIONS.find(g => g.value === profile?.gender)?.label;
  const showCareerExtra = careerStatus === 'employed' || careerStatus === 'self_employed' || careerStatus === 'business_owner';
  const showStudentFields = careerStatus === 'student';

  // ── Tab button helper ─────────────────────────────────────
  const TabBtn: React.FC<{ tab: Tab; icon: React.ElementType; label: string }> =
    ({ tab, icon: Icon, label }) => (
      <button
        type="button"
        onClick={() => { setActiveTab(tab); setSaveErr(''); setSaveOk(''); }}
        className={[
          'flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap',
          activeTab === tab
            ? 'bg-tcm-navy text-white shadow-navy'
            : 'text-tcm-gray-dark hover:bg-tcm-gray-soft hover:text-tcm-navy',
        ].join(' ')}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {label}
      </button>
    );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── Profile Banner ── */}
      <header className="bg-navy-gradient pt-[68px] pb-0 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="container-tcm py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <PhotoUpload
                currentUrl={profile?.avatar_url}
                initials={avatarInitial}
                onSave={handleSavePhoto}
              />
              {photoSuccess && (
                <p className="text-green-300 text-xs font-semibold text-center max-w-[160px] leading-tight">
                  {photoSuccess}
                </p>
              )}
              {photoError && (
                <p className="text-red-300 text-xs font-medium text-center max-w-[160px] leading-tight bg-red-500/20 rounded-lg px-2 py-1">
                  {photoError}
                </p>
              )}
            </div>

            {/* Name + role badges */}
            <div className="text-center sm:text-left">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">
                My Profile
              </p>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {profile?.full_name || 'Welcome Back'}
              </h1>
              {profile?.username && (
                <p className="text-tcm-gold/70 text-sm font-semibold mt-0.5">
                  @{profile.username}
                </p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-tcm-gold/15 border border-tcm-gold/30 rounded-full px-3 py-1 text-xs font-bold text-tcm-gold">
                  <Shield className="w-3 h-3" />
                  {profile?.role
                    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                    : 'Member'}
                </span>
                {posLabel && posLabel !== 'Member' && (
                  <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-full px-3 py-1 text-xs font-semibold text-white/70">
                    {posLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />
      </header>

      <main className="flex-grow bg-tcm-gray-soft">
        <div className="container-tcm py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* ── Left sidebar: Tabs + Sign Out ── */}
            <aside className="lg:col-span-1 flex flex-col gap-4">

              {/* Tab navigation */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-row lg:flex-col gap-1">
                <TabBtn tab="profile"  icon={UserCircle2} label="My Profile" />
                <TabBtn tab="security" icon={KeyRound}    label="Security"   />
              </div>

              {/* Scripture card */}
              <div className="hidden lg:block bg-navy-gradient rounded-2xl p-5 border border-tcm-gold/20">
                <blockquote className="border-l-2 border-tcm-gold/50 pl-4">
                  <p
                    className="text-white/70 text-sm leading-relaxed italic"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    "Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new."
                  </p>
                  <cite className="text-tcm-gold text-xs font-bold not-italic mt-2 block">
                    — 2 Corinthians 5:17
                  </cite>
                </blockquote>
              </div>

              {/* Quick links */}
              <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-tcm-navy text-xs uppercase tracking-wider mb-3">
                  Quick Links
                </h3>
                <div className="flex flex-col gap-1">
                  <Link to="/events"  className="text-sm text-tcm-gray-dark hover:text-tcm-orange font-semibold transition-colors py-1.5 border-b border-gray-50">→ Upcoming Events</Link>
                  <Link to="/gallery" className="text-sm text-tcm-gray-dark hover:text-tcm-orange font-semibold transition-colors py-1.5 border-b border-gray-50">→ Gallery</Link>
                  <Link to="/support" className="text-sm text-tcm-gray-dark hover:text-tcm-orange font-semibold transition-colors py-1.5 border-b border-gray-50">→ Support the Ministry</Link>
                  <Link to="/contact" className="text-sm text-tcm-gray-dark hover:text-tcm-orange font-semibold transition-colors py-1.5">→ Contact Us</Link>
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </aside>

            {/* ── Main content area ── */}
            <div className="lg:col-span-3 flex flex-col gap-6">

            {/* ── Admin access notification banner ── */}
              {notification && (
                <div className={`rounded-2xl border p-5 flex items-start gap-4 ${
                  notification.type === 'access_revoked'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-tcm-navy border-tcm-gold/40'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notification.type === 'access_revoked'
                      ? 'bg-amber-100'
                      : 'bg-tcm-gold/20'
                  }`}>
                    <Bell className={`w-5 h-5 ${
                      notification.type === 'access_revoked' ? 'text-amber-600' : 'text-tcm-gold'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm mb-1 ${
                      notification.type === 'access_revoked' ? 'text-amber-800' : 'text-white'
                    }`}>
                      {notification.title}
                    </p>
                    <p className={`text-xs leading-relaxed mb-3 ${
                      notification.type === 'access_revoked' ? 'text-amber-700' : 'text-white/70'
                    }`}>
                      {notification.body}
                    </p>
                    {notification.type !== 'access_revoked' && (
                      <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tcm-gold text-tcm-navy text-xs font-black hover:bg-tcm-gold-lt transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Go to Admin Dashboard
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={dismissNotification}
                    disabled={dismissingNotif}
                    className={`flex-shrink-0 transition-colors ${
                      notification.type === 'access_revoked'
                        ? 'text-amber-500 hover:text-amber-700'
                        : 'text-white/40 hover:text-white'
                    }`}
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Global save success banner (persists across tab opens) */}
              {saveOk && <SuccessBanner message={saveOk} />}

              {/* ════════════════════════════════════════
                  MY PROFILE TAB
              ════════════════════════════════════════ */}
              {activeTab === 'profile' && (
                <div className="flex flex-col gap-6">

                  {/* ── Section: Personal Information ── */}
                  <section
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    aria-label="Personal Information"
                  >
                    {/* Section header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <div>
                        <h2 className="font-black text-tcm-navy">Personal Information</h2>
                        <p className="text-tcm-gray-mid text-xs mt-0.5">
                          Your name, username, gender, and faith background
                        </p>
                      </div>
                      {!editing && (
                        <button
                          onClick={() => setEditing(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-tcm-gold/10 text-tcm-gold text-xs font-bold hover:bg-tcm-gold/20 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Information
                        </button>
                      )}
                    </div>

                    {/* View mode */}
                    {!editing && (
                      <div className="px-6 py-2">
                        <InfoRow icon={User}     label="Full Name"    value={profile?.full_name} />
                        <InfoRow icon={User}     label="Username"     value={profile?.username ? `@${profile.username}` : null} />
                        <InfoRow icon={Mail}     label="Email Address" value={user.email} />
                        <InfoRow icon={User}     label="Gender"       value={genderLabel} />
                        <InfoRow icon={Calendar} label="Date of Birth" value={
                          profile?.date_of_birth
                            ? new Date(profile.date_of_birth + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                            : null
                        } />
                        <InfoRow icon={User}     label="Faith / Church Background" value={profile?.faith} />
                      </div>
                    )}

                    {/* Edit mode — all sections in one form */}
                    {editing && (
                      <div className="px-6 py-6 space-y-6">
                        {saveErr && <ErrorBanner message={saveErr} />}

                        {/* ── Personal ── */}
                        <div>
                          <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest mb-4">
                            Personal Details
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Full Name" hint="required">
                              <input
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Your full name"
                                className="input-field"
                                autoComplete="name"
                              />
                            </Field>
                            <Field label="Username" hint="3–20 chars, lowercase">
                              <input
                                value={username}
                                onChange={e => setUsername(e.target.value.toLowerCase())}
                                placeholder="e.g. john_doe"
                                className="input-field"
                                autoComplete="username"
                              />
                            </Field>
                            <Field label="Gender" hint="optional">
                              <select
                                value={gender}
                                onChange={e => setGender(e.target.value as Gender)}
                                className="select-field"
                              >
                                <option value="">Prefer not to say</option>
                                {GENDER_OPTIONS.map(g => (
                                  <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Date of Birth" hint="optional">
                              <input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                className="input-field"
                                max={new Date().toISOString().split('T')[0]}
                              />
                            </Field>
                          </div>
                          <div className="mt-5">
                            <Field label="Faith / Church Background" hint="optional">
                              <input
                                value={faith}
                                onChange={e => setFaith(e.target.value)}
                                placeholder="e.g. Pentecostal, Catholic, Baptist…"
                                className="input-field"
                              />
                            </Field>
                          </div>
                        </div>

                        {/* ── Contact ── */}
                        <div>
                          <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest mb-4">
                            Contact Information
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Phone Number" hint="optional">
                              <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+256 700 000 000"
                                className="input-field"
                                autoComplete="tel"
                              />
                            </Field>
                          </div>
                          <div className="mt-5">
                            <Field label="Location / Address" hint="private — only visible to admins">
                              <textarea
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="City, district or general area"
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors"
                              />
                            </Field>
                          </div>
                        </div>

                        {/* ── Ministry / Career ── */}
                        <div>
                          <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest mb-4">
                            Ministry &amp; Career
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Ministry Position">
                              <select
                                value={position}
                                onChange={e => setPosition(e.target.value as MemberPosition)}
                                className="select-field"
                              >
                                {POSITIONS.map(p => (
                                  <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Career / Life Status" hint="optional">
                              <select
                                value={careerStatus}
                                onChange={e => setCareerStatus(e.target.value as CareerStatus)}
                                className="select-field"
                              >
                                <option value="">Select status</option>
                                {CAREER_OPTIONS.map(c => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </select>
                            </Field>

                            {showCareerExtra && (
                              <Field label="Occupation" hint="optional">
                                <input
                                  value={occupation}
                                  onChange={e => setOccupation(e.target.value)}
                                  placeholder="Your occupation or career"
                                  className="input-field"
                                />
                              </Field>
                            )}
                          </div>

                          {showStudentFields && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                              <Field label="Student Status" hint="optional">
                                <input
                                  value={studentStatus}
                                  onChange={e => setStudentStatus(e.target.value)}
                                  placeholder="e.g. S.4, Year 2, Final Year"
                                  className="input-field"
                                />
                              </Field>
                              <Field label="School / Institution" hint="optional">
                                <input
                                  value={school}
                                  onChange={e => setSchool(e.target.value)}
                                  placeholder="School or university name"
                                  className="input-field"
                                />
                              </Field>
                            </div>
                          )}
                        </div>

                        {/* ── Note about email ── */}
                        <div className="bg-tcm-sky-lt/60 border border-tcm-sky/40 rounded-xl px-4 py-3">
                          <p className="text-tcm-navy text-xs font-semibold mb-0.5">
                            🔒 Email address cannot be changed here
                          </p>
                          <p className="text-tcm-gray-dark text-xs leading-relaxed">
                            Your email (<strong>{user.email}</strong>) is used for sign-in and account recovery.
                            Contact IT Admin if you need to update it.
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary px-8 py-3 flex-1 sm:flex-none justify-center"
                          >
                            {saving
                              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                              : <><Save className="w-4 h-4" /> Save Changes</>
                            }
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 hover:text-tcm-navy transition-colors flex-1 sm:flex-none justify-center"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* ── Section: Profile Photo (upload is via banner) ── */}
                  <section
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    aria-label="Profile Photo"
                  >
                    <h2 className="font-black text-tcm-navy mb-1">Profile Photo</h2>
                    <p className="text-tcm-gray-mid text-xs mb-4">
                      Take a new photo or choose one from your device. JPG, PNG, or WebP · max 5 MB.
                    </p>
                    <PhotoUpload
                      currentUrl={profile?.avatar_url}
                      initials={avatarInitial}
                      onSave={handleSavePhoto}
                      className="items-start"
                    />
                    {photoSuccess && (
                      <p className="text-green-600 text-xs font-semibold mt-2">{photoSuccess}</p>
                    )}
                    {photoError && (
                      <p className="text-red-500 text-xs font-medium mt-2">{photoError}</p>
                    )}
                  </section>

                  {/* ── Section: Account Details (read-only metadata) ── */}
                  <section
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    aria-label="Account Details"
                  >
                    <h2 className="font-black text-tcm-navy mb-4">Account Details</h2>
                    <InfoRow icon={Mail}     label="Email Address"  value={user.email} />
                    <InfoRow icon={Shield}   label="Account Role"   value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Member'} />
                    <InfoRow icon={Calendar} label="Member Since"   value={
                      profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : null
                    } />
                  </section>

                </div>
              )}

              {/* ════════════════════════════════════════
                  SECURITY TAB
              ════════════════════════════════════════ */}
              {activeTab === 'security' && (
                <div className="flex flex-col gap-6">

                  {/* ── Change Password ── */}
                  <section
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    aria-label="Change Password"
                  >
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h2 className="font-black text-tcm-navy">Change Password</h2>
                      <p className="text-tcm-gray-mid text-xs mt-0.5">
                        Enter your current password, then choose a new one.
                      </p>
                    </div>

                    <form onSubmit={handleChangePassword} noValidate className="px-6 py-6 space-y-5">

                      {pwdOk  && <SuccessBanner message={pwdOk}  />}
                      {pwdErr && <ErrorBanner   message={pwdErr} />}

                      {/* Current password */}
                      <Field label="Current Password">
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                          <input
                            type={showCur ? 'text' : 'password'}
                            value={currentPwd}
                            onChange={e => { setCurrentPwd(e.target.value); setPwdErr(''); }}
                            placeholder="Your current password"
                            autoComplete="current-password"
                            className="input-field pl-10 pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCur(v => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors"
                            aria-label={showCur ? 'Hide password' : 'Show password'}
                          >
                            {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </Field>

                      {/* Divider */}
                      <div className="h-px bg-gray-100" />

                      {/* New password */}
                      <Field label="New Password" hint="at least 8 characters">
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                          <input
                            type={showNew ? 'text' : 'password'}
                            value={newPwd}
                            onChange={e => { setNewPwd(e.target.value); setPwdErr(''); }}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            className="input-field pl-10 pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(v => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors"
                            aria-label={showNew ? 'Hide password' : 'Show password'}
                          >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </Field>

                      {/* Confirm new password */}
                      <Field label="Confirm New Password">
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                          <input
                            type={showCon ? 'text' : 'password'}
                            value={confirmPwd}
                            onChange={e => { setConfirmPwd(e.target.value); setPwdErr(''); }}
                            placeholder="Repeat your new password"
                            autoComplete="new-password"
                            className="input-field pl-10 pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCon(v => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors"
                            aria-label={showCon ? 'Hide password' : 'Show password'}
                          >
                            {showCon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </Field>

                      {/* Inline password strength hint */}
                      {newPwd.length > 0 && newPwd.length < 8 && (
                        <p className="text-amber-600 text-xs font-medium">
                          ⚠ Password is too short — needs at least 8 characters.
                        </p>
                      )}
                      {newPwd.length >= 8 && confirmPwd.length > 0 && newPwd !== confirmPwd && (
                        <p className="text-red-500 text-xs font-medium">
                          ⚠ Passwords do not match yet.
                        </p>
                      )}
                      {newPwd.length >= 8 && confirmPwd === newPwd && confirmPwd.length > 0 && (
                        <p className="text-green-600 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match.
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={pwdSaving}
                        className="btn-primary w-full py-3.5 justify-center"
                      >
                        {pwdSaving
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing Password…</>
                          : <><Lock className="w-4 h-4" /> Change Password</>
                        }
                      </button>
                    </form>
                  </section>

                  {/* ── Security info note ── */}
                  <section
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    aria-label="Password Recovery"
                  >
                    <h2 className="font-black text-tcm-navy mb-1">Forgot Your Password?</h2>
                    <p className="text-tcm-gray-mid text-sm leading-relaxed mb-4">
                      If you have forgotten your password, you can request a reset link from the sign-in page.
                      The link will be sent to <strong className="text-tcm-navy">{user.email}</strong>.
                    </p>
                    <Link
                      to="/sign-in"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-tcm-navy text-tcm-navy text-sm font-bold hover:bg-tcm-navy hover:text-white transition-colors"
                    >
                      Go to Sign In → Forgot Password?
                    </Link>
                  </section>

                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
