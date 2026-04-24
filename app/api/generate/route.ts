import { NextRequest, NextResponse } from 'next/server'
import { parseCronLocal } from '@/lib/cron-local'

export async function POST(req: NextRequest) {
  const { input } = await req.json()

  if (!input || !input.trim()) {
    return NextResponse.json({ error: '请输入描述' }, { status: 400 })
  }

  // ① 本地规则引擎 — 0 延迟
  const local = parseCronLocal(input)
  if (local) {
    return NextResponse.json(local)
  }

  // ② AI 兜底 — 处理复杂/罕见描述
  const prompt = `You are a cron expression expert. Convert the following natural language schedule description into a cron expression and multi-platform configs.

Input: "${input}"

Rules:
- Support both Chinese and English input
- Use standard 5-field cron format (minute hour day month weekday)
- Weekday: 0=Sunday, 1=Monday, ..., 6=Saturday
- Return ONLY raw JSON, no markdown, no explanation

Required JSON structure:
{
  "cron": "0 9 * * 1",
  "description": "每周一早上 9:00 执行",
  "platforms": {
    "kubernetes": "schedule: \\"0 9 * * 1\\"",
    "github_actions": "on:\\n  schedule:\\n    - cron: '0 9 * * 1'",
    "jenkins": "triggers {\\n  cron('0 9 * * 1')\\n}",
    "airflow": "schedule='0 9 * * 1'",
    "crontab": "0 9 * * 1 /path/to/script.sh",
    "nodejs": "cron.schedule('0 9 * * 1', () => {\\n  // your task\\n});",
    "python": "from apscheduler.schedulers.blocking import BlockingScheduler\\nscheduler = BlockingScheduler()\\nscheduler.add_job(job, 'cron', day_of_week='mon', hour=9, minute=0)"
  }
}`

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'AI 服务异常，请稍后重试' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: '解析失败，请重试' }, { status: 500 })
  }
}
