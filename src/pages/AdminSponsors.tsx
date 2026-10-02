import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar }         from '../components/layout/Navbar';
import { Footer }         from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth }        from '../hooks/useAuth';
import { supabase }       from '../lib/supabase';
import { isValidEmail }   from '../lib/utils';
import { DEPARTMENTS }    from './Support';
import { hasPerm } from '../types/database';
import {
  Shield, Users, Heart, Star, RefreshCw,
  ChevronDown, ChevronUp, Search, Filter,
  Phone, Mail, Calendar, Tag, Loader2,
  AlertTriangle, X, Plus,
  Edit3, History, UserCheck, UserMinus,
  ArrowRight, Save, Clock,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
type SponsorType   = 'general' | 'department' | 'project' | 'merchandise' | 'other';
type RecordStatus  = 'current' | 'former';
type Frequency     = 'one_time' | 'monthly' | 'quarterly' | 'annual' | 'other';

interface Sponsor {
  id:           string;
  full_name:    string;
  email:        string | null;
  phone:        string | null;
  avatar_url:   string | null;
  profile_id:   string | null;
  sponsor_type: SponsorType;
  is_active:    boolean;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
  // joined via query
  sponsorship_records?: SponsorshipRecord[];
}

interface SponsorshipRecord {
  id:           string;
  sponsor_id:   string;
  support_type: SponsorType;
  department:   string | null;
  project:      string | null;
  merch_item:   string | null;
  description:  string | null;
  amount:       string | null;
  frequency:    Frequency | null;
  status:       RecordStatus;
  start_date:   string;
  end_date:     string | null;
  notes:        string | null;
  admin_notes:  string | null;
  created_at:   string;
}

interface HistoryEntry {
  id:                    string;
  sponsorship_record_id: string;
  previous_status:       string | null;
  new_status:            string;
  change_note:           string | null;
  changed_at:            string;
}

// ── Helpers ───────────────────────────────────────────────────
function deptLabel(v: string | null) {
  if (!v) return '—';
  return DEPARTMENTS.find(d => d.value === v)?.label ?? v;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const FREQ_LABELS: Record<string, string> = {
  one_time: 'One-time', monthly: 'Monthly', quarterly: 'Quarterly',
  annual: 'Annual', other: 'Other',
};
const TYPE_LABELS: Record<string, string> = {
  general: 'General Ministry', department: 'Ministry Department',
  project: 'Project / Activity', merchandise: 'Merchandise', other: 'Other',
};

// ── Small shared UI ───────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-1">{children}</p>
);

const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-tcm-navy">
      {label}{required && <span className="text-tcm-orange ml-1">*</span>}
      {hint && <span className="font-normal text-tcm-gray-mid ml-2 text-xs">({hint})</span>}
    </label>
    {children}
  </div>
);

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

const SponsorBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${
    active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'
  }`}>
    {active ? <UserCheck className="w-3 h-3" /> : <UserMinus className="w-3 h-3" />}
    {active ? 'Current' : 'Former'}
  </span>
);

// ── Add / Edit Sponsor Modal ──────────────────────────────────
interface SponsorFormProps {
  initial?: Sponsor | null;
  onSave:   (data: Partial<Sponsor>) => Promise<void>;
  onClose:  () => void;
}
const SponsorForm: React.FC<SponsorFormProps> = ({ initial, onSave, onClose }) => {
  const [fullName,    setFullName]    = useState(initial?.full_name    ?? '');
  const [email,       setEmail]       = useState(initial?.email        ?? '');
  const [phone,       setPhone]       = useState(initial?.phone        ?? '');
  const [sponsorType, setSponsorType] = useState<SponsorType>(initial?.sponsor_type ?? 'general');
  const [isActive,    setIsActive]    = useState(initial?.is_active    ?? true);
  const [notes,       setNotes]       = useState(initial?.notes        ?? '');
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!fullName.trim()) { setErr('Full name is required.'); return; }
    if (email && !isValidEmail(email)) { setErr('Please enter a valid email address.'); return; }
    setSaving(true);
    try {
      await onSave({
        full_name:    fullName.trim(),
        email:        email.trim().toLowerCase() || null,
        phone:        phone.trim() || null,
        sponsor_type: sponsorType,
        is_active:    isActive,
        notes:        notes.trim() || null,
      } as Partial<Sponsor>);
    } catch (e: any) {
      setErr(e?.message || 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-tcm-navy">
              {initial ? 'Edit Sponsor' : 'Add New Sponsor'}
            </h2>
            <button type="button" onClick={onClose} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="Full Name" required>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Sponsor's full name" className="input-field" autoComplete="name" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email" hint="optional">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com" className="input-field" autoComplete="email" />
              </Field>
              <Field label="Phone / WhatsApp" hint="optional">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+256 700 000 000" className="input-field" autoComplete="tel" />
              </Field>
            </div>

            <Field label="Sponsor Type">
              <select value={sponsorType} onChange={e => setSponsorType(e.target.value as SponsorType)} className="select-field">
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>

            <Field label="Status">
              <div className="flex gap-3">
                {(['current', 'former'] as const).map(s => (
                  <button key={s} type="button"
                    onClick={() => setIsActive(s === 'current')}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                      (s === 'current') === isActive
                        ? s === 'current'
                          ? 'border-green-400 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-gray-50 text-gray-600'
                        : 'border-gray-200 text-tcm-gray-mid hover:border-gray-300'
                    }`}
                  >
                    {s === 'current' ? '✓ Current Sponsor' : '✗ Former Sponsor'}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Notes" hint="internal only">
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Any notes about this sponsor…" rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
            </Field>

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
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Sponsor</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Add Sponsorship Record Modal ──────────────────────────────
interface RecordFormProps {
  sponsorId: string;
  onSave:    (data: Partial<SponsorshipRecord>) => Promise<void>;
  onClose:   () => void;
}
const RecordForm: React.FC<RecordFormProps> = ({ sponsorId, onSave, onClose }) => {
  const [supportType, setSupportType] = useState<SponsorType>('general');
  const [department,  setDepartment]  = useState('');
  const [project,     setProject]     = useState('');
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [frequency,   setFrequency]   = useState<Frequency | ''>('');
  const [startDate,   setStartDate]   = useState(new Date().toISOString().slice(0, 10));
  const [notes,       setNotes]       = useState('');
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (supportType === 'department' && !department) { setErr('Please select a department.'); return; }
    setSaving(true);
    try {
      await onSave({
        sponsor_id:   sponsorId,
        support_type: supportType,
        department:   supportType === 'department' ? department : null,
        project:      supportType === 'project'    ? project.trim() || null : null,
        description:  description.trim() || null,
        amount:       amount.trim()      || null,
        frequency:    (frequency || null) as Frequency | null,
        status:       'current',
        start_date:   startDate,
        notes:        notes.trim() || null,
      } as Partial<SponsorshipRecord>);
    } catch (e: any) {
      setErr(e?.message || 'Failed to save.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-tcm-navy">Add Sponsorship Record</h2>
            <button type="button" onClick={onClose} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="What are they sponsoring?" required>
              <select value={supportType} onChange={e => setSupportType(e.target.value as SponsorType)} className="select-field">
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>

            {supportType === 'department' && (
              <Field label="Ministry Department" required>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="select-field">
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </Field>
            )}

            {supportType === 'project' && (
              <Field label="Project / Activity Name">
                <input value={project} onChange={e => setProject(e.target.value)}
                  placeholder="e.g. Annual Retreat 2026" className="input-field" />
              </Field>
            )}

            <Field label="Description" hint="optional">
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of the sponsorship" className="input-field" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Amount" hint="optional">
                <input value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 100,000 UGX" className="input-field" />
              </Field>
              <Field label="Frequency" hint="optional">
                <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className="select-field">
                  <option value="">Select…</option>
                  {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Start Date" required>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)} className="input-field" />
            </Field>

            <Field label="Notes" hint="optional">
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Any notes about this sponsorship…" rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
            </Field>

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
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Plus className="w-4 h-4" /> Add Record</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Status Change Modal ───────────────────────────────────────
interface StatusChangeProps {
  record:   SponsorshipRecord;
  onSave:   (recordId: string, newStatus: RecordStatus, note: string, endDate: string) => Promise<void>;
  onClose:  () => void;
}
const StatusChangeModal: React.FC<StatusChangeProps> = ({ record, onSave, onClose }) => {
  const newStatus  = record.status === 'current' ? 'former' : 'current';
  const [note,     setNote]    = useState('');
  const [endDate,  setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving,   setSaving]  = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(record.id, newStatus, note, newStatus === 'former' ? endDate : '');
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-tcm-navy">Change Sponsorship Status</h2>
            <button type="button" onClick={onClose} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center gap-4 py-4 mb-5 bg-tcm-gray-soft rounded-2xl">
            <SponsorBadge active={record.status === 'current'} />
            <ArrowRight className="w-5 h-5 text-tcm-gold" />
            <SponsorBadge active={newStatus === 'current'} />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {newStatus === 'former' && (
              <Field label="End Date">
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)} className="input-field" />
              </Field>
            )}

            <Field label="Reason / Note" hint="optional">
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder={newStatus === 'former'
                  ? 'e.g. Sponsorship period ended, sponsor relocated…'
                  : 'e.g. Sponsor reactivated, renewed commitment…'}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
            </Field>

            <div className={`rounded-xl p-3 text-xs leading-relaxed ${
              newStatus === 'former'
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              {newStatus === 'former'
                ? 'The sponsor record will be preserved. You can reactivate it at any time.'
                : 'The sponsorship will be marked as active again. All previous history is preserved.'}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-colors ${
                  newStatus === 'former'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'btn-primary'
                }`}>
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : newStatus === 'former'
                  ? <><UserMinus className="w-4 h-4" /> Mark as Former</>
                  : <><UserCheck className="w-4 h-4" /> Reactivate</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Sponsor Row ───────────────────────────────────────────────
interface SponsorRowProps {
  sponsor:         Sponsor;
  onEdit:          (s: Sponsor) => void;
  onAddRecord:     (s: Sponsor) => void;
  onStatusChange:  (record: SponsorshipRecord) => void;
  adminId:         string;
}
const SponsorRow: React.FC<SponsorRowProps> = ({ sponsor, onEdit, onAddRecord, onStatusChange, adminId: _adminId }) => {
  const [expanded,  setExpanded]  = useState(false);
  const [history,   setHistory]   = useState<HistoryEntry[]>([]);
  const [showHist,  setShowHist]  = useState(false);
  const [loadingH,  setLoadingH]  = useState(false);

  const records = sponsor.sponsorship_records ?? [];

  const loadHistory = async (recordId: string) => {
    setLoadingH(true);
    const { data } = await supabase
      .from('sponsorship_history')
      .select('*')
      .eq('sponsorship_record_id', recordId)
      .order('changed_at', { ascending: false });
    setHistory((data ?? []) as HistoryEntry[]);
    setLoadingH(false);
    setShowHist(true);
  };

  const initial = (sponsor.full_name || 'S')[0].toUpperCase();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${expanded ? 'border-tcm-gold/40' : 'border-gray-100'}`}>
      {/* ── Summary row ── */}
      <button type="button" onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-tcm-gray-soft/50 transition-colors">

        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-tcm-gold/30 flex-shrink-0 bg-tcm-gold/15 flex items-center justify-center">
          {sponsor.avatar_url
            ? <img src={sponsor.avatar_url} alt={sponsor.full_name} className="w-full h-full object-cover" />
            : <span className="text-sm font-black text-tcm-gold">{initial}</span>
          }
        </div>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-tcm-navy text-sm truncate">{sponsor.full_name}</p>
          <p className="text-tcm-gray-mid text-xs truncate">
            {TYPE_LABELS[sponsor.sponsor_type]}
            {records.length > 0 && ` · ${records.length} record${records.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Date */}
        <p className="text-tcm-gray-mid text-xs hidden sm:block flex-shrink-0">{fmtDate(sponsor.created_at)}</p>

        {/* Status */}
        <div className="flex-shrink-0"><SponsorBadge active={sponsor.is_active} /></div>

        {/* Expand */}
        <div className="flex-shrink-0 text-tcm-gray-mid">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* ── Expanded ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-6">

          {/* Contact + meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Contact</Label>
              {sponsor.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                  <a href={`mailto:${sponsor.email}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors break-all">{sponsor.email}</a>
                </div>
              )}
              {sponsor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                  <a href={`tel:${sponsor.phone}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors">{sponsor.phone}</a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                <p className="text-sm text-tcm-gray-dark">Sponsor since {fmtDate(sponsor.created_at)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <p className="text-sm text-tcm-gray-dark"><span className="font-semibold text-tcm-navy">Type:</span> {TYPE_LABELS[sponsor.sponsor_type]}</p>
              <p className="text-sm text-tcm-gray-dark"><span className="font-semibold text-tcm-navy">Status:</span> {sponsor.is_active ? 'Current Sponsor' : 'Former Sponsor'}</p>
              {sponsor.notes && <p className="text-sm text-tcm-gray-dark"><span className="font-semibold text-tcm-navy">Notes:</span> {sponsor.notes}</p>}
            </div>
          </div>

          {/* Sponsorship Records */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Sponsorship Records ({records.length})</Label>
              <button type="button" onClick={() => onAddRecord(sponsor)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tcm-gold/10 border border-tcm-gold/30 text-tcm-gold text-xs font-bold hover:bg-tcm-gold/20 transition-colors">
                <Plus className="w-3 h-3" /> Add Record
              </button>
            </div>

            {records.length === 0 ? (
              <p className="text-tcm-gray-mid text-sm italic">No sponsorship records yet. Add one above.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {records.map(rec => (
                  <div key={rec.id} className={`rounded-xl border p-4 ${rec.status === 'current' ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            rec.status === 'current' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-600'
                          }`}>
                            {rec.status === 'current' ? <UserCheck className="w-2.5 h-2.5" /> : <UserMinus className="w-2.5 h-2.5" />}
                            {rec.status === 'current' ? 'Current' : 'Former'}
                          </span>
                          <span className="text-xs font-semibold text-tcm-navy">{TYPE_LABELS[rec.support_type]}</span>
                          {rec.department && <span className="text-xs text-tcm-gray-mid">· {deptLabel(rec.department)}</span>}
                          {rec.project    && <span className="text-xs text-tcm-gray-mid">· {rec.project}</span>}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          {rec.amount    && <p className="text-xs text-tcm-gray-dark"><span className="font-semibold">Amount:</span> {rec.amount}{rec.frequency ? ` / ${FREQ_LABELS[rec.frequency]}` : ''}</p>}
                          <p className="text-xs text-tcm-gray-dark"><span className="font-semibold">From:</span> {fmtDate(rec.start_date)}{rec.end_date ? ` → ${fmtDate(rec.end_date)}` : ' → present'}</p>
                        </div>
                        {rec.description && <p className="text-xs text-tcm-gray-mid mt-1">{rec.description}</p>}
                        {rec.notes       && <p className="text-xs text-tcm-gray-mid mt-0.5">Notes: {rec.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button type="button" onClick={() => { setShowHist(false); loadHistory(rec.id); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-tcm-gray-dark text-xs font-semibold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
                          <History className="w-3 h-3" /> History
                        </button>
                        <button type="button" onClick={() => onStatusChange(rec)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            rec.status === 'current'
                              ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                              : 'border border-green-200 text-green-700 hover:bg-green-50'
                          }`}>
                          {rec.status === 'current' ? <><UserMinus className="w-3 h-3" /> End</> : <><UserCheck className="w-3 h-3" /> Reactivate</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History panel */}
          {showHist && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Sponsorship History</Label>
                <button type="button" onClick={() => setShowHist(false)} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors"><X className="w-4 h-4" /></button>
              </div>
              {loadingH ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-tcm-gold animate-spin" /></div>
              ) : history.length === 0 ? (
                <p className="text-tcm-gray-mid text-sm italic">No history entries yet.</p>
              ) : (
                <div className="relative pl-5 border-l-2 border-tcm-gold/30 space-y-4">
                  {history.map(h => (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 border-tcm-gold bg-white" />
                      <p className="text-xs text-tcm-gray-mid mb-0.5">{fmtDate(h.changed_at)}</p>
                      <p className="text-sm font-semibold text-tcm-navy">
                        {h.previous_status
                          ? <>{h.previous_status} → {h.new_status}</>
                          : <>Created as {h.new_status}</>}
                      </p>
                      {h.change_note && <p className="text-xs text-tcm-gray-dark mt-0.5">{h.change_note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit sponsor button */}
          <div className="border-t border-gray-100 pt-4">
            <button type="button" onClick={() => onEdit(sponsor)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit Sponsor Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  AdminSponsors page
// ═══════════════════════════════════════════════════════════════
export const AdminSponsors: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, permissions, loading, isSuperAdmin } = useAuth();

  const [sponsors,       setSponsors]       = useState<Sponsor[]>([]);
  const [fetching,       setFetching]       = useState(true);
  const [fetchErr,       setFetchErr]       = useState('');
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState<'all' | 'current' | 'former'>('all');
  const [filterType,     setFilterType]     = useState<SponsorType | ''>('');
  const [filterDept,     setFilterDept]     = useState('');

  // Modals
  const [showAddSponsor,  setShowAddSponsor]  = useState(false);
  const [editSponsor,     setEditSponsor]     = useState<Sponsor | null>(null);
  const [addRecordFor,    setAddRecordFor]    = useState<Sponsor | null>(null);
  const [statusChangeRec, setStatusChangeRec] = useState<SponsorshipRecord | null>(null);

  // ── Auth + permission guard ──
  const canAccess = isSuperAdmin ||
    hasPerm(permissions, 'perm_view_sponsors') ||
    hasPerm(permissions, 'perm_manage_sponsors') ||
    hasPerm(permissions, 'perm_verify_sponsors') ||
    hasPerm(permissions, 'perm_full_admin');

  useEffect(() => {
    if (loading) return;
    if (!user)                               { navigate('/sign-in'); return; }
    if (!profile) return;
    const isAdmin = isSuperAdmin || profile.role === 'admin';
    if (!isAdmin) { navigate('/profile'); return; }
    if (isAdmin && !canAccess) { navigate('/admin'); }
  }, [user, profile, loading, navigate]);

  // ── Fetch ──
  const fetchSponsors = useCallback(async () => {
    setFetching(true); setFetchErr('');
    const { data, error } = await supabase
      .from('sponsors')
      .select(`*, sponsorship_records(*)`)
      .order('created_at', { ascending: false });
    if (error) {
      setFetchErr('Could not load sponsors. Make sure migration 006 has been run in Supabase.');
    } else {
      setSponsors((data ?? []) as Sponsor[]);
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!loading && user && profile?.role === 'admin') fetchSponsors();
  }, [loading, user, profile, fetchSponsors]);

  // ── CRUD ──
  const saveSponsor = async (data: Partial<Sponsor>) => {
    if (editSponsor) {
      const { error } = await supabase.from('sponsors').update(data).eq('id', editSponsor.id);
      if (error) throw new Error(error.message);
      setEditSponsor(null);
    } else {
      const { error } = await supabase.from('sponsors').insert([data]);
      if (error) throw new Error(error.message);
      setShowAddSponsor(false);
    }
    await fetchSponsors();
  };

  const saveRecord = async (data: Partial<SponsorshipRecord>) => {
    const { data: inserted, error } = await supabase
      .from('sponsorship_records').insert([data]).select().single();
    if (error) throw new Error(error.message);
    // Write initial history entry
    await supabase.from('sponsorship_history').insert([{
      sponsorship_record_id: inserted.id,
      sponsor_id:            data.sponsor_id,
      previous_status:       null,
      new_status:            'current',
      change_note:           'Sponsorship record created.',
      changed_by_admin_id:   user!.id,
    }]);
    setAddRecordFor(null);
    await fetchSponsors();
  };

  const changeStatus = async (recordId: string, newStatus: RecordStatus, note: string, endDate: string) => {
    const rec = statusChangeRec!;
    // Update the record
    await supabase.from('sponsorship_records').update({
      status:   newStatus,
      end_date: newStatus === 'former' ? endDate || null : null,
    }).eq('id', recordId);
    // Write history entry
    await supabase.from('sponsorship_history').insert([{
      sponsorship_record_id: recordId,
      sponsor_id:            rec.sponsor_id,
      previous_status:       rec.status,
      new_status:            newStatus,
      change_note:           note || null,
      changed_by_admin_id:   user!.id,
    }]);
    // Update sponsor is_active flag based on whether any records are current
    const { data: allRecs } = await supabase
      .from('sponsorship_records')
      .select('status')
      .eq('sponsor_id', rec.sponsor_id);
    const hasActive = (allRecs ?? []).some((r: any) => r.id === recordId ? newStatus === 'current' : r.status === 'current');
    await supabase.from('sponsors').update({ is_active: hasActive }).eq('id', rec.sponsor_id);
    setStatusChangeRec(null);
    await fetchSponsors();
  };

  // ── Filter ──
  const filtered = sponsors.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.full_name.toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q) ||
      (s.phone ?? '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all'
      || (filterStatus === 'current' && s.is_active)
      || (filterStatus === 'former'  && !s.is_active);
    const matchType   = !filterType || s.sponsor_type === filterType;
    const matchDept   = !filterDept || (s.sponsorship_records ?? []).some(r => r.department === filterDept);
    return matchSearch && matchStatus && matchType && matchDept;
  });

  // ── Stats (dynamic) ──
  const stats = {
    total:      sponsors.length,
    current:    sponsors.filter(s => s.is_active).length,
    former:     sponsors.filter(s => !s.is_active).length,
    general:    sponsors.filter(s => s.sponsor_type === 'general').length,
    department: sponsors.filter(s => s.sponsor_type === 'department').length,
  };

  // ── Guards ──
  if (loading) return (
    <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow pt-[68px]"><LoadingSpinner /></main><Footer /></div>
  );
  const isAdmin = isSuperAdmin || profile?.role === 'admin';
  if (!user || (profile && !isAdmin)) return null;
  if (isAdmin && !canAccess) return null;

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
              <h1 className="text-3xl font-black text-white tracking-tight">Sponsor Records</h1>
              <p className="text-white/55 text-sm mt-1">
                Manage current and former TCM sponsors
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-tcm-gold/15 border border-tcm-gold/30 rounded-full px-3 py-1.5 text-xs font-bold text-tcm-gold">
                <Shield className="w-3.5 h-3.5" /> Administrator
              </span>
              <Link to="/admin" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/25 text-white/75 text-xs font-semibold hover:border-white hover:text-white transition-colors">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />
      </header>

      <main className="flex-grow bg-tcm-gray-soft">
        <div className="container-tcm py-10">

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            <StatCard label="Total Sponsors"      value={stats.total}      icon={Users}      color="bg-tcm-navy/8 text-tcm-navy"     />
            <StatCard label="Current Sponsors"    value={stats.current}    icon={UserCheck}  color="bg-green-50 text-green-600"       />
            <StatCard label="Former Sponsors"     value={stats.former}     icon={UserMinus}  color="bg-gray-100 text-gray-500"        />
            <StatCard label="General Sponsors"    value={stats.general}    icon={Heart}      color="bg-tcm-gold/10 text-tcm-gold"     />
            <StatCard label="Department Sponsors" value={stats.department} icon={Star}       color="bg-tcm-orange/10 text-tcm-orange" />
          </div>

          {/* ── Sponsor list ── */}
          <section>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-tcm-navy">All Sponsors</h2>
                <p className="text-tcm-gray-mid text-xs mt-0.5">{filtered.length} of {sponsors.length} sponsors shown</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={fetchSponsors} disabled={fetching}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button type="button" onClick={() => setShowAddSponsor(true)}
                  className="btn-primary px-5 py-2 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Sponsor
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, phone…" className="input-field pl-10 py-2.5" />
              </div>

              {/* Status */}
              <div className="flex rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                {(['all', 'current', 'former'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors ${
                      filterStatus === s ? 'bg-tcm-navy text-white' : 'text-tcm-gray-dark hover:bg-tcm-gray-soft'
                    }`}>{s}</button>
                ))}
              </div>

              {/* Type */}
              <div className="relative flex-shrink-0">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <select value={filterType} onChange={e => setFilterType(e.target.value as SponsorType | '')}
                  className="select-field pl-10 py-2.5 pr-8 min-w-[170px]">
                  <option value="">All Types</option>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {/* Department */}
              <div className="relative flex-shrink-0">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                  className="select-field pl-10 py-2.5 pr-8 min-w-[190px]">
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              {/* Clear */}
              {(search || filterStatus !== 'all' || filterType || filterDept) && (
                <button type="button"
                  onClick={() => { setSearch(''); setFilterStatus('all'); setFilterType(''); setFilterDept(''); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Error */}
            {fetchErr && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-600 text-sm font-semibold">{fetchErr}</p>
                  <p className="text-red-500/80 text-xs mt-1">
                    Run migration 006 in <strong>Supabase → SQL Editor</strong> then refresh.
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {fetching && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-tcm-gold animate-spin" /></div>}

            {/* Empty */}
            {!fetching && !fetchErr && filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Users className="w-12 h-12 text-tcm-gray-mid mx-auto mb-4" />
                <p className="font-black text-tcm-navy mb-1">
                  {sponsors.length === 0 ? 'No sponsors yet' : 'No sponsors match your filters'}
                </p>
                <p className="text-tcm-gray-mid text-sm mb-6">
                  {sponsors.length === 0 ? 'Add your first sponsor using the button above.' : 'Try adjusting your search or filters.'}
                </p>
                {sponsors.length === 0 && (
                  <button type="button" onClick={() => setShowAddSponsor(true)} className="btn-primary px-8 py-3">
                    <Plus className="w-4 h-4" /> Add First Sponsor
                  </button>
                )}
              </div>
            )}

            {/* List */}
            {!fetching && filtered.length > 0 && (
              <div className="flex flex-col gap-3">
                {filtered.map(s => (
                  <SponsorRow
                    key={s.id}
                    sponsor={s}
                    onEdit={setEditSponsor}
                    onAddRecord={setAddRecordFor}
                    onStatusChange={setStatusChangeRec}
                    adminId={user!.id}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Sponsorship history legend ── */}
          <section className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-tcm-navy mb-3">How Sponsor Records Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-tcm-gray-dark">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-tcm-gold/10 border border-tcm-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-tcm-gold" />
                </div>
                <div>
                  <p className="font-bold text-tcm-navy">Sponsor Profile</p>
                  <p className="text-xs leading-relaxed text-tcm-gray-mid">One record per person. Holds contact details and overall status.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-tcm-orange/10 border border-tcm-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="w-4 h-4 text-tcm-orange" />
                </div>
                <div>
                  <p className="font-bold text-tcm-navy">Sponsorship Records</p>
                  <p className="text-xs leading-relaxed text-tcm-gray-mid">Multiple per person. Each represents a specific sponsorship engagement.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold text-tcm-navy">History Log</p>
                  <p className="text-xs leading-relaxed text-tcm-gray-mid">Every status change is recorded permanently for historical documentation.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />

      {/* ── Modals ── */}
      {(showAddSponsor || editSponsor) && (
        <SponsorForm
          initial={editSponsor}
          onSave={saveSponsor}
          onClose={() => { setShowAddSponsor(false); setEditSponsor(null); }}
        />
      )}
      {addRecordFor && (
        <RecordForm
          sponsorId={addRecordFor.id}
          onSave={saveRecord}
          onClose={() => setAddRecordFor(null)}
        />
      )}
      {statusChangeRec && (
        <StatusChangeModal
          record={statusChangeRec}
          onSave={changeStatus}
          onClose={() => setStatusChangeRec(null)}
        />
      )}
    </div>
  );
};
