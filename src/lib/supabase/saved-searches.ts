import { createClient } from '@supabase/supabase-js'
import type { SearchFilters } from '@/components/search/search-interface'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface SavedSearch {
  id: string
  user_id: string
  world_id: string
  name: string
  filters: SearchFilters
  created_at: string
  updated_at: string
}

export const savedSearchService = {
  async getSavedSearches(worldId: string): Promise<SavedSearch[]> {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('world_id', worldId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createSavedSearch(worldId: string, name: string, filters: SearchFilters): Promise<SavedSearch> {
    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        world_id: worldId,
        name,
        filters
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSavedSearch(id: string, updates: Partial<Pick<SavedSearch, 'name' | 'filters'>>): Promise<SavedSearch> {
    const { data, error } = await supabase
      .from('saved_searches')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSavedSearch(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
