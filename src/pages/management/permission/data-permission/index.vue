<template>
  <div class="data-permission-page">
    <a-layout style="height: 100%">
      <!-- 左侧数据对象树 -->
      <a-layout-sider :width="300" class="permission-sider">
        <div class="sider-header">
          <a-input-search v-model="searchKey" placeholder="搜索数据对象" allow-clear />
        </div>
        <div class="sider-content">
          <a-tree
            :data="filteredTreeData"
            :show-line="true"
            v-model:selected-keys="selectedKeys"
            @select="onSelect"
          >
            <template #icon="{ node }">
              <IconFolder v-if="node.children" />
              <IconStorage v-else />
            </template>
          </a-tree>
        </div>
      </a-layout-sider>

      <!-- 右侧权限列表 -->
      <a-layout-content class="permission-content">
        <a-card class="content-card" :bordered="false">
          <div class="table-header">
            <div class="left-tools">
              <a-input-search
                v-model="userSearchKey"
                placeholder="搜索角色或用户名称"
                style="width: 300px"
                allow-clear
              />
            </div>
            <div class="right-tools">
              <a-button type="primary" @click="openGrant">授予权限</a-button>
            </div>
          </div>

          <a-table :data="filteredTableData" :pagination="pagination" style="margin-top: 16px">
            <template #columns>
              <a-table-column title="角色/用户" data-index="name" />
              <a-table-column title="类型" data-index="type">
                <template #cell="{ record }">
                  {{ record.type === 'role' ? '角色' : '用户' }}
                </template>
              </a-table-column>
              <a-table-column title="权限" data-index="permissions">
                <template #cell="{ record }">
                  <a-space wrap>
                    <a-tag v-for="perm in record.permissions" :key="perm" size="small">{{ perm }}</a-tag>
                  </a-space>
                </template>
              </a-table-column>
              <a-table-column title="对象类型" data-index="objectType">
                <template #cell="{ record }">
                  {{ objectTypeText(record.objectType) }}
                </template>
              </a-table-column>
              <a-table-column title="数据对象" data-index="objectName" />
              <a-table-column title="操作" width="150" align="center">
                <template #cell="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
                    <a-button type="text" status="danger" size="small" @click="handleDelete(record)">删除</a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-layout-content>
    </a-layout>

    <a-modal
      v-model:visible="grantVisible"
      :title="isEdit ? '编辑数据权限' : '授予数据权限'"
      @ok="submitGrant"
      @cancel="grantVisible=false"
      ok-text="确认"
      :width="720"
      unmount-on-close
    >
      <a-form :model="grantForm" layout="vertical">
        <a-form-item label="授权对象类型">
          <a-radio-group v-model="grantForm.subjectType">
            <a-radio value="role">角色</a-radio>
            <a-radio value="user">用户</a-radio>
            <a-radio value="department">部门</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="subjectLabel">
          <a-select
            v-model="grantForm.subject"
            allow-search
            placeholder="请选择"
            :options="subjectOptions"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="权限类型">
          <a-select v-model="grantForm.objectType" placeholder="选择权限类型">
            <a-option value="global">全局</a-option>
            <a-option value="database">数据库</a-option>
            <a-option value="table">数据表</a-option>
            <a-option value="view">视图</a-option>
            <a-option value="mview">物化视图</a-option>
            <a-option value="dictionary">字典</a-option>
            <a-option value="external_catalog">外部 Catalog</a-option>
            <a-option value="udf">UDF</a-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="grantForm.objectType!=='global'" label="选择数据对象">
          <a-space wrap>
            <a-select
              v-if="grantForm.objectType!=='external_catalog' && grantForm.objectType!=='udf'"
              v-model="grantForm.database"
              placeholder="选择数据库"
              :options="databaseOptions"
              allow-search
              style="min-width: 220px"
            />
            <a-select
              v-if="grantForm.objectType==='table' || grantForm.objectType==='view' || grantForm.objectType==='mview' || grantForm.objectType==='dictionary'"
              v-model="grantForm.objectName"
              placeholder="选择对象"
              :options="objectOptionsByDb"
              allow-search
              style="min-width: 260px"
            />
            <a-select
              v-if="grantForm.objectType==='external_catalog'"
              v-model="grantForm.objectName"
              placeholder="选择外部 Catalog"
              :options="externalCatalogOptions"
              allow-search
              style="min-width: 260px"
            />
            <a-select
              v-if="grantForm.objectType==='udf'"
              v-model="grantForm.objectName"
              placeholder="选择UDF"
              :options="udfOptions"
              allow-search
              style="min-width: 260px"
            />
          </a-space>
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
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconFolder, IconStorage } from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/stores/user.js'
const userStore = useUserStore()

