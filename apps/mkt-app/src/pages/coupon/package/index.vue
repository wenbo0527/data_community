<template>
  <div class="coupon-package-container">
    <div class="header">
      <a-space>
        <a-input-search
          v-model="searchText"
          placeholder="搜索券包名称"
          style="width: 300px"
          @search="handleSearch"
        />
        <!-- 产品筛选（临价折扣券） -->
        <a-select
          v-model="filterProduct"
          placeholder="选择产品"
          style="width: 200px"
          @change="handleProductFilter"
          allow-clear
        >
          <a-option value="JD_001">京东大额低息</a-option>
          <a-option value="MT_001">美团大额低息</a-option>
        </a-select>
        <a-button type="primary" @click="goCreate">
          <template #icon>
            <IconPlus />
          </template>
          新建券包
        </a-button>
      </a-space>
    </div>

    <a-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :bordered="false"
      class="table-borderless table-compact"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
      @row-dblclick="handleRowDblClick"
    >
      <template #columns>
        <a-table-column title="券包名称" data-index="name" :width="200">
          <template #cell="{ record }">
            <a-link @click="handleRowDblClick(record)" style="color: rgb(var(--primary-6))">
              {{ record.name }}
            </a-link>
          </template>
        </a-table-column>
        <a-table-column title="包含券种类" data-index="couponTypes" :width="150" />
        <a-table-column title="产品" data-index="product_name" :width="140" align="center">
          <template #cell="{ record }">
            <a-tag v-if="record.product_id" color="orange" size="small">
              {{ record.product_name || record.product_id }}
            </a-tag>
            <span v-else style="color: var(--color-text-3); font-size: 12px">—</span>
          </template>
        </a-table-column>
        <a-table-column title="可下发券数量" data-index="couponCount" :width="120" align="center" />
        <!-- v1.2.8-C' v2: 列表展示 inventoryTemplates(挂载的临价券库存), 不展示 inventory_batches -->
        <a-table-column title="已挂载券库存" data-index="inventoryTemplates" :width="180" align="center">
          <template #cell="{ record }">
            <a-tag v-if="record.inventoryTemplates && record.inventoryTemplates.length" color="arcoblue" size="small">
              {{ record.inventoryTemplates.length }} 个券库存
            </a-tag>
            <span v-else style="color: var(--color-text-3); font-size: 12px">未挂载</span>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" data-index="createTime" :width="180" />
        <a-table-column title="状态" data-index="status" :width="120" align="center">
          <template #cell="{ record }">
            <!-- 5/26 教训：mock 字段是 'draft'|'active'|'inactive' 字符串（Demo-001 已收紧），不是 1/0 数字 -->
            <a-tag :color="statusColorMap[record.status] || 'gray'">
              {{ statusTextMap[record.status] || record.status }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="创建人" data-index="creator" :width="120" />
        <a-table-column title="操作" align="center" :width="200">
          <template #cell="{ record }">
            <a-space>
              <a-button
                type="text"
                size="small"
                @click="goDetail(record)"
              >
                详情
              </a-button>
              <!-- v1.2.9 PRD #7 #11: 更多操作下拉菜单（停用/重新激活/编辑 三项分离） -->
              <a-dropdown trigger="click">
                <a-button type="text" size="small">
                  更多
                  <template #icon><IconDown /></template>
                </a-button>
                <template #content>
                  <a-doption
                    :disabled="record.status === 'inactive' || record.status === 'draft'"
                    @click="handleStatusChange(record, 'inactive')"
                  >
                    <span style="color: var(--color-danger);">停用</span>
                  </a-doption>
                  <a-doption
                    :disabled="record.status !== 'inactive'"
                    @click="handleStatusChange(record, 'active')"
                  >
                    重新激活
                  </a-doption>
                  <a-doption @click="goEdit(record)">
                    编辑
                  </a-doption>
                </template>
              </a-dropdown>
              <a-button
                type="text"
                status="danger"
                size="small"
                :disabled="record.status === 'active'"
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- ==================== v1.2.8 P0-PKG-A: 3 弹窗 (新建/详情/编辑) ====================
         原 D2.1+D2.2 拆出独立路由方案失败 (路由通了但页面是空壳),
         退回弹窗模式 (5/26 教训链: 减少死链源)。 -->

    <!-- 弹窗 1/3: 新建券包 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="新建券包"
      :width="640"
      :ok-text="'保存'"
      :cancel-text="'取消'"
      @ok="handleCreate"
      @cancel="handleCreateCancel"
    >
      <a-form :model="createForm" layout="vertical">
        <a-form-item field="name" label="券包名称" required>
          <a-input v-model="createForm.name" placeholder="如:京东 6 月活动包" />
        </a-form-item>
        <a-form-item field="product_id" label="产品" required>
          <a-select v-model="createForm.product_id" placeholder="选择产品">
            <a-option value="SUD001">速贷产品</a-option>
            <a-option value="JD_001">京东大额低息</a-option>
            <a-option value="MT_001">美团大额低息</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-textarea v-model="createForm.description" placeholder="券包描述" />
        </a-form-item>
        <a-form-item field="couponCount" label="可下发券数量" required>
          <a-input-number v-model="createForm.couponCount" :min="1" :max="100000" />
        </a-form-item>
        <a-form-item field="creator" label="创建人">
          <a-input v-model="createForm.creator" placeholder="运营人员姓名" />
        </a-form-item>
        <!-- v1.2.8-C' v2: 初始挂载券库存(选了 = active, 不选 = draft) -->
        <a-form-item field="initial_templates" label="初始挂载券库存">
          <a-button type="outline" size="small" :disabled="!createForm.product_id" @click="openCreateMountModal">
            <template #icon><IconPlus /></template>
            选择券库存
          </a-button>
          <div v-if="createForm.inventoryTemplates && createForm.inventoryTemplates.length" style="margin-top: 8px">
            <a-tag
              v-for="t in createForm.inventoryTemplates"
              :key="t.templateId"
              color="arcoblue"
              closable
              style="margin-right: 8px"
              @close="removeCreateTemplate(t.templateId)"
            >
              {{ t.name }} ({{ t.product_name }}) - 有效期 至 {{ t.valid_to }}
            </a-tag>
          </div>
          <div style="color: var(--color-text-3); font-size: 12px; margin-top: 4px">
            ⚠️ 选券库存后券包状态直接 = active;不选 = draft
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- v1.2.8-C' v2: 创建时挂载券库存子弹窗(MockTemplate) -->
    <a-modal
      v-model:visible="createMountModalVisible"
      title="选择券库存"
      :width="720"
      :ok-text="'挂载'"
      :cancel-text="'取消'"
      @ok="handleCreateMountConfirm"
      @cancel="handleCreateMountCancel"
    >
      <div style="color: var(--color-text-3); font-size: 12px; margin-bottom: 12px">
        产品: <a-tag color="orange" size="small">{{ createForm.product_name || createForm.product_id || '请先选产品' }}</a-tag>
        (仅显示同产品 + online + 有效期内 的临价券库存,多选)
      </div>
      <a-table
        :data="createAvailableTemplates"
        :columns="mountTemplateColumns"
        :pagination="false"
        :bordered="false"
        row-key="templateId"
        :row-selection="{ type: 'checkbox', selectedRowKeys: createSelectedTemplateIds }"
        @select="handleCreateTemplateSelect"
        @select-all="handleCreateTemplateSelectAll"
        size="small"
      />
      <a-empty v-if="createForm.product_id && !createAvailableTemplates.length" description="该产品下暂无可挂载的券库存" />
      <a-empty v-if="!createForm.product_id" description="请先选择产品" />
    </a-modal>

    <!-- 弹窗 2/3: 券包详情 -->
    <a-modal
      v-model:visible="detailModalVisible"
      title="券包详情"
      :width="720"
      :footer="false"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="券包 ID">{{ detailRecord.id }}</a-descriptions-item>
        <a-descriptions-item label="券包名称">{{ detailRecord.name }}</a-descriptions-item>
        <a-descriptions-item label="产品">
          <a-tag v-if="detailRecord.product_id" color="orange" size="small">
            {{ detailRecord.product_name || detailRecord.product_id }}
          </a-tag>
          <span v-else>—</span>
        </a-descriptions-item>
        <a-descriptions-item label="券类型">{{ detailRecord.couponTypes || detailRecord.type || '—' }}</a-descriptions-item>
        <a-descriptions-item label="可下发券数量">{{ detailRecord.couponCount || 0 }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ detailRecord.creator || '—' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detailRecord.createTime || '—' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="statusColorMap[detailRecord.status] || 'gray'">
            {{ statusTextMap[detailRecord.status] || detailRecord.status }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">
          {{ detailRecord.description || '—' }}
        </a-descriptions-item>
        <!-- v1.2.8-C' v2: 展示 inventoryTemplates(挂载的券库存列表), 不展示 inventory_batches (5/26 教训保留不删) -->
        <a-descriptions-item v-if="detailRecord.inventoryTemplates && detailRecord.inventoryTemplates.length" label="已挂载券库存" :span="2">
          <a-tag
            v-for="t in detailRecord.inventoryTemplates"
            :key="t.templateId"
            color="arcoblue"
            closable
            style="margin-right: 8px"
            @close="handleUnbindTemplate(t.templateId)"
          >
            {{ t.name }} ({{ t.product_name }}) - 有效期 至 {{ t.valid_to }}
          </a-tag>
        </a-descriptions-item>
        <!-- PRD Story-003-2 / FP-MKT-COUPON-GRANT-008: 详情页加「挂载券库存」入口 (v1.2.8-C' v2) -->
        <!-- v1.2.9 PRD #12: inactive 态下挂载/解绑按钮 disabled -->
        <a-descriptions-item label="挂载操作" :span="2">
          <a-button
            type="primary"
            size="small"
            :disabled="detailRecord.status === 'inactive'"
            @click="openMountModal"
          >
            <template #icon><IconPlus /></template>
            挂载券库存
          </a-button>
          <div style="color: var(--color-text-3); font-size: 12px; margin-top: 4px">
            <span v-if="detailRecord.status === 'inactive'">
              ⚠️ 停用状态下不可挂载/解绑券库存，请先重新激活
            </span>
            <span v-else>
              同产品 + 上线 + 有效期内 的临价券库存才可挂载(PRD Story-003-2 必填过滤)
            </span>
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- PRD Story-003-2 子弹窗: 选择券库存(MockTemplate) -->
    <a-modal
      v-model:visible="mountModalVisible"
      title="选择券库存"
      :width="720"
      :ok-text="'挂载'"
      :cancel-text="'取消'"
      @ok="handleMountTemplatesConfirm"
      @cancel="handleMountCancel"
    >
      <div style="color: var(--color-text-3); font-size: 12px; margin-bottom: 12px">
        产品: <a-tag color="orange" size="small">{{ detailRecord.product_name || detailRecord.product_id || '—' }}</a-tag>
        (仅显示同产品 + online + 有效期内 的临价券库存,多选)
      </div>
      <a-table
        :data="availableTemplates"
        :columns="mountTemplateColumns"
        :pagination="false"
        :bordered="false"
        row-key="templateId"
        :row-selection="{ type: 'checkbox', selectedRowKeys: selectedTemplateIds }"
        @select="handleTemplateSelect"
        @select-all="handleTemplateSelectAll"
        size="small"
      />
      <a-empty v-if="!availableTemplates.length" description="该产品下暂无可挂载的券库存" />
    </a-modal>

    <!-- 弹窗 3/3: 编辑券包 -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑券包"
      :width="640"
      :ok-text="'保存'"
      :cancel-text="'取消'"
      @ok="handleEdit"
      @cancel="handleEditCancel"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item field="name" label="券包名称" required>
          <a-input v-model="editForm.name" placeholder="如:京东 6 月活动包" />
        </a-form-item>
        <a-form-item field="product_id" label="产品" required>
          <a-select v-model="editForm.product_id" placeholder="选择产品" disabled>
            <a-option value="SUD001">速贷产品</a-option>
            <a-option value="JD_001">京东大额低息</a-option>
            <a-option value="MT_001">美团大额低息</a-option>
          </a-select>
          <div style="color: var(--color-text-3); font-size: 12px; margin-top: 4px">
            ⚠️ 产品字段锁定，编辑时不可修改
          </div>
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-textarea v-model="editForm.description" placeholder="券包描述" />
        </a-form-item>
        <a-form-item field="couponCount" label="可下发券数量" required>
          <a-input-number v-model="editForm.couponCount" :min="1" :max="100000" />
        </a-form-item>
        <a-form-item field="creator" label="创建人">
          <a-input v-model="editForm.creator" placeholder="运营人员姓名" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- v1.2.9 PRD #9: 状态切换二次确认弹窗 (停用/重新激活 复用同一弹窗) -->
    <a-modal
      v-model:visible="confirmModalVisible"
      :title="confirmModalContext.action === 'inactive' ? '确认停用' : '确认重新激活'"
      :width="480"
      :ok-text="confirmModalContext.action === 'inactive' ? '确认停用' : '确认重新激活'"
      :cancel-text="'取消'"
      :ok-button-props="{ status: confirmModalContext.action === 'inactive' ? 'danger' : 'primary' }"
      @ok="handleConfirmOk"
      @cancel="handleConfirmCancel"
    >
      <div style="line-height: 1.8">
        <p>券包名称: <b>{{ confirmModalContext.packageName || '—' }}</b></p>
        <p v-if="confirmModalContext.action === 'inactive'">
          ⚠️ 停用后:
        </p>
        <ul v-if="confirmModalContext.action === 'inactive'" style="margin-left: 20px; color: var(--color-text-2)">
          <li>MA 节点无法触发</li>
          <li>已发券实例不受影响</li>
          <li>可重新激活</li>
        </ul>
        <p v-else>
          重新激活后，MA 节点可继续触发该券包发放。
        </p>
        <p style="color: var(--color-text-3); font-size: 12px; margin-top: 12px">
          确认{{ confirmModalContext.action === 'inactive' ? '停用' : '重新激活' }}吗？
        </p>
      </div>
    </a-modal>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconDown } from '@arco-design/web-vue/es/icon'
import { packageMockData, pricedTemplateMockData } from '@/mock/coupon'
// v1.2.8 注: babel 解析 TS type 关键字 / 泛型 都不行, 所有类型注解走局部推断
// 6/5 14:35 ESLint 教训: 不引 any, 不用 import type, 全部用 Array 形式

// 表格数据
const tableData = ref(packageMockData)
const loading = ref(false)
const searchText = ref('')
const filterProduct = ref('')

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
})

/** Demo-001 收紧后的状态枚举 (PRD §11.2) — 5/26 教训: mock 字段是字符串 enum,不是 1/0
 *  v1.2.8 注: 本映射是【券包】状态(业务态),非【用户券】状态。
 *  用户券失败态(pending/5 个 failed_*) 见 detail.vue:218 getStatusText。
 *  5/26 教训链: 券包状态机只有 draft/active/inactive。
 *  加 failed_* 是状态错位,会出列渲染异常。
 */
const statusTextMap = {
  draft: '草稿',
  active: '启用',
  inactive: '停用',
}
const statusColorMap = {
  draft: 'gray',
  active: 'green',
  inactive: 'red',
}

// 表格过滤（产品 + 名称）
const filteredTableData = computed(() => {
  let result = packageMockData
  if (filterProduct.value) {
    result = result.filter(item => item.product_id === filterProduct.value)
  }
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    result = result.filter(item => (item.name || '').toLowerCase().includes(kw))
  }
  return result
})

