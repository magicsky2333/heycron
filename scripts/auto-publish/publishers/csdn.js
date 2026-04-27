/**
 * CSDN 发布模块
 * 使用 Cookie 认证的非官方 API
 */

const API = 'https://bizapi.csdn.net/blog-console-api/v3/mdeditor/saveArticle'

export async function publishToCsdn(article) {
  const cookie = process.env.CSDN_COOKIE
  if (!cookie) {
    console.log('[CSDN] 跳过：未配置 CSDN_COOKIE')
    return null
  }

  const body = {
    title: article.title,
    markdowncontent: article.markdown,
    content: article.markdown, // CSDN 同时接受 markdown
    tags: article.tags?.slice(0, 5).join(',') ?? 'cron,linux,开发工具',
    categories: '',
    type: 'original',
    status: 0,          // 0=草稿 1=发布，先存草稿再发布
    description: article.summary ?? '',
    columns: [],
    cover_images: [],
    cover_type: 0,
    is_new_article: true,
    authorized_status: false,
    check_original: false,
    vote_id: 0,
    resource_url: '',
    original_link: '',
    read_type: 0,       // 0=公开
    level: '',
    scheduled_time: 0,
    is_markdown: true,
  }

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Cookie: cookie,
      Referer: 'https://editor.csdn.net/',
      Origin: 'https://editor.csdn.net',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok || data.code !== 200) {
    throw new Error(`CSDN 发布失败: ${JSON.stringify(data)}`)
  }

  const articleId = data.data?.article_id
  if (!articleId) throw new Error('CSDN 未返回 article_id')

  // 发布（status 改为 1）
  const pubRes = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Cookie: cookie,
      Referer: 'https://editor.csdn.net/',
      Origin: 'https://editor.csdn.net',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: JSON.stringify({ ...body, id: articleId, is_new_article: false, status: 1 }),
  })

  const pubData = await pubRes.json()
  if (pubData.code !== 200) {
    throw new Error(`CSDN 发布状态更新失败: ${JSON.stringify(pubData)}`)
  }

  const url = `https://blog.csdn.net/article/details/${articleId}`
  console.log(`[CSDN] ✅ 发布成功: ${url}`)
  return url
}