const searchKey = ref('')
const selectedKeys = ref(['default'])
const userSearchKey = ref('')

const treeData = [
  {
    title: '全局',
    key: 'global',
    isLeaf: true
  },
  {
    title: '数据库',
    key: 'database',
    children: [
      { title: 'default', key: 'db:default' },
      { title: 'marketing_db', key: 'db:marketing_db' },
      { title: 'analytics', key: 'db:analytics' }
    ]
  },
  {
    title: '数据表',
    key: 'table',
    children: [
      { title: 'default.test_qzx', key: 'tbl:default.test_qzx' },
      { title: 'default.user_info', key: 'tbl:default.user_info' },
      { title: 'marketing_db.campaign_stats', key: 'tbl:marketing_db.campaign_stats' }
    ]
  },
  {
    title: '视图',
    key: 'view',
    children: [
      { title: 'analytics.vw_daily_sales', key: 'view:analytics.vw_daily_sales' }
    ]
  },
  {
    title: '物化视图',
    key: 'mview',
    children: [
      { title: 'analytics.mv_monthly_sales', key: 'mview:analytics.mv_monthly_sales' }
    ]
  },
  {
    title: '字典',
    key: 'dictionary',
    children: [
      { title: 'default.dict_region', key: 'dict:default.dict_region' }
    ]
  },
  {
    title: '外部 Catalog',
    key: 'external_catalog',
    children: [
      { title: 's3_catalog', key: 'ext:s3_catalog' },
      { title: 'hive_catalog', key: 'ext:hive_catalog' }
    ]
  },
  {
    title: 'UDF',
    key: 'udf',
    children: [
      { title: 'f_sum', key: 'udf:f_sum' },
      { title: 'f_rank', key: 'udf:f_rank' }
    ]
  }
]

const tableData = ref([
  {
    id: 1,
    name: 'AccountAdmin',
    type: 'role',
    permissions: ['SELECT', 'INSERT', 'UPDATE'],
    objectType: 'database',
    objectName: 'default'
  },
  {
    id: 2,
    name: 'SystemAdmin',
    type: 'role',
    permissions: ['ALL'],
    objectType: 'global',
    objectName: '*'
  },
  {
    id: 3,
    name: 'test_user',
    type: 'user',
    permissions: ['SELECT'],
    objectType: 'table',
    objectName: 'marketing_db.campaign_stats'
  }
])

const pagination = reactive({
  total: 50,
  current: 1,
  pageSize: 10
})

const activeNode = ref(null)
const onSelect = (keys, info) => {
  selectedKeys.value = keys
  activeNode.value = info.node
}

const grantVisible = ref(false)
const isEdit = ref(false)
const grantForm = reactive({
  subjectType: 'role',
  subject: '',
  objectType: 'global',
  database: '',
  objectName: '',
  permissions: []
})

const subjectLabel = computed(() => {
  if (grantForm.subjectType === 'role') return '选择角色'
  if (grantForm.subjectType === 'user') return '选择用户'
  return '选择部门'
})
const subjectOptions = computed(() => {
  if (grantForm.subjectType === 'role') return roleOptions
  if (grantForm.subjectType === 'user') return userOptions
  return departmentOptions
})

