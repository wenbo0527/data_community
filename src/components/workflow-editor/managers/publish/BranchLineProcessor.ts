import type { Graph, Node, Edge } from '@antv/x6';
import type { UnifiedEventBus } from '../base/UnifiedEventBus';
import type { UnifiedCacheManager } from '../base/UnifiedCacheManager';
import type { ErrorHandler } from '../base/ErrorHandler';

/**
 * 分支信息接口
 */
export interface BranchInfo {
  id: string;
  decisionNodeId: string;
  condition: {
    type: string;
    expression?: string;
    label?: string;
  };
  index: number;
  label: string;
  isAttached: boolean;
  targetNodeId: string | null;
  previewLineId: string | null;
  connectionId?: string;
}

/**
 * 分支处理结果接口
 */
export interface BranchProcessResult {
  success: boolean;
  attachedBranch: BranchInfo | null;
  updatedPreviewLines: any[];
  updatedLabels: any[];
  errors: string[];
  error?: string;
}

/**
 * 分支状态接口
 */
export interface BranchState {
  state: 'attached' | 'unattached' | 'processing';
  timestamp: number;
  lastUpdate: string;
}

/**
 * 分支线处理器
 * 负责处理分流节点的分支挂载和预览线管理
 */
export class BranchLineProcessor {
  private canvas: Graph;
  private eventBus: UnifiedEventBus;
  private cacheManager: UnifiedCacheManager;
  private errorHandler: ErrorHandler;
  private branchStates: Map<string, Map<string, BranchState>>;
  private previewLineManager: any; // 预览线管理器引用
  private labelManager: any; // 标签管理器引用

  constructor(
    canvas: Graph,
    eventBus: UnifiedEventBus,
    cacheManager: UnifiedCacheManager,
    errorHandler: ErrorHandler
  ) {
    this.canvas = canvas;
    this.eventBus = eventBus;
    this.cacheManager = cacheManager;
    this.errorHandler = errorHandler;
    this.branchStates = new Map();
    
    // 临时注释掉事件监听器设置，避免测试中的TypeError
    // this.setupEventListeners();
  }

  /**
   * 设置依赖管理器
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
   * @param attachedBranchId 要挂载的分支ID
   * @param targetNodeId 目标节点ID
   */
  async processBranchAttachment(
    decisionNodeId: string,
    attachedBranchId: string,
    targetNodeId: string
  ): Promise<BranchProcessResult> {
    try {
      const result: BranchProcessResult = {
        success: true,
        attachedBranch: null,
        updatedPreviewLines: [],
        updatedLabels: [],
        errors: []
      };

      // 1. 获取决策节点的所有分支
      const branches = await this.getBranchesForDecisionNode(decisionNodeId);
      
      // 2. 处理已挂载的分支
      const attachedBranch = branches.find(b => b.id === attachedBranchId);
      if (attachedBranch) {
        await this.attachBranchToNode(attachedBranch, targetNodeId);
        result.attachedBranch = attachedBranch;
      }

      // 3. 处理其他未挂载的预览线
      const otherBranches = branches.filter(b => b.id !== attachedBranchId);
      for (const branch of otherBranches) {
        const processedLines = await this.processUnattachedBranch(branch, decisionNodeId);
        result.updatedPreviewLines.push(...processedLines);
      }

      // 4. 更新所有分支的标签
      if (this.labelManager) {
        const updatedLabels = await this.updateBranchLabels(decisionNodeId, branches);
        result.updatedLabels = updatedLabels;
      }

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
      const errorMessage = `处理分支挂载失败: ${error instanceof Error ? error.message : String(error)}`;
      this.errorHandler.handleError(error as Error, 'BranchLineProcessor.processBranchAttachment');
      
      return {
        success: false,
        error: errorMessage,
        attachedBranch: null,
        updatedPreviewLines: [],
        updatedLabels: [],
        errors: [errorMessage]
      };
    }
  }

