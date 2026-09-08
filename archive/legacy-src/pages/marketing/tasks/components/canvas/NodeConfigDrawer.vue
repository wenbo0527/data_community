<template>
  <div v-if="visible" class="node-config-drawer">
    <div class="node-config-drawer__backdrop" @click="handleClose"></div>
    <div class="node-config-drawer__content">
      <div class="node-config-drawer__header">
        <h3>{{ nodeTitle }}</h3>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M18 6L6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="node-config-drawer__body">
        <!-- 通用配置 -->
        <div class="config-section">
          <h4>基本信息</h4>
          <div class="form-item">
            <label>节点名称</label>
            <input 
              type="text" 
              v-model="formData.label" 
              placeholder="请输入节点名称"
            />
          </div>
          <div class="form-item">
            <label>节点描述</label>
            <textarea 
              v-model="formData.description" 
              placeholder="请输入节点描述"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <!-- 人群分流节点特殊配置 -->
        <div v-if="node && node.type === 'audience-split'" class="config-section">
          <h4>分流配置</h4>
          <div class="form-item">
            <label>分流数量</label>
            <div class="number-input">
              <button 
                class="number-btn" 
                @click="decrementSplitCount" 
                :disabled="formData.splitCount <= 2"
              >-</button>
              <input 
                type="number" 
                v-model.number="formData.splitCount" 
                min="2" 
                max="5"
              />
              <button 
                class="number-btn" 
                @click="incrementSplitCount" 
                :disabled="formData.splitCount >= 5"
              >+</button>
            </div>
          </div>
          <div class="form-item">
            <label>分流方式</label>
            <select v-model="formData.splitMethod">
              <option value="random">随机分流</option>
              <option value="percentage">百分比分流</option>
              <option value="tag">标签分流</option>
            </select>
          </div>
        </div>
        
        <!-- 事件分流节点特殊配置 -->
        <div v-if="node && node.type === 'event-split'" class="config-section">
          <h4>事件分流配置</h4>
          <div class="form-item">
            <label>监听事件</label>
            <div class="event-list">
              <div v-for="(event, index) in formData.events" :key="index" class="event-item">
                <input 
                  type="text" 
                  v-model="event.name" 
                  placeholder="事件名称"
                  class="event-input"
                />
                <button 
                  class="remove-btn" 
                  @click="removeEvent(index)"
                  :disabled="formData.events.length <= 2"
                >×</button>
              </div>
              <button 
                class="add-btn" 
                @click="addEvent"
                :disabled="formData.events.length >= 5"
              >+ 添加事件</button>
            </div>
          </div>
        </div>
        
        <!-- AB测试节点特殊配置 -->
        <div v-if="node && node.type === 'ab-test'" class="config-section">
          <h4>AB测试配置</h4>
          <div class="form-item">
            <label>测试变体</label>
            <div class="variant-list">
              <div v-for="(variant, index) in formData.variants" :key="index" class="variant-item">
                <input 
                  type="text" 
                  v-model="variant.name" 
                  placeholder="变体名称"
                  class="variant-input"
                />
                <input 
                  type="number" 
                  v-model.number="variant.percentage" 
                  placeholder="百分比"
                  min="0" 
                  max="100"
                  class="percentage-input"
                />
                <span class="percentage-symbol">%</span>
                <button 
                  class="remove-btn" 
                  @click="removeVariant(index)"
                  :disabled="formData.variants.length <= 2"
                >×</button>
              </div>
              <button 
                class="add-btn" 
                @click="addVariant"
                :disabled="formData.variants.length >= 5"
              >+ 添加变体</button>
            </div>
            <div class="percentage-total">
              总计: {{ totalPercentage }}%
            </div>
          </div>
        </div>
        
        <!-- 条件节点特殊配置 -->
        <div v-if="node && node.type === 'condition'" class="config-section">
          <h4>条件配置</h4>
          <div class="form-item">
            <label>条件类型</label>
            <select v-model="formData.conditionType">
              <option value="attribute">属性条件</option>
              <option value="behavior">行为条件</option>
              <option value="custom">自定义条件</option>
            </select>
          </div>
          <div class="form-item">
            <label>条件表达式</label>
            <textarea 
              v-model="formData.conditionExpression" 
              placeholder="请输入条件表达式"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <!-- 触达节点特殊配置 -->
        <div v-if="isTouchNode" class="config-section">
          <h4>触达配置</h4>
          <div class="form-item">
            <label>内容模板</label>
            <select v-model="formData.templateId">
              <option value="">请选择内容模板</option>
              <option value="template1">模板一</option>
              <option value="template2">模板二</option>
              <option value="template3">模板三</option>
            </select>
          </div>
          <div class="form-item">
            <label>发送时间</label>
            <select v-model="formData.sendTime">
              <option value="immediate">立即发送</option>
              <option value="scheduled">定时发送</option>
            </select>
          </div>
          <div v-if="formData.sendTime === 'scheduled'" class="form-item">
            <label>定时时间</label>
            <input type="datetime-local" v-model="formData.scheduledTime" />
          </div>
        </div>
      </div>
      
      <div class="node-config-drawer__footer">
        <button class="btn btn-cancel" @click="handleClose">取消</button>
        <button class="btn btn-save" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getNodeType, getSafeNodeLabel } from '../../../../../utils/nodeTypeHelper.js'
