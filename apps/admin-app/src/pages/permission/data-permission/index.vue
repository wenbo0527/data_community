<template>
  <div class="data-permission-page">
    <a-card class="general-card" title="数据权限管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-select v-model="searchForm.resourceType" placeholder="资源类型" style="width: 200px" allow-clear @change="handleSearch">
              <a-option value="database">数据库</a-option>
              <a-option value="table">数据表</a-option>
              <a-option value="view">视图</a-option>
              <a-option value="mview">物化视图</a-option>
              <a-option value="dictionary">字典</a-option>
              <a-option value="external_catalog">外部 Catalog</a-option>
              <a-option value="udf">UDF</a-option>
            </a-select>
            <a-input-search v-model="searchForm.keyword" placeholder="搜索资源名称" style="width: 300px" allow-clear @search="handleSearch" @clear="handleSearch" />
          </a-space>
        </a-col>
      </a-row>

      <a-table :data="filteredData" :pagination="pagination" style="margin-top: 16px">
        <template #columns>
          <a-table-column title="资源名称" data-index="resourceName" />
          <a-table-column title="资源类型" data-index="resourceType">
            <template #cell="{ record }">{{ getResourceTypeText(record.resourceType) }}</template>
          </a-table-column>
          <a-table-column title="权限负责人" data-index="owner" />
          <a-table-column title="操作" width="150" align="center">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="openDetail(record)">编辑</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 详情 Drawer -->
    <a-drawer v-model:visible="detailVisible" :width="720" title="编辑资源权限" unmount-on-close>
      <div v-if="currentResource" class="resource-info" style="margin-bottom: 24px;">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="资源名称">{{ currentResource.resourceName }}</a-descriptions-item>
          <a-descriptions-item label="资源类型">{{ getResourceTypeText(currentResource.resourceType) }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ currentResource.owner }}</a-descriptions-item>
        </a-descriptions>
      </div>

      <div class="grant-section">
        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">已授权列表</h3>
          <a-button type="primary" @click="openGrant">添加授权</a-button>
        </div>
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane key="department" title="按部门">
            <div v-if="deptGrants.length > 0" style="margin-bottom: 8px;">
              <a-checkbox v-model="deptSelectAll" @change="handleDeptSelectAll">全选</a-checkbox>
            </div>
            <a-table :data="deptGrants" :pagination="false" :row-selection="rowSelectionConfig('department')">
              <template #columns>
                <a-table-column type="checkbox" />
                <a-table-column title="部门名称" data-index="subjectName" />
                <a-table-column title="权限点" data-index="permissions">
                  <template #cell="{ record }">
                    <a-space wrap><a-tag v-for="p in record.permissions" :key="p" size="small" color="blue">{{p}}</a-tag></a-space>
                  </template>
                </a-table-column>
                <a-table-column title="授权时间" data-index="grantTime" />
                <a-table-column title="操作" width="100">
                  <template #cell="{ record }">
                    <a-button type="text" status="danger" size="small" @click="revokeGrant(record)">移除</a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
            <div v-if="deptGrants.length > 0" style="margin-top: 12px; text-align: right;">
              <a-button type="primary" status="danger" size="small" :disabled="selectedDeptKeys.length === 0" @click="batchRevoke('department')">
                批量移除 ({{ selectedDeptKeys.length }})
              </a-button>
            </div>
          </a-tab-pane>
          <a-tab-pane key="role" title="按角色">
            <div v-if="roleGrants.length > 0" style="margin-bottom: 8px;">
              <a-checkbox v-model="roleSelectAll" @change="handleRoleSelectAll">全选</a-checkbox>
            </div>
            <a-table :data="roleGrants" :pagination="false" :row-selection="rowSelectionConfig('role')">
              <template #columns>
                <a-table-column type="checkbox" />
                <a-table-column title="角色名称" data-index="subjectName" />
                <a-table-column title="权限点" data-index="permissions">
                  <template #cell="{ record }">
                    <a-space wrap><a-tag v-for="p in record.permissions" :key="p" size="small" color="blue">{{p}}</a-tag></a-space>
                  </template>
                </a-table-column>
                <a-table-column title="授权时间" data-index="grantTime" />
                <a-table-column title="操作" width="100">
                  <template #cell="{ record }">
                    <a-button type="text" status="danger" size="small" @click="revokeGrant(record)">移除</a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
            <div v-if="roleGrants.length > 0" style="margin-top: 12px; text-align: right;">
              <a-button type="primary" status="danger" size="small" :disabled="selectedRoleKeys.length === 0" @click="batchRevoke('role')">
                批量移除 ({{ selectedRoleKeys.length }})
              </a-button>
            </div>
          </a-tab-pane>
          <a-tab-pane key="user" title="按用户">
            <div v-if="userGrants.length > 0" style="margin-bottom: 8px;">
              <a-checkbox v-model="userSelectAll" @change="handleUserSelectAll">全选</a-checkbox>
            </div>
            <a-table :data="userGrants" :pagination="false" :row-selection="rowSelectionConfig('user')">
              <template #columns>
                <a-table-column type="checkbox" />
                <a-table-column title="用户名称" data-index="subjectName" />
                <a-table-column title="权限点" data-index="permissions">
                  <template #cell="{ record }">
                    <a-space wrap><a-tag v-for="p in record.permissions" :key="p" size="small" color="blue">{{p}}</a-tag></a-space>
                  </template>
                </a-table-column>
                <a-table-column title="授权时间" data-index="grantTime" />
                <a-table-column title="操作" width="100">
                  <template #cell="{ record }">
                    <a-button type="text" status="danger" size="small" @click="revokeGrant(record)">移除</a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
            <div v-if="userGrants.length > 0" style="margin-top: 12px; text-align: right;">
              <a-button type="primary" status="danger" size="small" :disabled="selectedUserKeys.length === 0" @click="batchRevoke('user')">
                批量移除 ({{ selectedUserKeys.length }})
              </a-button>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-drawer>

    <!-- 授权 Modal -->
    <a-modal v-model:visible="grantVisible" title="赋予权限" @ok="submitGrant" @cancel="grantVisible=false" ok-text="确认">
      <a-form :model="grantForm" layout="vertical">
        <a-form-item label="授权类型">
          <a-radio-group v-model="grantForm.subjectType">
            <a-radio value="department">部门</a-radio>
            <a-radio value="role">角色</a-radio>
            <a-radio value="user">用户</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="subjectLabel">
          <a-select v-model="grantForm.subjectName" :options="subjectOptions" placeholder="请选择" allow-search />
        </a-form-item>
        <a-form-item label="权限点">
          <a-checkbox-group v-model="grantForm.permissions">
            <a-checkbox v-for="p in permissionPoints" :key="p" :value="p">{{ p }}</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchForm = reactive({
  resourceType: '',
  keyword: ''
})

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 资源数据
const resourceList = ref([
  { id: 1, resourceName: 'default.test_qzx', resourceType: 'table', owner: '张三' },
  { id: 2, resourceName: 'default.user_info', resourceType: 'table', owner: '李四' },
  { id: 3, resourceName: 'marketing_db', resourceType: 'database', owner: '王五' },
  { id: 4, resourceName: 'analytics.vw_daily_sales', resourceType: 'view', owner: '赵六' },
  { id: 5, resourceName: 'analytics.mv_monthly_sales', resourceType: 'mview', owner: '张三' },
  { id: 6, resourceName: 'default.dict_region', resourceType: 'dictionary', owner: '李四' },
  { id: 7, resourceName: 's3_catalog', resourceType: 'external_catalog', owner: '王五' },
  { id: 8, resourceName: 'f_sum', resourceType: 'udf', owner: '赵六' }
])

