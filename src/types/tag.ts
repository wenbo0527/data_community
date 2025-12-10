export type IdentityType = 'PERSON' | 'DEVICE' | 'ENTERPRISE' | 'FAMILY'

export interface TagItem {
  id: string
  name: string
  dataType: string
  category: string
  tagType: string
  dimensionKey: string
  shareLevel: string
  createUser: string
  createTime: string
  description?: string
  mappingStatus?: 'configured' | 'unconfigured' | 'error'
  identityType?: IdentityType
}

export interface TagFilters {
  status?: string
  tagType?: string
  identityType?: IdentityType | 'all'
  dateRange?: [string, string]
  searchText?: string
}

