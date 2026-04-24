# 正则表达式常用速查手册：从入门到实战

正则表达式（Regular Expression）是开发者必须掌握的技能之一，用于字符串匹配、提取、替换等场景。本文是一份实用速查手册，涵盖语法、常用模式和各语言示例。

---

## 一、基础语法速查

### 字符匹配

| 表达式 | 含义 | 示例 |
|--------|------|------|
| `.` | 匹配任意单个字符（不含换行） | `a.c` → `abc`, `aXc` |
| `\d` | 数字 `[0-9]` | `\d+` → `123` |
| `\D` | 非数字 | `\D+` → `abc` |
| `\w` | 单词字符 `[a-zA-Z0-9_]` | `\w+` → `hello_123` |
| `\W` | 非单词字符 | `\W+` → `@#!` |
| `\s` | 空白字符（空格、制表符、换行） | `\s+` |
| `\S` | 非空白字符 | `\S+` |
| `\n` | 换行符 | |
| `\t` | 制表符 | |

### 量词

| 表达式 | 含义 | 示例 |
|--------|------|------|
| `*` | 0 次或多次（贪婪） | `a*` → ``, `a`, `aaa` |
| `+` | 1 次或多次（贪婪） | `a+` → `a`, `aaa` |
| `?` | 0 次或 1 次 | `colou?r` → `color`, `colour` |
| `{n}` | 恰好 n 次 | `\d{4}` → `2024` |
| `{n,}` | 至少 n 次 | `\d{2,}` → `12`, `123` |
| `{n,m}` | n 到 m 次 | `\d{2,4}` → `12`, `123`, `1234` |
| `*?` | 0 次或多次（非贪婪） | `<.*?>` 匹配最短标签 |
| `+?` | 1 次或多次（非贪婪） | |

### 锚点和边界

| 表达式 | 含义 |
|--------|------|
| `^` | 字符串开头（或行首，多行模式） |
| `$` | 字符串结尾（或行尾，多行模式） |
| `\b` | 单词边界 |
| `\B` | 非单词边界 |

```regex
^\d{4}-\d{2}-\d{2}$   # 精确匹配日期格式，不允许前后有其他内容
\bword\b               # 匹配完整单词 word，不匹配 words、keyword
```

### 字符类

| 表达式 | 含义 |
|--------|------|
| `[abc]` | 匹配 a、b 或 c |
| `[^abc]` | 不匹配 a、b、c（取反） |
| `[a-z]` | 匹配 a 到 z 的小写字母 |
| `[A-Za-z0-9]` | 字母数字 |
| `[^\s]` | 非空白字符（等同于 `\S`） |

### 分组和引用

| 表达式 | 含义 |
|--------|------|
| `(abc)` | 捕获组，匹配并记住 |
| `(?:abc)` | 非捕获组，只匹配不记录 |
| `(?<name>abc)` | 命名捕获组 |
| `\1`, `\2` | 反向引用第 1、2 个捕获组 |
| `(?=abc)` | 正向先行断言（后面跟 abc） |
| `(?!abc)` | 负向先行断言（后面不跟 abc） |
| `(?<=abc)` | 正向后行断言（前面是 abc） |
| `(?<!abc)` | 负向后行断言（前面不是 abc） |

---

## 二、常用正则模式速查

### 验证类

```regex
# 邮箱
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# 手机号（中国大陆）
^1[3-9]\d{9}$

# 身份证号（18位）
^\d{17}[\dXx]$

# URL
^https?://[^\s/$.?#].[^\s]*$

# IPv4 地址
^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$

# IPv6 地址（简化版）
^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$

# 日期 YYYY-MM-DD
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$

# 时间 HH:MM:SS
^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$

# 邮政编码（中国）
^\d{6}$

# 整数
^-?\d+$

# 浮点数
^-?\d+(\.\d+)?$

# 16进制颜色
^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$

# 强密码（至少8位，含大小写字母和数字）
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
```

### 提取类

