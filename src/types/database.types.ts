export interface Database {
  public: {
    Tables: {
      urls: {
        Row: {
          id: string
          original_url: string
          short_code: string
          created_at: string
          clicks: number
          last_accessed: string | null
        }
        Insert: {
          id?: string
          original_url: string
          short_code: string
          created_at?: string
          clicks?: number
          last_accessed?: string | null
        }
        Update: {
          id?: string
          original_url?: string
          short_code?: string
          created_at?: string
          clicks?: number
          last_accessed?: string | null
        }
      }
    }
  }
} 