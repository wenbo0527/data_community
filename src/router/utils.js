import { ROUTE_NAMES, ROUTE_PATHS, BREADCRUMB_CONFIG, ROUTE_GUARD_CONFIG } from './constants'
import { businessMessage } from '@/utils/message'

/**
 * 路由工具函数
 */

/**
 * 根据路由名称获取路由路径
 * @param {string} routeName 路由名称
 * @returns {string} 路由路径
 */
export function getRoutePathByName(routeName) {
  const findPath = (obj, target) => {
    for (const key in obj) {
      if (obj[key] === target) {
        return key
      }
      if (typeof obj[key] === 'object') {
        const result = findPath(obj[key], target)
        if (result) {
          return result
        }
      }
    }
    return null
  }
  
  return findPath(ROUTE_NAMES, routeName) || '/'
}

/**
 * 根据路由路径获取路由名称
 * @param {string} routePath 路由路径
 * @returns {string} 路由名称
 */
export function getRouteNameByPath(routePath) {
  const findName = (obj, target) => {
    for (const key in obj) {
      if (obj[key] === target) {
        return key
      }
      if (typeof obj[key] === 'object') {
        const result = findName(obj[key], target)
        if (result) {
          return result
        }
      }
    }
    return null
  }
  
  return findName(ROUTE_PATHS, routePath) || 'unknown'
}

/**
 * 获取面包屑导航
 * @param {string} routeName 当前路由名称
 * @param {object} route 当前路由对象
 * @returns {array} 面包屑数组
 */
export function getBreadcrumb(routeName, route = {}) {
  // 优先使用配置的面包屑
  if (BREADCRUMB_CONFIG[routeName]) {
    return BREADCRUMB_CONFIG[routeName]
  }
  
  // 根据路由层级自动生成面包屑
  const pathSegments = route.path?.split('/').filter(Boolean) || []
  const breadcrumb = []
  
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // 获取路由元信息中的标题
    const title = route.meta?.title || segment
    
    breadcrumb.push({
      title,
      path: index === pathSegments.length - 1 ? '' : currentPath // 最后一级不设置路径
    })
  })
  
  return breadcrumb
}

/**
 * 检查路由权限
 * @param {object} route 路由对象
 * @param {object} user 用户信息
 * @returns {boolean} 是否有权限
 */
export function checkRoutePermission(route, user = {}) {
  // 白名单路由直接通过
  if (ROUTE_GUARD_CONFIG.whiteList.includes(route.path)) {
    return true
  }
  
  // 检查用户是否登录
  if (!user.token && ROUTE_GUARD_CONFIG.authRequired.some(path => route.path.startsWith(path))) {
    return false
  }
  
  // 检查路由权限
  const requiredPermission = route.meta?.permission
  if (requiredPermission && user.permissions) {
    return user.permissions.includes(requiredPermission)
  }
  
  return true
}

/**
 * 路由跳转封装
 * @param {object} router Vue Router 实例
 * @param {string|object} to 目标路由
 * @param {object} options 跳转选项
 */
export function navigateTo(router, to, options = {}) {
  const { replace = false, query = {}, params = {} } = options
  
  try {
    const routeConfig = typeof to === 'string' ? { path: to } : to
    
    // 添加查询参数和路由参数
    if (Object.keys(query).length > 0) {
      routeConfig.query = { ...routeConfig.query, ...query }
    }
    if (Object.keys(params).length > 0) {
      routeConfig.params = { ...routeConfig.params, ...params }
    }
    
    if (replace) {
      router.replace(routeConfig)
    } else {
      router.push(routeConfig)
    }
  } catch (error) {
    console.error('Navigation failed:', error)
    businessMessage.error('页面跳转失败')
  }
}

/**
 * 返回上一页
 * @param {object} router Vue Router 实例
 * @param {string} fallback 回退路径
 */
export function goBack(router, fallback = '/') {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push(fallback)
  }
}

/**
 * 刷新当前页面
 * @param {object} router Vue Router 实例
 */
