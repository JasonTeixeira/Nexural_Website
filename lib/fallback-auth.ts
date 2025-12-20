// Fallback authentication system when database is unavailable
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export interface User {
  id: number
  email: string
  name: string
  role: string
  is_active: boolean
}

// In-memory user store (for fallback only)
const FALLBACK_USERS = [
  {
    id: 1,
    email: 'admin@nexural.io',
    name: 'Admin User',
    role: 'admin',
    is_active: true,
    password_hash: '$2b$12$t2lHW.N074GAL8zW9..Z2uZsDZ3p7bEdh/nwkRbJ0mMOPIusLmXfK' // admin123!
  },
  {
    id: 2,
    email: 'member@test.com',
    name: 'Test Member',
    role: 'member',
    is_active: true,
    password_hash: '$2b$12$4FxLToQ0eei6uha1OpunTeLZCjloZDbGHKvf44NM3DwFQxSxqa492' // member123!
  }
]

export class FallbackAuth {
  private static jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-2024'

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  static async generateToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' })
  }

  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any
      
      // Find user in fallback store
      const user = FALLBACK_USERS.find(u => u.id === decoded.id && u.is_active)
      
      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  static async login(email: string, password: string): Promise<{
    success: boolean
    user?: User
    token?: string
    error?: string
  }> {
    try {
      console.log(`🔐 Fallback auth login attempt for: ${email}`)
      
      // Find user in fallback store
      const userData = FALLBACK_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.is_active
      )

      if (!userData) {
        console.log(`❌ User not found: ${email}`)
        return { success: false, error: 'Invalid credentials' }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, userData.password_hash)

      if (!isValidPassword) {
        console.log(`❌ Invalid password for: ${email}`)
        return { success: false, error: 'Invalid credentials' }
      }

      // Create user object
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        is_active: userData.is_active
      }

      // Generate token
      const token = await this.generateToken(user)

      console.log(`✅ Fallback auth login successful for: ${email}`)
      return { success: true, user, token }

    } catch (error) {
      console.error('Fallback login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  static async logout(userId: number): Promise<void> {
    // In a real system, we'd revoke tokens here
    console.log(`🔓 Fallback auth logout for user: ${userId}`)
  }
}

// Utility functions for compatibility with existing code
export async function isAdminAuthenticated(token?: string): Promise<boolean> {
  if (!token) return false
  const user = await FallbackAuth.verifyToken(token)
  return user !== null
}

export async function getAdminUser(token: string): Promise<User | null> {
  return await FallbackAuth.verifyToken(token)
}

export async function logoutAdmin(token: string): Promise<void> {
  const user = await FallbackAuth.verifyToken(token)
  if (user) {
    await FallbackAuth.logout(user.id)
  }
}