const roleOptions = [
  { label: 'AccountAdmin', value: 'AccountAdmin' },
  { label: 'SystemAdmin', value: 'SystemAdmin' },
  { label: 'DataAnalyst', value: 'DataAnalyst' },
  { label: 'ProjectManager', value: 'ProjectManager' }
]
const userOptions = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' }
]
const departmentOptions = [
  { label: '风险管理部', value: 'risk' },
  { label: '市场营销部', value: 'marketing' },
  { label: '数据分析部', value: 'data' }
]

const databaseOptions = [
  { label: 'default', value: 'default' },
  { label: 'marketing_db', value: 'marketing_db' },
  { label: 'analytics', value: 'analytics' }
]

const tableMap = {
  default: ['test_qzx', 'user_info'],
  marketing_db: ['campaign_stats'],
  analytics: []
}
const viewMap = {
  analytics: ['vw_daily_sales']
}
const mviewMap = {
  analytics: ['mv_monthly_sales']
}
const dictMap = {
  default: ['dict_region']
}
const externalCatalogOptions = [
  { label: 's3_catalog', value: 's3_catalog' },
  { label: 'hive_catalog', value: 'hive_catalog' }
]
const udfOptions = [
  { label: 'f_sum', value: 'f_sum' },
  { label: 'f_rank', value: 'f_rank' }
]

const objectOptionsByDb = computed(() => {
  const db = grantForm.database
  if (grantForm.objectType === 'table') {
    return (tableMap[db] || []).map(n => ({ label: n, value: n }))
  }
  if (grantForm.objectType === 'view') {
    return (viewMap[db] || []).map(n => ({ label: n, value: n }))
  }
  if (grantForm.objectType === 'mview') {
    return (mviewMap[db] || []).map(n => ({ label: n, value: n }))
  }
  if (grantForm.objectType === 'dictionary') {
    return (dictMap[db] || []).map(n => ({ label: n, value: n }))
  }
  return []
})

const permissionPoints = computed(() => {
  if (grantForm.objectType === 'udf') {
    return ['CREATE_UDF', 'DROP_UDF', 'EXECUTE_UDF']
  }
  return ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP']
})

