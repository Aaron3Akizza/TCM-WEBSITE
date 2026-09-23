// ── Core role types ──────────────────────────────────────────
export type MemberRole     = 'member' | 'leader' | 'admin';
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
