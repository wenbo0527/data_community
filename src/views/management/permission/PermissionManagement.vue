<template>
  <div class="permission-management">
    <a-card title="权限管理" :bordered="false">
      <!-- 搜索和筛选区域 -->
      <a-space direction="vertical" fill style="margin-bottom: 16px;">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input-search
              v-model="searchText"
              placeholder="搜索资源名称"
              allow-clear
              @search="handleSearch"
            />
          </a-col>
          <a-col :span="4">
            <a-select
              v-model="resourceTypeFilter"
              placeholder="资源类型"
              allow-clear
              style="width: 100%"
            >
              <a-option value="">全部类型</a-option>
              <a-option value="table">数据表</a-option>
              <a-option value="metric">指标</a-option>
              <a-option value="variable">变量</a-option>
              <a-option value="external_data">外部数据</a-option>
              <a-option value="collection">集合</a-option>
              <a-option value="service">服务</a-option>
              <a-option value="subscribe">订阅</a-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-select
              v-model="permissionTypeFilter"
              placeholder="权限类型"
              allow-clear
              style="width: 100%"
            >
              <a-option value="">全部权限</a-option>
              <a-option value="view">查看</a-option>
              <a-option value="edit">编辑</a-option>
              <a-option value="call">调用</a-option>
              <a-option value="subscribe">订阅</a-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-select
              v-model="statusFilter"
              placeholder="权限状态"
              allow-clear
              style="width: 100%"
            >
              <a-option value="">全部状态</a-option>
              <a-option value="active">有效</a-option>
              <a-option value="expired">已过期</a-option>
              <a-option value="expiring">即将过期</a-option>
              <a-option value="revoked">已撤销</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><IconSearch /></template>
                查询
              </a-button>
              <a-button @click="handleReset">
                重置
              </a-button>
              <a-button @click="handleExport">
                <template #icon><IconDownload /></template>
                导出
              </a-button>
            </a-space>
          </a-col>
        </a-row>

        <!-- 统计信息 -->
        <a-row>
          <a-col :span="24">
            <a-space>
              <a-statistic
                title="总权限数"
                :value="statistics.totalCount"
                :value-style="{ color: '#3491fa' }"
              />
              <a-statistic
                title="有效权限"
                :value="statistics.activeCount"
                :value-style="{ color: '#00b42a' }"
              />
              <a-statistic
                title="即将过期"
                :value="statistics.expiringCount"
                :value-style="{ color: '#ff7d00' }"
              />
              <a-statistic
                title="已过期"
                :value="statistics.expiredCount"
                :value-style="{ color: '#f53f3f' }"
              />
            </a-space>
          </a-col>
        </a-row>
      </a-space>

      <!-- 权限列表 -->
      <a-table
        :data="permissions"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <!-- 资源信息 -->
        <template #resource="{ record }">
          <div class="resource-info">
            <div class="resource-name">{{ record.resourceName }}</div>
            <div class="resource-type">{{ getResourceTypeText(record.resourceType) }}</div>
          </div>
        </template>

        <!-- 权限类型 -->
        <template #permission="{ record }">
          <div class="permission-info">
            <div>{{ getPermissionTypeText(record.permissionType) }}</div>
            <div v-if="record.dataPermission" class="data-permission">
              {{ record.dataPermission }}
            </div>
          </div>
        </template>

        <!-- 敏感度 -->
        <template #sensitivity="{ record }">
          <SensitivityLabel :level="record.sensitivityLevel" />
        </template>

        <!-- 有效期 -->
        <template #expiry="{ record }">
          <div class="expiry-info">
            <div class="expiry-date">{{ formatDate(record.expiryDate) }}</div>
            <div 
              class="expiry-status" 
              :class="getExpiryStatus(record)"
            >
              {{ getExpiryStatusText(record) }}
            </div>
          </div>
        </template>

        <!-- 授权信息 -->
        <template #grant="{ record }">
          <div class="grant-info">
            <div class="grantor">{{ record.grantorName }}</div>
            <div class="grant-time">{{ formatDate(record.grantTime) }}</div>
          </div>
        </template>

        <!-- 状态 -->
        <template #status="{ record }">
          <div class="status-info">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </div>
        </template>

        <!-- 操作 -->
        <template #actions="{ record }">
          <a-space>
            <a-link @click="viewDetail(record)">详情</a-link>
            <a-link 
              v-if="canRenew(record)" 
              @click="handleRenew(record)"
              status="success"
            >
              续期
            </a-link>
            <a-link 
              v-if="canRevoke(record)" 
              @click="handleRevoke(record)"
              status="warning"
            >
              撤销
            </a-link>
            <a-link 
              v-if="canEdit(record)" 
              @click="handleEdit(record)"
            >
              编辑
            </a-link>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 权限详情抽屉 -->
    <PermissionDetailDrawer
      v-model:visible="detailVisible"
      :permission="selectedPermission"
      @refresh="loadPermissions"
    />

    <!-- 续期对话框 -->
    <RenewModal
      v-model:visible="renewVisible"
      :permission="renewTarget"
      @confirm="handleRenewConfirm"
    />

    <!-- 撤销确认对话框 -->
    <a-modal
      v-model:visible="revokeVisible"
      title="撤销权限"
      @ok="confirmRevoke"
      @cancel="cancelRevoke"
    >
      <p>确定要撤销权限 "{{ revokeTarget?.resourceName }}" 吗？</p>
      <a-textarea
        v-model="revokeReason"
        placeholder="请输入撤销原因（可选）"
        :rows="3"
        style="margin-top: 16px;"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconSearch, 
  IconDownload 
} from '@arco-design/web-vue/es/icon'
import SensitivityLabel from './components/SensitivityLabel.vue'
import PermissionDetailDrawer from './components/PermissionDetailDrawer.vue'
import RenewModal from './components/RenewModal.vue'
import { getPermissionTypeText, getResourceTypeText } from './utils'
import { getMyPermissions, revokePermission, renewPermission } from '@/api/permission'

