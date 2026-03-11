<template>
  <BaseDrawer
    :visible="visible"
    :form-data="formData"
    :form-rules="formRules"
    :is-submitting="isSubmitting"
    :is-form-valid="isFormValid"
    title="人群分流节点配置"
    width="600px"
    :read-only="readOnly"
    @update:visible="visible = $event"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <template #form>
      <div class="node-name-section">
        <a-form-item label="节点名称" field="nodeName" required>
          <a-input v-model="formData.nodeName" placeholder="请输入节点名称" @change="handleNodeNameChange" />
        </a-form-item>
      </div>
      <div class="system-tip"><a-alert type="info" show-icon>系统将按从上到下顺序，依次命中</a-alert></div>
      <div class="crowd-layers">
        <div v-for="(layer, index) in formData.crowdLayers" :key="layer.id" class="crowd-layer">
          <div class="layer-header">
            <span class="layer-title">人群{{ index + 1 }}：</span><span class="layer-label">命中</span>
            <a-button v-if="formData.crowdLayers.length > 1" type="text" status="danger" size="small" class="remove-btn" @click="removeCrowdLayer(index)"><icon-minus /></a-button>
          </div>
          <div class="layer-content">
            <a-select v-model="layer.crowdId" placeholder="请选择人群" class="crowd-select" @change="(value) => handleCrowdChange(index, value)">
              <a-option v-for="crowd in getAvailableCrowds(index)" :key="crowd.id" :value="crowd.id">{{ crowd.name }}</a-option>
            </a-select>
            <a-button type="text" size="small" class="search-btn"><icon-search /></a-button>
          </div>
        </div>
      </div>
      <div class="unmatch-branch-section">
        <div class="section-title"><span>未命中分支配置</span><a-tooltip content="未命中分支用于处理不满足上述任何人群条件的用户，此分支不可删除"><icon-info-circle class="info-icon" /></a-tooltip></div>
        <div class="crowd-layer unmatch-layer">
          <div class="layer-header"><span class="layer-title">其他：</span><span class="layer-label fixed-label">固定分支</span></div>
          <div class="layer-content">
            <a-input v-model="formData.unmatchBranch.name" placeholder="请输入其他分支名称" class="branch-name-input" @change="handleUnmatchBranchNameChange" />
            <a-button type="text" size="small" class="search-btn" disabled><icon-search /></a-button>
          </div>
        </div>
      </div>
      <div class="action-buttons">
        <a-button type="primary" class="add-crowd-btn" @click="addCrowdLayer">新增人群</a-button>
        <a-button type="primary" class="add-hit-crowd-btn" @click="addHitCrowdLayer">添加命中人群</a-button>
      </div>
    </template>
    <template #debug>
      <div class="debug-info">
        <div><strong>表单验证状态:</strong> {{ isFormValid ? '✓' : '✗' }}</div>
        <div><strong>人群层级数量:</strong> {{ formData?.crowdLayers?.length || 0 }}</div>
        <div><strong>已选择人群:</strong> {{ formData?.crowdLayers?.filter(l => l.crowdId && l.crowdId !== null && l.crowdId !== undefined && l.crowdId !== '')?.length || 0 }}</div>
        <div><strong>可用人群数量:</strong> {{ crowdList.length }}</div>
      </div>
    </template>
  </BaseDrawer>
