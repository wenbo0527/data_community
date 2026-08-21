import { partnerOrgNames } from './supplierDictionary'

// PRD R10: 签报管理 - 合作机构明细（详情页中的多合作机构列表）
export interface SignReportPartnerOrg {
  partnerOrg: string // 合作机构（必填，取值与 partnerOrgNames 联动）
  creditCode: string // 统一社会信用代码（必填）
  noticeAmount: number // 签报/成交通知书金额(合作机构)（必填）
  initialOccupiedAmount: number // 签报初始占用金额（必填，默认0）
  attachments: string[] // 附件文件名列表
}

// PRD R10: 签报管理 - 签报记录主结构
export interface SignReport {
  id: string
  reportNo: string // 签报号（必填，示例：签报〔2026〕69号）
  title: string // 签报标题（必填）
  totalAmount: number // 签报总金额（必填）
  reportDate: string // 签报日期（必填，YYYY-MM-DD）
  initiator?: string // 签报发起人（非必填）
  createdAt: string
  partnerOrgs: SignReportPartnerOrg[] // 详情页中的多合作机构列表
}

const now = new Date().toISOString()

// PRD R10: 签报 Mock 数据（合作机构全称取自 partnerOrgNames）
const signReportsMock: SignReport[] = [
  {
    id: 'SR-2026-001',
    reportNo: '签报〔2026〕69号',
    title: '关于采购朴道征信有限公司风控数据服务的签报',
    totalAmount: 500000,
    reportDate: '2026-01-15',
    initiator: '张明',
    createdAt: now,
    partnerOrgs: [
      {
        partnerOrg: '朴道征信有限公司',
        creditCode: '91440300MA5G1LJC7K',
        noticeAmount: 500000,
        initialOccupiedAmount: 0,
        attachments: ['朴道征信服务成交通知书.pdf', '朴道征信服务协议.pdf']
      }
    ]
  },
  {
    id: 'SR-2026-002',
    reportNo: '签报〔2026〕72号',
    title: '关于采购百行征信有限公司与学信网数据服务的签报',
    totalAmount: 800000,
    reportDate: '2026-02-20',
    initiator: '李华',
    createdAt: now,
    partnerOrgs: [
      {
        partnerOrg: '百行征信有限公司',
        creditCode: '91440300MA5FNQXG6M',
        noticeAmount: 600000,
        initialOccupiedAmount: 100000,
        attachments: ['百行征信成交通知书.pdf', '百行征信服务协议.pdf']
      },
      {
        partnerOrg: '学信网',
        creditCode: '91110000765950269X',
        noticeAmount: 200000,
        initialOccupiedAmount: 0,
        attachments: ['学信网成交通知书.pdf', '学信网数据服务协议.pdf']
      }
    ]
  },
  {
    id: 'SR-2026-003',
    reportNo: '签报〔2026〕85号',
    title: '关于采购钱塘征信有限公司风控数据服务的签报',
    totalAmount: 350000,
    reportDate: '2026-03-10',
    initiator: '王芳',
    createdAt: now,
    partnerOrgs: [
      {
        partnerOrg: '钱塘征信有限公司',
        creditCode: '91330109MA2HJG7L3P',
        noticeAmount: 350000,
        initialOccupiedAmount: 0,
        attachments: ['钱塘征信成交通知书.pdf', '钱塘征信服务协议.pdf']
      }
    ]
  }
]

const delay = (ms = 120) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// PRD R10: 返回签报列表
export async function getSignReports(): Promise<SignReport[]> {
  await delay()
  return signReportsMock.map((r) => ({ ...r, partnerOrgs: r.partnerOrgs.map((p) => ({ ...p, attachments: [...p.attachments] })) }))
}

// PRD R10: 返回签报详情
export async function getSignReportById(id: string): Promise<SignReport | null> {
  await delay()
  const found = signReportsMock.find((r) => r.id === id)
  if (!found) return null
  return { ...found, partnerOrgs: found.partnerOrgs.map((p) => ({ ...p, attachments: [...p.attachments] })) }
}

// PRD R10: 新建签报
export async function createSignReport(data: Omit<SignReport, 'id' | 'createdAt'>): Promise<SignReport> {
  await delay()
  const item: SignReport = {
    id: `SR-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...data,
    partnerOrgs: (data.partnerOrgs || []).map((p) => ({ ...p, attachments: [...p.attachments] }))
  }
  signReportsMock.unshift(item)
  return { ...item, partnerOrgs: item.partnerOrgs.map((p) => ({ ...p, attachments: [...p.attachments] })) }
}

// PRD R10: 更新签报
export async function updateSignReport(id: string, data: Partial<SignReport>): Promise<boolean> {
  await delay()
  const idx = signReportsMock.findIndex((r) => r.id === id)
  if (idx < 0) return false
  signReportsMock[idx] = {
    ...signReportsMock[idx],
    ...data,
    id,
    partnerOrgs: data.partnerOrgs
      ? data.partnerOrgs.map((p) => ({ ...p, attachments: [...p.attachments] }))
      : signReportsMock[idx].partnerOrgs
  }
  return true
}

// PRD R10: 按签报号搜索（供合同管理 R10 搜索选择使用）
export async function searchSignReports(keyword: string): Promise<SignReport[]> {
  await delay()
  const kw = (keyword || '').trim().toLowerCase()
  if (!kw) return signReportsMock.map((r) => ({ ...r, partnerOrgs: r.partnerOrgs.map((p) => ({ ...p, attachments: [...p.attachments] })) }))
  const matched = signReportsMock.filter(
    (r) => r.reportNo.toLowerCase().includes(kw) || r.title.toLowerCase().includes(kw)
  )
  return matched.map((r) => ({ ...r, partnerOrgs: r.partnerOrgs.map((p) => ({ ...p, attachments: [...p.attachments] })) }))
}

// PRD: 删除签报
export async function deleteSignReport(id: string): Promise<boolean> {
  await delay()
  const idx = signReportsMock.findIndex((r) => r.id === id)
  if (idx < 0) return false
  signReportsMock.splice(idx, 1)
  return true
}

// 重新导出合作机构名称枚举，便于上层统一引用
export { partnerOrgNames }