// 响应式数据
const searchText = ref('')
const resourceTypeFilter = ref('')
const permissionTypeFilter = ref('')
const statusFilter = ref('')
const loading = ref(false)
const permissions = ref([])
const detailVisible = ref(false)
const selectedPermission = ref(null)
const renewVisible = ref(false)
const renewTarget = ref(null)
const revokeVisible = ref(false)
const revokeTarget = ref(null)
const revokeReason = ref('')

// 分页配置
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 统计信息
const statistics = computed(() => {
  const all = permissions.value
  const active = all.filter(p => p.status === 'active')
  const expiring = all.filter(p => p.status === 'expiring')
  const expired = all.filter(p => p.status === 'expired')
  
  return {
    totalCount: all.length,
    activeCount: active.length,
    expiringCount: expiring.length,
    expiredCount: expired.length
  }
})

// 表格列配置
const columns = [
  {
    title: '资源信息',
    slotName: 'resource',
    width: 200
  },
  {
    title: '权限类型',
    slotName: 'permission',
    width: 120
  },
  {
    title: '敏感度',
    slotName: 'sensitivity',
    width: 100
  },
  {
    title: '有效期',
    slotName: 'expiry',
    width: 150
  },
  {
    title: '授权信息',
    slotName: 'grant',
    width: 150
  },
  {
    title: '状态',
    slotName: 'status',
    width: 100
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 生命周期
onMounted(() => {
  loadPermissions()
})

// 方法
const loadPermissions = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      search: searchText.value || undefined,
      resourceType: resourceTypeFilter.value || undefined,
      permissionType: permissionTypeFilter.value || undefined,
      status: statusFilter.value || undefined
    }
    const response = await getMyPermissions(params)
    permissions.value = response.data.list
    pagination.value.total = response.data.total
  } catch (error) {
    Message.error('加载权限列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  loadPermissions()
}

const handleReset = () => {
  searchText.value = ''
  resourceTypeFilter.value = ''
  permissionTypeFilter.value = ''
  statusFilter.value = ''
  pagination.value.current = 1
  loadPermissions()
}

const handlePageChange = (page) => {
  pagination.value.current = page
  loadPermissions()
}

const handleExport = () => {
  // 导出权限记录
  Message.success('导出功能开发中')
}

const viewDetail = (record) => {
  selectedPermission.value = record
  detailVisible.value = true
}

const canRenew = (record) => {
  return record.status === 'expiring' || (record.status === 'active' && record.expiryDate)
}

const canRevoke = (record) => {
  return record.status === 'active'
}

const canEdit = (record) => {
  return record.status === 'active' && record.permissionType === 'view'
}

const handleRenew = (record) => {
  renewTarget.value = record
  renewVisible.value = true
}

const handleRenewConfirm = async (renewData) => {
  try {
    await renewPermission({
      permissionId: renewTarget.value.id,
      newExpiryDate: renewData.newExpiryDate,
      reason: renewData.reason
    })
    Message.success('续期成功')
    renewVisible.value = false
    loadPermissions()
  } catch (error) {
    Message.error('续期失败')
  }
}

const handleRevoke = (record) => {
  revokeTarget.value = record
  revokeVisible.value = true
}

const confirmRevoke = async () => {
  try {
    await revokePermission({
      permissionId: revokeTarget.value.id,
      reason: revokeReason.value
    })
    Message.success('撤销成功')
    revokeVisible.value = false
    loadPermissions()
  } catch (error) {
    Message.error('撤销失败')
  }
}

const cancelRevoke = () => {
  revokeVisible.value = false
  revokeReason.value = ''
}

const handleEdit = (record) => {
  // 编辑权限逻辑
  Message.success('编辑功能开发中')
}

const getStatusColor = (status) => {
  const colorMap = {
    'active': 'green',
    'expiring': 'orange',
    'expired': 'red',
    'revoked': 'gray'
  }
  return colorMap[status] || 'blue'
}

const getStatusText = (status) => {
  const textMap = {
    'active': '有效',
    'expiring': '即将过期',
    'expired': '已过期',
    'revoked': '已撤销'
  }
  return textMap[status] || status
}

const getExpiryStatus = (record) => {
  if (!record.expiryDate) return 'permanent'
  
  const now = new Date()
  const expiry = new Date(record.expiryDate)
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'expiring'
  return 'normal'
}

const getExpiryStatusText = (record) => {
  const status = getExpiryStatus(record)
  const statusMap = {
    'permanent': '永久有效',
    'normal': '正常',
    'expiring': '即将过期',
    'expired': '已过期'
  }
  return statusMap[status] || status
}

const formatDate = (date) => {
  if (!date) return '永久有效'
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped lang="less">
.permission-management {
  padding: 16px;
  background-color: var(--color-fill-2);
  min-height: calc(100vh - 84px);
}

.resource-info {
  .resource-name {
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 4px;
  }

  .resource-type {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.permission-info {
  .data-permission {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 2px;
  }
}

.expiry-info {
  .expiry-date {
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 4px;
  }

  .expiry-status {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 2px;

    &.normal {
      background-color: rgb(var(--success-1));
      color: rgb(var(--success-6));
    }

    &.expiring {
      background-color: rgb(var(--warning-1));
      color: rgb(var(--warning-6));
    }

    &.expired {
      background-color: rgb(var(--danger-1));
      color: rgb(var(--danger-6));
    }

    &.permanent {
      background-color: var(--color-fill-2);
      color: var(--color-text-3);
    }
  }
}

.grant-info {
  .grantor {
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 4px;
  }

  .grant-time {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.status-info {
  text-align: center;
}
</style>