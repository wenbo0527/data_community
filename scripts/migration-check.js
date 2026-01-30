#!/usr/bin/env node

/**
 * 项目结构迁移检查脚本
 * 用于验证迁移过程中的各项标准和指标
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MigrationChecker {
  constructor() {
    this.results = {
      codeQuality: {},
      performance: {},
      compatibility: {},
      security: {},
      overall: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  // 代码质量检查
  async checkCodeQuality() {
    console.log('🔍 开始代码质量检查...');
    
    try {
      console.log('  Running ESLint...');
      execSync('npm run lint:migrate --silent', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      this.results.codeQuality.eslint = { status: 'passed', details: 'ESLint检查通过' };
    } catch (error) {
      this.results.codeQuality.eslint = { status: 'failed', details: 'ESLint检查失败' };
    }

    try {
      console.log('  Running TypeScript check...');
      execSync('npm run typecheck', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      this.results.codeQuality.typescript = { status: 'passed', details: 'TypeScript检查通过' };
    } catch (error) {
      this.results.codeQuality.typescript = { status: 'warning', details: 'TypeScript检查失败' };
    }

    try {
      // 代码重复率检查
      console.log('  Checking code duplication...');
      const duplicationResult = execSync('npx jscpd src --min-lines 5 --min-tokens 50', { encoding: 'utf8', stdio: 'pipe' });
      const duplicationRate = this.extractDuplicationRate(duplicationResult);
      this.results.codeQuality.duplication = { 
        status: duplicationRate < 5 ? 'passed' : 'failed', 
        details: `代码重复率: ${duplicationRate}%` 
      };
    } catch (error) {
      this.results.codeQuality.duplication = { status: 'warning', details: '无法检查代码重复率' };
    }
  }

  // 性能检查
  async checkPerformance() {
    console.log('⚡ 开始性能检查...');
    
    try {
      // 构建时间检查
      console.log('  Measuring build time...');
      const startTime = Date.now();
      execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
      const buildTime = (Date.now() - startTime) / 1000;
      
      this.results.performance.buildTime = { 
        status: buildTime < 30 ? 'passed' : 'failed', 
        details: `构建时间: ${buildTime}s` 
      };
    } catch (error) {
      this.results.performance.buildTime = { status: 'failed', details: '构建失败' };
    }

    try {
      // 包体积检查
      console.log('  Checking bundle size...');
      const distPath = path.join(__dirname, '../dist');
      if (fs.existsSync(distPath)) {
        const bundleSize = this.getDirectorySize(distPath) / 1024; // KB
        this.results.performance.bundleSize = { 
          status: bundleSize < 500 ? 'passed' : 'failed', 
          details: `包体积: ${bundleSize.toFixed(2)}KB` 
        };
      } else {
        this.results.performance.bundleSize = { status: 'warning', details: '构建产物不存在' };
      }
    } catch (error) {
      this.results.performance.bundleSize = { status: 'warning', details: '无法检查包体积' };
    }
  }

  // 安全检查
  async checkSecurity() {
    console.log('🔒 开始安全检查...');
    
    try {
      // 依赖安全审计
      console.log('  Running security audit...');
      const auditResult = execSync('npm audit --audit-level high --json', { encoding: 'utf8', stdio: 'pipe' });
      const audit = JSON.parse(auditResult);
      
      this.results.security.dependencies = { 
        status: audit.metadata.vulnerabilities.high === 0 ? 'passed' : 'failed', 
        details: `发现 ${audit.metadata.vulnerabilities.high} 个高危漏洞` 
      };
    } catch (error) {
      this.results.security.dependencies = { status: 'warning', details: '安全审计失败' };
    }
  }

  // 兼容性检查
  async checkCompatibility() {
    console.log('🌐 开始兼容性检查...');
    
    // 检查浏览器兼容性配置
    const browserslistPath = path.join(__dirname, '../.browserslistrc');
    if (fs.existsSync(browserslistPath)) {
      this.results.compatibility.browserslist = { 
        status: 'passed', 
        details: '已配置浏览器兼容性列表' 
      };
    } else {
      this.results.compatibility.browserslist = { 
        status: 'warning', 
        details: '缺少浏览器兼容性配置' 
      };
    }

    // 检查移动端适配
    const viewportMeta = this.checkViewportMeta();
    this.results.compatibility.mobile = { 
      status: viewportMeta ? 'passed' : 'failed', 
      details: viewportMeta ? '已配置viewport meta标签' : '缺少viewport meta标签' 
    };
  }

  // 辅助方法
  extractDuplicationRate(output) {
    const match = output.match(/(\d+(?:\.\d+)?)%/);
    return match ? parseFloat(match[1]) : 0;
  }

  getDirectorySize(dirPath) {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }
    
    return size;
  }

  checkViewportMeta() {
    // 检查主要的HTML文件是否包含viewport meta标签
    const htmlFiles = [
      path.join(__dirname, '../index.html'),
      path.join(__dirname, '../public/index.html')
    ];
    
    for (const htmlFile of htmlFiles) {
      if (fs.existsSync(htmlFile)) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        if (content.includes('name="viewport"')) {
          return true;
        }
      }
    }
    
    return false;
  }

  // 生成报告
  generateReport() {
    console.log('\n📊 迁移检查报告');
    console.log('=' .repeat(50));
    
    let passed = 0, failed = 0, warnings = 0;
    
    // 统计结果
    for (const category of Object.values(this.results)) {
      if (typeof category === 'object' && !Array.isArray(category)) {
        for (const check of Object.values(category)) {
          if (check.status === 'passed') passed++;
          else if (check.status === 'failed') failed++;
          else if (check.status === 'warning') warnings++;
        }
      }
    }
    
    console.log(`\n总体结果: ${passed}项通过, ${failed}项失败, ${warnings}项警告`);
    
    if (failed > 0) {
      console.log('\n❌ 失败项目:');
      for (const [category, checks] of Object.entries(this.results)) {
        if (typeof checks === 'object' && !Array.isArray(checks)) {
          for (const [checkName, result] of Object.entries(checks)) {
            if (result.status === 'failed') {
              console.log(`  - ${category}.${checkName}: ${result.details}`);
            }
          }
        }
      }
    }
    
    if (warnings > 0) {
      console.log('\n⚠️  警告项目:');
      for (const [category, checks] of Object.entries(this.results)) {
        if (typeof checks === 'object' && !Array.isArray(checks)) {
          for (const [checkName, result] of Object.entries(checks)) {
            if (result.status === 'warning') {
              console.log(`  - ${category}.${checkName}: ${result.details}`);
            }
          }
        }
      }
    }
    
    // 保存详细报告
    const reportPath = path.join(__dirname, '../migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n详细报告已保存至: ${reportPath}`);
    
    // 返回检查结果
    return { passed, failed, warnings, success: failed === 0 };
  }

  // 运行所有检查
  async runAllChecks() {
    console.log('🚀 开始项目结构迁移检查...\n');
    
    await this.checkCodeQuality();
    await this.checkPerformance();
    await this.checkSecurity();
    await this.checkCompatibility();
    
    return this.generateReport();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const checker = new MigrationChecker();
  checker.runAllChecks().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('检查过程出错:', error);
    process.exit(1);
  });
}

module.exports = MigrationChecker;
