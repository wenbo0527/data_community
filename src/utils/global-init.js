/**
 * 全局初始化文件
 * 用于将修复相关的类注册到全局window对象，以便测试页面访问
 */

/**
 * 初始化全局对象
 */
export function initializeGlobalObjects() {
  if (typeof window !== 'undefined') {
    console.log('[GlobalInit] 🚀 开始初始化全局修复工具...')
    
    // 动态导入所有修复相关的类
    Promise.all([
      import('../pages/marketing/tasks/utils/StorageUtils.js').then(module => {
        window.StorageUtils = module.StorageUtils
        return 'StorageUtils'
      }).catch(err => {
        console.warn('StorageUtils导入失败:', err.message)
        return null
      }),
      
      import('./DataMigrationManager.js').then(module => {
        window.DataMigrationManager = module.DataMigrationManager || module.default
        return 'DataMigrationManager'
      }).catch(err => {
        console.warn('DataMigrationManager导入失败:', err.message)
        return null
      }),
      
      import('./UnifiedDataValidator.js').then(module => {
        window.UnifiedDataValidator = module.UnifiedDataValidator || module.default
        return 'UnifiedDataValidator'
      }).catch(err => {
        console.warn('UnifiedDataValidator导入失败:', err.message)
        return null
      })
    ]).then(results => {
      const loaded = results.filter(Boolean)
      console.log('[GlobalInit] ✓ 全局对象初始化完成:', {
        StorageUtils: !!window.StorageUtils,
        DataMigrationManager: !!window.DataMigrationManager,
        UnifiedDataValidator: !!window.UnifiedDataValidator,
        loaded: loaded
      })
    }).catch(err => {
      console.error('[GlobalInit] ❌ 全局初始化失败:', err)
    })
  }
}

/**
 * 自动初始化（在模块加载时执行）
 */
initializeGlobalObjects()

export default {
  initializeGlobalObjects
}