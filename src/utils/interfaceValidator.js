/**
 * 接口定义和验证工具
 * 确保组件间接口的一致性
 */

/**
 * StructuredLayout 接口定义
 */
export const STRUCTURED_LAYOUT_INTERFACE = {
  // 核心方法
  initLayoutEngine: 'function',
  getLayoutEngine: 'function',
  getBranchManager: 'function',
  getConnectionPreviewManager: 'function',
  
  // 布局方法
  validateConnection: 'function',
  applyLayout: 'function',
  applyStructuredLayout: 'function',
  updateSplitNodeBranches: 'function',
  clearLayout: 'function',
  
  // 约束和检查方法
  getNodeConstraints: 'function',
  canAddOutput: 'function',
  canAddInput: 'function',
  getAllowedTargetTypes: 'function',
  
  // 状态
  isReady: 'object' // computed ref
}

/**
 * 验证对象是否符合指定接口
 * @param {Object} obj - 要验证的对象
 * @param {Object} interfaceDefinition - 接口定义
 * @param {string} objectName - 对象名称（用于错误信息）
 * @returns {boolean} 是否符合接口
 */
export function validateInterface(obj, interfaceDefinition, objectName = 'Object') {
  const missingMethods = []
  const wrongTypes = []
  
  for (const [key, expectedType] of Object.entries(interfaceDefinition)) {
    if (!(key in obj)) {
      missingMethods.push(key)
    } else if (typeof obj[key] !== expectedType) {
      wrongTypes.push({
        key,
        expected: expectedType,
        actual: typeof obj[key]
      })
    }
  }
  
  if (missingMethods.length > 0) {
    console.error(`❌ [Interface] ${objectName} 缺少方法:`, missingMethods)
  }
  
  if (wrongTypes.length > 0) {
    console.error(`❌ [Interface] ${objectName} 类型错误:`, wrongTypes)
  }
  
  const isValid = missingMethods.length === 0 && wrongTypes.length === 0
  
  if (isValid) {
    console.log(`✅ [Interface] ${objectName} 接口验证通过`)
  }
  
  return isValid
}

/**
 * 创建接口代理，确保方法调用安全
 * @param {Object} target - 目标对象
 * @param {Object} interfaceDefinition - 接口定义
 * @param {string} objectName - 对象名称
 * @returns {Proxy} 代理对象
 */
export function createInterfaceProxy(target, interfaceDefinition, objectName = 'Object') {
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in interfaceDefinition && !(prop in obj)) {
        console.error(`❌ [Interface] ${objectName}.${prop} 方法不存在`)
        return () => {
          throw new Error(`${objectName}.${prop} 方法未实现`)
        }
      }
      return obj[prop]
    }
  })
}

/**
 * 自动生成接口包装器
 * @param {Object} source - 源对象
 * @param {Object} interfaceDefinition - 接口定义
 * @param {string} objectName - 对象名称
 * @returns {Object} 包装后的对象
 */
export function createInterfaceWrapper(source, interfaceDefinition, objectName = 'Object') {
  const wrapper = {}
  
  for (const key of Object.keys(interfaceDefinition)) {
    if (key in source) {
      wrapper[key] = source[key]
    } else {
      console.warn(`⚠️ [Interface] ${objectName}.${key} 方法缺失，使用默认实现`)
      wrapper[key] = () => {
        console.error(`❌ [Interface] ${objectName}.${key} 方法未实现`)
        return null
      }
    }
  }
  
  return wrapper
}