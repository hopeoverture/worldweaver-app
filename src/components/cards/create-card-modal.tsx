'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import { Plus, Settings, User, Crown, MapPin, Globe, Globe2, Zap, Cpu, Users, Calendar, Bug, Sparkles, Target, Package } from 'lucide-react'
import type { Card, CardType, Folder } from '@/types/entities'

// Map icon names from database to Lucide React components
const getIconComponent = (iconName: string, size: 'small' | 'large' = 'small') => {
  const iconMap: Record<string, React.ElementType> = {
    'User': User,
    'Crown': Crown,
    'MapPin': MapPin,
    'Globe': Globe,
    'Globe2': Globe2,
    'Zap': Zap,
    'Cpu': Cpu,
    'Users': Users,
    'Calendar': Calendar,
    'Bug': Bug,
    'Sparkles': Sparkles,
    'Target': Target,
    'Package': Package,
  }
  
  const IconComponent = iconMap[iconName]
  if (IconComponent) {
    const className = size === 'large' ? 'h-6 w-6' : 'h-4 w-4'
    return <IconComponent className={className} />
  }
  
  // Fallback: if it's an emoji or unknown icon, display as text
  const textSize = size === 'large' ? 'text-lg' : 'text-sm'
  return <span className={textSize}>{iconName}</span>
}

interface CreateCardModalProps {
  isOpen: boolean
  onClose: () => void
  onCardCreated: (card: Card) => void
  worldId: string
  selectedFolderId?: string | null
  cardTypes: CardType[]
  folders: Folder[]
  onCreateCardType?: () => void // Add this prop to allow creating new card types
}

export default function CreateCardModal({
  isOpen,
  onClose,
  onCardCreated,
  worldId,
  selectedFolderId,
  cardTypes,
  folders,
  onCreateCardType
}: CreateCardModalProps) {
  const [step, setStep] = useState<'select-type' | 'fill-details'>('select-type')
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(null)
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [typeId, setTypeId] = useState('')
  const [folderId, setFolderId] = useState<string | null>(selectedFolderId || null)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToastHelpers()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('select-type')
      setSelectedCardType(null)
      setName('')
      setSummary('')
      setTypeId('')
      setFolderId(selectedFolderId || null)
      setCoverImageUrl('')
    }
  }, [isOpen, selectedFolderId])

  const handleCardTypeSelect = (cardType: CardType) => {
    setSelectedCardType(cardType)
    setTypeId(cardType.id)
    setStep('fill-details')
  }

  const handleBackToTypeSelection = () => {
    setStep('select-type')
    setSelectedCardType(null)
    setTypeId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      error('Card name is required')
      return
    }

    if (!typeId) {
      error('Please select a card type')
      return
    }

    try {
      setLoading(true)
      
      // For now, we'll create the card without image upload
      // Image upload will be implemented in a future iteration
      const newCard = await supabaseService.card.createCard({
        world_id: worldId,
        type_id: typeId,
        folder_id: folderId,
        title: name.trim(),
        name: name.trim(),
        summary: summary.trim() || null,
        cover_image_url: coverImageUrl || null,
        position: 0 // Will be auto-incremented
      })
      
      success('Card created successfully!')
      onCardCreated(newCard)
      onClose()
    } catch (err) {
      console.error('Error creating card:', err)
      
      // Better error message extraction
      let errorMessage = 'Failed to create card'
      if (err instanceof Error) {
        errorMessage = `Failed to create card: ${err.message}`
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = `Failed to create card: ${err.message}`
      } else if (typeof err === 'string') {
        errorMessage = `Failed to create card: ${err}`
      }
      
      error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverImageUrl(e.target.value)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'select-type' ? 'Choose Card Type' : 'Create New Card'}
      size={step === 'select-type' ? 'lg' : 'md'}
    >
      <ModalContent>
        {step === 'select-type' ? (
          // Step 1: Card Type Selection
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">
              Choose the type of card you want to create. Each type has its own set of fields and properties.
            </p>

            {/* Card Types Grid */}
            {cardTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {cardTypes.map((cardType) => (
                  <button
                    key={cardType.id}
                    onClick={() => handleCardTypeSelect(cardType)}
                    className="text-left p-4 rounded-lg border border-slate-600 hover:border-slate-500 hover:bg-slate-600 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: cardType.color || '#6366f1' }}
                      >
                        {getIconComponent(cardType.icon || '📄', 'large')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-100 group-hover:text-white">
                          {cardType.name}
                        </h3>
                        {cardType.description && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {cardType.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-slate-500">
                            {cardType.schema?.length || 0} fields
                          </span>
                          {cardType.card_count !== undefined && (
                            <span className="text-xs text-slate-500">
                              • {cardType.card_count} cards
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-100 mb-2">
                  No card types available
                </h3>
                <p className="text-slate-400 mb-4">
                  You need to create a card type before you can create cards.
                </p>
                {onCreateCardType && (
                  <Button onClick={onCreateCardType}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Card Type
                  </Button>
                )}
              </div>
            )}

            {/* Create New Card Type Option */}
            {cardTypes.length > 0 && onCreateCardType && (
              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={onCreateCardType}
                  className="w-full p-3 rounded-lg border border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-300"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New Card Type</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          // Step 2: Card Details Form
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected Card Type Display */}
            {selectedCardType && (
              <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedCardType.color || '#6366f1' }}
                  >
                    {getIconComponent(selectedCardType.icon || '📄')}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-200">
                      {selectedCardType.name}
                    </span>
                    <div className="text-xs text-slate-400">
                      {selectedCardType.schema?.length || 0} fields
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToTypeSelection}
                  disabled={loading}
                >
                  Change Type
                </Button>
              </div>
            )}

            {/* Card Name */}
            <div>
              <Label htmlFor="card-name" className="text-sm font-medium text-slate-200">
                Name
              </Label>
              <Input
                id="card-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter card name"
                className="mt-1"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Folder */}
            <div>
              <Label className="text-sm font-medium text-slate-200">
                Folder <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <select
                value={folderId || 'none'}
                onChange={(e) => setFolderId(e.target.value === 'none' ? null : e.target.value)}
                disabled={loading}
                className="mt-1 w-full h-10 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">No folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div>
              <Label htmlFor="card-summary" className="text-sm font-medium text-slate-200">
                Summary <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="card-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief description of this card"
                className="mt-1"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <Label htmlFor="cover-image-url" className="text-sm font-medium text-slate-200">
                Cover Image URL <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <Input
                id="cover-image-url"
                type="url"
                value={coverImageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
                disabled={loading}
              />
              <p className="text-xs text-slate-600">Use image URL for now</p>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToTypeSelection}
                disabled={loading}
              >
                Back
              </Button>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim() || !typeId || loading}
                >
                  {loading ? 'Creating...' : 'Create Card'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}
