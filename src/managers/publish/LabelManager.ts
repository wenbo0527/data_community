import { Graph, Node } from '@antv/x6';
import { UnifiedEventBus } from '../../core/UnifiedEventBus';
import { UnifiedCacheManager } from '../../core/UnifiedCacheManager';
import { ErrorHandler } from '../../core/ErrorHandler';

/**
 * 标签管理器
 * 负责管理预览线标签状态和显示
 */
export class LabelManager {
  private canvas: Graph;
  private eventBus: UnifiedEventBus;
  private cacheManager: UnifiedCacheManager;
  private errorHandler: ErrorHandler;
  private labels: Map<string, any>; // 标签存储
  private labelElements: Map<string, HTMLElement>; // DOM元素存储
  private containerElement: HTMLElement | null; // 标签容器

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
    this.labels = new Map();
    this.labelElements = new Map();
    this.containerElement = null;
    
    this.initializeLabelContainer();
    this.setupEventListeners();
  }

  /**
   * 初始化标签容器
   */
  private initializeLabelContainer(): void {
    try {
      // 获取画布容器
      const canvasContainer = this.canvas.container;
      if (!canvasContainer) {
        throw new Error('画布容器不存在');
      }

      // 创建标签容器
      this.containerElement = document.createElement('div');
      this.containerElement.className = 'branch-labels-container';
      this.containerElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
      `;

      // 添加到画布容器
      canvasContainer.appendChild(this.containerElement);

    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: 'LabelManager.initializeLabelContainer',
        severity: 'medium'
      });
    }
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    this.eventBus.on('label:update', this.handleLabelUpdate.bind(this));
    this.eventBus.on('label:remove', this.handleLabelRemove.bind(this));
    this.eventBus.on('canvas:transform', this.handleCanvasTransform.bind(this));
    this.eventBus.on('node:moved', this.handleNodeMoved.bind(this));
  }

  /**
   * 更新分支标签
   * @param branchId 分支ID
   * @param labelConfig 标签配置
   */
  async updateBranchLabel(branchId: string, labelConfig: any) {
    try {
      const existingLabel = this.labels.get(branchId);
      
      if (existingLabel) {
        // 更新现有标签
        return await this.updateExistingLabel(branchId, labelConfig);
      } else {
        // 创建新标签
        return await this.createBranchLabel(branchId, labelConfig);
      }

    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: `LabelManager.updateBranchLabel: ${branchId}`,
        severity: 'medium'
      });
      return null;
    }
  }

  /**
   * 创建分支标签
   */
  async createBranchLabel(branchId: string, labelConfig: any) {
    try {
      // 计算标签位置（先验证节点是否存在）
      const position = await this.calculateLabelPosition(branchId, labelConfig);
      
      // 生成标签HTML
      const labelHTML = this.generateLabelHTML(labelConfig);
      
      // 创建标签对象
      const label = {
        id: `label_${branchId}`,
        branchId: branchId,
        text: labelConfig.text,
        condition: labelConfig.condition,
        position: position,
        style: labelConfig.style || {},
        isVisible: true,
        isAttached: labelConfig.isAttached || false,
        element: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // 创建DOM元素
      const element = this.createLabelElement(label, labelHTML);
      label.element = element;

      // 存储标签
      this.labels.set(branchId, label);
      this.labelElements.set(label.id, element);

      // 添加到容器
      if (this.containerElement) {
        this.containerElement.appendChild(element);
      }

      // 缓存标签
      this.cacheManager.set(`label_${branchId}`, label, { ttl: 300000 }); // 5分钟缓存

      // 发布事件
      this.eventBus.emit('label:created', {
        branchId,
        label
      });

      return label;

    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: `LabelManager.createBranchLabel: ${branchId}`,
        severity: 'medium'
      });
      return null;
    }
  }

  /**
   * 生成标签HTML
   */
  private generateLabelHTML(labelConfig: any): string {
    const { text, condition, style, isAttached } = labelConfig;
    
    const statusClass = isAttached ? 'attached' : 'unattached';
    const statusText = isAttached ? '已连接' : '待连接';
    
    return `
      <div class="branch-label ${statusClass}">
        <div class="label-text">${text}</div>
        <div class="label-condition">${condition}</div>
        <div class="label-status">${statusText}</div>
      </div>
    `;
  }

  /**
   * 计算标签位置
   */
  async calculateLabelPosition(branchId: string, labelConfig: any) {
    try {
      // 从分支ID解析决策节点ID和分支索引
      const parts = branchId.split('_');
      const decisionNodeId = parts.slice(0, -2).join('_'); // 去掉最后的'branch'和索引
      const branchIndex = parseInt(parts[parts.length - 1]) || 0;

      // 获取决策节点
      const decisionNode = this.canvas.getCellById(decisionNodeId);
      if (!decisionNode) {
        throw new Error(`决策节点 ${decisionNodeId} 不存在`);
      }

      // 获取节点位置和大小
      const nodePosition = (decisionNode as Node).getPosition();
      const nodeSize = (decisionNode as Node).getSize();

      // 计算标签位置（在预览线中点附近）
      const startX = nodePosition.x + nodeSize.width;
      const startY = nodePosition.y + nodeSize.height / 2 + (branchIndex * 30);
      
      const labelX = startX + 75; // 预览线中点
      const labelY = startY - 15; // 稍微向上偏移

      return {
        x: labelX,
        y: labelY
      };

    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: `计算标签位置失败: ${branchId}`,
        severity: 'medium'
      });
      throw error; // 重新抛出错误，让上层方法处理
    }
  }

  /**
   * 创建标签DOM元素
   */
  private createLabelElement(label: any, labelHTML: string): HTMLElement {
    const element = document.createElement('div');
    element.className = 'branch-label-wrapper';
    element.id = label.id;
    element.innerHTML = labelHTML;
    
    // 设置基础样式
    element.style.cssText = `
      position: absolute;
      left: ${label.position.x}px;
      top: ${label.position.y}px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: ${label.style.fontSize || 12}px;
      color: ${label.style.fill || '#666'};
      font-weight: ${label.style.fontWeight || 'normal'};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      pointer-events: auto;
      z-index: 1001;
      transition: all 0.2s ease;
    `;

    // 添加状态样式
    if (label.isAttached) {
      element.style.borderColor = '#1890ff';
      element.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
    } else {
      element.style.borderColor = '#52c41a';
      element.style.backgroundColor = 'rgba(82, 196, 26, 0.1)';
    }

    // 添加交互事件
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'scale(1.05)';
      element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'scale(1)';
      element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });

    return element;
  }

  /**
   * 更新现有标签
   */
  async updateExistingLabel(branchId: string, labelConfig: any) {
    try {
      const label = this.labels.get(branchId);
      if (!label) {
        throw new Error(`标签 ${branchId} 不存在`);
      }

      // 更新标签数据
      label.text = labelConfig.text || label.text;
      label.condition = labelConfig.condition || label.condition;
      label.isAttached = labelConfig.isAttached !== undefined ? labelConfig.isAttached : label.isAttached;
      label.style = { ...label.style, ...labelConfig.style };
      label.updatedAt = Date.now();

      // 重新计算位置
      if (labelConfig.updatePosition !== false) {
        label.position = await this.calculateLabelPosition(branchId, labelConfig);
      }

      // 更新DOM元素
      const element = label.element;
      if (element) {
        // 更新HTML内容
        const labelHTML = this.generateLabelHTML({
          text: label.text,
          condition: label.condition,
          style: label.style,
          isAttached: label.isAttached
        });
        element.innerHTML = labelHTML;

        // 🔧 坐标验证：确保位置样式不包含NaN值
        const validX = (typeof label.position.x === 'number' && !isNaN(label.position.x) && isFinite(label.position.x)) ? label.position.x : 200;
        const validY = (typeof label.position.y === 'number' && !isNaN(label.position.y) && isFinite(label.position.y)) ? label.position.y : 100;
        
        if (validX !== label.position.x || validY !== label.position.y) {
          console.warn('⚠️ [LabelManager] 检测到NaN坐标，使用默认值:', {
            branchId,
            originalPosition: label.position,
            correctedPosition: { x: validX, y: validY }
          });
        }
        
        // 更新位置
        element.style.left = `${validX}px`;
        element.style.top = `${validY}px`;

        // 更新样式
        element.style.fontSize = `${label.style.fontSize || 12}px`;
        element.style.color = label.style.fill || '#666';
        element.style.fontWeight = label.style.fontWeight || 'normal';

        // 更新状态样式
        if (label.isAttached) {
          element.style.borderColor = '#1890ff';
          element.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
        } else {
          element.style.borderColor = '#52c41a';
          element.style.backgroundColor = 'rgba(82, 196, 26, 0.1)';
        }
      }

      // 更新缓存
      this.cacheManager.set(`label_${branchId}`, label, { ttl: 300000 });

      // 发布事件
      this.eventBus.emit('label:updated', {
        branchId,
        label
      });

      return label;

    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: `LabelManager.updateExistingLabel: ${branchId}`,
        severity: 'medium'
      });
      return null;
    }
  }

  /**
   * 更新标签状态
   */
  updateLabelState(branchId: string, state: 'attached' | 'unattached' | 'hidden') {
    try {
      const label = this.labels.get(branchId);
      if (!label) {
        return false;
      }

      const element = label.element;
      if (!element) {
        return false;
      }

      switch (state) {
        case 'attached':
          label.isAttached = true;
          element.style.borderColor = '#1890ff';
          element.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
          element.style.display = 'block';
          break;
        
        case 'unattached':
          label.isAttached = false;
          element.style.borderColor = '#52c41a';
          element.style.backgroundColor = 'rgba(82, 196, 26, 0.1)';
          element.style.display = 'block';
          break;
        
        case 'hidden':
          element.style.display = 'none';
          break;
      }

      label.updatedAt = Date.now();
      return true;

    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: `LabelManager.updateLabelState: ${branchId}`,
        severity: 'medium'
      });
      return false;
    }
  }

  /**
   * 移除标签
   */
  removeLabel(branchId: string) {
    try {
      const label = this.labels.get(branchId);
      if (!label) {
        return false;
      }

      // 移除DOM元素
      const element = label.element;
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }

      // 清理存储
      this.labels.delete(branchId);
      this.labelElements.delete(label.id);
      
      // 清理缓存
      this.cacheManager.delete(`label_${branchId}`);

      // 发布事件
      this.eventBus.emit('label:removed', {
        branchId,
        labelId: label.id
      });

      return true;

    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        context: `LabelManager.removeLabel: ${branchId}`,
        severity: 'medium'
      });
      return false;
    }
  }

  /**
   * 获取标签
   */
  getLabel(branchId: string) {
    return this.labels.get(branchId) || null;
  }

  /**
   * 获取所有标签
   */
  getAllLabels() {
    return Array.from(this.labels.values());
  }

  /**
   * 处理标签更新事件
   */
  private async handleLabelUpdate(event: any) {
    const { branchId, labelConfig } = event;
    await this.updateBranchLabel(branchId, labelConfig);
  }

  /**
   * 处理标签移除事件
   */
  private handleLabelRemove(event: any) {
    const { branchId } = event;
    this.removeLabel(branchId);
  }

  /**
   * 处理画布变换事件
   */
  private handleCanvasTransform(event: any) {
    // 当画布缩放或平移时，重新计算所有标签位置
    this.updateAllLabelPositions();
  }

  /**
   * 处理节点移动事件
   */
  private async handleNodeMoved(event: any) {
    const { nodeId } = event;
    
    // 更新与该节点相关的标签位置
    for (const [branchId, label] of this.labels) {
      if (branchId.startsWith(nodeId)) {
        const newPosition = await this.calculateLabelPosition(branchId, label);
        label.position = newPosition;
        
        if (label.element) {
          // 🔧 坐标验证：确保位置样式不包含NaN值
          const validX = (typeof newPosition.x === 'number' && !isNaN(newPosition.x) && isFinite(newPosition.x)) ? newPosition.x : 200;
          const validY = (typeof newPosition.y === 'number' && !isNaN(newPosition.y) && isFinite(newPosition.y)) ? newPosition.y : 100;
          
          if (validX !== newPosition.x || validY !== newPosition.y) {
            console.warn('⚠️ [LabelManager] 节点移动时检测到NaN坐标，使用默认值:', {
              nodeId,
              branchId,
              originalPosition: newPosition,
              correctedPosition: { x: validX, y: validY }
            });
          }
          
          label.element.style.left = `${validX}px`;
          label.element.style.top = `${validY}px`;
        }
      }
    }
  }

  /**
   * 更新所有标签位置
   */
  private async updateAllLabelPositions() {
    for (const [branchId, label] of this.labels) {
      try {
        const newPosition = await this.calculateLabelPosition(branchId, label);
        label.position = newPosition;
        
        if (label.element) {
          // 🔧 坐标验证：确保位置样式不包含NaN值
          const validX = (typeof newPosition.x === 'number' && !isNaN(newPosition.x) && isFinite(newPosition.x)) ? newPosition.x : 200;
          const validY = (typeof newPosition.y === 'number' && !isNaN(newPosition.y) && isFinite(newPosition.y)) ? newPosition.y : 100;
          
          if (validX !== newPosition.x || validY !== newPosition.y) {
            console.warn('⚠️ [LabelManager] 更新所有标签位置时检测到NaN坐标，使用默认值:', {
              branchId,
              originalPosition: newPosition,
              correctedPosition: { x: validX, y: validY }
            });
          }
          
          label.element.style.left = `${validX}px`;
          label.element.style.top = `${validY}px`;
          label.element.style.top = `${newPosition.y}px`;
        }
      } catch (error) {
        this.errorHandler.handleError(error as Error, {
          context: `更新标签位置失败: ${branchId}`,
          severity: 'medium'
        });
      }
    }
  }

  /**
   * 隐藏所有标签
   */
  hideAllLabels() {
    for (const label of this.labels.values()) {
      if (label.element) {
        label.element.style.display = 'none';
      }
    }
  }

  /**
   * 显示所有标签
   */
  showAllLabels() {
    for (const label of this.labels.values()) {
      if (label.element) {
        label.element.style.display = 'block';
      }
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    // 移除所有标签
    for (const branchId of this.labels.keys()) {
      this.removeLabel(branchId);
    }

    // 移除容器
    if (this.containerElement && this.containerElement.parentNode) {
      this.containerElement.parentNode.removeChild(this.containerElement);
    }

    // 清理事件监听
    this.eventBus.off('label:update', this.handleLabelUpdate.bind(this));
    this.eventBus.off('label:remove', this.handleLabelRemove.bind(this));
    this.eventBus.off('canvas:transform', this.handleCanvasTransform.bind(this));
    this.eventBus.off('node:moved', this.handleNodeMoved.bind(this));

    // 清理存储
    this.labels.clear();
    this.labelElements.clear();
  }
}