import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar }        from '../components/layout/Navbar';
import { Footer }        from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth }       from '../hooks/useAuth';
import { supabase }      from '../lib/supabase';
import {
  Shield, Users, MessageSquare, ShoppingBag, Heart,
  RefreshCw, ChevronDown, ChevronUp, Search, Filter,
  Phone, Mail, Calendar, Tag, Package, Loader2,
  CheckCircle2, AlertTriangle, Clock, X, Globe, HelpCircle, Star,
  Inbox,
} from 'lucide-react';
import { DEPARTMENTS, MERCH_ITEMS } from './Support';

import { hasPerm } from '../types/database';

// ── Types ─────────────────────────────────────────────────────
type SupportStatus = 'new' | 'contacted' | 'processing' | 'completed';
type SupportType   = 'ministry_department' | 'merchandise' | 'general' | 'other';

interface SupportRequest {
  id:             string;
  name:           string;
  email:          string;
  phone:          string | null;
  support_type:   SupportType;
  department:     string | null;
  merch_item:     string | null;
  merch_size:     string | null;
  merch_quantity: number | null;
  amount:         string | null;
  other_details:  string | null;
  message:        string | null;
  status:         SupportStatus;
  admin_notes:    string | null;
  created_at:     string;
  updated_at:     string;
}

