// metrics types
export enum MetricType {
  BUSINESS_CORE = 'business_core',
  REGULATORY = 'regulatory'
}

export enum RegulatoryCategory {
  CBIRC_BANKING = 'cbirc_banking',
  PBOC_CENTRALIZED = 'pboc_centralized',
  PBOC_FINANCIAL_BASE = 'pboc_financial_base',
  PBOC_INTEREST_RATE = 'pboc_interest_rate'
}

export const RegulatoryCategories = {
  [RegulatoryCategory.CBIRC_BANKING]: '银保监会-银监报表',
  [RegulatoryCategory.PBOC_CENTRALIZED]: '人行-大集中报表',
  [RegulatoryCategory.PBOC_FINANCIAL_BASE]: '人行-金融基础数据',
  [RegulatoryCategory.PBOC_INTEREST_RATE]: '人行-利率报备检测分析'
}

export const REGULATORY_CATEGORY_LABELS = RegulatoryCategories

export const MetricTypeLabels = {
  [MetricType.BUSINESS_CORE]: '业务',
  [MetricType.REGULATORY]: '监管'
}

export default { MetricType, RegulatoryCategory, RegulatoryCategories, REGULATORY_CATEGORY_LABELS, MetricTypeLabels }
