/**
 * 自动发布配置
 * 关键词列表 + 分类映射
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
  '定时任务监控与告警方案',

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

  // 开发工具系列
  'JSON 格式化与校验工具推荐',
  'Base64 编码解码原理与应用',
  'JWT Token 解析与安全实践',
  'Unix 时间戳转换工具与技巧',
  '开发者必备在线工具集合',
  'API 接口测试工具对比',
  'Git 常用命令速查表',
  'Nginx 配置最佳实践',
]

// 掘金分类 ID
export const JUEJIN_CATEGORIES = {
  backend: '6809637769959178254',
  frontend: '6809637767543259144',
  devtools: '6809637771511070734',
  cloud: '6809637769959178254',
}

// 文章默认标签（各平台）
export const DEFAULT_TAGS = {
  juejin: ['Linux', 'cron', '运维', '后端', '开发工具'],
  csdn: 'Linux,cron,定时任务,运维,开发工具',
  sf: ['linux', 'cron', 'devops'],
}

// 文章发布时间（UTC，对应北京时间上午 9 点）
export const PUBLISH_HOUR_UTC = 1
