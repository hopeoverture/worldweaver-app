'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Bell, Search, Plus, Menu } from 'lucide-react'

interface AppHeaderProps {
  onMobileMenuToggle?: () => void
}

export default function AppHeader({ onMobileMenuToggle }: AppHeaderProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile menu button and search */}
      <div className="flex items-center space-x-4 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden h-8 w-8 p-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cards, types, worlds..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Quick Create */}
        <Button variant="default" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-100">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </div>
            <div className="text-xs text-slate-400">
              {user?.email}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
