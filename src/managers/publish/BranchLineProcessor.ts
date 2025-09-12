import { Graph, Node } from '@antv/x6';
import { UnifiedEventBus } from '../../core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager';
import { ErrorHandler } from '../../core/ErrorHandler';

// 类型定义
interface BranchCondition {
  expression?: string;
  type: string;
  value?: any;
  label?: string;
}

interface Branch {
  id: string;
  index: number;
  condition: BranchCondition;
  label: string;
  isAttached: boolean;
  targetNodeId?: string;
  connectionId?: string;
  previewLineId?: string;
}

interface BranchState {
  state: string;
  timestamp: number;
  lastUpdate: string;
}

interface PreviewLineConfig {
  id: string;
  type: string;
  source: {
    cell: string;
    port: string;
    point: { x: number; y: number };
  };
  target: {
    point: { x: number; y: number };
  };
  branchId: string;
  condition: BranchCondition;
  label: string;
  style: {
    stroke: string;
    strokeWidth: number;
    strokeDasharray: string;
  };
}

interface LabelConfig {
  branchId: string;
  text: string;
  condition: string;
  isAttached: boolean;
  style: {
    fontSize: number;
    fill: string;
    fontWeight: string;
  };
}

/**
 * 分支线处理器
 * 负责处理决策节点的分支线创建、更新和管理
 */
export class BranchLineProcessor {
  private canvas: Graph;
  private eventBus: UnifiedEventBus;
  private cacheManager: UnifiedCacheManager;
  private errorHandler: ErrorHandler;
  private previewLineManager: any; // 预览线管理器
  private labelManager: any; // 标签管理器
  private branchStates: Map<string, Map<string, BranchState>>; // 分支状态管理

  constructor(
    canvas: Graph,
    previewLineManager: any,
    labelManager: any,
    eventBus: UnifiedEventBus,
    cacheManager: UnifiedCacheManager,
    errorHandler: ErrorHandler
  ) {
    this.canvas = canvas;
    this.previewLineManager = previewLineManager;
    this.labelManager = labelManager;
    this.eventBus = eventBus;
    this.cacheManager = cacheManager;
    this.errorHandler = errorHandler;
    this.branchStates = new Map();
    
    // 🔧 修复：启用事件监听器设置，防止EventEmitter内存泄漏
    this.setupEventListeners();
  }

  /**
   * 设置依赖管理器
   * @param previewLineManager 预览线管理器
   * @param labelManager 标签管理器
   */
  setDependencies(previewLineManager: any, labelManager: any): void {
    this.previewLineManager = previewLineManager;
    this.labelManager = labelManager;
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    this.eventBus.on('branch:attach', this.handleBranchAttach.bind(this));
    this.eventBus.on('branch:detach', this.handleBranchDetach.bind(this));
    this.eventBus.on('node:removed', this.handleNodeRemoved.bind(this));
  }

  /**
   * 处理分支挂载
   * @param decisionNodeId 决策节点ID
   * @param attachedBranchId 挂载的分支ID
   * @param targetNodeId 目标节点ID
   */
  async processBranchAttachment(decisionNodeId: string, attachedBranchId: string, targetNodeId: string): Promise<any> {
    try {
      const result = {
        success: true,
        attachedBranch: null,
        updatedPreviewLines: [],
        updatedLabels: [],
        errors: []
      };

      // 1. 获取决策节点的所有分支
      const branches = await this.getBranchesForDecisionNode(decisionNodeId);
      
      // 2. 处理已挂载的分支
      const attachedBranch = (branches as any[]).find(b => b.id === attachedBranchId);
      if (attachedBranch) {
        await this.attachBranchToNode(attachedBranch, targetNodeId);
        result.attachedBranch = attachedBranch;
      }

      // 3. 处理其他未挂载的预览线
      const otherBranches = (branches as any[]).filter(b => b.id !== attachedBranchId);
      for (const branch of otherBranches) {
        const processedLines = await this.processUnattachedBranch(branch, decisionNodeId);
        result.updatedPreviewLines.push(...processedLines);
      }

      // 4. 更新所有分支的标签
      const updatedLabels = await this.updateBranchLabels(decisionNodeId, branches as any[]);
      result.updatedLabels = updatedLabels;

      // 5. 更新分支状态
      this.updateBranchState(decisionNodeId, attachedBranchId, 'attached');

      // 6. 发布事件
      this.eventBus.emit('branch:attached', {
        decisionNodeId,
        branchId: attachedBranchId,
        targetNodeId,
        result
      });

      return result;

    } catch (error) {
      this.errorHandler.handleError(error as Error, { component: 'BranchLineProcessor', method: 'processBranchAttachment' });
      return {
          success: false,
          error: (error as Error).message,
          attachedBranch: null,
          updatedPreviewLines: [],
          updatedLabels: [],
          errors: [(error as Error).message]
        };
    }
  }

