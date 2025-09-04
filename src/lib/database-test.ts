import { createClient } from '@/lib/supabase/client';

// Utility functions to test database operations
export class DatabaseTest {
  private supabase = createClient();

  async testConnection() {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .select('count')
        .single();
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  }

  async testWorldCreation(userId: string) {
    try {
      const { data: world, error } = await this.supabase
        .from('worlds')
        .insert({
          owner_id: userId,
          title: 'Test World',
          genre: 'Fantasy',
          summary: 'A test world for development'
        })
        .select()
        .single();

      if (error) {
        console.error('World creation test failed:', error);
        return null;
      }

      console.log('World created successfully:', world);
      return world;
    } catch (error) {
      console.error('World creation test error:', error);
      return null;
    }
  }

  async testCardTypeCreation(worldId: string) {
    try {
      const characterSchema = [
        {
          key: 'name',
          label: 'Character Name',
          kind: 'short_text',
          required: true
        },
        {
          key: 'race',
          label: 'Race',
          kind: 'select',
          options: ['Human', 'Elf', 'Dwarf', 'Halfling'],
          required: false
        },
        {
          key: 'description',
          label: 'Description',
          kind: 'long_text',
          required: false
        }
      ];

      const { data: cardType, error } = await this.supabase
        .from('card_types')
        .insert({
          world_id: worldId,
          name: 'Character',
          icon: 'User',
          color: '#3B82F6',
          schema: characterSchema
        })
        .select()
        .single();

      if (error) {
        console.error('Card type creation test failed:', error);
        return null;
      }

      console.log('Card type created successfully:', cardType);
      return cardType;
    } catch (error) {
      console.error('Card type creation test error:', error);
      return null;
    }
  }

  async testSearchFunction(worldId: string) {
    try {
      const { data, error } = await this.supabase
        .rpc('search_cards', {
          search_term: 'test',
          target_world_id: worldId,
          limit_count: 10
        });

      if (error) {
        console.error('Search function test failed:', error);
        return false;
      }

      console.log('Search function working:', data);
      return true;
    } catch (error) {
      console.error('Search function test error:', error);
      return false;
    }
  }

  async testUserLimits(userId: string) {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_limits', {
          target_user_id: userId
        });

      if (error) {
        console.error('User limits function test failed:', error);
        return false;
      }

      console.log('User limits function working:', data);
      return true;
    } catch (error) {
      console.error('User limits function test error:', error);
      return false;
    }
  }

  async runAllTests(userId: string) {
    console.log('Starting database tests...');
    
    // Test connection
    const connectionOk = await this.testConnection();
    if (!connectionOk) return false;

    // Test world creation
    const world = await this.testWorldCreation(userId);
    if (!world) return false;

    // Test card type creation
    const cardType = await this.testCardTypeCreation(world.id);
    if (!cardType) return false;

    // Test search function
    const searchOk = await this.testSearchFunction(world.id);
    if (!searchOk) return false;

    // Test user limits
    const limitsOk = await this.testUserLimits(userId);
    if (!limitsOk) return false;

    console.log('All database tests passed!');
    return true;
  }
}
