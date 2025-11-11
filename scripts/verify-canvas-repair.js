#!/usr/bin/env node

/**
 * 画布系统修复验证脚本
 * 
 * 这个脚本用于自动验证画布系统的修复效果
 * 包括存储工具、数据迁移、数据验证和边缘持久化功能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  colorLog('green', `✅ ${message}`);
}

function error(message) {
  colorLog('red', `❌ ${message}`);
}

function warning(message) {
  colorLog('yellow', `⚠️  ${message}`);
}

function info(message) {
  colorLog('blue', `ℹ️  ${message}`);
}

function header(message) {
  colorLog('cyan', `\n🔧 ${message}`);
  colorLog('cyan', '='.repeat(message.length + 4));
}

// 验证配置
const VERIFICATION_CONFIG = {
  projectRoot: path.resolve(__dirname, '..'),
  requiredFiles: [
    'src/pages/marketing/tasks/utils/StorageUtils.js',
    'src/pages/marketing/tasks/utils/DataMigrationManager.js',
    'src/pages/marketing/tasks/utils/UnifiedDataValidator.js',
    'src/pages/marketing/tasks/composables/canvas/unified/EdgePersistenceManager.js',
    'src/pages/marketing/tasks/test-canvas-repair.vue',
    'public/test-canvas-repair.html'
  ],
  testEndpoints: [
    'http://localhost:5173/test-canvas-repair.html',
    'http://localhost:3000/test-canvas-repair.html'
  ]
};

// 验证结果统计
let verificationStats = {
  totalChecks: 0,
  passedChecks: 0,
  failedChecks: 0,
  warnings: 0
};

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath) {
  const fullPath = path.join(VERIFICATION_CONFIG.projectRoot, filePath);
  return fs.existsSync(fullPath);
}

/**
 * 读取文件内容
 */
function readFileContent(filePath) {
  try {
    const fullPath = path.join(VERIFICATION_CONFIG.projectRoot, filePath);
    return fs.readFileSync(fullPath, 'utf8');
  } catch (err) {
    return null;
  }
}

/**
 * 检查文件内容是否包含特定模式
 */
function checkFileContent(filePath, patterns, description) {
  verificationStats.totalChecks++;
  
  const content = readFileContent(filePath);
  if (!content) {
    error(`无法读取文件: ${filePath}`);
    verificationStats.failedChecks++;
    return false;
  }

  let allPatternsFound = true;
  const missingPatterns = [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i');
    if (!regex.test(content)) {
      allPatternsFound = false;
      missingPatterns.push(pattern);
    }
  }

  if (allPatternsFound) {
    success(`${description}: 所有必需模式已找到`);
    verificationStats.passedChecks++;
    return true;
  } else {
    error(`${description}: 缺少模式 - ${missingPatterns.join(', ')}`);
    verificationStats.failedChecks++;
    return false;
  }
}

/**
 * 验证文件结构
 */
