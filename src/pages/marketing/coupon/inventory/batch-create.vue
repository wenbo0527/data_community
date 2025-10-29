<template>
  <div class="batch-create-container">
    <!-- 页面标题 -->
    <a-page-header 
      title="批量创建券库存" 
      subtitle="统一配置券库存基础信息，分别配置各券库存详情"
      @back="handleBack">
      <template #breadcrumb>
        <a-breadcrumb>
          <a-breadcrumb-item>营销画布</a-breadcrumb-item>
          <a-breadcrumb-item>券管理</a-breadcrumb-item>
          <a-breadcrumb-item>批量创建</a-breadcrumb-item>
        </a-breadcrumb>
      </template>
    </a-page-header>

    <!-- 配置进度指示器 -->
    <a-card class="progress-card" v-if="showProgressIndicator">
      <a-steps :current="currentStep" size="small">
        <a-step title="统一配置" description="设置基础信息" />
        <a-step title="券库存配置" description="添加券库存详情" />
        <a-step title="审批申请" description="提交审批" />
      </a-steps>
    </a-card>

    <!-- 表单内容 -->
    <a-form 
      ref="formRef"
      :model="formData" 
      :rules="formRules"
      layout="vertical"
      @submit="handleSubmit">
      
      <!-- 统一配置 -->
      <a-card class="form-card config-card" title="统一配置">
        <template #extra>
          <a-tag v-if="isUnifiedConfigComplete" color="green" size="small">
            <template #icon><icon-check /></template>
            配置完成
          </a-tag>
          <a-tag v-else color="orange" size="small">
            <template #icon><icon-exclamation /></template>
            待配置
          </a-tag>
        </template>

        <!-- 统一配置 -->
        <div class="config-section">
          <!-- 第一行：审核员 + 录入员 -->
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item field="unifiedConfig.auditor" label="审核员" required>
                <a-select 
                  v-model="formData.unifiedConfig.auditor"
                  placeholder="请选择审核员">
                  <a-option value="user1">张三</a-option>
                  <a-option value="user2">李四</a-option>
                  <a-option value="user3">王五</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item field="unifiedConfig.operator" label="录入员">
                <a-input 
                  v-model="formData.unifiedConfig.operator"
                  readonly 
                  disabled />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 第二行：有效期类型 + 有效期范围 -->
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item field="unifiedConfig.validityType" label="有效期类型" required>
                <a-radio-group 
                  v-model="formData.unifiedConfig.validityType"
                  @change="handleValidityTypeChange">
                  <a-radio value="absolute">绝对有效期</a-radio>
                  <a-radio value="relative">相对有效期</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="unifiedConfig.validity" label="有效期范围" required>
                <template #help>
                  <span class="help-text">设置券的可用时间范围</span>
                </template>
                <a-range-picker 
                  v-model="formData.unifiedConfig.validity"
                  format="YYYY-MM-DD"
                  placeholder="选择有效期范围"
                  style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 第三行：相对有效期天数（条件显示） -->
          <a-row v-if="formData.unifiedConfig.validityType === 'relative'" :gutter="16">
            <a-col :span="8">
              <a-form-item field="unifiedConfig.relativeDays" label="相对有效期天数" required>
                <template #help>
                  <span class="help-text">设置券的相对有效期天数，最长不超过45天</span>
                </template>
                <a-input-number 
                  v-model="formData.unifiedConfig.relativeDays"
                  :min="1"
                  :max="45"
                  :step="1"
                  placeholder="请输入天数"
                  suffix="天"
                  style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-card>

      <!-- 券库存列表 -->
      <a-card class="form-card inventory-card">
        <template #title>
          <div class="card-title-with-actions">
            <span>券库存列表</span>
            <a-tag v-if="inventoryList.length > 0" color="blue" size="small">
              已添加 {{ inventoryList.length }} 个券库存
            </a-tag>
          </div>
        </template>
        
        <template #extra>
          <a-space>
            <a-button 
              v-if="inventoryList.length > 0"
              type="outline" 
              status="danger"
              size="small"
              @click="clearAllInventories">
              <template #icon><icon-delete /></template>
              清空列表
            </a-button>
            <a-button 
              type="primary" 
              size="small"
              :disabled="!isUnifiedConfigComplete"
              @click="showTemplateSelector">
              <template #icon><icon-plus /></template>
              添加券库存
            </a-button>
          </a-space>
        </template>

        <!-- 配置提示 -->
        <a-alert 
          v-if="!isUnifiedConfigComplete" 
          type="info" 
          message="请先完成统一配置，再添加券库存"
          style="margin-bottom: 16px" />

        <!-- 空状态 -->
        <div v-if="inventoryList.length === 0" class="empty-state">
          <a-empty description="暂无券库存，请点击添加券库存开始配置">
            <a-button 
              type="primary" 
              :disabled="!isUnifiedConfigComplete"
              @click="showTemplateSelector">
              <template #icon><icon-plus /></template>
              添加券库存
            </a-button>
          </a-empty>
        </div>

        <!-- 券库存表格 -->
        <a-table 
          v-else
          :data="inventoryList"
          :pagination="false"
          :bordered="{ cell: true }"
          row-key="id"
          :scroll="{ x: 1400 }">
          <template #columns>
            <a-table-column title="序号" width="60" align="center">
              <template #cell="{ rowIndex }">
                {{ rowIndex + 1 }}
              </template>
            </a-table-column>
            <a-table-column title="券模版" width="200">
              <template #cell="{ record }">
                <div class="template-info">
                  <div class="template-name">{{ record.templateName }}</div>
                  <div class="template-id">ID: {{ record.templateId }}</div>
                </div>
              </template>
            </a-table-column>
            <a-table-column title="券库存名称" width="150">
              <template #cell="{ record }">
                <a-input 
                  v-model="record.name"
                  placeholder="券库存名称"
                  :max-length="50"
                  size="small" />
              </template>
            </a-table-column>
            <a-table-column title="券使用场景" width="180">
              <template #cell="{ record }">
                <a-checkbox-group 
                  v-model="record.usageScenarios"
                  size="small">
                  <a-checkbox value="batch_distribute">批量下发</a-checkbox>
                  <a-checkbox value="telesales">电销使用</a-checkbox>
                </a-checkbox-group>
              </template>
            </a-table-column>
            <a-table-column title="发放数量" width="120">
              <template #cell="{ record }">
                <a-input-number 
                  v-model="record.distributionQuantity"
                  :min="1"
                  :max="1000000"
                  placeholder="发放数量"
                  size="small" />
              </template>
            </a-table-column>
            <a-table-column title="单日上限" width="120">
              <template #cell="{ record }">
                <a-input-number 
                  v-model="record.dailyLimit"
                  :min="0"
                  :max="100000"
                  placeholder="单日上限"
                  size="small" />
              </template>
            </a-table-column>
            <a-table-column title="单周上限" width="120">
              <template #cell="{ record }">
                <a-input-number 
                  v-model="record.weeklyLimit"
                  :min="0"
                  :max="700000"
                  placeholder="单周上限"
                  size="small" />
              </template>
            </a-table-column>
            <a-table-column title="单月上限" width="120">
              <template #cell="{ record }">
                <a-input-number 
                  v-model="record.monthlyLimit"
                  :min="0"
                  :max="3000000"
                  placeholder="单月上限"
                  size="small" />
              </template>
            </a-table-column>
            <a-table-column title="配置状态" width="100" align="center">
              <template #cell="{ record }">
                <a-tag 
                  :color="isInventoryComplete(record) ? 'green' : 'orange'" 
                  size="small">
                  {{ isInventoryComplete(record) ? '完成' : '待配置' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" width="100" fixed="right" align="center">
              <template #cell="{ record, rowIndex }">
                <a-space>
                  <a-button 
                    type="text" 
                    size="small"
                    @click="duplicateInventory(record)">
                    <template #icon><icon-copy /></template>
                  </a-button>
                  <a-button 
                    type="text" 
                    status="danger" 
                    size="small"
                    @click="removeInventory(rowIndex)">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>

        <!-- 批量操作 -->
        <div v-if="inventoryList.length > 0" class="batch-operations">
          <a-space>
            <span class="batch-label">批量操作：</span>
            <a-button size="small" @click="batchSetDistributionQuantity">
              <template #icon><icon-edit /></template>
              批量设置发放数量
            </a-button>
            <a-button size="small" @click="batchSetLimits">
              <template #icon><icon-edit /></template>
              批量设置上限
            </a-button>
          </a-space>
        </div>
      </a-card>

      <!-- 审批申请 -->
      <a-card v-if="inventoryList.length > 0" class="form-card approval-card" title="审批申请">
        <a-form-item field="approvalReason" label="申请理由" required>
          <a-textarea 
            v-model="formData.approvalReason"
            placeholder="请详细说明批量创建券库存的理由和预期效果"
            :max-length="500"
            show-word-limit
            :auto-size="{ minRows: 4, maxRows: 8 }" />
        </a-form-item>
      </a-card>

      <!-- 操作按钮 -->
      <a-card v-if="inventoryList.length > 0" class="action-card">
        <div class="action-buttons">
          <a-space size="large">
            <a-button 
              type="primary" 
              size="large"
              :loading="submitLoading"
              @click="handleSubmit"
              :disabled="!canSubmit">
              <template #icon><icon-check /></template>
              提交审批申请
            </a-button>
            <a-button size="large" @click="handleBack">
              <template #icon><icon-close /></template>
              取消
            </a-button>
          </a-space>
        </div>
        
        <!-- 提交前检查 -->
        <div v-if="!canSubmit" class="submit-check">
          <a-alert type="warning" show-icon>
            <template #icon><icon-exclamation-circle /></template>
            <div>
              <div>提交前请检查以下项目：</div>
              <ul class="check-list">
                <li v-if="!isUnifiedConfigComplete">
                  <icon-close-circle style="color: #f53f3f" /> 统一配置未完成
                </li>
                <li v-if="incompleteInventories.length > 0">
                  <icon-close-circle style="color: #f53f3f" /> 
                  {{ incompleteInventories.length }} 个券库存配置不完整
                </li>
                <li v-if="!formData.approvalReason">
                  <icon-close-circle style="color: #f53f3f" /> 申请理由未填写
                </li>
              </ul>
            </div>
          </a-alert>
        </div>
      </a-card>
    </a-form>

    <!-- 创建成功弹窗 -->
    <a-modal
      v-model:visible="successModalVisible"
      title="批量创建申请提交成功"
      width="500px"
      :closable="false"
      :mask-closable="false">
      <div class="success-content">
        <div class="success-icon">
          <icon-check-circle style="font-size: 48px; color: #00b42a;" />
        </div>
        <div class="success-message">
          <h3>申请已提交成功！</h3>
          <p>批次ID：{{ createdBatchId }}</p>
          <p>您的批量创建申请已提交，等待审批处理。</p>
        </div>
      </div>
      
      <template #footer>
        <a-space>
          <a-button @click="goToInventoryList">
            稍后处理
          </a-button>
          <a-button 
            v-if="userPermissions.canApprove"
            type="primary" 
            @click="goToApproval">
            <template #icon><icon-thunderbolt /></template>
            立即审批
          </a-button>
        </a-space>
      </template>
    </a-modal>

    <!-- 券模版选择器弹窗 -->
    <a-modal
      v-model:visible="templateSelectorVisible"
      title="选择券模版"
      width="800px"
      :footer="false"
      @cancel="templateSelectorVisible = false">
      <div class="template-selector">
        <!-- 搜索框 -->
        <div class="template-search">
          <a-input-search
            v-model="templateSearchKeyword"
            placeholder="搜索券模版名称或ID"
            allow-clear
            @search="fetchAvailableTemplates"
            @clear="fetchAvailableTemplates">
            <template #prefix>
              <icon-search />
            </template>
          </a-input-search>
        </div>

        <!-- 模版列表 -->
        <div class="template-selector-list">
          <div v-if="filteredAvailableTemplates.length === 0" class="empty-state">
            <a-empty description="暂无可用的券模版" />
          </div>
          <div
            v-else
            v-for="template in filteredAvailableTemplates"
            :key="template.id"
            class="template-selector-item"
            @click="addInventory(template)">
            <div class="template-info">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-details">
                <span>ID: {{ template.id }}</span>
                <span>类型: {{ template.type }}</span>
                <span>状态: 
                  <a-tag :color="template.status === 'online' ? 'green' : 'red'" size="small">
                    {{ template.status === 'online' ? '已上线' : '已下线' }}
                  </a-tag>
                </span>
              </div>
            </div>
            <a-button type="primary" size="small">
              <template #icon><icon-plus /></template>
              添加
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 批量设置弹窗 -->
    <a-modal
      v-model:visible="batchSettingVisible"
      :title="batchSettingTitle"
      width="400px"
      @ok="applyBatchSetting"
      @cancel="batchSettingVisible = false">
      <a-form :model="batchSettingForm" layout="vertical">
        <a-form-item v-if="batchSettingType === 'quantity'" label="发放数量">
          <a-input-number 
            v-model="batchSettingForm.distributionQuantity"
            :min="1"
            :max="1000000"
            placeholder="请输入发放数量"
            style="width: 100%" />
        </a-form-item>
        <template v-else-if="batchSettingType === 'limits'">
          <a-form-item label="单日发放上限">
            <a-input-number 
              v-model="batchSettingForm.dailyLimit"
              :min="0"
              :max="100000"
              placeholder="请输入单日上限"
              style="width: 100%" />
          </a-form-item>
          <a-form-item label="单周发放上限">
            <a-input-number 
              v-model="batchSettingForm.weeklyLimit"
              :min="0"
              :max="700000"
              placeholder="请输入单周上限"
              style="width: 100%" />
          </a-form-item>
          <a-form-item label="单月发放上限">
            <a-input-number 
              v-model="batchSettingForm.monthlyLimit"
              :min="0"
              :max="3000000"
              placeholder="请输入单月上限"
              style="width: 100%" />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { 
  IconInfoCircle, IconPlus, IconDelete, IconSync, IconSearch, 
  IconCheck, IconExclamation, IconCopy, IconEdit, IconClose,
  IconExclamationCircle, IconCloseCircle
} from '@arco-design/web-vue/es/icon'
import { templateAPI, inventoryAPI } from '@/api/coupon.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive({
  unifiedConfig: {
    validityType: 'absolute', // absolute-绝对有效期, relative-相对有效期
    validity: [], // 有效期范围
    relativeDays: null, // 相对天数
    auditor: '', // 审核员
    operator: '当前用户' // 录入员（默认当前用户）
  },
  batchSettings: {},
  approvalReason: ''
})

