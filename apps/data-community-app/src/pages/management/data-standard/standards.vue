<template>
  <PageContainer>
    <PageHeader title="数据标准" sub-title="字段级标准定义 · 口径管理 · 合规检查 · 状态流转">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px" @click="onCreate">
          <template #icon><icon-plus /></template>
          新建标准
        </a-button>
      </template>
    </PageHeader>

    <a-card :bordered="false" class="filter-card">
      <a-row :gutter="16">
        <a-col :span="7">
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
            <a-option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="7" style="text-align: right">
          <a-radio-group v-model="statusQuickFilter" type="button" size="large">
            <a-radio-button value="all">全部 ({{ standards.length }})</a-radio-button>
            <a-radio-button value="pending">待审批 ({{ pendingCount }})</a-radio-button>
            <a-radio-button value="published">已发布 ({{ publishedCount }})</a-radio-button>
            <a-radio-button value="draft">草稿 ({{ draftCount }})</a-radio-button>
          </a-radio-group>
          <a-button @click="resetFilters" style="margin-left: 8px">重置</a-button>
        </a-col>
      </a-row>
      <div class="result-meta">
        共 <b>{{ filteredStandards.length }}</b> 个数据标准 · 待审批 <b style="color:#165dff">{{ pendingCount }}</b> · 已发布 <b style="color:#00b42a">{{ publishedCount }}</b> · 草稿 <b style="color:#ff7d00">{{ draftCount }}</b> · 已弃用 <b style="color:#86909c">{{ deprecatedCount }}</b>
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
      <!-- 2026-08-06:新增操作列,接入状态机 -->
      <template #actions="{ record }">
        <a-space>
          <a-link @click="openStandard(record)">详情</a-link>
          <template v-if="record.status === 'draft'">
            <a-link status="warning" @click="onSubmit(record)">提交审批</a-link>
          </template>
          <template v-else-if="record.status === 'pending'">
            <a-link status="success" @click="onApprove(record)">通过</a-link>
            <a-link status="danger" @click="onReject(record)">打回</a-link>
          </template>
          <template v-else-if="record.status === 'published'">
            <a-link status="danger" @click="onDeprecate(record)">弃用</a-link>
          </template>
          <template v-else-if="record.status === 'deprecated'">
            <a-link status="warning" @click="onRestore(record)">恢复</a-link>
          </template>
        </a-space>
      </template>
    </a-table>

    <!-- ====== 详情抽屉(查看 + 操作) ====== -->
    <a-drawer
      v-model:visible="detailVisible"
      :title="`标准详情 · ${currentStandard?.name || ''}`"
      :width="820"
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

        <!-- 状态机操作 -->
        <h3 style="margin-top: 24px">状态流转</h3>
        <a-steps :current="statusStepIndex" size="small" style="margin-bottom: 16px">
          <a-step title="草稿" description="编辑中" />
          <a-step title="待审批" description="已提交,等待治理者审批" />
          <a-step title="已发布" description="生效中,被业务使用" />
          <a-step title="已弃用" description="停止使用" />
        </a-steps>
        <a-space>
          <template v-if="currentStandard.status === 'draft'">
            <a-button type="primary" status="warning" @click="onSubmit(currentStandard)">
              <template #icon><icon-send /></template>提交审批
            </a-button>
          </template>
          <template v-else-if="currentStandard.status === 'pending'">
            <a-button type="primary" status="success" @click="onApprove(currentStandard)">
              <template #icon><icon-check /></template>审批通过
            </a-button>
            <a-button status="danger" @click="onReject(currentStandard)">
              <template #icon><icon-close /></template>打回草稿
            </a-button>
          </template>
          <template v-else-if="currentStandard.status === 'published'">
            <a-button status="danger" @click="onDeprecate(currentStandard)">
              <template #icon><icon-delete /></template>弃用标准
            </a-button>
          </template>
          <template v-else-if="currentStandard.status === 'deprecated'">
            <a-button status="warning" @click="onRestore(currentStandard)">
              <template #icon><icon-undo /></template>恢复为草稿
            </a-button>
          </template>
        </a-space>

        <!-- 历史轨迹 -->
        <h3 style="margin-top: 24px">变更历史 ({{ currentStandard.history.length }})</h3>
        <a-timeline>
          <a-timeline-item v-for="(h, i) in currentStandard.history" :key="i">
            <div>
              <strong>{{ h.action }}</strong>
              <a-tag size="small" style="margin-left: 8px">{{ statusLabel(h.from) }} → {{ statusLabel(h.to) }}</a-tag>
            </div>
            <div style="color: #86909c; font-size: 12px; margin-top: 2px">{{ h.ts }} · {{ h.actor }}</div>
          </a-timeline-item>
        </a-timeline>
      </template>
    </a-drawer>

    <!-- ====== 新建草稿抽屉 ====== -->
    <a-drawer
      v-model:visible="createVisible"
      title="新建数据标准"
      :width="640"
      :footer="false"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="标准编码" required>
          <a-input v-model="form.code" placeholder="例如:STD-007" />
        </a-form-item>
        <a-form-item label="标准名称" required>
          <a-input v-model="form.name" placeholder="如:客户邮箱" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分类" required>
              <a-select v-model="form.category" placeholder="选择分类">
                <a-option v-for="c in categories" :key="c" :value="c">{{ c }}</a-option>
                <a-option value="__new__">+ 新分类</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据类型" required>
              <a-select v-model="form.dataType">
                <a-option value="string">string</a-option>
                <a-option value="number">number</a-option>
                <a-option value="enum">enum</a-option>
                <a-option value="date">date</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="长度">
              <a-input-number v-model="form.length" :min="1" :max="500" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="精度(scale)">
              <a-input-number v-model="form.scale" :min="0" :max="10" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="定义">
          <a-textarea v-model="form.definition" :rows="2" placeholder="标准的业务定义" />
        </a-form-item>
        <a-form-item label="取值范围">
          <a-input v-model="form.valueRange" placeholder="正则 / 枚举 / 区间" />
        </a-form-item>
        <a-form-item label="规则示例">
          <a-input v-model="form.example" placeholder="一个示例值" />
        </a-form-item>
        <a-form-item label="负责人">
          <a-input v-model="form.owner" placeholder="默认:当前用户" />
        </a-form-item>
      </a-form>
      <a-space style="margin-top: 16px; justify-content: flex-end; display: flex">
        <a-button @click="createVisible = false">取消</a-button>
        <a-button type="primary" @click="onSaveDraft">保存草稿</a-button>
      </a-space>
    </a-drawer>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  StandardStore,
  STANDARD_STATUS_LIST,
  STANDARD_STATUS_LABEL,
  STANDARD_STATUS_COLOR,
  type Standard,
  type StandardStatus
} from '@/mock-shared/standard-store'

