# 外数评估MVP技术方案

## 📋 文档信息

| 项目 | 详情 |
|---|---|
| **文档名称** | 外数评估MVP技术方案 |
| **版本** | v1.0 |
| **创建日期** | 2025-01-08 |
| **状态** | 开发中 |
| **编写人** | TDD前端架构师 |

## 🎯 需求背景

基于《外数评估MVP需求文档》，需要实现一个完整的外数评估系统，支持：
- 样本数据文件上传（CSV/Excel，最大100MB）
- 外数产品选择（已注册/未注册产品区分）
- 固定的7个模块报告模板
- 标准化的9步分析流程
- 报告编辑和发布功能
- 效果查询列表页

## 🏗️ 架构设计

### 前端技术栈
- **框架**: Vue 3 (Composition API)
- **UI组件库**: Arco Design
- **状态管理**: Vuex
- **路由管理**: Vue Router
- **构建工具**: Vite
- **开发语言**: TypeScript
- **图表库**: ECharts (用于自动生成图表)

### 组件结构
```
src/pages/exploration/
├── ExternalDataEvaluationList.vue          # 外数效果查询列表页
├── CreateExternalDataEvaluation.vue        # 创建外数评估页
├── ExternalDataEvaluationDetail.vue        # 报告详情页
├── ExternalDataEvaluationEdit.vue          # 报告编辑页
└── components/
    ├── ReportModuleEditor.vue               # 报告模块编辑器
    ├── DataUploadValidator.vue              # 数据上传验证器
    ├── ProductSelector.vue                  # 产品选择器
    ├── AnalysisProgressTracker.vue          # 分析进度跟踪器
    └── ReportTemplateRenderer.vue           # 报告模板渲染器
```

### 数据流向
```
文件上传 → 数据验证 → 产品选择 → 分析流程 → 报告生成 → 编辑发布 → 列表展示
```

## 📊 功能模块设计

### 1. 数据上传功能

#### 1.1 标准字段验证
```typescript
interface StandardFields {
  user_id: string;      // 用户唯一标识 (必填)
  event_type: string;   // 事件类型(曝光/点击/转化) (必填)
  event_time: string;   // 事件发生时间 (必填)
  platform: string;    // 平台类型(iOS/Android/Web) (必填)
  channel: string;      // 渠道来源 (必填)
  value?: number;       // 事件数值 (可选)
}
```

#### 1.2 数据验证规则
- 文件格式：CSV、Excel(.xlsx/.xls)
- 文件大小：最大100MB
- 必填字段检查
- 数据类型验证
- 重复值检测
- 空值处理

### 2. 报告模板结构

#### 2.1 固定的7个模块
```typescript
interface ReportModule {
  id: number;
  name: string;
  type: string;
  content: string;
  editable: boolean;
  charts?: string[];
  dataPoints?: string[];
}

const FIXED_MODULES = [
  {
    id: 1,
    name: '测试背景及目的',
    type: 'text',
    editable: true,
    defaultContent: '本次测试旨在评估[产品名称]在外部数据投放中的效果表现...'
  },
  {
    id: 2,
    name: '产品介绍',
    type: 'text',
    editable: true,
    defaultContent: '[产品名称]是一款[产品类型]产品，主要功能包括...'
  },
  {
    id: 3,
    name: '样本组成',
    type: 'text_table',
    editable: true, // 文字可编辑，表格自动生成
    charts: ['样本分布图', '时间分布图']
  },
  {
    id: 4,
    name: '总样本概况',
    type: 'text_table',
    editable: true, // 文字可编辑，表格自动生成
    tables: ['样本饱和度表格', '相关性数据表格']
  },
  {
    id: 5,
    name: '效果分析-全平台',
    type: 'text_chart',
    editable: true, // 文字可编辑，图片自动生成
    charts: ['全平台转化漏斗图', '时间趋势图']
  },
  {
    id: 6,
    name: '效果分析-分平台',
    type: 'text_chart',
    editable: true, // 文字可编辑，图片自动生成
    charts: ['分平台效果对比柱状图', '平台稳定性雷达图']
  },
  {
    id: 7,
    name: '数据结论',
    type: 'text',
    editable: true, // 完全可编辑
    defaultContent: '基于[样本量]条数据的分析结果，[产品名称]在[时间范围]内表现...'
  }
];
```

