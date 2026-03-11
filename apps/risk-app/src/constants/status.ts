export type StatusMeta = { label: string; color: string }

export const STATUS_DICTIONARY: Record<string, Record<string, StatusMeta>> = {
  budgetTask: {
    costing: { label: '待核算', color: 'orange' },
    reconcile: { label: '待对账', color: 'blue' },
    writeoff: { label: '待核销', color: 'purple' },
    pending_reimbursement: { label: '待报销', color: 'cyan' },
    done: { label: '已完成', color: 'green' }
  }
}

export function getStatusMeta(dictKey: string, status: string): StatusMeta {
  const dict = STATUS_DICTIONARY[dictKey]
  if (!dict) return { label: status, color: 'gray' }
  return dict[status] || { label: status, color: 'gray' }
}
