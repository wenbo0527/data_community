import { MockMethod } from 'vite-plugin-mock';

// 数据地图模拟数据

// 数据质量等级枚举
export enum DataQualityLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// 业务重要性等级枚举
export enum BusinessImportance {
  CRITICAL = 'critical',
  IMPORTANT = 'important',
  NORMAL = 'normal',
  LOW = 'low'
}

// 数据敏感性等级枚举
export enum DataSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

// 字段约束类型
export interface FieldConstraints {
  nullable: boolean;
  unique: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    field: string;
  };
  defaultValue?: any;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

// 扩展的表字段接口
export interface TableField {
  name: string;
  type: string;
  description: string;
  qualityLevel: DataQualityLevel;
  businessImportance: BusinessImportance;
  sensitivity: DataSensitivity;
  constraints: FieldConstraints;
  tags: string[];
  lastUpdated: string;
}

// 字段关系接口
export interface FieldRelation {
  sourceTable: string;
  sourceField: string;
  targetTable: string;
  targetField: string;
  relationType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  relationDescription: string;
  isActive: boolean;
}

// 数据血缘关系
export interface DataLineage {
  id: string;
  sourceTable: string;
  targetTable: string;
  transformationLogic: string;
  dependencies: string[];
  updateFrequency: string;
  lastExecuted: string;
}

// 表项接口
export interface TableItem {
  name: string;
  type: 'dim' | 'fact' | 'dws' | 'dwd' | 'ads' | 'ods';
  category: 'ODS' | 'DWD' | 'DWS' | 'ADS' | 'DIM';
  domain: string;
  updateFrequency: string;
  owner: string;
  description: string;
  fields: TableField[];
  recordCount: number;
  storageSize: string;
  partitionKeys: string[];
  indexKeys: string[];
  createdTime: string;
  lastModified: string;
  tags: string[];
  qualityScore: number;
}

// 表集合接口
export interface TableCollection {
  id: string;
  name: string;
  description: string;
  type: string;
  tables: TableItem[];
  owner: string;
  updateTime: string;
  isFavorite: boolean;
  tags: string[];
  accessLevel: DataSensitivity;
}

