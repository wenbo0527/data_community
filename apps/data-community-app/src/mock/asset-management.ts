/**
 * mock/asset-management.ts (R-mock 平级补齐)
 *
 * 任务: TASK-20260713-5F3F9CB4 (dmt-app 数据资产上下架 mock 补齐)
 * 实施: data_community_dev · 2026-07-13 12:30 CST
 *
 * 文博拍板 (PM A' 追投 10:45):
 *   「数据资产上下架」「数据资源上下架」「数据要素上下架」**三者平级**, 非父子级
 *   → 三个独立页面 + 三个平级菜单 + 三个平级 mock store
 *
 * 本文件 = 「数据资产上下架」平级 mock store (含聚合上架/下架记录)
 *
 * 字段规范 (PM grep ≥7 实证 #7):
 *   tableName / computeClusterTable / analysisClusterTable / category / owner /
 *   registerTime / status / onShelfTime / offShelfTime / publisher / description
 *   + shelfRecordId / recordType (table|metric) / action (上架|下架|编辑)
 */

export type ShelfStatus = 'active' | 'onShelf' | 'offShelf'
export type ShelfAction = '上架' | '下架' | '编辑'
export type RecordType = 'table' | 'metric'

export interface MockShelfRecord {
  shelfRecordId: string
  tableName: string
  recordType: RecordType
  category: string
  owner: string
  registerTime: string
  status: ShelfStatus
  onShelfTime?: string
  offShelfTime?: string
  publisher: string
  description: string
  action: ShelfAction
  actionTime: string
  operator: string
  remark?: string
}

/**
 * 平级聚合 mock: 跨表/指标的上下架/编辑记录 ≥5 条
 * 与 mock/data-map.ts (表) + mock/listing-store.ts (指标) 平级, 非父子
 */
export const mockShelfRecords: MockShelfRecord[] = [
  {
    shelfRecordId: 'SHR-2026-001',
    tableName: 't_loan_apply',
    recordType: 'table',
    category: '授信',
    owner: '张敏',
    registerTime: '2026-04-12 10:23:11',
    status: 'onShelf',
    onShelfTime: '2026-04-15 14:00:00',
    publisher: '张敏',
    description: '贷款申请表主表上架',
    action: '上架',
    actionTime: '2026-04-15 14:00:00',
    operator: '张敏',
    remark: '业务上线首批核心表'
  },
  {
    shelfRecordId: 'SHR-2026-002',
    tableName: '客户转化率',
    recordType: 'metric',
    category: '客户',
    owner: '王芳',
    registerTime: '2026-04-10 10:00:00',
    status: 'onShelf',
    onShelfTime: '2026-04-15 14:00:00',
    publisher: '王芳',
    description: '客户转化率指标上架',
    action: '上架',
    actionTime: '2026-04-15 14:00:00',
    operator: '王芳'
  },
  {
    shelfRecordId: 'SHR-2026-003',
    tableName: 't_legacy_user_profile',
    recordType: 'table',
    category: '客户',
    owner: '王芳',
    registerTime: '2025-12-10 14:00:00',
    status: 'offShelf',
    onShelfTime: '2025-12-15 10:00:00',
    offShelfTime: '2026-05-20 18:00:00',
    publisher: '王芳',
    description: '旧版用户画像下架',
    action: '下架',
    actionTime: '2026-05-20 18:00:00',
    operator: '王芳',
    remark: '新版 t_customer_360 替代'
  },
  {
    shelfRecordId: 'SHR-2026-004',
    tableName: 't_test_customer_score',
    recordType: 'table',
    category: '风控',
    owner: '李伟',
    registerTime: '2026-06-25 17:00:00',
    status: 'offShelf',
    onShelfTime: '2026-06-28 10:00:00',
    offShelfTime: '2026-07-05 16:00:00',
    publisher: '李伟',
    description: '客户评分测试表下架',
    action: '下架',
    actionTime: '2026-07-05 16:00:00',
    operator: '李伟',
    remark: '测试结束下线'
  },
  {
    shelfRecordId: 'SHR-2026-005',
    tableName: '风险事件触发次数',
    recordType: 'metric',
    category: '风控',
    owner: '李伟',
    registerTime: '2026-02-25 13:00:00',
    status: 'onShelf',
    onShelfTime: '2026-03-01 10:00:00',
    publisher: '李伟',
    description: '风控规则触发次数指标上架',
    action: '上架',
    actionTime: '2026-03-01 10:00:00',
    operator: '李伟'
  },
  {
    shelfRecordId: 'SHR-2026-006',
    tableName: 't_coupon_instance',
    recordType: 'table',
    category: '营销',
    owner: '刘洋',
    registerTime: '2026-06-01 10:00:00',
    status: 'onShelf',
    onShelfTime: '2026-06-05 14:30:00',
    publisher: '刘洋',
    description: '券实例状态跟踪表上架',
    action: '上架',
    actionTime: '2026-06-05 14:30:00',
    operator: '刘洋',
    remark: '券 v1.2.8 上线配套'
  }
]

export const assetManagementStore = {
  shelfRecords: mockShelfRecords
}

export default assetManagementStore