/**
 * dfd-app 微应用注册配置
 * 数据发现域子应用
 */
import type { MicroAppRegistry } from '@/shared/registry/types'

const registry: MicroAppRegistry = {
  app: {
    name: 'dfd-app',
    version: '1.0.0',
    description: '数据发现域子应用（资产字典、要素字典、资源字典、搜索分析）'
  },
  basePath: '/dfd',
  entry: 'http://localhost:5184',
  menu: [
    {
      key: 'dfd-index',
      label: '数据发现',
      icon: 'icon-apps',
      path: '/dfd',
      order: 1
    },
    {
      key: 'dfd-asset-guide',
      label: '资产导览',
      icon: 'icon-info-circle',
      path: '/dfd/asset-guide',
      order: 2
    },
    {
      key: 'dfd-data-map',
      label: '数据地图',
      icon: 'icon-mind-mapping',
      path: '/dfd/data-map',
      order: 3
    },
    {
      key: 'dfd-unified-metrics',
      label: '统一指标',
      icon: 'icon-dashboard',
      path: '/dfd/unified-metrics',
      order: 4
    },
    // 资产字典
    {
      key: 'dfd-asset-dict',
      label: '资产字典',
      icon: 'icon-book',
      order: 10,
      children: [
        { key: 'dfd-asset-catalog', label: '资产目录', path: '/dfd/asset-catalog' },
        { key: 'dfd-asset-management', label: '资产管理', path: '/dfd/asset-management' },
        { key: 'dfd-asset-overview', label: '资产总览', path: '/dfd/asset-overview' },
        { key: 'dfd-favorites', label: '资产收藏', path: '/dfd/favorites' }
      ]
    },
    // 要素字典
    {
      key: 'dfd-element-dict',
      label: '要素字典',
      icon: 'icon-list',
      order: 11,
      children: [
        { key: 'dfd-variable-dict', label: '变量字典', path: '/dfd/variable-dict' },
        { key: 'dfd-indicator-dict', label: '指标字典', path: '/dfd/indicator-dict' },
        { key: 'dfd-feature-dict', label: '特征字典', path: '/dfd/feature-dict' }
      ]
    },
    // 资源字典
    {
      key: 'dfd-resource-dict',
      label: '资源字典',
      icon: 'icon-cloud',
      order: 12,
      children: [
        { key: 'dfd-data-resources', label: '资源列表', path: '/dfd/data-resources' },
        { key: 'dfd-external', label: '外部数据', path: '/dfd/external' }
      ]
    },
    // 运营工具
    {
      key: 'dfd-ops',
      label: '运营工具',
      icon: 'icon-tool',
      order: 13,
      children: [
        { key: 'dfd-lineage', label: '血缘分析', path: '/dfd/lineage' },
        { key: 'dfd-impact-analysis', label: '影响分析', path: '/dfd/impact-analysis' }
      ]
    },
    // 搜索
    {
      key: 'dfd-search',
      label: '统一搜索',
      icon: 'icon-search',
      path: '/dfd/search',
      order: 14
    },
    // 其他
    {
      key: 'dfd-other',
      label: '其他',
      icon: 'icon-app',
      order: 15,
      children: [
        { key: 'dfd-customer360', label: '客户360', path: '/dfd/customer360' },
        { key: 'dfd-credit', label: '征信', path: '/dfd/credit' },
        { key: 'dfd-metrics-map', label: '指标地图', path: '/dfd/metrics-map' },
        { key: 'dfd-api-market', label: 'API市场', path: '/dfd/api-market' },
        { key: 'dfd-indicator-dashboard', label: '指标看板', path: '/dfd/indicator-dashboard' },
        { key: 'dfd-feature-map', label: '特征地图', path: '/dfd/feature-map' }
      ]
    }
  ],
  routes: []
}

export default registry
