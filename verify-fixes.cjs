#!/usr/bin/env node

console.log('🔍 验证非标准调用修复结果...\n');

const fs = require('fs');
const path = require('path');

// 需要检查的文件
const filesToCheck = [
  'src/pages/marketing/tasks/composables/canvas/usePreviewLine.js',
  'src/pages/marketing/tasks/utils/canvas/nodeConnectionHelper.js', 
  'src/pages/marketing/tasks/services/GraphService.js',
  'src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js'
];

let allFixed = true;

filesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // 检查是否还有直接的graph.addEdge调用（排除降级方案中的注释）
    const lines = content.split('\n');
    const directCalls = [];
    
    lines.forEach((line, index) => {
      if (line.includes('graph.addEdge(') || line.includes('this.graph.addEdge(')) {
        // 检查是否在降级方案的上下文中
        const contextStart = Math.max(0, index - 5);
        const contextEnd = Math.min(lines.length, index + 5);
        const context = lines.slice(contextStart, contextEnd).join('\n');
        
        // 排除UnifiedEdgeManager内部的正常调用和降级方案
        const isUnifiedEdgeManagerInternal = file.includes('UnifiedEdgeManager.js');
        const isInFallback = context.includes('降级方案') || context.includes('向后兼容');
        
        if (!isUnifiedEdgeManagerInternal && !isInFallback) {
          directCalls.push({
            line: index + 1,
            content: line.trim()
          });
        }
      }
    });
    
    // 检查保护日志
    const hasProtectionLog = content.includes('跳过连接线清理，保护所有真实连接');
    
    console.log(`📁 ${file}:`);
    
    if (directCalls.length > 0) {
      console.log(`  ❌ 发现 ${directCalls.length} 个非标准调用:`);
      directCalls.forEach(call => {
        console.log(`     第${call.line}行: ${call.content}`);
      });
      allFixed = false;
    } else {
      console.log(`  ✅ 无非标准调用`);
    }
    
    if (hasProtectionLog) {
      console.log(`  ❌ 仍包含保护日志`);
      allFixed = false;
    } else {
      console.log(`  ✅ 无保护日志`);
    }
    
    console.log('');
    
  } catch (error) {
    console.log(`  ❌ 文件读取失败: ${error.message}`);
    allFixed = false;
  }
});

console.log('📊 修复结果总结:');
if (allFixed) {
  console.log('✅ 所有非标准调用已修复，保护日志已移除');
} else {
  console.log('❌ 仍有问题需要修复');
}

// 检查UnifiedEdgeManager是否可用
try {
  console.log('\n🔧 检查UnifiedEdgeManager可用性...');
  const unifiedEdgeManagerPath = 'src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js';
  const content = fs.readFileSync(unifiedEdgeManagerPath, 'utf8');
  
  if (content.includes('export class UnifiedEdgeManager') || content.includes('export default class UnifiedEdgeManager')) {
    console.log('✅ UnifiedEdgeManager类可用');
  } else {
    console.log('❌ UnifiedEdgeManager类不可用');
  }
  
  if (content.includes('createPreviewLine') && content.includes('createConnection')) {
    console.log('✅ 核心方法可用');
  } else {
    console.log('❌ 核心方法不完整');
  }
  
} catch (error) {
  console.log(`❌ UnifiedEdgeManager检查失败: ${error.message}`);
}

process.exit(allFixed ? 0 : 1);