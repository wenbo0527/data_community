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
            </a-form>
          </a-tab-pane>

          <a-tab-pane key="resource" title="应用权限">
            <a-card :bordered="false">
              <div class="resource-tree-section">
                <div class="tree-toolbar">
                  <a-space>
                    <a-input-search v-model="appTreeSearch" placeholder="模糊搜索应用 / 模块" allow-clear />
                    <a-select v-model="appStatusFilter" :options="appStatusOptions" placeholder="筛选状态" style="width: 140px" />
                    <a-button @click="expandAllApps">展开全部</a-button>
                    <a-button @click="collapseAllApps">折叠全部</a-button>
                  </a-space>
                </div>
                <a-spin :loading="appTreeLoading">
                  <a-tree
                    :data="appTreeData"
                    checkable
                    :check-strictly="false"
                    :virtual-list-props="{ height: 420 }"
                    v-model:checked-keys="appTreeCheckedKeys"
                    v-model:expanded-keys="appTreeExpandedKeys"
                  />
                </a-spin>
                <div class="helper-text">
                  支持模糊搜索与状态筛选。
                </div>
                <div class="global-selected-summary" v-if="totalSelectedApps > 0 || totalSelectedModules > 0">
                  <div v-if="totalSelectedApps > 0 || totalSelectedModules > 0">
                    已选应用 {{ totalSelectedApps }} 个；
                    模块/功能 {{ totalSelectedModules }} 个
                  </div>
                  <div class="section-actions">
                    <a-button type="text" status="danger" @click="clearAllAppSelection">清空选择</a-button>
                  </div>
                </div>
                <div class="selected-preview" v-if="roleForm.appResources.length">
                  <div class="section-title">已选应用预览</div>
                  <a-collapse>
                    <a-collapse-item v-for="app in roleForm.appResources" :key="app.appId" :header="app.appName">
                      <a-list size="small" :bordered="false">
                        <a-list-item v-for="module in (app.modules || [])" :key="app.appId + ':module:' + module">
                          <a-space>
                            <a-tag color="blue">模块</a-tag>
                            <span>{{ module }}</span>
                            <a-button type="text" status="danger" @click="removeModule(app.appId, module)">移除</a-button>
                          </a-space>
                        </a-list-item>
                      </a-list>
                      <div class="app-level-controls">
                        <span>权限级别：</span>
                        <a-select v-model="app.level" style="width: 180px; margin-left: 8px;">
                          <a-option value="VIEW">VIEW</a-option>
                          <a-option value="USE">USE</a-option>
                          <a-option value="ALL">ALL</a-option>
                        </a-select>
                      </div>
                    </a-collapse-item>
                  </a-collapse>
                </div>
              </div>
            </a-card>
          </a-tab-pane>

          <a-tab-pane key="data" title="数据权限">
            <a-alert v-if="currentRole?.builtin" type="warning" style="margin-bottom: 16px;">
              <template #icon><icon-info-circle /></template>
              <span style="color: #d91c1c; font-weight: 600;">系统默认角色，权限配置需谨慎</span>
            </a-alert>
            
            <a-card :bordered="false">
              <div class="section-title">计算引擎 (按引擎分配权限)</div>
              <a-radio-group v-model="selectedEngine" type="button">
                <a-radio value="inceptor">Inceptor (Hive)</a-radio>
                <a-radio value="doris">Doris</a-radio>
              </a-radio-group>
              <div class="engine-desc" v-if="selectedEngine">
                当前为 <a-tag color="blue">{{ selectedEngine === 'inceptor' ? 'Inceptor (Hive)' : 'Doris' }}</a-tag> 引擎配置权限
              </div>
            </a-card>
            
            <a-card :bordered="false" style="margin-top:16px">
              <div class="section-title">全局权限点 ({{ selectedEngine === 'inceptor' ? 'Inceptor' : 'Doris' }})</div>
              <a-checkbox-group v-model="roleForm.dataPermissions.global" :disabled="selectedEngine === 'doris' && isAdminTemplate">
                <template v-if="selectedEngine === 'inceptor'">
                  <a-checkbox value="SELECT">SELECT</a-checkbox>
                  <a-checkbox value="INSERT">INSERT</a-checkbox>
                  <a-checkbox value="UPDATE">UPDATE</a-checkbox>
                  <a-checkbox value="DELETE">DELETE</a-checkbox>
                  <a-checkbox value="CREATE">CREATE</a-checkbox>
                  <a-checkbox value="DROP">DROP</a-checkbox>
                  <a-checkbox value="LOAD">LOAD</a-checkbox>
                  <a-checkbox value="ALTER">ALTER</a-checkbox>
                </template>
                <template v-else>
                  <a-checkbox value="select_priv">select_priv</a-checkbox>
                  <a-checkbox value="insert_priv">insert_priv</a-checkbox>
                  <a-checkbox value="update_priv">update_priv</a-checkbox>
                  <a-checkbox value="delete_priv">delete_priv</a-checkbox>
                  <a-checkbox value="create_priv">create_priv</a-checkbox>
                  <a-checkbox value="drop_priv">drop_priv</a-checkbox>
                  <a-checkbox value="load_priv">load_priv</a-checkbox>
                  <a-checkbox value="alter_priv">alter_priv</a-checkbox>
                </template>
              </a-checkbox-group>
              <div class="helper-text" v-if="isAdminTemplate">
                <icon-info-circle /> 运维/DBA模板已锁定全部权限
              </div>
            </a-card>
            
            <a-card :bordered="false" style="margin-top:16px">
              <div class="section-title">
                {{ selectedEngine === 'inceptor' ? 'Inceptor' : 'Doris' }} 对象级权限配置
              </div>
              <a-space direction="vertical" style="width:100%">
                <div class="kv-row">
                  <span>数据库</span>
                </div>
                <div class="resource-list-container">
                  <div class="resource-list-header">
                    <a-input-search v-model="dbSearchKeyword" placeholder="搜索数据库" style="width: 200px; margin-bottom: 8px;" />
                    <a-checkbox v-model="dbSelectAll" @change="handleDbSelectAll" style="margin-left: 8px;">全选</a-checkbox>
                  </div>
                  <div class="resource-list-content">
                    <a-checkbox-group v-model="roleForm.dataPermissions.database" class="resource-checkbox-group">
                      <a-checkbox v-for="db in filteredDatabases" :key="db" :value="db" class="resource-checkbox-item">
                        {{ db }}
                      </a-checkbox>
                    </a-checkbox-group>
                    <a-empty v-if="filteredDatabases.length === 0" description="无匹配数据库" />
                  </div>
                </div>
                <div class="kv-row">
                  <span>数据表</span>
                </div>
                <div class="resource-list-container">
                  <div class="resource-list-header">
                    <a-input-search v-model="tableSearchKeyword" placeholder="搜索数据表" style="width: 200px; margin-bottom: 8px;" />
                    <a-checkbox v-model="tableSelectAll" @change="handleTableSelectAll" style="margin-left: 8px;">全选</a-checkbox>
                  </div>
                  <div class="resource-list-content">
                    <a-checkbox-group v-model="roleForm.dataPermissions.tables" class="resource-checkbox-group">
                      <a-checkbox v-for="tbl in filteredTables" :key="tbl" :value="tbl" class="resource-checkbox-item">
                        {{ tbl }}
                      </a-checkbox>
                    </a-checkbox-group>
                    <a-empty v-if="filteredTables.length === 0" description="无匹配数据表" />
                  </div>
                </div>
                <div class="kv-row">
                  <span>视图</span>
                </div>
                <div class="resource-list-container">
                  <div class="resource-list-header">
                    <a-input-search v-model="viewSearchKeyword" placeholder="搜索视图" style="width: 200px; margin-bottom: 8px;" />
                    <a-checkbox v-model="viewSelectAll" @change="handleViewSelectAll" style="margin-left: 8px;">全选</a-checkbox>
                  </div>
                  <div class="resource-list-content">
                    <a-checkbox-group v-model="roleForm.dataPermissions.views" class="resource-checkbox-group">
                      <a-checkbox v-for="v in filteredViews" :key="v" :value="v" class="resource-checkbox-item">
                        {{ v }}
                      </a-checkbox>
                    </a-checkbox-group>
                    <a-empty v-if="filteredViews.length === 0" description="无匹配视图" />
                  </div>
                </div>
                <template v-if="selectedEngine === 'inceptor'">
                  <div class="kv-row">
                    <span>物化视图</span>
                    <a-select v-model="roleForm.dataPermissions.mviews" style="width: 320px" allow-clear multiple>
                      <a-option v-for="mv in mviewsByEngine" :key="mv" :value="mv">{{ mv }}</a-option>
                    </a-select>
                  </div>
                </template>
                <div class="kv-row">
                  <span>字典</span>
                  <a-select v-model="roleForm.dataPermissions.dictionaries" style="width: 320px" allow-clear multiple>
                    <a-option v-for="d in dictionariesByEngine" :key="d" :value="d">{{ d }}</a-option>
                  </a-select>
                </div>
                <div class="kv-row">
                  <span>外部 Catalog</span>
                  <a-select v-model="roleForm.dataPermissions.externalCatalogs" style="width: 320px" allow-clear multiple>
                    <a-option v-for="c in externalCatalogs" :key="c" :value="c">{{ c }}</a-option>
                  </a-select>
                </div>
              </a-space>
            </a-card>
          </a-tab-pane>

          <a-tab-pane key="users" title="已授予用户">
            <a-card :bordered="false">
              <div class="section-title">添加用户</div>
              <div class="grant-section">
                <a-space style="width: 100%;">
                  <a-select v-model="selectedUserIds" multiple allow-search style="flex: 1;" placeholder="选择用户">
                    <a-option v-for="u in allUsers" :key="u.id" :value="u.id">{{ u.name }}</a-option>
                  </a-select>
                  <a-button type="primary" @click="grantUsersToRole">授予</a-button>
                </a-space>
              </div>
              
              <div class="section-title">已授予用户列表</div>
              <a-table :data="grantedUsers" :pagination="false">
                <template #columns>
                  <a-table-column title="用户名称" data-index="name" />
                  <a-table-column title="用户工号" data-index="id" />
                  <a-table-column title="操作" :width="140">
                    <template #cell="{ record }">
                      <a-button type="text" status="danger" size="small" @click="revokeUser(record)">回收权限</a-button>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </a-card>
          </a-tab-pane>
          
          <a-tab-pane key="departments" title="已授予部门">
            <a-card :bordered="false">
              <div class="section-title">添加部门</div>
              <div class="grant-section">
                <a-space style="width: 100%;">
                  <a-select v-model="selectedDeptCodes" multiple allow-search style="flex: 1;" placeholder="选择部门">
                    <a-option v-for="d in departmentOptions" :key="d.value" :value="d.value">{{ d.label }}</a-option>
                  </a-select>
                  <a-button type="primary" @click="grantDepartmentsToRole">授予</a-button>
                </a-space>
              </div>
              
              <div class="section-title">已授予部门列表</div>
              <a-table :data="departmentsGranted" :pagination="false">
                <template #columns>
                  <a-table-column title="组织名称">
                    <template #cell="{ record }">
                      {{ getDepartmentLabel(record) }}
                    </template>
                  </a-table-column>
                  <a-table-column title="操作" :width="140">
                    <template #cell="{ record }">
                      <a-button type="text" status="danger" size="small" @click="revokeDepartment(record)">回收绑定</a-button>
                    </template>
                  </a-table-column>
                </template>
              </a-table>
            </a-card>
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


  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconInfoCircle } from '@arco-design/web-vue/es/icon'

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
  appResources: [],
})

