export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      garments: {
        Row: {
          id: string
          user_id: string
          image_url: string
          image_path: string | null
          category: string
          title: string | null
          color: string | null
          secondary_color: string | null
          material: string | null
          subcategory: string | null
          taxonomy_path: string | null
          primary_color: string | null
          secondary_colors: string[] | null
          pattern: string | null
          material_guess: string | null
          warmth: number | null
          formality: number | null
          season: string[] | null
          vibe_tags: string[] | null
          accessory_type: string | null
          metal_tone: string | null
          delicacy: number | null
          wear_count: number | null
          last_worn: string | null
          is_archived: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          image_path?: string | null
          category: string
          title?: string | null
          color?: string | null
          secondary_color?: string | null
          material?: string | null
          subcategory?: string | null
          taxonomy_path?: string | null
          primary_color?: string | null
          secondary_colors?: string[] | null
          pattern?: string | null
          material_guess?: string | null
          warmth?: number | null
          formality?: number | null
          season?: string[] | null
          vibe_tags?: string[] | null
          accessory_type?: string | null
          metal_tone?: string | null
          delicacy?: number | null
          wear_count?: number | null
          last_worn?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          image_path?: string | null
          category?: string
          title?: string | null
          color?: string | null
          secondary_color?: string | null
          material?: string | null
          subcategory?: string | null
          taxonomy_path?: string | null
          primary_color?: string | null
          secondary_colors?: string[] | null
          pattern?: string | null
          material_guess?: string | null
          warmth?: number | null
          formality?: number | null
          season?: string[] | null
          vibe_tags?: string[] | null
          accessory_type?: string | null
          metal_tone?: string | null
          delicacy?: number | null
          wear_count?: number | null
          last_worn?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "garments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          style_preference: string | null
        }
        Insert: {
          id: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          style_preference?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          style_preference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
