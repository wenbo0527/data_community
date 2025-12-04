<template>
  <div class="rule-content-template">
    <a-form :model="formData" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
      <!-- 模板选择 -->
      <a-form-item label="选择模板">
        <a-space direction="vertical" fill>
          <a-select
            v-model="formData.templateId"
            placeholder="请选择模板"
            allow-clear
            @change="handleTemplateChange"
          >
            <a-option
              v-for="template in templateOptions"
              :key="template.id"
              :value="template.id"
              :label="template.name"
            />
          </a-select>
          <a-button v-if="formData.templateId" type="outline" size="mini" @click="previewTemplate">
            <template #icon><icon-eye /></template>
            预览模板
          </a-button>
        </a-space>
      </a-form-item>

      <!-- 消息标题 -->
      <a-form-item
        label="消息标题"
        field="title"
        :rules="[{ required: true, message: '请输入消息标题' }]"
      >
        <a-textarea
          v-model="formData.title"
          placeholder="请输入消息标题，支持变量替换"
          :max-length="200"
          show-word-limit
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>

      <!-- 消息内容 -->
      <a-form-item
        label="消息内容"
        field="content"
        :rules="[{ required: true, message: '请输入消息内容' }]"
      >
        <div class="content-editor">
          <a-textarea
            v-model="formData.content"
            placeholder="请输入消息内容，支持变量替换"
            :max-length="1000"
            show-word-limit
            :auto-size="{ minRows: 6, maxRows: 12 }"
            @input="handleContentChange"
          />
          <div class="editor-toolbar">
            <a-dropdown @select="insertVariable">
              <a-button type="text" size="mini">
                <template #icon><icon-plus /></template>
                插入变量
              </a-button>
              <template #content>
                <a-doption
                  v-for="variable in availableVariables"
                  :key="variable.key"
                  :value="variable.key"
                  :label="variable.label"
                />
              </template>
            </a-dropdown>
            <a-button type="text" size="mini" @click="clearContent">
              <template #icon><icon-delete /></template>
              清空
            </a-button>
          </div>
        </div>
      </a-form-item>

      <!-- 变量说明 -->
      <a-form-item label="可用变量">
        <a-collapse :default-active-key="['variables']">
          <a-collapse-item header="变量说明" key="variables">
            <div class="variable-list">
              <div
                v-for="category in variableCategories"
                :key="category.key"
                class="variable-category"
              >
                <div class="category-title">{{ category.label }}</div>
                <div class="variable-items">
                  <div
                    v-for="variable in category.variables"
                    :key="variable.key"
                    class="variable-item"
                    @click="insertVariable(variable.key)"
                  >
                    <code>{{ variable.key }}</code>
                    <span>{{ variable.label }}</span>
                    <a-tag size="mini" :color="getVariableTypeColor(variable.type)">
                      {{ getVariableTypeLabel(variable.type) }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>
          </a-collapse-item>
        </a-collapse>
      </a-form-item>

      <!-- 预览 -->
      <a-form-item label="实时预览">
        <div class="preview-panel">
          <div class="preview-header">
            <span>消息预览</span>
            <a-switch v-model="autoPreview" size="small">
              <template #checked>自动</template>
              <template #unchecked>手动</template>
            </a-switch>
          </div>
          <div class="preview-content">
            <div class="preview-title">{{ previewTitle }}</div>
            <div class="preview-message">{{ previewContent }}</div>
          </div>
          <div class="preview-actions">
            <a-button type="primary" size="mini" @click="refreshPreview">
              <template #icon><icon-refresh /></template>
              刷新预览
            </a-button>
          </div>
        </div>
      </a-form-item>
    </a-form>

    <!-- 模板预览模态框 -->
    <a-modal
      v-model:visible="templatePreviewVisible"
      title="模板预览"
      :footer="false"
      width="600px"
    >
      <div class="template-preview-modal">
        <div class="preview-header-info">
          <a-typography-title :heading="5">{{ selectedTemplate?.name }}</a-typography-title>
          <a-typography-text type="secondary">{{ selectedTemplate?.description }}</a-typography-text>
        </div>
        <a-divider />
        <div class="preview-content-example">
          <div class="example-title">标题预览：</div>
          <div class="example-text">{{ renderTemplate(selectedTemplate?.title || '') }}</div>
          <div class="example-title">内容预览：</div>
          <div class="example-text">{{ renderTemplate(selectedTemplate?.content || '') }}</div>
        </div>
        <a-divider />
        <div class="preview-variables">
          <div class="variables-title">使用到的变量：</div>
          <div class="variables-list">
            <a-tag
              v-for="variable in getTemplateVariables(selectedTemplate)"
              :key="variable"
              size="small"
            >
              {{ variable }}
            </a-tag>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconEye, IconPlus, IconDelete, IconRefresh } from '@arco-design/web-vue/es/icon'

