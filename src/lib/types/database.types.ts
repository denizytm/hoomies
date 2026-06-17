// Hand-authored to match supabase/migrations. Regenerate with `npm run db:types`
// once the local stack is running to keep this in exact sync with the database.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "host" | "seeker";
export type ListingStatus = "active" | "passive" | "matched" | "closed";

export type Database = {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string;
          name: string;
          city: string;
          domains: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          domains: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["universities"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          university_id: string | null;
          department: string | null;
          graduation_date: string | null;
          bio: string | null;
          avatar_url: string | null;
          role: UserRole | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          university_id?: string | null;
          department?: string | null;
          graduation_date?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      compatibility_categories: {
        Row: { id: number; slug: string; name: string; position: number };
        Insert: { id: number; slug: string; name: string; position: number };
        Update: Partial<Database["public"]["Tables"]["compatibility_categories"]["Insert"]>;
        Relationships: [];
      };
      compatibility_questions: {
        Row: {
          id: number;
          category_id: number;
          question: string;
          options: Json;
          position: number;
        };
        Insert: {
          id: number;
          category_id: number;
          question: string;
          options: Json;
          position: number;
        };
        Update: Partial<Database["public"]["Tables"]["compatibility_questions"]["Insert"]>;
        Relationships: [];
      };
      compatibility_answers: {
        Row: {
          user_id: string;
          question_id: number;
          value: number;
          answered_at: string;
        };
        Insert: {
          user_id: string;
          question_id: number;
          value: number;
          answered_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["compatibility_answers"]["Insert"]>;
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          monthly_rent: number;
          deposit: number | null;
          bills_included: boolean;
          room_count: number;
          total_rooms: number | null;
          flatmates_count: number | null;
          available_from: string | null;
          city: string;
          district: string;
          neighborhood: string | null;
          pets_allowed: boolean;
          furnished: boolean;
          gender_preference: string;
          features: Json;
          status: ListingStatus;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          monthly_rent: number;
          deposit?: number | null;
          bills_included?: boolean;
          room_count?: number;
          total_rooms?: number | null;
          flatmates_count?: number | null;
          available_from?: string | null;
          city: string;
          district: string;
          neighborhood?: string | null;
          pets_allowed?: boolean;
          furnished?: boolean;
          gender_preference?: string;
          features?: Json;
          status?: ListingStatus;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
        Relationships: [];
      };
      listing_photos: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          position?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_photos"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      compatibility_scores: {
        Args: { other_users: string[] };
        Returns: { user_id: string; score: number }[];
      };
    };
    Enums: {
      user_role: UserRole;
      listing_status: ListingStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};

// Convenience row aliases used across the app.
type Tables = Database["public"]["Tables"];
export type University = Tables["universities"]["Row"];
export type Profile = Tables["profiles"]["Row"];
export type CompatibilityCategory = Tables["compatibility_categories"]["Row"];
export type CompatibilityQuestion = Tables["compatibility_questions"]["Row"];
export type CompatibilityAnswer = Tables["compatibility_answers"]["Row"];
export type Listing = Tables["listings"]["Row"];
export type ListingPhoto = Tables["listing_photos"]["Row"];

export type QuestionOption = { value: number; label: string };
