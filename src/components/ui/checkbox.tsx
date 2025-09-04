'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends React.ComponentPropsWithoutRef<'input'> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
      props.onChange?.(e)
    }

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            'peer sr-only',
            className
          )}
          onChange={handleChange}
          {...props}
        />
        <div className="h-4 w-4 rounded border border-slate-600 bg-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900 transition-colors cursor-pointer flex items-center justify-center">
          <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
