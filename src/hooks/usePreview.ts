import { useState, useCallback } from 'react'

interface PreviewState {
  url: string | null
  isLoading: boolean
}

export function usePreview() {
  const [state, setState] = useState<PreviewState>({ url: null, isLoading: false })

  const setPreviewUrl = useCallback((url: string | null) => {
    setState({ url, isLoading: false })
  }, [])

  const openInNewTab = useCallback(() => {
    if (state.url) {
      window.open(state.url, '_blank', 'noopener,noreferrer')
    }
  }, [state.url])

  const copyUrl = useCallback(() => {
    if (state.url) {
      navigator.clipboard.writeText(state.url).catch(() => {})
    }
  }, [state.url])

  return {
    previewUrl: state.url,
    isLoading: state.isLoading,
    setPreviewUrl,
    openInNewTab,
    copyUrl,
  }
}
