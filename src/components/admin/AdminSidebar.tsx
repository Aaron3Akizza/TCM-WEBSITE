import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Star, Heart, MessageSquare,
  Shield, ChevronLeft, ChevronRight, Menu, Gift,
} from 'lucide-react';
import type { AdminPermissions } from '../../types/database';
import { hasPerm } from '../../types/database';

interface AdminSidebarProps {
  permissions:   AdminPermissions | null;
  isSuperAdmin:  boolean;
  unreadMsgs?:   number;
}

interface NavItem {
  label:     string;
  path:      string;
  icon:      React.ElementType;
  badge?:    number;
  always?:   boolean;  // show regardless of permissions
  check?:    (p: AdminPermissions | null, s: boolean) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label:  'Dashboard',
    path:   '/admin',
    icon:   LayoutDashboard,
    always: true,
  },
  {
    label: 'Members',
    path:  '/admin/members',
    icon:  Users,
    check: (p, s) => s || hasPerm(p, 'perm_view_members') || hasPerm(p, 'perm_edit_members') || hasPerm(p, 'perm_manage_members') || hasPerm(p, 'perm_full_admin'),
  },
  {
    label: 'Supporters',
    path:  '/admin/supporters',
    icon:  Heart,
    check: (p, s) => s || hasPerm(p, 'perm_view_sponsors') || hasPerm(p, 'perm_manage_sponsors') || hasPerm(p, 'perm_full_admin'),
  },
  {
    label: 'Sponsor Records',
    path:  '/admin/sponsors',
    icon:  Star,
    check: (p, s) => s || hasPerm(p, 'perm_view_sponsors') || hasPerm(p, 'perm_manage_sponsors') || hasPerm(p, 'perm_full_admin'),
  },
  {
    label: 'Charity Programs',
    path:  '/admin/charity',
    icon:  Gift,
    check: (p, s) => s || hasPerm(p, 'perm_manage_departments') || hasPerm(p, 'perm_full_admin'),
  },
  {
    label: 'Contact Messages',
    path:  '/admin/contact-messages',
    icon:  MessageSquare,
    check: (p, s) => s || hasPerm(p, 'perm_view_support') || hasPerm(p, 'perm_manage_support') || hasPerm(p, 'perm_full_admin'),
  },
  {
    label: 'Permissions',
    path:  '/admin/permissions',
    icon:  Shield,
    check: (_p, s) => s,  // super admin only
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  permissions, isSuperAdmin, unreadMsgs = 0,
}) => {
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item =>
    item.always || item.check?.(permissions, isSuperAdmin)
  );

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const Icon    = item.icon;
    const active  = isActive(item.path);
    const badge   = item.path === '/admin/contact-messages' ? unreadMsgs : (item.badge ?? 0);

    return (
      <Link
        to={item.path}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? item.label : undefined}
        className={[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative group',
          active
            ? 'bg-tcm-gold/15 text-tcm-gold border border-tcm-gold/30'
            : 'text-white/65 hover:bg-white/8 hover:text-white',
        ].join(' ')}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-tcm-gold' : ''}`} />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {badge > 0 && (
          <span className="absolute top-1.5 right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-black">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
        {/* Tooltip when collapsed */}
        {collapsed && (
          <span className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-tcm-navy text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-white/10">
            {item.label}
            {badge > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-[10px] font-black">{badge}</span>}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(v => !v)}
        className="lg:hidden fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-tcm-gold flex items-center justify-center shadow-gold"
        aria-label="Toggle admin menu"
      >
        <Menu className="w-5 h-5 text-tcm-navy" />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={[
        'flex-shrink-0 flex flex-col bg-navy-gradient border-r border-white/10 transition-all duration-300',
        'fixed lg:sticky top-[68px] h-[calc(100vh-68px)] z-40 lg:z-auto',
        // Mobile: slide in/out
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        // Desktop: collapse/expand
        collapsed ? 'w-[60px]' : 'w-[220px]',
      ].join(' ')}>

        {/* Collapse toggle — desktop only */}
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="hidden lg:flex items-center justify-end px-3 py-3 border-b border-white/10 text-white/40 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />
          }
        </button>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleItems.map(item => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* Bottom label */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-white/25 text-[10px] uppercase tracking-widest font-bold">TCM Admin</p>
          </div>
        )}
      </aside>
    </>
  );
};
