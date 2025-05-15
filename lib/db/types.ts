export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          author_name: string
          author_handle: string
          toxicity_level: 'Low' | 'Medium' | 'High'
          categories: string[]
          special_mode?: string
          is_favorite: boolean
          engagement_score: number
          created_at: string
          metadata: {
            hashtags: string[]
            best_time_to_post?: string
            estimated_reach?: number
            thread_length?: number
          }
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          author_name: string
          author_handle: string
          toxicity_level: 'Low' | 'Medium' | 'High'
          categories: string[]
          special_mode?: string
          is_favorite?: boolean
          engagement_score?: number
          created_at?: string
          metadata?: {
            hashtags: string[]
            best_time_to_post?: string
            estimated_reach?: number
            thread_length?: number
          }
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          author_name?: string
          author_handle?: string
          toxicity_level?: 'Low' | 'Medium' | 'High'
          categories?: string[]
          special_mode?: string
          is_favorite?: boolean
          engagement_score?: number
          created_at?: string
          metadata?: {
            hashtags: string[]
            best_time_to_post?: string
            estimated_reach?: number
            thread_length?: number
          }
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          default_author_name: string
          default_author_handle: string
          email_notifications: boolean
          dark_mode: boolean
          auto_save_drafts: boolean
          custom_handles: {
            name: string
            handle: string
          }[]
          favorite_categories: string[]
          custom_templates: {
            name: string
            content: string
            variables: string[]
          }[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          display_name: string
          default_author_name: string
          default_author_handle: string
          email_notifications?: boolean
          dark_mode?: boolean
          auto_save_drafts?: boolean
          custom_handles?: {
            name: string
            handle: string
          }[]
          favorite_categories?: string[]
          custom_templates?: {
            name: string
            content: string
            variables: string[]
          }[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          default_author_name?: string
          default_author_handle?: string
          email_notifications?: boolean
          dark_mode?: boolean
          auto_save_drafts?: boolean
          custom_handles?: {
            name: string
            handle: string
          }[]
          favorite_categories?: string[]
          custom_templates?: {
            name: string
            content: string
            variables: string[]
          }[]
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          post_id: string
          views: number
          likes: number
          retweets: number
          replies: number
          engagement_rate: number
          best_performing_time: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          views?: number
          likes?: number
          retweets?: number
          replies?: number
          engagement_rate?: number
          best_performing_time?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          views?: number
          likes?: number
          retweets?: number
          replies?: number
          engagement_rate?: number
          best_performing_time?: string
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          generation_count: number
          premium_until: string | null
          last_generated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          generation_count?: number
          premium_until?: string | null
          last_generated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          generation_count?: number
          premium_until?: string | null
          last_generated_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 