// 模拟按引擎区分的数据
const mockDataByEngine = {
  inceptor: {
    databases: [
      'hive_ods', 'hive_dwd', 'hive_dim', 'hive_dm', 'hive_risk', 'hive_marketing', 
      'hive_finance', 'hive_logistics', 'hive_hr', 'hive_bi'
    ],
    tables: [
      'user_info', 'user_profile', 'user_behavior_log', 'user_address',
      'order_detail', 'order_summary', 'order_item', 'order_refund',
      'product_info', 'product_category', 'product_sku', 'product_stock',
      'payment_record', 'payment_alipay', 'payment_wechat', 'payment_card',
      'inventory_stock', 'inventory_warehouse', 'inventory_transfer',
      'click_stream', 'app_event', 'web_visit_log', 'search_keyword',
      'customer_service', 'complaint_record', 'feedback',
      'employee_info', 'salary_record', 'attendance_log',
      'risk_label', 'fraud_record', 'credit_score'
    ],
    views: [
      'v_user_stats', 'v_user_active', 'v_user_portrait',
      'v_sales_summary', 'v_sales_daily', 'v_sales_monthly',
      'v_product_popular', 'v_product_trend',
      'v_order_overview', 'v_order_abnormal',
      'v_payment_summary', 'v_payment_daily'
    ],
    mviews: [
      'mv_monthly_sales', 'mv_daily_trend', 'mv_user_retention', 'mv_product_stats'
    ],
    dictionaries: [
      'dict_region', 'dict_category', 'dict_product_type', 'dict_payment_method', 'dict_channel'
    ]
  },
  doris: {
    databases: [
      'doris_ods', 'doris_dwd', 'doris_dim', 'doris_ads', 'doris_risk', 'doris_marketing',
      'doris_finance', 'doris_logistics', 'doris_hr', 'doris_bi'
    ],
    tables: [
      'customer_overview', 'customer_segment', 'customer_lifecycle',
      'sales_dashboard', 'sales_realtime', 'sales_history',
      'gmv_trend', 'gmv_region', 'gmv_category',
      'inventory_alert', 'inventory_forecast', 'inventory_turnover',
      'revenue_daily', 'revenue_monthly', 'revenue_profit',
      'ab_test_result', 'funnel_conversion', 'retention_cohort',
      'credit_risk_score', 'loan_approval', 'fraud_detection',
      'device_fingerprint', 'login_audit', 'security_event'
    ],
    views: [
      'v_customer_view', 'v_order_stats', 'v_payment_summary',
      'v_gmv_trend', 'v_inventory_alert', 'v_revenue_report',
      'v_user_portrait', 'v_funnel_overview', 'v_risk_dashboard'
    ],
    mviews: [],
    dictionaries: [
      'doris_dict_user', 'doris_dict_region', 'doris_dict_category', 'doris_dict_channel'
    ]
  }
}

