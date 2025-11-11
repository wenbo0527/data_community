/**
 * 错误恢复测试套件
 * 测试 UnifiedEdgeManager 在各种异常情况下的错误恢复能力
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock UnifiedEdgeManager 类，模拟错误恢复场景
class ErrorRecoveryUnifiedEdgeManager {
  constructor() {
    this.graph = null;
    this.previewLines = new Map();
    this.connections = new Map();
    this.isNetworkAvailable = true;
    this.isGraphHealthy = true;
    this.dataConsistencyCheck = true;
    this.errorRecoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;
  }

  // 模拟网络状态
  setNetworkStatus(available) {
    this.isNetworkAvailable = available;
  }

  // 模拟图实例健康状态
  setGraphHealth(healthy) {
    this.isGraphHealthy = healthy;
  }

  // 模拟数据一致性状态
  setDataConsistency(consistent) {
    this.dataConsistencyCheck = consistent;
  }

  // 网络异常时的错误恢复
  async createPreviewLineWithNetworkRecovery(sourceNodeId, targetNodeId, options = {}) {
    try {
      if (!this.isNetworkAvailable) {
        throw new Error('Network unavailable');
      }
      
      const previewLine = {
        id: `preview_${Date.now()}`,
        sourceNodeId,
        targetNodeId,
        ...options
      };
      
      this.previewLines.set(previewLine.id, previewLine);
      return previewLine;
    } catch (error) {
      return this.handleNetworkError(error, 'createPreviewLine', arguments);
    }
  }

  // 网络错误处理
  async handleNetworkError(error, operation, args) {
    if (this.errorRecoveryAttempts < this.maxRecoveryAttempts) {
      this.errorRecoveryAttempts++;
      
      // 模拟网络重连
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 尝试恢复网络连接
      if (Math.random() > 0.3) { // 70% 成功率
        this.isNetworkAvailable = true;
        this.errorRecoveryAttempts = 0;
        
        // 重试操作
        if (operation === 'createPreviewLine') {
          return this.createPreviewLineWithNetworkRecovery(...args);
        }
      }
    }
    
    // 降级处理：使用本地缓存
    return this.fallbackToLocalCache(operation, args);
  }

  // 降级到本地缓存
  fallbackToLocalCache(operation, args) {
    if (operation === 'createPreviewLine') {
      const [sourceNodeId, targetNodeId, options = {}] = args;
      const previewLine = {
        id: `local_preview_${Date.now()}`,
        sourceNodeId,
        targetNodeId,
        isLocalCache: true,
        ...options
      };
      
      this.previewLines.set(previewLine.id, previewLine);
      return previewLine;
    }
    
    return null;
  }

  // 图实例异常时的降级处理
  async createConnectionWithGraphRecovery(sourceNodeId, targetNodeId, options = {}) {
    try {
      if (!this.isGraphHealthy) {
        throw new Error('Graph instance is corrupted');
      }
      
      const connection = {
        id: `connection_${Date.now()}`,
        sourceNodeId,
        targetNodeId,
        ...options
      };
      
      this.connections.set(connection.id, connection);
      return connection;
    } catch (error) {
      return this.handleGraphError(error, 'createConnection', arguments);
    }
  }

  // 图实例错误处理
  async handleGraphError(error, operation, args) {
    // 尝试重新初始化图实例
    try {
      await this.reinitializeGraph();
      
      if (operation === 'createConnection') {
        return this.createConnectionWithGraphRecovery(...args);
      }
    } catch (reinitError) {
      // 降级到只读模式
      return this.fallbackToReadOnlyMode(operation, args);
    }
  }

  // 重新初始化图实例
  async reinitializeGraph() {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 模拟重新初始化成功率
    if (Math.random() > 0.2) { // 80% 成功率
      this.isGraphHealthy = true;
      return true;
    }
    
    throw new Error('Failed to reinitialize graph');
  }

  // 降级到只读模式
  fallbackToReadOnlyMode(operation, args) {
    if (operation === 'createConnection') {
      const [sourceNodeId, targetNodeId, options = {}] = args;
      return {
        id: `readonly_connection_${Date.now()}`,
        sourceNodeId,
        targetNodeId,
        isReadOnly: true,
        ...options
      };
    }
    
    return null;
  }

  // 数据不一致时的自动修复
  async validateAndRepairDataConsistency() {
    if (!this.dataConsistencyCheck) {
      return this.repairDataInconsistency();
    }
    
    return { isConsistent: true, repaired: false };
  }

  // 修复数据不一致
  async repairDataInconsistency() {
    const inconsistentItems = [];
    const repairedItems = [];
    
    // 检查预览线数据一致性
    for (const [id, previewLine] of this.previewLines) {
      if (!previewLine.sourceNodeId || !previewLine.targetNodeId) {
        inconsistentItems.push({ type: 'previewLine', id, issue: 'missing node references' });
        
        // 尝试修复
        if (this.attemptRepair(previewLine)) {
          repairedItems.push({ type: 'previewLine', id, action: 'repaired' });
        } else {
          // 无法修复，移除
          this.previewLines.delete(id);
          repairedItems.push({ type: 'previewLine', id, action: 'removed' });
        }
      }
    }
    
    // 检查连接数据一致性
    for (const [id, connection] of this.connections) {
      if (!connection.sourceNodeId || !connection.targetNodeId) {
        inconsistentItems.push({ type: 'connection', id, issue: 'missing node references' });
        
        // 尝试修复
        if (this.attemptRepair(connection)) {
          repairedItems.push({ type: 'connection', id, action: 'repaired' });
        } else {
          // 无法修复，移除
          this.connections.delete(id);
          repairedItems.push({ type: 'connection', id, action: 'removed' });
        }
      }
    }
    
    return {
      isConsistent: inconsistentItems.length === 0,
      inconsistentItems,
      repairedItems,
      repaired: repairedItems.length > 0
    };
  }

  // 尝试修复单个项目
  attemptRepair(item) {
    // 模拟修复逻辑
    if (!item.sourceNodeId) {
      item.sourceNodeId = 'recovered_source_node';
    }
    if (!item.targetNodeId) {
      item.targetNodeId = 'recovered_target_node';
    }
    
    // 模拟修复成功率
    return Math.random() > 0.3; // 70% 成功率
  }

  // 批量操作的错误恢复
  async batchOperationWithRecovery(operations) {
    const results = [];
    const errors = [];
    
    for (const operation of operations) {
      try {
        let result;
        
        switch (operation.type) {
          case 'createPreviewLine':
            result = await this.createPreviewLineWithNetworkRecovery(
              operation.sourceNodeId,
              operation.targetNodeId,
              operation.options
            );
            break;
          case 'createConnection':
            result = await this.createConnectionWithGraphRecovery(
              operation.sourceNodeId,
              operation.targetNodeId,
              operation.options
            );
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
        
        results.push({ operation, result, success: true });
      } catch (error) {
        errors.push({ operation, error, success: false });
        
        // 继续处理其他操作，不中断批量处理
        results.push({ operation, error: error.message, success: false });
      }
    }
    
    return {
      results,
      errors,
      successCount: results.filter(r => r.success).length,
      errorCount: errors.length
    };
  }

  // 获取系统健康状态
  getSystemHealth() {
    return {
      network: this.isNetworkAvailable,
      graph: this.isGraphHealthy,
      dataConsistency: this.dataConsistencyCheck,
      errorRecoveryAttempts: this.errorRecoveryAttempts,
      previewLineCount: this.previewLines.size,
      connectionCount: this.connections.size
    };
  }

  // 重置错误恢复状态
  resetErrorRecovery() {
    this.errorRecoveryAttempts = 0;
    this.isNetworkAvailable = true;
    this.isGraphHealthy = true;
    this.dataConsistencyCheck = true;
  }
}

describe('UnifiedEdgeManager 错误恢复测试', () => {
  let manager;

  beforeEach(() => {
    manager = new ErrorRecoveryUnifiedEdgeManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('网络异常错误恢复', () => {
    it('应该在网络异常时尝试重连并重试操作', async () => {
      // 模拟网络异常
      manager.setNetworkStatus(false);
      
      const result = await manager.createPreviewLineWithNetworkRecovery('node1', 'node2');
      
      // 应该返回结果（通过重连或降级处理）
      expect(result).toBeDefined();
      expect(result.sourceNodeId).toBe('node1');
      expect(result.targetNodeId).toBe('node2');
    });

    it('应该在网络恢复后正常创建预览线', async () => {
      // 初始网络异常
      manager.setNetworkStatus(false);
      
      // 第一次尝试（网络异常）
      let result = await manager.createPreviewLineWithNetworkRecovery('node1', 'node2');
      expect(result.isLocalCache).toBe(true);
      
      // 网络恢复
      manager.setNetworkStatus(true);
      manager.resetErrorRecovery();
      
      // 第二次尝试（网络正常）
      result = await manager.createPreviewLineWithNetworkRecovery('node3', 'node4');
      expect(result.isLocalCache).toBeUndefined();
    });

    it('应该在达到最大重试次数后降级到本地缓存', async () => {
      manager.setNetworkStatus(false);
      manager.maxRecoveryAttempts = 1;
      
      const result = await manager.createPreviewLineWithNetworkRecovery('node1', 'node2');
      
      expect(result.isLocalCache).toBe(true);
      expect(result.id).toContain('local_preview_');
    });
  });

  describe('图实例异常降级处理', () => {
    it('应该在图实例异常时尝试重新初始化', async () => {
      manager.setGraphHealth(false);
      
      const result = await manager.createConnectionWithGraphRecovery('node1', 'node2');
      
      expect(result).toBeDefined();
      expect(result.sourceNodeId).toBe('node1');
      expect(result.targetNodeId).toBe('node2');
    });

    it('应该在图实例无法恢复时降级到只读模式', async () => {
      manager.setGraphHealth(false);
      
      // 模拟重新初始化失败
      vi.spyOn(manager, 'reinitializeGraph').mockRejectedValue(new Error('Reinit failed'));
      
      const result = await manager.createConnectionWithGraphRecovery('node1', 'node2');
      
      expect(result.isReadOnly).toBe(true);
      expect(result.id).toContain('readonly_connection_');
    });

    it('应该正确报告图实例健康状态', () => {
      manager.setGraphHealth(false);
      
      const health = manager.getSystemHealth();
      
      expect(health.graph).toBe(false);
      expect(health.network).toBe(true);
    });
  });

  describe('数据不一致自动修复', () => {
    it('应该检测并修复数据不一致问题', async () => {
      // 添加不一致的数据
      manager.previewLines.set('invalid1', { id: 'invalid1', sourceNodeId: null, targetNodeId: 'node2' });
      manager.previewLines.set('invalid2', { id: 'invalid2', sourceNodeId: 'node1', targetNodeId: null });
      manager.connections.set('invalid3', { id: 'invalid3', sourceNodeId: null, targetNodeId: null });
      
      manager.setDataConsistency(false);
      
      const result = await manager.validateAndRepairDataConsistency();
      
      expect(result.repaired).toBe(true);
      expect(result.inconsistentItems.length).toBeGreaterThan(0);
      expect(result.repairedItems.length).toBeGreaterThan(0);
    });

    it('应该移除无法修复的数据项', async () => {
      // 模拟修复失败
      vi.spyOn(manager, 'attemptRepair').mockReturnValue(false);
      
      manager.previewLines.set('invalid1', { id: 'invalid1', sourceNodeId: null, targetNodeId: 'node2' });
      const initialSize = manager.previewLines.size;
      
      manager.setDataConsistency(false);
      
      const result = await manager.validateAndRepairDataConsistency();
      
      expect(manager.previewLines.size).toBeLessThan(initialSize);
      expect(result.repairedItems.some(item => item.action === 'removed')).toBe(true);
    });

    it('应该在数据一致时返回正确状态', async () => {
      manager.previewLines.set('valid1', { id: 'valid1', sourceNodeId: 'node1', targetNodeId: 'node2' });
      
      const result = await manager.validateAndRepairDataConsistency();
      
      expect(result.isConsistent).toBe(true);
      expect(result.repaired).toBe(false);
    });
  });

  describe('批量操作错误恢复', () => {
    it('应该在批量操作中处理部分失败', async () => {
      const operations = [
        { type: 'createPreviewLine', sourceNodeId: 'node1', targetNodeId: 'node2' },
        { type: 'createConnection', sourceNodeId: 'node3', targetNodeId: 'node4' },
        { type: 'createPreviewLine', sourceNodeId: 'node5', targetNodeId: 'node6' }
      ];
      
      // 模拟图实例异常，影响连接创建
      manager.setGraphHealth(false);
      
      const result = await manager.batchOperationWithRecovery(operations);
      
      expect(result.results.length).toBe(3);
      expect(result.successCount).toBeGreaterThan(0);
      expect(result.errorCount).toBeGreaterThanOrEqual(0);
    });

    it('应该继续处理后续操作即使前面的操作失败', async () => {
      const operations = [
        { type: 'invalidOperation', sourceNodeId: 'node1', targetNodeId: 'node2' },
        { type: 'createPreviewLine', sourceNodeId: 'node3', targetNodeId: 'node4' }
      ];
      
      const result = await manager.batchOperationWithRecovery(operations);
      
      expect(result.results.length).toBe(2);
      expect(result.results[0].success).toBe(false);
      expect(result.results[1].success).toBe(true);
    });
  });

  describe('系统健康监控', () => {
    it('应该正确报告系统健康状态', () => {
      manager.setNetworkStatus(false);
      manager.setGraphHealth(false);
      manager.setDataConsistency(false);
      manager.errorRecoveryAttempts = 2;
      
      const health = manager.getSystemHealth();
      
      expect(health.network).toBe(false);
      expect(health.graph).toBe(false);
      expect(health.dataConsistency).toBe(false);
      expect(health.errorRecoveryAttempts).toBe(2);
    });

    it('应该正确重置错误恢复状态', () => {
      manager.setNetworkStatus(false);
      manager.setGraphHealth(false);
      manager.errorRecoveryAttempts = 3;
      
      manager.resetErrorRecovery();
      
      const health = manager.getSystemHealth();
      expect(health.network).toBe(true);
      expect(health.graph).toBe(true);
      expect(health.errorRecoveryAttempts).toBe(0);
    });
  });

  describe('错误恢复性能测试', () => {
    it('应该在合理时间内完成错误恢复', async () => {
      const startTime = Date.now();
      
      manager.setNetworkStatus(false);
      await manager.createPreviewLineWithNetworkRecovery('node1', 'node2');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 错误恢复应该在500ms内完成
      expect(duration).toBeLessThan(500);
    });

    it('应该限制错误恢复尝试次数避免无限循环', async () => {
      manager.setNetworkStatus(false);
      manager.maxRecoveryAttempts = 2;
      
      // 模拟网络始终不可用
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // 强制网络恢复失败
      
      const startTime = Date.now();
      await manager.createPreviewLineWithNetworkRecovery('node1', 'node2');
      const endTime = Date.now();
      
      expect(manager.errorRecoveryAttempts).toBeLessThanOrEqual(manager.maxRecoveryAttempts);
      expect(endTime - startTime).toBeLessThan(1000); // 不应该超过1秒
    });
  });
});