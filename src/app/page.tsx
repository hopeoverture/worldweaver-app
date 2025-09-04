'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    
    checkUser()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Build Amazing
          <span className="text-indigo-400"> Fictional Worlds</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Create, organize, and explore your fictional worlds with AI-powered assistance. 
          Design characters, locations, and stories that come alive.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">Create Worlds</h3>
          <p className="mt-2 text-sm text-slate-400">
            Build detailed fictional worlds with custom card types and flexible data structures.
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">Connect Everything</h3>
          <p className="mt-2 text-sm text-slate-400">
            Link characters, locations, and items together to create rich, interconnected stories.
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">AI-Powered</h3>
          <p className="mt-2 text-sm text-slate-400">
            Get AI assistance for writing descriptions, generating content, and expanding your ideas.
          </p>
        </div>
      </div>
    </div>
  )
}