// 刷新显示数据
const refreshTableData = () => {
  loading.value = true
  try {
    tableData.value = filteredTableData.value
    pagination.total = tableData.value.length
  } catch (error) {
    console.error('刷新券包列表失败:', error)
    Message.error('刷新券包列表失败')
  } finally {
    loading.value = false
  }
}

const fetchTableData = () => refreshTableData()

// 名称搜索
const handleSearch = () => {
  pagination.current = 1
  fetchTableData()
}

// 产品筛选（演示范围: 不与名称搜索联动时实时刷新）
const handleProductFilter = () => {
  pagination.current = 1
  fetchTableData()
}

// 分页变化
const onPageChange = (current) => {
  pagination.current = current
  fetchTableData()
}

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchTableData()
}

// ==================== v1.2.8 P0-PKG-A: 3 弹窗状态 ====================

/** 弹窗 1: 新建 */
const createModalVisible = ref(false)
const createForm = reactive({
  name: '',
  product_id: undefined,
  product_name: '',
  description: '',
  couponCount: 100,
  creator: '当前运营',
  inventory_batches: [],
})

/** 弹窗 2: 详情 */
const detailModalVisible = ref(false)
// 注: 不用 ref<Record<string, any>> 泛型语法, babel 解析 <Record...> 会报 JSX 歧义
// v1.2.8 修复: ref<any>({}) 改不带泛型 — esbuild 漏擦 <any>(6/5 14:35 线上白屏)
const detailRecord = ref({})

