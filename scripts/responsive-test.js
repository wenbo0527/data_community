#!/usr/bin/env node

/**
 * 响应式测试脚本
 * 用于测试移动端适配和响应式设计
 */

const fs = require('fs');
const path = require('path');

class ResponsiveTester {
  constructor() {
    this.results = {
      viewport: false,
      mediaQueries: [],
      flexibleUnits: [],
      images: [],
      touchTargets: []
    };
    
    this.breakpoints = {
      mobile: '320px',
      tablet: '768px',
      desktop: '1024px',
      large: '1440px'
    };
  }

  // 检查viewport配置
  checkViewport() {
    console.log('📱 检查viewport配置...');
    
    const htmlFiles = [
      path.join(__dirname, '../index.html'),
      path.join(__dirname, '../public/index.html')
    ];
    
    for (const htmlFile of htmlFiles) {
      if (fs.existsSync(htmlFile)) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        const viewportMatch = content.match(/<meta[^>]*name="viewport"[^>]*>/i);
        
        if (viewportMatch) {
          const viewport = viewportMatch[0];
          this.results.viewport = viewport.includes('width=device-width') && 
                                 viewport.includes('initial-scale=1');
          
          console.log(`✅ 找到viewport meta标签: ${viewportMatch[0]}`);
          return;
        }
      }
    }
    
