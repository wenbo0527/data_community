<template>
  <div class="variable-detail-page">
    <div class="page-header">
      <a-button type="text" @click="goBack">
        <template #icon><icon-left /></template>
        返回
      </a-button>
      <h2>{{ isEditMode ? '编辑变量' : (isViewMode ? '变量详情' : '新建变量') }}</h2>
      <div v-if="!isViewMode">
        <a-button type="outline" @click="handleSaveDraft" style="margin-right: 12px">保存草稿</a-button>
        <a-button type="primary" @click="handleSubmit">{{ isEditMode ? '更新变量' : '上线' }}</a-button>
        <a-button v-if="isEditMode && formData.versionStatus === '草稿'" type="primary" @click="handleGoOnline" style="margin-left: 12px">上线</a-button>
      </div>
      <div v-else>
        <a-button type="outline" @click="handleEdit" style="margin-right: 12px">编辑</a-button>
        <a-button type="primary" @click="goBack">返回列表</a-button>
      </div>
    </div>

    <div class="form-container" :class="{ 'scrollable': enableScroll }">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical" :disabled="isViewMode">
        <!-- 基本信息 -->
        <a-card title="基本信息" class="form-section">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="变量名称" field="name">
                <a-input v-model="formData.name" :max-length="50" show-word-limit placeholder="请输入变量名称（2-50字符）" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="变量编码" field="code">
                <a-input v-model="formData.code" :max-length="30" show-word-limit placeholder="请输入变量编码（英文/数字/下划线/中划线，长度≥3）" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="变量类型" field="type">
                <a-select v-model="formData.type" placeholder="请选择变量类型">
                  <a-option value="numerical">数值型</a-option>
                  <a-option value="categorical">分类型</a-option>
                  <a-option value="text">文本型</a-option>
                  <a-option value="datetime">时间型</a-option>
                  <a-option value="boolean">布尔型</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="状态" field="status">
                <a-select v-model="formData.status" placeholder="请选择变量状态">
                  <a-option value="draft">草稿</a-option>
                  <a-option value="pending">待审核</a-option>
                  <a-option value="active">已发布</a-option>
                  <a-option value="inactive">已停用</a-option>
                  <a-option value="expired">已过期</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="数据源" field="dataSource">
                <a-select v-model="formData.dataSource" placeholder="请选择数据源" :loading="loadingDataSources">
                  <a-option v-for="ds in dataSources" :key="ds.id" :value="ds.id">{{ ds.name }}</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="来源字段" field="sourceField">
                <a-input v-model="formData.sourceField" :max-length="50" show-word-limit placeholder="请输入来源字段" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="更新频率" field="updateFrequency">
                <a-select v-model="formData.updateFrequency" placeholder="请选择更新频率">
                  <a-option value="实时">实时</a-option>
                  <a-option value="每小时">每小时</a-option>
                  <a-option value="每日">每日</a-option>
                  <a-option value="每周">每周</a-option>
                  <a-option value="每月">每月</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="定义说明" field="definition">
                <a-textarea v-model="formData.definition" :max-length="500" show-word-limit :auto-size="{ minRows: 3, maxRows: 6 }" placeholder="请输入定义说明（最大500字符）" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 技术信息 -->
        <a-card title="技术信息" class="form-section">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="技术口径（SQL）" field="technicalCaliber">
                <MonacoEditor v-model:modelValue="formData.technicalCaliber" language="sql" height="240px" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="技术口径使用说明" field="technicalUsageNote">
                <a-textarea v-model="formData.technicalUsageNote" :max-length="300" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="结果表" field="resultTable">
                <a-input v-model="formData.resultTable" :max-length="50" show-word-limit />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="查询代码（SQL）" field="queryCode">
                <MonacoEditor v-model:modelValue="formData.queryCode" language="sql" height="180px" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 版本信息 -->
        <a-card title="版本信息" class="form-section">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="版本号（自动）" field="version">
                <a-input v-model="formData.version" :disabled="true" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="版本状态" field="versionStatus">
                <a-select v-model="formData.versionStatus" :disabled="true">
                  <a-option value="草稿">草稿</a-option>
                  <a-option value="启动">启动</a-option>
                  <a-option value="归档">归档</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-alert v-if="formData.versionStatus === '草稿'" type="info" style="margin-bottom: 16px">当前版本为草稿状态，需要点击"上线"按钮后才能生效</a-alert>
              <a-alert v-else-if="formData.versionStatus === '启动'" type="success" style="margin-bottom: 16px">当前版本已启动</a-alert>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="版本说明" field="versionDescription">
                <a-textarea v-model="formData.versionDescription" :max-length="100" show-word-limit :auto-size="{ minRows: 2, maxRows: 4 }" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconLeft, IconPlus } from '@arco-design/web-vue/es/icon'
