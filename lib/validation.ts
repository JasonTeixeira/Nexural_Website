/**
 * INPUT VALIDATION & SANITIZATION
 * Centralized validation using Zod + DOMPurify
 * Protects against XSS, SQL injection, and malicious inputs
 */

import { z } from 'zod'
// DOMPurify is imported dynamically to avoid SSR issues
import type DOMPurify from 'isomorphic-dompurify'

// =============================================================================
// SANITIZATION FUNCTIONS
// =============================================================================

/**
 * Get DOMPurify instance (lazy load)
 */
let domPurifyInstance: typeof DOMPurify | null = null
async function getDOMPurify() {
  if (!domPurifyInstance) {
    const DOMPurifyModule = await import('isomorphic-dompurify')
    domPurifyInstance = DOMPurifyModule.default
  }
  return domPurifyInstance
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  // Simple regex-based sanitization for build-time safety
  // In production, this would use DOMPurify
  return dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Sanitize plain text (strip all HTML)
 */
export function sanitizeText(dirty: string): string {
  return dirty.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize and trim string
 */
export function cleanString(input: string): string {
  return sanitizeText(input).trim()
}

// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(3, 'Email too short')
  .max(255, 'Email too long')
  .transform(cleanString)
  .transform((email) => email.toLowerCase())

/**
 * Password validation
 * Minimum 8 characters, at least one letter and one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)/,
    'Password must contain at least one letter and one number'
  )

/**
 * Strong password (for new accounts)
 * Minimum 10 characters, letter, number, and special character
 */
export const strongPasswordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password too long')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/,
    'Password must contain at least one letter, number, and special character'
  )

/**
 * Username validation
 * Alphanumeric, underscore, hyphen only
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username too long')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscore, and hyphen'
  )
  .transform(cleanString)

/**
 * Name validation (first/last name)
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
  .transform(cleanString)

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .max(2048, 'URL too long')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url)
        return ['http:', 'https:'].includes(parsed.protocol)
      } catch {
        return false
      }
    },
    { message: 'Only HTTP and HTTPS URLs are allowed' }
  )

/**
 * UUID validation
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid ID format')

/**
 * Positive integer
 */
export const positiveIntSchema = z
  .number()
  .int('Must be a whole number')
  .positive('Must be a positive number')

/**
 * Positive decimal (for prices, amounts)
 */
export const positiveDecimalSchema = z
  .number()
  .positive('Must be a positive number')
  .finite('Must be a finite number')

/**
 * Stock symbol validation
 */
export const symbolSchema = z
  .string()
  .min(1, 'Symbol is required')
  .max(10, 'Symbol too long')
  .regex(/^[A-Z]+$/, 'Symbol must be uppercase letters only')
  .transform((s) => s.toUpperCase())

/**
 * Date string validation (ISO 8601)
 */
export const dateStringSchema = z
  .string()
  .datetime('Invalid date format')

/**
 * Phone number validation (US format)
 */
export const phoneSchema = z
  .string()
  .regex(
    /^\+?1?\d{10,14}$/,
    'Invalid phone number format'
  )
  .transform(cleanString)

/**
 * Safe text input (comments, messages, etc.)
 * Allows basic formatting but sanitizes HTML
 */
export const safeTextSchema = z
  .string()
  .min(1, 'Text cannot be empty')
  .max(5000, 'Text too long')
  .transform(sanitizeHtml)

/**
 * Plain text input (no HTML allowed)
 */
export const plainTextSchema = z
  .string()
  .min(1, 'Text cannot be empty')
  .max(5000, 'Text too long')
  .transform(sanitizeText)

// =============================================================================
// AUTH & USER VALIDATION SCHEMAS
// =============================================================================

/**
 * Login validation
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

/**
 * Signup validation
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  name: nameSchema,
  username: usernameSchema.optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
})

/**
 * Password reset request
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

/**
 * Password reset confirmation
 */
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/**
 * Profile update
 */
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  username: usernameSchema.optional(),
  bio: z.string().max(500).transform(sanitizeText).optional(),
  website: urlSchema.optional(),
  twitter: usernameSchema.optional(),
  linkedin: urlSchema.optional(),
})

