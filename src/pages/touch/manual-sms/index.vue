<template>
  <div class="manual-sms-container">
    <!-- 页面头部 - 新建手工短信 -->
    <a-card class="header-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <IconSend />
          新建手工短信
        </div>
      </template>
      
      <!-- 返回按钮 -->
      <div class="header-actions">
        <a-button @click="backToList">
          <template #icon><IconLeft /></template>
          返回列表
        </a-button>
      </div>
    </a-card>

    <!-- 短信批次名称、归属部门和发送时间 -->
    <a-card class="batch-card" :bordered="false">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item label="短信批次名称" required>
            <a-input 
              v-model="formData.batchName" 
              placeholder="请输入短信批次名称，用于标识本次发送任务"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="归属部门">
            <a-select
              v-model="formData.department"
              placeholder="请选择归属部门"
              style="width: 100%"
            >
              <a-option value="marketing">市场营销部</a-option>
              <a-option value="customer">客户服务部</a-option>
              <a-option value="product">产品部</a-option>
              <a-option value="risk">风险管理部</a-option>
              <a-option value="operation">运营部</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="短信发送时间" required>
            <a-date-picker
              v-model="formData.sendTime"
              placeholder="选择发送日期"
              style="width: 60%"
              format="YYYY-MM-DD"
            />
            <a-time-picker
              v-model="formData.sendHour"
              placeholder="选择发送时间"
              style="width: 38%; margin-left: 2%"
              format="HH"
              :hide-minute-button="true"
              :hide-second-button="true"
            />
            <div class="field-hint">格式：YYYYmmdd HH</div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <!-- 接收人配置 -->
    <a-card class="recipient-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <IconUser />
          接收人配置
        </div>
      </template>
      
      <a-form :model="formData" layout="vertical">
        <a-form-item label="输入方式" required>
          <a-radio-group v-model="formData.inputType" type="button">
            <a-radio value="manual">手动输入</a-radio>
            <a-radio value="upload">批量上传</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <!-- 字段映射配置 -->
        <div v-if="formData.inputType === 'upload'" class="field-mapping">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="客户标识字段">
                <a-select
                  v-model="formData.customerIdField"
                  placeholder="请选择客户标识字段"
                  style="width: 100%"
                >
                  <a-option value="customer_id">客户ID</a-option>
                  <a-option value="user_id">用户ID</a-option>
                  <a-option value="member_id">会员ID</a-option>
                  <a-option value="account_id">账户ID</a-option>
                </a-select>
                <div class="field-hint">对应底表中的关联字段</div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="手机号字段">
                <a-select
                  v-model="formData.phoneField"
                  placeholder="请选择手机号字段"
                  style="width: 100%"
                >
                  <a-option value="phone">手机号</a-option>
                  <a-option value="mobile">移动电话</a-option>
                  <a-option value="contact_phone">联系电话</a-option>
                  <a-option value="tel">电话号码</a-option>
                </a-select>
                <div class="field-hint">对应底表中的手机号明文字段</div>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
        
        <!-- 手动输入区域 -->
        <div v-if="formData.inputType === 'manual'" class="manual-input-area">
          <a-textarea
            v-model="formData.manualNumbers"
            placeholder="请输入手机号码，多个号码用换行分隔"
            :auto-size="{ minRows: 4, maxRows: 8 }"
          />
          <div class="input-tips">
            <IconInfoCircle />
            <span class="tip-text">每行一个手机号码，最多支持1000个号码</span>
          </div>
        </div>

        <!-- 批量上传区域 -->
        <div v-if="formData.inputType === 'upload'" class="upload-area">
          <a-upload
            :custom-request="handleUpload"
            :show-file-list="false"
            accept=".xlsx,.xls,.csv"
          >
            <template #upload-button>
              <div class="upload-button">
                <IconUpload />
                <div class="upload-text">点击上传文件</div>
                <div class="upload-hint">支持 Excel、CSV 格式，最大10MB</div>
              </div>
            </template>
          </a-upload>
          <div class="upload-tips">
            <a-button type="text" size="small">
              <template #icon><IconDownload /></template>
              下载模板文件
            </a-button>
          </div>
        </div>
      </a-form>
    </a-card>

    <!-- 短信模板选择 -->
    <a-card class="template-select-card" :bordered="false">
      <template #title>
         <div class="card-title">
           <IconFile />
           短信模板
         </div>
       </template>
      
      <a-form :model="formData" layout="vertical">
        <a-form-item label="模板选择" required>
          <a-radio-group v-model="formData.templateMode" type="button">
            <a-radio value="select">选择已有模板</a-radio>
            <a-radio value="create">新建模板</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 选择已有模板 -->
        <div v-if="formData.templateMode === 'select'">
          <a-form-item label="选择模板">
            <a-select
              v-model="formData.templateId"
              placeholder="请选择短信模板"
              :options="templates.map(t => ({ label: t.name, value: t.id }))"
              style="max-width: 400px;"
            />
          </a-form-item>
        </div>

        <!-- 新建模板基本信息 -->
        <div v-if="formData.templateMode === 'create'">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="模板名称">
                <a-input 
                  v-model="formData.newTemplate.name" 
                  placeholder="请输入模板名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="短信类型">
                <a-select
                  v-model="formData.newTemplate.type"
                  placeholder="请选择短信类型"
                  :options="smsTypes"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </a-card>

    <!-- 模板内容编辑 -->
    <a-card v-if="formData.templateMode === 'create'" class="template-edit-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <IconEdit />
          模板内容编辑
        </div>
      </template>
      
      <!-- 可用参数 - 放在上方 -->
      <div class="params-section">
        <div class="params-header">
          <span class="params-label">可用参数</span>
          <span class="params-hint">点击参数插入到模板中</span>
        </div>
        
        <a-tabs default-active-key="risk" size="small" class="params-tabs">
          <a-tab-pane key="risk" title="风险合规">
            <div class="params-grid">
              <a-tag
                v-for="param in riskParams"
                :key="param.key"
                class="param-tag"
                @click="insertParam(param.key)"
              >
                {{ param.label }}
              </a-tag>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="target" title="目标表">
            <div class="params-grid">
              <a-tag
                v-for="param in targetParams"
                :key="param.key"
                class="param-tag"
                @click="insertParam(param.key)"
              >
                {{ param.label }}
              </a-tag>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="standard" title="标准参数">
            <div class="params-grid">
              <a-tag
                v-for="param in standardParams"
                :key="param.key"
                class="param-tag"
                @click="insertParam(param.key)"
              >
                {{ param.label }}
              </a-tag>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 模板内容编辑 - 放在下方 -->
      <div class="template-editor">
        <div class="editor-header">
          <span class="editor-label">模板内容</span>
          <span class="char-counter">{{ formData.newTemplate.content.length }}/500</span>
        </div>
        <a-textarea
          v-model="formData.newTemplate.content"
          placeholder="请输入模板内容，可点击上方参数快速插入"
          :auto-size="{ minRows: 6, maxRows: 10 }"
          class="template-textarea"
        />
      </div>
    </a-card>

    <!-- 模板预览 -->
    <a-card class="preview-card" :bordered="false">
      <template #title>
        <div class="card-title">
          <IconEye />
          模板预览
        </div>
      </template>
      
      <div class="preview-section">
        <div class="preview-content">
          <h4>预览内容</h4>
          <div class="preview-text">{{ previewContent }}</div>
          <div class="char-count">字符数：{{ previewContent.length }}/70</div>
        </div>
      </div>
    </a-card>
    
    <!-- 底部操作区域 - 固定在底部 -->
    <div class="bottom-action-bar">
      <a-space>
        <a-button type="primary" @click="showTestModal">
          <template #icon><IconExperiment /></template>
          测试发送
        </a-button>
        <a-button type="primary" status="success" @click="handleSubmit">
          <template #icon><IconSend /></template>
          确认下发
        </a-button>
      </a-space>
    </div>
    
    <!-- 测试发送弹窗 -->
    <a-modal 
      v-model:visible="testModalVisible" 
      title="测试发送" 
      width="800px"
      :footer="false"
      @cancel="closeTestModal"
    >
      <div class="test-modal-content">
        <!-- 测试手机号输入 -->
        <div class="test-phone-section">
          <a-form-item label="测试手机号" required>
            <a-input 
              v-model="testPhone" 
              placeholder="请输入测试手机号"
              :max-length="11"
            />
          </a-form-item>
        </div>
        
        <!-- 参数记录选择 -->
        <div class="param-records-section">
          <h4>选择参数记录</h4>
          <a-table 
            :columns="paramRecordColumns"
            :data="paramRecords"
            :pagination="false"
            row-key="id"
            @row-click="selectParamRecord"
            :row-selection="{ 
              type: 'radio', 
              selectedRowKeys: selectedRecordId ? [selectedRecordId] : [],
              onSelect: (rowKeys: number[], rowKey: any) => selectParamRecord(rowKey)
            }"
          >
          </a-table>
        </div>
        
        <!-- 刷新后的模板内容 -->
        <div class="refreshed-template-section" v-if="selectedRecord">
          <h4>模板内容（已填充参数）</h4>
          <div class="template-preview">{{ refreshedTemplate }}</div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="test-modal-actions">
          <a-button @click="closeTestModal">返回</a-button>
          <a-button 
            type="primary" 
            @click="sendTest"
            :disabled="!testPhone || !selectedRecord"
          >
            发送
          </a-button>
        </div>
      </div>
    </a-modal>
    
    <!-- 测试完成弹窗 -->
    <a-modal 
      v-model:visible="testCompleteModalVisible" 
      title="测试发送完成" 
      width="400px"
      :footer="false"
    >
      <div class="test-complete-content">
        <div class="success-message">
          <IconCheckCircle style="color: #00b42a; font-size: 48px;" />
          <p>测试短信发送成功！</p>
          <p>请检查手机 {{ testPhone }} 是否收到短信</p>
        </div>
        
        <div class="complete-actions">
          <a-button @click="backToEdit">返回</a-button>
          <a-button type="primary" @click="testComplete">测试完成</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconUpload, 
  IconDownload, 
  IconExperiment, 
  IconSend,
  IconFile,
  IconInfoCircle,
  IconEdit,
  IconEye,
  IconUser,
  IconCheckCircle,
  IconLeft
} from '@arco-design/web-vue/es/icon'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  batchName: '',
  department: '',
  sendTime: null, // 发送日期
  sendHour: null, // 发送小时
  inputType: 'manual', // manual | upload
  manualNumbers: '',
  customerIdField: '',
  phoneField: '',
  templateMode: 'select', // select | create
  templateId: '',
  newTemplate: {
    name: '',
    type: '',
    content: ''
  }
})

