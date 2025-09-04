'use client'

import { useState } from 'react'
import { Modal, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import { Trash2, FolderPlus } from 'lucide-react'
import type { Card, Folder } from '@/types/entities'

interface BulkActionsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCards: Card[]
  folders: Folder[]
  onCardsUpdated: () => void
}

export default function BulkActionsModal({
  isOpen,
  onClose,
  selectedCards,
  folders,
  onCardsUpdated
}: BulkActionsModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const { success, error } = useToastHelpers()

  const handleMoveToFolder = async () => {
    if (selectedCards.length === 0) return

    try {
      setLoading(true)
      
      // Update all selected cards
      await Promise.all(
        selectedCards.map(card =>
          supabaseService.card.updateCard(card.id, {
            folder_id: selectedFolderId
          })
        )
      )
      
      success(`Moved ${selectedCards.length} cards to ${selectedFolderId ? 'folder' : 'root level'}`)
      onCardsUpdated()
      onClose()
    } catch (err) {
      error('Failed to move cards')
      console.error('Error moving cards:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCards.length === 0) return

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedCards.length} cards? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setLoading(true)
      
      // Delete all selected cards
      await Promise.all(
        selectedCards.map(card =>
          supabaseService.card.deleteCard(card.id)
        )
      )
      
      success(`Deleted ${selectedCards.length} cards`)
      onCardsUpdated()
      onClose()
    } catch (err) {
      error('Failed to delete cards')
      console.error('Error deleting cards:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk Actions (${selectedCards.length} cards selected)`}
      size="sm"
    >
      <ModalContent>
        <div className="space-y-6">
          {/* Move to Folder */}
          <div>
            <Label className="text-sm font-medium text-slate-200 mb-3 block">
              Move to Folder
            </Label>
            <select
              value={selectedFolderId || 'none'}
              onChange={(e) => setSelectedFolderId(e.target.value === 'none' ? null : e.target.value)}
              disabled={loading}
              className="w-full h-10 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
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
            <Button
              onClick={handleMoveToFolder}
              disabled={loading}
              className="w-full"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Move Cards
            </Button>
          </div>

          {/* Delete */}
          <div>
            <Label className="text-sm font-medium text-slate-200 mb-3 block">
              Danger Zone
            </Label>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={loading}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected Cards
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
