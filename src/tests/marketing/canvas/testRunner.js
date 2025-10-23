/**
 * 营销画布节点功能测试运行器
 * 提供可执行的测试脚本和测试报告生成功能
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class TestRunner {
  constructor() {
    this.testResults = []
    this.startTime = null
    this.endTime = null
    this.reportPath = path.join(process.cwd(), 'test-reports')
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始运行营销画布节点功能测试套件...\n')
    
    this.startTime = new Date()
    
    const testSuites = [
      {
        name: '节点创建测试',
        file: 'NodeCreationTests.test.js',
        description: '测试9种节点类型的创建功能'
      },
      {
        name: '配置抽屉测试',
        file: 'NodeDrawerTests.test.js',
        description: '测试节点配置抽屉匹配功能'
      },
      {
        name: '配置保存测试',
        file: 'NodeConfigSaveTests.test.js',
        description: '测试节点配置保存和预览线生成功能'
      },
      {
        name: '节点删除测试',
        file: 'NodeDeletionTests.test.js',
        description: '测试节点删除和类型识别功能'
      },
      {
        name: '错误处理测试',
        file: 'NodeErrorHandlingTests.test.js',
        description: '测试错误处理和边界情况'
      }
    ]

    for (const suite of testSuites) {
      await this.runTestSuite(suite)
    }

    this.endTime = new Date()
    
    await this.generateReport()
    this.printSummary()
  }

  /**
   * 运行单个测试套件
   */
  async runTestSuite(suite) {
    console.log(`📋 运行测试套件: ${suite.name}`)
    console.log(`   描述: ${suite.description}`)
    console.log(`   文件: ${suite.file}`)
    
    const suiteStartTime = new Date()
    
    try {
      const testPath = path.join(__dirname, suite.file)
      
      // 使用 vitest 运行测试
      const command = `npx vitest run ${testPath} --reporter=json`
      const output = execSync(command, { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      
      const result = this.parseTestOutput(output)
      
      const suiteEndTime = new Date()
      const duration = suiteEndTime - suiteStartTime
      
      this.testResults.push({
        ...suite,
        ...result,
        duration,
        status: result.failed === 0 ? 'PASSED' : 'FAILED',
        timestamp: suiteStartTime
      })
      
      console.log(`   ✅ 完成 - 通过: ${result.passed}, 失败: ${result.failed}, 耗时: ${duration}ms\n`)
      
    } catch (error) {
      const suiteEndTime = new Date()
      const duration = suiteEndTime - suiteStartTime
      
      this.testResults.push({
        ...suite,
        passed: 0,
        failed: 1,
        total: 1,
        duration,
        status: 'ERROR',
        error: error.message,
        timestamp: suiteStartTime
      })
      
      console.log(`   ❌ 错误 - ${error.message}\n`)
    }
  }

  /**
   * 运行特定的测试模块
   */
  async runSpecificTest(testName) {
    console.log(`🎯 运行特定测试: ${testName}\n`)
    
    const testSuites = {
      'creation': {
        name: '节点创建测试',
        file: 'NodeCreationTests.test.js',
        description: '测试9种节点类型的创建功能'
      },
      'drawer': {
        name: '配置抽屉测试',
        file: 'NodeDrawerTests.test.js',
        description: '测试节点配置抽屉匹配功能'
      },
      'save': {
        name: '配置保存测试',
        file: 'NodeConfigSaveTests.test.js',
        description: '测试节点配置保存和预览线生成功能'
      },
      'deletion': {
        name: '节点删除测试',
        file: 'NodeDeletionTests.test.js',
        description: '测试节点删除和类型识别功能'
      },
      'error': {
        name: '错误处理测试',
        file: 'NodeErrorHandlingTests.test.js',
        description: '测试错误处理和边界情况'
      }
    }

    const suite = testSuites[testName]
    if (!suite) {
      console.log(`❌ 未找到测试模块: ${testName}`)
      console.log(`可用的测试模块: ${Object.keys(testSuites).join(', ')}`)
      return
    }

    this.startTime = new Date()
    await this.runTestSuite(suite)
    this.endTime = new Date()
    
    await this.generateReport()
    this.printSummary()
  }

  /**
   * 解析测试输出
   */
  parseTestOutput(output) {
    try {
      const jsonOutput = JSON.parse(output)
      return {
        passed: jsonOutput.numPassedTests || 0,
        failed: jsonOutput.numFailedTests || 0,
        total: jsonOutput.numTotalTests || 0,
        testResults: jsonOutput.testResults || []
      }
    } catch (error) {
      // 如果无法解析JSON，尝试从文本输出中提取信息
      const passedMatch = output.match(/(\d+) passed/)
      const failedMatch = output.match(/(\d+) failed/)
      
      return {
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        total: (passedMatch ? parseInt(passedMatch[1]) : 0) + (failedMatch ? parseInt(failedMatch[1]) : 0),
        testResults: []
      }
    }
  }

  /**
   * 生成测试报告
   */
  async generateReport() {
    // 确保报告目录存在
    if (!fs.existsSync(this.reportPath)) {
      fs.mkdirSync(this.reportPath, { recursive: true })
    }

    const totalDuration = this.endTime - this.startTime
    const totalPassed = this.testResults.reduce((sum, result) => sum + result.passed, 0)
    const totalFailed = this.testResults.reduce((sum, result) => sum + result.failed, 0)
    const totalTests = this.testResults.reduce((sum, result) => sum + result.total, 0)

    const report = {
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0,
        totalDuration,
        startTime: this.startTime,
        endTime: this.endTime
      },
      testSuites: this.testResults,
      generatedAt: new Date().toISOString()
    }

    // 生成JSON报告
    const jsonReportPath = path.join(this.reportPath, `test-report-${Date.now()}.json`)
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2))

    // 生成HTML报告
    const htmlReport = this.generateHtmlReport(report)
    const htmlReportPath = path.join(this.reportPath, `test-report-${Date.now()}.html`)
    fs.writeFileSync(htmlReportPath, htmlReport)

    console.log(`📊 测试报告已生成:`)
    console.log(`   JSON: ${jsonReportPath}`)
    console.log(`   HTML: ${htmlReportPath}`)
  }

  /**
   * 生成HTML测试报告
   */
  generateHtmlReport(report) {
    const { summary, testSuites } = report

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>营销画布节点功能测试报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            margin: 0;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .success-rate { color: #17a2b8; }
        .duration { color: #6f42c1; }
        .test-suites {
            padding: 30px;
        }
        .test-suite {
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
        }
        .test-suite-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
        }
        .test-suite-title {
            margin: 0;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .test-suite-description {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 0.9em;
        }
        .test-suite-stats {
            display: flex;
            gap: 15px;
            margin-top: 10px;
        }
        .stat {
            font-size: 0.9em;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        .status-error {
            background: #fff3cd;
            color: #856404;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>营销画布节点功能测试报告</h1>
            <p>生成时间: ${new Date(report.generatedAt).toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>总测试数</h3>
                <p class="value">${summary.totalTests}</p>
            </div>
            <div class="summary-card">
                <h3>通过测试</h3>
                <p class="value passed">${summary.totalPassed}</p>
            </div>
            <div class="summary-card">
                <h3>失败测试</h3>
                <p class="value failed">${summary.totalFailed}</p>
            </div>
            <div class="summary-card">
                <h3>成功率</h3>
                <p class="value success-rate">${summary.successRate}%</p>
            </div>
            <div class="summary-card">
                <h3>总耗时</h3>
                <p class="value duration">${summary.totalDuration}ms</p>
            </div>
        </div>
        
        <div class="test-suites">
            <h2>测试套件详情</h2>
            ${testSuites.map(suite => `
                <div class="test-suite">
                    <div class="test-suite-header">
                        <div class="test-suite-title">
                            <span>${suite.name}</span>
                            <span class="status-badge status-${suite.status.toLowerCase()}">${suite.status}</span>
                        </div>
                        <p class="test-suite-description">${suite.description}</p>
                        <div class="test-suite-stats">
                            <span class="stat">文件: ${suite.file}</span>
                            <span class="stat passed">通过: ${suite.passed}</span>
                            <span class="stat failed">失败: ${suite.failed}</span>
                            <span class="stat">耗时: ${suite.duration}ms</span>
                        </div>
                        ${suite.error ? `<div style="color: #dc3545; margin-top: 10px;">错误: ${suite.error}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>营销画布节点功能自动化测试系统 - 测试报告</p>
        </div>
    </div>
</body>
</html>
    `
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    const totalDuration = this.endTime - this.startTime
    const totalPassed = this.testResults.reduce((sum, result) => sum + result.passed, 0)
    const totalFailed = this.testResults.reduce((sum, result) => sum + result.failed, 0)
    const totalTests = this.testResults.reduce((sum, result) => sum + result.total, 0)
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0

    console.log('\n' + '='.repeat(60))
    console.log('📊 测试执行摘要')
    console.log('='.repeat(60))
    console.log(`总测试数: ${totalTests}`)
    console.log(`通过测试: ${totalPassed} ✅`)
    console.log(`失败测试: ${totalFailed} ❌`)
    console.log(`成功率: ${successRate}%`)
    console.log(`总耗时: ${totalDuration}ms`)
    console.log(`开始时间: ${this.startTime.toLocaleString('zh-CN')}`)
    console.log(`结束时间: ${this.endTime.toLocaleString('zh-CN')}`)
    console.log('='.repeat(60))

    // 显示各测试套件状态
    console.log('\n📋 测试套件状态:')
    this.testResults.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️'
      console.log(`${status} ${result.name}: ${result.passed}/${result.total} 通过 (${result.duration}ms)`)
    })

    if (totalFailed > 0) {
      console.log('\n❌ 存在失败的测试，请检查详细报告')
      process.exit(1)
    } else {
      console.log('\n🎉 所有测试通过！')
    }
  }
}

// 命令行接口
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner()
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    // 运行所有测试
    runner.runAllTests().catch(error => {
      console.error('测试运行失败:', error)
      process.exit(1)
    })
  } else {
    // 运行特定测试
    const testName = args[0]
    runner.runSpecificTest(testName).catch(error => {
      console.error('测试运行失败:', error)
      process.exit(1)
    })
  }
}

export default TestRunner