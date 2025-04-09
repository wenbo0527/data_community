<template>
  <a-layout>
    <a-layout-content class="content">
      <a-row :gutter="[24, 24]">
        <a-col :span="24">
          <a-card>
            <template #title>
              <a-space>
                <icon-apps />
                服务管理
              </a-space>
            </template>
            <template #extra>
              <a-button type="primary">
                <template #icon>
                  <icon-plus />
                </template>
                新建服务
              </a-button>
            </template>
            <a-table :columns="columns" :data="tableData" :loading="loading">
              <template #status="{ record }">
                <a-tag :color="record.status === '运行中' ? 'green' : 'red'">
                  {{ record.status }}
                </a-tag>
              </template>
              <template #operations>
                <a-space>
                  <a-button type="text" size="small">查看</a-button>
                  <a-button type="text" size="small" status="warning">停止</a-button>
                  <a-popconfirm
                    content="确认删除该服务吗？"
                    @ok="handleDelete"
                  >
                    <a-button type="text" size="small" status="danger">删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconApps, IconPlus } from '@arco-design/web-vue/es/icon'

const loading = ref(false)

const columns = [
  {
    title: '服务ID',
    dataIndex: 'serviceId'
  },
  {
    title: '服务名称',
    dataIndex: 'serviceName'
  },
  {
    title: '服务类型',
    dataIndex: 'serviceType'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime'
  },
  {
    title: '状态',
    slotName: 'status'
  },
  {
    title: '操作',
    slotName: 'operations',
    width: 200,
    fixed: 'right'
  }
]

const tableData = ref([
  {
    serviceId: 'SRV001',
    serviceName: '信用卡数据服务',
    serviceType: '在线批量调用',
    createTime: '2024-01-15',
    status: '运行中'
  },
  {
    serviceId: 'SRV002',
    serviceName: '贷款数据服务',
    serviceType: '离线回溯',
    createTime: '2024-01-14',
    status: '已停止'
  }
])

const handleDelete = () => {
  Message.success('删除成功')
}
</script>

<style scoped>
.content {
  padding: 20px;
}
</style>