# 数字风险平台离线模型模块 - 纯前端展示Demo实施计划

## 1. 项目概述

### 1.1 项目目标
构建一个功能完整的纯前端演示Demo，通过Mock数据展示数字风险平台离线模型模块的5个核心功能：特征中心、模型注册、模型回溯、任务管理、模型评估。

### 1.2 技术栈
- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI组件库**: Arco Design Vue
- **图表库**: ECharts + AntV X6 (拓扑图)
- **状态管理**: Pinia (替代Vuex，更轻量)
- **路由**: Vue Router 4
- **数据模拟**: Mock.js + 本地JSON
- **类型支持**: TypeScript

## 2. 项目架构设计

### 2.1 目录结构
```
src/
├── api/                    # API接口定义
│   ├── feature.ts         # 特征中心API
│   ├── model.ts           # 模型管理API
│   ├── task.ts            # 任务管理API
│   └── evaluation.ts      # 模型评估API
├── components/             # 公共组件
│   ├── charts/            # 图表组件
│   │   ├── EChartsWrapper.vue
│   │   ├── FeatureDistribution.vue
│   │   ├── ModelMetrics.vue
│   │   └── TopologyGraph.vue  # AntV X6拓扑图
│   ├── common/            # 通用组件
│   │   ├── DataTable.vue
│   │   ├── FileUpload.vue
│   │   ├── StatusTag.vue
│   │   └── TimeSelector.vue
│   └── layout/            # 布局组件
│       ├── AppLayout.vue
│       ├── Sidebar.vue
│       └── Header.vue
├── mock/                   # Mock数据和接口
│   ├── data/              # Mock数据文件
│   │   ├── features.json
│   │   ├── models.json
│   │   ├── tasks.json
│   │   └── evaluations.json
│   ├── handlers/          # Mock处理函数
│   │   ├── feature.ts
│   │   ├── model.ts
│   │   └── task.ts
│   └── index.ts            # Mock服务入口
├── pages/                  # 页面组件
│   ├── feature-center/    # 特征中心
│   ├── model-registry/    # 模型注册
│   ├── model-backtrack/   # 模型回溯
│   ├── task-management/   # 任务管理
│   └── model-evaluation/  # 模型评估
├── router/                 # 路由配置
│   └── index.ts
├── stores/                 # 状态管理
│   ├── feature.ts
│   ├── model.ts
│   ├── task.ts
│   └── evaluation.ts
├── types/                  # TypeScript类型定义
│   ├── feature.ts
│   ├── model.ts
│   ├── task.ts
│   └── evaluation.ts
└── utils/                  # 工具函数
    ├── date.ts
    ├── file.ts
    └── chart.ts
```

### 2.2 核心组件设计

#### 2.2.1 数据表格组件 (DataTable.vue)
```vue
<template>
  <a-table
    :columns="columns"
    :data="tableData"
    :pagination="pagination"
    :loading="loading"
    @page-change="handlePageChange"
    @sort-change="handleSortChange"
  >
    <template #actions="{ record }">
      <a-space>
        <a-button type="text" @click="handleView(record)">查看</a-button>
        <a-button type="text" @click="handleEdit(record)">编辑</a-button>
        <a-button type="text" status="danger" @click="handleDelete(record)">删除</a-button>
      </a-space>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  columns: any[]
  data: any[]
  loading?: boolean
  pagination?: any
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: () => ({ total: 0, current: 1, pageSize: 10 })
})

const emit = defineEmits<{
  view: [record: any]
  edit: [record: any]
  delete: [record: any]
  pageChange: [page: number]
  sortChange: [sort: any]
}>()
</script>
```

#### 2.2.2 文件上传组件 (FileUpload.vue)
```vue
<template>
  <a-upload
    :multiple="multiple"
    :accept="accept"
    :limit="limit"
    :custom-request="customRequest"
    @change="handleChange"
  >
    <template #upload-button>
      <a-button>
        <icon-upload /> 点击上传
      </a-button>
    </template>
  </a-upload>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  multiple?: boolean
  accept?: string
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  accept: '.csv,.xlsx,.xls',
  limit: 1
})

const customRequest = (option: any) => {
  // 模拟文件上传
  setTimeout(() => {
    option.onSuccess({ url: 'mock-url' })
  }, 1000)
}
</script>
```

