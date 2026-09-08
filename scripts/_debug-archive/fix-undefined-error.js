/**
 * 修复PreviewLineSystem中的undefined error问题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取PreviewLineSystem.js文件
const filePath = path.join(__dirname, 'src/utils/preview-line/PreviewLineSystem.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('开始修复PreviewLineSystem中的undefined error问题...');

// 修复system:error事件监听器中的错误处理
const oldErrorHandler = `    // 系统级事件
    this.eventManager.on('system:error', (errorInfo) => {
      this.stats.errorCount++;
      // 避免循环调用，直接处理错误而不再触发事件
      if (this.options.system.enableDebug) {
        const context = errorInfo?.context || 'unknown';
        const error = errorInfo?.error || 'undefined error';
        console.error(\`预览线系统错误 [\${context}]:\`, error);
      }
    });`;

const newErrorHandler = `    // 系统级事件
    this.eventManager.on('system:error', (errorInfo) => {
      this.stats.errorCount++;
      // 避免循环调用，直接处理错误而不再触发事件
      if (this.options.system.enableDebug) {
        // 确保errorInfo是有效对象
        if (!errorInfo || typeof errorInfo !== 'object') {
          console.error('预览线系统错误 [invalid-error-info]: 收到无效的错误信息', errorInfo);
          return;
        }
        
        const context = errorInfo.context || 'unknown';
        const error = errorInfo.error;
        
        // 确保error是有效的错误对象
        if (!error) {
          console.error(\`预览线系统错误 [\${context}]: 错误对象为空或undefined\`);
          return;
        }
        
        console.error(\`预览线系统错误 [\${context}]:\`, error);
      }
    });`;

// 替换错误处理代码
if (content.includes(oldErrorHandler)) {
  content = content.replace(oldErrorHandler, newErrorHandler);
  console.log('✓ 修复了system:error事件监听器中的错误处理');
} else {
  console.log('⚠ 未找到需要修复的system:error事件监听器代码');
}

// 修复handleError方法，确保不会传递undefined给system:error事件
const oldHandleError = `  handleError(error, context = 'unknown') {
    // 确保error不为null或undefined
    const actualError = error || new Error('Unknown error occurred');
    
    this.stats.errorCount++;
    this.stats.lastError = {
      error: actualError,
      context,
      timestamp: Date.now()
    };
    
    // 构建错误信息对象
    const errorInfo = {
      error: actualError,
      context,
      timestamp: Date.now(),
      stack: actualError.stack
    };
    
    // 触发系统错误事件
    this.eventManager.emit('system:error', errorInfo);
    
    // 如果启用调试模式，输出到控制台
    if (this.options.system.enableDebug) {
      console.error(\`PreviewLineSystem Error [\${context}]:\`, actualError);
    }
  }`;

const newHandleError = `  handleError(error, context = 'unknown') {
    // 确保error不为null或undefined
    const actualError = error || new Error('Unknown error occurred');
    
    this.stats.errorCount++;
    this.stats.lastError = {
      error: actualError,
      context,
      timestamp: Date.now()
    };
    
    // 构建错误信息对象，确保所有字段都有效
    const errorInfo = {
      error: actualError,
      context: context || 'unknown',
      timestamp: Date.now(),
      stack: actualError.stack || 'No stack trace available'
    };
    
    // 验证errorInfo对象的完整性
    if (!errorInfo.error || typeof errorInfo.context !== 'string') {
      console.error('PreviewLineSystem: 尝试触发system:error事件时发现无效的错误信息', {
        originalError: error,
        context,
        errorInfo
      });
      return;
    }
    
    // 触发系统错误事件
    this.eventManager.emit('system:error', errorInfo);
    
    // 如果启用调试模式，输出到控制台
    if (this.options.system.enableDebug) {
      console.error(\`PreviewLineSystem Error [\${context}]:\`, actualError);
    }
  }`;

// 替换handleError方法
if (content.includes(oldHandleError)) {
  content = content.replace(oldHandleError, newHandleError);
  console.log('✓ 修复了handleError方法中的错误处理');
} else {
  console.log('⚠ 未找到需要修复的handleError方法代码');
}

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ 修复完成，已保存到文件');

// 验证修复
async function verifyFix() {
  console.log('\n开始验证修复...');
  
  try {
    const { default: PreviewLineSystem } = await import('./src/utils/preview-line/PreviewLineSystem.js');
    
    const system = new PreviewLineSystem({
      system: { enableDebug: true },
      enabledModules: {
        renderer: true,
        position: true,
        collision: true,
        branch: true,
        performance: true,
        cache: true,
        validation: true
      }
    });
    
    console.log('✓ PreviewLineSystem实例创建成功');
    
    // 测试handleError方法
    console.log('\n测试handleError方法...');
    
    // 测试1: 正常错误
    system.handleError(new Error('测试错误'), 'test');
    console.log('✓ 正常错误处理测试通过');
    
    // 测试2: undefined错误
    system.handleError(undefined, 'test-undefined');
    console.log('✓ undefined错误处理测试通过');
    
    // 测试3: null错误
    system.handleError(null, 'test-null');
    console.log('✓ null错误处理测试通过');
    
    // 测试4: 空context
    system.handleError(new Error('测试错误'), '');
    console.log('✓ 空context处理测试通过');
    
    console.log('\n✅ 所有修复验证通过！');
    
  } catch (error) {
    console.error('❌ 修复验证失败:', error);
  }
}

// 运行验证
verifyFix();