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
import type { Card, CardType, Folder, FieldSchema } from '@/types/entities'

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
  const [fieldData, setFieldData] = useState<Record<string, any>>({}) // Dynamic field data
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
      setFieldData({})
    }
  }, [isOpen, selectedFolderId])

  const handleCardTypeSelect = (cardType: CardType) => {
    setSelectedCardType(cardType)
    setTypeId(cardType.id)
    
    // Initialize field data with default values from schema
    const initialFieldData: Record<string, any> = {}
    if (cardType.schema) {
      cardType.schema.forEach(field => {
        // Set default values based on field type
        switch (field.kind) {
          case 'text':
          case 'long_text':
            initialFieldData[field.key] = ''
            break
          case 'number':
            initialFieldData[field.key] = field.validation?.min || 0
            break
          case 'boolean':
            initialFieldData[field.key] = false
            break
          case 'select':
            initialFieldData[field.key] = field.options?.[0] || ''
            break
          case 'multi_select':
            initialFieldData[field.key] = []
            break
          case 'date':
            initialFieldData[field.key] = ''
            break
          case 'color':
            initialFieldData[field.key] = '#000000'
            break
          case 'image':
            initialFieldData[field.key] = ''
            break
          default:
            initialFieldData[field.key] = ''
        }
      })
    }
    setFieldData(initialFieldData)
    setStep('fill-details')
  }

  const handleBackToTypeSelection = () => {
    setStep('select-type')
    setSelectedCardType(null)
    setTypeId('')
    setFieldData({})
  }

  const updateFieldData = (fieldKey: string, value: any) => {
    setFieldData(prev => ({
      ...prev,
      [fieldKey]: value
    }))
  }

  const renderField = (field: FieldSchema) => {
    const value = fieldData[field.key] || ''

    switch (field.kind) {
      case 'text':
        return (
          <Input
            id={field.key}
            value={value}
            onChange={(e) => updateFieldData(field.key, e.target.value)}
            placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            maxLength={field.validation?.max || undefined}
            required={field.required}
          />
        )
      
      case 'long_text':
        return (
          <Textarea
            id={field.key}
            value={value}
            onChange={(e) => updateFieldData(field.key, e.target.value)}
            placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            maxLength={field.validation?.max || undefined}
            rows={4}
            required={field.required}
          />
        )
      
      case 'number':
        return (
          <Input
            id={field.key}
            type="number"
            value={value}
            onChange={(e) => updateFieldData(field.key, parseFloat(e.target.value) || 0)}
            placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            min={field.validation?.min}
            max={field.validation?.max}
            required={field.required}
          />
        )
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              id={field.key}
              type="checkbox"
              checked={!!value}
              onChange={(e) => updateFieldData(field.key, e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor={field.key} className="text-sm">
              {field.description || field.label}
            </Label>
          </div>
        )
      
      case 'select':
        return (
          <select
            id={field.key}
            value={value}
            onChange={(e) => updateFieldData(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required={field.required}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      
      case 'multi_select':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${field.key}-${option}`}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      updateFieldData(field.key, [...currentValues, option])
                    } else {
                      updateFieldData(field.key, currentValues.filter(v => v !== option))
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor={`${field.key}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )
      
      case 'date':
        return (
          <Input
            id={field.key}
            type="date"
            value={value}
            onChange={(e) => updateFieldData(field.key, e.target.value)}
            required={field.required}
          />
        )
      
      case 'color':
        return (
          <div className="flex space-x-2">
            <Input
              id={field.key}
              type="color"
              value={value || '#000000'}
              onChange={(e) => updateFieldData(field.key, e.target.value)}
              className="w-12 h-10 p-1 border rounded"
            />
            <Input
              value={value || '#000000'}
              onChange={(e) => updateFieldData(field.key, e.target.value)}
              placeholder="#000000"
              maxLength={7}
              className="flex-1"
            />
          </div>
        )
      
      case 'image':
        return (
          <Input
            id={field.key}
            type="url"
            value={value}
            onChange={(e) => updateFieldData(field.key, e.target.value)}
            placeholder="Enter image URL"
          />
        )
      
      default:
        return (
          <Input
            id={field.key}
            value={value}
            onChange={(e) => updateFieldData(field.key, e.target.value)}
            placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        )
    }
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

    // Validate required fields from the schema
    if (selectedCardType?.schema) {
      for (const field of selectedCardType.schema) {
        if (field.required && !fieldData[field.key]) {
          error(`${field.label} is required`)
          return
        }
      }
    }

    try {
      setLoading(true)
      
      // Create the card first
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
      
      // Create field data entries for all non-empty fields
      if (selectedCardType?.schema && Object.keys(fieldData).length > 0) {
        const dataPromises = selectedCardType.schema
          .filter(field => {
            const value = fieldData[field.key]
            // Only save non-empty values
            return value !== '' && value !== null && value !== undefined && 
                   !(Array.isArray(value) && value.length === 0)
          })
          .map(field => 
            supabaseService.card.updateCardData(newCard.id, field.key, fieldData[field.key])
          )
        
        await Promise.all(dataPromises)
      }
      
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

            {/* Dynamic Fields from Card Type Schema */}
            {selectedCardType?.schema && selectedCardType.schema.length > 0 && (
              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-sm font-medium text-slate-200 mb-3">
                  {selectedCardType.name} Fields
                </h3>
                <div className="space-y-4">
                  {selectedCardType.schema.map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={field.key} className="text-sm font-medium text-slate-200">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                        {!field.required && (
                          <span className="text-slate-500 font-normal ml-1">(optional)</span>
                        )}
                      </Label>
                      <div className="mt-1">
                        {renderField(field)}
                      </div>
                      {field.description && (
                        <p className="text-xs text-slate-500 mt-1">
                          {field.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
