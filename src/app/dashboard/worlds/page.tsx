'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Grid, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CreateWorldModal from '@/components/worlds/create-world-modal'
import WorldCard from '@/components/worlds/world-card'
import { Loading } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import { useAuth } from '@/contexts/auth-context'
import type { World } from '@/types/entities'

export default function WorldsPage() {
  const [worlds, setWorlds] = useState<World[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { success: showSuccess, error: showError } = useToastHelpers()
  const { user } = useAuth()

  const loadWorlds = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const worlds = await supabaseService.world.getUserWorlds(user.id)
      setWorlds(worlds)
    } catch (error) {
      showError('Failed to load worlds')
      console.error('Error loading worlds:', error)
    } finally {
      setLoading(false)
    }
  }, [user, showError])

  // Load worlds
  useEffect(() => {
    loadWorlds()
  }, [loadWorlds])

  const handleWorldCreated = (newWorld: World) => {
    setWorlds(prev => [newWorld, ...prev])
    setShowCreateModal(false)
    // Success toast is already shown in the modal
  }

  const handleDeleteWorld = async (world: World) => {
    if (!confirm(`Are you sure you want to delete "${world.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await supabaseService.world.deleteWorld(world.id)
      setWorlds(prev => prev.filter(w => w.id !== world.id))
      showSuccess('World deleted successfully')
    } catch (error) {
      showError('Failed to delete world')
      console.error('Error deleting world:', error)
    }
  }

  // Filter worlds based on search
  const filteredWorlds = worlds.filter(world =>
    world.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (world.summary?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Worlds</h1>
          <p className="text-slate-400">
            Create and manage your worldbuilding projects
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create World
        </Button>
      </div>

      {/* Stats */}
      {worlds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-slate-100">{worlds.length}</div>
            <div className="text-sm text-slate-400">Total Worlds</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-slate-100">
              {worlds.filter(w => w.visibility === 'public').length}
            </div>
            <div className="text-sm text-slate-400">Public Worlds</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-slate-100">
              {worlds.reduce((sum, w) => sum + (w.card_count || 0), 0)}
            </div>
            <div className="text-sm text-slate-400">Total Cards</div>
          </div>
        </div>
      )}

      {/* Search and View Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search worlds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">
            {filteredWorlds.length} result{filteredWorlds.length !== 1 ? 's' : ''} for
          </span>
          <Badge variant="outline">&quot;{searchQuery}&quot;</Badge>
          {filteredWorlds.length !== worlds.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Worlds Grid/List */}
      {filteredWorlds.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <div>
              <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">
                No worlds found
              </h3>
              <p className="text-slate-400 mb-4">
                Try adjusting your search terms or create a new world.
              </p>
              <Button onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-lg font-medium text-slate-100 mb-2">
                No worlds yet
              </h3>
              <p className="text-slate-400 mb-6">
                Create your first world to start organizing your worldbuilding content.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First World
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredWorlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              onEdit={() => {}} // TODO: Implement edit functionality
              onDelete={handleDeleteWorld}
            />
          ))}
        </div>
      )}

      {/* Create World Modal */}
      <CreateWorldModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorldCreated={handleWorldCreated}
      />
    </div>
  )
}