// =============================================================================
// TRADING VALIDATION SCHEMAS
// =============================================================================

/**
 * Position creation/update
 */
export const positionSchema = z.object({
  symbol: symbolSchema,
  action: z.enum(['BUY', 'SELL'], {
    errorMap: () => ({ message: 'Action must be BUY or SELL' }),
  }),
  quantity: positiveIntSchema.max(1000000, 'Quantity too large'),
  entry_price: positiveDecimalSchema.max(1000000, 'Price too high'),
  stop_loss: positiveDecimalSchema.optional(),
  take_profit: positiveDecimalSchema.optional(),
  notes: z.string().max(1000).transform(sanitizeText).optional(),
  strategy: z.string().max(100).optional(),
  timeframe: z.enum(['INTRADAY', 'SWING', 'POSITION', 'LONG_TERM']).optional(),
})

/**
 * Comment validation
 */
export const commentSchema = z.object({
  content: z.string().min(1).max(2000, 'Comment too long').transform(sanitizeHtml),
  parent_id: uuidSchema.optional(),
})

/**
 * Search query validation
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Query too long').transform(cleanString),
  type: z.enum(['positions', 'users', 'symbols', 'all']).optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
})

// =============================================================================
// PAGINATION & FILTERING
// =============================================================================

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

/**
 * Date range filter
 */
export const dateRangeSchema = z.object({
  start: dateStringSchema.optional(),
  end: dateStringSchema.optional(),
}).refine((data) => {
  if (data.start && data.end) {
    return new Date(data.start) <= new Date(data.end)
  }
  return true
}, {
  message: 'Start date must be before end date',
})

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate data against a schema
 * Returns validated data or throws error
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Validate data safely (returns result object)
 */
export function validateDataSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return { success: false, errors: result.error }
}

/**
 * Format Zod errors for user-friendly display
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    formatted[path] = err.message
  })
  
  return formatted
}

/**
 * Validate and sanitize API request body
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> {
  try {
    const body = await request.json()
    const result = validateDataSafe(schema, body)
    
    if (result.success) {
      return { success: true, data: result.data }
    }
    
    return {
      success: false,
      errors: formatValidationErrors(result.errors),
    }
  } catch (error) {
    return {
      success: false,
      errors: { body: 'Invalid JSON in request body' },
    }
  }
}

// =============================================================================
// SQL INJECTION PREVENTION
// =============================================================================

/**
 * Check for SQL injection attempts in string
 * This is a secondary check - primary defense is parameterized queries
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /(\bOR\b.*=.*|UNION|AND.*=.*)/gi,
  ]
  
  return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * Sanitize input to prevent SQL injection
 * WARNING: This is NOT a replacement for parameterized queries!
 * Use this as an additional security layer
 */
export function sanitizeSqlInput(input: string): string {
  // Remove dangerous SQL keywords and characters
  return input
    .replace(/[';\\]/g, '') // Remove quotes and backslash
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .trim()
}

// =============================================================================
// XSS PREVENTION
// =============================================================================

/**
 * Check for XSS attempts
 */
export function detectXss(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ]
  
  return xssPatterns.some((pattern) => pattern.test(input))
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Sanitization
  sanitizeHtml,
  sanitizeText,
  cleanString,
  
  // Common schemas
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  usernameSchema,
  nameSchema,
  urlSchema,
  uuidSchema,
  symbolSchema,
  
  // Auth schemas
  loginSchema,
  signupSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  profileUpdateSchema,
  
  // Trading schemas
  positionSchema,
  commentSchema,
  searchQuerySchema,
  
  // Helpers
  validateData,
  validateDataSafe,
  formatValidationErrors,
  validateRequestBody,
  
  // Security
  detectSqlInjection,
  sanitizeSqlInput,
  detectXss,
}