// 模拟数据
export const mockTables: TableItem[] = [
  {
    name: 'dim_user',
    type: 'dim',
    category: 'DIM',
    domain: '用户域',
    updateFrequency: '每日',
    owner: '张三',
    description: '用户维度表，存储用户基础信息。关联逻辑：作为主表关联fact_loan_apply表(user_id)和dws_risk_score表(user_id)，提供用户基础画像数据。',
    recordCount: 1250000,
    storageSize: '2.5GB',
    partitionKeys: ['create_date'],
    indexKeys: ['user_id', 'mobile'],
    createdTime: '2024-01-01T00:00:00Z',
    lastModified: '2025-01-27T10:30:00Z',
    tags: ['用户', '维度表', '核心数据'],
    qualityScore: 95,
    fields: [
      { 
        name: 'user_id', 
        type: 'string', 
        description: '用户ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: true, primaryKey: true },
        tags: ['主键', '唯一标识'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'username', 
        type: 'string', 
        description: '用户名',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: true, primaryKey: false, maxLength: 50 },
        tags: ['用户标识'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'mobile', 
        type: 'string', 
        description: '手机号',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: false, unique: true, primaryKey: false, pattern: '^1[3-9]\\d{9}$' },
        tags: ['联系方式', '敏感信息'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'id_card', 
        type: 'string', 
        description: '身份证号',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.RESTRICTED,
        constraints: { nullable: false, unique: true, primaryKey: false, pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$' },
        tags: ['身份信息', '高敏感'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'create_time', 
        type: 'timestamp', 
        description: '创建时间',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.NORMAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['时间戳'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'age', 
        type: 'int', 
        description: '年龄',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['用户画像'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'gender', 
        type: 'string', 
        description: '性别',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.NORMAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['用户画像'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'education', 
        type: 'string', 
        description: '学历',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['用户画像', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'occupation', 
        type: 'string', 
        description: '职业',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['用户画像', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'address', 
        type: 'string', 
        description: '地址',
        qualityLevel: DataQualityLevel.LOW,
        businessImportance: BusinessImportance.NORMAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['地理信息'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'income_level', 
        type: 'string', 
        description: '收入水平',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['收入信息', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      }
    ]
  },
  {
    name: 'fact_loan_apply',
    type: 'fact',
    category: 'DWD',
    domain: '贷前分析',
    updateFrequency: '实时',
    owner: '李四',
    description: '贷款申请事实表。关联逻辑：通过user_id关联dim_user表获取申请人信息，通过user_id关联dws_risk_score表获取风控评分，用于贷前审批决策。',
    recordCount: 850000,
    storageSize: '1.8GB',
    partitionKeys: ['apply_date'],
    indexKeys: ['apply_id', 'user_id'],
    createdTime: '2024-01-01T00:00:00Z',
    lastModified: '2025-01-27T10:30:00Z',
    tags: ['贷款申请', '事实表', '核心业务'],
    qualityScore: 92,
    fields: [
      { 
        name: 'apply_id', 
        type: 'string', 
        description: '申请ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: true, primaryKey: true },
        tags: ['主键', '申请标识'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'user_id', 
        type: 'string', 
        description: '用户ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false, foreignKey: { table: 'dim_user', field: 'user_id' } },
        tags: ['外键', '用户关联'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'loan_amount', 
        type: 'decimal', 
        description: '申请金额',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['金额信息', '业务核心'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'loan_term', 
        type: 'int', 
        description: '贷款期限',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['期限信息'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'apply_time', 
        type: 'timestamp', 
        description: '申请时间',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['时间戳', '业务时间'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'loan_purpose', 
        type: 'string', 
        description: '贷款用途',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['用途分类'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'monthly_income', 
        type: 'decimal', 
        description: '月收入',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['收入信息', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'employment_type', 
        type: 'string', 
        description: '就业类型',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['就业信息', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'credit_score', 
        type: 'int', 
        description: '信用评分',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['信用评分', '风控核心'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'product_type', 
        type: 'string', 
        description: '产品类型',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['产品分类'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'approval_status', 
        type: 'string', 
        description: '审批状态',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['审批状态', '业务状态'],
        lastUpdated: '2025-01-27T10:30:00Z'
      }
    ]
  },
  {
    name: 'dws_risk_score',
    type: 'dws',
    category: 'DWS',
    domain: '风控评估',
    updateFrequency: '每日',
    owner: '王五',
    description: '风险评分汇总表。关联逻辑：通过user_id关联dim_user表获取用户基本信息，为fact_loan_apply表提供风控评分支持，同时关联dwd_fraud_alert表获取欺诈信息。',
    recordCount: 1200000,
    storageSize: '800MB',
    partitionKeys: ['update_date'],
    indexKeys: ['user_id'],
    createdTime: '2024-01-01T00:00:00Z',
    lastModified: '2025-01-27T10:30:00Z',
    tags: ['风控评分', '汇总表', '核心指标'],
    qualityScore: 88,
    fields: [
      { 
        name: 'user_id', 
        type: 'string', 
        description: '用户ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: true, primaryKey: true, foreignKey: { table: 'dim_user', field: 'user_id' } },
        tags: ['主键', '用户关联'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'credit_score', 
        type: 'int', 
        description: '信用评分',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['信用评分', '风控核心'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'behavior_score', 
        type: 'int', 
        description: '行为评分',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['行为分析', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'anti_fraud_score', 
        type: 'int', 
        description: '反欺诈评分',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['反欺诈', '风控核心'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'update_time', 
        type: 'timestamp', 
        description: '更新时间',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.NORMAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['时间戳'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'overdue_history', 
        type: 'string', 
        description: '逾期历史',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['逾期信息', '风控核心'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'credit_history_length', 
        type: 'int', 
        description: '信用历史长度(月)',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['信用历史', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      }
    ]
  },
  {
    name: 'dwd_fraud_alert',
    type: 'dwd',
    category: 'DWD',
    domain: '反欺诈',
    updateFrequency: '实时',
    owner: '赵六',
    description: '欺诈预警明细表。关联逻辑：通过user_id关联dim_user表和dws_risk_score表，为风控决策提供欺诈风险信息，是风控评分的重要组成部分。',
    recordCount: 45000,
    storageSize: '120MB',
    partitionKeys: ['alert_date'],
    indexKeys: ['alert_id', 'user_id'],
    createdTime: '2024-01-01T00:00:00Z',
    lastModified: '2025-01-27T10:30:00Z',
    tags: ['欺诈预警', '明细表', '实时监控'],
    qualityScore: 90,
    fields: [
      { 
        name: 'alert_id', 
        type: 'string', 
        description: '预警ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: true, primaryKey: true },
        tags: ['主键', '预警标识'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'user_id', 
        type: 'string', 
        description: '用户ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false, foreignKey: { table: 'dim_user', field: 'user_id' } },
        tags: ['外键', '用户关联'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'alert_type', 
        type: 'string', 
        description: '预警类型',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['预警分类', '风控类型'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'alert_level', 
        type: 'string', 
        description: '预警等级',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['预警等级', '风险级别'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'alert_time', 
        type: 'timestamp', 
        description: '预警时间',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['时间戳', '预警时间'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'device_info', 
        type: 'string', 
        description: '设备信息',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['设备信息', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'ip_address', 
        type: 'string', 
        description: 'IP地址',
        qualityLevel: DataQualityLevel.MEDIUM,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['网络信息', '风控因子'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'location', 
        type: 'string', 
        description: '地理位置',
        qualityLevel: DataQualityLevel.LOW,
        businessImportance: BusinessImportance.NORMAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: true, unique: false, primaryKey: false },
        tags: ['地理信息', '位置数据'],
        lastUpdated: '2025-01-27T10:30:00Z'
      }
    ]
  },
  {
    name: 'fact_self_loan',
    type: 'fact',
    category: 'DWD',
    domain: '自营业务',
    updateFrequency: '实时',
    owner: '钱七',
    description: '自营贷款业务事实表，记录自营贷款业务的交易信息',
    recordCount: 320000,
    storageSize: '650MB',
    partitionKeys: ['transaction_date'],
    indexKeys: ['transaction_id', 'user_id'],
    createdTime: '2024-01-01T00:00:00Z',
    lastModified: '2025-01-27T10:30:00Z',
    tags: ['自营业务', '事实表', '交易数据'],
    qualityScore: 85,
    fields: [
      { 
        name: 'transaction_id', 
        type: 'string', 
        description: '交易ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: true, primaryKey: true },
        tags: ['主键', '交易标识'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'user_id', 
        type: 'string', 
        description: '用户ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false, foreignKey: { table: 'dim_user', field: 'user_id' } },
        tags: ['外键', '用户关联'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'product_id', 
        type: 'string', 
        description: '产品ID',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['产品标识'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'amount', 
        type: 'decimal', 
        description: '交易金额',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['金额信息', '交易核心'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'transaction_time', 
        type: 'timestamp', 
        description: '交易时间',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['时间戳', '交易时间'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'interest_rate', 
        type: 'decimal', 
        description: '利率',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.CONFIDENTIAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['利率信息', '定价核心'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'term', 
        type: 'int', 
        description: '期限',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.IMPORTANT,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['期限信息'],
        lastUpdated: '2025-01-27T10:30:00Z'
      },
      { 
        name: 'status', 
        type: 'string', 
        description: '交易状态',
        qualityLevel: DataQualityLevel.HIGH,
        businessImportance: BusinessImportance.CRITICAL,
        sensitivity: DataSensitivity.INTERNAL,
        constraints: { nullable: false, unique: false, primaryKey: false },
        tags: ['交易状态', '业务状态'],
        lastUpdated: '2025-01-27T10:30:00Z'
      }
    ]
  }
];

// 新增数据血缘关系配置
const dataLineageConfig: DataLineage[] = [
  {
    id: 'lineage-001',
    sourceTable: 'dim_user',
    targetTable: 'fact_loan_apply',
    transformationLogic: '通过user_id字段进行一对多关联，为贷款申请提供用户基础信息',
    dependencies: ['dim_user.user_id'],
    updateFrequency: '实时',
    lastExecuted: '2025-01-27T10:30:00Z'
  },
  {
    id: 'lineage-002',
    sourceTable: 'dim_user',
    targetTable: 'dws_risk_score',
    transformationLogic: '通过user_id字段进行一对一关联，为风控评分提供用户画像数据',
    dependencies: ['dim_user.user_id', 'dim_user.age', 'dim_user.education'],
    updateFrequency: '每日',
    lastExecuted: '2025-01-27T08:00:00Z'
  },
  {
    id: 'lineage-003',
    sourceTable: 'dws_risk_score',
    targetTable: 'fact_loan_apply',
    transformationLogic: '通过user_id字段关联，为贷款申请决策提供风控评分支持',
    dependencies: ['dws_risk_score.credit_score', 'dws_risk_score.anti_fraud_score'],
    updateFrequency: '实时',
    lastExecuted: '2025-01-27T10:30:00Z'
  }
];

// 新增字段关系配置
const fieldRelations: FieldRelation[] = [
  {
    sourceTable: 'dim_user',
    sourceField: 'user_id',
    targetTable: 'fact_loan_apply',
    targetField: 'user_id',
    relationType: 'one-to-many',
    relationDescription: '一个用户可以有多个贷款申请',
    isActive: true
  },
  {
    sourceTable: 'dim_user',
    sourceField: 'user_id',
    targetTable: 'dws_risk_score',
    targetField: 'user_id',
    relationType: 'one-to-one',
    relationDescription: '一个用户对应一个风控评分记录',
    isActive: true
  },
  {
    sourceTable: 'dim_user',
    sourceField: 'user_id',
    targetTable: 'dwd_fraud_alert',
    targetField: 'user_id',
    relationType: 'one-to-many',
    relationDescription: '一个用户可能有多个欺诈预警记录',
    isActive: true
  }
];

const mockCollections: TableCollection[] = [
  {
    id: 'collection-1',
    name: '贷前分析',
    description: '贷前分析场景的相关数据表，包含贷款申请、用户信息等核心数据',
    type: '业务流程',
    tables: mockTables.filter(table => ['贷前分析', '用户域'].includes(table.domain)),
    owner: '张三',
    updateTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5分钟前
    isFavorite: true,
    tags: ['贷前', '核心业务', '申请流程'],
    accessLevel: DataSensitivity.CONFIDENTIAL
  },
  {
    id: 'collection-2',
    name: '风控评估',
    description: '风控评估场景的相关数据表，用于风险评分和信用评估',
    type: '风险管控',
    tables: mockTables.filter(table => table.domain === '风控评估'),
    owner: '李四',
    updateTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    isFavorite: false,
    tags: ['风控', '评分', '信用评估'],
    accessLevel: DataSensitivity.RESTRICTED
  },
  {
    id: 'collection-3',
    name: '反欺诈分析',
    description: '反欺诈场景的相关数据表，用于识别和预防欺诈行为',
    type: '风险管控',
    tables: mockTables.filter(table => table.domain === '反欺诈' || table.name.includes('fraud')),
    owner: '王五',
    updateTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    isFavorite: true,
    tags: ['反欺诈', '实时监控', '预警'],
    accessLevel: DataSensitivity.RESTRICTED
  },
  {
    id: 'collection-4',
    name: '自营业务分析',
    description: '自营业务场景的相关数据表，用于分析自营贷款业务的运营情况',
    type: '业务流程',
    tables: mockTables.filter(table => table.domain === '自营业务'),
    owner: '赵六',
    updateTime: new Date().toISOString(), // 刚刚
    isFavorite: false,
    tags: ['自营', '业务分析', '运营'],
    accessLevel: DataSensitivity.CONFIDENTIAL
  }
];

const mockApis = [
  {
    url: '/api/data-map/tables',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const { name, type, category, domain, current = 1, pageSize = 10 } = query;
      
      let filteredTables = [...mockTables];
      
      if (name) {
        filteredTables = filteredTables.filter(table =>
          table.name.toLowerCase().includes(name.toLowerCase()) ||
          table.description.toLowerCase().includes(name.toLowerCase())
        );
      }
      
      if (type) {
        filteredTables = filteredTables.filter(table => table.type === type);
      }
      
      if (category) {
        filteredTables = filteredTables.filter(table => table.category === category);
      }
      
      if (domain) {
        filteredTables = filteredTables.filter(table => table.domain === domain);
      }
      
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        code: 200,
        data: {
          list: filteredTables.slice(start, end),
          total: filteredTables.length
        }
      };
    }
  },
  {
    url: '/api/data-map/collections',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: mockCollections
      };
    }
  }
] as MockMethod[];

export default {
  tables: mockTables,
  collections: mockCollections,
  dataLineage: dataLineageConfig,
  fieldRelations: fieldRelations,
  favoriteTables: mockTables.filter(table => table.name.includes('dim') || table.name.includes('fact')),
  // 数据质量统计
  qualityStats: {
    totalTables: mockTables.length,
    highQualityTables: mockTables.filter(table => table.qualityScore >= 90).length,
    mediumQualityTables: mockTables.filter(table => table.qualityScore >= 80 && table.qualityScore < 90).length,
    lowQualityTables: mockTables.filter(table => table.qualityScore < 80).length,
    averageQualityScore: Math.round(mockTables.reduce((sum, table) => sum + table.qualityScore, 0) / mockTables.length)
  },
  // 敏感性统计
  sensitivityStats: {
    publicTables: mockTables.filter(table => table.fields.some(field => field.sensitivity === DataSensitivity.PUBLIC)).length,
    internalTables: mockTables.filter(table => table.fields.some(field => field.sensitivity === DataSensitivity.INTERNAL)).length,
    confidentialTables: mockTables.filter(table => table.fields.some(field => field.sensitivity === DataSensitivity.CONFIDENTIAL)).length,
    restrictedTables: mockTables.filter(table => table.fields.some(field => field.sensitivity === DataSensitivity.RESTRICTED)).length
  }
};