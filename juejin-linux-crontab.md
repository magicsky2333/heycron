# Linux crontab 完整指南：从入门到生产实践

crontab 是 Linux/Unix 系统内置的定时任务工具，无需安装任何依赖，是后端开发和运维人员的必备技能。本文覆盖 crontab 的全部用法、常见坑和生产最佳实践。

---

## 一、crontab 基础命令

```bash
# 编辑当前用户的 crontab
crontab -e

# 查看当前用户的 crontab 列表
crontab -l

# 删除当前用户的所有 crontab（危险！）
crontab -r

# 编辑指定用户的 crontab（需要 root）
crontab -u username -e

# 查看指定用户的 crontab
crontab -u username -l
```

---

## 二、Cron 表达式语法

```
┌───────────── 分钟 (0-59)
│ ┌───────────── 小时 (0-23)
│ │ ┌───────────── 日 (1-31)
│ │ │ ┌───────────── 月 (1-12)
│ │ │ │ ┌───────────── 星期 (0-7，0和7都是周日)
│ │ │ │ │
* * * * * /path/to/command
```

特殊符号说明：

| 符号 | 含义 | 示例 |
|------|------|------|
| `*` | 任意值 | `* * * * *` 每分钟 |
| `,` | 枚举 | `1,15 * * * *` 每小时1分和15分 |
| `-` | 范围 | `1-5 * * * *` 每小时1到5分 |
| `*/n` | 步长 | `*/5 * * * *` 每5分钟 |

常用表达式速查：

| 表达式 | 含义 |
|--------|------|
| `0 9 * * 1-5` | 工作日每天早上9点 |
| `0 */2 * * *` | 每2小时 |
| `0 0 * * *` | 每天凌晨0点 |
| `0 0 * * 0` | 每周日凌晨0点 |
| `0 0 1 * *` | 每月1号凌晨0点 |
| `*/5 * * * *` | 每5分钟 |
| `0 9,18 * * 1-5` | 工作日早9点和晚6点 |

