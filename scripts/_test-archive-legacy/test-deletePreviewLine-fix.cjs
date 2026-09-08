/**
 * 测试 deletePreviewLine 方法修复
 */

// 模拟导入
const path = require('path');
const fs = require('fs');

// 简单的测试函数
function testDeletePreviewLineMethodExists() {
  console.log('🧪 测试 deletePreviewLine 方法是否存在');
  
  try {
    // 检查 PreviewLineRenderer 文件
    const rendererPath = path.join(__dirname, 'src/utils/preview-line/renderers/PreviewLineRenderer.js');
    const rendererContent = fs.readFileSync(rendererPath, 'utf8');
    
    // 检查是否包含 deletePreviewLine 方法
    const hasDeleteMethod = rendererContent.includes('deletePreviewLine(lineId)');
    
    if (hasDeleteMethod) {
      console.log('✅ PreviewLineRenderer 中找到 deletePreviewLine 方法');
    } else {
      console.log('❌ PreviewLineRenderer 中未找到 deletePreviewLine 方法');
      return false;
    }
    
    // 检查 PreviewLineSystem 文件
    const systemPath = path.join(__dirname, 'src/utils/preview-line/PreviewLineSystem.js');
    const systemContent = fs.readFileSync(systemPath, 'utf8');
    
    // 检查是否调用了 renderer.deletePreviewLine
    const hasRendererCall = systemContent.includes('this.renderer.deletePreviewLine(id)');
    
    if (hasRendererCall) {
      console.log('✅ PreviewLineSystem 中找到对 renderer.deletePreviewLine 的调用');
    } else {
      console.log('❌ PreviewLineSystem 中未找到对 renderer.deletePreviewLine 的调用');
      return false;
    }
    
    // 检查 PreviewLineManager 是否有渲染器注入
    const hasRendererInjection = systemContent.includes('this.previewLineManager.renderer = this.renderer');
    
    if (hasRendererInjection) {
      console.log('✅ PreviewLineSystem 中找到渲染器注入逻辑');
    } else {
      console.log('❌ PreviewLineSystem 中未找到渲染器注入逻辑');
      return false;
    }
    
    console.log('\n🎉 所有检查通过！deletePreviewLine 方法修复成功');
    return true;
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    return false;
  }
}

// 测试 forceRegeneratePreviewLines 中的错误修复
function testForceRegeneratePreviewLinesError() {
  console.log('\n🧪 测试 forceRegeneratePreviewLines 中的错误修复');
  
  try {
    const systemPath = path.join(__dirname, 'src/utils/preview-line/PreviewLineSystem.js');
    const systemContent = fs.readFileSync(systemPath, 'utf8');
    
    // 检查 forceRegeneratePreviewLines 方法中是否正确调用 deletePreviewLine
    const forceRegenerateMatch = systemContent.match(/async forceRegeneratePreviewLines[\s\S]*?^  }/gm);
    
    if (forceRegenerateMatch && forceRegenerateMatch.length > 0) {
      const forceRegenerateCode = forceRegenerateMatch[0];
      
      // 检查是否使用了正确的方法调用
      if (forceRegenerateCode.includes('await this.deletePreviewLine(line.id)')) {
        console.log('✅ forceRegeneratePreviewLines 中正确调用了 await this.deletePreviewLine');
        return true;
      } else if (forceRegenerateCode.includes('this.deletePreviewLine(line.id)')) {
        console.log('✅ forceRegeneratePreviewLines 中正确调用了 this.deletePreviewLine');
        return true;
      } else if (forceRegenerateCode.includes('this.renderer.deletePreviewLine(line.id)')) {
        console.log('⚠️ forceRegeneratePreviewLines 中直接调用了 renderer.deletePreviewLine，建议使用 this.deletePreviewLine');
        return true;
      } else {
        console.log('❌ forceRegeneratePreviewLines 中未找到正确的删除调用');
        console.log('调试信息: 方法内容片段:', forceRegenerateCode.substring(0, 500));
        return false;
      }
    } else {
      console.log('❌ 未找到 forceRegeneratePreviewLines 方法');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    return false;
  }
}

// 运行所有测试
function runTests() {
  console.log('🚀 开始运行 deletePreviewLine 修复验证测试');
  console.log('=' .repeat(60));
  
  const test1 = testDeletePreviewLineMethodExists();
  const test2 = testForceRegeneratePreviewLinesError();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 测试结果汇总:');
  console.log(`1. deletePreviewLine 方法存在性测试: ${test1 ? '✅ 通过' : '❌ 失败'}`);
  console.log(`2. forceRegeneratePreviewLines 错误修复测试: ${test2 ? '✅ 通过' : '❌ 失败'}`);
  
  const allPassed = test1 && test2;
  console.log('\n' + '=' .repeat(60));
  
  if (allPassed) {
    console.log('🎉 所有测试通过！deletePreviewLine 方法修复成功。');
  } else {
    console.log('⚠️ 部分测试失败，请检查相关修复。');
  }
  
  return allPassed;
}

// 执行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testDeletePreviewLineMethodExists,
  testForceRegeneratePreviewLinesError
};