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
export type ConversationStatus = "pending" | "accepted" | "declined";

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
          points: number;
          member_no: number | null;
          is_admin: boolean;
          banned: boolean;
          banned_until: string | null;
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
          points?: number;
          member_no?: number | null;
          is_admin?: boolean;
          banned?: boolean;
          banned_until?: string | null;
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
          dues: number | null;
          bills_included: boolean;
          room_count: number;
          total_rooms: number | null;
          flatmates_count: number | null;
          capacity: number;
          occupied: number;
          bathroom_count: number | null;
          close_reason: string | null;
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
          dues?: number | null;
          bills_included?: boolean;
          room_count?: number;
          total_rooms?: number | null;
          flatmates_count?: number | null;
          capacity?: number;
          occupied?: number;
          bathroom_count?: number | null;
          close_reason?: string | null;
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
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          position?: number;
          category?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_photos"]["Insert"]>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string;
          seeker_id: string;
          host_id: string;
          status: ConversationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          seeker_id: string;
          host_id: string;
          status?: ConversationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [];
      };
      referral_codes: {
        Row: {
          code: string;
          owner_id: string;
          used_by: string | null;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          code: string;
          owner_id: string;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["referral_codes"]["Insert"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          listing_id: string | null;
          reason: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          listing_id?: string | null;
          reason: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
        Relationships: [];
      };
      banned_emails: {
        Row: { email: string; created_at: string };
        Insert: { email: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["banned_emails"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      compatibility_scores: {
        Args: { other_users: string[] };
        Returns: { user_id: string; score: number }[];
      };
      ban_user: {
        Args: { target: string; until?: string | null };
        Returns: undefined;
      };
      unban_user: {
        Args: { target: string };
        Returns: undefined;
      };
      conversation_other_answers: {
        Args: { conv_id: string };
        Returns: { question_id: number; value: number }[];
      };
    };
    Enums: {
      user_role: UserRole;
      listing_status: ListingStatus;
      conversation_status: ConversationStatus;
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
export type Conversation = Tables["conversations"]["Row"];
export type Message = Tables["messages"]["Row"];
export type ReferralCode = Tables["referral_codes"]["Row"];
export type Report = Tables["reports"]["Row"];

export type QuestionOption = { value: number; label: string };
