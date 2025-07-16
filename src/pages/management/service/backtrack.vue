<template>
  <div class="content">
    <div class="page-header">
      <h2>全量变量回溯申请</h2>
      <a-button type="primary" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        添加
      </a-button>
    </div>
    
    <!-- 申请列表 -->
    <div class="application-list">
      <!-- 产品添加区域 -->
      <div class="products-grid">
        <div 
          v-for="n in 4" 
          :key="n"
          class="add-product-item" 
          @click="showAddModal"
        >
          <div class="add-icon">
            <icon-plus />
          </div>
          <div class="add-text">添加申请</div>
        </div>
      </div>
    </div>

    <!-- 申请说明 -->
    <div class="application-description">
      <div class="description-header">
        <span class="description-title">申请说明</span>
        <span class="character-count">{{ applicationDescription.length }}/1000</span>
      </div>
      
      <!-- 申请说明文本框 -->
      <a-textarea 
        v-model="applicationDescription"
        placeholder="请输入申请说明"
        :max-length="1000"
        :auto-size="{ minRows: 4, maxRows: 8 }"
        show-word-limit
        class="description-textarea"
      />
      
      <!-- 确认按钮 -->
      <div class="confirm-section">
        <a-button type="primary" size="large" @click="handleSubmitApplication">
          确认
        </a-button>
      </div>
    </div>

    
    <!-- 添加任务弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      title="添加申请"
      width="600px"
      :mask-closable="false"
      @ok="handleConfirm"
      @cancel="handleCancel"
    >
      <div class="modal-content">
        <!-- 变量范围 -->
        <div class="form-section">
          <div class="section-title">变量范围</div>
          <a-radio-group v-model="formData.variableScope" class="radio-group">
            <a-radio value="all">全部</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
          
          <!-- 自定义数据产品选择 -->
          <div v-if="formData.variableScope === 'custom'" class="custom-products">
            <div class="section-title">选择数据产品</div>
            <a-select 
              v-model="formData.selectedProducts" 
              placeholder="请选择数据产品"
              multiple
              allow-clear
              :max-tag-count="3"
            >
              <a-option v-for="product in dataProducts" :key="product.value" :value="product.value">
                {{ product.label }}
              </a-option>
            </a-select>
          </div>
        </div>
        
        <!-- 执行周期 -->
        <div class="form-section">
          <div class="section-title">
            <a-switch v-model="formData.isDailyFollow" /> 每日跟跑
          </div>
          
          <div v-if="formData.isDailyFollow" class="daily-follow-settings">
            <div class="date-range">
              <span class="date-label">结束日期</span>
              <a-date-picker 
                v-model="formData.endDate"
                placeholder="请选择结束日期"
                :disabled-date="current => current && current > dayjs().subtract(2, 'day')"
              />
            </div>
          </div>
        </div>
        
        <!-- 历史回溯区间 -->
        <div class="form-section">
          <div class="section-title">
            <a-switch v-model="formData.enableHistoryBacktrack" /> 历史回溯
          </div>
          
          <div v-if="formData.enableHistoryBacktrack" class="history-backtrack-settings">
            <div class="date-range">
              <a-date-picker
                v-model="formData.historyStartDate"
                placeholder="开始日期"
              />
              <span class="date-separator">-</span>
              <a-date-picker
                v-model="formData.historyEndDate"
                placeholder="结束日期"
                :disabled-date="current => current && current > dayjs().subtract(2, 'day')"
              />
            </div>
          </div>
        </div>
        
        <!-- 样本范围 -->
        <div v-if="formData.executionCycle" class="form-section">
          <div class="section-title">回溯日期区间</div>
          <div class="date-range">
            <span class="date-label">开始日期</span>
            <a-date-picker 
              v-model="formData.startDate" 
              placeholder="请选择开始日期"
              :disabled-date="disabledStartDate"
            />
            <span class="date-separator">-</span>
            <span class="date-label">结束日期</span>
            <a-date-picker 
              v-model="formData.endDate" 
              placeholder="请选择结束日期"
              :disabled-date="disabledEndDate"
            />
            <a-button type="text" @click="openDateModal">
              <icon-calendar />
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>
    
    <!-- 日期选择弹窗 -->
    <a-modal
      v-model:visible="dateModalVisible"
      title="添加申请"
      width="400px"
      :mask-closable="false"
      @ok="handleDateConfirm"
      @cancel="handleDateCancel"
    >
      <div class="date-modal-content">
        <div class="date-option">
          <a-radio-group v-model="dateOption" class="date-radio-group">
            <a-radio value="all">全部</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
        </div>
        
        <div v-if="dateOption === 'custom'" class="custom-date">
          <div class="date-range-picker">
            <span class="date-label">样本范围</span>
            <a-date-picker 
              v-model="customStartDate" 
              placeholder="开始日期"
            />
            <span class="date-separator">-</span>
            <a-date-picker 
              v-model="customEndDate" 
              placeholder="结束日期"
            />
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconCalendar } from '@arco-design/web-vue/es/icon'
import dayjs from 'dayjs'