export function refreshCurrentPage(router) {
  const currentRoute = router.currentRoute.value
  router.replace({
    path: '/redirect' + currentRoute.fullPath
  })
}

/**
 * 生成路由配置
 * @param {object} config 路由配置
 * @returns {object} 标准化的路由配置
 */
export function createRouteConfig(config) {
  const {
    path,
    name,
    component,
    children = [],
    meta = {},
    redirect,
    alias,
    props,
    beforeEnter
  } = config
  
  return {
    path,
    name,
    component,
    children: children.map(child => createRouteConfig(child)),
    meta: {
      title: '',
      icon: '',
      hidden: false,
      cache: true,
      permission: 'user',
      layout: 'default',
      ...meta
    },
    redirect,
    alias,
    props,
    beforeEnter
  }
}

/**
 * 动态添加路由
 * @param {object} router Vue Router 实例
 * @param {array} routes 路由配置数组
 */
export function addDynamicRoutes(router, routes) {
  routes.forEach(route => {
    try {
      router.addRoute(createRouteConfig(route))
    } catch (error) {
      console.error('Failed to add route:', route, error)
    }
  })
}

/**
 * 移除动态路由
 * @param {object} router Vue Router 实例
 * @param {array} routeNames 要移除的路由名称数组
 */
export function removeDynamicRoutes(router, routeNames) {
  routeNames.forEach(name => {
    try {
      router.removeRoute(name)
    } catch (error) {
      console.error('Failed to remove route:', name, error)
    }
  })
}

/**
 * 获取路由树结构（用于菜单生成）
 * @param {array} routes 路由配置数组
 * @param {object} options 选项
 * @returns {array} 路由树
 */
export function getRouteTree(routes, options = {}) {
  const { includeHidden = false, maxDepth = 3 } = options
  
  const buildTree = (routeList, depth = 0) => {
    if (depth >= maxDepth) return []
    
    return routeList
      .filter(route => {
        // 过滤隐藏路由
        if (!includeHidden && route.meta?.hidden) {
          return false
        }
        return true
      })
      .map(route => ({
        key: route.name,
        title: route.meta?.title || route.name,
        icon: route.meta?.icon,
        path: route.path,
        children: route.children ? buildTree(route.children, depth + 1) : []
      }))
      .filter(item => item.children.length > 0 || item.path)
  }
  
  return buildTree(routes)
}

/**
 * 路由参数验证
 * @param {object} route 路由对象
 * @param {object} rules 验证规则
 * @returns {object} 验证结果
 */
export function validateRouteParams(route, rules = {}) {
  const errors = []
  const params = route.params || {}
  
  Object.keys(rules).forEach(key => {
    const rule = rules[key]
    const value = params[key]
    
    // 必填验证
    if (rule.required && (!value || value.trim() === '')) {
      errors.push(`参数 ${key} 不能为空`)
      return
    }
    
    // 类型验证
    if (value && rule.type) {
      const type = typeof value
      if (type !== rule.type) {
        errors.push(`参数 ${key} 类型错误，期望 ${rule.type}，实际 ${type}`)
      }
    }
    
    // 格式验证
    if (value && rule.pattern) {
      if (!rule.pattern.test(value)) {
        errors.push(`参数 ${key} 格式不正确`)
      }
    }
    
    // 自定义验证
    if (value && rule.validator) {
      const result = rule.validator(value)
      if (result !== true) {
        errors.push(result || `参数 ${key} 验证失败`)
      }
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 缓存路由组件
 * @param {string} routeName 路由名称
 * @param {boolean} cache 是否缓存
 */
export function setCacheRoute(routeName, cache = true) {
  // 这里可以结合 keep-alive 组件使用
  // 具体实现依赖于项目的缓存策略
  console.log(`Route ${routeName} cache set to ${cache}`)
}

/**
 * 清除路由缓存
 * @param {string|array} routeNames 路由名称或数组
 */
export function clearRouteCache(routeNames) {
  const names = Array.isArray(routeNames) ? routeNames : [routeNames]
  names.forEach(name => {
    setCacheRoute(name, false)
  })
}