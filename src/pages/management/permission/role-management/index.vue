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
  appResources: [], // 格式: [{ appName, appId, level, modules: [...] }]
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
</style>
