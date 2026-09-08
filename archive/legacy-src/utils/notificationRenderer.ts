import { ALERT_METRICS_BY_GRANULARITY } from '@/mock/alertMetrics'

export function operatorText(op: string): string {
  return ({
    greater_than: '大于',
    less_than: '小于',
    equal: '等于',
    greater_equal: '大于等于',
    less_equal: '小于等于'
  } as Record<string, string>)[op] || ''
}

function buildMetricInfoMap(granularity: string) {
  const metrics = ALERT_METRICS_BY_GRANULARITY[granularity] || []
  const map: Record<string, any> = {}
  for (const m of metrics) map[m.value] = m
  return map
}

export function formatMetricExpression(cfg: { metric: string; operator: string; threshold: number }, granularity: string): string {
  if (!cfg || !cfg.metric || cfg.threshold === undefined || !cfg.operator) return ''
  const infoMap = buildMetricInfoMap(granularity)
  const label = infoMap[cfg.metric]?.label || cfg.metric
  const unitType = infoMap[cfg.metric]?.unitType === 'percentage' ? '%' : ''
  return `${label} ${operatorText(cfg.operator)} ${cfg.threshold}${unitType}`
}

function substitute(template: string, vars: Record<string, string>) {
  const t = (template || '')
    .replace(/\{\{\s*规则名称\s*\}\}/g, vars['规则名称'] ?? '')
    .replace(/\{\{\s*监控类型\s*\}\}/g, vars['监控类型'] ?? '')
    .replace(/\{\{\s*监控粒度\s*\}\}/g, vars['监控粒度'] ?? '')
    .replace(/\{\{\s*监控范围\s*\}\}/g, vars['监控范围'] ?? '')
    .replace(/\{\{\s*统计窗口\s*\}\}/g, vars['统计窗口'] ?? '')
    .replace(/\{\{\s*指标名称\s*\}\}/g, vars['指标名称'] ?? '')
    .replace(/\{\{\s*指标值\s*\}\}/g, vars['指标值'] ?? '')
    .replace(/\{\{\s*操作符\s*\}\}/g, vars['操作符'] ?? '')
    .replace(/\{\{\s*预警阈值\s*\}\}/g, vars['预警阈值'] ?? '')
    .replace(/\{\{\s*单位\s*\}\}/g, vars['单位'] ?? '')
    .replace(/\{\{\s*券库存名称\s*\}\}/g, vars['券库存名称'] ?? '')
    .replace(/\{\{\s*券包名称\s*\}\}/g, vars['券包名称'] ?? '')
    .replace(/\{\{\s*对象数量\s*\}\}/g, vars['对象数量'] ?? '')
    .replace(/\{\{\s*对象清单\s*\}\}/g, vars['对象清单'] ?? '')
    .replace(/\{\{\s*时间\s*\}\}/g, vars['时间'] ?? '')
  return t
}

function normalizeTemplate(tpl: string): string {
  if (!tpl) return tpl
  return tpl
    .replace(/【券库存名称】/g, '{{券库存名称}}')
    .replace(/【券包名称】/g, '{{券包名称}}')
    .replace(/【指标值】/g, '{{指标值}}')
}

