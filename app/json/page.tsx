'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'

export default function JsonPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(2)

  const format = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError('')
    } catch (e) {
      setError(`JSON 格式错误: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const minify = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch (e) {
      setError(`JSON 格式错误: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const lineCount = output ? output.split('\n').length : 0

  return (
    <main className="min-h-screen bg-[#080812] text-white antialiased">
      <Nav />

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          JSON{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            格式化 / 压缩
          </span>
        </h1>
        <p className="text-gray-400">粘贴 JSON，一键格式化或压缩，自动检测语法错误</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        {/* Controls */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">缩进</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`px-3 py-1 rounded text-sm transition-colors cursor-pointer ${
                  indent === n ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {n} 空格
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={format}
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              格式化
            </button>
            <button
              onClick={minify}
              disabled={!input.trim()}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              压缩
            </button>
            <button
              onClick={handleClear}
              className="bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-lg text-sm text-gray-400 transition-colors cursor-pointer"
            >
              清空
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">输入</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='粘贴 JSON，例如：{"name":"hey cron","version":1}'
              className="h-96 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                输出 {lineCount > 0 && <span className="text-gray-600">({lineCount} 行)</span>}
              </span>
              {output && (
                <button
                  onClick={handleCopy}
                  className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? '✅ 已复制' : '复制'}
                </button>
              )}
            </div>
            {error ? (
              <div className="h-96 bg-red-500/5 border border-red-500/30 rounded-xl p-4 text-sm text-red-400 font-mono">
                {error}
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder="格式化结果将显示在这里"
                className="h-96 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm font-mono text-green-400 placeholder-gray-600 focus:outline-none resize-none"
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-gray-600 text-sm">
        <p>© 2025 Hey Cron · <a href="mailto:hi@heycron.com" className="hover:text-gray-400">hi@heycron.com</a></p>
      </footer>
    </main>
  )
}
