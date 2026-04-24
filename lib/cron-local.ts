/**
 * 本地 Cron 规则引擎 — 纯代码，0 延迟，无 AI
 */

type CronResult = {
  cron: string
  description: string
  platforms: Record<string, string>
}

function buildPlatforms(cron: string): Record<string, string> {
  return {
    kubernetes: `schedule: "${cron}"`,
    github_actions: `on:\n  schedule:\n    - cron: '${cron}'`,
    jenkins: `triggers {\n  cron('${cron}')\n}`,
    airflow: `schedule='${cron}'`,
    crontab: `${cron} /path/to/script.sh`,
    nodejs: `cron.schedule('${cron}', () => {\n  // your task\n});`,
    python: `from apscheduler.schedulers.blocking import BlockingScheduler\nscheduler = BlockingScheduler()\nscheduler.add_job(job, 'cron', ${cronToApscheduler(cron)})`,
  }
}

function cronToApscheduler(cron: string): string {
  const [min, hour, day, month, dow] = cron.split(' ')
  const parts: string[] = []
  if (min !== '*') parts.push(`minute='${min}'`)
  if (hour !== '*') parts.push(`hour='${hour}'`)
  if (day !== '*') parts.push(`day='${day}'`)
  if (month !== '*') parts.push(`month='${month}'`)
  if (dow !== '*') parts.push(`day_of_week='${dowToApName(dow)}'`)
  return parts.join(', ') || "second='0'"
}

function dowToApName(dow: string): string {
  const map: Record<string, string> = {
    '0': 'sun', '1': 'mon', '2': 'tue', '3': 'wed', '4': 'thu', '5': 'fri', '6': 'sat',
    '0,6': 'sat,sun', '1-5': 'mon-fri',
  }
  return map[dow] ?? dow
}

function ok(cron: string, desc: string): CronResult {
  return { cron, description: desc, platforms: buildPlatforms(cron) }
}

function pad(n: number): string { return String(n).padStart(2, '0') }
function fmt(h: number, m: number): string { return `${pad(h)}:${pad(m)}` }

// ─── 解析时间 ────────────────────────────────────────────────────────────────

function parseHour(s: string): number | null {
  // 凌晨/早上/上午 X 点
  let m = s.match(/凌晨\s*(\d{1,2})/)
  if (m) return parseInt(m[1])

  m = s.match(/(?:早上|早晨|上午|早)\s*(\d{1,2})/)
  if (m) return parseInt(m[1])

  // 下午/晚上 X 点 (自动 +12 如果 < 12)
  m = s.match(/(?:下午|傍晚|晚上|晚|夜间)\s*(\d{1,2})/)
  if (m) { const h = parseInt(m[1]); return h < 12 ? h + 12 : h }

  // 中午 / 正午 / noon
  if (/中午12|正午|noon/i.test(s)) return 12
  if (/中午/.test(s)) return 12

  // 午夜 / 零点 / midnight
  if (/午夜|零点|0\s*点|凌晨0|midnight/i.test(s)) return 0

  // HH:MM 或 HH：MM
  m = s.match(/(\d{1,2})[：:]\s*(\d{2})/)
  if (m) return parseInt(m[1])

  // X am/pm
  m = s.match(/(\d{1,2})\s*am/i)
  if (m) return parseInt(m[1]) % 12
  m = s.match(/(\d{1,2})\s*pm/i)
  if (m) return (parseInt(m[1]) % 12) + 12

  // X 点
  m = s.match(/(\d{1,2})\s*[点時]/)
  if (m) return parseInt(m[1])

  // at X (English, bare number context)
  m = s.match(/\bat\s+(\d{1,2})\b/i)
  if (m) return parseInt(m[1])

  return null
}

function parseMinute(s: string): number {
  // HH:MM
  const m = s.match(/\d{1,2}[：:]\s*(\d{2})/)
  if (m) return parseInt(m[1])
  // X分
  const m2 = s.match(/(\d{1,2})\s*分/)
  if (m2) return parseInt(m2[1])
  return 0
}

// ─── 解析星期 ─────────────────────────────────────────────────────────────────

