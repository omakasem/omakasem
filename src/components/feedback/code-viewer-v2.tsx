'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface CodeViewerV2Props {
  repoUrl: string
  file?: string
  highlightLine?: number
  branch?: string
  tooltip?: {
    line: number
    message: string
  }
}

type TokenType = 'keyword' | 'string' | 'comment' | 'function' | 'property' | 'number' | 'operator' | 'plain'

interface Token {
  type: TokenType
  value: string
}

// Light mode colors (One Light theme inspired)
const TOKEN_COLORS_LIGHT: Record<TokenType, string> = {
  keyword: '#A626A4',
  string: '#986801',
  comment: 'rgba(22, 22, 22, 0.4)',
  function: '#4078F2',
  property: '#0184BC',
  number: '#986801',
  operator: '#A626A4',
  plain: '#383A42',
}

// Dark mode colors (One Dark theme inspired)
const TOKEN_COLORS_DARK: Record<TokenType, string> = {
  keyword: '#E06C75',
  string: '#D19A66',
  comment: 'rgba(245, 245, 245, 0.4)',
  function: '#61AFEF',
  property: '#56B6C2',
  number: '#D19A66',
  operator: '#C678DD',
  plain: '#ABB2BF',
}

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'try',
  'catch',
  'finally',
  'throw',
  'new',
  'class',
  'extends',
  'super',
  'this',
  'typeof',
  'instanceof',
  'in',
  'of',
  'async',
  'await',
  'yield',
  'true',
  'false',
  'null',
  'undefined',
  'void',
  'delete',
  'default',
  'as',
])

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    if (line.slice(i).startsWith('//')) {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    if (line[i] === "'" || line[i] === '"' || line[i] === '`') {
      const quote = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', value: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    if (/\d/.test(line[i])) {
      let j = i
      while (j < line.length && /[\d.]/.test(line[j])) j++
      tokens.push({ type: 'number', value: line.slice(i, j) })
      i = j
      continue
    }

    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++
      const word = line.slice(i, j)

      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word })
      } else if (j < line.length && line[j] === '(') {
        tokens.push({ type: 'function', value: word })
      } else if (i > 0 && line[i - 1] === '.') {
        tokens.push({ type: 'property', value: word })
      } else {
        tokens.push({ type: 'plain', value: word })
      }
      i = j
      continue
    }

    if (/[+\-*/%=<>!&|^~?:]/.test(line[i])) {
      let j = i
      while (j < line.length && /[+\-*/%=<>!&|^~?:]/.test(line[j])) j++
      tokens.push({ type: 'operator', value: line.slice(i, j) })
      i = j
      continue
    }

    tokens.push({ type: 'plain', value: line[i] })
    i++
  }

  return tokens
}

function HighlightedLine({ line, isDark }: { line: string; isDark: boolean }) {
  const tokens = useMemo(() => tokenizeLine(line), [line])
  const colors = isDark ? TOKEN_COLORS_DARK : TOKEN_COLORS_LIGHT

  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} style={{ color: colors[token.type] }}>
          {token.value}
        </span>
      ))}
    </>
  )
}

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches || document.documentElement.classList.contains('dark'))

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  return isDark
}

export function CodeViewerV2({ repoUrl, file, highlightLine, branch = 'main', tooltip }: CodeViewerV2Props) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDark = useIsDarkMode()
  const highlightedLineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToHighlightedLine = useCallback(() => {
    if (highlightedLineRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const element = highlightedLineRef.current
      const containerHeight = container.getBoundingClientRect().height
      const scrollTop = element.offsetTop - container.offsetTop - containerHeight / 3
      container.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (content && highlightLine) {
      const timer = setTimeout(scrollToHighlightedLine, 100)
      return () => clearTimeout(timer)
    }
  }, [content, highlightLine, scrollToHighlightedLine])

  useEffect(() => {
    if (!file) {
      setContent(null)
      return
    }

    const fetchFile = async () => {
      setLoading(true)
      setError(null)

      try {
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
        if (!match) {
          setError('Invalid GitHub URL')
          return
        }

        const [, owner, repo] = match
        const cleanRepo = repo.replace(/\.git$/, '')
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${cleanRepo}/${branch}/${file}`

        const response = await fetch(rawUrl)
        if (!response.ok) {
          setError(`Failed to fetch file: ${response.status}`)
          return
        }

        const text = await response.text()
        setContent(text)
      } catch {
        setError('Failed to load file')
      } finally {
        setLoading(false)
      }
    }

    fetchFile()
  }, [repoUrl, file, branch])

  const lines = content?.split('\n') || []

  return (
    <div className="flex h-full flex-col self-stretch overflow-hidden rounded-2xl bg-white shadow-[0px_0px_24px_0px_rgba(22,22,22,0.06)] dark:bg-[rgba(255,255,255,0.04)]">
      <div ref={scrollContainerRef} className="relative flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex flex-row items-center gap-2 self-stretch bg-white p-5 backdrop-blur-sm dark:bg-[rgba(30,30,30,0.95)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 6L4 12L8 18"
              className="stroke-[#161616] dark:stroke-[#F5F5F5]"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 6L20 12L16 18"
              className="stroke-[#161616] dark:stroke-[#F5F5F5]"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="flex-1 text-base leading-[1.5] font-medium tracking-[-0.02em] text-[#161616] dark:text-[#F5F5F5]">
            {file || '파일을 선택하세요'}
          </span>
        </div>

        <div className="px-5 pt-2 pb-5">
          {!file && (
            <div className="flex h-full items-center justify-center">
              <p className="text-[rgba(22,22,22,0.56)] dark:text-[rgba(245,245,245,0.56)]">
                피드백을 클릭하여 코드를 확인하세요
              </p>
            </div>
          )}

          {loading && (
            <div className="flex h-full items-center justify-center">
              <p className="text-[rgba(22,22,22,0.56)] dark:text-[rgba(245,245,245,0.56)]">로딩 중...</p>
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center">
              <p className="text-[#E06C75]">{error}</p>
            </div>
          )}

          {file && !loading && !error && content && (
            <div className="flex gap-4">
              <div className="w-[22px] shrink-0 text-right font-mono text-sm leading-[1.45] font-medium tracking-[-0.02em] text-[rgba(22,22,22,0.56)] select-none dark:text-[rgba(245,245,245,0.56)]">
                {lines.map((_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>
              <pre className="m-0 flex-1 font-mono text-sm leading-[1.45] font-medium tracking-[-0.02em] break-all whitespace-pre-wrap">
                <code>
                  {lines.map((line, i) => {
                    const lineNum = i + 1
                    const isHighlighted = highlightLine === lineNum

                    return (
                      <div
                        key={lineNum}
                        ref={isHighlighted ? highlightedLineRef : undefined}
                        className={`relative ${isHighlighted ? 'bg-[rgba(166,38,164,0.1)] dark:bg-[rgba(224,108,117,0.15)]' : ''}`}
                      >
                        <HighlightedLine line={line || ' '} isDark={isDark} />
                        {tooltip && tooltip.line === lineNum && (
                          <div className="absolute top-full left-0 z-10 mt-1 max-w-[420px] rounded-full border border-[rgba(164,164,164,0.72)] bg-white px-3.5 py-3 shadow-[0px_0px_24px_0px_rgba(22,22,22,0.06)] backdrop-blur-[16px] dark:bg-[#161616]">
                            <span className="text-sm leading-[1.45] font-medium tracking-[-0.02em] text-[#161616] dark:text-[#F5F5F5]">
                              {tooltip.message}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
