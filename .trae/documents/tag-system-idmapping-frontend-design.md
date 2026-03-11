# 标签系统IDMapping前端详细设计文档

## 更新记录
- **v1.1** (2024-11-21): 新增前端设计章节，基于需求文档和技术架构文档完善桌面端应用前端实现方案
- **v1.0** (2024-11-21): 初始版本，包含产品需求和技术架构

---

# 1. 产品背景与目标

## 1.1 业务背景
随着企业数据规模增长，用户身份识别成为数据治理的核心挑战。现有标签系统缺乏统一的身份识别机制，导致：
- 同一用户在不同业务系统中的数据无法关联
- 标签计算结果存在重复或遗漏
- 跨系统数据整合困难
- 用户画像构建不完整

## 1.2 产品目标
构建基于IDMapping的统一标签管理体系，实现：
- **身份统一识别**：建立用户全生命周期身份映射关系
- **标签精准投放**：确保标签准确关联到正确用户
- **数据质量提升**：减少重复计算，提高标签准确性
- **跨系统协同**：支持多源数据融合和标签共享

---

# 2. 前端设计（新增）

## 2.1 设计目标与原则

### 2.1.1 设计目标
基于技术架构文档要求，构建企业级标签系统IDMapping前端应用：
- **技术栈一致性**：采用Vue3 + TypeScript + Arco Design
- **桌面端优化**：针对1920x1080及以上分辨率优化
- **用户体验**：简化操作流程，提升工作效率
- **可维护性**：模块化设计，便于后续功能扩展

### 2.1.2 设计原则
- **组件化设计**：功能模块独立，支持复用和组合
- **类型安全**：全程TypeScript支持，减少运行时错误
- **响应式布局**：适配不同屏幕尺寸，支持窗口缩放
- **性能优化**：虚拟滚动、懒加载、缓存优化

## 2.2 前端架构设计

### 2.2.1 技术架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    前端应用层                                │
├─────────────────────────────────────────────────────────────┤
│  Vue3 + TypeScript + Arco Design + Vite                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │  页面路由   │  状态管理   │  组件库     │  工具函数   │   │
│  │  Router     │  Pinia      │  ArcoDesign │  Utils      │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │  标签管理   │  表注册管理  │  IDMapping  │  质量监控   │   │
│  │  页面       │  页面       │  配置页面   │  页面       │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │  通用组件   │  业务组件   │  图表组件   │  表单组件   │   │
│  │  Common     │  Business   │  Charts     │  Forms      │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API接口层                                │
├─────────────────────────────────────────────────────────────┤
│  Axios + 拦截器 + 错误处理 + 重试机制                       │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │  请求封装   │  响应处理   │  错误处理   │  缓存机制   │   │
│  │  Request    │  Response   │  Error      │  Cache      │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2.2 核心页面结构

