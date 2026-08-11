/**
 * asset-tags mock - 资产标签管理(占位)
 */
import { ref } from 'vue'

export interface AssetTag {
  id: string
  name: string
  category: string
  description?: string
  color: string
  bindingCount: number
  createdAt: string
  isSystem?: boolean
}

const SAMPLE: AssetTag[] = [
  { id: 'T001', name: '客户主档', category: '业务域', description: '客户核心主档数据', color: 'arcoblue', bindingCount: 28, createdAt: '2026-07-01', isSystem: true },
  { id: 'T002', name: '征信数据', category: '数据源', description: '人行/百行征信', color: 'red', bindingCount: 12, createdAt: '2026-07-05', isSystem: true },
  { id: 'T003', name: '交易流水', category: '业务域', description: '账户交易流水', color: 'green', bindingCount: 35, createdAt: '2026-07-10', isSystem: true },
  { id: 'T004', name: '风险评分', category: '业务域', description: '风控模型输出', color: 'orange', bindingCount: 8, createdAt: '2026-07-15', isSystem: true },
  { id: 'T005', name: '营销标签', category: '业务域', description: '用户营销画像', color: 'purple', bindingCount: 42, createdAt: '2026-07-20', isSystem: false }
]

// 内部 ref,apply/unapply 时更新
const _bindingsRef = ref([
  { id: 'B001', tagId: 'T001', resourceType: 'table', resourceId: 'A001', appliedAt: '2026-08-05 10:00' },
  { id: 'B002', tagId: 'T003', resourceType: 'table', resourceId: 'A002', appliedAt: '2026-08-04 14:30' },
  { id: 'B003', tagId: 'T002', resourceType: 'table', resourceId: 'A003', appliedAt: '2026-08-03 09:15' },
  { id: 'B004', tagId: 'T005', resourceType: 'metric', resourceId: 'M001', appliedAt: '2026-08-02 11:00' },
  { id: 'B005', tagId: 'T004', resourceType: 'field', resourceId: 'F001', appliedAt: '2026-08-01 09:30' }
])

export const AssetTagStore = {
  definitions: () => [...SAMPLE],
  list: ref([...SAMPLE]),
  stats: () => ({ totalDefinitions: 5, totalBindings: _bindingsRef.value.length }),
  bindings: () => _bindingsRef.value.slice(),
  recentBindings: () => [
    { assetId: 'A001', assetName: '客户主表', tagName: '客户主档', boundAt: '2026-08-05 10:00' },
    { assetId: 'A002', assetName: '账户交易表', tagName: '交易流水', boundAt: '2026-08-04 14:30' },
    { assetId: 'A003', assetName: '人行征信表', tagName: '征信数据', boundAt: '2026-08-03 09:15' }
  ],
  apply(tagId: string, resourceType: string, resourceId: string, appliedBy: string, appliedByName: string, note: string) {
    const newBinding = {
      id: 'B' + String(_bindingsRef.value.length + 1).padStart(3, '0'),
      tagId, resourceType, resourceId,
      appliedBy, appliedByName, note,
      appliedAt: new Date().toISOString()
    }
    _bindingsRef.value.push(newBinding)
    return newBinding
  },
  unapply(bindingId: string) {
    const idx = _bindingsRef.value.findIndex(b => b.id === bindingId)
    if (idx >= 0) {
      _bindingsRef.value.splice(idx, 1)
      return true
    }
    return false
  }
}

export default AssetTagStore