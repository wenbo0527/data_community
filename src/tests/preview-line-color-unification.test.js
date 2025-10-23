/**
 * 预览线颜色统一功能测试用例
 * 测试PreviewLineStyleManager的样式管理、主题切换、颜色统一等功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PreviewLineStyleManager, previewLineStyleManager } from '../pages/marketing/tasks/utils/canvas/PreviewLineStyleManager.js';

describe('预览线颜色统一功能测试', () => {
  let styleManager;
  let mockEdge;
  let mockListener;

  beforeEach(() => {
    // 创建新的样式管理器实例
    styleManager = new PreviewLineStyleManager();
    
    // 模拟X6边对象
    mockEdge = {
      id: 'test-edge-1',
      setAttrs: vi.fn(),
      getAttrs: vi.fn(() => ({})),
    };
    
    // 模拟监听器
    mockListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('样式管理器初始化', () => {
    it('应该正确初始化默认样式配置', () => {
      expect(styleManager.currentTheme).toBe('default');
      expect(styleManager.defaultStyles).toBeDefined();
      expect(styleManager.defaultStyles.preview).toBeDefined();
      expect(styleManager.defaultStyles.branchPreview).toBeDefined();
      expect(styleManager.defaultStyles.highlight).toBeDefined();
      expect(styleManager.defaultStyles.snap).toBeDefined();
    });

    it('应该包含所有预定义主题', () => {
      const themes = styleManager.getAvailableThemes();
      expect(themes).toContain('default');
      expect(themes).toContain('dark');
      expect(themes).toContain('colorful');
      expect(themes).toContain('minimal');
    });

    it('应该正确创建监听器集合', () => {
      expect(styleManager.listeners).toBeInstanceOf(Set);
      expect(styleManager.listeners.size).toBe(0);
    });
  });

  describe('样式获取功能', () => {
    it('应该正确获取默认预览线样式', () => {
      const style = styleManager.getStyle('preview');
      expect(style).toHaveProperty('stroke');
      expect(style).toHaveProperty('strokeWidth');
      expect(style).toHaveProperty('strokeDasharray');
      expect(style).toHaveProperty('strokeOpacity');
      expect(style).toHaveProperty('targetMarker');
    });

    it('应该正确获取分支预览线样式', () => {
      const style = styleManager.getStyle('branchPreview');
      expect(style.stroke).toBe('#52c41a');
      expect(style.strokeWidth).toBe(2);
      expect(style.strokeDasharray).toBe('3,3');
    });

    it('应该正确获取高亮样式', () => {
      const style = styleManager.getStyle('highlight');
      expect(style.stroke).toBe('#ff4d4f');
      expect(style.strokeWidth).toBe(3);
      expect(style.strokeOpacity).toBe(1);
    });

    it('应该正确获取吸附样式', () => {
      const style = styleManager.getStyle('snap');
      expect(style.stroke).toBe('#faad14');
      expect(style.strokeWidth).toBe(3);
      expect(style.strokeDasharray).toBe('10,5');
    });

    it('应该在样式类型不存在时返回默认样式', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const style = styleManager.getStyle('nonexistent');
      expect(style).toEqual(styleManager.defaultStyles.preview);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('未找到样式类型: nonexistent')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('主题切换功能', () => {
    it('应该成功切换到深色主题', () => {
      const result = styleManager.setTheme('dark');
      expect(result).toBe(true);
      expect(styleManager.getCurrentTheme()).toBe('dark');
    });

    it('应该成功切换到彩色主题', () => {
      const result = styleManager.setTheme('colorful');
      expect(result).toBe(true);
      expect(styleManager.getCurrentTheme()).toBe('colorful');
    });

    it('应该成功切换到简约主题', () => {
      const result = styleManager.setTheme('minimal');
      expect(result).toBe(true);
      expect(styleManager.getCurrentTheme()).toBe('minimal');
    });

    it('应该在主题不存在时保持当前主题', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalTheme = styleManager.getCurrentTheme();
      const result = styleManager.setTheme('nonexistent');
      
      expect(result).toBe(false);
      expect(styleManager.getCurrentTheme()).toBe(originalTheme);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('未找到主题: nonexistent')
      );
      consoleSpy.mockRestore();
    });

    it('应该在主题切换时通知监听器', () => {
      styleManager.addListener(mockListener);
      styleManager.setTheme('dark');
      
      expect(mockListener).toHaveBeenCalledWith('theme-changed', {
        oldTheme: 'default',
        newTheme: 'dark'
      });
    });
  });

  describe('自定义样式配置', () => {
    it('应该成功设置自定义样式', () => {
      const customStyle = {
        stroke: '#custom-color',
        strokeWidth: 5
      };
      
      const result = styleManager.setCustomStyle('preview', customStyle);
      expect(result).toBe(true);
      
      const style = styleManager.getStyle('preview');
      expect(style.stroke).toBe('#custom-color');
      expect(style.strokeWidth).toBe(5);
    });

    it('应该在设置自定义样式时通知监听器', () => {
      styleManager.addListener(mockListener);
      const customStyle = { stroke: '#test' };
      
      styleManager.setCustomStyle('preview', customStyle);
      
      expect(mockListener).toHaveBeenCalledWith('style-updated', {
        theme: 'default',
        type: 'preview',
        config: customStyle
      });
    });

    it('应该在主题不存在时返回失败', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = styleManager.setCustomStyle('preview', {}, 'nonexistent');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('主题不存在: nonexistent')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('主题重置功能', () => {
    it('应该成功重置默认主题', () => {
      // 先修改默认主题
      styleManager.setCustomStyle('preview', { stroke: '#modified' });
      
      // 验证修改生效
      let style = styleManager.getStyle('preview');
      expect(style.stroke).toBe('#modified');
      
      // 重置主题
      const result = styleManager.resetTheme('default');
      expect(result).toBe(true);
      
      // 验证样式已重置 - 重置后应该恢复到默认样式
      style = styleManager.getStyle('preview');
      expect(style.stroke).toBe('#1890ff'); // 默认颜色
    });

    it('应该在重置主题时通知监听器', () => {
      styleManager.addListener(mockListener);
      styleManager.resetTheme('default');
      
      expect(mockListener).toHaveBeenCalledWith('theme-reset', {
        theme: 'default'
      });
    });
  });

  describe('监听器管理', () => {
    it('应该成功添加监听器', () => {
      const result = styleManager.addListener(mockListener);
      expect(result).toBe(true);
      expect(styleManager.listeners.has(mockListener)).toBe(true);
    });

    it('应该拒绝添加非函数监听器', () => {
      const result = styleManager.addListener('not-a-function');
      expect(result).toBe(false);
    });

    it('应该成功移除监听器', () => {
      styleManager.addListener(mockListener);
      const result = styleManager.removeListener(mockListener);
      expect(result).toBe(true);
      expect(styleManager.listeners.has(mockListener)).toBe(false);
    });

    it('应该正确通知所有监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      styleManager.addListener(listener1);
      styleManager.addListener(listener2);
      
      styleManager.notifyListeners('test-event', { data: 'test' });
      
      expect(listener1).toHaveBeenCalledWith('test-event', { data: 'test' });
      expect(listener2).toHaveBeenCalledWith('test-event', { data: 'test' });
    });

    it('应该处理监听器执行错误', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      styleManager.addListener(errorListener);
      styleManager.notifyListeners('test-event', {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('监听器执行失败:'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('样式应用功能', () => {
    it('应该成功将样式应用到边对象', () => {
      const result = styleManager.applyStyleToEdge(mockEdge, 'preview');
      expect(result).toBe(true);
      expect(mockEdge.setAttrs).toHaveBeenCalledTimes(2); // 线条样式和箭头样式
    });

    it('应该在边对象无效时返回失败', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = styleManager.applyStyleToEdge(null, 'preview');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('无效的边对象')
      );
      consoleSpy.mockRestore();
    });

    it('应该处理样式应用错误', () => {
      mockEdge.setAttrs.mockImplementation(() => {
        throw new Error('Apply style error');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = styleManager.applyStyleToEdge(mockEdge, 'preview');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('应用样式失败:'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('CSS类名生成', () => {
    it('应该生成正确的CSS类名', () => {
      const className = styleManager.getStyleClassName('preview', 'dark');
      expect(className).toBe('preview-line-dark-preview');
    });

    it('应该使用当前主题生成CSS类名', () => {
      styleManager.setTheme('colorful');
      const className = styleManager.getStyleClassName('highlight');
      expect(className).toBe('preview-line-colorful-highlight');
    });
  });

  describe('配置导入导出', () => {
    it('应该正确导出配置', () => {
      const config = styleManager.exportConfig();
      expect(config).toHaveProperty('currentTheme');
      expect(config).toHaveProperty('themes');
      expect(config.currentTheme).toBe(styleManager.getCurrentTheme());
    });

    it('应该成功导入配置', () => {
      const config = {
        currentTheme: 'dark',
        themes: {
          default: {
            preview: { stroke: '#imported-color' }
          }
        }
      };
      
      styleManager.addListener(mockListener);
      const result = styleManager.importConfig(config);
      
      expect(result).toBe(true);
      expect(styleManager.getCurrentTheme()).toBe('dark');
      expect(mockListener).toHaveBeenCalledWith('config-imported', config);
    });

    it('应该处理配置导入错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const invalidConfig = null;
      
      const result = styleManager.importConfig(invalidConfig);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('配置导入失败:'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空样式配置', () => {
      const result = styleManager.setCustomStyle('preview', {});
      expect(result).toBe(true);
    });

    it('应该处理重复添加相同监听器', () => {
      styleManager.addListener(mockListener);
      styleManager.addListener(mockListener);
      expect(styleManager.listeners.size).toBe(1);
    });

    it('应该处理移除不存在的监听器', () => {
      const result = styleManager.removeListener(mockListener);
      expect(result).toBe(false);
    });
  });

  describe('全局单例测试', () => {
    it('应该提供全局单例实例', () => {
      expect(previewLineStyleManager).toBeInstanceOf(PreviewLineStyleManager);
    });

    it('全局实例应该具有完整功能', () => {
      expect(previewLineStyleManager.getStyle).toBeDefined();
      expect(previewLineStyleManager.setTheme).toBeDefined();
      expect(previewLineStyleManager.getCurrentTheme()).toBe('default');
    });
  });

  describe('性能测试', () => {
    it('应该能处理大量样式操作', () => {
      const startTime = performance.now();
      
      // 执行大量样式操作
      for (let i = 0; i < 1000; i++) {
        styleManager.getStyle('preview');
        styleManager.getStyle('branchPreview');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 性能测试：1000次操作应在100ms内完成
      expect(duration).toBeLessThan(100);
    });

    it('应该能处理大量监听器通知', () => {
      // 添加多个监听器
      for (let i = 0; i < 100; i++) {
        styleManager.addListener(() => {});
      }
      
      const startTime = performance.now();
      styleManager.notifyListeners('test-event', {});
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // 100个监听器通知应在50ms内完成
    });
  });
});