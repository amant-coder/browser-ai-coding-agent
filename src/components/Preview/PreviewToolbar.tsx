import { ExternalLinkIcon, CopyIcon, RocketIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PreviewToolbarProps {
  previewUrl: string | null
  onOpenNewTab: () => void
  onDeploy: () => void
}

export function PreviewToolbar({ previewUrl, onOpenNewTab, onDeploy }: PreviewToolbarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!previewUrl) return
    navigator.clipboard.writeText(previewUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/30 flex-shrink-0 text-xs">
      {/* URL display */}
      <div className="flex-1 min-w-0 px-2 py-1 rounded bg-background border text-muted-foreground truncate">
        {previewUrl ?? 'Preview URL — run your app to see it here'}
      </div>

      {/* Copy URL */}
      <button
        onClick={handleCopy}
        disabled={!previewUrl}
        title="Copy URL"
        className={cn(
          'h-7 px-2 flex items-center gap-1 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed',
          copied && 'text-green-500'
        )}
      >
        <CopyIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
      </button>

      {/* Open in new tab */}
      <button
        onClick={onOpenNewTab}
        disabled={!previewUrl}
        title="Open in new tab"
        className="h-7 px-2 flex items-center gap-1 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ExternalLinkIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Open</span>
      </button>

      {/* Deploy */}
      <button
        onClick={onDeploy}
        title="Deploy"
        className="h-7 px-2 flex items-center gap-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <RocketIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Deploy</span>
      </button>
    </div>
  )
}
