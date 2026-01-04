<template>
  <div class="module-management">
    <div class="page-header">
      <h2>业务模块管理</h2>
      <a-space>
        <a-button type="primary" @click="openCreate('physical')">
          新建业务场景
        </a-button>
        <a-button type="outline" @click="openCreate('virtual')">
          新建虚拟组
        </a-button>
      </a-space>
    </div>

    <a-row :gutter="16">
      <a-col :span="6">
        <a-card>
          <a-tabs v-model:active-key="activeTreeTab" size="small">
            <a-tab-pane key="physical" title="业务场景">
              <a-input-search v-model="moduleSearch.physical" placeholder="搜索场景" allow-clear style="margin-bottom: 8px" />
              <a-tree
                :data="physicalTree"
                :field-names="{ key: 'id', title: 'name', children: 'children' }"
                @select="onSelectModule"
              />
            </a-tab-pane>
            <a-tab-pane key="virtual" title="虚拟组">
              <a-input-search v-model="moduleSearch.virtual" placeholder="搜索虚拟组" allow-clear style="margin-bottom: 8px" />
              <a-tree
                :data="virtualTree"
                :field-names="{ key: 'id', title: 'name', children: 'children' }"
                @select="onSelectModule"
              />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
      <a-col :span="18">
        <a-card>
          <div class="detail-header">
            <div class="title">
              <h3>{{ currentModule?.name || '未选择场景' }}</h3>
              <a-space>
                <a-tag v-if="currentModule" :color="currentModule.type === 'virtual' ? 'cyan' : 'blue'">
                  {{ currentModule?.type === 'virtual' ? '虚拟组' : '业务场景' }}
                </a-tag>
                <a-tag v-if="currentModule && currentModule.type === 'physical'" color="arcoblue">
                  归属组织：{{ getParentOrgName(currentModule.id) }}
                </a-tag>
                <a-tag v-if="currentModule" :color="currentModule?.status === 'enabled' ? 'green' : 'gray'">
                  {{ currentModule?.status === 'enabled' ? '启用' : '禁用' }}
                </a-tag>
              </a-space>
            </div>
            <a-space v-if="currentModule">
              <a-button @click="toggleStatus">{{ currentModule?.status === 'enabled' ? '禁用' : '启用' }}</a-button>
              <a-button @click="openEdit">编辑</a-button>
              <a-button status="danger" @click="confirmDelete">删除</a-button>
            </a-space>
          </div>
          <a-tabs v-model:active-key="activeDetailTab">
            <a-tab-pane key="assets" title="资产">
              <a-space style="margin-bottom: 8px">
                <a-button type="outline" @click="openBind('asset')">关联资产</a-button>
              </a-space>
              <a-table :columns="assetColumns" :data="assetRows" :pagination="false" />
            </a-tab-pane>
            <a-tab-pane key="resources" title="资源">
              <a-space style="margin-bottom: 8px">
                <a-button type="outline" @click="openBind('resource')">关联资源</a-button>
              </a-space>
              <a-table :columns="resourceColumns" :data="resourceRows" :pagination="false" />
            </a-tab-pane>
            <a-tab-pane key="apps" title="应用">
              <a-space style="margin-bottom: 8px">
                <a-button type="outline" @click="openBind('app')">关联应用</a-button>
              </a-space>
              <a-table :columns="appColumns" :data="appRows" :pagination="false" />
            </a-tab-pane>
            <a-tab-pane key="members" title="成员与权限">
              <a-alert type="info" style="margin-bottom: 8px" :content="'模块启用/禁用/编辑/删除将同步至统一权限系统'" />
              <a-table :columns="memberColumns" :data="memberRows" :pagination="false" />
            </a-tab-pane>
            <a-tab-pane key="history" title="变更历史">
              <a-table :columns="historyColumns" :data="historyRows" :pagination="false" />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:visible="createVisible" :title="createType === 'virtual' ? '新建虚拟组' : '新建业务场景'" @ok="submitCreate" @cancel="resetCreate" :width="600">
      <a-form ref="createFormRef" :model="createForm" layout="vertical">
        <a-form-item label="名称" field="name" :rules="[{ required: true, message: '请输入场景名称' }]">
          <a-input v-model="createForm.name" placeholder="请输入业务场景名称" />
        </a-form-item>
        <a-form-item v-if="createType === 'physical'" label="归属组织" field="parentId" :rules="[{ required: true, message: '请选择归属组织' }]">
          <a-tree-select
            v-model="createForm.parentId"
            :data="physicalTree"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
            allow-clear
            placeholder="选择该场景所属的组织架构"
          />
        </a-form-item>
        <a-form-item v-if="createType === 'physical'" label="组织架构路径" field="organizationPath">
          <a-select v-model="createForm.organizationPath" multiple allow-create allow-clear placeholder="按层级依次选择或创建">
            <a-option v-for="o in orgOptions" :key="o" :value="o">{{ o }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="createType === 'physical'" label="业务场景" field="scenarioId">
          <a-select v-model="createForm.scenarioId" allow-create allow-clear placeholder="选择或创建业务场景">
            <a-option v-for="s in scenarioOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签" field="tags">
          <a-select v-model="createForm.tags" multiple allow-create allow-clear placeholder="可选标签">
            <a-option v-for="t in tagOptions" :key="t" :value="t">{{ t }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述" field="description">
          <a-textarea v-model="createForm.description" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:visible="editVisible" title="编辑模块" @ok="submitEdit" @cancel="resetEdit" :width="600">
      <a-form ref="editFormRef" :model="editForm" layout="vertical">
        <a-form-item label="名称" field="name" :rules="[{ required: true, message: '请输入名称' }]">
          <a-input v-model="editForm.name" />
        </a-form-item>
        <a-form-item v-if="editForm.type === 'physical'" label="组织架构路径" field="organizationPath">
          <a-select v-model="editForm.organizationPath" multiple allow-create allow-clear>
            <a-option v-for="o in orgOptions" :key="o" :value="o">{{ o }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="editForm.type === 'physical'" label="业务场景" field="scenarioId">
          <a-select v-model="editForm.scenarioId" allow-create allow-clear>
            <a-option v-for="s in scenarioOptions" :key="s" :value="s">{{ s }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签" field="tags">
          <a-select v-model="editForm.tags" multiple allow-create allow-clear>
            <a-option v-for="t in tagOptions" :key="t" :value="t">{{ t }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述" field="description">
          <a-textarea v-model="editForm.description" :rows="3" />
        </a-form-item>
      </a-form>
    </a-drawer>

    <a-modal v-model:visible="bindVisible" :title="getBindTitle()" @ok="submitBind" @cancel="resetBind" :width="720">
      <a-form :model="bindForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="归属组织" field="org">
              <a-tree-select
                v-model="bindForm.org"
                :data="physicalTree"
                :field-names="{ key: 'name', title: 'name', children: 'children' }"
                placeholder="请选择此关联所属的组织"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="类型" field="type">
              <a-select v-model="bindForm.type" placeholder="选择类型">
                <a-option value="table">表</a-option>
                <a-option value="metric">指标</a-option>
                <a-option value="variable">变量</a-option>
                <a-option value="app">应用</a-option>
                <a-option value="api">API</a-option>
                <a-option value="collection">常用表集合</a-option>
                <a-option value="flow">核心业务流程</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="关键词" field="q">
              <a-input v-model="bindForm.q" placeholder="名称/编码" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-space style="margin-bottom: 8px">
          <a-button type="primary" @click="searchAssets">搜索</a-button>
          <a-button @click="resetSearch">重置</a-button>
        </a-space>
        <a-table
          row-key="key"
          :columns="bindColumns"
          :data="bindRows"
          :row-selection="{ type: 'checkbox', selectedRowKeys: selectedBindKeys, onChange: onBindSelect }"
          :pagination="false"
        />
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'

// 模拟数据引入 (实际项目中应从 API 获取)
const mockCollections = [
  { id: 'collection-1', name: '贷前分析', description: '贷前分析场景的相关数据表', type: '业务流程', owner: '张三' },
  { id: 'collection-2', name: '风控评估', description: '风控评估场景的相关数据表', type: '风险管控', owner: '李四' },
  { id: 'collection-3', name: '反欺诈分析', description: '反欺诈场景的相关数据表', type: '风险管控', owner: '王五' },
  { id: 'collection-4', name: '自营业务分析', description: '自营业务场景的相关数据表', type: '业务流程', owner: '赵六' }
]

type ModuleType = 'physical' | 'virtual'
type ModuleStatus = 'enabled' | 'disabled'

interface ModuleNode {
  id: string
  name: string
  type: ModuleType
  status: ModuleStatus
  children?: ModuleNode[]
}

const activeTreeTab = ref('physical')
const moduleSearch = reactive({ physical: '', virtual: '' })

const physicalTree = ref<ModuleNode[]>([
  { id: 'm-100', name: '数据部', type: 'physical', status: 'enabled', children: [
    { id: 'm-101', name: '业务核心数据', type: 'physical', status: 'enabled', children: [
      { id: 'm-102', name: '授信表', type: 'physical', status: 'enabled' }
    ] }
  ] }
])
const virtualTree = ref<ModuleNode[]>([
  { id: 'v-900', name: '临时分析组-A', type: 'virtual', status: 'enabled' },
  { id: 'v-901', name: '跨部门合规专项', type: 'virtual', status: 'disabled' }
])

const currentModule = ref<ModuleNode | null>(null)
const onSelectModule = (_: any, e: any) => {
  const node = e?.node?.dataRef || e?.node?.raw || e?.node
  currentModule.value = node || null
}

const getParentOrgName = (id: string) => {
  // 模拟查找父级组织逻辑
  if (id === 'm-102') return '业务核心数据'
  if (id === 'm-101') return '数据部'
  return '根组织'
}

const activeDetailTab = ref('assets')

const assetColumns = [
  { title: '资产名称', dataIndex: 'name' },
  { title: '资产类型', dataIndex: 'type' },
  { title: '归属组织', dataIndex: 'org' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '操作', slotName: 'optional' }
]

const resourceColumns = [
  { title: '资源名称', dataIndex: 'name' },
  { title: '资源类型', dataIndex: 'type' },
  { title: '归属组织', dataIndex: 'org' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '操作', slotName: 'optional' }
]

const appColumns = [
  { title: '应用名称', dataIndex: 'name' },
  { title: '应用类型', dataIndex: 'type' },
  { title: '归属组织', dataIndex: 'org' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '操作', slotName: 'optional' }
]
const memberColumns = [
  { title: '成员', dataIndex: 'name', width: 160 },
  { title: '角色', dataIndex: 'role', width: 120 },
  { title: '说明', dataIndex: 'desc' }
]
const historyColumns = [
  { title: '时间', dataIndex: 'time', width: 160 },
  { title: '操作', dataIndex: 'action', width: 160 },
  { title: '说明', dataIndex: 'desc' }
]

const assetRows = ref([
  { id: 'a-1', name: 'hive.adm.user_profile', type: 'Table', org: '数据部', status: 'normal' },
  { id: 'a-2', name: '指标_日活跃用户', type: 'Metric', org: '业务部', status: 'normal' }
])

const resourceRows = ref([
  { id: 'r-1', name: '营销常用表集合', type: 'Collection', org: '数据部', status: 'normal' },
  { id: 'r-2', name: '授信核心业务流程', type: 'Flow', org: '业务核心数据', status: 'normal' }
])

const appRows = ref([
  { id: 'ap-1', name: '信贷审批系统', type: 'App', org: '业务部', status: 'normal' },
  { id: 'ap-2', name: '风险预警大屏', type: 'App', org: '数据部', status: 'normal' }
])
const memberRows = ref([
  { name: '张三', role: '管理员', desc: '模块负责人' },
  { name: '李四', role: '成员', desc: '数据开发' }
])
const historyRows = ref([
  { time: '2024-01-10 10:00:00', action: '创建模块', desc: '数据部/业务核心数据/授信表' },
  { time: '2024-01-12 11:20:00', action: '关联资产', desc: '授信表关联 hive.adm.user_profile' }
])

const createVisible = ref(false)
const createType = ref<ModuleType>('physical')
const createFormRef = ref()
const createForm = reactive({
  name: '',
  parentId: '',
  organizationPath: [] as string[],
  scenarioId: '',
  tags: [] as string[],
  description: ''
})

const orgOptions = ref(['数据部', '运营部', '风控部'])
const scenarioOptions = ref(['业务核心数据', '分析报表', '营销活动'])
const tagOptions = ref(['核心', '临时', '跨部门'])

const openCreate = (type: ModuleType) => {
  createType.value = type
  createVisible.value = true
}
const resetCreate = () => {
  Object.assign(createForm, { name: '', parentId: '', organizationPath: [], scenarioId: '', tags: [], description: '' })
  createFormRef.value?.clearValidate()
  createVisible.value = false
}
const submitCreate = async () => {
  const valid = await createFormRef.value?.validate()
  if (!valid) return
  Message.success(createType.value === 'virtual' ? '虚拟组创建成功' : '业务组织创建成功')
  resetCreate()
}

const editVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  id: '',
  name: '',
  type: 'physical' as ModuleType,
  organizationPath: [] as string[],
  scenarioId: '',
  tags: [] as string[],
  description: ''
})
const openEdit = () => {
  if (!currentModule.value) return
  Object.assign(editForm, {
    id: currentModule.value.id,
    name: currentModule.value.name,
    type: currentModule.value.type,
    organizationPath: [],
    scenarioId: '',
    tags: [],
    description: ''
  })
  editVisible.value = true
}
const resetEdit = () => {
  editFormRef.value?.clearValidate()
  editVisible.value = false
}
const submitEdit = async () => {
  const valid = await editFormRef.value?.validate()
  if (!valid) return
  Message.success('模块编辑成功')
  resetEdit()
}

const toggleStatus = () => {
  if (!currentModule.value) return
  currentModule.value.status = currentModule.value.status === 'enabled' ? 'disabled' : 'enabled'
  Message.success('状态已更新并同步权限')
}
const confirmDelete = () => {
  if (!currentModule.value) return
  Modal.confirm({
    title: '确认删除该组织？',
    content: '删除后将清理关联关系并同步权限',
    onOk: () => {
      currentModule.value = null
      Message.success('组织已删除并同步权限')
    }
  })
}

const bindVisible = ref(false)
const bindType = ref('asset')
const bindForm = reactive({
  type: '',
  org: '',
  q: ''
})

const getBindTitle = () => {
  switch (bindType.value) {
    case 'asset': return '关联资产'
    case 'resource': return '关联资源'
    case 'app': return '关联应用'
    default: return '关联'
  }
}
const bindColumns = [
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '标识', dataIndex: 'key', width: 220 },
  { title: '名称', dataIndex: 'name', width: 180 },
  { title: '引擎', dataIndex: 'engine', width: 100 }
]
const bindRows = ref<any[]>([])
const selectedBindKeys = ref<string[]>([])
const onBindSelect = (keys: string[]) => { selectedBindKeys.value = keys }
const openBind = (type: string) => {
  bindType.value = type as any
  bindForm.type = type === 'asset' ? 'table' : (type === 'resource' ? 'collection' : 'app')
  bindVisible.value = true
}

const resetBind = () => {
  Object.assign(bindForm, { type: '', org: '', q: '' })
  bindRows.value = []
  selectedBindKeys.value = []
  bindVisible.value = false
}
const searchAssets = () => {
  if (bindForm.type === 'collection') {
    bindRows.value = mockCollections.map(c => ({
      key: c.id,
      type: '常用表集合',
      name: c.name,
      engine: '-',
      owner: c.owner
    }))
    return
  }
  if (bindForm.type === 'flow') {
    bindRows.value = mockCollections
      .filter(c => c.type === '业务流程')
      .map(c => ({
        key: c.id,
        type: '业务流程',
        name: c.name,
        engine: '-',
        owner: c.owner
      }))
    return
  }
  
  bindRows.value = [
    { key: 'hive.adm.user_profile', type: 'table', name: 'user_profile', engine: 'hive' },
    { key: 'A00043', type: 'metric', name: '风控授信通过量', engine: '-' },
    { key: 'variable:credit_score', type: 'variable', name: '征信分数', engine: '-' },
    { key: '/api/credit/report', type: 'api', name: '征信报告接口', engine: '-' },
    { key: 'doris.dwd.credit_score', type: 'process', name: 'credit_score', engine: 'doris' }
  ].filter(row => !bindForm.type || row.type === bindForm.type)
}
const resetSearch = () => { bindRows.value = []; selectedBindKeys.value = [] }
const submitBind = () => {
  if (!currentModule.value) { Message.warning('请先选择模块'); return }
  if (selectedBindKeys.value.length === 0) { Message.warning('请选择要关联的项'); return }
  if (!bindForm.org) {
    Message.warning('请选择归属组织')
    return
  }
  
  const selectedItems = bindRows.value.filter((row: any) => selectedBindKeys.value.includes(row.key))
  
  if (bindType.value === 'asset') {
    selectedItems.forEach((item: any) => {
      if (!assetRows.value.find((r: any) => r.key === item.key)) {
        assetRows.value.push({
          ...item,
          engine: item.type === '常用表集合' || item.type === '业务流程' ? item.owner : item.engine,
          updateTime: new Date().toLocaleString()
        })
      }
    })
  } else {
    selectedItems.forEach((item: any) => {
      if (!resourceRows.value.find((r: any) => r.key === item.key)) {
        resourceRows.value.push({
          ...item,
          provider: item.owner || '系统',
          status: 'enabled'
        })
      }
    })
  }

  Message.success('关联成功，已同步组织归属关系')
  resetBind()
}
</script>

<style scoped>
.module-management { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.detail-header .title { display: flex; align-items: center; gap: 8px; }
</style>