const router = useRouter()

// 注入表单数据
const formData = inject('formData', reactive({
  templateId: '',
  title: '',
  content: ''
}))

// 注入预览数据
const previewData = inject('previewData', reactive({
  ruleName: '库存预警规则示例',
  monitorType: 'inventory',
  conditions: {
    threshold: 100,
    operator: 'less_than',
    timeWindow: 60
  },
  notifications: {
    channels: ['wechat', 'email'],
    recipients: ['zhangsan', 'lisi']
  }
}))

// 模板选项
const templateOptions = ref([
  {
    id: 'inventory_alert',
    name: '库存预警模板',
    description: '适用于库存预警通知',
    title: '{{ruleName}} - 库存预警通知',
    content: '您好！\n\n{{itemName}}的库存已低于设定阈值。\n\n当前库存：{{currentStock}}件\n预警阈值：{{threshold}}件\n监控时间：{{monitorTime}}\n\n请及时处理，避免缺货风险。'
  },
  {
    id: 'expiry_warning',
    name: '到期提醒模板',
    description: '适用于商品到期提醒',
    title: '{{ruleName}} - 商品到期提醒',
    content: '您好！\n\n以下商品即将到期：\n\n商品名称：{{itemName}}\n到期时间：{{expiryDate}}\n剩余天数：{{daysLeft}}天\n\n请及时处理，避免损失。'
  },
  {
    id: 'failure_rate_alert',
    name: '失败率预警模板',
    description: '适用于接口失败率预警',
    title: '{{ruleName}} - 失败率预警',
    content: '您好！\n\n检测到异常失败率：\n\n接口名称：{{apiName}}\n当前失败率：{{currentFailureRate}}%\n预警阈值：{{threshold}}%\n监控时间：{{monitorTime}}\n\n请立即检查系统状态。'
  }
])

// 可用变量
const availableVariables = computed(() => {
  const baseVars = [
    { key: '{{ruleName}}', label: '规则名称', type: 'text' },
    { key: '{{itemName}}', label: '商品名称', type: 'text' },
    { key: '{{monitorTime}}', label: '监控时间', type: 'datetime' },
    { key: '{{currentStock}}', label: '当前库存', type: 'number' },
    { key: '{{threshold}}', label: '预警阈值', type: 'number' }
  ]

  if (previewData.monitorType === 'inventory') {
    return baseVars
  } else if (previewData.monitorType === 'expiry') {
    return [
      ...baseVars,
      { key: '{{expiryDate}}', label: '到期日期', type: 'date' },
      { key: '{{daysLeft}}', label: '剩余天数', type: 'number' }
    ]
  } else if (previewData.monitorType === 'failure_rate') {
    return [
      ...baseVars,
      { key: '{{apiName}}', label: '接口名称', type: 'text' },
      { key: '{{currentFailureRate}}', label: '当前失败率', type: 'percent' }
    ]
  }

  return baseVars
})

// 变量分类
const variableCategories = computed(() => [
  {
    key: 'basic',
    label: '基础信息',
    variables: availableVariables.value.filter(v => 
      ['{{ruleName}}', '{{itemName}}', '{{monitorTime}}'].includes(v.key)
    )
  },
  {
    key: 'threshold',
    label: '阈值信息',
    variables: availableVariables.value.filter(v => 
      ['{{currentStock}}', '{{threshold}}', '{{daysLeft}}', '{{currentFailureRate}}'].includes(v.key)
    )
  },
  {
    key: 'time',
    label: '时间信息',
    variables: availableVariables.value.filter(v => 
      ['{{expiryDate}}'].includes(v.key)
    )
  }
])

// 预览相关
const autoPreview = ref(true)
const templatePreviewVisible = ref(false)
const selectedTemplate = ref(null)

const previewTitle = computed(() => {
  if (!autoPreview.value) return '自动预览已关闭'
  return renderTemplate(formData.title)
})

const previewContent = computed(() => {
  if (!autoPreview.value) return '自动预览已关闭'
  return renderTemplate(formData.content)
})

