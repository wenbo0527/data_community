<template>
  <div class="role-management-page">
    <a-card class="general-card" title="角色管理（RBAC）">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="openCreateRole">
              <template #icon><icon-plus /></template>
              新建自定义角色
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-input-search
            v-model="searchKey"
            placeholder="搜索角色名称"
            style="width: 300px"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
      </a-row>

      <a-table :data="filteredRoles" :pagination="pagination" @page-change="handlePageChange">
        <template #columns>
          <a-table-column title="角色名称" data-index="name">
            <template #cell="{ record }">
              <a-space>
                <span>{{ record.name }}</span>
                <a-tag v-if="record.builtin" color="orangered" size="small">系统默认</a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="描述" data-index="description" />
          <a-table-column title="创建时间" data-index="createTime" />
          <a-table-column title="操作" :width="180" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="openEditRole(record)">编辑配置</a-button>
                <a-button type="text" status="danger" size="small" :disabled="record.builtin" @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-drawer v-model:visible="editVisible" :width="720" unmount-on-close>
      <template #title>
        <a-space>
          <span>角色配置</span>
          <a-tag v-if="currentRole?.builtin" color="orangered" size="small">系统默认</a-tag>
          <a-tag v-else color="blue" size="small">自定义</a-tag>
          <a-divider direction="vertical" />
          <span style="color:#86909c">当前角色：{{ currentRole?.name }}</span>
        </a-space>
      </template>
      <div class="role-config">
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane key="basic" title="基础信息">
            <a-form :model="roleForm" layout="vertical" class="config-form">
              <a-form-item label="角色名称">
                <a-input v-model="roleForm.name" :disabled="currentRole?.builtin" />
              </a-form-item>
              <a-form-item label="角色描述">
                <a-textarea v-model="roleForm.description" :max-length="150" show-word-limit />
              </a-form-item>
              <a-form-item label="绑定部门成员">
                <a-select v-model="roleForm.boundDepartments" multiple allow-search placeholder="选择部门">
                  <a-option v-for="d in departmentOptions" :key="d.value" :value="d.value">{{ d.label }}</a-option>
                </a-select>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <a-tab-pane key="resource" title="应用权限">
            <a-card :bordered="false">
              <a-space style="margin-bottom: 12px">
                <a-button type="primary" @click="openSelectApps">添加应用</a-button>
              </a-space>
              <a-table :data="roleForm.appResources" :pagination="false">
                <template #columns>
                  <a-table-column title="应用名称" data-index="appName" />
                  <a-table-column title="应用ID" data-index="appId" />
                  <a-table-column title="权限级别" :width="200">
                    <template #cell="{ record }">
                      <a-select v-model="record.level" style="width: 180px">
                        <a-option value="VIEW">VIEW</a-option>
                        <a-option value="USE">USE</a-option>
                        <a-option value="ALL">ALL</a-option>
                      </a-select>
                    </template>
                  </a-table-column>
                  <a-table-column title="操作" :width="120">
                    <template #cell="{ record }">
                      <a-button type="text" status="danger" size="small" @click="removeAppResource(record)">移除</a-button>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </a-card>
          </a-tab-pane>

          <a-tab-pane key="data" title="数据权限">
            <a-card :bordered="false">
              <div class="section-title">全局权限点</div>
              <a-checkbox-group v-model="roleForm.dataPermissions.global">
                <a-checkbox value="SELECT">SELECT</a-checkbox>
                <a-checkbox value="INSERT">INSERT</a-checkbox>
                <a-checkbox value="UPDATE">UPDATE</a-checkbox>
                <a-checkbox value="DELETE">DELETE</a-checkbox>
                <a-checkbox value="CREATE">CREATE</a-checkbox>
                <a-checkbox value="DROP">DROP</a-checkbox>
              </a-checkbox-group>
            </a-card>
            <a-card :bordered="false" style="margin-top:16px">
              <div class="section-title">数据库/数据表/视图等粒度授权</div>
              <a-space direction="vertical" style="width:100%">
                <div class="kv-row">
                  <span>数据库</span>
                  <a-select v-model="roleForm.dataPermissions.database" style="width: 260px" allow-clear multiple>
                    <a-option v-for="db in databases" :key="db" :value="db">{{ db }}</a-option>
                  </a-select>
                </div>
                <div class="kv-row">
                  <span>数据表</span>
                  <a-select v-model="roleForm.dataPermissions.tables" style="width: 320px" allow-clear multiple>
                    <a-option v-for="tbl in tables" :key="tbl" :value="tbl">{{ tbl }}</a-option>
                  </a-select>
                </div>
                <div class="kv-row">
                  <span>视图</span>
                  <a-select v-model="roleForm.dataPermissions.views" style="width: 320px" allow-clear multiple>
                    <a-option v-for="v in views" :key="v" :value="v">{{ v }}</a-option>
                  </a-select>
                </div>
                <div class="kv-row">
                  <span>物化视图</span>
                  <a-select v-model="roleForm.dataPermissions.mviews" style="width: 320px" allow-clear multiple>
                    <a-option v-for="mv in mviews" :key="mv" :value="mv">{{ mv }}</a-option>
                  </a-select>
                </div>
                <div class="kv-row">
                  <span>字典</span>
                  <a-select v-model="roleForm.dataPermissions.dictionaries" style="width: 320px" allow-clear multiple>
                    <a-option v-for="d in dictionaries" :key="d" :value="d">{{ d }}</a-option>
                  </a-select>
                </div>
                <div class="kv-row">
                  <span>外部 Catalog</span>
                  <a-select v-model="roleForm.dataPermissions.externalCatalogs" style="width: 320px" allow-clear multiple>
                    <a-option v-for="c in externalCatalogs" :key="c" :value="c">{{ c }}</a-option>
                  </a-select>
                </div>
                <div class="kv-row">
                  <span>UDF 权限点</span>
                  <a-checkbox-group v-model="roleForm.dataPermissions.udf">
                    <a-checkbox value="CREATE_UDF">CREATE_UDF</a-checkbox>
                    <a-checkbox value="DROP_UDF">DROP_UDF</a-checkbox>
                    <a-checkbox value="EXECUTE_UDF">EXECUTE_UDF</a-checkbox>
                  </a-checkbox-group>
                </div>
              </a-space>
            </a-card>
          </a-tab-pane>

          <a-tab-pane key="users" title="已授予用户">
            <a-space style="margin-bottom: 12px">
              <a-button type="primary" @click="openGrantUser(currentRole)">授予用户</a-button>
            </a-space>
            <a-table :data="grantedUsers" :pagination="false">
              <template #columns>
                <a-table-column title="用户名称" data-index="name" />
                <a-table-column title="用户ID" data-index="id" />
                <a-table-column title="操作" :width="140">
                  <template #cell="{ record }">
                    <a-button type="text" status="danger" size="small" @click="revokeUser(record)">回收权限</a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="departments" title="已授予部门">
            <a-space style="margin-bottom: 12px">
              <a-button type="primary" @click="openGrantDepartment(currentRole)">授予部门</a-button>
            </a-space>
            <a-table :data="departmentsGranted" :pagination="false">
              <template #columns>
                <a-table-column title="部门名称">
                  <template #cell="{ record }">
                    {{ getDepartmentLabel(record) }}
                  </template>
                </a-table-column>
                <a-table-column title="部门编码" data-index="code" />
                <a-table-column title="操作" :width="140">
                  <template #cell="{ record }">
                    <a-button type="text" status="danger" size="small" @click="revokeDepartment(record)">回收绑定</a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </div>
      <template #footer>
        <a-space>
          <a-button @click="editVisible=false">取消</a-button>
          <a-button type="primary" @click="saveRoleConfig">保存</a-button>
        </a-space>
      </template>
    </a-drawer>

    <a-modal v-model:visible="createVisible" title="新建自定义角色" ok-text="创建" @ok="createRole">
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="角色名称">
          <a-input v-model="createForm.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色描述">
          <a-textarea v-model="createForm.description" :max-length="150" show-word-limit />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="grantVisible" title="授予用户" ok-text="授予" @ok="grantUsersToRole">
      <a-select v-model="selectedUserIds" multiple allow-search style="width: 100%" placeholder="选择用户">
        <a-option v-for="u in allUsers" :key="u.id" :value="u.id">{{ u.name }}</a-option>
      </a-select>
    </a-modal>
    <a-modal v-model:visible="selectAppsVisible" title="选择应用" ok-text="添加" :width="800" @ok="addSelectedApps">
      <a-input-search v-model="appSearchKey" allow-clear placeholder="搜索应用名称/ID" style="margin-bottom: 8px" />
      <a-table
        :data="filteredAvailableApps"
        row-key="appId"
        :pagination="{ pageSize: 5 }"
        :row-selection="{ type: 'checkbox', selectedRowKeys: selectedAppKeys, onChange: onSelectAppKeys }"
      >
        <template #columns>
          <a-table-column title="应用名称" data-index="appName" />
          <a-table-column title="应用ID" data-index="appId" />
          <a-table-column title="权限范围">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag color="blue" v-for="p in record.permissions" :key="p">{{ p }}</a-tag>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
    <a-modal v-model:visible="grantDeptVisible" title="授予部门" ok-text="授予" @ok="grantDepartmentsToRole">
      <a-select v-model="selectedDeptCodes" multiple allow-search style="width: 100%" placeholder="选择部门">
        <a-option v-for="d in departmentOptions" :key="d.value" :value="d.value">{{ d.label }}</a-option>
      </a-select>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const searchKey = ref('')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const roles = ref([
  {
    id: 'AccountAdmin',
    name: 'AccountAdmin',
    description: '账户管理员（根角色），不授权给其他子用户',
    createTime: '系统内置',
    builtin: true
  },
  {
    id: 'SystemAdmin',
    name: 'SystemAdmin',
    description: '系统管理员，拥有平台资源的全部权限',
    createTime: '系统内置',
    builtin: true
  },
  {
    id: 'DataAnalyst',
    name: 'DataAnalyst',
    description: '数据分析师，拥有数据查询相关权限',
    createTime: '2023-01-02 11:30:00',
    builtin: false
  },
  {
    id: 'ProjectManager',
    name: 'ProjectManager',
    description: '项目经理，管理项目资源',
    createTime: '2023-01-03 09:15:00',
    builtin: false
  }
])

