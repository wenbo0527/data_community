<template>
  <div class="standard-edit">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="handleBack">
          <template #icon>
            <IconArrowLeft />
          </template>
          返回
        </a-button>
        <h2 class="page-title">{{ isEdit ? '编辑数据标准' : '新建数据标准' }}</h2>
      </div>
      <div class="header-right">
        <a-space>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button type="primary" @click="handleSave" :loading="saving">
            {{ isEdit ? '更新' : '提交' }}
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        @submit="handleSave"
      >
        <!-- 基础信息 -->
        <a-card title="基础信息" class="form-section">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="标准编号" field="standardNo" required>
                <a-input
                  v-model="formData.standardNo"
                  placeholder="请输入标准编号"
                  :disabled="isEdit"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="中文名称" field="chineseName" required>
                <a-input
                  v-model="formData.chineseName"
                  placeholder="请输入中文名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="英文简称" field="englishAbbr" required>
                <a-input
                  v-model="formData.englishAbbr"
                  placeholder="请输入英文简称"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="归属主题" field="subject" required>
                <a-select v-model="formData.subject" placeholder="请选择归属主题">
                  <a-option>客户主题</a-option>
                  <a-option>账户主题</a-option>
                  <a-option>产品主题</a-option>
                  <a-option>公共主题</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="所属域" field="domain" required>
                <a-select v-model="formData.domain" placeholder="请选择所属域" @change="handleDomainChange">
                  <a-option v-for="item in domainOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="归口部门" field="department" required>
                <a-select v-model="formData.department" placeholder="请选择归口部门">
                  <a-option>数据管理部</a-option>
                  <a-option>财务部</a-option>
                  <a-option>风险管理部</a-option>
                  <a-option>信息技术部</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 数据属性 -->
        <a-card title="数据属性" class="form-section" style="margin-top: 16px;">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="数据类型" field="dataType" required>
                <a-select v-model="formData.dataType" placeholder="请选择数据类型">
                  <a-option>String</a-option>
                  <a-option>Number</a-option>
                  <a-option>Date</a-option>
                  <a-option>Boolean</a-option>
                  <a-option>Decimal</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="数据长度" field="length">
                <a-input-number v-model="formData.length" placeholder="请输入长度" :min="0" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="数据精度" field="precision">
                <a-input-number v-model="formData.precision" placeholder="请输入精度" :min="0" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="默认值" field="defaultValue">
                <a-input v-model="formData.defaultValue" placeholder="请输入默认值" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="取值范围" field="valueRange">
                <a-input v-model="formData.valueRange" placeholder="请输入取值范围" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="格式要求" field="format">
                <a-input v-model="formData.format" placeholder="例如：YYYY-MM-DD" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 业务属性 -->
        <a-card title="业务属性" class="form-section" style="margin-top: 16px;">
          <a-form-item label="业务定义" field="businessDefinition" required>
            <a-textarea
              v-model="formData.businessDefinition"
              placeholder="请输入业务定义"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-form-item label="业务规则" field="businessRules">
            <a-textarea
              v-model="formData.businessRules"
              placeholder="请输入业务规则"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
          <a-form-item label="来源依据" field="source">
            <a-input v-model="formData.source" placeholder="请输入来源依据" />
          </a-form-item>
        </a-card>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconArrowLeft } from '@arco-design/web-vue/es/icon'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const saving = ref(false)

const isEdit = computed(() => !!route.params.id)

const domainOptions = [
  { label: '标识符 (ID_20)', value: 'ID_20', dataType: 'VARCHAR', length: 20, precision: 0 },
  { label: '金额 (AMT_18_2)', value: 'AMT_18_2', dataType: 'DECIMAL', length: 18, precision: 2 },
  { label: '性别代码 (CODE_GENDER)', value: 'CODE_GENDER', dataType: 'CHAR', length: 1, precision: 0 }
]

const formData = reactive({
  standardNo: '',
  chineseName: '',
  englishAbbr: '',
  subject: '',
  domain: '',
  department: '',
  dataType: '',
  length: undefined,
  precision: undefined,
  defaultValue: '',
  valueRange: '',
  format: '',
  businessDefinition: '',
  businessRules: '',
  source: ''
})

const formRules = {
  standardNo: [{ required: true, message: '请输入标准编号' }],
  chineseName: [{ required: true, message: '请输入中文名称' }],
  englishAbbr: [{ required: true, message: '请输入英文简称' }],
  subject: [{ required: true, message: '请选择归属主题' }],
  domain: [{ required: true, message: '请选择所属域' }],
  department: [{ required: true, message: '请选择归口部门' }],
  dataType: [{ required: true, message: '请选择数据类型' }],
  businessDefinition: [{ required: true, message: '请输入业务定义' }]
}

const handleBack = () => {
  router.back()
}

const handleCancel = () => {
  router.back()
}

const handleDomainChange = (value: string) => {
  const domain = domainOptions.find(item => item.value === value)
  if (domain) {
    formData.dataType = domain.dataType
    formData.length = domain.length as any
    formData.precision = domain.precision as any
    Message.success(`已根据数据域 [${value}] 自动填充数据属性`)
  }
}

const handleSave = async () => {
  const errors = await formRef.value?.validate()
  if (!errors) {
    saving.value = true
    // 模拟API调用
    setTimeout(() => {
      saving.value = false
      Message.success(isEdit.value ? '更新成功' : '创建成功')
      router.push('/management/data-standard/standards')
    }, 1000)
  }
}

const fetchDetail = () => {
  // 模拟获取详情
  if (isEdit.value) {
    formData.standardNo = 'STD-USER-001'
    formData.chineseName = '用户注册手机号'
    formData.englishAbbr = 'user_mobile'
    formData.subject = '客户主题'
    formData.domain = '客户域'
    formData.department = '用户运营部'
    formData.dataType = 'String'
    formData.length = 11
    formData.businessDefinition = '用户注册时使用的手机号码。'
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchDetail()
  }
})
</script>

<style scoped>
.standard-edit {
  padding: 20px;
  background-color: var(--color-bg-2);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-1);
}

.form-content {
  max-width: 1000px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 16px;
}
</style>
