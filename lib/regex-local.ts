/**
 * 本地 Regex 规则库 — 纯代码，0 延迟，无 AI
 * 覆盖开发中最常用的 ~30 种匹配需求
 */

type RegexResult = {
  pattern: string
  flags: string
  description: string
  explanation: { part: string; meaning: string }[]
  examples: { match: string[]; noMatch: string[] }
  code: Record<string, string>
}

function buildCode(pattern: string, flags: string): Record<string, string> {
  const esc = pattern.replace(/\\/g, '\\\\')
  return {
    javascript: `const regex = /${pattern}/${flags};\nconst isMatch = regex.test(input);`,
    python: `import re\npattern = r'${pattern}'\nmatch = re.${flags.includes('i') ? 'match(pattern, input, re.IGNORECASE)' : 'match(pattern, input)'}`,
    go: `import "regexp"\nre := regexp.MustCompile(\`${flags.includes('i') ? '(?i)' : ''}${pattern}\`)\nmatched := re.MatchString(input)`,
    java: `import java.util.regex.*;\nPattern p = Pattern.compile("${esc}"${flags.includes('i') ? ', Pattern.CASE_INSENSITIVE' : ''});\nMatcher m = p.matcher(input);\nboolean matched = m.matches();`,
  }
}

type Entry = {
  keywords: RegExp
  result: RegexResult
}