// 授权记录数据 (MOCK)
const grantsData = ref([
  { id: 101, resourceId: 1, subjectType: 'department', subjectName: '数据分析部', permissions: ['SELECT'], grantTime: '2025-01-15 10:30:00' },
  { id: 102, resourceId: 1, subjectType: 'role', subjectName: 'DataAnalyst', permissions: ['SELECT', 'INSERT'], grantTime: '2025-02-20 14:20:00' },
  { id: 103, resourceId: 3, subjectType: 'user', subjectName: '张三', permissions: ['ALL'], grantTime: '2025-03-01 09:00:00' },
  { id: 104, resourceId: 1, subjectType: 'department', subjectName: '风险管理部', permissions: ['SELECT', 'UPDATE'], grantTime: '2025-03-05 11:15:00' },
  { id: 105, resourceId: 1, subjectType: 'role', subjectName: 'ProjectManager', permissions: ['SELECT', 'UPDATE', 'DELETE'], grantTime: '2025-03-10 16:45:00' },
  { id: 106, resourceId: 2, subjectType: 'user', subjectName: '李四', permissions: ['SELECT', 'INSERT'], grantTime: '2025-03-12 13:20:00' }
])

const filteredData = computed(() => {
  let data = resourceList.value
  if (searchForm.resourceType) {
    data = data.filter(item => item.resourceType === searchForm.resourceType)
  }
  if (searchForm.keyword) {
    data = data.filter(item => item.resourceName.toLowerCase().includes(searchForm.keyword.toLowerCase()))
  }
  pagination.total = data.length
  return data
})