const filteredRoles = computed(() => {
  const list = roles.value.filter(r => r.name.toLowerCase().includes((searchKey.value || '').toLowerCase()))
  pagination.total = list.length
  return list
})

const handleSearch = () => {}
const handlePageChange = (page) => { pagination.current = page }

const editVisible = ref(false)
const activeTab = ref('basic')
const currentRole = ref(null)
const roleForm = reactive({
  name: '',
  description: '',
  boundDepartments: [],
  dataPermissions: {
    global: [],
    database: [],
    tables: [],
    views: [],
    mviews: [],
    dictionaries: [],
    externalCatalogs: [],
    udf: []
  },
  appResources: []
})

const databases = ref(['db_core', 'db_mart', 'db_ext'])
const tables = ref(['orders', 'customers', 'transactions'])
const views = ref(['vw_daily_sales', 'vw_user_activity'])
const mviews = ref(['mv_monthly_sales'])
const dictionaries = ref(['dict_region', 'dict_product'])
const externalCatalogs = ref(['s3_catalog', 'hive_catalog'])

const grantedUsers = ref([
  { id: 'u_001', name: '张三' },
  { id: 'u_002', name: '李四' }
])
const departmentsGranted = ref([])

const allUsers = ref([
  { id: 'u_001', name: '张三' },
  { id: 'u_002', name: '李四' },
  { id: 'u_003', name: '王五' },
  { id: 'u_004', name: '赵六' }
])
const selectedUserIds = ref([])
const departmentOptions = [
  { label: '风险管理部', value: 'risk' },
  { label: '市场营销部', value: 'marketing' },
  { label: '数据分析部', value: 'data' }
]
const grantDeptVisible = ref(false)
const selectedDeptCodes = ref([])
const getDepartmentLabel = (code) => {
  const found = departmentOptions.find(d => d.value === code?.code || d.value === code)
  return found ? found.label : (code?.code || code || '')
}

