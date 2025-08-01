<template>
  <div class="coupon-inventory-container">
    <!-- 搜索表单 -->
    <a-card class="search-card">
      <a-form :model="formModel" @submit="handleSearch" layout="horizontal" :style="{ width: '100%' }">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="couponId" label="券实例ID">
              <a-input v-model="formModel.couponId" placeholder="请输入券实例ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="templateId" label="券模版">
              <a-input v-model="formModel.templateId" placeholder="请输入券模版ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="userId" label="用户ID">
              <a-input v-model="formModel.userId" placeholder="请输入用户ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="packageId" label="券包ID">
              <a-input v-model="formModel.packageId" placeholder="请输入券包ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="status" label="券状态">
              <a-select v-model="formModel.status" placeholder="请选择券状态" allow-clear>
                <a-option value="received">已领取</a-option>
                <a-option value="locked">已锁定</a-option>
                <a-option value="used">已核销</a-option>
                <a-option value="expired">已过期</a-option>
                <a-option value="invalid">已作废</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" style="text-align: right">
            <a-space>
              <a-button @click="resetForm">重置</a-button>
              <a-button type="primary" html-type="submit">查询</a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 数据列表 -->
    <a-card class="table-card">
      <template #title>
        库存统计列表
      </template>
      <template #extra>
        <a-space>
          <a-button 
  type="primary" 
  status="danger" 
  :disabled="!selectedRows.length || withdrawLoading"
  :loading="withdrawLoading"
  @click="handleBatchWithdraw">
            <template #icon><icon-delete /></template>
            批量撤回
          </a-button>
          <a-button type="text">
            <template #icon><icon-download /></template>
            导出数据
          </a-button>
        </a-space>
      </template>
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :bordered="{ cell: true, wrapper: true }"
        stripe
        :row-selection="rowSelection"
        @row-click="handleRowClick"
      >
        <template #columns>
          <template v-for="column in columns" :key="column.dataIndex">
            <a-table-column v-bind="column">
              <template #cell="{ record }" v-if="column.customCell">
                <component :is="column.customCell" :record="record" />
              </template>
            </a-table-column>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, h, computed } from 'vue'
import { IconDownload, IconDelete } from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'

// 表格列配置
const columns = [
  { title: '用户ID', dataIndex: 'userId', width: 120, align: 'center' },
  { title: '券实例ID', dataIndex: 'couponId', width: 120, align: 'center' },
  { title: '券模版ID', dataIndex: 'templateId', width: 120, align: 'center' },
  { title: '券名称', dataIndex: 'couponName', width: 200 },
  {
    title: '券类型',
    dataIndex: 'couponType',
    width: 100,
    align: 'center',
    customCell: ({ record }) => h('a-tag', {
      color: record.couponType === 'discount' ? 'blue' : record.couponType === 'reduction' ? 'green' : 'orange'
    }, record.couponType === 'discount' ? '折扣券' : record.couponType === 'reduction' ? '满减券' : '立减券')
  },
  {
    title: '有效期',
    dataIndex: 'validPeriod',
    width: 200,
    customCell: ({ record }) => `${record.startTime} ~ ${record.endTime}`
  },
  {
    title: '券状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    customCell: ({ record }) => h('a-tag', {
      color: {
        'received': 'blue',
        'locked': 'orange',
        'used': 'green',
        'expired': 'red',
        'invalid': 'gray'
      }[record.status]
    }, {
      'received': '已领取',
      'locked': '已锁定',
      'used': '已核销',
      'expired': '已过期',
      'invalid': '已作废'
    }[record.status])
  }
]

