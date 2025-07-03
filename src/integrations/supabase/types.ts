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
          tournament: string | null
          venue: string
        }
        Insert: {
          created_at?: string
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
          tournament?: string | null
          venue: string
        }
        Update: {
          created_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
