<template>
  <div class="manual-sms-container">
    <a-spin :loading="loading" class="spin-container" tip="加载中...">
      <!-- 页面标题区域 -->
      <div class="header-section">
        <div class="title-area">
          <h2 class="page-title">短信手工下发</h2>
          <p class="page-description">支持手动输入或批量上传名单，选择短信模板进行下发</p>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-section">
        <a-row :gutter="[24, 24]">
          <a-col :span="24" :lg="16">
            <!-- 表单卡片 -->
            <a-card class="form-card" :bordered="false">
              <a-form :model="formData" layout="vertical">
                <!-- 接收人信息区域 -->
                <a-form-item label="接收人信息" required>
                  <a-space direction="vertical" :size="16" fill>
                    <a-radio-group v-model="formData.inputType" type="button">
                      <a-radio value="manual">手动输入</a-radio>
                      <a-radio value="upload">批量上传</a-radio>
                    </a-radio-group>

                    <!-- 手动输入区域 -->
                    <div v-if="formData.inputType === 'manual'" class="manual-input-area">
                      <a-textarea
                        v-model="formData.manualNumbers"
                        placeholder="请输入手机号码，多个号码请用换行分隔"
                        :auto-size="{ minRows: 4, maxRows: 8 }"
                      />
                      <div class="input-tips">
                        <a-tag color="blue">提示</a-tag>
                        <span>每行一个手机号，最多支持100个号码</span>
                      </div>
                    </div>

                    <!-- 文件上传区域 -->
                    <div v-else class="upload-area">
                      <a-upload
                        :custom-request="handleUpload"
                        :show-file-list="true"
                        :limit="1"
                        accept=".xlsx,.xls,.csv"
                      >
                        <template #upload-button>
                          <div class="upload-button">
                            <icon-upload />
                            <div class="upload-text">点击或拖拽文件到此处上传</div>
                            <div class="upload-hint">支持 .xlsx、.xls、.csv 格式文件</div>
                          </div>
                        </template>
                      </a-upload>
                      <div class="upload-tips">
                        <a-space>
                          <a-button type="text" size="small">
                            <template #icon><icon-download /></template>
                            下载模板
                          </a-button>
                          <a-divider direction="vertical" />
                          <span class="tip-text">文件中必须包含手机号码列</span>
                        </a-space>
                      </div>
                    </div>
                  </a-space>
                </a-form-item>

                <!-- 短信模板选择 -->
                <a-form-item label="短信模板" required>
                  <a-space direction="vertical" :size="12" fill>
                    <a-radio-group v-model="formData.templateMode" type="button">
                      <a-radio value="select">选择已有模板</a-radio>
                      <a-radio value="create">新建模板</a-radio>
                    </a-radio-group>

                    <!-- 选择已有模板 -->
                    <a-select
                      v-if="formData.templateMode === 'select'"
                      v-model="formData.templateId"
                      placeholder="请选择短信模板"
                      allow-search
                    >
                      <a-option v-for="template in templates" :key="template.id" :value="template.id">
                        {{ template.name }}
                      </a-option>
                    </a-select>

                    <!-- 新建模板表单 -->
                    <div v-else class="create-template-form">
                      <a-input v-model="formData.newTemplate.name" placeholder="请输入模板名称" />
                      <div class="template-content-area">
                        <a-textarea
                          v-model="formData.newTemplate.content"
                          placeholder="请输入模板内容"
                          :auto-size="{ minRows: 3, maxRows: 6 }"
                        />
                        <div class="template-counter">{{ formData.newTemplate.content.length }}/500</div>
                      </div>
                    </div>
                  </a-space>
                </a-form-item>

                <!-- 操作按钮 -->
                <a-form-item>
                  <a-space>
                    <a-button type="primary" @click="handleTest">
                      <template #icon><icon-experiment /></template>
                      测试发送
                    </a-button>
                    <a-button type="primary" status="success" @click="handleSubmit">
                      <template #icon><icon-send /></template>
                      确认下发
                    </a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </a-card>
          </a-col>

          <a-col :span="24" :lg="8">
            <a-row :gutter="[0, 24]">
              <!-- 模板预览卡片 -->
              <a-col :span="24">
                <a-card class="preview-card" title="模板预览" :bordered="false">
                  <div class="preview-content">
                    <div v-if="selectedTemplate?.content" class="preview-message">
                      {{ selectedTemplate?.content }}
                    </div>
                    <div v-else class="preview-placeholder">
                      <icon-file class="placeholder-icon" />
                      <p>请先选择或创建短信模板</p>
                    </div>
                  </div>
                </a-card>
              </a-col>

              <!-- 参数选择卡片 -->
              <a-col :span="24" v-if="formData.templateMode === 'create'">
                <a-card class="params-card" title="可用参数" :bordered="false">
                  <div class="params-list">
                    <a-tag
                      v-for="param in riskParams"
                      :key="param.key"
                      class="param-tag"
                      @click="insertParam(param.key)"
                    >
                      {{ param.label }}
                    </a-tag>
                  </div>
                  <div class="params-hint">点击参数插入到模板内容中</div>
                </a-card>
              </a-col>

              <!-- 发送统计卡片 -->
              <a-col :span="24">
                <a-card class="stats-card" title="发送统计" :bordered="false">
                  <a-row :gutter="[16, 16]">
                    <a-col :span="12">
                      <a-statistic title="今日已发送" :value="128" />
                    </a-col>
                    <a-col :span="12">
                      <a-statistic title="本月已发送" :value="1024" />
                    </a-col>
                  </a-row>
                </a-card>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </div>
    </a-spin>
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
  IconFile
} from '@arco-design/web-vue/es/icon';

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  inputType: 'manual',
  manualNumbers: '',
  templateMode: 'select',
  templateId: '',
  newTemplate: {
    name: '',
    content: ''
  }
})

