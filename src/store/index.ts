import { create } from 'zustand'
import type { FileNode, Message, AgentState, EditorTab } from '@/types'

interface AppState {
  // Files
  files: FileNode[]
  activeFileId: string | null
  openTabs: EditorTab[]
  activeTabId: string | null

  // Chat
  messages: Message[]
  isAgentRunning: boolean
  agentState: AgentState

  // Settings
  apiKey: string
  theme: 'light' | 'dark'

  // Actions
  setFiles: (files: FileNode[]) => void
  addFile: (file: FileNode) => void
  updateFile: (id: string, content: string) => void
  deleteFile: (id: string) => void
  setActiveFile: (id: string | null) => void

  openTab: (file: FileNode) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void

  addMessage: (message: Message) => void
  clearMessages: () => void
  setIsAgentRunning: (running: boolean) => void
  setAgentState: (state: AgentState) => void

  setApiKey: (key: string) => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useStore = create<AppState>((set) => ({
  files: [],
  activeFileId: null,
  openTabs: [],
  activeTabId: null,
  messages: [],
  isAgentRunning: false,
  agentState: { status: 'idle', steps: [] },
  apiKey: localStorage.getItem('gemini_api_key') || '',
  theme: 'dark',

  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFile: (id, content) => set((state) => ({
    files: state.files.map((f) => f.id === id ? { ...f, content } : f),
  })),
  deleteFile: (id) => set((state) => ({
    files: state.files.filter((f) => f.id !== id),
  })),
  setActiveFile: (id) => set({ activeFileId: id }),

  openTab: (file) => set((state) => {
    const existing = state.openTabs.find((t) => t.fileId === file.id)
    if (existing) return { activeTabId: existing.id }
    const tab: EditorTab = {
      id: `tab-${file.id}`,
      fileId: file.id,
      name: file.name,
      path: file.path,
      isDirty: false,
      language: file.language || 'plaintext',
    }
    return {
      openTabs: [...state.openTabs, tab],
      activeTabId: tab.id,
      activeFileId: file.id,
    }
  }),
  closeTab: (tabId) => set((state) => {
    const remaining = state.openTabs.filter((t) => t.id !== tabId)
    const newActiveTab = remaining[remaining.length - 1] || null
    return {
      openTabs: remaining,
      activeTabId: newActiveTab?.id || null,
      activeFileId: newActiveTab?.fileId || null,
    }
  }),
  setActiveTab: (tabId) => set((state) => {
    const tab = state.openTabs.find((t) => t.id === tabId)
    return { activeTabId: tabId, activeFileId: tab?.fileId || null }
  }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  clearMessages: () => set({ messages: [] }),
  setIsAgentRunning: (running) => set({ isAgentRunning: running }),
  setAgentState: (agentState) => set({ agentState }),

  setApiKey: (key) => {
    localStorage.setItem('gemini_api_key', key)
    set({ apiKey: key })
  },
  setTheme: (theme) => set({ theme }),
}))
