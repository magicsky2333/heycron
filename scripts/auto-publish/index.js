/**
 * 自动发布主入口
 * 每天执行：生成文章 → 发布到所有平台
 *
 * 用法：
 *   node scripts/auto-publish/index.js
 *   node scripts/auto-publish/index.js --keyword "Linux crontab 使用教程"
 *   node scripts/auto-publish/index.js --dry-run   （只生成不发布）
 */

import { generateArticle } from './generate.js'
import { publishToCsdn } from './publishers/csdn.js'
import { publishToJuejin } from './publishers/juejin.js'
import { publishToSegmentFault } from './publishers/segmentfault.js'
import { publishToWechat } from './publishers/wechat.js'
import { KEYWORDS } from './config.js'

// ─── 参数解析 ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const kwArg = args.find((a) => a.startsWith('--keyword='))?.slice('--keyword='.length)
  ?? (args[args.indexOf('--keyword') + 1] !== '--dry-run'
      ? args[args.indexOf('--keyword') + 1]
      : null)

// ─── 选择关键词 ─────────────────────────────────────────────────────────────
function pickKeyword() {
  if (kwArg) return kwArg
  // 按日期循环选取，保证每天不重复
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return KEYWORDS[dayOfYear % KEYWORDS.length]
}

// ─── 主流程 ─────────────────────────────────────────────────────────────────
async function main() {
  const keyword = pickKeyword()
  console.log(`\n🚀 今日关键词：${keyword}`)
  console.log('─'.repeat(50))

  // 1. 生成文章
  console.log('📝 正在生成文章...')
  let article
  try {
    article = await generateArticle(keyword)
    console.log(`✅ 文章生成完成：《${article.title}》`)
    console.log(`   摘要：${article.summary}`)
    console.log(`   标签：${article.tags?.join(', ')}`)
    console.log(`   字数：约 ${article.markdown.length} 字`)
  } catch (err) {
    console.error(`❌ 文章生成失败: ${err.message}`)
    process.exit(1)
  }

  if (dryRun) {
    console.log('\n[dry-run] 以下是生成的文章内容（前 500 字）：')
    console.log(article.markdown.slice(0, 500))
    console.log('\n[dry-run] 跳过发布。')
    return
  }

  // 2. 并发发布到所有平台
  console.log('\n📤 开始发布到各平台...')
  const results = await Promise.allSettled([
    publishToCsdn(article),
    publishToJuejin(article),
    publishToSegmentFault(article),
    publishToWechat(article),
  ])

  const platforms = ['CSDN', '掘金', 'SegmentFault', '微信公众号']
  const summary = []

  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      summary.push(`✅ ${platforms[i]}: ${r.value}`)
    } else if (r.status === 'rejected') {
      summary.push(`❌ ${platforms[i]}: ${r.reason?.message ?? r.reason}`)
    } else {
      summary.push(`⏭  ${platforms[i]}: 已跳过（未配置）`)
    }
  })

  console.log('\n─── 发布结果 ───')
  summary.forEach((s) => console.log(s))
  console.log('─'.repeat(50))

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length > 0) {
    process.exit(1) // GitHub Actions 标记为失败
  }
}

main()
