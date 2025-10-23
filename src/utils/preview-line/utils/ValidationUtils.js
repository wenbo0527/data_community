/**
 * 验证工具类
 * 提供预览线相关的验证功能和数据完整性检查
 */

import { PreviewLineStates, PreviewLineTypes, NodeTypes } from '../types/PreviewLineTypes.js';
import { GeometryUtils } from './GeometryUtils.js';

export class ValidationUtils {
  /**
   * 验证预览线实例的完整性
   * @param {Object} previewInstance - 预览线实例
   * @returns {Object} 验证结果 {isValid, errors, warnings}
   */
  static validatePreviewInstance(previewInstance) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!previewInstance) {
      result.isValid = false;
      result.errors.push('预览线实例为空');
      return result;
    }

    // 验证必需属性
    if (!previewInstance.id) {
      result.errors.push('缺少预览线ID');
    }

    if (!previewInstance.line) {
      result.errors.push('缺少预览线对象');
    }

    if (!previewInstance.sourceNode) {
      result.errors.push('缺少源节点');
    }

    // 验证类型
    if (previewInstance.type && !Object.values(PreviewLineTypes).includes(previewInstance.type)) {
      result.warnings.push(`未知的预览线类型: ${previewInstance.type}`);
    }

    // 验证状态
    if (previewInstance.state && !Object.values(PreviewLineStates).includes(previewInstance.state)) {
      result.warnings.push(`未知的预览线状态: ${previewInstance.state}`);
    }

    // 验证源节点
    if (previewInstance.sourceNode) {
      const nodeValidation = this.validateNode(previewInstance.sourceNode);
      if (!nodeValidation.isValid) {
        result.errors.push(...nodeValidation.errors.map(err => `源节点: ${err}`));
        result.warnings.push(...nodeValidation.warnings.map(warn => `源节点: ${warn}`));
      }
    }

    // 验证目标节点（如果存在）
    if (previewInstance.targetNode) {
      const nodeValidation = this.validateNode(previewInstance.targetNode);
      if (!nodeValidation.isValid) {
        result.errors.push(...nodeValidation.errors.map(err => `目标节点: ${err}`));
        result.warnings.push(...nodeValidation.warnings.map(warn => `目标节点: ${warn}`));
      }
    }

    // 验证预览线对象
    if (previewInstance.line) {
      const lineValidation = this.validatePreviewLine(previewInstance.line);
      if (!lineValidation.isValid) {
        result.errors.push(...lineValidation.errors);
        result.warnings.push(...lineValidation.warnings);
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * 验证节点对象
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  static validateNode(node) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!node) {
      result.isValid = false;
      result.errors.push('节点对象为空');
      return result;
    }

    // 验证节点ID
    if (!node.id) {
      result.errors.push('节点缺少ID');
    }

    // 验证节点类型
    const nodeData = node.getData ? node.getData() : node.data || {};
    const nodeType = nodeData.type || nodeData.nodeType;
    
    if (nodeType && !Object.values(NodeTypes).includes(nodeType)) {
      result.warnings.push(`未知的节点类型: ${nodeType}`);
    }

    // 验证节点位置
    if (node.getPosition) {
      const position = node.getPosition();
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        result.errors.push('节点位置无效');
      }
    }

    // 验证节点尺寸
    if (node.getSize) {
      const size = node.getSize();
      if (!size || typeof size.width !== 'number' || typeof size.height !== 'number') {
        result.errors.push('节点尺寸无效');
      } else if (size.width <= 0 || size.height <= 0) {
        result.warnings.push('节点尺寸为零或负数');
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * 验证预览线对象
   * @param {Object} line - 预览线对象
   * @returns {Object} 验证结果
   */
  static validatePreviewLine(line) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!line) {
      result.isValid = false;
      result.errors.push('预览线对象为空');
      return result;
    }

    // 验证预览线ID
    if (!line.id) {
      result.errors.push('预览线缺少ID');
    }

    // 验证起点
    if (line.getSourcePoint) {
      const source = line.getSourcePoint();
      if (!source || typeof source.x !== 'number' || typeof source.y !== 'number') {
        result.errors.push('预览线起点无效');
      }
    }

    // 验证终点（如果存在）
    if (line.getTargetPoint) {
      const target = line.getTargetPoint();
      if (target && (typeof target.x !== 'number' || typeof target.y !== 'number')) {
        result.warnings.push('预览线终点坐标无效');
      }
    }

    // 验证样式属性
    if (line.attr) {
      const attrs = line.attr();
      if (attrs && attrs.line) {
        const lineAttrs = attrs.line;
        
        // 验证颜色
        if (lineAttrs.stroke && !this.isValidColor(lineAttrs.stroke)) {
          result.warnings.push('预览线颜色格式无效');
        }
        
        // 验证线宽
        if (lineAttrs.strokeWidth && (typeof lineAttrs.strokeWidth !== 'number' || lineAttrs.strokeWidth <= 0)) {
          result.warnings.push('预览线宽度无效');
        }
        
        // 验证透明度
        if (lineAttrs.opacity && (typeof lineAttrs.opacity !== 'number' || lineAttrs.opacity < 0 || lineAttrs.opacity > 1)) {
          result.warnings.push('预览线透明度无效');
        }
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * 验证预览线配置
   * @param {Object} config - 配置对象
   * @returns {Object} 验证结果
   */
  static validatePreviewLineConfig(config) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!config) {
      result.isValid = false;
      result.errors.push('配置对象为空');
      return result;
    }

    // 验证性能配置
    if (config.performance) {
      const perf = config.performance;
      
      if (perf.batchSize && (typeof perf.batchSize !== 'number' || perf.batchSize <= 0)) {
        result.warnings.push('批处理大小无效');
      }
      
      if (perf.debounceDelay && (typeof perf.debounceDelay !== 'number' || perf.debounceDelay < 0)) {
        result.warnings.push('防抖延迟无效');
      }
      
      if (perf.maxConcurrentOperations && (typeof perf.maxConcurrentOperations !== 'number' || perf.maxConcurrentOperations <= 0)) {
        result.warnings.push('最大并发操作数无效');
      }
    }

    // 验证渲染配置
    if (config.rendering) {
      const render = config.rendering;
      
      if (render.animationDuration && (typeof render.animationDuration !== 'number' || render.animationDuration < 0)) {
        result.warnings.push('动画持续时间无效');
      }
      
      if (render.strokeWidth && (typeof render.strokeWidth !== 'number' || render.strokeWidth <= 0)) {
        result.warnings.push('默认线宽无效');
      }
    }

    // 验证吸附配置
    if (config.snapping) {
      const snap = config.snapping;
      
      if (snap.threshold && (typeof snap.threshold !== 'number' || snap.threshold < 0)) {
        result.warnings.push('吸附阈值无效');
      }
      
      if (snap.gridSize && (typeof snap.gridSize !== 'number' || snap.gridSize <= 0)) {
        result.warnings.push('网格大小无效');
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * 验证坐标对象
   * @param {Object} coordinates - 坐标对象 {x, y}
   * @returns {boolean} 是否有效
   */
  static validateCoordinates(coordinates) {
    return coordinates && 
           typeof coordinates.x === 'number' && 
           typeof coordinates.y === 'number' &&
           !isNaN(coordinates.x) && 
           !isNaN(coordinates.y) &&
           isFinite(coordinates.x) && 
           isFinite(coordinates.y);
  }

  /**
   * 验证尺寸对象
   * @param {Object} size - 尺寸对象 {width, height}
   * @returns {boolean} 是否有效
   */
  static validateSize(size) {
    return size && 
           typeof size.width === 'number' && 
           typeof size.height === 'number' &&
           size.width > 0 && 
           size.height > 0 &&
           !isNaN(size.width) && 
           !isNaN(size.height) &&
           isFinite(size.width) && 
           isFinite(size.height);
  }

  /**
   * 验证颜色格式
   * @param {string} color - 颜色值
   * @returns {boolean} 是否有效
   */
  static isValidColor(color) {
    if (typeof color !== 'string') {
      return false;
    }
    
    // 支持的颜色格式
    const colorPatterns = [
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // 十六进制
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[01]?\.?\d*\s*\)$/, // RGBA
      /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
      /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[01]?\.?\d*\s*\)$/ // HSLA
    ];
    
    // 预定义颜色名称
    const namedColors = [
      'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown',
      'black', 'white', 'gray', 'grey', 'transparent', 'currentColor'
    ];
    
    return colorPatterns.some(pattern => pattern.test(color)) || 
           namedColors.includes(color.toLowerCase());
  }

  /**
   * 验证预览线是否与节点正确连接
   * @param {Object} previewInstance - 预览线实例
   * @returns {Object} 验证结果
   */
  static validatePreviewLineConnection(previewInstance) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!previewInstance || !previewInstance.line || !previewInstance.sourceNode) {
      result.isValid = false;
      result.errors.push('预览线实例、线对象或源节点缺失');
      return result;
    }

    const { line, sourceNode } = previewInstance;
    
    try {
      // 获取预览线起点
      const lineSource = line.getSourcePoint();
      if (!this.validateCoordinates(lineSource)) {
        result.errors.push('预览线起点坐标无效');
        return result;
      }

      // 获取节点位置和尺寸
      const nodePosition = sourceNode.getPosition();
      const nodeSize = sourceNode.getSize();
      
      if (!this.validateCoordinates(nodePosition) || !this.validateSize(nodeSize)) {
        result.errors.push('源节点位置或尺寸无效');
        return result;
      }

      // 计算节点的out端口位置
      const nodeCenter = {
        x: nodePosition.x + nodeSize.width / 2,
        y: nodePosition.y + nodeSize.height / 2
      };
      
      const expectedOutPort = {
        x: nodeCenter.x + nodeSize.width / 2,
        y: nodeCenter.y
      };

      // 检查预览线起点是否接近节点的out端口
      const distance = GeometryUtils.calculateDistance(lineSource, expectedOutPort);
      const threshold = 10; // 允许的偏差阈值
      
      if (distance > threshold) {
        result.warnings.push(`预览线起点与节点out端口距离过大: ${distance.toFixed(2)}px`);
      }

      // 检查预览线是否在节点边界内开始
      const nodeRect = {
        x: nodePosition.x,
        y: nodePosition.y,
        width: nodeSize.width,
        height: nodeSize.height
      };
      
      if (GeometryUtils.isPointInRect(lineSource, nodeRect)) {
        result.warnings.push('预览线起点在节点内部，可能影响视觉效果');
      }
      
    } catch (error) {
      result.errors.push(`连接验证失败: ${error.message}`);
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * 批量验证预览线实例
   * @param {Array} previewInstances - 预览线实例数组
   * @returns {Object} 批量验证结果
   */
  static batchValidatePreviewInstances(previewInstances) {
    const result = {
      total: previewInstances.length,
      valid: 0,
      invalid: 0,
      warnings: 0,
      details: []
    };

    previewInstances.forEach((instance, index) => {
      const validation = this.validatePreviewInstance(instance);
      
      const detail = {
        index,
        id: instance?.id || `instance-${index}`,
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      };
      
      if (validation.isValid) {
        result.valid++;
      } else {
        result.invalid++;
      }
      
      if (validation.warnings.length > 0) {
        result.warnings++;
      }
      
      result.details.push(detail);
    });

    return result;
  }

  /**
   * 生成验证报告
   * @param {Object} validationResult - 验证结果
   * @returns {string} 格式化的验证报告
   */
  static generateValidationReport(validationResult) {
    if (!validationResult) {
      return '验证结果为空';
    }

    let report = '=== 预览线验证报告 ===\n';
    
    if (validationResult.total !== undefined) {
      // 批量验证报告
      report += `总数: ${validationResult.total}\n`;
      report += `有效: ${validationResult.valid}\n`;
      report += `无效: ${validationResult.invalid}\n`;
      report += `警告: ${validationResult.warnings}\n\n`;
      
      if (validationResult.details) {
        validationResult.details.forEach(detail => {
          if (!detail.isValid || detail.warnings.length > 0) {
            report += `[${detail.id}]\n`;
            
            if (detail.errors.length > 0) {
              report += `  错误: ${detail.errors.join(', ')}\n`;
            }
            
            if (detail.warnings.length > 0) {
              report += `  警告: ${detail.warnings.join(', ')}\n`;
            }
            
            report += '\n';
          }
        });
      }
    } else {
      // 单个验证报告
      report += `状态: ${validationResult.isValid ? '有效' : '无效'}\n`;
      
      if (validationResult.errors.length > 0) {
        report += `错误: ${validationResult.errors.join(', ')}\n`;
      }
      
      if (validationResult.warnings.length > 0) {
        report += `警告: ${validationResult.warnings.join(', ')}\n`;
      }
    }

    return report;
  }
}

export default ValidationUtils;