export function renderAlertPreview(options: { name: string; metricConfigs: Array<{ metric: string; operator: string; threshold: number; window?: string; content?: string; extraVars?: Record<string,string> }>; granularity: string; contentUnified?: string; selectedInventories?: any[]; selectedPackages?: any[]; type?: string; scope?: string[]; extraVars?: Record<string,string> }): string {
  const lines: string[] = []
  const infoMap = buildMetricInfoMap(options.granularity)
  lines.push(`【预警通知】规则：${options.name || '未命名规则'}`)
  const scopeVals = Array.isArray(options.scope) ? options.scope : []
  const scopeLabel = (() => {
    const t = options.type
    const g = options.granularity
    if (t === 'inventory') {
      if (g === 'coupon_stock') return scopeVals.includes('custom_stock') ? '指定券库存' : '全部券库存'
      if (g === 'coupon_package') return scopeVals.includes('custom_packages') ? '指定券包' : '全部券包'
      if (g === 'coupon_instance_lifecycle') return '全部生命周期'
    }
    if (t === 'expiry') {
      if (g === 'coupon_stock') return '全部券库存'
      if (g === 'coupon_package') return '全部券包'
    }
    if (t === 'failure') return '全部生命周期'
    return (options.selectedInventories && options.selectedInventories.length > 0) || (options.selectedPackages && options.selectedPackages.length > 0) ? '指定对象' : '全部对象'
  })()
  for (const cfg of options.metricConfigs || []) {
    const exp = formatMetricExpression(cfg, options.granularity)
    if (exp) lines.push(`命中指标：${exp}`)
    const unitType = infoMap[cfg.metric]?.unitType === 'percentage' ? '%' : ''
    const metricLabel = infoMap[cfg.metric]?.label || cfg.metric
    const granularityLabel = (
      options.granularity === 'coupon_stock' ? '券库存粒度' :
      options.granularity === 'coupon_package' ? '券包粒度' :
      options.granularity === 'coupon_instance_lifecycle' ? '券实例生命周期粒度' : options.granularity
    )
    const invName = (options.selectedInventories && options.selectedInventories.length > 0) ? `已选${options.selectedInventories.length}项` : '全部券库存'
    const pkgName = (options.selectedPackages && options.selectedPackages.length > 0) ? `已选${options.selectedPackages.length}项` : '全部券包'
    let vars: Record<string,string> = {
      '规则名称': options.name || '未命名规则',
      '监控类型': '',
      '监控粒度': granularityLabel,
      '监控范围': scopeLabel,
      '统计窗口': cfg.window === 'today' ? '当日' : cfg.window === '24h' ? '最近24小时' : cfg.window === '7d' ? '最近7天' : '',
      '指标名称': metricLabel,
      '指标值': '示例值',
      '操作符': operatorText(cfg.operator),
      '预警阈值': `${cfg.threshold}${unitType}`,
      '单位': unitType,
      '券库存名称': invName,
      '券包名称': pkgName,
      '对象数量': (options.selectedInventories && options.selectedInventories.length > 0) ? String(options.selectedInventories.length) : (options.selectedPackages && options.selectedPackages.length > 0) ? String(options.selectedPackages.length) : '全部',
      '对象清单': (options.selectedInventories && options.selectedInventories.length > 0) || (options.selectedPackages && options.selectedPackages.length > 0) ? '已选项' : '全部'
    }
    if (options.extraVars) vars = { ...vars, ...options.extraVars }
    if (cfg.extraVars) vars = { ...vars, ...cfg.extraVars }
    const preset = normalizeTemplate(infoMap[cfg.metric]?.presetNotice || '')
    const perMetricContent = (cfg.content && cfg.content.trim())
      ? substitute(cfg.content, vars)
      : preset
      ? substitute(preset, vars)
      : `${metricLabel}在${granularityLabel}下${operatorText(cfg.operator)}阈值${vars.threshold}，当前值：${vars.metricValue}`
    lines.push(perMetricContent)
  }
  if (options.contentUnified && options.contentUnified.trim()) {
    const granularityLabel = (
      options.granularity === 'coupon_stock' ? '券库存粒度' :
      options.granularity === 'coupon_package' ? '券包粒度' :
      options.granularity === 'coupon_instance_lifecycle' ? '券实例生命周期粒度' : options.granularity
    )
    const invName = (options.selectedInventories && options.selectedInventories.length > 0) ? `已选${options.selectedInventories.length}项` : '全部券库存'
    const pkgName = (options.selectedPackages && options.selectedPackages.length > 0) ? `已选${options.selectedPackages.length}项` : '全部券包'
    let baseVars: Record<string,string> = {
      '规则名称': options.name || '未命名规则',
      '监控类型': '',
      '监控粒度': granularityLabel,
      '监控范围': scopeLabel,
      '统计窗口': '',
      '指标名称': '',
      '指标值': '',
      '操作符': '',
      '预警阈值': '',
      '单位': '',
      '券库存名称': invName,
      '券包名称': pkgName,
      '对象数量': (options.selectedInventories && options.selectedInventories.length > 0) ? String(options.selectedInventories.length) : (options.selectedPackages && options.selectedPackages.length > 0) ? String(options.selectedPackages.length) : '全部',
      '对象清单': (options.selectedInventories && options.selectedInventories.length > 0) || (options.selectedPackages && options.selectedPackages.length > 0) ? '已选项' : '全部'
    }
    if (options.extraVars) baseVars = { ...baseVars, ...options.extraVars }
    lines.push(substitute(normalizeTemplate(options.contentUnified), baseVars))
  }
  return lines.join('\n')
}
