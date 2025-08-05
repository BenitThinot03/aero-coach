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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      AIMessageLog: {
        Row: {
          content: string
          id: string
          messagetype: string
          timestamp: string | null
          userid: string
        }
        Insert: {
          content: string
          id: string
          messagetype: string
          timestamp?: string | null
          userid: string
        }
        Update: {
          content?: string
          id?: string
          messagetype?: string
          timestamp?: string | null
          userid?: string
        }
        Relationships: []
      }
      Exercise: {
        Row: {
          category: string
          id: string
          name: string
          type: string
          videourl: string | null
        }
        Insert: {
          category: string
          id: string
          name: string
          type: string
          videourl?: string | null
        }
        Update: {
          category?: string
          id?: string
          name?: string
          type?: string
          videourl?: string | null
        }
        Relationships: []
      }
      Measurement: {
        Row: {
          arm: number | null
          bodyfat: number | null
          chest: number | null
          date: string
          id: string
          userid: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          arm?: number | null
          bodyfat?: number | null
          chest?: number | null
          date: string
          id: string
          userid: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arm?: number | null
          bodyfat?: number | null
          chest?: number | null
          date?: string
          id?: string
          userid?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      NutritionEntry: {
        Row: {
          calories: number
          carbs: number
          date: string
          fats: number
          fooditems: string
          id: string
          mealtype: string
          protein: number
          sugar: number | null
          userid: string
          vitamins: string | null
        }
        Insert: {
          calories: number
          carbs: number
          date: string
          fats: number
          fooditems: string
          id: string
          mealtype: string
          protein: number
          sugar?: number | null
          userid: string
          vitamins?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          date?: string
          fats?: number
          fooditems?: string
          id?: string
          mealtype?: string
          protein?: number
          sugar?: number | null
          userid?: string
          vitamins?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          email: string | null
          fitness_goal: string | null
          height: number | null
          id: string
          name: string | null
          units_preference: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string | null
          fitness_goal?: string | null
          height?: number | null
          id?: string
          name?: string | null
          units_preference?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string | null
          fitness_goal?: string | null
          height?: number | null
          id?: string
          name?: string | null
          units_preference?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      WorkoutEntry: {
        Row: {
          exerciseid: string
          id: string
          notes: string | null
          reps: number
          sets: number
          weight: number
          workoutsessionid: string
        }
        Insert: {
          exerciseid: string
          id: string
          notes?: string | null
          reps: number
          sets: number
          weight: number
          workoutsessionid: string
        }
        Update: {
          exerciseid?: string
          id?: string
          notes?: string | null
          reps?: number
          sets?: number
          weight?: number
          workoutsessionid?: string
        }
        Relationships: [
          {
            foreignKeyName: "WorkoutEntry_exerciseid_fkey"
            columns: ["exerciseid"]
            isOneToOne: false
            referencedRelation: "Exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "WorkoutEntry_workoutsessionid_fkey"
            columns: ["workoutsessionid"]
            isOneToOne: false
            referencedRelation: "WorkoutSession"
            referencedColumns: ["id"]
          },
        ]
      }
      WorkoutSession: {
        Row: {
          caloriesburned: number | null
          date: string
          duration: number | null
          id: string
          notes: string | null
          userid: string
        }
        Insert: {
          caloriesburned?: number | null
          date: string
          duration?: number | null
          id: string
          notes?: string | null
          userid: string
        }
        Update: {
          caloriesburned?: number | null
          date?: string
          duration?: number | null
          id?: string
          notes?: string | null
          userid?: string
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