> 💡 不想手写表达式？用 [Hey Cron](https://www.heycron.com) 直接输入"每天早上9点"生成，同时支持导出 Kubernetes、GitHub Actions 等多平台格式。

---

## 三、crontab 文件格式

除了 `crontab -e` 编辑，也可以直接写文件。系统级 crontab 在 `/etc/crontab`，格式多一个用户字段：

```bash
# /etc/crontab 格式（多一个 username 字段）
0 9 * * 1-5 root /usr/local/bin/backup.sh

# 用户级 crontab 格式（无 username 字段）
0 9 * * 1-5 /usr/local/bin/backup.sh
```

也可以在 `/etc/cron.d/` 目录下新建文件（系统级，推荐用于服务）：

```bash
# /etc/cron.d/myapp
0 9 * * 1-5 www-data /usr/local/bin/myapp-task.sh
```

---

## 四、环境变量问题（最常踩的坑）

crontab 的执行环境和你的终端环境**完全不同**，默认只有极少的环境变量。

### 坑 1：PATH 不包含常用目录

```bash
# ❌ 这样会失败，因为 cron 的 PATH 里没有 /usr/local/bin
0 9 * * * node /app/script.js

# ✅ 用绝对路径
0 9 * * * /usr/local/bin/node /app/script.js
```

查看你的命令绝对路径：
```bash
which node    # /usr/local/bin/node
which python3 # /usr/bin/python3
which npm     # /usr/local/bin/npm
```

### 坑 2：在 crontab 顶部定义环境变量

```bash
# crontab 文件顶部定义环境变量
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
SHELL=/bin/bash
HOME=/home/youruser

# 任务
0 9 * * * node /app/script.js
```

### 坑 3：加载 .bashrc / .profile

```bash
# 显式加载用户环境
0 9 * * * bash -l -c '/usr/local/bin/node /app/script.js'
```

---

## 五、日志和调试

### 查看 cron 执行日志

```bash
# Ubuntu/Debian
grep CRON /var/log/syslog

# CentOS/RHEL
grep CRON /var/log/cron

# 实时查看
tail -f /var/log/syslog | grep CRON
```

### 把任务输出重定向到日志文件

```bash
# 把标准输出和错误输出都写入日志
0 9 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1

# 只记录错误
0 9 * * * /usr/local/bin/backup.sh >> /dev/null 2>> /var/log/backup-error.log

# 忽略所有输出（静默模式）
0 9 * * * /usr/local/bin/backup.sh > /dev/null 2>&1
```

### 带时间戳的日志

```bash
0 9 * * * echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup" >> /var/log/backup.log && /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

---

## 六、生产最佳实践

### 1. 用脚本文件，不要把命令直接写在 crontab 里

```bash
# ❌ 不推荐，难以维护
0 9 * * * cd /app && node index.js --task=backup && echo "done"

# ✅ 推荐，用脚本文件
0 9 * * * /app/scripts/backup.sh
```

脚本文件头部加上：
```bash
#!/bin/bash
set -euo pipefail   # 遇到错误立即退出

# 切换到项目目录
cd /app || exit 1
```

### 2. 防止任务重叠运行（flock）

```bash
# 使用 flock 加锁，防止上一个任务还没跑完下一个就启动
0 * * * * flock -n /tmp/mytask.lock /app/scripts/task.sh
```

### 3. 任务超时保护

```bash
# 最多运行 300 秒，超时强制终止
0 9 * * * timeout 300 /app/scripts/backup.sh
```

### 4. 执行失败发送告警

```bash
#!/bin/bash
# backup.sh
set -e

do_backup() {
    # 实际备份逻辑
    rsync -avz /data/ user@backup-server:/backup/
}

if ! do_backup; then
    # 失败时发送邮件（需要配置 mail）
    echo "Backup failed at $(date)" | mail -s "ALERT: Backup Failed" admin@example.com
    exit 1
fi

echo "Backup completed at $(date)"
```

### 5. 使用 run-parts 管理多个任务

```bash
# 每小时运行 /etc/cron.hourly/ 目录下的所有脚本
0 * * * * run-parts /etc/cron.hourly

# 系统默认已经有这几个目录
/etc/cron.hourly/
/etc/cron.daily/
/etc/cron.weekly/
/etc/cron.monthly/
```

---

## 七、常见问题排查

**问题 1：任务列表里有，但没有执行**

检查步骤：
```bash
# 1. 确认 cron 服务在运行
systemctl status cron        # Ubuntu
systemctl status crond       # CentOS

# 2. 查看日志
grep CRON /var/log/syslog | tail -20

# 3. 手动执行脚本确认没有错误
bash /app/scripts/task.sh
```

**问题 2：权限不足**

```bash
# 确保脚本有执行权限
chmod +x /app/scripts/task.sh

# 确认运行 cron 的用户有权限访问相关文件
ls -la /app/scripts/task.sh
```

**问题 3：时区问题**

Linux crontab 使用系统时区：
```bash
# 查看系统时区
timedatectl

# 设置系统时区
timedatectl set-timezone Asia/Shanghai

# 或者在 crontab 文件顶部指定时区
CRON_TZ=Asia/Shanghai
0 9 * * * /app/scripts/task.sh
```

---

## 总结

| 场景 | 方案 |
|------|------|
| 防止重叠 | `flock -n /tmp/task.lock` |
| 任务超时 | `timeout 300` |
| 环境变量 | crontab 顶部定义 PATH |
| 日志记录 | `>> /var/log/task.log 2>&1` |
| 时区 | `CRON_TZ=Asia/Shanghai` |

crontab 简单可靠，适合单机定时任务。如果需要分布式、有界面管理、任务依赖等功能，可以考虑升级到 Airflow 或 Kubernetes CronJob。

---

定时任务的 Cron 表达式和其他平台格式互转，可以用 [Hey Cron](https://www.heycron.com)，输入自然语言一键生成多平台配置。
