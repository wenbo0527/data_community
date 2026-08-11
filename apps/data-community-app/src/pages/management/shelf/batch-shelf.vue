<template>
  <PageContainer>
    <PageHeader title="批量上下架" sub-title="跨资源 / 资产 / 要素的批量状态变更 · 支持预览 + 二次确认">
      <template #extra>
        <a-button @click="goBack">返回工作台</a-button>
      </template>
    </PageHeader>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-statistic title="资源总数" :value="countByKind.resource" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="资产总数" :value="countByKind.asset" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="要素总数" :value="countByKind.element" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本批次将变更" :value="selectedIds.length" :value-style="{ color: '#f53f3f' }" />
      </a-col>
    </a-row>

    <a-card :bordered="false" style="margin-bottom: 16px">
      <a-row :gutter="12">
        <a-col :span="6">
          <a-input v-model="keyword" placeholder="搜索名称 / 编码" allow-clear />
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterKind" placeholder="类别" allow-clear>
            <a-option value="resource">数据资源</a-option>
            <a-option value="asset">数据资产</a-option>
            <a-option value="element">数据要素</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterStatus" placeholder="状态" allow-clear>
            <a-option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-button @click="loadSelectedToBatch" type="outline" status="success">
            <template #icon><icon-up /></template>加载已选项 → 批量上架
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <a-card :bordered="false" class="content-card">
      <a-table
        :columns="columns"
        :data="filtered"
        row-key="id"
        :pagination="{ pageSize: 12, showTotal: true }"
        :row-selection="{ selectedKeys: selectedIds, onChange: onSelectChange }"
        stripe
      >
        <template #kind="{ record }">
          <a-tag :color="kindColor(record.kind)">{{ kindLabel(record.kind) }}</a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>
      </a-table>
    </a-card>

    <!-- 批量操作区 -->
    <a-card v-if="selectedIds.length > 0" class="batch-actions" :bordered="false">
      <a-alert type="warning" :show-icon="true">
        <template #title>
          已选 <strong>{{ selectedIds.length }}</strong> 项 · 选中的明细:
        </template>
        已选明细:
        <div class="selected-tags">
          <a-tag v-for="id in selectedIds" :key="id" color="cyan" closable @close="removeFromSelected(id)">
            {{ id }}
          </a-tag>
        </div>
        <a-divider style="margin: 12px 0" />
        <a-space>
          <a-button type="primary" status="success" @click="onBatchAction('on')">
            <template #icon><icon-up /></template>批量上架
          </a-button>
          <a-button status="warning" @click="onBatchAction('off')">
            <template #icon><icon-down /></template>批量下架
          </a-button>
          <a-button status="danger" @click="onBatchAction('archive')">
            <template #icon><icon-archive /></template>批量归档
          </a-button>
          <a-button type="text" status="danger" @click="selectedIds = []">清空</a-button>
        </a-space>
      </a-alert>
    </a-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import {
  ShelfStore,
  SHELF_STATUSES,
  SHELF_STATUS_LABEL,
  SHELF_STATUS_COLOR,
  SHELF_KIND_LABEL,
  type ShelfItem,
  type ShelfStatus as SS,
  type ShelfKind as SK
} from '@/mock-shared/shelf-store'

const router = useRouter()

const all = ref<ShelfItem[]>([])
function refresh() { all.value = ShelfStore.getAll() }
onMounted(refresh)

const keyword = ref('')
const filterKind = ref<SK | undefined>()
const filterStatus = ref<SS | undefined>()
const selectedIds = ref<string[]>([])

const statuses = SHELF_STATUSES.map(s => ({ value: s, label: SHELF_STATUS_LABEL[s] }))

const countByKind = computed(() => ({
  resource: all.value.filter(x => x.kind === 'resource').length,
  asset: all.value.filter(x => x.kind === 'asset').length,
  element: all.value.filter(x => x.kind === 'element').length
}))

const filtered = computed(() => all.value.filter(x => {
  if (keyword.value && !x.name.includes(keyword.value) && !x.code.includes(keyword.value)) return false
  if (filterKind.value && x.kind !== filterKind.value) return false
  if (filterStatus.value && x.status !== filterStatus.value) return false
  return true
}))

const columns = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '名称', dataIndex: 'name', width: 220 },
  { title: '类别', dataIndex: 'kind', slotName: 'kind', width: 100 },
  { title: '子类', dataIndex: 'subType', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '编码/路径', dataIndex: 'code', width: 220 }
]

function statusColor(s: SS) { return SHELF_STATUS_COLOR[s] }
function statusLabel(s: SS) { return SHELF_STATUS_LABEL[s] }
function kindLabel(k: SK) { return SHELF_KIND_LABEL[k] }
function kindColor(k: SK) { return ({ resource: 'arcoblue', asset: 'green', element: 'purple' } as any)[k] || 'gray' }

function onSelectChange(keys: string[]) { selectedIds.value = keys }
function removeFromSelected(id: string) { selectedIds.value = selectedIds.value.filter(x => x !== id) }

function loadSelectedToBatch() {
  if (selectedIds.value.length === 0) { Message.warning('请先选择项目'); return }
  onBatchAction('on')
}

function onBatchAction(action: 'on' | 'off' | 'archive') {
  if (selectedIds.value.length === 0) return
  const map = { on: '批量上架', off: '批量下架', archive: '批量归档' }
  Modal.confirm({
    title: `${map[action]} (${selectedIds.value.length} 项)`,
    content: '此操作将同时影响资源 / 资产 / 要素三类,确定要继续?',
    okText: '确认执行',
    cancelText: '取消',
    onOk: () => {
      if (action === 'on') ShelfStore.batchOn(selectedIds.value.slice())
      else if (action === 'off') ShelfStore.batchOff(selectedIds.value.slice(), '批量操作')
      else ShelfStore.batchArchive(selectedIds.value.slice(), '批量操作')
      Message.success(`已${map[action]} ${selectedIds.value.length} 项`)
      selectedIds.value = []
      refresh()
    }
  })
}

const goBack = () => router.push('workbench')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
.content-card { margin-bottom: 16px; }
.batch-actions { position: sticky; bottom: 16px; z-index: 9; }
.selected-tags { margin-top: 8px; }
</style>