const ENTRIES: Entry[] = [
  // ── 邮箱 ──────────────────────────────────────────────────────────────────
  {
    keywords: /邮箱|邮件地址|email|e.mail/i,
    result: {
      pattern: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
      flags: 'i',
      description: '匹配标准邮箱地址',
      explanation: [
        { part: '^[a-zA-Z0-9._%+\\-]+', meaning: '用户名：字母、数字及 . _ % + - ' },
        { part: '@', meaning: '@ 符号' },
        { part: '[a-zA-Z0-9.\\-]+', meaning: '域名部分' },
        { part: '\\.[a-zA-Z]{2,}$', meaning: '顶级域名，至少 2 个字母' },
      ],
      examples: { match: ['user@example.com', 'hello.world@domain.org'], noMatch: ['invalid', '@nodomain.com'] },
      code: buildCode('^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$', 'i'),
    },
  },
  // ── 手机号（中国大陆）───────────────────────────────────────────────────────
  {
    keywords: /手机|手机号|mobile|phone/i,
    result: {
      pattern: '^1[3-9]\\d{9}$',
      flags: '',
      description: '匹配中国大陆手机号（11位）',
      explanation: [
        { part: '^1', meaning: '以 1 开头' },
        { part: '[3-9]', meaning: '第二位：3 到 9' },
        { part: '\\d{9}$', meaning: '后续 9 位数字' },
      ],
      examples: { match: ['13812345678', '19900001234'], noMatch: ['12345678901', '138123456'] },
      code: buildCode('^1[3-9]\\d{9}$', ''),
    },
  },
  // ── 身份证 ────────────────────────────────────────────────────────────────
  {
    keywords: /身份证|idcard|id\s*card/i,
    result: {
      pattern: '^\\d{17}[\\dXx]$',
      flags: '',
      description: '匹配中国大陆 18 位身份证号',
      explanation: [
        { part: '^\\d{17}', meaning: '前 17 位数字' },
        { part: '[\\dXx]$', meaning: '末位：数字或 X/x（校验码）' },
      ],
      examples: { match: ['11010119900307001X', '110101199003070018'], noMatch: ['1234567890123456', '11010119900307001A'] },
      code: buildCode('^\\d{17}[\\dXx]$', ''),
    },
  },
  // ── URL ──────────────────────────────────────────────────────────────────
  {
    keywords: /url|链接|网址|网站|http|website/i,
    result: {
      pattern: '^https?:\\/\\/[^\\s/$.?#].[^\\s]*$',
      flags: 'i',
      description: '匹配 http/https URL',
      explanation: [
        { part: '^https?://', meaning: 'http 或 https 协议' },
        { part: '[^\\s/$.?#].', meaning: '域名首字符（非特殊字符）' },
        { part: '[^\\s]*$', meaning: '路径及参数（不含空格）' },
      ],
      examples: { match: ['https://example.com', 'http://foo.bar/path?q=1'], noMatch: ['ftp://bad', 'not-a-url'] },
      code: buildCode('^https?:\\/\\/[^\\s/$.?#].[^\\s]*$', 'i'),
    },
  },
  // ── IP 地址 ───────────────────────────────────────────────────────────────
  {
    keywords: /ip\s*地址|ip\s*address|\bip\b/i,
    result: {
      pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
      flags: '',
      description: '匹配 IPv4 地址',
      explanation: [
        { part: '25[0-5]', meaning: '250–255' },
        { part: '2[0-4]\\d', meaning: '200–249' },
        { part: '[01]?\\d\\d?', meaning: '0–199' },
        { part: '(\\.){3}', meaning: '三个点分隔符' },
      ],
      examples: { match: ['192.168.1.1', '255.255.255.255', '0.0.0.0'], noMatch: ['256.0.0.1', '192.168.1'] },
      code: buildCode('^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', ''),
    },
  },
  // ── 日期 YYYY-MM-DD ────────────────────────────────────────────────────────
  {
    keywords: /日期|date|yyyy|年月日|\btime\s*format/i,
    result: {
      pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
      flags: '',
      description: '匹配 YYYY-MM-DD 格式日期',
      explanation: [
        { part: '^\\d{4}', meaning: '4 位年份' },
        { part: '-(0[1-9]|1[0-2])', meaning: '月份：01–12' },
        { part: '-(0[1-9]|[12]\\d|3[01])$', meaning: '日期：01–31' },
      ],
      examples: { match: ['2024-01-15', '2000-12-31'], noMatch: ['2024-13-01', '24-1-1'] },
      code: buildCode('^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', ''),
    },
  },
  // ── 时间 HH:MM ─────────────────────────────────────────────────────────────
  {
    keywords: /时间格式|hh:mm|24\s*小时|time.*hh/i,
    result: {
      pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
      flags: '',
      description: '匹配 HH:MM 24 小时格式',
      explanation: [
        { part: '^([01]\\d|2[0-3])', meaning: '小时：00–23' },
        { part: ':[0-5]\\d$', meaning: '分钟：00–59' },
      ],
      examples: { match: ['09:00', '23:59', '00:00'], noMatch: ['24:00', '9:5'] },
      code: buildCode('^([01]\\d|2[0-3]):[0-5]\\d$', ''),
    },
  },
  // ── 中文字符 ──────────────────────────────────────────────────────────────
  {
    keywords: /中文|汉字|chinese\s*char/i,
    result: {
      pattern: '[\\u4e00-\\u9fa5]+',
      flags: '',
      description: '匹配中文字符（汉字）',
      explanation: [
        { part: '[\\u4e00-\\u9fa5]', meaning: 'Unicode 中文区间（一到龥）' },
        { part: '+', meaning: '一个或多个' },
      ],
      examples: { match: ['你好', '中文测试abc中文'], noMatch: ['hello', '123'] },
      code: buildCode('[\\u4e00-\\u9fa5]+', ''),
    },
  },
  // ── 纯中文 ────────────────────────────────────────────────────────────────
  {
    keywords: /只含中文|全是中文|纯中文|only\s*chinese/i,
    result: {
      pattern: '^[\\u4e00-\\u9fa5]+$',
      flags: '',
      description: '匹配全为中文字符的字符串',
      explanation: [{ part: '^[\\u4e00-\\u9fa5]+$', meaning: '整个字符串只包含中文字符' }],
      examples: { match: ['你好世界', '中文'], noMatch: ['hello', '中文abc'] },
      code: buildCode('^[\\u4e00-\\u9fa5]+$', ''),
    },
  },
  // ── 纯数字 ────────────────────────────────────────────────────────────────
  {
    keywords: /纯数字|只.?数字|数字.?only|only\s*digit|digits?\s*only/i,
    result: {
      pattern: '^\\d+$',
      flags: '',
      description: '匹配纯数字字符串',
      explanation: [{ part: '^\\d+$', meaning: '整个字符串只包含数字（0–9）' }],
      examples: { match: ['12345', '0'], noMatch: ['12a3', '3.14'] },
      code: buildCode('^\\d+$', ''),
    },
  },
  // ── 字母数字 ──────────────────────────────────────────────────────────────
  {
    keywords: /字母.?数字|数字.?字母|alphanumeric|letters?\s*and\s*numbers?/i,
    result: {
      pattern: '^[a-zA-Z0-9]+$',
      flags: '',
      description: '匹配只包含字母和数字的字符串',
      explanation: [{ part: '^[a-zA-Z0-9]+$', meaning: '只允许大小写字母和数字' }],
      examples: { match: ['Hello123', 'abc'], noMatch: ['hello world', 'test_1'] },
      code: buildCode('^[a-zA-Z0-9]+$', ''),
    },
  },
  // ── 整数 ─────────────────────────────────────────────────────────────────
  {
    keywords: /整数|integer|whole\s*number/i,
    result: {
      pattern: '^-?\\d+$',
      flags: '',
      description: '匹配整数（含负数）',
      explanation: [
        { part: '^-?', meaning: '可选负号' },
        { part: '\\d+$', meaning: '一个或多个数字' },
      ],
      examples: { match: ['123', '-456', '0'], noMatch: ['3.14', '12a'] },
      code: buildCode('^-?\\d+$', ''),
    },
  },
  // ── 小数 / 浮点 ────────────────────────────────────────────────────────────
  {
    keywords: /小数|浮点|decimal|float|double/i,
    result: {
      pattern: '^-?\\d+(\\.\\d+)?$',
      flags: '',
      description: '匹配整数或小数',
      explanation: [
        { part: '^-?\\d+', meaning: '整数部分（含可选负号）' },
        { part: '(\\.\\d+)?$', meaning: '可选小数部分' },
      ],
      examples: { match: ['3.14', '-2.5', '42'], noMatch: ['3.', '.14', 'abc'] },
      code: buildCode('^-?\\d+(\\.\\d+)?$', ''),
    },
  },
  // ── 邮政编码 ──────────────────────────────────────────────────────────────
  {
    keywords: /邮政编码|邮编|postal|zip\s*code/i,
    result: {
      pattern: '^\\d{6}$',
      flags: '',
      description: '匹配中国邮政编码（6 位数字）',
      explanation: [{ part: '^\\d{6}$', meaning: '恰好 6 位数字' }],
      examples: { match: ['100000', '200030'], noMatch: ['12345', '1000001'] },
      code: buildCode('^\\d{6}$', ''),
    },
  },
  // ── 16 进制颜色 ──────────────────────────────────────────────────────────
  {
    keywords: /颜色|color|colour|hex\s*col|css\s*col/i,
    result: {
      pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
      flags: '',
      description: '匹配 CSS 十六进制颜色值',
      explanation: [
        { part: '^#', meaning: '# 号开头' },
        { part: '[0-9a-fA-F]{3}', meaning: '3 位十六进制（简写）' },
        { part: '[0-9a-fA-F]{6}', meaning: '6 位十六进制（完整）' },
      ],
      examples: { match: ['#fff', '#FF5733', '#a3b2c1'], noMatch: ['fff', '#GGGGGG', '#12345'] },
      code: buildCode('^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', ''),
    },
  },
  // ── 强密码 ────────────────────────────────────────────────────────────────
  {
    keywords: /密码|password|strong\s*pass/i,
    result: {
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$',
      flags: '',
      description: '匹配强密码：≥8位，含大小写字母和数字',
      explanation: [
        { part: '(?=.*[a-z])', meaning: '必须含小写字母' },
        { part: '(?=.*[A-Z])', meaning: '必须含大写字母' },
        { part: '(?=.*\\d)', meaning: '必须含数字' },
        { part: '.{8,}$', meaning: '长度至少 8 位' },
      ],
      examples: { match: ['Password1', 'Abc12345'], noMatch: ['password', 'abc1234', 'PASSWORD1'] },
      code: buildCode('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$', ''),
    },
  },
  // ── 用户名 ────────────────────────────────────────────────────────────────
  {
    keywords: /用户名|username/i,
    result: {
      pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,15}$',
      flags: '',
      description: '匹配用户名：字母开头，3–16 位，含字母数字下划线',
      explanation: [
        { part: '^[a-zA-Z]', meaning: '必须以字母开头' },
        { part: '[a-zA-Z0-9_]{2,15}$', meaning: '后续 2–15 位字母/数字/下划线' },
      ],
      examples: { match: ['user_123', 'Alice42'], noMatch: ['1user', 'a', 'toolongusernameXXX'] },
      code: buildCode('^[a-zA-Z][a-zA-Z0-9_]{2,15}$', ''),
    },
  },
  // ── HTML 标签 ─────────────────────────────────────────────────────────────
  {
    keywords: /html\s*标签|html\s*tag|去除.*html|strip.*html/i,
    result: {
      pattern: '<[^>]+>',
      flags: 'g',
      description: '匹配 HTML 标签（可用于 replace 去除标签）',
      explanation: [
        { part: '<', meaning: '标签开始' },
        { part: '[^>]+', meaning: '标签内容（非 > 的任意字符）' },
        { part: '>', meaning: '标签结束' },
      ],
      examples: { match: ['<div>', '<p class="a">', '</span>'], noMatch: ['hello', 'div'] },
      code: buildCode('<[^>]+>', 'g'),
    },
  },
  // ── 空行 ─────────────────────────────────────────────────────────────────
  {
    keywords: /空行|empty\s*line|blank\s*line/i,
    result: {
      pattern: '^\\s*$',
      flags: 'm',
      description: '匹配空行或只含空白字符的行',
      explanation: [
        { part: '^', meaning: '行首（多行模式）' },
        { part: '\\s*', meaning: '零或多个空白字符' },
        { part: '$', meaning: '行尾' },
      ],
      examples: { match: ['', '   ', '\t'], noMatch: ['hello', ' a '] },
      code: buildCode('^\\s*$', 'm'),
    },
  },
  // ── QQ 号 ─────────────────────────────────────────────────────────────────
  {
    keywords: /qq\s*号?|qq\s*id/i,
    result: {
      pattern: '^[1-9]\\d{4,10}$',
      flags: '',
      description: '匹配 QQ 号（5–11位，非 0 开头）',
      explanation: [
        { part: '^[1-9]', meaning: '第一位：1–9' },
        { part: '\\d{4,10}$', meaning: '后续 4–10 位数字，共 5–11 位' },
      ],
      examples: { match: ['12345', '10001', '3000000000'], noMatch: ['0123', '1234', '123456789012'] },
      code: buildCode('^[1-9]\\d{4,10}$', ''),
    },
  },
  // ── 车牌号（中国）──────────────────────────────────────────────────────────
  {
    keywords: /车牌|车牌号|license\s*plate/i,
    result: {
      pattern: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁夏][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]$',
      flags: '',
      description: '匹配中国大陆常规车牌号（含新能源）',
      explanation: [
        { part: '^[京津沪...]', meaning: '省/直辖市汉字' },
        { part: '[A-HJ-NP-Z]', meaning: '字母（排除 I 和 O）' },
        { part: '[A-HJ-NP-Z0-9]{4}', meaning: '4 位字母数字组合' },
        { part: '[A-HJ-NP-Z0-9挂学警港澳]$', meaning: '末位（含特殊类型）' },
      ],
      examples: { match: ['京A12345', '粤B88888'], noMatch: ['A12345', '京I12345'] },
      code: buildCode('^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁夏][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]$', ''),
    },
  },
  // ── 银行卡号 ──────────────────────────────────────────────────────────────
  {
    keywords: /银行卡|card\s*num|credit\s*card|debit\s*card/i,
    result: {
      pattern: '^[1-9]\\d{15,18}$',
      flags: '',
      description: '匹配银行卡号（16–19 位数字）',
      explanation: [
        { part: '^[1-9]', meaning: '首位非 0' },
        { part: '\\d{15,18}$', meaning: '后续 15–18 位数字' },
      ],
      examples: { match: ['6222021302120003333', '6225880088880088'], noMatch: ['0123456789012345', '123'] },
      code: buildCode('^[1-9]\\d{15,18}$', ''),
    },
  },
  // ── UUID ──────────────────────────────────────────────────────────────────
  {
    keywords: /uuid|guid/i,
    result: {
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      flags: 'i',
      description: '匹配标准 UUID / GUID',
      explanation: [
        { part: '[0-9a-f]{8}', meaning: '8 位十六进制' },
        { part: '-[0-9a-f]{4}', meaning: '连字符 + 4 位，重复 3 次' },
        { part: '-[0-9a-f]{12}$', meaning: '连字符 + 12 位十六进制' },
      ],
      examples: { match: ['550e8400-e29b-41d4-a716-446655440000'], noMatch: ['550e8400e29b41d4', 'not-a-uuid'] },
      code: buildCode('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', 'i'),
    },
  },
  // ── 空白字符 ──────────────────────────────────────────────────────────────
  {
    keywords: /空格|空白|whitespace|spaces?/i,
    result: {
      pattern: '\\s+',
      flags: 'g',
      description: '匹配一个或多个空白字符（空格、制表符、换行等）',
      explanation: [
        { part: '\\s', meaning: '任意空白字符（空格/Tab/换行）' },
        { part: '+', meaning: '一个或多个' },
      ],
      examples: { match: [' ', '\t', '  hello  '], noMatch: ['abc', '123'] },
      code: buildCode('\\s+', 'g'),
    },
  },
]

export function parseRegexLocal(input: string): RegexResult | null {
  const s = input.trim()
  for (const entry of ENTRIES) {
    if (entry.keywords.test(s)) return entry.result
  }
  return null
}
