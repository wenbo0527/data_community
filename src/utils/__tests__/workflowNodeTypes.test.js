import { describe, it, expect } from 'vitest';
import {
  IconFile,
  IconFilter,
  IconLink,
  IconCode,
  IconFormula,
  IconExport
} from '@arco-design/web-vue/es/icon';
import {
  NodeType,
  NODE_TYPE_ICON_MAP,
  PROCESSING_TYPE_LIST,
  getNodeTypeIcon,
  getNodeTypeName,
  getNodeTypeColor
} from '../workflowNodeTypes.js';

describe('workflowNodeTypes 图标导入测试', () => {
  it('应该成功导入所有Arco Design Vue图标', () => {
    // 验证所有图标都是有效的组件
    expect(IconFile).toBeDefined();
    expect(IconFilter).toBeDefined();
    expect(IconLink).toBeDefined();
    expect(IconCode).toBeDefined();
    expect(IconFormula).toBeDefined();
    expect(IconExport).toBeDefined();
    
    // 验证图标是Vue组件
    expect(typeof IconFile).toBe('object');
    expect(typeof IconFilter).toBe('object');
    expect(typeof IconLink).toBe('object');
    expect(typeof IconCode).toBe('object');
    expect(typeof IconFormula).toBe('object');
    expect(typeof IconExport).toBe('object');
  });

  it('NODE_TYPE_ICON_MAP 应该包含所有节点类型的有效图标', () => {
    // 验证映射表包含所有节点类型
    expect(NODE_TYPE_ICON_MAP[NodeType.INPUT]).toBe(IconFile);
    expect(NODE_TYPE_ICON_MAP[NodeType.FILTER]).toBe(IconFilter);
    expect(NODE_TYPE_ICON_MAP[NodeType.JOIN]).toBe(IconLink);
    expect(NODE_TYPE_ICON_MAP[NodeType.UNION]).toBe(IconCode);
    expect(NODE_TYPE_ICON_MAP[NodeType.AGG]).toBe(IconFormula);
    expect(NODE_TYPE_ICON_MAP[NodeType.OUTPUT]).toBe(IconExport);
    
    // 验证所有映射的图标都是有效的
    Object.values(NODE_TYPE_ICON_MAP).forEach(icon => {
      expect(icon).toBeDefined();
      expect(typeof icon).toBe('object');
    });
  });

  it('PROCESSING_TYPE_LIST 应该包含正确的图标名称', () => {
    const expectedIcons = {
      [NodeType.INPUT]: 'IconFile',
      [NodeType.FILTER]: 'IconFilter',
      [NodeType.JOIN]: 'IconLink',
      [NodeType.UNION]: 'IconCode',
      [NodeType.AGG]: 'IconFormula',
      [NodeType.OUTPUT]: 'IconExport'
    };
    
    PROCESSING_TYPE_LIST.forEach(item => {
      expect(item.icon).toBe(expectedIcons[item.type]);
      expect(item.icon).not.toContain('IconCalculator'); // 确保不包含已删除的图标
      expect(item.icon).not.toContain('IconFunction'); // 确保不包含不存在的图标
    });
  });

  it('getNodeTypeIcon 函数应该返回有效的图标组件', () => {
    // 测试所有节点类型
    Object.values(NodeType).forEach(type => {
      const icon = getNodeTypeIcon(type);
      expect(icon).toBeDefined();
      expect(typeof icon).toBe('object');
    });
    
    // 测试默认情况
    const defaultIcon = getNodeTypeIcon('UNKNOWN_TYPE');
    expect(defaultIcon).toBe(IconFile); // 应该返回默认图标
  });

  it('所有工具函数应该正常工作', () => {
    // 测试 getNodeTypeName
    expect(getNodeTypeName(NodeType.AGG)).toBe('数据聚合');
    expect(getNodeTypeName('UNKNOWN')).toBe('UNKNOWN');
    
    // 测试 getNodeTypeColor
    expect(getNodeTypeColor(NodeType.AGG)).toBe('#722ed1');
    expect(getNodeTypeColor('UNKNOWN')).toBe('#1890ff');
  });

  it('不应该包含任何不存在的图标引用', () => {
    // 检查代码中不应该包含这些不存在的图标
    const invalidIcons = ['IconCalculator', 'IconFunction', 'IconDatabase', 'IconUnion'];
    
    // 检查 PROCESSING_TYPE_LIST
    PROCESSING_TYPE_LIST.forEach(item => {
      invalidIcons.forEach(invalidIcon => {
        expect(item.icon).not.toBe(invalidIcon);
      });
    });
    
    // 检查 NODE_TYPE_ICON_MAP 的值不是 undefined
    Object.values(NODE_TYPE_ICON_MAP).forEach(icon => {
      expect(icon).not.toBeUndefined();
    });
  });
});