// 表单验证规则
const formRules = {
  unifiedConfig: {
    validityType: [
      { required: true, message: '请选择有效期类型' }
    ],
    validity: [
      { required: true, message: '请选择有效期范围' }
    ],
    relativeDays: [
      { 
        required: true, 
        message: '请输入相对有效期天数',
        validator: (value, callback) => {
          if (formData.unifiedConfig.validityType === 'relative' && (!value || value < 1 || value > 45)) {
            callback('相对有效期天数必须在1-45天之间')
          } else {
            callback()
          }
        }
      }
    ],
    auditor: [
      { required: true, message: '请选择审核员' }
    ],
    operator: [
      { required: true, message: '请输入录入员' }
    ]
  },
  approvalReason: [
    { required: true, message: '请填写申请理由' }
  ]
}

// 券库存相关
const inventoryList = ref([])
const availableTemplates = ref([])
const templateSearchKeyword = ref('')
const templateSelectorVisible = ref(false)

// 批量设置相关
const batchSettingVisible = ref(false)
const batchSettingType = ref('')
const batchSettingForm = reactive({
  distributionQuantity: null,
  dailyLimit: null,
  weeklyLimit: null,
  monthlyLimit: null
})

// 提交状态
const submitLoading = ref(false)

// 成功弹窗相关
const successModalVisible = ref(false)
const createdBatchId = ref('')
const userPermissions = ref({
  canApprove: true // 这里可以根据实际权限控制
})

