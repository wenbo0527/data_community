import type { MockMethod } from 'vite-plugin-mock';

// 生成评估报告列表数据
const generateEvaluationReports = (count = 20) => {
  const statuses = ['草稿', '已发布', '已归档'];
  const reportTypes = ['效果评估']; // 只保留效果评估一种类型
  const analysisTypes = ['周期性分析', '实时分析', '批量分析'];
  
  const reports = [];
  
  // 添加一些固定的示例数据
  const fixedReports = [
    {
      id: 11,
      reportName: '产品A效果评估报告_20241201',
      reportType: '效果评估',
      analysisType: '周期性分析',
      generateDate: '2024-12-01',
      status: '已发布',
      progress: 100,
      sampleTimeSpan: '2024-11-01 至 2024-11-30',
      templateType: '标准模板',
      analysisTime: '2024-12-01 10:30:00',
      failureReason: null
    },
    {
      id: 10,
      reportName: '产品A完整效果评估报告_20241207',
      reportType: '效果评估',
      analysisType: '周期性分析',
      generateDate: '2024-12-07',
      status: '草稿',
      progress: 100,
      sampleTimeSpan: '2024-11-01 至 2024-11-30',
      templateType: '标准模板',
      analysisTime: '2024-12-07 16:30:00',
      failureReason: null
    },
    {
      id: 12,
      reportName: '产品B效果评估报告_20241202',
      reportType: '效果评估',
      analysisType: '实时分析',
      generateDate: '2024-12-02',
      status: '草稿',
      progress: 65,
      sampleTimeSpan: '2024-11-15 至 2024-12-02',
      templateType: '自定义模板',
      analysisTime: null,
      failureReason: null
    },
    {
      id: 13,
      reportName: '产品C效果评估报告_20241203',
      reportType: '效果评估',
      analysisType: '批量分析',
      generateDate: '2024-12-03',
      status: '已归档',
      progress: 100,
      sampleTimeSpan: '2024-10-01 至 2024-11-30',
      templateType: '标准模板',
      analysisTime: '2024-12-03 15:45:00',
      failureReason: null
    },
    {
      id: 14,
      reportName: '产品D效果评估报告_20241204',
      reportType: '效果评估',
      analysisType: '周期性分析',
      generateDate: '2024-12-04',
      status: '已发布',
      progress: 100,
      sampleTimeSpan: '2024-11-01 至 2024-11-30',
      templateType: '标准模板',
      analysisTime: '2024-12-04 14:20:00',
      failureReason: null
    },
    {
      id: 15,
      reportName: '产品A效果评估报告_20241205',
      reportType: '效果评估',
      analysisType: '实时分析',
      generateDate: '2024-12-05',
      status: '草稿',
      progress: 80,
      sampleTimeSpan: '2024-12-01 至 2024-12-05',
      templateType: '自定义模板',
      analysisTime: null,
      failureReason: null
    }
  ];
  
  reports.push(...fixedReports);
  
  // 生成随机数据
  for (let i = reports.length; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    const analysisType = analysisTypes[Math.floor(Math.random() * analysisTypes.length)];
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const dateStr = date.toISOString().split('T')[0];
    
    let progress = 0;
    if (status === '已发布' || status === '已归档') progress = 100;
    else if (status === '草稿') progress = Math.floor(Math.random() * 90) + 10;
    
    reports.push({
      id: i + 1,
      reportName: `${reportType}报告_${dateStr.replace(/-/g, '')}`,
      reportType,
      analysisType,
      generateDate: dateStr,
      status,
      progress,
      sampleTimeSpan: `${dateStr} 至 ${new Date().toISOString().split('T')[0]}`,
      templateType: Math.random() > 0.5 ? '标准模板' : '自定义模板',
      analysisTime: (status === '已发布' || status === '已归档') ? `${dateStr} ${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00` : null,
      failureReason: null
    });
  }
  
  return reports;
};

