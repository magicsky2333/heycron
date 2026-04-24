import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hey Cron — Developer Tools',
  description:
    '开发者工具集：Cron 表达式生成、Regex 生成、JSON 格式化、Base64、时间戳转换、JWT 解码、地图坐标转换、中英翻译。',
  metadataBase: new URL('https://heycron.com'),
  openGraph: {
    title: 'Hey Cron — Developer Tools',
    description: '开发者工具集，支持 Cron、Regex、JSON、Base64、Timestamp、JWT、地图坐标、翻译等。',
    url: 'https://heycron.com',
    siteName: 'Hey Cron',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
