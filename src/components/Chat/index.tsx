import { useState, useRef, useEffect } from 'react'
import { SendIcon, BotIcon, UserIcon, AlertCircleIcon, Loader2Icon, SettingsIcon } from 'lucide-react'
import { useStore } from '@/store'
import { useAgent } from '@/hooks/useAgent'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'
import { SettingsDialog } from './SettingsDialog'

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const isError = message.type === 'error'

  return (
    <div className={cn('flex gap-3 p-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-primary text-primary-foreground' : isError ? 'bg-destructive text-destructive-foreground' : 'bg-muted'
      )}>
        {isUser ? <UserIcon className="h-4 w-4" /> : isError ? <AlertCircleIcon className="h-4 w-4" /> : <BotIcon className="h-4 w-4" />}
      </div>
      <div className={cn(
        'flex-1 max-w-[80%] rounded-lg px-4 py-2 text-sm',
        isUser ? 'bg-primary text-primary-foreground ml-auto' : isError ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-muted'
      )}>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className={cn('text-xs mt-1 opacity-60', isUser ? 'text-right' : 'text-left')}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export function ChatPanel() {
  const [input, setInput] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages } = useStore()
  const { sendMessage, isAgentRunning, hasApiKey } = useAgent()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitMessage()
  }

  const submitMessage = async () => {
    if (!input.trim() || isAgentRunning) return
    const msg = input.trim()
    setInput('')
    await sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitMessage()
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <BotIcon className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {!hasApiKey && (
            <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">No API Key</span>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted"
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <BotIcon className="h-12 w-12 mb-4 opacity-40" />
            <h3 className="font-semibold mb-2">AI Coding Assistant</h3>
            <p className="text-xs text-center opacity-70">
              Ask me to write code, debug issues, create files, or explain concepts.
            </p>
            {!hasApiKey && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="mt-4 text-xs text-primary hover:underline"
              >
                Set up your Gemini API key →
              </button>
            )}
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isAgentRunning && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasApiKey ? 'Ask the AI to write code...' : 'Set API key first...'}
            disabled={isAgentRunning}
            rows={1}
            className="flex-1 resize-none rounded-lg border bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 min-h-[40px] max-h-32"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 128) + 'px'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isAgentRunning}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isAgentRunning ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by Google Gemini Pro • Press Enter to send
        </p>
      </div>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