## 3. Mock数据设计

### 3.1 特征中心Mock数据
```typescript
// mock/data/features.json
{
  "features": [
    {
      "id": "feature_001",
      "name": "user_age",
      "displayName": "用户年龄",
      "type": "numerical",
      "category": "用户画像",
      "version": "v1.0.0",
      "status": "active",
      "storagePath": "/data/features/user_age_v1.parquet",
      "serviceEndpoint": "http://api.feature.service/user_age",
      "description": "用户注册时填写的年龄信息",
      "createTime": "2024-01-15 10:30:00",
      "updateTime": "2024-01-15 10:30:00",
      "statistics": {
        "count": 100000,
        "mean": 32.5,
        "std": 12.3,
        "min": 18,
        "max": 65,
        "missingRate": 0.02
      }
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 10
}
```

### 3.2 模型注册Mock数据
```typescript
// mock/data/models.json
{
  "models": [
    {
      "id": "model_001",
      "name": "credit_risk_v1",
      "displayName": "信用风险评分模型V1",
      "version": "v1.2.0",
      "type": "xgboost",
      "status": "production",
      "accuracy": 0.852,
      "auc": 0.891,
      "f1Score": 0.763,
      "trainingDate": "2024-01-20",
      "modelSize": "45.2MB",
      "filePath": "/models/credit_risk_v1.2.0.pkl",
      "hyperparameters": {
        "n_estimators": 100,
        "max_depth": 6,
        "learning_rate": 0.1
      },
      "features": ["user_age", "income", "credit_history", "debt_ratio"],
      "description": "基于XGBoost的信用风险评分模型"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 10
}
```

### 3.3 模型回溯Mock数据
```typescript
// mock/data/backtrack.json
{
  "backtrackTasks": [
    {
      "id": "backtrack_001",
      "taskName": "2024Q1信用风险模型回溯",
      "modelId": "model_001",
      "modelVersion": "v1.2.0",
      "sampleFile": {
        "name": "credit_samples_2024Q1.csv",
        "size": "15.3MB",
        "rowCount": 50000,
        "columns": ["user_id", "age", "income", "credit_score", "default_flag"]
      },
      "backtrackTime": "2024-01-25 14:30:00",
      "modelScoreTime": "2024-01-20 10:00:00",
      "status": "completed",
      "progress": 100,
      "results": {
        "totalSamples": 50000,
        "avgScore": 0.234,
        "scoreDistribution": {
          "0-0.2": 15000,
          "0.2-0.4": 20000,
          "0.4-0.6": 10000,
          "0.6-0.8": 4000,
          "0.8-1.0": 1000
        },
        "performance": {
          "accuracy": 0.845,
          "precision": 0.812,
          "recall": 0.789,
          "f1Score": 0.800
        }
      },
      "reportPath": "/reports/backtrack_2024Q1.pdf",
      "createTime": "2024-01-25 14:30:00",
      "completeTime": "2024-01-25 14:35:00"
    }
  ]
}
```

### 3.4 任务管理Mock数据
```typescript
// mock/data/tasks.json
{
  "tasks": [
    {
      "id": "task_001",
      "taskName": "信用风险模型训练",
      "taskType": "model_training",
      "priority": "high",
      "status": "running",
      "progress": 65,
      "resourceUsage": {
        "cpu": "75%",
        "memory": "8.2GB",
        "gpu": "60%"
      },
      "createdBy": "zhangsan",
      "createdTime": "2024-01-25 09:00:00",
      "startTime": "2024-01-25 09:05:00",
      "estimatedEndTime": "2024-01-25 11:00:00",
      "logs": [
        {
          "time": "2024-01-25 09:05:00",
          "level": "info",
          "message": "任务开始执行"
        },
        {
          "time": "2024-01-25 09:10:00",
          "level": "info",
          "message": "数据加载完成，样本数: 100000"
        }
      ]
    }
  ],
  "total": 30,
  "page": 1,
  "pageSize": 10
}
```