// 方法
const getVariableTypeColor = (type) => {
  const colors = {
    text: 'blue',
    number: 'green',
    datetime: 'orange',
    date: 'orange',
    percent: 'red'
  }
  return colors[type] || 'gray'
}

const getVariableTypeLabel = (type) => {
  const labels = {
    text: '文本',
    number: '数字',
    datetime: '时间',
    date: '日期',
    percent: '百分比'
  }
  return labels[type] || '未知'
}

const renderTemplate = (template) => {
  if (!template) return '暂无内容'
  
  let rendered = template
  const data = {
    ruleName: previewData.ruleName,
    itemName: '示例商品',
    monitorTime: new Date().toLocaleString(),
    currentStock: 85,
    threshold: previewData.conditions?.threshold || 100,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    daysLeft: 7,
    apiName: '示例接口',
    currentFailureRate: 15.5
  }

  // 替换变量
  Object.keys(data).forEach(key => {
    const pattern = new RegExp(`{{${key}}}`, 'g')
    rendered = rendered.replace(pattern, data[key])
  })

  return rendered || '暂无内容'
}

const getTemplateVariables = (template) => {
  if (!template?.title && !template?.content) return []
  const content = (template.title || '') + (template.content || '')
  const matches = content.match(/\{\{[^}]+\}\}/g)
  return matches ? [...new Set(matches)] : []
}

const handleTemplateChange = (templateId) => {
  if (!templateId) return
  
  const template = templateOptions.value.find(t => t.id === templateId)
  if (template) {
    formData.title = template.title
    formData.content = template.content
    Message.success('模板已应用')
  }
}

const previewTemplate = () => {
  if (!formData.templateId) return
  
  selectedTemplate.value = templateOptions.value.find(t => t.id === formData.templateId)
  templatePreviewVisible.value = true
}

const insertVariable = (variable) => {
  const textarea = document.querySelector('.content-editor textarea')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.content
    const newText = text.substring(0, start) + variable + text.substring(end)
    formData.content = newText
    
    // 重新聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  } else {
    // 如果没有找到textarea，直接追加到内容末尾
    formData.content += variable
  }
}

const clearContent = () => {
  formData.title = ''
  formData.content = ''
  Message.success('内容已清空')
}

const refreshPreview = () => {
  Message.success('预览已刷新')
}

const handleContentChange = () => {
  // 内容改变时自动触发预览更新
  if (autoPreview.value) {
    // 预览会自动更新，这里可以添加额外的逻辑
  }
}

// 监听预览数据变化
watch(previewData, () => {
  if (autoPreview.value) {
    // 预览会自动更新
  }
}, { deep: true })

// 初始化
const init = () => {
  // 如果有模板ID，加载模板数据
  if (formData.templateId) {
    handleTemplateChange(formData.templateId)
  }
}

init()
</script>

<style scoped lang="less">
.rule-content-template {
  padding: 16px 0;
}

.content-editor {
  position: relative;
  
  .editor-toolbar {
    margin-top: 8px;
    display: flex;
    gap: 8px;
  }
}

.variable-list {
  .variable-category {
    margin-bottom: 16px;
    
    .category-title {
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--color-text-1);
    }
    
    .variable-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .variable-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: var(--color-fill-2);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background: var(--color-fill-3);
      }
      
      code {
        background: var(--color-fill-4);
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 12px;
        color: var(--color-text-2);
      }
      
      span {
        font-size: 12px;
        color: var(--color-text-1);
      }
    }
  }
}

.preview-panel {
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  background: var(--color-fill-1);
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border-2);
    background: var(--color-fill-2);
    
    span {
      font-weight: 500;
      color: var(--color-text-1);
    }
  }
  
  .preview-content {
    padding: 16px;
    min-height: 120px;
    
    .preview-title {
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--color-text-1);
      line-height: 1.5;
    }
    
    .preview-message {
      color: var(--color-text-2);
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }
  
  .preview-actions {
    padding: 12px 16px;
    border-top: 1px solid var(--color-border-2);
    display: flex;
    justify-content: flex-end;
  }
}

.template-preview-modal {
  .preview-header-info {
    text-align: center;
    margin-bottom: 16px;
  }
  
  .preview-content-example {
    .example-title {
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--color-text-1);
    }
    
    .example-text {
      background: var(--color-fill-2);
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      line-height: 1.6;
      white-space: pre-wrap;
      color: var(--color-text-2);
    }
  }
  
  .preview-variables {
    .variables-title {
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--color-text-1);
    }
    
    .variables-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}
</style>