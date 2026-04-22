'use client'

import { useState } from 'react'

const PLATFORMS = [
  { key: 'cron', label: 'Cron 表达式', color: 'text-yellow-400' },
  { key: 'kubernetes', label: 'Kubernetes', color: 'text-blue-400' },
  { key: 'github_actions', label: 'GitHub Actions', color: 'text-purple-400' },
  { key: 'jenkins', label: 'Jenkins', color: 'text-orange-400' },
  { key: 'airflow', label: 'Apache Airflow', color: 'text-green-400' },
  { key: 'crontab', label: 'Linux crontab', color: 'text-cyan-400' },
  { key: 'nodejs', label: 'Node.js', color: 'text-lime-400' },
  { key: 'python', label: 'Python', color: 'text-pink-400' },
]

const EXAMPLES = [
  '每天早上 9 点',
  '每周一凌晨 2 点',
  '每 5 分钟执行一次',
  'Every weekday at 9am',
  '每月 1 号零点',
]

const features = [
  {
    icon: '💬',
    title: '说人话，不背语法',
    desc: '输入"每天早上9点"或"Every Monday at 9am"，立即得到正确的 Cron 表达式。中英文皆可。',
  },
  {
    icon: '🚀',
    title: '多平台一键导出',
    desc: '自动生成 Kubernetes CronJob、GitHub Actions、Jenkins Pipeline、Airflow、Linux crontab、Node.js、Python 配置代码。',
  },
  {
    icon: '🔍',
    title: '一次生成，全部复制',
    desc: '每个平台的配置独立显示，一键复制，直接粘贴到你的项目中使用。',
  },
]

const faqs = [
  {
    q: 'Hey Cron 和 crontab.guru 有什么区别？',
    a: 'crontab.guru 是经典工具，但10年没有更新，只支持手动输入表达式解析。Hey Cron 支持自然语言生成、中英双语、多平台配置导出，是面向现代开发者的升级版。',
  },
  {
    q: '支持哪些平台导出？',
    a: '支持 Kubernetes CronJob、GitHub Actions、Jenkins Pipeline、Apache Airflow、Linux crontab、Node.js (node-cron)、Python (APScheduler)。',
  },
  {
    q: '免费吗？',
    a: '完全免费使用，核心功能不会收费。',
  },
  {
    q: '为什么不直接用 ChatGPT？',
    a: '你可以，但 Hey Cron 更专注：无需描述上下文、所有平台格式一次生成、结果格式固定可直接复制使用。',
  },
]

type Result = {
  cron: string
  description: string
  platforms: Record<string, string>
}

export default function Home() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  // Waitlist
  const [email, setEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleGenerate = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '生成失败，请重试')
      } else {
        setResult(data)
      }
    } catch {
      setError('网络异常，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setWaitlistStatus('loading')
    try {
      const res = await fetch('https://formspree.io/f/xbdqkkjg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setWaitlistStatus('success')
        setEmail('')
      } else {
        setWaitlistStatus('error')
      }
    } catch {
      setWaitlistStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-[#080812] text-white antialiased">

      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <span className="text-2xl">⏰</span>
          <span className="font-bold text-lg tracking-tight">Hey Cron</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 tracking-tight">
          用自然语言
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {' '}生成 Cron 表达式
          </span>
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          输入一句话，自动生成 Kubernetes、GitHub Actions、Jenkins 等多平台配置
        </p>
      </section>

      {/* Generator */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
          {/* Input */}
          <div className="mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="描述你的调度需求，例如：每周一早上 9 点"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-base"
            />
          </div>

          {/* Examples */}
          <div className="flex flex-wrap gap-2 mb-5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 rounded-lg font-semibold text-base cursor-pointer"
          >
            {loading ? '生成中…' : '生成配置 →'}
          </button>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="mt-6 space-y-3">
              <p className="text-gray-400 text-sm">{result.description}</p>
              <div className="space-y-2">
                {PLATFORMS.map(({ key, label, color }) => {
                  const value = key === 'cron' ? result.cron : result.platforms?.[key]
                  if (!value) return null
                  return (
                    <div
                      key={key}
                      className="bg-[#0d0d1a] border border-white/10 rounded-lg p-3 group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-gray-500 text-xs">{label}</span>
                        <button
                          onClick={() => handleCopy(value, key)}
                          className="text-xs text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          {copied === key ? '✅ 已复制' : '复制'}
                        </button>
                      </div>
                      <pre className={`text-sm font-mono whitespace-pre-wrap break-all ${color}`}>
                        {value}
                      </pre>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-900/60 border border-white/10 rounded-xl p-6 hover:border-indigo-500/30 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">常见问题</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-gray-900/60 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="max-w-xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-b from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-2">获取更新通知</h2>
          <p className="text-gray-400 mb-6 text-sm">留下邮箱，新功能上线第一时间通知你。</p>
          {waitlistStatus === 'success' ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-6 py-4 text-green-400">
              ✅ 已收到！
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={waitlistStatus === 'loading'}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors px-6 py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                {waitlistStatus === 'loading' ? '提交中…' : '订阅'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-600 text-sm">
        <p>
          © 2025 Hey Cron ·{' '}
          <a href="mailto:hi@heycron.com" className="hover:text-gray-400 transition-colors">
            hi@heycron.com
          </a>
        </p>
      </footer>
    </main>
  )
}
