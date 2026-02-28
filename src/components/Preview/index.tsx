import { useEffect, useState } from 'react'
import { RefreshCwIcon, ExternalLinkIcon } from 'lucide-react'
import { useStore } from '@/store'
import type { FileNode } from '@/types'

function buildSrcDoc(files: FileNode[]): string {
  const htmlFile =
    files.find((f) => f.name === 'index.html') ||
    files.find((f) => f.name.endsWith('.html'))
  if (!htmlFile) return ''

  const cssFiles = files.filter((f) => f.name.endsWith('.css'))
  const jsFiles = files.filter((f) => f.name.endsWith('.js'))

  const styleTags = cssFiles
    .map((f) => `<style>${f.content ?? ''}</style>`)
    .join('\n')
  const scriptTags = jsFiles
    .map((f) => `<script>${f.content ?? ''}</script>`)
    .join('\n')

  let html = htmlFile.content ?? ''
  // Inject styles before </head> or at end
  if (styleTags) {
    html = html.includes('</head>')
      ? html.replace('</head>', `${styleTags}\n</head>`)
      : styleTags + '\n' + html
  }
  // Inject scripts before </body> or at end
  if (scriptTags) {
    html = html.includes('</body>')
      ? html.replace('</body>', `${scriptTags}\n</body>`)
      : html + '\n' + scriptTags
  }

  return html
}

export function Preview() {
  const { files } = useStore()
  const [srcDoc, setSrcDoc] = useState('')
  const [key, setKey] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSrcDoc(buildSrcDoc(files))
    }, 500)
    return () => clearTimeout(timer)
  }, [files])

  const handleRefresh = () => setKey((k) => k + 1)

  const handleOpenInNewTab = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted"
            title="Refresh"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleOpenInNewTab}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted"
            title="Open in new tab"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {/* iframe or placeholder */}
      {srcDoc ? (
        <iframe
          key={key}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-same-origin"
          className="flex-1 w-full border-0 bg-white"
          title="Preview"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm text-center p-6">
          <div>
            <div className="text-3xl mb-3">🌐</div>
            <p>No HTML file found.</p>
            <p className="text-xs mt-1 opacity-70">
              Ask the AI to create an <code>index.html</code>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
