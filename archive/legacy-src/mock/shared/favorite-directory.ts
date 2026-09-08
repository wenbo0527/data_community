/**
 * 收藏 Directory
 *
 * 用户的资产收藏 / 关注 / 订阅
 * 跨模块(发现/管理/探索)共享,支持:
 *   - 收藏类型:表 / 字段 / 指标 / 变量 / 特征 / API / 集合 / 标签 / 人群 / 看板 / 服务
 *   - 分组(个人/团队/共享)
 *   - 标签
 *   - 备注
 *   - 通知订阅(数据更新通知)
 */

import type { MockMethod } from 'vite-plugin-mock'

export type FavoriteResourceType =
  | 'table'        // 表/资产
  | 'collection'   // 表集合(文档 §6.2 第 6 类)
  | 'metric'       // 指标
  | 'variable'     // 变量
  | 'feature'      // 特征(文档 §6.2 第 4 类)
  | 'api'          // API(文档 §6.2 第 5 类)
  | 'field'        // 字段
  | 'tag'          // 标签
  | 'audience'     // 人群
  | 'dashboard'    // 看板
  | 'service'      // 服务
  | 'report'       // 报表

export type FavoriteGroup = 'personal' | 'team' | 'shared'

export type FavoriteNotification =
  | 'none'                 // 不通知
  | 'on_change'            // 数据变更时通知
  | 'daily'                // 每日汇总
  | 'weekly'               // 每周汇总

export interface FavoriteItem {
  id: string
  userId: string                // 收藏人
  userName: string
  resourceType: FavoriteResourceType
  resourceId: string            // 资源 ID
  resourceName: string          // 显示名
  resourcePath?: string         // 路由路径
  description?: string
  owner?: string                // 资源 Owner
  domain?: string               // 业务域
  group: FavoriteGroup
  tags: string[]                // 自定义标签
  notification: FavoriteNotification
  createTime: string
  /** 访问次数 */
  visitCount: number
  /** 最后访问时间 */
  lastVisitTime: string
}

/**
 * 收藏 mock 数据(覆盖 7 种用户 × 11 种资源类型)
 * 包含文档 §6.2 提到的全部 6 类对象:资产 / 指标 / 变量 / 特征 / API / 集合
 */