</template>
<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconMinus, IconSearch, IconInfoCircle } from '@arco-design/web-vue/es/icon'
import BaseDrawer from './BaseDrawer.vue'
import { useBaseDrawer } from '@/composables/useBaseDrawer.js'
import crowdSplitLogger from '../utils/canvas/crowdSplitLogger.js'
const mockCrowdData = [ { id: 1, name: '黑名单' }, { id: 2, name: '高响应客群高响应客群高响应客群高响应客群高响应客群高响应客群高响应客群' }, { id: 3, name: '中响应客群' } ]
const props = defineProps({ visible: { type: Boolean, default: false }, nodeData: { type: Object, default: () => ({}) }, readOnly: { type: Boolean, default: false } })
const emit = defineEmits(['update:visible','confirm','cancel'])
const crowdList = ref([])
const formRules = { crowdLayers: [ { required: true, message: '请配置人群分层' } ] }
const generateId = () => Date.now() + Math.random().toString(36).substr(2,9)
const getInitialFormData = () => ({ nodeName: props.nodeData?.nodeName || '人群分流', crowdLayers: [ { id: generateId(), crowdId: null, crowdName: '' }, { id: generateId(), crowdId: null, crowdName: '' } ], unmatchBranch: { id: 'unmatch_default', name: '其他', isDefault: true, crowdId: null, crowdName: '其他' } })
const customValidation = (formData) => { const errors = []; if (!formData) { return errors } if (!formData.crowdLayers || formData.crowdLayers.length === 0) { errors.push('请配置人群分层'); return errors } const emptyLayers = formData.crowdLayers.filter(layer => !layer.crowdId); if (emptyLayers.length > 0) { errors.push(`请为所有人群层级选择对应的人群`) } const validCrowdIds = formData.crowdLayers.map(layer => layer.crowdId).filter(id => id); const uniqueCrowdIds = [...new Set(validCrowdIds)]; if (validCrowdIds.length !== uniqueCrowdIds.length) { errors.push('不能选择重复的人群') } if (!formData.unmatchBranch || !formData.unmatchBranch.name || formData.unmatchBranch.name.trim() === '') { errors.push('请输入其他分支名称') } return errors }
const { formData, visible, isSubmitting, isFormValid, handleSubmit: baseHandleSubmit, handleCancel } = useBaseDrawer({ props, emit, formRules, getInitialFormData, customValidation, nodeType: 'crowd-split' })
const fetchCrowdList = async () => { crowdList.value = mockCrowdData }
onMounted(() => { fetchCrowdList() })
const getAvailableCrowds = (currentIndex) => { if (!formData || !formData.crowdLayers) return crowdList.value || []; const selectedCrowdIds = formData.crowdLayers.filter((layer, index) => index !== currentIndex && layer.crowdId).map(layer => layer.crowdId); return crowdList.value.filter(crowd => !selectedCrowdIds.includes(crowd.id)) }
const handleCrowdChange = (index, crowdId) => { if (!formData || !formData.crowdLayers || !formData.crowdLayers[index]) return; const layer = formData.crowdLayers[index]; layer.crowdId = crowdId; if (crowdId) { const selectedCrowd = crowdList.value.find(crowd => crowd.id === crowdId); layer.crowdName = selectedCrowd ? selectedCrowd.name : '' ; crowdSplitLogger.logCrowdSelection(index, crowdId, layer.crowdName) } else { layer.crowdName = '' } }
const addCrowdLayer = () => { if (!formData || !formData.crowdLayers) return; const newLayer = { id: generateId(), crowdId: null, crowdName: '' }; formData.crowdLayers.push(newLayer) }
const addHitCrowdLayer = () => { addCrowdLayer() }
const handleNodeNameChange = (value) => { if (!formData) return; const oldName = formData.nodeName; formData.nodeName = value || '人群分流'; crowdSplitLogger.logFormDataChange('节点名称变化', { oldName, newName: formData.nodeName }) }
const handleUnmatchBranchNameChange = (value) => { if (!formData || !formData.unmatchBranch) return; const oldName = formData.unmatchBranch.name; formData.unmatchBranch.name = value || '其他'; formData.unmatchBranch.crowdName = formData.unmatchBranch.name; crowdSplitLogger.logFormDataChange('其他分支名称变化', { oldName, newName: formData.unmatchBranch.name }) }
const removeCrowdLayer = (index) => { if (!formData || !formData.crowdLayers || formData.crowdLayers.length <= 1) return; const removedLayer = formData.crowdLayers[index]; formData.crowdLayers.splice(index, 1); crowdSplitLogger.logLayerOperation('移除层级', index, { removedLayerId: removedLayer?.id }) }
const handleSubmit = async () => { if (!formData || !formData.crowdLayers) { Message.error('表单数据不完整'); return } const hasEmptyLayers = formData.crowdLayers.some(layer => !layer.crowdId); if (hasEmptyLayers) { Message.error('请为所有人群层级选择对应的人群'); return } const crowdIds = formData.crowdLayers.map(layer => layer.crowdId); const uniqueCrowdIds = [...new Set(crowdIds)]; if (crowdIds.length !== uniqueCrowdIds.length) { Message.error('不能选择重复的人群'); return } if (!formData.unmatchBranch || !formData.unmatchBranch.name || formData.unmatchBranch.name.trim() === '') { Message.error('请输入未命中分支名称'); return } const configData = { type: 'crowd-split', crowdLayers: formData.crowdLayers.map((layer, index) => ({ id: layer.id, order: index + 1, crowdId: layer.crowdId, crowdName: layer.crowdName })), unmatchBranch: { id: formData.unmatchBranch.id, name: formData.unmatchBranch.name, isDefault: true, crowdId: null, crowdName: formData.unmatchBranch.name, order: formData.crowdLayers.length + 1 }, nodeType: 'crowd-split' }; await baseHandleSubmit(configData); Message.success('配置保存成功') }
</script>
<style scoped>
.system-tip { margin-bottom: 24px }
.system-tip .arco-alert { background-color: #e6f4ff; border: 1px solid #91caff; border-radius: 6px }
.crowd-layers { margin-bottom: 24px }
.unmatch-branch-section { margin-bottom: 24px }
.section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; color: #333 }
.info-icon { color: #1890ff; cursor: help }
.unmatch-layer { background-color: #f0f8ff; border: 1px solid #b3d8ff }
.fixed-label { background-color: #e6f4ff; color: #1890ff; padding: 2px 8px; border-radius: 4px; font-size: 12px }
.branch-name-input { flex: 1 }
.crowd-layer { margin-bottom: 16px; padding: 16px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e5e5e5 }
.layer-header { display: flex; align-items: center; margin-bottom: 12px; gap: 8px }
.layer-title { font-size: 14px; font-weight: 500; color: #333 }
.layer-label { font-size: 14px; color: #666 }
.remove-btn { margin-left: auto; color: #ff4d4f }
.remove-btn:hover { background-color: #fff2f0 }
.layer-content { display: flex; align-items: center; gap: 8px }
.crowd-select { flex: 1 }
.search-btn { flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #666 }
.search-btn:hover { background-color: #f0f0f0; color: #1890ff }
.action-buttons { display: flex; gap: 12px }
.add-crowd-btn, .add-hit-crowd-btn { flex: 1; height: 40px; font-size: 14px; font-weight: 500; border-radius: 6px }
.add-crowd-btn { background-color: #1890ff; border-color: #1890ff }
.add-crowd-btn:hover { background-color: #40a9ff; border-color: #40a9ff }
.add-hit-crowd-btn { background-color: #1890ff; border-color: #1890ff }
.add-hit-crowd-btn:hover { background-color: #40a9ff; border-color: #40a9ff }
.debug-info { font-size: 12px; color: #666; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-bottom: 12px }
.debug-info div { margin-bottom: 4px }
.debug-info div:last-child { margin-bottom: 0 }
@media (max-width: 768px) { .action-buttons { flex-direction: column } .layer-content { flex-direction: column; align-items: stretch } .search-btn { align-self: flex-end; width: auto; padding: 0 12px } }
</style>
