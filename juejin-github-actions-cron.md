# GitHub Actions 定时任务完整指南：schedule 触发器从入门到生产

GitHub Actions 是目前最流行的 CI/CD 工具之一，除了代码推送触发之外，它还支持 **定时触发（schedule）**，也就是用 Cron 表达式来控制 workflow 的执行时间。

本文覆盖 schedule 触发器的所有用法、常见坑和生产最佳实践。

---

## 一、基础语法

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'   # 每周一 UTC 9:00
```

Cron 表达式 5 个字段：

```
┌───────────── 分钟 (0-59)
│ ┌───────────── 小时 (0-23)
│ │ ┌───────────── 日 (1-31)
│ │ │ ┌───────────── 月 (1-12)
│ │ │ │ ┌───────────── 星期 (0-6，0=周日)
│ │ │ │ │
* * * * *
```

> 💡 不想手写 Cron 表达式？用 [Hey Cron](https://www.heycron.com) 输入中文描述直接生成，例如输入"每周一早上9点"自动生成 `0 9 * * 1`，同时输出 GitHub Actions 格式。

常用示例：

| 表达式 | 含义 |
|--------|------|
| `0 9 * * 1` | 每周一 UTC 9:00 |
| `0 0 * * *` | 每天 UTC 0:00 |
| `*/30 * * * *` | 每 30 分钟（最小间隔） |
| `0 9 * * 1-5` | 工作日每天 UTC 9:00 |
| `0 0 1 * *` | 每月 1 号 UTC 0:00 |

---

## 二、最小可用示例

```yaml
name: Weekly Report

on:
  schedule:
    - cron: '0 9 * * 1'  # 每周一 UTC 9:00

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run report script
        run: python scripts/generate_report.py
```

---

## 三、最常踩的坑

### 坑 1：时区是 UTC，不是北京时间

GitHub Actions 的 schedule **只支持 UTC 时间**，没有时区设置选项。

北京时间 = UTC + 8，换算方法：

```
想要北京时间执行的时间 - 8 = 填入 cron 的小时数
```

示例：

| 想要的北京时间 | 填入 cron |
|-------------|----------|
| 每天早上 9:00 | `0 1 * * *`（UTC 1:00）|
| 每天下午 18:00 | `0 10 * * *`（UTC 10:00）|
| 每天凌晨 0:00 | `0 16 * * *`（UTC 前一天 16:00）|

### 坑 2：最小间隔是 5 分钟

GitHub Actions 不允许 schedule 间隔小于 5 分钟，`*/1 * * * *` 这种写法会被忽略或报错。

```yaml
# ❌ 不支持，最小间隔 5 分钟
- cron: '* * * * *'

# ✅ 最短间隔
- cron: '*/5 * * * *'
```

### 坑 3：仓库不活跃会被自动禁用

GitHub 官方规定：**如果仓库 60 天内没有任何活动，schedule 触发器会被自动禁用。**

解决方案：定期 push 代码，或者在 workflow 本身里提交一次空 commit 保持活跃。

### 坑 4：高负载时存在延迟

GitHub Actions 的 schedule 不是精确定时，高峰期可能延迟 **15-30 分钟**甚至更长。对时间精度要求高的任务不适合用 GitHub Actions schedule。

---

## 四、多个 cron 表达式

一个 workflow 可以设置多个 schedule，任意一个触发时都会执行：

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'   # 每周一 UTC 9:00
    - cron: '0 9 * * 4'   # 每周四 UTC 9:00
```

---

## 五、同时支持手动触发

生产中推荐加上 `workflow_dispatch`，这样可以在 GitHub UI 上手动触发，方便测试和紧急执行：

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'
  workflow_dispatch:       # 加上这行，允许手动触发
```

加了之后在 Actions 页面会出现 **Run workflow** 按钮。

---

## 六、判断是定时触发还是手动触发

有时需要在 workflow 内部区分触发来源：

```yaml
steps:
  - name: Check trigger
    run: |
      if [ "${{ github.event_name }}" = "schedule" ]; then
        echo "定时触发"
      else
        echo "手动触发"
      fi
```

---

## 七、实际使用场景

### 场景 1：定时数据同步

```yaml
name: Daily Data Sync

on:
  schedule:
    - cron: '0 1 * * *'  # 北京时间每天早上 9:00
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run sync
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          API_KEY: ${{ secrets.API_KEY }}
        run: python scripts/sync.py
```

### 场景 2：定时清理过期数据

```yaml
name: Cleanup Old Records

on:
  schedule:
    - cron: '0 16 * * *'  # 北京时间每天凌晨 0:00

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Cleanup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          node scripts/cleanup.js --days=30
```

### 场景 3：定时健康检查

```yaml
name: Health Check

on:
  schedule:
    - cron: '*/10 * * * *'  # 每 10 分钟

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check API health
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health)
          if [ $STATUS -ne 200 ]; then
            echo "Health check failed with status: $STATUS"
            exit 1
          fi
          echo "Health check passed"
```

### 场景 4：定时发送周报

```yaml
name: Weekly Summary

on:
  schedule:
    - cron: '0 1 * * 1'  # 北京时间每周一早上 9:00
  workflow_dispatch:

jobs:
  summary:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate and send summary
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        run: node scripts/weekly-summary.js
```

---

## 八、调试技巧

### 技巧 1：先用 push 触发测试

写好 workflow 之后，先加一个 push 触发来快速验证逻辑，确认没问题再切回 schedule：

```yaml
on:
  push:
    branches: [main]   # 测试阶段先用 push 触发
  # schedule:
  #   - cron: '0 9 * * 1'
```

### 技巧 2：查看下次执行时间

可以用 [crontab.guru](https://crontab.guru) 或 [Hey Cron](https://www.heycron.com) 验证表达式，确认下次执行时间是否符合预期。

### 技巧 3：查看历史执行记录

Actions → 选择 workflow → 可以看到每次执行的时间、耗时和日志。

---

## 九、安全注意事项

- **不要在 cron 表达式或 run 命令里硬编码密钥**，统一用 `${{ secrets.XXX }}` 引用
- schedule 触发的 workflow 默认使用 **repository 权限**，注意控制 `permissions`
- 对外部 API 调用要加超时和错误处理，避免 workflow 卡死

---

## 总结

| 要点 | 说明 |
|------|------|
| 时区 | 只支持 UTC，北京时间需减 8 小时 |
| 最小间隔 | 5 分钟 |
| 仓库不活跃 | 60 天没活动自动禁用 |
| 延迟 | 高峰期可能延迟 15-30 分钟 |
| 推荐 | 加上 workflow_dispatch 方便手动触发 |

GitHub Actions schedule 适合对时间精度要求不高的定时任务，比如每日数据同步、周报生成、定期清理等场景。如果需要精确到分钟级别的定时执行，建议使用云函数 + EventBridge 方案。

---

如果你需要在 GitHub Actions 和其他平台（Kubernetes、Jenkins、Airflow）之间切换定时任务配置，可以试试 [Hey Cron](https://www.heycron.com)，输入自然语言一次生成所有平台的格式，省去反复查文档的时间。
