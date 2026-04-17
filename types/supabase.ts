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
      ai_conversations: {
        Row: {
          content: string
          couple_id: string
          created_at: string
          id: string
          mode: string
          role: string
        }
        Insert: {
          content: string
          couple_id: string
          created_at?: string
          id?: string
          mode?: string
          role: string
        }
        Update: {
          content?: string
          couple_id?: string
          created_at?: string
          id?: string
          mode?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_flags: {
        Row: {
          category: string
          couple_id: string
          created_at: string
          id: string
          reason: string
          resolved: boolean
          severity: string
        }
        Insert: {
          category: string
          couple_id: string
          created_at?: string
          id?: string
          reason: string
          resolved?: boolean
          severity: string
        }
        Update: {
          category?: string
          couple_id?: string
          created_at?: string
          id?: string
          reason?: string
          resolved?: boolean
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_flags_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          balance_due: number | null
          balance_due_date: string | null
          category: string
          category_label: string
          couple_id: string
          created_at: string
          deposit_paid: number | null
          estimated_cost: number | null
          id: string
          notes: string | null
          quoted_cost: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          balance_due?: number | null
          balance_due_date?: string | null
          category: string
          category_label: string
          couple_id: string
          created_at?: string
          deposit_paid?: number | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          quoted_cost?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          balance_due?: number | null
          balance_due_date?: string | null
          category?: string
          category_label?: string
          couple_id?: string
          created_at?: string
          deposit_paid?: number | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          quoted_cost?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          couple_id: string
          created_at: string
          due_date: string | null
          id: string
          is_custom: boolean
          notes: string | null
          phase: string
          snoozed_until: string | null
          sort_order: number
          title: string
        }
        Insert: {
          category: string
          completed?: boolean
          completed_at?: string | null
          couple_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          is_custom?: boolean
          notes?: string | null
          phase: string
          snoozed_until?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          couple_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          is_custom?: boolean
          notes?: string | null
          phase?: string
          snoozed_until?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          ai_review_notes: string | null
          ai_reviewed_at: string | null
          balance_due_date: string | null
          contract_value: number | null
          couple_id: string
          deposit_amount: number | null
          deposit_due_date: string | null
          file_name: string
          file_path: string
          id: string
          signed: boolean
          uploaded_at: string
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          ai_review_notes?: string | null
          ai_reviewed_at?: string | null
          balance_due_date?: string | null
          contract_value?: number | null
          couple_id: string
          deposit_amount?: number | null
          deposit_due_date?: string | null
          file_name: string
          file_path: string
          id?: string
          signed?: boolean
          uploaded_at?: string
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          ai_review_notes?: string | null
          ai_reviewed_at?: string | null
          balance_due_date?: string | null
          contract_value?: number | null
          couple_id?: string
          deposit_amount?: number | null
          deposit_due_date?: string | null
          file_name?: string
          file_path?: string
          id?: string
          signed?: boolean
          uploaded_at?: string
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          email: string
          id: string
          partner1_name: string
          partner2_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          partner1_name: string
          partner2_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          partner1_name?: string
          partner2_name?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          category: string
          company_name: string | null
          contact_name: string | null
          contract_uploaded: boolean
          couple_id: string
          created_at: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          category: string
          company_name?: string | null
          contact_name?: string | null
          contract_uploaded?: boolean
          couple_id: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          category?: string
          company_name?: string | null
          contact_name?: string | null
          contract_uploaded?: boolean
          couple_id?: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          couple_id: string
          created_at: string
          description: string | null
          estimated_price_high: number | null
          estimated_price_low: number | null
          id: string
          location: string | null
          name: string
          notes: string | null
          status: string
          style_tags: string[]
          venue_type: string | null
          website: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          description?: string | null
          estimated_price_high?: number | null
          estimated_price_low?: number | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          status?: string
          style_tags?: string[]
          venue_type?: string | null
          website?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          description?: string | null
          estimated_price_high?: number | null
          estimated_price_low?: number | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          status?: string
          style_tags?: string[]
          venue_type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_profiles: {
        Row: {
          budget_exact: number | null
          budget_range: string | null
          couple_id: string
          created_at: string
          guest_count_range: string | null
          id: string
          location_city: string | null
          location_country: string
          location_state: string | null
          onboarding_complete: boolean
          priorities: string[]
          style_notes: string | null
          style_tags: string[]
          updated_at: string
          wedding_date: string | null
        }
        Insert: {
          budget_exact?: number | null
          budget_range?: string | null
          couple_id: string
          created_at?: string
          guest_count_range?: string | null
          id?: string
          location_city?: string | null
          location_country?: string
          location_state?: string | null
          onboarding_complete?: boolean
          priorities?: string[]
          style_notes?: string | null
          style_tags?: string[]
          updated_at?: string
          wedding_date?: string | null
        }
        Update: {
          budget_exact?: number | null
          budget_range?: string | null
          couple_id?: string
          created_at?: string
          guest_count_range?: string | null
          id?: string
          location_city?: string | null
          location_country?: string
          location_state?: string | null
          onboarding_complete?: boolean
          priorities?: string[]
          style_notes?: string | null
          style_tags?: string[]
          updated_at?: string
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_profiles_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
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
    Enums: {},
  },
} as const