const handleSearch = () => {
  pagination.current = 1
}

const getResourceTypeText = (t) => {
  const map = {
    database: '数据库',
    table: '数据表',
    view: '视图',
    mview: '物化视图',
    dictionary: '字典',
    external_catalog: '外部 Catalog',
    udf: 'UDF'
  }
  return map[t] || t
}

// 详情页逻辑
const detailVisible = ref(false)
const currentResource = ref(null)
const activeTab = ref('department')

const openDetail = (record) => {
  currentResource.value = record
  detailVisible.value = true
}

// 筛选当前资源的授权记录
const currentGrants = computed(() => {
  if (!currentResource.value) return []
  return grantsData.value.filter(g => g.resourceId === currentResource.value.id)
})

const deptGrants = computed(() => currentGrants.value.filter(g => g.subjectType === 'department'))
const roleGrants = computed(() => currentGrants.value.filter(g => g.subjectType === 'role'))
const userGrants = computed(() => currentGrants.value.filter(g => g.subjectType === 'user'))

// 授权逻辑
const grantVisible = ref(false)
const grantForm = reactive({
  subjectType: 'department',
  subjectName: '',
  permissions: []
})

const departmentOptions = [
  { label: '风险管理部', value: '风险管理部' },
  { label: '市场营销部', value: '市场营销部' },
  { label: '数据分析部', value: '数据分析部' }
]
const roleOptions = [
  { label: 'AccountAdmin', value: 'AccountAdmin' },
  { label: 'SystemAdmin', value: 'SystemAdmin' },
  { label: 'DataAnalyst', value: 'DataAnalyst' },
  { label: 'ProjectManager', value: 'ProjectManager' }
]
const userOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' }
]

const subjectLabel = computed(() => {
  if (grantForm.subjectType === 'department') return '选择部门'
  if (grantForm.subjectType === 'role') return '选择角色'
  return '选择用户'
})

const subjectOptions = computed(() => {
  if (grantForm.subjectType === 'department') return departmentOptions
  if (grantForm.subjectType === 'role') return roleOptions
  return userOptions
})

const permissionPoints = computed(() => {
  if (currentResource.value?.resourceType === 'udf') {
    return ['CREATE_UDF', 'DROP_UDF', 'EXECUTE_UDF']
  }
  return ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALL']
})

const openGrant = () => {
  grantForm.subjectType = activeTab.value // 默认选中当前tab的类型
  grantForm.subjectName = ''
  grantForm.permissions = []
  grantVisible.value = true
}