### 3. 分析流程设计

#### 3.1 9步分析流程
```typescript
interface AnalysisStep {
  id: number;
  name: string;
  description: string;
  input: string;
  output: string;
  estimatedTime: number; // 秒
}

const ANALYSIS_WORKFLOW = [
  {
    id: 1,
    name: '文件数据解析与验证',
    description: '解析上传的CSV/Excel文件，验证数据格式',
    input: '上传的CSV/Excel文件',
    output: '结构化数据表',
    estimatedTime: 10
  },
  {
    id: 2,
    name: '数据质量检查与清洗',
    description: '检查数据完整性，清洗异常数据',
    input: '结构化数据',
    output: '清洗后数据+质量报告',
    estimatedTime: 15
  },
  {
    id: 3,
    name: '单产品关键指标计算',
    description: '计算CTR、CVR、ROI等关键指标',
    input: '清洗后数据',
    output: 'CTR、CVR、ROI等指标',
    estimatedTime: 20
  },
  {
    id: 4,
    name: '样本饱和度分析',
    description: '分析样本的饱和度情况',
    input: '单产品数据',
    output: '样本饱和度表格',
    estimatedTime: 10
  },
  {
    id: 5,
    name: '相关性指标计算',
    description: '计算用户特征与转化的相关性',
    input: '用户特征数据',
    output: '相关性系数表格',
    estimatedTime: 30
  },
  {
    id: 6,
    name: '全平台效果分析',
    description: '分析全平台整体效果',
    input: '全部数据',
    output: '全平台效果图表',
    estimatedTime: 25
  },
  {
    id: 7,
    name: '分平台效果分析',
    description: '分析各平台效果对比',
    input: '按平台分组数据',
    output: '分平台对比图表',
    estimatedTime: 25
  },
  {
    id: 8,
    name: '图表自动生成',
    description: '生成漏斗图、趋势图等可视化图表',
    input: '分析结果数据',
    output: '漏斗图、趋势图等',
    estimatedTime: 20
  },
  {
    id: 9,
    name: '结论模板填充',
    description: '基于分析结果填充报告模板',
    input: '全部分析结果',
    output: '完整分析报告',
    estimatedTime: 10
  }
];
```

## 🧪 测试用例设计

### 1. 数据上传测试
```typescript
describe('数据上传功能', () => {
  test('应该支持CSV文件上传', async () => {
    const file = new File(['user_id,event_type,event_time,platform,channel\n1,click,2024-01-01,iOS,A'], 'test.csv');
    const result = await uploadFile(file);
    expect(result.success).toBe(true);
  });

  test('应该验证必填字段', async () => {
    const file = new File(['user_id,event_type\n1,click'], 'test.csv');
    const result = await uploadFile(file);
    expect(result.errors).toContain('缺少必填字段: event_time, platform, channel');
  });

  test('应该限制文件大小为100MB', async () => {
    const largeFile = new File([new ArrayBuffer(101 * 1024 * 1024)], 'large.csv');
    const result = await uploadFile(largeFile);
    expect(result.errors).toContain('文件大小超过100MB限制');
  });
});
```

### 2. 产品选择测试
```typescript
describe('产品选择功能', () => {
  test('应该区分已注册和未注册产品', () => {
    const registeredProduct = { id: 1, name: '产品A', registered: true };
    const unregisteredProduct = { name: '新产品', registered: false };
    
    expect(getProductStatus(registeredProduct)).toBe('已注册');
    expect(getProductStatus(unregisteredProduct)).toBe('未注册');
  });

  test('应该支持单选产品', () => {
    const selector = new ProductSelector();
    selector.selectProduct('产品A');
    selector.selectProduct('产品B');
    
    expect(selector.selectedProducts).toHaveLength(1);
    expect(selector.selectedProducts[0]).toBe('产品B');
  });
});
```

### 3. 报告模板测试
```typescript
describe('报告模板功能', () => {
  test('应该包含7个固定模块', () => {
    const template = new ReportTemplate();
    expect(template.modules).toHaveLength(7);
    expect(template.modules.map(m => m.name)).toEqual([
      '测试背景及目的',
      '产品介绍',
      '样本组成',
      '总样本概况',
      '效果分析-全平台',
      '效果分析-分平台',
      '数据结论'
    ]);
  });

  test('应该支持模块内容编辑', () => {
    const module = new ReportModule(1, '测试背景及目的', 'text', true);
    module.updateContent('更新后的内容');
    expect(module.content).toBe('更新后的内容');
  });
});
```

