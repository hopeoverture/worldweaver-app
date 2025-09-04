// Error handling utilities for WorldWeaver
import { useToastHelpers } from '@/contexts/toast-context'

// Custom error types
export class WorldWeaverError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'WorldWeaverError'
  }
}

export class ValidationError extends WorldWeaverError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends WorldWeaverError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends WorldWeaverError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends WorldWeaverError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends WorldWeaverError {
  constructor(message: string = 'Resource conflict') {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends WorldWeaverError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429)
    this.name = 'RateLimitError'
  }
}

// Error parsing utilities
export function parseSupabaseError(error: any): WorldWeaverError {
  if (!error) return new WorldWeaverError('Unknown error occurred')

  // Check for specific Supabase error codes
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return new ConflictError('A record with this information already exists')
      case '23503': // Foreign key violation
        return new ValidationError('Referenced record does not exist')
      case '23502': // Not null violation
        return new ValidationError('Required field is missing')
      case 'PGRST116': // Not found
        return new NotFoundError()
      case '42501': // Insufficient privilege
        return new AuthorizationError()
      default:
        return new WorldWeaverError(error.message || 'Database error', error.code)
    }
  }

  // Check for auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return new AuthenticationError('Invalid email or password')
  }

  if (error.message?.includes('Email not confirmed')) {
    return new AuthenticationError('Please confirm your email address')
  }

  if (error.message?.includes('User not found')) {
    return new AuthenticationError('User not found')
  }

  // Check for network errors
  if (error.message?.includes('fetch')) {
    return new WorldWeaverError('Network error. Please check your connection.')
  }

  // Default
  return new WorldWeaverError(error.message || 'An unexpected error occurred')
}

// Error handling hook
export function useErrorHandler() {
  const { error, success } = useToastHelpers()

  const handleError = (err: any, context?: string) => {
    const parsedError = parseSupabaseError(err)
    
    console.error('Error in', context || 'application', ':', parsedError)
    
    error(
      parsedError.name.replace('Error', ''),
      parsedError.message
    )
  }

  const handleSuccess = (message: string, description?: string) => {
    success(message, description)
  }

  return { handleError, handleSuccess }
}

// Async wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    const parsedError = parseSupabaseError(error)
    console.error(`Error in ${context || 'operation'}:`, parsedError)
    throw parsedError
  }
}

// Form validation utilities
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required'
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format'
    }
  }

  if (rules.custom) {
    return rules.custom(value)
  }

  return null
}

export function validateSchema(data: any, schema: ValidationSchema): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules)
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

// Common validation schemas
export const validationSchemas = {
  world: {
    name: { required: true, minLength: 1, maxLength: 100 },
    description: { maxLength: 500 }
  },
  cardType: {
    name: { required: true, minLength: 1, maxLength: 50 },
    description: { maxLength: 200 }
  },
  card: {
    name: { required: true, minLength: 1, maxLength: 200 },
    summary: { maxLength: 500 }
  },
  folder: {
    name: { required: true, minLength: 1, maxLength: 100 },
    description: { maxLength: 200 }
  },
  profile: {
    full_name: { maxLength: 100 }
  }
}
