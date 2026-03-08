import { geminiClient } from './gemini'
import { agentTools } from './tools'
import { useStore } from '@/store'
import type { AgentStep } from '@/types'
import { useCreditsStore } from '@/store/creditsStore'

// Credit costs — kept in sync with backend CreditCosts.java
const PLAN_COST     = 2
const ACT_COST      = 3
const OBSERVE_COST  = 1
const WEB_SEARCH_COST = 2

const SYSTEM_PROMPT = `You are an expert AI coding assistant. You help users write, debug, and understand code.

You have access to these tools:
- write_file(path, content): Create or update a file
- read_file(path): Read a file's contents
- list_files(): List all files in the project
- run_python(code): Execute Python code
- run_javascript(code): Execute JavaScript code
- install_package(name, manager): Install a Python (pip) package. manager defaults to "pip".
- search_web(query): Search the web for documentation or answers using DuckDuckGo.

When using tools, respond with JSON in this exact format:
{"tool": "tool_name", "args": {"arg1": "value1", "arg2": "value2"}}

When you are done and want to respond to the user, respond with:
{"done": true, "response": "Your final message to the user"}

Think step by step. Plan first, then act.`

function parseToolCall(text: string): { tool?: string; args?: Record<string, string>; done?: boolean; response?: string } | null {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

export async function runAgentLoop(userMessage: string, maxSteps = 10): Promise<string> {
  const store = useStore.getState()

  if (!geminiClient.isInitialized()) {
    // With the Spring Boot backend the API key is managed server-side.
    // We pass an empty string here to mark the client as ready; the actual
    // key is never sent to the browser.
    geminiClient.init(store.apiKey || '')
  }

  store.setIsAgentRunning(true)
  store.setAgentState({ status: 'thinking', steps: [] })

  const steps: AgentStep[] = []
  const conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  try {
    for (let i = 0; i < maxSteps; i++) {
      store.setAgentState({ status: 'thinking', steps })

      // Deduct PLAN credit for each thinking step (non-blocking — only if authenticated)
      await useCreditsStore.getState().deductCredits('PLAN', PLAN_COST)

      const response = await geminiClient.chat(conversationHistory, SYSTEM_PROMPT)

      conversationHistory.push({ role: 'model', parts: [{ text: response }] })

      const parsed = parseToolCall(response)

      if (!parsed) {
        const step: AgentStep = {
          id: `step-${Date.now()}`,
          type: 'plan',
          content: response,
          timestamp: new Date(),
        }
        steps.push(step)
        store.setAgentState({ status: 'done', steps })
        return response
      }

      if (parsed.done) {
        store.setAgentState({ status: 'done', steps })
        return parsed.response || 'Done!'
      }

      if (parsed.tool) {
        const actionStep: AgentStep = {
          id: `step-${Date.now()}`,
          type: 'action',
          content: `Using tool: ${parsed.tool}`,
          tool: parsed.tool,
          timestamp: new Date(),
        }
        steps.push(actionStep)
        store.setAgentState({ status: 'acting', steps })

        // Deduct ACT credit
        await useCreditsStore.getState().deductCredits('ACT', ACT_COST)

        let result
        const args = parsed.args || {}

        if (parsed.tool === 'write_file') {
          result = await agentTools.write_file(args.path, args.content)
        } else if (parsed.tool === 'read_file') {
          result = await agentTools.read_file(args.path)
        } else if (parsed.tool === 'list_files') {
          result = await agentTools.list_files()
        } else if (parsed.tool === 'run_python') {
          result = await agentTools.run_python(args.code)
        } else if (parsed.tool === 'run_javascript') {
          result = await agentTools.run_javascript(args.code)
        } else if (parsed.tool === 'install_package') {
          result = await agentTools.install_package(args.name, args.manager as 'pip' | 'npm')
        } else if (parsed.tool === 'search_web') {
          result = await agentTools.search_web(args.query)
          // Deduct WEB_SEARCH credit
          await useCreditsStore.getState().deductCredits('WEB_SEARCH', WEB_SEARCH_COST)
        } else {
          result = { success: false, output: '', error: `Unknown tool: ${parsed.tool}` }
        }

        const observationStep: AgentStep = {
          id: `step-${Date.now()}-obs`,
          type: 'observation',
          content: result.success ? result.output : `Error: ${result.error}`,
          result: result.output,
          timestamp: new Date(),
        }
        steps.push(observationStep)

        // Deduct OBSERVE credit
        await useCreditsStore.getState().deductCredits('OBSERVE', OBSERVE_COST)

        conversationHistory.push({
          role: 'user',
          parts: [{ text: `Tool result: ${JSON.stringify(result)}` }],
        })
      }
    }

    return 'Agent reached maximum steps. Task may be incomplete.'
  } finally {
    store.setIsAgentRunning(false)
  }
}