// 引擎相关
const selectedEngine = ref('inceptor')

const databasesByEngine = computed(() => mockDataByEngine[selectedEngine.value]?.databases || [])
const tablesByEngine = computed(() => mockDataByEngine[selectedEngine.value]?.tables || [])
const viewsByEngine = computed(() => mockDataByEngine[selectedEngine.value]?.views || [])
const mviewsByEngine = computed(() => mockDataByEngine[selectedEngine.value]?.mviews || [])
const dictionariesByEngine = computed(() => mockDataByEngine[selectedEngine.value]?.dictionaries || [])

// 外部Catalog数据（模拟）
const externalCatalogs = ref(['s3_catalog', 'hive_catalog', 'iceberg_catalog', 'hudi_catalog'])

// 搜索关键词
const dbSearchKeyword = ref('')
const tableSearchKeyword = ref('')
const viewSearchKeyword = ref('')

// 全选状态
const dbSelectAll = ref(false)
const tableSelectAll = ref(false)
const viewSelectAll = ref(false)

// 过滤后的数据
const filteredDatabases = computed(() => {
  if (!dbSearchKeyword.value) return databasesByEngine.value
  return databasesByEngine.value.filter(db => db.toLowerCase().includes(dbSearchKeyword.value.toLowerCase()))
})

