export type StatusMeta = { label: string; color: string }

export const STATUS_DICTIONARY: Record<string, Record<string, StatusMeta>> = {
  budgetTask: {
    costing: { label: '待核算', color: 'orange' },
    reconcile: { label: '待对账', color: 'blue' },
    writeoff: { label: '待核销', color: 'purple' },
    done: { label: '已完成', color: 'green' }
  },
  externalDataStatus: {
    importing: { label: '引入中', color: 'orange' },
    online: { label: '已上线', color: 'green' },
    pending_evaluation: { label: '待评估', color: 'blue' },
    archived: { label: '已归档', color: 'gray' }
  }
}

export function getStatusMeta(dictKey: string, status: string): StatusMeta {
  const dict = STATUS_DICTIONARY[dictKey]
  if (!dict) return { label: status, color: 'gray' }
  return dict[status] || { label: status, color: 'gray' }
}
