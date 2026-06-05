export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      fits: {
        Row: {
          id: string
          title: string
          image_url: string
          vibe_tags: string[]
          published: boolean
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          vibe_tags?: string[]
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          vibe_tags?: string[]
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      pins: {
        Row: {
          id: string
          fit_id: string
          x_percent: number
          y_percent: number
          product_name: string
          brand: string | null
          price: number | null
          affiliate_url: string
          created_at: string
        }
        Insert: {
          id?: string
          fit_id: string
          x_percent: number
          y_percent: number
          product_name: string
          brand?: string | null
          price?: number | null
          affiliate_url: string
          created_at?: string
        }
        Update: {
          product_name?: string
          brand?: string | null
          price?: number | null
          affiliate_url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pins_fit_id_fkey'
            columns: ['fit_id']
            isOneToOne: false
            referencedRelation: 'fits'
            referencedColumns: ['id']
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string | null
          category: string
          price: number | null
          image_url: string | null
          affiliate_url: string
          tags: string[]
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          category: string
          price?: number | null
          image_url?: string | null
          affiliate_url: string
          tags?: string[]
          published?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          brand?: string | null
          category?: string
          price?: number | null
          image_url?: string | null
          affiliate_url?: string
          tags?: string[]
          published?: boolean
        }
        Relationships: []
      }
      click_events: {
        Row: {
          id: string
          type: 'pin' | 'product'
          fit_id: string | null
          pin_id: string | null
          product_id: string | null
          destination_url: string
          referrer: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'pin' | 'product'
          fit_id?: string | null
          pin_id?: string | null
          product_id?: string | null
          destination_url: string
          referrer?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          fit_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fit_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Fit = Database['public']['Tables']['fits']['Row']
export type Pin = Database['public']['Tables']['pins']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ClickEvent = Database['public']['Tables']['click_events']['Row']
export type Wishlist = Database['public']['Tables']['wishlists']['Row']
