<template>
  <div class="variable-management-page">
    <DmtPageHeader title="变量台账" subtitle="以变量台账为中心，承载注册、分类、审批、评估与治理闭环。" :show-back="false">
      <template #extra>
        <a-input
          v-model="globalKeyword"
          class="header-search"
          size="large"
          allow-clear
          placeholder="全局搜索：名称 / 编码 / 描述 / 责任人"
          @input="handleGlobalSearch"
          @clear="handleGlobalSearch"
        >
          <template #prefix><icon-search /></template>
        </a-input>
        <a-dropdown trigger="click" @select="handleCreateMenuSelect">
          <a-button type="primary">
            <template #icon><icon-plus /></template>
            新建变量
          </a-button>
          <template #content>
            <a-doption value="create">注册为变量</a-doption>
            <a-doption value="incremental">导入更新</a-doption>
          </template>
        </a-dropdown>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出
        </a-button>
      </template>
    </DmtPageHeader>

  <div class="page-content">
      <DmtStatGroup :items="statItems" />

      <div class="view-mode-bar">
        <a-radio-group
          v-model="viewMode"
          type="button"
          size="large"
          @change="handleViewModeChange"
        >
          <a-radio value="all">全部视图</a-radio>
          <a-radio value="effect">效果视角</a-radio>
          <a-radio value="cost">成本视角</a-radio>
        </a-radio-group>
        <div class="view-mode-hint">
          <template v-if="viewMode === 'effect'">
            按 IV（信息价值）降序排列，关注变量区分度
          </template>
          <template v-else-if="viewMode === 'cost'">
            按月均成本降序排列，关注高成本变量
          </template>
          <template v-else>
            完整列表视图，按更新时间倒序
          </template>
        </div>
      </div>

      <a-card class="filter-card">
        <a-form :model="filterForm" layout="inline">
          <a-form-item label="变量类型">
            <a-select
              v-model="filterForm.type"
              placeholder="全部类型"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="numerical">数值型</a-option>
              <a-option value="categorical">分类型</a-option>
              <a-option value="text">文本型</a-option>
              <a-option value="datetime">时间型</a-option>
              <a-option value="boolean">布尔型</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model="filterForm.status"
              placeholder="全部状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="draft">草稿</a-option>
              <a-option value="pending">待审核</a-option>
              <a-option value="active">已发布</a-option>
              <a-option value="inactive">已停用</a-option>
              <a-option value="expired">已过期</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="数据源">
            <a-select
              v-model="filterForm.dataSource"
              placeholder="全部数据源"
              allow-clear
              @change="handleSearch"
            >
              <a-option v-for="source in dataSources" :key="source.id" :value="source.id">
                {{ source.name }}
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleReset">重置</a-button>
            <a-button style="margin-left: 8px" @click="openSaveViewModal">保存视图</a-button>
            <a-dropdown trigger="click" @select="handleSelectSavedView">
              <a-link style="margin-left: 12px">已保存视图（{{ savedViews.length }}）</a-link>
              <template #content>
                <a-doption v-if="!savedViews.length" value="__empty" disabled>暂无保存的视图</a-doption>
                <a-doption v-for="item in savedViews" :key="item.id" :value="item.id">
                  {{ item.name }} ({{ item.filters.type || '全部' }} / {{ item.filters.status || '全部' }})
                </a-doption>
              </template>
            </a-dropdown>
            <a-link style="margin-left: 12px" @click="router.push('/explore/taxonomy')">管理变量类型/分类</a-link>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card class="table-card">
        <a-space class="batch-toolbar" align="center" wrap>
          <a-space wrap>
            <a-tag :color="overSelectionLimit ? 'red' : 'arcoblue'">
              已选 {{ selectedRowKeys.length }} / {{ SELECTION_LIMIT }} 个变量{{ overSelectionLimit ? '（超过上限）' : '' }}
            </a-tag>
            <a-tag v-if="selectedDataSourceLabel" color="purple">当前数据源：{{ selectedDataSourceLabel }}</a-tag>
            <a-alert v-if="overSelectionLimit" type="warning" :show-icon="false">
              建议分批（单次 ≤ 200），可在「保存视图」后分次执行批量动作
            </a-alert>
            <span class="batch-hint" v-else>可先按数据源筛选，再从台账勾选变量发起探索课题或评估任务。</span>
          </a-space>
          <a-space>
            <a-button :disabled="!selectedRowKeys.length" @click="openBatchTopicModal">批量发起探索课题</a-button>
            <a-button type="primary" status="warning" :disabled="!selectedRowKeys.length" @click="openBatchEvaluationModal">
              批量发起评估
            </a-button>
          </a-space>
        </a-space>

        <a-modal
          v-model:visible="incrementalModalVisible"
          title="导入更新变量"
          width="600px"
          @ok="confirmIncrementalUpload"
          @cancel="incrementalModalVisible = false"
        >
          <a-upload :auto-upload="false" :limit="1" :accept="'.xlsx,.xls'" @change="handleIncrementalFileChange">
            <a-button>选择Excel文件</a-button>
          </a-upload>
          <div style="margin-top: 12px">已解析记录数：{{ incrementalFileCount }}</div>
        </a-modal>

        <a-modal v-model:visible="createPathVisible" title="新建变量（Demo）" ok-text="继续" cancel-text="取消" @ok="confirmCreatePath">
      <a-space direction="vertical" fill>
        <a-alert type="info" :show-icon="false">
          以变量台账为中心：可选择"发起探索课题"沉淀过程证据链，或"直接上线"进入上线与治理流程。
        </a-alert>
        <a-form :model="createPathForm" layout="vertical">
          <a-form-item label="路径选择">
            <a-radio-group v-model="createPathForm.mode">
              <a-radio value="topic">发起探索课题</a-radio>
              <a-radio value="online">直接上线</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="变量名称（示例）">
            <a-input v-model="createPathForm.name" allow-clear placeholder="例如：多头借贷组合变量v2" />
          </a-form-item>
        </a-form>
      </a-space>
    </a-modal>

    <!-- 保存视图弹窗 -->
    <a-modal
      v-model:visible="saveViewVisible"
      title="保存当前筛选视图"
      ok-text="保存"
      cancel-text="取消"
      @ok="confirmSaveView"
    >
      <a-form :model="saveViewForm" layout="vertical">
        <a-form-item label="视图名称" required>
          <a-input v-model="saveViewForm.name" placeholder="例如：风控外数待评估" />
        </a-form-item>
        <a-form-item label="说明">
          <a-textarea v-model="saveViewForm.description" :max-length="100" show-word-limit placeholder="可选：用途说明" />
        </a-form-item>
        <a-alert type="info" :show-icon="false">
          保存当前筛选条件：关键词 / 类型 / 状态 / 数据源。后续可在「已保存视图」快速恢复。
        </a-alert>
      </a-form>
    </a-modal>

        <a-modal
          v-model:visible="batchTopicVisible"
          title="批量发起探索课题"
          ok-text="创建课题"
          cancel-text="取消"
          @ok="submitBatchTopic"
        >
          <a-form :model="batchTopicForm" layout="vertical">
            <a-alert class="batch-modal-alert" :show-icon="false">
              将基于已选 {{ selectedRows.length }} 个变量创建 1 个探索课题，并自动挂接数据源与关联变量。
            </a-alert>
            <a-form-item label="课题名称">
              <a-input v-model="batchTopicForm.name" placeholder="例如：行为变量批量探索_202606" />
            </a-form-item>
            <a-form-item label="业务问题">
              <a-textarea v-model="batchTopicForm.businessProblem" :max-length="120" show-word-limit />
            </a-form-item>
            <a-form-item label="变量假设">
              <a-textarea v-model="batchTopicForm.hypothesis" :max-length="120" show-word-limit />
            </a-form-item>
            <a-form-item label="业务域">
              <a-select v-model="batchTopicForm.domain" :options="domainOptions" />
            </a-form-item>
            <a-form-item label="目标变量类型">
              <a-select v-model="batchTopicForm.variableTypeId" allow-clear :options="variableTypeOptions" placeholder="可选，混合变量时可暂不指定" />
            </a-form-item>
            <a-form-item label="探索分类">
              <a-select v-model="batchTopicForm.exploreCategoryId" allow-clear :options="categoryOptions" placeholder="按变量类型选择探索分类" />
            </a-form-item>
            <a-form-item label="可见性">
              <a-select v-model="batchTopicForm.visibility" :options="visibilityOptions" />
            </a-form-item>
          </a-form>
        </a-modal>

        <a-modal
          v-model:visible="batchEvaluationVisible"
          title="批量发起评估"
          ok-text="创建任务"
          cancel-text="取消"
          @ok="submitBatchEvaluation"
        >
          <a-form :model="batchEvaluationForm" layout="vertical">
            <a-alert class="batch-modal-alert" :show-icon="false">
              任务将进入“评估任务中心”，可继续执行 mock 运行并查看覆盖率、IV、KS 等结果摘要。
            </a-alert>
            <a-form-item label="任务名称">
              <a-input v-model="batchEvaluationForm.name" placeholder="例如：外数变量批量准入评估" />
            </a-form-item>
            <a-form-item label="任务类型">
              <a-select v-model="batchEvaluationForm.taskType" :options="taskTypeOptions" />
            </a-form-item>
            <a-form-item label="任务说明">
              <a-textarea v-model="batchEvaluationForm.description" :max-length="120" show-word-limit />
            </a-form-item>
          </a-form>
        </a-modal>

        <a-table
          :data="variableList"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          :row-selection="rowSelection"
          row-key="id"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
        >
          <template #name="{ record }">
            <a-link @click="handleViewDetail(record)">{{ record.name }}</a-link>
          </template>
          <template #type="{ record }">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeLabel(record.type) }}
            </a-tag>
          </template>
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template #sourceType="{ record }">
            <a-tag :color="getSourceTypeColor(record.sourceType)">
              {{ getSourceTypeLabel(record.sourceType) }}
            </a-tag>
          </template>

          <!-- 效果视角列渲染 -->
          <template #ivCell="{ record }">
            <span class="effect-number">{{ record.effectMetrics?.iv?.toFixed(2) ?? '—' }}</span>
            <span v-if="getEffectLevel(record.effectMetrics?.iv, 'iv')" class="effect-badge" :class="`effect-${getEffectLevel(record.effectMetrics?.iv, 'iv')}`">
              {{ getEffectLevelLabel(record.effectMetrics?.iv, 'iv') }}
            </span>
          </template>
          <template #ksCell="{ record }">
            <span class="effect-number">{{ record.effectMetrics?.ks?.toFixed(2) ?? '—' }}</span>
          </template>
          <template #aucCell="{ record }">
            <span class="effect-number">{{ record.effectMetrics?.auc?.toFixed(2) ?? '—' }}</span>
          </template>
          <template #coverageCell="{ record }">
            <span class="effect-number">{{ ((record.effectMetrics?.coverage || 0) * 100).toFixed(0) }}%</span>
          </template>
          <template #liftCell="{ record }">
            <span v-if="record.effectMetrics?.lift != null" :class="['lift', record.effectMetrics.lift >= 0 ? 'lift-up' : 'lift-down']">
              {{ record.effectMetrics.lift >= 0 ? '+' : '' }}{{ record.effectMetrics.lift }}%
            </span>
            <span v-else>—</span>
          </template>

          <!-- 成本视角列渲染 -->
          <template #priceCell="{ record }">
            <span v-if="record.costMetrics?.pricePerCall > 0">¥{{ record.costMetrics.pricePerCall.toFixed(2) }}</span>
            <a-tag v-else color="green" size="small">内部数据</a-tag>
          </template>
          <template #callsCell="{ record }">
            <span>{{ formatNumber(record.costMetrics?.monthlyCalls) }}</span>
          </template>
          <template #monthlyCostCell="{ record }">
            <span v-if="record.costMetrics?.monthlyCost > 0" class="cost-highlight">¥{{ formatNumber(record.costMetrics.monthlyCost) }}</span>
            <span v-else class="cost-zero">¥0</span>
          </template>
          <template #trendCell="{ record }">
            <a-tag v-if="record.costMetrics?.costTrend === 'up'" color="red" size="small">↑ 上升</a-tag>
            <a-tag v-else-if="record.costMetrics?.costTrend === 'down'" color="green" size="small">↓ 下降</a-tag>
            <a-tag v-else color="gray" size="small">— 平稳</a-tag>
          </template>

          <template #actions="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleViewDetail(record)">
                详情
              </a-button>
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button
                v-if="record.sourceType === 'external' && record.sourceRefs?.externalArchiveId"
                type="text"
                size="small"
                @click="openExternalArchive(record)"
              >
                外数档案
              </a-button>
              <a-button
                type="text"
                size="small"
                :status="record.status === 'active' ? 'warning' : 'normal'"
                @click="handleToggleStatus(record)"
              >
                {{ record.status === 'active' ? '停用' : '启用' }}
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { useVariableStore } from '@/modules/variable-hub/store/variable'
import { incrementalImportVariables, getDataSources } from '@/modules/variable-hub/api/variable-management'
import * as XLSX from 'xlsx'
import { buildRiskAppUrl } from '@/utils/appLinks'
import { VariableDraftStore } from '@/modules/variable-hub/mock/variable-management/variable-draft-store'
import { VariableStatusStore } from '@/modules/variable-hub/mock/variable-management/variable-status-store'
import { variableStatus } from '@/modules/variable-hub/constants/statusMap'
import DmtPageHeader from '@/modules/variable-hub/components/PageHeader.vue'
import DmtStatGroup from '@/modules/variable-hub/components/StatGroup.vue'
import { ExploreStore } from '@/modules/variable-hub/mock/explore/explore-store'
import { ExploreTaxonomyStore } from '@/modules/variable-hub/mock/explore/explore-taxonomy-store'
import EvaluationTaskStore from '@/modules/variable-hub/mock/evaluation/evaluation-task-store'

