import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hey Cron — 用自然语言生成 Cron 表达式',
  description:
    '输入一句话，即刻生成可用于 Kubernetes、GitHub Actions、Jenkins、Airflow 的 Cron 配置代码。支持中英文。',
  metadataBase: new URL('https://heycron.com'),
  openGraph: {
    title: 'Hey Cron — 用自然语言生成 Cron 表达式',
    description:
      '输入一句话，即刻生成可用于 Kubernetes、GitHub Actions、Jenkins、Airflow 的 Cron 配置代码。',
    url: 'https://heycron.com',
    siteName: 'Hey Cron',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hey Cron — 用自然语言生成 Cron 表达式',
    description: '输入一句话，即刻生成多平台 Cron 配置代码。支持中英文。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
