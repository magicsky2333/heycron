'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'

function base64UrlDecode(str: string) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
  return JSON.parse(decodeURIComponent(escape(atob(padded))))
}

function isExpired(payload: Record<string, unknown>) {
  if (!payload.exp) return null
  return (payload.exp as number) * 1000 < Date.now()
}

function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
}

export default function JwtPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ header: Record<string, unknown>; payload: Record<string, unknown>; valid: boolean } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const decode = () => {
    if (!input.trim()) return
    setError('')
    setResult(null)
    try {
      const parts = input.trim().split('.')
      if (parts.length !== 3) throw new Error('JWT 格式不正确，应包含三个部分（header.payload.signature）')
      const header = base64UrlDecode(parts[0])
      const payload = base64UrlDecode(parts[1])
      setResult({ header, payload, valid: true })
    } catch (e) {
      setError((e as Error).message || '解码失败，请确认输入是有效的 JWT Token')
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const expired = result ? isExpired(result.payload) : null

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-[#080812] dark:text-white">
      <Nav />

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          JWT{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            解码工具
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">粘贴 JWT Token，查看 Header、Payload 内容和过期时间</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-4">
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴 JWT Token，例如：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full h-32 bg-white border border-gray-300 rounded-xl p-4 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none dark:bg-gray-900 dark:border-white/10 dark:text-white dark:placeholder-gray-600"
            spellCheck={false}
          />
        </div>

        <button
          onClick={decode}
          disabled={!input.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer"
        >
          解码 →
        </button>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-sm text-red-600 dark:bg-red-500/5 dark:border-red-500/30 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {expired !== null && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${expired ? 'bg-red-50 border border-red-300 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400' : 'bg-green-50 border border-green-300 text-green-700 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400'}`}>
                {expired ? '⚠️ Token 已过期' : '✅ Token 未过期'}
                {result.payload.exp != null && (
                  <span className="ml-2 font-normal opacity-80">
                    过期时间：{formatTime(Number(result.payload.exp))}
                  </span>
                )}
              </div>
            )}

            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 group dark:bg-gray-900 dark:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Header</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(result.header, null, 2), 'header')}
                  className="text-xs text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  {copied === 'header' ? '✅ 已复制' : '复制'}
                </button>
              </div>
              <pre className="text-blue-600 dark:text-blue-400 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 group dark:bg-gray-900 dark:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">Payload</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(result.payload, null, 2), 'payload')}
                  className="text-xs text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  {copied === 'payload' ? '✅ 已复制' : '复制'}
                </button>
              </div>
              <pre className="text-green-600 dark:text-green-400 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
              <div className="mt-4 space-y-1.5 border-t border-gray-200 dark:border-white/10 pt-4">
                {(['iat', 'exp', 'nbf'] as const).map((field) => {
                  const val = result.payload[field]
                  if (val == null) return null
                  const labels: Record<string, string> = { iat: '签发时间', exp: '过期时间', nbf: '生效时间' }
                  return (
                    <div key={field} className="flex gap-3 text-sm">
                      <span className="text-gray-400 dark:text-gray-500 w-16 shrink-0">{labels[field]}</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatTime(Number(val))}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Signature note */}
            <div className="bg-gray-100 border border-gray-200 rounded-xl px-5 py-4 dark:bg-gray-900/50 dark:border-white/5">
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Signature</span>
              <p className="text-gray-500 dark:text-gray-600 text-sm">签名部分仅用于服务端验证，客户端无法验证。此工具只解码，不验证签名有效性。</p>
            </div>
          </div>
        )}
      </section>

      <footer className="border-t border-gray-200 dark:border-white/10 py-8 text-center text-gray-400 dark:text-gray-600 text-sm">
        <p>© 2025 Hey Cron · <a href="mailto:hi@heycron.com" className="hover:text-gray-600 dark:hover:text-gray-400">hi@heycron.com</a></p>
      </footer>
    </main>
  )
}
