export type Column = {
  title: string
  dataIndex?: string
  slotName?: string
  width?: number
  ellipsis?: boolean
  tooltip?: boolean
  fixed?: string
}

export function getCommonColumns(opts: {
  nameTitle: string
  nameKey: string
  nameSlot: string
  typeTitle: string
  typeKey: string
  typeSlot: string
  statusTitle: string
  statusKey: string
  statusSlot: string
  createTimeTitle: string
  createTimeKey: string
  createTimeSlot: string
}): Column[] {
  return [
    { title: opts.nameTitle, dataIndex: opts.nameKey, slotName: opts.nameSlot, width: 200 },
    { title: opts.typeTitle, dataIndex: opts.typeKey, slotName: opts.typeSlot, width: 120 },
    { title: opts.statusTitle, dataIndex: opts.statusKey, slotName: opts.statusSlot, width: 100 },
    { title: opts.createTimeTitle, dataIndex: opts.createTimeKey, slotName: opts.createTimeSlot, width: 180 },
    { title: '操作', slotName: 'actions', width: 200, fixed: 'right' }
  ]
}
