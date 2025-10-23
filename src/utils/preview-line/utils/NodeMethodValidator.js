/**
 * 节点方法验证工具
 * 确保X6节点对象具有必要的方法
 */

export class NodeMethodValidator {
  /**
   * 验证节点对象是否具有必要的方法
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  static validateNodeMethods(node) {
    const result = {
      isValid: false,
      missingMethods: [],
      nodeInfo: {
        id: null,
        type: typeof node,
        constructor: null,
        prototype: null
      },
      methodStatus: {}
    };
    
    // 基本节点检查
    if (!node) {
      result.missingMethods.push('node对象为null或undefined');
      return result;
    }
    
    // 获取节点基本信息
    result.nodeInfo.id = node.id || 'unknown';
    result.nodeInfo.constructor = node.constructor?.name || 'unknown';
    result.nodeInfo.prototype = Object.getPrototypeOf(node)?.constructor?.name || 'unknown';
    
    // 必需的方法列表
    const requiredMethods = ['getData', 'getPosition', 'getSize'];
    
    // 检查每个必需方法
    for (const methodName of requiredMethods) {
      const methodStatus = this.checkMethod(node, methodName);
      result.methodStatus[methodName] = methodStatus;
      
      if (!methodStatus.available) {
        result.missingMethods.push(`${methodName}: ${methodStatus.reason}`);
      }
    }
    
    // 判断整体有效性
    result.isValid = result.missingMethods.length === 0;
    
    return result;
  }
  
  /**
   * 检查单个方法的可用性
   * @param {Object} node - 节点对象
   * @param {string} methodName - 方法名
   * @returns {Object} 方法状态
   */
  static checkMethod(node, methodName) {
    const status = {
      available: false,
      type: 'undefined',
      reason: '',
      canCall: false,
      result: null,
      error: null
    };
    
    try {
      // 检查方法是否存在
      if (!(methodName in node)) {
        status.reason = '方法不存在';
        return status;
      }
      
      const method = node[methodName];
      status.type = typeof method;
      
      // 检查是否为函数
      if (typeof method !== 'function') {
        status.reason = `不是函数，类型为: ${status.type}`;
        return status;
      }
      
      status.available = true;
      
      // 尝试调用方法（仅对安全方法）
      if (['getData', 'getPosition', 'getSize'].includes(methodName)) {
        try {
          const result = method.call(node);
          status.canCall = true;
          status.result = result;
          status.reason = '方法可用且可调用';
        } catch (error) {
          status.canCall = false;
          status.error = error.message;
          status.reason = `方法存在但调用失败: ${error.message}`;
        }
      } else {
        status.reason = '方法存在但未测试调用';
      }
    } catch (error) {
      status.error = error.message;
      status.reason = `检查方法时出错: ${error.message}`;
    }
    
    return status;
  }
  
  /**
   * 创建安全的节点方法包装器
   * @param {Object} node - 原始节点对象
   * @returns {Object} 包装后的节点对象
   */
  static createSafeNodeWrapper(node) {
    const validation = this.validateNodeMethods(node);
    
    if (validation.isValid) {
      return node; // 节点已经安全，直接返回
    }
    
    // 创建安全包装器
    const safeWrapper = {
      // 保留原始属性
      id: node?.id || 'unknown-node',
      originalNode: node,
      isWrapper: true,
      validationResult: validation,
      
      // 安全的getData方法
      getData() {
        if (node && typeof node.getData === 'function') {
          try {
            return node.getData();
          } catch (error) {
            console.warn(`节点 ${this.id} getData()调用失败:`, error.message);
            return null;
          }
        }
        
        // 尝试从其他属性获取数据
        if (node && node.data) {
          return node.data;
        }
        
        if (node && node._data) {
          return node._data;
        }
        
        console.warn(`节点 ${this.id} 无法获取数据，返回默认值`);
        return { type: 'unknown', isConfigured: false };
      },
      
      // 安全的getPosition方法
      getPosition() {
        if (node && typeof node.getPosition === 'function') {
          try {
            return node.getPosition();
          } catch (error) {
            console.warn(`节点 ${this.id} getPosition()调用失败:`, error.message);
            return { x: 0, y: 0 };
          }
        }
        
        // 尝试从其他属性获取位置
        if (node && node.position) {
          return node.position;
        }
        
        if (node && node._position) {
          return node._position;
        }
        
        if (node && typeof node.x === 'number' && typeof node.y === 'number') {
          return { x: node.x, y: node.y };
        }
        
        console.warn(`节点 ${this.id} 无法获取位置，返回默认值`);
        return { x: 0, y: 0 };
      },
      
      // 安全的getSize方法
      getSize() {
        if (node && typeof node.getSize === 'function') {
          try {
            return node.getSize();
          } catch (error) {
            console.warn(`节点 ${this.id} getSize()调用失败:`, error.message);
            return { width: 120, height: 80 };
          }
        }
        
        // 尝试从其他属性获取尺寸
        if (node && node.size) {
          return node.size;
        }
        
        if (node && node._size) {
          return node._size;
        }
        
        if (node && typeof node.width === 'number' && typeof node.height === 'number') {
          return { width: node.width, height: node.height };
        }
        
        console.warn(`节点 ${this.id} 无法获取尺寸，返回默认值`);
        return { width: 120, height: 80 };
      }
    };
    
    return safeWrapper;
  }
  
