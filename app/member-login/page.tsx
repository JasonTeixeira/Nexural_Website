import { redirect } from 'next/navigation'

// Legacy compatibility: old links point to /member-login.
// Canonical route is /auth/login.
export default function MemberLoginRedirect() {
  redirect('/auth/login')
}
