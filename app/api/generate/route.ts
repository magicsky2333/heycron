import { NextRequest, NextResponse } from 'next/server'
import { parseCronLocal } from '@/lib/cron-local'

export async function POST(req: NextRequest) {
  const { input } = await req.json()

  if (!input || !input.trim()) {
    return NextResponse.json({ error: '请输入描述' }, { status: 400 })
  }

  const result = parseCronLocal(input)
  if (result) {
    return NextResponse.json(result)
  }

  // 无法识别时返回友好提示
  return NextResponse.json(
    {
      error:
        '暂时无法识别该描述，请尝试更具体的表达，例如："每天早上9点"、"每周一凌晨2点"、"每5分钟"、"工作日下午6点"、"每月1号零点"。\n\nCould not parse. Try: "Every day at 9am", "Every Monday at 2am", "Every 5 minutes".',
    },
    { status: 422 }
  )
}
