<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="人群分流节点配置"
    width="700px"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <!-- 节点名称 -->
      <div class="node-name-section">
        <a-form-item label="节点名称" field="nodeName" required>
          <a-input v-model="formData.nodeName" placeholder="请输入节点名称" />
        </a-form-item>
      </div>

      <!-- 模式切换 -->
      <div class="mode-switcher">
        <a-radio-group v-model="formData.mode">
          <a-radio value="existing">已有模式</a-radio>
          <a-radio value="new">新增模式</a-radio>
        </a-radio-group>
      </div>

      <!-- 已有模式：下拉选择人群 -->
      <div v-if="formData.mode === 'existing'" class="existing-mode">
        <div class="system-tip">
          <a-alert type="info" show-icon>系统将按从上到下顺序，依次命中</a-alert>
        </div>
        <div class="crowd-layers">
          <div v-for="(layer, index) in formData.crowdLayers" :key="layer.id" class="crowd-layer">
            <div class="layer-header">
              <span class="layer-title">人群{{ index + 1 }}：</span>
              <span class="layer-label">命中</span>
              <a-button
                v-if="formData.crowdLayers.length > 1"
                type="text"
                status="danger"
                size="small"
                class="remove-btn"
                @click="removeCrowdLayer(index)"
              >
                <IconMinus />
              </a-button>
            </div>
            <div class="layer-content">
              <a-select
                v-model="layer.crowdId"
                placeholder="请选择人群"
                class="crowd-select"
                @change="(value) => handleCrowdChange(index, value)"
              >
                <a-option v-for="crowd in getAvailableCrowds(index)" :key="crowd.id" :value="crowd.id">
                  {{ crowd.name }}
                </a-option>
              </a-select>
              <a-button type="text" size="small" class="search-btn">
                <IconSearch />
              </a-button>
            </div>
          </div>
        </div>
        <div class="unmatch-branch-section">
          <div class="section-title">
            <span>未命中分支配置</span>
            <a-tooltip content="未命中分支用于处理不满足上述任何人群条件的用户，此分支不可删除">
              <IconInfoCircle class="info-icon" />
            </a-tooltip>
          </div>
          <div class="crowd-layer unmatch-layer">
            <div class="layer-header">
              <span class="layer-title">未命中人群：</span>
              <span class="layer-label fixed-label">固定分支</span>
            </div>
            <div class="layer-content">
              <a-input
                v-model="formData.unmatchBranch.name"
                placeholder="请输入未命中分支名称"
                class="branch-name-input"
              />
              <a-button type="text" size="small" class="search-btn" disabled>
                <IconSearch />
              </a-button>
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <a-button type="primary" class="add-crowd-btn" @click="addCrowdLayer">新增人群</a-button>
          <a-button type="primary" class="add-hit-crowd-btn" @click="addHitCrowdLayer">添加命中人群</a-button>
        </div>
      </div>

      <!-- 新增模式：CDP规则构建器 -->
      <div v-if="formData.mode === 'new'" class="new-mode">
        <CDPRuleBuilderForm
          v-model="formData.cdpRule"
          @save="handleCdpRuleSave"
        />
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconMinus, IconSearch, IconInfoCircle } from '@arco-design/web-vue/es/icon'
import BaseDrawer from './BaseDrawer.vue'
import CDPRuleBuilderForm from './task/CDPRuleBuilderForm.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'

const mockCrowdData = [
  { id: 1, name: '黑名单', count: 850 },
  { id: 2, name: '高响应客群', count: 2800 },
  { id: 3, name: '中响应客群', count: 4200 },
  { id: 4, name: '低响应客群', count: 3500 },
  { id: 5, name: '高净值客户', count: 1500 },
  { id: 6, name: '新注册用户', count: 4500 },
  { id: 7, name: '活跃交易用户', count: 2800 },
  { id: 8, name: '潜在流失用户', count: 1200 },
  { id: 9, name: '理财产品用户', count: 3200 },
  { id: 10, name: '基金投资用户', count: 2100 },
]

