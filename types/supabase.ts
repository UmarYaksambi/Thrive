export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export type Document = {
  id: string;
  title: string;
  description?: string | null;
  resource_url?: string | null;
  thumbnail_color?: string | null;
  creator?: string | null;
  type?: string | null;
  difficulty?: string | null;
  language?: string | null;
  tags?: string[] | null;
  status?: DocumentStatus | null;
  submitted_by?: string | null;
  submitted_at?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  categories?: string[] | null;
  created_at?: string | null;
  user?: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      full_name?: string;
    };
  };
};
