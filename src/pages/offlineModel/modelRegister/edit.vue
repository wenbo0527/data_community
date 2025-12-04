<template>
  <div class="model-edit-page">
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item to="/offline-model/model-register">模型注册</a-breadcrumb-item>
        <a-breadcrumb-item>编辑模型</a-breadcrumb-item>
      </a-breadcrumb>
      <h1 class="page-title">编辑模型</h1>
    </div>
    <div class="page-content">
      <a-collapse :default-active-key="['basic']" :bordered="false">
        <a-collapse-item key="basic" header="1. 模型基础信息">
          <a-form :model="form" :rules="rules" layout="vertical" ref="formRef">
            <a-form-item field="name" label="模型名称" required>
              <a-input v-model="form.name" placeholder="请输入模型名称" />
            </a-form-item>
            <a-form-item field="code" label="模型编码" required>
              <a-input v-model="form.code" placeholder="请输入模型编码" />
            </a-form-item>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="type" label="模型类型" required>
                  <a-select v-model="form.type" placeholder="请选择模型类型">
                    <a-option value="classification">分类模型</a-option>
                    <a-option value="regression">回归模型</a-option>
                    <a-option value="clustering">聚类模型</a-option>
                    <a-option value="deep_learning">深度学习</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="framework" label="算法框架" required>
                  <a-select v-model="form.framework" placeholder="请选择算法框架">
                    <a-option value="sklearn">Scikit-learn</a-option>
                    <a-option value="tensorflow">TensorFlow</a-option>
                    <a-option value="pytorch">PyTorch</a-option>
                    <a-option value="xgboost">XGBoost</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="version" label="版本" required>
                  <a-input v-model="form.version" placeholder="例如 1" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="parameters" label="超参数(JSON)">
                  <a-input v-model="form.parameters" placeholder='{"n_estimators":100}' />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item field="description" label="描述">
              <a-textarea v-model="form.description" placeholder="请输入模型描述" :max-length="300" show-word-limit />
            </a-form-item>
          </a-form>
        </a-collapse-item>
      </a-collapse>
    </div>
    <div class="actions-bar">
      <div class="actions-inner">
        <a-button @click="handleCancel">返回</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">保存</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { modelAPI } from '@/api/offlineModel'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const formRef = ref()
const submitting = ref(false)
const form = ref({ name: '', code: '', type: '', framework: '', version: '', description: '', parameters: '' })

const rules = {
  name: [{ required: true, message: '请输入模型名称' }],
  code: [{ required: true, message: '请输入模型编码' }],
  type: [{ required: true, message: '请选择模型类型' }],
  framework: [{ required: true, message: '请选择算法框架' }],
  version: [{ required: true, message: '请输入版本号' }]
}

onMounted(async () => {
  try {
    const res = await modelAPI.getModelDetail(id)
    const data = res.data || res
    form.value = {
      name: data?.name || '',
      code: data?.code || '',
      type: data?.type || '',
      framework: data?.framework || '',
      version: data?.version || '',
      description: data?.description || '',
      parameters: JSON.stringify(data?.hyperparameters || {})
    }
  } catch (e) {
    Message.error('加载模型数据失败')
  }
})

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    const payload = { ...form.value }
    if (payload.parameters) {
      try { payload.parameters = JSON.parse(payload.parameters) } catch { }
    }
    const res = await modelAPI.updateModel(id, payload)
    if (res.success) {
      Message.success('保存成功')
      router.push('/offline-model/model-register')
    } else {
      Message.error(res.message || '保存失败')
    }
  } catch (e) {
    if (e?.message) Message.error(e.message)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.model-edit-page { padding: 16px; background-color: #fff; }
.page-header { margin-bottom: 12px; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.page-content { max-width: 1200px; margin: 0 auto; }
.actions-bar { position: sticky; bottom: 0; background: rgba(255,255,255,0.95); border-top: 1px solid #e5e6eb; padding: 10px 0; margin-top: 12px; }
.actions-inner { display: flex; gap: 8px; justify-content: flex-end; max-width: 1200px; margin: 0 auto; padding: 0 8px; }
</style>
