import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { useStore } from '@/store'
import { X, PlayIcon, Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pyodideSandbox } from '@/sandbox/pyodide'
import { webContainerSandbox } from '@/sandbox/webcontainer'

export function CodeEditor() {
  const { files, openTabs, activeTabId, activeFileId, setActiveTab, closeTab, updateFile } = useStore()
  const [isRunning, setIsRunning] = useState(false)
  const [runOutput, setRunOutput] = useState<{ out: string; err: string } | null>(null)

  const activeFile = files.find((f) => f.id === activeFileId)

  const handleChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFile(activeFileId, value)
    }
  }

  const handleRun = async () => {
    if (!activeFile?.content || isRunning) return
    setIsRunning(true)
    setRunOutput(null)
    try {
      if (activeFile.language === 'python') {
        const result = await pyodideSandbox.run(activeFile.content)
        setRunOutput({ out: result.stdout, err: result.stderr })
      } else if (activeFile.language === 'javascript' || activeFile.language === 'typescript') {
        const result = await webContainerSandbox.runJS(activeFile.content)
        setRunOutput({ out: result.stdout, err: result.stderr })
      } else {
        setRunOutput({ out: '', err: `Cannot run language: ${activeFile.language || 'unknown'}` })
      }
    } catch (err) {
      setRunOutput({ out: '', err: err instanceof Error ? err.message : String(err) })
    } finally {
      setIsRunning(false)
    }
  }

  const canRun = activeFile &&
    ['python', 'javascript', 'typescript'].includes(activeFile.language || '')

  if (openTabs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">💻</div>
          <p className="text-sm">Open a file from the explorer</p>
          <p className="text-xs mt-1 opacity-60">or ask the AI to create one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tabs */}
      <div className="flex items-center border-b overflow-x-auto bg-muted/30">
        {openTabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r min-w-0 group flex-shrink-0',
              activeTabId === tab.id
                ? 'bg-background text-foreground border-b-2 border-b-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <span className="truncate max-w-32">{tab.name}</span>
            {tab.isDirty && <span className="text-orange-400">●</span>}
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
              className="hidden group-hover:flex items-center justify-center rounded hover:bg-destructive/20 hover:text-destructive ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {/* Run button */}
        {canRun && (
          <button
            onClick={handleRun}
            disabled={isRunning}
            title={`Run ${activeFile?.name}`}
            className="ml-auto mr-2 flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 flex-shrink-0"
          >
            {isRunning ? (
              <Loader2Icon className="h-3 w-3 animate-spin" />
            ) : (
              <PlayIcon className="h-3 w-3" />
            )}
            Run
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={activeFile?.language || 'plaintext'}
          value={activeFile?.content || ''}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* Run output panel */}
      {runOutput && (
        <div className="border-t bg-[#1e1e2e] text-sm font-mono max-h-40 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-1 border-b border-white/10">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Output</span>
            <button
              onClick={() => setRunOutput(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="p-3 space-y-1">
            {runOutput.out && (
              <pre className="text-green-400 whitespace-pre-wrap break-words">{runOutput.out}</pre>
            )}
            {runOutput.err && (
              <pre className="text-red-400 whitespace-pre-wrap break-words">{runOutput.err}</pre>
            )}
            {!runOutput.out && !runOutput.err && (
              <span className="text-muted-foreground">(no output)</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
