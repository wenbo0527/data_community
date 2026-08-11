/**
 * data-community-app 微应用注册类型
 */
export interface MicroAppMenu {
  key: string
  label: string
  icon?: string
  path: string
  order?: number
}

export interface MicroAppRegistry {
  app: {
    name: string
    version: string
    description: string
  }
  basePath: string
  entry: string
  menu: MicroAppMenu[]
  routes: any[]
}