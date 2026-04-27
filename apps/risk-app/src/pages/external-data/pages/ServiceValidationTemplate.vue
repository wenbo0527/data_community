<template>
  <div class="template-management">
    <a-page-header title="服务校验模版管理" subtitle="维护样本表准备所需的字段校验规则">
      <template #extra>
        <a-button type="primary" @click="openCreateDrawer">
          <template #icon><icon-plus /></template>
          新建模版
        </a-button>
      </template>
    </a-page-header>

    <a-card class="list-card">
      <a-table :data="tableData" :loading="loading" :pagination="pagination" @page-change="onPageChange">
        <template #columns>
          <a-table-column title="模版名称" data-index="name" />
          <a-table-column title="适用服务类型" data-index="serviceType" />
          <a-table-column title="适用外数产品" data-index="serviceProduct">
            <template #cell="{ record }">
              {{ record.serviceProduct || '全部' }}
            </template>
          </a-table-column>
          <a-table-column title="校验规则数" data-index="ruleCount">
            <template #cell="{ record }">
              字段: {{ record.fieldRules?.length || 0 }} | 数据: {{ record.dataRules?.length || 0 }}
            </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updateTime" />
          <a-table-column title="操作" width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="text" status="danger" size="small" @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新建/编辑抽屉 -->
    <a-drawer
      :visible="drawerVisible"
      :width="700"
      :title="isEdit ? '编辑模版' : '新建模版'"
      @cancel="drawerVisible = false"
      @ok="handleSubmit"
      :ok-loading="isSubmitting"
    >
      <a-form :model="form" layout="vertical" ref="formRef">
        <a-form-item label="模版名称" field="name" required>
          <a-input v-model="form.name" placeholder="请输入模版名称" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="适用服务类型" field="serviceType" required>
              <a-select v-model="form.serviceType" placeholder="请选择适用服务类型" allow-create>
                <a-option>在线批量调用</a-option>
                <a-option>外数离线回溯申请</a-option>
                <a-option>全量变量回溯申请</a-option>
                <a-option>风险合规离线回溯申请</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="适用外数产品" field="serviceProduct">
              <a-input v-model="form.serviceProduct" placeholder="请输入适用外数产品（可选）" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-tabs default-active-key="field">
          <!-- 字段校验 -->
          <a-tab-pane key="field" title="字段命名校验">
            <div style="margin-bottom: 16px; text-align: right">
              <a-button type="secondary" size="small" @click="addFieldRule">
                <template #icon><icon-plus /></template>
                添加字段规则
              </a-button>
            </div>
            <a-table :data="form.fieldRules" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="字段名" data-index="name">
                  <template #cell="{ record }">
                    <a-input v-model="record.name" size="small" placeholder="如 id_no" />
                  </template>
                </a-table-column>
                <a-table-column title="类型" data-index="type" width="120">
                  <template #cell="{ record }">
                    <a-select v-model="record.type" size="small">
                      <a-option>STRING</a-option>
                      <a-option>INT</a-option>
                      <a-option>BIGINT</a-option>
                      <a-option>DOUBLE</a-option>
                      <a-option>DATE</a-option>
                      <a-option>DATETIME</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="必填" width="80" align="center">
                  <template #cell="{ record }">
                    <a-checkbox v-model="record.required" />
                  </template>
                </a-table-column>
                <a-table-column title="操作" width="60" align="center">
                  <template #cell="{ rowIndex }">
                    <a-button type="text" status="danger" size="mini" @click="removeFieldRule(rowIndex)">
                      <template #icon><icon-delete /></template>
                    </a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>

          <!-- 数据校验 -->
          <a-tab-pane key="data" title="数据结果校验">
            <div style="margin-bottom: 16px; text-align: right">
              <a-button type="secondary" size="small" @click="addDataRule">
                <template #icon><icon-plus /></template>
                添加数据规则
              </a-button>
            </div>
            <a-table :data="form.dataRules" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="目标字段" data-index="targetField">
                  <template #cell="{ record }">
                    <a-input v-model="record.targetField" size="small" placeholder="如 mobile" />
                  </template>
                </a-table-column>
                <a-table-column title="规则类型" data-index="ruleType" width="140">
                  <template #cell="{ record }">
                    <a-select v-model="record.ruleType" size="small">
                      <a-option value="regex">正则表达式</a-option>
                      <a-option value="range">数值范围</a-option>
                      <a-option value="enum">枚举值</a-option>
                      <a-option value="not_null">非空检查</a-option>
                      <a-option value="is_encrypted">是否加密</a-option>
                      <a-option value="is_unique">是否唯一</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="规则参数" data-index="ruleValue">
                  <template #cell="{ record }">
                    <a-input 
                      v-model="record.ruleValue" 
                      size="small" 
                      :placeholder="getPlaceholder(record.ruleType)" 
                      :disabled="['is_encrypted', 'is_unique', 'not_null'].includes(record.ruleType)"
                    />
                  </template>
                </a-table-column>
                <a-table-column title="操作" width="60" align="center">
                  <template #cell="{ rowIndex }">
                    <a-button type="text" status="danger" size="mini" @click="removeDataRule(rowIndex)">
                      <template #icon><icon-delete /></template>
                    </a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>

      </a-form>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconDelete } from '@arco-design/web-vue/es/icon'

