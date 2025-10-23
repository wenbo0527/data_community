/**
 * 分支标签工具类
 * 提供分支预览线的标签管理、位置计算和样式配置功能
 */

import { NodeTypes, PreviewLineTypes } from '../types/PreviewLineTypes.js';
import { GeometryUtils } from './GeometryUtils.js';

export class BranchLabelUtils {
  /**
   * 默认标签配置
   */
  static DEFAULT_LABEL_CONFIG = {
    // 基础样式
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    color: '#333333',
    backgroundColor: '#ffffff',
    
    // 边框样式
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 4,
    
    // 内边距
    padding: {
      top: 4,
      right: 8,
      bottom: 4,
      left: 8
    },
    
    // 位置配置
    offset: {
      x: 0,
      y: -20
    },
    
    // 显示配置
    visible: true,
    opacity: 1,
    zIndex: 1000,
    
    // 动画配置
    animation: {
      enabled: true,
      duration: 200,
      easing: 'ease-in-out'
    }
  };

  /**
   * 节点类型对应的标签样式
   */
  static NODE_TYPE_LABEL_STYLES = {
    [NodeTypes.CONDITION]: {
      color: '#1890ff',
      backgroundColor: '#e6f7ff',
      borderColor: '#91d5ff'
    },
    [NodeTypes.ACTION]: {
      color: '#52c41a',
      backgroundColor: '#f6ffed',
      borderColor: '#b7eb8f'
    },
    [NodeTypes.TRIGGER]: {
      color: '#fa541c',
      backgroundColor: '#fff2e8',
      borderColor: '#ffbb96'
    },
    [NodeTypes.CONNECTOR]: {
      color: '#722ed1',
      backgroundColor: '#f9f0ff',
      borderColor: '#d3adf7'
    },
    [NodeTypes.DATA]: {
      color: '#13c2c2',
      backgroundColor: '#e6fffb',
      borderColor: '#87e8de'
    },
    [NodeTypes.LOGIC]: {
      color: '#eb2f96',
      backgroundColor: '#fff0f6',
      borderColor: '#ffadd2'
    }
  };

  /**
   * 分支类型标签文本
   */
  static BRANCH_TYPE_LABELS = {
    'true': '是',
    'false': '否',
    'yes': '是',
    'no': '否',
    'success': '成功',
    'failure': '失败',
    'error': '错误',
    'default': '默认',
    'else': '其他',
    'next': '下一步',
    'continue': '继续',
    'break': '中断',
    'return': '返回'
  };

