<template>
    <div class="coupon-record-container">
        <a-card class="search-card" :bordered="false">
            <a-form :model="searchForm" layout="inline" class="filter-form">
                <div class="form-content">
                    <div class="form-row">
                        <a-form-item field="userId" label="用户ID">
                            <a-input v-model="searchForm.userId" placeholder="请输入用户ID" allow-clear />
                        </a-form-item>
                        <a-form-item field="couponId" label="券实例ID">
                            <a-input v-model="searchForm.couponId" placeholder="请输入券实例ID" allow-clear />
                        </a-form-item>
                        <a-form-item field="inventoryId" label="券库存ID">
                            <a-input v-model="searchForm.inventoryId" placeholder="请输入券库存ID" allow-clear />
                        </a-form-item>
                        <a-form-item field="packageId" label="券包ID">
                            <a-input v-model="searchForm.packageId" placeholder="请输入券包ID" allow-clear />
                        </a-form-item>
                    </div>
                    <div class="form-row">
                        <a-form-item field="taskId" label="任务ID">
                            <a-input v-model="searchForm.taskId" placeholder="请输入任务ID" allow-clear />
                        </a-form-item>
                        <a-form-item field="status" label="发放状态">
                            <a-select v-model="searchForm.status" placeholder="全部状态" allow-clear>
                                <a-option value="success">成功</a-option>
                                <a-option value="failed">失败</a-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item field="operationType" label="流水类型">
                            <a-select v-model="searchForm.operationType" placeholder="全部类型" allow-clear>
                                <a-option value="发放">发放</a-option>
                                <a-option value="锁定">锁定</a-option>
                                <a-option value="解锁">解锁</a-option>
                                <a-option value="核销">核销</a-option>
                                <a-option value="过期">过期</a-option>
                                <a-option value="作废">作废</a-option>
                            </a-select>
                        </a-form-item>
                    </div>
                    <div class="form-row">
                        <a-form-item field="time" label="发放时间" class="date-form-item">
                            <a-range-picker v-model="searchForm.time" show-time
                                format="YYYY-MM-DD HH:mm:ss" :placeholder="['开始时间', '结束时间']" />
                        </a-form-item>
                    </div>
                </div>
                <div class="form-actions">
                    <a-space>
                        <a-button type="primary" @click="handleSearch">
                            <template #icon><icon-search /></template>
                            搜索
                        </a-button>
                        <a-button @click="handleReset">
                            <template #icon><icon-refresh /></template>
                            重置
                        </a-button>
                    </a-space>
                </div>
            </a-form>
        </a-card>

        <a-card class="table-card" :bordered="false">
            <template #title>
                <a-typography-title :heading="6" style="margin: 0">
                    流水记录列表
                </a-typography-title>
            </template>
            <template #extra>
                <a-tooltip content="下载流水记录">
                    <a-button type="primary" size="small">
                        <template #icon>
                            <icon-download />
                        </template>
                        下载记录
                    </a-button>
                </a-tooltip>
            </template>
            <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="onPageChange"
                @page-size-change="onPageSizeChange" :bordered="{ cell: true, wrapper: true }" stripe size="small">
                <template #columns>
                    <a-table-column title="用户ID" data-index="userId" :width="120" align="center" />
                    <a-table-column title="券实例ID" data-index="couponId" :width="140" align="center" />
                    <a-table-column title="券库存ID" data-index="inventoryId" :width="140" align="center" />
                    <a-table-column title="券包ID" data-index="packageId" :width="140" align="center" />
                    <a-table-column title="任务ID" data-index="taskId" :width="140" align="center" />
                    <a-table-column title="流水类型" data-index="operationType" :width="100" align="center">
                        <template #cell="{ record }">
                            <a-tag :color="{
                                '发放': 'blue',
                                '锁定': 'orange',
                                '解锁': 'green',
                                '核销': 'purple',
                                '过期': 'red',
                                '作废': 'gray'
                            }[record.operationType]" size="small">
                                {{ record.operationType }}
                            </a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="状态" data-index="status" :width="80" align="center">
                        <template #cell="{ record }">
                            <a-tag :color="record.status === '成功' ? 'green' : 'red'" size="small">
                                {{ record.status }}
                            </a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="详情" data-index="failedReason" :width="200">
                        <template #cell="{ record }">
                            <a-tooltip v-if="record.failedReason" :content="record.failedReason" position="left">
                                <a-typography-text type="secondary" style="cursor: help; display: inline-block; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {{ record.failedReason }}
                                </a-typography-text>
                            </a-tooltip>
                        </template>
                    </a-table-column>
                    <a-table-column title="发放时间" data-index="operationTime" :width="160" align="center" />
                </template>
            </a-table>
        </a-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { recordMockData } from '@/mock/coupon'
import { Message } from '@arco-design/web-vue'
import { IconDownload, IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon'

const route = useRoute()
const couponId = route.params.id

// 搜索表单数据
const searchForm = reactive({
    userId: '',
    couponId: '',
    inventoryId: '',
    packageId: '',
    taskId: '',
    count: undefined,
    time: [],
    status: undefined,
    operationType: undefined
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页配置
const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
})

// 获取表格数据
const fetchTableData = async () => {
    loading.value = true;
    try {
        // 使用mock数据
        const mockData = recordMockData

        // 根据分页参数返回对应的数据
        const start = (pagination.current - 1) * pagination.pageSize
        const end = start + pagination.pageSize
        tableData.value = mockData.slice(start, end)
        pagination.total = mockData.length
    } catch (error) {
        console.error('获取发放记录失败:', error)
        Message.error('获取发放记录失败')
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    pagination.current = 1
    fetchTableData()
}

// 重置
const handleReset = () => {
    searchForm.userId = ''
    searchForm.couponId = ''
    searchForm.inventoryId = ''
    searchForm.packageId = ''
    searchForm.taskId = ''
    searchForm.count = undefined
    searchForm.time = []
    searchForm.status = undefined
    searchForm.operationType = undefined
    handleSearch()
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

// 初始化加载数据
fetchTableData()
</script>

<style scoped>
.coupon-record-container {
    padding: 16px;
}

.search-card {
    margin-bottom: 16px;

    :deep(.arco-card-body) {
        padding: 20px 24px;
    }

    .filter-form {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .form-content {
            display: flex;
            flex-wrap: wrap;
            gap: 16px 24px;
            margin-bottom: 8px;
        }

        .form-row {
            display: flex;
            gap: 16px;
            width: 100%;
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
        }
    }

    :deep(.arco-form-item) {
        margin-bottom: 0;
        margin-right: 0;

        &-label {
            color: var(--color-text-2);
        }

        &-wrapper {
            min-width: 200px;
        }
    }

    :deep(.arco-input) {
        width: 200px;
    }

    :deep(.arco-picker) {
        width: 360px;
    }

    :deep(.arco-select) {
        width: 200px;
    }

    .date-form-item {
        flex-grow: 1;
        max-width: 100%;
    }
}

.table-card {
    :deep(.arco-card-header) {
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-border);
    }
}
</style>