const objectTypeText = (t) => {
  const map = {
    global: '全局',
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

const openGrant = () => {
  isEdit.value = false
  grantForm.subjectType = 'role'
  grantForm.subject = ''
  grantForm.objectType = 'global'
  grantForm.database = ''
  grantForm.objectName = ''
  grantForm.permissions = []
  if (activeNode.value) {
    const k = activeNode.value.key
    if (k === 'global') {
      grantForm.objectType = 'global'
    } else if (typeof k === 'string') {
      if (k.startsWith('db:')) {
        grantForm.objectType = 'database'
        grantForm.database = k.split(':')[1]
      } else if (k.startsWith('tbl:')) {
        grantForm.objectType = 'table'
        const full = k.split(':')[1]
        const [db, obj] = full.split('.')
        grantForm.database = db
        grantForm.objectName = obj
      } else if (k.startsWith('view:')) {
        grantForm.objectType = 'view'
        const full = k.split(':')[1]
        const [db, obj] = full.split('.')
        grantForm.database = db
        grantForm.objectName = obj
      } else if (k.startsWith('mview:')) {
        grantForm.objectType = 'mview'
        const full = k.split(':')[1]
        const [db, obj] = full.split('.')
        grantForm.database = db
        grantForm.objectName = obj
      } else if (k.startsWith('dict:')) {
        grantForm.objectType = 'dictionary'
        const full = k.split(':')[1]
        const [db, obj] = full.split('.')
        grantForm.database = db
        grantForm.objectName = obj
      } else if (k.startsWith('ext:')) {
        grantForm.objectType = 'external_catalog'
        grantForm.objectName = k.split(':')[1]
      } else if (k.startsWith('udf:')) {
        grantForm.objectType = 'udf'
        grantForm.objectName = k.split(':')[1]
      }
    }
  }
  grantVisible.value = true
}

const openEdit = (record) => {
  isEdit.value = true
  grantForm.subjectType = record.type === 'role' ? 'role' : 'user'
  grantForm.subject = record.name
  grantForm.objectType = record.objectType
  if (record.objectType === 'database' || record.objectType === 'table' || record.objectType === 'view' || record.objectType === 'mview' || record.objectType === 'dictionary') {
    const seg = record.objectName.split('.')
    grantForm.database = seg[0]
    grantForm.objectName = seg[1]
  } else {
    grantForm.database = ''
    grantForm.objectName = record.objectName
  }
  grantForm.permissions = [...record.permissions]
  grantVisible.value = true
}

const submitGrant = () => {
  if (!grantForm.subject) {
    Message.error('请选择授权对象')
    return
  }
  if (grantForm.objectType !== 'global') {
    if (grantForm.objectType === 'external_catalog' || grantForm.objectType === 'udf') {
      if (!grantForm.objectName) {
        Message.error('请选择数据对象')
        return
      }
    } else {
      if (!grantForm.database) {
        Message.error('请选择数据库')
        return
      }
    }
  }
  if (!grantForm.permissions.length) {
    Message.error('请选择权限点')
    return
  }
  const targetName = grantForm.subject
  const objName =
    grantForm.objectType === 'global'
      ? '*'
      : grantForm.objectType === 'external_catalog' || grantForm.objectType === 'udf'
      ? grantForm.objectName
      : `${grantForm.database}.${grantForm.objectName || ''}`.replace(/\.$/, '')
  if (isEdit.value) {
    const idx = tableData.value.findIndex(
      r => r.name === targetName && r.objectType === grantForm.objectType && r.objectName === objName
    )
    if (idx >= 0) {
      tableData.value[idx] = {
        ...tableData.value[idx],
        permissions: [...grantForm.permissions]
      }
    }
    Message.success('已编辑数据权限')
  } else {
    tableData.value.unshift({
      id: Date.now(),
      name: targetName,
      type: grantForm.subjectType,
      permissions: [...grantForm.permissions],
      objectType: grantForm.objectType,
      objectName: objName
    })
    Message.success('已授予数据权限')
  }
  try {
    const existing = JSON.parse(localStorage.getItem('grants:data') || '[]')
    const record = {
      subjectType: grantForm.subjectType,
      subject: grantForm.subject,
      objectType: grantForm.objectType,
      database: grantForm.database,
      objectName: objName,
      permissions: [...grantForm.permissions]
    }
    localStorage.setItem('grants:data', JSON.stringify([record, ...existing]))
  } catch (e) {}
  userStore.computeEffectivePermissions()
  grantVisible.value = false
}

const handleDelete = (record) => {
  tableData.value = tableData.value.filter(r => r.id !== record.id)
  Message.success('已删除数据权限')
}

const filteredTreeData = computed(() => {
  const key = (searchKey.value || '').toLowerCase()
  if (!key) return treeData
  const matchNode = (node) => {
    if (node.children) {
      const children = node.children.map(matchNode).filter(Boolean)
      if (children.length) return { ...node, children }
    }
    const title = String(node.title).toLowerCase()
    if (title.includes(key)) return node
    return null
  }
  return treeData.map(matchNode).filter(Boolean)
})

const filteredTableData = computed(() => {
  const k = (userSearchKey.value || '').toLowerCase()
  return tableData.value.filter(i => i.name.toLowerCase().includes(k))
})
</script>

<style scoped>
.data-permission-page {
  height: calc(100vh - 100px); /* Adjust based on layout */
  background-color: var(--color-bg-2);
}

.permission-sider {
  background-color: var(--color-bg-2);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.sider-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.sider-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.permission-content {
  padding: 16px;
  background-color: var(--color-fill-2);
}

.content-card {
  height: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
