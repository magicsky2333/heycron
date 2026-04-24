'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import { useLang } from '@/contexts/LanguageContext'

const EXAMPLES_ZH = [
  '匹配邮箱地址',
  '匹配手机号码',
  '匹配中文字符',
  '匹配 URL 链接',
  '匹配 IP 地址',
  '只包含字母和数字',
]

const EXAMPLES_EN = [
  'Match email address',
  'Match phone number',
  'Match URL',
  'Match IP address',
  'Only letters and numbers',
  'Match date format YYYY-MM-DD',
]

const CODE_LANGS = [
  { key: 'javascript', label: 'JavaScript', color: 'text-yellow-500 dark:text-yellow-400' },
  { key: 'python', label: 'Python', color: 'text-blue-600 dark:text-blue-400' },
  { key: 'go', label: 'Go', color: 'text-cyan-600 dark:text-cyan-400' },
  { key: 'java', label: 'Java', color: 'text-orange-600 dark:text-orange-400' },
]

type RegexResult = {
  pattern: string
  flags: string
  description: string
  explanation: { part: string; meaning: string }[]
  examples: { match: string[]; noMatch: string[] }
  code: Record<string, string>
}

export default function RegexPage() {
  const { lang } = useLang()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<RegexResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [testInput, setTestInput] = useState('')

  const isZh = lang === 'zh'
  const examples = isZh ? EXAMPLES_ZH : EXAMPLES_EN

  const handleGenerate = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/regex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || (isZh ? '生成失败，请重试' : 'Generation failed, please try again'))
      } else {
        setResult(data)
        setTestInput('')
      }
    } catch {
      setError(isZh ? '网络异常，请重试' : 'Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const testResult = (() => {
    if (!result || !testInput) return null
    try {
      const re = new RegExp(result.pattern, result.flags || '')
      return re.test(testInput)
    } catch {
      return null
    }
  })()

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-[#080812] dark:text-white">

      <Nav />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 tracking-tight">
          {isZh ? '用自然语言' : 'Generate Regex'}{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            {isZh ? '生成正则表达式' : 'from Natural Language'}
          </span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          {isZh
            ? '描述你的匹配需求，自动生成正则表达式、逐段解释，并输出多语言代码'
            : 'Describe what you want to match, get the regex pattern, explanation, and code in multiple languages'}
        </p>
      </section>

      {/* Generator */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white border border-gray-200 rounded-xl p-6 dark:bg-gray-900 dark:border-white/10">
          <div className="mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={isZh ? '描述你的匹配需求，例如：匹配邮箱地址' : 'Describe what to match, e.g. Match email address'}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors text-base dark:bg-white/5 dark:border-white/20 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="text-xs bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full px-3 py-1 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-gray-400 dark:hover:text-white"
              >
                {ex}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 rounded-lg font-semibold text-base cursor-pointer text-white"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isZh ? '生成中…' : 'Generating…'}
              </span>
            ) : (isZh ? '生成正则 →' : 'Generate Regex →')}
          </button>

          {/* Loading progress bar */}
          {loading && (
            <div className="mt-3 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          )}

          {error && <p className="text-red-500 dark:text-red-400 text-sm mt-3 text-center">{error}</p>}

          {result && (
            <div className="mt-6 space-y-4">
              {/* Pattern */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 group dark:bg-[#0d0d1a] dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{isZh ? '正则表达式' : 'Pattern'}</span>
                  <button
                    onClick={() => handleCopy(`/${result.pattern}/${result.flags}`, 'pattern')}
                    className="text-xs text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    {copied === 'pattern' ? (isZh ? '✅ 已复制' : '✅ Copied') : (isZh ? '复制' : 'Copy')}
                  </button>
                </div>
                <pre className="text-yellow-600 dark:text-yellow-400 font-mono text-base break-all">
                  /{result.pattern}/{result.flags}
                </pre>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{result.description}</p>
              </div>

              {/* Explanation */}
              {result.explanation?.length > 0 && (
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 dark:bg-[#0d0d1a] dark:border-white/10">
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-3">{isZh ? '逐段解释' : 'Explanation'}</p>
                  <div className="space-y-2">
                    {result.explanation.map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <code className="text-purple-600 dark:text-purple-400 font-mono text-sm shrink-0 bg-purple-100 dark:bg-purple-400/10 px-2 py-0.5 rounded">
                          {item.part}
                        </code>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 dark:bg-[#0d0d1a] dark:border-white/10">
                <p className="text-gray-400 dark:text-gray-500 text-xs mb-3">{isZh ? '在线测试' : 'Test'}</p>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder={isZh ? '输入字符串测试匹配' : 'Enter string to test'}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm dark:bg-white/5 dark:border-white/20 dark:text-white dark:placeholder-gray-500"
                  />
                  {testInput && testResult !== null && (
                    <span className={`text-sm font-semibold shrink-0 ${testResult ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {testResult ? (isZh ? '✅ 匹配' : '✅ Match') : (isZh ? '❌ 不匹配' : '❌ No match')}
                    </span>
                  )}
                </div>
              </div>

              {/* Examples */}
              {result.examples && (
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 dark:bg-[#0d0d1a] dark:border-white/10">
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-3">{isZh ? '示例' : 'Examples'}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-xs mb-2">{isZh ? '✅ 匹配' : '✅ Match'}</p>
                      {result.examples.match?.map((ex, i) => (
                        <code key={i} className="block text-sm text-gray-700 dark:text-gray-300 font-mono">{ex}</code>
                      ))}
                    </div>
                    <div>
                      <p className="text-red-500 dark:text-red-400 text-xs mb-2">{isZh ? '❌ 不匹配' : '❌ No match'}</p>
                      {result.examples.noMatch?.map((ex, i) => (
                        <code key={i} className="block text-sm text-gray-700 dark:text-gray-300 font-mono">{ex}</code>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Code */}
              <div className="space-y-2">
                {CODE_LANGS.map(({ key, label, color }) => {
                  const code = result.code?.[key]
                  if (!code) return null
                  return (
                    <div key={key} className="bg-gray-100 border border-gray-200 rounded-lg p-4 group dark:bg-[#0d0d1a] dark:border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold ${color}`}>{label}</span>
                        <button
                          onClick={() => handleCopy(code, key)}
                          className="text-xs text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          {copied === key ? (isZh ? '✅ 已复制' : '✅ Copied') : (isZh ? '复制' : 'Copy')}
                        </button>
                      </div>
                      <pre className="text-gray-700 dark:text-gray-300 text-sm font-mono whitespace-pre-wrap break-all">{code}</pre>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/10 py-8 text-center text-gray-400 dark:text-gray-600 text-sm">
        <p>© 2025 Hey Cron · <a href="mailto:hi@heycron.com" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">hi@heycron.com</a></p>
      </footer>
    </main>
  )
}
