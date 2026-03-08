import { useState, useCallback } from 'react'

export type DeployProvider = 'vercel' | 'github-pages'
export type DeployStatus = 'idle' | 'deploying' | 'success' | 'error'

interface DeployState {
  status: DeployStatus
  deploymentId: string | null
  publicUrl: string | null
  error: string | null
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

export function useDeploy() {
  const [state, setState] = useState<DeployState>({
    status: 'idle',
    deploymentId: null,
    publicUrl: null,
    error: null,
  })

  const deploy = useCallback(
    async (
      provider: DeployProvider,
      projectName: string,
      files: Record<string, string>
    ) => {
      setState({ status: 'deploying', deploymentId: null, publicUrl: null, error: null })
      const token = getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      try {
        const endpoint =
          provider === 'vercel' ? '/api/deploy/vercel' : '/api/deploy/github-pages'
        const body =
          provider === 'vercel'
            ? { projectName, files }
            : { repoName: projectName, files }

        const res = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'Deployment failed')
        }

        const data = await res.json()
        const deploymentId = data.deploymentId ?? data.deploymentUrl ?? null
        const publicUrl = data.deploymentUrl ?? data.pageUrl ?? null

        // Poll for status if we have an id
        if (deploymentId && !publicUrl) {
          await pollStatus(deploymentId, headers)
        } else {
          setState({ status: 'success', deploymentId, publicUrl, error: null })
        }
      } catch (err) {
        setState({
          status: 'error',
          deploymentId: null,
          publicUrl: null,
          error: err instanceof Error ? err.message : 'Deployment failed',
        })
      }
    },
    []
  )

  const pollStatus = async (deploymentId: string, headers: Record<string, string>) => {
    const maxPolls = 30
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((r) => setTimeout(r, 3000))
      try {
        const res = await fetch(`${BACKEND_URL}/api/deploy/status/${deploymentId}`, { headers })
        if (!res.ok) continue
        const data = await res.json()
        if (data.status === 'READY' || data.status === 'SUCCESS') {
          setState({
            status: 'success',
            deploymentId,
            publicUrl: data.publicUrl ?? data.deploymentUrl,
            error: null,
          })
          return
        }
        if (data.status === 'ERROR' || data.status === 'FAILED') {
          setState({ status: 'error', deploymentId, publicUrl: null, error: data.error ?? 'Deployment failed' })
          return
        }
      } catch {
        // continue polling
      }
    }
    setState({ status: 'error', deploymentId, publicUrl: null, error: 'Deployment timed out' })
  }

  const reset = useCallback(() => {
    setState({ status: 'idle', deploymentId: null, publicUrl: null, error: null })
  }, [])

  return {
    deployStatus: state.status,
    deploymentId: state.deploymentId,
    publicUrl: state.publicUrl,
    deployError: state.error,
    deploy,
    reset,
  }
}
