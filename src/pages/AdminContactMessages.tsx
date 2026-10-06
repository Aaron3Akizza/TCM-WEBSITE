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
  MessageSquare, Search, RefreshCw, ChevronDown, ChevronUp,
  Mail, Phone, Calendar, Loader2, AlertTriangle, X,
  CheckCircle2, Download, Inbox, Tag,
} from 'lucide-react';

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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_CONFIG: Record<ContactStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  unread:    { label: 'New',      color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',   icon: Inbox        },
  read:      { label: 'Read',     color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Mail         },
  responded: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
};

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

const MessageRow: React.FC<{
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
    setSaving(false); setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  };

  const cfg = STATUS_CONFIG[status];

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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
          <cfg.icon className="w-3 h-3" />{cfg.label}
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
            <div className="space-y-1">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Subject</p>
              <p className="text-sm font-semibold text-tcm-navy">{msg.subject}</p>
            </div>
          </div>
          <div className="bg-tcm-gray-soft rounded-xl p-4">
            <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-2">Message</p>
            <p className="text-sm text-tcm-gray-dark leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-3">Update Status</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select value={status} onChange={e => setStatus(e.target.value as ContactStatus)} className="select-field">
                {(Object.keys(STATUS_CONFIG) as ContactStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <button type="button" onClick={save} disabled={saving} className="btn-primary py-3 justify-center">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : savedOk ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Status'}
              </button>
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
export const AdminContactMessages: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, permissions, loading, isSuperAdmin } = useAuth();

  const [messages,    setMessages]    = useState<ContactMessage[]>([]);
  const [fetching,    setFetching]    = useState(true);
  const [fetchErr,    setFetchErr]    = useState('');
  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState<ContactStatus | ''>('');

  const canView = isSuperAdmin ||
    hasPerm(permissions, 'perm_view_support') ||
    hasPerm(permissions, 'perm_manage_support') ||
    hasPerm(permissions, 'perm_full_admin');

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/sign-in'); return; }
    if (!profile) return;
    const isAdmin = isSuperAdmin || profile.role === 'admin';
    if (!isAdmin) { navigate('/profile'); return; }
    if (isAdmin && !canView) { navigate('/admin'); }
  }, [user, profile, loading, isSuperAdmin, canView, navigate]);

  const fetchMessages = useCallback(async () => {
    setFetching(true); setFetchErr('');
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setFetchErr('Could not load messages. ' + error.message);
    else setMessages((data ?? []) as ContactMessage[]);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!loading && user && canView) fetchMessages();
    else if (!loading && user) setFetching(false);
  }, [loading, user, canView, fetchMessages]);

  const handleUpdate = async (id: string, status: ContactStatus) => {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (!error) setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const filtered = messages.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      (m.phone ?? '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:    messages.length,
    unread:   messages.filter(m => m.status === 'unread').length,
    read:     messages.filter(m => m.status === 'read').length,
    resolved: messages.filter(m => m.status === 'responded').length,
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
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                Contact Messages
                {stats.unread > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500 text-white text-sm font-black">
                    {stats.unread} new
                  </span>
                )}
              </h1>
              <p className="text-white/55 text-sm mt-1">Messages submitted through the Contact Us page</p>
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar permissions={permissions} isSuperAdmin={isSuperAdmin} unreadMsgs={stats.unread} />

        <main className="flex-1 overflow-y-auto bg-tcm-gray-soft">
          <div className="container-tcm py-10">

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <StatCard label="Total"    value={stats.total}    icon={MessageSquare} color="bg-tcm-navy/8 text-tcm-navy"  />
              <StatCard label="New"      value={stats.unread}   icon={Inbox}         color="bg-blue-50 text-blue-500"     />
              <StatCard label="Read"     value={stats.read}     icon={Mail}          color="bg-amber-50 text-amber-500"   />
              <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2}  color="bg-green-50 text-green-500"   />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, subject…" className="input-field pl-10 py-2.5" />
              </div>
              <div className="relative flex-shrink-0">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ContactStatus | '')}
                  className="select-field pl-10 py-2.5 pr-8 min-w-[150px]">
                  <option value="">All Statuses</option>
                  <option value="unread">New</option>
                  <option value="read">Read</option>
                  <option value="responded">Resolved</option>
                </select>
              </div>
              <button type="button" onClick={fetchMessages} disabled={fetching}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy transition-colors flex-shrink-0">
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
                Showing <strong className="text-tcm-navy">{filtered.length}</strong> of <strong className="text-tcm-navy">{messages.length}</strong> messages
              </p>
              <button type="button"
                onClick={() => exportCsv(filtered.map(m => ({
                  Name: m.name, Email: m.email, Phone: m.phone ?? '',
                  Subject: m.subject, Message: m.message,
                  Status: STATUS_CONFIG[m.status]?.label ?? m.status,
                  Date: fmtDate(m.created_at),
                })), 'tcm-contact-messages')}
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
                <Inbox className="w-12 h-12 text-tcm-gray-mid mx-auto mb-4" />
                <p className="font-black text-tcm-navy mb-1">
                  {messages.length === 0 ? 'No contact messages yet' : 'No messages match your filters'}
                </p>
              </div>
            )}

            {!fetching && filtered.length > 0 && (
              <div className="flex flex-col gap-3">
                {filtered.map(m => <MessageRow key={m.id} msg={m} onUpdate={handleUpdate} />)}
              </div>
            )}

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