const router = useRouter()
const variableStore = useVariableStore()

const stats = computed(() => variableStore.variableStats)

const statItems = computed(() => [
  { title: '变量总数', value: stats.value.total, iconText: '#', iconBg: '#f0f7ff', iconColor: '#165dff', subtitle: '当前台账' },
  { title: '活跃变量', value: stats.value.active, tag: 'active', tagColor: 'green', iconText: '✓', iconBg: '#e8ffea', iconColor: '#00b42a', subtitle: '已发布可用' },
  { title: '待审核', value: stats.value.pending, tag: 'pending', tagColor: 'orange', iconText: '!', iconBg: '#fff7e8', iconColor: '#ff7d00', subtitle: '审批中' },
  { title: '已停用', value: stats.value.inactive, iconText: '×', iconBg: '#fff1f0', iconColor: '#f53f3f', subtitle: '已停用/归档' }
])

const filterForm = reactive({
  keyword: '',
  type: '',
  status: '',
  dataSource: ''
})

// 视图模式：all / effect / cost
const viewMode = ref('all')

const dataSources = ref([])
const variableList = computed(() => {
  const list = variableStore.filteredVariables || []
  if (viewMode.value === 'effect') {
    return [...list].sort((a, b) => (b.effectMetrics?.iv || 0) - (a.effectMetrics?.iv || 0))
  }
  if (viewMode.value === 'cost') {
    return [...list].sort((a, b) => (b.costMetrics?.monthlyCost || 0) - (a.costMetrics?.monthlyCost || 0))
  }
  return list
})
const loading = computed(() => variableStore.variableLoading)

