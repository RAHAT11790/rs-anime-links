export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_slots: {
        Row: {
          enabled: boolean
          id: string
          name: string
          script_code: string | null
          slot_key: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          name: string
          script_code?: string | null
          slot_key: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          id?: string
          name?: string
          script_code?: string | null
          slot_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      clicks: {
        Row: {
          completed: boolean
          country: string | null
          created_at: string
          earned: number
          id: string
          ip_hash: string | null
          link_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          country?: string | null
          created_at?: string
          earned?: number
          id?: string
          ip_hash?: string | null
          link_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          country?: string | null
          created_at?: string
          earned?: number
          id?: string
          ip_hash?: string | null
          link_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          alias: string | null
          created_at: string
          earnings: number
          hidden: boolean
          id: string
          original_url: string
          short_code: string
          status: Database["public"]["Enums"]["link_status"]
          title: string | null
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          alias?: string | null
          created_at?: string
          earnings?: number
          hidden?: boolean
          id?: string
          original_url: string
          short_code: string
          status?: Database["public"]["Enums"]["link_status"]
          title?: string | null
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          alias?: string | null
          created_at?: string
          earnings?: number
          hidden?: boolean
          id?: string
          original_url?: string
          short_code?: string
          status?: Database["public"]["Enums"]["link_status"]
          title?: string | null
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          cpm_rate: number
          created_at: string
          email: string
          id: string
          payment_address: string | null
          payment_method: string | null
          plan: string
          referral_earnings: number
          referred_by: string | null
          total_earnings: number
          total_views: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          balance?: number
          cpm_rate?: number
          created_at?: string
          email: string
          id?: string
          payment_address?: string | null
          payment_method?: string | null
          plan?: string
          referral_earnings?: number
          referred_by?: string | null
          total_earnings?: number
          total_views?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          balance?: number
          cpm_rate?: number
          created_at?: string
          email?: string
          id?: string
          payment_address?: string | null
          payment_method?: string | null
          plan?: string
          referral_earnings?: number
          referred_by?: string | null
          total_earnings?: number
          total_views?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          earned: number
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          earned?: number
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          earned?: number
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          address: string
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          method: string
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          method: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gen_api_token: { Args: never; Returns: string }
      gen_short_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      link_status: "active" | "disabled"
      withdrawal_status: "pending" | "approved" | "rejected" | "paid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      link_status: ["active", "disabled"],
      withdrawal_status: ["pending", "approved", "rejected", "paid"],
    },
  },
} as const
