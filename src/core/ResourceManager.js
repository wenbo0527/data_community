/**
 * ResourceManager - 统一资源管理器
 * 用于防止内存泄漏，统一管理各种资源的生命周期
 */
export class ResourceManager {
  constructor() {
    this.resources = new Map()
    this.destroyed = false
  }

  /**
   * 注册资源
   * @param {string} id - 资源唯一标识
   * @param {any} resource - 资源对象
   * @param {Function} cleanupFn - 清理函数
   * @returns {boolean} 注册是否成功
   */
  register(id, resource, cleanupFn) {
    // 验证参数
    if (!id || typeof id !== 'string' || this.destroyed) {
      return false
    }

    // 防止重复注册
    if (this.resources.has(id)) {
      return false
    }

    // 验证清理函数
    const finalCleanupFn = typeof cleanupFn === 'function' ? cleanupFn : null

    // 注册资源
    this.resources.set(id, {
      resource,
      cleanupFn: finalCleanupFn,
      registeredAt: Date.now()
    })

    return true
  }

  /**
   * 注销资源
   * @param {string} id - 资源标识
   * @returns {boolean} 注销是否成功
   */
  unregister(id) {
    if (this.destroyed || !this.resources.has(id)) {
      return false
    }

    const resourceInfo = this.resources.get(id)
    
    try {
      // 调用自定义清理函数
      if (resourceInfo.cleanupFn) {
        resourceInfo.cleanupFn(resourceInfo.resource)
      }
    } catch (error) {
      console.warn(`Error during custom cleanup for ${id}:`, error)
    }

    // 调用资源对象的清理方法（分别处理异常）
    if (resourceInfo.resource) {
      if (typeof resourceInfo.resource.destroy === 'function') {
        try {
          resourceInfo.resource.destroy()
        } catch (error) {
          console.warn(`Error during resource.destroy for ${id}:`, error)
        }
      }
      
      if (typeof resourceInfo.resource.cleanup === 'function') {
        try {
          resourceInfo.resource.cleanup()
        } catch (error) {
          console.warn(`Error during resource.cleanup for ${id}:`, error)
        }
      }
    }

    // 从映射中移除
    this.resources.delete(id)
    return true
  }

  /**
   * 检查资源是否存在
   * @param {string} id - 资源标识
   * @returns {boolean}
   */
  hasResource(id) {
    return this.resources.has(id)
  }

  /**
   * 获取资源对象
   * @param {string} id - 资源标识
   * @returns {any|null}
   */
  getResource(id) {
    const resourceInfo = this.resources.get(id)
    return resourceInfo ? resourceInfo.resource : null
  }

  /**
   * 获取所有资源
   * @returns {Object}
   */
  getAllResources() {
    const result = {}
    for (const [id, resourceInfo] of this.resources) {
      result[id] = resourceInfo.resource
    }
    return result
  }

  /**
   * 获取资源ID列表
   * @returns {string[]}
   */
  getResourceIds() {
    return Array.from(this.resources.keys())
  }

  /**
   * 获取资源数量
   * @returns {number}
   */
  getResourceCount() {
    return this.resources.size
  }

  /**
   * 检查是否已销毁
   * @returns {boolean}
   */
  isDestroyed() {
    return this.destroyed
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    return {
      totalResources: this.resources.size,
      isDestroyed: this.destroyed,
      resourceTypes: this._getResourceTypes()
    }
  }

  /**
   * 销毁资源管理器并清理所有资源
   */
  destroy() {
    if (this.destroyed) {
      return
    }

    // 清理所有资源
    this.cleanup()

    // 标记为已销毁
    this.destroyed = true
  }

  /**
   * 清理所有资源
   */
  cleanup() {
    if (this.destroyed) {
      return
    }

    // 清理所有资源
    const resourceIds = Array.from(this.resources.keys())
    for (const id of resourceIds) {
      this.unregister(id)
    }

    this.resources.clear()
    this.destroyed = true
  }

  /**
   * 获取资源类型统计
   * @private
   */
  _getResourceTypes() {
    const resourceTypes = {}
    for (const [id, resourceInfo] of this.resources) {
      resourceTypes[id] = typeof resourceInfo.resource
    }
    return resourceTypes
  }
}