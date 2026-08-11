import { MetadataStore } from './metadata-store';

export interface BusinessDomain {
  code: string;
  name: string;
  description: string;
  coverage: string;
  owner: string;
}

export interface EntityAttribute {
  code: string;
  name: string;
  type: 'general' | 'extended';
  dataType: string;
  description: string;
  isCommon: boolean;
  extendedConfig?: string;
}

export interface BusinessEntity {
  code: string;
  name: string;
  domainCode: string;
  description: string;
  coreRelations: string[];
  isMandatory: boolean;
  attributes: EntityAttribute[];
}

export interface BusinessRelation {
  code: string;
  name: string;
  sourceEntityCode: string;
  targetEntityCode: string;
  type: 'association' | 'behavior' | 'derivative' | 'dependency' | 'trigger' | 'config' | 'check';
  description: string;
  cardinality: string;
}

export interface DataElement {
  code: string;
  name: string;
  type: 'metric' | 'tag' | 'variable' | 'caliber';
  relatedEntityCode: string; // 关联实体
  relatedAttributeCode?: string; // 关联属性
  relatedProduct: string; // 适用产品
  // 关联数据资源（物理表/字段）
  relatedResource?: {
    table: string;
    field: string;
  };
  // 关联数据资产（API/看板）
  relatedAsset?: string;
}

// 预置业务域数据
const domains: BusinessDomain[] = [
  { code: 'DOM001', name: '客户域', description: '管理用户注册、实名、客户信息相关业务', coverage: '注册、实名', owner: '客户运营负责人' },
  { code: 'DOM002', name: '账户域', description: '管理用户账户创建、状态维护、权限控制', coverage: '注册后→全流程', owner: '账户运营负责人' },
  { code: 'DOM003', name: '授信域', description: '管理授信申请、审核、额度审批、授信合同相关业务', coverage: '授信环节', owner: '授信业务负责人' },
  { code: 'DOM004', name: '支用域', description: '管理支用申请、放款、用信记录相关业务', coverage: '用信环节', owner: '用信业务负责人' },
  { code: 'DOM005', name: '还款域', description: '管理还款计划、还款执行、还款记录相关业务', coverage: '还款环节', owner: '还款业务负责人' },
  { code: 'DOM006', name: '贷后域', description: '管理逾期监控、催收、资产处置相关业务', coverage: '贷后管理环节', owner: '贷后业务负责人' },
  { code: 'DOM007', name: '产品域', description: '管理消费金融产品定义、产品属性、产品配置相关业务', coverage: '全流程', owner: '产品经理负责人' },
  { code: 'DOM008', name: '风控域', description: '管理全流程风控规则、风险评估、风险标签相关业务', coverage: '全流程', owner: '风控负责人' }
];

