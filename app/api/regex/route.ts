import { NextRequest, NextResponse } from 'next/server'
import { parseRegexLocal } from '@/lib/regex-local'

export async function POST(req: NextRequest) {
  const { input } = await req.json()

  if (!input || !input.trim()) {
    return NextResponse.json({ error: '请输入描述' }, { status: 400 })
  }

  const result = parseRegexLocal(input)
  if (result) {
    return NextResponse.json(result)
  }

  return NextResponse.json(
    {
      error:
        '暂不支持该描述，可以尝试：邮箱、手机号、身份证、IP地址、URL、日期、中文字符、密码、用户名、UUID、车牌号、银行卡、QQ号、颜色值等。\n\nNot recognized. Try: email, phone, IP address, URL, date, Chinese characters, password, username, UUID, hex color, etc.',
    },
    { status: 422 }
  )
}