const selectedRowKeys = ref([])
const selectedRows = ref([])

const handleViewModeChange = () => {
  // 切换视图时清空已选，避免跨视图选择混淆
  selectedRowKeys.value = []
  selectedRows.value = []
}

// 全局搜索（顶部常驻）
const globalKeyword = ref('')
const handleGlobalSearch = () => {
  filterForm.keyword = globalKeyword.value
  pagination.current = 1
  fetchVariableList()
}

// 多选上限：单次最多 200，超出提示并自动截断
const SELECTION_LIMIT = 200
const overSelectionLimit = computed(() => selectedRowKeys.value.length > SELECTION_LIMIT)

// 已保存视图
const savedViews = ref([])
const VIEW_STORAGE_KEY = 'variable.management.savedViews'
const loadSavedViews = () => {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY)
    savedViews.value = raw ? JSON.parse(raw) : []
  } catch {
    savedViews.value = []
  }
}
loadSavedViews()

const saveViewVisible = ref(false)
const saveViewForm = reactive({ name: '', description: '' })

const openSaveViewModal = () => {
  saveViewForm.name = ''
  saveViewForm.description = ''
  saveViewVisible.value = true
}

const confirmSaveView = () => {
  if (!saveViewForm.name.trim()) {
    Message.warning('请输入视图名称')
    return false
  }
  const view = {
    id: `VIEW-${Date.now()}`,
    name: saveViewForm.name.trim(),
    description: saveViewForm.description.trim(),
    filters: { ...filterForm, keyword: globalKeyword.value },
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  savedViews.value = [view, ...savedViews.value]
  localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(savedViews.value))
  Message.success(`已保存视图：${view.name}`)
  return true
}

