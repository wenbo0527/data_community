<template>
  <div class="organization-management">
    <a-card class="general-card" title="组织架构管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="showCreateOrgModal">
              <template #icon><icon-plus /></template>
              新建组织
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-input-search
            v-model="orgSearchKey"
            placeholder="搜索组织名称"
            style="width: 300px"
            allow-clear
            @search="handleOrgSearch"
          />
        </a-col>
      </a-row>

      <a-table 
        :data="filteredOrganizations" 
        :pagination="orgPagination" 
        @page-change="handleOrgPageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="组织名称" :width="150">
            <template #cell="{ record }">
              <a-input 
                v-if="editingOrgId === record.id" 
                v-model="editingOrg.name"
                placeholder="组织名称"
              />
              <span v-else>{{ record.name }}</span>
            </template>
          </a-table-column>
          <a-table-column title="组织编码" :width="120">
            <template #cell="{ record }">
              <a-input 
                v-if="editingOrgId === record.id" 
                v-model="editingOrg.code"
                placeholder="组织编码"
              />
              <span v-else>{{ record.code }}</span>
            </template>
          </a-table-column>
          <a-table-column title="上级组织" :width="150">
            <template #cell="{ record }">
              <a-tree-select
                v-if="editingOrgId === record.id"
                v-model="editingOrg.parentId"
                :data="organizationTreeData"
                placeholder="上级组织"
                style="width: 100%"
              />
              <span v-else>{{ record.parentName }}</span>
            </template>
          </a-table-column>
          <a-table-column title="分管总裁" :width="200">
            <template #cell="{ record }">
              <a-select 
                v-if="editingOrgId === record.id"
                v-model="editingOrg.president"
                :options="userOptions"
                placeholder="分管总裁"
                multiple
                style="width: 100%"
              />
              <div v-else>
                <a-tag v-for="president in record.president" :key="president" color="blue" style="margin-right: 4px;">{{ president }}</a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="总经理" :width="200">
            <template #cell="{ record }">
              <a-select 
                v-if="editingOrgId === record.id"
                v-model="editingOrg.generalManager"
                :options="userOptions"
                placeholder="总经理"
                multiple
                style="width: 100%"
              />
              <div v-else>
                <a-tag v-for="gm in record.generalManager" :key="gm" color="orange" style="margin-right: 4px;">{{ gm }}</a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="团队经理" :width="200">
            <template #cell="{ record }">
              <a-select 
                v-if="editingOrgId === record.id"
                v-model="editingOrg.teamManager"
                :options="userOptions"
                placeholder="团队经理"
                multiple
                style="width: 100%"
              />
              <div v-else>
                <a-tag v-for="tm in record.teamManager" :key="tm" color="green" style="margin-right: 4px;">{{ tm }}</a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-switch
                v-if="editingOrgId === record.id"
                v-model="editingOrg.status"
                :checked-value="'active'"
                :unchecked-value="'inactive'"
              />
              <a-tag v-else :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" align="center">
            <template #cell="{ record }">
              <a-space v-if="editingOrgId === record.id">
                <a-button type="text" size="small" @click="saveEdit(record)">保存</a-button>
                <a-button type="text" size="small" @click="cancelEdit">取消</a-button>
              </a-space>
              <a-space v-else>
                <a-button type="text" size="small" @click="startEdit(record)">编辑</a-button>
                <a-button
                  type="text"
                  :status="record.status === 'active' ? 'danger' : 'success'"
                  size="small"
                  @click="toggleOrgStatus(record)"
                >
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>


  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

// 组织相关数据
const orgSearchKey = ref('')
const orgModalVisible = ref(false)
const orgModalTitle = ref('')
const orgForm = ref({
  id: null,
  name: '',
  code: '',
  parentId: null,
  president: [],
  generalManager: [],
  teamManager: [],
  status: 'active'
})

// 编辑状态相关数据
const editingOrgId = ref(null)
const editingOrg = ref({
  id: null,
  name: '',
  code: '',
  parentId: null,
  president: [],
  generalManager: [],
  teamManager: [],
  status: 'active'
})

const orgPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 用户选项数据
const userOptions = computed(() => {
  return allUsers.value.map(user => ({
    label: `${user.realName} (${user.employeeId})`,
    value: user.realName
  }))
})

// 示例组织数据
const organizations = ref([
  {
    id: 1,
    name: '总部',
    code: 'HQ',
    parentName: '-',
    president: ['管理员'],
    generalManager: ['张三'],
    teamManager: ['李四'],
    status: 'active'
  },
  {
    id: 2,
    name: '技术部',
    code: 'TECH',
    parentName: '总部',
    president: ['王五'],
    generalManager: ['赵六'],
    teamManager: ['孙七'],
    status: 'active'
  },
  {
    id: 3,
    name: '市场部',
    code: 'MARKET',
    parentName: '总部',
    president: ['管理员'],
    generalManager: ['周八'],
    teamManager: ['吴九'],
    status: 'active'
  },
  {
    id: 4,
    name: '销售部',
    code: 'SALES',
    parentName: '总部',
    president: ['王五'],
    generalManager: ['郑十'],
    teamManager: ['刘一'],
    status: 'inactive'
  }
])