/** 弹窗 3: 编辑 */
const editModalVisible = ref(false)
const editForm = reactive({
  id: '',
  name: '',
  product_id: undefined,
  product_name: '',
  description: '',
  couponCount: 100,
  creator: '',
})

/** 打开新建弹窗 */
const goCreate = () => {
  Object.assign(createForm, {
    name: '',
    product_id: undefined,
    product_name: '',
    description: '',
    couponCount: 100,
    creator: '当前运营',
    inventory_batches: [],
  })
  createSelectedTemplateIds.value = []
  createMountModalVisible.value = false
  createModalVisible.value = true
}

/** 打开详情弹窗 */
const goDetail = (record) => {
  detailRecord.value = { ...record }
  detailModalVisible.value = true
}

/** 打开编辑弹窗（产品字段锁定） */
const goEdit = (record) => {
  Object.assign(editForm, {
    id: record.id,
    name: record.name,
    product_id: record.product_id,
    product_name: record.product_name,
    description: record.description || '',
    couponCount: record.couponCount || 100,
    creator: record.creator || '',
  })
  editModalVisible.value = true
}

// ==================== PRD Story-003-2 / FP-MKT-COUPON-GRANT-008 挂载库存 v2 (v1.2.8-C' 修正) ====================
//
// 文博 15:21 修正: 业务侧没有「批次」概念, 挂载=选 MockTemplate(券库存实体)
// 判定「可挂载」:
//   product_id === currentPackage.product_id
//   && status === 'online'
//   && today >= valid_from && today <= valid_to
// 数据源: pricedTemplateMockData (mock/coupon.ts L31-58, 2 条临价模板)
// 保留: inventory_batches 字段不删(5/26 教训链防破窗), 但不再使用
// 新加: inventoryTemplates 字段(挂载的模板列表)

