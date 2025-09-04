'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreVertical, Edit, Trash2, Globe, Lock, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime, pluralize } from '@/lib/utils'
import type { World } from '@/types/entities'

interface WorldCardProps {
  world: World
  onEdit: (world: World) => void
  onDelete: (world: World) => void
}

export default function WorldCard({ world, onEdit, onDelete }: WorldCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the menu button or menu items
    const target = e.target as HTMLElement
    if (target.closest('.actions-menu') || target.closest('button')) {
      return
    }
    router.push(`/dashboard/worlds/${world.id}`)
  }

  return (
    <div 
      className="group relative rounded-lg border border-slate-700 bg-slate-800 p-6 hover:bg-slate-700 transition-all cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
            {world.title}
          </h3>
          {world.summary && (
            <p className="mt-1 text-sm text-slate-400 line-clamp-2">
              {world.summary}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative actions-menu">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-slate-600 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(world)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Edit World
                </button>
                <button
                  onClick={() => {
                    onDelete(world)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete World
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3 flex items-center space-x-2">
        <Badge variant={world.visibility === 'public' ? 'primary' : 'outline'}>
          {world.visibility === 'public' ? (
            <>
              <Globe className="h-3 w-3 mr-1" />
              Public
            </>
          ) : world.visibility === 'shared' ? (
            <>
              <Users className="h-3 w-3 mr-1" />
              Shared
            </>
          ) : (
            <>
              <Lock className="h-3 w-3 mr-1" />
              Private
            </>
          )}
        </Badge>

        {world.member_count && world.member_count > 1 && (
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {pluralize(world.member_count, 'member')}
          </Badge>
        )}

        {world.card_count && world.card_count > 0 && (
          <Badge variant="outline">
            <FileText className="h-3 w-3 mr-1" />
            {pluralize(world.card_count, 'card')}
          </Badge>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Created {formatRelativeTime(world.created_at)}
        </span>
        {world.updated_at !== world.created_at && (
          <span>
            Updated {formatRelativeTime(world.updated_at)}
          </span>
        )}
      </div>

      {/* Click overlay to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