// 示例用户数据
const allUsers = ref([
  { id: 1, employeeId: 'U001', realName: '管理员' },
  { id: 2, employeeId: 'U002', realName: '张三' },
  { id: 3, employeeId: 'U003', realName: '李四' },
  { id: 4, employeeId: 'U004', realName: '王五' },
  { id: 5, employeeId: 'U005', realName: '赵六' },
  { id: 6, employeeId: 'U006', realName: '孙七' },
  { id: 7, employeeId: 'U007', realName: '周八' },
  { id: 8, employeeId: 'U008', realName: '吴九' },
  { id: 9, employeeId: 'U009', realName: '郑十' },
  { id: 10, employeeId: 'U010', realName: '刘一' }
])

// 组织树形数据
const organizationTreeData = computed(() => {
  return organizations.value.map(org => ({
    key: org.id,
    title: org.name,
    value: org.id,
    children: [] // 简化版，实际可以根据父子关系构建
  }))
})

// 过滤后的组织数据
const filteredOrganizations = computed(() => {
  if (!orgSearchKey.value) return organizations.value
  const key = orgSearchKey.value.toLowerCase()
  return organizations.value.filter(item => 
    item.name.toLowerCase().includes(key) ||
    item.code.toLowerCase().includes(key)
  )
})

// 显示创建组织模态框
const showCreateOrgModal = () => {
  orgModalTitle.value = '新建组织'
  orgForm.value = {
    id: null,
    name: '',
    code: '',
    parentId: null,
    president: [],
    generalManager: [],
    teamManager: [],
    status: 'active'
  }
  orgModalVisible.value = true
}

// 开始编辑组织
const startEdit = (record) => {
  editingOrgId.value = record.id
  editingOrg.value = { ...record }
}

// 保存编辑
const saveEdit = (record) => {
  if (!editingOrg.value.name || !editingOrg.value.code) {
    Message.error('请填写组织名称和编码')
    return
  }

  // 找到要更新的组织并更新
  const index = organizations.value.findIndex(org => org.id === record.id)
  if (index !== -1) {
    // 更新组织信息
    organizations.value[index] = { ...editingOrg.value }
    
    // 更新parentName字段
    const parentOrg = organizations.value.find(o => o.id === editingOrg.value.parentId)
    organizations.value[index].parentName = parentOrg ? parentOrg.name : '-'
  }
  
  Message.success('更新成功')
  editingOrgId.value = null
  editingOrg.value = {
    id: null,
    name: '',
    code: '',
    parentId: null,
    president: [],
    generalManager: [],
    teamManager: [],
    status: 'active'
  }
}

// 取消编辑
const cancelEdit = () => {
  editingOrgId.value = null
  editingOrg.value = {
    id: null,
    name: '',
    code: '',
    parentId: null,
    president: [],
    generalManager: [],
    teamManager: [],
    status: 'active'
  }
}



// 切换组织状态
const toggleOrgStatus = (record) => {
  const index = organizations.value.findIndex(org => org.id === record.id)
  if (index !== -1) {
    organizations.value[index].status = organizations.value[index].status === 'active' ? 'inactive' : 'active'
    Message.success(`${organizations.value[index].status === 'active' ? '启用' : '禁用'}成功`)
  }
}

// 保存组织（原有的模态框方式）
const handleSaveOrg = () => {
  if (!orgForm.value.name || !orgForm.value.code) {
    Message.error('请填写组织名称和编码')
    return
  }

  if (orgForm.value.id) {
    // 编辑现有组织
    const index = organizations.value.findIndex(org => org.id === orgForm.value.id)
    if (index !== -1) {
      organizations.value[index] = { ...orgForm.value }
    }
  } else {
    // 创建新组织
    const newOrg = {
      ...orgForm.value,
      id: organizations.value.length + 1,
      parentName: orgForm.value.parentId ? 
        organizations.value.find(o => o.id === orgForm.value.parentId)?.name || '-' : '-'
    }
    organizations.value.push(newOrg)
  }

  Message.success(orgForm.value.id ? '更新成功' : '创建成功')
  closeOrgModal()
}

// 关闭模态框
const closeOrgModal = () => {
  orgModalVisible.value = false
}

// 搜索组织
const handleOrgSearch = () => {
  // 搜索已在computed中处理
}

// 分页变化
const handleOrgPageChange = (page) => {
  orgPagination.current = page
}
</script>

<style scoped>
.organization-management {
  padding: 0;
}
</style>