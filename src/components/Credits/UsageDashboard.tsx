import { useEffect } from 'react'
import { useCredits } from '@/hooks/useCredits'
import { useAuthStore } from '@/store/authStore'
import { CoinsIcon, TrendingUpIcon, ZapIcon } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { AgentAction } from '@/store/creditsStore'

const ACTION_COLORS: Record<AgentAction, string> = {
  PLAN: '#6366f1',
  ACT: '#3b82f6',
  OBSERVE: '#8b5cf6',
  WEB_SEARCH: '#f59e0b',
  DEPLOY: '#10b981',
}

export function UsageDashboard() {
  const { balance, usageHistory, isLoading, fetchBalance, fetchUsageHistory, CREDIT_COSTS } = useCredits()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchBalance()
    fetchUsageHistory()
  }, [fetchBalance, fetchUsageHistory])

  // Aggregate usage by action for chart
  const chartData = Object.entries(CREDIT_COSTS).map(([action, cost]) => {
    const events = usageHistory.filter((e) => e.action === action)
    const totalCredits = events.reduce((s, e) => s + e.creditsUsed, 0)
    return { action, totalCredits, count: events.length, costPer: cost }
  })

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Credits &amp; Usage</h2>
          <p className="text-sm text-muted-foreground">Track your AI agent credits</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          <CoinsIcon className="h-4 w-4" />
          {balance} credits
        </span>
      </div>

      {/* Plan badge */}
      {user && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <ZapIcon className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium">Current Plan: <span className="uppercase">{user.role}</span></p>
            <p className="text-xs text-muted-foreground">
              {user.role === 'FREE' ? '10 agent actions/hour' : user.role === 'PRO' ? '200 agent actions/hour' : 'Unlimited'}
            </p>
          </div>
          {user.role !== 'PRO' && (
            <button className="ml-auto rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              Upgrade to PRO
            </button>
          )}
        </div>
      )}

      {/* Chart */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Credits by Action Type</p>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="action" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v: number) => [`${v} credits`, 'Total used']}
              />
              <Bar dataKey="totalCredits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Credit costs reference */}
      <div>
        <p className="text-sm font-medium mb-2">Credit Costs</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(CREDIT_COSTS).map(([action, cost]) => (
            <div
              key={action}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
            >
              <span style={{ color: ACTION_COLORS[action as AgentAction] }} className="font-medium">
                {action}
              </span>
              <span className="font-semibold">{cost}c</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage History Table */}
      <div>
        <p className="text-sm font-medium mb-2">Recent Activity</p>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : usageHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No usage history yet</p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Action</th>
                  <th className="text-right px-3 py-2 font-medium">Credits</th>
                  <th className="text-right px-3 py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usageHistory.slice(0, 20).map((event) => (
                  <tr key={event.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2" style={{ color: ACTION_COLORS[event.action] }}>
                      {event.action}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">-{event.creditsUsed}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