const handleSelectSavedView = (val) => {
  if (val === '__empty') return
  const view = savedViews.value.find((v) => v.id === val)
  if (!view) return
  globalKeyword.value = view.filters.keyword || ''
  filterForm.keyword = view.filters.keyword || ''
  filterForm.type = view.filters.type || ''
  filterForm.status = view.filters.status || ''
  filterForm.dataSource = view.filters.dataSource || ''
  pagination.current = 1
  fetchVariableList()
  Message.success(`已应用视图：${view.name}`)
}

const rowSelection = computed(() => ({
  type: 'checkbox',
  showCheckedAll: true,
  selectedRowKeys: selectedRowKeys.value
}))

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

watch(
  () => variableStore.pagination,
  (p) => {
    pagination.current = p.page
    pagination.pageSize = p.pageSize
    pagination.total = p.total
  },
  { deep: true, immediate: true }
)

const columnsAll = [
  { title: '变量名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '变量编码', dataIndex: 'code', width: 180 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '来源', dataIndex: 'sourceType', slotName: 'sourceType', width: 100 },
  { title: '数据源', dataIndex: 'dataSourceName', width: 150 },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 180, fixed: 'right' }
]

const columnsEffect = [
  { title: '变量名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: 'IV', dataIndex: 'effectMetrics', slotName: 'ivCell', width: 100, align: 'right' },
  { title: 'KS', dataIndex: 'effectMetrics', slotName: 'ksCell', width: 100, align: 'right' },
  { title: 'AUC', dataIndex: 'effectMetrics', slotName: 'aucCell', width: 100, align: 'right' },
  { title: '覆盖率', dataIndex: 'effectMetrics', slotName: 'coverageCell', width: 100, align: 'right' },
  { title: '提升度', dataIndex: 'effectMetrics', slotName: 'liftCell', width: 100, align: 'right' },
  { title: '数据源', dataIndex: 'dataSourceName', width: 140 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 180, fixed: 'right' }
]

const columnsCost = [
  { title: '变量名称', dataIndex: 'name', slotName: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '来源', dataIndex: 'sourceType', slotName: 'sourceType', width: 100 },
  { title: '单价(元/次)', dataIndex: 'costMetrics', slotName: 'priceCell', width: 120, align: 'right' },
  { title: '月均调用', dataIndex: 'costMetrics', slotName: 'callsCell', width: 130, align: 'right' },
  { title: '月均成本', dataIndex: 'costMetrics', slotName: 'monthlyCostCell', width: 140, align: 'right' },
  { title: '趋势', dataIndex: 'costMetrics', slotName: 'trendCell', width: 90 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 180, fixed: 'right' }
]

const columns = computed(() => {
  if (viewMode.value === 'effect') return columnsEffect
  if (viewMode.value === 'cost') return columnsCost
  return columnsAll
})

const typeMap = {
  numerical: { label: '数值型', color: 'blue' },
  categorical: { label: '分类型', color: 'green' },
  text: { label: '文本型', color: 'orange' },
  datetime: { label: '时间型', color: 'purple' },
  boolean: { label: '布尔型', color: 'cyan' }
}

/**
 * IV 等级：
 *  - < 0.02 弱
 *  - 0.02~0.1 中
 *  - 0.1~0.3 强
 *  - >= 0.3 极强
 */
const getEffectLevel = (value, key) => {
  if (value == null) return ''
  if (key === 'iv') {
    if (value >= 0.3) return 'strong'
    if (value >= 0.1) return 'medium'
    if (value >= 0.02) return 'weak'
    return 'low'
  }
  return ''
}

const getEffectLevelLabel = (value, key) => {
  const level = getEffectLevel(value, key)
  if (key === 'iv') {
    return { strong: '强', medium: '中', weak: '弱', low: '低' }[level] || ''
  }
  return ''
}

/**
 * 数字千分位格式化
 */
const formatNumber = (value) => {
  if (value == null) return '—'
  return Number(value).toLocaleString('zh-CN')
}

const statusMap = {
  draft: { label: '草稿', color: 'gray' },
  pending: { label: '待审核', color: 'orange' },
  active: { label: '已发布', color: 'green' },
  inactive: { label: '已停用', color: 'red' },
  expired: { label: '已过期', color: 'lightgray' }
}

const sourceTypeMap = {
  external: { label: '外数', color: 'arcoblue' },
  internal: { label: '内数', color: 'blue' },
  credit: { label: '征信', color: 'purple' }
}

const domainOptions = [
  { label: '风控', value: '风控' },
  { label: '营销', value: '营销' },
  { label: '反欺诈', value: '反欺诈' },
  { label: '客户画像', value: '客户画像' }
]

const visibilityOptions = [
  { label: '团队内', value: 'team' },
  { label: '全公司可见', value: 'company' },
  { label: '仅审计可见', value: 'audit' }
]

const taskTypeOptions = [
  { label: '准入评估', value: 'access' },
  { label: '复评任务', value: 'recheck' },
  { label: '对比评估', value: 'comparison' }
]

const variableTypeOptions = computed(() =>
  ExploreTaxonomyStore.listTypes().map((item) => ({ label: item.title, value: item.id }))
)

const createPathVisible = ref(false)
const createPathForm = reactive({
  mode: 'topic',
  name: ''
})

const incrementalModalVisible = ref(false)
const incrementalFileCount = ref(0)
const incrementalRecords = ref([])

const batchTopicVisible = ref(false)
const batchTopicForm = reactive({
  name: '',
  businessProblem: '',
  hypothesis: '',
  domain: '风控',
  visibility: 'team',
  variableTypeId: '',
  exploreCategoryId: ''
})

watch(
  () => batchTopicForm.variableTypeId,
  () => {
    batchTopicForm.exploreCategoryId = ''
  }
)

const categoryOptions = computed(() => {
  if (!batchTopicForm.variableTypeId) return []
  return ExploreTaxonomyStore.listLeafCategories(batchTopicForm.variableTypeId).map((item) => ({
    label: item.title,
    value: item.id
  }))
})

const batchEvaluationVisible = ref(false)
const batchEvaluationForm = reactive({
  name: '',
  taskType: 'access',
  description: ''
})

const getTypeLabel = (type) => typeMap[type]?.label || type
const getTypeColor = (type) => typeMap[type]?.color || 'gray'
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusColor = (status) => statusMap[status]?.color || 'gray'
const getSourceTypeLabel = (sourceType) => sourceTypeMap[sourceType]?.label || (sourceType || '—')
const getSourceTypeColor = (sourceType) => sourceTypeMap[sourceType]?.color || 'gray'

const selectedDataSourceMeta = computed(() => {
  if (filterForm.dataSource) {
    return dataSources.value.find((item) => item.id === filterForm.dataSource)
  }
  const ids = [...new Set(selectedRows.value.map((item) => item.dataSource).filter(Boolean))]
  if (ids.length === 1) {
    return dataSources.value.find((item) => item.id === ids[0]) || {
      id: ids[0],
      name: selectedRows.value[0]?.dataSourceName || ids[0]
    }
  }
  return null
})

const selectedDataSourceLabel = computed(() => selectedDataSourceMeta.value?.name || '')

function clearSelection() {
  selectedRowKeys.value = []
  selectedRows.value = []
}

function inferVariableTypeId(rows) {
  const mapped = rows
    .map((item) => item.category || (item.sourceType === 'credit' ? 'credit' : item.sourceType === 'external' ? 'external' : 'behavior'))
    .filter(Boolean)
  const unique = [...new Set(mapped)]
  return unique.length === 1 ? unique[0] : ''
}

function buildBatchTopicPrefill() {
  const inferredTypeId = inferVariableTypeId(selectedRows.value)
  const dsLabel = selectedDataSourceLabel.value || '变量'
  batchTopicForm.name = `${dsLabel}_批量探索_${new Date().toISOString().slice(0, 10)}`
  batchTopicForm.businessProblem = `当前从变量台账中选中了 ${selectedRows.value.length} 个变量，需统一评估变量口径、可复用性与补充空间。`
  batchTopicForm.hypothesis = '已选变量可进一步形成组合方案或衍生规则，需在课题内沉淀实验与决策证据链。'
  batchTopicForm.domain = '风控'
  batchTopicForm.visibility = 'team'
  batchTopicForm.variableTypeId = inferredTypeId
  batchTopicForm.exploreCategoryId = ''
}

function buildBatchEvaluationPrefill() {
  const dsLabel = selectedDataSourceLabel.value || '变量'
  batchEvaluationForm.name = `${dsLabel}_批量评估_${new Date().toISOString().slice(0, 10)}`
  batchEvaluationForm.taskType = 'access'
  batchEvaluationForm.description = `基于变量台账已选 ${selectedRows.value.length} 个变量创建 mock 评估任务，后续在任务中心执行并沉淀评估结果。`
}

const fetchDataSources = async () => {
  try {
    const res = await getDataSources()
    if (res.code === 200) {
      dataSources.value = res.data || []
    }
  } catch (error) {
    console.error('获取数据源列表失败:', error)
  }
}

const fetchVariableList = async () => {
  try {
    await variableStore.fetchVariableList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword,
      type: filterForm.type,
      status: filterForm.status,
      dataSource: filterForm.dataSource
    })
  } catch (error) {
    console.error('获取变量列表失败:', error)
    Message.error('获取变量列表失败')
  }
}