// 计算属性
const showProgressIndicator = computed(() => {
  return inventoryList.value.length > 0 || formData.unifiedConfig.inventoryName
})

const currentStep = computed(() => {
  if (!isUnifiedConfigComplete.value) return 0
  if (inventoryList.value.length === 0) return 1
  return 2
})

const isUnifiedConfigComplete = computed(() => {
  const config = formData.unifiedConfig
  const hasBasicInfo = config.auditor
  const hasValidityConfig = config.validityType && config.validity?.length === 2 && (
    config.validityType === 'absolute' || 
    (config.validityType === 'relative' && config.relativeDays)
  )
  return hasBasicInfo && hasValidityConfig
})

const incompleteInventories = computed(() => {
  return inventoryList.value.filter(inventory => !isInventoryComplete(inventory))
})

const canSubmit = computed(() => {
  return isUnifiedConfigComplete.value && 
         inventoryList.value.length > 0 && 
         incompleteInventories.value.length === 0 &&
         formData.approvalReason
})

const filteredAvailableTemplates = computed(() => {
  if (!templateSearchKeyword.value) return availableTemplates.value
  
  const keyword = templateSearchKeyword.value.toLowerCase()
  return availableTemplates.value.filter(template => 
    template.name.toLowerCase().includes(keyword) ||
    template.id.toString().includes(keyword)
  )
})

