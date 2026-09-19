export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: 'member' | 'leader' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  image_url?: string | null;
  registration_required: boolean;
  registration_deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  status: 'active' | 'cancelled';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'unread' | 'read' | 'responded';
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
  status: 'active' | 'unsubscribed';
}

export interface Media {
  id: string;
  title: string;
  description?: string;
  type: 'sermon' | 'worship' | 'teaching' | 'video' | 'photo';
  thumbnail_url?: string;
  media_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}
