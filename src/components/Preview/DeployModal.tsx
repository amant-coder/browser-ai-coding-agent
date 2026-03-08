import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { RocketIcon, XIcon, CheckIcon, Loader2Icon, ExternalLinkIcon } from 'lucide-react'
import { useDeploy, type DeployProvider } from '@/hooks/useDeploy'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

interface DeployModalProps {
  open: boolean
  onClose: () => void
}

export function DeployModal({ open, onClose }: DeployModalProps) {
  const { files } = useStore()
  const [provider, setProvider] = useState<DeployProvider>('vercel')
  const [projectName, setProjectName] = useState('my-project')
  const { deployStatus, publicUrl, deployError, deploy, reset } = useDeploy()

  const handleDeploy = async () => {
    // Convert file tree to flat map of path → content
    const fileMap: Record<string, string> = {}
    const flatten = (nodes: typeof files) => {
      for (const node of nodes) {
        if (node.type === 'file' && node.content) {
          fileMap[node.path] = node.content
        } else if (node.children) {
          flatten(node.children)
        }
      }
    }
    flatten(files)
    await deploy(provider, projectName, fileMap)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-xl focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold flex items-center gap-2">
              <RocketIcon className="h-4 w-4" />
              Deploy Project
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded p-1 hover:bg-muted" onClick={handleClose}>
                <XIcon className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {deployStatus === 'idle' && (
            <div className="space-y-4">
              {/* Provider selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Deploy to</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['vercel', 'github-pages'] as DeployProvider[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProvider(p)}
                      className={cn(
                        'rounded-md border px-3 py-2.5 text-sm font-medium text-left',
                        provider === p ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                      )}
                    >
                      {p === 'vercel' ? '▲ Vercel' : '🐙 GitHub Pages'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {provider === 'vercel' ? 'Project name' : 'Repository name'}
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <button
                onClick={handleDeploy}
                disabled={!projectName.trim()}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deploy
              </button>
            </div>
          )}

          {deployStatus === 'deploying' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Deploying to {provider}…</p>
              <p className="text-xs text-muted-foreground">This may take a minute</p>
            </div>
          )}

          {deployStatus === 'success' && publicUrl && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-medium">Deployed successfully!</p>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                >
                  {publicUrl}
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </div>
              <button
                onClick={handleClose}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          )}

          {deployStatus === 'error' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 w-full text-center">
                {deployError}
              </p>
              <button
                onClick={reset}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Try again
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
