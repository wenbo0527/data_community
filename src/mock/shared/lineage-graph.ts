/**
 * 资源 → 要素 完整血缘链路
 *
 * 综合三个数据源:
 *   1. MetadataStore        — 表/字段元数据(资源层)
 *   2. ColumnLineageStore   — 字段血缘(资源层)
 *   3. FieldLinkStore       — 字段 ↔ 要素 关联(打通层)
 *   4. BusinessConceptStore — 业务域/实体/要素(语义层)
 *
 * 提供"双向穿透"查询:
 *   - 自上而下:表 → 字段 → 字段血缘 → 要素 → 业务实体 → 业务域
 *   - 自下而上:业务要素 → 字段映射 → 血缘 → 表
 */

import { MetadataStore } from './metadata-store'
import { ColumnLineageStore } from './column-lineage'
import { FieldLinkStore, type FieldLink } from './lineage'
import { BusinessConceptStore } from './business-concept-store'

// ==================== 类型定义 ====================

export type LineageNodeType =
  | 'business_domain'    // 业务域
  | 'business_entity'    // 业务实体
  | 'business_element'   // 业务要素
  | 'data_table'         // 数据表
  | 'data_field'         // 数据字段
  | 'data_standard'      // 数据标准
  | 'classification'     // 分级分类

export interface LineageNode {
  id: string
  type: LineageNodeType
  name: string
  description?: string
  // 节点元数据
  meta?: {
    standardCode?: string
    sensitivityLevel?: string
    businessBelonging?: string
    domainCode?: string
    level?: number
    fieldType?: string
    tableName?: string
  }
}

export interface LineageEdge {
  id: string
  source: string
  target: string
  type:
    | 'belongs_to'         // 要素属于实体
    | 'entity_to_domain'   // 实体属于域
    | 'field_in_table'     // 字段属于表
    | 'field_links_element'// 字段关联要素
    | 'column_lineage'     // 字段血缘
    | 'field_to_standard'  // 字段映射标准
    | 'has_classification' // 有分级分类
  transform?: string
  evidence?: string
}

export interface LineageGraph {
  nodes: LineageNode[]
  edges: LineageEdge[]
  // 入口节点
  entry?: string
}

// ==================== 自上而下:表 → 要素 ====================

/**
 * 从一张表出发,追溯完整的血缘链路,直到业务要素
 *
 * 例:
 *   /api/lineage-graph/from-table/dim_user
 *   返回:
 *     节点: BD_USER(域) → BD_USER_CUST(实体) → BD_USER_CUST_NAME(要素)
 *                 ↓
 *           dim_user(表) → user_name(字段) → STD_004(标准)
 *     边: belongs_to / field_in_table / field_links_element
 */
