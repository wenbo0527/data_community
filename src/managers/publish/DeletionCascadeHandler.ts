import { Graph, Node, Edge } from '@antv/x6';
import { UnifiedEventBus } from '../../core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager';
import { ErrorHandler } from '../../core/ErrorHandler';

/**
 * 删除级联处理器
 * 负责处理节点删除时的级联清理操作
 */
export class DeletionCascadeHandler {
  private canvas: Graph;
  private previewLineManager: any;
  private labelManager: any;
  private layoutEngine: any;
  private eventBus: UnifiedEventBus;
  private cacheManager: UnifiedCacheManager;
  private errorHandler: ErrorHandler;
  private isProcessing: boolean = false;
  private deletionQueue: Set<string> = new Set();
  private orphanNodes: Set<string> = new Set();

  constructor(
    canvas: Graph,
    previewLineManager: any,
    labelManager: any,
    layoutEngine: any,
    eventBus: UnifiedEventBus,
    cacheManager: UnifiedCacheManager,
    errorHandler: ErrorHandler
  ) {
    this.canvas = canvas;
    this.previewLineManager = previewLineManager;
    this.labelManager = labelManager;
    this.layoutEngine = layoutEngine;
    this.eventBus = eventBus;
    this.cacheManager = cacheManager;
    this.errorHandler = errorHandler;
    
    this.setupEventListeners();
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    try {
      this.eventBus.on('node:deleted', this.handleNodeDeleted.bind(this));
      this.eventBus.on('edge:deleted', this.handleEdgeDeleted.bind(this));
      this.eventBus.on('cascade:cleanup', this.handleCascadeCleanup.bind(this));
      this.eventBus.on('orphan:check', this.handleOrphanCheck.bind(this));
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.setupEventListeners',
        severity: 'medium'
      });
    }
  }

  /**
   * 处理节点删除事件
   */
  private async handleNodeDeleted(event: { nodeId: string; nodeType?: string }): Promise<void> {
    if (this.isProcessing) {
      this.deletionQueue.add(event.nodeId);
      return;
    }

    try {
      this.isProcessing = true;
      await this.processCascadeDeletion(event.nodeId, event.nodeType);
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.handleNodeDeleted',
        nodeId: event.nodeId,
        severity: 'high'
      });
    } finally {
      this.isProcessing = false;
      await this.processQueuedDeletions();
    }
  }

  /**
   * 处理边删除事件
   */
  private async handleEdgeDeleted(event: { edgeId: string; sourceId?: string; targetId?: string }): Promise<void> {
    try {
      // 检查是否产生了孤立节点
      if (event.targetId) {
        await this.checkForOrphanNode(event.targetId);
      }
      
      // 清理相关的预览线和标签
      await this.cleanupRelatedElements(event.edgeId);
      
      this.eventBus.emit('cascade:edge-cleaned', {
        edgeId: event.edgeId,
        sourceId: event.sourceId,
        targetId: event.targetId
      });
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.handleEdgeDeleted',
        edgeId: event.edgeId,
        severity: 'medium'
      });
    }
  }

  /**
   * 处理级联清理事件
   */
  private async handleCascadeCleanup(event: { nodeIds: string[]; force?: boolean }): Promise<void> {
    try {
      for (const nodeId of event.nodeIds) {
        await this.processCascadeDeletion(nodeId, undefined, event.force);
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.handleCascadeCleanup',
        nodeIds: event.nodeIds,
        severity: 'high'
      });
    }
  }

  /**
   * 处理孤立节点检查事件
   */
  private async handleOrphanCheck(event: { nodeId?: string }): Promise<void> {
    try {
      if (event.nodeId) {
        await this.checkForOrphanNode(event.nodeId);
      } else {
        await this.checkAllOrphanNodes();
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.handleOrphanCheck',
        nodeId: event.nodeId,
        severity: 'medium'
      });
    }
  }

  /**
   * 处理级联删除
   */
  public async processCascadeDeletion(
    nodeId: string, 
    nodeType?: string, 
    force: boolean = false
  ): Promise<void> {
    try {
      const node = this.canvas.getCellById(nodeId) as Node;
      
      // 获取节点类型
      const actualNodeType = nodeType || node?.getData()?.type || 'unknown';
      
      // 如果节点存在，清理相关连接
      if (node) {
        await this.cleanupNodeConnections(nodeId);
      }
      
      // 清理相关的预览线和标签（无论节点是否存在都要清理）
      await this.cleanupNodeRelatedElements(nodeId, actualNodeType);
      
      // 清理缓存数据（无论节点是否存在都要清理）
      await this.cleanupNodeCache(nodeId);
      
      // 如果节点存在或强制删除，检查下游节点是否变成孤立节点
      if (node || force) {
        await this.checkDownstreamOrphans(nodeId);
      }
      
      this.eventBus.emit('cascade:node-cleaned', {
        nodeId,
        nodeType: actualNodeType,
        timestamp: Date.now()
      });
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.processCascadeDeletion',
        nodeId,
        nodeType,
        severity: 'high'
      });
    }
  }

  /**
   * 清理节点连接
   */
  private async cleanupNodeConnections(nodeId: string): Promise<void> {
    try {
      const node = this.canvas.getCellById(nodeId) as Node;
      if (!node) return;

      // 获取所有相关的边
      const incomingEdges = this.canvas.getIncomingEdges(node) || [];
      const outgoingEdges = this.canvas.getOutgoingEdges(node) || [];
      
      // 删除所有相关的边
      const allEdges = [...incomingEdges, ...outgoingEdges];
      for (const edge of allEdges) {
        if (edge && this.canvas.getCellById(edge.id)) {
          this.canvas.removeCell(edge);
          this.eventBus.emit('edge:deleted', {
            edgeId: edge.id,
            sourceId: edge.getSourceCellId(),
            targetId: edge.getTargetCellId()
          });
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.cleanupNodeConnections',
        nodeId,
        severity: 'medium'
      });
    }
  }

  /**
   * 清理节点相关元素
   */
  private async cleanupNodeRelatedElements(nodeId: string, nodeType: string): Promise<void> {
    try {
      // 清理预览线
      await this.cleanupPreviewLines(nodeId);
      
      // 清理分支标签（如果是决策节点）
      if (nodeType === 'DECISION' || nodeType === 'PROCESSING') {
        await this.cleanupBranchLabels(nodeId);
      }
      
      // 清理结束节点（如果是自动生成的）
      if (nodeType === 'END' && this.isAutoGeneratedEndNode(nodeId)) {
        await this.cleanupAutoEndNode(nodeId);
      }
      
      // 清理节点配置缓存
      this.cacheManager.delete(`node_config_${nodeId}`);
      this.cacheManager.delete(`node_validation_${nodeId}`);
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.cleanupNodeRelatedElements',
        nodeId,
        nodeType,
        severity: 'medium'
      });
    }
  }

  /**
   * 清理预览线
   */
  private async cleanupPreviewLines(nodeId: string): Promise<void> {
    try {
      // 清理以该节点为源的预览线
      const sourcePreviewLines = (this.cacheManager.get(`preview_lines_source_${nodeId}`) || []) as string[];
      for (const lineId of sourcePreviewLines) {
        this.eventBus.emit('preview:remove', { lineId });
      }
      
      // 清理以该节点为目标的预览线
      const targetPreviewLines = (this.cacheManager.get(`preview_lines_target_${nodeId}`) || []) as string[];
      for (const lineId of targetPreviewLines) {
        this.eventBus.emit('preview:remove', { lineId });
      }
      
      // 清理缓存
      this.cacheManager.delete(`preview_lines_source_${nodeId}`);
      this.cacheManager.delete(`preview_lines_target_${nodeId}`);
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.cleanupPreviewLines',
        nodeId,
        severity: 'low'
      });
    }
  }

  /**
   * 清理分支标签
   */
  private async cleanupBranchLabels(nodeId: string): Promise<void> {
    try {
      // 获取该节点的所有分支
      const branches = this.cacheManager.get(`node_branches_${nodeId}`) || [];
      
      for (const branch of branches) {
        const branchId = `${nodeId}_branch_${branch.index}`;
        this.eventBus.emit('label:remove', { branchId });
      }
      
      // 清理分支缓存
      this.cacheManager.delete(`node_branches_${nodeId}`);
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.cleanupBranchLabels',
        nodeId,
        severity: 'low'
      });
    }
  }

  /**
   * 清理自动生成的结束节点
   */
  private async cleanupAutoEndNode(nodeId: string): Promise<void> {
    try {
      // 检查是否还有其他预览线指向该结束节点
      const incomingPreviewLines = this.cacheManager.get(`preview_lines_target_${nodeId}`) || [];
      
      if (incomingPreviewLines.length === 0) {
        // 如果没有其他预览线，可以安全删除
        this.cacheManager.delete(`auto_end_node_${nodeId}`);
        this.eventBus.emit('end-node:auto-removed', { nodeId });
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.cleanupAutoEndNode',
        nodeId,
        severity: 'low'
      });
    }
  }

  /**
   * 清理节点缓存
   */
  private async cleanupNodeCache(nodeId: string): Promise<void> {
    try {
      const cacheKeys = [
        `node_${nodeId}`,
        `node_config_${nodeId}`,
        `node_validation_${nodeId}`,
        `node_connections_${nodeId}`,
        `node_branches_${nodeId}`,
        `node_position_${nodeId}`,
        `node_size_${nodeId}`
      ];
      
      for (const key of cacheKeys) {
        this.cacheManager.delete(key);
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.cleanupNodeCache',
        nodeId,
        severity: 'low'
      });
    }
  }

  /**
   * 检查下游孤立节点
   */
  private async checkDownstreamOrphans(deletedNodeId: string): Promise<void> {
    try {
      // 获取所有节点
      const allNodes = this.canvas.getNodes();
      
      for (const node of allNodes) {
        const nodeId = node.id;
        if (nodeId === deletedNodeId) continue;
        
        await this.checkForOrphanNode(nodeId);
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.checkDownstreamOrphans',
        deletedNodeId,
        severity: 'medium'
      });
    }
  }

  /**
   * 检查单个节点是否为孤立节点
   */
  private async checkForOrphanNode(nodeId: string): Promise<void> {
    try {
      const node = this.canvas.getCellById(nodeId) as Node;
      if (!node) return;
      
      const nodeData = node.getData() || {};
      const nodeType = nodeData.type;
      
      // INPUT节点不算孤立节点
      if (nodeType === 'INPUT') {
        this.orphanNodes.delete(nodeId);
        return;
      }
      
      // 检查是否有输入连接
      const incomingEdges = this.canvas.getIncomingEdges(node) || [];
      const hasIncomingConnections = incomingEdges.length > 0;
      
      // 检查是否有预览线连接
      const incomingPreviewLines = this.cacheManager.get(`preview_lines_target_${nodeId}`) || [];
      const hasIncomingPreviewLines = incomingPreviewLines.length > 0;
      
      if (!hasIncomingConnections && !hasIncomingPreviewLines) {
        // 标记为孤立节点
        this.orphanNodes.add(nodeId);
        this.eventBus.emit('orphan:detected', {
          nodeId,
          nodeType,
          timestamp: Date.now()
        });
      } else {
        // 移除孤立节点标记
        this.orphanNodes.delete(nodeId);
        this.eventBus.emit('orphan:resolved', {
          nodeId,
          nodeType,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.checkForOrphanNode',
        nodeId,
        severity: 'medium'
      });
    }
  }

  /**
   * 检查所有孤立节点
   */
  private async checkAllOrphanNodes(): Promise<void> {
    try {
      const allNodes = this.canvas.getNodes();
      
      for (const node of allNodes) {
        await this.checkForOrphanNode(node.id);
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.checkAllOrphanNodes',
        severity: 'medium'
      });
    }
  }

  /**
   * 清理相关元素
   */
  private async cleanupRelatedElements(edgeId: string): Promise<void> {
    try {
      // 清理边相关的缓存
      this.cacheManager.delete(`edge_${edgeId}`);
      this.cacheManager.delete(`edge_validation_${edgeId}`);
      
      // 清理相关的预览线标记
      const previewLineId = this.cacheManager.get(`preview_line_for_edge_${edgeId}`);
      if (previewLineId) {
        this.eventBus.emit('preview:remove', { lineId: previewLineId });
        this.cacheManager.delete(`preview_line_for_edge_${edgeId}`);
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.cleanupRelatedElements',
        edgeId,
        severity: 'low'
      });
    }
  }

  /**
   * 处理队列中的删除操作
   */
  private async processQueuedDeletions(): Promise<void> {
    if (this.deletionQueue.size === 0) return;
    
    try {
      const queuedNodeIds = Array.from(this.deletionQueue);
      this.deletionQueue.clear();
      
      for (const nodeId of queuedNodeIds) {
        await this.processCascadeDeletion(nodeId);
      }
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.processQueuedDeletions',
        severity: 'high'
      });
    }
  }

  /**
   * 检查是否为自动生成的结束节点
   */
  private isAutoGeneratedEndNode(nodeId: string): boolean {
    return this.cacheManager.get(`auto_end_node_${nodeId}`) !== null;
  }

  /**
   * 获取孤立节点列表
   */
  public getOrphanNodes(): string[] {
    return Array.from(this.orphanNodes);
  }

  /**
   * 强制清理所有孤立节点
   */
  public async cleanupAllOrphanNodes(): Promise<void> {
    try {
      const orphanNodeIds = Array.from(this.orphanNodes);
      
      for (const nodeId of orphanNodeIds) {
        const node = this.canvas.getCellById(nodeId) as Node;
        if (node) {
          this.canvas.removeCell(node);
          this.eventBus.emit('node:deleted', { nodeId, nodeType: node.getData()?.type });
        }
      }
      
      this.orphanNodes.clear();
      
      this.eventBus.emit('orphan:all-cleaned', {
        cleanedCount: orphanNodeIds.length,
        timestamp: Date.now()
      });
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.cleanupAllOrphanNodes',
        severity: 'high'
      });
    }
  }

  /**
   * 获取处理状态
   */
  public isProcessingDeletion(): boolean {
    return this.isProcessing;
  }

  /**
   * 获取删除队列大小
   */
  public getDeletionQueueSize(): number {
    return this.deletionQueue.size;
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    try {
      this.eventBus.off('node:deleted', this.handleNodeDeleted.bind(this));
      this.eventBus.off('edge:deleted', this.handleEdgeDeleted.bind(this));
      this.eventBus.off('cascade:cleanup', this.handleCascadeCleanup.bind(this));
      this.eventBus.off('orphan:check', this.handleOrphanCheck.bind(this));
      
      this.deletionQueue.clear();
      this.orphanNodes.clear();
      this.isProcessing = false;
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'DeletionCascadeHandler.dispose',
        severity: 'low'
      });
    }
  }
}