const batchSettingTitle = computed(() => {
  return batchSettingType.value === 'quantity' ? '批量设置发放数量' : '批量设置发放上限'
})

// 方法
const isInventoryComplete = (inventory) => {
  return inventory.name && 
         inventory.usageScenarios && inventory.usageScenarios.length > 0 &&
         inventory.distributionQuantity && inventory.distributionQuantity > 0
}

const handleValidityTypeChange = () => {
  formData.unifiedConfig.validity = []
  formData.unifiedConfig.relativeDays = null
}

const handleBack = () => {
  router.back()
}

const showTemplateSelector = () => {
  if (!isUnifiedConfigComplete.value) {
    Message.warning('请先完成统一配置')
    return
  }
  templateSelectorVisible.value = true
  fetchAvailableTemplates()
}

const addInventory = (template) => {
  const newInventory = {
    id: Date.now(),
    templateId: template.id,
    templateName: template.name,
    name: '',
    usageScenarios: [], // 券使用场景
    distributionQuantity: null,
    dailyLimit: null,
    weeklyLimit: null,
    monthlyLimit: null
  }
  
  inventoryList.value.push(newInventory)
  templateSelectorVisible.value = false
  Message.success('券库存已添加，请完善配置信息')
}

const removeInventory = (index) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个券库存吗？',
    onOk: () => {
      inventoryList.value.splice(index, 1)
      Message.success('券库存已删除')
    }
  })
}

