import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LogOutIcon, UserIcon, ChevronDownIcon } from 'lucide-react'

export function UserAvatar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const initials = user.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted text-sm"
        aria-label="User menu"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {initials}
          </span>
        )}
        <span className="hidden sm:block max-w-[100px] truncate">{user.name || user.email}</span>
        <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-md border bg-popover shadow-md text-sm">
            <div className="px-3 py-2 border-b">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-muted font-semibold uppercase tracking-wide">
                {user.role}
              </span>
            </div>
            <div className="px-1 py-1">
              <button
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted text-destructive"
              >
                <LogOutIcon className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function UserAvatarOrLogin() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted"
      >
        <UserIcon className="h-4 w-4" />
        <span className="hidden sm:block">Sign in</span>
      </a>
    )
  }
  return <UserAvatar />
}
