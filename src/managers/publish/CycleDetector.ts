import type { Graph } from '@antv/x6';
import { UnifiedEventBus } from '@/core/UnifiedEventBus';
import { UnifiedCacheManager } from '@/core/UnifiedCacheManager';
import { ErrorHandler } from '@/core/ErrorHandler';

/**
 * 循环依赖检测器
 * 使用DFS算法检测和分析循环依赖
 */
export class CycleDetector {
  private canvas: Graph;
  private eventBus: UnifiedEventBus;
  private cacheManager: UnifiedCacheManager;
  private errorHandler: ErrorHandler;
  
  // 检测状态
  private visitedNodes: Set<string>;
  private recursionStack: Set<string>;
  private detectionResults: Map<string, {
    hasCycle: boolean;
    cyclePath: string[];
    timestamp: number;
  }>;

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
    
    this.visitedNodes = new Set();
    this.recursionStack = new Set();
    this.detectionResults = new Map();
  }

  /**
   * 检测整个画布的循环依赖
   */
  async detectCycles(): Promise<{
    hasCycles: boolean;
    cycles: Array<{
      nodes: string[];
      path: string[];
      severity: 'high' | 'medium' | 'low';
    }>;
    affectedNodes: string[];
  }> {
    try {
      this.eventBus.emit('cycle:detection:started');
      
      // 重置检测状态
      this.resetDetectionState();
      
      const nodes = this.canvas.getNodes();
      const cycles: Array<{
        nodes: string[];
        path: string[];
        severity: 'high' | 'medium' | 'low';
      }> = [];
      const affectedNodes = new Set<string>();
      
      // 对每个未访问的节点进行DFS检测
      for (const node of nodes) {
        if (!this.visitedNodes.has(node.id)) {
          const cycleResult = await this.dfsDetectCycle(node.id, []);
          
          if (cycleResult.hasCycle) {
            const cycle = {
              nodes: cycleResult.cyclePath,
              path: cycleResult.cyclePath,
              severity: this.calculateCycleSeverity(cycleResult.cyclePath)
            };
            
            cycles.push(cycle);
            
            // 记录受影响的节点
            cycleResult.cyclePath.forEach(nodeId => {
              affectedNodes.add(nodeId);
            });
          }
        }
      }
      
      const result = {
        hasCycles: cycles.length > 0,
        cycles,
        affectedNodes: Array.from(affectedNodes)
      };
      
      // 缓存检测结果
      this.cacheManager.set('cycle_detection_result', result, { ttl: 300000 }); // 5分钟缓存
      
      this.eventBus.emit('cycle:detection:completed', {
        cycleCount: cycles.length,
        affectedNodeCount: affectedNodes.size
      });
      
      return result;
      
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'CycleDetector.detectCycles',
        severity: 'high'
      });
      
      return {
        hasCycles: false,
        cycles: [],
        affectedNodes: []
      };
    }
  }

  /**
   * DFS算法检测单个节点的循环依赖
   */
  private async dfsDetectCycle(
    nodeId: string,
    currentPath: string[]
  ): Promise<{
    hasCycle: boolean;
    cyclePath: string[];
  }> {
    try {
      // 检查是否在递归栈中（发现循环）
      if (this.recursionStack.has(nodeId)) {
        const cycleStartIndex = currentPath.indexOf(nodeId);
        const cyclePath = cycleStartIndex >= 0 
          ? currentPath.slice(cycleStartIndex).concat([nodeId])
          : [nodeId];
        
        this.eventBus.emit('cycle:detected', {
          nodeId,
          cyclePath
        });
        
        return {
          hasCycle: true,
          cyclePath
        };
      }
      
      // 如果已经访问过，跳过
      if (this.visitedNodes.has(nodeId)) {
        return {
          hasCycle: false,
          cyclePath: []
        };
      }
      
      // 标记为已访问和在递归栈中
      this.visitedNodes.add(nodeId);
      this.recursionStack.add(nodeId);
      
      const newPath = [...currentPath, nodeId];
      
      // 获取当前节点的所有出边
      const outgoingEdges = this.getOutgoingEdges(nodeId);
      
      // 递归检查所有相邻节点
      for (const edge of outgoingEdges) {
        const targetNodeId = this.getTargetNodeId(edge);
        
        if (targetNodeId) {
          const result = await this.dfsDetectCycle(targetNodeId, newPath);
          
          if (result.hasCycle) {
            // 从递归栈中移除当前节点
            this.recursionStack.delete(nodeId);
            return result;
          }
        }
      }
      
      // 从递归栈中移除当前节点
      this.recursionStack.delete(nodeId);
      
      return {
        hasCycle: false,
        cyclePath: []
      };
      
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'CycleDetector.dfsDetectCycle',
        severity: 'medium'
      });
      
      // 确保从递归栈中移除节点
      this.recursionStack.delete(nodeId);
      
      return {
        hasCycle: false,
        cyclePath: []
      };
    }
  }

  /**
   * 获取节点的所有出边
   */
  private getOutgoingEdges(nodeId: string): any[] {
    try {
      const node = this.canvas.getCellById(nodeId);
      if (!node) {
        return [];
      }
      
      return this.canvas.getConnectedEdges(node, { outgoing: true }) || [];
      
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'CycleDetector.getOutgoingEdges',
        severity: 'low',
        nodeId
      });
      return [];
    }
  }

  /**
   * 获取边的目标节点ID
   */
  private getTargetNodeId(edge: any): string | null {
    try {
      if (edge.getTargetCellId) {
        return edge.getTargetCellId();
      }
      
      if (edge.target && edge.target.cell) {
        return edge.target.cell;
      }
      
      if (edge.getTarget) {
        const target = edge.getTarget();
        return target.cell || target.id;
      }
      
      return null;
      
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'CycleDetector.getTargetNodeId',
        severity: 'low'
      });
      return null;
    }
  }

  /**
   * 计算循环的严重程度
   */
  private calculateCycleSeverity(cyclePath: string[]): 'high' | 'medium' | 'low' {
    // 循环路径包含起始节点的重复，所以实际节点数量是 length - 1
    const actualCycleLength = cyclePath.length - 1;
    
    if (actualCycleLength <= 2) {
      return 'high'; // 直接循环，最严重
    } else if (actualCycleLength <= 4) {
      return 'medium'; // 中等长度循环
    } else {
      return 'low'; // 长循环，相对较轻
    }
  }

  /**
   * 分析循环依赖的影响
   */
  async analyzeCycleImpact(cycles: Array<{
    nodes: string[];
    path: string[];
    severity: 'high' | 'medium' | 'low';
  }>): Promise<{
    criticalNodes: string[];
    impactedFlows: string[];
    recommendations: Array<{
      type: 'break_cycle' | 'restructure' | 'warning';
      description: string;
      affectedNodes: string[];
    }>;
  }> {
    try {
      const criticalNodes = new Set<string>();
      const impactedFlows = new Set<string>();
      const recommendations: Array<{
        type: 'break_cycle' | 'restructure' | 'warning';
        description: string;
        affectedNodes: string[];
      }> = [];
      
      for (const cycle of cycles) {
        // 标记关键节点
        cycle.nodes.forEach(nodeId => {
          criticalNodes.add(nodeId);
        });
        
        // 分析影响的流程
        const flowIds = await this.getAffectedFlows(cycle.nodes);
        flowIds.forEach(flowId => {
          impactedFlows.add(flowId);
        });
        
        // 生成建议
        const recommendation = this.generateCycleRecommendation(cycle);
        recommendations.push(recommendation);
      }
      
      return {
        criticalNodes: Array.from(criticalNodes),
        impactedFlows: Array.from(impactedFlows),
        recommendations
      };
      
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'CycleDetector.analyzeCycleImpact',
        severity: 'medium'
      });
      
      return {
        criticalNodes: [],
        impactedFlows: [],
        recommendations: []
      };
    }
  }

  /**
   * 获取受影响的流程
   */
  private async getAffectedFlows(nodeIds: string[]): Promise<string[]> {
    try {
      const flows = new Set<string>();
      
      for (const nodeId of nodeIds) {
        const node = this.canvas.getCellById(nodeId);
        if (node && node.getData) {
          const nodeData = node.getData();
          if (nodeData.flowId) {
            flows.add(nodeData.flowId);
          }
        }
      }
      
      return Array.from(flows);
      
    } catch (error) {
      this.errorHandler.handleError(error, {
        context: 'CycleDetector.getAffectedFlows',
        severity: 'low'
      });
      return [];
    }
  }

  /**
   * 生成循环处理建议
   */
  private generateCycleRecommendation(cycle: {
    nodes: string[];
    path: string[];
    severity: 'high' | 'medium' | 'low';
  }): {
    type: 'break_cycle' | 'restructure' | 'warning';
    description: string;
    affectedNodes: string[];
  } {
    switch (cycle.severity) {
      case 'high':
        return {
          type: 'break_cycle',
          description: `检测到高风险循环依赖，建议断开节点 ${cycle.nodes[0]} 和 ${cycle.nodes[1]} 之间的连接`,
          affectedNodes: cycle.nodes
        };
      
      case 'medium':
        return {
          type: 'restructure',
          description: `检测到中等风险循环依赖，建议重新设计流程结构，涉及 ${cycle.nodes.length} 个节点`,
          affectedNodes: cycle.nodes
        };
      
      case 'low':
        return {
          type: 'warning',
          description: `检测到低风险循环依赖，请注意流程逻辑的合理性，涉及 ${cycle.nodes.length} 个节点`,
          affectedNodes: cycle.nodes
        };
      
      default:
        return {
          type: 'warning',
          description: '检测到未知类型的循环依赖',
          affectedNodes: cycle.nodes
        };
    }
  }

  /**
   * 重置检测状态
   */
  private resetDetectionState(): void {
    this.visitedNodes.clear();
    this.recursionStack.clear();
    this.detectionResults.clear();
  }

  /**
   * 获取缓存的检测结果
   */
  getCachedDetectionResult(): any {
    return this.cacheManager.get('cycle_detection_result');
  }

  /**
   * 清除检测缓存
   */
  clearDetectionCache(): void {
    this.cacheManager.delete('cycle_detection_result');
    this.resetDetectionState();
    
    this.eventBus.emit('cycle:cache:cleared');
  }

  /**
   * 检查特定节点是否在循环中
   */
  isNodeInCycle(nodeId: string): boolean {
    const cachedResult = this.getCachedDetectionResult();
    if (cachedResult && cachedResult.affectedNodes) {
      return cachedResult.affectedNodes.includes(nodeId);
    }
    return false;
  }

  /**
   * 获取检测统计信息
   */
  getDetectionStats(): {
    totalNodesChecked: number;
    cyclesFound: number;
    lastDetectionTime: number | null;
  } {
    const cachedResult = this.getCachedDetectionResult();
    
    return {
      totalNodesChecked: this.visitedNodes.size,
      cyclesFound: cachedResult ? cachedResult.cycles.length : 0,
      lastDetectionTime: cachedResult ? Date.now() : null
    };
  }
}