const router = useRouter()

const standards = ref<Standard[]>([])
const keyword = ref('')
const filterCategory = ref<string | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)
const statusQuickFilter = ref<'all' | StandardStatus>('all')

const detailVisible = ref(false)
const currentStandard = ref<Standard | null>(null)

const createVisible = ref(false)
const form = ref({
  code: '',
  name: '',
  category: '',
  dataType: 'string',
  length: 50,
  scale: 0,
  definition: '',
  valueRange: '',
  example: '',
  owner: '当前用户'
})

function refresh() {
  standards.value = StandardStore.getStandards()
}

onMounted(refresh)

// 分类下拉
const categories = computed(() => Array.from(new Set(standards.value.map(s => s.category))).sort())

const statusOptions = STANDARD_STATUS_LIST.map(s => ({ value: s, label: STANDARD_STATUS_LABEL[s] }))

const filteredStandards = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return standards.value.filter(s => {
    if (k) {
      if (!s.code.toLowerCase().includes(k) && !s.name.toLowerCase().includes(k) && !s.definition.toLowerCase().includes(k)) return false
    }
    if (filterCategory.value && s.category !== filterCategory.value) return false
    if (filterStatus.value && s.status !== filterStatus.value) return false
    if (statusQuickFilter.value !== 'all' && s.status !== statusQuickFilter.value) return false
    return true
  })
})

const publishedCount = computed(() => standards.value.filter(s => s.status === 'published').length)
const draftCount = computed(() => standards.value.filter(s => s.status === 'draft').length)
const pendingCount = computed(() => standards.value.filter(s => s.status === 'pending').length)
const deprecatedCount = computed(() => standards.value.filter(s => s.status === 'deprecated').length)

// 状态机对应的 steps 位置
const statusStepIndex = computed(() => {
  const map: Record<StandardStatus, number> = { draft: 0, pending: 1, published: 2, deprecated: 3 }
  return map[currentStandard.value?.status || 'draft']
})

const columns = [
  { title: '编码', dataIndex: 'code', slotName: 'code', width: 100 },
  { title: '名称', dataIndex: 'name', width: 180 },
  { title: '分类', dataIndex: 'category', slotName: 'category', width: 110 },
  { title: '数据类型', dataIndex: 'dataType', width: 90 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '合规率', dataIndex: 'complianceRate', slotName: 'compliance', width: 130 },
  { title: 'Owner', dataIndex: 'owner', width: 90 },
  { title: '标签', dataIndex: 'tags', slotName: 'tags' },
  // 2026-08-06:操作列(状态机入口)
  { title: '操作', slotName: 'actions', width: 200, fixed: 'right' }
]

