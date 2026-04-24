/**
 * 本地 Cron 规则引擎 — 纯代码，0 延迟
 * 覆盖 90%+ 的日常使用场景
 * 返回 null 表示无法识别，调用方再走 AI 兜底
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
  if (min !== '*') parts.push(`minute=${min.replace('*/', 'step=')}`)
  if (hour !== '*') parts.push(`hour=${hour.replace('*/', '')}`)
  if (day !== '*') parts.push(`day=${day}`)
  if (month !== '*') parts.push(`month=${month}`)
  if (dow !== '*') parts.push(`day_of_week='${dowToName(dow)}'`)
  return parts.join(', ') || 'minute="*"'
}

function dowToName(dow: string): string {
  const map: Record<string, string> = { '0': 'sun', '1': 'mon', '2': 'tue', '3': 'wed', '4': 'thu', '5': 'fri', '6': 'sat' }
  return map[dow] ?? dow
}

function ok(cron: string, desc: string): CronResult {
  return { cron, description: desc, platforms: buildPlatforms(cron) }
}

// 解析"小时"，支持中英文，如 "9点" / "9am" / "21:00" / "9"
function parseHour(s: string): number | null {
  // "9点" / "9:00" / "21:00"
  let m = s.match(/(\d{1,2})[点:：]/)
  if (m) return parseInt(m[1])
  // "9am" / "9 am"
  m = s.match(/(\d{1,2})\s*am/i)
  if (m) return parseInt(m[1]) % 12
  // "9pm" / "9 pm"
  m = s.match(/(\d{1,2})\s*pm/i)
  if (m) return (parseInt(m[1]) % 12) + 12
  // "午夜" / "零点" / "midnight"
  if (/午夜|零点|0点|凌晨0|midnight/i.test(s)) return 0
  // "正午" / "noon" / "中午12"
  if (/正午|noon|中午12/i.test(s)) return 12
  // 凌晨 X 点
  m = s.match(/凌晨\s*(\d{1,2})/)
  if (m) return parseInt(m[1])
  // 上午/早上/早 X 点
  m = s.match(/(?:上午|早上|早晨|早)\s*(\d{1,2})/)
  if (m) return parseInt(m[1])
  // 下午/晚上 X 点
  m = s.match(/(?:下午|傍晚|晚上|晚)\s*(\d{1,2})/)
  if (m) {
    const h = parseInt(m[1])
    return h < 12 ? h + 12 : h
  }
  // bare number
  m = s.match(/\b(\d{1,2})\b/)
  if (m) return parseInt(m[1])
  return null
}

// 解析"分钟"
function parseMinute(s: string): number {
  const m = s.match(/(\d{1,2})[分:]/)
  if (m) return parseInt(m[1])
  return 0
}

// 解析"每 N 分钟 / 小时"中的 N
function parseInterval(s: string, unit: '分钟' | '小时' | 'min' | 'hour'): number | null {
  const patterns = [
    /每\s*(\d+)\s*(?:分钟|小时)/,
    /every\s*(\d+)\s*(?:minutes?|hours?)/i,
    /(\d+)\s*(?:分钟|小时|minutes?|hours?)\s*(?:执行一次|一次|run|once)?/i,
  ]
  for (const p of patterns) {
    const m = s.match(p)
    if (m) return parseInt(m[1])
  }
  return null
}

// 星期几映射
function parseDow(s: string): string | null {
  const lower = s.toLowerCase()
  if (/周一|星期一|monday|mon\b/.test(lower)) return '1'
  if (/周二|星期二|tuesday|tue\b/.test(lower)) return '2'
  if (/周三|星期三|wednesday|wed\b/.test(lower)) return '3'
  if (/周四|星期四|thursday|thu\b/.test(lower)) return '4'
  if (/周五|星期五|friday|fri\b/.test(lower)) return '5'
  if (/周六|星期六|saturday|sat\b/.test(lower)) return '6'
  if (/周日|周天|星期日|星期天|sunday|sun\b/.test(lower)) return '0'
  return null
}

function dowName(n: string, zh: boolean): string {
  const zh_map: Record<string, string> = { '0': '周日', '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六' }
  const en_map: Record<string, string> = { '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday' }
  return zh ? zh_map[n] : en_map[n]
}

