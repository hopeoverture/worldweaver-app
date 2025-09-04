// Core entity types for WorldWeaver application
// These types represent the main entities users work with

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string // Matches auth.users.id
  display_name: string | null
  avatar_url: string | null
  plan: string
  ai_credits_used: number
  storage_bytes_used: number
  created_at: string
  updated_at: string
}

export interface World {
  id: string
  owner_id: string
  title: string
  genre?: string | null
  summary: string | null
  visibility: 'private' | 'shared' | 'public'
  created_at: string
  updated_at: string
  
  // Computed/joined fields
  owner?: Profile
  member_count?: number
  card_count?: number
  last_activity?: string
}

export interface WorldMember {
  id: string
  world_id: string
  user_id: string
  role: 'viewer' | 'editor' | 'admin'
  joined_at: string
  
  // Joined fields
  user?: Profile
  world?: World
}

export interface Folder {
  id: string
  world_id: string
  name: string
  description: string | null
  parent_id: string | null
  color: string
  position: number
  created_at: string
  updated_at: string
  
  // Computed fields
  card_count?: number
  children?: Folder[]
  parent?: Folder
}

export interface CardType {
  id: string
  world_id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  schema: FieldSchema[]
  created_at: string
  updated_at: string
  
  // Computed fields
  card_count?: number
}

export interface Card {
  id: string
  world_id: string
  type_id: string
  folder_id: string | null
  name: string
  slug: string
  cover_image_url: string | null
  summary: string | null
  position: number
  created_at: string
  updated_at: string
  
  // Joined fields
  type?: CardType
  folder?: Folder
  data?: CardData[]
  links?: CardLink[]
  comments?: Comment[]
}

export interface CardData {
  id: string
  card_id: string
  field_key: string
  value: any // JSON value
  created_at: string
  updated_at: string
}

export interface CardLink {
  id: string
  from_card_id: string
  to_card_id: string
  relationship_type: string | null
  description: string | null
  created_at: string
  
  // Joined fields
  from_card?: Card
  to_card?: Card
}

export interface Comment {
  id: string
  card_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
  
  // Joined fields
  user?: Profile
  replies?: Comment[]
  parent?: Comment
}

export interface AiJob {
  id: string
  world_id: string
  user_id: string
  type: 'generate_field' | 'generate_image' | 'batch_generate'
  status: 'pending' | 'running' | 'completed' | 'failed'
  input_data: any // JSON
  output_data: any | null // JSON
  error_message: string | null
  tokens_used: number | null
  cost_cents: number | null
  created_at: string
  completed_at: string | null
  
  // Joined fields
  user?: Profile
  world?: World
}

export interface UsageEvent {
  id: string
  user_id: string
  event_type: 'api_call' | 'export' | 'ai_generation'
  tokens_used: number | null
  cost_cents: number | null
  metadata: any | null // JSON
  created_at: string
  
  // Joined fields
  user?: Profile
}

// Field schema types for dynamic card types
export interface FieldSchema {
  key: string
  label: string
  kind: FieldKind
  required: boolean
  description?: string
  default_value?: any
  validation?: FieldValidation
  options?: string[] // For select fields
  ref_type?: string // For reference fields
  ai_prompt?: string // For AI-assisted fields
}

export type FieldKind = 
  | 'text'
  | 'long_text' 
  | 'rich_text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'datetime'
  | 'url'
  | 'email'
  | 'image'
  | 'file'
  | 'reference'
  | 'location'
  | 'color'

export interface FieldValidation {
  min?: number
  max?: number
  pattern?: string
  message?: string
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// Search and filter types
export interface SearchParams {
  query?: string
  type_ids?: string[]
  folder_ids?: string[]
  tags?: string[]
  created_after?: string
  created_before?: string
  updated_after?: string
  updated_before?: string
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'position'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface FilterState {
  query: string
  types: string[]
  folders: string[]
  tags: string[]
  dateRange: {
    start: string | null
    end: string | null
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

// UI State types
export interface ViewState {
  layout: 'grid' | 'list' | 'table'
  sidebar_open: boolean
  selected_items: string[]
  bulk_action_mode: boolean
}

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}