const duplicateInventory = (inventory) => {
  const newInventory = {
    ...inventory,
    id: Date.now(),
    name: inventory.name + '_副本'
  }
  inventoryList.value.push(newInventory)
  Message.success('券库存已复制')
}

const clearAllInventories = () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有券库存吗？',
    onOk: () => {
      inventoryList.value = []
      Message.success('券库存列表已清空')
    }
  })
}

const batchSetDistributionQuantity = () => {
  batchSettingType.value = 'quantity'
  batchSettingForm.distributionQuantity = null
  batchSettingVisible.value = true
}

const batchSetLimits = () => {
  batchSettingType.value = 'limits'
  batchSettingForm.dailyLimit = null
  batchSettingForm.weeklyLimit = null
  batchSettingForm.monthlyLimit = null
  batchSettingVisible.value = true
}

const applyBatchSetting = () => {
  if (batchSettingType.value === 'quantity') {
    if (!batchSettingForm.distributionQuantity) {
      Message.error('请输入发放数量')
      return
    }
    inventoryList.value.forEach(inventory => {
      inventory.distributionQuantity = batchSettingForm.distributionQuantity
    })
    Message.success('批量设置发放数量成功')
  } else if (batchSettingType.value === 'limits') {
    inventoryList.value.forEach(inventory => {
      if (batchSettingForm.dailyLimit !== null) {
        inventory.dailyLimit = batchSettingForm.dailyLimit
      }
      if (batchSettingForm.weeklyLimit !== null) {
        inventory.weeklyLimit = batchSettingForm.weeklyLimit
      }
      if (batchSettingForm.monthlyLimit !== null) {
        inventory.monthlyLimit = batchSettingForm.monthlyLimit
      }
    })
    Message.success('批量设置发放上限成功')
  }
  batchSettingVisible.value = false
}