export function parseCronLocal(input: string): CronResult | null {
  const s = input.trim()
  const isZh = /[\u4e00-\u9fa5]/.test(s)

  // ── 每分钟 ──
  if (/每分钟|every\s*minute/i.test(s)) {
    return ok('* * * * *', isZh ? '每分钟执行一次' : 'Every minute')
  }

  // ── 每 N 分钟 ──
  const everyMin = s.match(/每\s*(\d+)\s*分钟|every\s*(\d+)\s*minutes?/i)
  if (everyMin) {
    const n = parseInt(everyMin[1] ?? everyMin[2])
    if (n > 0 && n < 60) {
      return ok(`*/${n} * * * *`, isZh ? `每 ${n} 分钟执行一次` : `Every ${n} minutes`)
    }
  }

  // ── 每小时 ──
  if (/每小时|每个小时|hourly|every\s*hour\b/i.test(s)) {
    return ok('0 * * * *', isZh ? '每小时整点执行' : 'Every hour')
  }

  // ── 每 N 小时 ──
  const everyHour = s.match(/每\s*(\d+)\s*小时|every\s*(\d+)\s*hours?/i)
  if (everyHour) {
    const n = parseInt(everyHour[1] ?? everyHour[2])
    if (n > 0 && n < 24) {
      return ok(`0 */${n} * * *`, isZh ? `每 ${n} 小时执行一次` : `Every ${n} hours`)
    }
  }

  // ── 每天 / 每日 + 时间 ──
  const isDaily = /每天|每日|daily|every\s*day/i.test(s)
  const isNoon = /正午|noon|中午12/.test(s)
  const isMidnight = /午夜|零点|0点|凌晨0|midnight/.test(s)

  if (isDaily || isMidnight || isNoon) {
    if (isMidnight) return ok('0 0 * * *', isZh ? '每天凌晨 0 点执行' : 'Every day at midnight')
    if (isNoon) return ok('0 12 * * *', isZh ? '每天中午 12 点执行' : 'Every day at noon')
    if (isDaily) {
      const h = parseHour(s)
      const m = parseMinute(s)
      if (h !== null) {
        return ok(`${m} ${h} * * *`, isZh ? `每天 ${h}:${String(m).padStart(2, '0')} 执行` : `Every day at ${h}:${String(m).padStart(2, '0')}`)
      }
      return ok('0 0 * * *', isZh ? '每天凌晨执行' : 'Every day at midnight')
    }
  }

  // ── 工作日 / weekdays ──
  const isWeekday = /工作日|weekdays?|monday.*friday|mon.*fri/i.test(s)
  if (isWeekday) {
    const h = parseHour(s) ?? 9
    const m = parseMinute(s)
    return ok(`${m} ${h} * * 1-5`, isZh ? `工作日 ${h}:${String(m).padStart(2, '0')} 执行` : `Weekdays at ${h}:${String(m).padStart(2, '0')}`)
  }

  // ── 周末 / weekends ──
  const isWeekend = /周末|weekend/i.test(s)
  if (isWeekend) {
    const h = parseHour(s) ?? 9
    const m = parseMinute(s)
    return ok(`${m} ${h} * * 0,6`, isZh ? `周末 ${h}:${String(m).padStart(2, '0')} 执行` : `Weekends at ${h}:${String(m).padStart(2, '0')}`)
  }

  // ── 每周 X + 时间 ──
  const dow = parseDow(s)
  if (dow) {
    const h = parseHour(s) ?? 9
    const m = parseMinute(s)
    const dayName = dowName(dow, isZh)
    return ok(`${m} ${h} * * ${dow}`, isZh ? `每${dayName} ${h}:${String(m).padStart(2, '0')} 执行` : `Every ${dayName} at ${h}:${String(m).padStart(2, '0')}`)
  }

  // ── 每月 N 号 + 时间 ──
  const monthDay = s.match(/每月\s*(\d{1,2})\s*[号日]|(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s*every\s*month|every\s*month)/i)
  if (monthDay) {
    const d = parseInt(monthDay[1] ?? monthDay[2])
    const h = parseHour(s) ?? 0
    const m = parseMinute(s)
    return ok(`${m} ${h} ${d} * *`, isZh ? `每月 ${d} 号 ${h}:${String(m).padStart(2, '0')} 执行` : `Monthly on day ${d} at ${h}:${String(m).padStart(2, '0')}`)
  }

  // ── 每月1号 / first of month ──
  if (/每月(第一天|1[号日]|一号)|first\s*(day\s*of\s*(the\s*)?month|of\s*every\s*month)/i.test(s)) {
    const h = parseHour(s) ?? 0
    const m = parseMinute(s)
    return ok(`${m} ${h} 1 * *`, isZh ? `每月 1 号 ${h}:${String(m).padStart(2, '0')} 执行` : `First day of every month at ${h}:${String(m).padStart(2, '0')}`)
  }

  // ── 每年/每年1月1日 ──
  if (/每年|annually|every\s*year/i.test(s)) {
    return ok('0 0 1 1 *', isZh ? '每年 1 月 1 日凌晨执行' : 'Every year on January 1st')
  }

  // ── 只有时间，没有频率词（默认"每天"） ──
  // e.g. "早上9点" / "9am" / "21:00"
  const hourOnly = parseHour(s)
  if (hourOnly !== null && !/分钟|小时|minute|hour/i.test(s)) {
    const m = parseMinute(s)
    return ok(`${m} ${hourOnly} * * *`, isZh ? `每天 ${hourOnly}:${String(m).padStart(2, '0')} 执行` : `Every day at ${hourOnly}:${String(m).padStart(2, '0')}`)
  }

  return null // 无法识别，走 AI 兜底
}
