<template>
  <div class="data-models-page">
    <a-page-header title="数据模型" sub-title="主题域模型设计、模型 CRUD、版本管理">
      <template #extra>
        <a-button @click="goBack">返回数据管理</a-button>
        <a-button type="primary" @click="openCreate">
          <template #icon><icon-plus /></template>新建模型
        </a-button>
      </template>
    </a-page-header>

    <a-card :bordered="false" class="filter-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input v-model="keyword" placeholder="搜索模型名 / 主题域" allow-clear size="large">
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterDomain" placeholder="主题域" allow-clear size="large">
            <a-option value="user">用户域</a-option>
            <a-option value="trade">交易域</a-option>
            <a-option value="risk">风控域</a-option>
            <a-option value="marketing">营销域</a-option>
            <a-option value="product">产品域</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterStatus" placeholder="状态" allow-clear size="large">
            <a-option value="published">已发布</a-option>
            <a-option value="draft">草稿</a-option>
            <a-option value="deprecated">已弃用</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-button type="primary" @click="resetFilters">重置</a-button>
        </a-col>
      </a-row>
      <div class="result-meta">
        共 <b>{{ filteredModels.length }}</b> 个模型
      </div>
    </a-card>

    <a-table
      :columns="columns"
      :data="filteredModels"
      :pagination="{ pageSize: 10 }"
      row-key="id"
      stripe
      size="medium"
    >
      <template #name="{ record }">
        <a-link @click="openDetail(record)">{{ record.name }}</a-link>
      </template>
      <template #domain="{ record }">
        <a-tag color="arcoblue">{{ record.domain }}</a-tag>
      </template>
      <template #status="{ record }">
        <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
      </template>
      <template #version="{ record }">v{{ record.version }}</template>
      <template #actions="{ record }">
        <a-link @click="openEdit(record)">编辑</a-link>
        <a-divider direction="vertical" />
        <a-link @click="viewHistory(record)">历史</a-link>
        <a-divider direction="vertical" />
        <a-link @click="publishModel(record)">发布</a-link>
      </template>
    </a-table>

    <!-- 新建/编辑 Drawer -->
    <a-drawer
      v-model:visible="formDrawerVisible"
      :title="formMode === 'create' ? '新建模型' : '编辑模型'"
      :width="720"
      :footer="false"
    >
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="模型名" required>
              <a-input v-model="formData.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="主题域" required>
              <a-select v-model="formData.domain">
                <a-option value="user">用户域</a-option>
                <a-option value="trade">交易域</a-option>
                <a-option value="risk">风控域</a-option>
                <a-option value="marketing">营销域</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Owner" required>
              <a-input v-model="formData.owner" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="版本">
              <a-input v-model="formData.version" placeholder="例如:1.0" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="描述">
              <a-textarea v-model="formData.description" :auto-size="{ minRows: 3 }" />
            </a-form-item>
          </a-col>
        </a-row>
        <div style="text-align: right">
          <a-button @click="formDrawerVisible = false">取消</a-button>
          <a-button type="primary" style="margin-left: 8px" @click="saveModel">保存</a-button>
        </div>
      </a-form>
    </a-drawer>

    <!-- 历史版本 Drawer -->
    <a-drawer v-model:visible="historyDrawerVisible" title="版本历史" :width="600" :footer="false">
      <a-timeline>
        <a-timeline-item v-for="(v, i) in versionHistory" :key="i">
          <strong>v{{ v.version }}</strong> · {{ v.user }} · {{ v.time }}
          <p style="margin: 4px 0; color: #86909c">{{ v.note }}</p>
        </a-timeline-item>
      </a-timeline>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const models = ref<any[]>([])
const keyword = ref('')
const filterDomain = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)

const formDrawerVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref({
  id: '', name: '', domain: 'user', owner: '', version: '1.0', description: ''
})

const historyDrawerVisible = ref(false)
const versionHistory = ref<any[]>([])

