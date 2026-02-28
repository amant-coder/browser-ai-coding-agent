import { opfsManager } from '@/filesystem/opfs'
import { pyodideSandbox } from '@/sandbox/pyodide'
import { useStore } from '@/store'

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

export const agentTools = {
  async write_file(path: string, content: string): Promise<ToolResult> {
    try {
      await opfsManager.writeFile(path, content)
      const store = useStore.getState()
      const ext = path.split('.').pop() || 'txt'
      const languageMap: Record<string, string> = {
        ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
        py: 'python', html: 'html', css: 'css', json: 'json', md: 'markdown',
        txt: 'plaintext', sh: 'shell', yaml: 'yaml', yml: 'yaml',
      }
      const existingFile = store.files.find((f) => f.path === path)
      if (existingFile) {
        store.updateFile(existingFile.id, content)
      } else {
        store.addFile({
          id: `file-${Date.now()}`,
          name: path.split('/').pop() || path,
          path,
          type: 'file',
          content,
          language: languageMap[ext] || 'plaintext',
        })
      }
      return { success: true, output: `File written: ${path}` }
    } catch (err) {
      return { success: false, output: '', error: err instanceof Error ? err.message : String(err) }
    }
  },

  async read_file(path: string): Promise<ToolResult> {
    try {
      const store = useStore.getState()
      const file = store.files.find((f) => f.path === path)
      if (file?.content !== undefined) {
        return { success: true, output: file.content }
      }
      const content = await opfsManager.readFile(path)
      return { success: true, output: content }
    } catch (err) {
      return { success: false, output: '', error: err instanceof Error ? err.message : String(err) }
    }
  },

  async list_files(): Promise<ToolResult> {
    try {
      const store = useStore.getState()
      const files = store.files.map((f) => f.path).join('\n')
      return { success: true, output: files || '(no files)' }
    } catch (err) {
      return { success: false, output: '', error: err instanceof Error ? err.message : String(err) }
    }
  },

  async run_python(code: string): Promise<ToolResult> {
    try {
      const result = await pyodideSandbox.run(code)
      const output = [result.stdout, result.stderr].filter(Boolean).join('\n')
      return {
        success: !result.stderr,
        output: output || '(no output)',
        error: result.stderr || undefined,
      }
    } catch (err) {
      return { success: false, output: '', error: err instanceof Error ? err.message : String(err) }
    }
  },

  async run_javascript(code: string): Promise<ToolResult> {
    try {
      const logs: string[] = []
      const originalLog = console.log
      const originalError = console.error

      console.log = (...args) => logs.push(args.map(String).join(' '))
      console.error = (...args) => logs.push('[ERROR] ' + args.map(String).join(' '))

      try {
        const fn = new Function(code)
        const result = fn()
        if (result !== undefined) logs.push(String(result))
      } finally {
        console.log = originalLog
        console.error = originalError
      }

      return { success: true, output: logs.join('\n') || '(no output)' }
    } catch (err) {
      return { success: false, output: '', error: err instanceof Error ? err.message : String(err) }
    }
  },

  async install_package(name: string, manager: 'pip' | 'npm' = 'pip'): Promise<ToolResult> {
    try {
      if (manager === 'pip') {
        await pyodideSandbox.installPackage(name)
        return { success: true, output: `Installed Python package: ${name}` }
      } else {
        return {
          success: false,
          output: '',
          error: 'npm install is not supported in browser-only mode. Use pip packages instead.',
        }
      }
    } catch (err) {
      return { success: false, output: '', error: err instanceof Error ? err.message : String(err) }
    }
  },

  async search_web(query: string): Promise<ToolResult> {
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      const res = await fetch(url)
      const data = await res.json()
      const answer =
        data.AbstractText ||
        (data.RelatedTopics?.[0]?.Text) ||
        'No results found.'
      return { success: true, output: answer }
    } catch (err) {
      return { success: false, output: '', error: `Web search failed: ${err instanceof Error ? err.message : String(err)}` }
    }
  },
}
