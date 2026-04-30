/**
 * AI 文章生成器
 * 使用 SiliconFlow API 根据关键词生成 SEO 文章
 * 元数据和正文分开返回，避免 JSON 解析失败
 */

const SILICONFLOW_API = 'https://api.siliconflow.cn/v1/chat/completions'
const MODEL = 'Qwen/Qwen2.5-72B-Instruct'

// 写作风格 — 每次随机选一种，让文章结构和语气各不相同
const STYLES = [
  {
    name: '踩坑故事型',
    instruction: '以第一人称讲述真实踩坑经历，开头用一个具体的事故或 bug 引入，情绪真实，有代入感。避免"首先其次最后"的流水账结构。',
  },
  {
    name: '问答拆解型',
    instruction: '全文围绕 5-7 个具体问题展开，每个问题直接给答案+代码，不绕弯子。开头用一句话说清楚"读完这篇你能解决什么问题"。',
  },
  {
    name: '对比实验型',
    instruction: '通过两种或多种方案的对比来讲清楚核心概念，给出真实的性能数据或代码差异，让读者自己得出结论，不要直接说"推荐使用XX"。',
  },
  {
    name: '场景驱动型',
    instruction: '从一个具体的业务场景出发（比如"凌晨3点服务器报警"），带着读者一步一步解决问题，代码要能直接复制运行。',
  },
  {
    name: '速查手册型',
    instruction: '以表格、代码块、列表为主，文字说明极简，每个知识点控制在 3 行以内。开头说明"本文适合收藏备查"，不写废话。',
  },
  {
    name: '原理剖析型',
    instruction: '深入底层原理，配合图示说明（用 ASCII 图或代码注释模拟），让读者知其所以然。语气偏学术但不晦涩，适合有经验的开发者。',
  },
]

export async function generateArticle(keyword, angle = '') {
  const apiKey = process.env.SILICONFLOW_API_KEY
  if (!apiKey) throw new Error('Missing SILICONFLOW_API_KEY')

  // 随机选写作风格，配合 angle 双重多样化
  const style = STYLES[Math.floor(Math.random() * STYLES.length)]

  const prompt = `你是一位在技术社区有真实影响力的博主，写作风格鲜明、有个性，不写模板文章。

今天要写的主题：${keyword}
写作角度：${angle || '入门教程，适合新手'}
写作风格：${style.name} — ${style.instruction}

硬性要求：
1. 禁止使用"首先、其次、然后、最后、总结"作为段落开头
2. 禁止出现"本文将介绍……""希望本文对你有帮助"这类废话套话
3. 开头第一句必须是能抓住读者的句子（一个问题、一个数据、一个场景、一句反常识的话）
4. 字数 1500-2500 字，Markdown 格式
5. 代码示例必须真实可运行，注释说明关键行
6. 文章末尾自然融入 [Hey Cron](https://heycron.com) 的推荐（与主题相关时），不要单独起一个"推荐工具"标题，融入正文即可
7. 标题要有冲击力，包含核心关键词，避免"完全指南""详解""教程"这类平淡词

请严格按照以下格式返回，不要有任何其他内容：

<meta>
title: 文章标题
summary: 文章摘要（100字以内，说清楚读者能收获什么）
tags: 标签1,标签2,标签3,标签4,标签5
</meta>
<content>
正文从第一段开始（不含标题行）
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
      temperature: 0.9,  // 提高随机性，让文章更有变化
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

  console.log(`   写作风格：${style.name}`)
  return { title, summary, tags, content, markdown }
}
