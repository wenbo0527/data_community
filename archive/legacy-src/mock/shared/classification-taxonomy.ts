/**
 * 统一分类维度(打通 #5)
 *
 * 数据标准、分级分类、要素、资产 都基于同一套分类维度:
 *   L1 业务域 → L2 业务实体 → L3 业务要素 → L4 子要素/字段
 *
 * 任何模块引用分类时,都从此处取。
 *
 * @see 文档 §2.5 三层对象抽象
 */

import type { SensitivityLevel, BusinessBelonging } from './classify-types'

/** 4 级分类树节点 */
export interface TaxonomyNode {
  /** 节点编码,全局唯一,如 'BD_USER_CUST_ID' */
  code: string
  /** 中文名 */
  name: string
  /** 描述 */
  description: string
  /** 父节点编码 */
  parent?: string
  /** 层级 1-4 */
  level: 1 | 2 | 3 | 4
  /** 业务归属 */
  businessBelonging: BusinessBelonging
  /** 关联的数据标准号(可选) */
  standardCode?: string
  /** 默认敏感级别(可选) */
  defaultSensitivity?: SensitivityLevel
  /** Owner ID */
  ownerId: string
  /** Owner 姓名 */
  ownerName: string
  /** 节点类型 */
  nodeType: 'domain' | 'entity' | 'element' | 'field'
}

/**
 * 统一分类树(简化版,覆盖 P1-A 需要的关键节点)
 */
