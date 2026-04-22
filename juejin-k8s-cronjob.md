# Kubernetes CronJob 完整指南：从 Cron 表达式到生产配置

作为后端开发，定时任务是绕不开的需求。在 Kubernetes 环境下，CronJob 是官方推荐的定时任务方案。本文从 Cron 表达式基础讲起，覆盖 CronJob 的完整配置、常见坑和生产最佳实践。

---

## 一、Cron 表达式快速入门

Cron 表达式由 5 个字段组成：

```
┌───────────── 分钟 (0-59)
│ ┌───────────── 小时 (0-23)
│ │ ┌───────────── 日 (1-31)
│ │ │ ┌───────────── 月 (1-12)
│ │ │ │ ┌───────────── 星期 (0-6，0=周日)
│ │ │ │ │
* * * * *
```

常用示例：

| 表达式 | 含义 |
|--------|------|
| `0 9 * * 1` | 每周一早上 9 点 |
| `0 0 * * *` | 每天凌晨 0 点 |
| `*/5 * * * *` | 每 5 分钟 |
| `0 9 * * 1-5` | 工作日每天 9 点 |
| `0 0 1 * *` | 每月 1 号凌晨 |
| `0 */6 * * *` | 每 6 小时 |

> 💡 记不住语法？可以用 [Hey Cron](https://www.heycron.com) 直接输入中文描述生成表达式，比如输入"每周一早上9点"自动生成 `0 9 * * 1`。

---

## 二、Kubernetes CronJob 基础配置

### 最简单的 CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
  namespace: default
spec:
  schedule: "0 9 * * 1"        # 每周一早上 9 点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox
            command: ["/bin/sh", "-c", "echo Hello from CronJob"]
          restartPolicy: OnFailure
```

### 完整字段说明

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: my-cronjob
  namespace: production
spec:
  schedule: "0 9 * * 1"

  # 时区设置（K8s 1.25+ 支持）
  timeZone: "Asia/Shanghai"

  # 并发策略：Allow（默认）/ Forbid / Replace
  concurrencyPolicy: Forbid

  # 调度失败后保留的历史 Job 数量
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1

  # 错过调度时间后的最大补跑窗口（秒）
  startingDeadlineSeconds: 60

  # 是否暂停（不删除 CronJob，只停止调度）
  suspend: false

  jobTemplate:
    spec:
      # Job 超时时间（秒）
      activeDeadlineSeconds: 300

      # 失败重试次数
      backoffLimit: 3

      template:
        spec:
          containers:
          - name: worker
            image: my-image:latest
            resources:
              requests:
                memory: "64Mi"
                cpu: "100m"
              limits:
                memory: "128Mi"
                cpu: "200m"
          restartPolicy: OnFailure
```

---

## 三、时区问题（最常踩的坑）

Kubernetes CronJob 默认使用 **UTC 时间**。如果你的集群在中国，`0 9 * * 1` 实际执行的是北京时间 **17:00**，不是 9:00。

### 解决方案一：手动换算（简单粗暴）

北京时间 = UTC + 8，所以：
- 想要北京时间 9:00 执行 → 填 `0 1 * * 1`（UTC 1:00）

### 解决方案二：使用 timeZone 字段（推荐，K8s 1.25+）

```yaml
spec:
  schedule: "0 9 * * 1"
  timeZone: "Asia/Shanghai"   # 直接指定时区，填写北京时间即可
```

查看集群版本：
```bash
kubectl version --short
```

### 解决方案三：在容器内设置时区

```yaml
containers:
- name: worker
  image: my-image:latest
  env:
  - name: TZ
    value: "Asia/Shanghai"
```

---

## 四、concurrencyPolicy 详解

这个字段控制当上一个 Job 还没跑完、下一个调度时间到了该怎么办：

| 值 | 行为 |
|----|------|
| `Allow`（默认） | 允许并发，新 Job 照常启动 |
| `Forbid` | 禁止并发，跳过本次调度 |
| `Replace` | 取消正在运行的 Job，启动新 Job |

**生产建议：** 大多数情况用 `Forbid`，避免任务堆积。数据处理类任务尤其要设置这个。

```yaml
concurrencyPolicy: Forbid
```

---

## 五、常用操作命令

```bash
# 查看所有 CronJob
kubectl get cronjob -n <namespace>

# 查看 CronJob 详情（包括上次/下次执行时间）
kubectl describe cronjob my-cronjob -n <namespace>

# 查看由 CronJob 创建的 Job
kubectl get jobs -n <namespace> --selector=job-name

# 手动触发一次 CronJob（用于测试）
kubectl create job --from=cronjob/my-cronjob manual-trigger -n <namespace>

# 暂停 CronJob（不删除，只停止调度）
kubectl patch cronjob my-cronjob -p '{"spec":{"suspend":true}}' -n <namespace>

# 恢复 CronJob
kubectl patch cronjob my-cronjob -p '{"spec":{"suspend":false}}' -n <namespace>

# 删除 CronJob（同时删除其创建的所有 Job）
kubectl delete cronjob my-cronjob -n <namespace>

# 查看 Job 的 Pod 日志
kubectl logs -l job-name=my-cronjob-<timestamp> -n <namespace>
```

---

## 六、生产最佳实践

### 1. 永远设置资源限制

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

不设置资源限制的 CronJob 在高负载时会把节点打垮。

### 2. 设置超时时间

```yaml
spec:
  activeDeadlineSeconds: 600   # Job 最多跑 10 分钟，超时强制终止
```

避免任务卡死后一直占用资源。

### 3. 控制历史记录数量

```yaml
successfulJobsHistoryLimit: 3
failedJobsHistoryLimit: 1
```

默认保留 3 个成功和 1 个失败的 Job 记录，调小一点节省 etcd 空间。

### 4. 幂等性设计

CronJob 可能因为各种原因被重复执行（`startingDeadlineSeconds` 内的补跑），你的任务代码必须是幂等的——执行一次和执行多次的结果要一致。

### 5. 用 ConfigMap 管理脚本

```yaml
volumes:
- name: scripts
  configMap:
    name: cronjob-scripts
    defaultMode: 0755
containers:
- name: worker
  volumeMounts:
  - name: scripts
    mountPath: /scripts
  command: ["/scripts/run.sh"]
```

把脚本放进 ConfigMap，更新脚本不需要重新构建镜像。

---

## 七、监控和告警

### 检查 Job 是否成功

```bash
kubectl get jobs -n <namespace> \
  --sort-by=.status.startTime \
  | tail -5
```

### 推荐监控指标（Prometheus）

- `kube_cronjob_next_schedule_time`：下次执行时间
- `kube_job_status_failed`：失败的 Job 数量
- `kube_job_complete`：成功完成的 Job 数量

建议在 Grafana 里配一个 CronJob 执行状态面板，失败时触发 AlertManager 告警。

---

## 总结

| 场景 | 推荐配置 |
|------|---------|
| 不允许并发执行 | `concurrencyPolicy: Forbid` |
| 需要北京时间 | `timeZone: "Asia/Shanghai"`（K8s 1.25+）|
| 任务有超时风险 | `activeDeadlineSeconds: 300` |
| 生产环境 | 必须设置 `resources.limits` |

Kubernetes CronJob 配置虽然字段多，但核心就是这几个：`schedule`、`concurrencyPolicy`、`timeZone`、`activeDeadlineSeconds`。把这几个配对了，大部分场景都能覆盖。

---

如果你经常需要在不同平台之间转换 Cron 表达式（K8s / GitHub Actions / Jenkins / Airflow），可以试试 [Hey Cron](https://www.heycron.com)，输入自然语言直接生成多平台配置，省去反复查文档的时间。
