'use client'

import clsx from 'clsx'
import Markdown from 'react-markdown'

interface MarkdownTextProps {
  children: string
  className?: string
}

export function MarkdownText({ children, className }: MarkdownTextProps) {
  return (
    <span className={clsx('inline', className)}>
      <Markdown
        components={{
          p: ({ children }) => <>{children}</>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="rounded bg-zinc-200 px-1 py-0.5 font-mono text-[0.9em] dark:bg-zinc-700">{children}</code>
          ),
        }}
      >
        {children}
      </Markdown>
    </span>
  )
}
