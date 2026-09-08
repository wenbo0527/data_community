<template>
  <div class="position-management">
    <a-card class="general-card" title="职务管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="showCreatePositionModal">
              <template #icon><icon-plus /></template>
              新建职务
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-input-search
            v-model="positionSearchKey"
            placeholder="搜索职务名称"
            style="width: 300px"
            allow-clear
            @search="handlePositionSearch"
          />
        </a-col>
      </a-row>

      <a-table 
        :data="filteredPositions" 
        :pagination="positionPagination" 
        @page-change="handlePositionPageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="职务名称" data-index="name" />
          <a-table-column title="职务编码" data-index="code" />
          <a-table-column title="职务等级" data-index="level" />
          <a-table-column title="所属组织" data-index="orgName" />
          <a-table-column title="负责人" data-index="manager" />
          <a-table-column title="人数" data-index="memberCount" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEditPosition(record)">编辑</a-button>
                <a-button type="text" size="small" @click="handleViewPosition(record)">查看</a-button>
                <a-button
                  type="text"
                  :status="record.status === 'active' ? 'danger' : 'success'"
                  size="small"
                  @click="handleTogglePositionStatus(record)"
                >
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 职务创建/编辑模态框 -->
    <a-modal 
      v-model:visible="positionModalVisible" 
      :title="positionModalTitle" 
      :width="600"
      @ok="handleSavePosition"
      @cancel="closePositionModal"
    >
      <a-form :model="positionForm" layout="vertical">
        <a-form-item label="职务名称" required :hide-label="true">
          <a-input v-model="positionForm.name" placeholder="请输入职务名称" />
        </a-form-item>
        <a-form-item label="职务编码" required :hide-label="true">
          <a-input v-model="positionForm.code" placeholder="请输入职务编码" />
        </a-form-item>
        <a-form-item label="职务等级" :hide-label="true">
          <a-select v-model="positionForm.level" placeholder="请选择职务等级">
            <a-option value="senior">高级</a-option>
            <a-option value="middle">中级</a-option>
            <a-option value="junior">初级</a-option>
            <a-option value="executive">管理层</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属组织" :hide-label="true">
          <a-select v-model="positionForm.orgId" placeholder="请选择所属组织">
            <a-option v-for="org in organizations" :key="org.id" :value="org.id">
              {{ org.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="负责人" :hide-label="true">
          <a-select 
            v-model="positionForm.manager" 
            placeholder="选择负责人" 
            allow-clear
          >
            <a-option v-for="user in allUsers" :key="user.id" :value="user.realName">
              {{ user.realName }} ({{ user.employeeId }})
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="职务描述" :hide-label="true">
          <a-textarea 
            v-model="positionForm.description" 
            placeholder="请输入职务描述" 
            :max-length="200" 
            show-word-limit
          />
        </a-form-item>
        <a-form-item label="状态" :hide-label="true">
          <a-radio-group v-model="positionForm.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

// 职务相关数据
const positionSearchKey = ref('')
const positionModalVisible = ref(false)
const positionModalTitle = ref('')
const positionForm = ref({
  id: null,
  name: '',
  code: '',
  level: '',
  orgId: null,
  manager: '',
  description: '',
  status: 'active'
})

const positionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 示例职务数据
const positions = ref([
  {
    id: 1,
    name: '分管总裁',
    code: 'VP',
    level: 'executive',
    orgName: '总部',
    manager: '管理员',
    memberCount: 1,
    status: 'active'
  },
  {
    id: 2,
    name: '总经理',
    code: 'GM',
    level: 'executive',
    orgName: '技术部',
    manager: '张三',
    memberCount: 1,
    status: 'active'
  },
  {
    id: 3,
    name: '团队经理',
    code: 'TM',
    level: 'middle',
    orgName: '市场部',
    manager: '李四',
    memberCount: 3,
    status: 'active'
  },
  {
    id: 4,
    name: '高级工程师',
    code: 'SE',
    level: 'senior',
    orgName: '技术部',
    manager: '王五',
    memberCount: 5,
    status: 'active'
  },
  {
    id: 5,
    name: '产品经理',
    code: 'PM',
    level: 'middle',
    orgName: '产品部',
    manager: '赵六',
    memberCount: 2,
    status: 'inactive'
  }
])

// 示例组织数据
const organizations = ref([
  { id: 1, name: '总部' },
  { id: 2, name: '技术部' },
  { id: 3, name: '市场部' },
  { id: 4, name: '产品部' },
  { id: 5, name: '销售部' }
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

// 过滤后的职务数据
const filteredPositions = computed(() => {
  if (!positionSearchKey.value) return positions.value
  const key = positionSearchKey.value.toLowerCase()
  return positions.value.filter(item => 
    item.name.toLowerCase().includes(key) ||
    item.code.toLowerCase().includes(key)
  )
})

// 显示创建职务模态框
const showCreatePositionModal = () => {
  positionModalTitle.value = '新建职务'
  positionForm.value = {
    id: null,
    name: '',
    code: '',
    level: '',
    orgId: null,
    manager: '',
    description: '',
    status: 'active'
  }
  positionModalVisible.value = true
}

// 编辑职务
const handleEditPosition = (record) => {
  positionModalTitle.value = '编辑职务'
  positionForm.value = { ...record }
  // 将组织名称转换为ID
  const org = organizations.value.find(o => o.name === record.orgName)
  positionForm.value.orgId = org ? org.id : null
  positionModalVisible.value = true
}

// 查看职务
const handleViewPosition = (record) => {
  // 这里可以跳转到职务详情页面
  Message.info(`查看职务: ${record.name}`)
}

// 切换职务状态
const handleTogglePositionStatus = (record) => {
  record.status = record.status === 'active' ? 'inactive' : 'active'
  Message.success(`${record.status === 'active' ? '启用' : '禁用'}成功`)
}

// 保存职务
const handleSavePosition = () => {
  if (!positionForm.value.name || !positionForm.value.code) {
    Message.error('请填写职务名称和编码')
    return
  }

  if (positionForm.value.id) {
    // 编辑现有职务
    const index = positions.value.findIndex(pos => pos.id === positionForm.value.id)
    if (index !== -1) {
      // 更新组织名称
      const org = organizations.value.find(o => o.id === positionForm.value.orgId)
      positions.value[index] = { 
        ...positionForm.value, 
        orgName: org ? org.name : '-' 
      }
    }
  } else {
    // 创建新职务
    const org = organizations.value.find(o => o.id === positionForm.value.orgId)
    const newPosition = {
      ...positionForm.value,
      id: positions.value.length + 1,
      orgName: org ? org.name : '-',
      memberCount: 0
    }
    positions.value.push(newPosition)
  }

  Message.success(positionForm.value.id ? '更新成功' : '创建成功')
  closePositionModal()
}

// 关闭模态框
const closePositionModal = () => {
  positionModalVisible.value = false
}

// 搜索职务
const handlePositionSearch = () => {
  // 搜索已在computed中处理
}

// 分页变化
const handlePositionPageChange = (page) => {
  positionPagination.current = page
}
</script>

<style scoped>
.position-management {
  padding: 0;
}
</style>