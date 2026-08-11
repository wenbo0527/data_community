/**
 * 侧边栏菜单配置
 *
 * 文档依据:
 *   §1 产品定位:数据消费 + 数据治理一体化
 *   §7 角色场景:5 种角色的入口矩阵
 *
 * 设计原则:
 *   1. 菜单按"数据发现 / 数据管理"两大主题聚合
 *   2. 每个菜单项都标注适用角色
 *   3. 路径严格对齐 router/modules/*.js
 *   4. P0 必做功能(影响分析/我的关注)用红色高亮
 *
 * @see 文档 §7 角色场景
 */
const menuConfig = [
  // ========================================
  // 顶层菜单 - 工作台
  // ========================================
  {
    key: 'workbench',
    label: '工作台',
    icon: 'IconDashboard',
    path: '/home',
    roles: ['all']
  },

  // ========================================
  // 数据发现(消费侧)
  // ========================================
  {
    key: 'discovery',
    label: '数据发现',
    icon: 'IconSearch',
    roles: ['business', 'analyst', 'modeler', 'admin'],
    children: [
      // 总览
      {
        key: 'discovery-overview',
        label: '资产总览',
        path: '/discovery/asset-overview',
        icon: 'IconApps',
        roles: ['all']
      },
      {
        key: 'discovery-guide',
        label: '资产导览',
        path: '/discovery/asset-guide',
        icon: 'IconCompass',
        roles: ['business', 'analyst']
      },

      // 我的关注(P0)
      {
        key: 'discovery-favorites',
        label: '我的关注',
        path: '/discovery/favorites',
        icon: 'IconStar',
        highlight: true,
        roles: ['all']
      },

      // 统一搜索(§11)
      {
        key: 'discovery-search',
        label: '统一搜索',
        path: '/discovery/search',
        icon: 'IconSearch',
        roles: ['all']
      },

      // 客户 360
      {
        key: 'discovery-customer360',
        label: '客户 360',
        path: '/discovery/customer360',
        icon: 'IconUser',
        roles: ['business', 'analyst']
      },

      // 数据资源(原始数据)
      {
        key: 'discovery-resources',
        label: '数据资源',
        icon: 'IconStorage',
        roles: ['admin', 'analyst'],
        children: [
          { key: 'res-business', label: '业务系统', path: '/discovery/data-resources/business-system', icon: 'IconDesktop' },
          { key: 'res-external', label: '外部数据', path: '/discovery/data-resources/external-data', icon: 'IconCloud' },
          { key: 'res-file', label: '文件导入', path: '/discovery/data-resources/file-import', icon: 'IconFile' },
          { key: 'res-log', label: '日志数据', path: '/discovery/data-resources/log-data', icon: 'IconBook' },
          { key: 'res-realtime', label: '实时数据', path: '/discovery/data-resources/real-time-data', icon: 'IconThunderbolt' }
        ]
      },

      // 数据消费地图
      {
        key: 'discovery-data-map',
        label: '数据消费地图',
        path: '/discovery/data-map',
        icon: 'IconMap',
        roles: ['all'],
        children: [
          { key: 'data-map-main', label: '数据地图', path: '/discovery/data-map', icon: 'IconMap' },
          { key: 'data-map-collections', label: '常用表管理', path: '/discovery/data-map/collections', icon: 'IconCommon' }
        ]
      },

      // 资产管理(发现侧)
      {
        key: 'discovery-asset-mgmt',
        label: '资产管理(消费)',
        icon: 'IconCommon',
        roles: ['analyst', 'admin'],
        children: [
          { key: 'asset-mgmt-overview', label: '总览', path: '/discovery/asset-management/overview', icon: 'IconApps' },
          { key: 'asset-mgmt-table', label: '表管理', path: '/discovery/asset-management/table-management', icon: 'IconTable' },
          { key: 'asset-mgmt-field', label: '字段管理', path: '/discovery/asset-management/field-management', icon: 'IconList' },
          { key: 'asset-mgmt-batch', label: '批量管理', path: '/discovery/asset-management/batch-asset-management', icon: 'IconBatch' },
          { key: 'asset-mgmt-external', label: '外采登记', path: '/discovery/asset-management/external-purchase-register', icon: 'IconCart' }
        ]
      },

      // 要素(§2.3 指标/变量/特征)
      {
        key: 'discovery-elements',
        label: '数据要素',
        icon: 'IconBook',
        roles: ['analyst', 'modeler', 'admin'],
        children: [
          { key: 'el-dictionary', label: '要素字典', path: '/discovery/elements-dictionary', icon: 'IconBook', highlight: true },
          { key: 'el-metrics-unified', label: '统一指标管理', path: '/discovery/unified-metrics', icon: 'IconDataLine' },
          { key: 'el-metrics-map', label: '指标地图', path: '/discovery/metrics-map', icon: 'IconChart' },
          { key: 'el-features', label: '特征地图', path: '/discovery/feature-map', icon: 'IconStar' },
          { key: 'el-credit', label: '征信变量', path: '/discovery/credit', icon: 'IconSafe' }
        ]
      },

      // 指标治理
      {
        key: 'discovery-metrics-gov',
        label: '指标治理',
        icon: 'IconSettings',
        roles: ['admin'],
        children: [
          { key: 'metrics-batch', label: '批量注册指标', path: '/discovery/batch-registration', icon: 'IconPlus' },
          { key: 'metrics-regulatory', label: '监管报表配置', path: '/discovery/regulatory-config', icon: 'IconSafe' }
        ]
      },

      // API & 外数
      {
        key: 'discovery-api',
        label: 'API 市场',
        path: '/discovery/api-market',
        icon: 'IconApiApp',
        roles: ['modeler', 'analyst']
      },
      {
        key: 'discovery-external',
        label: '外数管理',
        path: '/discovery/external',
        icon: 'IconCloud',
        roles: ['admin', 'analyst']
      },

      // 血缘 + 影响分析(P0 必做)
      {
        key: 'discovery-lineage',
        label: '数据血缘',
        path: '/discovery/lineage',
        icon: 'IconLink',
        roles: ['analyst', 'admin']
      },
      {
        key: 'discovery-impact',
        label: '上下架影响分析',
        path: '/discovery/impact-analysis',
        icon: 'IconAlert',
        highlight: true,
        roles: ['admin']
      },

      // 智能分级分类
      {
        key: 'discovery-classification',
        label: '智能分级分类',
        path: '/discovery/classification',
        icon: 'IconClassification',
        highlight: true,
        roles: ['admin']
      }
    ]
  },

  // ========================================
  // 数据管理(治理侧)
  // ========================================
  {
    key: 'management',
    label: '数据管理',
    icon: 'IconSettings',
    roles: ['admin', 'governance'],
    children: [
      // 资产总揽
      {
        key: 'mgmt-asset-overview',
        label: '资产总揽',
        path: '/management/asset-management/overview',
        icon: 'IconDataBoard',
        roles: ['admin']
      },

      // 资产登记(§2 上架登记)
      {
        key: 'mgmt-listing',
        label: '资产登记',
        icon: 'IconPlus',
        roles: ['admin', 'governance'],
        children: [
          { key: 'listing-table', label: '表登记', path: '/management/asset-management/listing-management/table-management', icon: 'IconTable' },
          { key: 'listing-metric', label: '指标登记', path: '/management/asset-management/listing-management/metric-management', icon: 'IconDataLine' },
          { key: 'listing-variable', label: '变量登记', path: '/management/asset-management/listing-management/variable-management', icon: 'IconVariable' },
          { key: 'listing-elements', label: '数据要素登记', path: '/management/asset-management/listing-management/data-elements', icon: 'IconBook' },
          { key: 'listing-external', label: '外数登记', path: '/management/asset-management/listing-management/external-data-management', icon: 'IconCloud' }
        ]
      },

      // 基础管理
      {
        key: 'mgmt-basic',
        label: '基础管理',
        icon: 'IconTool',
        roles: ['admin'],
        children: [
          { key: 'basic-tag', label: '标签管理', path: '/management/asset-management/basic-management/tag-management', icon: 'IconTag' },
          { key: 'basic-metadata', label: '元数据采集', path: '/management/asset-management/basic-management/metadata-collection', icon: 'IconStorage' }
        ]
      },

      // 数据标准(§4)
      {
        key: 'mgmt-standard',
        label: '数据标准',
        icon: 'IconBook',
        roles: ['admin', 'governance'],
        children: [
          { key: 'std-main', label: '标准管理', path: '/management/data-standard/standards', icon: 'IconBook' },
          { key: 'std-words', label: '标准单词管理', path: '/management/data-standard/words', icon: 'IconFontColors' },
          { key: 'std-codes', label: '标准代码管理', path: '/management/data-standard/codes', icon: 'IconCode' },
          { key: 'std-domains', label: '数据域管理', path: '/management/data-standard/domains', icon: 'IconLayers' },
          { key: 'std-audit', label: '标准稽核管理', path: '/management/data-standard/audit', icon: 'IconAudit' }
        ]
      },

      // 业务概念(联邦治理)
      {
        key: 'mgmt-business-concept',
        label: '业务概念',
        icon: 'IconConnection',
        roles: ['admin'],
        children: [
          { key: 'bc-domain', label: '业务域管理', path: '/management/business-concept/domain', icon: 'IconLayers' },
          { key: 'bc-entity', label: '业务实体', path: '/management/business-concept/entity', icon: 'IconBox' },
          { key: 'bc-graph', label: '业务关系图', path: '/management/business-concept/graph', icon: 'IconShare' }
        ]
      },

      // 数据模型
      {
        key: 'mgmt-data-models',
        label: '数据模型',
        path: '/management/data-models',
        icon: 'IconBuild',
        roles: ['admin', 'modeler']
      },

      // 元数据
      {
        key: 'mgmt-metadata',
        label: '元数据',
        icon: 'IconStorage',
        roles: ['admin'],
        children: [
          { key: 'meta-query', label: '元数据查询', path: '/management/metadata/query', icon: 'IconSearch' },
          { key: 'meta-modeling', label: '元数据建模', path: '/management/metadata/modeling', icon: 'IconBuild' }
        ]
      },

      // 数据服务
      {
        key: 'mgmt-service',
        label: '数据服务',
        icon: 'IconApiApp',
        roles: ['admin'],
        children: [
          { key: 'svc-api', label: 'API 管理', path: '/management/service/api-management', icon: 'IconApiApp' },
          { key: 'svc-fund', label: '风险合规外数查询', path: '/management/service/fund-usage-query', icon: 'IconSafe' },
          { key: 'svc-monitor', label: '服务监控', path: '/management/service/monitor', icon: 'IconMonitor' },
          { key: 'svc-stats', label: '服务统计', path: '/management/service/stats', icon: 'IconDataAnalysis' },
          { key: 'svc-backtrack', label: '服务回溯', path: '/management/service/backtrack', icon: 'IconHistory' },
          { key: 'svc-detail', label: '明细数据查询', path: '/management/service/detail-data', icon: 'IconSearch' }
        ]
      },

      // 陪跑(实验性)
      {
        key: 'mgmt-accompany',
        label: '陪跑计划',
        path: '/management/accompany/index',
        icon: 'IconExperiment',
        roles: ['admin'],
        experimental: true
      }
    ]
  },

  // ========================================
  // 权限管理(独立顶级)
  // ========================================
  {
    key: 'permission',
    label: '权限管理',
    icon: 'IconSafe',
    roles: ['all'],
    children: [
      // 我的入口(基于角色)
      { key: 'perm-apply', label: '我的申请', path: '/management/permission/apply', icon: 'IconSend', roles: ['all'] },
      { key: 'perm-approval', label: '我的审批', path: '/management/permission/approval', icon: 'IconCheck', roles: ['approver'] },
      { key: 'perm-progress', label: '我的进度', path: '/management/permission/progress', icon: 'IconClockCircle', roles: ['all'] },
      { key: 'perm-management', label: '申请管理', path: '/management/permission/management', icon: 'IconList', roles: ['admin', 'governance'] },

      // 用户/角色
      { key: 'perm-users', label: '用户管理', path: '/management/permission/users/list', icon: 'IconUser', roles: ['admin'] },
      { key: 'perm-role', label: '角色管理(RBAC)', path: '/management/permission/role', icon: 'IconUserGroup', roles: ['admin'] },
      { key: 'perm-data', label: '数据权限', path: '/management/permission/data', icon: 'IconDatabase', roles: ['admin'] },
      { key: 'perm-app', label: '应用权限', path: '/management/permission/app', icon: 'IconApps', roles: ['admin'] },
      { key: 'perm-biz', label: '业务模块', path: '/management/permission/business-module', icon: 'IconGrid', roles: ['admin'] }
    ]
  },

  // ========================================
  // 数据消费(探索域 - 文档边界之外)
  // ========================================
  {
    key: 'exploration',
    label: '数据消费',
    icon: 'IconDataAnalysis',
    roles: ['business', 'analyst', 'modeler'],
    children: [
      { key: 'exp-overview', label: '消费概览', path: '/exploration/index', icon: 'IconHome' },
      { key: 'exp-customer', label: '客群中心', path: '/exploration/customer-center', icon: 'IconUserGroup' },
      { key: 'exp-tag', label: '标签系统', path: '/exploration/customer-center/tag-system', icon: 'IconTag' },
      // ===== 以下 3 项是 DFD 数据开发侧边界 =====
      { key: 'exp-event', label: '事件中心', path: '/exploration/customer-center/event-center', icon: 'IconNotification', dfdBoundary: true, dfdNote: '数据开发侧,本应属于 DFD' },
      { key: 'exp-audience', label: '人群管理', path: '/exploration/customer-center/audience-system', icon: 'IconTeam' },
      { key: 'exp-dashboard', label: '指标看板', path: '/exploration/indicator-dashboard', icon: 'IconDataBoard' },
      { key: 'exp-eval', label: '外数效果评估', path: '/exploration/external-data-evaluation/list', icon: 'IconDataAnalysis' },
      { key: 'exp-budget', label: '预算管理', path: '/exploration/budget-management', icon: 'IconMoney' },
      { key: 'exp-monitor', label: '外数监控', path: '/exploration/external-data-monitor', icon: 'IconMonitor' }
    ]
  }
]

