/**
 * Environment Variable Validator
 * Validates all required environment variables at startup
 * Fails fast with clear error messages if anything is missing
 */

interface EnvConfig {
  name: string
  required: boolean
  type: 'string' | 'url' | 'number' | 'boolean'
  description: string
  defaultValue?: string
}

const ENV_SCHEMA: EnvConfig[] = [
  // Database
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    type: 'url',
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    type: 'string',
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    type: 'string',
    description: 'Supabase service role key (server-side only)',
  },
  {
    name: 'SUPABASE_URL',
    required: true,
    type: 'url',
    description: 'Supabase URL (server-side)',
  },
  {
    name: 'SUPABASE_ANON_KEY',
    required: true,
    type: 'string',
    description: 'Supabase anon key (server-side)',
  },

  // Authentication
  {
    name: 'JWT_SECRET',
    required: true,
    type: 'string',
    description: 'JWT signing secret',
  },

  // Stripe Payment
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    type: 'string',
    description: 'Stripe secret key',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    type: 'string',
    description: 'Stripe publishable key',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    type: 'string',
    description: 'Stripe webhook signing secret',
  },

  // Discord
  {
    name: 'DISCORD_BOT_TOKEN',
    required: false,
    type: 'string',
    description: 'Discord bot token',
  },
  {
    name: 'DISCORD_WEBHOOK_URL',
    required: false,
    type: 'url',
    description: 'Discord webhook URL',
  },

  // Email
  {
    name: 'RESEND_API_KEY',
    required: true,
    type: 'string',
    description: 'Resend API key for email',
  },
  {
    name: 'FROM_EMAIL',
    required: true,
    type: 'string',
    description: 'Email sender address',
  },

  // YouTube
  {
    name: 'NEXT_PUBLIC_YOUTUBE_API_KEY',
    required: false,
    type: 'string',
    description: 'YouTube Data API key',
  },
  {
    name: 'NEXT_PUBLIC_YOUTUBE_CHANNEL_ID',
    required: false,
    type: 'string',
    description: 'YouTube channel ID',
  },

  // Application
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    type: 'url',
    description: 'Application base URL',
  },
  {
    name: 'NODE_ENV',
    required: true,
    type: 'string',
    description: 'Node environment (development/production)',
  },
]

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate a single environment variable
 */
function validateEnvVar(config: EnvConfig): {
  valid: boolean
  error?: string
  warning?: string
} {
  const value = process.env[config.name]

  // Check if required variable is missing
  if (config.required && !value) {
    return {
      valid: false,
      error: `Missing required environment variable: ${config.name} (${config.description})`,
    }
  }

  // If not required and missing, just return valid
  if (!value) {
    return {
      valid: true,
      warning: `Optional environment variable not set: ${config.name}`,
    }
  }

  // Type validation
  switch (config.type) {
    case 'url':
      try {
        new URL(value)
      } catch {
        return {
          valid: false,
          error: `Invalid URL format for ${config.name}: ${value}`,
        }
      }
      break

    case 'number':
      if (isNaN(Number(value))) {
        return {
          valid: false,
          error: `Invalid number format for ${config.name}: ${value}`,
        }
      }
      break

    case 'boolean':
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        return {
          valid: false,
          error: `Invalid boolean format for ${config.name}: ${value}`,
        }
      }
      break

    case 'string':
      // String validation - check if not empty
      if (value.trim().length === 0) {
        return {
          valid: false,
          error: `Empty string for ${config.name}`,
        }
      }
      break
  }

  return { valid: true }
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const config of ENV_SCHEMA) {
    const result = validateEnvVar(config)

    if (!result.valid && result.error) {
      errors.push(result.error)
    }

    if (result.warning) {
      warnings.push(result.warning)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate environment and throw if invalid
 * Call this at application startup
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironment()

  if (!result.valid) {
    console.error('❌ Environment validation failed!\n')
    console.error('Errors:')
    result.errors.forEach((error) => console.error(`  - ${error}`))

    if (result.warnings.length > 0) {
      console.warn('\nWarnings:')
      result.warnings.forEach((warning) => console.warn(`  - ${warning}`))
    }

    throw new Error('Environment validation failed. Please check your .env.local file.')
  }

  // Log success with warnings if any
  console.log('✅ Environment validation passed')

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`))
  }
}

/**
 * Get environment variable with type safety
 */
export function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name]

  if (!value && required) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value || ''
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(name: string, defaultValue?: number): number {
  const value = process.env[name]

  if (!value) {
    if (defaultValue !== undefined) return defaultValue
    throw new Error(`Missing required environment variable: ${name}`)
  }

  const num = Number(value)
  if (isNaN(num)) {
    throw new Error(`Invalid number format for ${name}: ${value}`)
  }

  return num
}

/**
 * Get environment variable as boolean
 */
export function getEnvBoolean(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name]

  if (!value) return defaultValue

  return ['true', '1', 'yes'].includes(value.toLowerCase())
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Get safe environment info for logging (masks secrets)
 */
export function getSafeEnvInfo(): Record<string, string> {
  const safeInfo: Record<string, string> = {}

  for (const config of ENV_SCHEMA) {
    const value = process.env[config.name]

    if (!value) {
      safeInfo[config.name] = '<not set>'
      continue
    }

    // Mask sensitive values
    if (
      config.name.includes('SECRET') ||
      config.name.includes('KEY') ||
      config.name.includes('TOKEN') ||
      config.name.includes('PASSWORD')
    ) {
      safeInfo[config.name] = '***masked***'
    } else {
      // Show first/last few characters for URLs and IDs
      if (value.length > 20) {
        safeInfo[config.name] = `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
      } else {
        safeInfo[config.name] = value
      }
    }
  }

  return safeInfo
}
