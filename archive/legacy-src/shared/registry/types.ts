/**
 * 微应用注册协议 - 类型定义
 * 所有子应用必须实现统一的注册接口，主应用通过此协议自动发现并加载子应用
 */

// 微应用基本信息
export interface MicroAppInfo {
  /** 唯一标识: 'risk-app', 'touch', 'mkt-app' */
  name: string
  /** 版本号: '1.0.0' */
  version: string
  /** 描述信息 */
  description?: string
}

// 菜单项配置
export interface MenuItem {
  /** 唯一标识: 'risk-index', 'risk-budget-overview' */
  key: string
  /** 显示名称: '工作台', '预算概览' */
  label: string
  /** 图标名称: 'icon-dashboard', 'IconBudget' */
  icon?: string
  /** 路由路径: '/risk/budget/overview' */
  path?: string
  /** 外部URL（当 path 和 url 都存在时，优先使用 path） */
  url?: string
  /** 子菜单 */
  children?: MenuItem[]
  /** 排序权重，数值越小越靠前 */
  order?: number
  /** 额外元数据 */
  meta?: Record<string, unknown>
}

// 路由配置（简化版，兼容 vue-router）
export interface RouteConfig {
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name?: string
  /** 组件路径（相对于子应用 src 目录）: './pages/index.vue' */
  component?: string
  /** 重定向目标 */
  redirect?: string
  /** 子路由 */
  children?: RouteConfig[]
  /** 路由元数据 */
  meta?: {
    /** 页面标题 */
    title?: string
    /** 是否需要认证 */
    requiresAuth?: boolean
    /** 其他元数据 */
    [key: string]: unknown
  }
}

// 子应用注册信息
export interface MicroAppRegistry {
  /** 微应用基本信息 */
  app: MicroAppInfo
  /** 基础路径: '/risk', '/touch' */
  basePath: string
  /** 入口URL（可选，用于动态加载）: 'http://localhost:5176' */
  entry?: string
  /** 菜单配置 */
  menu: MenuItem[]
  /** 路由配置（子应用内部路由） */
  routes: RouteConfig[]
  /** 生命周期钩子 */
  lifecycle?: {
    /** 挂载时回调 */
    mount?: () => void
    /** 卸载时回调 */
    unmount?: () => void
  }
}

/** 注册函数签名 */
export type RegistryProvider = () => MicroAppRegistry | Promise<MicroAppRegistry>