export function buildLineageFromTable(tableName: string): LineageGraph {
  const nodes: LineageNode[] = []
  const edges: LineageEdge[] = []

  // 1. 表节点
  const table = MetadataStore.getTables().find((t: any) => (t.tableName || t.name) === tableName)
  if (!table) return { nodes, edges }

  const actualTableName = (table as any).tableName || (table as any).name
  const tableNode: LineageNode = {
    id: `table:${actualTableName}`,
    type: 'data_table',
    name: actualTableName,
    description: (table as any).description || '',
    meta: { tableName: actualTableName }
  }
  nodes.push(tableNode)

  // 2. 字段节点 + 字段关联(字段-要素)
  const fields = (table as any).fields || []
  fields.forEach((field: any) => {
    const fieldNode: LineageNode = {
      id: `field:${actualTableName}.${field.name}`,
      type: 'data_field',
      name: field.name,
      description: field.description || field.comment || '',
      meta: { tableName: actualTableName, fieldType: field.type }
    }
    nodes.push(fieldNode)

    edges.push({
      id: `e_field_in_table_${actualTableName}_${field.name}`,
      source: `field:${actualTableName}.${field.name}`,
      target: `table:${actualTableName}`,
      type: 'field_in_table'
    })

    // 字段 → 要素 + 标准 + 分级
    const link = FieldLinkStore.byField(actualTableName, field.name)
    if (link) {
      if (link.businessElementId) {
        const elementNode: LineageNode = {
          id: `element:${link.businessElementId}`,
          type: 'business_element',
          name: link.businessElementId,
          meta: {
            standardCode: link.standardCode,
            sensitivityLevel: link.sensitivityLevel,
            businessBelonging: link.businessBelonging
          }
        }
        if (!nodes.find(n => n.id === elementNode.id)) nodes.push(elementNode)
        edges.push({
          id: `e_field_to_element_${actualTableName}_${field.name}`,
          source: `field:${actualTableName}.${field.name}`,
          target: `element:${link.businessElementId}`,
          type: 'field_links_element',
          evidence: link.evidence
        })
      }
      if (link.standardCode) {
        const standardNode: LineageNode = {
          id: `standard:${link.standardCode}`,
          type: 'data_standard',
          name: link.standardCode,
          meta: { standardCode: link.standardCode }
        }
        if (!nodes.find(n => n.id === standardNode.id)) nodes.push(standardNode)
        edges.push({
          id: `e_field_to_standard_${actualTableName}_${field.name}`,
          source: `field:${actualTableName}.${field.name}`,
          target: `standard:${link.standardCode}`,
          type: 'field_to_standard'
        })
      }
      if (link.sensitivityLevel) {
        const classNode: LineageNode = {
          id: `classification:${link.sensitivityLevel}`,
          type: 'classification',
          name: `${link.sensitivityLevel} ${link.grade || ''}`,
          meta: { sensitivityLevel: link.sensitivityLevel }
        }
        if (!nodes.find(n => n.id === classNode.id)) nodes.push(classNode)
        edges.push({
          id: `e_field_has_class_${actualTableName}_${field.name}`,
          source: `field:${actualTableName}.${field.name}`,
          target: `classification:${link.sensitivityLevel}`,
          type: 'has_classification'
        })
      }
    }
  })

  // 3. 字段血缘(下游表)
  const downstreamColumns = ColumnLineageStore.byTable(actualTableName)
  const downstreamTables = new Set<string>()
  downstreamColumns.forEach(e => {
    if (e.sourceTable === actualTableName) downstreamTables.add(e.targetTable)
  })
  downstreamTables.forEach(t => {
    const downstreamNode: LineageNode = {
      id: `table:${t}`,
      type: 'data_table',
      name: t,
      meta: { tableName: t }
    }
    if (!nodes.find(n => n.id === downstreamNode.id)) nodes.push(downstreamNode)
  })

  // 4. 业务域/实体(基于要素关联)
  const linkedElements = nodes.filter(n => n.type === 'business_element')
  const linkedDomainCodes = new Set<string>()
  const allElements = BusinessConceptStore.getElements()
  const allDomains = BusinessConceptStore.getDomains?.() || []
  const allEntities = BusinessConceptStore.getEntities?.() || []

  // 兜底:即使没匹配,也创建一个默认 domain/entity 节点,保证业务域层完整
  const matchedElement = (elmName: string): any => {
    return allElements.find((e: any) =>
      e.code === elmName ||
      e.name === elmName ||
      e.chineseName === elmName
    )
  }

  linkedElements.forEach(elmNode => {
    const m = matchedElement(elmNode.name)
    if (m?.relatedEntityCode) {
      const entity = allEntities.find((e: any) => e.code === m.relatedEntityCode)
      if (entity?.domainCode) {
        linkedDomainCodes.add(entity.domainCode)
      }
    }
  })

  // 添加实体节点
  linkedElements.forEach(elmNode => {
    const m = matchedElement(elmNode.name)
    if (m?.relatedEntityCode) {
      const entity = allEntities.find((e: any) => e.code === m.relatedEntityCode)
      if (entity) {
        const entityNode: LineageNode = {
          id: `entity:${entity.code}`,
          type: 'business_entity',
          name: entity.name,
          meta: { domainCode: entity.domainCode }
        }
        if (!nodes.find(n => n.id === entityNode.id)) nodes.push(entityNode)
        edges.push({
          id: `e_element_to_entity_${elmNode.id}_${entity.code}`,
          source: elmNode.id,
          target: `entity:${entity.code}`,
          type: 'belongs_to'
        })
      }
    }
  })

  // 添加域节点
  if (linkedDomainCodes.size === 0 && linkedElements.length > 0) {
    // 兜底:至少有一个域
    linkedDomainCodes.add('DOM_GENERIC')
  }

  linkedDomainCodes.forEach(code => {
    const domain = allDomains.find((d: any) => d.code === code || d.domainCode === code)
    const domainNode: LineageNode = {
      id: `domain:${code}`,
      type: 'business_domain',
      name: domain?.name || code,
      meta: { domainCode: code }
    }
    if (!nodes.find(n => n.id === domainNode.id)) nodes.push(domainNode)

    const entityNodes = nodes.filter(n => n.type === 'business_entity' && (n.meta as any)?.domainCode === code)
    entityNodes.forEach(en => {
      edges.push({
        id: `e_entity_to_domain_${en.id}_${code}`,
        source: en.id,
        target: `domain:${code}`,
        type: 'entity_to_domain'
      })
    })
  })

  return {
    nodes,
    edges,
    entry: `table:${actualTableName}`
  }
}

// ==================== 自下而上:要素 → 表 ====================

/**
 * 从一个业务要素出发,反查它出现在哪些表、哪些字段、什么血缘
 */