const filteredTables = computed(() => {
  if (!tableSearchKeyword.value) return tablesByEngine.value
  return tablesByEngine.value.filter(t => t.toLowerCase().includes(tableSearchKeyword.value.toLowerCase()))
})

const filteredViews = computed(() => {
  if (!viewSearchKeyword.value) return viewsByEngine.value
  return viewsByEngine.value.filter(v => v.toLowerCase().includes(viewSearchKeyword.value.toLowerCase()))
})

// 全选处理
const handleDbSelectAll = (checked) => {
  if (checked) {
    roleForm.dataPermissions.database = [...filteredDatabases.value]
  } else {
    roleForm.dataPermissions.database = []
  }
}

const handleTableSelectAll = (checked) => {
  if (checked) {
    roleForm.dataPermissions.tables = [...filteredTables.value]
  } else {
    roleForm.dataPermissions.tables = []
  }
}

const handleViewSelectAll = (checked) => {
  if (checked) {
    roleForm.dataPermissions.views = [...filteredViews.value]
  } else {
    roleForm.dataPermissions.views = []
  }
}

// 判断是否为运维/DBA模板（根据角色名称）
const isAdminTemplate = computed(() => {
  const name = currentRole.value?.name?.toLowerCase() || ''
  return name.includes('admin') || name.includes('dba') || name.includes('运维')
})

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
const selectedDeptCodes = ref([])
const getDepartmentLabel = (code) => {
  const found = departmentOptions.find(d => d.value === code?.code || d.value === code)
  return found ? found.label : (code?.code || code || '')
}

