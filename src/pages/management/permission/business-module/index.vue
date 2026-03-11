<template>
  <div class="module-management">
    <div class="page-header">
      <h2>业务模块管理</h2>
      <a-space>
        <a-button type="primary" @click="openCreate('domain')">
          新建业务域
        </a-button>
        <a-button type="outline" @click="openCreate('scenario')">
          新建场景
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
            <a-tab-pane key="domain" title="业务域">
              <a-input-search v-model="moduleSearch.domain" placeholder="搜索业务域/场景" allow-clear style="margin-bottom: 8px" />
              <a-tree
                :data="domainTreeDisplay"
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
                <a-tag v-if="currentModule" :color="currentModule.category === 'virtual' ? 'cyan' : (currentModule.category === 'domain' ? 'purple' : 'blue')">
                  {{ currentModule?.category === 'virtual' ? '虚拟组' : (currentModule?.category === 'domain' ? '业务域' : '场景') }}
                </a-tag>
                <a-tag v-if="currentModule && currentModule.category === 'scenario'" color="arcoblue">
                  归属业务域：{{ getParentDomainName(currentModule.id) }}
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
                <a-button type="outline" :disabled="currentModule?.category !== 'scenario'" @click="openBind('asset')">关联资产</a-button>
              </a-space>
              <a-table :columns="assetColumns" :data="assetRowsDisplay" :pagination="false" />
            </a-tab-pane>
            <a-tab-pane key="resources" title="资源">
              <a-space style="margin-bottom: 8px">
                <a-button type="outline" :disabled="currentModule?.category !== 'scenario'" @click="openBind('resource')">关联资源</a-button>
              </a-space>
              <a-table :columns="resourceColumns" :data="resourceRowsDisplay" :pagination="false" />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:visible="createVisible" :title="getCreateTitle()" @ok="submitCreate" @cancel="resetCreate" :width="600">
      <a-form ref="createFormRef" :model="createForm" layout="vertical">
        <a-form-item label="名称" field="name" :rules="[{ required: true, message: '请输入名称' }]">
          <a-input v-model="createForm.name" :placeholder="createType === 'domain' ? '请输入业务域名称' : (createType === 'scenario' ? '请输入场景名称' : '请输入虚拟组名称')" />
        </a-form-item>
        <a-form-item v-if="createType === 'scenario'" label="归属业务域" field="parentId" :rules="[{ required: true, message: '请选择归属业务域' }]">
          <a-tree-select
            v-model="createForm.parentId"
            :data="domainTree"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
            allow-clear
            placeholder="选择此场景所属的业务域"
          />
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
        <a-form-item v-if="editForm.category === 'scenario'" label="归属业务域" field="parentId">
          <a-tree-select
            v-model="editForm.parentId"
            :data="domainTree"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
            allow-clear
            placeholder="选择该场景所属的业务域"
          />
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
            <a-form-item label="归属业务域" field="domain">
              <a-tree-select
                v-model="bindForm.domain"
                :data="domainTree"
                :field-names="{ key: 'id', title: 'name', children: 'children' }"
                placeholder="请选择此关联所属的业务域"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="类型" field="type">
              <a-select v-model="bindForm.type" placeholder="选择类型">
                <a-option value="table">表</a-option>
                <a-option value="metric">指标</a-option>
                <a-option value="variable">变量</a-option>
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
import { ref, reactive, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'

// 模拟数据引入 (实际项目中应从 API 获取)
const mockCollections = [
  { id: 'collection-1', name: '贷前分析', description: '贷前分析场景的相关数据表', type: '业务流程', owner: '张三' },
  { id: 'collection-2', name: '风控评估', description: '风控评估场景的相关数据表', type: '风险管控', owner: '李四' },
  { id: 'collection-3', name: '反欺诈分析', description: '反欺诈场景的相关数据表', type: '风险管控', owner: '王五' },
  { id: 'collection-4', name: '自营业务分析', description: '自营业务场景的相关数据表', type: '业务流程', owner: '赵六' }
]

type ModuleType = 'domain' | 'scenario' | 'virtual'
type ModuleStatus = 'enabled' | 'disabled'
type ModuleCategory = 'domain' | 'scenario' | 'virtual'

interface ModuleNode {
  id: string
  name: string
  type: 'physical' | 'virtual'
  status: ModuleStatus
  category: ModuleCategory
  parentId?: string
  children?: ModuleNode[]
}

const activeTreeTab = ref('domain')
const moduleSearch = reactive({ domain: '', virtual: '' })

const domainTree = ref<ModuleNode[]>([
  { id: 'd-100', name: '风控业务域', type: 'physical', category: 'domain', status: 'enabled', children: [
    { id: 's-101', name: '贷前分析', type: 'physical', category: 'scenario', status: 'enabled', parentId: 'd-100' },
    { id: 's-102', name: '风险评估', type: 'physical', category: 'scenario', status: 'enabled', parentId: 'd-100' }
  ]},
  { id: 'd-200', name: '营销业务域', type: 'physical', category: 'domain', status: 'enabled', children: [
    { id: 's-201', name: '用户增长', type: 'physical', category: 'scenario', status: 'enabled', parentId: 'd-200' }
  ]}
])
const virtualTree = ref<ModuleNode[]>([
  { id: 'v-900', name: '临时分析组-A', type: 'virtual', category: 'virtual', status: 'enabled' },
  { id: 'v-901', name: '跨部门合规专项', type: 'virtual', category: 'virtual', status: 'disabled' }
])

const currentModule = ref<ModuleNode | null>(null)
const onSelectModule = (_: any, e: any) => {
  const node = e?.node?.dataRef || e?.node?.raw || e?.node
  currentModule.value = node || null
}

const getParentDomainName = (id: string) => {
  for (const d of domainTree.value) {
    if (d.children?.some((c: ModuleNode) => c.id === id)) {
      return d.name
    }
  }
  return ''
}

const activeDetailTab = ref('assets')

const assetColumns = [
  { title: '资产名称', dataIndex: 'name' },
  { title: '资产类型', dataIndex: 'type' },
  { title: '归属业务域', dataIndex: 'domain' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '操作', slotName: 'optional' }
]

const resourceColumns = [
  { title: '资源名称', dataIndex: 'name' },
  { title: '资源类型', dataIndex: 'type' },
  { title: '归属业务域', dataIndex: 'domain' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '操作', slotName: 'optional' }
]

const assetMap = reactive<Record<string, any[]>>({
  's-101': [
    { id: 'a-1', key: 'hive.adm.user_profile', name: 'hive.adm.user_profile', type: 'Table', domain: '风控业务域', status: 'normal' }
  ]
})
const resourceMap = reactive<Record<string, any[]>>({
  's-101': [
    { id: 'r-1', key: 'collection-1', name: '营销常用表集合', type: 'Collection', domain: '风控业务域', status: 'normal' }
  ]
})
const assetRowsDisplay = computed(() => currentModule.value?.category === 'scenario' ? (assetMap[currentModule.value.id] || []) : [])
const resourceRowsDisplay = computed(() => currentModule.value?.category === 'scenario' ? (resourceMap[currentModule.value.id] || []) : [])

const createVisible = ref(false)
const createType = ref<ModuleType>('domain')
const createFormRef = ref()
const createForm = reactive({
  name: '',
  parentId: '',
  tags: [] as string[],
  description: ''
})

const tagOptions = ref(['核心', '临时', '跨部门'])

const openCreate = (type: ModuleType) => {
  createType.value = type
  createVisible.value = true
}
const resetCreate = () => {
  Object.assign(createForm, { name: '', parentId: '', tags: [], description: '' })
  createFormRef.value?.clearValidate()
  createVisible.value = false
}
const getCreateTitle = () => {
  if (createType.value === 'domain') return '新建业务域'
  if (createType.value === 'scenario') return '新建场景'
  return '新建虚拟组'
}
const submitCreate = async () => {
  const valid = await createFormRef.value?.validate()
  if (!valid) return
  if (createType.value === 'domain') {
    domainTree.value.push({ id: `d-${Date.now()}`, name: createForm.name, type: 'physical', category: 'domain', status: 'enabled', children: [] })
    Message.success('业务域创建成功')
  } else if (createType.value === 'scenario') {
    const parent = domainTree.value.find((d: ModuleNode) => d.id === createForm.parentId)
    if (parent) {
      const newId = `s-${Date.now()}`
      parent.children = parent.children || []
      parent.children.push({ id: newId, name: createForm.name, type: 'physical', category: 'scenario', status: 'enabled', parentId: parent.id })
      Message.success('场景创建成功')
    } else {
      Message.warning('请选择有效的业务域')
      return
    }
  } else {
    virtualTree.value.push({ id: `v-${Date.now()}`, name: createForm.name, type: 'virtual', category: 'virtual', status: 'enabled' })
    Message.success('虚拟组创建成功')
  }
  resetCreate()
}

const editVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  id: '',
  name: '',
  category: 'domain' as ModuleCategory,
  parentId: '',
  tags: [] as string[],
  description: ''
})
const openEdit = () => {
  if (!currentModule.value) return
  Object.assign(editForm, {
    id: currentModule.value.id,
    name: currentModule.value.name,
    category: currentModule.value.category,
    parentId: currentModule.value.parentId || '',
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
  if (!currentModule.value) return
  currentModule.value.name = editForm.name
  if (editForm.category === 'scenario' && editForm.parentId && currentModule.value.parentId !== editForm.parentId) {
    const fromDomain = domainTree.value.find((d: ModuleNode) => d.id === currentModule.value?.parentId)
    const toDomain = domainTree.value.find((d: ModuleNode) => d.id === editForm.parentId)
    if (fromDomain && toDomain) {
      fromDomain.children = (fromDomain.children || []).filter((c: ModuleNode) => c.id !== currentModule.value!.id)
      toDomain.children = toDomain.children || []
      toDomain.children.push({ ...currentModule.value, parentId: editForm.parentId })
    }
  }
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
    title: '确认删除该模块？',
    content: '删除后将清理关联关系并同步权限',
    onOk: () => {
      if (currentModule.value?.category === 'domain') {
        domainTree.value = domainTree.value.filter((d: ModuleNode) => d.id !== currentModule.value!.id)
      } else if (currentModule.value?.category === 'scenario') {
        const d = domainTree.value.find((d: ModuleNode) => d.children?.some((c: ModuleNode) => c.id === currentModule.value!.id))
        if (d) d.children = (d.children || []).filter((c: ModuleNode) => c.id !== currentModule.value!.id)
      } else {
        virtualTree.value = virtualTree.value.filter((v: ModuleNode) => v.id !== currentModule.value!.id)
      }
      currentModule.value = null
      Message.success('模块已删除并同步权限')
    }
  })
}