  /**
   * 创建分支标签
   * @param {Object} options - 标签选项
   * @param {string} options.text - 标签文本
   * @param {Object} options.position - 标签位置 {x, y}
   * @param {Object} options.style - 自定义样式
   * @param {string} options.nodeType - 节点类型
   * @param {string} options.branchType - 分支类型
   * @returns {Object} 标签配置对象
   */
  static createBranchLabel(options = {}) {
    const {
      text,
      position = { x: 0, y: 0 },
      style = {},
      nodeType,
      branchType
    } = options;

    // 获取标签文本
    const labelText = text || this.getBranchLabelText(branchType) || '分支';
    
    // 合并样式
    const mergedStyle = this.mergeLabelStyles({
      ...this.DEFAULT_LABEL_CONFIG,
      ...this.getNodeTypeLabelStyle(nodeType),
      ...style
    });

    // 计算标签尺寸
    const labelSize = this.calculateLabelSize(labelText, mergedStyle);
    
    // 调整标签位置
    const adjustedPosition = this.adjustLabelPosition(position, labelSize, mergedStyle.offset);

    return {
      id: `branch-label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: labelText,
      position: adjustedPosition,
      size: labelSize,
      style: mergedStyle,
      nodeType,
      branchType,
      visible: mergedStyle.visible,
      zIndex: mergedStyle.zIndex,
      createdAt: Date.now()
    };
  }

  /**
   * 获取分支类型对应的标签文本
   * @param {string} branchType - 分支类型
   * @returns {string} 标签文本
   */
  static getBranchLabelText(branchType) {
    if (!branchType) return null;
    
    const normalizedType = branchType.toLowerCase();
    return this.BRANCH_TYPE_LABELS[normalizedType] || branchType;
  }

  /**
   * 获取节点类型对应的标签样式
   * @param {string} nodeType - 节点类型
   * @returns {Object} 样式对象
   */
  static getNodeTypeLabelStyle(nodeType) {
    return this.NODE_TYPE_LABEL_STYLES[nodeType] || {};
  }

  /**
   * 合并标签样式
   * @param {Object} styles - 样式对象
   * @returns {Object} 合并后的样式
   */
  static mergeLabelStyles(...styles) {
    const merged = {};
    
    styles.forEach(style => {
      if (style && typeof style === 'object') {
        Object.keys(style).forEach(key => {
          if (key === 'padding' && typeof style[key] === 'object') {
            merged[key] = { ...merged[key], ...style[key] };
          } else if (key === 'offset' && typeof style[key] === 'object') {
            merged[key] = { ...merged[key], ...style[key] };
          } else if (key === 'animation' && typeof style[key] === 'object') {
            merged[key] = { ...merged[key], ...style[key] };
          } else {
            merged[key] = style[key];
          }
        });
      }
    });
    
    return merged;
  }

  /**
   * 计算标签尺寸
   * @param {string} text - 标签文本
   * @param {Object} style - 标签样式
   * @returns {Object} 尺寸 {width, height}
   */
  static calculateLabelSize(text, style) {
    if (!text) {
      return { width: 0, height: 0 };
    }

    // 创建临时canvas来测量文本尺寸
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置字体样式
    ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize || 12}px ${style.fontFamily || 'Arial'}`;
    
    // 测量文本宽度
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = style.fontSize || 12;
    
    // 添加内边距
    const padding = style.padding || {};
    const paddingTop = padding.top || 0;
    const paddingRight = padding.right || 0;
    const paddingBottom = padding.bottom || 0;
    const paddingLeft = padding.left || 0;
    
    return {
      width: Math.ceil(textWidth + paddingLeft + paddingRight),
      height: Math.ceil(textHeight + paddingTop + paddingBottom)
    };
  }

  /**
   * 调整标签位置
   * @param {Object} basePosition - 基础位置 {x, y}
   * @param {Object} labelSize - 标签尺寸 {width, height}
   * @param {Object} offset - 偏移量 {x, y}
   * @returns {Object} 调整后的位置
   */
  static adjustLabelPosition(basePosition, labelSize, offset = {}) {
    const offsetX = offset.x || 0;
    const offsetY = offset.y || 0;
    
    return {
      x: basePosition.x + offsetX - labelSize.width / 2,
      y: basePosition.y + offsetY - labelSize.height / 2
    };
  }

  /**
   * 计算预览线中点位置（用于标签定位）
   * @param {Object} previewLine - 预览线对象
   * @returns {Object} 中点位置 {x, y}
   */
  static calculatePreviewLineMidpoint(previewLine) {
    if (!previewLine) {
      return { x: 0, y: 0 };
    }

    try {
      const sourcePoint = previewLine.getSourcePoint();
      const targetPoint = previewLine.getTargetPoint();
      
      if (!sourcePoint) {
        return { x: 0, y: 0 };
      }
      
      if (!targetPoint) {
        // 如果没有目标点，返回起点附近的位置
        return {
          x: sourcePoint.x + 50,
          y: sourcePoint.y - 20
        };
      }
      
      // 计算中点
      return {
        x: (sourcePoint.x + targetPoint.x) / 2,
        y: (sourcePoint.y + targetPoint.y) / 2
      };
    } catch (error) {
      console.warn('计算预览线中点失败:', error);
      return { x: 0, y: 0 };
    }
  }

  /**
   * 为预览线创建标签
   * @param {Object} previewInstance - 预览线实例
   * @param {Object} options - 标签选项
   * @returns {Object} 标签配置
   */
  static createLabelForPreviewLine(previewInstance, options = {}) {
    if (!previewInstance || !previewInstance.line) {
      return null;
    }

    const { line, sourceNode, branchType } = previewInstance;
    
    // 获取节点类型
    const nodeType = sourceNode?.getData?.()?.type || sourceNode?.data?.type;
    
    // 计算标签位置
    const midpoint = this.calculatePreviewLineMidpoint(line);
    
    // 创建标签
    return this.createBranchLabel({
      position: midpoint,
      nodeType,
      branchType,
      ...options
    });
  }

  /**
   * 批量创建分支标签
   * @param {Array} previewInstances - 预览线实例数组
   * @param {Object} globalOptions - 全局标签选项
   * @returns {Array} 标签配置数组
   */
  static createLabelsForPreviewLines(previewInstances, globalOptions = {}) {
    if (!Array.isArray(previewInstances)) {
      return [];
    }

    return previewInstances
      .filter(instance => instance && instance.line)
      .map(instance => {
        const label = this.createLabelForPreviewLine(instance, globalOptions);
        if (label) {
          label.previewInstanceId = instance.id;
        }
        return label;
      })
      .filter(Boolean);
  }

  /**
   * 更新标签位置
   * @param {Object} label - 标签对象
   * @param {Object} newPosition - 新位置 {x, y}
   * @returns {Object} 更新后的标签
   */
  static updateLabelPosition(label, newPosition) {
    if (!label || !newPosition) {
      return label;
    }

    const adjustedPosition = this.adjustLabelPosition(
      newPosition,
      label.size,
      label.style.offset
    );

    return {
      ...label,
      position: adjustedPosition,
      updatedAt: Date.now()
    };
  }

  /**
   * 更新标签样式
   * @param {Object} label - 标签对象
   * @param {Object} newStyle - 新样式
   * @returns {Object} 更新后的标签
   */
  static updateLabelStyle(label, newStyle) {
    if (!label || !newStyle) {
      return label;
    }

    const mergedStyle = this.mergeLabelStyles(label.style, newStyle);
    
    // 重新计算尺寸（如果文本或字体样式改变）
    const newSize = this.calculateLabelSize(label.text, mergedStyle);
    
    // 重新调整位置（如果尺寸改变）
    const adjustedPosition = this.adjustLabelPosition(
      { x: label.position.x + label.size.width / 2, y: label.position.y + label.size.height / 2 },
      newSize,
      mergedStyle.offset
    );

    return {
      ...label,
      style: mergedStyle,
      size: newSize,
      position: adjustedPosition,
      updatedAt: Date.now()
    };
  }

  /**
   * 检测标签碰撞
   * @param {Array} labels - 标签数组
   * @param {number} threshold - 碰撞阈值
   * @returns {Array} 碰撞对数组
   */
  static detectLabelCollisions(labels, threshold = 5) {
    const collisions = [];
    
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const label1 = labels[i];
        const label2 = labels[j];
        
        if (this.isLabelOverlapping(label1, label2, threshold)) {
          collisions.push([label1, label2]);
        }
      }
    }
    
