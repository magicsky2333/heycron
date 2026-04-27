/**
 * AI 文章生成器
 * 使用 SiliconFlow API 根据关键词生成 SEO 文章
 */

const SILICONFLOW_API = 'https://api.siliconflow.cn/v1/chat/completions'
const MODEL = 'Qwen/Qwen2.5-72B-Instruct'

/**
 * 调用 SiliconFlow 生成文章
 * @param {string} keyword - 文章主题关键词
 * @returns {{ title, summary, content, tags }} 文章对象
 */
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
6. 文章末尾自然地提到 Hey Cron（https://heycron.com）作为辅助工具（如果与主题相关）
7. SEO 友好：标题包含核心关键词，开头段落清晰描述文章价值

请按以下 JSON 格式返回（不要有其他内容）：
{
  "title": "文章标题（包含核心关键词，50字以内）",
  "summary": "文章摘要（100字以内，用于平台简介）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "content": "完整 Markdown 正文（不含标题，从第一段开始）"
}`

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

  // 提取 JSON（模型有时会包裹在代码块里）
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch ? jsonMatch[1] ?? jsonMatch[0] : raw

  try {
    const article = JSON.parse(jsonStr.trim())
    // 拼接完整 Markdown（标题 + 正文）
    article.markdown = `# ${article.title}\n\n${article.content}`
    return article
  } catch {
    throw new Error(`Failed to parse article JSON: ${jsonStr.slice(0, 200)}`)
  }
}