  /**
   * 批量验证节点数组
   * @param {Array} nodes - 节点数组
   * @returns {Object} 批量验证结果
   */
  static validateNodeArray(nodes) {
    const result = {
      totalNodes: nodes.length,
      validNodes: 0,
      invalidNodes: 0,
      validationResults: [],
      summary: {
        commonIssues: {},
        nodeTypes: {},
        methodIssues: {}
      }
    };
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const validation = this.validateNodeMethods(node);
      
      validation.index = i;
      result.validationResults.push(validation);
      
      if (validation.isValid) {
        result.validNodes++;
      } else {
        result.invalidNodes++;
        
        // 统计常见问题
        validation.missingMethods.forEach(issue => {
          result.summary.commonIssues[issue] = (result.summary.commonIssues[issue] || 0) + 1;
        });
      }
      
      // 统计节点类型
      const nodeType = validation.nodeInfo.constructor;
      result.summary.nodeTypes[nodeType] = (result.summary.nodeTypes[nodeType] || 0) + 1;
      
      // 统计方法问题
      Object.entries(validation.methodStatus).forEach(([method, status]) => {
        if (!status.available) {
          const key = `${method}: ${status.reason}`;
          result.summary.methodIssues[key] = (result.summary.methodIssues[key] || 0) + 1;
        }
      });
    }
    
    return result;
  }
  
  /**
   * 打印验证结果报告
   * @param {Object|Array} validationResult - 验证结果或节点数组
   * @param {boolean} detailed - 是否显示详细信息
   */
  static printValidationReport(validationResult, detailed = false) {
    if (Array.isArray(validationResult)) {
      // 如果是节点数组，先进行批量验证
      const batchResult = this.validateNodeArray(validationResult);
      this.printBatchValidationReport(batchResult, detailed);
    } else if (validationResult && validationResult.totalNodes !== undefined) {
      // 如果是批量验证结果对象
      this.printBatchValidationReport(validationResult, detailed);
    } else {
      // 单个节点验证结果
      this.printSingleValidationReport(validationResult, detailed);
    }
  }
  
  /**
   * 打印单个节点验证报告
   */
  static printSingleValidationReport(result, detailed) {
    if (!result || !result.nodeInfo) {
      console.log('无效的验证结果');
      return;
    }
    
    console.log('\n=== 节点方法验证报告 ===');
    console.log(`节点ID: ${result.nodeInfo.id || 'unknown'}`);
    console.log(`节点类型: ${result.nodeInfo.type || 'unknown'}`);
    console.log(`构造函数: ${result.nodeInfo.constructor || 'unknown'}`);
    console.log(`原型: ${result.nodeInfo.prototype || 'unknown'}`);
    console.log(`验证结果: ${result.isValid ? '✅ 通过' : '❌ 失败'}`);
    
    if (!result.isValid && result.missingMethods && result.missingMethods.length > 0) {
      console.log('\n缺失的方法:');
      result.missingMethods.forEach(method => {
        console.log(`  ❌ ${method}`);
      });
    }
    
    if (detailed) {
      console.log('\n方法状态详情:');
      Object.entries(result.methodStatus).forEach(([method, status]) => {
        const icon = status.available ? '✅' : '❌';
        console.log(`  ${icon} ${method}: ${status.reason}`);
        if (status.result !== null) {
          console.log(`    返回值:`, status.result);
        }
        if (status.error) {
          console.log(`    错误:`, status.error);
        }
      });
    }
  }
  
  /**
   * 打印批量验证报告
   */
  static printBatchValidationReport(result, detailed) {
    console.log('\n=== 批量节点验证报告 ===');
    console.log(`总节点数: ${result.totalNodes}`);
    console.log(`有效节点: ${result.validNodes}`);
    console.log(`无效节点: ${result.invalidNodes}`);
    console.log(`成功率: ${((result.validNodes / result.totalNodes) * 100).toFixed(1)}%`);
    
    if (Object.keys(result.summary.commonIssues).length > 0) {
      console.log('\n常见问题:');
      Object.entries(result.summary.commonIssues)
        .sort(([,a], [,b]) => b - a)
        .forEach(([issue, count]) => {
          console.log(`  ${issue}: ${count}次`);
        });
    }
    
    if (Object.keys(result.summary.nodeTypes).length > 0) {
      console.log('\n节点类型分布:');
      Object.entries(result.summary.nodeTypes)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count}个`);
        });
    }
    
    if (detailed && result.invalidNodes > 0) {
      console.log('\n无效节点详情:');
      result.validationResults
        .filter(r => !r.isValid)
        .forEach((r, index) => {
          console.log(`\n  节点 ${index + 1} (${r.nodeInfo.id}):`);
          r.missingMethods.forEach(method => {
            console.log(`    ❌ ${method}`);
          });
        });
    }
  }
}

export default NodeMethodValidator;