/** 弹窗 4: 详情页挂载 */
const mountModalVisible = ref(false)
const selectedTemplateIds = ref([])

/** 弹窗 5: 创建时挂载 */
const createMountModalVisible = ref(false)
const createSelectedTemplateIds = ref([])

/** 判定「可挂载」条件(PRD v1.2.8-C' 修正) */
const isTemplateMountable = (template, productId) => {
  if (!productId) return false
  if (template.product_id !== productId) return false
  if (template.status !== 'online') return false
  if (!template.valid_from || !template.valid_to) return false
  const today = new Date().toISOString().substring(0, 10)  // YYYY-MM-DD
  return today >= template.valid_from && today <= template.valid_to
}

/** 弹窗表格列(MockTemplate) */
const mountTemplateColumns = [
  { title: '模板名', dataIndex: 'name', width: 200 },
  { title: '产品', dataIndex: 'product_name', width: 120, align: 'center' },
  { title: '状态', dataIndex: 'status', width: 80, align: 'center' },
  { title: '有效期', dataIndex: 'valid_to', width: 200, align: 'center',
    render: ({ record }) => record.valid_from && record.valid_to
      ? `${record.valid_from} 至 ${record.valid_to}` : '—' },
  { title: '折扣', dataIndex: 'discount_value', width: 80, align: 'center',
    render: ({ record }) => record.discount_value ? `${record.discount_value * 10} 折` : '—' },
]

