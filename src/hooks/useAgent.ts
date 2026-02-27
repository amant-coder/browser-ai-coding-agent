import { useCallback } from 'react'
import { useStore } from '@/store'
import { runAgentLoop } from '@/agent/loop'
import type { Message } from '@/types'

export function useAgent() {
  const { addMessage, isAgentRunning, apiKey } = useStore()

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text',
    }
    addMessage(userMessage)

    try {
      const response = await runAgentLoop(content)
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'text',
      }
      addMessage(assistantMessage)
    } catch (err) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: err instanceof Error ? err.message : 'An error occurred',
        timestamp: new Date(),
        type: 'error',
      }
      addMessage(errorMessage)
    }
  }, [addMessage])

  return { sendMessage, isAgentRunning, hasApiKey: Boolean(apiKey) }
}
