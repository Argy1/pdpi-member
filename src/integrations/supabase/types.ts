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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          changed_fields: string[] | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          changed_fields?: string[] | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      member_change_requests: {
        Row: {
          changes: Json
          created_at: string
          id: string
          member_id: string
          rejection_reason: string | null
          requested_at: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          changes: Json
          created_at?: string
          id?: string
          member_id: string
          rejection_reason?: string | null
          requested_at?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          changes?: Json
          created_at?: string
          id?: string
          member_id?: string
          rejection_reason?: string | null
          requested_at?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_change_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_change_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "public_member_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          alamat_rumah: string | null
          alumni: string | null
          cabang: string | null
          created_at: string
          email: string | null
          foto: string | null
          gelar: string | null
          gelar2: string | null
          id: string
          jenis_kelamin: string | null
          keterangan: string | null
          kota_kabupaten: string | null
          kota_kabupaten_kantor: string | null
          kota_kabupaten_rumah: string | null
          nama: string
          no_hp: string | null
          npa: string | null
          provinsi: string | null
          provinsi_kantor: string | null
          provinsi_rumah: string | null
          search_text: string | null
          status: string | null
          tempat_lahir: string | null
          tempat_praktek_1: string | null
          tempat_praktek_1_alkes: string | null
          tempat_praktek_1_tipe: string | null
          tempat_praktek_2: string | null
          tempat_praktek_2_alkes: string | null
          tempat_praktek_2_tipe: string | null
          tempat_praktek_3: string | null
          tempat_praktek_3_alkes: string | null
          tempat_praktek_3_tipe: string | null
          tempat_tugas: string | null
          tgl_lahir: string | null
          thn_lulus: number | null
          updated_at: string
        }
        Insert: {
          alamat_rumah?: string | null
          alumni?: string | null
          cabang?: string | null
          created_at?: string
          email?: string | null
          foto?: string | null
          gelar?: string | null
          gelar2?: string | null
          id?: string
          jenis_kelamin?: string | null
          keterangan?: string | null
          kota_kabupaten?: string | null
          kota_kabupaten_kantor?: string | null
          kota_kabupaten_rumah?: string | null
          nama: string
          no_hp?: string | null
          npa?: string | null
          provinsi?: string | null
          provinsi_kantor?: string | null
          provinsi_rumah?: string | null
          search_text?: string | null
          status?: string | null
          tempat_lahir?: string | null
          tempat_praktek_1?: string | null
          tempat_praktek_1_alkes?: string | null
          tempat_praktek_1_tipe?: string | null
          tempat_praktek_2?: string | null
          tempat_praktek_2_alkes?: string | null
          tempat_praktek_2_tipe?: string | null
          tempat_praktek_3?: string | null
          tempat_praktek_3_alkes?: string | null
          tempat_praktek_3_tipe?: string | null
          tempat_tugas?: string | null
          tgl_lahir?: string | null
          thn_lulus?: number | null
          updated_at?: string
        }
        Update: {
          alamat_rumah?: string | null
          alumni?: string | null
          cabang?: string | null
          created_at?: string
          email?: string | null
          foto?: string | null
          gelar?: string | null
          gelar2?: string | null
          id?: string
          jenis_kelamin?: string | null
          keterangan?: string | null
          kota_kabupaten?: string | null
          kota_kabupaten_kantor?: string | null
          kota_kabupaten_rumah?: string | null
          nama?: string
          no_hp?: string | null
          npa?: string | null
          provinsi?: string | null
          provinsi_kantor?: string | null
          provinsi_rumah?: string | null
          search_text?: string | null
          status?: string | null
          tempat_lahir?: string | null
          tempat_praktek_1?: string | null
          tempat_praktek_1_alkes?: string | null
          tempat_praktek_1_tipe?: string | null
          tempat_praktek_2?: string | null
          tempat_praktek_2_alkes?: string | null
          tempat_praktek_2_tipe?: string | null
          tempat_praktek_3?: string | null
          tempat_praktek_3_alkes?: string | null
          tempat_praktek_3_tipe?: string | null
          tempat_tugas?: string | null
          tgl_lahir?: string | null
          thn_lulus?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          related_table: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          related_table?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_member_directory: {
        Row: {
          alumni: string | null
          cabang: string | null
          created_at: string | null
          gelar: string | null
          gelar2: string | null
          id: string | null
          jenis_kelamin: string | null
          kota_kabupaten_kantor: string | null
          nama: string | null
          npa: string | null
          provinsi_kantor: string | null
          status: string | null
          tempat_praktek_1: string | null
          tempat_praktek_1_tipe: string | null
          tempat_praktek_2: string | null
          tempat_praktek_2_tipe: string | null
          tempat_praktek_3: string | null
          tempat_praktek_3_tipe: string | null
          tempat_tugas: string | null
          thn_lulus: number | null
        }
        Insert: {
          alumni?: string | null
          cabang?: string | null
          created_at?: string | null
          gelar?: string | null
          gelar2?: string | null
          id?: string | null
          jenis_kelamin?: string | null
          kota_kabupaten_kantor?: string | null
          nama?: string | null
          npa?: string | null
          provinsi_kantor?: string | null
          status?: string | null
          tempat_praktek_1?: string | null
          tempat_praktek_1_tipe?: string | null
          tempat_praktek_2?: string | null
          tempat_praktek_2_tipe?: string | null
          tempat_praktek_3?: string | null
          tempat_praktek_3_tipe?: string | null
          tempat_tugas?: string | null
          thn_lulus?: number | null
        }
        Update: {
          alumni?: string | null
          cabang?: string | null
          created_at?: string | null
          gelar?: string | null
          gelar2?: string | null
          id?: string | null
          jenis_kelamin?: string | null
          kota_kabupaten_kantor?: string | null
          nama?: string | null
          npa?: string | null
          provinsi_kantor?: string | null
          status?: string | null
          tempat_praktek_1?: string | null
          tempat_praktek_1_tipe?: string | null
          tempat_praktek_2?: string | null
          tempat_praktek_2_tipe?: string | null
          tempat_praktek_3?: string | null
          tempat_praktek_3_tipe?: string | null
          tempat_tugas?: string | null
          thn_lulus?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_search_text: {
        Args: { member_row: Database["public"]["Tables"]["members"]["Row"] }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_public_member_directory: {
        Args: Record<PropertyKey, never>
        Returns: {
          alumni: string | null
          cabang: string | null
          created_at: string | null
          gelar: string | null
          gelar2: string | null
          id: string | null
          jenis_kelamin: string | null
          kota_kabupaten_kantor: string | null
          nama: string | null
          npa: string | null
          provinsi_kantor: string | null
          status: string | null
          tempat_praktek_1: string | null
          tempat_praktek_1_tipe: string | null
          tempat_praktek_2: string | null
          tempat_praktek_2_tipe: string | null
          tempat_praktek_3: string | null
          tempat_praktek_3_tipe: string | null
          tempat_tugas: string | null
          thn_lulus: number | null
        }[]
      }
      get_public_member_directory_paged: {
        Args: {
          cabang_filter?: string
          limit_rows?: number
          offset_rows?: number
          provinsi_filter?: string
          q?: string
        }
        Returns: {
          alumni: string | null
          cabang: string | null
          created_at: string | null
          gelar: string | null
          gelar2: string | null
          id: string | null
          jenis_kelamin: string | null
          kota_kabupaten_kantor: string | null
          nama: string | null
          npa: string | null
          provinsi_kantor: string | null
          status: string | null
          tempat_praktek_1: string | null
          tempat_praktek_1_tipe: string | null
          tempat_praktek_2: string | null
          tempat_praktek_2_tipe: string | null
          tempat_praktek_3: string | null
          tempat_praktek_3_tipe: string | null
          tempat_tugas: string | null
          thn_lulus: number | null
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalize_text: {
        Args: { input_text: string }
        Returns: string
      }
      notify_super_admins: {
        Args: {
          p_message: string
          p_related_id?: string
          p_related_table?: string
          p_title: string
          p_type?: string
        }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
    }
    Enums: {
      app_role:
        | "admin_pusat"
        | "admin_cabang_aceh"
        | "user"
        | "admin_cabang_sumut"
        | "admin_cabang_sumbar"
        | "admin_cabang_riau"
        | "admin_cabang_kepri"
        | "admin_cabang_jambi"
        | "admin_cabang_sumsel"
        | "admin_cabang_lampung"
        | "admin_cabang_banten"
        | "admin_cabang_jakarta"
        | "admin_cabang_bogor"
        | "admin_cabang_bekasi"
        | "admin_cabang_depok"
        | "admin_cabang_jabar"
        | "admin_cabang_jateng"
        | "admin_cabang_surakarta"
        | "admin_cabang_yogyakarta"
        | "admin_cabang_jatim"
        | "admin_cabang_malang"
        | "admin_cabang_bali"
        | "admin_cabang_ntb"
        | "admin_cabang_ntt"
        | "admin_cabang_kalsel"
        | "admin_cabang_kaltim"
        | "admin_cabang_kalbar"
        | "admin_cabang_kalteng"
        | "admin_cabang_suselbara"
        | "admin_cabang_suluttenggo"
        | "admin_cabang_maluku"
        | "admin_cabang_papua"
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
      app_role: [
        "admin_pusat",
        "admin_cabang_aceh",
        "user",
        "admin_cabang_sumut",
        "admin_cabang_sumbar",
        "admin_cabang_riau",
        "admin_cabang_kepri",
        "admin_cabang_jambi",
        "admin_cabang_sumsel",
        "admin_cabang_lampung",
        "admin_cabang_banten",
        "admin_cabang_jakarta",
        "admin_cabang_bogor",
        "admin_cabang_bekasi",
        "admin_cabang_depok",
        "admin_cabang_jabar",
        "admin_cabang_jateng",
        "admin_cabang_surakarta",
        "admin_cabang_yogyakarta",
        "admin_cabang_jatim",
        "admin_cabang_malang",
        "admin_cabang_bali",
        "admin_cabang_ntb",
        "admin_cabang_ntt",
        "admin_cabang_kalsel",
        "admin_cabang_kaltim",
        "admin_cabang_kalbar",
        "admin_cabang_kalteng",
        "admin_cabang_suselbara",
        "admin_cabang_suluttenggo",
        "admin_cabang_maluku",
        "admin_cabang_papua",
      ],
    },
  },
} as const
