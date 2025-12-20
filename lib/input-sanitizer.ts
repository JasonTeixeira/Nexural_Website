/**
 * Input Sanitizer - Protect against XSS, SQL injection, and other attacks
 * Validates and sanitizes user input before processing
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitize plain text (remove all HTML)
 */
export function sanitizePlainText(text: string): string {
  if (!text) return ''
  
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null
  
  // Remove whitespace
  const cleaned = email.trim().toLowerCase()
  
  // Basic email regex
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  
  if (!emailRegex.test(cleaned)) {
    return null
  }
  
  return cleaned
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize phone number (US format)
 */
export function sanitizePhone(phone: string): string | null {
  if (!phone) return null
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Check if valid US phone number (10 or 11 digits)
  if (digits.length === 10) {
    return `+1${digits}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  return null
}

/**
 * Sanitize username (alphanumeric, underscore, hyphen)
 */
export function sanitizeUsername(username: string): string | null {
  if (!username) return null
  
  const cleaned = username.trim().toLowerCase()
  
  // Only allow alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-z0-9_-]{3,30}$/
  
  if (!usernameRegex.test(cleaned)) {
    return null
  }
  
  return cleaned
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(value: string | number, options?: {
  min?: number
  max?: number
  decimals?: number
}): number | null {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return null
  
  // Check bounds
  if (options?.min !== undefined && num < options.min) return null
  if (options?.max !== undefined && num > options.max) return null
  
  // Round to decimal places
  if (options?.decimals !== undefined) {
    return parseFloat(num.toFixed(options.decimals))
  }
  
  return num
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  return false
}

/**
 * Sanitize JSON input
 */
export function sanitizeJson<T = any>(json: string): T | null {
  if (!json) return null
  
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string | null {
  if (!fileName) return null
  
  // Remove path traversal attempts
  const cleaned = fileName.replace(/\.\./g, '').replace(/\//g, '').trim()
  
  // Only allow alphanumeric, underscore, hyphen, and dot
  const fileNameRegex = /^[a-z0-9_.-]+$/i
  
  if (!fileNameRegex.test(cleaned)) {
    return null
  }
  
  return cleaned
}

/**
 * Sanitize SQL input (basic protection)
 * Note: Always use parameterized queries for real SQL protection
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return ''
  
  // Remove common SQL injection patterns
  return input
    .replace(/['";]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
    .trim()
}

/**
 * Validate and sanitize credit card number (for display only)
 */
export function sanitizeCreditCard(cardNumber: string): {
  masked: string
  valid: boolean
} {
  if (!cardNumber) return { masked: '', valid: false }
  
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '')
  
  // Check length (13-19 digits for various card types)
  if (digits.length < 13 || digits.length > 19) {
    return { masked: '', valid: false }
  }
  
  // Basic Luhn algorithm check
  let sum = 0
  let isEven = false
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    
    sum += digit
    isEven = !isEven
  }
  
  const valid = sum % 10 === 0
  
  // Mask all but last 4 digits
  const masked = '**** **** **** ' + digits.slice(-4)
  
  return { masked, valid }
}

/**
 * Sanitize object by applying sanitizers to all string fields
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sanitizer: (value: string) => string = sanitizePlainText
): T {
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizer(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value, sanitizer)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizer(item) : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (!password) {
    return { valid: false, score: 0, feedback: ['Password is required'] }
  }
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters')
  } else if (password.length >= 12) {
    score += 2
  } else {
    score += 1
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one uppercase letter')
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one lowercase letter')
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one number')
  }
  
  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include at least one special character')
  }
  
  // Common password check
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123']
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0
    feedback.push('This is a commonly used password')
  }
  
  const valid = score >= 4 && password.length >= 8
  
  return { valid, score, feedback }
}

/**
 * Escape special regex characters
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Truncate string to maximum length
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}