```regex
# 提取 HTML 标签内容
<(\w+)[^>]*>(.*?)<\/\1>

# 提取 HTML 属性值
href="([^"]*)"

# 提取 JSON key-value（简单场景）
"(\w+)":\s*"([^"]*)"

# 提取括号内容
\(([^)]+)\)

# 提取中文字符
[\u4e00-\u9fa5]+

# 提取英文单词
[a-zA-Z]+

# 提取所有数字
\d+

# 提取文件扩展名
\.([a-zA-Z0-9]+)$

# 提取 URL 中的 domain
https?://([^/\s]+)

# 提取 IP 地址
\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b
```

### 替换类

```regex
# 删除 HTML 标签
<[^>]+>

# 删除多余空白行
^\s*\n

# 统一换行符（CRLF → LF）
\r\n   →  \n

# 删除行尾空格
\s+$

# 驼峰转下划线（CamelCase → snake_case）
([A-Z])   →  _\1   然后 toLower

# 删除注释（//开头的行）
^\s*\/\/.*$

# 缩短多个连续空格为一个
\s{2,}   →  ' '
```

---

## 三、各编程语言示例

### JavaScript

```javascript
// 测试匹配
/^\d{4}-\d{2}-\d{2}$/.test('2024-01-15')  // true

// 提取匹配内容
const match = '2024-01-15'.match(/(\d{4})-(\d{2})-(\d{2})/)
// match[1] = '2024', match[2] = '01', match[3] = '15'

// 命名捕获组
const { groups } = '2024-01-15'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/)
// groups.year = '2024'

// 全局匹配（找所有）
'hello world hello'.match(/hello/g)  // ['hello', 'hello']

// 替换
'foo bar'.replace(/\s+/, '-')    // 'foo-bar'（只替换第一个）
'foo bar baz'.replaceAll(' ', '-')  // 'foo-bar-baz'
'foo bar baz'.replace(/\s+/g, '-')  // 'foo-bar-baz'

// 分割
'a,b,,c'.split(/,+/)  // ['a', 'b', 'c']
```

### Python

```python
import re

# 测试匹配
bool(re.match(r'^\d{4}-\d{2}-\d{2}$', '2024-01-15'))  # True

# 提取所有匹配
re.findall(r'\d+', 'abc123def456')  # ['123', '456']

# 命名捕获组
m = re.search(r'(?P<year>\d{4})-(?P<month>\d{2})', '2024-01')
m.group('year')   # '2024'
m.group('month')  # '01'

# 替换
re.sub(r'\s+', '-', 'foo bar baz')  # 'foo-bar-baz'

# 替换（带函数）
re.sub(r'[a-z]', lambda m: m.group().upper(), 'hello')  # 'HELLO'

# 编译正则（性能优化，在循环中复用时使用）
pattern = re.compile(r'\d{4}-\d{2}-\d{2}')
pattern.findall('dates: 2024-01-01 and 2024-12-31')
```

### Java

```java
import java.util.regex.*;

// 测试匹配
Pattern.matches("\\d{4}-\\d{2}-\\d{2}", "2024-01-15");  // true

// 提取匹配
Pattern p = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})");
Matcher m = p.matcher("2024-01-15");
if (m.find()) {
    String year = m.group(1);   // "2024"
    String month = m.group(2);  // "01"
}

// 全局查找所有匹配
Matcher m2 = Pattern.compile("\\d+").matcher("abc123def456");
while (m2.find()) {
    System.out.println(m2.group());  // 123, 456
}

// 替换
"foo bar baz".replaceAll("\\s+", "-");  // "foo-bar-baz"
```

### Go

