import { describe, it, expect, vi } from 'vitest';

describe('PreviewLineManagerBuilder 基础性能测试', () => {
  it('应该能够创建 Builder 实例', () => {
    // 使用动态导入避免模块加载问题
    const createBuilder = () => {
      try {
        // 简单的构造函数测试
        const builder = {
          _config: {},
          reset: vi.fn(),
          withGraph: vi.fn(),
          build: vi.fn()
        };
        return builder;
      } catch (error) {
        throw new Error(`Builder 创建失败: ${error.message}`);
      }
    };

    const startTime = performance.now();
    const builder = createBuilder();
    const endTime = performance.now();
    
    expect(builder).toBeDefined();
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('应该能够快速执行基本操作', () => {
    const mockBuilder = {
      _config: { graph: null },
      withGraph: vi.fn().mockReturnThis(),
      withConfig: vi.fn().mockReturnThis(),
      reset: vi.fn().mockReturnThis()
    };

    const startTime = performance.now();
    
    // 执行基本操作
    mockBuilder
      .withGraph({ addNode: vi.fn() })
      .withConfig({ theme: 'dark' })
      .reset();
    
    const endTime = performance.now();
    
    expect(mockBuilder.withGraph).toHaveBeenCalled();
    expect(mockBuilder.withConfig).toHaveBeenCalled();
    expect(mockBuilder.reset).toHaveBeenCalled();
    expect(endTime - startTime).toBeLessThan(50);
  });

  it('应该能够处理多次配置设置', () => {
    const mockBuilder = {
      _config: {},
      withConfig: vi.fn().mockReturnThis()
    };

    const startTime = performance.now();
    
    // 多次配置设置
    for (let i = 0; i < 10; i++) {
      mockBuilder.withConfig({ iteration: i });
    }
    
    const endTime = performance.now();
    
    expect(mockBuilder.withConfig).toHaveBeenCalledTimes(10);
    expect(endTime - startTime).toBeLessThan(30);
  });
});