/** 从 pricedTemplateMockData 按 product_id + status='online' + 有效期内 过滤 */
const buildTemplatePool = (productId) => {
  if (!productId) return []
  return pricedTemplateMockData.filter((t) => isTemplateMountable(t, productId))
}

/** 详情页: 同产品下可用批次(去掉已挂载的) */
const availableTemplates = computed(() => {
  const pool = buildTemplatePool(detailRecord.value.product_id)
  const mountedIds = new Set(
    (detailRecord.value.inventory_batches || []).map(b => b.batch_id)
  )
  return pool.filter((b) => !mountedIds.has(b.batch_id))
})

/** 创建页: 同产品下可用批次 */
const createAvailableTemplates = computed(() => {
  const pool = buildTemplatePool(createForm.product_id)
  const selectedIds = new Set(createForm.inventory_batches.map((b) => b.batch_id))
  return pool.filter((b) => !selectedIds.has(b.batch_id))
})

/** 打开详情页挂载弹窗 */
const openMountModal = () => {
  selectedTemplateIds.value = []
  mountModalVisible.value = true
}

/** 打开创建时挂载弹窗 */
const openCreateMountModal = () => {
  createSelectedTemplateIds.value = createForm.inventory_batches.map((b) => b.batch_id)
  createMountModalVisible.value = true
}

