/**
 * 测试Y坐标NaN问题修复效果
 * 模拟用户遇到的布局问题场景
 */

import { HierarchyLayoutEngine } from './src/composables/layout/HierarchyLayoutEngine.js';

// 模拟测试数据
const testLayoutData = {
  nodes: [
    {
      id: 'start-node',
      type: 'start',
      x: -86,
      y: -86,
      width: 120,
      height: 60
    },
    {
      id: 'node_1755503018616',
      type: 'process',
      x: 270,
      y: 290,
      width: 120,
      height: 60
    },
    {
      id: 'node_1756349534104',
      type: 'process',
      x: 70,
      y: 460,
      width: 120,
      height: 60
    }
  ],
  edges: [
    {
      id: 'edge1',
      source: 'start-node',
      target: 'node_1755503018616'
    },
    {
      id: 'edge2',
      source: 'start-node',
      target: 'node_1756349534104'
    }
  ],
  previewEndpoints: []
};

// 测试不同的layer.height配置
const testConfigs = [
  {
    name: '正常配置',
    options: {
      layer: { height: 200 },
      debug: true
    }
  },
  {
    name: 'layer.height为0（会导致NaN）',
    options: {
      layer: { height: 0 },
      debug: true
    }
  },
  {
    name: 'layer.height为undefined（会导致NaN）',
    options: {
      layer: { height: undefined },
      debug: true
    }
  },
  {
    name: 'layer.height为NaN（会导致NaN）',
    options: {
      layer: { height: NaN },
      debug: true
    }
  },
  {
    name: 'layer.height为负数（会导致问题）',
    options: {
      layer: { height: -100 },
      debug: true
    }
  }
];

async function runTests() {
  console.log('🧪 开始测试Y坐标NaN问题修复效果\n');
  
  for (const config of testConfigs) {
    console.log(`\n🔬 测试场景: ${config.name}`);
    console.log('=' .repeat(50));
    
    try {
      // 创建布局引擎实例
      const layoutEngine = new HierarchyLayoutEngine(null, config.options);
      
      // 执行布局计算
      const result = await layoutEngine.calculateLayout(testLayoutData);
      
      console.log('📊 布局结果:', {
        成功: result.success,
        错误: result.error,
        节点数量: result.positions.size
      });
      
      if (result.success && result.positions.size > 0) {
        console.log('\n📍 节点位置详情:');
        result.positions.forEach((position, nodeId) => {
          console.log(`  ${nodeId}: x=${position.x}, y=${position.y} (x类型: ${typeof position.x}, y类型: ${typeof position.y}, x是否NaN: ${isNaN(position.x)}, y是否NaN: ${isNaN(position.y)})`);
        });
        
        // 检查是否还有NaN坐标
        let hasNaN = false;
        result.positions.forEach((position, nodeId) => {
          if (isNaN(position.x) || isNaN(position.y)) {
            console.error(`❌ 发现NaN坐标: ${nodeId} - x: ${position.x}, y: ${position.y}`);
            hasNaN = true;
          }
        });
        
        if (!hasNaN) {
          console.log('✅ 所有节点坐标都有效，没有NaN值');
        }
      }
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    }
  }
  
  console.log('\n🎯 测试完成！');
}

// 运行测试
runTests().catch(console.error);