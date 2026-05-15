'use client'

import Link from 'next/link'

const ALL_TOOLS = [
  {
    href: '/',
    icon: '⏰',
    title: 'Cron 生成器',
    desc: '中文描述秒生成 cron 表达式',
  },
  {
    href: '/regex',
    icon: '🔍',
    title: '正则表达式',
    desc: '常用正则一键生成，多语言代码',
  },
  {
    href: '/translate',
    icon: '🌐',
    title: '中英互译',
    desc: 'AI 驱动，技术文档翻译更准确',
  },
  {
    href: '/json',
    icon: '{ }',
    title: 'JSON 格式化',
    desc: 'JSON 格式化、压缩、校验',
  },
  {
    href: '/base64',
    icon: '🔐',
    title: 'Base64',
    desc: 'Base64 编码 / 解码，支持中文',
  },
  {
    href: '/timestamp',
    icon: '🕐',
    title: '时间戳转换',
    desc: 'Unix 时间戳与日期互转',
  },
  {
    href: '/jwt',
    icon: '🔑',
    title: 'JWT 解析',
    desc: '解析 JWT Token，查看 Payload',
  },
]

interface Props {
  current: string  // 当前页面 href，用于排除自身
}

export default function RelatedTools({ current }: Props) {
  const tools = ALL_TOOLS.filter((t) => t.href !== current).slice(0, 4)

  return (
    <section className="max-w-4xl mx-auto px-6 pb-16">
      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
        其他工具
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex flex-col gap-1.5 bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-4 transition-all hover:shadow-md dark:bg-gray-900 dark:border-white/10 dark:hover:border-indigo-500"
          >
            <span className="text-2xl">{tool.icon}</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {tool.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {tool.desc}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
