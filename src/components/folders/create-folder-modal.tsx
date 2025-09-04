'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import type { Folder as FolderType } from '@/types/entities'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onFolderCreated: (folder: FolderType) => void
  worldId: string
  editingFolder?: FolderType | null
  parentFolders?: FolderType[]
}

const FOLDER_COLORS = [
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
]

export default function CreateFolderModal({
  isOpen,
  onClose,
  onFolderCreated,
  worldId,
  editingFolder,
  parentFolders = []
}: CreateFolderModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('blue')
  const [parentId, setParentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { error } = useToastHelpers()

  // Reset form when modal opens/closes or when editing folder changes
  useEffect(() => {
    if (isOpen) {
      if (editingFolder) {
        setName(editingFolder.name)
        setDescription(editingFolder.description || '')
        setColor(editingFolder.color || 'blue')
        setParentId(editingFolder.parent_id)
      } else {
        setName('')
        setDescription('')
        setColor('blue')
        setParentId(null)
      }
    }
  }, [isOpen, editingFolder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      error('Folder name is required')
      return
    }

    try {
      setLoading(true)
      
      if (editingFolder) {
        const updatedFolder = await supabaseService.folder.updateFolder(editingFolder.id, {
          name: name.trim(),
          description: description.trim() || null,
          color,
          parent_id: parentId
        })
        onFolderCreated(updatedFolder)
      } else {
        const newFolder = await supabaseService.folder.createFolder({
          world_id: worldId,
          name: name.trim(),
          description: description.trim() || null,
          color,
          parent_id: parentId,
          position: 0 // Will be auto-incremented by database
        })
        onFolderCreated(newFolder)
      }
    } catch (err) {
      error(editingFolder ? 'Failed to update folder' : 'Failed to create folder')
      console.error('Error with folder:', err)
    } finally {
      setLoading(false)
    }
  }

  // Build parent folder options (exclude current folder and its descendants to prevent circular nesting)
  const buildParentOptions = (folders: FolderType[], excludeId?: string): FolderType[] => {
    if (!excludeId) return folders

    const excludeIds = new Set([excludeId])
    
    // Find all descendants of the folder being edited
    const findDescendants = (parentId: string) => {
      folders.forEach(folder => {
        if (folder.parent_id === parentId && !excludeIds.has(folder.id)) {
          excludeIds.add(folder.id)
          findDescendants(folder.id)
        }
      })
    }
    
    findDescendants(excludeId)
    
    return folders.filter(folder => !excludeIds.has(folder.id))
  }

  const availableParentFolders = buildParentOptions(parentFolders, editingFolder?.id)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingFolder ? 'Edit Folder' : 'Create New Folder'}
      size="sm"
    >
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Folder Name */}
          <div>
            <Label htmlFor="folder-name" className="text-sm font-medium text-slate-200">
              Name
            </Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="mt-1"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="folder-description" className="text-sm font-medium text-slate-200">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter folder description"
              className="mt-1"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Color */}
          <div>
            <Label className="text-sm font-medium text-slate-200">Color</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {FOLDER_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`w-8 h-8 rounded-full ${colorOption.class} border-2 transition-all ${
                    color === colorOption.value 
                      ? 'border-white scale-110' 
                      : 'border-slate-600 hover:scale-105'
                  }`}
                  disabled={loading}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          {/* Parent Folder */}
          {availableParentFolders.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-slate-200">
                Parent Folder <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <select
                value={parentId || 'none'}
                onChange={(e) => setParentId(e.target.value === 'none' ? null : e.target.value)}
                disabled={loading}
                className="mt-1 w-full h-10 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">None (Root level)</option>
                {availableParentFolders
                  .filter(folder => !folder.parent_id) // Only show root level folders for simplicity
                  .map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

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
              disabled={!name.trim() || loading}
            >
              {editingFolder ? 'Update Folder' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  )
}
