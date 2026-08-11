<template>
  <PageContainer>
    <PageHeader :title="title" :sub-title="subtitle">
      <template #extra>
        <a-button @click="goBack">返回工作台</a-button>
      </template>
    </PageHeader>

    <!-- 顶部统计 -->
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="6">
        <a-card><a-statistic title="已上架" :value="counts.active" :value-style="{ color: '#00b42a' }" /></a-card>
      </a-col>
      <a-col :span="6">
        <a-card><a-statistic title="已下架" :value="counts.inactive" :value-style="{ color: '#ff7d00' }" /></a-card>
      </a-col>
      <a-col :span="6">
        <a-card><a-statistic title="已归档" :value="counts.archived" :value-style="{ color: '#86909c' }" /></a-card>
      </a-col>
      <a-col :span="6">
        <a-card><a-statistic :title="`已选 ${selectedIds.length}`" :value="selectedIds.length" /></a-card>
      </a-col>
    </a-row>

    <!-- 筛选 -->
    <a-card :bordered="false" style="margin-bottom: 16px">
      <a-row :gutter="12">
        <a-col :span="6">
          <a-input v-model="keyword" :placeholder="`搜索 ${title} 名称 / 编码`" allow-clear>
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterStatus" placeholder="状态" allow-clear>
            <a-option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select v-model="filterSubType" placeholder="子类" allow-clear>
            <a-option v-for="t in subTypes" :key="t" :value="t">{{ t }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-radio-group v-model="statusQuick" type="button" size="default">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="active">已上架</a-radio-button>
            <a-radio-button value="inactive">已下架</a-radio-button>
            <a-radio-button value="archived">已归档</a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>

      <!-- 批量操作 -->
      <a-row v-if="selectedIds.length > 0" style="margin-top: 12px">
        <a-col :span="24">
          <a-alert type="info" :show-icon="false">
            <template #title>
              已选 <strong>{{ selectedIds.length }}</strong> 项 · 
              <a-space>
                <a-button type="primary" size="small" status="success" @click="onBatch('on')">
                  <template #icon><icon-up /></template>批量上架
                </a-button>
                <a-button size="small" status="warning" @click="onBatch('off')">
                  <template #icon><icon-down /></template>批量下架
                </a-button>
                <a-button size="small" status="danger" @click="onBatch('archive')">
                  <template #icon><icon-archive /></template>批量归档
                </a-button>
                <a-button size="small" type="text" @click="selectedIds = []">清空选择</a-button>
              </a-space>
            </template>
          </a-alert>
        </a-col>
      </a-row>
    </a-card>

    <!-- 表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data="filtered"
        row-key="id"
        :pagination="{ pageSize: 10, showTotal: true }"
        :row-selection="{ selectedKeys: selectedIds, onChange: onSelectChange }"
        stripe
      >
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>
        <template #subType="{ record }">
          <a-tag>{{ record.subType }}</a-tag>
        </template>
        <template #tags="{ record }">
          <a-tag v-for="t in (record.tags || [])" :key="t" size="small" color="green">{{ t }}</a-tag>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-link @click="openDetail(record)">详情</a-link>
            <template v-if="record.status === 'inactive'">
              <a-link status="success" @click="onOne(record, 'on')">上架</a-link>
            </template>
            <template v-else-if="record.status === 'active'">
              <a-link status="warning" @click="onOne(record, 'off')">下架</a-link>
              <a-link status="danger" @click="onOne(record, 'archive')">归档</a-link>
            </template>
            <template v-else-if="record.status === 'archived'">
              <a-link status="warning" @click="onOne(record, 'restore')">恢复</a-link>
            </template>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 详情抽屉 -->
    <a-drawer v-model:visible="detailVisible" :title="`${title} · ${current?.id}`" :width="720" :footer="false">
      <template v-if="current">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="编号">{{ current.id }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="statusColor(current.status)">{{ statusLabel(current.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="名称" :span="2">{{ current.name }}</a-descriptions-item>
          <a-descriptions-item label="编码/路径" :span="2"><a-tag color="cyan">{{ current.code }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="子类">{{ current.subType }}</a-descriptions-item>
          <a-descriptions-item label="Owner">{{ current.owner }}</a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">{{ current.description }}</a-descriptions-item>
          <a-descriptions-item v-if="current.sourceSystem" label="来源系统">{{ current.sourceSystem }}</a-descriptions-item>
          <a-descriptions-item v-if="current.collection" label="所属集合">{{ current.collection }}</a-descriptions-item>
          <a-descriptions-item label="上架时间">{{ current.onShelfAt || '-' }}</a-descriptions-item>
          <a-descriptions-item label="下架时间">{{ current.offShelfAt || '-' }}</a-descriptions-item>
          <a-descriptions-item label="标签" :span="2">
            <a-tag v-for="t in (current.tags || [])" :key="t" color="green">{{ t }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <h3 style="margin-top: 24px">流转历史 ({{ current.history.length }})</h3>
        <a-empty v-if="current.history.length === 0" description="暂无历史" />
        <a-timeline v-else>
          <a-timeline-item v-for="(h, i) in current.history" :key="i">
            <div>
              <strong>{{ actionLabel(h.action) }}</strong>
              <a-tag size="small" style="margin-left: 8px" v-if="h.from">{{ statusLabel(h.from) }} → {{ statusLabel(h.to) }}</a-tag>
            </div>
            <div style="color: #86909c; font-size: 12px; margin-top: 2px">{{ h.ts }} · {{ h.actor }}</div>
            <div v-if="h.comment" style="margin-top: 4px">备注:{{ h.comment }}</div>
          </a-timeline-item>
        </a-timeline>
      </template>
    </a-drawer>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import {
  ShelfStore,
  SHELF_STATUSES,
  SHELF_STATUS_LABEL,
  SHELF_STATUS_COLOR,
  SHELF_KIND_LABEL,
  SHELF_RESOURCE_SUBTYPES,
  SHELF_ASSET_SUBTYPES,
  SHELF_ELEMENT_SUBTYPES,
  type ShelfItem,
  type ShelfStatus,
  type ShelfAction,
  type ShelfKind
} from '@/mock-shared/shelf-store'

const props = defineProps<{ kind: ShelfKind; title: string; subtitle: string }>()

const router = useRouter()

const all = ref<ShelfItem[]>([])
function refresh() { all.value = ShelfStore.byKind(props.kind) }
onMounted(refresh)

const keyword = ref('')
const filterStatus = ref<ShelfStatus | undefined>()
const filterSubType = ref<string | undefined>()
const statusQuick = ref<'all' | ShelfStatus>('all')
const selectedIds = ref<string[]>([])

const statuses = SHELF_STATUSES.map(s => ({ value: s, label: SHELF_STATUS_LABEL[s] }))
const subTypes = computed(() => {
  return props.kind === 'resource' ? SHELF_RESOURCE_SUBTYPES
    : props.kind === 'asset' ? SHELF_ASSET_SUBTYPES
    : SHELF_ELEMENT_SUBTYPES
})

const filtered = computed(() => all.value.filter(x => {
  if (keyword.value && !x.name.includes(keyword.value) && !x.code.includes(keyword.value)) return false
  if (filterStatus.value && x.status !== filterStatus.value) return false
  if (filterSubType.value && x.subType !== filterSubType.value) return false
  if (statusQuick.value !== 'all' && x.status !== statusQuick.value) return false
  return true
}))

const counts = computed(() => ({
  active: all.value.filter(x => x.status === 'active').length,
  inactive: all.value.filter(x => x.status === 'inactive').length,
  archived: all.value.filter(x => x.status === 'archived').length
}))

const columns = [
  { title: '编号', dataIndex: 'id', width: 100 },
  { title: '名称', dataIndex: 'name', width: 220 },
  { title: '子类', dataIndex: 'subType', slotName: 'subType', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '标签', dataIndex: 'tags', slotName: 'tags' },
  { title: '操作', slotName: 'actions', width: 220, fixed: 'right' }
]

function statusColor(s: ShelfStatus) { return SHELF_STATUS_COLOR[s] }
function statusLabel(s: ShelfStatus) { return SHELF_STATUS_LABEL[s] }
function actionLabel(a: ShelfAction) {
  return ({ on: '上架', off: '下架', archive: '归档', restore: '恢复', update: '更新' } as any)[a] || a
}

function onSelectChange(keys: string[]) { selectedIds.value = keys }

function onOne(item: ShelfItem, action: 'on' | 'off' | 'archive' | 'restore') {
  const map = { on: '上架', off: '下架', archive: '归档', restore: '恢复' }
  Modal.confirm({
    title: `${map[action]}「${item.name}」`,
    content: action === 'archive' ? '归档后将无法被业务系统发现,且需要"恢复"才能再次使用' : action === 'off' ? '下架后业务系统将不可见,但数据保留' : '确认执行?',
    okText: `确认${map[action]}`,
    cancelText: '取消',
    onOk: () => doAction([item.id], action)
  })
}

function onBatch(action: 'on' | 'off' | 'archive') {
  const map = { on: '批量上架', off: '批量下架', archive: '批量归档' }
  Modal.confirm({
    title: map[action] + ` (${selectedIds.value.length} 项)`,
    content: `确定要对选中的 ${selectedIds.value.length} 项执行此操作?`,
    okText: '确认',
    cancelText: '取消',
    onOk: () => doAction(selectedIds.value.slice(), action)
  })
}

function doAction(ids: string[], action: 'on' | 'off' | 'archive' | 'restore') {
  if (action === 'on') ShelfStore.batchOn(ids)
  else if (action === 'off') ShelfStore.batchOff(ids, '批量操作')
  else if (action === 'archive') ShelfStore.batchArchive(ids, '批量操作')
  else ids.forEach(id => ShelfStore.restore(id, '批量操作'))
  Message.success(`已${actionLabel(action)} ${ids.length} 项`)
  selectedIds.value = []
  refresh()
}

const detailVisible = ref(false)
const current = ref<ShelfItem | null>(null)
function openDetail(item: ShelfItem) { current.value = item; detailVisible.value = true }

const goBack = () => router.push('workbench')

// 暴露给"批量上下架"页用
defineExpose({ refresh, all })
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
</style>