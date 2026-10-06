import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar }         from '../components/layout/Navbar';
import { Footer }         from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AdminSidebar }   from '../components/admin/AdminSidebar';
import { useAuth }        from '../hooks/useAuth';
import { supabase }       from '../lib/supabase';
import { hasPerm }        from '../types/database';
import { exportCsv }      from '../lib/exportCsv';
import {
  Gift, Plus, Search, RefreshCw, ChevronDown, ChevronUp,
  Edit3, Save, X, Loader2, AlertTriangle, CheckCircle2,
  Calendar, MapPin, Users, Download,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
type ProgramStatus   = 'planned' | 'active' | 'completed' | 'cancelled';
type ProgramCategory = 'seed_project' | 'outreach' | 'community' | 'equipment' | 'conference' | 'education' | 'medical' | 'other';

interface CharityProgram {
  id:             string;
  title:          string;
  description:    string | null;
  category:       ProgramCategory;
  status:         ProgramStatus;
  target_amount:  string | null;
  amount_raised:  string | null;
  start_date:     string | null;
  end_date:       string | null;
  location:       string | null;
  beneficiaries:  string | null;
  notes:          string | null;
  created_at:     string;
}

// ── Option lists ─────────────────────────────────────────────
const CATEGORIES: { value: ProgramCategory; label: string }[] = [
  { value: 'seed_project',  label: 'Seed Project'           },
  { value: 'outreach',      label: 'Outreach'               },
  { value: 'community',     label: 'Community Project'      },
  { value: 'equipment',     label: 'Equipment Purchase'     },
  { value: 'conference',    label: 'Conference / Event'     },
  { value: 'education',     label: 'Education / Training'   },
  { value: 'medical',       label: 'Medical / Health'       },
  { value: 'other',         label: 'Other'                  },
];

const STATUSES: { value: ProgramStatus; label: string; color: string; bg: string }[] = [
  { value: 'planned',    label: 'Planned',    color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200'   },
  { value: 'active',     label: 'Active',     color: 'text-green-600',  bg: 'bg-green-50 border-green-200' },
  { value: 'completed',  label: 'Completed',  color: 'text-tcm-gold',   bg: 'bg-tcm-gold/10 border-tcm-gold/30' },
  { value: 'cancelled',  label: 'Cancelled',  color: 'text-red-500',    bg: 'bg-red-50 border-red-200'     },
];

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function catLabel(v: string) { return CATEGORIES.find(c => c.value === v)?.label ?? v; }
function statusCfg(v: string) { return STATUSES.find(s => s.value === v) ?? STATUSES[3]; }

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

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-tcm-navy">
      {label}{hint && <span className="font-normal text-tcm-gray-mid ml-2 text-xs">({hint})</span>}
    </label>
    {children}
  </div>
);

// ── Program Form Modal ────────────────────────────────────────
const ProgramModal: React.FC<{
  initial?: CharityProgram | null;
  userId:   string;
  onSave:   () => void;
  onClose:  () => void;
}> = ({ initial, userId, onSave, onClose }) => {
  const [title,         setTitle]         = useState(initial?.title         ?? '');
  const [description,   setDescription]   = useState(initial?.description   ?? '');
  const [category,      setCategory]      = useState<ProgramCategory>(initial?.category ?? 'other');
  const [status,        setStatus]        = useState<ProgramStatus>(initial?.status ?? 'planned');
  const [targetAmount,  setTargetAmount]  = useState(initial?.target_amount  ?? '');
  const [amountRaised,  setAmountRaised]  = useState(initial?.amount_raised  ?? '');
  const [startDate,     setStartDate]     = useState(initial?.start_date?.slice(0,10) ?? '');
  const [endDate,       setEndDate]       = useState(initial?.end_date?.slice(0,10)   ?? '');
  const [location,      setLocation]      = useState(initial?.location      ?? '');
  const [beneficiaries, setBeneficiaries] = useState(initial?.beneficiaries ?? '');
  const [notes,         setNotes]         = useState(initial?.notes         ?? '');
  const [saving,        setSaving]        = useState(false);
  const [err,           setErr]           = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!title.trim()) { setErr('Program title is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(), description: description.trim() || null,
        category, status,
        target_amount: targetAmount.trim() || null,
        amount_raised: amountRaised.trim() || null,
        start_date: startDate || null, end_date: endDate || null,
        location: location.trim() || null, beneficiaries: beneficiaries.trim() || null,
        notes: notes.trim() || null,
        created_by: userId,
      };
      if (initial) {
        const { error } = await supabase.from('charity_programs').update(payload).eq('id', initial.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('charity_programs').insert([payload]);
        if (error) throw new Error(error.message);
      }
      onSave();
      onClose();
    } catch (ex: any) {
      setErr(ex?.message || 'Failed to save program.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange flex-shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-black text-tcm-navy">{initial ? 'Edit Program' : 'Add Charity Program'}</h2>
          <button type="button" onClick={onClose} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Program Title" hint="required">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Seed Project 2026" className="input-field" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select value={category} onChange={e => setCategory(e.target.value as ProgramCategory)} className="select-field">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={e => setStatus(e.target.value as ProgramStatus)} className="select-field">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description" hint="optional">
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Describe the program and its purpose…"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Target Amount" hint="optional">
              <input value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="e.g. 5,000,000 UGX" className="input-field" />
            </Field>
            <Field label="Amount Raised" hint="optional">
              <input value={amountRaised} onChange={e => setAmountRaised(e.target.value)} placeholder="e.g. 2,000,000 UGX" className="input-field" />
            </Field>
            <Field label="Start Date" hint="optional">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
            </Field>
            <Field label="End Date" hint="optional">
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location" hint="optional">
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Kampala, Uganda" className="input-field" />
            </Field>
            <Field label="Beneficiaries" hint="optional">
              <input value={beneficiaries} onChange={e => setBeneficiaries(e.target.value)} placeholder="e.g. 200 children" className="input-field" />
            </Field>
          </div>
          <Field label="Notes" hint="optional">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Any additional notes…"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
          </Field>
          {err && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm font-medium">{err}</p>
            </div>
          )}
        </form>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-tcm-gray-soft flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={saving} className="flex-1 btn-primary py-3 justify-center">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Program</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ProgramRow ────────────────────────────────────────────────
const ProgramRow: React.FC<{
  program: CharityProgram;
  canEdit: boolean;
  onEdit:  (p: CharityProgram) => void;
}> = ({ program, canEdit, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusCfg(program.status);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${expanded ? 'border-tcm-gold/40' : 'border-gray-100'}`}>
      <button type="button" onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-tcm-gray-soft/50 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-tcm-gold/10 border border-tcm-gold/20 flex items-center justify-center flex-shrink-0">
          <Gift className="w-4 h-4 text-tcm-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-tcm-navy text-sm truncate">{program.title}</p>
          <p className="text-tcm-gray-mid text-xs">{catLabel(program.category)}</p>
        </div>
        <p className="text-tcm-gray-mid text-xs hidden sm:block flex-shrink-0">{fmtDate(program.start_date)}</p>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
        <div className="flex-shrink-0 text-tcm-gray-mid">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-4">
          {program.description && (
            <div className="bg-tcm-gray-soft rounded-xl p-4">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-1">Description</p>
              <p className="text-sm text-tcm-gray-dark leading-relaxed">{program.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-tcm-gray-dark">
            {program.target_amount  && <div><p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-0.5">Target</p><p className="font-semibold text-tcm-navy">{program.target_amount}</p></div>}
            {program.amount_raised  && <div><p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-0.5">Raised</p><p className="font-semibold text-tcm-navy">{program.amount_raised}</p></div>}
            {program.location       && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-tcm-gold mt-0.5 flex-shrink-0" /><div><p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-0.5">Location</p><p className="font-semibold text-tcm-navy">{program.location}</p></div></div>}
            {program.beneficiaries  && <div className="flex items-start gap-2"><Users className="w-4 h-4 text-tcm-gold mt-0.5 flex-shrink-0" /><div><p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-0.5">Beneficiaries</p><p className="font-semibold text-tcm-navy">{program.beneficiaries}</p></div></div>}
            {program.start_date     && <div className="flex items-start gap-2"><Calendar className="w-4 h-4 text-tcm-gold mt-0.5 flex-shrink-0" /><div><p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-0.5">Period</p><p className="font-semibold text-tcm-navy">{fmtDate(program.start_date)}{program.end_date ? ` → ${fmtDate(program.end_date)}` : ' → ongoing'}</p></div></div>}
          </div>
          {program.notes && <p className="text-xs text-tcm-gray-mid italic">{program.notes}</p>}
          {canEdit && (
            <div className="border-t border-gray-100 pt-4">
              <button type="button" onClick={() => onEdit(program)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-tcm-gold/10 border border-tcm-gold/30 text-tcm-gold text-xs font-bold hover:bg-tcm-gold/20 transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> Edit Program
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  AdminCharity page
// ═══════════════════════════════════════════════════════════════
export const AdminCharity: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, permissions, loading, isSuperAdmin } = useAuth();

  const [programs,     setPrograms]     = useState<CharityProgram[]>([]);
  const [fetching,     setFetching]     = useState(true);
  const [fetchErr,     setFetchErr]     = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState<ProgramStatus | ''>('');
  const [showModal,    setShowModal]    = useState(false);
  const [editProgram,  setEditProgram]  = useState<CharityProgram | null>(null);

  const canView = isSuperAdmin ||
    hasPerm(permissions, 'perm_manage_departments') ||
    hasPerm(permissions, 'perm_full_admin');

  const canEdit = canView;

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/sign-in'); return; }
    if (!profile) return;
    const isAdmin = isSuperAdmin || profile.role === 'admin';
    if (!isAdmin) { navigate('/profile'); return; }
    if (isAdmin && !canView) { navigate('/admin'); }
  }, [user, profile, loading, isSuperAdmin, canView, navigate]);

  const fetchPrograms = useCallback(async () => {
    setFetching(true); setFetchErr('');
    const { data, error } = await supabase
      .from('charity_programs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setFetchErr('Could not load programs. Run migration 012 in Supabase SQL Editor.');
    else setPrograms((data ?? []) as CharityProgram[]);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!loading && user && canView) fetchPrograms();
    else if (!loading && user) setFetching(false);
  }, [loading, user, canView, fetchPrograms]);

  const filtered = programs.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      (p.location ?? '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:     programs.length,
    active:    programs.filter(p => p.status === 'active').length,
    completed: programs.filter(p => p.status === 'completed').length,
    planned:   programs.filter(p => p.status === 'planned').length,
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow pt-[68px]"><LoadingSpinner /></main><Footer /></div>
  );
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <header className="bg-navy-gradient pt-[68px] pb-0 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="container-tcm py-10 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Admin Dashboard</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Charity Programs</h1>
              <p className="text-white/55 text-sm mt-1">Seed projects, outreach, and community initiatives</p>
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar permissions={permissions} isSuperAdmin={isSuperAdmin} />

        <main className="flex-1 overflow-y-auto bg-tcm-gray-soft">
          <div className="container-tcm py-10">

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <StatCard label="Total Programs" value={stats.total}     icon={Gift}          color="bg-tcm-navy/8 text-tcm-navy"   />
              <StatCard label="Active"         value={stats.active}    icon={CheckCircle2}  color="bg-green-50 text-green-600"    />
              <StatCard label="Completed"      value={stats.completed} icon={CheckCircle2}  color="bg-tcm-gold/10 text-tcm-gold"  />
              <StatCard label="Planned"        value={stats.planned}   icon={Calendar}      color="bg-blue-50 text-blue-500"      />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title, description, location…"
                  className="input-field pl-10 py-2.5" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ProgramStatus | '')}
                className="select-field py-2.5 pr-8 min-w-[150px] flex-shrink-0">
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button type="button" onClick={fetchPrograms} disabled={fetching}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors flex-shrink-0">
                <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} /> Refresh
              </button>
              {(search || filterStatus) && (
                <button type="button" onClick={() => { setSearch(''); setFilterStatus(''); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p className="text-tcm-gray-mid text-sm">
                Showing <strong className="text-tcm-navy">{filtered.length}</strong> of <strong className="text-tcm-navy">{programs.length}</strong> programs
              </p>
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => exportCsv(filtered.map(p => ({
                    Title: p.title, Category: catLabel(p.category), Status: p.status,
                    'Target Amount': p.target_amount ?? '', 'Amount Raised': p.amount_raised ?? '',
                    Location: p.location ?? '', Beneficiaries: p.beneficiaries ?? '',
                    'Start Date': fmtDate(p.start_date), 'End Date': fmtDate(p.end_date),
                    Description: p.description ?? '', Notes: p.notes ?? '',
                    'Created': fmtDate(p.created_at),
                  })), 'tcm-charity-programs')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                {canEdit && (
                  <button type="button" onClick={() => { setEditProgram(null); setShowModal(true); }}
                    className="btn-primary px-5 py-2 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Add Program
                  </button>
                )}
              </div>
            </div>

            {fetchErr && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-600 text-sm font-semibold">{fetchErr}</p>
                  <p className="text-red-500/80 text-xs mt-1">Run migration 012 in Supabase SQL Editor first.</p>
                </div>
              </div>
            )}

            {fetching && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-tcm-gold animate-spin" /></div>}

            {!fetching && filtered.length === 0 && !fetchErr && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Gift className="w-12 h-12 text-tcm-gray-mid mx-auto mb-4" />
                <p className="font-black text-tcm-navy mb-1">
                  {programs.length === 0 ? 'No charity programs yet' : 'No programs match your filters'}
                </p>
                {canEdit && programs.length === 0 && (
                  <button type="button" onClick={() => setShowModal(true)} className="btn-primary px-8 py-3 mt-4">
                    <Plus className="w-4 h-4" /> Add First Program
                  </button>
                )}
              </div>
            )}

            {!fetching && filtered.length > 0 && (
              <div className="flex flex-col gap-3">
                {filtered.map(p => (
                  <ProgramRow key={p.id} program={p} canEdit={canEdit}
                    onEdit={prog => { setEditProgram(prog); setShowModal(true); }} />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
      <Footer />

      {showModal && (
        <ProgramModal
          initial={editProgram}
          userId={user!.id}
          onSave={fetchPrograms}
          onClose={() => { setShowModal(false); setEditProgram(null); }}
        />
      )}
    </div>
  );
};
