import { create } from 'zustand'

export type AgentAction = 'PLAN' | 'ACT' | 'OBSERVE' | 'WEB_SEARCH' | 'DEPLOY'

export interface UsageEvent {
  id: string
  action: AgentAction
  creditsUsed: number
  metadata?: Record<string, unknown>
  createdAt: string
}

interface CreditsState {
  balance: number
  usageHistory: UsageEvent[]
  isLoading: boolean

  // Actions
  fetchBalance: () => Promise<void>
  deductCredits: (action: AgentAction, amount: number) => Promise<boolean>
  fetchUsageHistory: () => Promise<void>
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

export const useCreditsStore = create<CreditsState>()((set, get) => ({
  balance: 0,
  usageHistory: [],
  isLoading: false,

  fetchBalance: async () => {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(`${BACKEND_URL}/api/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      set({ balance: data.balance ?? 0 })
    } catch {
      // silently fail
    }
  },

  deductCredits: async (action, amount) => {
    const token = getToken()
    if (!token) return true // allow action if not authenticated
    const currentBalance = get().balance
    if (currentBalance < amount) return false

    // Optimistic update
    set({ balance: currentBalance - amount })

    try {
      const res = await fetch(`${BACKEND_URL}/api/credits/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, amount }),
      })
      if (!res.ok) {
        // Rollback on failure
        set({ balance: currentBalance })
        return false
      }
      const data = await res.json()
      set({ balance: data.balance ?? currentBalance - amount })
      return true
    } catch {
      set({ balance: currentBalance })
      return false
    }
  },

  fetchUsageHistory: async () => {
    const token = getToken()
    if (!token) return
    set({ isLoading: true })
    try {
      const res = await fetch(`${BACKEND_URL}/api/credits/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      set({ usageHistory: data.events ?? [], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
}))