// 模拟数据
const mockTemplates = [
  {
    id: '1',
    name: '在线批量标准模版',
    serviceType: '在线批量调用',
    serviceProduct: '运营商核验',
    updateTime: '2023-10-25 10:00:00',
    fieldRules: [
      { name: 'request_id', type: 'STRING', required: true },
      { name: 'id_no', type: 'STRING', required: true },
      { name: 'mobile', type: 'STRING', required: true },
      { name: 'name', type: 'STRING', required: true }
    ],
    dataRules: [
      { targetField: 'mobile', ruleType: 'is_encrypted', ruleValue: '' },
      { targetField: 'id_no', ruleType: 'is_encrypted', ruleValue: '' },
      { targetField: 'request_id', ruleType: 'is_unique', ruleValue: '' }
    ]
  },
  {
    id: '2',
    name: '离线回溯通用模版',
    serviceType: '外数离线回溯申请',
    serviceProduct: '全部',
    updateTime: '2023-10-20 15:30:00',
    fieldRules: [
      { name: 'primary_key', type: 'STRING', required: true },
      { name: 'event_time', type: 'DATETIME', required: true }
    ],
    dataRules: [
      { targetField: 'primary_key', ruleType: 'is_unique', ruleValue: '' },
      { targetField: 'event_time', ruleType: 'not_null', ruleValue: '' }
    ]
  }
]

const loading = ref(false)
const tableData = ref([...mockTemplates])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 2
})

const drawerVisible = ref(false)
const isSubmitting = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: '',
  name: '',
  serviceType: '',
  serviceProduct: '',
  fieldRules: [] as any[],
  dataRules: [] as any[]
})

const getPlaceholder = (type: string) => {
  switch (type) {
    case 'regex': return '如 ^1[3-9]\\d{9}$'
    case 'range': return '如 0,100'
    case 'enum': return '如 A,B,C'
    case 'is_encrypted': return '无需参数'
    case 'is_unique': return '无需参数'
    case 'not_null': return '无需参数'
    default: return '请输入规则参数'
  }
}

const onPageChange = (current: number) => {
  pagination.current = current
}

const openCreateDrawer = () => {
  isEdit.value = false
  form.id = ''
  form.name = ''
  form.serviceType = ''
  form.serviceProduct = '全部'
  form.fieldRules = [{ name: '', type: 'STRING', required: true }]
  form.dataRules = []
  drawerVisible.value = true
}

const handleEdit = (record: any) => {
  isEdit.value = true
  form.id = record.id
  form.name = record.name
  form.serviceType = record.serviceType
  form.serviceProduct = record.serviceProduct || '全部'
  form.fieldRules = JSON.parse(JSON.stringify(record.fieldRules || []))
  form.dataRules = JSON.parse(JSON.stringify(record.dataRules || []))
  drawerVisible.value = true
}

const handleDelete = (record: any) => {
  const index = tableData.value.findIndex(item => item.id === record.id)
  if (index !== -1) {
    tableData.value.splice(index, 1)
    Message.success('删除成功')
  }
}

const addFieldRule = () => {
  form.fieldRules.push({ name: '', type: 'STRING', required: false })
}

const removeFieldRule = (index: number) => {
  form.fieldRules.splice(index, 1)
}

const addDataRule = () => {
  form.dataRules.push({ targetField: '', ruleType: 'regex', ruleValue: '' })
}

const removeDataRule = (index: number) => {
  form.dataRules.splice(index, 1)
}

const handleSubmit = () => {
  if (!form.name || !form.serviceType) {
    Message.warning('请填写模版名称和服务类型')
    return
  }

  const product = form.serviceProduct || '全部'
  const isDuplicate = tableData.value.some(item => 
    item.serviceType === form.serviceType && 
    (item.serviceProduct || '全部') === product &&
    (!isEdit.value || item.id !== form.id)
  )

  if (isDuplicate) {
    Message.error(`该服务类型及产品组合 [${form.serviceType} - ${product}] 已存在模版，请勿重复创建。`)
    return
  }
  
  isSubmitting.value = true
  setTimeout(() => {
    const newData = {
      id: isEdit.value ? form.id : Date.now().toString(),
      name: form.name,
      serviceType: form.serviceType,
      serviceProduct: form.serviceProduct || '全部',
      updateTime: new Date().toLocaleString(),
      fieldRules: JSON.parse(JSON.stringify(form.fieldRules)),
      dataRules: JSON.parse(JSON.stringify(form.dataRules))
    }

    if (isEdit.value) {
      const index = tableData.value.findIndex(item => item.id === form.id)
      if (index !== -1) tableData.value[index] = newData
      Message.success('更新成功')
    } else {
      tableData.value.unshift(newData)
      Message.success('创建成功')
    }
    
    isSubmitting.value = false
    drawerVisible.value = false
  }, 500)
}
</script>

<style scoped>
.template-management {
  padding: 0 16px;
}
.list-card {
  margin-top: 20px;
  min-height: 500px;
}
</style>