export const TAXONOMY: TaxonomyNode[] = [
  // === L1 业务域(7 个) ===
  { code: 'BD_USER', name: '用户域', description: '用户基本信息、画像、行为', level: 1, businessBelonging: '零售', nodeType: 'domain', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_RISK', name: '风控域', description: '风控模型、信用、欺诈', level: 1, businessBelonging: '风控', nodeType: 'domain', ownerId: 'user-fengkong', ownerName: '风控值班' },
  { code: 'BD_LOAN', name: '信贷域', description: '贷款申请、放款、还款', level: 1, businessBelonging: '对公', nodeType: 'domain', ownerId: 'user-xindai', ownerName: '信贷经理' },
  { code: 'BD_FINANCE', name: '财务域', description: '财务结算、核算、计费', level: 1, businessBelonging: '财务', nodeType: 'domain', ownerId: 'user-caiwu', ownerName: '财务主管' },
  { code: 'BD_MARKETING', name: '营销域', description: '营销活动、渠道、客户触达', level: 1, businessBelonging: '运营', nodeType: 'domain', ownerId: 'user-yingxiao', ownerName: '营销经理' },
  { code: 'BD_PRODUCT', name: '产品域', description: '产品功能、版本、上线', level: 1, businessBelonging: '零售', nodeType: 'domain', ownerId: 'user-chanpin', ownerName: '产品经理' },
  { code: 'BD_OPERATION', name: '运营域', description: '客户运营、活动、关怀', level: 1, businessBelonging: '运营', nodeType: 'domain', ownerId: 'user-yunying', ownerName: '王运营' },

  // === L2 业务实体(覆盖 7 个核心域) ===
  { code: 'BD_USER_CUST', name: '客户', description: '零售客户基本信息', parent: 'BD_USER', level: 2, businessBelonging: '零售', nodeType: 'entity', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_BEHAVIOR', name: '用户行为', description: '用户操作行为', parent: 'BD_USER', level: 2, businessBelonging: '运营', nodeType: 'entity', ownerId: 'user-zhaosi', ownerName: '赵六' },
  { code: 'BD_USER_VALUE', name: '用户价值', description: '用户价值分层', parent: 'BD_USER', level: 2, businessBelonging: '零售', nodeType: 'entity', ownerId: 'user-wangwu', ownerName: '王五' },
  { code: 'BD_RISK_CREDIT', name: '信用风险', description: '信用相关风险', parent: 'BD_RISK', level: 2, businessBelonging: '风控', nodeType: 'entity', ownerId: 'user-fengkong', ownerName: '风控值班' },
  { code: 'BD_LOAN_APPLY', name: '贷款申请', description: '贷款申请流程', parent: 'BD_LOAN', level: 2, businessBelonging: '对公', nodeType: 'entity', ownerId: 'user-xindai', ownerName: '信贷经理' },
  { code: 'BD_FINANCE_SETTLE', name: '财务结算', description: '结算清分', parent: 'BD_FINANCE', level: 2, businessBelonging: '财务', nodeType: 'entity', ownerId: 'user-caiwu', ownerName: '财务主管' },
  { code: 'BD_MARKETING_CAMPAIGN', name: '营销活动', description: '营销活动管理', parent: 'BD_MARKETING', level: 2, businessBelonging: '运营', nodeType: 'entity', ownerId: 'user-yingxiao', ownerName: '营销经理' },

  // === L3 业务要素(覆盖指标/变量/特征) ===
  // 指标(Metric)
  { code: 'BD_USER_CUST_DAU', name: '日活', description: '日活跃用户数', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', nodeType: 'element', standardCode: 'STD_DAU', ownerId: 'user-yingxiao', ownerName: '营销经理' },
  { code: 'BD_USER_CUST_GMV', name: 'GMV', description: '成交总额', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', nodeType: 'element', ownerId: 'user-yingxiao', ownerName: '营销经理' },
  { code: 'BD_LOAN_APPLY_CONV', name: '贷款转化率', description: '申请到放款转化率', parent: 'BD_LOAN_APPLY', level: 3, businessBelonging: '对公', nodeType: 'element', ownerId: 'user-xindai', ownerName: '信贷经理' },
  // 变量(Variable)
  { code: 'BD_USER_CUST_AGE', name: '客户年龄', description: '客户年龄段', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', nodeType: 'element', standardCode: 'STD_AGE', defaultSensitivity: 'L2', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_CUST_INCOME', name: '客户收入', description: '客户月收入', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', nodeType: 'element', standardCode: 'STD_INCOME', defaultSensitivity: 'L3', ownerId: 'user-zhangsan', ownerName: '张三' },
  // 特征(Feature)
  { code: 'BD_USER_BEHAVIOR_DEV', name: '活跃设备数', description: '近30天活跃设备数', parent: 'BD_USER_BEHAVIOR', level: 3, businessBelonging: '运营', nodeType: 'element', ownerId: 'user-zhaosi', ownerName: '赵六' },
  { code: 'BD_USER_BEHAVIOR_LOGIN', name: '登录频次', description: '近30天登录频次', parent: 'BD_USER_BEHAVIOR', level: 3, businessBelonging: '运营', nodeType: 'element', ownerId: 'user-zhaosi', ownerName: '赵六' },
  { code: 'BD_RISK_CREDIT_SCORE', name: '信用评分', description: '近30天信用评分', parent: 'BD_RISK_CREDIT', level: 3, businessBelonging: '风控', nodeType: 'element', standardCode: 'STD_CREDIT_SCORE', ownerId: 'user-fengkong', ownerName: '风控值班' }
]

/**
 * Taxonomy Store
 */
export const TaxonomyStore = {
  list(): TaxonomyNode[] {
    return TAXONOMY
  },

  /** 按编码查 */
  byCode(code: string): TaxonomyNode | undefined {
    return TAXONOMY.find(n => n.code === code)
  },

  /** 按父编码查子节点 */
  byParent(parentCode: string | undefined): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.parent === parentCode)
  },

  /** 按层级查 */
  byLevel(level: 1 | 2 | 3 | 4): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.level === level)
  },

  /** 按业务归属查 */
  byBusinessBelonging(belonging: BusinessBelonging): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.businessBelonging === belonging)
  },

  /** 按节点类型查(element = 要素) */
  byNodeType(nodeType: TaxonomyNode['nodeType']): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.nodeType === nodeType)
  },

  /** 按 Owner 查 */
  byOwner(ownerId: string): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.ownerId === ownerId)
  },

  /** 搜索(按名称模糊匹配) */
  search(keyword: string): TaxonomyNode[] {
    const lower = keyword.toLowerCase()
    return TAXONOMY.filter(n =>
      n.name.toLowerCase().includes(lower) ||
      n.code.toLowerCase().includes(lower) ||
      n.description.toLowerCase().includes(lower)
    )
  }
}