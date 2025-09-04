'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings, FileText, Folders, Grid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import { formatRelativeTime } from '@/lib/utils'
import type { World } from '@/types/entities'

export default function WorldDetailPage() {
  const params = useParams()
  const worldId = params.worldId as string
  
  const [world, setWorld] = useState<World | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  
  const { error } = useToastHelpers()

  useEffect(() => {
    if (worldId) {
      loadWorld()
    }
  }, [worldId, retryCount])

  const loadWorld = async () => {
    try {
      setLoading(true)
      const worldData = await supabaseService.world.getWorld(worldId)
      if (worldData) {
        setWorld(worldData)
      } else {
        setWorld(null)
        error('World not found or you do not have access to it')
      }
    } catch (err: any) {
      setWorld(null)
      if (err?.message?.includes('not found') || err?.code === 'PGRST116') {
        error('World not found')
      } else {
        error('Failed to load world')
      }
      console.error('Error loading world:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    )
  }

  if (!world) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-100 mb-2">
          World not found
        </h3>
        <p className="text-slate-400 mb-4">
          The world you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="space-x-4">
          <Link href="/dashboard/worlds">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Worlds
            </Button>
          </Link>
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <Link href="/dashboard/worlds" className="hover:text-slate-100">
          Worlds
        </Link>
        <span>/</span>
        <span className="text-slate-100 font-medium">{world.title}</span>
      </div>

      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              {world.title}
            </h1>
            {world.summary && (
              <p className="text-slate-300 mb-4">
                {world.summary}
              </p>
            )}
            <div className="flex items-center space-x-4">
              <Badge variant={world.visibility === 'public' ? 'primary' : 'outline'}>
                {world.visibility === 'public' ? 'Public' : world.visibility === 'shared' ? 'Shared' : 'Private'}
              </Badge>
              {world.member_count && world.member_count > 1 && (
                <span className="text-sm text-slate-400">
                  {world.member_count} members
                </span>
              )}
              <span className="text-sm text-slate-400">
                Created {formatRelativeTime(world.created_at)}
              </span>
            </div>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Types */}
        <Link href={`/dashboard/worlds/${worldId}/card-types`}>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:bg-slate-700 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <Grid className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-400">
                Card Types
              </h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Define the structure and fields for different types of cards in your world.
            </p>
            <div className="text-sm text-slate-400">
              Create schemas for characters, locations, items, and more
            </div>
          </div>
        </Link>

        {/* Cards & Folders */}
        <Link href={`/dashboard/worlds/${worldId}/cards`}>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:bg-slate-700 transition-colors cursor-pointer group">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 group-hover:text-green-400">
                Cards
              </h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Create and manage individual cards for your worldbuilding content.
            </p>
            <div className="text-sm text-slate-400">
              Characters, locations, items, and more organized in folders
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-slate-100">0</div>
            <div className="text-sm text-slate-400">Card Types</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">0</div>
            <div className="text-sm text-slate-400">Cards</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">0</div>
            <div className="text-sm text-slate-400">Folders</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {world.member_count || 1}
            </div>
            <div className="text-sm text-slate-400">Members</div>
          </div>
        </div>
      </div>
    </div>
  )
}
