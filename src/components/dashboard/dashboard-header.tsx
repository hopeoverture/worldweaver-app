'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <header className="border-b border-slate-700 bg-slate-800/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard">
              <h1 className="text-xl font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
                WorldWeaver
              </h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/dashboard"
                className="text-sm text-slate-300 hover:text-slate-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/worlds"
                className="text-sm text-slate-300 hover:text-slate-100 transition-colors"
              >
                Worlds
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-sm text-slate-300 hover:text-slate-100 transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-300">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
