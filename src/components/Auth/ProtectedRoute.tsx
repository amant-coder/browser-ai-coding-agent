import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage } from './LoginPage'

interface ProtectedRouteProps {
  children: ReactNode
  /** If true, non-authenticated users see the LoginPage. Default: false (guest access allowed). */
  requireAuth?: boolean
}

export function ProtectedRoute({ children, requireAuth = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <LoginPage />
  }

  return <>{children}</>
}
