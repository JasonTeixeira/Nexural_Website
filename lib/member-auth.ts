import jwt from "jsonwebtoken"

export interface Member {
  id: string
  email: string
  name: string
  subscriptionId?: string
  subscriptionStatus: 'active' | 'inactive' | 'canceled' | 'past_due'
  discordAccess: boolean
  joinedAt: string
}

export function verifyMemberToken(token: string): Member | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (decoded.type === "member") {
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        subscriptionId: decoded.subscriptionId,
        subscriptionStatus: decoded.subscriptionStatus,
        discordAccess: decoded.discordAccess,
        joinedAt: decoded.joinedAt
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

export function generateMemberToken(member: Member): string {
  return jwt.sign(
    {
      id: member.id,
      email: member.email,
      name: member.name,
      subscriptionId: member.subscriptionId,
      subscriptionStatus: member.subscriptionStatus,
      discordAccess: member.discordAccess,
      joinedAt: member.joinedAt,
      type: "member",
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    },
    process.env.JWT_SECRET!
  )
}

// Client-side auth check
export function isMemberAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  
  const token = localStorage.getItem("member_token")
  if (!token) return false
  
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("member_token")
      localStorage.removeItem("member_user")
      return false
    }
    
    return decoded.type === "member"
  } catch {
    return false
  }
}

export function getMember(): Member | null {
  if (typeof window === "undefined") return null
  
  const userStr = localStorage.getItem("member_user")
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function logoutMember(): void {
  if (typeof window === "undefined") return
  
  localStorage.removeItem("member_token")
  localStorage.removeItem("member_user")
}

// Check if member has active subscription
export function hasActiveSubscription(member: Member | null): boolean {
  if (!member) return false
  return member.subscriptionStatus === 'active' && member.discordAccess
}

// Check if member needs to update payment
export function needsPaymentUpdate(member: Member | null): boolean {
  if (!member) return false
  return member.subscriptionStatus === 'past_due'
}
