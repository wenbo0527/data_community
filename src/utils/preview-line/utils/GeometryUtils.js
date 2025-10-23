/**
 * 几何工具类
 * 提供几何计算、坐标转换和空间分析相关的工具函数
 */

export class GeometryUtils {
  /**
   * 计算两点之间的距离
   * @param {Object} point1 - 第一个点 {x, y}
   * @param {Object} point2 - 第二个点 {x, y}
   * @returns {number} 距离
   */
  static calculateDistance(point1, point2) {
    if (!point1 || !point2 || 
        typeof point1.x !== 'number' || typeof point1.y !== 'number' ||
        typeof point2.x !== 'number' || typeof point2.y !== 'number') {
      return 0;
    }
    
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两点之间的曼哈顿距离
   * @param {Object} point1 - 第一个点 {x, y}
   * @param {Object} point2 - 第二个点 {x, y}
   * @returns {number} 曼哈顿距离
   */
  static calculateManhattanDistance(point1, point2) {
    if (!point1 || !point2 || 
        typeof point1.x !== 'number' || typeof point1.y !== 'number' ||
        typeof point2.x !== 'number' || typeof point2.y !== 'number') {
      return 0;
    }
    
    return Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y);
  }

  /**
   * 计算点到线段的最短距离
   * @param {Object} point - 点 {x, y}
   * @param {Object} lineStart - 线段起点 {x, y}
   * @param {Object} lineEnd - 线段终点 {x, y}
   * @returns {number} 最短距离
   */
  static pointToLineDistance(point, lineStart, lineEnd) {
    if (!point || !lineStart || !lineEnd) {
      return Infinity;
    }

    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      // 线段退化为点
      return this.calculateDistance(point, lineStart);
    }

    let param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两条线段之间的最短距离
   * @param {Object} line1Start - 第一条线段起点
   * @param {Object} line1End - 第一条线段终点
   * @param {Object} line2Start - 第二条线段起点
   * @param {Object} line2End - 第二条线段终点
   * @returns {number} 最短距离
   */
  static lineToLineDistance(line1Start, line1End, line2Start, line2End) {
    // 计算四个点到对方线段的距离，取最小值
    const distances = [
      this.pointToLineDistance(line1Start, line2Start, line2End),
      this.pointToLineDistance(line1End, line2Start, line2End),
      this.pointToLineDistance(line2Start, line1Start, line1End),
      this.pointToLineDistance(line2End, line1Start, line1End)
    ];
    
    return Math.min(...distances);
  }

  /**
   * 计算矩形的中心点
   * @param {Object} rect - 矩形 {x, y, width, height}
   * @returns {Object} 中心点 {x, y}
   */
  static getRectCenter(rect) {
    if (!rect || typeof rect.x !== 'number' || typeof rect.y !== 'number' ||
        typeof rect.width !== 'number' || typeof rect.height !== 'number') {
      return { x: 0, y: 0 };
    }
    
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }

  /**
   * 计算矩形的边界点
   * @param {Object} rect - 矩形 {x, y, width, height}
   * @param {string} side - 边 ('top', 'right', 'bottom', 'left')
   * @returns {Object} 边界点 {x, y}
   */
  static getRectSideCenter(rect, side) {
    if (!rect) {
      return { x: 0, y: 0 };
    }
    
    const center = this.getRectCenter(rect);
    
    switch (side) {
      case 'top':
        return { x: center.x, y: rect.y };
      case 'right':
        return { x: rect.x + rect.width, y: center.y };
      case 'bottom':
        return { x: center.x, y: rect.y + rect.height };
      case 'left':
        return { x: rect.x, y: center.y };
      default:
        return center;
    }
  }

  /**
   * 判断点是否在矩形内
   * @param {Object} point - 点 {x, y}
   * @param {Object} rect - 矩形 {x, y, width, height}
   * @returns {boolean} 是否在矩形内
   */
  static isPointInRect(point, rect) {
    if (!point || !rect) {
      return false;
    }
    
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width &&
           point.y >= rect.y && 
           point.y <= rect.y + rect.height;
  }

  /**
   * 判断两个矩形是否重叠
   * @param {Object} rect1 - 第一个矩形
   * @param {Object} rect2 - 第二个矩形
   * @returns {boolean} 是否重叠
   */
  static isRectOverlap(rect1, rect2) {
    if (!rect1 || !rect2) {
      return false;
    }
    
    return !(rect1.x + rect1.width < rect2.x || 
             rect2.x + rect2.width < rect1.x || 
             rect1.y + rect1.height < rect2.y || 
             rect2.y + rect2.height < rect1.y);
  }