import { getNodeLabel, isValidNodeType } from '../../../../../utils/nodeTypes.js'

// 组件属性
const props = defineProps({
  // 是否可见
  visible: {
    type: Boolean,
    default: false
  },
  // 节点数据
  node: {
    type: Object,
    default: null
  }
})

// 事件
const emit = defineEmits(['close', 'update'])

// 节点标题
const nodeTitle = computed(() => {
  if (!props.node) {
    console.warn('[NodeConfigDrawer] 节点对象为空')
    return '节点配置'
  }
  
  try {
    // 🔧 修复：增强节点数据调试
    console.log('[NodeConfigDrawer] 节点数据详情:', {
      node: props.node,
      nodeKeys: Object.keys(props.node),
      nodeType: props.node.type,
      nodeNodeType: props.node.nodeType,
      nodeData: props.node.data,
      nodeDataType: props.node.data?.type,
      nodeDataNodeType: props.node.data?.nodeType
    })
    
    // 使用统一的节点类型获取工具
    const nodeType = getNodeType(props.node)
    
    // 🔧 修复：增强节点类型验证
    if (!nodeType || typeof nodeType !== 'string' || nodeType.trim() === '') {
      console.warn('[NodeConfigDrawer] 无法获取有效的节点类型:', {
        node: props.node,
        nodeType,
        nodeTypeType: typeof nodeType,
        nodeKeys: props.node ? Object.keys(props.node) : []
      })
      return '节点配置'
    }
    
    const nodeLabel = getNodeLabel(nodeType)
    return `${nodeLabel || nodeType} 配置`
  } catch (error) {
    console.error('[NodeConfigDrawer] 获取节点标题时发生错误:', error)
    return '节点配置'
  }
})

// 是否为触达节点
const isTouchNode = computed(() => {
  if (!props.node) return false
  
  try {
    const nodeType = getNodeType(props.node)
    
    // 🔧 修复：验证节点类型有效性
    if (!nodeType || typeof nodeType !== 'string') {
      return false
    }
    
    return ['sms', 'email', 'wechat', 'ai-call', 'manual-call'].includes(nodeType)
  } catch (error) {
    console.error('[NodeConfigDrawer] 检查触达节点时发生错误:', error)
    return false
  }
})

// 表单数据
const formData = ref({
  label: '',
  description: '',
  splitCount: 2,
  splitMethod: 'random',
  events: [
    { name: '事件A' },
    { name: '事件B' }
  ],
  variants: [
    { name: '变体A', percentage: 50 },
    { name: '变体B', percentage: 50 }
  ],
  conditionType: 'attribute',
  conditionExpression: '',
  templateId: '',
  sendTime: 'immediate',
  scheduledTime: ''
})

// 计算AB测试总百分比
const totalPercentage = computed(() => {
  return formData.value.variants.reduce((sum, variant) => sum + (variant.percentage || 0), 0)
})

