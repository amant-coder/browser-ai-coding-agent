import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { XIcon, KeyIcon, ExternalLinkIcon } from 'lucide-react'
import { useStore } from '@/store'

interface Props {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: Props) {
  const { apiKey, setApiKey } = useStore()
  const [keyValue, setKeyValue] = useState(apiKey)

  const handleSave = () => {
    setApiKey(keyValue.trim())
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-xl border shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold">Settings</Dialog.Title>
            <Dialog.Close asChild>
              <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted">
                <XIcon className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <KeyIcon className="h-4 w-4" />
                Gemini API Key
              </label>
              <input
                type="password"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="AIza..."
                className="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Get your free key at{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Google AI Studio <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <strong>🔒 Privacy:</strong> Your API key is stored only in your browser&apos;s localStorage and never sent anywhere except directly to Google&apos;s API.
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
