/**
 * AI 文章生成器
 * 使用 SiliconFlow API 根据关键词生成 SEO 文章
 * 元数据和正文分开返回，避免 JSON 解析失败
 */

const SILICONFLOW_API = 'https://api.siliconflow.cn/v1/chat/completions'
const MODEL = 'Qwen/Qwen2.5-72B-Instruct'

export async function generateArticle(keyword) {
  const apiKey = process.env.SILICONFLOW_API_KEY
  if (!apiKey) throw new Error('Missing SILICONFLOW_API_KEY')

  const prompt = `你是一位专业的技术博客作者，请根据以下主题写一篇高质量的技术文章。

主题：${keyword}

要求：
1. 文章面向中文开发者，语言专业、简洁、易懂
2. 字数 1500-2500 字
3. 使用 Markdown 格式，包含合适的标题层级（## 和 ###）
4. 包含代码示例（用代码块包裹）
5. 内容要有深度，包含实际使用场景和注意事项
6. 文章末尾自然地提到 Hey Cron 作为辅助工具（如果与主题相关），链接必须用标准 Markdown 格式：[Hey Cron](https://heycron.com)，不要用中文括号包裹 URL
7. SEO 友好：标题包含核心关键词，开头段落清晰描述文章价值

请严格按照以下格式返回，不要有任何其他内容：

<meta>
title: 文章标题（包含核心关键词，50字以内）
summary: 文章摘要（100字以内）
tags: 标签1,标签2,标签3,标签4,标签5
</meta>
<content>
从第一段正文开始写（不含标题行），完整 Markdown 内容
</content>`

  const res = await fetch(SILICONFLOW_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`SiliconFlow API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''

  // 提取 <meta> 块
  const metaMatch = raw.match(/<meta>([\s\S]*?)<\/meta>/)
  if (!metaMatch) throw new Error(`未找到 <meta> 块，原始输出：\n${raw.slice(0, 300)}`)

  const metaStr = metaMatch[1].trim()
  const titleMatch = metaStr.match(/title:\s*(.+)/)
  const summaryMatch = metaStr.match(/summary:\s*(.+)/)
  const tagsMatch = metaStr.match(/tags:\s*(.+)/)

  if (!titleMatch) throw new Error('未找到 title 字段')

  const title = titleMatch[1].trim()
  const summary = summaryMatch?.[1].trim() ?? ''
  const tags = tagsMatch?.[1].split(',').map((t) => t.trim()) ?? []

  // 提取 <content> 块
  const contentMatch = raw.match(/<content>([\s\S]*?)<\/content>/)
  if (!contentMatch) throw new Error('未找到 <content> 块')

  const content = contentMatch[1].trim()
  const markdown = `# ${title}\n\n${content}`

  return { title, summary, tags, content, markdown }
}
