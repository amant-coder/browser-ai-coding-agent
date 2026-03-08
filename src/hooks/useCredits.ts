import { useCreditsStore } from '@/store/creditsStore'
import type { AgentAction } from '@/store/creditsStore'

export const CREDIT_COSTS: Record<AgentAction, number> = {
  PLAN: 2,
  ACT: 3,
  OBSERVE: 1,
  WEB_SEARCH: 2,
  DEPLOY: 10,
}

export function useCredits() {
  const store = useCreditsStore()

  const canAfford = (action: AgentAction): boolean => {
    return store.balance >= CREDIT_COSTS[action]
  }

  const spend = async (action: AgentAction): Promise<boolean> => {
    const cost = CREDIT_COSTS[action]
    return store.deductCredits(action, cost)
  }

  return {
    balance: store.balance,
    usageHistory: store.usageHistory,
    isLoading: store.isLoading,
    fetchBalance: store.fetchBalance,
    fetchUsageHistory: store.fetchUsageHistory,
    canAfford,
    spend,
    CREDIT_COSTS,
  }
}