const openEditRole = (record) => {
  currentRole.value = record
  roleForm.name = record.name
  roleForm.description = record.description
  selectedEngine.value = 'inceptor' // 重置引擎选择
  
  // 为不同角色预填充不同的数据权限配置
  if (record.name === 'DataAnalyst') {
    roleForm.dataPermissions.global = ['SELECT', 'DESCRIBE']
    roleForm.dataPermissions.database = ['hive_ods', 'hive_dwd']
    roleForm.dataPermissions.tables = ['user_info', 'order_detail', 'product_info']
    roleForm.dataPermissions.views = ['v_user_stats', 'v_sales_summary']
  } else if (record.name === 'ProjectManager') {
    roleForm.dataPermissions.global = ['SELECT', 'DESCRIBE', 'INSERT']
    roleForm.dataPermissions.database = ['hive_dwd', 'hive_dm', 'hive_marketing']
    roleForm.dataPermissions.tables = ['sales_dashboard', 'gmv_trend', 'order_summary']
  } else if (record.name === 'SystemAdmin') {
    roleForm.dataPermissions.global = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP']
    roleForm.dataPermissions.database = ['hive_ods', 'hive_dwd', 'hive_dim', 'hive_dm', 'doris_ods', 'doris_dwd', 'doris_ads']
  } else {
    roleForm.dataPermissions.global = []
    roleForm.dataPermissions.database = []
    roleForm.dataPermissions.tables = []
    roleForm.dataPermissions.views = []
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

const grantUsersToRole = () => {
  const addList = allUsers.value.filter(u => selectedUserIds.value.includes(u.id))
  const existedIds = new Set(grantedUsers.value.map(u => u.id))
  const merged = [...grantedUsers.value]
  addList.forEach(u => { if (!existedIds.has(u.id)) merged.push(u) })
  grantedUsers.value = merged
  selectedUserIds.value = []
  Message.success('已授予用户')
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

// 应用权限选择树形组件相关
const appTreeSearch = ref('')
const appTreeExpandedKeys = ref([])
const appTreeCheckedKeys = ref([])
const appTreeLoading = ref(false)
const appStatusFilter = ref('online')
const appStatusOptions = [
  { label: '已上线', value: 'online' },
  { label: '测试中', value: 'test' },
  { label: '废弃', value: 'discard' }
]

// 应用目录结构
const appCatalog = ref([
  { name: '统一查询平台', type: 'App' },
  { name: '指标管理系统', type: 'App' },
  { name: '数据地图', type: 'App' },
  { name: '大屏可视化', type: 'App' }
])

const mockModules = {
  App: [
    { id: 'm_query', name: 'SQL查询模块', sensitivityLevel: 'normal', owner: '平台组' },
    { id: 'm_save', name: '查询保存功能', sensitivityLevel: 'normal', owner: '平台组' },
    { id: 'm_export', name: '结果导出功能', sensitivityLevel: 'sensitive', owner: '安全组' },
    { id: 'm_admin', name: '管理后台', sensitivityLevel: 'core', owner: '管理员' }
  ]
}

const appTreeData = computed(() => {
  return appCatalog.value.map(app => {
    const modules = ['核心功能', '辅助功能', '系统管理'];
    return {
      key: `app:${app.name}`,
      title: app.name,
      status: 'online',
      children: modules.map(m => ({
        key: `app:${app.name}|module:${m}`,
        title: m,
        status: 'online',
        children: (mockModules[app.type] || []).map(t => ({
          key: `app:${app.name}|module:${m}|func:${t.id}`,
          title: t.name,
          status: t.sensitivityLevel === 'sensitive' ? 'test' : 'online',
          meta: { id: t.id, name: t.name, sensitivityLevel: t.sensitivityLevel, owner: t.owner, app: app.name, appType: app.type, module: m }
        }))
      }))
    };
  });
});

const totalSelectedApps = computed(() => {
  // 计算选中的应用数量（顶级节点）
  return appTreeCheckedKeys.value.filter(key => key.startsWith('app:')).length;
});

const totalSelectedModules = computed(() => {
  // 计算选中的模块数量（中间节点）
  return appTreeCheckedKeys.value.filter(key => key.includes('|module:') && !key.includes('|func:')).length;
});

const syncAppSelectionFromTree = () => {
  const keys = new Set(appTreeCheckedKeys.value || []);
  const appsMap = {};

  keys.forEach(k => {
    if (k.includes('|module:') && !k.includes('|func:')) {
      // 这是模块节点
      const [appPart, modulePart] = k.split('|');
      const appName = appPart.replace('app:', '');
      const moduleName = modulePart.replace('module:', '');
      
      if (!appsMap[appName]) {
        appsMap[appName] = {
          appName: appName,
          appId: `app_${appName.toLowerCase().replace(/\s+/g, '_')}`, // 生成应用ID
          level: 'VIEW', // 默认权限级别
          modules: []
        };
      }
      
      if (!appsMap[appName].modules.includes(moduleName)) {
        appsMap[appName].modules.push(moduleName);
      }
    } else if (k.includes('|func:')) {
      // 这是功能节点，需要找到所属应用和模块
      const parts = k.split('|');
      const appName = parts[0].replace('app:', '');
      const moduleName = parts[1].replace('module:', '');
      
      if (!appsMap[appName]) {
        appsMap[appName] = {
          appName: appName,
          appId: `app_${appName.toLowerCase().replace(/\s+/g, '_')}`,
          level: 'VIEW',
          modules: []
        };
      }
      
      if (!appsMap[appName].modules.includes(moduleName)) {
        appsMap[appName].modules.push(moduleName);
      }
    } else if (k.startsWith('app:')) {
      // 这是应用节点
      const appName = k.replace('app:', '');
      if (!appsMap[appName]) {
        appsMap[appName] = {
          appName: appName,
          appId: `app_${appName.toLowerCase().replace(/\s+/g, '_')}`,
          level: 'VIEW',
          modules: [] // 选择整个应用时，模块为空数组表示所有模块
        };
      }
    }
  });

  // 更新roleForm.appResources
  roleForm.appResources = Object.values(appsMap);
};

// 监听树形选择的变化
watch(() => appTreeCheckedKeys.value, () => {
  syncAppSelectionFromTree();
});

const expandAllApps = () => {
  const keys = [];
  const walk = (nodes) => nodes.forEach(n => { 
    keys.push(n.key); 
    if (n.children) walk(n.children); 
  });
  walk(appTreeData.value);
  appTreeExpandedKeys.value = keys;
};

const collapseAllApps = () => {
  appTreeExpandedKeys.value = [];
};

const clearAllAppSelection = () => {
  appTreeCheckedKeys.value = [];
  roleForm.appResources = [];
};

const removeModule = (appId, moduleName) => {
  const app = roleForm.appResources.find(a => a.appId === appId);
  if (app && app.modules) {
    app.modules = app.modules.filter(m => m !== moduleName);
    // 如果模块数组为空，移除整个应用
    if (app.modules.length === 0) {
      roleForm.appResources = roleForm.appResources.filter(a => a.appId !== appId);
    }
  }
};


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

/* 应用权限选择样式 */
.resource-tree-section {
  margin-bottom: 16px;
}

.tree-toolbar {
  margin-bottom: 12px;
}

.helper-text {
  margin-top: 8px;
  color: #86909c;
  font-size: 12px;
}

.global-selected-summary {
  margin: 12px 0;
  padding: 8px 12px;
  background-color: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
}

.section-actions {
  margin-top: 8px;
  text-align: right;
}

.selected-preview {
  margin-top: 16px;
}

.app-level-controls {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e5e6eb;
}

/* 授予用户和部门的样式 */
.grant-section {
  margin-bottom: 16px;
}

/* 资源列表容器 */
.resource-list-container {
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.resource-list-header {
  display: flex;
  align-items: center;
}

.resource-list-content {
  max-height: 200px;
  overflow-y: auto;
}

.resource-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.resource-checkbox-item {
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  margin: 2px;
}

.resource-checkbox-item:hover {
  border-color: #165dff;
}

.kv-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.kv-row > span:first-child {
  width: 80px;
  font-weight: 500;
  color: #4e5969;
}
</style>
