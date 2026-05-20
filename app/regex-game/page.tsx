'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { LEVELS } from './levels'

type Status = 'playing' | 'correct' | 'error'

export default function RegexGamePage() {
  const [levelIdx, setLevelIdx] = useState(0)
  const [pattern, setPattern] = useState('')
  const [status, setStatus] = useState<Status>('playing')
  const [matches, setMatches] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [cleared, setCleared] = useState<number[]>([])
  const [showMap, setShowMap] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const level = LEVELS[levelIdx]

  // 读取进度
  useEffect(() => {
    try {
      const saved = localStorage.getItem('heycron-regex-game')
      if (saved) {
        const { clearedIds, lastIdx } = JSON.parse(saved)
        setCleared(clearedIds ?? [])
        setLevelIdx(lastIdx ?? 0)
      }
    } catch {}
  }, [])

  // 实时校验正则
  useEffect(() => {
    setStatus('playing')
    setErrorMsg('')
    setMatches([])
    setShowTip(false)
    if (!pattern.trim()) return

    try {
      const re = new RegExp(pattern, 'gm')
      const found: string[] = []
      let m: RegExpExecArray | null
      while ((m = re.exec(level.text)) !== null) {
        found.push(m[0])
        if (re.lastIndex === m.index) re.lastIndex++
      }
      setMatches(found)

      const allTargets = [...level.targets].sort().join('|')
      const allFound = [...found].sort().join('|')
      const hasForbidden = level.forbid?.some((f) => found.includes(f))

      if (allFound === allTargets && !hasForbidden) {
        setStatus('correct')
        // 保存进度
        const newCleared = cleared.includes(level.id) ? cleared : [...cleared, level.id]
        setCleared(newCleared)
        localStorage.setItem(
          'heycron-regex-game',
          JSON.stringify({ clearedIds: newCleared, lastIdx: levelIdx })
        )
        setTimeout(() => setShowTip(true), 400)
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : '无效的正则表达式')
      setStatus('error')
    }
  }, [pattern, levelIdx])

  // 切关卡时重置
  const goToLevel = (idx: number) => {
    setLevelIdx(idx)
    setPattern('')
    setShowHint(false)
    setShowTip(false)
    setShowMap(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const nextLevel = () => {
    if (levelIdx < LEVELS.length - 1) goToLevel(levelIdx + 1)
  }

  // 高亮匹配文本
  const renderHighlighted = () => {
    if (!pattern.trim() || status === 'error') {
      return <span className="whitespace-pre-wrap">{level.text}</span>
    }
    try {
      const re = new RegExp(pattern, 'gm')
      const parts: { text: string; highlight: boolean }[] = []
      let last = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(level.text)) !== null) {
        if (m.index > last) parts.push({ text: level.text.slice(last, m.index), highlight: false })
        parts.push({ text: m[0], highlight: true })
        last = m.index + m[0].length
        if (re.lastIndex === m.index) re.lastIndex++
      }
      if (last < level.text.length) parts.push({ text: level.text.slice(last), highlight: false })
      return (
        <>
          {parts.map((p, i) =>
            p.highlight ? (
              <mark key={i} className="bg-yellow-300 dark:bg-yellow-500 text-gray-900 rounded px-0.5">
                {p.text}
              </mark>
            ) : (
              <span key={i} className="whitespace-pre-wrap">{p.text}</span>
            )
          )}
        </>
      )
    } catch {
      return <span className="whitespace-pre-wrap">{level.text}</span>
    }
  }

  const borderColor =
    status === 'correct'
      ? 'border-green-500'
      : status === 'error'
      ? 'border-red-500'
      : 'border-indigo-500'

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-[#080812] dark:text-white">
      <Nav />

      {/* 顶部标题 */}
      <section className="max-w-3xl mx-auto px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-bold tracking-tight">
            正则{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              闯关
            </span>
          </h1>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-sm text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            关卡地图 ({cleared.length}/{LEVELS.length})
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          写正则表达式匹配指定内容，共 {LEVELS.length} 关，从简单到地狱难度
        </p>
      </section>

      {/* 关卡地图 */}
      {showMap && (
        <section className="max-w-3xl mx-auto px-6 pb-4">
          <div className="grid grid-cols-10 gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            {LEVELS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => goToLevel(i)}
                className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-all
                  ${i === levelIdx ? 'bg-indigo-600 text-white' :
                    cleared.includes(l.id) ? 'bg-green-500 text-white' :
                    'bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-indigo-100 dark:hover:bg-indigo-900'}`}
              >
                {cleared.includes(l.id) ? '✓' : l.id}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 游戏主体 */}
      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-4">

        {/* 关卡标题 */}
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {level.id} / {LEVELS.length}
          </span>
          <h2 className="font-semibold text-lg">{level.title}</h2>
          {cleared.includes(level.id) && <span className="text-green-500 text-sm">✓ 已通关</span>}
        </div>

        {/* 任务描述 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300">
          🎯 {level.desc}
        </div>

        {/* 待匹配文本 */}
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm leading-relaxed text-gray-100 min-h-[80px]">
          {renderHighlighted()}
        </div>

        {/* 输入框 */}
        <div className={`flex items-center gap-2 bg-white dark:bg-gray-900 border-2 ${borderColor} rounded-xl px-4 py-3 transition-colors`}>
          <span className="text-gray-400 font-mono text-lg select-none">/</span>
          <input
            ref={inputRef}
            autoFocus
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="在这里写正则表达式..."
            className="flex-1 bg-transparent font-mono text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400"
            spellCheck={false}
          />
          <span className="text-gray-400 font-mono text-lg select-none">/gm</span>
          {status === 'correct' && <span className="text-green-500 text-xl">✓</span>}
          {status === 'error' && <span className="text-red-500 text-xl">✗</span>}
        </div>

        {/* 错误信息 */}
        {errorMsg && (
          <p className="text-red-500 text-xs font-mono px-1">{errorMsg}</p>
        )}

        {/* 匹配结果统计 */}
        {matches.length > 0 && status !== 'error' && (
          <div className="flex flex-wrap gap-2">
            {matches.map((m, i) => (
              <span key={i} className={`text-xs px-2 py-0.5 rounded font-mono
                ${status === 'correct' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                {JSON.stringify(m)}
              </span>
            ))}
            <span className="text-xs text-gray-400">共 {matches.length} 个匹配</span>
          </div>
        )}

        {/* 通关提示 */}
        {showTip && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 text-sm">
            <p className="font-semibold text-green-700 dark:text-green-400 mb-1">🎉 通关！</p>
            <p className="text-green-600 dark:text-green-300">{level.tip}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            {showHint ? '隐藏提示' : '💡 提示'}
          </button>

          {status === 'correct' && levelIdx < LEVELS.length - 1 && (
            <button
              onClick={nextLevel}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              下一关 →
            </button>
          )}

          {levelIdx > 0 && (
            <button
              onClick={() => goToLevel(levelIdx - 1)}
              className="px-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              ← 上一关
            </button>
          )}
        </div>

        {/* 提示内容 */}
        {showHint && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 text-sm">
            <p className="text-indigo-600 dark:text-indigo-300 font-mono">💡 {level.hint}</p>
          </div>
        )}

        {/* 通关后链接 */}
        {levelIdx === LEVELS.length - 1 && status === 'correct' && (
          <div className="text-center py-6">
            <p className="text-2xl font-bold mb-2">🏆 全部通关！</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">你已经掌握了正则表达式的核心技巧</p>
            <Link
              href="/regex"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              去正则生成器试试 →
            </Link>
          </div>
        )}
      </section>

      <footer className="border-t border-gray-200 dark:border-white/10 py-8 text-center text-gray-400 dark:text-gray-600 text-sm">
        <p>© 2025 Hey Cron · <a href="mailto:hi@heycron.com" className="hover:text-gray-600 dark:hover:text-gray-400">hi@heycron.com</a></p>
      </footer>
    </main>
  )
}
