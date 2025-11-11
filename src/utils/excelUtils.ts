import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { MetricType, RegulatoryCategory, RegulatoryCategories } from '@/types/metrics'

/**
 * 生成并下载Excel模板
 * @param type 指标类型
 */
export function generateExcelTemplate(type: MetricType) {
  const workbook = XLSX.utils.book_new()
  
  // 根据指标类型创建不同的模板
  if (type === MetricType.BUSINESS_CORE) {
    createBusinessMetricTemplate(workbook)
  } else if (type === MetricType.REGULATORY) {
    createRegulatoryMetricTemplate(workbook)
  }
  
  // 生成二进制数据
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  // 下载文件
  const fileName = type === MetricType.BUSINESS_CORE ? '业务核心指标批量注册模板.xlsx' : '监管指标批量注册模板.xlsx'
  saveAs(blob, fileName)
}

/**
 * 创建业务核心指标模板
 */
function createBusinessMetricTemplate(workbook: XLSX.WorkBook) {
  // 创建示例数据
  const exampleData = [
    {
      '指标名称': '日活跃用户数',
      '指标编码': 'BIZ_USER_DAU',
      '指标分类': 'user',
      '业务域': 'user',
      '统计周期': '日更新',
      '业务负责人': '张三',
      '技术负责人': '李四',
      '业务定义': '每日登录系统的去重用户数',
      '使用场景': '用户活跃度分析',
      '技术逻辑': 'SELECT COUNT(DISTINCT user_id) FROM dwd_user_login_detail WHERE dt = ${bizdate}',
      '字段说明': '整型数值',
      '报表信息': '用户活跃度日报',
      '查询代码': 'SELECT * FROM ads_user_metrics WHERE metric_code = \'BIZ_USER_DAU\''
    }
  ]
  
  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(exampleData)
  
  // 设置列宽
  const colWidths = [
    { wch: 20 }, // 指标名称
    { wch: 15 }, // 指标编码
    { wch: 10 }, // 指标分类
    { wch: 10 }, // 业务域
    { wch: 10 }, // 统计周期
    { wch: 12 }, // 业务负责人
    { wch: 12 }, // 技术负责人
    { wch: 30 }, // 业务定义
    { wch: 20 }, // 使用场景
    { wch: 50 }, // 技术逻辑
    { wch: 15 }, // 字段说明
    { wch: 20 }, // 报表信息
    { wch: 40 }  // 查询代码
  ]
  worksheet['!cols'] = colWidths
  
  // 添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '业务核心指标')
  
  // 添加说明页
  addInstructionSheet(workbook, MetricType.BUSINESS_CORE)
}

/**
 * 创建监管指标模板
 */
function createRegulatoryMetricTemplate(workbook: XLSX.WorkBook) {
  // 创建示例数据
  const exampleData = [
    {
      '指标名称': '资本充足率',
      '指标编码': 'REG_CAPITAL_ADEQUACY_RATIO',
      '指标分类': 'risk',
      '监管报表大类': 'cbirc_banking',
      '统计周期': '季度更新',
      '业务负责人': '李四',
      '技术负责人': '王五',
      '报表名称': '资本充足率报表',
      '业务定义': '核心资本与风险加权资产之比',
      '来源表': 'dwd_capital_adequacy',
      '技术逻辑': 'SELECT core_capital / risk_weighted_assets FROM dwd_capital_adequacy WHERE period = ${quarter}',
      '字段说明': '百分比，保留2位小数',
      '存储位置': 'ads_regulatory_metrics',
      '查询代码': 'SELECT * FROM ads_regulatory_metrics WHERE metric_code = \'REG_CAPITAL_ADEQUACY_RATIO\''
    }
  ]
  
  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(exampleData)
  
  // 设置列宽
  const colWidths = [
    { wch: 20 }, // 指标名称
    { wch: 25 }, // 指标编码
    { wch: 10 }, // 指标分类
    { wch: 20 }, // 监管报表大类
    { wch: 10 }, // 统计周期
    { wch: 12 }, // 业务负责人
    { wch: 12 }, // 技术负责人
    { wch: 20 }, // 报表名称
    { wch: 30 }, // 业务定义
    { wch: 20 }, // 来源表
    { wch: 50 }, // 技术逻辑
    { wch: 20 }, // 字段说明
    { wch: 15 }, // 存储位置
    { wch: 40 }  // 查询代码
  ]
  worksheet['!cols'] = colWidths
  
  // 添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '监管指标')
  
  // 添加监管报表大类说明
  addRegulatoryCategories(workbook)
  
  // 添加说明页
  addInstructionSheet(workbook, MetricType.REGULATORY)
}

/**
 * 添加监管报表大类说明
 */
