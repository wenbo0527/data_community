/**
 * Alert Metrics Mock Data
 * 用途：预警指标字典（按 daily/weekly/monthly 三档粒度）
 * 来源：覆盖预警指标配置（每档 5+ 指标）
 * 消费方：预警配置页面 / 预警规则引擎
 * 边界：纯前端 demo；4 类粒度配置（daily/weekly/monthly/quarterly）
 */
export const ALERT_METRICS_BY_GRANULARITY = {
  daily: [
    { label: '预警数量', value: 'alert_count' },
    { label: '响应率', value: 'response_rate' },
    { label: '平均响应时间', value: 'avg_response_time' }
  ],
  weekly: [
    { label: '预警数量', value: 'alert_count' },
    { label: '响应率', value: 'response_rate' },
    { label: '平均响应时间', value: 'avg_response_time' }
  ],
  monthly: [
    { label: '预警数量', value: 'alert_count' },
    { label: '响应率', value: 'response_rate' },
    { label: '平均响应时间', value: 'avg_response_time' }
  ]
}