#### 标签表注册页面（新增）
```
┌────────────────────────────────────────────────────────────────────┐
│  标签表注册 - 三步向导式界面                                        │
├────────────────────────────────────────────────────────────────────┤
│ 【步骤导航栏】                                                       │
│  ① 基础信息 → ② 主键配置 → ③ 映射规则 → 完成                     │
├────────────────────────────────────────────────────────────────────┤
│ 【第一步：基础信息】                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 表名称：    [输入框]        *必填                              │ │
│  │ 数据源：    [下拉选择]      *MySQL/PostgreSQL/Oracle/Hive      │ │
│  │ 数据库：    [下拉选择]      *根据数据源动态加载                  │ │
│  │ 表分类：    [标签选择器]    *支持多选分类                        │ │
│  │ 表描述：    [文本域]        多行文本输入                        │ │
│  │                                                               │ │
│  │           [上一步] [下一步] [取消]                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────┤
│ 【第二步：主键配置】                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 【左侧：字段列表】          【右侧：配置面板】                    │ │
│  │ ┌──────────────┐           ┌──────────────────────────────────┐  │ │
│  │ │字段1 □       │           │ 候选主键识别：                   │  │ │
│  │ │字段2 □       │           │  □ user_id      唯一性: 100%    │  │ │
│  │ │字段3 □       │           │  □ phone        唯一性: 95%     │  │ │
│  │ │...          │           │  □ email        唯一性: 98%     │  │ │
│  │ └──────────────┘           │                                │  │ │
│  │                           │ 主键类型选择：                   │  │ │
│  │ [刷新字段] [全选]         │  ○ 自然人ID  ○ 设备ID  ○ 企业ID  │  │ │
│  │                           │                                │  │ │
│  │                           │ 唯一性校验：   [开始校验]        │  │ │
│  │                           │ 重复率统计：   [图表展示]        │  │ │
│  │                           └──────────────────────────────────┘  │ │
│  │           [上一步] [下一步] [取消]                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────┤
│ 【第三步：映射规则】                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 【映射规则配置】                                                 │ │
│  │ 映射类型：   [下拉选择]    一对一/一对多/多对一                  │ │
│  │ 优先级：     [数字输入]    数值越大优先级越高                    │ │
│  │ 有效期：     [日期选择]    起止时间选择                        │ │
│  │ 冲突策略：   [下拉选择]    覆盖/忽略/人工处理                   │ │ │
│  │                                                               │ │
│  │ 【高级设置】                                                     │ │
│  │ □ 支持模糊匹配    □ 大小写敏感    □ 实时同步                   │ │
│  │                                                               │ │
│  │           [上一步] [完成] [取消]                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

#### 标签管理页面（优化）
```
┌────────────────────────────────────────────────────────────────────┐
│  标签管理 - 集成IDMapping功能                                        │
├────────────────────────────────────────────────────────────────────┤
│ 【工具栏】                                                           │
│ [新建标签] [批量导入] [导出] [刷新] [更多操作▼]  [搜索框] 🔍      │
├────────────────────────────────────────────────────────────────────┤
│ 【筛选面板】                                                         │
│ 状态：[全部] [草稿] [已发布] [已下线]                            │
│ 类型：[全部] [规则标签] [导入标签] [计算标签]                     │
│ 身份：[全部] [自然人] [设备] [企业] [家庭]                       │
│ 更新时间：[日期范围选择器]                                         │
├────────────────────────────────────────────────────────────────────┤
│ 【标签列表】                                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 标签ID  标签名称    身份类型  标签类型  状态    覆盖率  操作  │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │ TAG001  高价值用户  自然人     规则     已发布   23.5%  [详情]│ │
│  │ TAG002  活跃用户    设备       计算     草稿     45.2%  [详情]│ │
│  │ TAG003  企业客户    企业       导入     已发布   12.8%  [详情]│ │
│  │ ...                                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  [分页控件]                                                       │
└────────────────────────────────────────────────────────────────────┘
```

#### 标签创建/编辑页面（优化）
```
┌────────────────────────────────────────────────────────────────────┐
│  创建标签 - 集成IDMapping配置                                        │
├────────────────────────────────────────────────────────────────────┤
│ 【基本信息】                                                         │
│ 标签名称：   [输入框]        *支持中英文                          │
│ 标签编码：   [输入框]        *自动生成，支持手动修改                │
│ 身份类型：   [单选组]       ○ 自然人 ○ 设备 ○ 企业 ○ 家庭        │
│ 标签类型：   [下拉选择]     *规则标签/导入标签/计算标签             │
│ 更新频率：   [下拉选择]     *实时/小时/天/周/月                    │
├────────────────────────────────────────────────────────────────────┤
│ 【IDMapping配置】（新增）                                           │
│ 数据源表：   [下拉选择]     *选择已注册的标签表                    │
│ 主键字段：   [下拉选择]     *根据身份类型自动筛选                   │
│ 映射规则：   [规则编辑器]   *可视化规则配置器                      │
│ 冲突处理：   [下拉选择]     *继承/覆盖/合并                        │
├────────────────────────────────────────────────────────────────────┤
│ 【标签规则】                                                         │
│ [条件配置器] - 支持嵌套条件、多种运算符                            │
│ [计算逻辑]   - 支持聚合函数、时间窗口                              │
│ [结果验证]   - 实时预览和测试                                      │
├────────────────────────────────────────────────────────────────────┤
│ 【操作按钮】                                                         │
│           [保存草稿] [预览] [发布] [取消]                          │
└────────────────────────────────────────────────────────────────────┘
```

## 2.3 核心组件设计

### 2.3.1 表注册向导组件（新增）

**TableRegistrationWizard.vue**
```typescript
<template>
  <div class="table-registration-wizard">
    <a-steps :current="currentStep" type="navigation">
      <a-step title="基础信息" />
      <a-step title="主键配置" />
      <a-step title="映射规则" />
      <a-step title="完成" />
    </a-steps>
    
    <div class="wizard-content">
      <!-- 步骤1：基础信息 -->
      <BasicInfoForm 
        v-if="currentStep === 0"
        v-model="formData.basicInfo"
        @validate="handleBasicInfoValidate"
      />
      
      <!-- 步骤2：主键配置 -->
      <PrimaryKeyConfig 
        v-if="currentStep === 1"
        v-model="formData.primaryKey"
        :table-schema="tableSchema"
        @field-change="handleFieldChange"
      />
      
      <!-- 步骤3：映射规则 -->
      <MappingRulesConfig 
        v-if="currentStep === 2"
        v-model="formData.mappingRules"
        :identity-types="identityTypes"
        @rule-validate="handleRuleValidate"
      />
    </div>
    
    <div class="wizard-footer">
      <a-button @click="handlePrev" :disabled="currentStep === 0">
        上一步
      </a-button>
      <a-button 
        type="primary" 
        @click="handleNext"
        :loading="loading"
      >
        {{ currentStep === 2 ? '完成' : '下一步' }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BasicInfoForm from './components/BasicInfoForm.vue'
import PrimaryKeyConfig from './components/PrimaryKeyConfig.vue'
import MappingRulesConfig from './components/MappingRulesConfig.vue'
import { useTableRegistration } from '@/composables/useTableRegistration'

// 状态管理
const currentStep = ref(0)
const loading = ref(false)

// 表单数据
const formData = reactive({
  basicInfo: {},
  primaryKey: {},
  mappingRules: {}
})

// 业务逻辑
const { registerTable } = useTableRegistration()

// 事件处理
const handleNext = async () => {
  loading.value = true
  try {
    if (currentStep.value === 2) {
      // 提交表单
      await registerTable(formData)
    } else {
      currentStep.value++
    }
  } finally {
    loading.value = false
  }
}
</script>
```

### 2.3.2 主键配置组件（新增）

**PrimaryKeyConfig.vue**
```typescript
<template>
  <div class="primary-key-config">
    <a-row :gutter="24">
      <!-- 左侧：字段列表 -->
      <a-col :span="8">
        <div class="field-list-panel">
          <div class="panel-header">
            <h4>字段列表</h4>
            <a-space>
              <a-button size="small" @click="refreshFields">
                <icon-refresh /> 刷新
              </a-button>
              <a-button size="small" @click="selectAll">
                全选
              </a-button>
            </a-space>
          </div>
          <div class="field-list">
            <a-checkbox-group v-model="selectedFields">
              <div 
                v-for="field in tableFields" 
                :key="field.name"
                class="field-item"
              >
                <a-checkbox :value="field.name">
                  {{ field.name }}
                  <span class="field-type">({{ field.type }})</span>
                </a-checkbox>
              </div>
            </a-checkbox-group>
          </div>
        </div>
      </a-col>
      
      <!-- 右侧：配置面板 -->
      <a-col :span="16">
        <div class="config-panel">
          <!-- 候选主键识别 -->
          <a-card title="候选主键识别" class="config-card">
            <div class="candidate-keys">
              <div 
                v-for="key in candidateKeys" 
                :key="key.field"
                class="candidate-item"
              >
                <a-checkbox 
                  v-model="key.selected"
                  @change="handleKeySelect(key)"
                >
                  {{ key.field }}
                </a-checkbox>
                <a-progress 
                  :percent="key.uniqueness" 
                  size="small"
                  :status="getProgressStatus(key.uniqueness)"
                />
                <span class="uniqueness-text">{{ key.uniqueness }}%</span>
              </div>
            </div>
          </a-card>
          
          <!-- 主键类型选择 -->
          <a-card title="主键类型" class="config-card">
            <a-radio-group v-model="primaryKeyType">
              <a-radio value="PERSON">自然人ID</a-radio>
              <a-radio value="DEVICE">设备ID</a-radio>
              <a-radio value="ENTERPRISE">企业ID</a-radio>
              <a-radio value="FAMILY">家庭ID</a-radio>
            </a-radio-group>
          </a-card>
          
          <!-- 唯一性校验 -->
          <a-card title="数据质量" class="config-card">
            <a-space>
              <a-button type="primary" @click="validateUniqueness">
                开始校验
              </a-button>
              <a-button @click="showQualityReport">
                查看报告
              </a-button>
            </a-space>
            
            <div v-if="validationResult" class="validation-result">
              <a-descriptions :data="validationResult" size="small" />
            </div>
          </a-card>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePrimaryKeyAnalysis } from '@/composables/usePrimaryKeyAnalysis'
