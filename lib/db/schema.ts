import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Post = {
  id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_handle: string;
  toxicity_level: 'Low' | 'Medium' | 'High';
  categories: string[];
  special_mode?: string;
  is_favorite: boolean;
  engagement_score: number;
  created_at: string;
  metadata: {
    hashtags: string[];
    best_time_to_post?: string;
    estimated_reach?: number;
    thread_length?: number;
  };
};

export type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  default_author_name: string;
  default_author_handle: string;
  email_notifications: boolean;
  dark_mode: boolean;
  auto_save_drafts: boolean;
  custom_handles: {
    name: string;
    handle: string;
  }[];
  favorite_categories: string[];
  custom_templates: {
    name: string;
    content: string;
    variables: string[];
  }[];
  created_at: string;
  updated_at: string;
};

export type Analytics = {
  id: string;
  user_id: string;
  post_id: string;
  views: number;
  likes: number;
  retweets: number;
  replies: number;
  engagement_rate: number;
  best_performing_time: string;
  created_at: string;
}; 