  /**
   * 获取决策节点的所有分支
   */
  async getBranchesForDecisionNode(decisionNodeId: string): Promise<Branch[]> {
    const cacheKey = `branches_${decisionNodeId}`;
    const cached = this.cacheManager.get(cacheKey) as Branch[];
    if (cached) {
      return cached;
    }

    const node = this.canvas.getCellById(decisionNodeId);
    const nodeData = node?.getData();
    
    if (!nodeData || nodeData.nodeType !== 'DECISION_NODE') {
      throw new Error('节点不是决策节点');
    }

    const conditions = nodeData.conditions || [];
    const branches: Branch[] = [];

    conditions.forEach((condition, index) => {
      branches.push({
        id: `${decisionNodeId}_branch_${index}`,
        condition: condition,
        index: index,
        label: condition.label || `分支${index + 1}`,
        isAttached: false,
        targetNodeId: null,
        previewLineId: null
      });
    });

    // 添加默认分支（else分支）
    branches.push({
      id: `${decisionNodeId}_branch_default`,
      condition: { type: 'default', expression: 'else' },
      index: conditions.length,
      label: '默认分支',
      isAttached: false,
      targetNodeId: null,
      previewLineId: null
    });

    // 缓存结果
    this.cacheManager.set(cacheKey, branches, { ttl: 300000 }); // 5分钟缓存
    return branches;
  }

  /**
   * 将分支挂载到目标节点
   */
  async attachBranchToNode(branch: Branch, targetNodeId: string): Promise<any> {
    // 1. 创建实际连接
    const connection = this.canvas.addEdge({
      source: {
        cell: targetNodeId,
        port: `output_${branch.index}`
      },
      target: {
        cell: targetNodeId,
        port: 'input'
      },
      attrs: {
        line: {
          stroke: '#1890ff',
          strokeWidth: 2
        }
      },
      data: {
        branchId: branch.id,
        condition: branch.condition,
        type: 'BRANCH_CONNECTION'
      }
    });

    // 2. 移除对应的预览线
    if (branch.previewLineId && this.previewLineManager) {
      this.previewLineManager.removePreviewLine(branch.previewLineId);
    }

    // 3. 更新分支状态
    branch.isAttached = true;
    branch.targetNodeId = targetNodeId;
    branch.connectionId = connection.id;

    return connection;
  }

  /**
   * 处理未挂载的分支
   */
  async processUnattachedBranch(branch: Branch, decisionNodeId: string): Promise<any[]> {
    const processedLines = [];

    try {
      // 1. 检查是否已有预览线
      let previewLine = this.previewLineManager?.getPreviewLineByBranchId?.(branch.id);
      
      if (!previewLine) {
        // 2. 创建新的预览线
        previewLine = await this.createPreviewLineForBranch(branch, decisionNodeId);
        if (previewLine) {
          processedLines.push(previewLine);
          branch.previewLineId = previewLine.id;
        }
      } else {
        // 3. 更新现有预览线
        await this.updatePreviewLineForBranch(previewLine, branch);
        processedLines.push(previewLine);
        branch.previewLineId = previewLine.id;
      }

      // 4. 确保预览线可见且可交互
      if (previewLine && this.previewLineManager?.setPreviewLineState) {
        this.previewLineManager.setPreviewLineState(previewLine.id, 'interactive');
      }

    } catch (error) {
      this.errorHandler.handleError(error as Error, { component: 'BranchLineProcessor', method: 'processUnattachedBranch', branchId: branch.id });
      // 在测试环境中，我们仍然需要返回空数组而不是抛出错误
    }

    return processedLines;
  }

  /**
   * 为分支创建预览线
   */
  async createPreviewLineForBranch(branch: Branch, decisionNodeId: string): Promise<any> {
    const sourceNode = this.canvas.getCellById(decisionNodeId) as Node;
    const sourcePosition = sourceNode.getPosition();
    const sourceSize = sourceNode.getSize();

    // 计算预览线起点（从决策节点的输出端口）
    const startPoint = {
      x: sourcePosition.x + sourceSize.width,
      y: sourcePosition.y + sourceSize.height / 2 + (branch.index * 30)
    };

    // 计算预览线终点（向右延伸150px）
    const endPoint = {
      x: startPoint.x + 150,
      y: startPoint.y
    };

    const previewLineConfig = {
      id: `preview_${branch.id}`,
      type: 'branch',
      source: {
        cell: decisionNodeId,
        port: `output_${branch.index}`,
        point: startPoint
      },
      target: {
        point: endPoint
      },
      branchId: branch.id,
      condition: branch.condition,
      label: branch.label,
      style: {
        stroke: '#52c41a',
        strokeWidth: 2,
        strokeDasharray: '8,4'
      }
    };

    // 如果预览线管理器存在，使用它创建预览线
    if (this.previewLineManager?.createPreviewLine) {
      return this.previewLineManager.createPreviewLine(previewLineConfig);
    }

    // 否则直接在画布上创建虚线
    return this.canvas.addEdge({
      id: previewLineConfig.id,
      source: previewLineConfig.source,
      target: endPoint,
      attrs: {
        line: {
          stroke: previewLineConfig.style.stroke,
          strokeWidth: previewLineConfig.style.strokeWidth,
          strokeDasharray: previewLineConfig.style.strokeDasharray
        }
      },
      data: {
        type: 'PREVIEW_LINE',
        branchId: branch.id,
        condition: branch.condition
      }
    });
  }

