'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Sparkles, User, Crown, MapPin, Globe, Zap, Cpu, Users, Calendar, Globe2, Bug } from 'lucide-react'
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useToastHelpers } from '@/contexts/toast-context'
import { supabaseService } from '@/lib/supabase/service'
import { useErrorHandler } from '@/lib/error-handling'
import { generateColor } from '@/lib/utils'
import type { CardType, FieldSchema, FieldKind } from '@/types/entities'

interface CardTypeTemplate {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  schema: FieldSchema[]
}

interface CreateCardTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onCardTypeCreated: (cardType: CardType) => void
  worldId: string
  editingCardType?: CardType | null
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', description: 'Single line text input' },
  { value: 'long_text', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'boolean', label: 'Yes/No', description: 'True/false checkbox' },
  { value: 'select', label: 'Dropdown', description: 'Select from predefined options' },
  { value: 'multi_select', label: 'Multi-Select', description: 'Choose multiple options' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'image', label: 'Image', description: 'Image upload' },
  { value: 'color', label: 'Color', description: 'Color picker' },
] as const

// Map icon names from database to Lucide React components
const getIconComponent = (iconName: string) => {
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
  }
  
  const IconComponent = iconMap[iconName]
  if (IconComponent) {
    return <IconComponent className="h-5 w-5" />
  }
  
  // Fallback: if it's an emoji or unknown icon, display as text
  return <span className="text-lg">{iconName}</span>
}