// 测试发送相关状态
const testModalVisible = ref(false)
const testCompleteModalVisible = ref(false)
const testPhone = ref('')
const selectedRecordId = ref(null)
const selectedRecord = ref(null)
const testCompleted = ref(false)

// 模拟模板数据
const templates = ref([
  { id: '1', name: '会员生日祝福', content: '尊敬的${customerName}，祝您生日快乐！感谢您一直以来对我们的支持。' },
  { id: '2', name: '活动邀请', content: '尊敬的会员，我们将于${currentDate}举办${activity}活动，诚邀您的参与。' },
])

// 参数记录数据（模拟5条记录）
const paramRecords = ref([
  { 
    id: 1, 
    customerName: '张三', 
    activityTime: '2024-01-15至2024-01-31', 
    contactPhone: '400-123-4567',
    balance: '1,250.00',
    age: '28'
  },
  { 
    id: 2, 
    customerName: '李四', 
    activityTime: '2024-01-20至2024-02-05', 
    contactPhone: '400-123-4567',
    balance: '3,680.50',
    age: '35'
  },
  { 
    id: 3, 
    customerName: '王五', 
    activityTime: '2024-01-25至2024-02-10', 
    contactPhone: '400-123-4567',
    balance: '856.20',
    age: '42'
  },
  { 
    id: 4, 
    customerName: '赵六', 
    activityTime: '2024-02-01至2024-02-15', 
    contactPhone: '400-123-4567',
    balance: '2,145.80',
    age: '31'
  },
  { 
    id: 5, 
    customerName: '钱七', 
    activityTime: '2024-02-05至2024-02-20', 
    contactPhone: '400-123-4567',
    balance: '4,520.30',
    age: '29'
  }
])