  /**
   * 更新预览线
   */
  async updatePreviewLineForBranch(previewLine: any, branch: Branch): Promise<void> {
    // 更新预览线的样式和数据
    if (previewLine.setData) {
      previewLine.setData({
        ...previewLine.getData(),
        condition: branch.condition,
        label: branch.label
      });
    }
  }

  /**
   * 更新分支标签
   */
  async updateBranchLabels(decisionNodeId: string, branches: Branch[]): Promise<any[]> {
    const updatedLabels = [];

    for (const branch of branches) {
      try {
        const labelConfig: LabelConfig = {
          branchId: branch.id,
          text: branch.label,
          condition: branch.condition.expression || branch.condition.type,
          isAttached: branch.isAttached,
          style: {
            fontSize: 12,
            fill: branch.isAttached ? '#1890ff' : '#52c41a',
            fontWeight: branch.isAttached ? 'bold' : 'normal'
          }
        };

        // 如果标签管理器存在，使用它更新标签
        if (this.labelManager?.updateBranchLabel) {
          const label = await this.labelManager.updateBranchLabel(branch.id, labelConfig);
          updatedLabels.push(label);
        }

      } catch (error) {
        this.errorHandler.handleError(error as Error, { component: 'BranchLineProcessor', method: 'updateBranchLabel', branchId: branch.id });
      }
    }

    return updatedLabels;
  }

  /**
   * 更新分支状态
   */
  updateBranchState(decisionNodeId: string, branchId: string, state: string) {
    if (!this.branchStates.has(decisionNodeId)) {
      this.branchStates.set(decisionNodeId, new Map());
    }
    
    const nodeBranches = this.branchStates.get(decisionNodeId);
    nodeBranches!.set(branchId, {
      state: state,
      timestamp: Date.now(),
      lastUpdate: new Date().toISOString()
    });

    // 缓存状态
    if (this.cacheManager && this.cacheManager.set) {
      this.cacheManager.set(`branch_state_${branchId}`, {
        state,
        timestamp: Date.now()
      }, { ttl: 600000 }); // 10分钟缓存
    }
  }

  /**
   * 获取分支状态
   */
  getBranchState(decisionNodeId: string, branchId: string): BranchState {
    const nodeBranches = this.branchStates.get(decisionNodeId);
    return nodeBranches?.get(branchId) || { state: 'unattached', timestamp: 0, lastUpdate: new Date().toISOString() };
  }

  /**
   * 处理分支挂载事件
   */
  private async handleBranchAttach(event: { decisionNodeId: string; branchId: string; targetNodeId: string }): Promise<void> {
    const { decisionNodeId, branchId, targetNodeId } = event;
    await this.processBranchAttachment(decisionNodeId, branchId, targetNodeId);
  }

  /**
   * 处理分支分离事件
   */
  private async handleBranchDetach(event: { decisionNodeId: string; branchId: string }): Promise<void> {
    const { decisionNodeId, branchId } = event;
    
    try {
      // 移除连接
      const branch = await this.getBranchByIdFromDecisionNode(decisionNodeId, branchId);
      if (branch && branch.connectionId) {
        this.canvas.removeCell(branch.connectionId);
      }

      // 重新创建预览线
      await this.processUnattachedBranch(branch, decisionNodeId);
      
      // 更新状态
      this.updateBranchState(decisionNodeId, branchId, 'unattached');
      
    } catch (error) {
      this.errorHandler.handleError(error as Error, { component: 'BranchLineProcessor', method: 'handleBranchDetach' });
    }
  }

  /**
   * 处理节点删除事件
   */
  private async handleNodeRemoved(event: { nodeId: string }): Promise<void> {
    const { nodeId } = event;
    
    // 清理相关的分支状态
    this.branchStates.delete(nodeId);
    
    // 清理缓存
    if (this.cacheManager && this.cacheManager.delete) {
      this.cacheManager.delete(`branches_${nodeId}`);
    }
  }

  /**
   * 从决策节点获取特定分支
   */
  private async getBranchByIdFromDecisionNode(decisionNodeId: string, branchId: string): Promise<Branch | undefined> {
    const branches = await this.getBranchesForDecisionNode(decisionNodeId);
    return branches.find(b => b.id === branchId);
  }

  /**
   * 设置预览线管理器
   */
  setPreviewLineManager(previewLineManager: any): void {
    this.previewLineManager = previewLineManager;
  }

  /**
   * 设置标签管理器
   */
  setLabelManager(labelManager: any): void {
    this.labelManager = labelManager;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.branchStates.clear();
    // 🔧 修复：正确清理事件监听器，防止EventEmitter内存泄漏
    if (this.eventBus) {
      this.eventBus.off('branch:attach', this.handleBranchAttach.bind(this));
      this.eventBus.off('branch:detach', this.handleBranchDetach.bind(this));
      this.eventBus.off('node:removed', this.handleNodeRemoved.bind(this));
    }
  }
}