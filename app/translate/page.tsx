'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import { useLang } from '@/contexts/LanguageContext'

type Direction = 'zh2en' | 'en2zh'

export default function TranslatePage() {
  const { isZh } = useLang()
  const [direction, setDirection] = useState<Direction>('zh2en')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const srcLabel = direction === 'zh2en' ? '中文' : 'English'
  const dstLabel = direction === 'zh2en' ? 'English' : '中文'

  const handleTranslate = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, direction }),
      })
      if (!res.ok || !res.body) {
        setError(isZh ? '翻译失败，请重试' : 'Translation failed, please try again')
        setLoading(false)
        return
      }
      // 流式读取
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) setOutput((prev) => prev + content)
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch {
      setError(isZh ? '网络异常，请重试' : 'Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = () => {
    setDirection(direction === 'zh2en' ? 'en2zh' : 'zh2en')
    setInput(output)
    setOutput('')
    setError('')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#080812] text-white antialiased">
      <Nav />

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          {isZh ? '中英' : 'CN ↔ EN'}{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {isZh ? '互译工具' : 'Translation'}
          </span>
        </h1>
        <p className="text-gray-400">
          {isZh ? '中英文双向翻译，AI 驱动，自然流畅' : 'AI-powered Chinese-English translation'}
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        {/* Direction toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-white font-medium">{srcLabel}</span>
          <button
            onClick={handleSwap}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-1.5 text-sm transition-colors cursor-pointer"
          >
            ⇄ {isZh ? '互换' : 'Swap'}
          </button>
          <span className="text-white font-medium">{dstLabel}</span>
        </div>

        {/* Editors */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{srcLabel}</span>
              <span className="text-xs text-gray-600">{input.length} {isZh ? '字符' : 'chars'}</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'zh2en'
                ? '输入中文，例如：你好，世界！'
                : 'Enter English text, e.g. Hello, world!'}
              className="h-64 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{dstLabel}</span>
              {output && (
                <button onClick={handleCopy} className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
                  {copied ? (isZh ? '✅ 已复制' : '✅ Copied') : (isZh ? '复制' : 'Copy')}
                </button>
              )}
            </div>
            {error ? (
              <div className="h-64 bg-red-500/5 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
                {error}
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder={isZh ? '翻译结果将显示在这里' : 'Translation will appear here'}
                className="h-64 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm text-green-400 placeholder-gray-600 focus:outline-none resize-none"
              />
            )}
          </div>
        </div>

        {/* Translate button */}
        <button
          onClick={handleTranslate}
          disabled={loading || !input.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition-colors cursor-pointer"
        >
          {loading
            ? (isZh ? '翻译中…' : 'Translating…')
            : (isZh ? '翻译 →' : 'Translate →')}
        </button>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-gray-600 text-sm">
        <p>© 2025 Hey Cron · <a href="mailto:hi@heycron.com" className="hover:text-gray-400">hi@heycron.com</a></p>
      </footer>
    </main>
  )
}