// 参数记录表格列配置
const paramRecordColumns = [
  { title: '客户姓名', dataIndex: 'customerName', width: 100 },
  { title: '活动时间', dataIndex: 'activityTime', width: 180 },
  { title: '联系电话', dataIndex: 'contactPhone', width: 120 },
  { title: '账户余额', dataIndex: 'balance', width: 100 },
  { title: '年龄', dataIndex: 'age', width: 80 }
]

// 风险合规底表预设参数
const riskParams = ref([
  { key: 'customerName', label: '客户姓名' },
  { key: 'idNumber', label: '身份证号' },
  { key: 'riskLevel', label: '风险等级' },
  { key: 'riskScore', label: '风险评分' },
  { key: 'warningTime', label: '预警时间' },
  { key: 'warningType', label: '预警类型' },
  { key: 'accountStatus', label: '账户状态' },
])

// 目标表参数
const targetParams = ref([
  { key: 'customerName', label: '客户姓名' },
  { key: 'idNumber', label: '身份证号' },
  { key: 'accountNo', label: '账号' },
  { key: 'balance', label: '余额' },
  { key: 'riskLevel', label: '风险等级' },
])

// 统一标准参数
const standardParams = ref([
  { key: 'bankName', label: '银行名称' },
  { key: 'branchName', label: '支行名称' },
  { key: 'servicePhone', label: '服务电话' },
  { key: 'currentDate', label: '当前日期' },
])

