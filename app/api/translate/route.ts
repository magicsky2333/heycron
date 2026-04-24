import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, direction } = await req.json()

  if (!text || !text.trim()) {
    return new Response(JSON.stringify({ error: '请输入要翻译的文本' }), { status: 400 })
  }

  const prompt =
    direction === 'zh2en'
      ? `将以下中文翻译成自然流畅的英文，只输出翻译结果，不要解释：\n\n${text}`
      : `将以下英文翻译成自然流畅的中文，只输出翻译结果，不要解释：\n\n${text}`

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
      stream: true,
    }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'AI 服务异常，请稍后重试' }), { status: 500 })
  }

  // 直接透传流
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