function addRegulatoryCategories(workbook: XLSX.WorkBook) {
  const categories = Object.entries(RegulatoryCategories).map(([key, value]) => ({
    '编码': key,
    '名称': value
  }))
  
  const worksheet = XLSX.utils.json_to_sheet(categories)
  worksheet['!cols'] = [{ wch: 25 }, { wch: 40 }]
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '监管报表大类')
}

/**
 * 添加说明页
 */
function addInstructionSheet(workbook: XLSX.WorkBook, type: MetricType) {
  let instructions: string[][] = [
    ['批量注册指标说明'],
    [''],
    ['1. 请按照模板格式填写指标信息，不要修改表头'],
    ['2. 带*的字段为必填项'],
    ['3. 指标编码必须唯一，建议使用有意义的前缀'],
    ['4. 上传前请检查数据的完整性和准确性']
  ]
  
  if (type === MetricType.BUSINESS_CORE) {
    instructions.push(
      [''],
      ['业务核心指标特殊说明：'],
      ['1. 业务域必须填写'],
      ['2. 业务负责人和技术负责人均为必填项']
    )
  } else {
    instructions.push(
      [''],
      ['监管指标特殊说明：'],
      ['1. 监管报表大类必须填写，请参考"监管报表大类"工作表'],
      ['2. 业务负责人和技术负责人均为必填项'],
      ['3. 报表名称为必填项']
    )
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet(instructions)
  worksheet['!cols'] = [{ wch: 80 }]
  
  // 设置单元格样式（合并单元格等）
  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }]
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '使用说明')
}

/**
 * 解析上传的Excel文件
 * @param file 上传的文件
 * @param type 指标类型
 * @returns Promise<解析结果>
 */
export function parseExcelFile(file: File, type: MetricType): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // 根据指标类型处理数据
        const processedData = processExcelData(jsonData, type)
        resolve(processedData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 处理Excel数据
 * @param data Excel解析的JSON数据
 * @param type 指标类型
 * @returns 处理后的数据
 */
function processExcelData(data: any[], type: MetricType) {
  return data.map((row, index) => {
    const baseItem = {
      rowIndex: index + 2, // Excel行号（从2开始，因为1是表头）
      type,
      name: row['指标名称'],
      code: row['指标编码'],
      category: row['指标分类'],
      businessDefinition: row['业务定义'],
      statisticalPeriod: row['统计周期'],
      sourceTable: row['来源表'],
      processingLogic: row['技术逻辑'],
      fieldDescription: row['字段说明'],
      storageLocation: row['存储位置'],
      queryCode: row['查询代码']
    }
    
    if (type === MetricType.BUSINESS_CORE) {
      return {
        ...baseItem,
        businessDomain: row['业务域'],
        businessOwner: row['业务负责人'] || row['负责人'],
        technicalOwner: row['技术负责人'] || '',
        useCase: row['使用场景'],
        reportInfo: row['报表信息']
      }
    } else {
      return {
        ...baseItem,
        regulatoryCategory: row['监管报表大类'],
        businessOwner: row['业务负责人'],
        technicalOwner: row['技术负责人'],
        reportName: row['报表名称']
      }
    }
  })
}

/**
 * 导出错误数据到Excel
 * @param errorData 错误数据
 * @param type 指标类型
 */
export function exportErrorData(errorData: any[], type: MetricType) {
  const workbook = XLSX.utils.book_new()
  
  // 转换数据格式
  const formattedData = errorData.map(item => {
    const baseData: any = {
      '指标名称': item.name,
      '指标编码': item.code,
      '指标分类': item.category,
      '统计周期': item.statisticalPeriod,
      '业务定义': item.businessDefinition,
      '技术逻辑': item.processingLogic,
      '字段说明': item.fieldDescription,
      '查询代码': item.queryCode,
      '错误信息': (item.errors || []).join('\n')
    }
    
    if (type === MetricType.BUSINESS_CORE) {
      baseData['业务域'] = item.businessDomain
      baseData['业务负责人'] = item.businessOwner
      baseData['技术负责人'] = item.technicalOwner
      baseData['使用场景'] = item.useCase
      baseData['报表信息'] = item.reportInfo
    } else {
      baseData['监管报表大类'] = item.regulatoryCategory
      baseData['来源表'] = item.sourceTable
      baseData['存储位置'] = item.storageLocation
      baseData['业务负责人'] = item.businessOwner
      baseData['技术负责人'] = item.technicalOwner
      baseData['报表名称'] = item.reportName
    }
    
    return baseData
  })
  
  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  
  // 添加到工作簿
  const sheetName = type === MetricType.BUSINESS_CORE ? '业务核心指标错误数据' : '监管指标错误数据'
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  
  // 生成二进制数据
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  // 下载文件
  const fileName = type === MetricType.BUSINESS_CORE ? '业务核心指标错误数据.xlsx' : '监管指标错误数据.xlsx'
  saveAs(blob, fileName)
}