const handleSearch = () => {
  variableStore.updateFilters({
    keyword: filterForm.keyword,
    type: filterForm.type,
    status: filterForm.status,
    dataSource: filterForm.dataSource
  })
  pagination.current = 1
  clearSelection()
  fetchVariableList()
}

const handleReset = () => {
  filterForm.keyword = ''
  filterForm.type = ''
  filterForm.status = ''
  filterForm.dataSource = ''
  variableStore.resetFilters()
  clearSelection()
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.current = page
  clearSelection()
  fetchVariableList()
}

const handleSelectionChange = (keys) => {
  if (keys.length > SELECTION_LIMIT) {
    // 截断：仅保留前 SELECTION_LIMIT 条，提示用户
    const limited = keys.slice(0, SELECTION_LIMIT)
    Message.warning(`单次最多批量操作 ${SELECTION_LIMIT} 个变量，已自动截断超出部分。请保存视图后分批执行。`)
    selectedRowKeys.value = limited
    selectedRows.value = variableList.value.filter((item) => limited.includes(item.id))
    return
  }
  selectedRowKeys.value = keys
  selectedRows.value = variableList.value.filter((item) => keys.includes(item.id))
}

const handleViewDetail = (record) => {
  router.push({ name: 'VariableAssetDetail', params: { id: record.id, mode: 'view' } })
}