// 预置业务实体数据
const entities: BusinessEntity[] = [
  {
    code: 'ENT001', name: '客户', domainCode: 'DOM001', description: '消费金融产品用户的核心身份实体', coreRelations: ['账户', '授信合同'], isMandatory: true,
    attributes: [
      { code: 'ATT_CUST_001', name: '客户ID', type: 'general', dataType: 'string', description: '唯一标识', isCommon: true },
      { code: 'ATT_CUST_002', name: '姓名', type: 'general', dataType: 'string', description: '真实姓名', isCommon: true },
      { code: 'ATT_CUST_003', name: '手机号', type: 'general', dataType: 'string', description: '注册手机号', isCommon: true }
    ]
  },
  {
    code: 'ENT002', name: '账户', domainCode: 'DOM002', description: '客户的资金账户实体', coreRelations: ['客户', '还款计划'], isMandatory: true,
    attributes: [
      { code: 'ATT_ACCT_001', name: '账户ID', type: 'general', dataType: 'string', description: '唯一标识', isCommon: true },
      { code: 'ATT_ACCT_002', name: '账户状态', type: 'general', dataType: 'string', description: '正常/冻结/注销', isCommon: true }
    ]
  },
  {
    code: 'ENT003', name: '授信申请', domainCode: 'DOM003', description: '客户的授信申请记录，存储申请信息、审核结果', coreRelations: ['客户', '账户', '授信合同'], isMandatory: true,
    attributes: [
      { code: 'ATT_APPLY_001', name: '申请ID', type: 'general', dataType: 'string', description: '唯一标识', isCommon: true },
      { code: 'ATT_APPLY_002', name: '申请金额', type: 'general', dataType: 'number', description: '用户申请的金额', isCommon: true },
      { code: 'ATT_APPLY_003', name: '申请时间', type: 'general', dataType: 'datetime', description: '申请提交时间', isCommon: true }
    ]
  },
  {
    code: 'ENT004', name: '授信合同', domainCode: 'DOM003', description: '授信审批通过后生成的合同实体', coreRelations: ['客户', '账户', '授信申请', '支用单'], isMandatory: true,
    attributes: [
      { code: 'ATT001', name: '合同编号', type: 'general', dataType: 'string', description: '唯一标识', isCommon: true },
      { code: 'ATT004', name: '授信额度', type: 'general', dataType: 'number', description: '审批通过的总授信额度', isCommon: true, extendedConfig: '不同产品可配置额度上限/下限' },
      { code: 'ATT006', name: '年化利率', type: 'general', dataType: 'number', description: '授信的年化利率', isCommon: true, extendedConfig: '不同产品可配置利率区间' },
      { code: 'ATT008', name: '循环额度标识', type: 'extended', dataType: 'boolean', description: '是否支持循环支用', isCommon: false, extendedConfig: '产品A:是, 产品B:否' }
    ]
  },
  {
    code: 'ENT005', name: '支用申请', domainCode: 'DOM004', description: '客户的用信申请记录', coreRelations: ['客户', '账户', '授信合同', '支用单'], isMandatory: true,
    attributes: [
      { code: 'ATT_LOAN_APPLY_001', name: '支用申请ID', type: 'general', dataType: 'string', description: '唯一标识', isCommon: true },
      { code: 'ATT_LOAN_APPLY_002', name: '支用用途', type: 'general', dataType: 'string', description: '资金用途', isCommon: true }
    ]
  },
  {
    code: 'ENT006', name: '支用单', domainCode: 'DOM004', description: '用信审批通过后生成的支用凭证', coreRelations: ['客户', '授信合同', '还款计划'], isMandatory: true,
    attributes: [
      { code: 'ATT_LOAN_001', name: '支用单号', type: 'general', dataType: 'string', description: '唯一标识', isCommon: true },
      { code: 'ATT_LOAN_002', name: '支用金额', type: 'general', dataType: 'number', description: '实际放款金额', isCommon: true }
    ]
  },
  {
    code: 'ENT007', name: '还款计划', domainCode: 'DOM005', description: '基于支用单生成的还款计划', coreRelations: ['客户', '账户', '支用单', '还款记录'], isMandatory: true,
    attributes: [
      { code: 'ATT_PLAN_001', name: '计划ID', type: 'general', dataType: 'string', description: '唯一标识', isCommon: true },
      { code: 'ATT_PLAN_002', name: '期数', type: 'general', dataType: 'number', description: '当前期数', isCommon: true },
      { code: 'ATT_PLAN_003', name: '应还金额', type: 'general', dataType: 'number', description: '本期应还总额', isCommon: true }
    ]
  },
  {
    code: 'ENT008', name: '贷后记录', domainCode: 'DOM006', description: '监控逾期、催收等贷后情况', coreRelations: ['客户', '支用单', '还款计划'], isMandatory: true,
    attributes: [
      { code: 'ATT_POST_001', name: '监控ID', type: 'general', dataType: 'string', description: '唯一标识', isCommon: true },
      { code: 'ATT_POST_002', name: '逾期天数', type: 'general', dataType: 'number', description: '当前逾期天数', isCommon: true },
      { code: 'ATT_POST_003', name: '催收状态', type: 'general', dataType: 'string', description: '当前催收进展', isCommon: true }
    ]
  }
];

