/**
 * 统一分类维度(打通 #5)
 *
 * 数据标准、分级分类、要素、资产 都基于同一套分类维度:
 *   L1 业务域 → L2 业务实体 → L3 业务要素 → L4 子要素/字段
 *
 * 任何模块引用分类时,都从此处取。
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
 * 统一分类树(15 个一级域 × 完整 4 级)
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

  // === L2 业务实体(20 个) ===
  // 用户域
  { code: 'BD_USER_CUST', name: '客户', description: '零售客户基本信息', parent: 'BD_USER', level: 2, businessBelonging: '零售', nodeType: 'entity', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_ACC', name: '账户', description: '客户账户信息', parent: 'BD_USER', level: 2, businessBelonging: '零售', nodeType: 'entity', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_BEHAVIOR', name: '用户行为', description: '用户操作行为', parent: 'BD_USER', level: 2, businessBelonging: '运营', nodeType: 'entity', ownerId: 'user-zhaosi', ownerName: '赵六' },
  { code: 'BD_USER_VALUE', name: '用户价值', description: '用户价值分层', parent: 'BD_USER', level: 2, businessBelonging: '零售', nodeType: 'entity', ownerId: 'user-wangwu', ownerName: '王五' },
  // 风控域
  { code: 'BD_RISK_CREDIT', name: '信用风险', description: '信用相关风险', parent: 'BD_RISK', level: 2, businessBelonging: '风控', nodeType: 'entity', ownerId: 'user-fengkong', ownerName: '风控值班' },
  { code: 'BD_RISK_FRAUD', name: '欺诈风险', description: '欺诈检测', parent: 'BD_RISK', level: 2, businessBelonging: '风控', nodeType: 'entity', ownerId: 'user-fengkong', ownerName: '风控值班' },
  // 信贷域
  { code: 'BD_LOAN_APPLY', name: '贷款申请', description: '贷款申请流程', parent: 'BD_LOAN', level: 2, businessBelonging: '对公', nodeType: 'entity', ownerId: 'user-xindai', ownerName: '信贷经理' },
  { code: 'BD_LOAN_REPAY', name: '贷款还款', description: '还款计划', parent: 'BD_LOAN', level: 2, businessBelonging: '对公', nodeType: 'entity', ownerId: 'user-xindai', ownerName: '信贷经理' },
  { code: 'BD_LOAN_OVERDUE', name: '逾期管理', description: '逾期催收', parent: 'BD_LOAN', level: 2, businessBelonging: '风控', nodeType: 'entity', ownerId: 'user-fengkong', ownerName: '风控值班' },
  // 财务域
  { code: 'BD_FINANCE_SETTLE', name: '财务结算', description: '结算清分', parent: 'BD_FINANCE', level: 2, businessBelonging: '财务', nodeType: 'entity', ownerId: 'user-caiwu', ownerName: '财务主管' },
  { code: 'BD_FINANCE_BILLING', name: '计费', description: '计费规则', parent: 'BD_FINANCE', level: 2, businessBelonging: '财务', nodeType: 'entity', ownerId: 'user-caiwu', ownerName: '财务主管' },
  // 营销域
  { code: 'BD_MARKETING_CAMPAIGN', name: '营销活动', description: '营销活动管理', parent: 'BD_MARKETING', level: 2, businessBelonging: '运营', nodeType: 'entity', ownerId: 'user-yingxiao', ownerName: '营销经理' },
  { code: 'BD_MARKETING_CHANNEL', name: '营销渠道', description: '触达渠道', parent: 'BD_MARKETING', level: 2, businessBelonging: '运营', nodeType: 'entity', ownerId: 'user-yingxiao', ownerName: '营销经理' },
  // 产品域
  { code: 'BD_PRODUCT_FEATURE', name: '产品功能', description: '功能模块', parent: 'BD_PRODUCT', level: 2, businessBelonging: '零售', nodeType: 'entity', ownerId: 'user-chanpin', ownerName: '产品经理' },
  { code: 'BD_PRODUCT_VERSION', name: '产品版本', description: '版本管理', parent: 'BD_PRODUCT', level: 2, businessBelonging: '零售', nodeType: 'entity', ownerId: 'user-chanpin', ownerName: '产品经理' },
  // 运营域
  { code: 'BD_OPERATION_AUDIENCE', name: '客群运营', description: '人群运营', parent: 'BD_OPERATION', level: 2, businessBelonging: '运营', nodeType: 'entity', ownerId: 'user-yunying', ownerName: '王运营' },
  { code: 'BD_OPERATION_TOUCH', name: '客户触达', description: '触达管理', parent: 'BD_OPERATION', level: 2, businessBelonging: '运营', nodeType: 'entity', ownerId: 'user-yunying', ownerName: '王运营' },
  { code: 'BD_OPERATION_SERVICE', name: '客户服务', description: '客服工单', parent: 'BD_OPERATION', level: 2, businessBelonging: '运营', nodeType: 'entity', ownerId: 'user-yunying', ownerName: '王运营' },
  // 共享域
  { code: 'BD_PUBLIC', name: '公共域', description: '公共字典/枚举', parent: undefined, level: 1, businessBelonging: '零售', nodeType: 'domain', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_PUBLIC_DICT', name: '数据字典', description: '通用字典', parent: 'BD_PUBLIC', level: 2, businessBelonging: '零售', nodeType: 'entity', ownerId: 'user-zhangsan', ownerName: '张三' },

  // === L3 业务要素(20+ 个,关键要素)===
  // 客户实体下
  { code: 'BD_USER_CUST_ID', name: '客户编号', description: '客户唯一标识', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', standardCode: 'STD_001', defaultSensitivity: 'L1', nodeType: 'element', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_CUST_NAME', name: '客户姓名', description: '客户姓名', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', standardCode: 'STD_004', defaultSensitivity: 'L2', nodeType: 'element', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_CUST_IDCARD', name: '身份证号', description: '公民身份证号', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', standardCode: 'STD_005', defaultSensitivity: 'L3', nodeType: 'element', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_CUST_MOBILE', name: '手机号', description: '11 位手机号', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', standardCode: 'STD_006', defaultSensitivity: 'L3', nodeType: 'element', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_CUST_ADDR', name: '联系地址', description: '客户地址', parent: 'BD_USER_CUST', level: 3, businessBelonging: '零售', standardCode: 'STD_007', defaultSensitivity: 'L2', nodeType: 'element', ownerId: 'user-zhangsan', ownerName: '张三' },
  // 账户下
  { code: 'BD_USER_ACC_BAL', name: '账户余额', description: '客户账户余额', parent: 'BD_USER_ACC', level: 3, businessBelonging: '零售', standardCode: 'STD_002', defaultSensitivity: 'L2', nodeType: 'element', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_ACC_CREDIT', name: '授信额度', description: '授信总额度', parent: 'BD_USER_ACC', level: 3, businessBelonging: '对公', standardCode: 'STD_011', defaultSensitivity: 'L3', nodeType: 'element', ownerId: 'user-xindai', ownerName: '信贷经理' },
  // 用户行为
  { code: 'BD_USER_BEHAVIOR_LOGIN', name: '登录日志', description: '用户登录行为', parent: 'BD_USER_BEHAVIOR', level: 3, businessBelonging: '运营', standardCode: 'STD_020', defaultSensitivity: 'L1', nodeType: 'element', ownerId: 'user-zhaosi', ownerName: '赵六' },
  { code: 'BD_USER_BEHAVIOR_TRADE', name: '交易行为', description: '消费交易', parent: 'BD_USER_BEHAVIOR', level: 3, businessBelonging: '运营', standardCode: 'STD_022', defaultSensitivity: 'L2', nodeType: 'element', ownerId: 'user-zhaosi', ownerName: '赵六' },
  // 用户价值
  { code: 'BD_USER_VALUE_LEVEL', name: '价值层级', description: 'A/B/C/D 分层', parent: 'BD_USER_VALUE', level: 3, businessBelonging: '零售', standardCode: 'STD_030', defaultSensitivity: 'L1', nodeType: 'element', ownerId: 'user-wangwu', ownerName: '王五' },
  // 信用风险
  { code: 'BD_RISK_CREDIT_SCORE', name: '信用评分', description: '信用评分 0-1000', parent: 'BD_RISK_CREDIT', level: 3, businessBelonging: '风控', standardCode: 'STD_040', defaultSensitivity: 'L3', nodeType: 'element', ownerId: 'user-fengkong', ownerName: '风控值班' },
  { code: 'BD_RISK_CREDIT_OVERDUE', name: '逾期天数', description: '当前逾期天数', parent: 'BD_RISK_CREDIT', level: 3, businessBelonging: '风控', standardCode: 'STD_041', defaultSensitivity: 'L3', nodeType: 'element', ownerId: 'user-fengkong', ownerName: '风控值班' },
  // 欺诈
  { code: 'BD_RISK_FRAUD_LEVEL', name: '欺诈等级', description: '高/中/低', parent: 'BD_RISK_FRAUD', level: 3, businessBelonging: '风控', standardCode: 'STD_050', defaultSensitivity: 'L3', nodeType: 'element', ownerId: 'user-fengkong', ownerName: '风控值班' },
  // 贷款
  { code: 'BD_LOAN_APPLY_AMT', name: '申请金额', description: '贷款申请金额', parent: 'BD_LOAN_APPLY', level: 3, businessBelonging: '对公', standardCode: 'STD_002', defaultSensitivity: 'L2', nodeType: 'element', ownerId: 'user-xindai', ownerName: '信贷经理' },
  { code: 'BD_LOAN_REPAY_PLAN', name: '还款计划', description: '分期还款计划', parent: 'BD_LOAN_REPAY', level: 3, businessBelonging: '对公', standardCode: 'STD_060', defaultSensitivity: 'L2', nodeType: 'element', ownerId: 'user-xindai', ownerName: '信贷经理' },
  // 财务
  { code: 'BD_FINANCE_SETTLE_AMT', name: '结算金额', description: '清分金额', parent: 'BD_FINANCE_SETTLE', level: 3, businessBelonging: '财务', standardCode: 'STD_002', defaultSensitivity: 'L3', nodeType: 'element', ownerId: 'user-caiwu', ownerName: '财务主管' },
  { code: 'BD_FINANCE_BILLING_RATE', name: '计费率', description: '服务费率', parent: 'BD_FINANCE_BILLING', level: 3, businessBelonging: '财务', standardCode: 'STD_070', defaultSensitivity: 'L2', nodeType: 'element', ownerId: 'user-caiwu', ownerName: '财务主管' },

  // === L4 子要素(示例)===
  // 客户姓名 L4
  { code: 'BD_USER_CUST_NAME_CN', name: '中文姓名', description: '中文姓名', parent: 'BD_USER_CUST_NAME', level: 4, businessBelonging: '零售', standardCode: 'STD_004', defaultSensitivity: 'L2', nodeType: 'field', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_CUST_NAME_EN', name: '英文姓名', description: '拼音/英文名', parent: 'BD_USER_CUST_NAME', level: 4, businessBelonging: '零售', standardCode: 'STD_004', defaultSensitivity: 'L2', nodeType: 'field', ownerId: 'user-zhangsan', ownerName: '张三' },
  // 身份证号 L4
  { code: 'BD_USER_CUST_IDCARD_NO', name: '身份证号(明文)', description: '明文身份证', parent: 'BD_USER_CUST_IDCARD', level: 4, businessBelonging: '零售', standardCode: 'STD_005', defaultSensitivity: 'L3', nodeType: 'field', ownerId: 'user-zhangsan', ownerName: '张三' },
  { code: 'BD_USER_CUST_IDCARD_HASH', name: '身份证号(哈希)', description: '身份证哈希值', parent: 'BD_USER_CUST_IDCARD', level: 4, businessBelonging: '零售', standardCode: 'STD_005', defaultSensitivity: 'L2', nodeType: 'field', ownerId: 'user-zhangsan', ownerName: '张三' }
]

/**
 * 分类树 Store
 */
