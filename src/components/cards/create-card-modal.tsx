'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import { FileText, Image, Upload } from 'lucide-react'
import type { Card, CardType, Folder } from '@/types/entities'

interface CreateCardModalProps {
  isOpen: boolean
  onClose: () => void
  onCardCreated: (card: Card) => void
  worldId: string
  selectedFolderId?: string | null
  cardTypes: CardType[]
  folders: Folder[]
}

export default function CreateCardModal({
  isOpen,
  onClose,
  onCardCreated,
  worldId,
  selectedFolderId,
  cardTypes,
  folders
}: CreateCardModalProps) {
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [typeId, setTypeId] = useState('')
  const [folderId, setFolderId] = useState<string | null>(selectedFolderId || null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToastHelpers()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('')
      setSummary('')
      setTypeId(cardTypes[0]?.id || '')
      setFolderId(selectedFolderId || null)
      setCoverImage(null)
      setCoverImageUrl('')
    }
  }, [isOpen, selectedFolderId, cardTypes])

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
        errorMessage = `Failed to create card: ${(err as any).message}`
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
      title="Create New Card"
      size="md"
    >
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Card Type */}
          <div>
            <Label className="text-sm font-medium text-slate-200">
              Card Type
            </Label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              disabled={loading}
              className="mt-1 w-full h-10 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a card type</option>
              {cardTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
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
              <option value="none">No folder (root level)</option>
              {folders
                .filter(folder => !folder.parent_id) // Only show root level folders for simplicity
                .map((folder) => (
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
            {coverImageUrl && (
              <div className="mt-2">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-600"
                  onError={() => setCoverImageUrl('')}
                />
              </div>
            )}
          </div>

          {/* Future: File Upload */}
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center opacity-50">
            <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-1">File upload coming soon</p>
            <p className="text-xs text-slate-600">Use image URL for now</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
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
        </form>
      </ModalContent>
    </Modal>
  )
}