function parseDow(s: string): string | null {
  const lower = s.toLowerCase()
  if (/周一|星期一|\bmon(day)?\b/.test(lower)) return '1'
  if (/周二|星期二|\btue(sday)?\b/.test(lower)) return '2'
  if (/周三|星期三|\bwed(nesday)?\b/.test(lower)) return '3'
  if (/周四|星期四|\bthu(rsday)?\b/.test(lower)) return '4'
  if (/周五|星期五|\bfri(day)?\b/.test(lower)) return '5'
  if (/周六|星期六|\bsat(urday)?\b/.test(lower)) return '6'
  if (/周日|周天|星期日|星期天|\bsun(day)?\b/.test(lower)) return '0'
  return null
}

const DOW_ZH: Record<string, string> = { '0': '周日', '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六' }
const DOW_EN: Record<string, string> = { '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday' }

// ─── 主解析函数 ───────────────────────────────────────────────────────────────

export function parseCronLocal(input: string): CronResult | null {
  const s = input.trim()
  const isZh = /[\u4e00-\u9fa5]/.test(s)

  // ── 每分钟 ──────────────────────────────────────────────────────────────────
  if (/每\s*分钟|every\s*minute/i.test(s)) {
    return ok('* * * * *', isZh ? '每分钟执行一次' : 'Every minute')
  }

  // ── 每 N 分钟 ───────────────────────────────────────────────────────────────
  const everyMin = s.match(/每\s*(\d+)\s*分钟|every\s*(\d+)\s*min/i)
  if (everyMin) {
    const n = parseInt(everyMin[1] ?? everyMin[2])
    if (n >= 1 && n <= 59)
      return ok(`*/${n} * * * *`, isZh ? `每 ${n} 分钟执行一次` : `Every ${n} minutes`)
  }

  // ── 每小时 ──────────────────────────────────────────────────────────────────
  if (/每\s*(?:个)?小时|every\s*hour\b|hourly/i.test(s)) {
    return ok('0 * * * *', isZh ? '每小时整点执行' : 'Every hour')
  }

  // ── 每 N 小时 ───────────────────────────────────────────────────────────────
  const everyHour = s.match(/每\s*(\d+)\s*小时|every\s*(\d+)\s*h/i)
  if (everyHour) {
    const n = parseInt(everyHour[1] ?? everyHour[2])
    if (n >= 1 && n <= 23)
      return ok(`0 */${n} * * *`, isZh ? `每 ${n} 小时执行一次` : `Every ${n} hours`)
  }

  // ── 每 N 天 ─────────────────────────────────────────────────────────────────
  const everyDay = s.match(/每\s*(\d+)\s*天|every\s*(\d+)\s*days?/i)
  if (everyDay) {
    const n = parseInt(everyDay[1] ?? everyDay[2])
    if (n >= 2 && n <= 31) {
      const h = parseHour(s) ?? 0
      const m = parseMinute(s)
      return ok(`${m} ${h} */${n} * *`, isZh ? `每 ${n} 天 ${fmt(h, m)} 执行` : `Every ${n} days at ${fmt(h, m)}`)
    }
  }

  // ── 工作日 ──────────────────────────────────────────────────────────────────
  if (/工作日|weekdays?|\bmon.*fri\b/i.test(s)) {
    const h = parseHour(s) ?? 9
    const m = parseMinute(s)
    return ok(`${m} ${h} * * 1-5`, isZh ? `工作日 ${fmt(h, m)} 执行` : `Weekdays at ${fmt(h, m)}`)
  }

  // ── 周末 ────────────────────────────────────────────────────────────────────
  if (/周末|weekends?/i.test(s)) {
    const h = parseHour(s) ?? 9
    const m = parseMinute(s)
    return ok(`${m} ${h} * * 0,6`, isZh ? `周末 ${fmt(h, m)} 执行` : `Weekends at ${fmt(h, m)}`)
  }

  // ── 每两周 / biweekly ───────────────────────────────────────────────────────
  if (/每两周|每隔一周|biweekly|every\s*two\s*weeks?|every\s*other\s*week/i.test(s)) {
    const h = parseHour(s) ?? 9
    const m = parseMinute(s)
    return ok(`${m} ${h} */14 * *`, isZh ? `每两周 ${fmt(h, m)} 执行` : `Every two weeks at ${fmt(h, m)}`)
  }

  // ── 每周 X（具体星期几）──────────────────────────────────────────────────────
  const dow = parseDow(s)
  if (dow) {
    const h = parseHour(s) ?? 9
    const m = parseMinute(s)
    const dayName = isZh ? DOW_ZH[dow] : DOW_EN[dow]
    return ok(`${m} ${h} * * ${dow}`, isZh ? `每${dayName} ${fmt(h, m)} 执行` : `Every ${dayName} at ${fmt(h, m)}`)
  }

  // ── 每月最后一天 ──────────────────────────────────────────────────────────────
  if (/每月最后|month.*last|last.*month/i.test(s)) {
    const h = parseHour(s) ?? 0
    const m = parseMinute(s)
    return ok(`${m} ${h} 28-31 * *`, isZh ? `每月最后几天 ${fmt(h, m)} 执行（需业务判断具体日期）` : `Last days of month at ${fmt(h, m)}`)
  }

  // ── 每季度 ──────────────────────────────────────────────────────────────────
  if (/每季度|quarterly|every\s*quarter/i.test(s)) {
    const h = parseHour(s) ?? 0
    const m = parseMinute(s)
    return ok(`${m} ${h} 1 */3 *`, isZh ? `每季度第一天 ${fmt(h, m)} 执行` : `First day of every quarter at ${fmt(h, m)}`)
  }

  // ── 每年 ────────────────────────────────────────────────────────────────────
  if (/每年|annually|yearly|every\s*year/i.test(s)) {
    const h = parseHour(s) ?? 0
    const m = parseMinute(s)
    return ok(`${m} ${h} 1 1 *`, isZh ? `每年 1 月 1 日 ${fmt(h, m)} 执行` : `Every year on Jan 1 at ${fmt(h, m)}`)
  }

  // ── 每月 N 号 ────────────────────────────────────────────────────────────────
  const monthDayN = s.match(/每月\s*(\d{1,2})\s*[号日]|(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s*(?:every|each)\s*month|every\s*month)/i)
  if (monthDayN) {
    const d = parseInt(monthDayN[1] ?? monthDayN[2])
    if (d >= 1 && d <= 31) {
      const h = parseHour(s) ?? 0
      const m = parseMinute(s)
      return ok(`${m} ${h} ${d} * *`, isZh ? `每月 ${d} 号 ${fmt(h, m)} 执行` : `Monthly on day ${d} at ${fmt(h, m)}`)
    }
  }

  // ── 每月1号 / 每月第一天 ─────────────────────────────────────────────────────
  if (/每月(第一[天日]|一[号日]|1[号日])|first\s*(day\s*of|of\s*every|of\s*each)\s*month/i.test(s)) {
    const h = parseHour(s) ?? 0
    const m = parseMinute(s)
    return ok(`${m} ${h} 1 * *`, isZh ? `每月 1 日 ${fmt(h, m)} 执行` : `First day of every month at ${fmt(h, m)}`)
  }

  // ── 每天 / daily / 每日 ──────────────────────────────────────────────────────
  const isDaily = /每天|每日|\bdaily\b|every\s*day/i.test(s)
  const hourVal = parseHour(s)

  if (isDaily || hourVal !== null) {
    // 午夜 / 零点
    if (/午夜|零点|0\s*点|凌晨0|midnight/i.test(s))
      return ok('0 0 * * *', isZh ? '每天凌晨 0:00 执行' : 'Every day at midnight')
    // 正午
    if (/正午|noon/i.test(s) || s.includes('中午12'))
      return ok('0 12 * * *', isZh ? '每天中午 12:00 执行' : 'Every day at noon')

    if (hourVal !== null) {
      const m = parseMinute(s)
      return ok(`${m} ${hourVal} * * *`, isZh ? `每天 ${fmt(hourVal, m)} 执行` : `Every day at ${fmt(hourVal, m)}`)
    }
    // 没有时间，默认凌晨
    return ok('0 0 * * *', isZh ? '每天凌晨执行' : 'Every day at midnight')
  }

  return null // 无法识别
}