/**
 * 根据当前用户角色过滤菜单
 *
 * 规则:
 *   1. roles 包含 'all' 或 currentRole → 显示
 *   2. dfdBoundary 标记的菜单 → 仅 admin 可看(默认隐藏,避免文档 §1 边界冲突)
 *   3. experimental 标记的菜单 → 实验性,仅 admin 可见
 */
function filterByRole(menu, currentRole = 'all') {
  if (!menu) return []
  return menu
    .filter(item => {
      // DFD 边界:仅 admin 可见
      if (item.dfdBoundary && currentRole !== 'admin') return false
      // 实验性:仅 admin 可见
      if (item.experimental && currentRole !== 'admin') return false
      // 'all' 角色:不进行角色过滤(展示全部,但 dfdBoundary/experimental 仍过滤)
      if (currentRole === 'all') return true
      // 角色匹配
      const roles = item.roles || ['all']
      return roles.includes('all') || roles.includes(currentRole)
    })
    .map(item => {
      if (item.children) {
        const filteredChildren = filterByRole(item.children, currentRole)
        if (filteredChildren.length === 0 && !item.path) {
          return null
        }
        return { ...item, children: filteredChildren }
      }
      return item
    })
    .filter(Boolean)
}

/**
 * 展平菜单,用于面包屑
 */
function flatten(menu, parentPath = '') {
  const result = []
  menu.forEach(item => {
    const fullPath = item.path || (parentPath && item.key ? `${parentPath}/${item.key}` : '')
    if (item.path) {
      result.push({ label: item.label, path: item.path, roles: item.roles || ['all'] })
    }
    if (item.children) {
      result.push(...flatten(item.children, fullPath))
    }
  })
  return result
}

export default menuConfig

/**
 * 统计 DFD 边界菜单数量(管理员可见)
 */
function countDfdBoundary(menu) {
  let count = 0
  menu.forEach(item => {
    if (item.dfdBoundary) count++
    if (item.children) count += countDfdBoundary(item.children)
  })
  return count
}

export { filterByRole, flatten, countDfdBoundary }