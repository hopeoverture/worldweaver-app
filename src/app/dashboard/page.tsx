'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight, Globe, FileText, Folders } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import CreateWorldModal from '@/components/worlds/create-world-modal'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import type { World } from '@/types/entities'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [worlds, setWorlds] = useState<World[]>([])
  const [worldsLoading, setWorldsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const { success, error } = useToastHelpers()

  // Load user's worlds
  useEffect(() => {
    if (user) {
      loadWorlds()
    }
  }, [user])

  const loadWorlds = async () => {
    try {
      setWorldsLoading(true)
      setConnectionError(false)
      
      console.log('Loading worlds for user:', user?.id)
      console.log('User object:', user)
      
      if (!user?.id) {
        throw new Error('No user ID available')
      }
      
      const userWorlds = await supabaseService.world.getUserWorlds(user.id)
      console.log('Loaded worlds:', userWorlds)
      setWorlds(userWorlds)
    } catch (err: any) {
      console.error('Error loading worlds:', err)
      console.error('Error details:', {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
        cause: err?.cause
      })
      setConnectionError(true)
      // Show user-friendly error message
      error('Failed to load worlds. Please check if Supabase is running.')
    } finally {
      setWorldsLoading(false)
    }
  }

  const handleWorldCreated = (newWorld: World) => {
    setWorlds(prev => [newWorld, ...prev])
    setShowCreateModal(false)
    success('World created successfully!')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Welcome to WorldWeaver! Start building your world.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Worlds Section */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-100">Your Worlds</h2>
            {worlds.length > 0 && (
              <Link href="/dashboard/worlds">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
          
          {worldsLoading ? (
            <div className="text-sm text-slate-400">Loading worlds...</div>
          ) : connectionError ? (
            <div className="text-center">
              <p className="text-sm text-red-400 mb-4">
                ⚠️ Unable to connect to database. Please ensure Supabase is running.
              </p>
              <Button 
                variant="outline"
                size="sm"
                onClick={loadWorlds}
                className="w-full"
              >
                Retry Connection
              </Button>
            </div>
          ) : worlds.length === 0 ? (
            <div>
              <p className="text-sm text-slate-400 mb-4">
                Create and manage your fictional worlds
              </p>
              <Button 
                className="w-full" 
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First World
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {worlds.slice(0, 3).map((world) => (
                <Link 
                  key={world.id} 
                  href={`/dashboard/worlds/${world.id}`}
                  className="block p-3 rounded-md border border-slate-600 bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-100 truncate">
                      {world.title}
                    </span>
                  </div>
                  {world.summary && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {world.summary}
                    </p>
                  )}
                </Link>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New World
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-lg font-medium text-slate-100">Quick Stats</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-slate-400">Worlds</span>
              </div>
              <span className="text-lg font-semibold text-slate-100">
                {worlds.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-slate-400">Cards</span>
              </div>
              <span className="text-lg font-semibold text-slate-100">
                {worlds.reduce((sum, w) => sum + (w.card_count || 0), 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Folders className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-slate-400">Types</span>
              </div>
              <span className="text-lg font-semibold text-slate-100">0</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-lg font-medium text-slate-100">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <Button 
              className="w-full"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create World
            </Button>
            <Link href="/dashboard/worlds" className="block">
              <Button variant="outline" className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Manage Worlds
              </Button>
            </Link>
            <Button variant="outline" className="w-full" disabled>
              Browse Templates
            </Button>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <h2 className="text-lg font-medium text-slate-100">Account Information</h2>
        <div className="mt-4 space-y-2 text-slate-300">
          <p className="text-sm">
            <span className="font-medium text-slate-200">Email:</span> {user?.email}
          </p>
          <p className="text-sm">
            <span className="font-medium text-slate-200">Full Name:</span>{' '}
            {user?.user_metadata?.full_name || 'Not provided'}
          </p>
          <p className="text-sm">
            <span className="font-medium text-slate-200">Account Created:</span>{' '}
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>

      {/* Create World Modal */}
      <CreateWorldModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorldCreated={handleWorldCreated}
      />
    </div>
  )
}
