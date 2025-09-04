'use client'

import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-700 text-slate-200 border border-slate-600',
        primary: 'bg-indigo-600 text-indigo-100 border border-indigo-500',
        success: 'bg-emerald-600 text-emerald-100 border border-emerald-500',
        warning: 'bg-amber-600 text-amber-100 border border-amber-500',
        error: 'bg-red-600 text-red-100 border border-red-500',
        outline: 'border border-slate-500 text-slate-300 bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, size, className })} {...props} />
  )
}

// Specialized badge components
export function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' | 'error' }) {
  const variants = {
    active: 'success' as const,
    inactive: 'default' as const,
    pending: 'warning' as const,
    error: 'error' as const,
  }

  return (
    <Badge variant={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function TypeBadge({ type, color }: { type: string, color?: string }) {
  return (
    <Badge 
      variant="outline" 
      className="border-current"
      style={{ color, borderColor: color }}
    >
      {type}
    </Badge>
  )
}
