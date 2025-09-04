'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, BookOpen, Tag, FolderIcon, SortAsc, SortDesc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CardType, Folder } from '@/types/entities'

export interface SearchFilters {
  query: string
  cardTypeIds: string[]
  folderIds: string[]
  tags: string[]
  dateRange?: {
    from?: Date
    to?: Date
  }
  sortBy: 'updated_at' | 'created_at' | 'title' | 'relevance'
  sortOrder: 'asc' | 'desc'
}

interface SearchInterfaceProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  cardTypes: CardType[]
  folders: Folder[]
  isLoading?: boolean
}

export function SearchInterface({
  filters,
  onFiltersChange,
  cardTypes,
  folders,
  isLoading = false
}: SearchInterfaceProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Auto-show advanced if any advanced filters are active
  useEffect(() => {
    if (
      filters.cardTypeIds.length > 0 ||
      filters.folderIds.length > 0 ||
      filters.tags.length > 0 ||
      filters.dateRange ||
      filters.sortBy !== 'updated_at' ||
      filters.sortOrder !== 'desc'
    ) {
      setShowAdvanced(true)
    }
  }, [filters])

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ query: e.target.value })
  }

  const handleCardTypeToggle = (typeId: string) => {
    const isSelected = filters.cardTypeIds.includes(typeId)
    const newTypeIds = isSelected
      ? filters.cardTypeIds.filter(id => id !== typeId)
      : [...filters.cardTypeIds, typeId]
    updateFilters({ cardTypeIds: newTypeIds })
  }

  const handleFolderToggle = (folderId: string) => {
    const isSelected = filters.folderIds.includes(folderId)
    const newFolderIds = isSelected
      ? filters.folderIds.filter(id => id !== folderId)
      : [...filters.folderIds, folderId]
    updateFilters({ folderIds: newFolderIds })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      query: '',
      cardTypeIds: [],
      folderIds: [],
      tags: [],
      sortBy: 'updated_at',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = 
    filters.query ||
    filters.cardTypeIds.length > 0 ||
    filters.folderIds.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateRange ||
    filters.sortBy !== 'updated_at' ||
    filters.sortOrder !== 'desc'

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search cards by title, content, or fields..."
            value={filters.query}
            onChange={handleQueryChange}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? 'bg-slate-700' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="outline" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {[
                filters.cardTypeIds.length,
                filters.folderIds.length,
                filters.tags.length,
                filters.dateRange ? 1 : 0
              ].reduce((sum, count) => sum + count, 0)}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.cardTypeIds.map(typeId => {
            const cardType = cardTypes.find(t => t.id === typeId)
            return cardType ? (
              <Badge key={typeId} variant="outline" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {cardType.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleCardTypeToggle(typeId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}
          
          {filters.folderIds.map(folderId => {
            const folder = folders.find(f => f.id === folderId)
            return folder ? (
              <Badge key={folderId} variant="outline" className="flex items-center gap-1">
                <FolderIcon className="h-3 w-3" />
                {folder.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleFolderToggle(folderId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}

          {filters.tags.map(tag => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => updateFilters({ 
                  tags: filters.tags.filter(t => t !== tag) 
                })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-200">Advanced Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Card Types</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {cardTypes.map(cardType => (
                  <Button
                    key={cardType.id}
                    variant={filters.cardTypeIds.includes(cardType.id) ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start text-left h-8"
                    onClick={() => handleCardTypeToggle(cardType.id)}
                  >
                    {cardType.icon && <span className="mr-2">{cardType.icon}</span>}
                    <span className="truncate">{cardType.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Folders */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Folders</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {folders.map(folder => (
                  <Button
                    key={folder.id}
                    variant={filters.folderIds.includes(folder.id) ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start text-left h-8"
                    onClick={() => handleFolderToggle(folder.id)}
                  >
                    <div 
                      className="w-3 h-3 rounded mr-2"
                      style={{ backgroundColor: folder.color || '#6b7280' }}
                    />
                    <span className="truncate">{folder.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sort By</label>
              <div className="space-y-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilters({ 
                    sortBy: value as SearchFilters['sortBy'] 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="updated_at">Last Updated</SelectItem>
                    <SelectItem value="created_at">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ 
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                  })}
                  className="w-full justify-start"
                >
                  {filters.sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortDesc className="h-4 w-4 mr-2" />
                  )}
                  {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
