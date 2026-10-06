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
import { DEPARTMENTS }    from './Support';
import {
  Heart, Search, RefreshCw, ChevronDown, ChevronUp,
  Mail, Phone, Loader2, AlertTriangle, X,
  CheckCircle2, Download, Users, Star, Tag,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
interface SupporterRecord {
  id:                  string;
  sponsor_id:          string;
  support_type:        string;
  department:          string | null;
  project:             string | null;
  merch_item:          string | null;
  amount:              string | null;
  amount_sent:         string | null;
  frequency:           string | null;
  payment_date:        string | null;
  transaction_ref:     string | null;
  verification_status: string;
  start_date:          string;
  created_at:          string;
  // joined
  sponsors: {
    full_name:  string;
    email:      string | null;
    phone:      string | null;
    avatar_url: string | null;
  } | null;
  payment_methods: {
    name: string;
  } | null;
}

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function deptLabel(v: string | null) {
  if (!v) return '—';
  return DEPARTMENTS.find(d => d.value === v)?.label ?? v;
}

const FREQ_LABELS: Record<string, string> = {
  one_time: 'One-time', monthly: 'Monthly',
  quarterly: 'Quarterly', annual: 'Annual', other: 'Other',
};

const TYPE_LABELS: Record<string, string> = {
  general: 'General Ministry', department: 'Ministry Dept',
  project: 'Project', merchandise: 'Merchandise', other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  current:              'bg-green-50 border-green-200 text-green-700',
  pending_verification: 'bg-amber-50 border-amber-200 text-amber-700',
  former:               'bg-gray-100 border-gray-200 text-gray-600',
  unverified:           'bg-red-50 border-red-200 text-red-600',
};

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ElementType; color: string }> = ({ label, value, icon: Icon, color }) => (
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

// ── SupporterRow ─────────────────────────────────────────────
const SupporterRow: React.FC<{ record: SupporterRecord }> = ({ record }) => {
  const [expanded, setExpanded] = useState(false);
  const sponsor = record.sponsors;
  const initial = (sponsor?.full_name || 'S')[0].toUpperCase();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${expanded ? 'border-tcm-gold/40' : 'border-gray-100'}`}>
      <button type="button" onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-tcm-gray-soft/50 transition-colors">

        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-tcm-gold/30 flex-shrink-0 bg-tcm-gold/15 flex items-center justify-center">
          {sponsor?.avatar_url
            ? <img src={sponsor.avatar_url} alt={sponsor.full_name} className="w-full h-full object-cover" />
            : <span className="text-sm font-black text-tcm-gold">{initial}</span>
          }
        </div>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-tcm-navy text-sm truncate">{sponsor?.full_name ?? '—'}</p>
          <p className="text-tcm-gray-mid text-xs truncate">
            {TYPE_LABELS[record.support_type] ?? record.support_type}
            {record.department && ` · ${deptLabel(record.department)}`}
            {record.project    && ` · ${record.project}`}
          </p>
        </div>

        {/* Amount */}
        <p className="text-tcm-navy text-sm font-bold hidden sm:block flex-shrink-0">
          {record.amount_sent || record.amount || '—'}
        </p>

        {/* Date */}
        <p className="text-tcm-gray-mid text-xs hidden md:block flex-shrink-0">
          {fmtDate(record.payment_date || record.start_date)}
        </p>

        {/* Status */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold flex-shrink-0 ${STATUS_COLORS[record.verification_status] ?? 'bg-gray-100 border-gray-200 text-gray-600'}`}>
          {record.verification_status === 'current'              ? 'Verified'            :
           record.verification_status === 'pending_verification' ? 'Pending'             :
           record.verification_status === 'former'               ? 'Former'              :
           record.verification_status === 'unverified'           ? 'Unverified'          : record.verification_status}
        </span>

        <div className="flex-shrink-0 text-tcm-gray-mid">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Contact</p>
              {sponsor?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                  <a href={`mailto:${sponsor.email}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors break-all">{sponsor.email}</a>
                </div>
              )}
              {sponsor?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                  <a href={`tel:${sponsor.phone}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors">{sponsor.phone}</a>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Support Details</p>
              <div className="flex flex-col gap-1.5 text-sm text-tcm-gray-dark">
                <p><span className="font-semibold text-tcm-navy">Type:</span> {TYPE_LABELS[record.support_type] ?? record.support_type}</p>
                {record.department && <p><span className="font-semibold text-tcm-navy">Department:</span> {deptLabel(record.department)}</p>}
                {record.project    && <p><span className="font-semibold text-tcm-navy">Project:</span> {record.project}</p>}
                <p><span className="font-semibold text-tcm-navy">Amount:</span> {record.amount_sent || record.amount || '—'}
                  {record.frequency && <span className="text-tcm-gray-mid"> / {FREQ_LABELS[record.frequency] ?? record.frequency}</span>}
                </p>
                <p><span className="font-semibold text-tcm-navy">Payment Date:</span> {fmtDate(record.payment_date)}</p>
                {record.payment_methods?.name && <p><span className="font-semibold text-tcm-navy">Payment Method:</span> {record.payment_methods.name}</p>}
                {record.transaction_ref && <p><span className="font-semibold text-tcm-navy">Transaction Ref:</span> <code className="bg-tcm-gray-soft px-2 py-0.5 rounded text-xs">{record.transaction_ref}</code></p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  AdminSupporters page
// ═══════════════════════════════════════════════════════════════
export const AdminSupporters: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, permissions, loading, isSuperAdmin } = useAuth();

  const [records,     setRecords]     = useState<SupporterRecord[]>([]);
  const [fetching,    setFetching]    = useState(true);
  const [fetchErr,    setFetchErr]    = useState('');
  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState<string>('');

  const canView = isSuperAdmin ||
    hasPerm(permissions, 'perm_view_sponsors') ||
    hasPerm(permissions, 'perm_manage_sponsors') ||
    hasPerm(permissions, 'perm_full_admin');

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/sign-in'); return; }
    if (!profile) return;
    const isAdmin = isSuperAdmin || profile.role === 'admin';
    if (!isAdmin) { navigate('/profile'); return; }
    if (isAdmin && !canView) { navigate('/admin'); }
  }, [user, profile, loading, isSuperAdmin, canView, navigate]);

  const fetchRecords = useCallback(async () => {
    setFetching(true); setFetchErr('');
    const { data, error } = await supabase
      .from('sponsorship_records')
      .select(`
        id, sponsor_id, support_type, department, project, merch_item,
        amount, amount_sent, frequency, payment_date, transaction_ref,
        verification_status, start_date, created_at,
        sponsors ( full_name, email, phone, avatar_url ),
        payment_methods ( name )
      `)
      .order('created_at', { ascending: false });
    if (error) {
      setFetchErr('Could not load supporters. ' + error.message);
    } else {
      setRecords((data ?? []) as unknown as SupporterRecord[]);
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!loading && user && canView) fetchRecords();
    else if (!loading && user) setFetching(false);
  }, [loading, user, canView, fetchRecords]);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.sponsors?.full_name ?? '').toLowerCase().includes(q) ||
      (r.sponsors?.email ?? '').toLowerCase().includes(q) ||
      (r.transaction_ref ?? '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.verification_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:    records.length,
    verified: records.filter(r => r.verification_status === 'current').length,
    pending:  records.filter(r => r.verification_status === 'pending_verification').length,
    former:   records.filter(r => r.verification_status === 'former').length,
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
              <h1 className="text-3xl font-black text-white tracking-tight">Supporters</h1>
              <p className="text-white/55 text-sm mt-1">People who have supported TCM</p>
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar permissions={permissions} isSuperAdmin={isSuperAdmin} />

        <main className="flex-1 overflow-y-auto bg-tcm-gray-soft">
          <div className="container-tcm py-10">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <StatCard label="Total Records"      value={stats.total}    icon={Heart}         color="bg-tcm-navy/8 text-tcm-navy"    />
              <StatCard label="Verified / Active"  value={stats.verified} icon={CheckCircle2}  color="bg-green-50 text-green-600"     />
              <StatCard label="Pending Verification" value={stats.pending} icon={Star}          color="bg-amber-50 text-amber-600"     />
              <StatCard label="Former"             value={stats.former}   icon={Users}         color="bg-gray-100 text-gray-500"      />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, transaction ref…"
                  className="input-field pl-10 py-2.5" />
              </div>
              <div className="relative flex-shrink-0">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="select-field pl-10 py-2.5 pr-8 min-w-[170px]">
                  <option value="">All Statuses</option>
                  <option value="current">Verified</option>
                  <option value="pending_verification">Pending</option>
                  <option value="former">Former</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
              <button type="button" onClick={fetchRecords} disabled={fetching}
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
                Showing <strong className="text-tcm-navy">{filtered.length}</strong> of <strong className="text-tcm-navy">{records.length}</strong> records
              </p>
              <button type="button"
                onClick={() => exportCsv(filtered.map(r => ({
                  Name:            r.sponsors?.full_name ?? '',
                  Email:           r.sponsors?.email ?? '',
                  Phone:           r.sponsors?.phone ?? '',
                  'Support Type':  TYPE_LABELS[r.support_type] ?? r.support_type,
                  Department:      deptLabel(r.department),
                  Project:         r.project ?? '',
                  Amount:          r.amount_sent || r.amount || '',
                  Frequency:       r.frequency ? (FREQ_LABELS[r.frequency] ?? r.frequency) : '',
                  'Payment Date':  fmtDate(r.payment_date),
                  'Payment Method': r.payment_methods?.name ?? '',
                  'Transaction Ref': r.transaction_ref ?? '',
                  Status:          r.verification_status,
                  Date:            fmtDate(r.created_at),
                })), 'tcm-supporters')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            {fetchErr && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm font-semibold">{fetchErr}</p>
              </div>
            )}

            {fetching && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-tcm-gold animate-spin" /></div>}

            {!fetching && filtered.length === 0 && !fetchErr && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Heart className="w-12 h-12 text-tcm-gray-mid mx-auto mb-4" />
                <p className="font-black text-tcm-navy mb-1">
                  {records.length === 0 ? 'No supporter records yet' : 'No results match your filters'}
                </p>
                <p className="text-tcm-gray-mid text-sm">
                  {records.length === 0 ? 'Supporters who register will appear here.' : 'Try adjusting your search or filter.'}
                </p>
              </div>
            )}

            {!fetching && filtered.length > 0 && (
              <div className="flex flex-col gap-3">
                {filtered.map(r => <SupporterRow key={r.id} record={r} />)}
              </div>
            )}

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