export const FAVORITES: FavoriteItem[] = [
  // ===== 资产(表)=====
  { id: 'fav_001', userId: 'user-yunying', userName: '王运营', resourceType: 'table', resourceId: 'dim_user', resourceName: '客户主表', resourcePath: '/discovery/data-map', description: '客户基础信息主表', owner: '张三', domain: '客户域', group: 'team', tags: ['日常使用', '核心'], notification: 'on_change', createTime: '2025-06-15 10:30', visitCount: 145, lastVisitTime: '今天 14:20' },
  { id: 'fav_002', userId: 'user-yunying', userName: '王运营', resourceType: 'table', resourceId: 'dwd_order', resourceName: '订单宽表', resourcePath: '/discovery/data-map', description: '订单宽表', owner: '李四', domain: '交易域', group: 'team', tags: ['核心'], notification: 'on_change', createTime: '2025-06-18 11:00', visitCount: 98, lastVisitTime: '昨天 16:00' },
  { id: 'fav_003', userId: 'user-yunying', userName: '王运营', resourceType: 'table', resourceId: 'ods_pay', resourceName: '支付明细表', resourcePath: '/discovery/data-map', description: '支付明细', owner: '李四', domain: '交易域', group: 'team', tags: ['明细'], notification: 'none', createTime: '2025-06-20 09:00', visitCount: 23, lastVisitTime: '3 天前' },

  // ===== 表集合(文档 §6.2 第 6 类)=====
  { id: 'fav_004', userId: 'user-yunying', userName: '王运营', resourceType: 'collection', resourceId: 'col_loan_pre', resourceName: '贷前分析常用表', resourcePath: '/discovery/data-map', description: '贷前准入分析常用数据集合', owner: '张三', domain: '信贷域', group: 'team', tags: ['集合', '贷前'], notification: 'on_change', createTime: '2025-06-25 14:00', visitCount: 56, lastVisitTime: '今天 10:00' },
  { id: 'fav_005', userId: 'user-yunying', userName: '王运营', resourceType: 'collection', resourceId: 'col_loan_post', resourceName: '贷后监控集合', resourcePath: '/discovery/data-map', description: '贷后风险监控相关数据表集合', owner: '张三', domain: '信贷域', group: 'team', tags: ['集合', '贷后'], notification: 'daily', createTime: '2025-06-25 14:30', visitCount: 34, lastVisitTime: '昨天 11:00' },

  // ===== 指标(文档 §6.2 第 2 类)=====
  { id: 'fav_006', userId: 'user-yingxiao', userName: '营销经理', resourceType: 'metric', resourceId: 'DAU', resourceName: 'DAU 日活', resourcePath: '/discovery/metrics-map', description: '日活跃用户数', owner: '王五', domain: '营销域', group: 'team', tags: ['核心指标'], notification: 'on_change', createTime: '2025-06-10 14:00', visitCount: 234, lastVisitTime: '今天 15:30' },
  { id: 'fav_007', userId: 'user-yingxiao', userName: '营销经理', resourceType: 'metric', resourceId: 'overdue_rate', resourceName: '逾期率', resourcePath: '/discovery/metrics-map', description: '逾期订单占比', owner: '风控中心', domain: '风控域', group: 'team', tags: ['风控指标'], notification: 'daily', createTime: '2025-06-15 11:00', visitCount: 123, lastVisitTime: '今天 11:00' },
  { id: 'fav_008', userId: 'user-yingxiao', userName: '营销经理', resourceType: 'metric', resourceId: 'pass_rate', resourceName: '通过率', resourcePath: '/discovery/metrics-map', description: '风控通过占比', owner: '风控中心', domain: '风控域', group: 'team', tags: ['风控指标'], notification: 'daily', createTime: '2025-06-20 14:00', visitCount: 78, lastVisitTime: '昨天 14:00' },

  // ===== 变量(文档 §6.2 第 3 类)=====
  { id: 'fav_009', userId: 'user-yunying', userName: '王运营', resourceType: 'variable', resourceId: 'var_app_visit_7d', resourceName: '近7日APP访问次数', resourcePath: '/discovery/variable-map', description: '近7日行为频次', owner: '行为平台', domain: '行为域', group: 'team', tags: ['行为'], notification: 'on_change', createTime: '2025-06-25 14:00', visitCount: 89, lastVisitTime: '昨天 17:00' },
  { id: 'fav_010', userId: 'user-yunying', userName: '王运营', resourceType: 'variable', resourceId: 'var_overdue_30d', resourceName: '近30日逾期次数', resourcePath: '/discovery/variable-map', description: '近30日逾期次数', owner: '风控中心', domain: '风控域', group: 'team', tags: ['风控'], notification: 'on_change', createTime: '2025-06-25 14:30', visitCount: 67, lastVisitTime: '今天 09:00' },

  // ===== 特征(文档 §6.2 第 4 类)=====
  { id: 'fav_011', userId: 'user-fengkong', userName: '风控建模师', resourceType: 'feature', resourceId: 'feat_active_devices', resourceName: '近30天活跃设备数', resourcePath: '/discovery/feature-map', description: '近30天活跃设备数量', owner: '特征平台', domain: '风控域', group: 'team', tags: ['行为特征', '核心'], notification: 'on_change', createTime: '2025-06-15 10:00', visitCount: 167, lastVisitTime: '今天 10:00' },
  { id: 'fav_012', userId: 'user-fengkong', userName: '风控建模师', resourceType: 'feature', resourceId: 'feat_login_freq', resourceName: '近30天登录频次', resourcePath: '/discovery/feature-map', description: '近30天登录频次', owner: '特征平台', domain: '风控域', group: 'team', tags: ['行为特征'], notification: 'daily', createTime: '2025-06-15 10:30', visitCount: 89, lastVisitTime: '今天 11:00' },

  // ===== API(文档 §6.2 第 5 类)=====
  { id: 'fav_013', userId: 'user-xindai', userName: '信贷经理', resourceType: 'api', resourceId: 'api_credit_query', resourceName: '客户授信查询 API', resourcePath: '/discovery/api-market', description: '客户授信查询服务化接口', owner: '信贷团队', domain: '信贷域', group: 'team', tags: ['API', '核心'], notification: 'on_change', createTime: '2025-06-25 14:00', visitCount: 89, lastVisitTime: '今天 09:30' },
  { id: 'fav_014', userId: 'user-xindai', userName: '信贷经理', resourceType: 'api', resourceId: 'api_risk_score', resourceName: '风控评分查询 API', resourcePath: '/discovery/api-market', description: '风控评分查询服务化接口', owner: '风控团队', domain: '风控域', group: 'team', tags: ['API'], notification: 'daily', createTime: '2025-06-25 14:30', visitCount: 56, lastVisitTime: '昨天 17:00' },

  // ===== 字段 =====
  { id: 'fav_015', userId: 'user-zhangsan', userName: '张三', resourceType: 'field', resourceId: 'dim_user.id_card_no', resourceName: '身份证号字段', resourcePath: '/discovery/data-map', description: '客户身份证号字段(L3 绝密)', owner: '张三', domain: '客户域', group: 'team', tags: ['L3', 'PII'], notification: 'on_change', createTime: '2025-06-15 11:00', visitCount: 56, lastVisitTime: '昨天 14:00' },

  // ===== 人群 =====
  { id: 'fav_016', userId: 'user-yingxiao', userName: '营销经理', resourceType: 'audience', resourceId: 'aud_005', resourceName: '高客单价潜力用户', resourcePath: '/exploration/customer-center/audience-system/audience-management', description: '高客单价潜力人群', owner: '营销经理', domain: '营销域', group: 'team', tags: ['营销', '高价值'], notification: 'daily', createTime: '2025-06-15 11:00', visitCount: 56, lastVisitTime: '今天 09:00' },

  // ===== 看板 =====
  { id: 'fav_017', userId: 'user-chanpin', userName: '产品经理', resourceType: 'dashboard', resourceId: 'ceo_dashboard', resourceName: 'CEO 经营看板', resourcePath: '/exploration/indicator-dashboard', description: '公司经营核心指标看板', owner: '数据团队', domain: '总览', group: 'personal', tags: ['看板'], notification: 'weekly', createTime: '2025-05-30 09:00', visitCount: 23, lastVisitTime: '3 天前' },

  // ===== 报表 =====
  { id: 'fav_018', userId: 'user-caiwu', userName: '财务主管', resourceType: 'report', resourceId: 'monthly_settlement', resourceName: '月度结算报表', resourcePath: '/exploration/indicator-dashboard', description: '月度结算报表', owner: '财务主管', domain: '财务域', group: 'team', tags: ['财务', '定期'], notification: 'weekly', createTime: '2025-06-01 09:00', visitCount: 45, lastVisitTime: '上周' },

  // ===== 共享收藏 =====
  { id: 'fav_019', userId: 'system', userName: '系统', resourceType: 'dashboard', resourceId: 'company_overview', resourceName: '公司经营总览', resourcePath: '/exploration/indicator-dashboard', description: '公司经营总览看板', owner: '系统', domain: '总览', group: 'shared', tags: ['官方', '必读'], notification: 'weekly', createTime: '2025-01-01 00:00', visitCount: 5678, lastVisitTime: '今天 16:00' },
  { id: 'fav_020', userId: 'system', userName: '系统', resourceType: 'collection', resourceId: 'col_official_demo', resourceName: '官方演示集合', resourcePath: '/discovery/data-map', description: '系统官方演示表集合', owner: '系统', domain: '总览', group: 'shared', tags: ['官方', '必读'], notification: 'weekly', createTime: '2025-01-01 00:00', visitCount: 2345, lastVisitTime: '今天 15:00' }
]