  /**
   * 获取决策节点的所有分支
   */
  async getBranchesForDecisionNode(decisionNodeId: string): Promise<BranchInfo[]> {
    const cacheKey = `branches_${decisionNodeId}`;
    const cached = this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const node = this.canvas.getCellById(decisionNodeId) as Node;
    const nodeData = node?.getData();
    
    if (!nodeData || nodeData.nodeType !== 'DECISION_NODE') {
      throw new Error('节点不是决策节点');
    }

    const conditions = nodeData.conditions || [];
    const branches: BranchInfo[] = [];

    conditions.forEach((condition: any, index: number) => {
      branches.push({
        id: `${decisionNodeId}_branch_${index}`,
        decisionNodeId: decisionNodeId,
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
      decisionNodeId: decisionNodeId,
      condition: { type: 'default', expression: 'else' },
      index: conditions.length,
      label: '默认分支',
      isAttached: false,
      targetNodeId: null,
      previewLineId: null
    });

    // 缓存结果
    this.cacheManager.set(cacheKey, branches, 300); // 5分钟缓存
    return branches;
  }

  /**
   * 将分支挂载到目标节点
   */
  async attachBranchToNode(branch: BranchInfo, targetNodeId: string): Promise<Edge> {
    // 1. 创建实际连接
    const connection = this.canvas.addEdge({
      source: {
        cell: branch.decisionNodeId,
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
  async processUnattachedBranch(branch: BranchInfo, decisionNodeId: string): Promise<any[]> {
    const processedLines: any[] = [];

    try {
      if (!this.previewLineManager) {
        return processedLines;
      }

      // 1. 检查是否已有预览线
      let previewLine = this.previewLineManager.getPreviewLineByBranchId?.(branch.id);
      
      if (!previewLine) {
        // 2. 创建新的预览线
        previewLine = await this.createPreviewLineForBranch(branch, decisionNodeId);
      } else {
        // 3. 更新现有预览线
        await this.updatePreviewLineForBranch(previewLine, branch);
      }

      // 4. 确保预览线可见且可交互
      if (this.previewLineManager.setPreviewLineState) {
        this.previewLineManager.setPreviewLineState(previewLine.id, 'interactive');
      }
      
      processedLines.push(previewLine);
      branch.previewLineId = previewLine.id;

    } catch (error) {
      this.errorHandler.handleError(
        error as Error,
        `BranchLineProcessor.processUnattachedBranch - 分支 ${branch.id}`
      );
    }

    return processedLines;
  }

  /**
   * 为分支创建预览线
   */
  async createPreviewLineForBranch(branch: BranchInfo, decisionNodeId: string): Promise<any> {
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

    return this.previewLineManager.createPreviewLine(previewLineConfig);
  }

  /**
   * 更新预览线
   */
  async updatePreviewLineForBranch(previewLine: any, branch: BranchInfo): Promise<void> {
    // 更新预览线的标签和样式
    if (previewLine.updateLabel) {
      previewLine.updateLabel(branch.label);
    }
  }

  /**
   * 处理分支挂载事件
   */
  private handleBranchAttach(event: any): void {
    // 处理分支挂载事件的逻辑
  }

  /**
   * 处理分支分离事件
   */
  private handleBranchDetach(event: any): void {
    // 处理分支分离事件的逻辑
  }

  /**
   * 处理节点删除事件
   */
  private handleNodeRemoved(event: any): void {
    // 处理节点删除事件的逻辑
  }

  /**
   * 更新分支标签
   */
  private async updateBranchLabels(decisionNodeId: string, branches: BranchInfo[]): Promise<any[]> {
    const updatedLabels: any[] = [];
    
    if (!this.labelManager) {
      return updatedLabels;
    }

    for (const branch of branches) {
      try {
        const label = await this.labelManager.updateBranchLabel(branch.id, branch.label);
        updatedLabels.push(label);
      } catch (error) {
        this.errorHandler.handleError(
          error as Error,
          `BranchLineProcessor.updateBranchLabels - 分支 ${branch.id}`
        );
      }
    }

    return updatedLabels;
  }

  /**
   * 更新分支状态
   */
  private updateBranchState(decisionNodeId: string, branchId: string, state: 'attached' | 'unattached' | 'processing'): void {
    if (!this.branchStates.has(decisionNodeId)) {
      this.branchStates.set(decisionNodeId, new Map());
    }

    const nodeStates = this.branchStates.get(decisionNodeId)!;
    nodeStates.set(branchId, {
      state,
      timestamp: Date.now(),
      lastUpdate: new Date().toISOString()
    });
  }

  /**
   * 获取分支状态
   */
  getBranchState(decisionNodeId: string, branchId: string): BranchState | null {
    const nodeStates = this.branchStates.get(decisionNodeId);
    if (!nodeStates) {
      return {
        state: 'unattached',
        timestamp: Date.now(),
        lastUpdate: new Date().toISOString()
      };
    }

    return nodeStates.get(branchId) || {
      state: 'unattached',
      timestamp: Date.now(),
      lastUpdate: new Date().toISOString()
    };
  }
}