// 模拟模板数据
const templates = ref([
  { id: '1', name: '会员生日祝福', content: '尊敬的${name}，祝您生日快乐！感谢您一直以来对我们的支持。' },
  { id: '2', name: '活动邀请', content: '尊敬的会员，我们将于${date}举办${activity}活动，诚邀您的参与。' },
])

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

// 插入参数到模板内容
const insertParam = (key: string) => {
  const textarea = document.querySelector('.create-template-form textarea') as HTMLTextAreaElement
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

// 处理文件上传
const handleUpload = async (options: any) => {
  try {
    // 这里实现文件上传逻辑
    Message.success('文件上传成功')
  } catch (error) {
    Message.error('文件上传失败')
  }
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
    // 这里实现确认下发逻辑
    Message.success('短信下发成功')
  } catch (error) {
    Message.error('短信下发失败')
  }
}

// 短信类型选项
const smsTypes = [
  { value: 'notice', label: '通知短信' },
  { value: 'marketing', label: '营销短信' },
  { value: 'verification', label: '验证码' }
]

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


</script>

<style scoped>
.manual-sms-container {
  min-height: 100vh;
  padding: 24px;
  background-color: var(--color-fill-2);
  display: flex;
  flex-direction: column;
}

.header-section {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, rgb(var(--primary-1)), rgb(var(--primary-2)));
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(var(--primary-1), 0.1);
}

.title-area {
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.content-section {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}

.form-card {
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.manual-input-area,
.upload-area {
  margin-top: 16px;
}

.input-tips,
.upload-tips {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-text {
  font-size: 13px;
  color: var(--color-text-3);
}

.upload-button {
  padding: 32px;
  text-align: center;
  background-color: var(--color-fill-1);
  border: 2px dashed var(--color-border-2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-button:hover {
  border-color: rgb(var(--primary-6));
  background-color: var(--color-fill-3);
}

.upload-text {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-text-2);
}

.upload-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-3);
}

.preview-card,
.params-card,
.stats-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.preview-content {
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-message {
  padding: 16px;
  font-size: 14px;
  color: var(--color-text-1);
  background-color: var(--color-fill-2);
  border-radius: 8px;
  width: 100%;
  word-break: break-word;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  height: 150px;
}

.placeholder-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.template-content-area {
  margin-top: 12px;
  position: relative;
}

.template-counter {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 12px;
  color: var(--color-text-3);
}

.params-card :deep(.arco-tabs-nav-tab) {
  margin-bottom: 16px;
}

.params-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.param-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.param-tag:hover {
  background-color: rgb(var(--primary-6));
  color: #fff;
}

.params-hint {
  font-size: 12px;
  color: var(--color-text-3);
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