/** 详情页 表格行选中 */
const handleTemplateSelect = (rowKeys) => {
  selectedTemplateIds.value = rowKeys.map(String)
}
const handleTemplateSelectAll = (rowKeys) => {
  selectedTemplateIds.value = rowKeys.map(String)
}

/** 创建页 表格行选中 */
const handleCreateTemplateSelect = (rowKeys) => {
  createSelectedTemplateIds.value = rowKeys.map(String)
}
const handleCreateTemplateSelectAll = (rowKeys) => {
  createSelectedTemplateIds.value = rowKeys.map(String)
}

/** 详情页: 确认挂载 - 写入 detailRecord.value + 同步回 mock */
const handleMountTemplatesConfirm = () => {
  if (!selectedTemplateIds.value.length) {
    Message.warning('请至少选择 1 个批次')
    return
  }
  const pool = buildTemplatePool(detailRecord.value.product_id)
  const toMount = pool.filter((b) => selectedTemplateIds.value.includes(b.batch_id))
  if (!detailRecord.value.inventory_batches) {
    detailRecord.value.inventory_batches = []
  }
  detailRecord.value.inventoryTemplates.push(...toMount)
  // 同步回 mock
  const idx = packageMockData.findIndex((p) => p.id === detailRecord.value.id)
  if (idx >= 0) {
    packageMockData[idx].inventoryTemplates = [...(detailRecord.value.inventoryTemplates || [])]
  }
  Message.success(`已挂载 ${toMount.length} 个券库存`)
  mountModalVisible.value = false
  selectedTemplateIds.value = []
}

const handleMountCancel = () => {
  mountModalVisible.value = false
  selectedTemplateIds.value = []
}

/** 详情页: 解绑券库存(PRD Story-003-2 第 4 条)
 *  v1.2.9 PRD #12: 解绑全部批次后状态回退为 draft, 并清空 invalidated_time
 */
const handleUnbindTemplate = (templateId) => {
  if (!detailRecord.value.inventoryTemplates) return
  // inactive 态不允许解绑 (与挂载按钮一致, v1.2.9 PRD #12)
  if (detailRecord.value.status === 'inactive') {
    Message.warning('停用状态下不可解绑，请先重新激活')
    return
  }
  detailRecord.value.inventoryTemplates = detailRecord.value.inventoryTemplates.filter(
    t => t.templateId !== templateId
  )
  // 同步回 mock
  const idx = packageMockData.findIndex((p) => p.id === detailRecord.value.id)
  if (idx >= 0) {
    packageMockData[idx].inventoryTemplates = [...(detailRecord.value.inventoryTemplates || [])]
    // v1.2.9 PRD #12: 解绑全部 → 回退 draft
    if (packageMockData[idx].inventoryTemplates.length === 0) {
      packageMockData[idx].status = 'draft'
      packageMockData[idx].invalidated_time = undefined
      detailRecord.value.status = 'draft'
      detailRecord.value.invalidated_time = undefined
      Message.warning('已无挂载批次，券包状态回退为草稿')
    } else {
      Message.success('已解绑')
    }
  } else {
    Message.success('已解绑')
  }
  fetchTableData()
}

