export interface Profile {
  id: string;
  email: string;
  display_name: string;
  couple_id: string | null;
  created_at: string;
}

export interface Couple {
  id: string;
  user1_id: string;
  user2_id: string | null;
  invite_code: string;
  connected_at: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  couple_id: string;
  capture_date: string; // "YYYY-MM-DD"
  storage_path: string;
  thumbnail_path: string;
  original_filename: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface Memo {
  id: string;
  couple_id: string;
  memo_date: string;
  content: string;
  updated_by: string;
  updated_at: string;
}

export interface Event {
  id: string;
  couple_id: string;
  title: string;
  event_date: string; // "YYYY-MM-DD"
  start_time: string | null;
  end_time: string | null;
  color: string;
  created_by: string;
  created_at: string;
}

export interface Place {
  id: string;
  couple_id: string;
  visit_date: string; // "YYYY-MM-DD"
  name: string;
  category: string;
  note: string | null;
  created_by: string;
  created_at: string;
}

export interface DateFlag {
  id: string;
  couple_id: string;
  flag_date: string; // "YYYY-MM-DD"
  met: boolean;
  loved: boolean;
  updated_by: string;
  updated_at: string;
}

export interface CalendarDay {
  date: string; // "YYYY-MM-DD"
  photoCount: number;
  representativeThumbnailUrl: string | null;
  events: Event[];
  flags?: { met: boolean; loved: boolean };
}
