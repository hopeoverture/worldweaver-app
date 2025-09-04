'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/contexts/toast-context'
import { AppSidebar, AppHeader } from '@/components/layout'
import ToastContainer from '@/components/ui/toast'
import { supabaseService } from '@/lib/supabase/service'
import type { World } from '@/types/entities'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const [currentWorld, setCurrentWorld] = useState<World | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Extract world ID from URL if we're in a world context
  const worldId = params?.worldId as string

  // Load current world when in world context
  useEffect(() => {
    if (worldId && pathname.includes('/worlds/')) {
      loadCurrentWorld()
    } else {
      setCurrentWorld(null)
    }
  }, [worldId, pathname])

  const loadCurrentWorld = async () => {
    try {
      const world = await supabaseService.world.getWorld(worldId)
      setCurrentWorld(world)
    } catch (err) {
      console.error('Error loading current world:', err)
      setCurrentWorld(null)
    }
  }

  const handleMobileToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-900 flex">
          {/* Sidebar */}
          <AppSidebar 
            currentWorld={currentWorld} 
            isMobileOpen={isMobileMenuOpen}
            onMobileToggle={handleMobileToggle}
          />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <AppHeader onMobileMenuToggle={handleMobileToggle} />
            <main className="flex-1 overflow-y-auto">
              <div className="p-4 lg:p-6">
                {children}
              </div>
            </main>
          </div>
          
          <ToastContainer />
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
