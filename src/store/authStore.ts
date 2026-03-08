import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'FREE' | 'PRO' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: UserRole
  creditBalance: number
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  setToken: (token: string | null) => void
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || 'Login failed')
          }
          const data = await res.json()
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || 'Registration failed')
          }
          const data = await res.json()
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: () => {
        const token = get().token
        if (token) {
          fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {})
        }
        set({ user: null, isAuthenticated: false, token: null })
      },

      refreshUser: async () => {
        const token = get().token
        if (!token) return
        set({ isLoading: true })
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) {
            set({ user: null, isAuthenticated: false, token: null, isLoading: false })
            return
          }
          const user = await res.json()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