const openExternalArchive = (record) => {
  const id = record?.sourceRefs?.externalArchiveId
  if (!id) return
  window.open(buildRiskAppUrl(`/risk/external-data/archive/${id}`), '_blank')
}

const handleEdit = (record) => {
  router.push({ name: 'VariableAssetDetail', params: { id: record.id, mode: 'edit' } })
}

const handleToggleStatus = async (record) => {
  try {
    const isActive = record.status === 'active'
    if (!isActive) {
      // 启用：跳转到详情页"提交上线申请"
      Message.info('请到变量详情页提交上线申请')
      router.push({ name: 'VariableAssetDetail', params: { id: record.id, mode: 'view' } })
      return
    }
    Modal.confirm({
      title: '确认停用',
      content: `确定要停用变量"${record.name}"吗？停用后变量将不再对外提供，可重新启用。`,
      onOk: async () => {
        VariableStatusStore.setStatus(String(record.id), 'inactive', 'Demo 用户', '台账直接停用')
        Message.success('变量已停用')
        fetchVariableList()
      }
    })
  } catch (error) {
    Message.error('状态更新失败')
  }
}

const handleExport = () => {
  Message.info('导出功能开发中...')
}

const showIncrementalModal = () => {
  incrementalModalVisible.value = true
  incrementalFileCount.value = 0
  incrementalRecords.value = []
}

