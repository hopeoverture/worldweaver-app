'use client'

import { useState } from 'react'
import { Modal, ModalContent, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '../ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useToastHelpers } from '@/contexts/toast-context'
import { supabaseService } from '@/lib/supabase/service'
import { useErrorHandler } from '@/lib/error-handling'
import { 
  BookOpen, 
  Swords, 
  Rocket, 
  Crown, 
  Skull, 
  Heart, 
  Zap, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  MapPin,
  FileText
} from 'lucide-react'
import type { World } from '@/types/entities'

interface CreateWorldModalProps {
  isOpen: boolean
  onClose: () => void
  onWorldCreated: (world: World) => void
}

type Step = 'welcome' | 'template' | 'details' | 'visibility'

const WORLD_TEMPLATES = [
  {
    id: 'fantasy',
    name: 'Fantasy Realm',
    description: 'Medieval fantasy with magic, dragons, and epic quests',
    icon: Swords,
    color: '#8B5CF6',
    genre: 'Fantasy',
    exampleTitle: 'The Kingdom of Aethermoor',
    exampleSummary: 'A magical realm where ancient dragons soar above floating islands and brave heroes seek legendary artifacts.'
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Universe',
    description: 'Futuristic setting with advanced technology and space exploration',
    icon: Rocket,
    color: '#06B6D4',
    genre: 'Science Fiction',
    exampleTitle: 'The Nexus Colonies',
    exampleSummary: 'In the year 2387, humanity has spread across the galaxy, but ancient alien mysteries threaten the peace.'
  },
  {
    id: 'modern',
    name: 'Modern Setting',
    description: 'Contemporary world with realistic or urban fantasy elements',
    icon: Globe,
    color: '#10B981',
    genre: 'Modern',
    exampleTitle: 'New Haven City',
    exampleSummary: 'A bustling metropolis where ordinary people live extraordinary lives, and secrets hide in plain sight.'
  },
  {
    id: 'historical',
    name: 'Historical Fiction',
    description: 'Set in a specific historical period with authentic details',
    icon: Crown,
    color: '#F59E0B',
    genre: 'Historical',
    exampleTitle: 'The Court of Versailles',
    exampleSummary: 'Navigate the intrigue and politics of 18th century France in the opulent palace of the Sun King.'
  },
  {
    id: 'horror',
    name: 'Horror & Mystery',
    description: 'Dark atmosphere with supernatural or psychological horror',
    icon: Skull,
    color: '#EF4444',
    genre: 'Horror',
    exampleTitle: 'Shadowbrook Township',
    exampleSummary: 'A seemingly quiet New England town harbors dark secrets that emerge when the fog rolls in.'
  },
  {
    id: 'romance',
    name: 'Romance & Drama',
    description: 'Character-driven stories focused on relationships and emotions',
    icon: Heart,
    color: '#EC4899',
    genre: 'Romance',
    exampleTitle: 'Rosewood Academy',
    exampleSummary: 'An elite boarding school where young hearts discover love, friendship, and the complexities of growing up.'
  },
  {
    id: 'superhero',
    name: 'Superhero Universe',
    description: 'Modern world with superpowered heroes and villains',
    icon: Zap,
    color: '#F97316',
    genre: 'Superhero',
    exampleTitle: 'Meridian City',
    exampleSummary: 'A gleaming metropolis protected by the Guardians Alliance, but new threats emerge from the shadows.'
  },
  {
    id: 'custom',
    name: 'Start from Scratch',
    description: 'Create your own unique world without a template',
    icon: BookOpen,
    color: '#6B7280',
    genre: null,
    exampleTitle: 'My World',
    exampleSummary: 'A unique world of my own creation...'
  }
]

export default function CreateWorldModal({ isOpen, onClose, onWorldCreated }: CreateWorldModalProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof WORLD_TEMPLATES[0] | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [genre, setGenre] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private')
  const [loading, setLoading] = useState(false)
  
  const { user } = useAuth()
  const { success } = useToastHelpers()
  const { handleError } = useErrorHandler()

  const handleTemplateSelect = (template: typeof WORLD_TEMPLATES[0]) => {
    setSelectedTemplate(template)
    setTitle(template.exampleTitle)
    setSummary(template.exampleSummary)
    setGenre(template.genre || '')
    setStep('details')
  }

  const handleSubmit = async () => {
    if (!user || !title.trim()) return

    setLoading(true)
    try {
      const world = await supabaseService.world.createWorld({
        owner_id: user.id,
        title: title.trim(),
        summary: summary.trim() || null,
        visibility,
        genre: genre || null,
      })

      success('World created successfully!')
      onWorldCreated(world)
      
      // Reset form
      resetForm()
      
      // Close modal
      onClose()
    } catch (error) {
      handleError(error, 'creating world')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('welcome')
    setSelectedTemplate(null)
    setTitle('')
    setSummary('')
    setGenre('')
    setVisibility('private')
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-slate-100 mb-2">Welcome to WorldWeaver!</h3>
        <p className="text-slate-400">
          Let&apos;s create your new world together. Our guided setup will help you build an amazing foundation for your stories, campaigns, and creative projects.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-slate-800 rounded-lg">
          <MapPin className="h-6 w-6 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-slate-300">Organize Content</p>
        </div>
        <div className="p-3 bg-slate-800 rounded-lg">
          <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-slate-300">Collaborate</p>
        </div>
        <div className="p-3 bg-slate-800 rounded-lg">
          <FileText className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-slate-300">Use Templates</p>
        </div>
      </div>
    </div>
  )

  const renderTemplateStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Choose Your World Type</h3>
        <p className="text-slate-400">Select a template to get started with pre-built content, or start from scratch.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {WORLD_TEMPLATES.map((template) => {
          const IconComponent = template.icon
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg text-left transition-all group"
            >
              <div className="flex items-start space-x-3">
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: template.color + '20', color: template.color }}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-100 text-sm group-hover:text-white">
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">World Details</h3>
        <p className="text-slate-400">Give your world a name and description. You can always change these later.</p>
      </div>

      {selectedTemplate && selectedTemplate.id !== 'custom' && (
        <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <selectedTemplate.icon className="h-5 w-5" style={{ color: selectedTemplate.color }} />
            <span className="font-medium text-slate-100">{selectedTemplate.name}</span>
          </div>
          <p className="text-sm text-slate-400">{selectedTemplate.description}</p>
        </div>
      )}

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
        <Label htmlFor="world-summary">Summary</Label>
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

      {selectedTemplate?.id === 'custom' && (
        <div>
          <Label htmlFor="world-genre">Genre (optional)</Label>
          <Input
            id="world-genre"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g., Fantasy, Sci-Fi, Mystery..."
            maxLength={50}
            className="mt-1"
          />
        </div>
      )}
    </div>
  )

  const renderVisibilityStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Privacy Settings</h3>
        <p className="text-slate-400">Choose who can see and access your world.</p>
      </div>

      <div className="space-y-3">
        {[
          {
            value: 'private' as const,
            title: 'Private',
            description: 'Only you can see and edit this world',
            icon: '🔒'
          },
          {
            value: 'shared' as const,
            title: 'Shared',
            description: 'You can invite specific people to collaborate',
            icon: '👥'
          },
          {
            value: 'public' as const,
            title: 'Public',
            description: 'Anyone can view your world (read-only)',
            icon: '🌍'
          }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setVisibility(option.value)}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              visibility === option.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 bg-slate-800 hover:border-slate-500'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-xl">{option.icon}</span>
              <div>
                <h4 className="font-medium text-slate-100">{option.title}</h4>
                <p className="text-sm text-slate-400">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const getStepContent = () => {
    switch (step) {
      case 'welcome':
        return renderWelcomeStep()
      case 'template':
        return renderTemplateStep()
      case 'details':
        return renderDetailsStep()
      case 'visibility':
        return renderVisibilityStep()
      default:
        return renderWelcomeStep()
    }
  }

  const getNextStep = () => {
    switch (step) {
      case 'welcome':
        return 'template'
      case 'template':
        return 'details'
      case 'details':
        return 'visibility'
      default:
        return step
    }
  }

  const getPrevStep = () => {
    switch (step) {
      case 'template':
        return 'welcome'
      case 'details':
        return 'template'
      case 'visibility':
        return 'details'
      default:
        return step
    }
  }

  const canProceed = () => {
    switch (step) {
      case 'welcome':
        return true
      case 'template':
        return selectedTemplate !== null
      case 'details':
        return title.trim().length > 0
      case 'visibility':
        return true
      default:
        return false
    }
  }

  const isLastStep = step === 'visibility'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New World" size="lg">
      <ModalContent>
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            {['welcome', 'template', 'details', 'visibility'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName ? 'bg-blue-500 text-white' :
                  ['welcome', 'template', 'details', 'visibility'].indexOf(step) > index ? 'bg-green-500 text-white' :
                  'bg-slate-600 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 ${
                    ['welcome', 'template', 'details', 'visibility'].indexOf(step) > index ? 'bg-green-500' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {getStepContent()}
      </ModalContent>

      <ModalFooter>
        <div className="flex justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={step === 'welcome' ? handleClose : () => setStep(getPrevStep())}
            disabled={loading}
          >
            {step === 'welcome' ? 'Cancel' : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </>
            )}
          </Button>
          
          <Button
            type="button"
            onClick={isLastStep ? handleSubmit : () => setStep(getNextStep())}
            disabled={loading || !canProceed()}
          >
            {loading ? 'Creating...' : isLastStep ? 'Create World' : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}