const props = defineProps({
  visible: { type: Boolean, default: false },
  nodeData: { type: Object, default: () => ({}) },
  readOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const crowdList = ref([])
const formRules = {
  nodeName: [{ required: true, message: '请输入节点名称' }],
}

const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9)

const getInitialFormData = () => {
  const nodeConfig = props.nodeData?.config || {}
  return {
    nodeName: props.nodeData?.nodeName || '人群分流',
    mode: nodeConfig.mode || 'existing',
    crowdLayers: [
      { id: generateId(), crowdId: null, crowdName: '' },
      { id: generateId(), crowdId: null, crowdName: '' },
    ],
    unmatchBranch: {
      id: 'unmatch_default',
      name: '未命中人群',
      isDefault: true,
    },
    cdpRule: nodeConfig.cdpRule || null,
  }
}

const customValidation = (formData) => {
  const errors = []
  if (formData.mode === 'existing') {
    if (!formData.crowdLayers?.length) {
      errors.push('请配置人群分层')
      return errors
    }
    const emptyLayers = formData.crowdLayers.filter(layer => !layer.crowdId)
    if (emptyLayers.length > 0) {
      errors.push('请为所有人群层级选择对应的人群')
    }
    if (!formData.unmatchBranch?.name?.trim()) {
      errors.push('请输入未命中分支名称')
    }
  }
  if (formData.mode === 'new') {
    if (!formData.cdpRule) {
      errors.push('请配置CDP人群规则')
    }
  }
  return errors
}

const {
  formData,
  visible,
  isSubmitting,
  isFormValid,
  handleSubmit: baseHandleSubmit,
  handleCancel,
} = useBaseDrawer({
  props,
  emit,
  formRules,
  getInitialFormData,
  customValidation,
  nodeType: 'crowd-split',
})

const fetchCrowdList = async () => {
  try {
    const res = await fetch('/api/crowds')
    if (res.ok) {
      const data = await res.json()
      crowdList.value = data.data || mockCrowdData
      return
    }
  } catch {}
  crowdList.value = mockCrowdData
}

import { onMounted } from 'vue'
onMounted(() => {
  fetchCrowdList()
})

const getAvailableCrowds = (currentIndex) => {
  if (!formData?.crowdLayers) return crowdList.value || []
  const selectedIds = formData.crowdLayers
    .filter((l, i) => i !== currentIndex && l.crowdId)
    .map(l => l.crowdId)
  return crowdList.value.filter(c => !selectedIds.includes(c.id))
}

const handleCrowdChange = (index, crowdId) => {
  if (!formData?.crowdLayers?.[index]) return
  const layer = formData.crowdLayers[index]
  layer.crowdId = crowdId
  if (crowdId) {
    const crowd = crowdList.value.find(c => c.id === crowdId)
    layer.crowdName = crowd?.name || ''
  } else {
    layer.crowdName = ''
  }
}

const addCrowdLayer = () => {
  if (!formData?.crowdLayers) return
  formData.crowdLayers.push({ id: generateId(), crowdId: null, crowdName: '' })
}

const addHitCrowdLayer = () => addCrowdLayer()

const removeCrowdLayer = (index) => {
  if (!formData?.crowdLayers || formData.crowdLayers.length <= 1) return
  formData.crowdLayers.splice(index, 1)
}

const handleCdpRuleSave = (cdpRuleData) => {
  formData.cdpRule = cdpRuleData
}

const handleSubmit = async () => {
  if (formData.mode === 'existing') {
    const hasEmptyLayers = formData.crowdLayers.some(layer => !layer.crowdId)
    if (hasEmptyLayers) {
      Message.error('请为所有人群层级选择对应的人群')
      return
    }
    const crowdIds = formData.crowdLayers.map(layer => layer.crowdId)
    const uniqueIds = [...new Set(crowdIds)]
    if (crowdIds.length !== uniqueIds.length) {
      Message.error('不能选择重复的人群')
      return
    }
    if (!formData.unmatchBranch?.name?.trim()) {
      Message.error('请输入未命中分支名称')
      return
    }
    const configData = {
      type: 'crowd-split',
      mode: 'existing',
      crowdLayers: formData.crowdLayers.map((layer, index) => ({
        id: layer.id,
        order: index + 1,
        crowdId: layer.crowdId,
        crowdName: layer.crowdName,
      })),
      unmatchBranch: {
        id: formData.unmatchBranch.id,
        name: formData.unmatchBranch.name,
        isDefault: true,
        order: formData.crowdLayers.length + 1,
      },
    }
    await baseHandleSubmit(configData)
    Message.success('配置保存成功')
  } else if (formData.mode === 'new') {
    if (!formData.cdpRule) {
      Message.error('请配置CDP人群规则')
      return
    }
    const configData = {
      type: 'crowd-split',
      mode: 'new',
      cdpRule: formData.cdpRule,
    }
    await baseHandleSubmit(configData)
    Message.success('配置保存成功')
  }
}
</script>

<style scoped>
.node-name-section {
  margin-bottom: 16px;
}

.mode-switcher {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.system-tip {
  margin-bottom: 16px;
}

.system-tip :deep(.arco-alert) {
  background-color: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
}

.crowd-layers {
  margin-bottom: 16px;
}

.unmatch-branch-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.info-icon {
  color: var(--subapp-info);
  cursor: help;
}

.unmatch-layer {
  background-color: #f0f8ff;
  border: 1px solid #b3d8ff;
}

.fixed-label {
  background-color: #e6f4ff;
  color: var(--subapp-info);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.branch-name-input {
  flex: 1;
}

.crowd-layer {
  margin-bottom: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.layer-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.layer-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.layer-label {
  font-size: 14px;
  color: #666;
}

.remove-btn {
  margin-left: auto;
  color: var(--subapp-danger);
}

.remove-btn:hover {
  background-color: #fff2f0;
}

.layer-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crowd-select {
  flex: 1;
}

.search-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.search-btn:hover {
  background-color: #f0f0f0;
  color: var(--subapp-info);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.add-crowd-btn,
.add-hit-crowd-btn {
  flex: 1;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
}

.add-crowd-btn,
.add-hit-crowd-btn {
  background-color: var(--subapp-info);
  border-color: var(--subapp-info);
}

.add-crowd-btn:hover,
.add-hit-crowd-btn:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.new-mode {
  padding: 8px 0;
}
</style>