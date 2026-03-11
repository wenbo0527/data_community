<template>
  <div class="content-templates-container">
    <div class="header">
      <h1>文案模板管理</h1>
      <a-space>
        <a-button @click="handleImport">导入模板</a-button>
        <a-button type="primary" @click="handleCreateTemplate">
          <template #icon>
            <icon-plus />
          </template>
          新建模板
        </a-button>
      </a-space>
    </div>

    <div class="search-bar">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="searchForm.name"
            placeholder="请输入模板名称"
            allow-clear
            @change="handleSearch"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.category"
            placeholder="选择分类"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="inventory">库存预警</a-option>
            <a-option value="expiry">过期提醒</a-option>
            <a-option value="failure">失败率预警</a-option>
            <a-option value="custom">自定义</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.visibility"
            placeholder="选择可见性"
            allow-clear
            @change="handleSearch"
          >
            <a-option value="public">公开</a-option>
            <a-option value="private">私有</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-range-picker
            v-model="searchForm.dateRange"
            style="width: 100%"
            @change="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-space>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <div class="template-categories">
      <a-card title="预设模板" :bordered="false">
        <div class="preset-templates">
          <a-row :gutter="16">
            <a-col :span="8" v-for="template in presetTemplates" :key="template.id">
              <a-card hoverable class="template-card">
                <template #title>
                  <div class="template-card-header">
                    <span>{{ template.name }}</span>
                    <a-tag size="small" :color="getCategoryColor(template.category)">
                      {{ getCategoryLabel(template.category) }}
                    </a-tag>
                  </div>
                </template>
                <div class="template-content">
                  <div class="template-preview">
                    {{ template.preview }}
                  </div>
                  <div class="template-variables">
                    <span class="variables-label">可用变量：</span>
                    <a-space wrap>
                      <a-tag
                        v-for="variable in template.variables.slice(0, 3)"
                        :key="variable"
                        size="mini"
                      >
                        {{ variable }}
                      </a-tag>
                      <a-tag
                        v-if="template.variables.length > 3"
                        size="mini"
                      >
                        +{{ template.variables.length - 3 }}
                      </a-tag>
                    </a-space>
                  </div>
                </div>
                <template #actions>
                  <a-button type="text" size="small" @click="handleUseTemplate(template)">
                    使用模板
                  </a-button>
                  <a-button type="text" size="small" @click="handlePreviewTemplate(template)">
                    预览
                  </a-button>
                </template>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </a-card>
    </div>

    <div class="table-container">
      <div class="table-header">
        <h3>自定义模板</h3>
        <a-space>
          <a-button @click="handleBatchExport" :disabled="selectedRows.length === 0">
            批量导出
          </a-button>
          <a-popconfirm
            content="确定要删除选中的模板吗？"
            @ok="handleBatchDelete"
          >
            <a-button status="danger" :disabled="selectedRows.length === 0">
              批量删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </div>
      
      <a-table
        :data="templates"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <template #columns>
          <a-table-column type="selection" width="50" />
          <a-table-column title="模板名称" data-index="name" width="200">
            <template #cell="{ record }">
              <a-link @click="handleEditTemplate(record.id)">{{ record.name }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="分类" data-index="category" width="120">
            <template #cell="{ record }">
              <a-tag :color="getCategoryColor(record.category)">
                {{ getCategoryLabel(record.category) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="可见性" data-index="isPublic" width="100">
            <template #cell="{ record }">
              <a-tag :color="record.isPublic ? 'green' : 'gray'">
                {{ record.isPublic ? '公开' : '私有' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="使用次数" data-index="usageCount" width="100" sortable />
          <a-table-column title="创建人" data-index="createdBy" width="120" />
          <a-table-column title="创建时间" data-index="createdAt" width="180">
            <template #cell="{ record }">
              {{ formatDate(record.createdAt) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" fixed="right" width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditTemplate(record.id)">
                  编辑
                </a-button>
                <a-button type="text" size="small" @click="handleCopyTemplate(record)">
                  复制
                </a-button>
                <a-button type="text" size="small" @click="handlePreviewTemplate(record)">
                  预览
                </a-button>
                <a-popconfirm
                  content="确定要删除这个模板吗？"
                  @ok="handleDeleteTemplate(record.id)"
                >
                  <a-button type="text" size="small" status="danger">
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 模板预览对话框 -->
    <a-modal
      v-model:visible="previewVisible"
      :title="`模板预览 - ${currentTemplate?.name}`"
      width="600px"
      @ok="previewVisible = false"
    >
      <div class="template-preview-dialog">
        <div class="preview-content">
          <div class="preview-rendered">
            <h4>渲染效果：</h4>
            <div class="rendered-text">{{ renderedContent }}</div>
          </div>
          <a-divider />
          <div class="preview-variables">
            <h4>可用变量：</h4>
            <a-space wrap>
              <a-tag
                v-for="variable in currentTemplate?.variables"
                :key="variable"
                size="small"
                style="cursor: pointer"
                @click="handleInsertVariable(variable)"
              >
                {{ variable }}
              </a-tag>
            </a-space>
          </div>
          <a-divider />
          <div class="preview-raw">
            <h4>原始模板：</h4>
            <a-textarea
              :value="currentTemplate?.content"
              readonly
              :auto-size="{ minRows: 3, maxRows: 6 }"
            />
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSearch } from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  category: '',
  visibility: '',
  dateRange: []
})

// 表格数据
const templates = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 预览相关
const previewVisible = ref(false)
const currentTemplate = ref(null)
const renderedContent = ref('')

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 预设模板数据
const presetTemplates = ref([
  {
    id: 'preset-1',
    name: '库存预警模板',
    category: 'inventory',
    content: '【库存预警】{{inventoryName}}库存告急！\n当前库存：{{currentValue}}{{unit}}\n预警阈值：{{threshold}}{{unit}}\n趋势：{{trend}}\n请及时补充库存，避免影响业务。\n触发时间：{{triggerTime}}',
    variables: ['inventoryName', 'currentValue', 'unit', 'threshold', 'trend', 'triggerTime'],
    preview: '【库存预警】优惠券库存A库存告急！\n当前库存：50个\n预警阈值：100个\n趋势：下降\n请及时补充库存，避免影响业务。\n触发时间：2024-01-15 10:30:00',
    isPublic: true,
    usageCount: 156,
    createdBy: '系统',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-2',
    name: '过期提醒模板',
    category: 'expiry',
    content: '【过期提醒】{{couponName}}即将过期\n剩余有效期：{{remainingDays}}天\n预警设置：提前{{threshold}}天提醒\n当前状态：{{currentValue}}张券将过期\n请尽快处理，避免资源浪费。',
    variables: ['couponName', 'remainingDays', 'threshold', 'currentValue'],
    preview: '【过期提醒】春节优惠券A即将过期\n剩余有效期：3天\n预警设置：提前7天提醒\n当前状态：50张券将过期\n请尽快处理，避免资源浪费。',
    isPublic: true,
    usageCount: 89,
    createdBy: '系统',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'preset-3',
    name: '失败率预警模板',
    category: 'failure',
    content: '【失败率预警】{{packageName}}发放异常\n当前失败率：{{failureRate}}%\n预警阈值：{{threshold}}%\n统计窗口：{{checkInterval}}\n失败次数：{{currentValue}}\n请检查系统状态并及时处理。',
    variables: ['packageName', 'failureRate', 'threshold', 'checkInterval', 'currentValue'],
    preview: '【失败率预警】春节券包发放异常\n当前失败率：8%\n预警阈值：5%\n统计窗口：10分钟\n失败次数：20\n请检查系统状态并及时处理。',
    isPublic: true,
    usageCount: 67,
    createdBy: '系统',
    createdAt: '2024-01-01T00:00:00Z'
  }
])

// 获取模板列表
const fetchTemplates = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟自定义模板数据
    const mockTemplates = [
      {
        id: '1',
        name: '自定义库存预警模板',
        category: 'inventory',
        content: '库存告急！{{inventoryName}} 仅剩 {{currentValue}} {{unit}}，请及时补充。',
        variables: ['inventoryName', 'currentValue', 'unit'],
        isPublic: false,
        usageCount: 23,
        createdBy: '张三',
        createdAt: '2024-01-10T10:30:00Z'
      },
      {
        id: '2',
        name: '紧急过期通知',
        category: 'expiry',
        content: '【紧急】{{couponName}} 将在 {{remainingDays}} 天后过期，当前有 {{currentValue}} 张，请立即处理！',
        variables: ['couponName', 'remainingDays', 'currentValue'],
        isPublic: true,
        usageCount: 45,
        createdBy: '李四',
        createdAt: '2024-01-08T15:20:00Z'
      },
      {
        id: '3',
        name: '系统异常提醒',
        category: 'failure',
        content: '系统异常：{{packageName}} 失败率达到 {{failureRate}}%，超过阈值 {{threshold}}%，请关注。',
        variables: ['packageName', 'failureRate', 'threshold'],
        isPublic: false,
        usageCount: 12,
        createdBy: '王五',
        createdAt: '2024-01-05T09:10:00Z'
      }
    ]
    
    templates.value = mockTemplates
    pagination.total = mockTemplates.length
  } catch (error) {
    Message.error('获取模板列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchTemplates()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.category = ''
  searchForm.visibility = ''
  searchForm.dateRange = []
  handleSearch()
}

// 创建模板
const handleCreateTemplate = () => {
  router.push('/marketing/alert/templates/create')
}

// 编辑模板
const handleEditTemplate = (id) => {
  router.push(`/marketing/alert/templates/edit/${id}`)
}

// 复制模板
const handleCopyTemplate = (template) => {
  router.push({
    path: '/marketing/alert/templates/create',
    query: { copyFrom: template.id }
  })
}

// 删除模板
const handleDeleteTemplate = async (id) => {
  try {
    loading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    Message.success('删除成功')
    fetchTemplates()
  } catch (error) {
    Message.error('删除失败')
  } finally {
    loading.value = false
  }
}

// 预览模板
const handlePreviewTemplate = (template) => {
  currentTemplate.value = template
  
  // 模拟渲染模板
  const mockData = {
    inventoryName: '优惠券库存A',
    currentValue: 50,
    unit: '个',
    threshold: 100,
    trend: '下降',
    triggerTime: new Date().toLocaleString('zh-CN'),
    couponName: '春节优惠券A',
    remainingDays: 3,
    packageName: '春节券包',
    failureRate: 8,
    checkInterval: '10分钟'
  }
  
  // 简单的变量替换
  let rendered = template.content
  template.variables.forEach(variable => {
    const regex = new RegExp(`{{${variable}}}`, 'g')
    rendered = rendered.replace(regex, mockData[variable] || `{{${variable}}}`)
  })
  
  renderedContent.value = rendered
  previewVisible.value = true
}

// 使用模板
const handleUseTemplate = (template) => {
  // 跳转到规则创建页面，带上模板数据
  router.push({
    path: '/marketing/alert/rules/create',
    query: { templateId: template.id }
  })
}

// 插入变量
const handleInsertVariable = (variable) => {
  // 这里可以实现复制到剪贴板功能
  navigator.clipboard.writeText(`{{${variable}}}`)
  Message.success(`已复制变量 {{${variable}}} 到剪贴板`)
}

// 导入模板
const handleImport = () => {
  Message.info('导入功能开发中...')
}

// 批量导出
const handleBatchExport = () => {
  Message.info('导出功能开发中...')
}

// 批量操作
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  try {
    loading.value = true
    // 模拟批量删除API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    Message.success(`已删除 ${selectedRows.value.length} 个模板`)
    fetchTemplates()
  } catch (error) {
    Message.error('删除失败')
  } finally {
    loading.value = false
  }
}

// 工具函数
const getCategoryColor = (category) => {
  const colors = {
    inventory: 'blue',
    expiry: 'orange',
    failure: 'red',
    custom: 'gray'
  }
  return colors[category] || 'gray'
}

const getCategoryLabel = (category) => {
  const labels = {
    inventory: '库存预警',
    expiry: '过期提醒',
    failure: '失败率预警',
    custom: '自定义'
  }
  return labels[category] || category
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped lang="less">
.content-templates-container {
  padding: 24px;
  background: #fff;
  min-height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h1 {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
}

.search-bar {
  margin-bottom: 24px;
  padding: 16px;
  background: #f2f3f5;
  border-radius: 6px;
}

.template-categories {
  margin-bottom: 32px;
}

.preset-templates {
  padding: 16px 0;
}

.template-card {
  margin-bottom: 16px;
  
  .template-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .template-content {
    .template-preview {
      background: #f7f8fa;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 12px;
      font-size: 12px;
      line-height: 1.5;
      color: #4e5969;
      white-space: pre-wrap;
    }
    
    .template-variables {
      .variables-label {
        font-size: 12px;
        color: #86909c;
        margin-right: 8px;
      }
    }
  }
}

.table-container {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
      margin: 0;
    }
  }
}

.template-preview-dialog {
  .preview-content {
    .preview-rendered {
      margin-bottom: 16px;
      
      h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .rendered-text {
        background: #f7f8fa;
        border-radius: 4px;
        padding: 12px;
        font-size: 12px;
        line-height: 1.5;
        color: #4e5969;
        white-space: pre-wrap;
      }
    }
    
    .preview-variables {
      h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }
    }
    
    .preview-raw {
      h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }
    }
  }
}
</style>