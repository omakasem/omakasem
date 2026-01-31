'use client'

import { useEffect, useMemo, useState } from 'react'

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

const TOKEN_COLORS: Record<TokenType, string> = {
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

function HighlightedLine({ line }: { line: string }) {
  const tokens = useMemo(() => tokenizeLine(line), [line])

  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
          {token.value}
        </span>
      ))}
    </>
  )
}

export function CodeViewerV2({ repoUrl, file, highlightLine, branch = 'main', tooltip }: CodeViewerV2Props) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div
      className="flex h-full flex-col self-stretch rounded-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        boxShadow: '0px 0px 24px 0px rgba(22, 22, 22, 0.06)',
      }}
    >
      <div className="flex flex-row items-center gap-2 self-stretch p-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8 6L4 12L8 18" stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 6L20 12L16 18" stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          className="flex-1 text-base leading-[1.5] font-medium"
          style={{ color: '#F5F5F5', letterSpacing: '-0.02em' }}
        >
          {file || '파일을 선택하세요'}
        </span>
      </div>

      <div className="relative flex-1 overflow-auto px-5 pt-2 pb-5">
        {!file && (
          <div className="flex h-full items-center justify-center">
            <p style={{ color: 'rgba(245, 245, 245, 0.56)' }}>피드백을 클릭하여 코드를 확인하세요</p>
          </div>
        )}

        {loading && (
          <div className="flex h-full items-center justify-center">
            <p style={{ color: 'rgba(245, 245, 245, 0.56)' }}>로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center">
            <p style={{ color: '#E06C75' }}>{error}</p>
          </div>
        )}

        {file && !loading && !error && content && (
          <div className="flex gap-4">
            <div
              className="shrink-0 text-right select-none"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.45',
                letterSpacing: '-0.02em',
                color: 'rgba(245, 245, 245, 0.56)',
                width: '22px',
              }}
            >
              {lines.map((_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            <pre
              className="flex-1 overflow-x-auto"
              style={{
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.45',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              <code>
                {lines.map((line, i) => {
                  const lineNum = i + 1
                  const isHighlighted = highlightLine === lineNum

                  return (
                    <div
                      key={lineNum}
                      className="relative"
                      style={{
                        background: isHighlighted ? 'rgba(224, 108, 117, 0.15)' : undefined,
                      }}
                    >
                      <HighlightedLine line={line || ' '} />
                      {tooltip && tooltip.line === lineNum && (
                        <div
                          className="absolute top-full left-0 z-10 mt-1"
                          style={{
                            background: '#161616',
                            border: '1px solid rgba(164, 164, 164, 0.72)',
                            borderRadius: '1000px',
                            padding: '12px 14px',
                            boxShadow: '0px 0px 24px 0px rgba(22, 22, 22, 0.06)',
                            backdropFilter: 'blur(16px)',
                            maxWidth: '420px',
                          }}
                        >
                          <span
                            className="text-sm leading-[1.45] font-medium"
                            style={{ color: '#F5F5F5', letterSpacing: '-0.02em' }}
                          >
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
  )
}
