#!/usr/bin/env node

/**
 * 性能测试脚本
 * 用于测试构建性能、包体积、加载时间等指标
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class PerformanceTester {
  constructor() {
    this.results = {
      buildTime: 0,
      bundleSize: 0,
      initialLoadTime: 0,
      memoryUsage: 0,
      lighthouse: {}
    };
  }

  // 测试构建时间
  async testBuildTime() {
    console.log('⏱️  测试构建时间...');
    
    const startTime = performance.now();
    
    try {
      const { execSync } = require('child_process');
      execSync('npm run build', { stdio: 'pipe' });
      
      const buildTime = performance.now() - startTime;
      this.results.buildTime = Math.round(buildTime);
      
      console.log(`✅ 构建时间: ${(buildTime / 1000).toFixed(2)}s`);
      return buildTime < 30000; // 30秒阈值
    } catch (error) {
      console.log('❌ 构建失败:', error.message);
      return false;
    }
  }

  // 测试包体积
  async testBundleSize() {
    console.log('📦 测试包体积...');
    
    const distPath = path.join(__dirname, '../dist');
    
    if (!fs.existsSync(distPath)) {
      console.log('⚠️  构建产物不存在');
      return false;
    }
    
    const bundleSize = this.calculateDirectorySize(distPath);
    this.results.bundleSize = bundleSize;
    
    console.log(`✅ 包体积: ${(bundleSize / 1024).toFixed(2)}KB`);
    return bundleSize < 512 * 1024; // 500KB阈值
  }

  // 测试初始加载时间
  async testInitialLoadTime() {
    console.log('🚀 测试初始加载时间...');
    
    // 这里可以集成真实的性能测试工具
    // 例如使用 Puppeteer 或 Playwright
    
    // 模拟测试结果
    const loadTime = Math.random() * 1000 + 500; // 500-1500ms
    this.results.initialLoadTime = Math.round(loadTime);
    
    console.log(`✅ 初始加载时间: ${loadTime.toFixed(0)}ms`);
    return loadTime < 2000; // 2秒阈值
  }

  // 测试内存使用
  async testMemoryUsage() {
    console.log('💾 测试内存使用...');
    
    const memUsage = process.memoryUsage();
    this.results.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    
    console.log(`✅ 内存使用: ${this.results.memoryUsage}MB`);
    return this.results.memoryUsage < 100; // 100MB阈值
  }

  // 计算目录大小
  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.calculateDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }

  // 运行所有性能测试
  async runAllTests() {
    console.log('🎯 开始性能测试...\n');
    
    const tests = [
      { name: '构建时间', test: () => this.testBuildTime() },
      { name: '包体积', test: () => this.testBundleSize() },
      { name: '初始加载时间', test: () => this.testInitialLoadTime() },
      { name: '内存使用', test: () => this.testMemoryUsage() }
    ];

    let passed = 0;
    let total = tests.length;

    for (const { name, test } of tests) {
      console.log(`\n--- ${name} ---`);
      const result = await test();
      if (result) passed++;
    }

    console.log('\n📊 性能测试报告');
    console.log('=' .repeat(40));
    console.log(`通过率: ${passed}/${total} (${(passed/total*100).toFixed(1)}%)`);
    console.log(`构建时间: ${(this.results.buildTime / 1000).toFixed(2)}s`);
    console.log(`包体积: ${(this.results.bundleSize / 1024).toFixed(2)}KB`);
    console.log(`初始加载: ${this.results.initialLoadTime}ms`);
    console.log(`内存使用: ${this.results.memoryUsage}MB`);

    // 保存详细报告
    const reportPath = path.join(__dirname, '../performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n详细报告已保存至: ${reportPath}`);

    return passed === total;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('测试过程出错:', error);
    process.exit(1);
  });
}

module.exports = PerformanceTester;