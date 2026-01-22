import mock from '@/mock/touch'
export async function searchTouches(params: Record<string, any>): Promise<any[]> {
  return mock.queryDetails
}

export async function exportTouches(params: Record<string, any>): Promise<Blob> {
  return new Blob([])
}
export async function listTouchDetails(): Promise<any[]> {
  return mock.queryDetails
}
export async function listSmsRecords(): Promise<any[]> {
  return mock.smsRecords
}
export async function listAiCallRecords(): Promise<any[]> {
  return mock.aiCallRecords
}
export async function listAiVendorSmsRecords(): Promise<any[]> {
  return mock.aiSmsVendorRecords
}
export async function listManualCallRecords(): Promise<any[]> {
  return mock.manualCallRecords
}
export async function listManualVendorSmsRecords(): Promise<any[]> {
  return mock.manualSmsVendorRecords
}
export async function searchMarketing(params: Record<string, any>): Promise<any[]> {
  return mock.marketingQuery
}
export async function listMarketing(): Promise<any[]> {
  return mock.marketingList
}
export async function getOverviewData(params: Record<string, any>): Promise<any[]> {
  const { type, vendor, taskId, batchId, dateRange } = params || {}
  const src = mock.overviewData as any[]
  const inRange = (t?: string) => {
    if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) return true
    if (!t) return true
    const ts = new Date(t).getTime()
    const s = new Date(dateRange[0]).getTime()
    const e = new Date(dateRange[1]).getTime()
    return ts >= s && ts <= e
  }
  const filterNode = (node: any): boolean => {
    const typeOk = type ? node.type === type : true
    const vendorOk = vendor ? node.vendor === vendor : true
    const taskOk = taskId ? node.taskId === taskId : true
    const batchOk = batchId ? node.batchId === batchId : true
    const timeOk = inRange(node.time)
    return typeOk && vendorOk && taskOk && batchOk && timeOk
  }
  const deepFilter = (nodes: any[]): any[] => {
    return nodes.map(n => {
      const children = Array.isArray(n.children) ? deepFilter(n.children) : []
      const selfOk = filterNode(n)
      const keeps = children.filter(Boolean)
      if (selfOk || keeps.length) {
        return { ...n, children: keeps }
      }
      return null
    }).filter(Boolean)
  }
  return deepFilter(src)
}
