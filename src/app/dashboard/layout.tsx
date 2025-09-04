'use client'

import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/contexts/toast-context'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import ToastContainer from '@/components/ui/toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-black">
          <DashboardHeader />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <ToastContainer />
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
