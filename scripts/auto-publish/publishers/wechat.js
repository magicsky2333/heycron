/**
 * 微信公众号发布模块
 * 使用官方 API（需要已认证的服务号 / 订阅号）
 * 流程：获取 access_token → 上传草稿 → 发布
 */

const WX_BASE = 'https://api.weixin.qq.com/cgi-bin'

async function getAccessToken() {
  const appId = process.env.WECHAT_APP_ID
  const appSecret = process.env.WECHAT_APP_SECRET
  if (!appId || !appSecret) return null

  const res = await fetch(
    `${WX_BASE}/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  )
  const data = await res.json()
  if (!data.access_token) throw new Error(`微信 access_token 获取失败: ${JSON.stringify(data)}`)
  return data.access_token
}

/**
 * 将 Markdown 转为简单 HTML（微信只支持 HTML 正文）
 */
function markdownToWechatHtml(md) {
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')
    .replace(/<p><\/p>/g, '')
}

export async function publishToWechat(article) {
  const token = await getAccessToken()
  if (!token) {
    console.log('[微信] 跳过：未配置 WECHAT_APP_ID / WECHAT_APP_SECRET')
    return null
  }

  const htmlContent = markdownToWechatHtml(article.markdown)

  // 1. 新增草稿
  const draftRes = await fetch(`${WX_BASE}/draft/add?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      articles: [
        {
          title: article.title,
          author: 'Hey Cron',
          digest: article.summary ?? '',
          content: htmlContent,
          content_source_url: 'https://heycron.com',
          thumb_media_id: process.env.WECHAT_THUMB_MEDIA_ID ?? '', // 封面图 media_id（可选）
          need_open_comment: 1,
          only_fans_can_comment: 0,
        },
      ],
    }),
  })

  const draftData = await draftRes.json()
  if (!draftData.media_id) {
    throw new Error(`微信草稿创建失败: ${JSON.stringify(draftData)}`)
  }

  // 2. 发布草稿（freepublish）
  const pubRes = await fetch(`${WX_BASE}/freepublish/submit?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_id: draftData.media_id }),
  })

  const pubData = await pubRes.json()
  if (pubData.errcode && pubData.errcode !== 0) {
    throw new Error(`微信发布失败: ${JSON.stringify(pubData)}`)
  }

  console.log(`[微信] ✅ 已提交发布，publish_id: ${pubData.publish_id}`)
  return `https://mp.weixin.qq.com (publish_id: ${pubData.publish_id})`
}
