import { createClient } from '@/lib/supabase/client'
import type { 
  World, 
  Profile, 
  CardType, 
  Card, 
  Folder,
  CardLink,
  Comment,
  AiJob,
  SearchParams,
  PaginatedResponse 
} from '@/types/entities'
import type { Database } from '@/types/database'

const supabase = createClient()

// Profile utilities
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createProfile(profile: Omit<Profile, 'updated_at'>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// World utilities
export const worldService = {
  async getUserWorlds(userId: string): Promise<World[]> {
    console.log('getUserWorlds called with userId:', userId)
    
    try {
      // First, let's try a simple query without joins
      const { data, error } = await supabase
        .from('worlds')
        .select('*')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false })
      
      console.log('Supabase query result:', { data, error })
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      return data || []
    } catch (err) {
      console.error('Error in getUserWorlds:', err)
      throw err
    }
  },

  async getWorld(worldId: string): Promise<World | null> {
    const { data, error } = await supabase
      .from('worlds')
      .select('*')
      .eq('id', worldId)
      .single()
    
    if (error) {
      // If the error is "not found", return null instead of throwing
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return null
      }
      throw error
    }
    return data
  },

  async createWorld(world: Omit<World, 'id' | 'created_at' | 'updated_at'>): Promise<World> {
    const { data, error } = await supabase
      .from('worlds')
      .insert({
        ...world,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateWorld(worldId: string, updates: Partial<World>): Promise<World> {
    const { data, error } = await supabase
      .from('worlds')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', worldId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteWorld(worldId: string): Promise<void> {
    const { error } = await supabase
      .from('worlds')
      .delete()
      .eq('id', worldId)
    
    if (error) throw error
  }
}

// Card Type utilities
export const cardTypeService = {
  async getCardTypes(worldId: string): Promise<CardType[]> {
    const { data, error } = await supabase
      .from('card_types')
      .select('*')
      .eq('world_id', worldId)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getCardTypeTemplates(): Promise<any[]> {
    const { data, error } = await supabase
      .from('card_type_templates')
      .select('*')
      .order('category, name')
    
    if (error) throw error
    return data || []
  },

  async createCardTypeFromTemplate(templateId: string, worldId: string, customName?: string): Promise<CardType> {
    // First get the template
    const { data: template, error: templateError } = await supabase
      .from('card_type_templates')
      .select('*')
      .eq('id', templateId)
      .single()
    
    if (templateError) throw templateError
    if (!template) throw new Error('Template not found')
    
    // Create card type from template
    const cardType = {
      world_id: worldId,
      name: customName || template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      schema: template.schema
    }
    
    return this.createCardType(cardType)
  },

  async getCardType(typeId: string): Promise<CardType | null> {
    const { data, error } = await supabase
      .from('card_types')
      .select('*')
      .eq('id', typeId)
      .single()
    
    if (error) throw error
    return data
  },

  async createCardType(cardType: Omit<CardType, 'id' | 'created_at' | 'updated_at'>): Promise<CardType> {
    const { data, error } = await supabase
      .from('card_types')
      .insert({
        ...cardType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateCardType(typeId: string, updates: Partial<CardType>): Promise<CardType> {
    const { data, error } = await supabase
      .from('card_types')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', typeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCardType(typeId: string): Promise<void> {
    const { error } = await supabase
      .from('card_types')
      .delete()
      .eq('id', typeId)
    
    if (error) throw error
  },

  // Use the seed function to copy templates
  async copyTemplate(templateName: string, worldId: string, newName?: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('copy_card_type_template', {
        template_name: templateName,
        target_world_id: worldId,
        new_name: newName
      })
    
    if (error) throw error
    return data // Returns the new card type ID
  }
}

// Folder utilities
export const folderService = {
  async getFolders(worldId: string): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select(`
        *,
        cards(count)
      `)
      .eq('world_id', worldId)
      .order('position')
    
    if (error) throw error
    return data || []
  },

  async createFolder(folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        ...folder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateFolder(folderId: string, updates: Partial<Folder>): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', folderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteFolder(folderId: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
    
    if (error) throw error
  }
}

// Card utilities
export const cardService = {
  async getCards(worldId: string, params?: SearchParams): Promise<PaginatedResponse<Card>> {
    let query = supabase
      .from('cards')
      .select(`
        *,
        type:card_types(id, name, icon, color),
        folder:folders(id, name, color)
      `, { count: 'exact' })
      .eq('world_id', worldId)

    // Apply filters
    if (params?.type_ids?.length) {
      query = query.in('type_id', params.type_ids)
    }
    
    if (params?.folder_ids?.length) {
      query = query.in('folder_id', params.folder_ids)
    }

    if (params?.query) {
      query = query.textSearch('name', params.query)
    }

    // Apply sorting
    const sortBy = params?.sort_by || 'updated_at'
    const sortOrder = params?.sort_order || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const page = params?.page || 1
    const limit = params?.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    query = query.range(from, to)

    const { data, error, count } = await query
    
    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      has_more: ((count || 0) > to + 1)
    }
  },

  async getCard(cardId: string): Promise<Card | null> {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        type:card_types(id, name, icon, color, schema),
        folder:folders(id, name, color),
        card_data(*),
        card_links_from:card_links!from_card_id(
          *,
          to_card:cards(id, name, type:card_types(name, icon, color))
        ),
        card_links_to:card_links!to_card_id(
          *,
          from_card:cards(id, name, type:card_types(name, icon, color))
        )
      `)
      .eq('id', cardId)
      .single()
    
    if (error) throw error
    return data
  },

  async createCard(card: Omit<Card, 'id' | 'slug' | 'created_at' | 'updated_at'>): Promise<Card> {
    // Generate slug from name
    const slug = card.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('cards')
      .insert({
        ...card,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateCard(cardId: string, updates: Partial<Card>): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cardId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
    
    if (error) throw error
  }
}

// Search utilities
export const searchService = {
  async searchCards(worldId: string, query: string, limit = 10): Promise<Card[]> {
    const { data, error } = await supabase
      .rpc('search_cards', {
        world_id: worldId,
        search_query: query,
        result_limit: limit
      })
    
    if (error) throw error
    return data || []
  },

  async getWorldSummary(worldId: string) {
    const { data, error } = await supabase
      .rpc('get_world_summary', {
        world_id: worldId
      })
    
    if (error) throw error
    return data
  }
}

// Export all services
export const supabaseService = {
  profile: profileService,
  world: worldService,
  cardType: cardTypeService,
  folder: folderService,
  card: cardService,
  search: searchService,
}