    return collisions;
  }

  /**
   * 检查两个标签是否重叠
   * @param {Object} label1 - 标签1
   * @param {Object} label2 - 标签2
   * @param {number} threshold - 重叠阈值
   * @returns {boolean} 是否重叠
   */
  static isLabelOverlapping(label1, label2, threshold = 0) {
    if (!label1 || !label2 || !label1.visible || !label2.visible) {
      return false;
    }

    const rect1 = {
      x: label1.position.x - threshold,
      y: label1.position.y - threshold,
      width: label1.size.width + threshold * 2,
      height: label1.size.height + threshold * 2
    };
    
    const rect2 = {
      x: label2.position.x - threshold,
      y: label2.position.y - threshold,
      width: label2.size.width + threshold * 2,
      height: label2.size.height + threshold * 2
    };
    
    return GeometryUtils.isRectOverlap(rect1, rect2);
  }

  /**
   * 解决标签碰撞
   * @param {Array} labels - 标签数组
   * @param {Object} options - 解决选项
   * @returns {Array} 调整后的标签数组
   */
  static resolveLabelCollisions(labels, options = {}) {
    const {
      threshold = 5,
      maxIterations = 10,
      adjustmentStep = 10
    } = options;
    
    let adjustedLabels = [...labels];
    let iterations = 0;
    
    while (iterations < maxIterations) {
      const collisions = this.detectLabelCollisions(adjustedLabels, threshold);
      
      if (collisions.length === 0) {
        break;
      }
      
      // 调整碰撞的标签位置
      collisions.forEach(([label1, label2]) => {
        const index1 = adjustedLabels.findIndex(l => l.id === label1.id);
        const index2 = adjustedLabels.findIndex(l => l.id === label2.id);
        
        if (index1 !== -1 && index2 !== -1) {
          // 计算调整方向
          const dx = label2.position.x - label1.position.x;
          const dy = label2.position.y - label1.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            // 调整位置
            adjustedLabels[index1] = this.updateLabelPosition(label1, {
              x: label1.position.x + label1.size.width / 2 - unitX * adjustmentStep,
              y: label1.position.y + label1.size.height / 2 - unitY * adjustmentStep
            });
            
            adjustedLabels[index2] = this.updateLabelPosition(label2, {
              x: label2.position.x + label2.size.width / 2 + unitX * adjustmentStep,
              y: label2.position.y + label2.size.height / 2 + unitY * adjustmentStep
            });
          }
        }
      });
      
      iterations++;
    }
    
    return adjustedLabels;
  }

  /**
   * 生成标签CSS样式
   * @param {Object} label - 标签对象
   * @returns {Object} CSS样式对象
   */
  static generateLabelCSS(label) {
    if (!label || !label.style) {
      return {};
    }

    const { style, position, size } = label;
    
    return {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      fontSize: `${style.fontSize}px`,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      color: style.color,
      backgroundColor: style.backgroundColor,
      border: `${style.borderWidth}px solid ${style.borderColor}`,
      borderRadius: `${style.borderRadius}px`,
      padding: `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`,
      opacity: style.opacity,
      zIndex: style.zIndex,
      display: style.visible ? 'block' : 'none',
      textAlign: 'center',
      lineHeight: `${size.height - style.padding.top - style.padding.bottom}px`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      userSelect: 'none',
      pointerEvents: 'none'
    };
  }

  /**
   * 更新X6预览线的标签样式（适配方法）
   * @param {Object} line - X6预览线对象
   * @param {Object} styles - 标签样式配置
   */
  static updateX6LineLabel(line, styles) {
    if (!line || !styles || typeof line.getLabels !== 'function') {
      return;
    }

    const labels = line.getLabels();
    if (labels && labels.length > 0) {
      // 更新第一个标签的样式，使用正确的选择器
      const currentAttrs = labels[0].attrs || {};
      line.setLabelAt(0, {
        attrs: {
          text: {
            ...currentAttrs.text,
            ...styles.text
          },
          rect: {
            ...currentAttrs.rect,
            ...styles.rect
          }
        }
      });
    }
  }

  /**
   * 销毁标签资源
   * @param {Object|Array} labels - 标签或标签数组
   */
  static destroyLabels(labels) {
    const labelArray = Array.isArray(labels) ? labels : [labels];
    
    labelArray.forEach(label => {
      if (label && typeof label === 'object') {
        // 清理引用
        Object.keys(label).forEach(key => {
          delete label[key];
        });
      }
    });
  }
}

export default BranchLabelUtils;