const handleCreateMenuSelect = (val) => {
  if (val === 'create') {
    createPathForm.mode = 'topic'
    createPathForm.name = ''
    createPathVisible.value = true
  } else if (val === 'incremental') {
    showIncrementalModal()
  }
}

const confirmCreatePath = () => {
  const name = createPathForm.name?.trim() || '新建变量草稿（Demo）'
  if (createPathForm.mode === 'topic') {
    Message.info('已进入探索课题列表，可在课题详情内决策采纳后生成草稿回到台账')
    router.push('/explore/topics')
    return
  }
  const draft = VariableDraftStore.addDraft({
    name,
    code: `DRAFT_${Date.now()}`,
    category: 'behavior',
    sourceType: 'internal',
    dataSourceName: '变量中心（Demo）',
    description: '由台账直接上线创建的变量草稿（Demo）'
  })
  router.push({ name: 'VariableAssetDetail', params: { id: draft.id, mode: 'edit' }, query: { action: 'online' } })
}

const openBatchTopicModal = () => {
  if (!selectedRows.value.length) {
    Message.warning('请先勾选变量')
    return
  }
  if (selectedRows.value.length > 50) {
    Modal.confirm({
      title: '批量发起确认',
      content: `已选 ${selectedRows.value.length} 个变量，过程信息将汇总在 1 个探索课题中。是否继续？`,
      okText: '继续',
      onOk: () => {
        buildBatchTopicPrefill()
        batchTopicVisible.value = true
      }
    })
    return
  }
  buildBatchTopicPrefill()
  batchTopicVisible.value = true
}

const openBatchEvaluationModal = () => {
  if (!selectedRows.value.length) {
    Message.warning('请先勾选变量')
    return
  }
  if (selectedRows.value.length > 50) {
    Modal.confirm({
      title: '批量评估确认',
      content: `已选 ${selectedRows.value.length} 个变量，评估执行可能需要较长时间。是否继续？`,
      okText: '继续',
      onOk: () => {
        buildBatchEvaluationPrefill()
        batchEvaluationVisible.value = true
      }
    })
    return
  }
  buildBatchEvaluationPrefill()
  batchEvaluationVisible.value = true
}

const submitBatchTopic = () => {
  if (!batchTopicForm.name.trim()) {
    Message.warning('请填写课题名称')
    return
  }
  const ds = selectedDataSourceMeta.value
  const type = batchTopicForm.variableTypeId ? ExploreTaxonomyStore.getTypeById(batchTopicForm.variableTypeId) : undefined
  const category = batchTopicForm.variableTypeId
    ? ExploreTaxonomyStore.listLeafCategories(batchTopicForm.variableTypeId).find((item) => item.id === batchTopicForm.exploreCategoryId)
    : undefined
  const relatedResources = []
  if (ds) {
    relatedResources.push({ type: 'data_source', name: ds.id, displayName: ds.name })
  }
  selectedRows.value.forEach((item) => {
    relatedResources.push({ type: 'variable', name: item.id, displayName: `变量：${item.name}` })
  })
  const topic = ExploreStore.addTopic({
    name: batchTopicForm.name.trim(),
    businessProblem: batchTopicForm.businessProblem.trim(),
    hypothesis: batchTopicForm.hypothesis.trim(),
    domain: batchTopicForm.domain,
    visibility: batchTopicForm.visibility,
    variableTypeId: batchTopicForm.variableTypeId || undefined,
    variableTypeTags: type ? [type.title] : [],
    exploreCategoryId: batchTopicForm.exploreCategoryId || undefined,
    exploreCategoryTitle: category?.title,
    relatedDataSourceId: ds?.id,
    relatedDataSourceName: ds?.name,
    relatedVariableIds: selectedRows.value.map((item) => item.id),
    relatedResources
  })
  Message.success(`已基于 ${selectedRows.value.length} 个变量发起探索课题`)
  batchTopicVisible.value = false
  clearSelection()
  router.push(`/explore/topics/${topic.id}`)
}