import type { TableField, CandidateKey, ValidationResult } from '@/types/table'

// Props
const props = defineProps<{
  modelValue: any
  tableSchema: TableField[]
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any]
  'field-change': [fields: string[]]
}>()

// 状态管理
const selectedFields = ref<string[]>([])
const primaryKeyType = ref('PERSON')
const validationResult = ref<ValidationResult | null>(null)

// 业务逻辑
const { 
  tableFields, 
  candidateKeys, 
  validateUniqueness,
  getQualityReport 
} = usePrimaryKeyAnalysis(props.tableSchema)

// 事件处理
const handleKeySelect = (key: CandidateKey) => {
  // 处理主键选择逻辑
  emit('update:modelValue', {
    primaryKeys: selectedFields.value,
    keyType: primaryKeyType.value
  })
}

const validateUniqueness = async () => {
  validationResult.value = await validateUniqueness(selectedFields.value)
}

const getProgressStatus = (uniqueness: number) => {
  if (uniqueness >= 95) return 'success'
  if (uniqueness >= 80) return 'warning'
  return 'danger'
}
</script>
```

### 2.3.3 IDMapping规则配置组件（新增）

**MappingRulesConfig.vue**
```typescript
<template>
  <div class="mapping-rules-config">
    <a-form :model="formData" layout="vertical">
      <!-- 基础映射配置 -->
      <a-form-item label="映射类型" field="mappingType">
        <a-select v-model="formData.mappingType" placeholder="请选择映射类型">
          <a-option value="ONE_TO_ONE">一对一映射</a-option>
          <a-option value="ONE_TO_MANY">一对多映射</a-option>
          <a-option value="MANY_TO_ONE">多对一映射</a-option>
        </a-select>
      </a-form-item>
      
      <a-form-item label="优先级" field="priority">
        <a-input-number 
          v-model="formData.priority" 
          :min="0" 
          :max="100"
          placeholder="请输入优先级"
        />
        <template #extra>数值越大，优先级越高</template>
      </a-form-item>
      
      <a-form-item label="有效期" field="effectivePeriod">
        <a-range-picker 
          v-model="formData.effectivePeriod"
          style="width: 100%"
        />
      </a-form-item>
      
      <a-form-item label="冲突解决策略" field="conflictStrategy">
        <a-radio-group v-model="formData.conflictStrategy">
          <a-radio value="OVERWRITE">覆盖</a-radio>
          <a-radio value="IGNORE">忽略</a-radio>
          <a-radio value="MANUAL">人工处理</a-radio>
        </a-radio-group>
      </a-form-item>
      
      <!-- 高级设置 -->
      <a-divider>高级设置</a-divider>
      
      <a-form-item>
        <a-checkbox v-model="formData.fuzzyMatching">
          支持模糊匹配
        </a-checkbox>
      </a-form-item>
      
      <a-form-item>
        <a-checkbox v-model="formData.caseSensitive">
          大小写敏感
        </a-checkbox>
      </a-form-item>
      
      <a-form-item>
        <a-checkbox v-model="formData.realtimeSync">
          实时同步
        </a-checkbox>
      </a-form-item>
      
      <!-- 规则预览 -->
      <a-divider>规则预览</a-divider>
      
      <div class="rule-preview">
        <a-card title="当前配置">
          <pre class="rule-json">{{ JSON.stringify(formData, null, 2) }}</pre>
        </a-card>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { MappingRuleConfig } from '@/types/mapping'

