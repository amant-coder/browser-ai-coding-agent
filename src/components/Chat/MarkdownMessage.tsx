import ReactMarkdown from 'react-markdown'
import type { ExtraProps } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { ComponentPropsWithoutRef } from 'react'

interface Props {
  content: string
  isUser: boolean
}

type CodeProps = ComponentPropsWithoutRef<'code'> & ExtraProps

export function MarkdownMessage({ content, isUser }: Props) {
  if (isUser) {
    return <div className="whitespace-pre-wrap break-words">{content}</div>
  }

  return (
    <div className="prose prose-sm prose-invert max-w-none break-words">
      <ReactMarkdown
        components={{
        code({ className, children, ...props }: CodeProps) {
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="rounded-md text-xs my-2"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-muted/50 rounded px-1 py-0.5 text-xs font-mono" {...props}>
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
        },
        li({ children }) {
          return <li className="text-sm">{children}</li>
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>
        },
        h1({ children }) {
          return <h1 className="text-base font-bold mb-2">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-sm font-bold mb-2">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-sm font-semibold mb-1">{children}</h3>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-primary/50 pl-3 italic opacity-80">
              {children}
            </blockquote>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