/**
 * 收藏 Store(对当前用户的收藏做 CRUD + 查询)
 * demo 阶段用 'user-yunying'(王运营)作为默认当前用户
 */
const CURRENT_USER_ID = 'user-yunying'

export const FavoriteStore = {
  /** 列出所有收藏(调试用) */
  list(): FavoriteItem[] {
    return FAVORITES
  },

  /** 列出当前用户的收藏 */
  listMine(): FavoriteItem[] {
    return FAVORITES.filter(f => f.userId === CURRENT_USER_ID || f.group === 'shared')
  },

  /** 按资源类型筛选(用于 Tab 切换) */
  listByType(type: FavoriteResourceType): FavoriteItem[] {
    const mine = this.listMine()
    if (type === 'table') {
      // 表 Tab 同时包含表集合(文档语义"资产=表/集合")
      return mine.filter(f => f.resourceType === 'table' || f.resourceType === 'collection')
    }
    return mine.filter(f => f.resourceType === type)
  },

  /** 按用户查 */
  byUser(userId: string): FavoriteItem[] {
    return FAVORITES.filter(f => f.userId === userId)
  },

  /** 按资源类型 */
  byResourceType(type: FavoriteResourceType): FavoriteItem[] {
    return FAVORITES.filter(f => f.resourceType === type)
  },

  /** 按分组 */
  byGroup(group: FavoriteGroup): FavoriteItem[] {
    return FAVORITES.filter(f => f.group === group)
  },

  /** 按访问次数排序(文档 §6.3 "按访问次数排序") */
  sortByVisitCount(items: FavoriteItem[], order: 'desc' | 'asc' = 'desc'): FavoriteItem[] {
    return [...items].sort((a, b) => order === 'desc' ? b.visitCount - a.visitCount : a.visitCount - b.visitCount)
  },

  /** 按最近访问时间排序 */
  sortByLastVisit(items: FavoriteItem[]): FavoriteItem[] {
    return [...items].sort((a, b) => (b.lastVisitTime || '').localeCompare(a.lastVisitTime || ''))
  },

  /** 按标签 */
  byTag(tag: string): FavoriteItem[] {
    return FAVORITES.filter(f => f.tags.includes(tag))
  },

  /** 按资源(反查哪些用户收藏了) */
  byResource(type: FavoriteResourceType, resourceId: string): FavoriteItem[] {
    return FAVORITES.filter(f => f.resourceType === type && f.resourceId === resourceId)
  },

  /** 单个查 */
  byId(id: string): FavoriteItem | undefined {
    return FAVORITES.find(f => f.id === id)
  },

  /** 是否已收藏 */
  isFavorited(userId: string, type: FavoriteResourceType, resourceId: string): boolean {
    return FAVORITES.some(f =>
      f.userId === userId && f.resourceType === type && f.resourceId === resourceId
    )
  },

  /** 添加 */
  add(input: Omit<FavoriteItem, 'id' | 'createTime' | 'visitCount'>): FavoriteItem {
    const newItem: FavoriteItem = {
      ...input,
      id: `fav_${Date.now()}`,
      createTime: new Date().toISOString(),
      visitCount: 0,
      lastVisitTime: ''
    }
    FAVORITES.push(newItem)
    return newItem
  },

  /** 取消 */
  remove(id: string): boolean {
    const idx = FAVORITES.findIndex(f => f.id === id)
    if (idx >= 0) {
      FAVORITES.splice(idx, 1)
      return true
    }
    return false
  },

  /** 切换(已收藏则取消,否则添加) */
  toggle(input: Omit<FavoriteItem, 'id' | 'createTime' | 'visitCount' | 'lastVisitTime'>): { item: FavoriteItem; added: boolean } | null {
    const existed = this.isFavorited(input.userId, input.resourceType, input.resourceId)
    if (existed) {
      const target = FAVORITES.find(f =>
        f.userId === input.userId && f.resourceType === input.resourceType && f.resourceId === input.resourceId
      )
      if (target) {
        this.remove(target.id)
        return { item: target, added: false }
      }
    }
    const item = this.add({
      ...input,
      visitCount: 0,
      lastVisitTime: ''
    })
    return { item, added: true }
  },

  /** 记录访问 */
  visit(id: string): void {
    const f = FAVORITES.find(f => f.id === id)
    if (f) {
      f.visitCount++
      f.lastVisitTime = new Date().toLocaleString('zh-CN')
    }
  },

  /** 统计(用于概览页) */
  stats(userId?: string) {
    const list = userId ? this.byUser(userId) : FAVORITES
    return {
      total: list.length,
      byGroup: {
        personal: list.filter(f => f.group === 'personal').length,
        team: list.filter(f => f.group === 'team').length,
        shared: list.filter(f => f.group === 'shared').length
      },
      byResourceType: {
        table: list.filter(f => f.resourceType === 'table').length,
        collection: list.filter(f => f.resourceType === 'collection').length,
        metric: list.filter(f => f.resourceType === 'metric').length,
        variable: list.filter(f => f.resourceType === 'variable').length,
        feature: list.filter(f => f.resourceType === 'feature').length,
        api: list.filter(f => f.resourceType === 'api').length,
        field: list.filter(f => f.resourceType === 'field').length,
        audience: list.filter(f => f.resourceType === 'audience').length,
        dashboard: list.filter(f => f.resourceType === 'dashboard').length,
        service: list.filter(f => f.resourceType === 'service').length,
        report: list.filter(f => f.resourceType === 'report').length,
        tag: list.filter(f => f.resourceType === 'tag').length
      },
      topFavorites: list
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 5)
        .map(f => ({ id: f.id, name: f.resourceName, visitCount: f.visitCount }))
    }
  }
}

