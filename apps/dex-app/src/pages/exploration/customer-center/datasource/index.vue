<template>
  <div class="datasource-management">
    <div class="page-header">
      <h2>数据源管理</h2>
      <a-space>
        <a-button type="primary" @click="openAdd">新增数据源</a-button>
      </a-space>
    </div>
    <a-card>
      <a-table :data="list" row-key="id" :pagination="false">
        <template #columns>
          <a-table-column title="名称" data-index="name" :width="200" />
          <a-table-column title="类型" data-index="type" :width="120" />
          <a-table-column title="地址" :width="220">
            <template #cell="{ record }">{{ record.host }}</template>
          </a-table-column>
          <a-table-column title="库/表" :width="220">
            <template #cell="{ record }">{{ record.database }}/{{ record.table }}</template>
          </a-table-column>
          <a-table-column title="描述" data-index="description" />
          <a-table-column title="操作" :width="220">
            <template #cell="{ record }">
              <a-space>
                <a-button size="mini" @click="edit(record)">编辑</a-button>
                <a-button size="mini" @click="test(record)">测试连接</a-button>
                <a-button size="mini" status="danger" @click="remove(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="modalVisible" :title="modalTitle" :width="600" @ok="submit" @cancel="close">
      <a-form :model="form" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item label="名称" required><a-input v-model="form.name" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="类型" required><a-select v-model="form.type"><a-option value="mysql">MySQL</a-option><a-option value="postgresql">PostgreSQL</a-option><a-option value="oracle">Oracle</a-option><a-option value="sqlserver">SQL Server</a-option><a-option value="doris">Doris</a-option></a-select></a-form-item></a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item label="连接地址" required><a-input v-model="form.host" placeholder="host:port" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="数据库名" required><a-input v-model="form.database" /></a-form-item></a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item label="表名" required><a-input v-model="form.table" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="用户名"><a-input v-model="form.username" /></a-form-item></a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item label="密码"><a-input-password v-model="form.password" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="描述"><a-input v-model="form.description" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useDataSourceStore } from '@/stores/datasource'

const ds = useDataSourceStore()
const list = ds.list
const modalVisible = ref(false)
const modalTitle = ref('新增数据源')
const editingId = ref<string | null>(null)
const form = reactive<any>({ id: '', name: '', type: 'mysql', host: '', database: '', table: '', username: '', password: '', description: '' })

const openAdd = () => { modalTitle.value = '新增数据源'; editingId.value = null; Object.assign(form, { id: '', name: '', type: 'mysql', host: '', database: '', table: '', username: '', password: '', description: '' }); modalVisible.value = true }
const edit = (record: any) => { modalTitle.value = '编辑数据源'; editingId.value = record.id; Object.assign(form, { ...record }); modalVisible.value = true }
const test = async (record: any) => { const res = await ds.testConnection(record); Message.info(res.success ? '连接成功' : '连接失败') }
const remove = (record: any) => { ds.remove(record.id); Message.success('已删除') }
const close = () => { modalVisible.value = false }
const submit = () => { if (!form.name || !form.host || !form.database || !form.table) { Message.error('请完善必填项'); return } const id = editingId.value ?? `ds-${Date.now()}`; const item = { ...form, id } as any; if (editingId.value) ds.update(id, item); else ds.add(item); modalVisible.value = false; Message.success('已保存') }
</script>

<style scoped>
.datasource-management { padding: 16px }
.page-header { display:flex; justify-content: space-between; align-items: center; margin-bottom: 12px }
</style>
