<template>
  <div class="event-create">
    <a-card :bordered="false">
      <template #title>
        <div class="page-header">
          <span>新建事件</span>
          <a-space>
            <a-button type="primary" @click="saveEvent">保存</a-button>
            <a-button @click="goBack">返回</a-button>
          </a-space>
        </div>
      </template>
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="事件名称" required>
              <a-input v-model="form.eventName" placeholder="请输入事件名称" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="事件来源" required>
              <a-select v-model="form.eventSource" placeholder="请选择事件来源">
                <a-option value="核心事件">核心事件</a-option>
                <a-option value="APP埋点事件">APP埋点事件</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="事件负责人" required>
              <a-input v-model="form.owner" placeholder="请输入负责人" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="数据源" required>
              <a-select v-model="form.datasourceId" placeholder="请选择数据源" @change="onDatasourceChange">
                <a-option v-for="ds in datasources" :key="ds.id" :value="ds.id">{{ ds.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="topic" required>
              <a-select v-model="form.topic" placeholder="请选择topic" :disabled="!topics.length">
                <a-option v-for="t in topics" :key="t.name" :value="t.name">{{ t.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="获取方式" required>
              <a-radio-group v-model="form.acquireMethod">
                <a-radio value="采样">采样</a-radio>
                <a-radio value="上传">上传</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <a-card style="margin-top: 12px" title="事件属性列表">
      <template #extra>
        <a-button type="primary" @click="addAttr">新增属性</a-button>
      </template>
      <a-table :data="attributes" :pagination="false" row-key="code">
        <a-table-column title="属性编码" :width="160">
          <template #cell="{ record }">
            <a-input v-model="record.code" placeholder="属性编码" />
          </template>
        </a-table-column>
        <a-table-column title="展示名称" :width="160">
          <template #cell="{ record }">
            <a-input v-model="record.displayName" placeholder="展示名称" />
          </template>
        </a-table-column>
        <a-table-column title="数据类型" :width="140">
          <template #cell="{ record }">
            <a-select v-model="record.dataType" placeholder="选择类型">
              <a-option value="string">字符串</a-option>
              <a-option value="number">数值</a-option>
              <a-option value="boolean">布尔</a-option>
              <a-option value="datetime">时间</a-option>
              <a-option value="json">JSON</a-option>
            </a-select>
          </template>
        </a-table-column>
        <a-table-column title="是否用户标识" :width="140">
          <template #cell="{ record }">
            <a-switch v-model="record.isUserIdentity" />
          </template>
        </a-table-column>
        <a-table-column title="标识类型" :width="180">
          <template #cell="{ record }">
            <a-select v-model="record.identityType" placeholder="选择标识类型" :disabled="!record.isUserIdentity">
              <a-option value="unified_customer_id">统一客户ID</a-option>
              <a-option value="uid">UID</a-option>
              <a-option value="id_card">身份证</a-option>
              <a-option value="mobile">手机号</a-option>
            </a-select>
          </template>
        </a-table-column>
        <a-table-column title="是否产生事件" :width="140">
          <template #cell="{ record }">
            <a-switch v-model="record.generatesEvent" />
          </template>
        </a-table-column>
        <a-table-column title="是否枚举" :width="120">
          <template #cell="{ record }">
            <a-switch v-model="record.isEnum" />
          </template>
        </a-table-column>
        <a-table-column title="操作字段" :width="140">
          <template #cell="{ record }">
            <a-select v-model="record.actionField" allow-search placeholder="选择操作字段">
              <a-option v-for="opt in actionFieldOptions" :key="opt" :value="opt">{{ opt }}</a-option>
            </a-select>
          </template>
        </a-table-column>
        <a-table-column title="操作" :width="100" fixed="right">
          <template #cell="{ rowIndex }">
            <a-button type="text" status="danger" @click="removeAttr(rowIndex)">删除</a-button>
          </template>
        </a-table-column>
      </a-table>
      <div class="table-footer">
        <a-button type="primary" @click="saveEvent">保存</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import mockEventAPI from '@/mock/event'

const router = useRouter()

const form = reactive({
  eventName: '',
  eventSource: '核心事件',
  owner: '',
  datasourceId: '',
  topic: '',
  acquireMethod: '采样'
})

const datasources = ref<any[]>([])
const topics = ref<Array<{ name: string }>>([])
const attributes = ref<Array<any>>([])
const actionFieldOptions = ['status', 'amount', 'result', 'type']

const onDatasourceChange = async (id: string) => {
  const ds = datasources.value.find((x: any) => x.id === id)
  topics.value = (ds?.topics || []).map((t: any) => ({ name: t.name }))
  if (!topics.value.find(t => t.name === form.topic)) form.topic = ''
}

const addAttr = () => {
  attributes.value.push({
    code: `attr_${Date.now()}`,
    displayName: '',
    dataType: 'string',
    isUserIdentity: false,
    identityType: '',
    generatesEvent: false,
    isEnum: false,
    actionField: ''
  })
}
const removeAttr = (index: number) => {
  attributes.value.splice(index, 1)
}

const saveEvent = async () => {
  if (!form.eventName || !form.eventSource || !form.owner || !form.datasourceId || !form.topic) {
    Message.error('请完整填写基础信息')
    return
  }
  try {
    await mockEventAPI.createEvent({
      eventName: form.eventName,
      eventSource: form.eventSource as any,
      acquireMethod: form.acquireMethod as any,
      owner: form.owner,
      description: '',
      registryKey: 'event_id',
      status: '草稿'
    })
    Message.success('事件已保存')
    router.push('/exploration/customer-center/event-center/event-management')
  } catch {
    Message.error('保存失败')
  }
}

const goBack = () => {
  router.push('/exploration/customer-center/event-center/event-management')
}

onMounted(async () => {
  const list = await mockEventAPI.getKafkaDatasources()
  datasources.value = list as any
})
</script>

<style scoped>
.event-create {
  padding: 16px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>

