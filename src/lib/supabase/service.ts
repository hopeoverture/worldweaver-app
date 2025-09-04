import { createClient } from '@/lib/supabase/client'
import type { 
  World, 
  Profile, 
  CardType, 
  Card, 
  Folder,
  CardTypeTemplate,
  SearchParams,
  PaginatedResponse 
} from '@/types/entities'

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
    
    // Set up default folders, card types, and starter cards for the new world
    try {
      const { error: setupError } = await supabase.rpc('setup_world_defaults', {
        p_world_id: data.id,
        p_user_id: world.owner_id
      })
      
      if (setupError) {
        console.error('Error setting up world defaults:', setupError)
        // Don't throw here - the world was created successfully, 
        // just the defaults failed to set up
      }
    } catch (setupErr) {
      console.error('Error calling setup_world_defaults:', setupErr)
    }
    
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

  async getCardTypeTemplates(): Promise<CardTypeTemplate[]> {
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
    try {
      console.log('getFolders called with worldId:', worldId)
      
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('world_id', worldId)
        .order('position', { ascending: true })
      
      if (error) {
        console.error('Supabase error in getFolders:', JSON.stringify(error, null, 2))
        throw error
      }
      
      console.log('getFolders success, returned:', data?.length, 'folders')
      return data || []
    } catch (err) {
      console.error('Error in folderService.getFolders:', JSON.stringify(err, null, 2))
      throw err
    }
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
    try {
      console.log('getCards called with worldId:', worldId, 'params:', params)
      
      // If there's a search query, use the search function for better relevance
      if (params?.query && params.query.trim()) {
        return await this.searchCards(worldId, params)
      }
      
      let query = supabase
        .from('cards')
        .select(`
          *,
          type:card_types(id, name, icon, color),
          folder:folders(id, name, color),
          data:card_data(id, field_key, value)
        `, { count: 'exact' })
        .eq('world_id', worldId)

      // Apply filters
      if (params?.type_ids?.length) {
        query = query.in('type_id', params.type_ids)
      }
      
      if (params?.folder_ids?.length) {
        query = query.in('folder_id', params.folder_ids)
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
      
      if (error) {
        console.error('Supabase error in getCards:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('getCards success, returned:', data?.length, 'cards')
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        has_more: ((count || 0) > to + 1)
      }
    } catch (err) {
      console.error('Error in cardService.getCards:', JSON.stringify(err, null, 2))
      throw err
    }
  },

  async searchCards(worldId: string, params: SearchParams): Promise<PaginatedResponse<Card>> {
    try {
      console.log('searchCards called with worldId:', worldId, 'params:', params)
      
      const searchTerm = params.query?.trim() || ''
      if (!searchTerm) {
        return this.getCards(worldId, { ...params, query: undefined })
      }

      const { data, error } = await supabase
        .rpc('search_cards', {
          search_term: searchTerm,
          target_world_id: worldId,
          card_type_filter: params.type_ids?.[0] || null,
          folder_filter: params.folder_ids?.[0] || null,
          limit_count: params.limit || 50
        })
      
      if (error) {
        console.error('Search error:', error)
        throw error
      }

      // Apply additional filters if multiple types/folders
      let filteredData = data || []
      
      if (params.type_ids && params.type_ids.length > 1) {
        filteredData = filteredData.filter((card: any) => 
          params.type_ids!.includes(card.type_id)
        )
      }
      
      if (params.folder_ids && params.folder_ids.length > 1) {
        filteredData = filteredData.filter((card: any) => 
          params.folder_ids!.includes(card.folder_id)
        )
      }

      // Apply pagination to search results
      const page = params.page || 1
      const limit = params.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const paginatedData = filteredData.slice(from, to + 1)
      
      return {
        data: paginatedData,
        total: filteredData.length,
        page,
        limit,
        has_more: filteredData.length > to + 1
      }
    } catch (err) {
      console.error('Error in cardService.searchCards:', err)
      throw err
    }
  },

  async getCard(cardId: string): Promise<Card | null> {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        type:card_types(id, name, icon, color, schema),
        folder:folders(id, name, color),
        data:card_data(id, field_key, value),
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
        world_id: card.world_id,
        type_id: card.type_id,
        folder_id: card.folder_id,
        title: card.title || card.name,  // Use title if provided, otherwise use name
        name: card.name,
        slug,
        summary: card.summary || null,
        cover_image_url: card.cover_image_url || null,
        position: card.position || 0,
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
  },

  // Card data methods
  async updateCardData(cardId: string, fieldKey: string, value: unknown): Promise<void> {
    const { error } = await supabase
      .from('card_data')
      .upsert({
        card_id: cardId,
        field_key: fieldKey,
        value: { value },
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
  },

  async deleteCardData(cardId: string, fieldKey: string): Promise<void> {
    const { error } = await supabase
      .from('card_data')
      .delete()
      .eq('card_id', cardId)
      .eq('field_key', fieldKey)
    
    if (error) throw error
  },

  async getCardData(cardId: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('card_data')
      .select('field_key, value')
      .eq('card_id', cardId)
    
    if (error) throw error
    
    // Convert array to object
    const result: Record<string, unknown> = {}
    data?.forEach(item => {
      result[item.field_key] = item.value?.value
    })
    return result
  }
}

// Search utilities
export const searchService = {
  async searchCards(worldId: string, searchTerm: string, options?: {
    cardTypeFilter?: string
    folderFilter?: string
    limit?: number
  }): Promise<Card[]> {
    const { data, error } = await supabase
      .rpc('search_cards', {
        search_term: searchTerm,
        target_world_id: worldId,
        card_type_filter: options?.cardTypeFilter || null,
        folder_filter: options?.folderFilter || null,
        limit_count: options?.limit || 50
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
