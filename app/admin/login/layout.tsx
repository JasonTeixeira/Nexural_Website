export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No wrapper - let the login page handle its own styling
  return <>{children}</>
}
