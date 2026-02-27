import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { CodeIcon } from 'lucide-react'
import { FileTree } from '@/components/FileTree'
import { CodeEditor } from '@/components/Editor'
import { Terminal } from '@/components/Terminal'
import { ChatPanel } from '@/components/Chat'

export function Layout() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <CodeIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">Browser AI Coding Agent</h1>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">Free • No backend • Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
            Ready
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          <Panel defaultSize={18} minSize={12} maxSize={30}>
            <div className="h-full border-r">
              <FileTree />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

          {/* Center: Editor + Terminal */}
          <Panel defaultSize={55} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={65} minSize={30}>
                <CodeEditor />
              </Panel>
              <PanelResizeHandle className="h-1 bg-border hover:bg-primary/30 transition-colors cursor-row-resize" />
              <Panel defaultSize={35} minSize={20}>
                <Terminal />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

          {/* Right: Chat */}
          <Panel defaultSize={27} minSize={20} maxSize={45}>
            <div className="h-full border-l">
              <ChatPanel />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