onMounted(() => {
  models.value = [
    { id: 'M001', name: '用户主索引', domain: 'user', status: 'published', version: '2.3', owner: '王运营', description: '用户主数据模型,所有用户相关表的外键源' },
    { id: 'M002', name: '账户模型', domain: 'user', status: 'published', version: '1.8', owner: '王运营', description: '用户账户基本信息' },
    { id: 'M003', name: '交易订单', domain: 'trade', status: 'published', version: '3.1', owner: '李产品', description: '所有交易订单的主数据' },
    { id: 'M004', name: '支付流水', domain: 'trade', status: 'published', version: '2.5', owner: '李产品', description: '支付流水主数据' },
    { id: 'M005', name: '授信模型', domain: 'risk', status: 'published', version: '4.2', owner: '张风控', description: '授信主数据' },
    { id: 'M006', name: '风险评分卡', domain: 'risk', status: 'published', version: '5.0', owner: '张风控', description: 'XGBoost 风险评分卡模型' },
    { id: 'M007', name: '营销活动', domain: 'marketing', status: 'published', version: '2.0', owner: '陈营销', description: '营销活动主数据' },
    { id: 'M008', name: '优惠券', domain: 'marketing', status: 'published', version: '1.5', owner: '陈营销', description: '优惠券主数据' },
    { id: 'M009', name: 'Vintage 资产', domain: 'risk', status: 'draft', version: '0.8', owner: '张风控', description: 'Vintage 资产质量模型(草稿)' },
    { id: 'M010', name: '产品维表', domain: 'product', status: 'published', version: '1.2', owner: '李产品', description: '金融产品主数据' }
  ]
})

const filteredModels = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return models.value.filter(m => {
    if (k && !m.name.toLowerCase().includes(k) && !m.domain.toLowerCase().includes(k)) return false
    if (filterDomain.value && m.domain !== filterDomain.value) return false
    if (filterStatus.value && m.status !== filterStatus.value) return false
    return true
  })
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '模型名', dataIndex: 'name', slotName: 'name' },
  { title: '主题域', dataIndex: 'domain', slotName: 'domain', width: 100 },
  { title: '版本', dataIndex: 'version', slotName: 'version', width: 80 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '描述', dataIndex: 'description' },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 180 }
]

function openCreate() {
  formMode.value = 'create'
  formData.value = { id: '', name: '', domain: 'user', owner: '', version: '1.0', description: '' }
  formDrawerVisible.value = true
}

function openEdit(m: any) {
  formMode.value = 'edit'
  formData.value = { ...m }
  formDrawerVisible.value = true
}

function saveModel() {
  if (!formData.value.name || !formData.value.owner) {
    Message.warning('请填写必填项')
    return
  }
  if (formMode.value === 'create') {
    const id = 'M' + (models.value.length + 1).toString().padStart(3, '0')
    models.value.push({ id, ...formData.value, status: 'draft' })
    Message.success('模型已创建')
  } else {
    const idx = models.value.findIndex(m => m.id === formData.value.id)
    if (idx >= 0) models.value[idx] = { ...formData.value }
    Message.success('模型已更新')
  }
  formDrawerVisible.value = false
}

function openDetail(m: any) {
  Message.info(`模型详情: ${m.name}`)
}

function viewHistory(m: any) {
  versionHistory.value = [
    { version: m.version, user: m.owner, time: '2025-08-01 14:30', note: '当前版本' },
    { version: String(parseFloat(m.version) - 0.1), user: m.owner, time: '2025-07-15 10:20', note: '修复字段问题' },
    { version: String(parseFloat(m.version) - 0.2), user: '李数据', time: '2025-07-01 16:45', note: '新增字段' },
    { version: '1.0', user: '李数据', time: '2025-06-15 09:30', note: '初始版本' }
  ]
  historyDrawerVisible.value = true
}

function publishModel(m: any) {
  m.status = 'published'
  Message.success(`模型 ${m.name} 已发布`)
}

function statusColor(s: string) {
  return { published: 'green', draft: 'orange', deprecated: 'gray' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { published: '已发布', draft: '草稿', deprecated: '已弃用' }[s] || s
}

function resetFilters() {
  keyword.value = ''
  filterDomain.value = undefined
  filterStatus.value = undefined
}

const goBack = () => router.push('management')
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.data-models-page {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
  .filter-card {
    margin-bottom: 16px;
    .result-meta {
      margin-top: 16px;
      color: #86909c;
      font-size: 13px;
      b { color: #165dff; font-weight: 600; }
    }
  }
}
</style>