/** 创建页: 确认挂载 - 更新 createForm.inventoryTemplates */
const handleCreateMountConfirm = () => {
  if (!createSelectedTemplateIds.value.length) {
    createForm.inventoryTemplates = []
  } else {
    const pool = buildTemplatePool(createForm.product_id)
    createForm.inventoryTemplates = pool.filter((t) => createSelectedTemplateIds.value.includes(t.templateId))
  }
  createMountModalVisible.value = false
  Message.success(`已选 ${createForm.inventoryTemplates.length} 个券库存`)
}

const handleCreateMountCancel = () => {
  createMountModalVisible.value = false
}

/** 创建页: 解除某已选券库存 */
const removeCreateTemplate = (templateId) => {
  createForm.inventoryTemplates = (createForm.inventoryTemplates || []).filter(
    (t) => t.templateId !== templateId
  )
  createSelectedTemplateIds.value = createSelectedTemplateIds.value.filter((k) => k !== templateId)
}

/** 提交新建 */
const handleCreate = () => {
  if (!createForm.name || !createForm.product_id) {
    Message.warning('请填写券包名称和产品')
    return
  }
  const newId = String(packageMockData.length + 1)
  // v1.2.8 注: babel 解析 Record<string, X> 会被当 JSX tag, 改用类型断言
  const productMap = {
    SUD001: '速贷产品',
    JD_001: '京东大额低息',
    MT_001: '美团大额低息',
  }
  // PRD Story-003-2 第 5 条: 选了券库存 = active, 不选 = draft
  // v1.2.8-C' v2: 以 inventoryTemplates 为准, inventory_batches 保留为空(5/26 教训)
  const hasTemplates = (createForm.inventoryTemplates || []).length > 0
  packageMockData.unshift({
    id: newId,
    packageId: `P${newId.padStart(3, '0')}`,
    name: createForm.name,
    description: createForm.description,
    couponCount: createForm.couponCount,
    totalValue: 0,
    status: hasTemplates ? 'active' : 'draft',
    validDays: 30,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    product_id: createForm.product_id,
    product_name: productMap[createForm.product_id] || '',
    type: 'PRICED_DISCOUNT',
    creator: createForm.creator,
    inventory_batches: [],                                // 5/26 教训保留不删
    inventoryTemplates: [...(createForm.inventoryTemplates || [])],
  })
  Message.success(hasTemplates ? '新建成功 + 已挂载' : '新建成功(未挂载 = 草稿)')
  createModalVisible.value = false
  fetchTableData()
}

const handleCreateCancel = () => {
  createModalVisible.value = false
}

/** 提交编辑 */
const handleEdit = () => {
  if (!editForm.name) {
    Message.warning('请填写券包名称')
    return
  }
  const idx = packageMockData.findIndex(p => p.id === editForm.id)
  if (idx >= 0) {
    packageMockData[idx] = {
      ...packageMockData[idx],
      name: editForm.name,
      description: editForm.description,
      couponCount: editForm.couponCount,
      creator: editForm.creator,
    }
    Message.success('编辑成功')
    editModalVisible.value = false
    fetchTableData()
  } else {
    Message.error('未找到该券包')
  }
}

const handleEditCancel = () => {
  editModalVisible.value = false
}

// ==================== v1.2.9 PRD #8/#9/#10: 状态切换安全门 ====================
// 1) 进行中发放校验 mock (PRD #8 blocker)
// 2) 二次确认弹窗 (PRD #9 blocker)
// 3) 审计日志 mock (PRD #10 major)
// 模拟线上: 50% 概率存在进行中发放 (PRD demo 范围, 实际生产查 MA 节点调度表)
const checkInFlightGrants = async (packageId) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  // v1.2.9 demo: 仅 status='active' 且有 inventoryTemplates 时有 50% 概率存在进行中发放
  const idx = packageMockData.findIndex(p => p.id === packageId)
  if (idx < 0) return false
  const p = packageMockData[idx]
  if (p.status !== 'active') return false
  const hasTemplates = (p.inventoryTemplates || []).length > 0
  return hasTemplates && Math.random() < 0.5
}

// 审计日志 mock (PRD #10 major) — 实际生产写 audit_log 表, demo 范围 console + 内存数组
const auditLogMock = []
const auditApi = {
  log: async (entry) => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const record = {
      ...entry,
      log_id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
    }
    auditLogMock.push(record)
    // eslint-disable-next-line no-console
    console.log('[audit]', record)
    return record
  },
}