// 生成可编辑状态的完整报告详情（符合需求文档的7个模块结构）
const generateEditableReportDetail = (reportId: number) => {
  return {
    id: reportId,
    reportName: '产品A完整效果评估报告_20241207',
    productName: '产品A',
    reportType: '产品级效果评估',
    analysisType: '周期性分析',
    generateDate: '2024-12-07',
    status: '草稿',
    progress: 100,
    sampleTimeSpan: '2024-11-01 至 2024-11-30',
    templateType: '外数评估-产品级分析报告模板',
    templateId: 'template_external_product_mvp',
    analysisTime: '2024-12-07 16:30:00',
    failureReason: null,
    
    // 报告级别的编辑权限
    editable: true,
    
    // 产品注册状态
    productRegistrationStatus: 'registered',
    
    // 报告的7个固定模块（符合需求文档）
    modules: [
      {
        id: 1,
        name: '测试背景及目的',
        type: 'text',
        editType: 'text_only',
        status: 'completed',
        editable: true,
        content: '本次测试旨在评估产品A在外部数据投放中的效果表现。通过对2024年11月期间的投放数据进行全面分析，评估产品在不同平台的转化效果、用户质量和ROI表现，为后续投放策略优化提供数据支撑。测试重点关注产品的核心转化指标，包括点击率、转化率、获客成本等关键指标的表现情况。',
        wordLimit: 500,
        lastModified: '2024-12-07 16:30:00'
      },
      {
        id: 2,
        name: '产品介绍',
        type: 'text',
        editType: 'text_only',
        status: 'completed',
        editable: true,
        content: '产品A是一款面向中小企业的金融服务产品，主要功能包括信用评估、风险控制和资金匹配。产品通过大数据分析和机器学习算法，为中小企业提供快速、准确的信用评估服务，帮助金融机构降低风险，提高放贷效率。目标用户群体为年营业额在100万-5000万之间的中小企业主。',
        wordLimit: 300,
        lastModified: '2024-12-07 16:30:00'
      },
      {
        id: 3,
        name: '样本组成',
        type: 'text_and_table',
        editType: 'text_and_table',
        status: 'completed',
        editable: true,
        textContent: '本次分析使用的样本数据来源于2024年11月1日至11月30日期间的外数投放数据，经过数据清洗和去重处理后，共获得有效样本12,345条。样本数据覆盖iOS、Android、Web三个平台，涵盖多个主要投放渠道，确保分析结果的代表性和准确性。',
        tableData: {
          title: '样本统计表',
          headers: ['平台', '送测样本量', 'mob3_30+到期数', 'mob3_30+客户数', 'mob3_30+占比', '送测样本时间跨度'],
          rows: [
            ['iOS', '7,308', '6,892', '4,125', '59.8%', '2024-11-01 至 2024-11-30'],
            ['Android', '3,654', '3,421', '2,087', '61.0%', '2024-11-01 至 2024-11-30'],
            ['Web', '1,218', '1,167', '698', '59.8%', '2024-11-01 至 2024-11-30'],
            ['总计', '12,180', '11,480', '6,910', '60.2%', '2024-11-01 至 2024-11-30']
          ]
        },
        lastModified: '2024-12-07 16:30:00'
      },
      {
        id: 4,
        name: '总样本概况',
        type: 'text_and_dual_table',
        editType: 'text_and_dual_table',
        status: 'completed',
        editable: true,
        textContent: '样本总体分布均匀，覆盖各个业务场景和用户群体。通过样本饱和度分析和相关性检验，验证了样本的代表性和分析结果的可靠性。饱和度指标显示数据质量良好，相关性分析验证了各指标间的关联性。',
        tableData: {
          saturationTable: {
            title: '饱和度分析',
            headers: ['统计指标', '数值'],
            rows: [
              ['有值数', '11,480'],
              ['均值', '0.602'],
              ['标准差', '0.089'],
              ['最小值', '0.421'],
              ['最大值', '0.758'],
              ['中位数', '0.598'],
              ['75%分位数', '0.645'],
              ['95%分位数', '0.712']
            ]
          },
          correlationTable: {
            title: '相关性分析',
            headers: ['相关性指标', '系数值'],
            rows: [
              ['指标1', '0.73'],
              ['指标2', '0.65'],
              ['指标3', '0.58']
            ]
          }
        },
        lastModified: '2024-12-07 16:30:00'
      },
      {
        id: 5,
        name: '效果分析-全平台',
        type: 'text_and_chart_and_table',
        editType: 'text_and_chart_and_table',
        status: 'completed',
        editable: true,
        textContent: '全平台整体效果表现良好，转化漏斗各环节转化率均达到预期目标。从时间趋势来看，效果指标在分析周期内保持稳定，稳定性指标显示产品具有良好的持续转化能力。整体ROI达到2.3，超出预期目标20%。',
        chartData: {
          funnelChart: {
            title: '全平台转化漏斗图',
            type: 'image',
            imagePath: '/charts/funnel_chart_platform_all.svg',
            description: '展示全平台转化漏斗各环节数据，包含曝光、点击、访问、注册、转化五个环节的转化率'
          },
          trendChart: {
            title: '时间趋势图',
            type: 'image',
            imagePath: '/charts/trend_chart_platform_all.svg',
            description: '展示CTR、CVR、ROI三个关键指标在时间维度上的变化趋势'
          }
        },
        tableData: {
          title: '效果分析指标',
          headers: ['指标名称', 'IV值', 'WOE值', '信息值'],
          rows: [
            ['指标1', '0.342', '1.256', '0.428'],
            ['指标2', '0.287', '0.943', '0.371'],
            ['指标3', '0.195', '0.672', '0.289']
          ]
        },
        lastModified: '2024-12-07 16:30:00'
      },
      {
        id: 6,
        name: '效果分析-分平台',
        type: 'text_and_chart_and_table',
        editType: 'text_and_chart_and_table',
        status: 'completed',
        editable: true,
        textContent: '分平台效果对比显示iOS平台表现最佳，转化率达到4.8%，Android平台次之为4.1%，Web平台相对较低为3.2%。各平台稳定性指标均在合理范围内，iOS平台的用户质量和转化深度明显优于其他平台。',
        chartData: {
          platformComparison: {
            title: '分平台效果对比',
            type: 'image',
            imagePath: '/charts/platform_comparison_chart.svg',
            description: '展示iOS、Android、Web三个平台的CTR、CVR、ROI对比数据'
          },
          stabilityRadar: {
            title: '平台稳定性雷达图',
            type: 'image',
            imagePath: '/charts/stability_radar_chart.svg',
            description: '展示各平台在转化稳定性、成本稳定性、质量稳定性、时间稳定性、渠道稳定性五个维度的表现'
          }
        },
        tableData: {
          title: '分平台效果分析指标',
          headers: ['平台', 'IV值', 'WOE值', '信息值'],
          rows: [
            ['iOS', '0.398', '1.425', '0.567'],
            ['Android', '0.312', '1.089', '0.445'],
            ['Web', '0.234', '0.756', '0.298']
          ]
        },
        lastModified: '2024-12-07 16:30:00'
      },
      {
        id: 7,
        name: '数据结论',
        type: 'text',
        editType: 'text_only',
        status: 'completed',
        editable: true,
        content: '基于12,345条样本数据的分析结果，产品A在2024年11月期间表现优异，整体ROI达到2.3，超出预期目标。建议：1）继续加大iOS平台投放力度，该平台转化效果最佳；2）优化Android平台的投放策略，提升转化深度；3）重新评估Web平台投放价值，考虑调整预算分配；4）保持当前投放节奏，效果指标稳定且持续向好。后续计划在12月份扩大投放规模，预期整体ROI可提升至2.5以上。',
        wordLimit: 5000,
        lastModified: '2024-12-07 16:30:00'
      }
    ],
    
    // 样本文件信息
    sampleFiles: [
      {
        id: 1,
        fileName: 'product_a_sample_202411.csv',
        fileSize: '2.5MB',
        uploadTime: '2024-11-30 09:00:00',
        status: 'processed',
        recordCount: 12345
      },
      {
        id: 2,
        fileName: 'control_group_202411.csv',
        fileSize: '1.8MB',
        uploadTime: '2024-11-30 09:05:00',
        status: 'processed',
        recordCount: 8976
      }
    ],
    
    // 关键指标汇总
    keyMetrics: {
      totalImpressions: 1250000,
      totalClicks: 98500,
      totalConversions: 8420,
      overallCTR: 0.0788,
      overallCVR: 0.0855,
      totalCost: 156780,
      avgCPC: 1.59,
      avgCPA: 18.62,
      roi: 2.3
    },
    
    // 分析流程步骤（符合需求文档的9个步骤）
    analysisSteps: [
      {
        step: 1,
        name: '文件数据解析与验证',
        status: 'completed',
        startTime: '2024-12-07 16:00:00',
        endTime: '2024-12-07 16:00:08',
        duration: '8秒',
        description: '解析CSV文件并验证数据格式'
      },
      {
        step: 2,
        name: '数据质量检查与清洗',
        status: 'completed',
        startTime: '2024-12-07 16:00:08',
        endTime: '2024-12-07 16:00:20',
        duration: '12秒',
        description: '检查数据质量并清洗异常数据'
      },
      {
        step: 3,
        name: '单产品关键指标计算',
        status: 'completed',
        startTime: '2024-12-07 16:00:20',
        endTime: '2024-12-07 16:00:35',
        duration: '15秒',
        description: '计算CTR、CVR、ROI等关键指标'
      },
      {
        step: 4,
        name: '样本饱和度分析',
        status: 'completed',
        startTime: '2024-12-07 16:00:35',
        endTime: '2024-12-07 16:00:42',
        duration: '7秒',
        description: '分析样本饱和度和代表性'
      },
      {
        step: 5,
        name: '相关性指标计算',
        status: 'completed',
        startTime: '2024-12-07 16:00:42',
        endTime: '2024-12-07 16:01:05',
        duration: '23秒',
        description: '计算各维度相关性系数'
      },
      {
        step: 6,
        name: '全平台效果分析',
        status: 'completed',
        startTime: '2024-12-07 16:01:05',
        endTime: '2024-12-07 16:01:25',
        duration: '20秒',
        description: '分析全平台整体效果表现'
      },
      {
        step: 7,
        name: '分平台效果分析',
        status: 'completed',
        startTime: '2024-12-07 16:01:25',
        endTime: '2024-12-07 16:01:45',
        duration: '20秒',
        description: '对比分析各平台效果差异'
      },
      {
        step: 8,
        name: '图表自动生成',
        status: 'completed',
        startTime: '2024-12-07 16:01:45',
        endTime: '2024-12-07 16:02:00',
        duration: '15秒',
        description: '生成漏斗图、趋势图等可视化图表'
      },
      {
        step: 9,
        name: '结论模板填充',
        status: 'completed',
        startTime: '2024-12-07 16:02:00',
        endTime: '2024-12-07 16:02:05',
        duration: '5秒',
        description: '填充分析结论和建议模板'
      }
    ]
  };
};