export const TaxonomyStore = {
  list(): TaxonomyNode[] {
    return TAXONOMY
  },

  /** 按层级 */
  byLevel(level: 1 | 2 | 3 | 4): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.level === level)
  },

  /** 按 code */
  byCode(code: string): TaxonomyNode | undefined {
    return TAXONOMY.find(n => n.code === code)
  },

  /** 按父节点 */
  children(parentCode: string): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.parent === parentCode)
  },

  /** 按节点类型 */
  byNodeType(type: 'domain' | 'entity' | 'element' | 'field'): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.nodeType === type)
  },

  /** 按业务归属 */
  byBusinessBelonging(belonging: BusinessBelonging): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.businessBelonging === belonging)
  },

  /** 按 Owner */
  byOwner(ownerId: string): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.ownerId === ownerId)
  },

  /** 关联数据标准 */
  byStandard(standardCode: string): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.standardCode === standardCode)
  },

  /** 关联敏感级别 */
  bySensitivity(sensitivity: SensitivityLevel): TaxonomyNode[] {
    return TAXONOMY.filter(n => n.defaultSensitivity === sensitivity)
  },

  /** 路径回溯(从节点到根) */
  pathOf(code: string): TaxonomyNode[] {
    const path: TaxonomyNode[] = []
    let current = this.byCode(code)
    while (current) {
      path.unshift(current)
      current = current.parent ? this.byCode(current.parent) : undefined
    }
    return path
  },

  /** 统计 */
  stats() {
    return {
      total: TAXONOMY.length,
      byLevel: {
        1: this.byLevel(1).length,
        2: this.byLevel(2).length,
        3: this.byLevel(3).length,
        4: this.byLevel(4).length
      },
      byNodeType: {
        domain: this.byNodeType('domain').length,
        entity: this.byNodeType('entity').length,
        element: this.byNodeType('element').length,
        field: this.byNodeType('field').length
      },
      byBusinessBelonging: {
        零售: this.byBusinessBelonging('零售').length,
        对公: this.byBusinessBelonging('对公').length,
        风控: this.byBusinessBelonging('风控').length,
        运营: this.byBusinessBelonging('运营').length,
        财务: this.byBusinessBelonging('财务').length
      }
    }
  }
}