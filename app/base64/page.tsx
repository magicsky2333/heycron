'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'

export default function Base64Page() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    if (!input.trim()) return
    setError('')
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))))
      }
    } catch {
      setError(mode === 'encode' ? '编码失败，请检查输入' : '解码失败，请确认输入是有效的 Base64 字符串')
      setOutput('')
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setError('')
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#080812] text-white antialiased">
      <Nav />

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          Base64{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            编码 / 解码
          </span>
        </h1>
        <p className="text-gray-400">在线 Base64 编解码工具，支持中文和特殊字符</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        {/* Mode */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => { setMode('encode'); setInput(''); setOutput(''); setError('') }}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${mode === 'encode' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              编码 Encode
            </button>
            <button
              onClick={() => { setMode('decode'); setInput(''); setOutput(''); setError('') }}
              className={`px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${mode === 'decode' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              解码 Decode
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Input */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-500">{mode === 'encode' ? '原始文本' : 'Base64 字符串'}</span>
              <span className="text-xs text-gray-600">{input.length} 字符</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入要编码的文本，支持中文' : '输入要解码的 Base64 字符串'}
              className="w-full h-40 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              spellCheck={false}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={!input.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
            >
              {mode === 'encode' ? '编码 →' : '解码 →'}
            </button>
            {output && (
              <button
                onClick={handleSwap}
                className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                title="交换输入输出"
              >
                ⇄ 反转
              </button>
            )}
          </div>

          {/* Output */}
          {(output || error) && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-500">{mode === 'encode' ? 'Base64 结果' : '解码结果'}</span>
                {output && (
                  <button onClick={handleCopy} className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
                    {copied ? '✅ 已复制' : '复制'}
                  </button>
                )}
              </div>
              {error ? (
                <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
                  {error}
                </div>
              ) : (
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-40 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm font-mono text-green-400 focus:outline-none resize-none"
                  spellCheck={false}
                />
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-gray-600 text-sm">
        <p>© 2025 Hey Cron · <a href="mailto:hi@heycron.com" className="hover:text-gray-400">hi@heycron.com</a></p>
      </footer>
    </main>
  )
}