// Props & Emits
const props = defineProps<{
  modelValue: MappingRuleConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MappingRuleConfig]
  'rule-validate': [isValid: boolean]
}>()

// 表单数据
const formData = reactive<MappingRuleConfig>({
  mappingType: 'ONE_TO_ONE',
  priority: 0,
  effectivePeriod: [],
  conflictStrategy: 'OVERWRITE',
  fuzzyMatching: false,
  caseSensitive: true,
  realtimeSync: false
})

// 监听表单变化
watch(formData, (newValue) => {
  emit('update:modelValue', newValue)
  validateForm()
}, { deep: true })

// 表单验证
const validateForm = () => {
  const isValid = !!(
    formData.mappingType &&
    formData.conflictStrategy &&
    formData.effectivePeriod.length === 2
  )
  emit('rule-validate', isValid)
}
</script>
```

### 2.3.4 标签管理列表优化（现有组件增强）

**EnhancedTagManagement.vue**
```typescript
<template>
  <div class="enhanced-tag-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <a-space>
        <a-button type="primary" @click="handleCreate">
          <icon-plus /> 新建标签
        </a-button>
        <a-button @click="handleBatchImport">
          <icon-upload /> 批量导入
        </a-button>
        <a-button @click="handleExport">
          <icon-download /> 导出
        </a-button>
        <a-button @click="handleRefresh">
          <icon-refresh /> 刷新
        </a-button>
        <a-dropdown @select="handleMoreActions">
          <a-button>更多操作<icon-down /></a-button>
          <template #content>
            <a-doption value="batch-delete">批量删除</a-doption>
            <a-doption value="batch-publish">批量发布</a-doption>
            <a-doption value="batch-offline">批量下线</a-doption>
          </template>
        </a-dropdown>
      </a-space>
      
      <a-input-search 
        v-model="searchText"
        placeholder="搜索标签名称、编码"
        style="width: 300px"
        @search="handleSearch"
      />
    </div>
    
    <!-- 筛选面板 -->
    <div class="filter-panel">
      <a-row :gutter="16">
        <a-col :span="6">
          <div class="filter-item">
            <label>状态：</label>
            <a-radio-group v-model="filterStatus" type="button">
              <a-radio value="all">全部</a-radio>
              <a-radio value="DRAFT">草稿</a-radio>
              <a-radio value="PUBLISHED">已发布</a-radio>
              <a-radio value="OFFLINE">已下线</a-radio>
            </a-radio-group>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="filter-item">
            <label>类型：</label>
            <a-select v-model="filterType" style="width: 100%">
              <a-option value="all">全部类型</a-option>
              <a-option value="RULE">规则标签</a-option>
              <a-option value="IMPORT">导入标签</a-option>
              <a-option value="CALCULATE">计算标签</a-option>
            </a-select>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="filter-item">
            <label>身份：</label>
            <a-select v-model="filterIdentity" style="width: 100%">
              <a-option value="all">全部身份</a-option>
              <a-option value="PERSON">自然人</a-option>
              <a-option value="DEVICE">设备</a-option>
              <a-option value="ENTERPRISE">企业</a-option>
              <a-option value="FAMILY">家庭</a-option>
            </a-select>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="filter-item">
            <label>更新时间：</label>
            <a-range-picker v-model="filterDateRange" style="width: 100%" />
          </div>
        </a-col>
      </a-row>
    </div>
    
    <!-- 标签列表 -->
    <div class="tag-list">
      <a-table 
        :data="filteredTags"
        :loading="loading"
        :pagination="pagination"
        row-key="tagId"
        @selection-change="handleSelectionChange"
      >
        <template #columns>
          <a-table-column type="selection" width="50" />
          <a-table-column title="标签ID" data-index="tagId" width="120" />
          <a-table-column title="标签名称" data-index="tagName" width="150">
            <template #cell="{ record }">
              <a-link @click="handleViewDetail(record)">
                {{ record.tagName }}
              </a-link>
            </template>
          </a-table-column>
          <a-table-column title="身份类型" data-index="identityType" width="100">
            <template #cell="{ record }">
              <a-tag :color="getIdentityTypeColor(record.identityType)">
                {{ getIdentityTypeText(record.identityType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="标签类型" data-index="tagType" width="100">
            <template #cell="{ record }">
              <a-tag :color="getTagTypeColor(record.tagType)">
                {{ getTagTypeText(record.tagType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="覆盖率" data-index="coverage" width="100">
            <template #cell="{ record }">
              <div class="coverage-cell">
                <span class="coverage-text">{{ record.coverage }}%</span>
                <a-progress 
                  :percent="record.coverage" 
                  size="small"
                  :show-text="false"
                />
              </div>
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button type="text" size="small" @click="handleViewDetail(record)">
                  详情
                </a-button>
                <a-dropdown @select="(value) => handleRowAction(record, value)">
                  <a-button type="text" size="small">
                    更多<icon-down />
                  </a-button>
                  <template #content>
                    <a-doption value="publish">发布</a-doption>
                    <a-doption value="offline">下线</a-doption>
                    <a-doption value="delete">删除</a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTagManagement } from '@/composables/useTagManagement'
import type { TagItem, TagFilters } from '@/types/tag'

// 路由
const router = useRouter()

// 状态管理
const searchText = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const filterIdentity = ref('all')
const filterDateRange = ref([])
const loading = ref(false)
const selectedTags = ref<TagItem[]>([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 业务逻辑
const { 
  tags, 
  fetchTags, 
  deleteTags, 
  publishTags, 
  offlineTags 
} = useTagManagement()

// 计算属性
const filteredTags = computed(() => {
  return tags.value.filter(tag => {
    // 状态筛选
    if (filterStatus.value !== 'all' && tag.status !== filterStatus.value) {
      return false
    }
    // 类型筛选
    if (filterType.value !== 'all' && tag.tagType !== filterType.value) {
      return false
    }
    // 身份类型筛选
    if (filterIdentity.value !== 'all' && tag.identityType !== filterIdentity.value) {
      return false
    }
    // 搜索文本筛选
    if (searchText.value && !tag.tagName.includes(searchText.value) && !tag.tagCode.includes(searchText.value)) {
      return false
    }
    return true
  })
})

// 工具函数
const getIdentityTypeColor = (type: string) => {
  const colorMap = {
    'PERSON': 'blue',
    'DEVICE': 'green',
    'ENTERPRISE': 'orange',
    'FAMILY': 'purple'
  }
  return colorMap[type] || 'gray'
}

const getIdentityTypeText = (type: string) => {
  const textMap = {
    'PERSON': '自然人',
    'DEVICE': '设备',
    'ENTERPRISE': '企业',
    'FAMILY': '家庭'
  }
  return textMap[type] || type
}

// 事件处理
const handleCreate = () => {
  router.push('/exploration/customer-center/tag-system/tag-create')
}

const handleEdit = (tag: TagItem) => {
  router.push({
    path: '/exploration/customer-center/tag-system/tag-edit',
    query: { tagId: tag.tagId }
  })
}

const handleViewDetail = (tag: TagItem) => {
  router.push({
    path: '/exploration/customer-center/tag-system/tag-detail',
    query: { tagId: tag.tagId }
  })
}

// 初始化
onMounted(() => {
  fetchTags()
})
</script>
```

## 2.4 状态管理设计

### 2.4.1 Pinia Store结构

**useTableRegistration.ts**
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  TableRegistrationData, 
  TableSchema, 
  PrimaryKeyConfig,
  MappingRule 
} from '@/types/table'

export const useTableRegistrationStore = defineStore('tableRegistration', () => {
  // 状态
  const currentStep = ref(0)
  const formData = ref<TableRegistrationData>({
    basicInfo: {},
    primaryKey: {},
    mappingRules: {}
  })
  
  const tableSchema = ref<TableSchema[]>([])
  const validationResults = ref({})
  const loading = ref(false)

  // 计算属性
  const isStepValid = computed(() => {
    switch (currentStep.value) {
      case 0:
        return validateBasicInfo(formData.value.basicInfo)
      case 1:
        return validatePrimaryKey(formData.value.primaryKey)
      case 2:
        return validateMappingRules(formData.value.mappingRules)
      default:
        return true
    }
  })

  // 方法
  const fetchTableSchema = async (dataSourceId: string, tableName: string) => {
    loading.value = true
    try {
      // 模拟API调用
      const response = await fetchTableSchemaAPI(dataSourceId, tableName)
      tableSchema.value = response.data
    } finally {
      loading.value = false
    }
  }

  const registerTable = async (data: TableRegistrationData) => {
    loading.value = true
    try {
      const response = await registerTableAPI(data)
      return response
    } finally {
      loading.value = false
    }
  }

  const validatePrimaryKey = async (keys: PrimaryKeyConfig[]) => {
    const response = await validatePrimaryKeyAPI(keys)
    validationResults.value = response.data
    return response.isValid
  }

  return {
    // 状态
    currentStep,
    formData,
    tableSchema,
    validationResults,
    loading,
    
    // 计算属性
    isStepValid,
    
    // 方法
    fetchTableSchema,
    registerTable,
    validatePrimaryKey
  }
})
```

**useTagManagement.ts**
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TagItem, TagFilters } from '@/types/tag'

export const useTagManagementStore = defineStore('tagManagement', () => {
  // 状态
  const tags = ref<TagItem[]>([])
  const loading = ref(false)
  const filters = ref<TagFilters>({
    status: 'all',
    tagType: 'all',
    identityType: 'all',
    dateRange: [],
    searchText: ''
  })
  
  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0
  })

  // 计算属性
  const filteredTags = computed(() => {
    return tags.value.filter(tag => {
      // 应用筛选逻辑
      if (!applyFilters(tag, filters.value)) {
        return false
      }
      return true
    })
  })

  const identityTypeStats = computed(() => {
    const stats = {
      PERSON: 0,
      DEVICE: 0,
      ENTERPRISE: 0,
      FAMILY: 0
    }
    
    tags.value.forEach(tag => {
      stats[tag.identityType]++
    })
    
    return stats
  })

  // 方法
  const fetchTags = async (params?: any) => {
    loading.value = true
    try {
      const response = await fetchTagsAPI(params)
      tags.value = response.data.list
      pagination.value.total = response.data.total
    } finally {
      loading.value = false
    }
  }

  const createTag = async (tagData: Partial<TagItem>) => {
    const response = await createTagAPI(tagData)
    await fetchTags()
    return response
  }

  const updateTag = async (tagId: string, tagData: Partial<TagItem>) => {
    const response = await updateTagAPI(tagId, tagData)
    await fetchTags()
    return response
  }

  const deleteTags = async (tagIds: string[]) => {
    const response = await deleteTagsAPI(tagIds)
    await fetchTags()
    return response
  }

  const publishTags = async (tagIds: string[]) => {
    const response = await publishTagsAPI(tagIds)
    await fetchTags()
    return response
  }

  return {
    // 状态
    tags,
    loading,
    filters,
    pagination,
    
    // 计算属性
    filteredTags,
    identityTypeStats,
    
    // 方法
    fetchTags,
    createTag,
    updateTag,
    deleteTags,
    publishTags
  }
})
```

## 2.5 路由配置更新

**router/exploration.ts**（新增路由）
```typescript
{
  path: 'tag-system',
  name: 'TagSystem',
  component: () => import('@/pages/exploration/customer-center/tag-system/index.vue'),
  meta: { 
    title: '标签系统',
    requiresAuth: true 
  },
  children: [
    {
      path: '',
      name: 'TagSystemHome',
      component: () => import('@/pages/exploration/customer-center/tag-system/home.vue'),
      meta: { title: '标签系统首页' }
    },
    {
      path: 'tag-management',
      name: 'TagManagement',
      component: () => import('@/pages/exploration/customer-center/tag-system/enhanced-tag-management.vue'),
      meta: { title: '标签管理' }
    },
    {
      path: 'table-registration',
      name: 'TableRegistration',
      component: () => import('@/pages/exploration/customer-center/tag-system/table-registration.vue'),
      meta: { title: '标签表注册' }
    },
    {
      path: 'tag-create',
      name: 'TagCreate',
      component: () => import('@/pages/exploration/customer-center/tag-system/enhanced-tag-create.vue'),
      meta: { title: '创建标签' }
    },
    {
      path: 'tag-edit',
      name: 'TagEdit',
      component: () => import('@/pages/exploration/customer-center/tag-system/enhanced-tag-edit.vue'),
      meta: { title: '编辑标签' }
    }
  ]
}
```

## 2.6 交互流程设计

### 2.6.1 标签表注册流程
```
用户进入表注册页面
    ↓
加载数据源列表
    ↓
选择数据源和数据库
    ↓
加载表列表和字段信息
    ↓
第一步：填写基础信息
    ↓
第二步：选择主键字段
    ↓
  系统进行唯一性分析
    ↓
  显示候选主键和质量指标
    ↓
第三步：配置映射规则
    ↓
  选择映射类型和策略
    ↓
预览配置结果
    ↓
提交注册
    ↓
显示注册结果和质量报告
```

### 2.6.2 标签创建流程（集成IDMapping）
```
用户点击创建标签
    ↓
选择标签类型和身份类型
    ↓
选择已注册的数据表
    ↓
系统自动加载主键配置
    ↓
配置IDMapping规则
    ↓
设置标签计算规则
    ↓
预览标签效果
    ↓
保存或发布标签
```

## 2.7 性能优化策略

### 2.7.1 组件懒加载
```typescript
// 路由级别代码分割
const TableRegistration = () => import(
  /* webpackChunkName: "table-registration" */ 
  '@/pages/exploration/customer-center/tag-system/table-registration.vue'
)

// 组件级别懒加载
const PrimaryKeyConfig = defineAsyncComponent(() => 
  import('@/components/tag-system/PrimaryKeyConfig.vue')
)
```

### 2.7.2 虚拟滚动优化
```typescript
// 大数据列表虚拟滚动
<virtual-list
  :data="tableFields"
  :item-size="50"
  :height="400"
  :buffer="10"
>
  <template #default="{ item, index }">
    <div class="field-item" :key="item.name">
      <a-checkbox :value="item.name">
        {{ item.name }}
      </a-checkbox>
    </div>
  </template>
</virtual-list>
```

### 2.7.3 请求缓存和防抖
```typescript
// API请求缓存
const cache = new Map()

export const fetchTableSchema = async (dataSourceId: string, tableName: string) => {
  const cacheKey = `${dataSourceId}:${tableName}`
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const response = await axios.get(`/api/table/schema/${dataSourceId}/${tableName}`)
  cache.set(cacheKey, response.data)
  
  // 设置缓存过期时间
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000) // 5分钟
  
  return response.data
}

// 输入防抖
const debouncedSearch = debounce((searchText: string) => {
  fetchTags({ searchText })
}, 300)
```

## 2.8 错误处理设计

### 2.8.1 全局错误处理
```typescript
// 全局错误处理插件
export const errorHandler = {
  install(app: App) {
    app.config.errorHandler = (error, instance, info) => {
      console.error('Global error:', error, info)
      
      // 用户友好的错误提示
      Message.error({
        content: getErrorMessage(error),
        duration: 5000,
        closable: true
      })
      
      // 错误日志上报
      reportError(error, instance, info)
    }
  }
}

// 业务错误处理
const handleRegistrationError = (error: any) => {
  if (error.code === 'DUPLICATE_TABLE') {
    return {
      type: 'warning',
      title: '表已存在',
      content: '该表已经注册过，是否查看已有配置？',
      actions: [
        { text: '查看配置', handler: () => viewExistingTable() },
        { text: '重新注册', handler: () => forceRegistration() }
      ]
    }
  }
  
  if (error.code === 'INVALID_PRIMARY_KEY') {
    return {
      type: 'error',
      title: '主键配置错误',
      content: '选择的主键不满足唯一性要求，请重新选择',
      actions: [
        { text: '重新配置', handler: () => goToStep(1) }
      ]
    }
  }
  
  // 默认错误处理
  return {
    type: 'error',
    title: '注册失败',
    content: error.message || '未知错误，请联系管理员',
    actions: [
      { text: '重试', handler: () => retryRegistration() }
    ]
  }
}
```

## 2.9 响应式设计

### 2.9.1 断点设计
```scss
// 响应式断点
$breakpoints: (
  'mobile': 768px,
  'tablet': 1024px,
  'desktop': 1440px,
  'wide': 1920px
);

// 混合器
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// 响应式样式
.table-registration-wizard {
  padding: 24px;
  
  @include respond-to('tablet') {
    padding: 16px;
    
    .wizard-content {
      margin: 16px 0;
    }
    
    .config-panel {
      .a-row {
        flex-direction: column;
      }
    }
  }
  
  @include respond-to('mobile') {
    padding: 12px;
    
    .wizard-footer {
      flex-direction: column;
      gap: 8px;
      
      .a-button {
        width: 100%;
      }
    }
  }
}
```

### 2.9.2 移动端适配
```typescript
// 响应式组合式函数
export const useResponsive = () => {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)
  
  const checkScreenSize = () => {
    const width = window.innerWidth
    isMobile.value = width < 768
    isTablet.value = width >= 768 && width < 1024
    isDesktop.value = width >= 1024
  }
  
  onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })
  
  return {
    isMobile,
    isTablet,
    isDesktop
  }
}
```

---

# 3. 原有需求文档内容（保持不变）

## 3.1 需求范围
### 3.1.1 功能范围
- 标签表注册与管理
- IDMapping规则配置
- 主键选择与映射
- 标签数据质量监控
- 身份冲突解决机制

### 3.1.2 非功能需求
- **性能**：支持千万级用户身份映射
- **准确性**：身份识别准确率≥99.5%
- **实时性**：标签更新延迟<5分钟
- **可用性**：系统可用性≥99.9%

## 3.2 详细功能需求
### 3.2.1 标签表注册功能
#### 表注册流程
```
数据源接入 → 表结构解析 → 主键识别 → 映射配置 → 质量校验 → 注册完成
```

#### 功能需求
**表信息录入**
- 支持多种数据源类型（MySQL、PostgreSQL、Oracle、Hive等）
- 自动解析表结构和字段类型
- 支持表备注和字段备注导入
- 提供表分类和标签功能

**主键选择与配置**
- 自动识别候选主键字段
- 支持复合主键配置
- 主键唯一性校验
- 主键变更历史记录

**IDMapping规则配置**
- 支持多种映射类型：
  - 一对一映射（手机号、邮箱等）
  - 一对多映射（设备ID、Cookie等）
  - 多对一映射（家庭成员、企业账号等）
- 映射优先级设置
- 映射有效期管理
- 冲突解决策略

**数据质量监控**
- 主键重复率监控
- 映射完整性检查
- 数据一致性校验
- 异常数据告警

### 3.2.2 标签管理优化
#### 标签创建流程优化
结合IDMapping的标签创建流程：
```
选择标签表 → 配置IDMapping → 定义标签规则 → 设置计算策略 → 发布标签
```

#### 标签类型扩展
**基于身份的标签**
- 自然人标签：基于身份证号、手机号等
- 设备标签：基于设备ID、IMEI等
- 企业标签：基于企业注册号、统一社会信用代码等
- 家庭标签：基于家庭ID、地址等

**标签继承机制**
- 子身份继承父身份标签
- 标签权重计算
- 标签冲突解决
- 标签有效期管理

### 3.2.3 属性管理增强
#### 属性分类体系
```
基础属性
├─ 人口统计学属性（年龄、性别、地域等）
├─ 社会属性（职业、教育、收入等）
└─ 联系属性（手机、邮箱、地址等）

