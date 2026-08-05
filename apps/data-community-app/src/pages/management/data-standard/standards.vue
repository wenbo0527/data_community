<template>
  <div class="standards-page">
    <a-page-header title="数据标准" sub-title="字段级标准定义、口径管理、合规检查">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">
          <template #icon><icon-plus /></template>
          新建标准
        </a-button>
      </template>
    </a-page-header>

    <a-card :bordered="false" class="filter-card">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input v-model="keyword" placeholder="搜索标准编码 / 名称 / 字段" allow-clear size="large">
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterCategory" placeholder="分类" allow-clear size="large">
            <a-option v-for="c in categories" :key="c" :value="c">{{ c }}</a-option>
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
        共 <b>{{ filteredStandards.length }}</b> 个数据标准 · 已发布 <b>{{ publishedCount }}</b> · 草稿 <b>{{ draftCount }}</b>
      </div>
    </a-card>

    <a-table
      :columns="columns"
      :data="filteredStandards"
      :pagination="{ pageSize: 10, showTotal: true }"
      row-key="code"
      stripe
      size="medium"
    >
      <template #code="{ record }">
        <a-link @click="openStandard(record)">{{ record.code }}</a-link>
      </template>
      <template #status="{ record }">
        <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
      </template>
      <template #category="{ record }">
        <a-tag>{{ record.category }}</a-tag>
      </template>
      <template #compliance="{ record }">
        <a-progress
          :percent="record.complianceRate / 100"
          :stroke-width="6"
          :color="complianceColor(record.complianceRate)"
        />
      </template>
      <template #tags="{ record }">
        <a-tag v-for="t in (record.tags || [])" :key="t" color="green">{{ t }}</a-tag>
      </template>
    </a-table>

    <a-drawer
      v-model:visible="detailVisible"
      :title="`标准详情 · ${currentStandard?.name || ''}`"
      :width="780"
      :footer="false"
    >
      <template v-if="currentStandard">
        <a-descriptions :column="2" bordered size="medium">
          <a-descriptions-item label="标准编码">{{ currentStandard.code }}</a-descriptions-item>
          <a-descriptions-item label="标准名称">{{ currentStandard.name }}</a-descriptions-item>
          <a-descriptions-item label="分类">{{ currentStandard.category }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="statusColor(currentStandard.status)">{{ statusLabel(currentStandard.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="数据类型">
            <a-tag color="cyan">{{ currentStandard.dataType }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="长度/精度">{{ currentStandard.length }} / {{ currentStandard.scale || '-' }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ currentStandard.owner }}</a-descriptions-item>
          <a-descriptions-item label="合规率">{{ currentStandard.complianceRate }}%</a-descriptions-item>
          <a-descriptions-item label="定义" :span="2">{{ currentStandard.definition }}</a-descriptions-item>
          <a-descriptions-item label="取值范围" :span="2">
            <pre class="formula">{{ currentStandard.valueRange }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="规则示例" :span="2">
            <pre class="formula">{{ currentStandard.example }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="标签" :span="2">
            <a-tag v-for="t in (currentStandard.tags || [])" :key="t" color="green">{{ t }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <h3 style="margin-top: 24px">已应用此标准的字段 ({{ currentStandard.appliedFields?.length || 0 }})</h3>
        <a-table
          :columns="appliedColumns"
          :data="currentStandard.appliedFields || []"
          :pagination="false"
          row-key="fullPath"
          size="small"
        >
          <template #compliance="{ record }">
            <a-tag :color="record.compliant ? 'green' : 'red'">
              {{ record.compliant ? '✓ 合规' : '✗ 不合规' }}
            </a-tag>
          </template>
        </a-table>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { StandardStore } from '@/mock/shared/standard-store'

const router = useRouter()

const standards = ref<any[]>([])
const keyword = ref('')
const filterCategory = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)

const detailVisible = ref(false)
const currentStandard = ref<any>(null)

onMounted(() => {
  standards.value = StandardStore.getStandards()
})

const categories = computed(() => Array.from(new Set(standards.value.map(s => s.category))).sort())

const filteredStandards = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return standards.value.filter(s => {
    if (k) {
      if (!s.code.toLowerCase().includes(k) && !s.name.toLowerCase().includes(k) && !s.definition.toLowerCase().includes(k)) return false
    }
    if (filterCategory.value && s.category !== filterCategory.value) return false
    if (filterStatus.value && s.status !== filterStatus.value) return false
    return true
  })
})

const publishedCount = computed(() => standards.value.filter(s => s.status === 'published').length)
const draftCount = computed(() => standards.value.filter(s => s.status === 'draft').length)

const columns = [
  { title: '编码', dataIndex: 'code', slotName: 'code', width: 100 },
  { title: '名称', dataIndex: 'name', width: 200 },
  { title: '分类', dataIndex: 'category', slotName: 'category', width: 130 },
  { title: '数据类型', dataIndex: 'dataType', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '合规率', dataIndex: 'complianceRate', slotName: 'compliance', width: 150 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '标签', dataIndex: 'tags', slotName: 'tags' }
]

const appliedColumns = [
  { title: '字段路径', dataIndex: 'fullPath' },
  { title: '当前值', dataIndex: 'sample', width: 130 },
  { title: '合规', dataIndex: 'compliant', slotName: 'compliance', width: 100 }
]

function statusColor(s: string) {
  return { published: 'green', draft: 'orange', deprecated: 'gray' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { published: '已发布', draft: '草稿', deprecated: '已弃用' }[s] || s
}
function complianceColor(c: number) {
  if (c >= 90) return '#00b42a'
  if (c >= 70) return '#ff7d00'
  return '#f53f3f'
}
function resetFilters() {
  keyword.value = ''
  filterCategory.value = undefined
  filterStatus.value = undefined
}
function openStandard(s: any) {
  currentStandard.value = s
  detailVisible.value = true
}
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.standards-page {
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

  .formula {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-family: 'Menlo', monospace;
    font-size: 13px;
    color: #165dff;
    margin: 0;
  }
}
</style>