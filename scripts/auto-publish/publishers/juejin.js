/**
 * 掘金发布模块
 * 使用 Cookie 认证的内部 API（先建草稿，再发布）
 */

import { JUEJIN_CATEGORIES } from '../config.js'

const BASE = 'https://api.juejin.cn/content_api/v1'

function headers(cookie) {
  return {
    'Content-Type': 'application/json',
    Cookie: cookie,
    Referer: 'https://juejin.cn/',
    Origin: 'https://juejin.cn',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }
}

export async function publishToJuejin(article) {
  const cookie = process.env.JUEJIN_COOKIE
  if (!cookie) {
    console.log('[掘金] 跳过：未配置 JUEJIN_COOKIE')
    return null
  }

  // 1. 创建草稿
  const draftRes = await fetch(`${BASE}/article_draft/create`, {
    method: 'POST',
    headers: headers(cookie),
    body: JSON.stringify({
      category_id: JUEJIN_CATEGORIES.backend,
      tag_ids: [],
      link_url: '',
      cover_image: '',
      title: article.title,
      brief_content: article.summary ?? '',
      edit_type: 10,       // 10 = Markdown
      html_content: 'deprecated',
      mark_content: article.markdown,
    }),
  })

  const draftData = await draftRes.json()
  if (draftData.err_no !== 0) {
    throw new Error(`掘金草稿创建失败: ${JSON.stringify(draftData)}`)
  }

  const draftId = draftData.data?.id
  if (!draftId) throw new Error('掘金未返回 draft_id')

  // 2. 发布草稿
  const pubRes = await fetch(`${BASE}/article/publish`, {
    method: 'POST',
    headers: headers(cookie),
    body: JSON.stringify({
      draft_id: draftId,
      sync_to_org: false,
      column_ids: [],
    }),
  })

  const pubData = await pubRes.json()
  if (pubData.err_no !== 0) {
    throw new Error(`掘金发布失败: ${JSON.stringify(pubData)}`)
  }

  const articleId = pubData.data?.article_id
  const url = articleId ? `https://juejin.cn/post/${articleId}` : 'https://juejin.cn'
  console.log(`[掘金] ✅ 发布成功: ${url}`)
  return url
}