行为属性
├─ 交易行为（购买、支付、退款等）
├─ 浏览行为（点击、停留、跳出等）
└─ 社交行为（分享、评论、点赞等）

衍生属性
├─ 计算属性（RFM、活跃度、价值等）
├─ 预测属性（流失概率、购买意向等）
└─ 分群属性（生命周期、价值分层等）
```

### 3.2.4 数据质量管理
#### 质量指标体系
```
完整性指标
├─ 数据缺失率：≤5%
├─ 映射覆盖率：≥95%
└─ 标签覆盖率：≥90%

准确性指标
├─ 身份识别准确率：≥99.5%
├─ 标签准确率：≥95%
└─ 属性准确率：≥98%

一致性指标
├─ 跨系统一致性：≥99%
├─ 时间一致性：≥98%
└─ 逻辑一致性：≥97%
```

## 3.3 技术架构要求
### 3.3.1 系统架构
基于技术架构文档，前端采用Vue3 + TypeScript + Arco Design技术栈

### 3.3.2 数据模型设计
**用户身份表、身份映射表、标签定义表、标签值表**（详见技术架构文档）

### 3.3.3 接口设计规范
标签表注册接口、身份解析接口等（详见技术架构文档）

## 3.4 实施计划
### 3.4.1 阶段划分
**第一阶段（基础框架）- 4周**
- 标签表注册功能开发
- IDMapping核心算法实现
- 基础数据模型设计
- 身份映射引擎开发

**第二阶段（功能完善）- 6周**
- 标签管理功能集成IDMapping
- 属性管理功能增强
- 数据质量管理功能
- 可视化界面开发

**第三阶段（系统集成）- 4周**
- 外部系统对接
- 性能优化和调优
- 安全加固和测试
- 上线部署和培训

## 3.5 成功指标
### 3.5.1 技术指标
- 身份识别准确率≥99.5%
- 标签计算性能提升50%
- 数据质量问题减少80%
- 系统响应时间<500ms

### 3.5.2 业务指标
- 标签使用覆盖率提升30%
- 营销活动转化率提升15%
- 数据一致性投诉减少90%
- 跨系统数据整合效率提升60%

---

**文档版本**：v1.1  
**更新时间**：2024年11月21日  
**更新内容**：新增前端设计章节，完善桌面端应用实现方案  
**作者**：前端架构团队