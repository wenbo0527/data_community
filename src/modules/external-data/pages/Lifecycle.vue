<template>
  <div class="external-data-lifecycle">
    <a-page-header title="外数生命周期" />
    <a-card class="toolbar" :bordered="true" style="margin-bottom: 12px">
      <a-form :model="filters" layout="inline">
        <a-form-item field="stage" label="阶段">
          <a-select v-model="filters.stage" allow-clear placeholder="选择阶段" style="width: 180px">
            <a-option value="registration">注册</a-option>
            <a-option value="evaluation">评估</a-option>
            <a-option value="approval">审批</a-option>
            <a-option value="deployment">上线</a-option>
            <a-option value="operation">运维</a-option>
            <a-option value="deprecation">下线</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="filters.status" allow-clear placeholder="选择状态" style="width: 180px">
            <a-option value="pending">待处理</a-option>
            <a-option value="in_progress">进行中</a-option>
            <a-option value="completed">已完成</a-option>
            <a-option value="failed">失败</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="applyFilter">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-grid :cols="2" :col-gap="12" :row-gap="12">
      <a-grid-item>
        <a-card title="阶段时间线">
          <a-steps status="process" :current="currentIndex">
            <a-step v-for="(s, idx) in stages" :key="idx" :title="stageLabel(s.stage)" :description="statusLabel(s.status)" />
          </a-steps>
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card title="阶段列表">
          <a-table :data="displayedStages" :pagination="false">
            <template #columns>
              <a-table-column title="阶段" :width="160">
                <template #cell="{ record }">{{ stageLabel(record.stage) }}</template>
              </a-table-column>
              <a-table-column title="状态" :width="120">
                <template #cell="{ record }"><a-tag :status="statusTag(record.status)">{{ statusLabel(record.status) }}</a-tag></template>
              </a-table-column>
              <a-table-column title="开始日期" :width="160">
                <template #cell="{ record }">{{ formatDate(record.startDate) }}</template>
              </a-table-column>
              <a-table-column title="结束日期" :width="160">
                <template #cell="{ record }">{{ formatDate(record.endDate) }}</template>
              </a-table-column>
              <a-table-column title="描述" data-index="description" />
            </template>
          </a-table>
        </a-card>
      </a-grid-item>
    </a-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
const store = useExternalDataStore()

interface Stage { stage: string; status: string; startDate?: string; endDate?: string; description?: string }

const filters = reactive<{ stage?: string; status?: string }>({})
const stages = ref<Stage[]>([])
const lifecycleData = ref<any>({})
const currentIndex = computed(() => Math.max(0, stages.value.findIndex(s => s.status === 'in_progress')))
const displayedStages = computed(() => stages.value.filter(s => { if (filters.stage && s.stage !== filters.stage) return false; if (filters.status && s.status !== filters.status) return false; return true }))

const stageLabel = (s?: string) => s === 'registration' ? '注册' : s === 'evaluation' ? '评估' : s === 'approval' ? '审批' : s === 'deployment' ? '上线' : s === 'operation' ? '运维' : s === 'deprecation' ? '下线' : '—'
const statusLabel = (s?: string) => s === 'pending' ? '待处理' : s === 'in_progress' ? '进行中' : s === 'completed' ? '已完成' : s === 'failed' ? '失败' : '—'
const statusTag = (s?: string) => s === 'pending' ? 'default' : s === 'in_progress' ? 'warning' : s === 'completed' ? 'success' : s === 'failed' ? 'danger' : 'default'
const formatDate = (d?: string) => { try { return new Date(d || '').toLocaleDateString() } catch { return '—' } }

const load = async () => { try { await store.fetchLifecycleData({}); stages.value = store.lifecycleStages || []; lifecycleData.value = store.lifecycle || {}; Message.success('已加载生命周期数据') } catch { Message.error('加载失败') } }
const applyFilter = () => { Message.success('筛选已更新') }
const resetFilter = () => { filters.stage = undefined; filters.status = undefined }
onMounted(load)
</script>

<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
