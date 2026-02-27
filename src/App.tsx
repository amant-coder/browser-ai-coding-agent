import { useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { useStore } from '@/store'
import { opfsManager } from '@/filesystem/opfs'

function App() {
  const { theme } = useStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    opfsManager.init().catch(console.error)
  }, [])

  return <Layout />
}

export default App