### 4. 分析流程测试
```typescript
describe('分析流程功能', () => {
  test('应该按顺序执行9个步骤', async () => {
    const workflow = new AnalysisWorkflow();
    const result = await workflow.execute(mockData);
    
    expect(result.steps).toHaveLength(9);
    expect(result.totalTime).toBeLessThan(165); // 总时间应小于165秒
  });

  test('应该在步骤失败时停止执行', async () => {
    const workflow = new AnalysisWorkflow();
    const invalidData = {}; // 无效数据
    
    const result = await workflow.execute(invalidData);
    expect(result.success).toBe(false);
    expect(result.failedStep).toBe(1); // 第一步失败
  });
});
```

## 🚀 实施计划

### 第1阶段：基础组件开发 (1-2天)
- [x] 外数评估列表页 (ExternalDataEvaluationList.vue)
- [x] 创建外数评估页 (CreateExternalDataEvaluation.vue)
- [ ] 数据上传验证器 (DataUploadValidator.vue)
- [ ] 产品选择器 (ProductSelector.vue)

### 第2阶段：报告模板系统 (2-3天)
- [ ] 报告模板渲染器 (ReportTemplateRenderer.vue)
- [ ] 报告模块编辑器 (ReportModuleEditor.vue)
- [ ] 7个固定模块实现
- [ ] 图表自动生成功能

### 第3阶段：分析流程引擎 (3-4天)
- [ ] 9步分析流程实现
- [ ] 分析进度跟踪器 (AnalysisProgressTracker.vue)
- [ ] 数据处理和计算逻辑
- [ ] 错误处理和重试机制

### 第4阶段：报告编辑和发布 (2-3天)
- [x] 报告详情页 (ExternalDataEvaluationDetail.vue) - 已完成
- [x] 报告编辑页 (ExternalDataEvaluationEdit.vue) - 已完成
- [x] 路由配置更新 - 已完成
- [ ] 版本控制功能
- [ ] PDF导出功能

### 第5阶段：测试和优化 (1-2天)
- [ ] 单元测试编写
- [ ] 集成测试
- [ ] 性能优化
- [ ] 用户验收测试

## ✅ 验收标准

### 功能验收
- [ ] 支持CSV/Excel文件上传，最大100MB
- [ ] 标准字段验证和数据清洗
- [ ] 产品选择区分已注册/未注册
- [ ] 7个固定模块报告生成
- [ ] 9步分析流程完整执行
- [ ] 报告编辑和版本控制
- [ ] 报告发布到列表页
- [ ] PDF导出功能

### 性能验收
- [ ] 数据上传响应时间 < 5秒
- [ ] 分析流程执行时间 < 165秒
- [ ] 页面加载时间 < 2秒
- [ ] 支持100万条样本数据

### 质量验收
- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试通过率 100%
- [ ] 无严重Bug
- [ ] 用户体验良好

## 📝 开发日志

### 2024-12-19
- ✅ 完成外数评估详情页 (ExternalDataEvaluationDetail.vue)
  - 实现7个固定模块的动态渲染
  - 支持文字、表格、图表内容展示
  - 集成ECharts图表渲染功能
  - 添加报告导出和编辑功能
- ✅ 完成外数评估编辑页 (ExternalDataEvaluationEdit.vue)
  - 实现报告内容编辑功能
  - 支持文字内容和建议的编辑
  - 添加保存、预览、返回功能
- ✅ 更新路由配置
  - 添加详情页路由: `/exploration/external-data-evaluation/detail/:id`
  - 添加编辑页路由: `/exploration/external-data-evaluation/edit/:id`
- ✅ 编写测试用例并验证功能
- ✅ 创建开发日志文档
- ✅ 通过人工确认

### 2025-01-08
- ✅ 创建技术方案文档
- ✅ 分析现有代码结构
- 🔄 开始实现缺失功能

---

**文档状态**: 第4阶段部分完成  
**下次更新**: 2024-12-20  
**负责人**: TDD前端架构师