/**
 * 布局执行器
 * 负责布局执行流程控制、阶段性执行管理和执行状态跟踪
 * 约150行代码
 */

// 导入类型定义
import { LayoutContextType, LayoutResultType } from '../types/LayoutTypes.js';
import { ConfigType } from '../types/ConfigTypes.js';

/**
 * 布局执行器类
 * 主要职责：
 * 1. 布局执行流程控制
 * 2. 阶段性执行管理
 * 3. 执行状态跟踪
 * 4. 模块间协调
 * @class LayoutExecutor
 */
export class LayoutExecutor {
  /**
   * 构造函数
   * @param {Object} modules - 布局算法模块集合
   * @param {Object} modules.dataPreprocessor - 数据预处理器
   * @param {Object} modules.layerCalculator - 层级计算器
   * @param {Object} modules.hierarchicalBuilder - 分层构建器
   * @param {Object} modules.bottomUpPositioner - 自底向上定位器
   * @param {Object} modules.layerOptimizer - 层级优化器
   * @param {Object} modules.globalOptimizer - 全局优化器
   * @param {Object} modules.positionApplicator - 位置应用器
   */
  constructor(modules) {
    // 存储所有算法模块
    this.modules = modules;
    
    // 执行状态
    this.isExecuting = false;
    this.currentStage = null;
    this.executionId = null;
    
    // 执行统计
    this.executionCount = 0;
    this.lastExecutionTime = null;
    
    console.log('LayoutExecutor initialized with modules:', Object.keys(modules));
  }
  
  /**
   * 执行完整的布局计算流程
   * @param {Object} context - 执行上下文
   * @param {Object} context.graph - 图形对象
   * @param {Object} context.options - 布局选项
   * @param {Object} [context.previewLineManager] - 预览线管理器
   * @returns {Promise<Object>} 执行结果
   * @returns {boolean} returns.success - 执行是否成功
   * @returns {string} returns.executionId - 执行ID
   * @returns {number} returns.duration - 执行时长(ms)
   * @returns {number} [returns.nodeCount] - 节点数量
   * @returns {number} [returns.layerCount] - 层级数量
   * @returns {Object} [returns.stages] - 各阶段结果
   * @returns {string} [returns.error] - 错误信息(失败时)
   * @returns {string} [returns.stage] - 失败阶段(失败时)
   * @returns {number} returns.timestamp - 时间戳
   */
  async execute(context) {
    if (this.isExecuting) {
      console.warn('Layout execution already in progress');
      return { success: false, reason: 'already_executing' };
    }
    
    this.isExecuting = true;
    this.executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.executionCount++;
    
    const startTime = Date.now();
    
    try {
      console.log(`Starting layout execution ${this.executionId}`);
      
      // 阶段1：数据预处理
      const preprocessedData = await this.executeStage('preprocessing', () => {
        return this.modules.dataPreprocessor.preprocess({
          graph: context.graph,
          options: context.options
        });
      });
      
      if (!preprocessedData || !preprocessedData.success) {
        throw new Error('Data preprocessing failed');
      }
      
      // 阶段2：层级计算
      const layerData = await this.executeStage('layer_calculation', () => {
        return this.modules.layerCalculator.calculateLayers({
          nodes: preprocessedData.nodes,
          edges: preprocessedData.edges,
          graph: context.graph
        });
      });
      
      // 阶段3：分层构建
      const hierarchicalData = await this.executeStage('hierarchical_building', () => {
        return this.modules.hierarchicalBuilder.buildHierarchicalLayers({
          nodes: preprocessedData.nodes,
          edges: preprocessedData.edges,
          layerData: layerData,
          graph: context.graph
        });
      });
      
      // 阶段4：自底向上位置计算
      const positions = await this.executeStage('bottom_up_positioning', () => {
        return this.modules.bottomUpPositioner.calculateBottomUpPositions({
          layers: hierarchicalData.layers
        });
      });
      
      // 阶段5：层级优化
      const optimizedPositions = await this.executeStage('layer_optimization', () => {
        return this.modules.layerOptimizer.optimizeUnifiedLayerAlignment(
          positions,
          { layers: hierarchicalData.layers }
        );
      });
      
      // 阶段6：全局优化
      const globalOptimizedPositions = await this.executeStage('global_optimization', () => {
        return this.modules.globalOptimizer.applyGlobalOptimization(
          optimizedPositions,
          { layers: hierarchicalData.layers, totalLayers: hierarchicalData.layers.length },
          context.graph
        );
      });
      
      // 阶段7：位置应用
      const applicationResult = await this.executeStage('position_application', () => {
        return this.modules.positionApplicator.applyPositions({
          positions: globalOptimizedPositions,
          graph: context.graph,
          previewLineManager: context.previewLineManager,
          options: context.options
        });
      });
      
      const endTime = Date.now();
      this.lastExecutionTime = endTime - startTime;
      
      const result = {
        success: true,
        executionId: this.executionId,
        duration: this.lastExecutionTime,
        nodeCount: preprocessedData.nodes?.length || 0,
        layerCount: hierarchicalData.layers?.length || 0,
        stages: {
          preprocessing: preprocessedData,
          layerCalculation: layerData,
          hierarchicalBuilding: hierarchicalData,
          positioning: positions,
          layerOptimization: optimizedPositions,
          globalOptimization: globalOptimizedPositions,
          application: applicationResult
        },
        timestamp: Date.now()
      };
      
      console.log(`Layout execution ${this.executionId} completed successfully in ${this.lastExecutionTime}ms`);
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      this.lastExecutionTime = endTime - startTime;
      
      console.error(`Layout execution ${this.executionId} failed:`, error);
      return {
        success: false,
        executionId: this.executionId,
        error: error.message,
        stage: this.currentStage,
        duration: this.lastExecutionTime,
        timestamp: Date.now()
      };
    } finally {
      this.isExecuting = false;
      this.currentStage = null;
    }
  }
  
