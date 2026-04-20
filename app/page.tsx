'use client'

import { useState } from 'react'

const features = [
  {
    icon: '💬',
    title: '说人话，不背语法',
    desc: '输入"每天早上9点"或"Every Monday at 9am"，立即得到正确的 Cron 表达式。中英文皆可。',
  },
  {
    icon: '🚀',
    title: '多平台一键导出',
    desc: '自动生成 Kubernetes CronJob、GitHub Actions、Jenkins Pipeline、Airflow DAG、Linux crontab、Node.js、Python 配置代码。',
  },
  {
    icon: '🔍',
    title: '可视化解析',
    desc: '粘贴任意 Cron 表达式，立即看懂每个字段的含义，告别"0 9 * * 1 到底是什么"的困惑。',
  },
]

const faqs = [
  {
    q: 'Hey Cron 和 crontab.guru 有什么区别？',
    a: 'crontab.guru 是经典工具，但10年没有更新，只支持手动输入表达式解析。Hey Cron 支持自然语言生成、中英双语、多平台配置导出，是面向现代开发者的升级版。',
  },
  {
    q: '支持哪些平台导出？',
    a: '规划支持：Kubernetes CronJob、GitHub Actions、Jenkins Pipeline、Apache Airflow、Linux crontab、Node.js (node-cron)、Python (APScheduler)。',
  },
  {
    q: '什么时候上线？免费吗？',
    a: '目前正在开发中，加入候补名单可第一时间收到上线通知。核心功能将永久免费，高级功能考虑提供付费订阅。',
  },
  {
    q: '为什么不直接用 ChatGPT？',
    a: '你可以，但 Hey Cron 更专注：无需描述上下文、结果直接可复制、多平台格式一次生成、可视化校验表达式是否正确。',
  },
]

const platforms = [
  'Kubernetes',
  'GitHub Actions',
  'Jenkins',
  'Apache Airflow',
  'Linux crontab',
  'Node.js',
  'Python',
]

const demoRows = [
  { label: 'Cron 表达式', value: '0 9 * * 1', color: 'text-yellow-400' },
  { label: 'Kubernetes', value: 'schedule: "0 9 * * 1"', color: 'text-blue-400' },
  { label: 'GitHub Actions', value: "cron: '0 9 * * 1'", color: 'text-purple-400' },
  { label: 'Linux crontab', value: '0 9 * * 1 /usr/bin/script.sh', color: 'text-cyan-400' },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('https://formspree.io/f/xbdqkkjg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
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
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <span>🚧</span>
          <span>正在开发中 · 加入候补名单优先体验</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 tracking-tight">
          用自然语言
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            生成 Cron 表达式
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          告别死记硬背。输入一句话，即刻生成可用于 Kubernetes、GitHub Actions、Jenkins、Airflow
          的配置代码。支持中英文。
        </p>
        <a
          href="#waitlist"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors px-8 py-3.5 rounded-lg font-semibold text-lg"
        >
          加入候补名单 →
        </a>
      </section>

      {/* Demo mockup */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="p-6 font-mono text-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 shrink-0">输入</span>
              <span className="text-green-400">&quot;每周一早上 9 点发送周报&quot;</span>
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2.5">
              {demoRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={row.color}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">为什么选 Hey Cron？</h2>
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

      {/* Platforms */}
      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <p className="text-gray-500 text-xs mb-5 uppercase tracking-widest">支持导出平台</p>
        <div className="flex flex-wrap justify-center gap-3">
          {platforms.map((p) => (
            <span
              key={p}
              className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="max-w-xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-b from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold mb-3">第一时间体验</h2>
          <p className="text-gray-400 mb-8">加入候补名单，上线时优先通知。</p>
          {status === 'success' ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-6 py-4 text-green-400">
              ✅ 已收到！上线时第一时间通知你。
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
                disabled={status === 'loading'}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors px-6 py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                {status === 'loading' ? '提交中…' : '加入候补'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm mt-3">提交失败，请稍后再试。</p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-10">常见问题</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-gray-900/60 border border-white/10 rounded-xl p-6"
            >
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
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
