import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar }         from '../components/layout/Navbar';
import { Footer }         from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AdminSidebar }   from '../components/admin/AdminSidebar';
import { useAuth }        from '../hooks/useAuth';
import { supabase }       from '../lib/supabase';
import { hasPerm }        from '../types/database';
import { isValidEmail }   from '../lib/utils';
import { exportCsv }      from '../lib/exportCsv';
import type { MemberPosition, CareerStatus, Gender } from '../types';
import {
  Shield, Users, Search, RefreshCw,
  ChevronDown, ChevronUp, Mail, Phone, Calendar,
  Loader2, AlertTriangle, X, Edit3, Save, CheckCircle2,
  User, MapPin, Briefcase, BookOpen, Star, Plus, Download,
  Eye, EyeOff,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
interface MemberProfile {
  id:             string;
  full_name:      string;
  email:          string;
  username:       string | null;
  phone:          string | null;
  avatar_url:     string | null;
  role:           string;
  is_super_admin: boolean;
  position:       string | null;
  gender:         string | null;
  date_of_birth:  string | null;
  faith:          string | null;
  career_status:  string | null;
  occupation:     string | null;
  student_status: string | null;
  school:         string | null;
  address:        string | null;
  is_active:      boolean;
  member_status:  string;
  created_at:     string;
}

// ── Option lists (same as Profile.tsx) ───────────────────────
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

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function label<T extends { value: string; label: string }>(options: T[], value: string | null) {
  if (!value) return '—';
  return options.find(o => o.value === value)?.label ?? value;
}

// ── Shared Field component ────────────────────────────────────
const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label: l, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-tcm-navy">
      {l}{hint && <span className="font-normal text-tcm-gray-mid ml-2 text-xs">({hint})</span>}
    </label>
    {children}
  </div>
);

// ── Info row for view mode ────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ElementType; label: string; value?: string | null }> = ({ icon: Icon, label: l, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-tcm-gray-soft flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-3.5 h-3.5 text-tcm-gold" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-[0.15em] mb-0.5">{l}</p>
      <p className="font-semibold text-tcm-navy text-sm break-words">{value || '—'}</p>
    </div>
  </div>
);

// ── StatCard ──────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: number; icon: React.ElementType; color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-black text-tcm-navy">{value}</p>
      <p className="text-tcm-gray-mid text-xs font-semibold">{label}</p>
    </div>
  </div>
);

