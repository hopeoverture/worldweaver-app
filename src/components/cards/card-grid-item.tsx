'use client'

import { useState } from 'react'
import { MoreVertical, Edit, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import type { Card } from '@/types/entities'

interface CardGridItemProps {
  card: Card
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
  onClick?: (card: Card) => void
  viewMode: 'grid' | 'list'
}

export default function CardGridItem({ 
  card, 
  onEdit, 
  onDelete, 
  onClick, 
  viewMode 
}: CardGridItemProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleCardClick = () => {
    if (onClick) {
      onClick(card)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(card)
    setShowMenu(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(card)
    setShowMenu(false)
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:bg-slate-700 transition-colors cursor-pointer group">
        <div className="flex items-center space-x-4" onClick={handleCardClick}>
          {/* Cover Image or Icon */}
          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
            {card.cover_image_url ? (
              <img
                src={card.cover_image_url}
                alt={card.name}
                className="w-12 h-12 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div className={`flex items-center justify-center ${card.cover_image_url ? 'hidden' : ''}`}>
              {card.type?.icon ? (
                <span className="text-lg">{card.type.icon}</span>
              ) : (
                <ImageIcon className="h-6 w-6 text-slate-400" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-slate-100 truncate">{card.name}</h3>
              {card.type && (
                <span 
                  className="px-2 py-1 text-xs rounded-full"
                  style={{ 
                    backgroundColor: `${card.type.color || '#6366f1'}20`,
                    color: card.type.color || '#6366f1'
                  }}
                >
                  {card.type.name}
                </span>
              )}
            </div>
            {card.summary && (
              <p className="text-sm text-slate-400 truncate mb-1">{card.summary}</p>
            )}
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              {card.folder && (
                <span>📁 {card.folder.name}</span>
              )}
              <span>Updated {formatRelativeTime(card.updated_at)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                <div className="absolute right-0 top-8 w-32 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-600 z-20">
                  <div className="py-1">
                    <button
                      onClick={handleEdit}
                      className="flex items-center w-full px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
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
      </div>
    )
  }

  // Grid view
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:bg-slate-700 transition-colors cursor-pointer group">
      <div onClick={handleCardClick}>
        {/* Cover Image */}
        <div className="aspect-video bg-slate-700 relative">
          {card.cover_image_url ? (
            <img
              src={card.cover_image_url}
              alt={card.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${card.cover_image_url ? 'hidden' : ''}`}>
            {card.type?.icon ? (
              <span className="text-4xl">{card.type.icon}</span>
            ) : (
              <ImageIcon className="h-12 w-12 text-slate-400" />
            )}
          </div>
          
          {/* Actions Menu */}
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
            >
              <MoreVertical className="h-4 w-4 text-white" />
            </Button>

            {showMenu && (
              <>
                <div className="absolute right-0 top-8 w-32 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-600 z-20">
                  <div className="py-1">
                    <button
                      onClick={handleEdit}
                      className="flex items-center w-full px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
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

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-100 truncate pr-2">{card.name}</h3>
            {card.type && (
              <span 
                className="px-2 py-1 text-xs rounded-full shrink-0"
                style={{ 
                  backgroundColor: `${card.type.color || '#6366f1'}20`,
                  color: card.type.color || '#6366f1'
                }}
              >
                {card.type.name}
              </span>
            )}
          </div>
          
          {card.summary && (
            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{card.summary}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            {card.folder ? (
              <span>📁 {card.folder.name}</span>
            ) : (
              <span>No folder</span>
            )}
            <span>{formatRelativeTime(card.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