### 3.5 模型评估Mock数据
```typescript
// mock/data/evaluations.json
{
  "evaluations": [
    {
      "id": "eval_001",
      "modelId": "model_001",
      "modelVersion": "v1.2.0",
      "evaluationName": "信用风险模型综合评估",
      "evaluationType": "offline",
      "dataset": {
        "name": "test_dataset_2024Q1",
        "size": 20000,
        "positiveRatio": 0.15
      },
      "metrics": {
        "accuracy": 0.852,
        "precision": 0.812,
        "recall": 0.789,
        "f1Score": 0.800,
        "auc": 0.891,
        "ks": 0.456,
        "gini": 0.782
      },
      "confusionMatrix": [
        [1700, 300],
        [200, 1800]
      ],
      "rocCurve": {
        "fpr": [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        "tpr": [0, 0.3, 0.5, 0.65, 0.75, 0.82, 0.87, 0.91, 0.95, 0.98, 1.0]
      },
      "featureImportance": [
        {"feature": "credit_history", "importance": 0.35},
        {"feature": "income", "importance": 0.28},
        {"feature": "debt_ratio", "importance": 0.22}
      ],
      "status": "completed",
      "createTime": "2024-01-25 16:00:00",
      "reportPath": "/reports/evaluation_2024Q1.pdf"
    }
  ]
}
```