// 短信类型选项
const smsTypes = [
  { value: 'notice', label: '通知短信' },
  { value: 'marketing', label: '营销短信' },
  { value: 'verification', label: '验证码' }
]

// 插入参数到模板内容
const insertParam = (key: string) => {
  const textarea = document.querySelector('.template-textarea') as HTMLTextAreaElement
  if (textarea) {
    const cursorPos = textarea.selectionStart
    const content = formData.newTemplate.content
    const newContent = content.slice(0, cursorPos) + '${' + key + '}' + content.slice(cursorPos)
    formData.newTemplate.content = newContent
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(cursorPos + key.length + 3, cursorPos + key.length + 3)
    }, 0)
  }
}

// 获取当前模板内容
const selectedTemplate = computed(() => {
  if (formData.templateMode === 'select') {
    return templates.value.find(t => t.id === formData.templateId)
  } else {
    return formData.newTemplate
  }
})

// 预览内容
const previewContent = computed(() => {
  if (!selectedTemplate.value) return ''
  return selectedTemplate.value.content
})

// 刷新后的模板内容
const refreshedTemplate = computed(() => {
  if (!selectedTemplate.value || !selectedRecord.value) return ''
  
  let content = selectedTemplate.value.content
  // 替换模板中的参数
  if (selectedRecord.value) {
    Object.keys(selectedRecord.value).forEach(key => {
      if (key !== 'id') {
        const regex = new RegExp(`\$\{${key}\}`, 'g')
        content = content.replace(regex, selectedRecord.value![key])
      }
    })
  }
  
  return content
})

// 处理文件上传
const handleUpload = async (options: any) => {
  try {
    // 这里实现文件上传逻辑
    Message.success('文件上传成功')
  } catch (error) {
    Message.error('文件上传失败')
  }
}

// 显示测试发送弹窗
const showTestModal = () => {
  testModalVisible.value = true
  testPhone.value = ''
  selectedRecordId.value = null
  selectedRecord.value = null
}

// 关闭测试发送弹窗
const closeTestModal = () => {
  testModalVisible.value = false
}

// 选择参数记录
const selectParamRecord = (record: any) => {
  selectedRecordId.value = record.id
  selectedRecord.value = record
}

// 发送测试短信
const sendTest = () => {
  if (!testPhone.value || !selectedRecord.value) return
  
  // 这里实现测试发送逻辑
  setTimeout(() => {
    testModalVisible.value = false
    testCompleteModalVisible.value = true
  }, 1000)
}

// 返回编辑
const backToEdit = () => {
  testCompleteModalVisible.value = false
}

// 测试完成
const testComplete = () => {
  testCompleteModalVisible.value = false
  testCompleted.value = true
  Message.success('测试完成，可以进行下一步操作')
}

