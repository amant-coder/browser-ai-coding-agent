export interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  content?: string
  children?: FileNode[]
  language?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'text' | 'code' | 'error'
}

export interface AgentStep {
  id: string
  type: 'plan' | 'action' | 'observation'
  content: string
  tool?: string
  result?: string
  timestamp: Date
}

export interface AgentState {
  status: 'idle' | 'thinking' | 'acting' | 'observing' | 'done' | 'error'
  currentStep?: string
  steps: AgentStep[]
}

export interface TerminalOutput {
  type: 'stdout' | 'stderr' | 'stdin'
  content: string
  timestamp: Date
}

export interface EditorTab {
  id: string
  fileId: string
  name: string
  path: string
  isDirty: boolean
  language: string
}
