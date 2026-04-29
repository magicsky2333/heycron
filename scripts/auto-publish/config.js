/**
 * 自动发布配置
 * 关键词列表 + 写作角度 + 分类映射
 */

export const KEYWORDS = [
  // Cron / 定时任务系列
  'Linux crontab 完整使用指南',
  'Python APScheduler 定时任务详解',
  'Node.js node-cron 定时任务教程',
  'GitHub Actions 定时任务 schedule 配置',
  'Kubernetes CronJob 最佳实践',
  'Jenkins Pipeline 定时构建配置',
  'Docker 容器内定时任务方案',
  'Airflow DAG 调度配置详解',
  'Spring Boot @Scheduled 注解使用',
  'Go 语言定时任务实现方案',
  'Redis 实现延迟任务队列',
  'MySQL 事件调度器 Event Scheduler',
  'AWS Lambda 定时触发配置',
  'cron 表达式完全指南',
  '定时任务监控与告警最佳实践',
  'Celery 分布式任务队列入门',
  'Quartz 定时任务框架详解',
  'Azure Functions 定时触发器配置',
  'GCP Cloud Scheduler 使用教程',
  '分布式定时任务设计方案',
  '定时任务幂等性设计',
  '定时任务失败重试机制',
  '秒级定时任务实现方案',

  // 正则表达式系列
  '正则表达式入门到精通',
  'JavaScript 正则表达式完全指南',
  'Python re 模块正则教程',
  '常用正则表达式大全（邮箱/手机/身份证）',
  '正则表达式零宽断言详解',
  '正则表达式性能优化技巧',
  'Go 语言正则表达式使用',
  'Java Pattern 正则表达式教程',
  '正则表达式在爬虫中的应用',
  'VS Code 正则替换技巧',
  '正则表达式贪婪与非贪婪匹配',
  '正则表达式分组与捕获详解',
  '手机号正则表达式完整写法',
  '身份证号正则验证与校验',
  'URL 正则表达式解析',
  'IP 地址正则表达式写法',
  '日期时间正则表达式大全',
  '密码强度正则表达式设计',

  // 开发工具系列
  'JSON 格式化与校验工具推荐',
  'Base64 编码解码原理与应用',
  'JWT Token 解析与安全实践',
  'Unix 时间戳转换工具与技巧',
  '开发者必备在线工具集合',
  'API 接口测试工具对比',
  'Git 常用命令速查表',
  'Nginx 配置最佳实践',
  'Postman 接口测试完整教程',
  'curl 命令使用完全指南',
  'jq 命令行 JSON 处理工具',
  'Charles 抓包工具使用教程',
  'Wireshark 网络分析入门',
  'Docker Compose 使用详解',
  'Makefile 入门教程',
  'Shell 脚本编程实用技巧',
  'awk 命令使用教程',
  'sed 命令使用指南',
  'grep 命令高级用法',
  'tmux 终端复用器使用教程',
  'vim 常用命令速查',

  // 定时任务 + 正则实战场景
  '用 cron 定时备份数据库',
  '用 cron 定时发送邮件报告',
  '用 cron 定时清理日志文件',
  '用 cron 定时抓取网页数据',
  '用正则表达式清洗脏数据',
  '用正则表达式批量重命名文件',
  '用正则表达式提取日志关键字段',
  '用正则表达式验证表单输入',
  'cron 与 Webhook 结合实现自动化',
  '定时任务 + 钉钉/企微机器人推送',
  'Node.js 定时清理过期 token',
  'Python 定时生成 Excel 报表',

  // 开发工具系列（与 heycron 强相关）
  'JSON 格式化与校验工具推荐',
  'Base64 编码解码原理与应用',
  'JWT Token 解析与安全实践',
  'Unix 时间戳转换工具与技巧',
  '开发者必备在线工具集合 2025',
  'API 接口测试工具对比',
  'Git 常用命令速查表',
  'Shell 脚本编写定时任务',
  'curl 命令配合 cron 定时请求',
  'Linux crontab 与 systemd timer 对比',
]

// 写作角度列表——同一关键词搭配不同角度产出不同文章
export const ANGLES = [
  '从零开始的入门教程，适合新手',
  '深入原理，面向有经验的开发者',
  '踩坑总结：常见错误与解决方案',
  '最佳实践与生产环境注意事项',
  '对比分析：与同类方案的优缺点',
  '实战案例：结合真实业务场景讲解',
  '速查手册：核心语法与常用示例',
  '性能优化：如何写出更高效的代码',
]

// 掘金分类 ID
export const JUEJIN_CATEGORIES = {
  backend: '6809637769959178254',
  frontend: '6809637767543259144',
  devtools: '6809637771511070734',
  cloud: '6809637769959178254',
}

// 文章发布时间（UTC，对应北京时间上午 9 点）
export const PUBLISH_HOUR_UTC = 1
