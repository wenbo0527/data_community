<template>
  <div class="rule-preview">
    <div class="preview-container">
      <!-- 预览头部 -->
      <div class="preview-header">
        <div class="preview-title">
          <icon-check-circle class="title-icon" />
          <span>规则配置预览</span>
        </div>
        <div class="preview-actions">
          <a-button type="outline" size="small" @click="editCurrentStep">
            <template #icon><icon-edit /></template>
            编辑当前步骤
          </a-button>
          <a-button type="outline" size="small" @click="exportConfig">
            <template #icon><icon-download /></template>
            导出配置
          </a-button>
        </div>
      </div>

      <!-- 预览内容 -->
      <div class="preview-content">
        <!-- 基本信息预览 -->
        <a-card class="preview-section" title="基本信息">
          <template #extra>
            <a-link @click="editStep(0)">编辑</a-link>
          </template>
          <a-descriptions :column="2" size="small">
            <a-descriptions-item label="规则名称">
              <span class="highlight">{{ formData.basicInfo?.name || '未设置' }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="监控类型">
              <a-tag :color="getMonitorTypeColor(formData.basicInfo?.monitorType)">
                {{ getMonitorTypeLabel(formData.basicInfo?.monitorType) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="规则描述">
              {{ formData.basicInfo?.description || '暂无描述' }}
            </a-descriptions-item>
            <a-descriptions-item label="优先级">
              <a-rate :default-value="formData.basicInfo?.priority || 1" readonly size="small" />
            </a-descriptions-item>
            <a-descriptions-item label="规则标签">
              <a-space v-if="formData.basicInfo?.tags?.length" wrap>
                <a-tag v-for="tag in formData.basicInfo.tags" :key="tag" size="small">
                  {{ tag }}
                </a-tag>
              </a-space>
              <span v-else class="text-secondary">暂无标签</span>
            </a-descriptions-item>
            <a-descriptions-item label="生效时间">
              <span v-if="formData.basicInfo?.timeSettings?.enabled">
                {{ formatTimeRange(formData.basicInfo.timeSettings) }}
              </span>
              <span v-else class="text-secondary">全天生效</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 条件配置预览 -->
        <a-card class="preview-section" title="触发条件">
          <template #extra>
            <a-link @click="editStep(1)">编辑</a-link>
          </template>
          <div class="conditions-preview">
            <div v-if="formData.conditions?.length" class="condition-list">
              <div v-for="(condition, index) in formData.conditions" :key="index" class="condition-item">
                <div class="condition-header">
                  <span class="condition-title">条件 {{ index + 1 }}</span>
                  <a-tag :color="getConditionTypeColor(condition.type)" size="small">
                    {{ getConditionTypeLabel(condition.type) }}
                  </a-tag>
                </div>
                <div class="condition-content">
                  <div v-if="condition.type === 'inventory'" class="inventory-condition">
                    <span>当商品库存</span>
                    <a-tag size="small">{{ getOperatorLabel(condition.operator) }}</a-tag>
                    <span class="highlight">{{ condition.threshold }}</span>
                    <span>件时触发</span>
                    <span v-if="condition.timeWindow" class="time-window">
                      (监控时间窗口: {{ condition.timeWindow }}分钟)
                    </span>
                  </div>
                  <div v-else-if="condition.type === 'expiry'" class="expiry-condition">
                    <span>当商品在</span>
                    <span class="highlight">{{ condition.daysBefore }}</span>
                    <span>天内到期时触发</span>
                    <span v-if="condition.categories?.length" class="categories">
                      (适用分类: {{ condition.categories.join(', ') }})
                    </span>
                  </div>
                  <div v-else-if="condition.type === 'failure_rate'" class="failure-condition">
                    <span>当接口失败率</span>
                    <a-tag size="small">{{ getOperatorLabel(condition.operator) }}</a-tag>
                    <span class="highlight">{{ condition.threshold }}%</span>
                    <span>时触发</span>
                    <span v-if="condition.timeWindow" class="time-window">
                      (统计时间窗口: {{ condition.timeWindow }}分钟)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-conditions">
              <icon-exclamation-circle class="empty-icon" />
              <span>未配置触发条件</span>
            </div>
          </div>
        </a-card>

        <!-- 通知配置预览 -->
        <a-card class="preview-section" title="通知配置">
          <template #extra>
            <a-link @click="editStep(2)">编辑</a-link>
          </template>
          <div class="notifications-preview">
            <div v-if="formData.notifications?.channels?.length" class="channels-list">
              <div class="channel-section">
                <div class="section-title">通知渠道</div>
                <a-space wrap>
                  <a-tag
                    v-for="channel in formData.notifications.channels"
                    :key="channel"
                    :color="getChannelColor(channel)"
                    size="medium"
                  >
                    <template #icon>
                      <icon-wechat v-if="channel === 'wechat'" />
                      <icon-message v-else-if="channel === 'sms'" />
                      <icon-email v-else-if="channel === 'email'" />
                    </template>
                    {{ getChannelLabel(channel) }}
                  </a-tag>
                </a-space>
              </div>
              
              <div class="recipients-section">
                <div class="section-title">通知对象</div>
                <a-space wrap>
                  <a-tag v-for="recipient in formData.notifications.recipients" :key="recipient" size="medium">
                    {{ getRecipientLabel(recipient) }}
                  </a-tag>
                </a-space>
              </div>
              
              <div v-if="formData.notifications.level" class="level-section">
                <div class="section-title">通知级别</div>
                <a-tag :color="getLevelColor(formData.notifications.level)" size="medium">
                  {{ getLevelLabel(formData.notifications.level) }}
                </a-tag>
              </div>
            </div>
            <div v-else class="empty-notifications">
              <icon-exclamation-circle class="empty-icon" />
              <span>未配置通知渠道</span>
            </div>
          </div>
        </a-card>

        <!-- 内容模板预览 -->
        <a-card class="preview-section" title="消息内容">
          <template #extra>
            <a-link @click="editStep(3)">编辑</a-link>
          </template>
          <div class="content-preview">
            <div v-if="formData.contentTemplate?.title || formData.contentTemplate?.content" class="template-content">
              <div class="template-section">
                <div class="section-label">消息标题：</div>
                <div class="template-text title">{{ formData.contentTemplate.title || '无标题' }}</div>
              </div>
              <div class="template-section">
                <div class="section-label">消息内容：</div>
                <div class="template-text content">{{ formData.contentTemplate.content || '无内容' }}</div>
              </div>
              <div v-if="formData.contentTemplate.variables?.length" class="variables-section">
                <div class="section-label">使用变量：</div>
                <a-space wrap>
                  <a-tag
                    v-for="variable in formData.contentTemplate.variables"
                    :key="variable"
                    size="small"
                    color="blue"
                  >
                    {{ variable }}
                  </a-tag>
                </a-space>
              </div>
            </div>
            <div v-else class="empty-content">
              <icon-exclamation-circle class="empty-icon" />
              <span>未配置消息内容</span>
            </div>
          </div>
        </a-card>

        <!-- 配置摘要 -->
        <a-card class="preview-section summary-section" title="配置摘要">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">规则状态</div>
              <div class="summary-value">
                <a-switch :model-value="formData.enabled" disabled />
                <span class="status-text">{{ formData.enabled ? '启用' : '禁用' }}</span>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">监控频率</div>
              <div class="summary-value">{{ getMonitorFrequency() }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">通知渠道数</div>
              <div class="summary-value">{{ formData.notifications?.channels?.length || 0 }} 个</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">通知对象数</div>
              <div class="summary-value">{{ formData.notifications?.recipients?.length || 0 }} 人</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">预计生效时间</div>
              <div class="summary-value">{{ getEffectiveTime() }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">配置完整性</div>
              <div class="summary-value">
                <a-progress :percent="getConfigCompleteness()" size="small" />
              </div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 操作按钮 -->
      <div class="preview-actions">
        <a-space>
          <a-button @click="goBack">返回编辑</a-button>
          <a-button type="primary" size="large" :loading="submitLoading" @click="submitRule">
            <template #icon><icon-check /></template>
            {{ isEdit ? '更新规则' : '创建规则' }}
          </a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconCheckCircle,
  IconEdit,
  IconDownload,
  IconExclamationCircle,
  IconWechat,
  IconMessage,
  IconEmail,
  IconCheck
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const route = useRoute()

// 注入表单数据
const formData = inject('formData', reactive({
  basicInfo: {},
  conditions: [],
  notifications: {},
  contentTemplate: {},
  enabled: true
}))

// 注入当前步骤
const currentStep = inject('currentStep', ref(4))

// 状态
const submitLoading = ref(false)

// 计算属性
const isEdit = computed(() => !!route.query.id)

// 方法
const getMonitorTypeColor = (type) => {
  const colors = {
    inventory: 'blue',
    expiry: 'orange',
    failure_rate: 'red'
  }
  return colors[type] || 'gray'
}

const getMonitorTypeLabel = (type) => {
  const labels = {
    inventory: '库存监控',
    expiry: '到期监控',
    failure_rate: '失败率监控'
  }
  return labels[type] || '未知类型'
}

const getConditionTypeColor = (type) => {
  return getMonitorTypeColor(type)
}

const getConditionTypeLabel = (type) => {
  return getMonitorTypeLabel(type)
}

const getOperatorLabel = (operator) => {
  const labels = {
    greater_than: '大于',
    less_than: '小于',
    equal: '等于',
    greater_equal: '大于等于',
    less_equal: '小于等于'
  }
  return labels[operator] || operator
}

const getChannelColor = (channel) => {
  const colors = {
    wechat: 'green',
    sms: 'blue',
    email: 'orange'
  }
  return colors[channel] || 'gray'
}

const getChannelLabel = (channel) => {
  const labels = {
    wechat: '企业微信',
    sms: '短信',
    email: '邮件'
  }
  return labels[channel] || channel
}

const getRecipientLabel = (recipient) => {
  // 这里可以根据实际需求映射用户ID到用户名
  const labels = {
    zhangsan: '张三',
    lisi: '李四',
    wangwu: '王五'
  }
  return labels[recipient] || recipient
}

const getLevelColor = (level) => {
  const colors = {
    urgent: 'red',
    important: 'orange',
    normal: 'blue',
    low: 'gray'
  }
  return colors[level] || 'gray'
}

const getLevelLabel = (level) => {
  const labels = {
    urgent: '紧急',
    important: '重要',
    normal: '一般',
    low: '低'
  }
  return labels[level] || level
}

const formatTimeRange = (timeSettings) => {
  if (!timeSettings.enabled) return '全天生效'
  
  const days = timeSettings.days?.map(day => {
    const dayMap = {
      1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 0: '周日'
    }
    return dayMap[day]
  }).join(', ') || '每天'
  
  const startTime = timeSettings.startTime || '00:00'
  const endTime = timeSettings.endTime || '23:59'
  
  return `${days} ${startTime}-${endTime}`
}

const getMonitorFrequency = () => {
  // 根据监控类型返回默认频率
  const frequencies = {
    inventory: '每30分钟',
    expiry: '每天',
    failure_rate: '每5分钟'
  }
  
  if (formData.basicInfo?.monitorType) {
    return frequencies[formData.basicInfo.monitorType] || '每30分钟'
  }
  return '未设置'
}

const getEffectiveTime = () => {
  // 简单实现：创建后5分钟生效
  const now = new Date()
  const effectiveTime = new Date(now.getTime() + 5 * 60 * 1000)
  return effectiveTime.toLocaleString()
}

const getConfigCompleteness = () => {
  let completeness = 0
  let total = 4
  
  // 检查基本信息
  if (formData.basicInfo?.name && formData.basicInfo?.monitorType) {
    completeness += 1
  }
  
  // 检查条件
  if (formData.conditions?.length > 0) {
    completeness += 1
  }
  
  // 检查通知
  if (formData.notifications?.channels?.length > 0 && formData.notifications?.recipients?.length > 0) {
    completeness += 1
  }
  
  // 检查内容模板
  if (formData.contentTemplate?.title && formData.contentTemplate?.content) {
    completeness += 1
  }
  
  return Math.round((completeness / total) * 100)
}

const editCurrentStep = () => {
  // 返回当前编辑步骤
  router.push({
    query: { ...route.query, step: currentStep.value + 1 }
  })
}

const editStep = (stepIndex) => {
  // 跳转到指定步骤
  router.push({
    query: { ...route.query, step: stepIndex + 1 }
  })
}

const goBack = () => {
  // 返回上一步
  if (currentStep.value > 0) {
    router.push({
      query: { ...route.query, step: currentStep.value }
    })
  }
}

const exportConfig = () => {
  // 导出配置为JSON
  const config = {
    basicInfo: formData.basicInfo,
    conditions: formData.conditions,
    notifications: formData.notifications,
    contentTemplate: formData.contentTemplate,
    enabled: formData.enabled,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `notification_rule_${formData.basicInfo?.name || 'config'}_${Date.now()}.json`
  link.click()
  
  URL.revokeObjectURL(url)
  Message.success('配置已导出')
}

const submitRule = async () => {
  try {
    submitLoading.value = true
    
    // 验证配置完整性
    const completeness = getConfigCompleteness()
    if (completeness < 100) {
      Message.warning(`配置不完整，请完善信息 (完成度: ${completeness}%)`)
      return
    }
    
    // 模拟提交过程
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 构建提交数据
    const submitData = {
      ...formData,
      id: isEdit.value ? route.query.id : Date.now().toString(),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    
    console.log('提交规则数据:', submitData)
    
    Message.success(isEdit.value ? '规则更新成功！' : '规则创建成功！')
    
    // 返回列表页面
    setTimeout(() => {
      router.push('/marketing/alert/rules')
    }, 1000)
    
  } catch (error) {
    console.error('提交规则失败:', error)
    Message.error('提交失败，请重试')
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped lang="less">
.rule-preview {
  padding: 24px;
  background: var(--color-fill-2);
  min-height: calc(100vh - 120px);
}

.preview-container {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--color-bg-1);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--color-border-2);
  background: var(--color-fill-1);
  
  .preview-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-1);
    
    .title-icon {
      color: rgb(var(--success-6));
      font-size: 24px;
    }
  }
  
  .preview-actions {
    display: flex;
    gap: 12px;
  }
}

.preview-content {
  padding: 24px;
  
  .preview-section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    :deep(.arco-card-header) {
      border-bottom: 1px solid var(--color-border-2);
      padding: 16px 20px;
      
      .arco-card-header-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-1);
      }
    }
    
    :deep(.arco-card-body) {
      padding: 20px;
    }
  }
  
  .conditions-preview {
    .condition-list {
      .condition-item {
        padding: 16px;
        background: var(--color-fill-1);
        border-radius: 6px;
        margin-bottom: 12px;
        border: 1px solid var(--color-border-2);
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .condition-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .condition-title {
            font-weight: 500;
            color: var(--color-text-1);
          }
        }
        
        .condition-content {
          color: var(--color-text-2);
          line-height: 1.6;
          
          .highlight {
            color: rgb(var(--primary-6));
            font-weight: 500;
            margin: 0 4px;
          }
          
          .time-window,
          .categories {
            color: var(--color-text-3);
            font-size: 12px;
            margin-left: 8px;
          }
        }
      }
    }
    
    .empty-conditions {
      text-align: center;
      padding: 40px;
      color: var(--color-text-3);
      
      .empty-icon {
        font-size: 32px;
        margin-bottom: 8px;
        color: var(--color-warning-6);
      }
    }
  }
  
  .notifications-preview {
    .channels-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .channel-section,
      .recipients-section,
      .level-section {
        .section-title {
          font-weight: 500;
          color: var(--color-text-1);
          margin-bottom: 12px;
          font-size: 14px;
        }
      }
    }
    
    .empty-notifications {
      text-align: center;
      padding: 40px;
      color: var(--color-text-3);
      
      .empty-icon {
        font-size: 32px;
        margin-bottom: 8px;
        color: var(--color-warning-6);
      }
    }
  }
  
  .content-preview {
    .template-content {
      .template-section {
        margin-bottom: 20px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .section-label {
          font-weight: 500;
          color: var(--color-text-1);
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .template-text {
          background: var(--color-fill-2);
          padding: 12px 16px;
          border-radius: 4px;
          line-height: 1.6;
          color: var(--color-text-2);
          white-space: pre-wrap;
          
          &.title {
            font-weight: 500;
            color: var(--color-text-1);
          }
          
          &.content {
            min-height: 60px;
          }
        }
      }
      
      .variables-section {
        .section-label {
          font-weight: 500;
          color: var(--color-text-1);
          margin-bottom: 8px;
          font-size: 14px;
        }
      }
    }
    
    .empty-content {
      text-align: center;
      padding: 40px;
      color: var(--color-text-3);
      
      .empty-icon {
        font-size: 32px;
        margin-bottom: 8px;
        color: var(--color-warning-6);
      }
    }
  }
  
  .summary-section {
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      
      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .summary-label {
          font-size: 12px;
          color: var(--color-text-3);
          font-weight: 500;
        }
        
        .summary-value {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-1);
          font-weight: 500;
          
          .status-text {
            font-size: 14px;
          }
          
          :deep(.arco-progress) {
            flex: 1;
          }
        }
      }
    }
  }
}

.preview-actions {
  padding: 24px;
  border-top: 1px solid var(--color-border-2);
  display: flex;
  justify-content: center;
  background: var(--color-fill-1);
}

// 响应式设计
@media (max-width: 768px) {
  .rule-preview {
    padding: 16px;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .preview-content {
    padding: 16px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr !important;
  }
}

// 自定义样式
.highlight {
  color: rgb(var(--primary-6));
  font-weight: 500;
}

.text-secondary {
  color: var(--color-text-3);
}
</style>