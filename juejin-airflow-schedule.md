# Apache Airflow 定时任务完整指南：schedule 参数从入门到生产

Apache Airflow 是目前最流行的工作流编排工具之一，广泛用于数据管道、ETL、ML 流水线等场景。其中定时调度（schedule）是 Airflow 最核心的功能之一，本文覆盖所有相关知识点。

---

## 一、schedule 参数基础

Airflow DAG 通过 `schedule` 参数控制执行频率（旧版本叫 `schedule_interval`）：

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

with DAG(
    dag_id='my_dag',
    start_date=datetime(2024, 1, 1),
    schedule='0 9 * * 1',   # 每周一早上 9 点（UTC）
    catchup=False,
) as dag:
    task = PythonOperator(
        task_id='my_task',
        python_callable=lambda: print("Hello"),
    )
```

---

## 二、schedule 支持的三种格式

### 格式 1：Cron 表达式

```python
schedule='0 9 * * 1'      # 每周一 UTC 9:00
schedule='*/30 * * * *'   # 每30分钟
schedule='0 0 1 * *'      # 每月1号凌晨
```

Cron 表达式规则：

```
┌───────────── 分钟 (0-59)
│ ┌───────────── 小时 (0-23)
│ │ ┌───────────── 日 (1-31)
│ │ │ ┌───────────── 月 (1-12)
│ │ │ │ ┌───────────── 星期 (0-6，0=周日)
│ │ │ │ │
* * * * *
```

> 💡 快速生成 Cron 表达式：用 [Hey Cron](https://www.heycron.com) 输入中文描述，例如"每周一早上9点"，自动输出 Airflow 格式配置。

### 格式 2：预设字符串

Airflow 内置了几个常用预设：

| 预设 | 等同于 | 含义 |
|------|--------|------|
| `@once` | — | 只运行一次 |
| `@hourly` | `0 * * * *` | 每小时 |
| `@daily` | `0 0 * * *` | 每天凌晨 |
| `@weekly` | `0 0 * * 0` | 每周日凌晨 |
| `@monthly` | `0 0 1 * *` | 每月1号凌晨 |
| `@yearly` | `0 0 1 1 *` | 每年1月1号 |

```python
schedule='@daily'   # 简洁写法
```

### 格式 3：timedelta 对象

```python
from datetime import timedelta

schedule=timedelta(hours=6)    # 每6小时
schedule=timedelta(days=1)     # 每天
schedule=timedelta(minutes=30) # 每30分钟
```

`timedelta` 的调度时间基于上次运行时间，适合"间隔固定时长"的场景（而非"固定时间点"）。

---

## 三、时区配置（重要）

Airflow 默认使用 UTC 时间。有两种方式处理时区：

### 方式 1：DAG 级别指定时区（推荐，Airflow 2.2+）

```python
import pendulum

with DAG(
    dag_id='my_dag',
    start_date=pendulum.datetime(2024, 1, 1, tz='Asia/Shanghai'),
    schedule='0 9 * * 1',   # 北京时间 9:00
) as dag:
    ...
```

### 方式 2：全局时区配置

在 `airflow.cfg` 中设置：
```ini
[core]
default_timezone = Asia/Shanghai
```

或环境变量：
```bash
export AIRFLOW__CORE__DEFAULT_TIMEZONE=Asia/Shanghai
```

### 时区换算（不配置时区时）

北京时间 = UTC + 8，所以：
- 北京时间 9:00 → Cron 填 `0 1 * * *`（UTC 1:00）
- 北京时间 0:00 → Cron 填 `0 16 * * *`（UTC 前一天 16:00）

---

## 四、关键参数详解

### catchup（补跑）

这是 Airflow 最容易踩坑的参数之一：

```python
with DAG(
    dag_id='my_dag',
    start_date=datetime(2024, 1, 1),
    schedule='@daily',
    catchup=True,   # 默认！会补跑 start_date 到现在的所有任务
) as dag:
    ...
```

如果你今天才创建这个 DAG，但 `start_date` 是 3 个月前，Airflow 默认会**把过去 3 个月的任务全部补跑**！

**生产建议：永远设置 `catchup=False`**，除非你明确需要补跑历史数据。

```python
catchup=False   # 只从现在开始调度，不补跑历史
```

### max_active_runs（并发控制）

```python
with DAG(
    dag_id='my_dag',
    schedule='*/10 * * * *',
    max_active_runs=1,   # 同时只允许1个实例在运行
) as dag:
    ...
