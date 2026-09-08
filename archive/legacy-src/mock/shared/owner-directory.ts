/**
 * Owner Directory · 共享用户/Owner 底座(P1#2 整合点)
 *
 * 历史问题:同一资产(表/指标/标签/人群)在三个模块有不同 Owner
 *   - data-map:    owner
 *   - metrics-map: owner / businessOwner
 *   - management:  businessOwner / technicalOwner
 *
 * 解决方案:建立单一 Owner 字典(本文件),所有模块按 userId 取。
 * 同一 userId 在三处展示同一姓名/部门/联系方式。
 */

export type Department =
  | '数据团队'
  | '风控团队'
  | '信贷团队'
  | '运营团队'
  | '营销团队'
  | '产品团队'
  | '财务团队'
  | 'IT 团队'
  | '系统'

export interface OwnerProfile {
  id: string // 唯一 ID,跨模块共享
  name: string
  email: string
  phone?: string
  department: Department
  title: string // 岗位
  avatar?: string // emoji 或 URL
  active: boolean
  joinDate: string
}

/**
 * 全局 Owner 字典(单一权威)
 */
export const OWNER_DIRECTORY: Record<string, OwnerProfile> = {
  // 数据团队
  'user-zhangsan': {
    id: 'user-zhangsan',
    name: '张三',
    email: 'zhangsan@company.com',
    phone: '138-0000-0001',
    department: '数据团队',
    title: '数据工程师',
    avatar: '👨‍💻',
    active: true,
    joinDate: '2022-03-01'
  },
  'user-zhaosi': {
    id: 'user-zhaosi',
    name: '赵六',
    email: 'zhaoliu@company.com',
    phone: '138-0000-0006',
    department: '数据团队',
    title: '高级数据工程师',
    avatar: '👨‍🔬',
    active: true,
    joinDate: '2021-09-15'
  },

  // 风控团队
  'user-lisi': {
    id: 'user-lisi',
    name: '李四',
    email: 'lisi@company.com',
    phone: '138-0000-0002',
    department: '风控团队',
    title: '风控分析师',
    avatar: '🧑‍💼',
    active: true,
    joinDate: '2021-06-01'
  },
  'user-wangwu': {
    id: 'user-wangwu',
    name: '王五',
    email: 'wangwu@company.com',
    phone: '138-0000-0005',
    department: '风控团队',
    title: '风控经理',
    avatar: '👨‍✈️',
    active: true,
    joinDate: '2020-11-10'
  },
  'user-fengkong': {
    id: 'user-fengkong',
    name: '风控值班',
    email: 'risk-ops@company.com',
    department: '风控团队',
    title: '风控值班团队',
    avatar: '🛡️',
    active: true,
    joinDate: '2020-01-01'
  },

  // 信贷团队
  'user-xindai': {
    id: 'user-xindai',
    name: '信贷经理',
    email: 'loan-manager@company.com',
    department: '信贷团队',
    title: '信贷业务经理',
    avatar: '💳',
    active: true,
    joinDate: '2021-04-01'
  },

  // 运营团队
  'user-yunying': {
    id: 'user-yunying',
    name: '王运营',
    email: 'yunying@company.com',
    phone: '138-0000-0010',
    department: '运营团队',
    title: '运营主管',
    avatar: '👩‍💼',
    active: true,
    joinDate: '2022-01-01'
  },
  'user-yunying02': {
    id: 'user-yunying02',
    name: '李运营',
    email: 'yunying02@company.com',
    department: '运营团队',
    title: '运营专员',
    avatar: '🧑‍💻',
    active: true,
    joinDate: '2023-02-01'
  },

  // 营销团队
  'user-yingxiao': {
    id: 'user-yingxiao',
    name: '营销经理',
    email: 'marketing@company.com',
    department: '营销团队',
    title: '营销经理',
    avatar: '📈',
    active: true,
    joinDate: '2021-08-15'
  },

  // 产品团队
  'user-chanpin': {
    id: 'user-chanpin',
    name: '产品经理',
    email: 'pm@company.com',
    department: '产品团队',
    title: '产品经理',
    avatar: '📦',
    active: true,
    joinDate: '2022-05-01'
  },

  // 财务
  'user-caiwu': {
    id: 'user-caiwu',
    name: '财务主管',
    email: 'finance@company.com',
    department: '财务团队',
    title: '财务主管',
    avatar: '💰',
    active: true,
    joinDate: '2020-08-01'
  },

  // 系统
  'user-system': {
    id: 'user-system',
    name: '系统账户',
    email: 'system@company.com',
    department: 'IT 团队',
    title: '系统',
    avatar: '🤖',
    active: true,
    joinDate: '2020-01-01'
  }
}

/**
 * Owner Store
 */
export const OwnerDirectoryStore = {
  get(id: string): OwnerProfile | undefined {
    return OWNER_DIRECTORY[id]
  },

  /**
   * 兼容多种格式:
   *   - 直接传 id 'user-zhangsan'
   *   - 传名字 '张三'(按 name 反查)
   *   - 传 email 'zhangsan@company.com'
   */
  resolve(input: string): OwnerProfile | undefined {
    if (!input) return undefined
    if (OWNER_DIRECTORY[input]) return OWNER_DIRECTORY[input]
    // 按 name 反查
    const byName = Object.values(OWNER_DIRECTORY).find(o => o.name === input)
    if (byName) return byName
    // 按 email 反查
    const byEmail = Object.values(OWNER_DIRECTORY).find(o => o.email === input)
    if (byEmail) return byEmail
    return undefined
  },

  /**
   * 取 Owner 显示文本(供 UI 兼容老字段)
   */
  displayName(input: string): string {
    if (!input) return '-'
    const profile = this.resolve(input)
    return profile ? profile.name : input
  },

  /**
   * 取 Owner 全信息(供 UI 展示)
   */
  full(input: string): OwnerProfile {
    return this.resolve(input) || {
      id: input || 'unknown',
      name: input || '未知',
      email: '',
      department: '系统' as Department,
      title: '',
      active: false,
      joinDate: ''
    }
  },

  /** 列表 */
  list(): OwnerProfile[] {
    return Object.values(OWNER_DIRECTORY)
  },

  /** 按部门查 */
  listByDepartment(department: Department): OwnerProfile[] {
    return this.list().filter(o => o.department === department)
  }
}