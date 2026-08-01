/**
 * External Interface Mock API（外部数据接口）
 * 用途：外部数据接口目录（供应商/价格/数据类型）
 * 来源：覆盖 dmt-app 数据接入 + 外部接口列表
 * 消费方：@/pages/dmt/external 等页面
 * 边界：纯前端 demo；mock 生成 10 条接口记录
 */
import mockRequest from '@/utils/mockRequest'

export interface InterfaceItem {
  interfaceId: string
  interfaceName: string
  dataType: string
  supplier: string
  price: number
  dataName: string
}

interface ListResponse {
  list: InterfaceItem[]
  total: number
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 内联 mock 外部接口数据（10 条）
const generateMockInterfaces = (): InterfaceItem[] => {
  const suppliers = ['阿里云', '腾讯云', '京东云', '百应', '九四']
  const dataTypes = ['标签', '事件', '画像', '行为', '属性']
  return Array.from({ length: 10 }, (_, i) => ({
    interfaceId: `IF_${1000 + i}`,
    interfaceName: `${suppliers[i % suppliers.length]} ${dataTypes[i % dataTypes.length]}接口${i + 1}`,
    dataType: dataTypes[i % dataTypes.length],
    supplier: suppliers[i % suppliers.length],
    price: Math.floor(Math.random() * 1000) + 100,
    dataName: `数据集${i + 1}`
  }))
}

export async function getExternalInterfaces(params: {
  dataType?: string
  dataCategory?: string
  supplier?: string
  productId?: string
  keyword?: string
  page: number
  size: number
}): Promise<ListResponse> {
  await delay(120)
  let list = generateMockInterfaces()
  if (params.dataType) list = list.filter(i => i.dataType === params.dataType)
  if (params.supplier) list = list.filter(i => i.supplier === params.supplier)
  if (params.keyword) list = list.filter(i => i.interfaceName.includes(params.keyword!))
  const total = list.length
  const start = (params.page - 1) * params.size
  list = list.slice(start, start + params.size)
  // 同步走 mockRequest（便于集成统一拦截）
  await mockRequest({ url: '/api/external-interfaces', method: 'GET', params })
  return { list, total }
}