// 预置业务关系数据
const relations: BusinessRelation[] = [
  { code: 'REL001', name: '拥有', sourceEntityCode: 'ENT001', targetEntityCode: 'ENT002', type: 'association', description: '客户在平台拥有账户', cardinality: '1:N' },
  { code: 'REL002', name: '发起', sourceEntityCode: 'ENT001', targetEntityCode: 'ENT003', type: 'behavior', description: '客户发起授信申请', cardinality: '1:N' },
  { code: 'REL003', name: '生成', sourceEntityCode: 'ENT003', targetEntityCode: 'ENT004', type: 'derivative', description: '授信申请通过生成合同', cardinality: '1:1' },
  { code: 'REL004', name: '发起', sourceEntityCode: 'ENT001', targetEntityCode: 'ENT005', type: 'behavior', description: '客户发起支用申请', cardinality: '1:N' },
  { code: 'REL005', name: '支持', sourceEntityCode: 'ENT004', targetEntityCode: 'ENT005', type: 'association', description: '授信合同支持支用申请', cardinality: '1:N' },
  { code: 'REL006', name: '生成', sourceEntityCode: 'ENT005', targetEntityCode: 'ENT006', type: 'derivative', description: '支用申请通过生成支用单', cardinality: '1:1' },
  { code: 'REL007', name: '生成', sourceEntityCode: 'ENT006', targetEntityCode: 'ENT007', type: 'derivative', description: '支用单生成还款计划', cardinality: '1:N' },
  { code: 'REL008', name: '被监控', sourceEntityCode: 'ENT007', targetEntityCode: 'ENT008', type: 'association', description: '还款计划被贷后记录监控', cardinality: '1:N' }
];

// 预置数据要素数据（尝试关联 MetadataStore 中的表）
const elements: DataElement[] = [
  {
    code: 'ELE001', name: '授信额度', type: 'metric', relatedEntityCode: 'ENT004', relatedAttributeCode: 'ATT004', relatedProduct: '所有产品',
    relatedResource: { table: 'dwd_credit_contract', field: 'credit_amount' }, relatedAsset: '授信额度统计看板'
  },
  {
    code: 'ELE002', name: '支用率', type: 'metric', relatedEntityCode: 'ENT004', relatedAttributeCode: '', relatedProduct: '所有产品',
    relatedResource: { table: 'dws_credit_analysis', field: 'usage_rate' }, relatedAsset: '支用率趋势分析'
  },
  {
    code: 'ELE003', name: '授信申请金额', type: 'metric', relatedEntityCode: 'ENT003', relatedAttributeCode: 'ATT_APPLY_002', relatedProduct: '所有产品',
    relatedResource: { table: 'dwd_credit_apply', field: 'apply_amount' }, relatedAsset: '授信申请趋势分析'
  },
  {
    code: 'ELE004', name: '循环额度标识', type: 'variable', relatedEntityCode: 'ENT004', relatedAttributeCode: 'ATT008', relatedProduct: '产品A/C',
    relatedResource: { table: 'dwd_credit_contract', field: 'cycle_credit_flag' }, relatedAsset: '产品配置管理平台'
  },
  {
    code: 'ELE005', name: '应还金额', type: 'metric', relatedEntityCode: 'ENT007', relatedAttributeCode: 'ATT_PLAN_003', relatedProduct: '所有产品',
    relatedResource: { table: 'dws_repayment_plan', field: 'due_amount' }, relatedAsset: '还款进度看板'
  }
];

export const BusinessConceptStore = {
  getDomains: () => domains,
  getEntities: () => entities,
  getRelations: () => relations,
  getElements: () => elements,
  
  // 简单增删改查 Mock
  addEntity: (entity: BusinessEntity) => { entities.push(entity); return entity; },
  updateEntity: (code: string, data: Partial<BusinessEntity>) => {
    const idx = entities.findIndex(e => e.code === code);
    if (idx > -1) Object.assign(entities[idx], data);
  },
  
  // 核心功能：获取实体关联的物理表信息（从 MetadataStore 查找）
  getEntityRelatedTables: (entityCode: string) => {
    const entityElements = elements.filter(e => e.relatedEntityCode === entityCode);
    const tableNames = [...new Set(entityElements.map(e => e.relatedResource?.table).filter(Boolean))];
    const allTables = MetadataStore.getTables();
    return allTables.filter(t => tableNames.includes(t.name as string));
  },
  
  // 新增：获取实体关联的数据要素
  getEntityRelatedElements: (entityCode: string) => {
    return elements.filter(e => e.relatedEntityCode === entityCode);
  },

  // 新增：获取业务域下的所有物理表（通过域 -> 实体 -> 要素 -> 表 级联查找）
  getDomainRelatedTables: (domainCode: string) => {
    const domainEntities = entities.filter(e => e.domainCode === domainCode);
    let allRelatedTables: any[] = [];
    domainEntities.forEach(e => {
      const tables = BusinessConceptStore.getEntityRelatedTables(e.code);
      allRelatedTables = [...allRelatedTables, ...tables];
    });
    // 去重
    const uniqueTables = Array.from(new Map(allRelatedTables.map(item => [item.name, item])).values());
    return uniqueTables;
  }
};
