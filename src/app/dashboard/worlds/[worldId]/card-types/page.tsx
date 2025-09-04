'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import CreateCardTypeModal from '@/components/card-types/create-card-type-modal'
import CardTypeCard from '@/components/card-types/card-type-card'
import { Loading } from '@/components/ui/loading'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import type { CardType, World } from '@/types/entities'

export default function CardTypesPage() {
  const params = useParams()
  const worldId = params.worldId as string
  
  const [world, setWorld] = useState<World | null>(null)
  const [cardTypes, setCardTypes] = useState<CardType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCardType, setEditingCardType] = useState<CardType | null>(null)
  
  const { success, error } = useToastHelpers()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      const worldData = await supabaseService.world.getWorld(worldId)
      if (!worldData) {
        error('World not found or you do not have access to it')
        return
      }
      setWorld(worldData)
      
      const cardTypesData = await supabaseService.cardType.getCardTypes(worldId)
      setCardTypes(cardTypesData)
    } catch (err) {
      console.error('Error loading data:', err)
      if (err instanceof Error && err.message.includes('not found')) {
        error('World not found')
      } else {
        error('Failed to load card types')
      }
    } finally {
      setLoading(false)
    }
  }, [worldId, error])

  // Load world and card types
  useEffect(() => {
    if (worldId) {
      loadData()
    }
  }, [worldId, loadData])

  const handleCardTypeCreated = (newCardType: CardType) => {
    if (editingCardType) {
      // Update existing
      setCardTypes(prev => prev.map(ct => ct.id === newCardType.id ? newCardType : ct))
      setEditingCardType(null)
    } else {
      // Add new
      setCardTypes(prev => [newCardType, ...prev])
    }
    setShowCreateModal(false)
    success(editingCardType ? 'Card type updated successfully!' : 'Card type created successfully!')
  }

  const handleEditCardType = (cardType: CardType) => {
    setEditingCardType(cardType)
    setShowCreateModal(true)
  }

  const handleDeleteCardType = async (cardType: CardType) => {
    if (cardType.card_count && cardType.card_count > 0) {
      error(`Cannot delete card type "${cardType.name}" because it has ${cardType.card_count} cards. Delete the cards first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete the card type "${cardType.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await supabaseService.cardType.deleteCardType(cardType.id)
      setCardTypes(prev => prev.filter(ct => ct.id !== cardType.id))
      success('Card type deleted successfully')
    } catch (err) {
      error('Failed to delete card type')
      console.error('Error deleting card type:', err)
    }
  }

  // Filter card types based on search
  const filteredCardTypes = cardTypes.filter(cardType =>
    cardType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cardType.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    )
  }

  if (!world) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-100 mb-2">
          World not found
        </h3>
        <p className="text-slate-400">
          The world you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <Link href="/dashboard/worlds" className="hover:text-slate-100">
          Worlds
        </Link>
        <span>/</span>
        <span className="text-slate-100 font-medium">{world.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Types</h1>
          <p className="text-slate-400">
            Define the structure and fields for cards in &quot;{world.title}&quot;
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Card Type
        </Button>
      </div>

      {/* Stats */}
      {cardTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-slate-100">{cardTypes.length}</div>
            <div className="text-sm text-slate-400">Card Types</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-slate-100">
              {cardTypes.reduce((sum, ct) => sum + (ct.card_count || 0), 0)}
            </div>
            <div className="text-sm text-slate-400">Total Cards</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl font-bold text-slate-100">
              {cardTypes.reduce((sum, ct) => sum + ct.schema.length, 0)}
            </div>
            <div className="text-sm text-slate-400">Total Fields</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search card types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">
            {filteredCardTypes.length} result{filteredCardTypes.length !== 1 ? 's' : ''} for
          </span>
          <Badge variant="outline">&quot;{searchQuery}&quot;</Badge>
          {filteredCardTypes.length !== cardTypes.length && (
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

      {/* Card Types Grid */}
      {filteredCardTypes.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <div>
              <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">
                No card types found
              </h3>
              <p className="text-slate-400 mb-4">
                Try adjusting your search terms or create a new card type.
              </p>
              <Button onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <div>
              <Settings className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">
                No card types yet
              </h3>
              <p className="text-slate-400 mb-6">
                Create your first card type to start defining the structure of your worldbuilding cards.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Card Type
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCardTypes.map((cardType) => (
            <CardTypeCard
              key={cardType.id}
              cardType={cardType}
              onEdit={handleEditCardType}
              onDelete={handleDeleteCardType}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Card Type Modal */}
      <CreateCardTypeModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingCardType(null)
        }}
        onCardTypeCreated={handleCardTypeCreated}
        worldId={worldId}
        editingCardType={editingCardType}
      />
    </div>
  )
}
