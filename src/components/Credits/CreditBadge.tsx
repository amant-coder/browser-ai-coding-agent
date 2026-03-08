import { CoinsIcon } from 'lucide-react'
import { useCreditsStore } from '@/store/creditsStore'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function CreditBadge() {
  const { balance, fetchBalance } = useCreditsStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance()
    }
  }, [isAuthenticated, fetchBalance])

  if (!isAuthenticated) return null

  return (
    <div
      title={`${balance} credits remaining`}
      className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs font-medium"
    >
      <CoinsIcon className="h-3.5 w-3.5 text-yellow-500" />
      <span>{balance}</span>
    </div>
  )
}