/**
 * HTTP Mock 端点
 */
export const favoriteMocks: MockMethod[] = [
  {
    url: '/api/favorites/list',
    method: 'get',
    response: ({ query }: { query: { userId?: string; group?: string; resourceType?: string; tag?: string } }) => {
      let result = FAVORITES
      if (query.userId) result = result.filter(f => f.userId === query.userId)
      if (query.group) result = result.filter(f => f.group === query.group)
      if (query.resourceType) result = result.filter(f => f.resourceType === query.resourceType)
      if (query.tag) result = result.filter(f => f.tags.includes(query.tag!))
      return { code: 0, data: result, total: result.length }
    }
  },
  {
    url: '/api/favorites/stats',
    method: 'get',
    response: ({ query }: { query: { userId?: string } }) => {
      return { code: 0, data: FavoriteStore.stats(query.userId) }
    }
  },
  {
    url: '/api/favorites/check',
    method: 'get',
    response: ({ query }: { query: { userId?: string; resourceType?: string; resourceId?: string } }) => {
      const exists = FavoriteStore.isFavorited(
        query.userId || '',
        (query.resourceType || 'table') as any,
        query.resourceId || ''
      )
      return { code: 0, data: { favorited: exists } }
    }
  },
  {
    url: '/api/favorites/toggle',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const result = FavoriteStore.toggle(body)
      return { code: 0, data: result, message: result?.added ? '已收藏' : '已取消' }
    }
  }
]