<template>
  <div class="api-management">
    <div class="page-header">
      <h2>API管理</h2>
      <a-space>
        <a-button type="primary" @click="goCreate">
          <template #icon><IconPlus /></template>
          新建API
        </a-button>
      </a-space>
    </div>

    <div class="content-card">
      <a-card :bordered="false">
        <template #title>
          <div class="table-header">
            <span class="table-title">已创建的API</span>
            <span class="table-count">共 {{ apiList.length }} 条</span>
          </div>
        </template>
        <a-table :data="apiList" :pagination="{ pageSize: 10 }" size="small">
          <template #columns>
            <a-table-column title="API名称" data-index="name" />
            <a-table-column title="逻辑表" data-index="table" />
            <a-table-column title="返回格式">
              <template #cell="{ record }">
                {{ record.advanced.returnFormat }}
              </template>
            </a-table-column>
            <a-table-column title="缓存策略">
              <template #cell="{ record }">
                {{ getCacheLabel(record.advanced.cacheStrategy) }}
              </template>
            </a-table-column>
            <a-table-column title="分页">
              <template #cell="{ record }">
                {{ record.advanced.enablePagination ? '开启' : '关闭' }}
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="160">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="editApi(record)">编辑</a-button>
                  <a-button type="text" size="small" @click="previewSql(record)">查看SQL</a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>

    <a-modal v-model:visible="sqlModalVisible" title="SQL预览" width="800px" @ok="sqlModalVisible=false">
      <a-textarea v-model="sqlPreview" auto-size readonly />
    </a-modal>
  </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { Message } from '@arco-design/web-vue'
  import {
    IconPlus
  } from '@arco-design/web-vue/es/icon'
  
  const sqlPreview = ref('')
  const sqlModalVisible = ref(false)
  const router = useRouter()

  const apiList = ref<any[]>([])

  const STORAGE_KEY = 'api.management.list'
  const loadList = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        apiList.value = JSON.parse(raw)
      } else {
        // 初始化 Mock 数据
        apiList.value = [
          {
            id: 'api_001',
            name: '查询用户信息接口',
            database: 'mysql_prod',
            table: 'user_info',
            requestParams: [
              { name: 'user_id', type: 'int', required: true, example: '1001', description: '用户ID' }
            ],
            responseParams: [
              { name: 'id', bindField: 'id', type: 'int', sorting: 'none', required: true, example: '1', defaultValue: '', securityLevel: 'L2', description: '主键' },
              { name: 'username', bindField: 'username', type: 'varchar', sorting: 'none', required: true, example: 'zhangsan', defaultValue: '', securityLevel: 'L2', description: '用户名' },
              { name: 'email', bindField: 'email', type: 'varchar', sorting: 'none', required: false, example: 'test@example.com', defaultValue: '', securityLevel: 'L3', description: '邮箱' }
            ],
            advanced: {
              cacheStrategy: 'system',
              cacheTime: 600,
              returnFormat: 'JSON',
              enablePagination: true,
              withTotal: true
            },
            sql: 'SELECT id, username, email FROM user_info WHERE id = :user_id\nLIMIT :pageSize OFFSET (:pageNum - 1) * :pageSize'
          },
          {
            id: 'api_002',
            name: '销售订单统计查询',
            database: 'mysql_prod',
            table: 'orders',
            requestParams: [
              { name: 'status', type: 'varchar', required: false, example: 'paid', description: '订单状态' }
            ],
            responseParams: [
              { name: 'order_no', bindField: 'order_no', type: 'varchar', sorting: 'none', required: true, example: 'ORD20231001', defaultValue: '', securityLevel: 'L2', description: '订单号' },
              { name: 'amount', bindField: 'total_amount', type: 'double', sorting: 'desc', required: true, example: '99.8', defaultValue: '0', securityLevel: 'L1', description: '金额' }
            ],
            advanced: {
              cacheStrategy: 'none',
              cacheTime: 0,
              returnFormat: 'JSONCompact',
              enablePagination: false,
              withTotal: false
            },
            sql: 'SELECT order_no, total_amount FROM orders WHERE status = :status'
          }
        ]
        saveList()
      }
    } catch {
      apiList.value = []
    }
  }
  const saveList = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apiList.value))
  }
  onMounted(() => {
    loadList()
  })

  const goCreate = () => {
    router.push('/management/service/api-management/create')
  }

  const editApi = (record: any) => {
    router.push(`/management/service/api-management/${record.id || 0}/edit`)
  }

  const previewSql = (record: any) => {
    sqlPreview.value = record.sql || ''
    sqlModalVisible.value = true
  }

  const getCacheLabel = (strategy: string) => {
    if (strategy === 'system') return '系统策略(600s)'
    if (strategy === 'custom') return `自定义`
    return '关闭'
  }
  </script>

  <style scoped>
  .api-management {
    padding: 20px;
  }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .content-card {
    margin-top: 8px;
  }
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .table-title { font-weight: 600; }
  .table-count { color: var(--color-text-3); }
  .wizard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  </style>