// 监听节点变化，初始化表单数据
watch(() => props.node, (newNode) => {
  if (!newNode) {
    console.log('[NodeConfigDrawer] 节点为空，跳过初始化')
    return
  }
  
  console.log('[NodeConfigDrawer] 开始初始化节点配置:', {
    node: newNode,
    nodeKeys: Object.keys(newNode),
    nodeType: newNode.type,
    nodeNodeType: newNode.nodeType,
    nodeData: newNode.data,
    nodeDataType: newNode.data?.type,
    nodeDataNodeType: newNode.data?.nodeType
  })
  
  try {
    // 使用统一的节点类型获取工具
    const nodeType = getNodeType(newNode)
    
    // 🔧 修复：增强节点类型验证
    if (!nodeType || typeof nodeType !== 'string' || nodeType.trim() === '') {
      console.warn('[NodeConfigDrawer] 无法获取有效的节点类型，跳过初始化:', {
        node: newNode,
        nodeType,
        nodeTypeType: typeof nodeType,
        nodeKeys: newNode ? Object.keys(newNode) : [],
        nodeData: newNode.data || null
      })
      return
    }
    
    // 验证节点类型是否在支持列表中
    if (!isValidNodeType(nodeType)) {
      console.warn('[NodeConfigDrawer] 不支持的节点类型:', nodeType)
      return
    }
    
    console.log('[NodeConfigDrawer] 有效的节点类型:', nodeType)
    
    // 初始化通用字段
    formData.value.label = newNode.label || getSafeNodeLabel(newNode, getNodeLabel)
    formData.value.description = newNode.data?.description || ''
    
    // 初始化特定节点类型的字段
    if (nodeType === 'audience-split') {
      formData.value.splitCount = newNode.data?.splitCount || 2
      formData.value.splitMethod = newNode.data?.splitMethod || 'random'
    } else if (nodeType === 'event-split') {
      formData.value.events = newNode.data?.events || [
        { name: '事件A' },
        { name: '事件B' }
      ]
    } else if (nodeType === 'ab-test') {
      // 支持versions和variants两种配置格式
      if (newNode.data?.versions && Array.isArray(newNode.data.versions)) {
        formData.value.variants = newNode.data.versions.map(version => ({
          name: version.name || version.label,
          percentage: version.ratio || version.percentage || 0
        }))
      } else {
        formData.value.variants = newNode.data?.variants || [
          { name: '变体A', percentage: 50 },
          { name: '变体B', percentage: 50 }
        ]
      }
    } else if (nodeType === 'condition') {
      formData.value.conditionType = newNode.data?.conditionType || 'attribute'
      formData.value.conditionExpression = newNode.data?.conditionExpression || ''
    } else if (['sms', 'email', 'wechat', 'ai-call', 'manual-call'].includes(nodeType)) {
      formData.value.templateId = newNode.data?.templateId || ''
      formData.value.sendTime = newNode.data?.sendTime || 'immediate'
      formData.value.scheduledTime = newNode.data?.scheduledTime || ''
    }
    
    console.log('[NodeConfigDrawer] 节点配置初始化完成:', formData.value)
  } catch (error) {
    console.error('[NodeConfigDrawer] 初始化节点配置时发生错误:', error)
  }
}, { immediate: true })

// 增加分流数量
const incrementSplitCount = () => {
  if (formData.value.splitCount < 5) {
    formData.value.splitCount++
  }
}

// 减少分流数量
const decrementSplitCount = () => {
  if (formData.value.splitCount > 2) {
    formData.value.splitCount--
  }
}

// 添加事件
const addEvent = () => {
  if (formData.value.events.length < 5) {
    formData.value.events.push({ name: `事件${String.fromCharCode(65 + formData.value.events.length)}` })
  }
}

// 移除事件
const removeEvent = (index) => {
  if (formData.value.events.length > 2) {
    formData.value.events.splice(index, 1)
  }
}

// 添加变体
const addVariant = () => {
  if (formData.value.variants.length < 5) {
    const remainingPercentage = Math.max(0, 100 - totalPercentage.value)
    formData.value.variants.push({ 
      name: `变体${String.fromCharCode(65 + formData.value.variants.length)}`, 
      percentage: remainingPercentage 
    })
  }
}