const fetchAvailableTemplates = async () => {
  try {
    // 模拟API调用
    const mockTemplates = [
      { id: 1, name: '满减券模版', type: '满减券', status: 'online' },
      { id: 2, name: '折扣券模版', type: '折扣券', status: 'online' },
      { id: 3, name: '免费券模版', type: '免费券', status: 'offline' }
    ]
    availableTemplates.value = mockTemplates
  } catch (error) {
    Message.error('获取券模版失败')
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) {
    Message.error('请完善所有必填信息')
    return
  }

  try {
    submitLoading.value = true

    // 构建请求数据
    const requestData = {
      unifiedConfig: {
        validityType: formData.unifiedConfig.validityType,
        validity: formData.unifiedConfig.validity,
        relativeDays: formData.unifiedConfig.validityType === 'relative' ? formData.unifiedConfig.relativeDays : null,
        auditor: formData.unifiedConfig.auditor,
        operator: formData.unifiedConfig.operator
      },
      inventories: inventoryList.value.map(inventory => ({
        templateId: inventory.templateId,
        templateName: inventory.templateName,
        name: inventory.name,
        usageScenarios: inventory.usageScenarios,
        distributionQuantity: inventory.distributionQuantity,
        dailyLimit: inventory.dailyLimit || 0,
        weeklyLimit: inventory.weeklyLimit || 0,
        monthlyLimit: inventory.monthlyLimit || 0
      })),
      batchSettings: formData.batchSettings,
      approvalReason: formData.approvalReason
    }

    // 调用API
    const response = await inventoryAPI.batchCreateInventory(requestData)
    
    if (response.code === 200) {
      // 显示成功提示和快速审批选项
      showSuccessModal(response.data.batchId)
    } else {
      Message.error(response.message || '提交失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    Message.error('提交失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 显示成功弹窗
const showSuccessModal = (batchId) => {
  createdBatchId.value = batchId
  successModalVisible.value = true
}

// 立即审批
const goToApproval = () => {
  successModalVisible.value = false
  router.push(`/marketing/coupon/inventory/approval?batchId=${createdBatchId.value}`)
}

// 稍后审批
const goToInventoryList = () => {
  successModalVisible.value = false
  router.push('/marketing/coupon/inventory')
}

// 初始化
onMounted(() => {
  fetchAvailableTemplates()
})
</script>

<style scoped>
.batch-create-container {
  padding: 24px;
  background-color: var(--color-bg-2);
  min-height: 100vh;
}

.progress-card {
  margin-bottom: 24px;
}

.form-card {
  margin-bottom: 24px;
}

.config-card .config-section {
  margin-bottom: 0;
}

.config-card .config-section .a-row {
  margin-bottom: 16px;
}

.config-card .config-section .a-row:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
  border-left: 3px solid var(--color-primary-6);
  padding-left: 8px;
}

.card-title-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.template-info {
  display: flex;
  flex-direction: column;
}

.template-name {
  font-weight: 500;
  color: var(--color-text-1);
}

.template-id {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.batch-operations {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--color-fill-2);
  border-radius: 6px;
  display: flex;
  align-items: center;
}

.batch-label {
  font-size: 14px;
  color: var(--color-text-2);
  margin-right: 8px;
}

.action-card {
  position: sticky;
  bottom: 24px;
  z-index: 10;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  text-align: center;
}

.submit-check {
  margin-top: 16px;
}

.check-list {
  margin: 8px 0 0 0;
  padding-left: 16px;
}

.check-list li {
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-selector {
  max-height: 500px;
}

.template-search {
  margin-bottom: 16px;
}

.template-selector-list {
  max-height: 400px;
  overflow-y: auto;
}

.template-selector-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-selector-item:hover {
  border-color: var(--color-primary-6);
  background-color: var(--color-primary-light-1);
}

.template-selector-item .template-info {
  flex: 1;
}

.template-selector-item .template-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.template-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-3);
}

@media (max-width: 768px) {
  .batch-create-container {
    padding: 16px;
  }
  
  .config-section .arco-row .arco-col {
    margin-bottom: 16px;
  }
  
  .batch-operations {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .action-buttons .arco-space {
    flex-direction: column;
    width: 100%;
  }
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 16px;
}

.success-message h3 {
  margin: 0 0 12px 0;
  color: var(--color-text-1);
}

.success-message p {
  margin: 8px 0;
  color: var(--color-text-2);
}
  
  .action-buttons .arco-btn {
    width: 100%;
  }
}
</style>