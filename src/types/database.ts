// ── Core role types ──────────────────────────────────────────
export type MemberRole     = 'member' | 'leader' | 'admin';

// ── Admin Permissions ────────────────────────────────────────
// Mirrors the admin_permissions table columns exactly.
// Every boolean flag is false by default — least-privilege.
export interface AdminPermissions {
  id:                     string;
  profile_id:             string;

  // Member management
  perm_view_members:      boolean;
  perm_edit_members:      boolean;
  perm_manage_members:    boolean;
  perm_export_members:    boolean;

  // Sponsorship
  perm_view_sponsors:     boolean;
  perm_verify_sponsors:   boolean;
  perm_manage_sponsors:   boolean;
  perm_export_sponsors:   boolean;

  // Support requests
  perm_view_support:      boolean;
  perm_manage_support:    boolean;

  // Departments / projects / merchandise
  perm_manage_departments: boolean;
  perm_manage_projects:    boolean;
  perm_manage_merchandise: boolean;

  // Content / media
  perm_manage_media:      boolean;
  perm_manage_content:    boolean;

  // Administration
  perm_view_admins:       boolean;
  perm_manage_admins:     boolean;

  // Full admin (grants all implicitly)
  perm_full_admin:        boolean;

  granted_by:             string | null;
  created_at:             string;
  updated_at:             string;
}

// Helper: checks a single permission, treating full_admin as a wildcard
export function hasPerm(
  perms: AdminPermissions | null,
  key: keyof AdminPermissions
): boolean {
  if (!perms) return false;
  if (perms.perm_full_admin) return true;
  return perms[key] === true;
}

// Default empty permissions (for type safety before load)
export const EMPTY_PERMISSIONS: AdminPermissions = {
  id: '', profile_id: '',
  perm_view_members: false, perm_edit_members: false,
  perm_manage_members: false, perm_export_members: false,
  perm_view_sponsors: false, perm_verify_sponsors: false,
  perm_manage_sponsors: false, perm_export_sponsors: false,
  perm_view_support: false, perm_manage_support: false,
  perm_manage_departments: false, perm_manage_projects: false,
  perm_manage_merchandise: false,
  perm_manage_media: false, perm_manage_content: false,
  perm_view_admins: false, perm_manage_admins: false,
  perm_full_admin: false,
  granted_by: null, created_at: '', updated_at: '',
};

// Human-readable labels for each permission key
export const PERMISSION_LABELS: Record<keyof AdminPermissions, string> = {
  id: 'ID', profile_id: 'Profile',
  perm_view_members:       'View Members',
  perm_edit_members:       'Edit Members',
  perm_manage_members:     'Manage Members',
  perm_export_members:     'Export Member Records',
  perm_view_sponsors:      'View Sponsors',
  perm_verify_sponsors:    'Verify Sponsors',
  perm_manage_sponsors:    'Manage Sponsorships',
  perm_export_sponsors:    'Export Sponsor Records',
  perm_view_support:       'View Support Requests',
  perm_manage_support:     'Manage Support Requests',
  perm_manage_departments: 'Manage Departments',
  perm_manage_projects:    'Manage Projects',
  perm_manage_merchandise: 'Manage Merchandise',
  perm_manage_media:       'Manage Media',
  perm_manage_content:     'Manage Website Content',
  perm_view_admins:        'View Administrators',
  perm_manage_admins:      'Manage Administrator Permissions',
  perm_full_admin:         'Full Administration (all permissions)',
  granted_by: 'Granted By', created_at: 'Created', updated_at: 'Updated',
};

// Grouped permission layout for the UI
export const PERMISSION_GROUPS = [
  {
    label: 'Member Management',
    keys: ['perm_view_members','perm_edit_members','perm_manage_members','perm_export_members'],
  },
  {
    label: 'Sponsorship Management',
    keys: ['perm_view_sponsors','perm_verify_sponsors','perm_manage_sponsors','perm_export_sponsors'],
  },
  {
    label: 'Support Requests',
    keys: ['perm_view_support','perm_manage_support'],
  },
  {
    label: 'Departments / Projects / Merchandise',
    keys: ['perm_manage_departments','perm_manage_projects','perm_manage_merchandise'],
  },
  {
    label: 'Content & Media',
    keys: ['perm_manage_media','perm_manage_content'],
  },
  {
    label: 'Administration',
    keys: ['perm_view_admins','perm_manage_admins'],
  },
  {
    label: '⚠ Full Administration',
    keys: ['perm_full_admin'],
  },
] as const;
export type MemberPosition =
  | 'member' | 'pastor' | 'ministry_leader' | 'media' | 'worship'
  | 'ushering' | 'evangelism' | 'youth' | 'administration' | 'other';
export type Gender         = 'male' | 'female' | 'prefer_not_to_say';
export type CareerStatus   =
  | 'student' | 'employed' | 'self_employed'
  | 'unemployed' | 'business_owner' | 'other';

// ── Profile (members table) ──────────────────────────────────
export interface Profile {
  id:             string;
  full_name:      string;
  username?:      string | null;
  email:          string;
  phone?:         string | null;
  avatar_url?:    string | null;
  role:           MemberRole;
  position?:      MemberPosition | null;
  date_of_birth?: string | null;      // ISO date string YYYY-MM-DD
  gender?:        Gender | null;
  faith?:         string | null;
  career_status?: CareerStatus | null;
  occupation?:    string | null;
  student_status?:string | null;
  school?:        string | null;
  address?:       string | null;
  is_active?:     boolean;
  is_super_admin?: boolean;
  created_at:     string;
  updated_at:     string;
}

// ── Events ───────────────────────────────────────────────────
export interface Event {
  id:                    string;
  title:                 string;
  slug:                  string;
  description?:          string | null;
  short_description?:    string | null;
  event_date:            string;
  start_time?:           string | null;
  end_time?:             string | null;
  location?:             string | null;
  image_url?:            string | null;
  registration_required: boolean;
  registration_deadline?:string | null;
  created_at:            string;
  updated_at:            string;
}

export interface EventRegistration {
  id:         string;
  event_id:   string;
  user_id:    string;
  status:     'active' | 'cancelled';
  created_at: string;
}

export interface ContactMessage {
  id:         string;
  name:       string;
  email:      string;
  phone?:     string | null;
  subject:    string;
  message:    string;
  status:     'unread' | 'read' | 'responded';
  created_at: string;
}

export interface NewsletterSubscriber {
  id:         string;
  email:      string;
  status:     'active' | 'unsubscribed';
  created_at: string;
}

export interface Media {
  id:            string;
  title:         string;
  description?:  string | null;
  type:          'sermon' | 'worship' | 'teaching' | 'video' | 'photo';
  thumbnail_url?:string | null;
  media_url:     string;
  published:     boolean;
  created_at:    string;
  updated_at:    string;
}
