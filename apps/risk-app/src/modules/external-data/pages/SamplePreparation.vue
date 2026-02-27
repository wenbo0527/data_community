<template>
  <div class="sample-preparation-container">
    <a-page-header title="样本表准备" subtitle="上传并校验您的数据样本" />
    
    <a-card class="preparation-card">
      <a-steps :current="currentStep" style="margin-bottom: 40px">
        <a-step title="选择服务类型" description="确定数据用途" />
        <a-step title="下载模板" description="获取标准格式" />
        <a-step title="上传样本" description="提交数据文件" />
        <a-step title="预校验" description="检查数据规范" />
      </a-steps>
      
      <!-- 步骤1: 选择服务类型 -->
      <div v-if="currentStep === 0" class="step-content">
        <a-form :model="form" layout="vertical">
          <a-form-item label="目标服务类型" required>
            <a-select v-model="form.serviceType" placeholder="请选择服务类型" style="width: 400px">
              <a-option>在线批量调用</a-option>
              <a-option>外数离线回溯申请</a-option>
              <a-option>全量变量回溯申请</a-option>
              <a-option>风险合规离线回溯申请</a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="nextStep" :disabled="!form.serviceType">下一步</a-button>
          </a-form-item>
        </a-form>
      </div>
      
      <!-- 步骤2: 下载模板 -->
      <div v-if="currentStep === 1" class="step-content">
        <a-result status="info" title="下载样本模板">
          <template #subtitle>
            请下载【{{ form.serviceType }}】的标准样本模板，并按照格式要求填充数据。
          </template>
          <template #extra>
            <a-space>
              <a-button @click="prevStep">上一步</a-button>
              <a-button type="primary" @click="downloadTemplate">
                <template #icon><icon-download /></template> 下载模板
              </a-button>
              <a-button type="outline" @click="nextStep">已准备好样本，下一步</a-button>
            </a-space>
          </template>
        </a-result>
      </div>
      
      <!-- 步骤3: 上传样本 -->
      <div v-if="currentStep === 2" class="step-content">
        <a-upload draggable action="/" :auto-upload="false" @change="handleFileChange" style="margin-bottom: 20px" />
        <a-space>
          <a-button @click="prevStep">上一步</a-button>
          <a-button type="primary" @click="startValidation" :disabled="!fileList.length">开始校验</a-button>
        </a-space>
      </div>
      
      <!-- 步骤4: 预校验 -->
      <div v-if="currentStep === 3" class="step-content">
        <div v-if="isValidating" class="validating-state">
          <a-spin tip="正在校验样本数据..." />
          <p style="margin-top: 16px; color: var(--color-text-3)">系统正在检查文件格式、字段完整性及数据合规性...</p>
        </div>
        
        <div v-else>
          <a-result status="success" title="样本校验通过">
            <template #subtitle>
              样本数据符合【{{ form.serviceType }}】的规范要求，共解析有效数据 5,000 条。
            </template>
            <template #extra>
              <a-space>
                <a-button @click="currentStep = 0">重新准备</a-button>
                <a-button type="primary" @click="goToCreateService">前往创建服务</a-button>
              </a-space>
            </template>
          </a-result>
          
          <a-collapse :default-active-key="['1']" style="margin-top: 24px; max-width: 800px; margin-left: auto; margin-right: auto;">
            <a-collapse-item header="校验详情报告" key="1">
              <a-descriptions :column="1" bordered>
                <a-descriptions-item label="文件名称">{{ fileName }}</a-descriptions-item>
                <a-descriptions-item label="文件大小">2.4 MB</a-descriptions-item>
                <a-descriptions-item label="总行数">5,001 (含表头)</a-descriptions-item>
                <a-descriptions-item label="有效数据">5,000 条</a-descriptions-item>
                <a-descriptions-item label="字段完整性">100%</a-descriptions-item>
              </a-descriptions>
            </a-collapse-item>
          </a-collapse>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconDownload } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const currentStep = ref(0)
const form = reactive({ serviceType: '' })
const fileList = ref([])
const fileName = ref('')
const isValidating = ref(false)

const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const downloadTemplate = () => {
  Message.success(`正在下载【${form.serviceType}】样本模板...`)
}

const handleFileChange = (fileListArg: any) => {
  fileList.value = fileListArg
  if (fileListArg.length > 0) {
    fileName.value = fileListArg[0].name
  }
}

const startValidation = () => {
  currentStep.value = 3
  isValidating.value = true
  
  // 模拟校验过程
  setTimeout(() => {
    isValidating.value = false
    Message.success('样本校验完成')
  }, 2000)
}

const goToCreateService = () => {
  router.push({
    name: 'RiskExternalDataService',
    query: { action: 'create', serviceType: form.serviceType, fromSample: 'true' }
  })
}
</script>

<style scoped>
.sample-preparation-container {
  padding: 0 16px;
}

.preparation-card {
  margin-top: 20px;
  min-height: 500px;
  padding: 20px;
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.validating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
</style>