'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderPlus, MoreVertical, Edit, Trash2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import CreateFolderModal from './create-folder-modal'
import type { Folder as FolderType } from '@/types/entities'

interface FolderSidebarProps {
  worldId: string
  selectedFolderId?: string | null
  onFolderSelect: (folderId: string | null) => void
  onFolderChange?: () => void
}

interface FolderTreeNodeProps {
  folder: FolderType
  children: FolderType[]
  selectedFolderId?: string | null
  onFolderSelect: (folderId: string | null) => void
  onFolderEdit: (folder: FolderType) => void
  onFolderDelete: (folder: FolderType) => void
  level: number
}

function FolderTreeNode({ 
  folder, 
  children, 
  selectedFolderId, 
  onFolderSelect, 
  onFolderEdit, 
  onFolderDelete, 
  level 
}: FolderTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const hasChildren = children.length > 0

  return (
    <div>
      <div 
        className={`flex items-center group hover:bg-slate-700 rounded-md transition-colors ${
          selectedFolderId === folder.id ? 'bg-slate-700 ring-1 ring-slate-600' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-50"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <div className="h-3 w-3" />
          )}
        </Button>

        {/* Folder Icon and Name */}
        <button
          onClick={() => onFolderSelect(folder.id)}
          className="flex items-center flex-1 min-w-0 px-2 py-1 text-left hover:text-slate-100 transition-colors"
        >
          {selectedFolderId === folder.id ? (
            <FolderOpen className="h-4 w-4 mr-2 text-indigo-400 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
          )}
          <span className="text-sm text-slate-300 truncate">
            {folder.name}
          </span>
          {folder.card_count !== undefined && (
            <span className="text-xs text-slate-500 ml-1">
              ({folder.card_count})
            </span>
          )}
        </button>

        {/* Actions Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>

          {showMenu && (
            <>
              <div className="absolute right-0 top-6 w-32 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-600 z-20">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onFolderEdit(folder)
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onFolderDelete(folder)
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-3 py-1 text-xs text-red-400 hover:bg-slate-700"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {children.map((childFolder) => (
            <FolderTreeNode
              key={childFolder.id}
              folder={childFolder}
              children={[]} // Will be populated by parent component
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
              onFolderEdit={onFolderEdit}
              onFolderDelete={onFolderDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FolderSidebar({ 
  worldId, 
  selectedFolderId, 
  onFolderSelect, 
  onFolderChange 
}: FolderSidebarProps) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null)
  const { success, error } = useToastHelpers()

  // Load folders
  useEffect(() => {
    loadFolders()
  }, [worldId])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const foldersData = await supabaseService.folder.getFolders(worldId)
      setFolders(foldersData)
      onFolderChange?.()
    } catch (err: any) {
      console.error('Error loading folders:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        stack: err?.stack
      })
      error('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  // Build folder tree
  const buildFolderTree = (folders: FolderType[], parentId: string | null = null): FolderType[] => {
    return folders
      .filter(folder => folder.parent_id === parentId)
      .sort((a, b) => a.position - b.position)
      .map(folder => ({
        ...folder,
        children: buildFolderTree(folders, folder.id)
      }))
  }

  const folderTree = buildFolderTree(folders)

  const handleFolderCreated = (newFolder: FolderType) => {
    setFolders(prev => [...prev, newFolder])
    setShowCreateModal(false)
    setEditingFolder(null)
    success(editingFolder ? 'Folder updated successfully!' : 'Folder created successfully!')
    onFolderChange?.()
  }

  const handleFolderEdit = (folder: FolderType) => {
    setEditingFolder(folder)
    setShowCreateModal(true)
  }

  const handleFolderDelete = async (folder: FolderType) => {
    if (!confirm(`Are you sure you want to delete "${folder.name}"? This will move all cards in this folder to "Uncategorized".`)) {
      return
    }

    try {
      await supabaseService.folder.deleteFolder(folder.id)
      setFolders(prev => prev.filter(f => f.id !== folder.id))
      
      // If deleted folder was selected, clear selection
      if (selectedFolderId === folder.id) {
        onFolderSelect(null)
      }
      
      success('Folder deleted successfully')
      onFolderChange?.()
    } catch (err) {
      error('Failed to delete folder')
      console.error('Error deleting folder:', err)
    }
  }

  const renderFolderTree = (folders: FolderType[], level: number = 0) => {
    return folders.map((folder) => {
      const children = folders.filter(f => f.parent_id === folder.id)
      return (
        <FolderTreeNode
          key={folder.id}
          folder={folder}
          children={children}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
          onFolderEdit={handleFolderEdit}
          onFolderDelete={handleFolderDelete}
          level={level}
        />
      )
    })
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-200">Folders</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="h-6 w-6 p-0"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* All Cards Option */}
      <div className="p-2">
        <button
          onClick={() => onFolderSelect(null)}
          className={`flex items-center w-full px-2 py-2 text-left rounded-md hover:bg-slate-700 transition-colors ${
            selectedFolderId === null ? 'bg-slate-700 ring-1 ring-slate-600' : ''
          }`}
        >
          <FolderOpen className="h-4 w-4 mr-2 text-indigo-400" />
          <span className="text-sm text-slate-300">All Cards</span>
        </button>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {folderTree.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">No folders yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </div>
        ) : (
          renderFolderTree(folderTree)
        )}
      </div>

      {/* Create/Edit Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingFolder(null)
        }}
        onFolderCreated={handleFolderCreated}
        worldId={worldId}
        editingFolder={editingFolder}
        parentFolders={folders.filter(f => f.id !== editingFolder?.id)} // Exclude self to prevent circular nesting
      />
    </div>
  )
}