## 4. 路由配置

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    redirect: '/feature-center',
    children: [
      {
        path: 'feature-center',
        name: 'FeatureCenter',
        component: () => import('@/pages/feature-center/index.vue'),
        meta: { title: '特征中心', icon: 'icon-storage' }
      },
      {
        path: 'model-registry',
        name: 'ModelRegistry',
        component: () => import('@/pages/model-registry/index.vue'),
        meta: { title: '模型注册', icon: 'icon-apps' }
      },
      {
        path: 'model-backtrack',
        name: 'ModelBacktrack',
        component: () => import('@/pages/model-backtrack/index.vue'),
        meta: { title: '模型回溯', icon: 'icon-history' }
      },
      {
        path: 'task-management',
        name: 'TaskManagement',
        component: () => import('@/pages/task-management/index.vue'),
        meta: { title: '任务管理', icon: 'icon-calendar' }
      },
      {
        path: 'model-evaluation',
        name: 'ModelEvaluation',
        component: () => import('@/pages/model-evaluation/index.vue'),
        meta: { title: '模型评估', icon: 'icon-bulb' }
      }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

## 5. 开发阶段划分

### 第一阶段：基础框架搭建 (2天)
**时间：第1-2天**
- [ ] 项目初始化和目录结构搭建
- [ ] 配置Arco Design主题和样式
- [ ] 实现基础布局组件（Header、Sidebar、AppLayout）
- [ ] 配置路由和导航菜单
- [ ] 创建Mock服务框架
- [ ] 实现基础工具函数和类型定义

**交付物**：
- 基础项目框架
- 响应式布局界面
- Mock服务可用

### 第二阶段：特征中心开发 (2天)
**时间：第3-4天**
- [ ] 创建特征列表页面和数据表格组件
- [ ] 实现特征注册表单和验证
- [ ] 开发特征详情抽屉组件
- [ ] 实现存储映射可视化（AntV X6拓扑图）
- [ ] 添加特征统计分析图表
- [ ] 实现特征搜索和筛选功能

**交付物**：
- 特征中心完整功能
- 特征注册和映射可视化
- 特征统计分析展示

### 第三阶段：模型注册开发 (2天)
**时间：第5-6天**
- [ ] 创建模型列表和卡片展示
- [ ] 实现模型版本管理界面
- [ ] 开发模型上传组件和进度显示
- [ ] 创建模型参数配置表单
- [ ] 实现模型版本对比功能
- [ ] 添加模型元数据展示

**交付物**：
- 模型注册完整功能
- 版本管理和对比
- 模型上传和配置

### 第四阶段：模型回溯开发 (2天)
**时间：第7-8天**
- [ ] 创建回溯任务列表页面
- [ ] 实现样本表上传和解析
- [ ] 开发时间选择器组件
- [ ] 创建回溯结果展示界面
- [ ] 实现评分分布可视化图表
- [ ] 添加回溯报告生成和预览

**交付物**：
- 模型回溯完整功能
- 样本上传和时间选择
- 回溯分析和报告

### 第五阶段：任务管理开发 (1.5天)
**时间：第9天上午-第10天中午**
- [ ] 创建任务列表和状态展示
- [ ] 实现任务创建和编辑表单
- [ ] 开发任务进度监控组件
- [ ] 添加资源使用情况图表
- [ ] 实现任务日志查看功能

**交付物**：
- 任务管理完整功能
- 任务状态监控
- 资源使用可视化

### 第六阶段：模型评估开发 (1.5天)
**时间：第10天下午-第11天**
- [ ] 创建评估结果展示页面
- [ ] 实现ROC曲线和混淆矩阵图表
- [ ] 开发特征重要性图表
- [ ] 添加评估指标对比功能
- [ ] 实现评估报告导出

**交付物**：
- 模型评估完整功能
- 多维度评估图表
- 评估报告生成

### 第七阶段：集成测试和优化 (1天)
**时间：第12天**
- [ ] 全功能集成测试
- [ ] 性能优化和代码清理
- [ ] 用户操作流程验证
- [ ] 演示脚本准备
- [ ] 部署到演示环境

**交付物**：
- 完整可演示系统
- 演示操作脚本
- 部署文档

## 6. 核心功能实现示例

### 6.1 特征中心存储映射可视化
```vue
<template>
  <div class="topology-container">
    <div id="topology-graph" style="width: 100%; height: 500px;"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Graph } from '@antv/x6'

const graph = ref<Graph>()

onMounted(() => {
  graph.value = new Graph({
    container: document.getElementById('topology-graph')!,
    width: 800,
    height: 500,
    background: {
      color: '#f5f5f5'
    },
    grid: {
      size: 10,
      visible: true
    }
  })

  // 添加节点和边
  const storageNode = graph.value.addNode({
    x: 100,
    y: 200,
    width: 120,
    height: 60,
    label: '离线存储',
    attrs: {
      body: {
        fill: '#1890ff',
        stroke: '#000'
      },
      label: {
        fill: '#fff',
        fontSize: 14
      }
    }
  })

  const serviceNode = graph.value.addNode({
    x: 400,
    y: 200,
    width: 120,
    height: 60,
    label: '在线服务',
    attrs: {
      body: {
        fill: '#52c41a',
        stroke: '#000'
      },
      label: {
        fill: '#fff',
        fontSize: 14
      }
    }
  })

  graph.value.addEdge({
    source: storageNode,
    target: serviceNode,
    attrs: {
      line: {
        stroke: '#1890ff',
        strokeWidth: 2
      }
    }
  })
})
</script>
```

### 6.2 模型回溯时间选择器
```vue
<template>
  <a-space direction="vertical" fill>
    <a-date-picker
      v-model="selectedDate"
      placeholder="选择日期"
      style="width: 200px"
      @change="handleDateChange"
    />
    <a-time-picker
      v-model="selectedTime"
      placeholder="选择时间"
      format="HH:mm:ss"
      style="width: 200px"
      @change="handleTimeChange"
    />
    <div class="model-versions">
      <a-timeline>
        <a-timeline-item
          v-for="version in availableVersions"
          :key="version.id"
          :label="version.time"
        >
          <a-card size="small" :class="{ 'selected': selectedVersion === version.id }">
            <template #title>
              <a-space>
                <span>{{ version.name }}</span>
                <a-tag :color="getStatusColor(version.status)">
                  {{ version.status }}
                </a-tag>
              </a-space>
            </template>
            <div>版本: {{ version.version }}</div>
            <div>性能: AUC={{ version.auc }}</div>
          </a-card>
        </a-timeline-item>
      </a-timeline>
    </div>
  </a-space>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const selectedDate = ref('')
const selectedTime = ref('')
const selectedVersion = ref('')

const availableVersions = computed(() => {
  // 根据选择的时间返回可用的模型版本
  return mockVersions.filter(version => {
    const versionTime = new Date(version.createTime)
    const selectedDateTime = new Date(`${selectedDate.value} ${selectedTime.value}`)
    return versionTime <= selectedDateTime
  })
})

const handleDateChange = (date: string) => {
  selectedDate.value = date
}

const handleTimeChange = (time: string) => {
  selectedTime.value = time
}
</script>
```

## 7. 演示流程设计

### 7.1 演示场景一：特征注册与映射
1. **进入特征中心**
   - 展示特征列表，包含150个特征
   - 显示特征的基本信息和统计指标

2. **特征注册演示**
   - 点击"注册新特征"按钮
   - 填写特征基本信息（名称、类型、描述）
   - 配置离线存储路径和在线服务地址
   - 提交注册，显示成功提示

3. **存储映射可视化**
   - 展示特征从离线存储到在线服务的完整映射关系
   - 使用AntV X6绘制拓扑图，显示数据流向
   - 支持节点点击查看详细信息

### 7.2 演示场景二：模型回溯分析
1. **创建回溯任务**
   - 上传样本表文件（支持CSV、Excel格式）
   - 选择回溯时间点（精确到秒）
   - 系统自动列出该时间点可用的模型版本

2. **执行回溯分析**
   - 点击"开始回溯"按钮
   - 实时显示任务进度（0-100%）
   - 展示资源使用情况（CPU、内存、GPU）

3. **查看回溯结果**
   - 展示模型评分分布直方图
   - 显示性能指标（准确率、精确率、召回率）
   - 生成PDF回溯报告，支持在线预览和下载

### 7.3 演示场景三：模型评估对比
1. **选择评估模型**
   - 选择需要评估的模型版本
   - 配置评估数据集和指标参数
   - 启动离线评估任务

2. **评估结果展示**
   - ROC曲线和AUC值展示
   - 混淆矩阵热力图
   - 特征重要性排序柱状图

3. **多模型对比**
   - 同时展示多个版本的评估结果
   - 性能指标对比表格
   - 自动生成评估对比报告

## 8. 性能优化策略

### 8.1 前端性能优化
- **组件懒加载**: 路由级别代码分割
- **虚拟滚动**: 大数据列表使用虚拟滚动
- **图表优化**: ECharts大数据量采样显示
- **缓存策略**: Pinia状态缓存，减少重复请求

### 8.2 Mock数据优化
- **分页加载**: 大量数据使用分页，避免一次性加载
- **数据压缩**: JSON数据压缩，减少网络传输
- **请求缓存**: 相同请求结果缓存，提高响应速度

### 8.3 用户体验优化
- **加载状态**: 所有异步操作显示加载状态
- **错误处理**: 统一的错误提示和处理机制
- **响应式设计**: 适配不同屏幕尺寸
- **键盘快捷键**: 支持常用操作的快捷键

## 9. 部署方案

### 9.1 本地开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址
http://localhost:5174
```

### 9.2 演示环境部署
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到静态服务器（如nginx）
# 将dist目录部署到服务器
```

### 9.3 Docker部署（可选）
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 10. 风险评估与应对

### 10.1 技术风险
- **AntV X6兼容性**: 提前验证图表库兼容性
- **Mock数据复杂度**: 分阶段实现复杂Mock逻辑
- **性能问题**: 提前进行性能基准测试

### 10.2 时间风险
- **开发延期**: 每个阶段预留20%缓冲时间
- **需求变更**: 建立需求变更评审机制
- **集成问题**: 提前进行模块间集成测试

### 10.3 应对策略
- **每日站会**: 及时发现问题并调整计划
- **代码评审**: 确保代码质量和一致性
- **自动化测试**: 关键功能编写单元测试
- **文档同步**: 开发过程中同步更新文档

## 11. 验收标准

### 11.1 功能验收
- [ ] 所有5个核心功能模块完整实现
- [ ] Mock数据覆盖所有业务场景
- [ ] 用户操作流程顺畅无阻塞
- [ ] 图表展示准确且美观

### 11.2 性能验收
- [ ] 页面加载时间 < 2秒
- [ ] 数据查询响应时间 < 500ms
- [ ] 图表渲染时间 < 1秒
- [ ] 支持1000条数据流畅展示

### 11.3 演示验收
- [ ] 演示流程完整且逻辑清晰
- [ ] 界面美观，符合设计规范
- [ ] 操作响应及时，无卡顿现象
- [ ] 能够独立运行，无需后端支持

通过以上实施计划，可以在12天内完成一个功能完整、性能优良的纯前端展示Demo，为数字风险平台离线模型模块提供直观的演示效果。