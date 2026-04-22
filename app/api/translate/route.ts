import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, direction } = await req.json()

  if (!text || !text.trim()) {
    return NextResponse.json({ error: '请输入要翻译的文本' }, { status: 400 })
  }

  const prompt =
    direction === 'zh2en'
      ? `将以下中文翻译成自然流畅的英文，只输出翻译结果，不要解释：\n\n${text}`
      : `将以下英文翻译成自然流畅的中文，只输出翻译结果，不要解释：\n\n${text}`

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'AI 服务异常，请稍后重试' }, { status: 500 })
    }

    const data = await response.json()
    const result = data.choices[0].message.content.trim()
    return NextResponse.json({ result })
  } catch {
    return NextResponse.json({ error: '翻译失败，请重试' }, { status: 500 })
  }
}
