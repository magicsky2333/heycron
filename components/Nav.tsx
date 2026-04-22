'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'

const TOOLS_ZH = [
  { href: '/', label: 'Cron' },
  { href: '/regex', label: 'Regex' },
  { href: '/translate', label: '翻译' },
  { href: '/json', label: 'JSON' },
  { href: '/base64', label: 'Base64' },
  { href: '/timestamp', label: '时间戳' },
  { href: '/jwt', label: 'JWT' },
  { href: '/map', label: '地图坐标' },
]

const TOOLS_EN = [
  { href: '/', label: 'Cron' },
  { href: '/regex', label: 'Regex' },
  { href: '/translate', label: 'Translate' },
  { href: '/json', label: 'JSON' },
  { href: '/base64', label: 'Base64' },
  { href: '/timestamp', label: 'Timestamp' },
  { href: '/jwt', label: 'JWT' },
  { href: '/map', label: 'Map' },
]

export default function Nav() {
  const pathname = usePathname()
  const { isZh, setLang } = useLang()
  const tools = isZh ? TOOLS_ZH : TOOLS_EN

  return (
    <nav className="border-b border-white/10 px-4 py-3 bg-[#080812]">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl">⏰</span>
          <span className="font-bold text-base tracking-tight">Hey Cron</span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 overflow-x-auto flex-1">
          {tools.map((tool) => {
            const active = pathname === tool.href
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                  active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tool.label}
              </Link>
            )
          })}
        </div>
        <button
          onClick={() => setLang(isZh ? 'en' : 'zh')}
          className="shrink-0 text-sm text-gray-400 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
        >
          {isZh ? 'EN' : '中文'}
        </button>
      </div>
    </nav>
  )
}