// ── Helpers ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<SupportStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new:        { label: 'New',        color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',   icon: Clock        },
  contacted:  { label: 'Contacted',  color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200', icon: Phone        },
  processing: { label: 'Processing', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: Loader2    },
  completed:  { label: 'Completed',  color: 'text-green-600',  bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
};

const TYPE_CONFIG: Record<SupportType, { label: string; icon: React.ElementType; color: string }> = {
  ministry_department: { label: 'Ministry Dept',  icon: Heart,       color: 'text-tcm-orange' },
  merchandise:         { label: 'Merchandise',     icon: ShoppingBag, color: 'text-tcm-navy'   },
  general:             { label: 'General Support', icon: Globe,       color: 'text-tcm-gold'   },
  other:               { label: 'Other',           icon: HelpCircle,  color: 'text-tcm-gray-mid'},
};

function deptLabel(value: string | null): string {
  if (!value) return '—';
  return DEPARTMENTS.find(d => d.value === value)?.label ?? value;
}
function merchLabel(value: string | null): string {
  if (!value) return '—';
  return MERCH_ITEMS.find(m => m.value === value)?.label ?? value;
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── StatusBadge ───────────────────────────────────────────────
const StatusBadge: React.FC<{ status: SupportStatus }> = ({ status }) => {
  const { label, color, bg, icon: Icon } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${bg} ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

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

// ── RequestRow ────────────────────────────────────────────────
const RequestRow: React.FC<{
  req:        SupportRequest;
  onUpdate:   (id: string, status: SupportStatus, notes: string) => Promise<void>;
}> = ({ req, onUpdate }) => {
  const [expanded,   setExpanded]   = useState(false);
  const [status,     setStatus]     = useState<SupportStatus>(req.status);
  const [notes,      setNotes]      = useState(req.admin_notes ?? '');
  const [saving,     setSaving]     = useState(false);
  const [savedOk,    setSavedOk]    = useState(false);

  const typeConf = TYPE_CONFIG[req.support_type];
  const TypeIcon = typeConf.icon;

  const save = async () => {
    setSaving(true);
    await onUpdate(req.id, status, notes);
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${expanded ? 'border-tcm-gold/40' : 'border-gray-100'}`}>
      {/* ── Summary row ── */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-tcm-gray-soft/50 transition-colors"
      >
        {/* Type icon */}
        <div className="w-10 h-10 rounded-xl bg-tcm-gray-soft border border-gray-100 flex items-center justify-center flex-shrink-0">
          <TypeIcon className={`w-4 h-4 ${typeConf.color}`} />
        </div>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-tcm-navy text-sm truncate">{req.name}</p>
          <p className="text-tcm-gray-mid text-xs truncate">{typeConf.label}
            {req.support_type === 'ministry_department' && req.department && ` · ${deptLabel(req.department)}`}
            {req.support_type === 'merchandise'         && req.merch_item  && ` · ${merchLabel(req.merch_item)}`}
          </p>
        </div>

        {/* Date */}
        <p className="text-tcm-gray-mid text-xs hidden sm:block flex-shrink-0">{fmtDate(req.created_at)}</p>

        {/* Status badge */}
        <div className="flex-shrink-0">
          <StatusBadge status={status} />
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0 text-tcm-gray-mid">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Contact info */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Contact</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                <a href={`mailto:${req.email}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors break-all">
                  {req.email}
                </a>
              </div>
              {req.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                  <a href={`tel:${req.phone}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors">
                    {req.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                <p className="text-sm text-tcm-gray-dark">{fmtDateTime(req.created_at)}</p>
              </div>
            </div>

            {/* Support details */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Support Details</p>
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-tcm-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-tcm-gray-mid">Type</p>
                  <p className="text-sm font-semibold text-tcm-navy">{typeConf.label}</p>
                </div>
              </div>

              {req.support_type === 'ministry_department' && req.department && (
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-tcm-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-tcm-gray-mid">Department</p>
                    <p className="text-sm font-semibold text-tcm-navy">{deptLabel(req.department)}</p>
                  </div>
                </div>
              )}

              {req.support_type === 'merchandise' && (
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-tcm-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-tcm-gray-mid">Merchandise</p>
                    <p className="text-sm font-semibold text-tcm-navy">
                      {merchLabel(req.merch_item)}
                      {req.merch_size     && ` · Size ${req.merch_size}`}
                      {req.merch_quantity && ` · Qty ${req.merch_quantity}`}
                    </p>
                  </div>
                </div>
              )}

              {req.amount && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-tcm-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-tcm-gray-mid">Amount</p>
                    <p className="text-sm font-semibold text-tcm-navy">{req.amount}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message / other details */}
          {(req.message || req.other_details) && (
            <div className="bg-tcm-gray-soft rounded-xl p-4 space-y-2">
              {req.other_details && (
                <div>
                  <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-1">Details</p>
                  <p className="text-sm text-tcm-gray-dark leading-relaxed">{req.other_details}</p>
                </div>
              )}
              {req.message && (
                <div>
                  <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-1">Message</p>
                  <p className="text-sm text-tcm-gray-dark leading-relaxed">{req.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Admin controls */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Admin Actions</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-tcm-navy">Update Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as SupportStatus)}
                  className="select-field"
                >
                  {(Object.keys(STATUS_CONFIG) as SupportStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>

              {/* Save button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="btn-primary w-full py-3 justify-center"
                >
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : savedOk
                    ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                    : 'Save Changes'
                  }
                </button>
              </div>
            </div>

            {/* Admin notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-tcm-navy">Admin Notes <span className="font-normal text-tcm-gray-mid text-xs">(internal only)</span></label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add private notes about this request…"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Contact Message types ─────────────────────────────────────
type ContactStatus = 'unread' | 'read' | 'responded';

interface ContactMessage {
  id:         string;
  name:       string;
  email:      string;
  phone:      string | null;
  subject:    string;
  message:    string;
  status:     ContactStatus;
  created_at: string;
}

const CONTACT_STATUS_CONFIG: Record<ContactStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  unread:    { label: 'New',      color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',   icon: Inbox        },
  read:      { label: 'Read',     color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Mail         },
  responded: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
};

const ContactStatusBadge: React.FC<{ status: ContactStatus }> = ({ status }) => {
  const { label, color, bg, icon: Icon } = CONTACT_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${bg} ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const ContactMessageRow: React.FC<{
  msg:      ContactMessage;
  onUpdate: (id: string, status: ContactStatus) => Promise<void>;
}> = ({ msg, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [status,   setStatus]   = useState<ContactStatus>(msg.status);
  const [saving,   setSaving]   = useState(false);
  const [savedOk,  setSavedOk]  = useState(false);

  const handleExpand = async () => {
    setExpanded(v => !v);
    if (!expanded && msg.status === 'unread') {
      setStatus('read');
      await onUpdate(msg.id, 'read');
    }
  };

  const save = async () => {
    setSaving(true);
    await onUpdate(msg.id, status);
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      expanded ? 'border-tcm-gold/40' : msg.status === 'unread' ? 'border-blue-200' : 'border-gray-100'
    }`}>
      <button type="button" onClick={handleExpand}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-tcm-gray-soft/50 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-tcm-gray-soft border border-gray-100 flex items-center justify-center flex-shrink-0">
          <Mail className={`w-4 h-4 ${msg.status === 'unread' ? 'text-blue-500' : 'text-tcm-gray-mid'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${msg.status === 'unread' ? 'font-black text-tcm-navy' : 'font-semibold text-tcm-gray-dark'}`}>
            {msg.name}
            {msg.status === 'unread' && <span className="ml-2 inline-flex w-2 h-2 rounded-full bg-blue-500 align-middle" />}
          </p>
          <p className="text-tcm-gray-mid text-xs truncate">{msg.subject}</p>
        </div>
        <p className="text-tcm-gray-mid text-xs hidden sm:block flex-shrink-0">{fmtDate(msg.created_at)}</p>
        <div className="flex-shrink-0"><ContactStatusBadge status={status} /></div>
        <div className="flex-shrink-0 text-tcm-gray-mid">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Contact</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                <a href={`mailto:${msg.email}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors break-all">{msg.email}</a>
              </div>
              {msg.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                  <a href={`tel:${msg.phone}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors">{msg.phone}</a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                <p className="text-sm text-tcm-gray-dark">{fmtDateTime(msg.created_at)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Subject</p>
              <p className="text-sm font-semibold text-tcm-navy">{msg.subject}</p>
            </div>
          </div>

          <div className="bg-tcm-gray-soft rounded-xl p-4">
            <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-2">Message</p>
            <p className="text-sm text-tcm-gray-dark leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-4">Update Status</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-tcm-navy">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as ContactStatus)} className="select-field">
                  {(Object.keys(CONTACT_STATUS_CONFIG) as ContactStatus[]).map(s => (
                    <option key={s} value={s}>{CONTACT_STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button type="button" onClick={save} disabled={saving} className="btn-primary w-full py-3 justify-center">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : savedOk ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Status'}
                </button>
              </div>
            </div>
            <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
              className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-tcm-orange hover:underline transition-colors">
              <Mail className="w-3.5 h-3.5" /> Reply via email
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Admin page
// ═══════════════════════════════════════════════════════════════
export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, permissions, loading, isSuperAdmin } = useAuth();

  const [requests,    setRequests]    = useState<SupportRequest[]>([]);
  const [fetching,    setFetching]    = useState(true);
  const [fetchErr,    setFetchErr]    = useState('');
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState<SupportType | ''>('');
  const [filterStatus,setFilterStatus]= useState<SupportStatus | ''>('');

  // ── Contact messages state ──
  const [messages,       setMessages]       = useState<ContactMessage[]>([]);
  const [fetchingMsgs,   setFetchingMsgs]   = useState(false);
  const [fetchMsgsErr,   setFetchMsgsErr]   = useState('');
  const [msgSearch,      setMsgSearch]      = useState('');
  const [msgFilterStatus,setMsgFilterStatus]= useState<ContactStatus | ''>('');

  // ── Auth + permission guard ──
  // Must be admin role AND have at least one permission (or be super admin)
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/sign-in'); return; }
    if (!profile) return;
    const isAdmin = isSuperAdmin || profile.role === 'admin';
    if (profile && !isAdmin) { navigate('/profile'); }
  }, [user, profile, loading, isSuperAdmin, navigate]);

  // ── Can view support requests? ──
  const canViewSupport = isSuperAdmin ||
    hasPerm(permissions, 'perm_view_support') ||
    hasPerm(permissions, 'perm_manage_support') ||
    hasPerm(permissions, 'perm_full_admin');

  // ── Fetch support requests ──
  const fetchRequests = useCallback(async () => {
    if (!canViewSupport) return;
    setFetching(true);
    setFetchErr('');
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setFetchErr('Could not load support requests. Make sure your account has admin role.');
    } else {
      setRequests((data ?? []) as SupportRequest[]);
    }
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!loading && user && canViewSupport) fetchRequests();
  }, [loading, user, canViewSupport, fetchRequests]);

  // ── Update a support request ──
  const handleUpdate = async (id: string, status: SupportStatus, notes: string) => {
    const { error } = await supabase
      .from('support_requests')
      .update({ status, admin_notes: notes || null })
      .eq('id', id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, admin_notes: notes || null } : r));
    }
  };

  // ── Fetch contact messages ──
  const fetchMessages = useCallback(async () => {
    setFetchingMsgs(true); setFetchMsgsErr('');
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setFetchMsgsErr('Could not load contact messages. Run migration 010 in Supabase SQL Editor.');
    } else {
      setMessages((data ?? []) as ContactMessage[]);
    }
    setFetchingMsgs(false);
  }, []);

  useEffect(() => {
    if (!loading && user && isAdminUser) fetchMessages();
  }, [loading, user, fetchMessages]); // eslint-disable-line

  // ── Update a contact message status ──
  const handleContactUpdate = async (id: string, status: ContactStatus) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    }
  };

  // ── Filtered support requests ──
  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.name.toLowerCase().includes(q)  ||
      r.email.toLowerCase().includes(q) ||
      (r.phone ?? '').toLowerCase().includes(q);
    const matchType   = !filterType   || r.support_type === filterType;
    const matchStatus = !filterStatus || r.status       === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // ── Filtered contact messages ──
  const filteredMsgs = messages.filter(m => {
    const q = msgSearch.toLowerCase();
    const matchSearch = !q ||
      m.name.toLowerCase().includes(q)    ||
      m.email.toLowerCase().includes(q)   ||
      m.subject.toLowerCase().includes(q) ||
      (m.phone ?? '').toLowerCase().includes(q);
    const matchStatus = !msgFilterStatus || m.status === msgFilterStatus;
    return matchSearch && matchStatus;
  });

  // ── Stats ──
  const stats = {
    total:      requests.length,
    new:        requests.filter(r => r.status === 'new').length,
    processing: requests.filter(r => r.status === 'processing' || r.status === 'contacted').length,
    completed:  requests.filter(r => r.status === 'completed').length,
  };

  const contactStats = {
    total:    messages.length,
    unread:   messages.filter(m => m.status === 'unread').length,
    read:     messages.filter(m => m.status === 'read').length,
    resolved: messages.filter(m => m.status === 'responded').length,
  };

  // ── Guards ──
  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar /><main className="flex-grow pt-[68px]"><LoadingSpinner /></main><Footer />
    </div>
  );

  const isAdminUser = isSuperAdmin || profile?.role === 'admin';
  if (!user || (profile && !isAdminUser)) return null;

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
              <h1 className="text-3xl font-black text-white tracking-tight">TCM Administration</h1>
              <p className="text-white/55 text-sm mt-1">
                Logged in as <span className="text-tcm-gold font-semibold">{profile?.full_name || user.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-400/40 rounded-full px-3 py-1.5 text-xs font-bold text-purple-200">
                  <Star className="w-3.5 h-3.5" /> Super Administrator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-tcm-gold/15 border border-tcm-gold/30 rounded-full px-3 py-1.5 text-xs font-bold text-tcm-gold">
                  <Shield className="w-3.5 h-3.5" /> Administrator
                </span>
              )}
              <Link to="/profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/25 text-white/75 text-xs font-semibold hover:border-white hover:text-white transition-colors">
                My Profile
              </Link>
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />
      </header>

      <main className="flex-grow bg-tcm-gray-soft">
        <div className="container-tcm py-10">

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Requests"  value={stats.total}      icon={MessageSquare} color="bg-tcm-navy/8 text-tcm-navy" />
            <StatCard label="New"             value={stats.new}        icon={Clock}         color="bg-blue-50 text-blue-500"     />
            <StatCard label="In Progress"     value={stats.processing} icon={Loader2}       color="bg-amber-50 text-amber-500"   />
            <StatCard label="Completed"       value={stats.completed}  icon={CheckCircle2}  color="bg-green-50 text-green-500"   />
          </div>

          {/* ── Support Requests section ── */}
          <section>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-tcm-navy">Support Requests</h2>
                <p className="text-tcm-gray-mid text-xs mt-0.5">
                  {filtered.length} of {requests.length} requests shown
                </p>
              </div>
              <button
                type="button"
                onClick={fetchRequests}
                disabled={fetching}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, phone…"
                  className="input-field pl-10 py-2.5"
                />
              </div>
              {/* Type filter */}
              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as SupportType | '')}
                  className="select-field pl-10 py-2.5 pr-8 min-w-[160px]"
                >
                  <option value="">All Types</option>
                  <option value="ministry_department">Ministry Dept</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="general">General</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {/* Status filter */}
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as SupportStatus | '')}
                  className="select-field pl-10 py-2.5 pr-8 min-w-[140px]"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {/* Clear filters */}
              {(search || filterType || filterStatus) && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setFilterType(''); setFilterStatus(''); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors flex-shrink-0"
                >
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
                    Make sure your profile role is set to <strong>admin</strong> in Supabase and that migration 005 has been run.
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {fetching && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-tcm-gold animate-spin" />
              </div>
            )}

            {/* Empty state */}
            {!fetching && !fetchErr && filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <MessageSquare className="w-12 h-12 text-tcm-gray-mid mx-auto mb-4" />
                <p className="font-black text-tcm-navy mb-1">
                  {requests.length === 0 ? 'No support requests yet' : 'No results match your filters'}
                </p>
                <p className="text-tcm-gray-mid text-sm">
                  {requests.length === 0
                    ? 'When someone submits the support form, it will appear here.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
              </div>
            )}

            {/* Request list */}
            {!fetching && filtered.length > 0 && (
              <div className="flex flex-col gap-3">
                {filtered.map(req => (
                  <RequestRow key={req.id} req={req} onUpdate={handleUpdate} />
                ))}
              </div>
            )}
          </section>

          {/* ── Members quick link ── */}
          <section className="mt-10">
            <h2 className="text-xl font-black text-tcm-navy mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
                className="card p-5 flex items-center gap-4 no-underline">
                <div className="w-10 h-10 rounded-xl bg-tcm-navy/8 border border-tcm-navy/15 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-tcm-navy" />
                </div>
                <div>
                  <p className="font-black text-tcm-navy text-sm">Supabase Dashboard</p>
                  <p className="text-tcm-gray-mid text-xs">Manage users, data, storage</p>
                </div>
              </a>
              {(isSuperAdmin || hasPerm(permissions, 'perm_view_sponsors') || hasPerm(permissions, 'perm_manage_sponsors') || hasPerm(permissions, 'perm_full_admin')) && (
                <Link to="/admin/sponsors" className="card p-5 flex items-center gap-4 no-underline">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-black text-tcm-navy text-sm">Sponsor Records</p>
                    <p className="text-tcm-gray-mid text-xs">Current &amp; former sponsors</p>
                  </div>
                </Link>
              )}
              {(isSuperAdmin || hasPerm(permissions, 'perm_view_members') || hasPerm(permissions, 'perm_manage_members') || hasPerm(permissions, 'perm_full_admin')) && (
                <Link to="/membership" className="card p-5 flex items-center gap-4 no-underline">
                  <div className="w-10 h-10 rounded-xl bg-tcm-gold/10 border border-tcm-gold/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-tcm-gold" />
                  </div>
                  <div>
                    <p className="font-black text-tcm-navy text-sm">Membership Page</p>
                    <p className="text-tcm-gray-mid text-xs">View registration form</p>
                  </div>
                </Link>
              )}
              <Link to="/support" className="card p-5 flex items-center gap-4 no-underline">
                <div className="w-10 h-10 rounded-xl bg-tcm-orange/10 border border-tcm-orange/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-tcm-orange" />
                </div>
                <div>
                  <p className="font-black text-tcm-navy text-sm">Support Page</p>
                  <p className="text-tcm-gray-mid text-xs">View public support form</p>
                </div>
              </Link>
              {(isSuperAdmin || hasPerm(permissions, 'perm_manage_admins') || hasPerm(permissions, 'perm_full_admin')) && (
                <Link to="/admin/permissions" className="card p-5 flex items-center gap-4 no-underline">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-black text-tcm-navy text-sm">Manage Permissions</p>
                    <p className="text-tcm-gray-mid text-xs">Assign admin access to members</p>
                  </div>
                </Link>
              )}
            </div>
          </section>

          {/* ── No-permission notice ── */}
          {!canViewSupport && !isSuperAdmin && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <Shield className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-black text-amber-800 mb-1">Limited Access</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                Your admin account has not been granted permission to view support requests.
                Contact a Super Administrator to have permissions assigned to your account.
              </p>
            </div>
          )}

          {/* ── Contact Messages section ── */}
          <section className="mt-12">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-tcm-navy flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-tcm-gold" />
                  Contact Messages
                  {contactStats.unread > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-black">
                      {contactStats.unread} new
                    </span>
                  )}
                </h2>
                <p className="text-tcm-gray-mid text-xs mt-0.5">
                  Messages submitted through the Contact Us page
                </p>
              </div>
              <button type="button" onClick={fetchMessages} disabled={fetchingMsgs}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingMsgs ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Contact message stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Messages" value={contactStats.total}    icon={MessageSquare} color="bg-tcm-navy/8 text-tcm-navy"  />
              <StatCard label="New"            value={contactStats.unread}   icon={Inbox}         color="bg-blue-50 text-blue-500"     />
              <StatCard label="Read"           value={contactStats.read}     icon={Mail}          color="bg-amber-50 text-amber-500"   />
              <StatCard label="Resolved"       value={contactStats.resolved} icon={CheckCircle2}  color="bg-green-50 text-green-500"   />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <input type="text" value={msgSearch} onChange={e => setMsgSearch(e.target.value)}
                  placeholder="Search by name, email, subject…"
                  className="input-field pl-10 py-2.5" />
              </div>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <select value={msgFilterStatus} onChange={e => setMsgFilterStatus(e.target.value as ContactStatus | '')}
                  className="select-field pl-10 py-2.5 pr-8 min-w-[150px]">
                  <option value="">All Statuses</option>
                  <option value="unread">New</option>
                  <option value="read">Read</option>
                  <option value="responded">Resolved</option>
                </select>
              </div>
              {(msgSearch || msgFilterStatus) && (
                <button type="button" onClick={() => { setMsgSearch(''); setMsgFilterStatus(''); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Error */}
            {fetchMsgsErr && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-600 text-sm font-semibold">{fetchMsgsErr}</p>
                  <p className="text-red-500/80 text-xs mt-1">
                    Run migration 010 in <strong>Supabase → SQL Editor</strong> to enable admin access to contact messages.
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {fetchingMsgs && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-tcm-gold animate-spin" />
              </div>
            )}

            {/* Empty */}
            {!fetchingMsgs && !fetchMsgsErr && filteredMsgs.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Inbox className="w-12 h-12 text-tcm-gray-mid mx-auto mb-4" />
                <p className="font-black text-tcm-navy mb-1">
                  {messages.length === 0 ? 'No contact messages yet' : 'No messages match your filters'}
                </p>
                <p className="text-tcm-gray-mid text-sm">
                  {messages.length === 0
                    ? 'Messages submitted through the Contact Us page will appear here.'
                    : 'Try adjusting your search or filter.'}
                </p>
              </div>
            )}

            {/* Message list */}
            {!fetchingMsgs && filteredMsgs.length > 0 && (
              <div className="flex flex-col gap-3">
                {filteredMsgs.map(msg => (
                  <ContactMessageRow key={msg.id} msg={msg} onUpdate={handleContactUpdate} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};
