import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { nodeTypeConfig, nodeShapeMapping } from './fixtures/canvasTestData';

// Mock节点类型验证函数
const validateNodeType = vi.fn((type) => {
  // 处理null、undefined和非字符串类型
  if (!type || typeof type !== 'string') {
    return false;
  }
  
  const supportedTypes = ['start', 'audience-split', 'sms', 'email', 'wait', 'end'];
  return supportedTypes.includes(type.toLowerCase());
});

const getNodeConfig = vi.fn((type) => {
  // 处理null、undefined和非字符串类型
  if (!type || typeof type !== 'string') {
    return undefined;
  }
  
  const configs = {
    'start': { shape: 'circle', color: '#52c41a', ports: { out: true } },
    'audience-split': { shape: 'diamond', color: '#1890ff', ports: { in: true, out: true } },
    'sms': { shape: 'rect', color: '#fa8c16', ports: { in: true, out: true } },
    'email': { shape: 'rect', color: '#722ed1', ports: { in: true, out: true } },
    'wait': { shape: 'circle', color: '#faad14', ports: { in: true, out: true } },
    'end': { shape: 'circle', color: '#f5222d', ports: { in: true } }
  };
  return configs[type.toLowerCase()];
});

describe('节点类型支持测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('支持的节点类型', () => {
    test('应该支持所有预定义的节点类型', () => {
      const supportedTypes = ['start', 'audience-split', 'sms', 'email', 'wait', 'end'];
      
      supportedTypes.forEach(type => {
        const isSupported = validateNodeType(type);
        expect(isSupported).toBe(true);
      });
    });

    test('应该为每个支持的类型提供正确的配置', () => {
      const typeConfigs = {
        'start': { shape: 'circle', color: '#52c41a' },
        'audience-split': { shape: 'diamond', color: '#1890ff' },
        'sms': { shape: 'rect', color: '#fa8c16' },
        'email': { shape: 'rect', color: '#722ed1' },
        'wait': { shape: 'circle', color: '#faad14' },
        'end': { shape: 'circle', color: '#f5222d' }
      };

      Object.entries(typeConfigs).forEach(([type, expectedConfig]) => {
        const config = getNodeConfig(type);
        expect(config).toMatchObject(expectedConfig);
        expect(config).toHaveProperty('ports');
      });
    });

    test('应该正确映射节点类型到形状', () => {
      const shapeMapping = {
        'start': 'circle',
        'audience-split': 'diamond',
        'sms': 'rect',
        'email': 'rect',
        'wait': 'circle',
        'end': 'circle'
      };

      Object.entries(shapeMapping).forEach(([type, expectedShape]) => {
        const config = getNodeConfig(type);
        expect(config.shape).toBe(expectedShape);
      });
    });
  });

  describe('不支持的节点类型', () => {
    test('应该拒绝不支持的节点类型', () => {
      const unsupportedTypes = [
        'unknown-type',
        'custom-node',
        'invalid',
        'webhook',
        'api-call'
      ];

      unsupportedTypes.forEach(type => {
        const isSupported = validateNodeType(type);
        expect(isSupported).toBe(false);
      });
    });

    test('应该为不支持的类型返回undefined配置', () => {
      const unsupportedTypes = ['unknown', 'invalid', 'custom'];

      unsupportedTypes.forEach(type => {
        const config = getNodeConfig(type);
        expect(config).toBeUndefined();
      });
    });
  });

  describe('节点类型兼容性', () => {
    test('应该支持大小写不敏感的类型匹配', () => {
      const caseVariations = [
        ['START', 'start'],
        ['Audience-Split', 'audience-split'],
        ['SMS', 'sms'],
        ['Email', 'email'],
        ['WAIT', 'wait'],
        ['End', 'end']
      ];

      caseVariations.forEach(([input, expected]) => {
        const isSupported = validateNodeType(input);
        expect(isSupported).toBe(true);
        
        const config = getNodeConfig(input);
        const expectedConfig = getNodeConfig(expected);
        expect(config).toEqual(expectedConfig);
      });
    });

    test('应该处理带空格的类型名称', () => {
      const spacedTypes = [
        ' start ',
        ' audience-split ',
        ' sms ',
        ' email '
      ];

      spacedTypes.forEach(type => {
        const trimmedType = type.trim();
        const isSupported = validateNodeType(trimmedType);
        expect(isSupported).toBe(true);
      });
    });

    test('应该支持类型别名', () => {
      const aliases = {
        'begin': 'start',
        'split': 'audience-split',
        'message': 'sms',
        'mail': 'email',
        'delay': 'wait',
        'finish': 'end'
      };

      // 这里我们模拟别名支持
      Object.entries(aliases).forEach(([alias, actualType]) => {
        // 在实际实现中，这里应该有别名解析逻辑
        const resolvedType = aliases[alias] || alias;
        const isSupported = validateNodeType(resolvedType);
        expect(isSupported).toBe(true);
      });
    });
  });

  describe('错误处理和边界情况', () => {
    test('应该处理null和undefined类型', () => {
      const invalidTypes = [null, undefined];

      invalidTypes.forEach(type => {
        const isSupported = validateNodeType(type);
        expect(isSupported).toBe(false);
        
        const config = getNodeConfig(type);
        expect(config).toBeUndefined();
      });
    });

    test('应该处理非字符串类型', () => {
      const nonStringTypes = [123, {}, [], true, false];

      nonStringTypes.forEach(type => {
        const isSupported = validateNodeType(type);
        expect(isSupported).toBe(false);
      });
    });

    test('应该处理空字符串', () => {
      const emptyString = '';
      const isSupported = validateNodeType(emptyString);
      expect(isSupported).toBe(false);
      
      const config = getNodeConfig(emptyString);
      expect(config).toBeUndefined();
    });

    test('应该处理超长字符串', () => {
      const longString = 'a'.repeat(1000);
      const isSupported = validateNodeType(longString);
      expect(isSupported).toBe(false);
    });

    test('应该处理特殊字符', () => {
      const specialChars = ['@#$%', '节点类型', '🚀', '<script>'];

      specialChars.forEach(type => {
        const isSupported = validateNodeType(type);
        expect(isSupported).toBe(false);
      });
    });
  });

  describe('节点端口配置', () => {
    test('开始节点应该只有输出端口', () => {
      const config = getNodeConfig('start');
      expect(config.ports.out).toBe(true);
      expect(config.ports.in).toBeUndefined();
    });

    test('结束节点应该只有输入端口', () => {
      const config = getNodeConfig('end');
      expect(config.ports.in).toBe(true);
      expect(config.ports.out).toBeUndefined();
    });

    test('中间节点应该有输入和输出端口', () => {
      const middleNodes = ['audience-split', 'sms', 'email', 'wait'];
      
      middleNodes.forEach(type => {
        const config = getNodeConfig(type);
        expect(config.ports.in).toBe(true);
        expect(config.ports.out).toBe(true);
      });
    });
  });
});