// ── MemberRow ─────────────────────────────────────────────────
const MemberRow: React.FC<{
  member:   MemberProfile;
  canEdit:  boolean;
  onSave:   (id: string, updates: Partial<MemberProfile>) => Promise<void>;
}> = ({ member, canEdit, onSave }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [savedOk,  setSavedOk]  = useState(false);
  const [saveErr,  setSaveErr]  = useState('');

  // Editable fields
  const [fullName,      setFullName]      = useState(member.full_name);
  const [phone,         setPhone]         = useState(member.phone ?? '');
  const [position,      setPosition]      = useState(member.position ?? 'member');
  const [gender,        setGender]        = useState(member.gender ?? '');
  const [faith,         setFaith]         = useState(member.faith ?? '');
  const [careerStatus,  setCareerStatus]  = useState(member.career_status ?? '');
  const [occupation,    setOccupation]    = useState(member.occupation ?? '');
  const [school,        setSchool]        = useState(member.school ?? '');
  const [address,       setAddress]       = useState(member.address ?? '');
  const [isActive,      setIsActive]      = useState(member.is_active);

  const initial = (member.full_name || 'M')[0].toUpperCase();
  const posLabel = label(POSITIONS, member.position);
  const carLabel = label(CAREER_OPTIONS, member.career_status);
  const genLabel = label(GENDER_OPTIONS, member.gender);

  const handleSave = async () => {
    setSaving(true); setSaveErr('');
    try {
      await onSave(member.id, {
        full_name:     fullName.trim() || member.full_name,
        phone:         phone.trim() || null,
        position:      (position || null) as MemberPosition | null,
        gender:        (gender || null) as Gender | null,
        faith:         faith.trim() || null,
        career_status: (careerStatus || null) as CareerStatus | null,
        occupation:    occupation.trim() || null,
        school:        school.trim() || null,
        address:       address.trim() || null,
        is_active:     isActive,
        member_status: isActive ? 'current' : 'former',
      });
      setSavedOk(true);
      setEditing(false);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err: any) {
      setSaveErr(err?.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setFullName(member.full_name);
    setPhone(member.phone ?? '');
    setPosition(member.position ?? 'member');
    setGender(member.gender ?? '');
    setFaith(member.faith ?? '');
    setCareerStatus(member.career_status ?? '');
    setOccupation(member.occupation ?? '');
    setSchool(member.school ?? '');
    setAddress(member.address ?? '');
    setIsActive(member.is_active);
    setSaveErr('');
    setEditing(false);
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${expanded ? 'border-tcm-gold/40' : 'border-gray-100'}`}>
      {/* ── Summary row ── */}
      <button type="button" onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-tcm-gray-soft/50 transition-colors">

        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-tcm-gold/30 flex-shrink-0 bg-tcm-gold/15 flex items-center justify-center">
          {member.avatar_url
            ? <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
            : <span className="text-sm font-black text-tcm-gold">{initial}</span>
          }
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-tcm-navy text-sm truncate">
            {member.full_name}
            {!member.is_active && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">Inactive</span>
            )}
          </p>
          <p className="text-tcm-gray-mid text-xs truncate">
            {member.email}
            {member.username && ` · @${member.username}`}
          </p>
        </div>

        {/* Position */}
        <p className="text-tcm-gray-mid text-xs hidden md:block flex-shrink-0">{posLabel}</p>

        {/* Role badge */}
        <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 ${
          member.is_super_admin ? 'bg-purple-100 border-purple-300 text-purple-700' :
          member.role === 'admin' ? 'bg-tcm-gold/15 border-tcm-gold/40 text-tcm-navy' :
          member.is_active ? 'bg-green-50 border-green-200 text-green-700' :
          'bg-gray-100 border-gray-200 text-gray-500'
        }`}>
          {member.is_super_admin ? <><Star className="w-2.5 h-2.5" />Super Admin</> :
           member.role === 'admin' ? <><Shield className="w-2.5 h-2.5" />Admin</> :
           member.is_active ? <><Users className="w-2.5 h-2.5" />Current</> :
           <><Users className="w-2.5 h-2.5" />Former</>}
        </span>

        {/* Date */}
        <p className="text-tcm-gray-mid text-xs hidden lg:block flex-shrink-0">{fmtDate(member.created_at)}</p>

        {/* Saved indicator */}
        {savedOk && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}

        <div className="flex-shrink-0 text-tcm-gray-mid">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">

          {/* View mode */}
          {!editing && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-2">Personal</p>
                  <InfoRow icon={User}      label="Full Name"    value={member.full_name} />
                  <InfoRow icon={User}      label="Username"     value={member.username ? `@${member.username}` : null} />
                  <InfoRow icon={Mail}      label="Email"        value={member.email} />
                  <InfoRow icon={Phone}     label="Phone"        value={member.phone} />
                  <InfoRow icon={User}      label="Gender"       value={genLabel} />
                  <InfoRow icon={Calendar}  label="Date of Birth" value={
                    member.date_of_birth
                      ? new Date(member.date_of_birth + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : null
                  } />
                  <InfoRow icon={User}      label="Faith"        value={member.faith} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-2">Ministry & Career</p>
                  <InfoRow icon={Shield}    label="Position"      value={posLabel} />
                  <InfoRow icon={Briefcase} label="Career Status" value={carLabel} />
                  <InfoRow icon={Briefcase} label="Occupation"    value={member.occupation} />
                  <InfoRow icon={BookOpen}  label="School"        value={member.school} />
                  <InfoRow icon={MapPin}    label="Address"       value={member.address} />
                  <InfoRow icon={Calendar}  label="Member Since"  value={fmtDate(member.created_at)} />
                  <InfoRow icon={Shield}    label="Status"        value={member.is_active ? 'Active' : 'Inactive'} />
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-tcm-gold/10 border border-tcm-gold/30 text-tcm-gold text-xs font-bold hover:bg-tcm-gold/20 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Member
                  </button>
                </div>
              )}
            </>
          )}

          {/* Edit mode */}
          {editing && (
            <div className="space-y-5">
              {saveErr && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm font-medium">{saveErr}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name">
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" />
                </Field>
                <Field label="Phone" hint="optional">
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 700 000 000" className="input-field" />
                </Field>
                <Field label="Ministry Position">
                  <select value={position} onChange={e => setPosition(e.target.value)} className="select-field">
                    {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </Field>
                <Field label="Gender" hint="optional">
                  <select value={gender} onChange={e => setGender(e.target.value)} className="select-field">
                    <option value="">Prefer not to say</option>
                    {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </Field>
                <Field label="Career Status" hint="optional">
                  <select value={careerStatus} onChange={e => setCareerStatus(e.target.value)} className="select-field">
                    <option value="">Select…</option>
                    {CAREER_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Occupation" hint="optional">
                  <input value={occupation} onChange={e => setOccupation(e.target.value)} className="input-field" />
                </Field>
                <Field label="School / Institution" hint="optional">
                  <input value={school} onChange={e => setSchool(e.target.value)} className="input-field" />
                </Field>
                <Field label="Faith / Church Background" hint="optional">
                  <input value={faith} onChange={e => setFaith(e.target.value)} placeholder="e.g. Pentecostal…" className="input-field" />
                </Field>
              </div>

              <Field label="Address / Location" hint="optional">
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
              </Field>

              {/* Active / Former status toggle */}
              <div className="flex items-center justify-between bg-tcm-gray-soft rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-tcm-navy">Member Status</p>
                  <p className="text-tcm-gray-mid text-xs">{isActive ? 'Current member — active in the ministry' : 'Former member — no longer active'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {isActive ? 'Current' : 'Former'}
                  </span>
                  <button type="button" onClick={() => setIsActive(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-all ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    role="switch" aria-checked={isActive}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={handleSave} disabled={saving}
                  className="btn-primary px-6 py-2.5 text-sm">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
                <button type="button" onClick={cancelEdit} disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Add Member Modal
// ═══════════════════════════════════════════════════════════════
const AddMemberModal: React.FC<{
  onClose:  () => void;
  onSaved:  () => void;
}> = ({ onClose, onSaved }) => {
  const [fullName,   setFullName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [phone,      setPhone]      = useState('');
  const [position,   setPosition]   = useState<MemberPosition>('member');
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!fullName.trim())    { setErr('Full name is required.');                    return; }
    if (!isValidEmail(email)){ setErr('A valid email address is required.');        return; }
    if (password.length < 8) { setErr('Password must be at least 8 characters.');  return; }

    setSaving(true);
    try {
      // Create Supabase auth user
      const { data, error: authErr } = await supabase.auth.signUp({
        email:    email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim(), position },
        },
      });
      if (authErr) throw new Error(authErr.message);
      if (!data.user) throw new Error('Could not create account. Please try again.');

      // Upsert full profile immediately
      const { error: profErr } = await supabase.from('profiles').upsert({
        id:        data.user.id,
        full_name: fullName.trim(),
        email:     email.trim().toLowerCase(),
        phone:     phone.trim() || null,
        position,
        role:      'member',
      }, { onConflict: 'id' });
      if (profErr) console.warn('[AddMember] profile upsert:', profErr.message);

      onSaved();
      onClose();
    } catch (ex: any) {
      setErr(ex?.message || 'Failed to create member.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-tcm-navy">Add New Member</h2>
            <button type="button" onClick={onClose} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-tcm-navy">Full Name <span className="text-tcm-orange">*</span></label>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Member's full name" className="input-field" autoComplete="name" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-tcm-navy">Email <span className="text-tcm-orange">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com" className="input-field" autoComplete="email" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-tcm-navy">Phone <span className="text-tcm-gray-mid text-xs font-normal">(optional)</span></label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+256 700 000 000" className="input-field" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-tcm-navy">Password <span className="text-tcm-orange">*</span></label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters" className="input-field pr-11" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-tcm-gray-mid text-xs">The member can change this password after signing in.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-tcm-navy">Ministry Position</label>
              <select value={position} onChange={e => setPosition(e.target.value as MemberPosition)} className="select-field">
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {err && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm font-medium">{err}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 justify-center">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Add Member</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  AdminMembers page
// ═══════════════════════════════════════════════════════════════
export const AdminMembers: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, permissions, loading, isSuperAdmin } = useAuth();

  const [members,      setMembers]      = useState<MemberProfile[]>([]);
  const [fetching,     setFetching]     = useState(true);
  const [fetchErr,     setFetchErr]     = useState('');
  const [search,       setSearch]       = useState('');
  const [filterRole,   setFilterRole]   = useState<'all' | 'admin' | 'member'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // ── Auth + permission guard ──
  const canView = isSuperAdmin ||
    hasPerm(permissions, 'perm_view_members') ||
    hasPerm(permissions, 'perm_edit_members') ||
    hasPerm(permissions, 'perm_manage_members') ||
    hasPerm(permissions, 'perm_full_admin');

  const canEdit = isSuperAdmin ||
    hasPerm(permissions, 'perm_edit_members') ||
    hasPerm(permissions, 'perm_manage_members') ||
    hasPerm(permissions, 'perm_full_admin');

  useEffect(() => {
    if (loading) return;
    if (!user)                               { navigate('/sign-in'); return; }
    if (!profile) return;
    const isAdmin = isSuperAdmin || profile.role === 'admin';
    if (!isAdmin) { navigate('/profile'); return; }
    if (isAdmin && !canView) { navigate('/admin'); }
  }, [user, profile, loading, isSuperAdmin, canView, navigate]);

  // ── Fetch ──
  const fetchMembers = useCallback(async () => {
    setFetching(true); setFetchErr('');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    if (error) {
      setFetchErr('Could not load members. ' + error.message);
    } else {
      setMembers((data ?? []) as MemberProfile[]);
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!loading && user && canView) fetchMembers();
    else if (!loading && user) setFetching(false);
  }, [loading, user, canView, fetchMembers]);

  // ── Save member ──
  const handleSave = async (id: string, updates: Partial<MemberProfile>) => {
    // Strip protected fields — admin cannot change email or role via this page
    const safe: any = { ...updates };
    delete safe.role;
    delete safe.is_super_admin;
    delete safe.email;
    delete safe.id;

    const { error } = await supabase
      .from('profiles')
      .update(safe)
      .eq('id', id);

    if (error) throw new Error(error.message);

    // Update local state immediately
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...safe } : m));
  };

  // ── Filter ──
  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.username ?? '').toLowerCase().includes(q) ||
      (m.phone ?? '').toLowerCase().includes(q);
    const matchRole =
      filterRole === 'all' ||
      (filterRole === 'admin' && (m.role === 'admin' || m.is_super_admin)) ||
      (filterRole === 'member' && m.role === 'member');
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && m.is_active) ||
      (filterStatus === 'inactive' && !m.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  // ── Stats ──
  const stats = {
    total:    members.length,
    active:   members.filter(m => m.is_active).length,
    inactive: members.filter(m => !m.is_active).length,
    admins:   members.filter(m => m.role === 'admin' || m.is_super_admin).length,
  };

  // ── Guards ──
  if (loading) return (
    <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow pt-[68px]"><LoadingSpinner /></main><Footer /></div>
  );
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="bg-navy-gradient pt-[68px] pb-0 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="container-tcm py-10 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Admin Dashboard</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Members</h1>
              <p className="text-white/55 text-sm mt-1">All registered TCM members and their details</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/25 text-white/75 text-xs font-semibold hover:border-white hover:text-white transition-colors">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar permissions={permissions} isSuperAdmin={isSuperAdmin} />

        <main className="flex-1 overflow-y-auto bg-tcm-gray-soft">
        <div className="container-tcm py-10">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Members"   value={stats.total}    icon={Users}         color="bg-tcm-navy/8 text-tcm-navy"    />
            <StatCard label="Current Members" value={stats.active}   icon={CheckCircle2}  color="bg-green-50 text-green-600"     />
            <StatCard label="Former Members"  value={stats.inactive} icon={AlertTriangle} color="bg-gray-100 text-gray-500"      />
            <StatCard label="Administrators"  value={stats.admins}   icon={Shield}        color="bg-purple-50 text-purple-600"   />
          </div>

          {/* Filters + actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, username, phone…"
                className="input-field pl-10 py-2.5" />
            </div>

            <div className="flex rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
              {(['all', 'member', 'admin'] as const).map(r => (
                <button key={r} type="button" onClick={() => setFilterRole(r)}
                  className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors ${filterRole === r ? 'bg-tcm-navy text-white' : 'text-tcm-gray-dark hover:bg-tcm-gray-soft'}`}>
                  {r === 'all' ? 'All Roles' : r === 'admin' ? 'Admins' : 'Members'}
                </button>
              ))}
            </div>

            <div className="flex rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
              {(['all', 'active', 'inactive'] as const).map(s => (
                <button key={s} type="button" onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors ${filterStatus === s ? 'bg-tcm-navy text-white' : 'text-tcm-gray-dark hover:bg-tcm-gray-soft'}`}>
                  {s === 'all' ? 'All Status' : s === 'active' ? 'Current' : 'Former'}
                </button>
              ))}
            </div>

            <button type="button" onClick={fetchMembers} disabled={fetching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors flex-shrink-0">
              <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} /> Refresh
            </button>

            {(search || filterRole !== 'all' || filterStatus !== 'all') && (
              <button type="button" onClick={() => { setSearch(''); setFilterRole('all'); setFilterStatus('all'); }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors flex-shrink-0">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-tcm-gray-mid text-sm">
              Showing <strong className="text-tcm-navy">{filtered.length}</strong> of <strong className="text-tcm-navy">{members.length}</strong> members
            </p>
            <div className="flex items-center gap-2">
              {/* CSV Export */}
              <button type="button"
                onClick={() => exportCsv(filtered.map(m => ({
                  Name: m.full_name, Email: m.email, Phone: m.phone ?? '',
                  Username: m.username ?? '', Role: m.role, Position: m.position ?? '',
                  Gender: m.gender ?? '', 'Career Status': m.career_status ?? '',
                  Faith: m.faith ?? '', School: m.school ?? '', Address: m.address ?? '',
                  Active: m.is_active ? 'Yes' : 'No', 'Joined': new Date(m.created_at).toLocaleDateString('en-GB'),
                })), 'tcm-members')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              {/* Add Member */}
              {canEdit && (
                <button type="button" onClick={() => setShowAddModal(true)}
                  className="btn-primary px-5 py-2 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Member
                </button>
              )}
            </div>
          </div>
          {/* Error */}
          {fetchErr && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm font-semibold">{fetchErr}</p>
            </div>
          )}

          {/* Loading */}
          {fetching && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-tcm-gold animate-spin" /></div>}

          {/* Empty */}
          {!fetching && filtered.length === 0 && !fetchErr && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Users className="w-12 h-12 text-tcm-gray-mid mx-auto mb-4" />
              <p className="font-black text-tcm-navy mb-1">
                {members.length === 0 ? 'No members yet' : 'No members match your filters'}
              </p>
              <p className="text-tcm-gray-mid text-sm">
                {members.length === 0 ? 'Members who register will appear here.' : 'Try adjusting your search or filters.'}
              </p>
            </div>
          )}

          {/* Member list */}
          {!fetching && filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              {filtered.map(m => (
                <MemberRow key={m.id} member={m} canEdit={canEdit} onSave={handleSave} />
              ))}
            </div>
          )}

        </div>
        </main>
      </div>
      <Footer />

      {/* Add Member Modal */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSaved={fetchMembers}
        />
      )}
    </div>
  );
};
