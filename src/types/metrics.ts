interface MetricVersion {
  date: string
  description: string
}

export interface MetricItem {
  name: string
  code: string
  category: string
  businessDomain: string
  businessDefinition: string
  useCase: string
  statisticalPeriod: string
  sourceTable: string
  processingLogic: string
  fieldDescription: string
  reportInfo: string
  storageLocation: string
  queryCode: string
  versions: MetricVersion[]
  isFavorite: boolean
  owner: string
}