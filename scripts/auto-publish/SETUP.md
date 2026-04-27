# 自动发布配置说明

## 一、配置 GitHub Secrets

进入 GitHub 仓库 → **Settings → Secrets and variables → Actions → New repository secret**

逐个添加以下变量：

---

### 1. SILICONFLOW_API_KEY（必填）

AI 文章生成密钥。

获取方式：登录 [siliconflow.cn](https://siliconflow.cn) → 右上角头像 → API 密钥

---

### 2. CSDN_COOKIE（选填）

**获取步骤：**
1. Chrome 浏览器登录 [csdn.net](https://csdn.net)
2. 按 F12 → Network 标签
3. 随便刷新一个页面，点击任意请求
4. 在 Request Headers 里找到 `Cookie` 字段
5. 完整复制 Cookie 值粘贴进去

⚠️ Cookie 大约 **30 天**过期，过期需重新获取

---

### 3. JUEJIN_COOKIE（选填）

**获取步骤：**
1. Chrome 浏览器登录 [juejin.cn](https://juejin.cn)
2. 按 F12 → Application → Cookies → `https://juejin.cn`
3. 找到以下几个 Cookie，拼成一行：
   ```
   sessionid=xxx; uid=xxx; passport_auth_status=xxx
   ```
4. 或者在 Network 标签里直接复制整个 Cookie 请求头

⚠️ Cookie 大约 **30 天**过期

---

### 4. SF_COOKIE（选填，SegmentFault）

**获取步骤：**
1. Chrome 浏览器登录 [segmentfault.com](https://segmentfault.com)
2. F12 → Network → 刷新页面 → 点击任意请求
3. 复制 `Cookie` 请求头的完整内容

---

### 5. 微信公众号（选填，需认证服务号）

| Secret 名称 | 说明 |
|---|---|
| `WECHAT_APP_ID` | 公众号的 AppID |
| `WECHAT_APP_SECRET` | 公众号的 AppSecret |
| `WECHAT_THUMB_MEDIA_ID` | 封面图的 media_id（可选） |

**获取方式：**
登录 [mp.weixin.qq.com](https://mp.weixin.qq.com) → 设置与开发 → 基本配置

⚠️ 微信公众号需要**已认证的订阅号或服务号**才能调用发布 API

---

## 二、手动触发测试

配置好 Secrets 后，先用 dry-run 验证：

1. 进入 GitHub 仓库 → **Actions → 每日自动发布文章**
2. 点击 **Run workflow**
3. `dry_run` 填 `true`，点击运行
4. 查看日志确认文章生成成功

确认无误后，再用 `dry_run = false` 做真实发布测试。

---

## 三、自动触发时间

默认每天 **北京时间 09:00** 发布（GitHub Actions cron `0 1 * * *`）。

修改时间：编辑 `.github/workflows/daily-publish.yml` 里的 cron 表达式。

---

## 四、自定义文章关键词

编辑 `scripts/auto-publish/config.js` 的 `KEYWORDS` 数组，按顺序每天循环取一个关键词。

---

## 五、Cookie 过期处理

Cookie 约每 30 天过期。过期后 GitHub Actions 会失败并标红，你会收到邮件通知。
重新获取 Cookie 后去 GitHub Secrets 更新对应的值即可。
