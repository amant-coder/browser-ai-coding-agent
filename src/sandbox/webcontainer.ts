/**
 * WebContainer sandbox — runs Node.js code in the browser.
 *
 * Full WebContainers support requires the @webcontainer/api package and
 * specific cross-origin isolation headers (already set in vite.config.ts).
 * This module provides a lightweight JavaScript executor as a fallback that
 * works without any additional setup, while exposing the same interface so
 * the rest of the codebase can upgrade transparently.
 */
export interface SandboxResult {
  stdout: string
  stderr: string
  exitCode: number
}

class WebContainerSandbox {
  /**
   * Run a snippet of JavaScript and capture console output.
   * Uses Function() so it runs in the main thread — suitable for short
   * scripts that don't require Node.js built-ins.
   */
  async runJS(code: string): Promise<SandboxResult> {
    const logs: string[] = []
    const errors: string[] = []

    const origLog = console.log
    const origError = console.error
    const origWarn = console.warn

    try {
      console.log = (...args: unknown[]) => logs.push(args.map(String).join(' '))
      console.error = (...args: unknown[]) => errors.push(args.map(String).join(' '))
      console.warn = (...args: unknown[]) => logs.push('[warn] ' + args.map(String).join(' '))

      const fn = new Function(code) // safe: code is user-supplied and runs client-side
      const ret = fn()
      if (ret !== undefined) logs.push(String(ret))

      return {
        stdout: logs.join('\n'),
        stderr: errors.join('\n'),
        exitCode: 0,
      }
    } catch (err) {
      return {
        stdout: logs.join('\n'),
        stderr: err instanceof Error ? err.message : String(err),
        exitCode: 1,
      }
    } finally {
      console.log = origLog
      console.error = origError
      console.warn = origWarn
    }
  }
}

export const webContainerSandbox = new WebContainerSandbox()