// 二次确认弹窗状态 (PRD #9 blocker)
const confirmModalVisible = ref(false)
const confirmModalContext = reactive({
  action: '', // 'inactive' | 'active'
  packageId: '',
  packageName: '',
})

// 启用/停用券包 (v1.2.9 PRD #8/#9/#10 重构)
// 1) 先进行中发放校验
// 2) 无进行中 → 弹二次确认
// 3) 用户确认后 → 改 mock + 写 invalidated_time + 调审计 + 刷新
const handleStatusChange = async (record, targetStatus) => {
  // v1.2.9 PRD #11: dropdown 已传入 targetStatus ('inactive' | 'active'), 不再双向推断
  if (!targetStatus || targetStatus === record.status) return
  try {
    // Step 1: 进行中发放校验 (PRD #8)
    if (targetStatus === 'inactive') {
      const hasInFlight = await checkInFlightGrants(record.id)
      if (hasInFlight) {
        Message.error('存在进行中发放，无法停用。请等待 MA 节点调度完成后再试。')
        return
      }
    }
    // Step 2: 弹二次确认 (PRD #9)
    confirmModalContext.action = targetStatus
    confirmModalContext.packageId = record.id
    confirmModalContext.packageName = record.name || ''
    confirmModalVisible.value = true
  } catch (error) {
    console.error('状态切换预检失败:', error)
    Message.error('操作失败')
  }
}

// 二次确认弹窗: 确认回调 (PRD #9)
const handleConfirmOk = async () => {
  const { action, packageId } = confirmModalContext
  try {
    const idx = packageMockData.findIndex(p => p.id === packageId)
    if (idx < 0) {
      Message.error('未找到该券包')
      return
    }
    // 改 status
    packageMockData[idx].status = action
    // 写 invalidated_time (PRD v1.2.9 新字段)
    if (action === 'inactive') {
      packageMockData[idx].invalidated_time = new Date().toISOString()
    } else {
      // 重新激活 → 清空 invalidated_time
      packageMockData[idx].invalidated_time = undefined
    }
    // 写审计日志 (PRD #10)
    await auditApi.log({
      action: action === 'inactive' ? 'deactivate' : 'reactivate',
      packageId,
      operator: '当前运营', // demo: 实际从登录态取
      reason: action === 'inactive' ? '运营手动停用' : '运营手动重新激活',
    })
    Message.success(action === 'active' ? '已重新激活' : '已停用')
    confirmModalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('状态切换失败:', error)
    Message.error('操作失败')
  }
}

const handleConfirmCancel = () => {
  confirmModalVisible.value = false
  // 清空 context 避免下次 stale
  confirmModalContext.action = ''
  confirmModalContext.packageId = ''
  confirmModalContext.packageName = ''
}

// 删除券包（demo 范围: 改 mock + 刷新）
const handleDelete = async (record) => {
  try {
    const idx = packageMockData.findIndex(p => p.id === record.id)
    if (idx >= 0) {
      packageMockData.splice(idx, 1)
    }
    Message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败:', error)
    Message.error('删除失败')
  }
}

// 处理行双击事件（→ 详情路由）
const handleRowDblClick = (record) => {
  goDetail(record)
}

// 初始化加载数据
fetchTableData()
</script>

<style scoped>
.coupon-package-container {
  padding: 24px;
  background-color: var(--color-bg-2);
}

.header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.arco-table) {
  background-color: var(--color-bg-1);
  border-radius: 4px;
}

:deep(.arco-table-th) {
  background-color: var(--color-fill-2);
}

:deep(.arco-form-item) {
  margin-bottom: 24px;
}

:deep(.arco-form-item-label-col) {
  min-width: 100px;
  text-align: right;
  color: var(--color-text-2);
}

:deep(.arco-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.arco-select-view) {
  width: 100%;
}

:deep(.arco-input-wrapper) {
  width: 100%;
}

:deep(.arco-modal-content) {
  padding: 24px 32px;
}

:deep(.arco-descriptions-item) {
  padding: 16px;
}

:deep(.arco-descriptions-item-label) {
  color: var(--color-text-3);
  min-width: 120px;
}
</style>