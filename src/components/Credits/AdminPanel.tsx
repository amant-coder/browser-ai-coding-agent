import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { ShieldIcon, CoinsIcon, PlusIcon } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  creditBalance: number
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

export function AdminPanel() {
  const { user, token } = useAuthStore()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [grantAmount, setGrantAmount] = useState<Record<string, number>>({})

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <ShieldIcon className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="font-medium">Access Denied</p>
          <p className="text-sm text-muted-foreground">Admin role required</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${BACKEND_URL}/api/credits/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data.users ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [token])

  const handleGrant = async (userId: string) => {
    const amount = grantAmount[userId] || 100
    try {
      await fetch(`${BACKEND_URL}/api/credits/admin/grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, amount }),
      })
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, creditBalance: u.creditBalance + amount } : u))
      )
    } catch {
      // silently fail
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">User</th>
                <th className="text-center px-4 py-2.5 font-medium">Role</th>
                <th className="text-right px-4 py-2.5 font-medium">Balance</th>
                <th className="text-right px-4 py-2.5 font-medium">Grant</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted font-semibold uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <CoinsIcon className="h-3.5 w-3.5 text-yellow-500" />
                      {u.creditBalance}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={grantAmount[u.id] ?? 100}
                        onChange={(e) =>
                          setGrantAmount((prev) => ({ ...prev, [u.id]: Number(e.target.value) }))
                        }
                        className="w-16 rounded border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <button
                        onClick={() => handleGrant(u.id)}
                        className="h-7 px-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 text-xs"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                        Grant
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
