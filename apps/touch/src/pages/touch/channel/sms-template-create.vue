<template>
  <div class="sms-template-create-container">
    <a-card :bordered="false" class="form-card">
      <template #title>
        <div class="card-title">
          <icon-edit />
          短信策略模板新建
        </div>
      </template>
      
      <a-form 
        :model="formData" 
        :rules="rules" 
        layout="vertical" 
        ref="formRef" 
        class="template-form"
        :label-col-props="{ span: 24 }"
        :wrapper-col-props="{ span: 24 }"
      >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="title" label="标题" required>
              <a-input 
                v-model="formData.title" 
                placeholder="请选择标题" 
                allow-clear 
                size="large"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item field="smsType" label="短信类型">
              <a-select 
                v-model="formData.smsType" 
                placeholder="请选择" 
                allow-clear
                size="large"
              >
                <a-option value="营销类">营销类</a-option>
                <a-option value="通知类">通知类</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="primaryScene" label="一级场景">
              <a-select 
                v-model="formData.primaryScene" 
                placeholder="请选择" 
                allow-clear
                size="large"
              >
                <a-option value="促销活动">促销活动</a-option>
                <a-option value="优惠券发放">优惠券发放</a-option>
                <a-option value="成功短信">成功短信</a-option>
                <a-option value="通知">通知</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item field="strategyTag" label="策略tag">
              <a-select 
                v-model="formData.strategyTag" 
                placeholder="请选择" 
                allow-clear
                size="large"
              >
                <a-option value="Su营(苏宁主APP)">Su营(苏宁主APP)</a-option>
                <a-option value="Su营(苏宁小程序)">Su营(苏宁小程序)</a-option>
                <a-option value="Su营(苏宁(苏宁易购小程序))">Su营(苏宁(苏宁易购小程序))</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="vendor" label="厂商">
              <a-select 
                v-model="formData.vendor" 
                placeholder="请选择厂商" 
                allow-clear
                size="large"
              >
                <a-option value="自营厂商，通用">自营厂商，通用</a-option>
                <a-option value="阿里云短信">阿里云短信</a-option>
                <a-option value="腾讯云短信">腾讯云短信</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item field="template" label="短信模板">
              <a-select 
                v-model="formData.template" 
                placeholder="请选择" 
                allow-clear
                size="large"
              >
                <a-option value="优惠券发放模板">优惠券发放模板</a-option>
                <a-option value="促销通知模板">促销通知模板</a-option>
                <a-option value="成功短信通知">成功短信通知</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item field="enabled" label="是否启用">
              <a-radio-group v-model="formData.enabled" size="large">
                <a-radio :value="true">使用</a-radio>
                <a-radio :value="false">停用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row>
          <a-col :span="24">
            <a-form-item field="content" label="内容" class="content-form-item">
              <div class="content-editor">
                <div class="editor-header">
                  <span class="editor-label">内容编辑器</span>
                  <a-button 
                    type="primary" 
                    size="small"
                    @click="handleInsertVariable"
                  >
                    <template #icon><icon-plus /></template>
                    插入变量
                  </a-button>
                </div>
                <a-textarea
                  v-model="formData.content"
                  placeholder="在这里输入正文，单击插入按钮添加变量代码"
                  :auto-size="{ minRows: 8, maxRows: 15 }"
                  allow-clear
                  class="content-textarea"
                />
                <div class="editor-footer">
                  <div class="char-count">
                    <icon-info-circle />
                    <span>字符数：{{ contentLength }}/500</span>
                  </div>
                  <div class="editor-hint">
                    提示：在这里输入正文，单击插入按钮添加变量代码
                  </div>
                </div>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row>
          <a-col :span="24">
            <a-form-item class="action-form-item">
              <a-space size="large">
                <a-button type="primary" size="large" @click="handleSubmit">
                  <template #icon><icon-check /></template>
                  确定
                </a-button>
                <a-button size="large" @click="handleCancel">
                  <template #icon><icon-close /></template>
                  取消
                </a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    
    <!-- 插入变量弹窗 -->
    <a-modal
      v-model:visible="variableModalVisible"
      title="选择变量"
      width="500px"
      @ok="handleVariableOk"
      @cancel="handleVariableCancel"
    >
      <div class="variable-modal-content">
        <a-form-item label="变量列表">
          <a-select 
            v-model="selectedVariable" 
            placeholder="请选择需要插入的变量" 
            size="large"
            allow-search
          >
            <a-option value="{用户名}">
              <div class="variable-option">
                <span class="variable-name">{用户名}</span>
                <span class="variable-desc">客户姓名</span>
              </div>
            </a-option>
            <a-option value="{手机号}">
              <div class="variable-option">
                <span class="variable-name">{手机号}</span>
                <span class="variable-desc">客户手机号码</span>
              </div>
            </a-option>
            <a-option value="{优惠券金额}">
              <div class="variable-option">
                <span class="variable-name">{优惠券金额}</span>
                <span class="variable-desc">优惠券面额</span>
              </div>
            </a-option>
            <a-option value="{活动名称}">
              <div class="variable-option">
                <span class="variable-name">{活动名称}</span>
                <span class="variable-desc">营销活动标题</span>
              </div>
            </a-option>
            <a-option value="{到期时间}">
              <div class="variable-option">
                <span class="variable-name">{到期时间}</span>
                <span class="variable-desc">优惠券过期日期</span>
              </div>
            </a-option>
          </a-select>
        </a-form-item>
        
        <a-alert type="info" :show-icon="false">
          <template #icon><icon-info-circle /></template>
          选择变量后，将在光标位置插入对应的变量代码
        </a-alert>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconEdit, 
  IconPlus, 
  IconCheck, 
  IconClose, 
  IconInfoCircle 
} from '@arco-design/web-vue/es/icon'