```

类似 Kubernetes 的 `concurrencyPolicy: Forbid`，防止任务堆积。

### start_date 注意事项

```python
# ❌ 不要用动态时间
start_date=datetime.now()       # 每次重启 DAG 时间不同，行为不可预测
start_date=datetime.today()     # 同上

# ✅ 用固定时间
start_date=datetime(2024, 1, 1)
start_date=pendulum.datetime(2024, 1, 1, tz='Asia/Shanghai')
```

---

## 五、数据区间（data_interval）理解

Airflow 有一个很重要的概念：**DAG 的执行时间不等于调度时间**。

以 `schedule='@daily'`（每天 UTC 0:00）为例：
- `2024-01-02 00:00` 触发的任务，处理的是 `2024-01-01` 的数据
- `logical_date`（逻辑时间）= `2024-01-01 00:00`
- `data_interval_start` = `2024-01-01 00:00`
- `data_interval_end` = `2024-01-02 00:00`

在任务中获取数据区间：

```python
def my_task(**context):
    data_interval_start = context['data_interval_start']
    data_interval_end = context['data_interval_end']
    logical_date = context['logical_date']
    
    print(f"处理 {data_interval_start} 到 {data_interval_end} 的数据")

task = PythonOperator(
    task_id='my_task',
    python_callable=my_task,
    provide_context=True,
)
```

---

## 六、完整生产示例

### 每日数据同步 DAG

```python
import pendulum
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator

with DAG(
    dag_id='daily_data_sync',
    description='每天凌晨同步前一天数据',
    start_date=pendulum.datetime(2024, 1, 1, tz='Asia/Shanghai'),
    schedule='0 1 * * *',   # 北京时间每天凌晨1点
    catchup=False,
    max_active_runs=1,
    tags=['data', 'sync'],
    default_args={
        'retries': 2,
        'retry_delay': pendulum.duration(minutes=5),
        'email_on_failure': True,
        'email': ['alert@example.com'],
    },
) as dag:

    start = EmptyOperator(task_id='start')

    def extract(**context):
        ds = context['ds']  # 逻辑日期，格式 2024-01-01
        print(f"提取 {ds} 的数据")
        # 实际提取逻辑...

    def transform(**context):
        ds = context['ds']
        print(f"转换 {ds} 的数据")

    def load(**context):
        ds = context['ds']
        print(f"加载 {ds} 的数据")

    extract_task = PythonOperator(task_id='extract', python_callable=extract)
    transform_task = PythonOperator(task_id='transform', python_callable=transform)
    load_task = PythonOperator(task_id='load', python_callable=load)

    end = EmptyOperator(task_id='end')

    start >> extract_task >> transform_task >> load_task >> end
```

### 定时报告 DAG

```python
import pendulum
from airflow import DAG
from airflow.operators.python import PythonOperator

with DAG(
    dag_id='weekly_report',
    start_date=pendulum.datetime(2024, 1, 1, tz='Asia/Shanghai'),
    schedule='0 9 * * 1',   # 北京时间每周一上午9点
    catchup=False,
) as dag:

    def generate_report(**context):
        week_start = context['data_interval_start'].strftime('%Y-%m-%d')
        week_end = context['data_interval_end'].strftime('%Y-%m-%d')
        print(f"生成 {week_start} 到 {week_end} 的周报")

    def send_report():
        print("发送周报邮件")

    generate = PythonOperator(task_id='generate', python_callable=generate_report)
    send = PythonOperator(task_id='send', python_callable=send_report)

    generate >> send
```

---

## 七、触发方式对比

| 方式 | 场景 | 示例 |
|------|------|------|
| Cron 表达式 | 固定时间点 | `0 9 * * 1` |
| timedelta | 固定间隔 | `timedelta(hours=6)` |
| `@once` | 只运行一次 | 初始化任务 |
| 手动触发 | 测试/紧急 | UI 点击 Trigger |
| 外部触发 | 事件驱动 | `TriggerDagRunOperator` |

---

## 总结

| 参数 | 推荐设置 |
|------|---------|
| `catchup` | `False`（生产环境） |
| `max_active_runs` | `1`（防止并发堆积） |
| 时区 | 用 pendulum 明确指定 |
| `start_date` | 固定日期，不用 `datetime.now()` |
| 重试 | `retries=2`，`retry_delay=5分钟` |

---

Airflow 的 Cron 表达式和其他平台（Kubernetes CronJob、GitHub Actions、Jenkins）格式互转，可以用 [Hey Cron](https://www.heycron.com)，输入一句话一次生成所有平台配置。