  /**
   * 执行单个阶段
   * @param {string} stageName - 阶段名称
   * @param {Function} stageFunction - 阶段执行函数
   * @returns {Promise<*>} 阶段执行结果
   * @throws {Error} 当阶段执行失败时抛出错误
   */
  async executeStage(stageName, stageFunction) {
    this.currentStage = stageName;
    const stageStartTime = Date.now();
    
    try {
      console.log(`Executing stage: ${stageName}`);
      const result = await stageFunction();
      const stageDuration = Date.now() - stageStartTime;
      
      console.log(`Stage ${stageName} completed in ${stageDuration}ms`);
      return result;
      
    } catch (error) {
      const stageDuration = Date.now() - stageStartTime;
      console.error(`Stage ${stageName} failed after ${stageDuration}ms:`, error);
      throw new Error(`Stage ${stageName} failed: ${error.message}`);
    }
  }
  
  /**
   * 获取执行状态
   * @returns {Object} 当前执行状态
   * @returns {boolean} returns.isExecuting - 是否正在执行
   * @returns {string|null} returns.currentStage - 当前执行阶段
   * @returns {string|null} returns.executionId - 当前执行ID
   * @returns {number} returns.executionCount - 执行次数
   * @returns {number|null} returns.lastExecutionTime - 上次执行时长(ms)
   */
  getExecutionStatus() {
    return {
      isExecuting: this.isExecuting,
      currentStage: this.currentStage,
      executionId: this.executionId,
      executionCount: this.executionCount,
      lastExecutionTime: this.lastExecutionTime
    };
  }
  
  /**
   * 取消当前执行
   * 注意：这只是设置标志，实际的取消需要各模块支持
   * @returns {void}
   */
  cancel() {
    if (this.isExecuting) {
      console.log(`Cancelling layout execution ${this.executionId}`);
      this.isExecuting = false;
      this.currentStage = 'cancelled';
    }
  }
  
  /**
   * 验证模块完整性
   * @returns {Object} 验证结果
   * @returns {boolean} returns.valid - 模块是否完整
   * @returns {string[]} returns.available - 可用的模块列表
   * @returns {string[]} returns.missing - 缺失的模块列表
   * @returns {number} returns.total - 总模块数量
   */
  validateModules() {
    const requiredModules = [
      'dataPreprocessor',
      'layerCalculator', 
      'hierarchicalBuilder',
      'bottomUpPositioner',
      'layerOptimizer',
      'globalOptimizer',
      'positionApplicator'
    ];
    
    const missing = [];
    const available = [];
    
    requiredModules.forEach(moduleName => {
      if (this.modules[moduleName]) {
        available.push(moduleName);
      } else {
        missing.push(moduleName);
      }
    });
    
    return {
      valid: missing.length === 0,
      available,
      missing,
      total: requiredModules.length
    };
  }
}

export default LayoutExecutor;