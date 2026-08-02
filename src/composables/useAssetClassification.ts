/**
 * 资产/字段打标 composable(打通 #3 的使用入口)
 *
 * 提供标准/分级/要素/资产 一站式打标能力:
 *   - 自动推荐(基于矩阵)
 *   - 手动覆盖
 *   - 合规检测
 *   - 资产覆盖率统计
 */

import { computed, ref } from 'vue'
import { FieldLinkStore, getEnhancedField, getEnhancedTable } from '@/mock/shared/lineage'
import { StandardClassifyMatrixStore } from '@/mock/shared/standard-classify-matrix'
import { TaxonomyStore } from '@/mock/shared/classification-taxonomy'
import { StandardStore } from '@/mock/shared/standard-store'
import type { SensitivityLevel, Grade, BusinessBelonging } from '@/mock/shared/classify-types'

export interface FieldTaggingInput {
  tableName: string
  fieldName: string
  fieldType: string         // 如 VARCHAR(20)
  businessBelonging: BusinessBelonging
  standardCode?: string
  sensitivityLevel?: SensitivityLevel
  grade?: Grade
  businessElementId?: string
  assetId?: string
  linkBy: string
}

export interface FieldTaggingSuggestion {
  standardCode?: string
  sensitivityLevel?: SensitivityLevel
  grade?: Grade
  reason: string
  requireManualConfirm: boolean
  legalBasis?: string
  businessElementId?: string
  matchedTaxonomyCode?: string
}

export function useAssetClassification() {
  /**
   * 一键推荐:输入字段信息,返回推荐的标准+分级
   */
  const suggest = (input: {
    fieldName: string
    fieldType: string
    businessBelonging: BusinessBelonging
  }): FieldTaggingSuggestion => {
    // 1. 从标准库匹配
    const allStandards = StandardStore.getStandards()
    const nameUpper = input.fieldName.toUpperCase()
    let matchedStandard = allStandards.find(s =>
      s.englishAbbr?.toUpperCase() === nameUpper ||
      nameUpper.includes(s.englishAbbr?.toUpperCase() || '___')
    )

    // 兜底:从矩阵推荐
    const matrixResult = StandardClassifyMatrixStore.inferFromType(
      input.fieldType,
      input.businessBelonging
    )

    // 2. 从分类树匹配业务要素
    const matchedTaxonomy = TaxonomyStore.list().find(t =>
      t.standardCode === matchedStandard?.standardNo ||
      (t.name && input.fieldName.toLowerCase().includes(t.name.toLowerCase()))
    )

    return {
      standardCode: matchedStandard?.standardNo,
      sensitivityLevel: matrixResult?.defaultSensitivity,
      grade: matrixResult?.defaultGrade,
      reason: matrixResult?.reason || '根据业务类型自动推荐',
      requireManualConfirm: matrixResult?.requireManualConfirm || false,
      legalBasis: matrixResult?.legalBasis,
      businessElementId: matchedTaxonomy?.code,
      matchedTaxonomyCode: matchedTaxonomy?.code
    }
  }

  /**
   * 一键打标
   */
  const tag = (input: FieldTaggingInput): FieldLink | null => {
    const link = FieldLinkStore.addLink({
      tableName: input.tableName,
      fieldName: input.fieldName,
      schema: 'default',
      standardCode: input.standardCode,
      sensitivityLevel: input.sensitivityLevel,
      grade: input.grade,
      businessBelonging: input.businessBelonging,
      businessElementId: input.businessElementId,
      assetId: input.assetId,
      linkBy: input.linkBy,
      compliance: 'unknown' // 后台异步检测
    })
    return link || null
  }

  /**
   * 一键打标 + 自动推荐
   */
  const suggestAndTag = (input: FieldTaggingInput) => {
    const suggestion = suggest({
      fieldName: input.fieldName,
      fieldType: input.fieldType,
      businessBelonging: input.businessBelonging
    })

    return tag({
      ...input,
      standardCode: input.standardCode || suggestion.standardCode,
      sensitivityLevel: input.sensitivityLevel || suggestion.sensitivityLevel,
      grade: input.grade || suggestion.grade,
      businessElementId: input.businessElementId || suggestion.businessElementId
    })
  }

  /**
   * 表合规概览
   */
  const tableOverview = (tableName: string) => {
    return {
      complianceRate: FieldLinkStore.tableComplianceRate(tableName),
      classifyCoverage: FieldLinkStore.tableClassifyCoverage(tableName),
      links: FieldLinkStore.byTable(tableName)
    }
  }

  /**
   * 字段全景视图
   */
  const fieldView = (tableName: string, fieldName: string) => {
    return getEnhancedField(tableName, fieldName)
  }

  /**
   * 表所有字段全景
   */
  const tableView = (tableName: string) => {
    return getEnhancedTable(tableName)
  }

  return {
    suggest,
    tag,
    suggestAndTag,
    tableOverview,
    fieldView,
    tableView
  }
}