'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import { Edit } from 'lucide-react'
import type { Card, CardType, Folder } from '@/types/entities'

interface EditCardModalProps {
  isOpen: boolean
  onClose: () => void
  onCardUpdated: (card: Card) => void
  card: Card | null
  cardTypes: CardType[]
  folders: Folder[]
}

export default function EditCardModal({
  isOpen,
  onClose,
  onCardUpdated,
  card,
  cardTypes,
  folders
}: EditCardModalProps) {
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [typeId, setTypeId] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToastHelpers()

  // Reset form when modal opens/closes or card changes
  useEffect(() => {
    if (isOpen && card) {
      setName(card.name)
      setSummary(card.summary || '')
      setTypeId(card.type_id)
      setFolderId(card.folder_id)
      setCoverImageUrl(card.cover_image_url || '')
    } else if (!isOpen) {
      setName('')
      setSummary('')
      setTypeId('')
      setFolderId(null)
      setCoverImageUrl('')
    }
  }, [isOpen, card])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!card) return
    
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
      
      const updatedCard = await supabaseService.card.updateCard(card.id, {
        name: name.trim(),
        summary: summary.trim() || null,
        type_id: typeId,
        folder_id: folderId,
        cover_image_url: coverImageUrl || null
      })
      
      success('Card updated successfully!')
      onCardUpdated(updatedCard)
      onClose()
    } catch (err) {
      error('Failed to update card')
      console.error('Error updating card:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!card) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Card"
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
                .filter(folder => !folder.parent_id)
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
              onChange={(e) => setCoverImageUrl(e.target.value)}
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
              {loading ? 'Updating...' : 'Update Card'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  )
}
