import type { Graph } from '@antv/x6';
import { UnifiedEventBus } from '../../core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager';
import { ErrorHandler } from '../../core/ErrorHandler';
import { CoordinateSystemManager } from '../../utils/CoordinateSystemManager';
import ValidationManager from './ValidationManager';
import { EndNodeAutoGenerator } from './EndNodeAutoGenerator';
import { CycleDetector } from './CycleDetector';
import { BranchLineProcessor } from './BranchLineProcessor';
import { LabelManager } from './LabelManager';
import { DeletionCascadeHandler } from './DeletionCascadeHandler';

// 发布状态类型定义
type PublishState = 'idle' | 'validating' | 'processing' | 'publishing' | 'completed' | 'failed' | 'cancelled' | 'detecting_cycles' | 'generating_end_nodes' | 'generating_config' | 'running';

/**
 * 发布流程管理器
 * 作为发布流程的总控制器，协调所有发布相关的组件和流程
 */
export class PublishFlowManager {
  private canvas: Graph;
  private previewLineManager: any;
  private layoutEngine: any;
  private eventBus: UnifiedEventBus;
  private cacheManager: UnifiedCacheManager;
  private errorHandler: ErrorHandler;
  private coordinateManager: CoordinateSystemManager;
  
  // 子管理器
  private validationManager: ValidationManager;
  private endNodeGenerator: EndNodeAutoGenerator;
  private cycleDetector: CycleDetector;
  private branchProcessor: BranchLineProcessor;
  private labelManager: LabelManager;
  private deletionHandler: DeletionCascadeHandler;
  
  // 发布状态
  private publishState: PublishState;
  private publishHistory: Array<{
    id: string;
    timestamp: number;
    result: any;
    config: any;
  }>;

  constructor(
    canvas: Graph,
    previewLineManager: any,
    layoutEngine: any,
    eventBus: UnifiedEventBus,
    cacheManager: UnifiedCacheManager,
    errorHandler: ErrorHandler,
    coordinateManager: CoordinateSystemManager
  ) {
    this.canvas = canvas;
    this.previewLineManager = previewLineManager;
    this.layoutEngine = layoutEngine;
    this.eventBus = eventBus;
    this.cacheManager = cacheManager;
    this.errorHandler = errorHandler;
    this.coordinateManager = coordinateManager;
    
    this.publishState = 'idle';
    this.publishHistory = [];
    
    this.initializeSubManagers();
    this.setupEventListeners();
  }

  /**
   * 初始化子管理器
   */
  private initializeSubManagers(): void {
    try {
      // 初始化校验管理器
      this.validationManager = new ValidationManager({
        canvas: this.canvas,
        eventBus: this.eventBus,
        cacheManager: this.cacheManager,
        errorHandler: this.errorHandler
      });
      
      // 初始化标签管理器
      this.labelManager = new LabelManager(
        this.canvas,
        this.eventBus,
        this.cacheManager,
        this.errorHandler
      );
      
      // 初始化结束节点生成器
      this.endNodeGenerator = new EndNodeAutoGenerator(
        this.canvas,
        this.previewLineManager,
        this.eventBus,
        this.cacheManager,
        this.errorHandler
      );
      
      // 初始化循环检测器
      this.cycleDetector = new CycleDetector(
        this.canvas,
        this.eventBus,
        this.cacheManager,
        this.errorHandler
      );
      
      // 初始化分支处理器
      this.branchProcessor = new BranchLineProcessor(
        this.canvas,
        this.previewLineManager,
        this.labelManager,
        this.eventBus,
        this.cacheManager,
        this.errorHandler
      );
      
      // 初始化删除级联处理器
      this.deletionHandler = new DeletionCascadeHandler(
        this.canvas,
        this.previewLineManager,
        this.labelManager,
        this.layoutEngine,
        this.eventBus,
        this.cacheManager,
        this.errorHandler
      );
      
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'PublishFlowManager.initializeSubManagers',
        severity: 'high'
      });
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听发布流程开始事件
    this.eventBus.on('publish:flow:start', (data) => {
      this.handlePublishFlowStart(data);
    });
    