const openEditRole = (record) => {
  currentRole.value = record
  roleForm.name = record.name
  roleForm.description = record.description
  if (record.name === 'SystemAdmin') {
    roleForm.dataPermissions.global = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP']
  }
  activeTab.value = 'resource'
  editVisible.value = true
  try {
    const raw = localStorage.getItem('roles:deptAssignments')
    const map = raw ? JSON.parse(raw) : {}
    const list = map[roleForm.name] || []
    departmentsGranted.value = list.map(code => ({ code }))
  } catch (e) {
    departmentsGranted.value = []
  }
}

const saveRoleConfig = () => {
  Message.success('角色配置已保存')
  try {
    const raw = localStorage.getItem('roles:deptBindings')
    const map = raw ? JSON.parse(raw) : {}
    map[roleForm.name || currentRole.value?.name] = Array.isArray(roleForm.boundDepartments) ? roleForm.boundDepartments : []
    localStorage.setItem('roles:deptBindings', JSON.stringify(map))
  } catch (e) {}
  editVisible.value = false
}

const revokeUser = (user) => {
  grantedUsers.value = grantedUsers.value.filter(u => u.id !== user.id)
  Message.success(`已回收用户 ${user.name} 的角色权限`)
}

const grantVisible = ref(false)
const openGrantUser = (record) => {
  currentRole.value = record
  grantVisible.value = true
}