const modalVisible = ref(false)
const dateModalVisible = ref(false)
const dateOption = ref('all')
const customStartDate = ref(null)
const customEndDate = ref(null)
const applicationDescription = ref('')

const formData = ref({
  variableScope: 'all',
  selectedProducts: [],
  isDailyFollow: false,
  endDate: null,
  historyStartDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  historyEndDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
})

// 新增日期校验方法
const validateHistoryDate = (current) => {
  return current > dayjs().subtract(2, 'day')
}

// 更新提交校验逻辑
const handleConfirm = () => {
  if (formData.value.enableHistoryBacktrack) {
    if (!formData.value.historyStartDate || !formData.value.historyEndDate) {
      Message.error('请选择完整的历史回溯区间')
      return
    }
    // 原有日期校验逻辑保持不动
  }
  if(formData.value.historyStartDate && formData.value.historyEndDate) {
    const daysDiff = dayjs(formData.value.historyEndDate).diff(
      formData.value.historyStartDate, 'day'
    )
    if(daysDiff < 0) {
      Message.error('历史回溯结束日期不能早于开始日期')
      return
    }
    if(daysDiff > 365) {
      Message.error('历史回溯区间最大支持1年范围')
      return
    }
  }
  if (formData.value.isDailyFollow && !formData.value.endDate) {
    Message.error('请选择每日跟跑的结束日期')
    return
  }
  
  if (formData.value.historyEndDate > dayjs().subtract(2, 'day')) {
    Message.error('历史回溯结束日期不能晚于T-2日')
    return
  }
  
  // 验证表单
  if (!formData.value.executionCycle) {
    Message.error('请选择执行周期')
    return
  }
  
  if (formData.value.executionCycle === 'daily' && !formData.value.startDate) {
    Message.error('请选择开始日期')
    return
  }
  
  if (formData.value.executionCycle === 'once' && !formData.value.endDate) {
    Message.error('请选择结束日期')
    return
  }
  
  if (formData.value.variableScope === 'custom' && formData.value.selectedProducts.length === 0) {
    Message.error('请选择至少一个数据产品')
    return
  }
  
  if (formData.value.startDate && formData.value.endDate) {
    if (dayjs(formData.value.endDate).isBefore(dayjs(formData.value.startDate))) {
      Message.error('结束时间必须晚于开始时间')
      return
    }
  }
  
  modalVisible.value = false
  Message.success('任务创建成功')
}

// 取消添加任务
const handleCancel = () => {
  modalVisible.value = false
}

// 确认日期选择
const handleDateConfirm = () => {
  if (dateOption.value === 'custom') {
    if (customStartDate.value && customEndDate.value) {
      formData.value.startDate = customStartDate.value
      formData.value.endDate = customEndDate.value
    }
  }
  dateModalVisible.value = false
}

// 取消日期选择
const handleDateCancel = () => {
  dateModalVisible.value = false
}

// 提交申请
const handleSubmitApplication = () => {
  if (!applicationDescription.value.trim()) {
    Message.error('请输入申请说明')
    return
  }
  Message.success('申请提交成功')
}

// Add this in the script setup section
const showAddModal = () => {
  modalVisible.value = true;
  // Reset form data
  formData.value = {
    variableScope: 'all',
    selectedProducts: [],
    isDailyFollow: false,
    endDate: null,
    historyStartDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    historyEndDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD')
  };
};
</script>

<style scoped>
.content {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.application-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.application-description {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.description-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.character-count {
  font-size: 14px;
  color: #86909c;
}

.description-textarea {
  margin-bottom: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.add-product-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  border: 2px dashed #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-product-item:hover {
  border-color: #165dff;
  background-color: #f7f9ff;
}

.add-icon {
  font-size: 24px;
  color: #c9cdd4;
  margin-bottom: 8px;
}

.add-product-item:hover .add-icon {
  color: #165dff;
}

.add-text {
  font-size: 12px;
  color: #86909c;
}

.add-product-item:hover .add-text {
  color: #165dff;
}

.confirm-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f2f3f5;
}

.modal-content {
  padding: 20px 0;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
}

.radio-group {
  display: flex;
  gap: 24px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.date-label {
  font-size: 14px;
  color: #4e5969;
  white-space: nowrap;
}

.date-separator {
  font-size: 14px;
  color: #86909c;
}

.date-modal-content {
  padding: 20px 0;
}

.date-option {
  margin-bottom: 20px;
}

.date-radio-group {
  display: flex;
  gap: 24px;
}

.custom-date {
  margin-top: 16px;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.custom-products {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f2f3f5;
}

.custom-products .section-title {
  margin-bottom: 8px;
}
</style>