const submitBatchEvaluation = () => {
  if (!batchEvaluationForm.name.trim()) {
    Message.warning('请填写任务名称')
    return
  }
  const ds = selectedDataSourceMeta.value
  const variableTypeId = inferVariableTypeId(selectedRows.value)
  const type = variableTypeId ? ExploreTaxonomyStore.getTypeById(variableTypeId) : null
  const task = EvaluationTaskStore.addTask({
    name: batchEvaluationForm.name.trim(),
    taskType: batchEvaluationForm.taskType,
    sourceType: 'variable_batch',
    sourceIds: selectedRows.value.map((item) => item.id),
    sourceNames: selectedRows.value.map((item) => item.name),
    description: batchEvaluationForm.description.trim(),
    dataSourceId: ds?.id,
    dataSourceName: ds?.name,
    variableTypeId: variableTypeId || undefined,
    variableTypeName: type?.title,
    targets: selectedRows.value.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      sourceType: item.sourceType,
      dataSourceName: item.dataSourceName
    }))
  })
  Message.success(`已创建评估任务 ${task.id}`)
  batchEvaluationVisible.value = false
  clearSelection()
  router.push('/evaluation/tasks')
}

const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) return resolve([])
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet)
        const records = json.map((r) => ({
          name: r.name || r.变量名称 || '',
          code: r.code || r.变量编码 || '',
          type: r.type || r.类型 || '',
          status: r.status || r.状态 || 'draft',
          dataSource: r.dataSource || r.数据源 || '',
          usageCount: Number(r.usageCount ?? r.使用次数 ?? 0),
          sourceField: r.sourceField ?? r.来源字段 ?? '',
          updateFrequency: r.updateFrequency ?? r.更新频率 ?? '',
          definition: r.definition ?? r.定义说明 ?? '',
          description: r.description ?? r.描述 ?? ''
        }))
        resolve(records)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const handleIncrementalFileChange = async (info) => {
  const file = info.file?.file
  if (!file) return
  try {
    const records = await parseExcelFile(file)
    incrementalRecords.value = records
    incrementalFileCount.value = records.length
  } catch (e) {
    Message.error('解析文件失败')
  }
}

const confirmIncrementalUpload = async () => {
  try {
    const res = await incrementalImportVariables(incrementalRecords.value)
    if (res.code === 200) {
      Message.success(`导入更新成功 ${res.data?.count || 0} 条`)
      incrementalModalVisible.value = false
      await fetchVariableList()
    }
  } catch (e) {
    Message.error('导入更新失败')
  }
}

onMounted(() => {
  fetchDataSources()
  fetchVariableList()
})
</script>

<style scoped>
.variable-management-page {
  padding: 16px;
  background-color: var(--subapp-bg-secondary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--subapp-text-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.global-search {
  flex: 1;
  min-width: 280px;
  max-width: 480px;
  margin: 0 16px;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: var(--subapp-text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--subapp-text-tertiary);
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.batch-toolbar {
  width: 100%;
  justify-content: space-between;
  margin-bottom: 16px;
}

.batch-hint {
  color: var(--color-text-3);
}

.batch-modal-alert {
  margin-bottom: 12px;
}

/* 视图模式 Segmented 控件 */
.view-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--color-border-2);
}

.view-mode-hint {
  font-size: 12px;
  color: #86909c;
}

/* 效果列样式 */
.effect-number {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: #1d2129;
  margin-right: 6px;
}

.effect-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  border-radius: 3px;
  font-weight: 500;
}

.effect-strong {
  background: #fff1f0;
  color: #f53f3f;
}

.effect-medium {
  background: #fff7e8;
  color: #ff7d00;
}

.effect-weak {
  background: #e6fffb;
  color: #0fc6c2;
}

.effect-low {
  background: #f2f3f5;
  color: #86909c;
}

/* 提升度 */
.lift {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.lift-up {
  color: #00b42a;
}

.lift-down {
  color: #f53f3f;
}

/* 成本列样式 */
.cost-highlight {
  font-weight: 600;
  color: #f53f3f;
  font-variant-numeric: tabular-nums;
}

.cost-zero {
  color: #c9cdd4;
}
</style>
