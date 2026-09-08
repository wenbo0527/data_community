import fs from 'fs';
import path from 'path';

console.log('开始运行 businessProcessData.ts 测试用例...\n');

// 读取 TypeScript 文件内容
const filePath = path.resolve('./src/mock/businessProcessData.ts');
let fileContent;

try {
  fileContent = fs.readFileSync(filePath, 'utf8');
} catch (error) {
  console.error('❌ 读取文件失败:', error.message);
  process.exit(1);
}

// 解析 processSteps 数组
function extractProcessSteps(content) {
  try {
    // 查找 processSteps 数组的开始和结束位置
    const startMatch = content.match(/export const processSteps[^=]*= \[/);
    if (!startMatch) {
      throw new Error('无法找到 processSteps 数组定义');
    }
    
    const startIndex = startMatch.index + startMatch[0].length - 1;
    let bracketCount = 0;
    let endIndex = startIndex;
    
    // 找到匹配的结束括号
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '[') bracketCount++;
      if (content[i] === ']') bracketCount--;
      if (bracketCount === 0) {
        endIndex = i;
        break;
      }
    }
    
    const arrayContent = content.substring(startIndex, endIndex + 1);
    
    // 简单的枚举替换
    const processedContent = arrayContent
      .replace(/ProcessStatus\.PENDING/g, '"pending"')
      .replace(/ProcessStatus\.IN_PROGRESS/g, '"in_progress"')
      .replace(/ProcessStatus\.COMPLETED/g, '"completed"')
      .replace(/ProcessStatus\.FAILED/g, '"failed"')
      .replace(/ProcessStatus\.CANCELLED/g, '"cancelled"')
      .replace(/ApprovalStatus\.SUBMITTED/g, '"submitted"')
      .replace(/ApprovalStatus\.UNDER_REVIEW/g, '"under_review"')
      .replace(/ApprovalStatus\.APPROVED/g, '"approved"')
      .replace(/ApprovalStatus\.REJECTED/g, '"rejected"')
      .replace(/ApprovalStatus\.RETURNED/g, '"returned"')
      .replace(/DataQualityLevel\.HIGH/g, '"high"')
      .replace(/DataQualityLevel\.MEDIUM/g, '"medium"')
      .replace(/DataQualityLevel\.LOW/g, '"low"')
      .replace(/DataQualityLevel\.UNKNOWN/g, '"unknown"');
    
    return eval(processedContent);
  } catch (error) {
    throw new Error(`解析 processSteps 失败: ${error.message}`);
  }
}

// 测试函数
function runTests() {
  let passedTests = 0;
  let totalTests = 0;
  
  function test(name, testFn) {
    totalTests++;
    try {
      testFn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }
  
  let processSteps;
  try {
    processSteps = extractProcessSteps(fileContent);
    console.log(`✅ 成功解析 processSteps 数组，包含 ${processSteps.length} 个流程步骤\n`);
  } catch (error) {
    console.error('❌ 解析失败:', error.message);
    process.exit(1);
  }
  
  // 1. 数据结构完整性测试
  test('数据结构完整性 - processSteps 应该是数组', () => {
    if (!Array.isArray(processSteps)) {
      throw new Error('processSteps 不是数组');
    }
  });
  
  test('数据结构完整性 - 每个步骤应该有必需字段', () => {
    processSteps.forEach((step, index) => {
      if (!step.name) throw new Error(`步骤 ${index} 缺少 name 字段`);
      if (!step.description) throw new Error(`步骤 ${index} 缺少 description 字段`);
    });
  });
  
  // 2. 表结构验证测试
  test('表结构验证 - 每个步骤的表应该有完整字段', () => {
    processSteps.forEach((step, stepIndex) => {
      if (step.tables) {
        step.tables.forEach((table, tableIndex) => {
          if (!table.name) throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 缺少 name 字段`);
          if (!table.description) throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 缺少 description 字段`);
          if (!table.fields || !Array.isArray(table.fields)) {
            throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 缺少 fields 数组`);
          }
        });
      }
    });
  });
  
  // 3. 字段验证测试
  test('字段验证 - 每个字段应该有必需属性', () => {
    processSteps.forEach((step, stepIndex) => {
      if (step.tables) {
        step.tables.forEach((table, tableIndex) => {
          table.fields.forEach((field, fieldIndex) => {
            if (!field.name) throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 字段 ${fieldIndex} 缺少 name`);
            if (!field.type) throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 字段 ${fieldIndex} 缺少 type`);
            if (!field.description) throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 字段 ${fieldIndex} 缺少 description`);
          });
        });
      }
    });
  });
  
  // 4. 指标验证测试
  test('指标验证 - 每个指标应该有必需属性', () => {
    processSteps.forEach((step, stepIndex) => {
      if (step.tables) {
        step.tables.forEach((table, tableIndex) => {
          if (table.metrics) {
            table.metrics.forEach((metric, metricIndex) => {
              if (!metric.name) throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 指标 ${metricIndex} 缺少 name`);
              if (!metric.description) throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 指标 ${metricIndex} 缺少 description`);
              if (metric.type && !['count', 'sum', 'avg', 'rate', 'ratio', 'custom'].includes(metric.type)) {
                throw new Error(`步骤 ${stepIndex} 表 ${tableIndex} 指标 ${metricIndex} type 值无效: ${metric.type}`);
              }
            });
          }
        });
      }
    });
  });
  
  // 5. 业务流程完整性测试
  test('业务流程完整性 - 应该包含核心业务流程', () => {
    const stepNames = processSteps.map(step => step.name);
    const requiredSteps = ['注册', '实名', '授信', '支用'];
    
    requiredSteps.forEach(requiredStep => {
      if (!stepNames.includes(requiredStep)) {
        throw new Error(`缺少核心业务流程: ${requiredStep}`);
      }
    });
  });
  
  // 6. 数据质量验证测试
  test('数据质量验证 - 字段应该有质量等级', () => {
    let fieldsWithQuality = 0;
    let totalFields = 0;
    
    processSteps.forEach(step => {
      if (step.tables) {
        step.tables.forEach(table => {
          table.fields.forEach(field => {
            totalFields++;
            if (field.qualityLevel) {
              fieldsWithQuality++;
            }
          });
        });
      }
    });
    
    const qualityRate = fieldsWithQuality / totalFields;
    if (qualityRate < 0.8) {
      throw new Error(`字段质量等级覆盖率过低: ${(qualityRate * 100).toFixed(1)}%，应该 >= 80%`);
    }
  });
  
  console.log(`\n测试完成！`);
  console.log(`通过: ${passedTests}/${totalTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！businessProcessData.ts 优化成功。');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步优化。');
  }
}

// 运行测试
runTests();