const router = useRouter()
const formRef = ref()
const variableModalVisible = ref(false)
const selectedVariable = ref('')

const formData = reactive({
  title: '',
  smsType: '',
  primaryScene: '',
  strategyTag: '',
  vendor: '',
  template: '',
  enabled: true,
  content: ''
})

const rules = {
  title: [
    { required: true, message: '请输入标题' }
  ]
}

const contentLength = computed(() => {
  return formData.content?.length || 0
})

function handleInsertVariable() {
  variableModalVisible.value = true
  selectedVariable.value = ''
}

function handleVariableOk() {
  if (selectedVariable.value) {
    // 在当前光标位置插入变量
    formData.content = (formData.content || '') + selectedVariable.value
    Message.success('变量已插入')
    variableModalVisible.value = false
    selectedVariable.value = ''
  } else {
    Message.warning('请选择要插入的变量')
  }
}

function handleVariableCancel() {
  variableModalVisible.value = false
  selectedVariable.value = ''
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  
  if (contentLength.value > 500) {
    Message.warning('内容长度不能超过500个字符')
    return
  }
  
  try {
    // TODO: 调用保存接口
    Message.success('保存成功')
    router.push('/touch/channel/sms-template')
  } catch (error) {
    Message.error('保存失败')
  }
}

function handleCancel() {
  router.back()
}
</script>

<style scoped>
.sms-template-create-container {
  padding: 20px;
  background: #f2f3f5;
  min-height: 100vh;
}

.form-card {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.template-form {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.arco-form-item-label) {
  font-weight: 500;
  font-size: 14px;
  color: #1d2129;
  margin-bottom: 8px;
}

:deep(.arco-form-item-label-required-symbol) {
  color: #f53f3f;
  margin-right: 4px;
}

:deep(.arco-input),
:deep(.arco-select-view),
:deep(.arco-textarea) {
  border-radius: 4px;
}

:deep(.arco-input:hover),
:deep(.arco-select-view:hover),
:deep(.arco-textarea:hover) {
  border-color: #4080ff;
}

:deep(.arco-radio-group) {
  display: flex;
  gap: 24px;
}

:deep(.arco-radio) {
  font-size: 14px;
}

.content-form-item {
  margin-top: 8px;
}

.content-editor {
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  background: #fff;
  transition: all 0.3s;
}

.content-editor:hover {
  border-color: #4080ff;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e6eb;
  background: #f7f8fa;
}

.editor-label {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.content-textarea {
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.content-textarea:focus {
  border: none !important;
  box-shadow: none !important;
}

:deep(.content-textarea .arco-textarea) {
  padding: 16px;
  font-size: 14px;
  line-height: 1.8;
  border: none;
}

:deep(.content-textarea .arco-textarea:focus) {
  border: none;
  box-shadow: none;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #e5e6eb;
  background: #f7f8fa;
}

.char-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4e5969;
}

.editor-hint {
  font-size: 12px;
  color: #86909c;
}

.action-form-item {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e6eb;
}

.action-form-item :deep(.arco-form-item-content-flex) {
  justify-content: center;
}

/* 变量选择弹窗样式 */
.variable-modal-content {
  padding: 8px 0;
}

.variable-modal-content :deep(.arco-form-item) {
  margin-bottom: 16px;
}

.variable-modal-content :deep(.arco-form-item-label) {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 8px;
}

.variable-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.variable-name {
  font-weight: 500;
  color: #1d2129;
}

.variable-desc {
  font-size: 12px;
  color: #86909c;
}

:deep(.arco-modal-body) {
  padding: 24px;
}

:deep(.arco-alert) {
  margin-top: 16px;
  background: #e8f3ff;
  border: 1px solid #bedaff;
}

:deep(.arco-alert .arco-icon) {
  color: #4080ff;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .template-form {
    padding: 16px;
  }
  
  .sms-template-create-container {
    padding: 12px;
  }
}
</style>
