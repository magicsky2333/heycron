/**
 * CSDN 发布模块
 * 使用 Cookie + HMAC-SHA256 签名认证
 */

import crypto from 'crypto'

const API_PATH = '/blog-console-api/v3/mdeditor/saveArticle'
const API = `https://bizapi.csdn.net${API_PATH}`
const APP_KEY = '203803574'
const APP_SECRET = '9znpamsyl2c7cdrr9sas0le9vbc3r6ba'

function buildHeaders(cookie) {
  const timestamp = String(Date.now())
  const nonce = crypto.randomUUID()

  // CSDN HMAC-SHA256 签名
  const stringToSign = [
    'POST',
    'application/json',
    '',
    'application/json;charset=UTF-8',
    '',
    `x-ca-key:${APP_KEY}`,
    `x-ca-nonce:${nonce}`,
    `x-ca-timestamp:${timestamp}`,
    API_PATH,
  ].join('\n')

  const signature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(stringToSign)
    .digest('base64')

  return {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json',
    Cookie: cookie,
    'X-Ca-Key': APP_KEY,
    'X-Ca-Nonce': nonce,
    'X-Ca-Timestamp': timestamp,
    'X-Ca-Signature-Headers': 'x-ca-key,x-ca-nonce,x-ca-timestamp',
    'X-Ca-Signature': signature,
    Referer: 'https://editor.csdn.net/',
    Origin: 'https://editor.csdn.net',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }
}

export async function publishToCsdn(article) {
  const cookie = process.env.CSDN_COOKIE
  if (!cookie) {
    console.log('[CSDN] 跳过：未配置 CSDN_COOKIE')
    return null
  }

  const body = {
    title: article.title,
    markdowncontent: article.markdown,
    content: article.markdown,
    tags: article.tags?.slice(0, 5).join(',') ?? 'cron,linux,开发工具',
    categories: '',
    type: 'original',
    status: 0,
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
    read_type: 0,
    level: '',
    scheduled_time: 0,
    is_markdown: true,
  }

  // 1. 保存草稿
  const res = await fetch(API, {
    method: 'POST',
    headers: buildHeaders(cookie),
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok || data.code !== 200) {
    throw new Error(`CSDN 发布失败: ${JSON.stringify(data)}`)
  }

  const articleId = data.data?.article_id
  if (!articleId) throw new Error('CSDN 未返回 article_id')

  // 2. 发布（status 改为 1）
  const pubRes = await fetch(API, {
    method: 'POST',
    headers: buildHeaders(cookie),
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