export function buildLineageFromElement(elementId: string): LineageGraph {
  const nodes: LineageNode[] = []
  const edges: LineageEdge[] = []

  // 1. 要素节点
  const elementNode: LineageNode = {
    id: `element:${elementId}`,
    type: 'business_element',
    name: elementId
  }
  nodes.push(elementNode)

  // 2. 找出所有引用此要素的字段 + 它们所属的表
  const linkedFields = FieldLinkStore.byBusinessElement(elementId)
  const tableSet = new Set<string>()

  linkedFields.forEach((link: FieldLink) => {
    const fieldNode: LineageNode = {
      id: `field:${link.tableName}.${link.fieldName}`,
      type: 'data_field',
      name: link.fieldName,
      meta: {
        tableName: link.tableName,
        fieldType: '',
        standardCode: link.standardCode,
        sensitivityLevel: link.sensitivityLevel
      }
    }
    if (!nodes.find(n => n.id === fieldNode.id)) nodes.push(fieldNode)

    edges.push({
      id: `e_field_to_element_${link.tableName}_${link.fieldName}_${elementId}`,
      source: `field:${link.tableName}.${link.fieldName}`,
      target: `element:${elementId}`,
      type: 'field_links_element'
    })

    tableSet.add(link.tableName)
  })

  // 3. 表节点
  tableSet.forEach(tableName => {
    const tableNode: LineageNode = {
      id: `table:${tableName}`,
      type: 'data_table',
      name: tableName,
      meta: { tableName }
    }
    if (!nodes.find(n => n.id === tableNode.id)) nodes.push(tableNode)

    // 表-字段 边(本表内的字段)
    const tableFields = nodes.filter(n => n.id.startsWith(`field:${tableName}.`))
    tableFields.forEach(f => {
      edges.push({
        id: `e_field_in_table_${tableName}_${f.id.split('.')[1]}`,
        source: f.id,
        target: `table:${tableName}`,
        type: 'field_in_table'
      })
    })
  })

  return {
    nodes,
    edges,
    entry: `element:${elementId}`
  }
}

// ==================== 双向:从任意节点出发 ====================

/**
 * 通用入口:从任意节点类型出发
 */
export function buildLineage(
  startType: LineageNodeType,
  startId: string,
  direction: 'down' | 'up' | 'both' = 'both'
): LineageGraph {
  if (startType === 'data_table') {
    return buildLineageFromTable(startId)
  }
  if (startType === 'business_element') {
    return buildLineageFromElement(startId)
  }
  if (startType === 'data_field') {
    // 字段 = table.field
    const [table, field] = startId.split('.')
    return buildLineageFromTable(table)
  }
  return { nodes: [], edges: [] }
}

// ==================== Store:完整链路管理器 ====================

export const LineageGraphStore = {
  /**
   * 获取完整血缘图(从任一节点出发)
   */
  build: buildLineage,

  /**
   * 导出为 X6/D3 友好的格式(节点 + 边的坐标布局)
   */
  forX6(graph: LineageGraph) {
    return {
      nodes: graph.nodes.map(n => ({
        id: n.id,
        shape: n.type,
        label: n.name,
        attrs: {
          body: { fill: nodeColor(n.type) },
          label: { text: n.name, fontSize: 12 }
        }
      })),
      edges: graph.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        shape: e.type,
        label: e.transform || e.evidence || ''
      }))
    }
  },

  /**
   * 链路概览:从字段出发,展示完整路径摘要
   */
  chainOf(table: string, field: string): string {
    const parts: string[] = []
    const fieldLink = FieldLinkStore.byField(table, field)
    parts.push(`📊 表 ${table}`)
    parts.push(`  └ 📁 字段 ${field}`)

    if (fieldLink?.standardCode) {
      parts.push(`     └ 📏 标准 ${fieldLink.standardCode}`)
    }
    if (fieldLink?.sensitivityLevel) {
      parts.push(`     └ 🛡 分级 ${fieldLink.sensitivityLevel} ${fieldLink.grade}`)
    }
    if (fieldLink?.businessElementId) {
      parts.push(`     └ 🏷 业务要素 ${fieldLink.businessElementId}`)
    }

    // 字段血缘
    const upstream = ColumnLineageStore.upstream(table, field)
    const downstream = ColumnLineageStore.downstream(table, field)
    if (upstream.length > 0) {
      parts.push(`  ⬆ 上游:`)
      upstream.forEach(e => parts.push(`     ${e.sourceTable}.${e.sourceColumn} (${e.transform})`))
    }
    if (downstream.length > 0) {
      parts.push(`  ⬇ 下游:`)
      downstream.forEach(e => parts.push(`     ${e.targetTable}.${e.targetColumn} (${e.transform})`))
    }
    return parts.join('\n')
  }
}

function nodeColor(type: LineageNodeType): string {
  return {
    business_domain: '#722ed1',
    business_entity: '#9254de',
    business_element: '#b37feb',
    data_table: '#165dff',
    data_field: '#40a9ff',
    data_standard: '#13c2c2',
    classification: '#fa541c'
  }[type] || '#86909c'
}

// ==================== HTTP Mock 端点 ====================

export const lineageGraphMocks = [
  {
    url: '/api/lineage-graph/from-table/:table',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const table = url.split('/').pop() || ''
      return { code: 0, data: buildLineageFromTable(table) }
    }
  },
  {
    url: '/api/lineage-graph/from-element/:element',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const element = url.split('/').pop() || ''
      return { code: 0, data: buildLineageFromElement(element) }
    }
  },
  {
    url: '/api/lineage-graph/chain/:table/:field',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const parts = url.split('/')
      const field = parts.pop() || ''
      const table = parts.pop() || ''
      return { code: 0, data: { chain: LineageGraphStore.chainOf(table, field) } }
    }
  }
]