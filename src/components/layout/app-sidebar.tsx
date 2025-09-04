'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Globe, 
  FileText, 
  Grid3x3, 
  Settings, 
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  currentWorld?: {
    id: string
    title: string
  } | null
  isMobileOpen?: boolean
  onMobileToggle?: () => void
}

export default function AppSidebar({ 
  currentWorld, 
  isMobileOpen = false, 
  onMobileToggle 
}: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  const mainNavItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      title: 'Worlds',
      icon: Globe,
      href: '/dashboard/worlds',
      active: isActive('/dashboard/worlds') && !currentWorld
    }
  ]

  const worldNavItems = currentWorld ? [
    {
      title: 'Overview',
      icon: Home,
      href: `/dashboard/worlds/${currentWorld.id}`,
      active: pathname === `/dashboard/worlds/${currentWorld.id}`
    },
    {
      title: 'Cards',
      icon: FileText,
      href: `/dashboard/worlds/${currentWorld.id}/cards`,
      active: isActive(`/dashboard/worlds/${currentWorld.id}/cards`)
    },
    {
      title: 'Card Types',
      icon: Grid3x3,
      href: `/dashboard/worlds/${currentWorld.id}/card-types`,
      active: isActive(`/dashboard/worlds/${currentWorld.id}/card-types`)
    }
  ] : []

  const bottomNavItems = [
    {
      title: 'Profile',
      icon: User,
      href: '/dashboard/profile',
      active: isActive('/dashboard/profile')
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      active: isActive('/dashboard/settings')
    }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col h-full bg-slate-800 border-r border-slate-700 transition-all duration-300",
        "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-slate-100">WorldWeaver</span>
            </Link>
          )}
          <div className="flex items-center space-x-2">
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileToggle}
              className="h-8 w-8 p-0 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hidden lg:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <nav className="p-2 space-y-1">
            {mainNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  item.active 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                )}>
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.title}</span>}
                </div>
              </Link>
            ))}
          </nav>

          {/* World Navigation */}
          {currentWorld && (
            <>
              <div className="px-4 py-2 border-t border-slate-700 mt-4">
                {!isCollapsed && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Current World
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {!isCollapsed && (
                  <h3 className="text-sm font-medium text-slate-200 mt-1 truncate">
                    {currentWorld.title}
                  </h3>
                )}
              </div>
              <nav className="p-2 space-y-1">
                {worldNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      item.active 
                        ? "bg-indigo-600 text-white" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                    )}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </div>
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-slate-700 p-2 space-y-1">
          {bottomNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                item.active 
                  ? "bg-indigo-600 text-white" 
                  : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
              )}>
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span>{item.title}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
