/**
 * 业务概念 Store(简化版,用于渲染测试)
 *
 * 联邦治理核心:业务域 / 业务实体 / 业务关系
 * @see 文档 §14 联邦治理
 */

export const BusinessConceptStore = {
  /** 业务域 */
  domains: [
    { code: 'DOM001', name: '客户域', description: '管理用户注册、实名、客户信息相关业务', owner: '客户运营负责人' },
    { code: 'DOM002', name: '账户域', description: '管理用户账户创建、状态维护', owner: '账户运营负责人' },
    { code: 'DOM003', name: '授信域', description: '管理授信申请、审核、额度审批', owner: '授信业务负责人' },
    { code: 'DOM004', name: '风控域', description: '管理全流程风控规则、风险评估', owner: '风控负责人' },
    { code: 'DOM005', name: '信贷域', description: '管理贷款申请、放款、还款', owner: '信贷经理' },
    { code: 'DOM006', name: '营销域', description: '管理营销活动、渠道、触达', owner: '营销经理' },
    { code: 'DOM007', name: '财务域', description: '管理财务结算、核算、计费', owner: '财务主管' },
    { code: 'DOM008', name: '运营域', description: '管理客户运营、活动、关怀', owner: '运营经理' }
  ],

  /** 业务实体 */
  entities: [
    { code: 'ENT001', name: '客户', domainCode: 'DOM001', description: '消费金融产品用户的核心身份实体', isMandatory: true },
    { code: 'ENT002', name: '账户', domainCode: 'DOM002', description: '客户的资金账户实体', isMandatory: true },
    { code: 'ENT003', name: '授信合同', domainCode: 'DOM003', description: '授信合同记录', isMandatory: true },
    { code: 'ENT004', name: '贷款申请', domainCode: 'DOM005', description: '贷款申请主表', isMandatory: false },
    { code: 'ENT005', name: '还款计划', domainCode: 'DOM005', description: '还款计划', isMandatory: false }
  ],

  /** 业务关系 */
  relations: [
    { code: 'REL001', name: '客户拥有账户', sourceEntityCode: 'ENT001', targetEntityCode: 'ENT002', type: 'association' },
    { code: 'REL002', name: '账户签订授信', sourceEntityCode: 'ENT002', targetEntityCode: 'ENT003', type: 'dependency' },
    { code: 'REL003', name: '授信生成申请', sourceEntityCode: 'ENT003', targetEntityCode: 'ENT004', type: 'trigger' }
  ],

  listDomains() { return this.domains },
  /** 别名:返回域列表(兼容旧调用) */
  getDomains() { return this.domains },
  /** 别名:返回实体列表(兼容旧调用) */
  getEntities() { return this.entities },
  /** 别名:返回关系列表(兼容旧调用) */
  getRelations() { return this.relations },
  listEntities() { return this.entities },
  listRelations() { return this.relations },
  byDomainCode(code: string) { return this.entities.filter(e => e.domainCode === code) }
}

export default BusinessConceptStore