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
        <a-descriptions-item label="部门信息">{{ user.department || '技术部/数据中心' }}</a-descriptions-item>
      </a-descriptions>
    </div>

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

          <a-table :data="appPermissions" :pagination="false">
            <template #columns>
              <a-table-column title="权限">
                <template #cell="{ record }">
                  <a-space>
                    <icon-caret-right v-if="record.expandable" />
                    {{ record.name }}
                  </a-space>
                </template>
              </a-table-column>
              <a-table-column title="描述">
                <template #cell="{ record }">
                  {{ record.description }}
                  <a-link v-if="record.name === '计算组管理'" style="font-size: 12px">查看权限差异</a-link>
                </template>
              </a-table-column>
              <a-table-column title="授予用户" align="right">
                <template #cell="{ record }">
                  <a-space>
                    <a-switch :model-value="record.granted" />
                    <icon-lock v-if="record.source === 'inherited'" style="color: #86909c" />
                  </a-space>
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
import { ref, reactive } from 'vue'

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

const roleData = ref([
  { name: 'VOLCANO_MAIN_ACCOUNT', description: '主账号默认角色', grantTime: '2024-01-01 10:00:00' }
])

const appPermissions = ref([
  { name: '新建数据库', description: '创建数据库以及浏览所有数据库列表', granted: true, source: 'inherited', expandable: false },
  { name: '新建外部Catalog', description: '创建、删除、查看外部Catalog', granted: true, source: 'inherited', expandable: false },
  { name: '数据加载管理', description: '数据导入模块的所有功能权限，包括新建编辑和删除导入任务、新建编辑删除数据源', granted: true, source: 'inherited', expandable: false },
  { name: '知识库管理', description: '创建、查看、管理知识库', granted: true, source: 'inherited', expandable: false },
  { name: '计算组管理', description: '展开以查看不同计算组的权限，您可以为其授予「USE」或「ALL」权限。', granted: false, source: 'direct', expandable: true },
  { name: '全局审计日志', description: '开启全局审计日志查看权限', granted: true, source: 'inherited', expandable: false }
])
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
