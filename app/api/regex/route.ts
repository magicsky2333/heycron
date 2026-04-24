import { NextRequest, NextResponse } from 'next/server'
import { parseRegexLocal } from '@/lib/regex-local'

export async function POST(req: NextRequest) {
  const { input } = await req.json()

  if (!input || !input.trim()) {
    return NextResponse.json({ error: '请输入描述' }, { status: 400 })
  }

  // ① 本地规则库 — 0 延迟
  const local = parseRegexLocal(input)
  if (local) {
    return NextResponse.json(local)
  }

  // ② AI 兜底 — 处理自定义复杂描述
  const prompt = `You are a regular expression expert. Convert the following natural language description into a regex pattern with explanations and multi-language code examples.

Input: "${input}"

Rules:
- Support both Chinese and English input
- Generate a practical, correct regex pattern
- Return ONLY raw JSON, no markdown

Required JSON structure:
{
  "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
  "flags": "i",
  "description": "匹配标准邮箱地址格式",
  "explanation": [
    { "part": "^", "meaning": "字符串开头" }
  ],
  "examples": {
    "match": ["example1", "example2"],
    "noMatch": ["bad1", "bad2"]
  },
  "code": {
    "javascript": "const regex = /pattern/flags;",
    "python": "import re\\npattern = r'...'",
    "go": "import \\"regexp\\"\\nre := regexp.MustCompile(\`...\`)",
    "java": "Pattern p = Pattern.compile(\\"...\\");"
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
        max_tokens: 700,
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
