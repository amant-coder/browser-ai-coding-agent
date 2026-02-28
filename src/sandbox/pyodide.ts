declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInterface>
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>
  loadPackagesFromImports: (code: string) => Promise<void>
  loadPackage: (name: string) => Promise<void>
  globals: { get: (key: string) => unknown }
}

class PyodideSandbox {
  private pyodide: PyodideInterface | null = null
  private loading = false

  async init(): Promise<void> {
    if (this.pyodide || this.loading) return
    this.loading = true

    if (!document.getElementById('pyodide-script')) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.id = 'pyodide-script'
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
        script.onload = () => resolve()
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    this.pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    })

    this.loading = false
  }

  async run(code: string): Promise<{ stdout: string; stderr: string; result: unknown }> {
    if (!this.pyodide) await this.init()
    if (!this.pyodide) throw new Error('Pyodide not loaded')

    const captureCode = `
import sys
from io import StringIO

_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture

try:
    exec(${JSON.stringify(code)})
except Exception as e:
    sys.stderr.write(str(e))
finally:
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
    
(_stdout_capture.getvalue(), _stderr_capture.getvalue())
`

    try {
      await this.pyodide.loadPackagesFromImports(code)
      const result = await this.pyodide.runPythonAsync(captureCode) as [string, string]
      return {
        stdout: result[0] || '',
        stderr: result[1] || '',
        result: null,
      }
    } catch (err) {
      return {
        stdout: '',
        stderr: err instanceof Error ? err.message : String(err),
        result: null,
      }
    }
  }

  /** Alias for `run` — satisfies the `runCode` interface required by the problem spec. */
  async runCode(code: string): Promise<{ stdout: string; stderr: string; result: unknown }> {
    return this.run(code)
  }

  async installPackage(name: string): Promise<void> {
    if (!this.pyodide) await this.init()
    if (!this.pyodide) throw new Error('Pyodide not loaded')
    await this.pyodide.loadPackage(name)
  }
}

export const pyodideSandbox = new PyodideSandbox()