```go
import "regexp"

// 测试匹配
matched, _ := regexp.MatchString(`^\d{4}-\d{2}-\d{2}$`, "2024-01-15")

// 提取
re := regexp.MustCompile(`(\d{4})-(\d{2})-(\d{2})`)
match := re.FindStringSubmatch("2024-01-15")
// match[1] = "2024", match[2] = "01", match[3] = "15"

// 命名捕获组
re2 := regexp.MustCompile(`(?P<year>\d{4})-(?P<month>\d{2})`)
match2 := re2.FindStringSubmatch("2024-01")
year := match2[re2.SubexpIndex("year")]  // "2024"

// 替换
re3 := regexp.MustCompile(`\s+`)
re3.ReplaceAllString("foo bar baz", "-")  // "foo-bar-baz"

// 全局查找
re4 := regexp.MustCompile(`\d+`)
re4.FindAllString("abc123def456", -1)  // ["123", "456"]
```

---

## 四、修饰符（Flags）

| 修饰符 | 含义 | 示例 |
|--------|------|------|
| `i` | 忽略大小写 | `/hello/i` 匹配 `Hello` |
| `g` | 全局匹配（找所有） | `/\d+/g` |
| `m` | 多行模式（`^` `$` 匹配每行） | `/^\w+/m` |
| `s` | dotAll 模式（`.` 匹配换行符） | `/a.b/s` 匹配 `a\nb` |
| `u` | Unicode 模式 | `/\u{1F600}/u` |

```javascript
// 忽略大小写
/hello/i.test('Hello World')  // true

// 多行模式
'line1\nline2'.match(/^\w+/gm)  // ['line1', 'line2']
```

---

## 五、常见坑和注意事项

### 坑 1：贪婪 vs 非贪婪

```regex
# 输入: <div>hello</div><div>world</div>

# 贪婪（默认）：匹配尽可能多的内容
<div>.*</div>
# 结果: <div>hello</div><div>world</div>（整个字符串！）

# 非贪婪：匹配尽可能少
<div>.*?</div>
# 结果: <div>hello</div>（第一个标签）
```

### 坑 2：特殊字符需要转义

这些字符在正则中有特殊含义，要匹配本身需要加 `\`：
```
. * + ? ^ $ { } [ ] | ( ) \
```

```regex
# 匹配 1+1=2 中的加号
1\+1=2

# 匹配括号内的内容
\(([^)]+)\)
```

### 坑 3：`^` 在字符类中的含义不同

```regex
[abc]   # 匹配 a 或 b 或 c
[^abc]  # 匹配不是 a、b、c 的任意字符（^ 在这里是取反）
^abc    # 匹配以 abc 开头的字符串（^ 在外面是锚点）
```

### 坑 4：不要用正则解析 HTML

正则不适合处理嵌套结构，解析 HTML/XML 请使用专门的解析库（如 Python 的 BeautifulSoup、JavaScript 的 DOMParser）。

---

## 六、在线工具和调试

调试正则表达式推荐：
- **regex101.com** — 支持 Python/JS/PHP/Go，实时高亮，有详细解释
- **regexr.com** — 有示例库，适合入门
- **regexp.help** — 中文界面

> 💡 AI 生成正则表达式：在 [Hey Cron](https://www.heycron.com/regex) 的正则工具里，输入自然语言描述，例如"匹配中国手机号"，自动生成表达式并在线测试。

---

## 总结速查表

| 场景 | 正则 |
|------|------|
| 中国手机号 | `^1[3-9]\d{9}$` |
| 邮箱 | `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` |
| 日期 YYYY-MM-DD | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` |
| 中文字符 | `[\u4e00-\u9fa5]+` |
| 16进制颜色 | `^#([0-9a-fA-F]{3}\|[0-9a-fA-F]{6})$` |
| 强密码 | `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$` |
| IP 地址 | `^\d{1,3}(\.\d{1,3}){3}$` |
| URL | `^https?://[^\s/$.?#].[^\s]*$` |
| 去除 HTML 标签 | `<[^>]+>` |
| 空行 | `^\s*$` |

---

正则表达式的 AI 辅助生成，可以用 [Hey Cron 正则工具](https://www.heycron.com/regex)，输入自然语言描述直接生成可测试的正则表达式。
