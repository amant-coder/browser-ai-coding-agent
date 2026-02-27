import Editor from '@monaco-editor/react'
import { useStore } from '@/store'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CodeEditor() {
  const { files, openTabs, activeTabId, activeFileId, setActiveTab, closeTab, updateFile } = useStore()

  const activeFile = files.find((f) => f.id === activeFileId)

  const handleChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFile(activeFileId, value)
    }
  }

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
    </div>
  )
}
