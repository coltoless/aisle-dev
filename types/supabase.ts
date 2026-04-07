/**
 * Hand-maintained to match `supabase/migrations/*` until you run:
 * `pnpm supabase login && pnpm gen:types` (overwrites this file from the live project).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          id: string;
          couple_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_conversations_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      budget_flags: {
        Row: {
          id: string;
          couple_id: string;
          category: string;
          reason: string;
          severity: string;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          category: string;
          reason: string;
          severity: string;
          resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          category?: string;
          reason?: string;
          severity?: string;
          resolved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_flags_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      budget_items: {
        Row: {
          id: string;
          couple_id: string;
          category: string;
          category_label: string;
          estimated_cost: number | null;
          quoted_cost: number | null;
          deposit_paid: number | null;
          balance_due: number | null;
          balance_due_date: string | null;
          notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          category: string;
          category_label: string;
          estimated_cost?: number | null;
          quoted_cost?: number | null;
          deposit_paid?: number | null;
          balance_due?: number | null;
          balance_due_date?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          category?: string;
          category_label?: string;
          estimated_cost?: number | null;
          quoted_cost?: number | null;
          deposit_paid?: number | null;
          balance_due?: number | null;
          balance_due_date?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_items_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_items: {
        Row: {
          id: string;
          couple_id: string;
          title: string;
          category: string;
          phase: string;
          due_date: string | null;
          completed: boolean;
          completed_at: string | null;
          snoozed_until: string | null;
          notes: string | null;
          is_custom: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          title: string;
          category: string;
          phase: string;
          due_date?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          snoozed_until?: string | null;
          notes?: string | null;
          is_custom?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          title?: string;
          category?: string;
          phase?: string;
          due_date?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          snoozed_until?: string | null;
          notes?: string | null;
          is_custom?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_items_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      contracts: {
        Row: {
          id: string;
          couple_id: string;
          vendor_id: string | null;
          vendor_name: string;
          file_path: string;
          file_name: string;
          contract_value: number | null;
          deposit_amount: number | null;
          deposit_due_date: string | null;
          balance_due_date: string | null;
          signed: boolean;
          ai_review_notes: string | null;
          ai_reviewed_at: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          vendor_id?: string | null;
          vendor_name: string;
          file_path: string;
          file_name: string;
          contract_value?: number | null;
          deposit_amount?: number | null;
          deposit_due_date?: string | null;
          balance_due_date?: string | null;
          signed?: boolean;
          ai_review_notes?: string | null;
          ai_reviewed_at?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          vendor_id?: string | null;
          vendor_name?: string;
          file_path?: string;
          file_name?: string;
          contract_value?: number | null;
          deposit_amount?: number | null;
          deposit_due_date?: string | null;
          balance_due_date?: string | null;
          signed?: boolean;
          ai_review_notes?: string | null;
          ai_reviewed_at?: string | null;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contracts_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contracts_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      couples: {
        Row: {
          id: string;
          user_id: string;
          partner1_name: string;
          partner2_name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          partner1_name: string;
          partner2_name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          partner1_name?: string;
          partner2_name?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          couple_id: string;
          category: string;
          company_name: string | null;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          status: string;
          contract_uploaded: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          category: string;
          company_name?: string | null;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          status?: string;
          contract_uploaded?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          category?: string;
          company_name?: string | null;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          status?: string;
          contract_uploaded?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendors_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      venues: {
        Row: {
          id: string;
          couple_id: string;
          name: string;
          location: string | null;
          venue_type: string | null;
          estimated_price_low: number | null;
          estimated_price_high: number | null;
          description: string | null;
          website: string | null;
          style_tags: string[];
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          name: string;
          location?: string | null;
          venue_type?: string | null;
          estimated_price_low?: number | null;
          estimated_price_high?: number | null;
          description?: string | null;
          website?: string | null;
          style_tags?: string[];
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          name?: string;
          location?: string | null;
          venue_type?: string | null;
          estimated_price_low?: number | null;
          estimated_price_high?: number | null;
          description?: string | null;
          website?: string | null;
          style_tags?: string[];
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "venues_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      wedding_profiles: {
        Row: {
          id: string;
          couple_id: string;
          wedding_date: string | null;
          location_city: string | null;
          location_state: string | null;
          location_country: string;
          guest_count_range: string | null;
          budget_range: string | null;
          budget_exact: number | null;
          style_tags: string[];
          priorities: string[];
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          wedding_date?: string | null;
          location_city?: string | null;
          location_state?: string | null;
          location_country?: string;
          guest_count_range?: string | null;
          budget_range?: string | null;
          budget_exact?: number | null;
          style_tags?: string[];
          priorities?: string[];
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          wedding_date?: string | null;
          location_city?: string | null;
          location_state?: string | null;
          location_country?: string;
          guest_count_range?: string | null;
          budget_range?: string | null;
          budget_exact?: number | null;
          style_tags?: string[];
          priorities?: string[];
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wedding_profiles_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
