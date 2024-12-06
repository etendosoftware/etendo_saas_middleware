export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Environment {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
}