const bindVisible = ref(false)
const bindType = ref('asset')
const bindForm = reactive({
  type: '',
  domain: '',
  q: ''
})

const getBindTitle = () => {
  switch (bindType.value) {
    case 'asset': return '关联资产'
    case 'resource': return '关联资源'
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
  bindForm.type = type === 'asset' ? 'table' : 'collection'
  bindVisible.value = true
}

const resetBind = () => {
  Object.assign(bindForm, { type: '', domain: '', q: '' })
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
  if (currentModule.value.category !== 'scenario') { Message.warning('请先选择具体场景'); return }
  if (selectedBindKeys.value.length === 0) { Message.warning('请选择要关联的项'); return }
  if (!bindForm.domain) {
    Message.warning('请选择归属业务域')
    return
  }
  
  const selectedItems = bindRows.value.filter((row: any) => selectedBindKeys.value.includes(row.key))
  
  if (bindType.value === 'asset') {
    selectedItems.forEach((item: any) => {
      const list = assetMap[currentModule.value!.id] || (assetMap[currentModule.value!.id] = [])
      if (!list.find((r: any) => r.key === item.key)) {
        list.push({
          ...item,
          domain: getParentDomainName(currentModule.value!.id),
          status: 'normal'
        })
      }
    })
  } else {
    selectedItems.forEach((item: any) => {
      const list = resourceMap[currentModule.value!.id] || (resourceMap[currentModule.value!.id] = [])
      if (!list.find((r: any) => r.key === item.key)) {
        list.push({
          ...item,
          domain: getParentDomainName(currentModule.value!.id),
          status: 'enabled'
        })
      }
    })
  }

  Message.success('关联成功，已同步组织归属关系')
  resetBind()
}

const filterTree = (nodes: ModuleNode[], q: string): ModuleNode[] => {
  if (!q) return nodes
  const matchNode = (n: ModuleNode): boolean => n.name.toLowerCase().includes(q.toLowerCase())
  const res: ModuleNode[] = []
  for (const n of nodes) {
    const children = n.children ? filterTree(n.children, q) : []
    if (matchNode(n) || children.length) {
      res.push({ ...n, children })
    }
  }
  return res
}
const domainTreeDisplay = computed<ModuleNode[]>(() => filterTree(domainTree.value, moduleSearch.domain))
</script>

<style scoped>
.module-management { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.detail-header .title { display: flex; align-items: center; gap: 8px; }
</style>
