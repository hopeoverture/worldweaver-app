// Test database connection
import { supabaseService } from '@/lib/supabase/service'

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic world query
    const worlds = await supabaseService.world.getWorlds()
    console.log('Worlds loaded:', worlds)
    
    if (worlds.length > 0) {
      const worldId = worlds[0].id
      console.log('Testing with world ID:', worldId)
      
      // Test card types
      try {
        const cardTypes = await supabaseService.cardType.getCardTypes(worldId)
        console.log('Card types loaded:', cardTypes)
      } catch (err) {
        console.error('Error loading card types:', err)
      }
      
      // Test folders
      try {
        const folders = await supabaseService.folder.getFolders(worldId)
        console.log('Folders loaded:', folders)
      } catch (err) {
        console.error('Error loading folders:', err)
      }
      
      // Test cards
      try {
        const cards = await supabaseService.card.getCards(worldId)
        console.log('Cards loaded:', cards)
      } catch (err) {
        console.error('Error loading cards:', err)
      }
    }
    
  } catch (err) {
    console.error('Database connection test failed:', err)
  }
}

// Call this in the browser console to test
if (typeof window !== 'undefined') {
  (window as any).testDatabase = testDatabaseConnection
}
