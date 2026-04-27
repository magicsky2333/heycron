/**
 * SegmentFault 发布模块
 * 使用 Cookie 认证
 */

export async function publishToSegmentFault(article) {
  const cookie = process.env.SF_COOKIE
  if (!cookie) {
    console.log('[SegmentFault] 跳过：未配置 SF_COOKIE')
    return null
  }

  // 先获取 CSRF token
  const pageRes = await fetch('https://segmentfault.com/write', {
    headers: {
      Cookie: cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })
  const pageText = await pageRes.text()
  const csrfMatch = pageText.match(/"csrf":"([^"]+)"/) || pageText.match(/csrf['":\s]+['"]([a-f0-9]{32,})/)
  const csrf = csrfMatch?.[1] ?? ''

  const body = new URLSearchParams({
    title: article.title,
    text: article.markdown,
    tags: (article.tags ?? ['linux', 'cron']).slice(0, 5).join(','),
    type: '1',           // 1 = 文章
    status: '1',         // 1 = 发布
    originalUrl: '',
    description: article.summary ?? '',
  })

  const res = await fetch('https://segmentfault.com/api/article', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookie,
      'X-CSRF-Token': csrf,
      Referer: 'https://segmentfault.com/write',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    body: body.toString(),
  })

  const data = await res.json()

  if (data.status !== 0 && !data.data?.url) {
    throw new Error(`SF 发布失败: ${JSON.stringify(data)}`)
  }

  const url = data.data?.url
    ? `https://segmentfault.com${data.data.url}`
    : 'https://segmentfault.com'
  console.log(`[SegmentFault] ✅ 发布成功: ${url}`)
  return url
}
