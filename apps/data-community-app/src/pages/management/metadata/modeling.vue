<template>
  <div class="modeling-page">
    <a-page-header title="元数据建模" sub-title="字段级元数据打标、命名规范、口径校验">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">批量打标</a-button>
      </template>
    </a-page-header>

    <a-card :bordered="false" class="filter-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input v-model="keyword" placeholder="搜索表名 / 字段名 / 中文名" allow-clear size="large">
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterTable" placeholder="所属表" allow-clear size="large">
            <a-option v-for="t in tableOptions" :key="t" :value="t">{{ t }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterStatus" placeholder="建模状态" allow-clear size="large">
            <a-option value="modeled">已建模</a-option>
            <a-option value="partial">部分建模</a-option>
            <a-option value="unmodeled">未建模</a-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-button type="primary" @click="resetFilters">重置</a-button>
        </a-col>
      </a-row>
      <div class="result-meta">
        共 <b>{{ filteredFields.length }}</b> 个字段 · 已建模 <b>{{ modeledCount }}</b> · 部分建模 <b>{{ partialCount }}</b> · 未建模 <b>{{ unmodeledCount }}</b>
      </div>
    </a-card>

    <a-table
      :columns="columns"
      :data="filteredFields"
      :pagination="{ pageSize: 12, showTotal: true }"
      row-key="fullPath"
      stripe
      size="medium"
    >
      <template #status="{ record }">
        <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
      </template>
      <template #modeledLevel="{ record }">
        <a-progress :percent="record.modeledLevel / 100" :stroke-width="6" :color="modeledColor(record.modeledLevel)" />
      </template>
      <template #tags="{ record }">
        <a-tag v-for="t in (record.tags || [])" :key="t" color="arcoblue">{{ t }}</a-tag>
      </template>
      <template #actions="{ record }">
        <a-link @click="openField(record)">建模</a-link>
      </template>
    </a-table>

    <a-drawer
      v-model:visible="detailVisible"
      :title="`字段建模 · ${currentField?.fullPath || ''}`"
      :width="780"
      :footer="false"
    >
      <template v-if="currentField">
        <a-descriptions :column="2" bordered size="medium">
          <a-descriptions-item label="字段路径">{{ currentField.fullPath }}</a-descriptions-item>
          <a-descriptions-item label="数据类型">{{ currentField.dataType }}</a-descriptions-item>
          <a-descriptions-item label="中文名">
            <a-input v-model="currentField.chineseName" size="small" />
          </a-descriptions-item>
          <a-descriptions-item label="业务含义">
            <a-textarea v-model="currentField.businessMeaning" :auto-size="{ minRows: 2 }" />
          </a-descriptions-item>
          <a-descriptions-item label="关联业务概念">
            <a-select v-model="currentField.conceptCode" placeholder="选择业务实体" allow-clear>
              <a-option v-for="c in concepts" :key="c.code" :value="c.code">{{ c.name }}</a-option>
            </a-select>
          </a-descriptions-item>
          <a-descriptions-item label="数据标准">
            <a-select v-model="currentField.standardCode" placeholder="选择数据标准" allow-clear>
              <a-option v-for="s in standards" :key="s.code" :value="s.code">{{ s.name }}</a-option>
            </a-select>
          </a-descriptions-item>
          <a-descriptions-item label="敏感级别">
            <a-select v-model="currentField.sensitivity" placeholder="敏感级别">
              <a-option value="public">公开</a-option>
              <a-option value="internal">内部</a-option>
              <a-option value="confidential">机密</a-option>
              <a-option value="restricted">受限</a-option>
            </a-select>
          </a-descriptions-item>
          <a-descriptions-item label="Owner">
            <a-input v-model="currentField.owner" size="small" />
          </a-descriptions-item>
          <a-descriptions-item label="建模进度" :span="2">
            <a-progress :percent="currentField.modeledLevel / 100" :stroke-width="8" />
          </a-descriptions-item>
          <a-descriptions-item label="标签" :span="2">
            <a-tag v-for="t in (currentField.tags || [])" :key="t" color="arcoblue">{{ t }}</a-tag>
            <a-link style="margin-left: 8px">+ 添加标签</a-link>
          </a-descriptions-item>
        </a-descriptions>

        <div style="margin-top: 16px; text-align: right">
          <a-button>取消</a-button>
          <a-button type="primary" style="margin-left: 8px" @click="saveField">保存</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { MetadataStore } from '@/mock/shared/metadata-store'
import { BusinessConceptStore } from '@/mock/shared/business-concept-store'
import { StandardStore } from '@/mock/shared/standard-store'

const router = useRouter()

const fields = ref<any[]>([])
const keyword = ref('')
const filterTable = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)

const concepts = ref<any[]>([])
const standards = ref<any[]>([])

const detailVisible = ref(false)
const currentField = ref<any>(null)

onMounted(() => {
  // 从 metadata-store 提取字段
  const tables = MetadataStore.getTables()
  fields.value = tables.flatMap(t => (t.fields || []).map((f: any) => ({
    ...f,
    fullPath: `${t.name}.${f.name}`,
    tableName: t.name,
    chineseName: f.chineseName || f.name,
    businessMeaning: f.description || '',
    owner: f.owner || t.owner,
    sensitivity: f.sensitivity || 'internal',
    modeledLevel: f.modeledLevel || (f.description ? 80 : 30),
    status: f.modeledLevel >= 80 ? 'modeled' : (f.modeledLevel >= 40 ? 'partial' : 'unmodeled'),
    tags: f.tags || [],
    conceptCode: f.conceptCode,
    standardCode: f.standardCode
  })))

  concepts.value = BusinessConceptStore.getEntities()
  standards.value = StandardStore.getStandards()
})

const tableOptions = computed(() => Array.from(new Set(fields.value.map(f => f.tableName))).sort())

const filteredFields = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return fields.value.filter(f => {
    if (k) {
      if (!f.fullPath.toLowerCase().includes(k) && !f.chineseName.toLowerCase().includes(k) && !f.businessMeaning.toLowerCase().includes(k)) return false
    }
    if (filterTable.value && f.tableName !== filterTable.value) return false
    if (filterStatus.value && f.status !== filterStatus.value) return false
    return true
  })
})

const modeledCount = computed(() => fields.value.filter(f => f.status === 'modeled').length)
const partialCount = computed(() => fields.value.filter(f => f.status === 'partial').length)
const unmodeledCount = computed(() => fields.value.filter(f => f.status === 'unmodeled').length)

const columns = [
  { title: '字段路径', dataIndex: 'fullPath', width: 240 },
  { title: '中文名', dataIndex: 'chineseName', width: 130 },
  { title: '数据类型', dataIndex: 'dataType', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '建模进度', dataIndex: 'modeledLevel', slotName: 'modeledLevel', width: 150 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '标签', dataIndex: 'tags', slotName: 'tags' },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 80 }
]

function statusColor(s: string) {
  return { modeled: 'green', partial: 'orange', unmodeled: 'red' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { modeled: '已建模', partial: '部分', unmodeled: '未建模' }[s] || s
}
function modeledColor(c: number) {
  if (c >= 80) return '#00b42a'
  if (c >= 40) return '#ff7d00'
  return '#f53f3f'
}
function resetFilters() {
  keyword.value = ''
  filterTable.value = undefined
  filterStatus.value = undefined
}
function openField(f: any) {
  currentField.value = { ...f }
  detailVisible.value = true
}
function saveField() {
  // 模拟保存
  Message.success('保存成功')
  detailVisible.value = false
}
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.modeling-page {
  padding: 24px;
  max-width: 1400px;
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