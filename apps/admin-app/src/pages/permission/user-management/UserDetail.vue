<template>
  <div class="user-detail">
    <div class="breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item @click="$emit('back')" style="cursor: pointer">用户列表</a-breadcrumb-item>
        <a-breadcrumb-item>
          <icon-user />
          {{ user.username }}
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="user-info-header">
      <a-descriptions :column="4" size="medium">
        <a-descriptions-item label="工号">{{ user.employeeId || '-' }}</a-descriptions-item>
        <a-descriptions-item label="姓名">{{ user.realName || user.username || '-' }}</a-descriptions-item>
        <a-descriptions-item label="部门">{{ user.department || '-' }}</a-descriptions-item>
        <a-descriptions-item label="手机号">
          <a-space>
            <span>{{ user.phone || '-' }}</span>
            <a-button type="text" size="mini" @click="showPhoneEditModal">
              <icon-edit />
            </a-button>
          </a-space>
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <!-- 编辑手机号的模态框 -->
    <a-modal 
      v-model:visible="phoneModalVisible" 
      title="编辑手机号" 
      :width="400"
      @ok="savePhone"
      @cancel="closePhoneModal"
    >
      <a-form :model="phoneForm" layout="vertical">
        <a-form-item label="手机号" required :hide-label="true">
          <a-input 
            v-model="phoneForm.phone" 
            placeholder="请输入手机号" 
            :max-length="11"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-tabs v-model:active-key="activeTab" class="permission-tabs">
      <a-tab-pane key="roles" title="授予的角色">
        <div class="tab-content">
          <a-table :data="roleData" :pagination="false">
            <template #columns>
              <a-table-column title="角色名称" data-index="name" />
              <a-table-column title="描述" data-index="description" />
              <a-table-column title="授予时间" data-index="grantTime" />
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="app" title="应用权限">
        <div class="tab-content">
          <a-alert type="info" show-icon style="margin-bottom: 16px">
            请切换至直接授权页面进行编辑，或跳转至角色详情页面编辑继承权限。
          </a-alert>

          <div class="filter-bar">
            <a-radio-group v-model="appFilter" type="button">
              <a-radio value="all">全部</a-radio>
              <a-radio value="inherited">继承角色</a-radio>
              <a-radio value="direct">直接授权</a-radio>
            </a-radio-group>
          </div>

          <a-table :data="filteredAppPermissions" :pagination="false">
            <template #columns>
              <a-table-column title="权限名称" data-index="name" :width="200" />
              <a-table-column title="权限描述" data-index="description" />
              <a-table-column title="权限来源" :width="120">
                <template #cell="{ record }">
                  <a-tag :color="record.source === 'inherited' ? 'blue' : 'orange'">
                    {{ record.source === 'inherited' ? '角色继承' : '直接申请' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="授予角色" data-index="roleName" :width="150" />
              <a-table-column title="授予时间" data-index="grantTime" :width="180" />
              <a-table-column title="操作" :width="120">
                <template #cell="{ record }">
                  <a-button type="text" size="small" @click="editPermission(record)">
                    修改
                  </a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="data" title="数据权限">
        <div class="tab-content">
          <a-alert type="info" show-icon style="margin-bottom: 16px">
            请切换至直接授权页面进行编辑，或跳转至角色详情页面编辑继承权限。
          </a-alert>

          <div class="filter-bar">
            <a-space>
              <a-radio-group v-model="dataFilter" type="button">
                <a-radio value="all">全部</a-radio>
                <a-radio value="inherited">继承角色</a-radio>
                <a-radio value="direct">直接授权</a-radio>
              </a-radio-group>
              <a-select placeholder="数据库" style="width: 120px">
                <a-option>数据库</a-option>
              </a-select>
              <a-input-search placeholder="搜索数据库名称" style="width: 200px" />
            </a-space>
            <a-button type="primary" status="success" style="float: right">授予权限</a-button>
          </div>

          <div class="empty-container">
            <a-empty description="暂无数据" />
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back'])

const activeTab = ref('app')
const isEditingDesc = ref(false)
const appFilter = ref('all')
const dataFilter = ref('all')
const phoneModalVisible = ref(false)
const phoneForm = ref({
  phone: ''
})

const roleData = ref([
  { name: 'VOLCANO_MAIN_ACCOUNT', description: '主账号默认角色', grantTime: '2024-01-01 10:00:00' }
])

const allAppPermissions = ref([
  { name: '新建数据库', description: '创建数据库以及浏览所有数据库列表', granted: true, source: 'inherited', roleName: 'SystemAdmin', grantTime: '2024-01-01 10:00:00' },
  { name: '新建外部Catalog', description: '创建、删除、查看外部Catalog', granted: true, source: 'inherited', roleName: 'SystemAdmin', grantTime: '2024-01-01 10:00:00' },
  { name: '数据加载管理', description: '数据导入模块的所有功能权限，包括新建编辑和删除导入任务、新建编辑删除数据源', granted: true, source: 'inherited', roleName: 'DataAnalyst', grantTime: '2024-01-05 14:30:00' },
  { name: '知识库管理', description: '创建、查看、管理知识库', granted: true, source: 'inherited', roleName: 'SystemAdmin', grantTime: '2024-01-01 10:00:00' },
  { name: '计算组管理', description: '展开以查看不同计算组的权限，您可以为其授予「USE」或「ALL」权限。', granted: false, source: 'direct', roleName: '-', grantTime: '2024-02-10 09:15:00' },
  { name: '全局审计日志', description: '开启全局审计日志查看权限', granted: true, source: 'inherited', roleName: 'SystemAdmin', grantTime: '2024-01-01 10:00:00' },
  { name: '报表中心访问', description: '访问和使用报表中心功能', granted: true, source: 'direct', roleName: '-', grantTime: '2024-01-15 16:45:00' },
  { name: '数据可视化', description: '使用数据可视化工具创建图表和仪表盘', granted: true, source: 'inherited', roleName: 'DataAnalyst', grantTime: '2024-01-05 14:30:00' }
])

// 根据过滤条件计算显示的权限
const filteredAppPermissions = computed(() => {
  if (appFilter.value === 'all') {
    return allAppPermissions.value
  } else if (appFilter.value === 'inherited') {
    return allAppPermissions.value.filter((permission: any) => permission.source === 'inherited')
  } else if (appFilter.value === 'direct') {
    return allAppPermissions.value.filter((permission: any) => permission.source === 'direct')
  }
  return allAppPermissions.value
})

// 显示编辑手机号模态框
const showPhoneEditModal = () => {
  phoneForm.value.phone = props.user.phone || ''
  phoneModalVisible.value = true
}

// 保存手机号
const savePhone = () => {
  if (!phoneForm.value.phone) {
    Message.error('请输入手机号')
    return
  }
  
  // 这里可以调用API更新用户手机号
  // 暂时更新本地数据
  props.user.phone = phoneForm.value.phone
  Message.success('手机号更新成功')
  closePhoneModal()
}

// 关闭手机号编辑模态框
const closePhoneModal = () => {
  phoneModalVisible.value = false
}

// 编辑权限
const editPermission = (record: any) => {
  if (record.source === 'inherited') {
    // 如果是角色赋予的权限，弹出角色编辑模态框
    showRoleEditModal(record)
  } else {
    // 如果是直接申请的权限，弹出应用权限编辑模态框
    showAppPermissionEditModal(record)
  }
}

// 显示角色编辑模态框
const showRoleEditModal = (record: any) => {
  Message.info(`编辑角色权限: ${record.name}`)
  // 这里可以弹出角色编辑模态框
  // 实际实现中可以打开一个编辑角色权限的模态框
}

// 显示应用权限编辑模态框
const showAppPermissionEditModal = (record: any) => {
  Message.info(`编辑应用权限: ${record.name}`)
  // 这里可以弹出应用权限编辑模态框
  // 实际实现中可以打开一个编辑应用权限的模态框
}
</script>

<style scoped>
.user-detail {
  padding: 0;
  background-color: #fff;
  min-height: 100%;
}

.breadcrumb {
  padding: 16px 20px;
  border-bottom: 1px solid #f2f3f5;
}

.user-info-header {
  padding: 16px 20px;
  background-color: #fafafa;
}

.permission-tabs {
  margin-top: 0;
}

:deep(.arco-tabs-nav) {
  padding: 0 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #f2f3f5;
}

.tab-content {
  padding: 20px;
}

.filter-bar {
  margin-bottom: 16px;
  overflow: hidden;
}

.empty-container {
  padding: 80px 0;
  text-align: center;
}
</style>