    console.log('❌ 未找到viewport meta标签');
  }

  // 检查CSS媒体查询
  checkMediaQueries() {
    console.log('🎨 检查CSS媒体查询...');
    
    const cssFiles = this.findCSSFiles();
    const mediaQueryPattern = /@media\s*\([^)]*\)/gi;
    
    for (const cssFile of cssFiles) {
      const content = fs.readFileSync(cssFile, 'utf8');
      const matches = content.match(mediaQueryPattern) || [];
      
      matches.forEach(match => {
        this.results.mediaQueries.push({
          file: cssFile,
          query: match.trim()
        });
      });
    }
    
    console.log(`✅ 找到 ${this.results.mediaQueries.length} 个媒体查询`);
  }

  // 检查弹性单位使用
  checkFlexibleUnits() {
    console.log('📏 检查弹性单位使用...');
    
    const cssFiles = this.findCSSFiles();
    const flexibleUnitPattern = /(\d+(?:\.\d+)?)(rem|em|%|vh|vw)/gi;
    
    for (const cssFile of cssFiles) {
      const content = fs.readFileSync(cssFile, 'utf8');
      const matches = content.match(flexibleUnitPattern) || [];
      
      matches.forEach(match => {
        this.results.flexibleUnits.push({
          file: cssFile,
          unit: match
        });
      });
    }
    
    console.log(`✅ 找到 ${this.results.flexibleUnits.length} 个弹性单位`);
  }

  // 检查图片响应式处理
  checkImages() {
    console.log('🖼️  检查图片响应式处理...');
    
    const htmlFiles = this.findHTMLFiles();
    const imgPattern = /<img[^>]*>/gi;
    const srcsetPattern = /srcset=/i;
    
    for (const htmlFile of htmlFiles) {
      const content = fs.readFileSync(htmlFile, 'utf8');
      const matches = content.match(imgPattern) || [];
      
      matches.forEach(img => {
        const hasSrcset = srcsetPattern.test(img);
        const hasResponsive = img.includes('loading="lazy"') || 
                             img.includes('decoding="async"');
        
        this.results.images.push({
          file: htmlFile,
          img: img.trim(),
          hasSrcset,
          hasResponsive
        });
      });
    }
    
    const responsiveImages = this.results.images.filter(img => img.hasSrcset || img.hasResponsive);
    console.log(`✅ 找到 ${responsiveImages.length}/${this.results.images.length} 个响应式图片`);
  }

  // 检查触摸目标大小
  checkTouchTargets() {
    console.log('👆 检查触摸目标大小...');
    
    const cssFiles = this.findCSSFiles();
    const buttonPattern = /(button|\.btn|\.button)[^{]*{[^}]*}/gi;
    
    for (const cssFile of cssFiles) {
      const content = fs.readFileSync(cssFile, 'utf8');
      const matches = content.match(buttonPattern) || [];
      
      matches.forEach(match => {
        const hasMinSize = match.includes('min-width') || 
                          match.includes('min-height') ||
                          match.includes('width') && match.includes('height');
        
        this.results.touchTargets.push({
          file: cssFile,
          selector: match.split('{')[0].trim(),
          hasMinSize
        });
      });
    }
    
    const accessibleTargets = this.results.touchTargets.filter(target => target.hasMinSize);
    console.log(`✅ 找到 ${accessibleTargets.length}/${this.results.touchTargets.length} 个可访问触摸目标`);
  }

  // 查找CSS文件
  findCSSFiles() {
    const cssFiles = [];
    const srcPath = path.join(__dirname, '../src');
    
    if (fs.existsSync(srcPath)) {
      this.walkDirectory(srcPath, (file) => {
        if (file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.less')) {
          cssFiles.push(file);
        }
      });
    }
    
    return cssFiles;
  }

  // 查找HTML文件
  findHTMLFiles() {
    const htmlFiles = [];
    const srcPath = path.join(__dirname, '../src');
    
    if (fs.existsSync(srcPath)) {
      this.walkDirectory(srcPath, (file) => {
        if (file.endsWith('.html') || file.endsWith('.vue')) {
          htmlFiles.push(file);
        }
      });
    }
    
    // 添加根目录的HTML文件
    const rootHtml = path.join(__dirname, '../index.html');
    if (fs.existsSync(rootHtml)) {
      htmlFiles.push(rootHtml);
    }
    
    return htmlFiles;
  }

  // 遍历目录
  walkDirectory(dir, callback) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        this.walkDirectory(filePath, callback);
      } else {
        callback(filePath);
      }
    }
  }

  // 生成报告
  generateReport() {
    console.log('\n📊 响应式测试报告');
    console.log('=' .repeat(50));
    
    const viewportScore = this.results.viewport ? 1 : 0;
    const mediaQueryScore = Math.min(this.results.mediaQueries.length / 10, 1);
    const flexibleUnitScore = Math.min(this.results.flexibleUnits.length / 20, 1);
    const imageScore = this.results.images.length > 0 ? 
      this.results.images.filter(img => img.hasSrcset || img.hasResponsive).length / this.results.images.length : 0;
    const touchTargetScore = this.results.touchTargets.length > 0 ?
      this.results.touchTargets.filter(target => target.hasMinSize).length / this.results.touchTargets.length : 0;
    
    const overallScore = (viewportScore + mediaQueryScore + flexibleUnitScore + imageScore + touchTargetScore) / 5;
    
    console.log(`\n总体评分: ${(overallScore * 100).toFixed(1)}/100`);
    console.log(`Viewport配置: ${viewportScore ? '✅' : '❌'}`);
    console.log(`媒体查询数量: ${this.results.mediaQueries.length}`);
    console.log(`弹性单位数量: ${this.results.flexibleUnits.length}`);
    console.log(`响应式图片比例: ${(imageScore * 100).toFixed(1)}%`);
    console.log(`可访问触摸目标比例: ${(touchTargetScore * 100).toFixed(1)}%`);
    
    // 建议
    console.log('\n💡 改进建议:');
    if (!this.results.viewport) {
      console.log('- 添加viewport meta标签: <meta name="viewport" content="width=device-width, initial-scale=1">');
    }
    if (this.results.mediaQueries.length < 5) {
      console.log('- 增加更多媒体查询以适配不同屏幕尺寸');
    }
    if (this.results.flexibleUnits.length < 10) {
      console.log('- 使用更多rem/em/vh/vw等弹性单位');
    }
    if (imageScore < 0.5) {
      console.log('- 为图片添加srcset属性和loading="lazy"');
    }
    if (touchTargetScore < 0.8) {
      console.log('- 确保触摸目标最小尺寸为44x44像素');
    }
    
    // 保存详细报告
    const reportPath = path.join(__dirname, '../responsive-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n详细报告已保存至: ${reportPath}`);
    
    return overallScore >= 0.7; // 70分通过
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🎯 开始响应式测试...\n');
    
    this.checkViewport();
    this.checkMediaQueries();
    this.checkFlexibleUnits();
    this.checkImages();
    this.checkTouchTargets();
    
    return this.generateReport();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const tester = new ResponsiveTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('测试过程出错:', error);
    process.exit(1);
  });
}

module.exports = ResponsiveTester;