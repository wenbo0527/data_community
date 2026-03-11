/**
 * 风险外数效果评估测试数据 - 不同阶段
 * 用于支持新建、编辑、详情查看的测试场景
 */

// 阶段1：新建状态（草稿）
export const draftStageData = {
  id: 'draft-001',
  stage: 'draft',
  title: '风险外数效果评估 - 新建草稿',
  
  formData: {
    productName: '',
    templateType: '风险外数效果评估模板',
    sampleFile: null,
    analysisPeriod: [],
    reportName: '',
    analysisDescription: ''
  },
  
  mockProducts: [
    { id: 1, name: '产品A', status: '已注册' },
    { id: 2, name: '产品B', status: '已注册' },
    { id: 3, name: '测试产品(未注册)', status: '未注册' }
  ],
  
  sampleFiles: [
    {
      name: '样本数据_产品A_20240101_20240131.csv',
      size: '2.3MB',
      timeSpan: { start: '20240101', end: '20240131', days: 31 }
    },
    {
      name: '样本数据_产品B_20240201_20240229.csv',
      size: '1.8MB',
      timeSpan: { start: '20240201', end: '20240229', days: 29 }
    }
  ]
};

// 阶段2：编辑状态（分析中）
export const processingStageData = {
  id: 'processing-001',
  stage: 'processing',
  title: '风险外数效果评估 - 分析中',
  
  reportData: {
    id: 1001,
    reportName: '产品A-风险外数效果评估-20240101-20240131',
    productName: '产品A',
    templateType: '风险外数效果评估模板',
    status: '分析中',
    progress: 65,
    estimatedCompletion: '约2分钟',
    sampleTimeSpan: '20240101至20240131',
    analysisPeriod: ['20240101', '20240131'],
    analysisDescription: '针对产品A在2024年1月期间的风险外数效果进行全面评估',
    
    sampleFile: {
      name: '样本数据_产品A_20240101_20240131.csv',
      size: '2.3MB',
      columns: ['日期', '产品名称', '风险指标', '实际效果', '标记结果', '置信度'],
      rows: 892,
      uploadTime: '2024-12-26 14:30:00',
      timeSpan: {
        start: '20240101',
        end: '20240131',
        days: 31
      }
    },
    
    modulesStatus: [
      { id: 1, name: '数据概览', status: '已完成', progress: 100 },
      { id: 2, name: '风险识别', status: '已完成', progress: 100 },
      { id: 3, name: '效果评估', status: '进行中', progress: 65 },
      { id: 4, name: '异常检测', status: '待开始', progress: 0 },
      { id: 5, name: '性能分析', status: '待开始', progress: 0 },
      { id: 6, name: '合规检查', status: '待开始', progress: 0 },
      { id: 7, name: '结论建议', status: '待开始', progress: 0 }
    ]
  }
};

// 阶段3：详情查看（已完成）
export const completedStageData = {
  id: 'completed-001',
  stage: 'completed',
  title: '风险外数效果评估 - 已完成',
  
  reportData: {
    id: 1002,
    reportName: '产品B-风险外数效果评估-20240201-20240229',
    productName: '产品B',
    templateType: '风险外数效果评估模板',
    status: '已完成',
    progress: 100,
    analysisDate: '2024-12-26 15:45:00',
    sampleTimeSpan: '20240201至20240229',
    analysisPeriod: ['20240201', '20240229'],
    analysisDescription: '产品B在2024年2月期间的风险外数效果评估报告',
    
    sampleFile: {
      name: '样本数据_产品B_20240201_20240229.csv',
      size: '1.8MB',
      columns: ['日期', '产品名称', '风险指标', '实际效果', '标记结果', '置信度', '备注'],
      rows: 678,
      uploadTime: '2024-12-26 15:30:00',
      timeSpan: {
        start: '20240201',
        end: '20240229',
        days: 29
      }
    },
    
    modules: [
      {
        id: 1,
        name: '数据概览',
        status: '已完成',
        summary: '样本数据完整性100%，有效数据678条，覆盖29天',
        metrics: {
          totalSamples: 678,
          validSamples: 678,
          dataIntegrity: '100%',
          coverageDays: 29
        }
      },
      {
        id: 2,
        name: '风险识别',
        status: '已完成',
        summary: '识别出高风险事件23个，中风险事件45个',
        metrics: {
          highRiskEvents: 23,
          mediumRiskEvents: 45,
          lowRiskEvents: 12,
          accuracy: '94.2%'
        }
      },
      {
        id: 3,
        name: '效果评估',
        status: '已完成',
        summary: '整体风险降低率达到87.5%，效果显著',
        metrics: {
          riskReductionRate: '87.5%',
          precision: '92.3%',
          recall: '89.7%',
          f1Score: '90.9'
        }
      },
      {
        id: 4,
        name: '异常检测',
        status: '已完成',
        summary: '检测到异常模式3种，异常样本占比5.9%',
        metrics: {
          anomalyPatterns: 3,
          anomalyRate: '5.9%',
          falsePositiveRate: '2.1%'
        }
      },
      {
        id: 5,
        name: '性能分析',
        status: '已完成',
        summary: '平均响应时间0.8秒，处理速度1200条/小时',
        metrics: {
          avgResponseTime: '0.8s',
          processingSpeed: '1200条/小时',
          resourceUtilization: '65%'
        }
      },
      {
        id: 6,
        name: '合规检查',
        status: '已完成',
        summary: '合规率98.7%，发现轻微违规2项已整改',
        metrics: {
          complianceRate: '98.7%',
          violations: 2,
          status: '已整改'
        }
      },
      {
        id: 7,
        name: '结论建议',
        status: '已完成',
        summary: '产品B风险外数效果优秀，建议持续优化',
        metrics: {
          overallScore: 'A级',
          recommendations: 5,
          nextReview: '2024-03-31'
        }
      }
    ]
  }
};

// 测试场景数据生成器
export const generateTestScenario = (scenarioType) => {
  switch (scenarioType) {
    case 'new':
      return draftStageData;
    case 'edit':
      return processingStageData;
    case 'view':
      return completedStageData;
    default:
      return completedStageData;
  }
};

// 批量生成测试报告
export const generateTestReports = (count = 10) => {
  const reports = [];
  const stages = ['draft', 'processing', 'completed'];
  
  for (let i = 1; i <= count; i++) {
    const stage = stages[i % 3];
    const baseData = generateTestScenario(stage);
    
    reports.push({
      id: 2000 + i,
      ...baseData.reportData,
      stage: stage,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return reports;
};