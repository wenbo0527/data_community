<template>
  <div class="domain-edit">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="handleBack">
          <template #icon>
            <icon-arrow-left />
          </template>
          返回
        </a-button>
        <h2 class="page-title">{{ isEdit ? '编辑数据域' : '新建数据域' }}</h2>
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
            <a-col :span="12">
              <a-form-item label="域名称" field="name" required>
                <a-input
                  v-model="formData.name"
                  placeholder="请输入域名称（如：金额_18_2）"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="域编号" field="code" required>
                <a-input
                  v-model="formData.code"
                  placeholder="请输入域编号（如：AMT_18_2）"
                  :disabled="isEdit"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="业务数据类型" field="businessDataType" required>
                <a-select v-model="formData.businessDataType" placeholder="请选择业务数据类型">
                  <a-option>标识符</a-option>
                  <a-option>金额</a-option>
                  <a-option>日期</a-option>
                  <a-option>代码</a-option>
                  <a-option>描述</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="逻辑数据类型" field="logicalDataType" required>
                <a-select v-model="formData.logicalDataType" placeholder="请选择逻辑数据类型">
                  <a-option>VARCHAR</a-option>
                  <a-option>CHAR</a-option>
                  <a-option>DECIMAL</a-option>
                  <a-option>INTEGER</a-option>
                  <a-option>DATE</a-option>
                  <a-option>TIMESTAMP</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="长度" field="length" required>
                <a-input-number v-model="formData.length" placeholder="请输入长度" :min="0" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="精度" field="precision">
                <a-input-number v-model="formData.precision" placeholder="请输入精度" :min="0" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 代码属性 -->
        <a-card title="代码属性" class="form-section" style="margin-top: 16px;">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="是否代码" field="isCode">
                <a-switch v-model="formData.isCode">
                  <template #checked>是</template>
                  <template #unchecked>否</template>
                </a-switch>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="formData.isCode">
              <a-form-item label="关联标准代码" field="standardCodeNo" required>
                <a-select v-model="formData.standardCodeNo" placeholder="请选择关联标准代码">
                  <a-option>STD_GENDER</a-option>
                  <a-option>STD_COUNTRY</a-option>
                  <a-option>STD_CURRENCY</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="描述" field="description">
            <a-textarea
              v-model="formData.description"
              placeholder="请输入数据域描述"
              :auto-size="{ minRows: 3, maxRows: 5 }"
            />
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

const formData = reactive({
  name: '',
  code: '',
  businessDataType: '',
  logicalDataType: '',
  length: undefined,
  precision: undefined,
  isCode: false,
  standardCodeNo: '',
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入域名称' }],
  code: [{ required: true, message: '请输入域编号' }],
  businessDataType: [{ required: true, message: '请选择业务数据类型' }],
  logicalDataType: [{ required: true, message: '请选择逻辑数据类型' }],
  length: [{ required: true, message: '请输入长度' }],
  standardCodeNo: [{ required: true, message: '请选择关联标准代码' }]
}

const handleBack = () => {
  router.back()
}

const handleCancel = () => {
  router.back()
}

const handleSave = async () => {
  const errors = await formRef.value?.validate()
  if (!errors) {
    saving.value = true
    // 模拟API调用
    setTimeout(() => {
      saving.value = false
      Message.success(isEdit.value ? '更新成功' : '创建成功')
      router.push('/management/data-standard/domains')
    }, 1000)
  }
}

const fetchDetail = () => {
  if (isEdit.value) {
    formData.name = '金额_18_2'
    formData.code = 'AMT_18_2'
    formData.businessDataType = '金额'
    formData.logicalDataType = 'DECIMAL'
    formData.length = 18
    formData.precision = 2
    formData.isCode = false
    formData.description = '标准金额格式，保留2位小数'
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchDetail()
  }
})
</script>

<style scoped>
.domain-edit {
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
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 16px;
}
</style>