import MonacoEditor from '@/components/MonacoEditor.vue'
import { getDataSources, getVariableDetail, updateVariable, createVariable } from '@/api/variable-management'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const enableScroll = ref(true)

const isEditMode = computed(() => route.params.mode === 'edit' || route.query.mode === 'edit' || (route.params.id && route.params.id !== 'create'))
const isViewMode = computed(() => route.params.mode === 'view' || route.query.mode === 'view')
const isCreateMode = computed(() => !isEditMode.value && !isViewMode.value)

const formData = reactive({
  name: '',
  code: '',
  type: '',
  status: '草稿',
  dataSource: '',
  sourceField: '',
  updateFrequency: '',
  definition: '',
  technicalCaliber: '',
  technicalUsageNote: '',
  resultTable: '',
  queryCode: '',
  version: '1',
  versionDescription: '',
  versionStatus: '草稿'
})

const getFormRules = () => {
  const nameValidator = { validator: (_: any, v: string) => { const len = (v||'').trim().length; if (!len) return Promise.reject('请输入变量名称'); if (len < 2 || len > 50) return Promise.reject('变量名称需在2-50字符之间'); return Promise.resolve() } }
  const codeValidator = { validator: (_: any, v: string) => { const s = (v||'').trim(); if (!s) return Promise.reject('请输入变量编码'); if (s.length < 3 || s.length > 30) return Promise.reject('变量编码需在3-30字符之间'); if (!/^[A-Za-z0-9_-]+$/.test(s)) return Promise.reject('变量编码仅支持英文、数字、下划线或中划线'); return Promise.resolve() } }
  return {
    name: [nameValidator],
    code: [codeValidator],
    type: [{ required: true, message: '请选择变量类型' }],
    status: [{ required: true, message: '请选择变量状态' }],
    dataSource: [{ required: true, message: '请选择数据源' }],
    technicalCaliber: [{ validator: (_: any, v: string) => { const len = (v||'').trim().length; if (len > 1000) return Promise.reject('技术口径最大1000字符'); return Promise.resolve() } }],
    technicalUsageNote: [{ validator: (_: any, v: string) => { const len = (v||'').trim().length; if (len > 300) return Promise.reject('技术口径使用说明最大300字符'); return Promise.resolve() } }],
    resultTable: [{ validator: (_: any, v: string) => { const len = (v||'').trim().length; if (len > 50) return Promise.reject('结果表最大50字符'); return Promise.resolve() } }],
  }
}
const formRules = computed(() => getFormRules())

const dataSources = ref<Array<{id:string; name:string}>>([])
const loadingDataSources = ref(false)
const fetchDataSources = async () => {
  try {
    loadingDataSources.value = true
    const res = await getDataSources()
    if (res.code === 200) dataSources.value = res.data || []
  } catch (e) {
    console.error('获取数据源失败:', e)
  } finally {
    loadingDataSources.value = false
  }
}


const goBack = () => { router.push('/discovery/asset-management/variable-management') }
const handleEdit = () => { router.push({ name: 'VariableAssetDetail', params: { id: route.params.id, mode: 'edit' } }) }


