/**
 * 本地 Regex 规则库 — 纯代码，0 延迟
 * 覆盖最常用的 ~30 种匹配需求
 * 返回 null 表示无法匹配，调用方再走 AI 兜底
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
  const f = flags ? `/${flags}` : ''
  return {
    javascript: `const regex = /${pattern}/${flags};\nconst isMatch = regex.test(input);`,
    python: `import re\npattern = r'${pattern}'\nmatch = re.${flags.includes('i') ? 'match(pattern, input, re.IGNORECASE)' : 'match(pattern, input)'}`,
    go: `import "regexp"\nre := regexp.MustCompile(\`${flags.includes('i') ? '(?i)' : ''}${pattern}\`)\nmatched := re.MatchString(input)`,
    java: `import java.util.regex.*;\nPattern p = Pattern.compile("${pattern.replace(/\\/g, '\\\\')}${flags.includes('i') ? '", Pattern.CASE_INSENSITIVE' : '"}'});\nMatcher m = p.matcher(input);`,
  }
}

type Entry = {
  keywords: RegExp
  result: RegexResult
}

const ENTRIES: Entry[] = [
  // ── 邮箱 ──
  {
    keywords: /邮箱|邮件|email|e-mail/i,
    result: {
      pattern: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
      flags: 'i',
      description: '匹配标准邮箱地址',
      explanation: [
        { part: '^[a-zA-Z0-9._%+\\-]+', meaning: '邮箱用户名：字母、数字及特殊字符' },
        { part: '@', meaning: '@ 符号' },
        { part: '[a-zA-Z0-9.\\-]+', meaning: '域名部分' },
        { part: '\\.[a-zA-Z]{2,}$', meaning: '顶级域名，至少 2 个字母' },
      ],
      examples: { match: ['user@example.com', 'hello.world@domain.org'], noMatch: ['invalid-email', '@nodomain.com'] },
      code: buildCode('^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$', 'i'),
    },
  },
  // ── 手机号（中国大陆）──
  {
    keywords: /手机|手机号|电话|phone|mobile/i,
    result: {
      pattern: '^1[3-9]\\d{9}$',
      flags: '',
      description: '匹配中国大陆手机号（11位，1开头，第二位3-9）',
      explanation: [
        { part: '^1', meaning: '以1开头' },
        { part: '[3-9]', meaning: '第二位：3到9' },
        { part: '\\d{9}$', meaning: '后续9位数字' },
      ],
      examples: { match: ['13812345678', '19900001234'], noMatch: ['12345678901', '1381234567'] },
      code: buildCode('^1[3-9]\\d{9}$', ''),
    },
  },
  // ── 身份证 ──
  {
    keywords: /身份证|idcard|id\s*card/i,
    result: {
      pattern: '^\\d{17}[\\dXx]$',
      flags: '',
      description: '匹配中国大陆18位身份证号',
      explanation: [
        { part: '^\\d{17}', meaning: '前17位数字' },
        { part: '[\\dXx]$', meaning: '最后一位：数字或X/x' },
      ],
      examples: { match: ['11010119900307001X', '110101199003070011'], noMatch: ['12345', '1101011990030700X1'] },
      code: buildCode('^\\d{17}[\\dXx]$', ''),
    },
  },
  // ── URL ──
  {
    keywords: /url|链接|网址|website|http/i,
    result: {
      pattern: '^https?:\\/\\/[^\\s/$.?#].[^\\s]*$',
      flags: 'i',
      description: '匹配 http/https URL',
      explanation: [
        { part: '^https?://', meaning: 'http 或 https 协议' },
        { part: '[^\\s/$.?#].', meaning: '域名首字符（非特殊字符）' },
        { part: '[^\\s]*$', meaning: '路径及参数（无空格）' },
      ],
      examples: { match: ['https://example.com', 'http://foo.bar/path?q=1'], noMatch: ['ftp://bad.com', 'not a url'] },
      code: buildCode('^https?:\\/\\/[^\\s/$.?#].[^\\s]*$', 'i'),
    },
  },
  // ── IP 地址 ──
  {
    keywords: /ip\s*地址|ip\s*address|\bip\b/i,
    result: {
      pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
      flags: '',
      description: '匹配 IPv4 地址',
      explanation: [
        { part: '25[0-5]', meaning: '250-255' },
        { part: '2[0-4]\\d', meaning: '200-249' },
        { part: '[01]?\\d\\d?', meaning: '0-199' },
        { part: '(\\.){3}', meaning: '点分隔，重复3次' },
      ],
      examples: { match: ['192.168.1.1', '0.0.0.0', '255.255.255.255'], noMatch: ['256.0.0.1', '192.168.1'] },
      code: buildCode('^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', ''),
    },
  },
  // ── 日期 YYYY-MM-DD ──
  {
    keywords: /日期|date|yyyy|年月日/i,
    result: {
      pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
      flags: '',
      description: '匹配 YYYY-MM-DD 格式日期',
      explanation: [
        { part: '^\\d{4}', meaning: '4位年份' },
        { part: '-(0[1-9]|1[0-2])', meaning: '月份：01-12' },
        { part: '-(0[1-9]|[12]\\d|3[01])$', meaning: '日：01-31' },
      ],
      examples: { match: ['2024-01-15', '2000-12-31'], noMatch: ['2024-13-01', '24-1-1'] },
      code: buildCode('^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', ''),
    },
  },
  // ── 时间 HH:MM ──
  {
    keywords: /时间|time|hh:mm|小时分钟/i,
    result: {
      pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
      flags: '',
      description: '匹配 HH:MM 24小时格式',
      explanation: [
        { part: '^([01]\\d|2[0-3])', meaning: '小时：00-23' },
        { part: ':[0-5]\\d$', meaning: '分钟：00-59' },
      ],
      examples: { match: ['09:00', '23:59'], noMatch: ['24:00', '9:5'] },
      code: buildCode('^([01]\\d|2[0-3]):[0-5]\\d$', ''),
    },
  },
  // ── 中文字符 ──
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
      examples: { match: ['你好', '中文测试'], noMatch: ['hello', '123'] },
      code: buildCode('[\\u4e00-\\u9fa5]+', ''),
    },
  },
  // ── 纯数字 ──
  {
    keywords: /纯数字|只有数字|only\s*number|digits?\s*only/i,
    result: {
      pattern: '^\\d+$',
      flags: '',
      description: '匹配纯数字字符串',
      explanation: [
        { part: '^\\d+$', meaning: '整个字符串只包含数字（0-9）' },
      ],
      examples: { match: ['12345', '0'], noMatch: ['12a3', '3.14'] },
      code: buildCode('^\\d+$', ''),
    },
  },
  // ── 字母数字 ──
  {
    keywords: /字母.?数字|数字.?字母|alphanumeric|letters?\s*and\s*numbers?/i,
    result: {
      pattern: '^[a-zA-Z0-9]+$',
      flags: '',
      description: '匹配只包含字母和数字的字符串',
      explanation: [
        { part: '^[a-zA-Z0-9]+$', meaning: '只允许大小写字母和数字' },
      ],
      examples: { match: ['Hello123', 'abc'], noMatch: ['hello world', 'test_1'] },
      code: buildCode('^[a-zA-Z0-9]+$', ''),
    },
  },
  // ── 邮政编码 ──
  {
    keywords: /邮政编码|邮编|postal\s*code|zip\s*code/i,
    result: {
      pattern: '^\\d{6}$',
      flags: '',
      description: '匹配中国邮政编码（6位数字）',
      explanation: [{ part: '^\\d{6}$', meaning: '恰好 6 位数字' }],
      examples: { match: ['100000', '200030'], noMatch: ['12345', '1000001'] },
      code: buildCode('^\\d{6}$', ''),
    },
  },
  // ── 16进制颜色 ──
  {
    keywords: /颜色|color|colour|hex\s*color|#[0-9a-f]/i,
    result: {
      pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
      flags: 'i',
      description: '匹配 CSS 十六进制颜色值',
      explanation: [
        { part: '^#', meaning: '#号开头' },
        { part: '[0-9a-fA-F]{3}', meaning: '3位十六进制（简写）' },
        { part: '[0-9a-fA-F]{6}', meaning: '6位十六进制（完整）' },
      ],
      examples: { match: ['#fff', '#FF5733', '#a3b'], noMatch: ['fff', '#GGGGGG'] },
      code: buildCode('^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', 'i'),
    },
  },
  // ── 强密码 ──
  {
    keywords: /密码|password|strong\s*password/i,
    result: {
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$',
      flags: '',
      description: '匹配强密码：至少8位，含大小写字母和数字',
      explanation: [
        { part: '(?=.*[a-z])', meaning: '必须含小写字母' },
        { part: '(?=.*[A-Z])', meaning: '必须含大写字母' },
        { part: '(?=.*\\d)', meaning: '必须含数字' },
        { part: '.{8,}$', meaning: '长度至少 8 位' },
      ],
      examples: { match: ['Password1', 'Abc12345'], noMatch: ['password', 'abc1234'] },
      code: buildCode('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$', ''),
    },
  },
  // ── 整数 ──
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
  // ── 浮点数 / 小数 ──
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
  // ── 空行 ──
  {
    keywords: /空行|empty\s*line|blank\s*line/i,
    result: {
      pattern: '^\\s*$',
      flags: 'm',
      description: '匹配空行或只含空白的行',
      explanation: [
        { part: '^', meaning: '行首（多行模式）' },
        { part: '\\s*', meaning: '零个或多个空白字符' },
        { part: '$', meaning: '行尾' },
      ],
      examples: { match: ['', '   ', '\t'], noMatch: ['hello', ' a '] },
      code: buildCode('^\\s*$', 'm'),
    },
  },
  // ── HTML 标签 ──
  {
    keywords: /html\s*标签|html\s*tag|去除.*html|strip.*html/i,
    result: {
      pattern: '<[^>]+>',
      flags: 'g',
      description: '匹配（或用于去除）HTML 标签',
      explanation: [
        { part: '<', meaning: '标签开始' },
        { part: '[^>]+', meaning: '标签内容（非>的任意字符）' },
        { part: '>', meaning: '标签结束' },
      ],
      examples: { match: ['<div>', '<p class="a">', '</span>'], noMatch: ['hello', 'div'] },
      code: buildCode('<[^>]+>', 'g'),
    },
  },
  // ── 用户名 ──
  {
    keywords: /用户名|username/i,
    result: {
      pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,15}$',
      flags: '',
      description: '匹配用户名：字母开头，3-16位，含字母数字下划线',
      explanation: [
        { part: '^[a-zA-Z]', meaning: '必须以字母开头' },
        { part: '[a-zA-Z0-9_]{2,15}$', meaning: '后续2-15位字母/数字/下划线' },
      ],
      examples: { match: ['user_123', 'Alice'], noMatch: ['1user', 'a', 'a'.repeat(17)] },
      code: buildCode('^[a-zA-Z][a-zA-Z0-9_]{2,15}$', ''),
    },
  },
]

export function parseRegexLocal(input: string): RegexResult | null {
  const s = input.trim()
  for (const entry of ENTRIES) {
    if (entry.keywords.test(s)) {
      return entry.result
    }
  }
  return null // 走 AI 兜底
}
