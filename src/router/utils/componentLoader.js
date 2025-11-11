/**
 * 组件动态加载工具
 * 用于路由中的组件懒加载
 */

/**
 * 动态加载组件
 * @param {string} componentPath - 组件路径
 * @param {string} componentName - 组件名称（用于调试）
 * @returns {Function} 返回动态导入函数
 */
export function loadComponent(componentPath, componentName = 'Component') {
  return () => {
    console.log(`🔄 [ComponentLoader] 开始加载组件: ${componentName} (${componentPath})`)
    
    return import(componentPath)
      .then(module => {
        console.log(`✅ [ComponentLoader] 组件加载成功: ${componentName}`)
        return module
      })
      .catch(error => {
        console.error(`❌ [ComponentLoader] 组件加载失败: ${componentName}`, error)
        
        // 返回一个错误组件
        return {
          default: {
            name: 'ComponentLoadError',
            template: `
              <div class="component-load-error">
                <h3>组件加载失败</h3>
                <p>组件名称: ${componentName}</p>
                <p>组件路径: ${componentPath}</p>
                <p>错误信息: ${error.message}</p>
              </div>
            `,
            style: `
              .component-load-error {
                padding: 20px;
                border: 1px solid #ff4d4f;
                border-radius: 6px;
                background-color: #fff2f0;
                color: #ff4d4f;
                text-align: center;
              }
            `
          }
        }
      })
  }
}

/**
 * 批量加载组件
 * @param {Array} components - 组件配置数组 [{path, name}, ...]
 * @returns {Object} 返回组件映射对象
 */
export function loadComponents(components) {
  const componentMap = {}
  
  components.forEach(({ path, name }) => {
    componentMap[name] = loadComponent(path, name)
  })
  
  return componentMap
}

/**
 * 预加载组件
 * @param {string} componentPath - 组件路径
 * @param {string} componentName - 组件名称
 * @returns {Promise} 返回预加载Promise
 */
export function preloadComponent(componentPath, componentName = 'Component') {
  console.log(`🚀 [ComponentLoader] 预加载组件: ${componentName} (${componentPath})`)
  
  return import(componentPath)
    .then(module => {
      console.log(`✅ [ComponentLoader] 组件预加载成功: ${componentName}`)
      return module
    })
    .catch(error => {
      console.error(`❌ [ComponentLoader] 组件预加载失败: ${componentName}`, error)
      throw error
    })
}

export default {
  loadComponent,
  loadComponents,
  preloadComponent
}