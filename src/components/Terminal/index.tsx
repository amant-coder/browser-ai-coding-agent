import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { pyodideSandbox } from '@/sandbox/pyodide'

const WELCOME_MESSAGE = '\r\n\x1b[1;32mBrowser AI Coding Agent Terminal\x1b[0m\r\n\x1b[90mType Python code and press Enter to run. Type "clear" to clear.\x1b[0m\r\n\r\n$ '

export function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<XTerm | null>(null)
  const inputRef = useRef<string>('')

  useEffect(() => {
    if (!containerRef.current) return

    const term = new XTerm({
      theme: {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#f5c2e7',
        cyan: '#94e2d5',
        white: '#bac2de',
        brightBlack: '#585b70',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#f5c2e7',
        brightCyan: '#94e2d5',
        brightWhite: '#a6adc8',
      },
      fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
      fontSize: 13,
      cursorBlink: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()
    termRef.current = term

    term.write(WELCOME_MESSAGE)

    term.onKey(({ key, domEvent }) => {
      const code = domEvent.keyCode
      if (code === 13) {
        // Enter
        const command = inputRef.current.trim()
        inputRef.current = ''
        term.write('\r\n')

        if (command === 'clear') {
          term.clear()
          term.write('$ ')
          return
        }

        if (command) {
          pyodideSandbox.run(command).then((result) => {
            if (result.stdout) term.write('\x1b[32m' + result.stdout.replace(/\n/g, '\r\n') + '\x1b[0m')
            if (result.stderr) term.write('\x1b[31m' + result.stderr.replace(/\n/g, '\r\n') + '\x1b[0m')
            term.write('\r\n$ ')
          }).catch((err) => {
            term.write('\x1b[31m' + String(err) + '\x1b[0m\r\n$ ')
          })
        } else {
          term.write('$ ')
        }
      } else if (code === 8) {
        // Backspace
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1)
          term.write('\b \b')
        }
      } else {
        inputRef.current += key
        term.write(key)
      }
    })

    const observer = new ResizeObserver(() => fitAddon.fit())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      term.dispose()
    }
  }, [])

  return (
    <div className="h-full bg-[#1e1e2e] flex flex-col">
      <div className="flex items-center px-3 py-1.5 border-b bg-muted/30">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terminal</span>
      </div>
      <div ref={containerRef} className="flex-1 p-1 overflow-hidden" />
    </div>
  )
}