// 测试发送
const handleTest = async () => {
  try {
    // 这里实现测试发送逻辑
    Message.success('测试发送成功')
  } catch (error) {
    Message.error('测试发送失败')
  }
}

// 确认下发
const handleSubmit = async () => {
  try {
    // 验证必填字段
    if (!formData.batchName) {
      Message.error('请输入短信批次名称')
      return
    }
    if (!formData.sendTime || !formData.sendHour) {
      Message.error('请选择短信发送时间')
      return
    }
    
    // 格式化发送时间为YYYYmmdd HH格式
    const sendDate = formData.sendTime ? new Date(formData.sendTime) : null
    const sendHour = formData.sendHour ? new Date(formData.sendHour) : null
    
    let formattedSendTime = ''
    if (sendDate && sendHour) {
      const year = sendDate.getFullYear()
      const month = String(sendDate.getMonth() + 1).padStart(2, '0')
      const day = String(sendDate.getDate()).padStart(2, '0')
      const hour = String(sendHour.getHours()).padStart(2, '0')
      
      formattedSendTime = `${year}${month}${day} ${hour}`
      console.log('短信发送时间:', formattedSendTime) // 格式: YYYYmmdd HH
    }
    
    // 这里实现确认下发逻辑，包含发送时间
    Message.success('短信下发成功，将在指定时间发送')
  } catch (error) {
    Message.error('短信下发失败')
  }
}

// 返回列表页
const backToList = () => {
  router.push({ name: 'ManualSMSList' })
}
</script>

<style scoped>
.field-mapping {
  margin-top: 16px;
  padding: 16px;
  background-color: var(--color-fill-2);
  border-radius: 4px;
}

.field-hint {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}
.manual-sms-container {
  padding: 24px;
  background-color: var(--color-fill-2);
  min-height: 100vh;
}

.header-card,
.batch-card,
.recipient-card,
.template-select-card,
.template-edit-card,
.preview-action-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-actions {
  position: absolute;
  top: 16px;
  right: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--color-text-1);
}

.manual-input-area,
.upload-area {
  margin-top: 12px;
}

.input-tips,
.upload-tips {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-3);
}

.upload-button {
  padding: 24px;
  text-align: center;
  background-color: var(--color-fill-1);
  border: 2px dashed var(--color-border-2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.upload-button:hover {
  border-color: rgb(var(--primary-6));
  background-color: var(--color-fill-3);
}

.upload-text {
  font-size: 14px;
  color: var(--color-text-2);
}

.upload-hint {
  font-size: 12px;
  color: var(--color-text-3);
}

/* 模板编辑区域样式 */
.template-editor {
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.editor-label {
  font-weight: 500;
  color: var(--color-text-1);
}

.char-counter {
  font-size: 12px;
  color: var(--color-text-3);
}

.template-textarea {
  border-radius: 6px;
}

/* 参数区域样式 */
.params-section {
  height: 100%;
}

.params-header {
  margin-bottom: 16px;
}

.params-label {
  font-weight: 500;
  color: var(--color-text-1);
  display: block;
  margin-bottom: 4px;
}

.params-hint {
  font-size: 12px;
  color: var(--color-text-3);
}

.params-tabs {
  height: calc(100% - 60px);
}

.params-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

/* 预览区域样式 */
.preview-section {
  height: 100%;
}

.preview-header {
  margin-bottom: 12px;
}

.preview-label {
  font-weight: 500;
  color: var(--color-text-1);
}

.preview-content {
  min-height: 120px;
  padding: 16px;
  background-color: var(--color-fill-1);
  border-radius: 6px;
  border: 1px solid var(--color-border-2);
}

.preview-message {
  font-size: 14px;
  color: var(--color-text-1);
  line-height: 1.6;
  word-break: break-word;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  height: 100%;
  min-height: 120px;
}

.placeholder-icon {
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.5;
}

/* 统计区域样式 */
.stats-section {
  margin-top: 16px;
}

/* 操作区域样式 */
.bottom-action-bar {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.param-tag {
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.param-tag:hover {
  background-color: rgb(var(--primary-6));
  color: #fff;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .content-section {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-description {
    font-size: 14px;
  }
  
  .form-card,
  .preview-card,
  .params-card,
  .stats-card {
    padding: 16px;
  }
}
</style>
