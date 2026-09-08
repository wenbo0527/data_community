import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PreviewLineManagerBuilder } from '../utils/preview-line/core/PreviewLineManagerBuilder.js';

describe('PreviewLineManagerBuilder 性能测试', () => {
  let mockGraph, mockConfigManager, mockEventManager, mockLayoutEngine;

  beforeEach(() => {
    // 创建轻量级的 mock 对象
    mockGraph = { 
      addNode: vi.fn(),
      addEdge: vi.fn()
    };
    
    mockConfigManager = {
       get: vi.fn().mockReturnValue({}),
       set: vi.fn(),
       onChange: vi.fn()
     };
    
    mockEventManager = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    };
    
    mockLayoutEngine = {
      calculateLayout: vi.fn()
    };
  });

  it('Builder 实例创建性能测试', () => {
    const startTime = performance.now();
    
    // 创建 10 个 Builder 实例
    const builders = [];
    for (let i = 0; i < 10; i++) {
      builders.push(new PreviewLineManagerBuilder());
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(builders).toHaveLength(10);
    expect(duration).toBeLessThan(200); // 放宽时间限制
  });

  it('Builder 配置设置性能测试', () => {
    const builder = new PreviewLineManagerBuilder();
    const startTime = performance.now();
    
    // 简单的配置设置测试
    builder
      .withGraph(mockGraph)
      .withConfigManager(mockConfigManager)
      .withEventManager(mockEventManager)
      .withLayoutEngine(mockLayoutEngine);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // 应该在 100ms 内完成
  });

  it('预设配置方法性能测试', () => {
    const builder = new PreviewLineManagerBuilder();
    const startTime = performance.now();
    
    // 测试预设配置方法
    builder
      .withDarkTheme()
      .withLightTheme()
      .withAnimationEnabled()
      .withAnimationDisabled();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(50); // 应该在 50ms 内完成
  });
})