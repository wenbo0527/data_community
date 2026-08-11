/**
 * 命名统一(P2#2 整合点)
 *
 * 同一概念用统一名称展示。例:
 *   - 数据地图 / 资产目录 / 资产总览 → "数据地图"
 *   - 数据地图 / 资产地图 / Data Map → "数据地图"
 *
 * 落地:菜单配置 / 页面标题 / 工具提示 都从此处取。
 */

export const NAMING = {
  // 资产相关
  dataMap: '数据地图',
  assetCatalog: '资产目录', // 同义词别名
  assetOverview: '资产总览', // 卡片式摘要

  // 客户
  customer360: '客户 360',
  customerInsight: '客户洞察',

  // 指标
  metric: '指标',
  metricMap: '指标地图',
  metricManagement: '指标管理',
  metricDashboard: '指标看板',

  // 标签/人群/圈选
  tag: '标签',
  tagSystem: '标签体系',
  tagManagement: '标签管理',
  audience: '人群',
  audienceSystem: '客群中心',
  audienceManagement: '人群管理',
  crowdQuery: '圈选',

  // 数据源/服务
  dataSource: '数据源',
  dataService: '数据服务',
  apiMarket: 'API 市场',

  // 探索
  exploration: '数据探索',
  workflow: '分析流程',
  indicatorDashboard: '指标看板',

  // 管理
  metadata: '元数据',
  metadataModeling: '元数据建模',
  metadataCollection: '元数据采集',
  dataStandard: '数据标准',
  dataPermission: '数据权限',
  businessConcept: '业务概念',

  // 系统
  businessDomain: '业务域',
  search: '统一搜索',
  favorite: '我的收藏'
} as const

/**
 * 别名(老名称 → 新名称)
 * 用于路由重定向、菜单合并。
 */
export const NAMING_ALIASES: Record<string, string> = {
  // 资产目录 → 数据地图
  '资产目录': '数据地图',
  'asset-catalog': 'data-map',
  'asset_catalog': 'data_map',

  // 资产总览 → 数据地图(首页摘要视图)
  '资产总览': '资产总览', // 保留,作为摘要视图名称

  // 客群中心 = 人群系统
  '客群中心': '客群中心',
  '人群系统': '客群中心',

  // 圈选 → 圈选(独立术语)
  '圈选': '圈选'
}

/**
 * 取规范名称(供 UI 展示)
 */
export function getName(key: keyof typeof NAMING): string {
  return NAMING[key]
}

/**
 * 旧名称 → 新名称(用于平滑迁移)
 */
export function resolveAlias(oldName: string): string {
  return NAMING_ALIASES[oldName] || oldName
}