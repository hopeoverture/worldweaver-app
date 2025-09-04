'use client'

import { useState } from 'react'
import { MoreVertical, Edit, Trash2, FileText, Settings, User, Crown, MapPin, Globe, Globe2, Zap, Cpu, Users, Calendar, Bug, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime, pluralize } from '@/lib/utils'
import type { CardType } from '@/types/entities'

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
    return <IconComponent className="h-6 w-6 text-white" />
  }
  
  // Fallback: if it's an emoji or unknown icon, display as text
  return <span className="text-xl">{iconName}</span>
}

interface CardTypeCardProps {
  cardType: CardType
  onEdit: (cardType: CardType) => void
  onDelete: (cardType: CardType) => void
}

export default function CardTypeCard({ cardType, onEdit, onDelete }: CardTypeCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group relative rounded-lg border border-slate-700 bg-slate-800 p-6 hover:bg-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: cardType.color || '#6366f1' }}
          >
            {getIconComponent(cardType.icon || '📄')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-100">
              {cardType.name}
            </h3>
            {cardType.description && (
              <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                {cardType.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
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
                    onEdit(cardType)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Edit Type
                </button>
                <button
                  onClick={() => {
                    onDelete(cardType)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete Type
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Field Schema Summary */}
      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            {pluralize(cardType.schema.length, 'field')}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {cardType.schema.slice(0, 5).map((field, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </Badge>
          ))}
          {cardType.schema.length > 5 && (
            <Badge variant="outline" size="sm" className="text-xs">
              +{cardType.schema.length - 5} more
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {cardType.card_count !== undefined && (
            <div className="flex items-center space-x-1 text-sm text-slate-400">
              <FileText className="h-4 w-4" />
              <span>{pluralize(cardType.card_count, 'card')}</span>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500">
          Created {formatRelativeTime(cardType.created_at)}
        </div>
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
