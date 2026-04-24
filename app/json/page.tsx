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

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-[#080812] dark:text-white">
      <Nav />

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          JSON{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            格式化 / 压缩
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">在线 JSON 格式化和压缩工具，自动校验语法</p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
            {[2, 4].map((n) => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${indent === n ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
              >
                {n} 空格
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={format}
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              格式化
            </button>
            <button
              onClick={minify}
              disabled={!input.trim()}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              压缩
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">输入 JSON</span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'{\n  "key": "value"\n}'}
              className="h-96 bg-white border border-gray-300 rounded-xl p-4 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none dark:bg-gray-900 dark:border-white/10 dark:text-white dark:placeholder-gray-600"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">输出</span>
              {output && (
                <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors cursor-pointer">
                  {copied ? '✅ 已复制' : '复制'}
                </button>
              )}
            </div>
            {error ? (
              <div className="h-96 bg-red-50 border border-red-300 rounded-xl p-4 text-sm text-red-600 dark:bg-red-500/5 dark:border-red-500/30 dark:text-red-400">
                {error}
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder="格式化结果将显示在这里"
                className="h-96 bg-white border border-gray-300 rounded-xl p-4 text-sm font-mono text-green-700 placeholder-gray-400 focus:outline-none resize-none dark:bg-gray-900 dark:border-white/10 dark:text-green-400 dark:placeholder-gray-600"
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-white/10 py-8 text-center text-gray-400 dark:text-gray-600 text-sm">
        <p>© 2025 Hey Cron · <a href="mailto:hi@heycron.com" className="hover:text-gray-600 dark:hover:text-gray-400">hi@heycron.com</a></p>
      </footer>
    </main>
  )
}
