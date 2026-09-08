export type MappingType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE'

export type ConflictStrategy = 'OVERWRITE' | 'IGNORE' | 'MANUAL'

export interface MappingRuleConfig {
  mappingType: MappingType
  priority: number
  effectivePeriod: any[]
  conflictStrategy: ConflictStrategy
  fuzzyMatching: boolean
  caseSensitive: boolean
  realtimeSync: boolean
}