// 移除变体
const removeVariant = (index) => {
  if (formData.value.variants.length > 2) {
    formData.value.variants.splice(index, 1)
  }
}

// 处理保存
const handleSave = () => {
  if (!props.node) return
  
  // 使用统一的节点类型获取方法
  const nodeType = getNodeType(props.node)
  
  // 🔧 修复：增强节点类型验证
  if (!nodeType || typeof nodeType !== 'string' || nodeType.trim() === '') {
    console.error('[NodeConfigDrawer] 无法获取有效的节点类型，无法保存配置:', {
      node: props.node,
      nodeType,
      nodeTypeType: typeof nodeType
    })
    return
  }
  
  // 构建更新数据
  const updateData = {
    description: formData.value.description
  }
  
  // 添加特定节点类型的数据
  if (nodeType === 'audience-split') {
    updateData.splitCount = formData.value.splitCount
    updateData.splitMethod = formData.value.splitMethod
  } else if (nodeType === 'event-split') {
    const events = formData.value.events.filter(event => String(event.name || '').trim())
    updateData.events = events
    updateData.eventName = events.length ? events[0].name : ''
  } else if (nodeType === 'ab-test') {
    // 支持动态多变体配置，同时保存versions和variants格式
    updateData.variants = formData.value.variants.filter(variant => variant.name.trim())
    updateData.versions = formData.value.variants
      .filter(variant => variant.name.trim() && variant.percentage > 0)
      .map((variant, index) => ({
        id: `version_${index}`,
        name: variant.name,
        ratio: variant.percentage
      }))
  } else if (nodeType === 'condition') {
    updateData.conditionType = formData.value.conditionType
    updateData.conditionExpression = formData.value.conditionExpression
  } else if (['sms', 'email', 'wechat', 'ai-call', 'manual-call'].includes(nodeType)) {
    updateData.templateId = formData.value.templateId
    updateData.sendTime = formData.value.sendTime
    updateData.scheduledTime = formData.value.scheduledTime
  }
  
  // 触发更新事件
  emit('update', props.node.id, updateData)
}

// 处理关闭
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.node-config-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.node-config-drawer__backdrop {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.node-config-drawer__content {
  position: relative;
  width: 360px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.node-config-drawer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.node-config-drawer__header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: #999;
  border-radius: 4px;
  padding: 0;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.node-config-drawer__body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.config-section {
  margin-bottom: 24px;
}

.config-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

input[type="text"],
input[type="number"],
input[type="datetime-local"],
textarea,
select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background-color: white;
  transition: all 0.3s;
}

input[type="text"]:focus,
input[type="number"]:focus,
input[type="datetime-local"]:focus,
textarea:focus,
select:focus {
  border-color: #5F95FF;
  outline: none;
  box-shadow: 0 0 0 2px rgba(95, 149, 255, 0.2);
}

.number-input {
  display: flex;
  align-items: center;
}

.number-input input {
  width: 60px;
  text-align: center;
  margin: 0 8px;
}

.number-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.number-btn:hover:not(:disabled) {
  background-color: #e6e6e6;
}

.number-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.node-config-drawer__footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background-color: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.btn-cancel:hover {
  background-color: #f5f5f5;
}

.btn-save {
  background-color: #5F95FF;
  border: 1px solid #5F95FF;
  color: white;
}

.btn-save:hover {
  background-color: #4a86ff;
}

/* 事件分流和AB测试样式 */
.event-list,
.variant-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item,
.variant-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-input,
.variant-input {
  flex: 1;
}

.percentage-input {
  width: 80px;
}

.percentage-symbol {
  font-size: 14px;
  color: #666;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background-color: #ff4d4f;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
}

.remove-btn:hover:not(:disabled) {
  background-color: #ff7875;
}

.remove-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.add-btn {
  padding: 8px 12px;
  border: 1px dashed #d9d9d9;
  background-color: #fafafa;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 4px;
}

.add-btn:hover:not(:disabled) {
  border-color: #5F95FF;
  color: #5F95FF;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.percentage-total {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  text-align: right;
}
</style>