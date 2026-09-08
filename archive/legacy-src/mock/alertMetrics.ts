export type AlertMetric = {
  value: string
  label: string
  description?: string
  defaultThreshold?: string
  businessMeaning?: string
  unitType?: 'percentage' | 'absolute'
  presetNotice?: string
}

export const STOCK_METRICS: AlertMetric[] = [
  { value: 'remaining_stock_count', label: '剩余有效库存量', description: '监控可下发库存量', defaultThreshold: '100', businessMeaning: '库存低于设定值触发预警', unitType: 'absolute', presetNotice: '券库存：【券库存名称】剩余不足【指标值】张，请关注' },
  { value: 'remaining_stock_ratio', label: '剩余有效库存比例', description: '剩余占比监控', defaultThreshold: '10', businessMeaning: '比例低于阈值触发预警', unitType: 'percentage', presetNotice: '券库存：【券库存名称】剩余不足【指标值】，请关注' },
  { value: 'remaining_valid_days', label: '剩余有效天数', description: '未发放券剩余天数', defaultThreshold: '7', businessMeaning: '临期库存处理提醒', unitType: 'absolute', presetNotice: '券库存：【券库存名称】有效期不足【指标值】日，请关注' }
]

export const PACKAGE_METRICS: AlertMetric[] = [
  { value: 'package_remaining_days', label: '券包剩余有效期天数', description: '券包有效期监控', defaultThreshold: '3', businessMeaning: '券包即将过期提醒', unitType: 'absolute', presetNotice: '券包：【券包名称】有效期不足【指标值】日，请关注' },
  { value: 'package_valid_stock', label: '券包下有效库存量', description: '券包可用库存量', defaultThreshold: '50', businessMeaning: '库存不足调整投放', unitType: 'absolute', presetNotice: '券包：【券包名称】下剩余不足【指标值】张，请关注' },
  { value: 'daily_distribution_success_rate', label: '当日下发成功率', description: '当天发放成功率', defaultThreshold: '95', businessMeaning: '成功率骤降排查异常', unitType: 'percentage', presetNotice: '今日【券包名称】下发失败率超过【指标值】，请关注' }
]

export const LIFECYCLE_METRICS: AlertMetric[] = [
  { value: 'redemption_failure_ratio', label: '券核销失败占比', description: '核销失败比例', defaultThreshold: '5', businessMeaning: '识别系统或规则问题', unitType: 'percentage', presetNotice: '今日【券库存名称】核销失败超过【指标值】，请关注' },
  { value: 'distribution_failure_rate', label: '下发失败率', description: '领取/发放失败比例', defaultThreshold: '5', businessMeaning: '领券到核销路径中的领取失败监控', unitType: 'percentage', presetNotice: '今日【券库存名称】下发失败率超过【指标值】，请关注' }
]

export const ALERT_METRICS_BY_GRANULARITY: Record<string, AlertMetric[]> = {
  coupon_stock: STOCK_METRICS,
  coupon_package: PACKAGE_METRICS,
  coupon_instance_lifecycle: LIFECYCLE_METRICS
}

// 注册表：按 value 快速索引指标定义
const METRIC_REGISTRY: Record<string, AlertMetric> = {}
;[...STOCK_METRICS, ...PACKAGE_METRICS, ...LIFECYCLE_METRICS].forEach(m => { METRIC_REGISTRY[m.value] = m })

// 按监控类型与粒度限制可选指标（与业务需求一致）
export const ALERT_METRICS_BY_TYPE_AND_GRANULARITY: Record<string, Record<string, AlertMetric[]>> = {
  expiry: {
    coupon_stock: [METRIC_REGISTRY['remaining_valid_days']],
    coupon_package: [METRIC_REGISTRY['package_remaining_days']]
  },
  inventory: {
    coupon_stock: [METRIC_REGISTRY['remaining_stock_count'], METRIC_REGISTRY['remaining_stock_ratio']],
    coupon_package: [METRIC_REGISTRY['package_valid_stock']]
  },
  failure: {
    coupon_package: [METRIC_REGISTRY['daily_distribution_success_rate']],
    coupon_instance_lifecycle: [METRIC_REGISTRY['redemption_failure_ratio'], METRIC_REGISTRY['distribution_failure_rate']]
  }
}
