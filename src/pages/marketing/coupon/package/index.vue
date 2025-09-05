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
        <a-button type="primary" @click="openCreateModal">
          <template #icon>
            <icon-plus />
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
        <a-table-column title="可下发券数量" data-index="couponCount" :width="120" align="center" />
        <a-table-column title="创建时间" data-index="createTime" :width="180" />
        <a-table-column title="状态" data-index="status" :width="120" align="center">
          <template #cell="{ record }">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '启用' : '停用' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="创建人" data-index="creator" :width="120" />
        <a-table-column title="操作" align="center" :width="150">
          <template #cell="{ record }">
            <a-space>
              <a-button
                type="text"
                size="small"
                :status="record.status === 1 ? 'danger' : 'success'"
                @click="handleStatusChange(record)"
              >
                {{ record.status === 1 ? '停用' : '启用' }}
              </a-button>
              <a-button
                type="text"
                status="danger"
                size="small"
                :disabled="record.status === 1"
                @click="handleDelete(record)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <!-- 新建券包弹窗 -->
    <a-modal
      v-model:visible="createModalVisible"
      :title="isViewMode ? '券包详情' : '新建券包'"
      @ok="handleCreateConfirm"
      @cancel="handleCreateCancel"
    >
      <a-form :model="formData" :rules="isViewMode ? {} : rules" ref="formRef" layout="horizontal" :style="{ width: '100%', maxWidth: '800px', margin: '0 auto' }">
        <a-form-item field="name" label="券包名称" validate-trigger="blur" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
          <a-input v-model="formData.name" placeholder="请输入券包名称" :readonly="isViewMode" allow-clear />
        </a-form-item>
        <a-form-item field="coupons" label="选择券" validate-trigger="blur" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
          <a-select
            v-model="formData.coupons"
            placeholder="请选择券"
            multiple
            :options="couponOptions"
            :readonly="isViewMode"
            :disabled="isViewMode"
            allow-clear
            allow-search
            :max-tag-count="3"
          />
        </a-form-item>
        <a-form-item field="stockRule" label="库存管理规则" validate-trigger="blur" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
          <a-radio-group v-model="formData.stockRule" :disabled="isViewMode">
            <a-radio value="sufficient">所有券库存充足发放</a-radio>
            <a-radio value="any">任一券库存充足发放</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="invalidRule" label="失效规则" validate-trigger="blur" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
          <a-radio-group v-model="formData.invalidRule" :disabled="isViewMode">
            <a-radio value="any">包内一张券失效则失效</a-radio>
            <a-radio value="all">所有券失效才失效</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="marketingTargets" label="营销目标" validate-trigger="blur" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
          <a-select
            v-model="formData.marketingTargets"
            placeholder="请选择营销目标"
            multiple
            :options="[{ label: 'APP', value: 'app' }, { label: '小程序', value: 'miniprogram' }]"
            :readonly="isViewMode"
            :disabled="isViewMode"
            allow-clear
            :max-tag-count="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 券包详情弹窗 -->
    <a-modal
      v-model:visible="detailModalVisible"
      title="券包详情"
      @cancel="() => detailModalVisible = false"
      :footer="false"
    >
      <a-descriptions :data="currentPackageDetail" layout="inline-vertical" bordered />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

import { packageMockData } from '@/mock/coupon'

// 表格数据
const tableData = ref(packageMockData)
const loading = ref(false)
const searchText = ref('')

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
})

// 新建券包表单
const formRef = ref(null)
const createModalVisible = ref(false)
const detailModalVisible = ref(false)
const currentPackageDetail = ref([])
const isViewMode = ref(false)
const formData = reactive({
  name: '',
  coupons: [],
  stockRule: 'sufficient',
  invalidRule: 'any',
  marketingTargets: []
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入券包名称' },
    { maxLength: 50, message: '券包名称不能超过50个字符' }
  ],
  coupons: [
    { required: true, message: '请选择券' },
    { type: 'array', min: 1, message: '至少选择一张券' }
  ],
  stockRule: [
    { required: true, message: '请选择库存管理规则' }
  ],
  invalidRule: [
    { required: true, message: '请选择失效规则' }
  ],
  marketingTargets: [
    { required: true, message: '请选择营销目标' },
    { type: 'array', min: 1, message: '至少选择一个营销目标' }
  ]
}

// 可选券列表
const couponOptions = ref([
  { label: '首贷满100减50券', value: '1', type: '首贷促动包' },
  { label: '首贷满200减100券', value: '2', type: '首贷促动包' },
  { label: '首贷满300减150券', value: '3', type: '首贷促动包' },
  { label: '复贷满500减100券', value: '4', type: '复贷促动包' },
  { label: '复贷满1000减200券', value: '5', type: '复贷促动包' },
  { label: '复贷满2000减400券', value: '6', type: '复贷促动包' }
])

// 获取表格数据
const fetchTableData = async () => {
  loading.value = true
  try {
    // 模拟数据
    tableData.value = [
      {
        id: 1,
        name: '新用户首贷大礼包',
        couponTypes: 3,
        couponCount: 150,
        createTime: '2023-06-18 10:00:00',
        status: 1,
        type: '首贷促动包',
        creator: '张三'
      },
      {
        id: 2,
        name: '老用户专享券包',
        couponTypes: 2,
        couponCount: 200,
        createTime: '2023-07-01 14:30:00',
        status: 1,
        type: '复贷促动包',
        creator: '李四'
      },
      {
        id: 3,
        name: '新手体验券包',
        couponTypes: 2,
        couponCount: 100,
        createTime: '2023-07-15 09:00:00',
        status: 0,
        type: '首贷促动包',
        creator: '王五'
      },
      {
        id: 4,
        name: '复贷优惠大礼包',
        couponTypes: 3,
        couponCount: 300,
        createTime: '2023-07-20 16:45:00',
        status: 1,
        type: '复贷促动包',
        creator: '赵六'
      }
    ]
    pagination.total = 100
  } catch (error) {
    console.error('获取券包列表失败:', error)
    Message.error('获取券包列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
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

// 打开新建弹窗
const openCreateModal = () => {
  createModalVisible.value = true
}

// 确认新建
const handleCreateConfirm = async () => {
  try {
    await formRef.value.validate()
    // TODO: 调用接口创建券包
    Message.success('创建成功')
    createModalVisible.value = false
    fetchTableData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消新建
const handleCreateCancel = () => {
  formRef.value.resetFields()
  createModalVisible.value = false
}

// 启用/停用券包
const handleStatusChange = async (record) => {
  try {
    // TODO: 调用接口修改状态
    Message.success(`${record.status === 1 ? '停用' : '启用'}成功`)
    fetchTableData()
  } catch (error) {
    console.error('修改状态失败:', error)
    Message.error('操作失败')
  }
}

// 删除券包
const handleDelete = async (record) => {
  try {
    // TODO: 调用接口删除券包
    Message.success('删除成功')
    fetchTableData()
  } catch (error) {
    console.error('删除失败:', error)
    Message.error('删除失败')
  }
}

// 处理行双击事件
const handleRowDblClick = (record) => {
  // 复用创建表单结构
  formData.value = {
    name: record.name,
    coupons: record.coupons || [],
    stockRule: record.stockRule || 'sufficient',
    invalidRule: record.invalidRule || 'any',
    marketingTargets: record.marketingTargets || ['app', 'miniprogram']
  }
  createModalVisible.value = true
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