    // 监听发布流程取消事件
    this.eventBus.on('publish:flow:cancel', (data) => {
      this.handlePublishFlowCancel(data);
    });
    
    // 监听校验失败事件
    this.eventBus.on('publish:validation:failed', (data) => {
      this.handleValidationFailed(data);
    });
    
    // 监听发布状态变化
    this.eventBus.on('publish:state:changed', (data) => {
      this.handlePublishStateChange(data);
    });
    
    // 监听校验结果
    this.eventBus.on('validation:completed', (data) => {
      this.handleValidationCompleted(data);
    });
    
    // 监听错误事件
    this.eventBus.on('publish:error', (data) => {
      this.handlePublishError(data);
    });
  }

  /**
   * 执行完整的发布流程
   */
  async executePublishFlow(): Promise<{
    success: boolean;
    steps: string[];
    errors: string[];
    warnings: string[];
    generatedEndNodes: any[];
    validationResults: any;
    cycleDetectionResults: any;
    publishConfig?: any;
  }> {
    const publishId = `publish_${Date.now()}`;
    const publishResult = {
      success: false,
      steps: [],
      errors: [],
      warnings: [],
      generatedEndNodes: [],
      validationResults: null,
      cycleDetectionResults: null
    };

    try {
      this.setPublishState('running');
      this.eventBus.emit('publish:flow:started');
      this.eventBus.emit('publish:started', { publishId });

      // 检查是否已被取消
      if ((this.publishState as PublishState) === 'cancelled') {
        publishResult.errors.push({ type: 'cancelled', message: '发布流程已被取消' });
        return publishResult;
      }

      // 步骤1: 为未连接的预览线添加结束节点
      publishResult.steps.push('添加结束节点');
      this.eventBus.emit('publish:step', { step: '添加结束节点', publishId });
      
      try {
        // 先检测未连接的预览线
        const unconnectedLines = await this.endNodeGenerator.detectUnconnectedPreviewLines();
        
        if (unconnectedLines.length > 0) {
          const endNodeResults = await this.endNodeGenerator.autoAddEndNodes();
          publishResult.generatedEndNodes = endNodeResults;
          
          if (endNodeResults.length > 0) {
            publishResult.warnings.push(`自动添加了 ${endNodeResults.length} 个结束节点`);
            // 发出结束节点添加事件
            this.eventBus.emit('publish:endnodes:added', endNodeResults);
          }
        }
      } catch (endNodeError) {
        const errorMessage = `结束节点生成失败: ${endNodeError instanceof Error ? endNodeError.message : String(endNodeError)}`;
        publishResult.errors.push({ type: 'endnode_error', message: errorMessage });
        this.setPublishState('failed');
        
        this.errorHandler.handleError(endNodeError as Error, {
          context: 'publish_flow_endnode_generation',
          severity: 'medium'
        });
        
        return publishResult;
      }

      // 检查是否已被取消
      if ((this.publishState as PublishState) === 'cancelled') {
        publishResult.errors.push({ type: 'cancelled', message: '发布流程已被取消' });
        return publishResult;
      }

      // 步骤2: 执行循环检测
      publishResult.steps.push('循环依赖检测');
      this.eventBus.emit('publish:step', { step: '循环依赖检测', publishId });
      
      try {
        const cycleResults = await this.cycleDetector.detectCycles();
        publishResult.cycleDetectionResults = cycleResults;
        
        if (cycleResults.hasCycles) {
          publishResult.errors.push({ type: 'cycle_dependency', message: `检测到 ${cycleResults.cycles.length} 个循环依赖` });
          this.setPublishState('failed');
          this.eventBus.emit('publish:cycle:detected', cycleResults);
          return publishResult;
        }
      } catch (cycleError) {
        const errorMessage = `循环检测失败: ${cycleError instanceof Error ? cycleError.message : String(cycleError)}`;
        publishResult.errors.push({ type: 'cycle_error', message: errorMessage });
        this.setPublishState('failed');
        
        this.errorHandler.handleError(cycleError as Error, {
          context: 'publish_flow_cycle_detection',
          severity: 'high'
        });
        
        return publishResult;
      }

      // 检查是否已被取消
      if ((this.publishState as PublishState) === 'cancelled') {
        publishResult.errors.push({ type: 'cancelled', message: '发布流程已被取消' });
        return publishResult;
      }

      // 步骤3: 节点配置校验
      publishResult.steps.push('节点配置校验');
      this.eventBus.emit('publish:step', { step: '节点配置校验', publishId });
      
      try {
        const validationResults = await this.validationManager.validateAll();
        publishResult.validationResults = validationResults;
        
        if (!validationResults.isValid) {
          publishResult.errors.push(...validationResults.errors.map((e: any) => ({ type: 'validation', message: e.message })));
          this.setPublishState('failed');
          this.eventBus.emit('publish:validation:failed', validationResults);
          return publishResult;
        }
        
        if (validationResults.warnings.length > 0) {
          publishResult.warnings.push(...validationResults.warnings.map((w: any) => w.message));
        }
      } catch (validationError) {
        const errorMessage = `校验失败: ${validationError instanceof Error ? validationError.message : String(validationError)}`;
        publishResult.errors.push({ type: 'validation_error', message: errorMessage });
        this.setPublishState('failed');
        
        this.errorHandler.handleError(validationError as Error, {
          context: 'publish_flow_validation',
          severity: 'high'
        });
        
        return publishResult;
      }

      this.setPublishState('processing');

      // 步骤4: 处理分支线和标签
      publishResult.steps.push('处理分支线和标签');
      this.eventBus.emit('publish:step', { step: '处理分支线和标签', publishId });
      
      try {
        const branchResults = await this.processBranchesForAllDecisionNodes();
        
        if (!branchResults.success) {
          publishResult.errors.push(`分支处理失败: ${branchResults.error || '未知错误'}`);
          this.setPublishState('failed');
          return publishResult;
        }
        
        if (branchResults.processedBranches > 0) {
          publishResult.warnings.push(`处理了 ${branchResults.processedBranches} 个分支`);
        }
      } catch (branchError) {
        const errorMessage = `分支处理失败: ${branchError instanceof Error ? branchError.message : String(branchError)}`;
        publishResult.errors.push({ type: 'branch_error', message: errorMessage });
        this.setPublishState('failed');
        
        this.errorHandler.handleError(branchError as Error, {
          context: 'publish_flow_branch_processing',
          severity: 'medium'
        });
        
        return publishResult;
      }

      // 步骤5: 最终布局优化
      publishResult.steps.push('布局优化');
      this.eventBus.emit('publish:step', { step: '布局优化', publishId });
      
      await this.layoutEngine.applyLayout();

      this.setPublishState('publishing');

      // 步骤6: 生成发布配置
      publishResult.steps.push('生成发布配置');
      this.eventBus.emit('publish:step', { step: '生成发布配置', publishId });
      
      const publishConfig = await this.generatePublishConfig();
      (publishResult as any).publishConfig = publishConfig;

      // 记录发布历史
      this.recordPublishHistory(publishId, publishResult, publishConfig);

      publishResult.success = true;
      this.setPublishState('completed');
      
      // 缓存发布结果
      this.cacheManager.set('publish_flow_result', publishResult, { ttl: 86400000 }); // 24小时缓存
      
      this.eventBus.emit('publish:flow:completed', { publishId, result: publishResult });
      
    } catch (error) {
      const errorMessage = `发布流程执行失败: ${error instanceof Error ? error.message : String(error)}`;
      publishResult.errors.push({ type: 'execution_error', message: errorMessage });
      this.setPublishState('failed');
      
      this.errorHandler.handleError(error, {
        context: 'PublishFlowManager.executePublishFlow',
        severity: 'high',
        publishId
      });
      
      this.eventBus.emit('publish:failed', { publishId, error: errorMessage });
    }

    return publishResult;
  }

  /**
   * 生成发布配置
   */
  private async generatePublishConfig(): Promise<any> {
    try {
      const nodes = this.canvas.getNodes();
      const edges = this.canvas.getEdges();
      
      const config = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        nodes: nodes.map((node: any) => ({
          id: node.id,
          type: node.getData()?.nodeType,
          position: node.getPosition(),
          config: node.getData()
        })),
        edges: edges.map((edge: any) => ({
          id: edge.id,
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId(),
          data: edge.getData()
        })),
        metadata: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          hasEndNodes: nodes.some((n: any) => n.getData()?.nodeType === 'END_NODE'),
          autoGeneratedEndNodes: this.endNodeGenerator.getAutoGeneratedNodes().length,
          totalConnections: edges.length,
          isValidated: true,
          publishTimestamp: Date.now()
        }
      };
      
      // 缓存发布配置
      this.cacheManager.set('latest_publish_config', config, { ttl: 3600000 }); // 1小时
      
      return config;
      
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'PublishFlowManager.generatePublishConfig',
        severity: 'medium'
      });
      throw error;
    }
  }

  /**
   * 设置发布状态
   */
  private setPublishState(state: PublishState): void {
    const previousState = this.publishState;
    this.publishState = state;
    
    this.eventBus.emit('publish:state:changed', {
      previousState,
      currentState: state,
      timestamp: Date.now()
    });
  }

  /**
   * 记录发布历史
   */
  private recordPublishHistory(publishId: string, result: any, config: any): void {
    const historyRecord = {
      publishId,
      timestamp: Date.now(),
      success: result.success,
      steps: result.steps,
      errors: result.errors,
      warnings: result.warnings,
      config: config
    };
    
    // 缓存发布历史
    this.cacheManager.set(`publish_history_${publishId}`, historyRecord, { ttl: 86400000 }); // 24小时缓存
    
    // 发布历史事件
    this.eventBus.emit('publish:history:recorded', {
      publishId,
      record: historyRecord
    });
  }

  /**
   * 清除发布缓存
   */
  clearPublishCache(): void {
    this.cacheManager.delete('publish_flow_result');
    this.cacheManager.delete('publish_flow_config');
    this.cacheManager.delete('publish_flow_state');
    
    // 发布缓存清除事件
    this.eventBus.emit('publish:cache:cleared', {
      timestamp: Date.now()
    });
  }

  /**
   * 获取缓存的发布结果
   */
  getCachedPublishResult(): any {
    return this.cacheManager.get('publish_flow_result');
  }

  /**
   * 处理发布状态变化
   */
  private handlePublishStateChange(data: any): void {
    // 可以在这里添加状态变化的处理逻辑
    console.log('发布状态变化:', data);
  }

  /**
   * 处理校验完成
   */
  private handleValidationCompleted(data: any): void {
    // 可以在这里添加校验完成的处理逻辑
    console.log('校验完成:', data);
  }

  /**
   * 处理发布错误
   */
  private handlePublishError(data: any): void {
    this.setPublishState('failed');
    this.errorHandler.handleError(new Error(data.message), {
      context: 'PublishFlowManager.handlePublishError',
      severity: 'high'
    });
  }

  /**
   * 处理发布流程开始
   */
  private handlePublishFlowStart(data: any): void {
    console.log('发布流程开始:', data);
  }

  /**
   * 处理发布流程取消
   */
  private handlePublishFlowCancel(data: any): void {
    this.cancelPublishFlow();
  }

  /**
   * 处理校验失败
   */
  private handleValidationFailed(data: any): void {
    this.setPublishState('failed');
    console.log('校验失败:', data);
  }

  /**
   * 获取当前发布状态
   */
  getPublishState(): string {
    return this.publishState;
  }

  /**
   * 获取发布状态（别名方法）
   */
  getPublishStatus(): string {
    return this.publishState;
  }

  /**
   * 获取发布历史
   */
  getPublishHistory(): Array<any> {
    return [...this.publishHistory];
  }

  /**
   * 取消当前发布流程
   */
  async cancelPublishFlow(): Promise<void> {
    try {
      this.setPublishState('cancelled');
      
      // 清理自动生成的结束节点
      await this.endNodeGenerator.cleanupAutoGeneratedNodes();
      
      this.eventBus.emit('publish:flow:cancelled');
      
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'PublishFlowManager.cancelPublishFlow',
        severity: 'medium'
      });
    }
  }

  /**
   * 获取校验管理器
   */
  getValidationManager(): ValidationManager {
    return this.validationManager;
  }

  /**
   * 获取发布进度信息
   */
  getPublishProgress(): any {
    const totalSteps = 5; // 校验、循环检测、结束节点生成、配置生成、发布完成
    let currentStep = 0;
    
    switch (this.publishState) {
      case 'validating':
        currentStep = 1;
        break;
      case 'detecting_cycles':
        currentStep = 2;
        break;
      case 'generating_end_nodes':
        currentStep = 3;
        break;
      case 'generating_config':
        currentStep = 4;
        break;
      case 'completed':
        currentStep = 5;
        break;
      default:
        currentStep = 0;
    }
    
    return {
      currentStep,
      totalSteps,
      percentage: Math.round((currentStep / totalSteps) * 100),
      state: this.publishState,
      timestamp: Date.now()
    };
  }

  /**
   * 获取结束节点生成器
   */
  getEndNodeGenerator(): EndNodeAutoGenerator {
    return this.endNodeGenerator;
  }

  /**
   * 获取循环检测器
   */
  getCycleDetector(): CycleDetector {
    return this.cycleDetector;
  }

  /**
   * 获取分支处理器
   */
  getBranchProcessor(): BranchLineProcessor {
    return this.branchProcessor;
  }

  /**
   * 获取删除级联处理器
   */
  getDeletionHandler(): DeletionCascadeHandler {
    return this.deletionHandler;
  }

  /**
   * 处理所有决策节点的分支
   */
  private async processBranchesForAllDecisionNodes(): Promise<any> {
    try {
      const nodes = this.canvas.getNodes();
      const decisionNodes = nodes.filter(node => {
        const nodeData = node.getData();
        return nodeData?.nodeType === 'DECISION_NODE';
      });

      const results = [];
      for (const decisionNode of decisionNodes) {
        const branches = await this.branchProcessor.getBranchesForDecisionNode(decisionNode.id);
        
        if (Array.isArray(branches)) {
          for (const branch of branches) {
            if (!branch.isAttached) {
              const processResult = await this.branchProcessor.processUnattachedBranch(branch, decisionNode.id);
              results.push(processResult);
            }
          }
        }
      }

      return {
        success: true,
        processedBranches: results.length,
        results
      };
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'PublishFlowManager.processBranchesForAllDecisionNodes',
        severity: 'medium'
      });
      
      return {
        success: false,
        error: (error as Error).message,
        processedBranches: 0,
        results: []
      };
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.eventBus.off('publish:flow:start', this.handlePublishFlowStart.bind(this));
    this.eventBus.off('publish:flow:cancel', this.handlePublishFlowCancel.bind(this));
    this.eventBus.off('publish:validation:failed', this.handleValidationFailed.bind(this));
    this.eventBus.off('publish:error', this.handlePublishError.bind(this));
  }
}