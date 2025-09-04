// Database types based on the actual schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          byo_openrouter_key: string | null;
          byo_openai_key: string | null;
          plan: string;
          ai_credits_used: number;
          storage_bytes_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          byo_openrouter_key?: string | null;
          byo_openai_key?: string | null;
          plan?: string;
          ai_credits_used?: number;
          storage_bytes_used?: number;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          byo_openrouter_key?: string | null;
          byo_openai_key?: string | null;
          plan?: string;
          ai_credits_used?: number;
          storage_bytes_used?: number;
        };
      };
      worlds: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          genre: string | null;
          summary: string | null;
          visibility: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          genre?: string | null;
          summary?: string | null;
          visibility?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          genre?: string | null;
          summary?: string | null;
          visibility?: string;
        };
      };
      world_members: {
        Row: {
          world_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          world_id: string;
          user_id: string;
          role: string;
        };
        Update: {
          world_id?: string;
          user_id?: string;
          role?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          world_id: string;
          parent_id: string | null;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          world_id: string;
          parent_id?: string | null;
          name: string;
        };
        Update: {
          id?: string;
          world_id?: string;
          parent_id?: string | null;
          name?: string;
        };
      };
      card_types: {
        Row: {
          id: string;
          world_id: string;
          name: string;
          icon: string | null;
          color: string | null;
          schema: CardFieldSchema[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          world_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          schema: CardFieldSchema[];
        };
        Update: {
          id?: string;
          world_id?: string;
          name?: string;
          icon?: string | null;
          color?: string | null;
          schema?: CardFieldSchema[];
        };
      };
      cards: {
        Row: {
          id: string;
          world_id: string;
          folder_id: string | null;
          type_id: string;
          title: string;
          slug: string;
          fields: Record<string, any>;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          world_id: string;
          folder_id?: string | null;
          type_id: string;
          title: string;
          slug: string;
          fields?: Record<string, any>;
          cover_image_url?: string | null;
        };
        Update: {
          id?: string;
          world_id?: string;
          folder_id?: string | null;
          type_id?: string;
          title?: string;
          slug?: string;
          fields?: Record<string, any>;
          cover_image_url?: string | null;
        };
      };
      card_links: {
        Row: {
          id: string;
          world_id: string;
          from_card: string;
          to_card: string;
          label: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          world_id: string;
          from_card: string;
          to_card: string;
          label: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          world_id?: string;
          from_card?: string;
          to_card?: string;
          label?: string;
          note?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          world_id: string;
          card_id: string | null;
          author_id: string | null;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          world_id: string;
          card_id?: string | null;
          author_id?: string | null;
          body: string;
        };
        Update: {
          id?: string;
          world_id?: string;
          card_id?: string | null;
          author_id?: string | null;
          body?: string;
        };
      };
      ai_jobs: {
        Row: {
          id: string;
          world_id: string | null;
          user_id: string | null;
          kind: string;
          payload: Record<string, any>;
          status: string;
          progress: number;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          world_id?: string | null;
          user_id?: string | null;
          kind: string;
          payload: Record<string, any>;
          status?: string;
          progress?: number;
          error?: string | null;
        };
        Update: {
          id?: string;
          world_id?: string | null;
          user_id?: string | null;
          kind?: string;
          payload?: Record<string, any>;
          status?: string;
          progress?: number;
          error?: string | null;
        };
      };
      usage_events: {
        Row: {
          id: string;
          user_id: string;
          world_id: string | null;
          event: string;
          quantity: number;
          meta: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          world_id?: string | null;
          event: string;
          quantity?: number;
          meta?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          world_id?: string | null;
          event?: string;
          quantity?: number;
          meta?: Record<string, any>;
        };
      };
    };
    Functions: {
      search_cards: {
        Args: {
          search_term: string;
          target_world_id: string;
          card_type_filter?: string;
          folder_filter?: string;
          limit_count?: number;
        };
        Returns: {
          id: string;
          world_id: string;
          folder_id: string | null;
          type_id: string;
          title: string;
          slug: string;
          fields: Record<string, any>;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
          rank: number;
        }[];
      };
      get_world_summary: {
        Args: {
          target_world_id: string;
        };
        Returns: {
          world_title: string;
          world_genre: string | null;
          world_summary: string | null;
          card_count: number;
          recent_cards: Record<string, any>;
        }[];
      };
      get_linked_cards: {
        Args: {
          target_card_id: string;
        };
        Returns: {
          id: string;
          title: string;
          card_type: string;
          relationship_label: string;
          direction: string;
          fields: Record<string, any>;
        }[];
      };
      check_relationship_limit: {
        Args: {
          target_card_id: string;
        };
        Returns: boolean;
      };
      get_user_limits: {
        Args: {
          target_user_id: string;
        };
        Returns: {
          plan: string;
          worlds_limit: number;
          cards_limit: number;
          seats_limit: number;
          ai_credits_limit: number;
          storage_gb_limit: number;
          current_worlds: number;
          current_cards: number;
          current_ai_credits: number;
          current_storage_bytes: number;
        }[];
      };
    };
  };
}

// Application types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type World = Database['public']['Tables']['worlds']['Row'];
export type CardType = Database['public']['Tables']['card_types']['Row'];
export type Folder = Database['public']['Tables']['folders']['Row'];
export type Card = Database['public']['Tables']['cards']['Row'];
export type CardLink = Database['public']['Tables']['card_links']['Row'];

// Field types for card schemas
export type FieldKind = 
  | 'short_text'
  | 'long_text'
  | 'rich_text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'reference'
  | 'image'
  | 'url';

export interface CardFieldSchema {
  key: string;
  label: string;
  kind: FieldKind;
  description?: string;
  required?: boolean;
  default?: any;
  options?: string[]; // for select/multi_select
  validation?: {
    regex?: string;
    min?: number;
    max?: number;
  };
  ref_type?: string; // for reference fields
  ai_prompt?: string;
  visibility?: 'basic' | 'advanced';
}

// Plan types
export type PlanName = 'free' | 'starter' | 'creator' | 'pro' | 'studio';

export interface PlanLimits {
  worlds: number;
  cards: number;
  seats: number;
  ai_credits: number;
  storage_gb: number;
}

// AI types
export type AIJobKind = 'field_text' | 'image_token' | 'batch' | 'export_zip';
export type AIJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface AIJob {
  id: string;
  world_id: string;
  user_id: string;
  kind: AIJobKind;
  payload: Record<string, any>;
  status: AIJobStatus;
  progress: number;
  error?: string;
  created_at: string;
  updated_at: string;
}
