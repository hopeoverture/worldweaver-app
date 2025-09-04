'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import { useAuth } from '@/contexts/auth-context'
import FolderSidebar from '@/components/folders/folder-sidebar'
import { CreateCardModal, EditCardModal, CardGridItem } from '@/components/cards'
import type { World, Card, CardType, Folder } from '@/types/entities'

export default function CardsPage() {
  const params = useParams()
  const router = useRouter()
  const worldId = params.worldId as string
  
  const [world, setWorld] = useState<World | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [cardTypes, setCardTypes] = useState<CardType[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [cardsLoading, setCardsLoading] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  const { user, loading: authLoading } = useAuth()
  const { error, success } = useToastHelpers()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
  }, [user, authLoading, router])

  const loadWorld = useCallback(async () => {
    try {
      const worldData = await supabaseService.world.getWorld(worldId)
      if (worldData) {
        setWorld(worldData)
      }
    } catch (err) {
      error('Failed to load world')
      console.error('Error loading world:', err)
    }
  }, [worldId])

  const loadCards = useCallback(async () => {
    if (!user) return;
    
    try {
      setCardsLoading(true)
      const params = {
        folder_ids: selectedFolderId ? [selectedFolderId] : undefined,
        query: searchQuery || undefined,
        limit: 50
      }
      const response = await supabaseService.card.getCards(worldId, params)
      setCards(response.data)
    } catch (err) {
      console.error('Error loading cards:', err)
      error('Failed to load cards')
    } finally {
      setCardsLoading(false)
    }
  }, [user, worldId, selectedFolderId, searchQuery])

  const loadCardTypes = useCallback(async () => {
    try {
      const cardTypesData = await supabaseService.cardType.getCardTypes(worldId)
      setCardTypes(cardTypesData)
    } catch (err) {
      console.error('Error loading card types:', err)
      error('Failed to load card types')
    }
  }, [worldId])

  const loadFolders = useCallback(async () => {
    if (!user) return;
    
    try {
      const foldersData = await supabaseService.folder.getFolders(worldId)
      setFolders(foldersData)
    } catch (err) {
      console.error('Error loading folders:', err)
      error('Failed to load folders')
    }
  }, [user, worldId])

  useEffect(() => {
    if (worldId && !authLoading) {
      const loadInitialData = async () => {
        await Promise.all([
          loadWorld(),
          loadCards(),
          loadCardTypes(),
          loadFolders()
        ])
        setLoading(false)
      }
      
      loadInitialData()
    }
  }, [worldId, authLoading, loadWorld, loadCards, loadCardTypes, loadFolders])

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
  }

  const handleFolderChange = () => {
    loadFolders()
  }

  const handleCardCreated = (newCard: Card) => {
    setCards(prev => [newCard, ...prev])
    setShowCreateModal(false)
  }

  const handleCardUpdated = (updatedCard: Card) => {
    setCards(prev => prev.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    ))
    setShowEditModal(false)
    setEditingCard(null)
  }

  const handleCreateCardType = () => {
    router.push(`/dashboard/worlds/${worldId}/card-types`)
  }

  const handleEditCard = (card: Card) => {
    setEditingCard(card)
    setShowEditModal(true)
  }

  const handleDeleteCard = async (card: Card) => {
    if (!confirm(`Are you sure you want to delete "${card.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await supabaseService.card.deleteCard(card.id)
      setCards(prev => prev.filter(c => c.id !== card.id))
      success('Card deleted successfully')
    } catch (err) {
      error('Failed to delete card')
      console.error('Error deleting card:', err)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setSearchQuery(newQuery)
  }

  // Reload cards when search or folder changes
  useEffect(() => {
    if (worldId) {
      const timeoutId = setTimeout(() => {
        loadCards()
      }, 300) // Debounce search

      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, selectedFolderId, worldId, loadCards])

  const filteredCards = cards;

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    )
  }

  // Redirect happens in useEffect, but show loading if no user
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    )
  }

  // Show loading while data is loading
  if (loading && !world) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Link href="/dashboard/worlds" className="hover:text-slate-100">
                Worlds
              </Link>
              <span>/</span>
              <Link href={`/dashboard/worlds/${worldId}`} className="hover:text-slate-100">
                {world?.title || 'Loading...'}
              </Link>
              <span>/</span>
              <span className="text-slate-100 font-medium">Cards</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 w-64"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex border border-slate-600 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Create Card */}
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Card
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Folder Sidebar */}
        <div className="w-64 border-r border-slate-700 bg-slate-900/30">
          <FolderSidebar
            worldId={worldId}
            selectedFolderId={selectedFolderId}
            onFolderSelect={handleFolderSelect}
            onFolderChange={handleFolderChange}
          />
        </div>

        {/* Cards Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loading />
            </div>
          ) : (
            <>
              {cardsLoading && (
                <div className="flex items-center justify-center py-4 mb-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <div className="animate-spin h-4 w-4 border-2 border-slate-600 border-t-indigo-500 rounded-full"></div>
                    <span className="text-sm">Loading cards...</span>
                  </div>
                </div>
              )}
              
              {!cardsLoading && filteredCards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-100 mb-2">
                    {selectedFolderId ? 'No cards in this folder' : 'No cards yet'}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {selectedFolderId 
                      ? 'This folder is empty. Create your first card or move cards here.'
                      : 'Get started by creating your first card.'
                    }
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Card
                  </Button>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                } ${cardsLoading ? 'opacity-50' : ''}`}>
                  {filteredCards.map((card) => (
                    <CardGridItem
                      key={card.id}
                      card={card}
                      onEdit={handleEditCard}
                      onDelete={handleDeleteCard}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCardCreated={handleCardCreated}
        worldId={worldId}
        selectedFolderId={selectedFolderId}
        cardTypes={cardTypes}
        folders={folders}
        onCreateCardType={handleCreateCardType}
      />

      <EditCardModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingCard(null)
        }}
        onCardUpdated={handleCardUpdated}
        card={editingCard}
        cardTypes={cardTypes}
        folders={folders}
      />
    </div>
  )
}
