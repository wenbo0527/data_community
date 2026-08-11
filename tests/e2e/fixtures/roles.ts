/**
 * 角色 Fixtures(E2E 数据驱动测试)
 *
 * 10 个角色定义,每个角色对应:
 *   - 测试用户
 *   - 预期快捷作业
 *   - 默认着陆页
 *   - 可访问的核心模块
 */
import type { UserRole } from '../../../src/types/roles'

export interface RoleFixture {
  key: UserRole
  label: string
  department: string
  userId: string
  userName: string
  expectedShortcuts: string[]
  defaultLanding: string
  testableFeatures: string[]
  description: string
}

export const ROLE_FIXTURES: RoleFixture[] = [
  {
    key: 'data_engineer',
    label: '数据工程师',
    department: '数据团队',
    userId: 'user-zhangsan',
    userName: '张三',
    expectedShortcuts: ['数据地图', '元数据建模', '数据标准', '业务概念', '资产标签', '我的收藏'],
    defaultLanding: '/management/metadata/modeling',
    testableFeatures: ['data-map', 'metadata-modeling', 'data-standard', 'business-concept', 'asset-tags'],
    description: '元数据建模 / 标签开发 / 字段打标'
  },
  {
    key: 'data_admin',
    label: '数据治理者',
    department: '数据团队',
    userId: 'user-zhangsan',
    userName: '张三',
    expectedShortcuts: ['数据地图', '元数据建模', '数据标准', '字段权限', '业务概念', '资产标签', '数据服务', '我的收藏'],
    defaultLanding: '/management/data-standard/standards',
    testableFeatures: ['metadata-modeling', 'data-standard', 'data-permission', 'asset-tags'],
    description: '数据治理 / 资产上下架 / 标准制定'
  },
  {
    key: 'risk_analyst',
    label: '风控分析师',
    department: '风控团队',
    userId: 'user-fengkong',
    userName: '风控值班',
    expectedShortcuts: ['客户 360', '客群中心', '标签体系', '指标地图', '数据地图', '我的收藏'],
    defaultLanding: '/discovery/customer360',
    testableFeatures: ['customer360', 'audience-system', 'tag-system'],
    description: '风险评估 / 欺诈检测 / 逾期监控'
  },
  {
    key: 'risk_manager',
    label: '风控经理',
    department: '风控团队',
    userId: 'user-fengkong',
    userName: '风控值班',
    expectedShortcuts: ['客户 360', '客群中心', '标签体系', '指标地图', '指标看板', '我的收藏'],
    defaultLanding: '/exploration/indicator-dashboard',
    testableFeatures: ['audience-system', 'indicator-dashboard'],
    description: '风控策略 / 团队管理 / 催收'
  },
  {
    key: 'loan_manager',
    label: '信贷经理',
    department: '信贷团队',
    userId: 'user-xindai',
    userName: '信贷经理',
    expectedShortcuts: ['数据地图', '数据服务', '分析流程', '客户 360', '指标地图', '我的收藏'],
    defaultLanding: '/discovery/data-map',
    testableFeatures: ['data-map', 'service', 'workflows'],
    description: '贷款审批 / 授信管理 / API 申请'
  },
  {
    key: 'operation_lead',
    label: '运营主管',
    department: '运营团队',
    userId: 'user-yunying',
    userName: '王运营',
    expectedShortcuts: ['客群中心', '标签体系', '客户 360', '事件中心', '分析流程', '我的收藏'],
    defaultLanding: '/exploration/customer-center/audience-system/audience-management',
    testableFeatures: ['audience-system', 'tag-system', 'event-center'],
    description: '客群运营 / 圈选 / 标签应用'
  },
  {
    key: 'marketing_lead',
    label: '营销经理',
    department: '营销团队',
    userId: 'user-yingxiao',
    userName: '营销经理',
    expectedShortcuts: ['客群中心', '标签体系', '指标看板', '客户 360', '事件中心', '我的收藏'],
    defaultLanding: '/exploration/customer-center/audience-system/audience-management',
    testableFeatures: ['audience-system', 'tag-system', 'indicator-dashboard'],
    description: '营销圈选 / 活动效果 / 渠道触达'
  },
  {
    key: 'product_manager',
    label: '产品经理',
    department: '产品团队',
    userId: 'user-chanpin',
    userName: '产品经理',
    expectedShortcuts: ['客户 360', '客群中心', '指标地图', '业务概念', '我的收藏'],
    defaultLanding: '/discovery/customer360',
    testableFeatures: ['customer360', 'audience-system'],
    description: '产品调研 / 用户洞察 / 数据驱动'
  },
  {
    key: 'finance_lead',
    label: '财务主管',
    department: '财务团队',
    userId: 'user-caiwu',
    userName: '财务主管',
    expectedShortcuts: ['指标看板', '指标地图', '数据服务', '字段权限', '我的收藏'],
    defaultLanding: '/exploration/indicator-dashboard',
    testableFeatures: ['indicator-dashboard', 'service', 'data-permission'],
    description: '财务结算 / 监管报送 / 计费'
  },
  {
    key: 'admin',
    label: '系统管理员',
    department: 'IT 团队',
    userId: 'user-system',
    userName: '系统账户',
    expectedShortcuts: [], // admin 是 14 个全部覆盖
    defaultLanding: '/discovery/index',
    testableFeatures: ['*'],
    description: '系统配置 / 全权限'
  }
]

/**
 * 获取角色 fixture by key
 */
export function getRoleFixture(key: UserRole): RoleFixture | undefined {
  return ROLE_FIXTURES.find(r => r.key === key)
}