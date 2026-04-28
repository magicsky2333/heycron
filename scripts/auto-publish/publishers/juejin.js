/**
 * 掘金发布模块
 * 使用 Cookie 认证的内部 API（先建草稿，再发布）
 */

import { JUEJIN_CATEGORIES } from '../config.js'

const BASE = 'https://api.juejin.cn/content_api/v1'
const TAG_API = 'https://api.juejin.cn/tag_api/v1'

// 常用标签 ID 备用表（掘金标签 ID 是固定的）
const FALLBACK_TAG_IDS = [
  '6809640407484334093', // Linux
  '6809640382098505742', // 后端
  '6809640407484667912', // 运维
]

function headers(cookie) {
  return {
    'Content-Type': 'application/json',
    Cookie: cookie,
    Referer: 'https://juejin.cn/',
    Origin: 'https://juejin.cn',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }
}

/**
 * 根据标签文字搜索掘金标签 ID
 */
async function resolveTagIds(cookie, tags) {
  const ids = []
  for (const tag of tags.slice(0, 3)) {
    try {
      const res = await fetch(
        `${TAG_API}/query_tag_list?key_word=${encodeURIComponent(tag)}&cursor=0&limit=5`,
        { headers: headers(cookie) }
      )
      const data = await res.json()
      const found = data.data?.[0]
      if (found?.tag_id) ids.push(found.tag_id)
    } catch {
      // 忽略单个标签查找失败
    }
  }
  // 至少要有 1 个标签，否则用备用
  return ids.length > 0 ? ids : FALLBACK_TAG_IDS.slice(0, 1)
}

export async function publishToJuejin(article) {
  const cookie = process.env.JUEJIN_COOKIE
  if (!cookie) {
    console.log('[掘金] 跳过：未配置 JUEJIN_COOKIE')
    return null
  }

  // 0. 查找标签 ID
  const tagIds = await resolveTagIds(cookie, article.tags ?? [])
  console.log(`[掘金] 标签 IDs: ${tagIds.join(', ')}`)

  // 1. 创建草稿
  const draftRes = await fetch(`${BASE}/article_draft/create`, {
    method: 'POST',
    headers: headers(cookie),
    body: JSON.stringify({
      category_id: JUEJIN_CATEGORIES.backend,
      tag_ids: tagIds,
      link_url: '',
      cover_image: '',
      title: article.title,
      brief_content: article.summary ?? '',
      edit_type: 10,
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