// 搜索表单数据
const formModel = reactive({
  couponId: '',
  templateId: '',
  userId: '',
  packageId: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRowKeys = ref([])
const selectedRows = ref([])

// 行选择配置
const rowSelection = computed(() => ({
  type: 'checkbox',
  showCheckedAll: true,
  selectedRowKeys: selectedRowKeys.value,
  onChange: (rowKeys, rows) => {
    selectedRowKeys.value = rowKeys;
    selectedRows.value = rows;
  },
  checkStrictly: false,
  onlyCurrent: false
}))

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 获取库存统计数据
const fetchInventoryData = async () => {
  loading.value = true
  try {
    // TODO: 调用接口获取数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 模拟数据
    tableData.value = [
      {
        userId: '10001',
        couponId: 'CP001',
        templateId: 'TPL001',
        couponName: '新人专享券',
        couponType: 'discount',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 'received'
      },
      {
        userId: '10002',
        couponId: 'CP002',
        templateId: 'TPL002',
        couponName: '满100减10券',
        couponType: 'reduction',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 'locked'
      },
      {
        userId: '10003',
        couponId: 'CP003',
        templateId: 'TPL003',
        couponName: '立减50券',
        couponType: 'instant',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 'used'
      },
      {
        userId: '10004',
        couponId: 'CP004',
        templateId: 'TPL004',
        couponName: '周年庆券',
        couponType: 'discount',
        startTime: '2023-01-01',
        endTime: '2023-12-31',
        status: 'expired'
      },
      {
        userId: '10005',
        couponId: 'CP005',
        templateId: 'TPL005',
        couponName: '限时特惠券',
        couponType: 'reduction',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 'invalid'
      }
    ]
    pagination.total = 100
  } catch (error) {
    Message.error('获取库存统计数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchInventoryData()
}

// 批量撤回
const withdrawLoading = ref(false)
const handleBatchWithdraw = async () => {
  if (!selectedRows.value.length) {
    Message.warning('请先选择要撤回的券');
    return;
  }

  const validStatus = ['received', 'locked'];
  const withdrawableCoupons = selectedRows.value.filter(item => 
    validStatus.includes(item.status)
  );

  if (withdrawableCoupons.length !== selectedRows.value.length) {
    Modal.confirm({
      title: '部分券不可撤回',
      content: `当前选中${selectedRows.value.length}张券，其中${withdrawableCoupons.length}张可撤回`,
      okText: '继续撤回可操作券',
      cancelText: '取消操作',
      onOk: () => executeWithdraw(withdrawableCoupons)
    });
  } else {
    await executeWithdraw(withdrawableCoupons);
  }
};

const executeWithdraw = async (coupons) => {
  try {
    withdrawLoading.value = true;
    // 实际调用API处应替换为真实接口
    await Promise.all(coupons.map(coupon => 
      withdrawCouponAPI(coupon.couponId)
    ));
    await fetchInventoryData();
    selectedRowKeys.value = [];
    selectedRows.value = [];
    Message.success(`成功撤回${coupons.length}张券`);
  } catch (error) {
    Message.error(`撤回失败: ${error.message}`);
  } finally {
    withdrawLoading.value = false;
  }
}

// 重置表单
const resetForm = () => {
  formModel.couponId = ''
  formModel.templateId = ''
  formModel.userId = ''
  formModel.packageId = ''
  formModel.status = ''
  handleSearch()
}

// 分页变化
const onPageChange = (current) => {
  pagination.current = current
  fetchInventoryData()
}

// 每页条数变化
const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchInventoryData()
}

// 行点击事件
const handleRowClick = (record) => {
  const index = selectedRowKeys.value.indexOf(record.couponId);
  if (index === -1) {
    selectedRowKeys.value = [...selectedRowKeys.value, record.couponId];
    selectedRows.value = [...selectedRows.value, record];
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== record.couponId);
    selectedRows.value = selectedRows.value.filter(row => row.couponId !== record.couponId);
  }
  
  // 验证选中状态
  const validStatus = ['received', 'locked'];
  const hasInvalidSelection = selectedRows.value.some(
    item => !validStatus.includes(item.status)
  );
  
  if (hasInvalidSelection) {
    Message.warning('只能选择状态为"已领取"或"已锁定"的券');
  }
};

// 初始化加载数据
fetchInventoryData()
</script>

<style scoped>
.coupon-inventory-container {
  padding: 24px;
  background-color: var(--color-bg-2);
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  :deep(.arco-table-th) {
    background-color: var(--color-bg-2);
    font-weight: 600;
  }

  :deep(.arco-table-tr:hover) {
    background-color: var(--color-fill-1);
  }
}
</style>