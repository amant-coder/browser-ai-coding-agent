import { useState } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { CodeIcon, SunIcon, MoonIcon } from 'lucide-react'
import { FileTree } from '@/components/FileTree'
import { CodeEditor } from '@/components/Editor'
import { Terminal } from '@/components/Terminal'
import { ChatPanel } from '@/components/Chat'
import { Preview } from '@/components/Preview'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { UserAvatarOrLogin } from '@/components/Auth/UserAvatar'
import { CreditBadge } from '@/components/Credits/CreditBadge'

const STATUS_LABEL: Record<string, string> = {
  idle: 'Ready',
  thinking: 'Thinking…',
  acting: 'Acting…',
  observing: 'Observing…',
  done: 'Done',
  error: 'Error',
}

const STATUS_DOT: Record<string, string> = {
  idle: 'bg-green-400',
  thinking: 'bg-yellow-400 animate-pulse',
  acting: 'bg-blue-400 animate-pulse',
  observing: 'bg-purple-400 animate-pulse',
  done: 'bg-green-400',
  error: 'bg-red-400',
}

export function Layout() {
  const { agentState, theme, setTheme } = useStore()
  const status = agentState.status
  const [bottomTab, setBottomTab] = useState<'terminal' | 'preview'>('terminal')

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
            <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[status] ?? 'bg-green-400')}></span>
            {STATUS_LABEL[status] ?? 'Ready'}
          </span>
          <CreditBadge />
          <UserAvatarOrLogin />
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted"
            title="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
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
                <div className="h-full flex flex-col">
                  {/* Tab bar */}
                  <div className="flex items-center border-b bg-muted/30 flex-shrink-0">
                    <button
                      onClick={() => setBottomTab('terminal')}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium border-r',
                        bottomTab === 'terminal' ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      Terminal
                    </button>
                    <button
                      onClick={() => setBottomTab('preview')}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium',
                        bottomTab === 'preview' ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      Preview
                    </button>
                  </div>
                  {/* Panel content */}
                  <div className="flex-1 overflow-hidden">
                    {bottomTab === 'terminal' ? <Terminal /> : <Preview />}
                  </div>
                </div>
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