const appliedColumns = [
  { title: '字段路径', dataIndex: 'fullPath' },
  { title: '当前值', dataIndex: 'sample', width: 130 },
  { title: '合规', dataIndex: 'compliant', slotName: 'compliance', width: 100 }
]

function statusColor(s: StandardStatus) {
  return STANDARD_STATUS_COLOR[s] || 'gray'
}
function statusLabel(s: StandardStatus) {
  return STANDARD_STATUS_LABEL[s] || s
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
  statusQuickFilter.value = 'all'
}
function openStandard(s: Standard) {
  currentStandard.value = s
  detailVisible.value = true
}

// ===== 状态机操作 =====
function onSubmit(s: Standard) {
  StandardStore.submitForReview(s.code)
  refresh()
  if (currentStandard.value?.code === s.code) currentStandard.value = StandardStore.findByCode(s.code) || null
  Message.success(`「${s.name}」已提交审批`)
}

function onApprove(s: Standard) {
  StandardStore.approve(s.code)
  refresh()
  if (currentStandard.value?.code === s.code) currentStandard.value = StandardStore.findByCode(s.code) || null
  Message.success(`「${s.name}」已审批通过,正式发布`)
}

function onReject(s: Standard) {
  Modal.confirm({
    title: '打回草稿',
    content: `确定要将「${s.name}」打回草稿吗?`,
    okText: '确认打回',
    cancelText: '取消',
    onOk: () => {
      StandardStore.reject(s.code, '审批未通过')
      refresh()
      if (currentStandard.value?.code === s.code) currentStandard.value = StandardStore.findByCode(s.code) || null
      Message.warning(`「${s.name}」已打回草稿`)
    }
  })
}

function onDeprecate(s: Standard) {
  Modal.confirm({
    title: '弃用标准',
    content: `弃用「${s.name}」后,将不再被新字段引用。确定继续吗?`,
    okText: '确认弃用',
    cancelText: '取消',
    onOk: () => {
      StandardStore.deprecate(s.code)
      refresh()
      if (currentStandard.value?.code === s.code) currentStandard.value = StandardStore.findByCode(s.code) || null
      Message.warning(`「${s.name}」已弃用`)
    }
  })
}

function onRestore(s: Standard) {
  StandardStore.restoreFromDeprecated(s.code)
  refresh()
  if (currentStandard.value?.code === s.code) currentStandard.value = StandardStore.findByCode(s.code) || null
  Message.success(`「${s.name}」已恢复为草稿`)
}

// ===== 新建草稿 =====
function onCreate() {
  // 自动生成下一个编码
  const nums = standards.value.map(s => {
    const m = s.code.match(/STD-(\d+)/)
    return m ? Number(m[1]) : 0
  })
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  form.value = {
    code: `STD-${String(next).padStart(3, '0')}`,
    name: '',
    category: '',
    dataType: 'string',
    length: 50,
    scale: 0,
    definition: '',
    valueRange: '',
    example: '',
    owner: '当前用户'
  }
  createVisible.value = true
}

function onSaveDraft() {
  if (!form.value.code || !form.value.name || !form.value.category) {
    Message.error('请填写编码 / 名称 / 分类')
    return
  }
  const created = StandardStore.createDraft({
    code: form.value.code,
    name: form.value.name,
    category: form.value.category === '__new__' ? '新分类' : form.value.category,
    dataType: form.value.dataType,
    length: form.value.length,
    scale: form.value.scale || undefined,
    owner: form.value.owner,
    complianceRate: 0,
    definition: form.value.definition,
    valueRange: form.value.valueRange,
    example: form.value.example,
    tags: []
  })
  refresh()
  createVisible.value = false
  Message.success(`草稿「${created.name}」已创建,可提交审批`)
}

const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
.standards-page {
  padding: 0 24px;

  .filter-card {
    margin-bottom: 16px;
    .result-meta {
      margin-top: 16px;
      color: var(--dca-text-tertiary);
      font-size: 13px;
      b { color: var(--dca-text-primary); font-weight: 600; }
    }
  }

  .formula {
    background: var(--dca-bg-page);
    padding: 12px;
    border-radius: var(--dca-radius-md);
    font-family: 'Menlo', monospace;
    font-size: 13px;
    color: var(--dca-brand-primary);
    margin: 0;
  }
}
</style>