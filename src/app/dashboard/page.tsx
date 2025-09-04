'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Globe, FileText, Grid3x3, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import CreateWorldModal from '@/components/worlds/create-world-modal'
import { supabaseService } from '@/lib/supabase/service'
import { useToastHelpers } from '@/contexts/toast-context'
import { formatRelativeTime } from '@/lib/utils'
import type { World } from '@/types/entities'

interface RecentActivity {
  id: string;
  type: 'card' | 'world';
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [worlds, setWorlds] = useState<World[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { success, error } = useToastHelpers()

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true)
      
      // Load user's worlds
      const userWorlds = await supabaseService.world.getUserWorlds(user.id)
      setWorlds(userWorlds)
      
      // TODO: Load recent activity when API is ready
      setRecentActivity([])
      
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error loading dashboard data:', err)
        error('Failed to load dashboard data: ' + err.message)
      } else {
        console.error('An unknown error occurred:', err)
        error('An unknown error occurred while loading dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }, [user, error])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user, loadDashboardData])

  const handleWorldCreated = (newWorld: World) => {
    setWorlds(prev => [newWorld, ...prev])
    setShowCreateModal(false)
    success('World created successfully!')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-slate-400">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-2 text-slate-400">
          Continue building your worlds or start a new adventure.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-4">
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create World
        </Button>
        <Link href="/dashboard/worlds">
          <Button variant="outline">
            <Globe className="h-4 w-4 mr-2" />
            All Worlds
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-100">{worlds.length}</p>
                <p className="text-sm text-slate-400">Worlds Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-100">
                  {worlds.reduce((sum, w) => sum + (w.card_count || 0), 0)}
                </p>
                <p className="text-sm text-slate-400">Total Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Grid3x3 className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-100">0</p>
                <p className="text-sm text-slate-400">Card Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Worlds */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-100">Your Worlds</h2>
              {worlds.length > 3 && (
                <Link href="/dashboard/worlds">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
            
            {worlds.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-100 mb-2">
                  No worlds yet
                </h3>
                <p className="text-slate-400 mb-4">
                  Create your first world to start building your universe.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First World
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {worlds.slice(0, 3).map((world) => (
                  <Link 
                    key={world.id} 
                    href={`/dashboard/worlds/${world.id}`}
                    className="block p-4 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-100 mb-1">
                          {world.title}
                        </h3>
                        {world.summary && (
                          <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                            {world.summary}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>{world.card_count || 0} cards</span>
                          <span>Updated {formatRelativeTime(world.updated_at)}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 mt-1" />
                    </div>
                  </Link>
                ))}
                
                {worlds.length < 3 && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full p-4 rounded-lg border-2 border-dashed border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Plus className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">Create Another World</span>
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-6">Recent Activity</h2>
            
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-100 mb-2">
                  No recent activity
                </h3>
                <p className="text-slate-400">
                  Start creating cards and content to see your activity here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Activity items will be populated when API is ready */}
              </div>
            )}
          </CardContent>
        </Card>
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
