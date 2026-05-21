/// <reference types="vite/client" />

/**
 * Qiankun 全局变量类型声明
 */
declare global {
  interface Window {
    /**
     * Qiankun 环境标志
     */
    __POWERED_BY_QIANKUN__?: boolean

    /**
     * Qiankun 路由基础路径
     */
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string

    /**
     * Qiankun 路由基础路径（某些版本）
     */
    ROUTER_BASE?: string

    /**
     * Qiankun 主应用传递的 props
     */
    __QIANKUN_PROPS__?: Record<string, unknown>
  }
}

export {}
