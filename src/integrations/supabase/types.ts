export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ball_by_ball: {
        Row: {
          ball_number: number
          batsman_id: string | null
          bowler_id: string | null
          commentary: string | null
          created_at: string
          extra_type: string | null
          extras: number
          fielder_id: string | null
          id: string
          innings: number
          is_wicket: boolean
          match_id: string
          over_number: number
          runs: number
          shot_type: string | null
          wicket_type: string | null
        }
        Insert: {
          ball_number: number
          batsman_id?: string | null
          bowler_id?: string | null
          commentary?: string | null
          created_at?: string
          extra_type?: string | null
          extras?: number
          fielder_id?: string | null
          id?: string
          innings: number
          is_wicket?: boolean
          match_id: string
          over_number: number
          runs?: number
          shot_type?: string | null
          wicket_type?: string | null
        }
        Update: {
          ball_number?: number
          batsman_id?: string | null
          bowler_id?: string | null
          commentary?: string | null
          created_at?: string
          extra_type?: string | null
          extras?: number
          fielder_id?: string | null
          id?: string
          innings?: number
          is_wicket?: boolean
          match_id?: string
          over_number?: number
          runs?: number
          shot_type?: string | null
          wicket_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ball_by_ball_batsman_id_fkey"
            columns: ["batsman_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ball_by_ball_bowler_id_fkey"
            columns: ["bowler_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ball_by_ball_fielder_id_fkey"
            columns: ["fielder_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ball_by_ball_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_permissions: {
        Row: {
          created_at: string | null
          granted_by: string | null
          id: string
          match_id: string | null
          permission_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          match_id?: string | null
          permission_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          match_id?: string | null
          permission_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_permissions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_stats: {
        Row: {
          balls_faced: number | null
          catches: number | null
          created_at: string
          dismissal_type: string | null
          economy_rate: number | null
          fours: number | null
          id: string
          innings: number
          match_id: string
          overs_bowled: number | null
          player_id: string
          run_outs: number | null
          runs_conceded: number | null
          runs_scored: number | null
          sixes: number | null
          strike_rate: number | null
          wickets_taken: number | null
        }
        Insert: {
          balls_faced?: number | null
          catches?: number | null
          created_at?: string
          dismissal_type?: string | null
          economy_rate?: number | null
          fours?: number | null
          id?: string
          innings: number
          match_id: string
          overs_bowled?: number | null
          player_id: string
          run_outs?: number | null
          runs_conceded?: number | null
          runs_scored?: number | null
          sixes?: number | null
          strike_rate?: number | null
          wickets_taken?: number | null
        }
        Update: {
          balls_faced?: number | null
          catches?: number | null
          created_at?: string
          dismissal_type?: string | null
          economy_rate?: number | null
          fours?: number | null
          id?: string
          innings?: number
          match_id?: string
          overs_bowled?: number | null
          player_id?: string
          run_outs?: number | null
          runs_conceded?: number | null
          runs_scored?: number | null
          sixes?: number | null
          strike_rate?: number | null
          wickets_taken?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          format: string
          id: string
          man_of_match: string | null
          man_of_series: string | null
          match_date: string
          match_time: string | null
          overs: number | null
          result: string | null
          series_id: string | null
          status: string | null
          team1_id: string
          team1_overs: string | null
          team1_score: string | null
          team2_id: string
          team2_overs: string | null
          team2_score: string | null
          toss_decision: string | null
          toss_winner: string | null
          tournament: string | null
          venue: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          format: string
          id?: string
          man_of_match?: string | null
          man_of_series?: string | null
          match_date: string
          match_time?: string | null
          overs?: number | null
          result?: string | null
          series_id?: string | null
          status?: string | null
          team1_id: string
          team1_overs?: string | null
          team1_score?: string | null
          team2_id: string
          team2_overs?: string | null
          team2_score?: string | null
          toss_decision?: string | null
          toss_winner?: string | null
          tournament?: string | null
          venue: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          format?: string
          id?: string
          man_of_match?: string | null
          man_of_series?: string | null
          match_date?: string
          match_time?: string | null
          overs?: number | null
          result?: string | null
          series_id?: string | null
          status?: string | null
          team1_id?: string
          team1_overs?: string | null
          team1_score?: string | null
          team2_id?: string
          team2_overs?: string | null
          team2_score?: string | null
          toss_decision?: string | null
          toss_winner?: string | null
          tournament?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_man_of_match_fkey"
            columns: ["man_of_match"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_man_of_series_fkey"
            columns: ["man_of_series"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          balls: number
          batsman1_id: string
          batsman2_id: string
          created_at: string
          id: string
          innings: number
          match_id: string
          partnership_order: number | null
          runs: number
          wicket_number: number | null
        }
        Insert: {
          balls?: number
          batsman1_id: string
          batsman2_id: string
          created_at?: string
          id?: string
          innings: number
          match_id: string
          partnership_order?: number | null
          runs?: number
          wicket_number?: number | null
        }
        Update: {
          balls?: number
          batsman1_id?: string
          batsman2_id?: string
          created_at?: string
          id?: string
          innings?: number
          match_id?: string
          partnership_order?: number | null
          runs?: number
          wicket_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_batsman1_id_fkey"
            columns: ["batsman1_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_batsman2_id_fkey"
            columns: ["batsman2_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          average: number | null
          batting_style: string | null
          best_bowling: string | null
          best_score: string | null
          bowling_style: string | null
          created_at: string
          economy: number | null
          id: string
          matches: number | null
          name: string
          photo_url: string | null
          role: string
          runs: number | null
          strike_rate: number | null
          team_id: string | null
          wickets: number | null
        }
        Insert: {
          average?: number | null
          batting_style?: string | null
          best_bowling?: string | null
          best_score?: string | null
          bowling_style?: string | null
          created_at?: string
          economy?: number | null
          id?: string
          matches?: number | null
          name: string
          photo_url?: string | null
          role: string
          runs?: number | null
          strike_rate?: number | null
          team_id?: string | null
          wickets?: number | null
        }
        Update: {
          average?: number | null
          batting_style?: string | null
          best_bowling?: string | null
          best_score?: string | null
          bowling_style?: string | null
          created_at?: string
          economy?: number | null
          id?: string
          matches?: number | null
          name?: string
          photo_url?: string | null
          role?: string
          runs?: number | null
          strike_rate?: number | null
          team_id?: string | null
          wickets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          man_of_series: string | null
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          man_of_series?: string | null
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          man_of_series?: string | null
          name?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_man_of_series_fkey"
            columns: ["man_of_series"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tournament_matches: {
        Row: {
          id: string
          match_id: string
          match_number: number
          round_name: string
          scheduled_date: string | null
          scheduled_time: string | null
          tournament_id: string
        }
        Insert: {
          id?: string
          match_id: string
          match_number: number
          round_name: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          tournament_id: string
        }
        Update: {
          id?: string
          match_id?: string
          match_number?: number
          round_name?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_officials: {
        Row: {
          contact_info: string | null
          id: string
          matches_assigned: number | null
          official_name: string
          official_type: string
          rate_per_match: number | null
          tournament_id: string
        }
        Insert: {
          contact_info?: string | null
          id?: string
          matches_assigned?: number | null
          official_name: string
          official_type: string
          rate_per_match?: number | null
          tournament_id: string
        }
        Update: {
          contact_info?: string | null
          id?: string
          matches_assigned?: number | null
          official_name?: string
          official_type?: string
          rate_per_match?: number | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_officials_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_sponsors: {
        Row: {
          created_at: string | null
          id: string
          sponsor_amount: number | null
          sponsor_logo_url: string | null
          sponsor_name: string
          sponsor_type: string | null
          tournament_id: string
          visibility_package: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sponsor_amount?: number | null
          sponsor_logo_url?: string | null
          sponsor_name: string
          sponsor_type?: string | null
          tournament_id: string
          visibility_package?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sponsor_amount?: number | null
          sponsor_logo_url?: string | null
          sponsor_name?: string
          sponsor_type?: string | null
          tournament_id?: string
          visibility_package?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_sponsors_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_teams: {
        Row: {
          id: string
          payment_status: string | null
          registration_date: string | null
          team_id: string
          tournament_id: string
        }
        Insert: {
          id?: string
          payment_status?: string | null
          registration_date?: string | null
          team_id: string
          tournament_id: string
        }
        Update: {
          id?: string
          payment_status?: string | null
          registration_date?: string | null
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          ball_type: string
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          logo_url: string | null
          max_teams: number | null
          name: string
          organizer_contact: string | null
          organizer_email: string | null
          organizer_name: string
          prize_money: number | null
          registration_fee: number | null
          rules: string | null
          start_date: string
          status: string
          tournament_style: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          ball_type: string
          category: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          logo_url?: string | null
          max_teams?: number | null
          name: string
          organizer_contact?: string | null
          organizer_email?: string | null
          organizer_name: string
          prize_money?: number | null
          registration_fee?: number | null
          rules?: string | null
          start_date: string
          status?: string
          tournament_style: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          ball_type?: string
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          logo_url?: string | null
          max_teams?: number | null
          name?: string
          organizer_contact?: string | null
          organizer_email?: string | null
          organizer_name?: string
          prize_money?: number | null
          registration_fee?: number | null
          rules?: string | null
          start_date?: string
          status?: string
          tournament_style?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          capacity: number | null
          city: string | null
          contact_number: string | null
          contact_person: string | null
          cost_per_match: number | null
          created_at: string | null
          facilities: string[] | null
          id: string
          location: string
          name: string
          photos: string[] | null
          pitch_type: string | null
          rating: number | null
          total_matches: number | null
        }
        Insert: {
          capacity?: number | null
          city?: string | null
          contact_number?: string | null
          contact_person?: string | null
          cost_per_match?: number | null
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          location: string
          name: string
          photos?: string[] | null
          pitch_type?: string | null
          rating?: number | null
          total_matches?: number | null
        }
        Update: {
          capacity?: number | null
          city?: string | null
          contact_number?: string | null
          contact_person?: string | null
          cost_per_match?: number | null
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          location?: string
          name?: string
          photos?: string[] | null
          pitch_type?: string | null
          rating?: number | null
          total_matches?: number | null
        }
        Relationships: []
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
