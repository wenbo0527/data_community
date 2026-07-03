import type { VariableAssetMock, VariableCategory, VariableSourceType } from '@/modules/variable-hub/mock/variable-management/variables'

export interface VariableDraftSource {
  topicId?: string
  experimentId?: string
  decisionId?: string
  derivedFromId?: string
}

export type VariableDraftMock = VariableAssetMock & {
  draftSource?: VariableDraftSource
}

const STORAGE_KEY = 'variable.management.extraAssets'

function safeParse(raw: string | null): VariableDraftMock[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function readAll(): VariableDraftMock[] {
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

function writeAll(list: VariableDraftMock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function pad(num: number, len = 4) {
  return String(num).padStart(len, '0')
}

function buildNextDraftId(existing: string[]) {
  const prefix = 'VAR-DRAFT-'
  const nums = existing
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}${pad(next)}`
}

function nowFmt() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export const VariableDraftStore = {
  list(): VariableDraftMock[] {
    return readAll()
  },
  addDraft(payload: {
    name: string
    code: string
    category?: VariableCategory
    sourceType?: VariableSourceType
    dataSourceName?: string
    description?: string
    draftSource?: VariableDraftSource
  }) {
    const existing = readAll()
    const id = buildNextDraftId(existing.map((item) => item.id))
    const item: VariableDraftMock = {
      id,
      name: payload.name,
      code: payload.code,
      type: 'numerical',
      status: 'draft',
      description: payload.description || '由探索/衍生生成的变量草稿（Demo）',
      dataSource: payload.sourceType === 'external' ? 'external' : 'internal',
      dataSourceName: payload.dataSourceName || '变量中心（Demo）',
      creator: 'Demo 用户',
      createdAt: nowFmt(),
      updatedAt: nowFmt(),
      sourceType: payload.sourceType,
      category: payload.category,
      profile: {
        dataType: payload.category === 'credit' ? '征信' : payload.category === 'external' ? '外数' : '行为',
        onlineStatus: '草稿'
      },
      draftSource: payload.draftSource
    }
    writeAll([item, ...existing])
    return item
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export default VariableDraftStore