// 生成评估报告详情数据
const generateEvaluationReportDetail = (id: string) => {
  const reportId = parseInt(id);
  
  // 为ID为10的报告提供特殊的可编辑状态
  if (reportId === 10) {
    return generateEditableReportDetail(reportId);
  }
  
  const statuses = ['completed', 'processing', 'failed', 'pending', 'paused'];
  const status = statuses[reportId % statuses.length];
  
  const baseData = {
    id: reportId,
    reportName: `产品${String.fromCharCode(65 + (reportId % 4))}效果评估报告_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
    productName: `产品${String.fromCharCode(65 + (reportId % 4))}`,
    reportType: '效果评估',
    analysisType: '周期性分析',
    generateDate: new Date().toISOString().split('T')[0],
    status,
    progress: status === 'completed' ? 100 : (status === 'processing' ? Math.floor(Math.random() * 80) + 10 : Math.floor(Math.random() * 50)),
    sampleTimeSpan: '2024-11-01 至 2024-11-30',
    templateType: '标准模板',
    analysisTime: status === 'completed' ? `${new Date().toISOString().split('T')[0]} 14:20:00` : null,
    failureReason: status === 'failed' ? '数据源连接失败' : null,
    
    // 报告模块
    modules: [
      {
        id: 1,
        name: '测试背景',
        status: status === 'completed' ? 'completed' : (status === 'processing' ? 'processing' : 'pending'),
        content: status === 'completed' ? '本次测试针对产品A在2024年11月的效果进行全面评估...' : null
      },
      {
        id: 2,
        name: '产品介绍',
        status: status === 'completed' ? 'completed' : (status === 'processing' ? 'processing' : 'pending'),
        content: status === 'completed' ? '产品A是一款面向中小企业的金融服务产品...' : null
      },
      {
        id: 3,
        name: '样本组成',
        status: status === 'completed' ? 'completed' : (status === 'processing' ? 'processing' : 'pending'),
        content: status === 'completed' ? '本次分析共包含样本数据12,345条...' : null
      },
      {
        id: 4,
        name: '总样本概况',
        status: status === 'completed' ? 'completed' : (status === 'processing' ? 'completed' : 'pending'),
        content: status === 'completed' ? '样本总体分布均匀，覆盖各个业务场景...' : null
      },
      {
        id: 5,
        name: '效果分析',
        status: status === 'completed' ? 'completed' : (status === 'processing' ? 'processing' : 'pending'),
        content: status === 'completed' ? '通过对比分析，产品A在目标指标上表现良好...' : null
      },
      {
        id: 6,
        name: '分平台效果',
        status: status === 'completed' ? 'completed' : (status === 'processing' ? 'processing' : 'pending'),
        content: status === 'completed' ? '各平台效果差异分析显示...' : null
      },
      {
        id: 7,
        name: '总结建议',
        status: status === 'completed' ? 'completed' : (status === 'processing' ? 'pending' : 'pending'),
        content: status === 'completed' ? '基于本次评估结果，建议...' : null
      }
    ],
    
    // 样本文件信息
    sampleFiles: [
      {
        id: 1,
        fileName: 'sample_data_202411.csv',
        fileSize: '2.5MB',
        uploadTime: '2024-11-30 09:00:00',
        status: 'processed'
      },
      {
        id: 2,
        fileName: 'control_group_202411.csv',
        fileSize: '1.8MB',
        uploadTime: '2024-11-30 09:05:00',
        status: 'processed'
      }
    ]
  };
  
  // 根据状态添加不同的数据
  if (status === 'completed' || status === 'processing') {
    return {
      ...baseData,
      // 分平台效果分析数据
      platformAnalysis: {
        platforms: ['字节', '蚂蚁', '京东', '美团'],
        data: [
          {
            platform: '字节',
            totalSamples: 3200,
            validSamples: 3150,
            conversionRate: 0.0845,
            avgCost: 12.5,
            roi: 2.3
          },
          {
            platform: '蚂蚁',
            totalSamples: 2800,
            validSamples: 2750,
            conversionRate: 0.0920,
            avgCost: 15.2,
            roi: 2.1
          },
          {
            platform: '京东',
            totalSamples: 3500,
            validSamples: 3420,
            conversionRate: 0.0780,
            avgCost: 11.8,
            roi: 2.5
          },
          {
            platform: '美团',
            totalSamples: 2900,
            validSamples: 2850,
            conversionRate: 0.0865,
            avgCost: 13.1,
            roi: 2.2
          }
        ]
      },
      
      // 关键指标汇总
      keyMetrics: {
        totalImpressions: 1250000,
        totalClicks: 98500,
        totalConversions: 8420,
        overallCTR: 0.0788,
        overallCVR: 0.0855,
        totalCost: 156780,
        avgCPC: 1.59,
        avgCPA: 18.62
      },
      
      // 时间趋势数据
      timeTrend: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 10, i + 1).toISOString().split('T')[0],
          impressions: Math.floor(Math.random() * 50000) + 30000,
          clicks: Math.floor(Math.random() * 4000) + 2000,
          conversions: Math.floor(Math.random() * 400) + 200,
          cost: Math.floor(Math.random() * 8000) + 4000
        })),
        hourly: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          impressions: Math.floor(Math.random() * 5000) + 2000,
          clicks: Math.floor(Math.random() * 400) + 100,
          conversions: Math.floor(Math.random() * 40) + 10,
          cost: Math.floor(Math.random() * 800) + 200
        }))
      },
      
      // 分析流程步骤
      analysisSteps: [
        {
          step: 1,
          name: '数据预处理',
          status: 'completed',
          startTime: '2024-12-04 10:00:00',
          endTime: '2024-12-04 10:15:00',
          duration: '15分钟',
          description: '清洗和标准化原始数据'
        },
        {
          step: 2,
          name: '样本匹配',
          status: 'completed',
          startTime: '2024-12-04 10:15:00',
          endTime: '2024-12-04 10:45:00',
          duration: '30分钟',
          description: '匹配实验组和对照组样本'
        },
        {
          step: 3,
          name: '特征工程',
          status: 'completed',
          startTime: '2024-12-04 10:45:00',
          endTime: '2024-12-04 11:30:00',
          duration: '45分钟',
          description: '构建分析所需的特征变量'
        },
        {
          step: 4,
          name: '效果计算',
          status: status === 'completed' ? 'completed' : 'processing',
          startTime: '2024-12-04 11:30:00',
          endTime: status === 'completed' ? '2024-12-04 12:15:00' : null,
          duration: status === 'completed' ? '45分钟' : null,
          description: '计算各项效果指标'
        },
        {
          step: 5,
          name: '统计检验',
          status: status === 'completed' ? 'completed' : 'pending',
          startTime: status === 'completed' ? '2024-12-04 12:15:00' : null,
          endTime: status === 'completed' ? '2024-12-04 12:45:00' : null,
          duration: status === 'completed' ? '30分钟' : null,
          description: '进行统计显著性检验'
        },
        {
          step: 6,
          name: '分平台分析',
          status: status === 'completed' ? 'completed' : 'pending',
          startTime: status === 'completed' ? '2024-12-04 12:45:00' : null,
          endTime: status === 'completed' ? '2024-12-04 13:30:00' : null,
          duration: status === 'completed' ? '45分钟' : null,
          description: '分析各平台的效果差异'
        },
        {
          step: 7,
          name: '趋势分析',
          status: status === 'completed' ? 'completed' : 'pending',
          startTime: status === 'completed' ? '2024-12-04 13:30:00' : null,
          endTime: status === 'completed' ? '2024-12-04 14:00:00' : null,
          duration: status === 'completed' ? '30分钟' : null,
          description: '分析时间趋势和周期性规律'
        },
        {
          step: 8,
          name: '报告生成',
          status: status === 'completed' ? 'completed' : 'pending',
          startTime: status === 'completed' ? '2024-12-04 14:00:00' : null,
          endTime: status === 'completed' ? '2024-12-04 14:15:00' : null,
          duration: status === 'completed' ? '15分钟' : null,
          description: '生成最终分析报告'
        },
        {
          step: 9,
          name: '质量检查',
          status: status === 'completed' ? 'completed' : 'pending',
          startTime: status === 'completed' ? '2024-12-04 14:15:00' : null,
          endTime: status === 'completed' ? '2024-12-04 14:20:00' : null,
          duration: status === 'completed' ? '5分钟' : null,
          description: '检查报告质量和完整性'
        }
      ]
    };
  }
  
  return baseData;
};

// 生成已注册的外数产品列表
const generateRegisteredProducts = () => {
  return [
    {
      id: 1,
      name: '产品A',
      provider: '数据提供商A',
      category: '风控数据',
      status: 'active',
      registrationDate: '2024-01-15',
      lastUpdateDate: '2024-11-30',
      description: '提供用户信用评估相关数据'
    },
    {
      id: 2,
      name: '产品B',
      provider: '数据提供商B',
      category: '营销数据',
      status: 'active',
      registrationDate: '2024-02-20',
      lastUpdateDate: '2024-12-01',
      description: '提供用户行为分析数据'
    },
    {
      id: 3,
      name: '产品C',
      provider: '数据提供商C',
      category: '反欺诈数据',
      status: 'inactive',
      registrationDate: '2024-03-10',
      lastUpdateDate: '2024-10-15',
      description: '提供反欺诈检测数据'
    },
    {
      id: 4,
      name: '产品D',
      provider: '数据提供商D',
      category: '征信数据',
      status: 'active',
      registrationDate: '2024-04-05',
      lastUpdateDate: '2024-11-28',
      description: '提供征信相关数据服务'
    }
  ];
};

export default [
  // 模拟外部数据评估报告列表API
  {
    url: '/api/external-data-evaluation/list',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const { 
        current = 1, 
        pageSize = 10, 
        reportName, 
        status, 
        startDate, 
        endDate 
      } = query;
      
      let reports = generateEvaluationReports(50);
      
      // 过滤条件
      if (reportName) {
        reports = reports.filter(report => 
          report.reportName.toLowerCase().includes(reportName.toLowerCase())
        );
      }
      
      if (status) {
        reports = reports.filter(report => report.status === status);
      }
      
      if (startDate) {
        reports = reports.filter(report => report.generateDate >= startDate);
      }
      
      if (endDate) {
        reports = reports.filter(report => report.generateDate <= endDate);
      }
      
      // 分页
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const paginatedReports = reports.slice(start, end);
      
      return {
        code: 200,
        message: 'success',
        data: {
          list: paginatedReports,
          total: reports.length,
          current: parseInt(current),
          pageSize: parseInt(pageSize)
        }
      };
    }
  },
  
  // 模拟外部数据评估报告详情API
  {
    url: '/api/external-data-evaluation/detail/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop();
      if (!id) {
        return {
          code: 400,
          message: '缺少报告ID',
          data: null
        };
      }
      
      const reportDetail = generateEvaluationReportDetail(id);
      
      return {
        code: 200,
        message: 'success',
        data: reportDetail
      };
    }
  },
  
  // 模拟创建外部数据评估报告API
  {
    url: '/api/external-data-evaluation/create',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { reportName, reportType, analysisType, sampleFiles } = body;
      
      const newReport = {
        id: Date.now(),
        reportName,
        reportType,
        analysisType,
        generateDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        progress: 0,
        sampleTimeSpan: '',
        templateType: '标准模板',
        analysisTime: null,
        failureReason: null,
        sampleFiles: sampleFiles || []
      };
      
      return {
        code: 200,
        message: '报告创建成功',
        data: newReport
      };
    }
  },
  
  // 模拟获取已注册的外数产品列表API
  {
    url: '/api/external-data-evaluation/products',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: generateRegisteredProducts()
      };
    }
  },
  
  // 模拟更新外部数据评估报告API
  {
    url: '/api/external-data-evaluation/update/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = url.split('/').pop();
      if (!id) {
        return {
          code: 400,
          message: '缺少报告ID',
          data: null
        };
      }
      
      // 模拟保存成功
      return {
        code: 200,
        message: '报告保存成功',
        data: {
          id: parseInt(id),
          ...body,
          lastModified: new Date().toISOString()
        }
      };
    }
  },
  
  // 模拟发布外部数据评估报告API
  {
    url: '/api/external-data-evaluation/publish/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = url.split('/').pop();
      if (!id) {
        return {
          code: 400,
          message: '缺少报告ID',
          data: null
        };
      }
      
      // 模拟发布成功
      return {
        code: 200,
        message: '报告发布成功',
        data: {
          id: parseInt(id),
          ...body,
          status: '已发布',
          progress: 100,
          publishTime: new Date().toISOString()
        }
      };
    }
  }
] as MockMethod[];