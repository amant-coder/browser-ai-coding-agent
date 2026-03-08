import { useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { useStore } from '@/store'
import { opfsManager } from '@/filesystem/opfs'
import { useAuthStore } from '@/store/authStore'

function App() {
  const { theme } = useStore()
  const { refreshUser } = useAuthStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    opfsManager.init().catch(console.error)
  }, [])

  useEffect(() => {
    // Attempt to restore session on mount (no-op if no stored token)
    refreshUser().catch(() => {})
  }, [refreshUser])

  return <Layout />
}

export default App
