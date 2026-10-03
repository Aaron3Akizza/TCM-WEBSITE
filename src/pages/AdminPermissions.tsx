import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar }         from '../components/layout/Navbar';
import { Footer }         from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth }        from '../hooks/useAuth';
import { supabase }       from '../lib/supabase';
import {
  type AdminPermissions as AdminPermsType,
  PERMISSION_LABELS,
  PERMISSION_GROUPS,
  hasPerm,
} from '../types/database';
import {
  Shield, Users, Search, Loader2, AlertTriangle,
  CheckCircle2, X, Save, RefreshCw, ChevronDown, ChevronUp,
  Mail, Phone, UserCheck, UserX, History, Edit3,
  Lock, Star,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
interface MemberRow {
  id:            string;
  full_name:     string;
  email:         string;
  username:      string | null;
  phone:         string | null;
  avatar_url:    string | null;
  role:          string;
  is_super_admin: boolean;
  created_at:    string;
  admin_permissions?: AdminPermsType | null;
}

interface AuditEntry {
  id:                  string;
  target_profile_id:   string;
  target_name:         string;
  granted_by_id:       string | null;
  granted_by_name:     string | null;
  action:              string;
  permission_key:      string | null;
  previous_value:      string | null;
  new_value:           string | null;
  notes:               string | null;
  changed_at:          string;
}

// ── Helpers ───────────────────────────────────────────────────
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const PERM_KEYS = [
  'perm_view_members','perm_edit_members','perm_manage_members','perm_export_members',
  'perm_view_sponsors','perm_verify_sponsors','perm_manage_sponsors','perm_export_sponsors',
  'perm_view_support','perm_manage_support',
  'perm_manage_departments','perm_manage_projects','perm_manage_merchandise',
  'perm_manage_media','perm_manage_content',
  'perm_view_admins','perm_manage_admins',
  'perm_full_admin',
] as const;
type PermKey = typeof PERM_KEYS[number];

function countPerms(p: AdminPermsType | null | undefined): number {
  if (!p) return 0;
  return PERM_KEYS.filter(k => p[k] === true).length;
}

function buildRoleBadge(member: MemberRow) {
  if (member.is_super_admin)
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-700 text-[11px] font-bold"><Star className="w-3 h-3" />Super Admin</span>;
  if (member.role === 'admin')
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tcm-gold/15 border border-tcm-gold/40 text-tcm-navy text-[11px] font-bold"><Shield className="w-3 h-3" />Admin</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-[11px] font-bold"><Users className="w-3 h-3" />Member</span>;
}

// ── Permission Toggle ─────────────────────────────────────────
const PermToggle: React.FC<{
  permKey:   PermKey;
  value:     boolean;
  disabled?: boolean;
  onChange:  (key: PermKey, val: boolean) => void;
}> = ({ permKey, value, disabled, onChange }) => {
  const isFullAdmin = permKey === 'perm_full_admin';
  const isManageAdmins = permKey === 'perm_manage_admins';
  return (
    <label className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl transition-colors cursor-pointer ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-tcm-gray-soft'
    } ${isFullAdmin ? 'bg-amber-50 border border-amber-200 rounded-xl' : ''}`}>
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-semibold ${isFullAdmin ? 'text-amber-800' : 'text-tcm-navy'}`}>
          {PERMISSION_LABELS[permKey as keyof typeof PERMISSION_LABELS]}
        </span>
        {isFullAdmin && (
          <p className="text-amber-600 text-xs mt-0.5">Grants all permissions automatically</p>
        )}
        {isManageAdmins && (
          <p className="text-tcm-gray-mid text-xs mt-0.5">Can grant/revoke permissions for others</p>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(permKey, !value)}
        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-tcm-gold ${
          value
            ? isFullAdmin ? 'bg-amber-500' : 'bg-green-500'
            : 'bg-gray-300'
        }`}
        aria-checked={value}
        role="switch"
        aria-label={PERMISSION_LABELS[permKey as keyof typeof PERMISSION_LABELS]}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
};

// ── Permission Editor Panel ───────────────────────────────────
const PermissionEditor: React.FC<{
  member:       MemberRow;
  currentPerms: AdminPermsType | null;
  isSuperAdmin: boolean;    // is the CURRENT LOGGED-IN user a super admin?
  onSave:       (memberId: string, changes: Partial<Record<PermKey, boolean>>, makeAdmin: boolean) => Promise<void>;
  onClose:      () => void;
}> = ({ member, currentPerms, isSuperAdmin, onSave, onClose }) => {
  // Draft state — start from current perms or all-false
  const [draft, setDraft] = useState<Record<PermKey, boolean>>(() => {
    const base = {} as Record<PermKey, boolean>;
    PERM_KEYS.forEach(k => { base[k] = currentPerms?.[k] ?? false; });
    return base;
  });
  const [makeAdmin, setMakeAdmin] = useState(member.role === 'admin' || member.is_super_admin);
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState('');

  // Sync draft whenever currentPerms changes (e.g. after a save + refetch)
  useEffect(() => {
    const base = {} as Record<PermKey, boolean>;
    PERM_KEYS.forEach(k => { base[k] = currentPerms?.[k] ?? false; });
    setDraft(base);
    setMakeAdmin(member.role === 'admin' || member.is_super_admin);
  }, [currentPerms, member.role, member.is_super_admin]);

  const handleChange = (key: PermKey, val: boolean) => {
    setDraft(prev => ({ ...prev, [key]: val }));
    // If any perm is turned on, auto-check makeAdmin
    if (val) setMakeAdmin(true);
  };

  const handleFullAdmin = (_key: PermKey, val: boolean) => {
    setDraft(prev => ({ ...prev, perm_full_admin: val }));
    if (val) setMakeAdmin(true);
  };

  const anyPermOn = PERM_KEYS.some(k => draft[k]);
  const permCount = PERM_KEYS.filter(k => draft[k]).length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      await onSave(member.id, draft, makeAdmin || anyPermOn);
      onClose();
    } catch (ex: any) {
      setErr(ex?.message || 'Failed to save permissions.');
      setSaving(false);
    }
  };

  const canSetFullAdmin   = isSuperAdmin;
  const canSetManageAdmins = isSuperAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-tcm-gold/15 flex items-center justify-center flex-shrink-0 ring-1 ring-tcm-gold/30">
              {member.avatar_url
                ? <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                : <span className="text-sm font-black text-tcm-gold">{member.full_name[0]?.toUpperCase()}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="font-black text-tcm-navy truncate">{member.full_name}</p>
              <p className="text-tcm-gray-mid text-xs truncate">{member.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors flex-shrink-0 ml-3">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Grant/revoke admin role toggle */}
          <div className={`rounded-2xl p-4 border ${makeAdmin || anyPermOn ? 'bg-tcm-gold/5 border-tcm-gold/30' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-tcm-navy text-sm">Admin Access</p>
                <p className="text-tcm-gray-mid text-xs mt-0.5">
                  Member must have admin role to access the admin dashboard.
                </p>
              </div>
              <button type="button"
                onClick={() => { setMakeAdmin(v => !v); if (anyPermOn) setMakeAdmin(true); }}
                className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${makeAdmin || anyPermOn ? 'bg-tcm-gold' : 'bg-gray-300'}`}
                aria-checked={makeAdmin || anyPermOn}
                role="switch"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${makeAdmin || anyPermOn ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Permission groups */}
          {PERMISSION_GROUPS.map(group => (
            <div key={group.label} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-tcm-gray-soft border-b border-gray-100">
                <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest">{group.label}</p>
              </div>
              <div className="p-2">
                {group.keys.map(k => {
                  const key = k as PermKey;
                  const isProtected = (key === 'perm_full_admin' && !canSetFullAdmin) ||
                                      (key === 'perm_manage_admins' && !canSetManageAdmins);
                  return (
                    <PermToggle
                      key={key}
                      permKey={key}
                      value={draft[key]}
                      disabled={isProtected}
                      onChange={key === 'perm_full_admin' ? handleFullAdmin : handleChange}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Super-admin note */}
          {!isSuperAdmin && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs leading-relaxed">
                <strong>Full Administration</strong> and <strong>Manage Administrators</strong> permissions
                can only be granted by a Super Administrator.
              </p>
            </div>
          )}

          {err && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm font-medium">{err}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-tcm-gray-soft flex-shrink-0">
          <p className="text-tcm-gray-mid text-xs">
            {permCount === 0 ? 'No permissions selected' : `${permCount} permission${permCount > 1 ? 's' : ''} selected`}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" form="perm-form" disabled={saving}
              onClick={submit}
              className="btn-primary px-6 py-2.5 text-sm">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save Permissions</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Member Row ────────────────────────────────────────────────
const MemberCard: React.FC<{
  member:       MemberRow;
  isSuperAdmin: boolean;
  onEdit:       (m: MemberRow) => void;
}> = ({ member, isSuperAdmin: _isSuperAdmin, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const perms = member.admin_permissions;
  const permCount = countPerms(perms);
  const hasAccess = member.role === 'admin' || member.is_super_admin;
  const initial = (member.full_name || 'M')[0].toUpperCase();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${expanded ? 'border-tcm-gold/40' : 'border-gray-100'}`}>
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
          <p className="font-black text-tcm-navy text-sm truncate">{member.full_name}</p>
          <p className="text-tcm-gray-mid text-xs truncate">
            {member.email}
            {member.username && ` · @${member.username}`}
          </p>
        </div>

        {/* Role badge */}
        <div className="hidden sm:block flex-shrink-0">{buildRoleBadge(member)}</div>

        {/* Perm count */}
        <div className="flex-shrink-0 text-center hidden md:block">
          {hasAccess ? (
            <p className="text-lg font-black text-tcm-navy">{permCount}</p>
          ) : (
            <p className="text-xs text-tcm-gray-mid">—</p>
          )}
          <p className="text-[10px] text-tcm-gray-mid">perms</p>
        </div>

        {/* Action button */}
        <button type="button" onClick={e => { e.stopPropagation(); onEdit(member); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
            hasAccess
              ? 'bg-tcm-gold/10 border border-tcm-gold/30 text-tcm-gold hover:bg-tcm-gold/20'
              : 'bg-tcm-gray-soft border border-gray-200 text-tcm-gray-dark hover:border-tcm-navy hover:text-tcm-navy'
          }`}>
          <Edit3 className="w-3 h-3" />
          {hasAccess ? 'Edit' : 'Grant Access'}
        </button>

        {/* Expand */}
        <div className="flex-shrink-0 text-tcm-gray-mid">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded: show permission list */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Contact</p>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-tcm-gold flex-shrink-0" />
                <a href={`mailto:${member.email}`} className="text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors break-all">{member.email}</a>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-tcm-gold flex-shrink-0" />
                  <span className="text-sm font-semibold text-tcm-navy">{member.phone}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest">Access</p>
              <p className="text-sm text-tcm-gray-dark">
                <span className="font-semibold text-tcm-navy">Role:</span>{' '}
                {member.is_super_admin ? 'Super Administrator' : member.role === 'admin' ? 'Administrator' : 'Member'}
              </p>
              <p className="text-sm text-tcm-gray-dark">
                <span className="font-semibold text-tcm-navy">Permissions:</span>{' '}
                {permCount === 0 ? 'None' : `${permCount} active`}
              </p>
            </div>
          </div>

          {/* Active permissions list */}
          {hasAccess && perms && permCount > 0 && (
            <div className="bg-tcm-gray-soft rounded-xl p-4">
              <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-3">Active Permissions</p>
              <div className="flex flex-wrap gap-2">
                {PERM_KEYS.filter(k => perms[k] === true).map(k => (
                  <span key={k} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    k === 'perm_full_admin'
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-green-50 border-green-200 text-green-700'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {PERMISSION_LABELS[k as keyof typeof PERMISSION_LABELS]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!hasAccess && (
            <div className="flex items-center gap-2 text-tcm-gray-mid text-sm">
              <UserX className="w-4 h-4" />
              <span>No admin access. Click <strong>Grant Access</strong> to assign permissions.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Audit Log Row ─────────────────────────────────────────────
const AuditRow: React.FC<{ entry: AuditEntry }> = ({ entry }) => {
  const actionColors: Record<string, string> = {
    granted:        'text-green-700 bg-green-50 border-green-200',
    revoked:        'text-red-700 bg-red-50 border-red-200',
    role_changed:   'text-blue-700 bg-blue-50 border-blue-200',
    super_admin_set:'text-purple-700 bg-purple-50 border-purple-200',
  };
  const colorClass = actionColors[entry.action] ?? 'text-gray-700 bg-gray-50 border-gray-200';

  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
        entry.action === 'granted' ? 'bg-green-500' :
        entry.action === 'revoked' ? 'bg-red-500' :
        entry.action === 'role_changed' ? 'bg-blue-500' : 'bg-purple-500'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-tcm-gray-dark leading-snug">
          <span className="font-bold text-tcm-navy">{entry.granted_by_name ?? 'System'}</span>
          {' '}
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold border ${colorClass}`}>
            {entry.action.replace('_', ' ')}
          </span>
          {' '}
          {entry.permission_key
            ? <><strong>{PERMISSION_LABELS[entry.permission_key as keyof typeof PERMISSION_LABELS] ?? entry.permission_key}</strong> {entry.new_value === 'true' ? '(on)' : '(off)'}</>
            : <strong>{entry.new_value}</strong>
          }
          {' '}to <span className="font-bold text-tcm-navy">{entry.target_name}</span>
        </p>
        {entry.notes && <p className="text-xs text-tcm-gray-mid mt-0.5">{entry.notes}</p>}
        <p className="text-[11px] text-tcm-gray-mid mt-0.5">{fmtDateTime(entry.changed_at)}</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  AdminPermissions page
// ═══════════════════════════════════════════════════════════════
export const AdminPermissions: React.FC = () => {
  const navigate  = useNavigate();
  const { user, profile, permissions, loading, isSuperAdmin } = useAuth();

  const [members,    setMembers]    = useState<MemberRow[]>([]);
  const [audit,      setAudit]      = useState<AuditEntry[]>([]);
  const [fetching,   setFetching]   = useState(true);
  const [fetchErr,   setFetchErr]   = useState('');
  const [search,     setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'member'>('all');
  const [showAudit,  setShowAudit]  = useState(false);
  const [editMember, setEditMember] = useState<MemberRow | null>(null);

  // ── Auth guard: must be super admin OR have perm_manage_admins ──
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/sign-in'); return; }
    if (!profile) return;
    const canManage = isSuperAdmin ||
      hasPerm(permissions, 'perm_manage_admins') ||
      hasPerm(permissions, 'perm_full_admin');
    if (!canManage) { navigate('/admin'); }
  }, [user, profile, permissions, loading, isSuperAdmin, navigate]);

  // ── Fetch all members + their permissions ──
  const fetchData = useCallback(async () => {
    setFetching(true); setFetchErr('');
    try {
      const [membersRes, permsRes] = await Promise.all([
        supabase.from('profiles').select('id,full_name,email,username,phone,avatar_url,role,is_super_admin,created_at').order('full_name'),
        supabase.from('admin_permissions').select('*'),
      ]);
      if (membersRes.error) throw new Error(membersRes.error.message);

      const permsMap = new Map<string, AdminPermsType>();
      (permsRes.data ?? []).forEach((p: AdminPermsType) => permsMap.set(p.profile_id, p));

      const rows: MemberRow[] = (membersRes.data ?? []).map((m: any) => ({
        ...m,
        admin_permissions: permsMap.get(m.id) ?? null,
      }));
      setMembers(rows);
    } catch (err: any) {
      setFetchErr(err?.message || 'Could not load members.');
    } finally {
      setFetching(false);
    }
  }, []);

  // ── Fetch audit log ──
  const fetchAudit = useCallback(async () => {
    const { data } = await supabase
      .from('admin_permission_audit')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(100);
    setAudit((data ?? []) as AuditEntry[]);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      fetchData();
      fetchAudit();
    }
  }, [loading, user, fetchData, fetchAudit]);

  // ── Save permissions ──
  const handleSave = async (
    memberId:  string,
    changes:   Partial<Record<PermKey, boolean>>,
    makeAdmin: boolean,
  ) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) throw new Error('Member not found.');

    const prevPerms = targetMember.admin_permissions as AdminPermsType | null;

    // 1. Update role via secure RPC (bypasses trigger safely)
    const targetRole = (makeAdmin || PERM_KEYS.some(k => changes[k])) ? 'admin' : 'member';
    const needsRoleChange =
      (targetRole === 'admin' && targetMember.role !== 'admin') ||
      (targetRole === 'member' && targetMember.role === 'admin' && !targetMember.is_super_admin);

    if (needsRoleChange) {
      const { data: roleResult, error: roleErr } = await supabase.rpc('set_member_role', {
        target_id: memberId,
        new_role:  targetRole,
      });
      if (roleErr) throw new Error('Role update failed: ' + roleErr.message);
      const result = roleResult as any;
      if (result?.error) throw new Error(result.error);
    }

    // 2. Upsert permissions via secure RPC
    const permsPayload: Record<string, boolean> = {};
    PERM_KEYS.forEach(k => { permsPayload[k] = changes[k] ?? false; });

    const { data: permResult, error: permErr } = await supabase.rpc('upsert_admin_permissions', {
      target_id: memberId,
      perms:     permsPayload,
    });
    if (permErr) throw new Error('Permission save failed: ' + permErr.message);
    const pResult = permResult as any;
    if (pResult?.error) throw new Error(pResult.error);

    // 3. Write audit entries via secure RPC
    const auditRows: any[] = [];

    if (needsRoleChange) {
      auditRows.push({
        target_profile_id: memberId,
        target_name:       targetMember.full_name,
        granted_by_id:     user!.id,
        granted_by_name:   profile!.full_name,
        action:            'role_changed',
        permission_key:    'role',
        previous_value:    targetMember.role,
        new_value:         targetRole,
        notes:             targetRole === 'admin' ? 'Admin access granted' : 'Admin access revoked',
      });
    }

    PERM_KEYS.forEach(k => {
      const prev = prevPerms?.[k] ?? false;
      const next = changes[k] ?? false;
      if (prev !== next) {
        auditRows.push({
          target_profile_id: memberId,
          target_name:       targetMember.full_name,
          granted_by_id:     user!.id,
          granted_by_name:   profile!.full_name,
          action:            next ? 'granted' : 'revoked',
          permission_key:    k,
          previous_value:    String(prev),
          new_value:         String(next),
        });
      }
    });

    if (auditRows.length > 0) {
      const { data: auditResult, error: auditErr } = await supabase.rpc('insert_permission_audit', {
        rows: auditRows,
      });
      if (auditErr) console.warn('[handleSave] audit log failed:', auditErr.message);
      const aResult = auditResult as any;
      if (aResult?.error) console.warn('[handleSave] audit log error:', aResult.error);
    }

    // 4. Send notification to the member so they see it on next sign-in
    const grantedPerms = PERM_KEYS.filter(k => changes[k] === true);
    const isNewAdmin   = needsRoleChange && targetRole === 'admin';
    const isRevoked    = needsRoleChange && targetRole === 'member';

    if (grantedPerms.length > 0 || isNewAdmin) {
      const permList = grantedPerms
        .map(k => PERMISSION_LABELS[k as keyof typeof PERMISSION_LABELS])
        .join(', ');

      await supabase.from('admin_notifications').insert([{
        profile_id:      memberId,
        type:            'access_granted',
        title:           'You have been granted admin access',
        body:            `${profile!.full_name} has given you administrator access to the TCM dashboard.${permList ? ` Your permissions: ${permList}.` : ''} Sign in and click the Admin button in the navigation bar to access your dashboard.`,
        granted_by_name: profile!.full_name,
        is_read:         false,
      }]);
    } else if (isRevoked) {
      await supabase.from('admin_notifications').insert([{
        profile_id:      memberId,
        type:            'access_revoked',
        title:           'Your admin access has been updated',
        body:            `${profile!.full_name} has updated your administrator access. Please contact them if you have questions.`,
        granted_by_name: profile!.full_name,
        is_read:         false,
      }]);
    }

    await fetchData();
    await fetchAudit();

    // Update editMember ref so reopening immediately shows correct state
    setEditMember(prev =>
      prev ? { ...prev, role: targetRole, admin_permissions: { ...prev.admin_permissions, ...changes } as any } : null
    );
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
      (filterRole === 'member' && m.role !== 'admin' && !m.is_super_admin);
    return matchSearch && matchRole;
  });

  // ── Stats ──
  const stats = {
    total:       members.length,
    admins:      members.filter(m => m.role === 'admin' || m.is_super_admin).length,
    superAdmins: members.filter(m => m.is_super_admin).length,
    noAccess:    members.filter(m => m.role === 'member' && !m.is_super_admin).length,
  };

  // ── Guards ──
  if (loading) return (
    <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow pt-[68px]"><LoadingSpinner /></main><Footer /></div>
  );
  if (!user) return null;

  const canManage = isSuperAdmin ||
    hasPerm(permissions, 'perm_manage_admins') ||
    hasPerm(permissions, 'perm_full_admin');
  if (!canManage) return null;

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
              <h1 className="text-3xl font-black text-white tracking-tight">Manage Permissions</h1>
              <p className="text-white/55 text-sm mt-1">
                Grant and revoke admin access for registered members
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-400/40 rounded-full px-3 py-1.5 text-xs font-bold text-purple-200">
                  <Star className="w-3.5 h-3.5" /> Super Administrator
                </span>
              )}
              <Link to="/admin" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/25 text-white/75 text-xs font-semibold hover:border-white hover:text-white transition-colors">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />
      </header>

      <main className="flex-grow bg-tcm-gray-soft">
        <div className="container-tcm py-10">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Members', value: stats.total,       color: 'bg-tcm-navy/8 text-tcm-navy',      icon: Users      },
              { label: 'Administrators', value: stats.admins,      color: 'bg-tcm-gold/10 text-tcm-gold',     icon: Shield     },
              { label: 'Super Admins',   value: stats.superAdmins, color: 'bg-purple-50 text-purple-600',     icon: Star       },
              { label: 'No Access',      value: stats.noAccess,    color: 'bg-gray-100 text-gray-500',        icon: UserX      },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-tcm-navy">{value}</p>
                  <p className="text-tcm-gray-mid text-xs font-semibold">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Setup notice for first super admin */}
          {stats.superAdmins === 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-8 flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 mb-1">No Super Administrator configured</p>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Go to <strong>Supabase → SQL Editor</strong> and run:
                </p>
                <pre className="mt-2 bg-amber-100 rounded-lg px-3 py-2 text-xs text-amber-900 overflow-x-auto">
{`UPDATE profiles SET role = 'admin', is_super_admin = true
WHERE email = 'your-email@example.com';

INSERT INTO admin_permissions (profile_id, perm_full_admin, granted_by)
SELECT id, true, id FROM profiles WHERE email = 'your-email@example.com'
ON CONFLICT (profile_id) DO UPDATE SET perm_full_admin = true;`}
                </pre>
              </div>
            </div>
          )}

          {/* Members section */}
          <section>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-tcm-navy">Registered Members</h2>
                <p className="text-tcm-gray-mid text-xs mt-0.5">{filtered.length} of {members.length} members shown</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { fetchData(); fetchAudit(); }} disabled={fetching}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button type="button" onClick={() => setShowAudit(v => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-tcm-gray-dark text-xs font-bold hover:border-tcm-navy hover:text-tcm-navy transition-colors">
                  <History className="w-3.5 h-3.5" /> {showAudit ? 'Hide' : 'Show'} Audit Log
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, username, phone…"
                  className="input-field pl-10 py-2.5" />
              </div>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                {(['all', 'admin', 'member'] as const).map(r => (
                  <button key={r} type="button" onClick={() => setFilterRole(r)}
                    className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors ${
                      filterRole === r ? 'bg-tcm-navy text-white' : 'text-tcm-gray-dark hover:bg-tcm-gray-soft'
                    }`}>{r === 'all' ? 'All' : r === 'admin' ? 'Admins' : 'Members'}</button>
                ))}
              </div>
              {(search || filterRole !== 'all') && (
                <button type="button" onClick={() => { setSearch(''); setFilterRole('all'); }}
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
                    Make sure migration 008 has been run in Supabase SQL Editor.
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {fetching && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-tcm-gold animate-spin" /></div>}

            {/* Empty */}
            {!fetching && filtered.length === 0 && !fetchErr && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Users className="w-12 h-12 text-tcm-gray-mid mx-auto mb-4" />
                <p className="font-black text-tcm-navy mb-1">No members found</p>
                <p className="text-tcm-gray-mid text-sm">Try adjusting your search or filter.</p>
              </div>
            )}

            {/* Member cards */}
            {!fetching && filtered.length > 0 && (
              <div className="flex flex-col gap-3">
                {filtered.map(m => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    isSuperAdmin={isSuperAdmin}
                    onEdit={setEditMember}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Audit Log */}
          {showAudit && (
            <section className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-tcm-navy">Permission Audit Log</h2>
                <button type="button" onClick={() => setShowAudit(false)}
                  className="text-tcm-gray-mid hover:text-tcm-navy transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {audit.length === 0 ? (
                  <p className="text-tcm-gray-mid text-sm text-center py-8">No permission changes recorded yet.</p>
                ) : (
                  <div>
                    {audit.map(entry => <AuditRow key={entry.id} entry={entry} />)}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* How it works */}
          <section className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-tcm-navy mb-4">How Permissions Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: UserCheck, color: 'bg-purple-50 text-purple-600', title: 'Super Administrator', desc: 'Set via Supabase SQL only. Can manage all permissions, including granting other super admins. Cannot be set from the dashboard.' },
                { icon: Shield,    color: 'bg-tcm-gold/10 text-tcm-gold',  title: 'Administrator',     desc: 'A registered member with admin role and at least one permission. Each permission is independent — grant only what is needed.' },
                { icon: Lock,      color: 'bg-gray-100 text-gray-500',     title: 'Security',          desc: 'Role changes are enforced at the database level. No one can promote themselves — not even via direct API calls.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-tcm-navy text-sm">{title}</p>
                    <p className="text-xs text-tcm-gray-mid leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />

      {/* Permission editor modal */}
      {editMember && (
        <PermissionEditor
          member={editMember}
          currentPerms={
            // Always use the freshest data from the members array, not the
            // stale snapshot in editMember (which doesn't update after save)
            members.find(m => m.id === editMember.id)?.admin_permissions ?? null
          }
          isSuperAdmin={isSuperAdmin}
          onSave={handleSave}
          onClose={() => setEditMember(null)}
        />
      )}
    </div>
  );
};
