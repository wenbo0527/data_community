<template>
  <div class="external-data-evaluation">
    <a-page-header title="外数评估中心" />
    <a-card :bordered="true" class="toolbar">
      <a-form :model="filters" layout="inline">
        <a-form-item field="type" label="评估类型">
          <a-select v-model="filters.type" allow-clear style="width: 180px" placeholder="选择类型">
            <a-option value="quality">质量</a-option>
            <a-option value="performance">性能</a-option>
            <a-option value="cost_effectiveness">性价比</a-option>
            <a-option value="comprehensive">综合</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" allow-clear style="width: 180px" placeholder="选择状态">
            <a-option value="draft">草稿</a-option>
            <a-option value="in_progress">进行中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="archived">已归档</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card title="评估报告列表">
      <a-table :data="displayedEvaluations" row-key="id" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="标题" data-index="title" :width="220" />
          <a-table-column title="类型" :width="140">
            <template #cell="{ record }">{{ typeLabel(record.type) }}</template>
          </a-table-column>
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }"><a-tag :status="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
          </a-table-column>
          <a-table-column title="评分" :width="120">
            <template #cell="{ record }">{{ record.score ?? '—' }}</template>
          </a-table-column>
          <a-table-column title="创建时间" :width="180">
            <template #cell="{ record }">{{ formatDate(record.createdAt) }}</template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
const store = useExternalDataStore()
import DateUtils from '@/utils/dateUtils'

type EvaluationType = 'quality'|'performance'|'cost_effectiveness'|'comprehensive'

const filters = reactive<{ type?: EvaluationType; status?: string }>({})
const evaluations = ref<any[]>([])
const pagination = reactive({ total: 0, pageSize: 10, current: 1, showTotal: true })
const displayedEvaluations = computed(() => evaluations.value.filter(e => { if (filters.type && e.type !== filters.type) return false; if (filters.status && e.status !== filters.status) return false; return true }))
const typeLabel = (t?: string) => t === 'quality' ? '质量' : t === 'performance' ? '性能' : t === 'cost_effectiveness' ? '性价比' : t === 'comprehensive' ? '综合' : '—'
const statusLabel = (s?: string) => s === 'draft' ? '草稿' : s === 'in_progress' ? '进行中' : s === 'completed' ? '已完成' : s === 'archived' ? '已归档' : '—'
const statusTag = (s?: string) => s === 'completed' ? 'success' : s === 'in_progress' ? 'warning' : s === 'draft' ? 'default' : 'default'
const formatDate = (d?: string) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }

const applyFilter = () => { Message.success('筛选已更新') }
const resetFilter = () => { filters.type = undefined; filters.status = undefined }
const onPageChange = (page: number) => { pagination.current = page }
const load = async () => { try { await store.fetchEvaluationList(); evaluations.value = store.evaluationList || []; pagination.total = evaluations.value.length; Message.success('已加载评估列表') } catch { Message.error('加载失败') } }
onMounted(load)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