const submitGrant = () => {
  if (!grantForm.subjectName) {
    Message.error('请选择授权对象')
    return
  }
  if (!grantForm.permissions.length) {
    Message.error('请选择权限点')
    return
  }
  
  // 检查是否已存在
  const existIndex = grantsData.value.findIndex(g => 
    g.resourceId === currentResource.value.id && 
    g.subjectType === grantForm.subjectType && 
    g.subjectName === grantForm.subjectName
  )

  if (existIndex >= 0) {
    grantsData.value[existIndex].permissions = [...grantForm.permissions]
    Message.success('已更新授权记录')
  } else {
    grantsData.value.push({
      id: Date.now(),
      resourceId: currentResource.value.id,
      subjectType: grantForm.subjectType,
      subjectName: grantForm.subjectName,
      permissions: [...grantForm.permissions]
    })
    Message.success('已添加授权记录')
  }
  grantVisible.value = false
}

const revokeGrant = (record) => {
  grantsData.value = grantsData.value.filter(g => g.id !== record.id)
  Message.success('已移除授权')
}

// 批量移除相关逻辑
const deptSelectAll = ref(false)
const roleSelectAll = ref(false)
const userSelectAll = ref(false)
const selectedDeptKeys = ref([])
const selectedRoleKeys = ref([])
const selectedUserKeys = ref([])

const rowSelectionConfig = (type) => {
  if (type === 'department') {
    return {
      type: 'checkbox',
      showCheckedAll: false,
      selectedRowKeys: selectedDeptKeys.value,
      onChange: (keys) => { selectedDeptKeys.value = keys }
    }
  }
  if (type === 'role') {
    return {
      type: 'checkbox',
      showCheckedAll: false,
      selectedRowKeys: selectedRoleKeys.value,
      onChange: (keys) => { selectedRoleKeys.value = keys }
    }
  }
  return {
    type: 'checkbox',
    showCheckedAll: false,
    selectedRowKeys: selectedUserKeys.value,
    onChange: (keys) => { selectedUserKeys.value = keys }
  }
}

const handleDeptSelectAll = (checked) => {
  if (checked) {
    selectedDeptKeys.value = deptGrants.value.map(g => g.id)
  } else {
    selectedDeptKeys.value = []
  }
}

const handleRoleSelectAll = (checked) => {
  if (checked) {
    selectedRoleKeys.value = roleGrants.value.map(g => g.id)
  } else {
    selectedRoleKeys.value = []
  }
}

const handleUserSelectAll = (checked) => {
  if (checked) {
    selectedUserKeys.value = userGrants.value.map(g => g.id)
  } else {
    selectedUserKeys.value = []
  }
}

const batchRevoke = (type) => {
  let keys = []
  if (type === 'department') keys = selectedDeptKeys.value
  if (type === 'role') keys = selectedRoleKeys.value
  if (type === 'user') keys = selectedUserKeys.value

  if (keys.length === 0) return

  Message.warning({
    id: 'batch-revoke',
    content: `确认要撤销选中的 ${keys.length} 条授权记录吗？`,
    duration: 0,
    closable: true,
    action: h('a-button', { type: 'primary', size: 'mini', onClick: () => confirmBatchRevoke(type, keys) }, '确认'),
    close: () => Message.remove('batch-revoke')
  })
}

const confirmBatchRevoke = (type, keys) => {
  grantsData.value = grantsData.value.filter(g => !keys.includes(g.id))
  // 清空选择
  if (type === 'department') {
    selectedDeptKeys.value = []
    deptSelectAll.value = false
  }
  if (type === 'role') {
    selectedRoleKeys.value = []
    roleSelectAll.value = false
  }
  if (type === 'user') {
    selectedUserKeys.value = []
    userSelectAll.value = false
  }
  Message.success(`已批量移除 ${keys.length} 条授权记录`)
  Message.remove('batch-revoke')
}
</script>

<style scoped>
.data-permission-page {
  padding: 16px;
  background-color: var(--color-fill-2);
  min-height: 100%;
}
.general-card {
  min-height: calc(100vh - 100px);
}
</style>