export default function CreateCardTypeModal({
  isOpen,
  onClose,
  onCardTypeCreated,
  worldId,
  editingCardType = null
}: CreateCardTypeModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [templates, setTemplates] = useState<CardTypeTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(!editingCardType) // Show templates by default for new card types
  const [name, setName] = useState(editingCardType?.name || '')
  const [description, setDescription] = useState(editingCardType?.description || '')
  const [icon, setIcon] = useState(editingCardType?.icon || '📄')
  const [color, setColor] = useState(editingCardType?.color || generateColor())
  const [fields, setFields] = useState<FieldSchema[]>(
    editingCardType?.schema || [
      {
        key: 'name',
        label: 'Name',
        kind: 'text',
        required: true,
        description: 'The name of this item'
      }
    ]
  )

  const { user } = useAuth()
  const { success, error } = useToastHelpers()
  const { handleError } = useErrorHandler()

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen && !editingCardType) {
      loadTemplates()
    }
  }, [isOpen, editingCardType, loadTemplates])

  const loadTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true)
      const templatesData = await supabaseService.cardType.getCardTypeTemplates()
      setTemplates(templatesData)
    } catch (err) {
      console.error('Failed to load templates:', err)
      handleError(err, 'Failed to load templates')
    } finally {
      setLoadingTemplates(false)
    }
  }, [handleError])

  const applyTemplate = (template: CardTypeTemplate) => {
    setSelectedTemplate(template.id)
    setName(template.name)
    setDescription(template.description || '')
    setIcon(template.icon)
    setColor(template.color)
    setFields(template.schema)
    setShowTemplates(false)
  }

  const startFromScratch = () => {
    setSelectedTemplate(null)
    setShowTemplates(false)
    // Keep current values for name, description, etc.
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!name.trim()) {
      error('Card type name is required')
      return
    }

    if (fields.length === 0) {
      error('At least one field is required')
      return
    }

    try {
      setLoading(true)

      const cardTypeData = {
        name: name.trim(),
        description: description.trim() || null,
        icon,
        color,
        world_id: worldId,
        schema: fields
      }

      let result: CardType
      if (editingCardType) {
        result = await supabaseService.cardType.updateCardType(editingCardType.id, cardTypeData)
      } else {
        result = await supabaseService.cardType.createCardType(cardTypeData)
      }

      onCardTypeCreated(result)
      success(editingCardType ? 'Card type updated successfully!' : 'Card type created successfully!')
      handleClose()
    } catch (err) {
      handleError(err, editingCardType ? 'Failed to update card type' : 'Failed to create card type')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName('')
      setDescription('')
      setIcon('📄')
      setColor(generateColor())
      setFields([{
        key: 'name',
        label: 'Name',
        kind: 'text',
        required: true,
        description: 'The name of this item'
      }])
      onClose()
    }
  }

  const addField = () => {
    setFields(prev => [...prev, {
      key: '',
      label: '',
      kind: 'text',
      required: false,
      description: ''
    }])
  }

  const updateField = (index: number, updates: Partial<FieldSchema>) => {
    setFields(prev => prev.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ))
  }

  const removeField = (index: number) => {
    if (fields.length <= 1) {
      error('At least one field is required')
      return
    }
    setFields(prev => prev.filter((_, i) => i !== index))
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= fields.length) return

    setFields(prev => {
      const newFields = [...prev]
      const temp = newFields[index]
      newFields[index] = newFields[newIndex]
      newFields[newIndex] = temp
      return newFields
    })
  }

  const generateFieldKey = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editingCardType ? 'Edit Card Type' : 'Create Card Type'} size="xl">
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                {editingCardType ? 'Edit Card Type' : 'Create Card Type'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {editingCardType ? 'Modify your card type definition' : 'Define a new type of card for your world'}
              </p>
            </div>

            {/* Template Selection - only show for new card types */}
            {!editingCardType && showTemplates && (
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                      Choose a Template
                    </h3>
                    <p className="text-sm text-slate-400">Start with a pre-built template or create from scratch</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startFromScratch}
                    className="shrink-0"
                  >
                    Start from Scratch
                  </Button>
                </div>

                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-slate-400">Loading templates...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group templates by category */}
                    {templates.reduce((groups: Record<string, CardTypeTemplate[]>, template) => {
                      const category = template.category || 'General'
                      if (!groups[category]) groups[category] = []
                      groups[category].push(template)
                      return groups
                    }, {} as Record<string, CardTypeTemplate[]>) && 
                      Object.entries(templates.reduce((groups: Record<string, CardTypeTemplate[]>, template) => {
                        const category = template.category || 'General'
                        if (!groups[category]) groups[category] = []
                        groups[category].push(template)
                        return groups
                      }, {} as Record<string, CardTypeTemplate[]>)).map(([category, categoryTemplates]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-slate-300 mb-2">{category}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(categoryTemplates as CardTypeTemplate[]).map((template) => (
                              <button
                                key={template.id}
                                type="button"
                                onClick={() => applyTemplate(template)}
                                className="text-left p-3 rounded-lg border border-slate-600 hover:border-slate-500 hover:bg-slate-600 transition-colors"
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  {getIconComponent(template.icon)}
                                  <span 
                                    className="w-3 h-3 rounded-full shrink-0" 
                                    style={{ backgroundColor: template.color }}
                                  />
                                </div>
                                <div className="font-medium text-slate-100 text-sm">{template.name}</div>
                                {template.description && (
                                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                                    {template.description}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}

            {/* Show template selection toggle for custom mode */}
            {!editingCardType && !showTemplates && (
              <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="text-sm text-slate-300">
                  {selectedTemplate ? 'Using template' : 'Creating from scratch'}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Templates
                </Button>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Character, Location, Item"
                  maxLength={100}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📄"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                      maxLength={7}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this card type represents..."
                maxLength={500}
                rows={3}
              />
            </div>

            {/* Field Schema */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-100">Fields</h3>
                  <p className="text-sm text-slate-400">Define the fields that cards of this type will have</p>
                </div>
                <Button type="button" onClick={addField} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={index} className="border border-slate-600 rounded-lg p-4 bg-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Badge variant="outline">Field {index + 1}</Badge>
                        {field.required && <Badge variant="default" size="sm">Required</Badge>}
                      </div>
                      <div className="flex items-center space-x-1">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveField(index, 'up')}
                          >
                            ↑
                          </Button>
                        )}
                        {index < fields.length - 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveField(index, 'down')}
                          >
                            ↓
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Field Label *</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => {
                            const label = e.target.value
                            updateField(index, { 
                              label,
                              key: field.key || generateFieldKey(label)
                            })
                          }}
                          placeholder="e.g., Full Name, Age, Location"
                          required
                        />
                      </div>
                      <div>
                        <Label>Field Key *</Label>
                        <Input
                          value={field.key}
                          onChange={(e) => updateField(index, { key: e.target.value })}
                          placeholder="e.g., full_name, age, location"
                          pattern="^[a-z][a-z0-9_]*$"
                          title="Must start with a letter and contain only lowercase letters, numbers, and underscores"
                          required
                        />
                      </div>
                      <div>
                        <Label>Field Type *</Label>
                        <select
                          value={field.kind}
                          onChange={(e) => updateField(index, { kind: e.target.value as FieldKind })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          {FIELD_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-4 pt-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Required</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Description</Label>
                      <Input
                        value={field.description || ''}
                        onChange={(e) => updateField(index, { description: e.target.value })}
                        placeholder="Help text for this field..."
                      />
                    </div>

                    {/* Field-specific options */}
                    {(field.kind === 'select' || field.kind === 'multi_select') && (
                      <div className="mt-3">
                        <Label>Options (one per line)</Label>
                        <Textarea
                          value={(field.options || []).join('\n')}
                          onChange={(e) => updateField(index, { 
                            options: e.target.value.split('\n').filter(opt => opt.trim())
                          })}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={3}
                        />
                      </div>
                    )}

                    {field.kind === 'text' && (
                      <div className="mt-3">
                        <Label>Max Length</Label>
                        <Input
                          type="number"
                          value={field.validation?.max || ''}
                          onChange={(e) => updateField(index, { 
                            validation: { 
                              ...field.validation, 
                              max: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          })}
                          placeholder="Maximum character count"
                          min="1"
                          max="10000"
                        />
                      </div>
                    )}

                    {field.kind === 'number' && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <Label>Min Value</Label>
                          <Input
                            type="number"
                            value={field.validation?.min || ''}
                            onChange={(e) => updateField(index, { 
                              validation: { 
                                ...field.validation, 
                                min: e.target.value ? parseFloat(e.target.value) : undefined 
                              }
                            })}
                            placeholder="Minimum value"
                          />
                        </div>
                        <div>
                          <Label>Max Value</Label>
                          <Input
                            type="number"
                            value={field.validation?.max || ''}
                            onChange={(e) => updateField(index, { 
                              validation: { 
                                ...field.validation, 
                                max: e.target.value ? parseFloat(e.target.value) : undefined 
                              }
                            })}
                            placeholder="Maximum value"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingCardType ? 'Update Card Type' : 'Create Card Type'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