  /**
   * 计算两个矩形的重叠面积
   * @param {Object} rect1 - 第一个矩形
   * @param {Object} rect2 - 第二个矩形
   * @returns {number} 重叠面积
   */
  static getOverlapArea(rect1, rect2) {
    if (!this.isRectOverlap(rect1, rect2)) {
      return 0;
    }
    
    const left = Math.max(rect1.x, rect2.x);
    const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const top = Math.max(rect1.y, rect2.y);
    const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
    
    return (right - left) * (bottom - top);
  }

  /**
   * 计算向量的角度
   * @param {Object} vector - 向量 {x, y}
   * @returns {number} 角度（弧度）
   */
  static getVectorAngle(vector) {
    if (!vector || (vector.x === 0 && vector.y === 0)) {
      return 0;
    }
    
    return Math.atan2(vector.y, vector.x);
  }

  /**
   * 计算两个向量之间的角度
   * @param {Object} vector1 - 第一个向量
   * @param {Object} vector2 - 第二个向量
   * @returns {number} 角度（弧度）
   */
  static getAngleBetweenVectors(vector1, vector2) {
    const angle1 = this.getVectorAngle(vector1);
    const angle2 = this.getVectorAngle(vector2);
    
    return Math.abs(angle2 - angle1);
  }

  /**
   * 旋转点
   * @param {Object} point - 点 {x, y}
   * @param {Object} center - 旋转中心 {x, y}
   * @param {number} angle - 旋转角度（弧度）
   * @returns {Object} 旋转后的点
   */
  static rotatePoint(point, center, angle) {
    if (!point || !center) {
      return point || { x: 0, y: 0 };
    }
    
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    };
  }

  /**
   * 缩放点
   * @param {Object} point - 点 {x, y}
   * @param {Object} center - 缩放中心 {x, y}
   * @param {number} scaleX - X轴缩放比例
   * @param {number} scaleY - Y轴缩放比例
   * @returns {Object} 缩放后的点
   */
  static scalePoint(point, center, scaleX, scaleY = scaleX) {
    if (!point || !center) {
      return point || { x: 0, y: 0 };
    }
    
    return {
      x: center.x + (point.x - center.x) * scaleX,
      y: center.y + (point.y - center.y) * scaleY
    };
  }

  /**
   * 计算贝塞尔曲线上的点
   * @param {number} t - 参数 (0-1)
   * @param {Array} controlPoints - 控制点数组
   * @returns {Object} 曲线上的点
   */
  static getBezierPoint(t, controlPoints) {
    if (!controlPoints || controlPoints.length === 0) {
      return { x: 0, y: 0 };
    }
    
    if (controlPoints.length === 1) {
      return { ...controlPoints[0] };
    }
    
    // 递归计算贝塞尔曲线
    const newPoints = [];
    for (let i = 0; i < controlPoints.length - 1; i++) {
      const p1 = controlPoints[i];
      const p2 = controlPoints[i + 1];
      
      newPoints.push({
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
      });
    }
    
    return this.getBezierPoint(t, newPoints);
  }

  /**
   * 计算多边形的面积
   * @param {Array} vertices - 顶点数组 [{x, y}, ...]
   * @returns {number} 面积
   */
  static getPolygonArea(vertices) {
    if (!vertices || vertices.length < 3) {
      return 0;
    }
    
    let area = 0;
    const n = vertices.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }
    
    return Math.abs(area) / 2;
  }

  /**
   * 判断点是否在多边形内
   * @param {Object} point - 点 {x, y}
   * @param {Array} vertices - 多边形顶点数组
   * @returns {boolean} 是否在多边形内
   */
  static isPointInPolygon(point, vertices) {
    if (!point || !vertices || vertices.length < 3) {
      return false;
    }
    
    let inside = false;
    const n = vertices.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * 计算点集的边界框
   * @param {Array} points - 点数组
   * @returns {Object} 边界框 {x, y, width, height}
   */
  static getBoundingBox(points) {
    if (!points || points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 标准化角度到 0-2π 范围
   * @param {number} angle - 角度（弧度）
   * @returns {number} 标准化后的角度
   */
  static normalizeAngle(angle) {
    while (angle < 0) {
      angle += 2 * Math.PI;
    }
    while (angle >= 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    return angle;
  }

  /**
   * 弧度转角度
   * @param {number} radians - 弧度
   * @returns {number} 角度
   */
  static radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  /**
   * 角度转弧度
   * @param {number} degrees - 角度
   * @returns {number} 弧度
   */
  static degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
}

export default GeometryUtils;