function verifyFileStructure() {
  header('验证文件结构');
  
  let allFilesExist = true;
  
  for (const filePath of VERIFICATION_CONFIG.requiredFiles) {
    verificationStats.totalChecks++;
    
    if (checkFileExists(filePath)) {
      success(`文件存在: ${filePath}`);
      verificationStats.passedChecks++;
    } else {
      error(`文件缺失: ${filePath}`);
      verificationStats.failedChecks++;
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

/**
 * 验证StorageUtils实现
 */
function verifyStorageUtils() {
  header('验证StorageUtils实现');
  
  const filePath = 'src/pages/marketing/tasks/utils/StorageUtils.js';
  const requiredPatterns = [
    'class StorageUtils',
    'class LocalStorageEnvironmentChecker',
    'initializeEnvironment',
    'setItem',
    'getItem',
    'removeItem',
    'repairMethods',
    'testFunctionality'
  ];
  
  return checkFileContent(filePath, requiredPatterns, 'StorageUtils功能检查');
}

/**
 * 验证DataMigrationManager实现
 */
function verifyDataMigrationManager() {
  header('验证DataMigrationManager实现');
  
  const filePath = 'src/pages/marketing/tasks/utils/DataMigrationManager.js';
  const requiredPatterns = [
    'class DataMigrationManager',
    'const DataVersion',
    'const MigrationType',
    'setupMigrationRules',
    'migrateData',
    'detectEdgeFormatIssues',
    'detectNodeFormatIssues',
    'migrateEdgeFormat',
    'migrateNodeFormat'
  ];
  
  return checkFileContent(filePath, requiredPatterns, 'DataMigrationManager功能检查');
}

/**
 * 验证UnifiedDataValidator实现
 */
function verifyUnifiedDataValidator() {
  header('验证UnifiedDataValidator实现');
  
  const filePath = 'src/pages/marketing/tasks/utils/UnifiedDataValidator.js';
  const requiredPatterns = [
    'class UnifiedDataValidator',
    'const ValidationLevel',
    'const ValidationType',
    'const ErrorSeverity',
    'validateData',
    'validateStructure',
    'validateFormat',
    'validateReferences',
    'repairMissingId',
    'repairInvalidPosition'
  ];
  
  return checkFileContent(filePath, requiredPatterns, 'UnifiedDataValidator功能检查');
}

/**
 * 验证EdgePersistenceManager集成
 */
function verifyEdgePersistenceManager() {
  header('验证EdgePersistenceManager集成');
  
  const filePath = 'src/pages/marketing/tasks/composables/canvas/unified/EdgePersistenceManager.js';
  const requiredPatterns = [
    'import.*StorageUtils',
    'import.*DataMigrationManager',
    'import.*UnifiedDataValidator',
    'this\\.storageUtils\\s*=',
    'this\\.dataMigrationManager\\s*=',
    'this\\.dataValidator\\s*=',
    'initializeEnvironment',
    'migrateData',
    'validateCurrentState',
    'loadRawDataForMigration'
  ];
  
  return checkFileContent(filePath, requiredPatterns, 'EdgePersistenceManager集成检查');
}

/**
 * 验证测试页面实现
 */
function verifyTestPages() {
  header('验证测试页面实现');
  
  let allTestsPass = true;
  
  // 验证Vue测试页面
  const vueTestPatterns = [
    'test-canvas-repair',
    'testStorageUtils',
    'testDataMigration',
    'testDataValidation',
    'testEdgePersistence',
    'runAllTests'
  ];
  
  if (!checkFileContent('src/pages/marketing/tasks/test-canvas-repair.vue', vueTestPatterns, 'Vue测试页面功能检查')) {
    allTestsPass = false;
  }
  
  // 验证HTML测试页面
  const htmlTestPatterns = [
    'MockStorageUtils',
    'MockDataMigrationManager',
    'MockDataValidator',
    'testStorageUtils',
    'testDataMigration',
    'runAllTests',
    'generateReport'
  ];
  
  if (!checkFileContent('public/test-canvas-repair.html', htmlTestPatterns, 'HTML测试页面功能检查')) {
    allTestsPass = false;
  }
  
  return allTestsPass;
}

/**
 * 验证代码质量
 */
function verifyCodeQuality() {
  header('验证代码质量');
  
  let qualityScore = 0;
  let totalQualityChecks = 0;
  
  // 检查错误处理
  const filesToCheck = [
    'src/pages/marketing/tasks/utils/StorageUtils.js',
    'src/pages/marketing/tasks/utils/DataMigrationManager.js',
    'src/pages/marketing/tasks/utils/UnifiedDataValidator.js'
  ];
  
  for (const filePath of filesToCheck) {
    totalQualityChecks += 3;
    
    const content = readFileContent(filePath);
    if (content) {
      // 检查try-catch块
      if (/try\s*{[\s\S]*?}\s*catch/.test(content)) {
        success(`${filePath}: 包含错误处理`);
        qualityScore++;
      } else {
        warning(`${filePath}: 缺少错误处理`);
        verificationStats.warnings++;
      }
      
      // 检查日志记录
      if (/console\.(log|info|warn|error)/.test(content)) {
        success(`${filePath}: 包含日志记录`);
        qualityScore++;
      } else {
        warning(`${filePath}: 缺少日志记录`);
        verificationStats.warnings++;
      }
      
      // 检查JSDoc注释
      if (/\/\*\*[\s\S]*?\*\//.test(content)) {
        success(`${filePath}: 包含JSDoc注释`);
        qualityScore++;
      } else {
        warning(`${filePath}: 缺少JSDoc注释`);
        verificationStats.warnings++;
      }
    }
  }
  
  const qualityPercentage = Math.round((qualityScore / totalQualityChecks) * 100);
  info(`代码质量评分: ${qualityScore}/${totalQualityChecks} (${qualityPercentage}%)`);
  
  return qualityPercentage >= 70; // 70%以上认为通过
}

/**
 * 检查依赖关系
 */
function verifyDependencies() {
  header('验证依赖关系');
  
  const packageJsonPath = 'package.json';
  const content = readFileContent(packageJsonPath);
  
  if (!content) {
    error('无法读取package.json');
    verificationStats.totalChecks++;
    verificationStats.failedChecks++;
    return false;
  }
  
  try {
    const packageJson = JSON.parse(content);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // 检查必需的依赖
    const requiredDeps = ['vue', 'vite'];
    let allDepsPresent = true;
    
    for (const dep of requiredDeps) {
      verificationStats.totalChecks++;
      
      if (dependencies[dep]) {
        success(`依赖存在: ${dep}@${dependencies[dep]}`);
        verificationStats.passedChecks++;
      } else {
        error(`依赖缺失: ${dep}`);
        verificationStats.failedChecks++;
        allDepsPresent = false;
      }
    }
    
    return allDepsPresent;
    
  } catch (err) {
    error(`解析package.json失败: ${err.message}`);
    verificationStats.totalChecks++;
    verificationStats.failedChecks++;
    return false;
  }
}

/**
 * 生成验证报告
 */
function generateVerificationReport() {
  header('验证报告');
  
  const successRate = Math.round((verificationStats.passedChecks / verificationStats.totalChecks) * 100);
  
  console.log('\n📊 验证统计:');
  console.log(`   总检查项: ${verificationStats.totalChecks}`);
  console.log(`   通过: ${colors.green}${verificationStats.passedChecks}${colors.reset}`);
  console.log(`   失败: ${colors.red}${verificationStats.failedChecks}${colors.reset}`);
  console.log(`   警告: ${colors.yellow}${verificationStats.warnings}${colors.reset}`);
  console.log(`   成功率: ${successRate >= 80 ? colors.green : colors.red}${successRate}%${colors.reset}`);
  
  console.log('\n🎯 验证结果:');
  if (successRate >= 90) {
    success('优秀! 画布系统修复验证完全通过');
  } else if (successRate >= 80) {
    success('良好! 画布系统修复基本完成，有少量问题需要关注');
  } else if (successRate >= 60) {
    warning('一般! 画布系统修复部分完成，需要解决一些问题');
  } else {
    error('需要改进! 画布系统修复存在较多问题，需要进一步修复');
  }
  
  console.log('\n📋 下一步建议:');
  if (verificationStats.failedChecks > 0) {
    console.log('   1. 修复上述失败的检查项');
  }
  if (verificationStats.warnings > 0) {
    console.log('   2. 改进代码质量，解决警告项');
  }
  console.log('   3. 运行测试页面进行功能验证');
  console.log('   4. 在实际环境中测试画布系统');
  
  // 生成详细报告文件
  const reportData = {
    timestamp: new Date().toISOString(),
    statistics: verificationStats,
    successRate: successRate,
    recommendations: generateRecommendations()
  };
  
  try {
    const reportPath = path.join(VERIFICATION_CONFIG.projectRoot, 'canvas-repair-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    info(`详细报告已保存到: canvas-repair-verification-report.json`);
  } catch (err) {
    warning(`无法保存报告文件: ${err.message}`);
  }
  
  return successRate >= 80;
}

/**
 * 生成改进建议
 */
function generateRecommendations() {
  const recommendations = [];
  
  if (verificationStats.failedChecks > 0) {
    recommendations.push('修复失败的文件和功能检查');
  }
  
  if (verificationStats.warnings > 5) {
    recommendations.push('改进代码质量，添加更多错误处理和文档');
  }
  
  recommendations.push('运行自动化测试验证功能');
  recommendations.push('在不同浏览器环境中测试兼容性');
  recommendations.push('监控生产环境中的性能表现');
  
  return recommendations;
}

/**
 * 主验证流程
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    画布系统修复验证工具                        ║');
  console.log('║                  Canvas System Repair Verifier               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
  
  info('开始验证画布系统修复效果...\n');
  
  try {
    // 执行各项验证
    const results = {
      fileStructure: verifyFileStructure(),
      storageUtils: verifyStorageUtils(),
      dataMigration: verifyDataMigrationManager(),
      dataValidator: verifyUnifiedDataValidator(),
      edgePersistence: verifyEdgePersistenceManager(),
      testPages: verifyTestPages(),
      codeQuality: verifyCodeQuality(),
      dependencies: verifyDependencies()
    };
    
    // 生成最终报告
    const overallSuccess = generateVerificationReport();
    
    // 输出测试页面访问信息
    console.log('\n🌐 测试页面访问:');
    console.log('   Vue测试页面: /src/pages/marketing/tasks/test-canvas-repair.vue');
    console.log('   HTML测试页面: http://localhost:5173/test-canvas-repair.html');
    console.log('   (需要先启动开发服务器: npm run dev)');
    
    process.exit(overallSuccess ? 0 : 1);
    
  } catch (err) {
    error(`验证过程中发生错误: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// 运行主程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  verifyFileStructure,
  verifyStorageUtils,
  verifyDataMigrationManager,
  verifyUnifiedDataValidator,
  verifyEdgePersistenceManager,
  verifyTestPages,
  verifyCodeQuality,
  verifyDependencies,
  generateVerificationReport
};