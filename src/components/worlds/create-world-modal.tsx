'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '../ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useToastHelpers } from '@/contexts/toast-context'
import { supabaseService } from '@/lib/supabase/service'
import { useErrorHandler } from '@/lib/error-handling'
import { generateColor } from '@/lib/utils'
import type { World } from '@/types/entities'

interface CreateWorldModalProps {
  isOpen: boolean
  onClose: () => void
  onWorldCreated: (world: World) => void
}

export default function CreateWorldModal({ isOpen, onClose, onWorldCreated }: CreateWorldModalProps) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { success } = useToastHelpers()
  const { handleError } = useErrorHandler()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim()) return

    setLoading(true)
    try {
      const world = await supabaseService.world.createWorld({
        owner_id: user.id,
        title: title.trim(),
        summary: summary.trim() || null,
        visibility,
        genre: null,
      })

      success('World created successfully!')
      onWorldCreated(world)
      
      // Reset form
      setTitle('')
      setSummary('')
      setVisibility('private')
      
      // Close modal
      onClose()
      
      // Optional: Navigate to the new world after ensuring state is updated
      // We can add this back later with proper state management
      // setTimeout(() => {
      //   router.push(`/dashboard/worlds/${world.id}`)
      // }, 100)
    } catch (error) {
      handleError(error, 'creating world')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTitle('')
      setSummary('')
      setVisibility('private')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New World" size="md">
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="world-title">World Title</Label>
              <Input
                id="world-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter world title..."
                required
                maxLength={100}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="world-summary">Summary (optional)</Label>
              <Textarea
                id="world-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe your world..."
                maxLength={500}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="world-visibility">Visibility</Label>
              <select
                id="world-visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'private' | 'shared' | 'public')}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
              >
                <option value="private">Private (only you)</option>
                <option value="shared">Shared (with collaborators)</option>
                <option value="public">Public (viewable by all)</option>
              </select>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !title.trim()}
          >
            {loading ? 'Creating...' : 'Create World'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
