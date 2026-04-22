'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

export default function TimestampPage() {
  const [now, setNow] = useState(Date.now())
  const [tsInput, setTsInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [tsResult, setTsResult] = useState<{ utc: string; local: string; relative: string } | null>(null)
  const [dateResult, setDateResult] = useState<{ seconds: number; milliseconds: number } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const convertTs = () => {
    if (!tsInput.trim()) return
    let ts = parseInt(tsInput.trim())
    if (isNaN(ts)) return
    // 自动判断秒还是毫秒
    if (ts < 1e12) ts = ts * 1000
    const d = new Date(ts)
    const relative = getRelative(ts)
    setTsResult({
      utc: d.toUTCString(),
      local: d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
      relative,
    })
  }

  const convertDate = () => {
    if (!dateInput.trim()) return
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return
    setDateResult({
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
    })
  }

  const getRelative = (ts: number) => {
    const diff = ts - Date.now()
    const abs = Math.abs(diff)
    const past = diff < 0
    if (abs < 60000) return past ? '刚刚' : '即将'
    if (abs < 3600000) return `${Math.floor(abs / 60000)} 分钟${past ? '前' : '后'}`
    if (abs < 86400000) return `${Math.floor(abs / 3600000)} 小时${past ? '前' : '后'}`
    return `${Math.floor(abs / 86400000)} 天${past ? '前' : '后'}`
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const useNow = () => {
    setTsInput(String(Math.floor(Date.now() / 1000)))
  }

  return (
    <main className="min-h-screen bg-[#080812] text-white antialiased">
      <Nav />

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          Unix{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            时间戳转换
          </span>
        </h1>
        <p className="text-gray-400">时间戳 ↔ 日期时间互转，支持秒和毫秒</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-6">

        {/* Current time */}
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
          <p className="text-xs text-gray-500 mb-3">当前时间</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs mb-1">Unix 时间戳（秒）</p>
              <div className="flex items-center gap-2">
                <code className="text-yellow-400 font-mono text-lg">{Math.floor(now / 1000)}</code>
                <button onClick={() => handleCopy(String(Math.floor(now / 1000)), 'now-s')} className="text-xs text-gray-500 hover:text-white cursor-pointer">
                  {copied === 'now-s' ? '✅' : '复制'}
                </button>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">毫秒</p>
              <div className="flex items-center gap-2">
                <code className="text-yellow-400 font-mono text-lg">{now}</code>
                <button onClick={() => handleCopy(String(now), 'now-ms')} className="text-xs text-gray-500 hover:text-white cursor-pointer">
                  {copied === 'now-ms' ? '✅' : '复制'}
                </button>
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-xs mb-1">北京时间</p>
              <code className="text-green-400 font-mono">
                {new Date(now).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}
              </code>
            </div>
          </div>
        </div>

        {/* Timestamp → Date */}
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
          <p className="text-xs text-gray-500 mb-4">时间戳 → 日期</p>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && convertTs()}
              placeholder="输入时间戳，例如：1700000000"
              className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
            />
            <button onClick={useNow} className="bg-white/10 hover:bg-white/20 px-3 py-2.5 rounded-lg text-xs text-gray-400 transition-colors cursor-pointer whitespace-nowrap">
              用当前
            </button>
            <button onClick={convertTs} disabled={!tsInput.trim()} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
              转换
            </button>
          </div>
          {tsResult && (
            <div className="space-y-2">
              {[
                { label: 'UTC', value: tsResult.utc, key: 'utc' },
                { label: '北京时间 (UTC+8)', value: tsResult.local, key: 'local' },
                { label: '相对时间', value: tsResult.relative, key: 'rel' },
              ].map(({ label, value, key }) => (
                <div key={key} className="flex items-center justify-between bg-[#0d0d1a] border border-white/10 rounded-lg px-4 py-2.5">
                  <div>
                    <span className="text-gray-500 text-xs block">{label}</span>
                    <code className="text-green-400 text-sm">{value}</code>
                  </div>
                  <button onClick={() => handleCopy(value, key)} className="text-xs text-gray-500 hover:text-white cursor-pointer shrink-0 ml-2">
                    {copied === key ? '✅' : '复制'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date → Timestamp */}
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
          <p className="text-xs text-gray-500 mb-4">日期 → 时间戳</p>
          <div className="flex gap-3 mb-4">
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
            <button onClick={convertDate} disabled={!dateInput} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
              转换
            </button>
          </div>
          {dateResult && (
            <div className="space-y-2">
              {[
                { label: '秒 (s)', value: String(dateResult.seconds), key: 'ds' },
                { label: '毫秒 (ms)', value: String(dateResult.milliseconds), key: 'dms' },
              ].map(({ label, value, key }) => (
                <div key={key} className="flex items-center justify-between bg-[#0d0d1a] border border-white/10 rounded-lg px-4 py-2.5">
                  <div>
                    <span className="text-gray-500 text-xs block">{label}</span>
                    <code className="text-yellow-400 font-mono text-sm">{value}</code>
                  </div>
                  <button onClick={() => handleCopy(value, key)} className="text-xs text-gray-500 hover:text-white cursor-pointer">
                    {copied === key ? '✅' : '复制'}
                  </button>
                </div>
              ))}
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