const grantUsersToRole = () => {
  const addList = allUsers.value.filter(u => selectedUserIds.value.includes(u.id))
  const existedIds = new Set(grantedUsers.value.map(u => u.id))
  const merged = [...grantedUsers.value]
  addList.forEach(u => { if (!existedIds.has(u.id)) merged.push(u) })
  grantedUsers.value = merged
  selectedUserIds.value = []
  Message.success('已授予用户')
  grantVisible.value = false
}
const openGrantDepartment = (record) => {
  currentRole.value = record
  selectedDeptCodes.value = []
  grantDeptVisible.value = true
}
const grantDepartmentsToRole = () => {
  const existed = new Set(departmentsGranted.value.map(d => d.code))
  const merged = [...departmentsGranted.value]
  selectedDeptCodes.value.forEach(code => { if (!existed.has(code)) merged.push({ code }) })
  departmentsGranted.value = merged
  try {
    const raw = localStorage.getItem('roles:deptAssignments')
    const map = raw ? JSON.parse(raw) : {}
    map[roleForm.name || currentRole.value?.name] = departmentsGranted.value.map(d => d.code)
    localStorage.setItem('roles:deptAssignments', JSON.stringify(map))
  } catch (e) {}
  Message.success('已授予部门')
  grantDeptVisible.value = false
}
const revokeDepartment = (record) => {
  departmentsGranted.value = departmentsGranted.value.filter(d => d.code !== record.code)
  try {
    const raw = localStorage.getItem('roles:deptAssignments')
    const map = raw ? JSON.parse(raw) : {}
    map[roleForm.name || currentRole.value?.name] = departmentsGranted.value.map(d => d.code)
    localStorage.setItem('roles:deptAssignments', JSON.stringify(map))
  } catch (e) {}
  Message.success('已回收部门绑定')
}

const createVisible = ref(false)
const createForm = reactive({ name: '', description: '' })
const openCreateRole = () => {
  createForm.name = ''
  createForm.description = ''
  createVisible.value = true
}
const createRole = () => {
  if (!createForm.name) {
    Message.error('请输入角色名称')
    return
  }
  roles.value.push({
    id: `${createForm.name}_${Date.now()}`,
    name: createForm.name,
    description: createForm.description || '自定义角色',
    createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    builtin: false
  })
  Message.success('角色创建成功')
  createVisible.value = false
}

const handleDelete = (record) => {
  if (record.builtin) return
  roles.value = roles.value.filter(r => r.id !== record.id)
  Message.success(`已删除角色: ${record.name}`)
}

const selectAppsVisible = ref(false)
const availableAppPermissions = ref([])
const appSearchKey = ref('')
const selectedAppKeys = ref([])

const loadAvailableApps = () => {
  const raw = localStorage.getItem('permission.app.list')
  if (raw) {
    try {
      availableAppPermissions.value = JSON.parse(raw)
    } catch (e) {
      availableAppPermissions.value = []
    }
  }
  if (!availableAppPermissions.value.length) {
    availableAppPermissions.value = [
      { appName: '报表中心', appId: 'app_report', permissions: ['VIEW', 'USE'] },
      { appName: '数据导入', appId: 'app_loader', permissions: ['VIEW', 'USE', 'ALL'] },
      { appName: '知识库', appId: 'app_kb', permissions: ['VIEW', 'ALL'] }
    ]
  }
}

const filteredAvailableApps = computed(() => {
  const key = (appSearchKey.value || '').toLowerCase()
  return availableAppPermissions.value.filter(i =>
    i.appName.toLowerCase().includes(key) || i.appId.toLowerCase().includes(key)
  )
})

const openSelectApps = () => {
  loadAvailableApps()
  selectedAppKeys.value = []
  selectAppsVisible.value = true
}

const onSelectAppKeys = (keys) => {
  selectedAppKeys.value = keys
}

const addSelectedApps = () => {
  const existed = new Set(roleForm.appResources.map(i => i.appId))
  const addItems = availableAppPermissions.value.filter(i => selectedAppKeys.value.includes(i.appId))
  addItems.forEach(i => {
    if (!existed.has(i.appId)) {
      roleForm.appResources.push({
        appName: i.appName,
        appId: i.appId,
        level: 'VIEW'
      })
    }
  })
  selectAppsVisible.value = false
}

const removeAppResource = (record) => {
  roleForm.appResources = roleForm.appResources.filter(i => i.appId !== record.appId)
}
</script>

<style scoped>
.role-management-page {
  padding: 20px;
}
.config-form {
  padding: 8px 0;
}
.section-title {
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}
.kv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
