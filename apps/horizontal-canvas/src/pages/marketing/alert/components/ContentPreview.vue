<template>
  <div class="content-preview">
    <!-- 预览头部 -->
    <div class="preview-header">
      <div class="preview-title">
        <icon-eye class="title-icon" />
        <span>消息内容预览</span>
      </div>
      <div class="preview-actions">
        <a-space>
          <a-select
            v-model="previewChannel"
            placeholder="选择预览渠道"
            style="width: 120px"
            size="small"
          >
            <a-option value="wechat" label="企业微信" />
            <a-option value="sms" label="短信" />
            <a-option value="email" label="邮件" />
          </a-select>
          <a-button type="outline" size="small" @click="refreshPreview">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
          <a-button type="outline" size="small" @click="copyContent">
            <template #icon><icon-copy /></template>
            复制
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 预览内容区域 -->
    <div class="preview-content">
      <!-- 企业微信预览 -->
      <div v-if="previewChannel === 'wechat'" class="channel-preview wechat-preview">
        <div class="wechat-container">
          <div class="wechat-header">
            <div class="avatar">
              <icon-robot />
            </div>
            <div class="info">
              <div class="name">系统通知</div>
              <div class="time">{{ currentTime }}</div>
            </div>
          </div>
          <div class="wechat-content">
            <div class="message-bubble">
              <div class="message-title">{{ renderedTitle }}</div>
              <div class="message-content">{{ renderedContent }}</div>
              <div v-if="renderedContent.includes('http')" class="message-link">
                <a-link href="#" target="_blank">查看详情</a-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 短信预览 -->
      <div v-else-if="previewChannel === 'sms'" class="channel-preview sms-preview">
        <div class="sms-container">
          <div class="sms-header">
            <div class="signal-bars">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
            <div class="carrier">中国移动</div>
            <div class="time">{{ currentTimeShort }}</div>
          </div>
          <div class="sms-content">
            <div class="message-sender">系统通知</div>
            <div class="message-bubble-sms">
              <div class="sms-text">
                <div v-if="renderedTitle" class="sms-title">{{ renderedTitle }}</div>
                <div class="sms-body">{{ renderedContent }}</div>
              </div>
              <div class="sms-time">{{ currentTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 邮件预览 -->
      <div v-else-if="previewChannel === 'email'" class="channel-preview email-preview">
        <div class="email-container">
          <div class="email-header">
            <div class="subject">{{ renderedTitle || '系统通知' }}</div>
            <div class="email-meta">
              <div class="meta-item">
                <span class="label">发件人：</span>
                <span class="value">noreply@system.com</span>
              </div>
              <div class="meta-item">
                <span class="label">收件人：</span>
                <span class="value">user@example.com</span>
              </div>
              <div class="meta-item">
                <span class="label">时间：</span>
                <span class="value">{{ currentTime }}</span>
              </div>
            </div>
          </div>
          <div class="email-body">
            <div class="email-content">
              <div class="email-title">{{ renderedTitle }}</div>
              <div class="email-text">
                <p>{{ renderedContent }}</p>
                <div class="email-footer">
                  <p>此邮件由系统自动发送，请勿回复。</p>
                  <p>如有疑问，请联系系统管理员。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 变量面板 -->
    <div class="variables-panel">
      <a-collapse :default-active-key="['variables']">
        <a-collapse-item header="变量值设置" key="variables">
          <div class="variables-content">
            <div class="variables-grid">
              <div v-for="(variable, key) in variableValues" :key="key" class="variable-item">
                <div class="variable-label">{{ getVariableLabel(key) }}</div>
                <div class="variable-input">
                  <a-input
                    v-model="variableValues[key]"
                    :placeholder="`输入${getVariableLabel(key)}的值`"
                    size="small"
                    @change="updatePreview"
                  />
                </div>
              </div>
            </div>
            <div class="variables-actions">
              <a-space>
                <a-button size="small" @click="resetVariables">重置默认值</a-button>
                <a-button type="primary" size="small" @click="applyVariables">应用变量</a-button>
              </a-space>
            </div>
          </div>
        </a-collapse-item>
      </a-collapse>
    </div>

    <!-- 消息统计 -->
    <div class="stats-panel">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">标题长度</div>
          <div class="stat-value">{{ titleLength }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">内容长度</div>
          <div class="stat-value">{{ contentLength }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">变量数量</div>
          <div class="stat-value">{{ variableCount }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">预计字符数</div>
          <div class="stat-value">{{ estimatedChars }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconEye,
  IconRefresh,
  IconCopy,
  IconRobot,
  IconLink
} from '@arco-design/web-vue/es/icon'

// 注入数据
const title = inject('title', ref(''))
const content = inject('content', ref(''))
const variables = inject('variables', ref([]))

// 状态
const previewChannel = ref('wechat')
const variableValues = reactive({
  ruleName: '库存预警规则示例',
  itemName: 'iPhone 15 Pro',
  monitorTime: new Date().toLocaleString(),
  currentStock: 85,
  threshold: 100,
  expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  daysLeft: 7,
  apiName: '用户登录接口',
  currentFailureRate: 15.5
})

// 计算属性
const currentTime = computed(() => new Date().toLocaleString())
const currentTimeShort = computed(() => new Date().toLocaleTimeString())

const renderedTitle = computed(() => {
  return renderTemplate(title.value, variableValues)
})

const renderedContent = computed(() => {
  return renderTemplate(content.value, variableValues)
})

const titleLength = computed(() => renderedTitle.value.length)
const contentLength = computed(() => renderedContent.value.length)
const variableCount = computed(() => extractVariables(title.value + content.value).length)
const estimatedChars = computed(() => {
  // 估算最终字符数（考虑变量替换后的长度变化）
  const baseLength = titleLength.value + contentLength.value
  const variableExpansion = variableCount.value * 10 // 假设每个变量平均扩展10个字符
  return baseLength + variableExpansion
})

// 方法
const extractVariables = (text) => {
  if (!text) return []
  const matches = text.match(/\{\{[^}]+\}\}/g)
  return matches ? [...new Set(matches)] : []
}

const renderTemplate = (template, values) => {
  if (!template) return ''
  
  let rendered = template
  const vars = extractVariables(template)
  
  vars.forEach(varStr => {
    const varName = varStr.replace(/\{\{|\}\}/g, '')
    const value = values[varName] || varStr // 如果变量值不存在，保留原变量字符串
    const pattern = new RegExp(varStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    rendered = rendered.replace(pattern, value)
  })
  
  return rendered
}

const getVariableLabel = (key) => {
  const labels = {
    ruleName: '规则名称',
    itemName: '商品名称',
    monitorTime: '监控时间',
    currentStock: '当前库存',
    threshold: '预警阈值',
    expiryDate: '到期日期',
    daysLeft: '剩余天数',
    apiName: '接口名称',
    currentFailureRate: '当前失败率'
  }
  return labels[key] || key
}

const updatePreview = () => {
  // 预览会自动更新通过计算属性
}

const refreshPreview = () => {
  // 更新时间戳
  variableValues.monitorTime = new Date().toLocaleString()
  Message.success('预览已刷新')
}

const copyContent = async () => {
  try {
    const fullContent = `标题：${renderedTitle.value}\n\n内容：${renderedContent.value}`
    await navigator.clipboard.writeText(fullContent)
    Message.success('内容已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    Message.error('复制失败，请手动复制')
  }
}

const resetVariables = () => {
  Object.assign(variableValues, {
    ruleName: '库存预警规则示例',
    itemName: 'iPhone 15 Pro',
    monitorTime: new Date().toLocaleString(),
    currentStock: 85,
    threshold: 100,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    daysLeft: 7,
    apiName: '用户登录接口',
    currentFailureRate: 15.5
  })
  Message.success('变量值已重置为默认值')
}

const applyVariables = () => {
  // 触发自定义事件，通知父组件变量值已更新
  Message.success('变量值已应用')
}

// 监听变量变化
watch(variableValues, () => {
  updatePreview()
}, { deep: true })

// 监听标题和内容变化
watch([title, content], () => {
  updatePreview()
})
</script>

<style scoped lang="less">
.content-preview {
  background: var(--color-bg-1);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-fill-1);
  border-bottom: 1px solid var(--color-border-2);
  
  .preview-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: var(--color-text-1);
    
    .title-icon {
      color: rgb(var(--primary-6));
    }
  }
  
  .preview-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.preview-content {
  min-height: 400px;
  background: var(--color-fill-2);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.channel-preview {
  width: 100%;
  max-width: 400px;
  
  &.wechat-preview {
    .wechat-container {
      background: var(--color-bg-1);
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      
      .wechat-header {
        display: flex;
        align-items: center;
        padding: 16px;
        background: var(--color-fill-1);
        border-bottom: 1px solid var(--color-border-2);
        
        .avatar {
          width: 40px;
          height: 40px;
          background: rgb(var(--primary-6));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 12px;
        }
        
        .info {
          flex: 1;
          
          .name {
            font-weight: 500;
            color: var(--color-text-1);
            margin-bottom: 4px;
          }
          
          .time {
            font-size: 12px;
            color: var(--color-text-3);
          }
        }
      }
      
      .wechat-content {
        padding: 16px;
        
        .message-bubble {
          background: rgb(var(--primary-1));
          border: 1px solid rgb(var(--primary-6));
          border-radius: 8px;
          padding: 12px 16px;
          max-width: 80%;
          margin-left: auto;
          
          .message-title {
            font-weight: 500;
            color: var(--color-text-1);
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .message-content {
            color: var(--color-text-2);
            line-height: 1.5;
            font-size: 13px;
            white-space: pre-wrap;
          }
          
          .message-link {
            margin-top: 8px;
            
            .arco-link {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
  
  &.sms-preview {
    .sms-container {
      background: var(--color-bg-1);
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      
      .sms-header {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: var(--color-fill-1);
        border-bottom: 1px solid var(--color-border-2);
        
        .signal-bars {
          display: flex;
          align-items: end;
          gap: 2px;
          margin-right: 8px;
          
          .bar {
            width: 3px;
            background: rgb(var(--success-6));
            border-radius: 1px;
            
            &:nth-child(1) { height: 4px; }
            &:nth-child(2) { height: 6px; }
            &:nth-child(3) { height: 8px; }
            &:nth-child(4) { height: 10px; }
          }
        }
        
        .carrier {
          flex: 1;
          font-size: 12px;
          color: var(--color-text-2);
        }
        
        .time {
          font-size: 12px;
          color: var(--color-text-3);
        }
      }
      
      .sms-content {
        padding: 16px;
        
        .message-sender {
          font-size: 12px;
          color: var(--color-text-3);
          margin-bottom: 8px;
        }
        
        .message-bubble-sms {
          background: var(--color-fill-2);
          border-radius: 16px;
          padding: 12px 16px;
          position: relative;
          
          .sms-text {
            .sms-title {
              font-weight: 500;
              color: var(--color-text-1);
              margin-bottom: 6px;
              font-size: 14px;
            }
            
            .sms-body {
              color: var(--color-text-2);
              line-height: 1.4;
              font-size: 13px;
              white-space: pre-wrap;
            }
          }
          
          .sms-time {
            font-size: 10px;
            color: var(--color-text-3);
            text-align: right;
            margin-top: 8px;
          }
        }
      }
    }
  }
  
  &.email-preview {
    .email-container {
      background: var(--color-bg-1);
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      
      .email-header {
        padding: 20px;
        background: var(--color-fill-1);
        border-bottom: 1px solid var(--color-border-2);
        
        .subject {
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-1);
          margin-bottom: 12px;
        }
        
        .email-meta {
          .meta-item {
            display: flex;
            margin-bottom: 4px;
            font-size: 12px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .label {
              color: var(--color-text-3);
              width: 60px;
              flex-shrink: 0;
            }
            
            .value {
              color: var(--color-text-2);
              flex: 1;
            }
          }
        }
      }
      
      .email-body {
        padding: 20px;
        
        .email-content {
          .email-title {
            font-size: 18px;
            font-weight: 500;
            color: var(--color-text-1);
            margin-bottom: 16px;
          }
          
          .email-text {
            color: var(--color-text-2);
            line-height: 1.6;
            
            p {
              margin-bottom: 12px;
              
              &:last-child {
                margin-bottom: 0;
              }
            }
            
            .email-footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid var(--color-border-2);
              font-size: 12px;
              color: var(--color-text-3);
            }
          }
        }
      }
    }
  }
}

.variables-panel {
  border-top: 1px solid var(--color-border-2);
  
  :deep(.arco-collapse-item-header) {
    padding: 12px 20px;
    background: var(--color-fill-1);
  }
  
  :deep(.arco-collapse-item-content) {
    padding: 0;
  }
  
  .variables-content {
    padding: 16px 20px;
    
    .variables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
      
      .variable-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .variable-label {
          font-size: 12px;
          color: var(--color-text-2);
          font-weight: 500;
        }
        
        .variable-input {
          :deep(.arco-input) {
            font-size: 12px;
          }
        }
      }
    }
    
    .variables-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }
}

.stats-panel {
  border-top: 1px solid var(--color-border-2);
  padding: 16px 20px;
  background: var(--color-fill-1);
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 16px;
    
    .stat-item {
      text-align: center;
      
      .stat-label {
        font-size: 12px;
        color: var(--color-text-3);
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: rgb(var(--primary-6));
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .preview-content {
    padding: 12px;
  }
  
  .channel-preview {
    max-width: 100%;
  }
  
  .variables-content .variables-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-panel .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>