const handleSaveDraft = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return
    const payload = {
      name: formData.name,
      code: formData.code,
      type: formData.type,
      status: 'draft',
      dataSource: formData.dataSource,
      sourceField: formData.sourceField,
      updateFrequency: formData.updateFrequency,
      definition: formData.definition,
      technicalCaliber: formData.technicalCaliber,
      technicalUsageNote: formData.technicalUsageNote,
      resultTable: formData.resultTable,
      queryCode: formData.queryCode
    }
    if (isCreateMode.value) {
      await createVariable(payload)
    } else {
      await updateVariable(String(route.params.id), payload)
    }
    formData.versionStatus = '草稿'
    Message.success('草稿保存成功')
  } catch (e) { console.error('表单验证失败:', e) }
}
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return
    const payload = {
      name: formData.name,
      code: formData.code,
      type: formData.type,
      status: formData.status || 'pending',
      dataSource: formData.dataSource,
      sourceField: formData.sourceField,
      updateFrequency: formData.updateFrequency,
      definition: formData.definition,
      technicalCaliber: formData.technicalCaliber,
      technicalUsageNote: formData.technicalUsageNote,
      resultTable: formData.resultTable,
      queryCode: formData.queryCode
    }
    if (isCreateMode.value) {
      await createVariable(payload)
      formData.versionStatus = '草稿'
      Message.success('变量创建成功')
    } else {
      await updateVariable(String(route.params.id), payload)
      Message.success('变量更新成功')
    }
    goBack()
  } catch (e) { console.error('表单验证失败:', e) }
}
const handleGoOnline = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return
    const payload = {
      name: formData.name,
      code: formData.code,
      type: formData.type,
      status: 'active',
      dataSource: formData.dataSource,
      sourceField: formData.sourceField,
      updateFrequency: formData.updateFrequency,
      definition: formData.definition,
      technicalCaliber: formData.technicalCaliber,
      technicalUsageNote: formData.technicalUsageNote,
      resultTable: formData.resultTable,
      queryCode: formData.queryCode
    }
    if (isCreateMode.value) {
      await createVariable(payload)
    } else {
      await updateVariable(String(route.params.id), payload)
    }
    formData.versionStatus = '启动'
    Message.success('变量已成功上线')
  } catch (e) { console.error('表单验证失败:', e) }
}

onMounted(async () => {
  await fetchDataSources()
  // 加载详情数据（编辑/查看）
  if (isEditMode.value || isViewMode.value) {
    try {
      const id = String(route.params.id)
      const res = await getVariableDetail(id)
      if (res && res.code === 200 && res.data) {
        const d = res.data
        formData.name = d.name || ''
        formData.code = d.code || ''
        formData.type = d.type || ''
        formData.status = d.status || '草稿'
        formData.dataSource = d.dataSource || ''
        formData.sourceField = d.sourceField || ''
        formData.updateFrequency = d.updateFrequency || ''
        formData.definition = d.definition || ''
        formData.technicalCaliber = d.technicalCaliber || ''
        formData.technicalUsageNote = d.technicalUsageNote || ''
        formData.resultTable = d.resultTable || ''
        formData.queryCode = d.queryCode || ''
      } else {
        const q = route.query || {}
        formData.name = String(q.name || '')
        formData.code = String(q.code || '')
        formData.type = String(q.type || '')
        formData.status = String(q.status || '草稿')
        formData.dataSource = ''
        formData.sourceField = ''
        formData.updateFrequency = String(q.updateFrequency || '')
        formData.definition = String(q.definition || '')
        formData.technicalCaliber = ''
        formData.technicalUsageNote = ''
        formData.resultTable = ''
        formData.queryCode = ''
      }
    } catch (e) {
      console.error('加载变量详情失败:', e)
      Message.error('加载变量详情失败')
    }
  }
})
</script>

<style scoped>
.variable-detail-page { padding: 20px; min-height: calc(100vh - 40px); display: flex; flex-direction: column; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e6eb; flex-shrink: 0; }
.page-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
.form-container { flex: 1; overflow-y: auto; padding-right: 8px; }
.form-container.scrollable { overflow-y: auto; scroll-behavior: smooth; }
.form-container::-webkit-scrollbar { width: 6px; }
.form-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
.form-container::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
.form-container::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
.form-section { margin-bottom: 24px; }

</style>
