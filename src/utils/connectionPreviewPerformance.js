/**
 * 连接预览性能优化工具
 */

/**
 * 防抖函数 - 用于优化频繁触发的事件
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * 节流函数 - 用于限制函数执行频率
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 批量操作管理器 - 用于批量处理DOM操作
 */
export class BatchOperationManager {
  constructor(batchSize = 10, delay = 16) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.isProcessing = false;
  }

  add(operation) {
    this.queue.push(operation);
    if (!this.isProcessing) {
      this.process();
    }
  }

  async process() {
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      // 执行批次操作
      batch.forEach(operation => {
        try {
          operation();
        } catch (error) {
          console.error('批量操作执行失败:', error);
        }
      });
      
      // 让出控制权给浏览器
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    this.isProcessing = false;
  }

  clear() {
    this.queue = [];
  }
}

/**
 * 内存管理工具
 */
export class MemoryManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.accessOrder = [];
  }

  set(key, value) {
    // LRU缓存策略
    if (this.cache.has(key)) {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    } else if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, value);
    this.accessOrder.push(key);
  }

  get(key) {
    if (this.cache.has(key)) {
      // 更新访问顺序
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
      return this.cache.get(key);
    }
    return null;
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.accessOrder.length > 0 ? this.cache.size / this.accessOrder.length : 0
    };
  }
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  startTimer(name) {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  endTimer(name) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      if (metric.duration > 16) { // 超过一帧的时间
        console.warn(`⚡ [Performance] ${name} 耗时过长: ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  getMetrics() {
    const results = {};
    this.metrics.forEach((value, key) => {
      results[key] = {
        duration: value.duration,
        isComplete: value.endTime !== null
      };
    });
    return results;
  }

  clear() {
    this.metrics.clear();
  }
}

/**
 * 几何计算优化工具
 */
export class GeometryCalculator {
  static distanceCache = new Map();

  /**
   * 计算两点间距离（带缓存）
   */
  static getDistance(point1, point2) {
    const key = `${point1.x},${point1.y}-${point2.x},${point2.y}`;
    
    if (this.distanceCache.has(key)) {
      return this.distanceCache.get(key);
    }
    
    const distance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
    
    this.distanceCache.set(key, distance);
    return distance;
  }

  /**
   * 检查点是否在矩形区域内
   */
  static isPointInRect(point, rect) {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width &&
           point.y >= rect.y && 
           point.y <= rect.y + rect.height;
  }

  /**
   * 获取最近的吸附点
   */
  static findClosestSnapPoint(targetPoint, snapPoints, maxDistance) {
    let closest = null;
    let minDistance = maxDistance;

    for (const snapPoint of snapPoints) {
      const distance = this.getDistance(targetPoint, snapPoint.position);
      if (distance < minDistance) {
        minDistance = distance;
        closest = { ...snapPoint, distance };
      }
    }

    return closest;
  }

  /**
   * 清理距离缓存
   */
  static clearCache() {
    this.distanceCache.clear();
  }
}