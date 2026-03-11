/**
 * 标签表类型定义
 */

// 基础类型
export type TagTableStatus = 'active' | 'archived'
export type IdentityType = 'mobile' | 'device_id' | 'id_card' | 'card_no'
export type MappingAlgorithm = 'exact' | 'fuzzy' | 'similarity'

/**
 * 标签表实体
 */
export interface TagTable {
  id: string
  name: string
  code: string
  description: string
  status: TagTableStatus
  categories: string[]
  dataSource: string
  dataSourceId: string
  tableName: string
  primaryKey: string
  identityType: IdentityType
  primaryKeyFormat: string
  mappingRules: MappingRule[]
  enableMapping: boolean
  creator: string
  createTime: string
  updater: string
  updateTime: string
}

/**
 * IDMapping规则
 */
export interface MappingRule {
  id: string
  sourceField: string
  targetField: string
  algorithm: MappingAlgorithm
  threshold?: number
  enabled: boolean
}

/**
 * 数据源
 */
export interface DataSource {
  id: string
  name: string
  type: string
  host: string
  port: number
  database: string
  username: string
  status: 'active' | 'inactive'
  createTime: string
}

/**
 * 表字段信息
 */
export interface TableField {
  name: string
  type: string
  description: string
  nullable: boolean
  isPrimaryKey: boolean
  isPartitionField: boolean
  defaultValue?: string
}

/**
 * 主键唯一性检查结果
 */
export interface UniquenessCheckResult {
  score: number
  uniqueCount: number
  totalCount: number
  suggestion: string
}

/**
 * 创建标签表DTO
 */
export interface CreateTagTableDTO {
  name: string
  code: string
  description: string
  categories: string[]
  dataSourceId: string
  tableName: string
  primaryKey: string
  identityType: IdentityType
  primaryKeyFormat: string
  mappingRules: MappingRule[]
  enableMapping: boolean
}

/**
 * 更新标签表DTO
 */
export interface UpdateTagTableDTO {
  name?: string
  code?: string
  description?: string
  categories?: string[]
  status?: TagTableStatus
  mappingRules?: MappingRule[]
  enableMapping?: boolean
}

/**
 * 获取标签表列表参数
 */
export interface GetTagTablesParams {
  page?: number
  pageSize?: number
  name?: string
  status?: TagTableStatus
  category?: string
  startDate?: string
  endDate?: string
}

/**
 * 批量创建结果
 */
export interface BatchCreateResult {
  success: TagTable[]
  failed: {
    data: CreateTagTableDTO
    error: string
  }[]
  total: number
}

/**
 * 标签表预览
 */
export interface TagTablePreview {
  name: string
  code: string
  description: string
  categories: string[]
  dataSource: string
  tableName: string
  primaryKey: string
  identityType: IdentityType
  fieldCount: number
  estimatedRecords: number
}

/**
 * 快速注册步骤数据
 */
export interface QuickRegisterStepData {
  // 步骤1：基础信息
  basic: {
    dataSourceId: string
    tableName: string
    tableType: string
    primaryKey: string
    partitionFields: string[]
    description: string
  }
  
  // 步骤2：字段校验
  fields: {
    registered: TableField[]
    unregistered: TableField[]
  }
  
  // 步骤3：批量注册
  registration: {
    selectedFields: string[]
    fieldMappings: FieldMapping[]
  }
  
  // 步骤4：确认提交
  confirm: {
    preview: TagTablePreview
  }
}

/**
 * 字段映射
 */
export interface FieldMapping {
  sourceField: string
  targetField: string
  fieldType: string
  description: string
  isRegistered: boolean
}

/**
 * 表单验证规则
 */
export interface FormValidationRule {
  field: string
  message: string
  validator?: (value: any) => boolean | Promise<boolean>
}

/**
 * 导入行数据
 */
export interface ImportRow {
  [key: string]: any
  name: string
  code: string
  description?: string
  categories?: string[]
  dataSourceId?: string
  tableName?: string
  primaryKey?: string
  identityType?: IdentityType
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * 验证错误
 */
export interface ValidationError {
  row: number
  field: string
  message: string
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  showTotal?: boolean
  showJumper?: boolean
  showPageSize?: boolean
}

/**
 * 筛选表单
 */
export interface FilterForm {
  name: string
  status: TagTableStatus | ''
  category: string
  dateRange: string[]
}