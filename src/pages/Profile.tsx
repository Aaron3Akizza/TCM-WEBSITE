import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar }  from '../components/layout/Navbar';
import { Footer }  from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth }  from '../hooks/useAuth';
import { updateProfile, uploadProfilePhoto } from '../lib/auth';
import {
  User, Mail, Phone, Shield, Calendar, MapPin,
  Briefcase, BookOpen, Camera, Save, LogOut,
  Edit3, X, CheckCircle2, Loader2,
} from 'lucide-react';
import type { MemberPosition, CareerStatus, Gender } from '../types';

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
const CAREER: { value: CareerStatus; label: string }[] = [
  { value: 'student',        label: 'Student'        },
  { value: 'employed',       label: 'Employed'       },
  { value: 'self_employed',  label: 'Self-Employed'  },
  { value: 'unemployed',     label: 'Unemployed'     },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'other',          label: 'Other'          },
];
const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male',              label: 'Male'             },
  { value: 'female',            label: 'Female'           },
  { value: 'prefer_not_to_say', label: 'Prefer not to say'},
];

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value?: string | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-tcm-gray-soft flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-tcm-gold" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-[0.15em] mb-0.5">{label}</p>
      <p className="font-semibold text-tcm-navy text-sm truncate">{value || '—'}</p>
    </div>
  </div>
);

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  const [editing,    setEditing]   = useState(false);
  const [saving,     setSaving]    = useState(false);
  const [saveOk,     setSaveOk]    = useState(false);
  const [saveErr,    setSaveErr]   = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError,   setPhotoError]   = useState('');

  // Editable fields
  const [fullName,     setFullName]     = useState('');
  const [phone,        setPhone]        = useState('');
  const [position,     setPosition]     = useState<MemberPosition>('member');
  const [careerStatus, setCareerStatus] = useState<CareerStatus | ''>('');
  const [occupation,   setOccupation]   = useState('');
  const [school,       setSchool]       = useState('');
  const [address,      setAddress]      = useState('');
  const [faith,        setFaith]        = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/sign-in');
  }, [user, loading, navigate]);

  // Populate edit fields from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setPosition((profile.position as MemberPosition) || 'member');
      setCareerStatus((profile.career_status as CareerStatus) || '');
      setOccupation(profile.occupation || '');
      setSchool(profile.school || '');
      setAddress(profile.address || '');
      setFaith(profile.faith || '');
    }
  }, [profile]);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setPhotoError('');
    setPhotoLoading(true);

    try {
      // Validate file type and size before uploading
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setPhotoError('Please choose a JPG, PNG, or WebP image.');
        setPhotoLoading(false);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Image must be under 5MB.');
        setPhotoLoading(false);
        return;
      }

      const { url, error: uploadErr } = await uploadProfilePhoto(user.id, file);

      if (uploadErr) {
        // Give a readable error instead of a raw Supabase error
        const msg = uploadErr?.message || '';
        if (msg.includes('Bucket not found') || msg.includes('bucket')) {
          setPhotoError('Storage not configured yet. Please contact the IT Admin.');
        } else if (msg.includes('policy') || msg.includes('not authorized') || msg.includes('security')) {
          setPhotoError('Upload permission denied. Please contact the IT Admin.');
        } else {
          setPhotoError(msg || 'Upload failed. Please try again.');
        }
        setPhotoLoading(false);
        return;
      }

      if (url) {
        // Save the new avatar URL to the profile
        const { error: saveErr } = await updateProfile(user.id, { avatar_url: url });
        if (saveErr) {
          setPhotoError('Photo uploaded but profile could not be updated. Try again.');
        } else {
          // Force page reload to show the new photo immediately
          window.location.reload();
        }
      }
    } catch (err: any) {
      setPhotoError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setPhotoLoading(false);
      // Reset the file input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true); setSaveErr(''); setSaveOk(false);
    const { error } = await updateProfile(user.id, {
      full_name:     fullName.trim(),
      phone:         phone || null,
      position,
      career_status: careerStatus || null,
      occupation:    occupation || null,
      school:        school || null,
      address:       address || null,
      faith:         faith || null,
    });
    if (error) { setSaveErr(error.message || 'Failed to save.'); }
    else       { setSaveOk(true); setEditing(false); setTimeout(() => setSaveOk(false), 3000); }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px]"><LoadingSpinner /></main>
      <Footer />
    </div>
  );
  if (!user) return null;

  const avatarInitial = (profile?.full_name || user.email || 'M')[0].toUpperCase();
  const posLabel = POSITIONS.find(p => p.value === profile?.position)?.label;
  const careerLabel = CAREER.find(c => c.value === profile?.career_status)?.label;
  const genderLabel = GENDERS.find(g => g.value === profile?.gender)?.label;

  // ── InfoRow data ──────────────────────────────────
  const infoRows = [
    { icon: User,     label: 'Full Name',     value: profile?.full_name },
    { icon: User,     label: 'Username',      value: profile?.username ? `@${profile.username}` : null },
    { icon: Mail,     label: 'Email',         value: user.email },
    { icon: Phone,    label: 'Phone',         value: profile?.phone },
    { icon: Shield,   label: 'Position',      value: posLabel },
    { icon: User,     label: 'Gender',        value: genderLabel },
    { icon: Briefcase,label: 'Career Status', value: careerLabel },
    { icon: Briefcase,label: 'Occupation',    value: profile?.occupation },
    { icon: BookOpen, label: 'School',        value: profile?.school },
    { icon: MapPin,   label: 'Address',       value: profile?.address },
    { icon: User,     label: 'Faith',         value: profile?.faith },
    { icon: Calendar, label: 'Member Since',  value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="bg-navy-gradient pt-[68px] pb-0 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="container-tcm py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/50 shadow-gold">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-tcm-gold/20 flex items-center justify-center">
                        <span className="text-4xl font-black text-tcm-gold">{avatarInitial}</span>
                      </div>
                  }
                </div>
                <label htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-tcm-gold flex items-center justify-center cursor-pointer hover:bg-tcm-gold-lt transition-colors shadow-gold"
                  aria-label="Change profile photo"
                  title="Click to change photo"
                >
                  {photoLoading
                    ? <Loader2 className="w-4 h-4 text-tcm-navy animate-spin" />
                    : <Camera className="w-4 h-4 text-tcm-navy" />
                  }
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </div>
              {/* Upload status */}
              {photoLoading && (
                <p className="text-white/60 text-xs font-medium animate-pulse">Uploading…</p>
              )}
              {photoError && (
                <p className="text-red-300 text-xs font-medium text-center max-w-[140px] leading-tight bg-red-500/20 rounded-lg px-2 py-1">
                  {photoError}
                </p>
              )}
              {!photoLoading && !photoError && (
                <p className="text-white/35 text-[10px]">Tap 📷 to change</p>
              )}
            </div>

            {/* Name + role */}
            <div className="text-center sm:text-left">
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Member Profile</p>
              <h1 className="text-3xl font-black text-white tracking-tight">{profile?.full_name || 'Welcome Back'}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-tcm-gold/15 border border-tcm-gold/30 rounded-full px-3 py-1 text-xs font-bold text-tcm-gold">
                  <Shield className="w-3 h-3" />{profile?.role?.charAt(0).toUpperCase()}{profile?.role?.slice(1) || 'Member'}
                </span>
                {posLabel && (
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Info card ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
                  <h2 className="font-black text-tcm-navy">Account Details</h2>
                  <div className="flex items-center gap-2">
                    {saveOk && (
                      <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Saved
                      </span>
                    )}
                    <button
                      onClick={() => setEditing(v => !v)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        editing
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-tcm-gold/10 text-tcm-gold hover:bg-tcm-gold/20'
                      }`}
                    >
                      {editing ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit3 className="w-3.5 h-3.5" /> Edit Profile</>}
                    </button>
                  </div>
                </div>

                {!editing ? (
                  <div className="px-7 py-2">
                    {infoRows.map(({ icon, label, value }) => (
                      <InfoRow key={label} icon={icon} label={label} value={value} />
                    ))}
                  </div>
                ) : (
                  <div className="px-7 py-6 space-y-5">
                    {saveErr && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-red-600 text-sm font-medium">⚠ {saveErr}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Full Name</label>
                        <input value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Phone</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 700 000 000" className="input-field" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Ministry Position</label>
                        <select value={position} onChange={e => setPosition(e.target.value as MemberPosition)} className="select-field">
                          {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Career Status</label>
                        <select value={careerStatus} onChange={e => setCareerStatus(e.target.value as CareerStatus)} className="select-field">
                          <option value="">Select…</option>
                          {CAREER.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Occupation</label>
                        <input value={occupation} onChange={e => setOccupation(e.target.value)} className="input-field" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">School / Institution</label>
                        <input value={school} onChange={e => setSchool(e.target.value)} className="input-field" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-tcm-navy">Faith / Church Background</label>
                      <input value={faith} onChange={e => setFaith(e.target.value)} placeholder="e.g. Pentecostal, Catholic…" className="input-field" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-tcm-navy">Location / Address <span className="text-tcm-gray-mid text-xs font-normal">(private)</span></label>
                      <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
                    </div>

                    <button onClick={handleSave} disabled={saving}
                      className="btn-primary w-full py-3.5 justify-center">
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="flex flex-col gap-5">

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-tcm-navy text-sm uppercase tracking-wider mb-4">Quick Links</h3>
                <div className="flex flex-col gap-2">
                  <Link to="/events"     className="text-sm text-tcm-gray-dark hover:text-tcm-orange font-semibold transition-colors py-1.5 border-b border-gray-50">→ Upcoming Events</Link>
                  <Link to="/gallery"    className="text-sm text-tcm-gray-dark hover:text-tcm-orange font-semibold transition-colors py-1.5 border-b border-gray-50">→ Gallery</Link>
                  <Link to="/support"    className="text-sm text-tcm-gray-dark hover:text-tcm-orange font-semibold transition-colors py-1.5 border-b border-gray-50">→ Support the Ministry</Link>
                  <Link to="/contact"    className="text-sm text-tcm-gray-dark hover:text-tcm-orange font-semibold transition-colors py-1.5">→ Contact Us</Link>
                </div>
              </div>

              {/* Scripture */}
              <div className="bg-navy-gradient rounded-2xl p-6 border border-tcm-gold/20">
                <blockquote className="border-l-2 border-tcm-gold/50 pl-4">
                  <p className="text-white/70 text-sm leading-relaxed italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    "Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new."
                  </p>
                  <cite className="text-tcm-gold text-xs font-bold not-italic mt-2 block">— 2 Corinthians 5:17</cite>
                </blockquote>
              </div>

              {/* Sign out */}
              <button onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
