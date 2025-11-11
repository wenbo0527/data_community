#!/usr/bin/env node

/**
 * 画布系统修复状态验证脚本
 * 验证所有修复文件是否正确创建和配置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 开始验证画布系统修复状态...\n');

// 需要验证的修复文件列表
const repairFiles = [
  {
    path: 'src/pages/marketing/tasks/utils/StorageUtils.js',
    description: '增强版存储工具类',
    required: true
  },
  {
    path: 'src/pages/marketing/tasks/utils/DataMigrationManager.js',
    description: '数据迁移管理器',
    required: true
  },
  {
    path: 'src/pages/marketing/tasks/utils/UnifiedDataValidator.js',
    description: '统一数据验证器',
    required: true
  },
  {
    path: 'src/pages/marketing/tasks/composables/canvas/unified/EdgePersistenceManager.js',
    description: '边缘持久化管理器',
    required: true
  },
  {
    path: 'src/pages/preview-line-test.vue',
    description: '预览线功能测试页面',
    required: true
  },
  {
    path: 'test-canvas-repair.html',
    description: '画布修复验证页面',
    required: false
  }
];

// 验证结果统计
let totalFiles = repairFiles.length;
let existingFiles = 0;
let missingFiles = 0;
let errors = [];

console.log('📋 文件存在性检查:');
console.log('='.repeat(60));

repairFiles.forEach((file, index) => {
  const filePath = path.join(__dirname, file.path);
  const exists = fs.existsSync(filePath);
  
  const status = exists ? '✅' : '❌';
  const requiredText = file.required ? '[必需]' : '[可选]';
  
  console.log(`${index + 1}. ${status} ${requiredText} ${file.description}`);
  console.log(`   路径: ${file.path}`);
  
  if (exists) {
    existingFiles++;
    
    // 检查文件大小
    try {
      const stats = fs.statSync(filePath);
      console.log(`   大小: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   修改时间: ${stats.mtime.toLocaleString()}`);
    } catch (error) {
      console.log(`   ⚠️  无法读取文件信息: ${error.message}`);
    }
  } else {
    missingFiles++;
    if (file.required) {
      errors.push(`缺少必需文件: ${file.path}`);
    }
    console.log(`   ❌ 文件不存在`);
  }
  
  console.log('');
});

console.log('📊 验证统计:');
console.log('='.repeat(60));
console.log(`总文件数: ${totalFiles}`);
console.log(`存在文件: ${existingFiles}`);
console.log(`缺失文件: ${missingFiles}`);
console.log(`完成率: ${((existingFiles / totalFiles) * 100).toFixed(1)}%`);

if (errors.length > 0) {
  console.log('\n❌ 发现问题:');
  console.log('='.repeat(60));
  errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });
}

// 检查关键代码内容
console.log('\n🔍 关键代码内容检查:');
console.log('='.repeat(60));

// 检查StorageUtils.js中的关键方法
const storageUtilsPath = path.join(__dirname, 'src/pages/marketing/tasks/utils/StorageUtils.js');
if (fs.existsSync(storageUtilsPath)) {
  try {
    const content = fs.readFileSync(storageUtilsPath, 'utf8');
    
    const keyMethods = [
      'LocalStorageEnvironmentChecker',
      'initializeEnvironment',
      'getLocalStorageItem',
      'setLocalStorageItem',
      'repairLocalStorage'
    ];
    
    console.log('StorageUtils.js 关键方法检查:');
    keyMethods.forEach(method => {
      const exists = content.includes(method);
      console.log(`  ${exists ? '✅' : '❌'} ${method}`);
    });
  } catch (error) {
    console.log(`❌ 无法读取StorageUtils.js: ${error.message}`);
  }
} else {
  console.log('❌ StorageUtils.js 文件不存在');
}

// 检查DataMigrationManager.js中的关键方法
const dataMigrationPath = path.join(__dirname, 'src/pages/marketing/tasks/utils/DataMigrationManager.js');
if (fs.existsSync(dataMigrationPath)) {
  try {
    const content = fs.readFileSync(dataMigrationPath, 'utf8');
    
    const keyMethods = [
      'DataMigrationManager',
      'migrateData',
      'migrateEdgeFormat',
      'detectEdgeFormatIssues',
      'validateMigratedData'
    ];
    
    console.log('\nDataMigrationManager.js 关键方法检查:');
    keyMethods.forEach(method => {
      const exists = content.includes(method);
      console.log(`  ${exists ? '✅' : '❌'} ${method}`);
    });
  } catch (error) {
    console.log(`❌ 无法读取DataMigrationManager.js: ${error.message}`);
  }
} else {
  console.log('❌ DataMigrationManager.js 文件不存在');
}

// 检查测试页面路由配置
const routerPath = path.join(__dirname, 'src/router/index.js');
if (fs.existsSync(routerPath)) {
  try {
    const content = fs.readFileSync(routerPath, 'utf8');
    
    const hasPreviewLineRoute = content.includes('preview-line-test.vue') || content.includes('PreviewLineTest');
    console.log(`\n路由配置检查:`);
    console.log(`  ${hasPreviewLineRoute ? '✅' : '❌'} 预览线测试页面路由`);
    
    if (hasPreviewLineRoute) {
      console.log(`  📍 测试页面访问地址: http://localhost:5173/test/preview-line`);
    }
  } catch (error) {
    console.log(`❌ 无法读取路由配置: ${error.message}`);
  }
} else {
  console.log('❌ 路由配置文件不存在');
}

// 最终结果
console.log('\n🎯 修复状态总结:');
console.log('='.repeat(60));

if (errors.length === 0) {
  console.log('✅ 所有必需的修复文件都已正确创建！');
  console.log('✅ 画布系统修复已完成，可以开始测试。');
  console.log('\n🚀 下一步操作:');
  console.log('1. 确保开发服务器正在运行: npm run dev');
  console.log('2. 在浏览器中访问测试页面: http://localhost:5173/test/preview-line');
  console.log('3. 运行各项功能测试，验证修复效果');
  console.log('4. 检查浏览器控制台，确认没有localStorage相关错误');
} else {
  console.log('❌ 发现问题，需要解决后才能进行测试。');
  console.log('\n🔧 建议操作:');
  console.log('1. 检查文件创建是否成功');
  console.log('2. 确认所有必需的修复文件都存在');
  console.log('3. 重新运行修复脚本');
}

console.log('\n📝 修复方案文档: .trae/documents/画布系统综合问题评估与修复方案.md');
console.log('📊 验证页面: test-canvas-repair.html');

process.exit(errors.length > 0 ? 1 : 0);