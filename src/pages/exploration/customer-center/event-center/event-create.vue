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
              <a-space>
                <a-radio-group v-model="form.acquireMethod">
                  <a-radio value="采样">采样</a-radio>
                  <a-radio value="上传">上传</a-radio>
                </a-radio-group>
                <a-button v-if="form.acquireMethod==='采样'" type="primary" size="small" @click="sampleAndUpdateAttributes">采样并更新</a-button>
                <a-button v-else type="primary" size="small" @click="triggerAction">操作</a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16" v-if="showSampling">
          <a-col :span="8">
          </a-col>
        </a-row>
        <a-row :gutter="16" v-if="showUpload">
          <a-col :span="12">
            <a-form-item label="上传文件">
              <a-upload :auto-upload="false" @change="onUploadChange">
                <a-button type="outline">选择文件</a-button>
              </a-upload>
              <div v-if="uploadFileName" style="margin-top: 8px">{{ uploadFileName }}</div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-collapse v-if="sampleJson" style="margin-top: 12px" :default-active-key="[]">
      <a-collapse-item key="sample" header="样本预览">
        <div class="json-preview-actions">
          <a-button size="small" type="outline" @click="copySample">复制JSON</a-button>
        </div>
        <pre class="json-preview">{{ sampleJson }}</pre>
      </a-collapse-item>
    </a-collapse>

    <a-card style="margin-top: 12px" title="事件属性列表">
      <template #extra>
        <a-button type="primary" @click="addAttr">新增属性</a-button>
      </template>
      <a-table :data="attributes" :pagination="false" row-key="code">
        <template #columns>
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
          <a-table-column title="是否主用户唯一标识" :width="160">
            <template #cell="{ record }">
              <a-switch v-model="record.isPrimaryIdentity" @change="onPrimaryChange(record)" />
            </template>
          </a-table-column>
          <a-table-column title="字段对应用户类型" :width="180">
            <template #cell="{ record }">
              <a-select v-model="record.identityType" placeholder="对应用户类型">
                <a-option value="unified_customer_id">统一客户ID</a-option>
                <a-option value="uid">UID</a-option>
                <a-option value="id_card">身份证</a-option>
                <a-option value="mobile">手机号</a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column title="是否产生事件时间" :width="140">
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
        </template>
      </a-table>
      <div class="table-footer">
        <a-button type="primary" @click="saveEvent">保存</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import mockEventAPI from '@/mock/event'
import { consoleLogger } from '@/utils/consoleLogger'

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
const showSampling = ref(false)
const showUpload = ref(false)
const samplingRate = ref(10)
const uploadFileName = ref('')
const sampleJson = ref('')

const onDatasourceChange = async (id: string) => {
  const ds = datasources.value.find((x: any) => x.id === id)
  topics.value = (ds?.topics || []).map((t: any) => ({ name: t.name }))
  if (!topics.value.find((t: { name: string }) => t.name === form.topic)) form.topic = ''
  consoleLogger.info('数据源变更', { datasourceId: id, topics: topics.value })
}

const addAttr = () => {
  attributes.value.push({
    code: `attr_${Date.now()}`,
    displayName: '',
    dataType: 'string',
    isPrimaryIdentity: false,
    identityType: '',
    generatesEvent: false,
    isEnum: false,
    actionField: ''
  })
  consoleLogger.info('新增属性', attributes.value[attributes.value.length - 1])
}
const removeAttr = (index: number) => {
  attributes.value.splice(index, 1)
  consoleLogger.info('删除属性后列表', { count: attributes.value.length })
}
const triggerAction = () => {
  showSampling.value = form.acquireMethod === '采样'
  showUpload.value = form.acquireMethod === '上传'
}
const onUploadChange = (files: any) => {
  const file = files?.[0] || files?.file
  uploadFileName.value = file?.name || ''
}
const sampleAndUpdateAttributes = async () => {
  if (!form.datasourceId || !form.topic) {
    Message.error('请先选择数据源与topic')
    return
  }
  try {
    consoleLogger.group('采样并更新事件属性')
    consoleLogger.info('采样请求参数', { datasourceId: form.datasourceId, topic: form.topic })
    const res: any = await mockEventAPI.getTopicSampleSchema(form.datasourceId as any, form.topic as any)
    let flat: Record<string, any> = flattenObject(res?.sample || {})
    let fields: Array<{ name: string; type: string; example?: any }> = Object.keys(flat).map((k: string) => ({ name: k, type: mapValueType(flat[k]), example: flat[k] }))
    if (!fields.length && Array.isArray(res?.schema?.fields)) {
      fields = (res.schema.fields as Array<{ name: string; type: string; example?: any }>).map((f) => ({ name: String(f.name || ''), type: String(f.type || 'string'), example: f.example }))
    }
    consoleLogger.info('采样样本', res?.sample || {})
    consoleLogger.table(flat)
    fields = ensureUniqueCodes(fields)
    attributes.value = fields.map((f: { name: string; type: string }) => {
      const name: string = String(f.name || '')
      const type: string = String(f.type || 'string')
      const identityType = name === 'user_id' ? 'unified_customer_id' : name === 'uid' ? 'uid' : name === 'mobile' ? 'mobile' : name === 'id_card' ? 'id_card' : ''
      const isEnum = name === 'event_type' || type === 'boolean'
      const generatesEvent = name === 'event_type'
      const actionField = name === 'event_type' ? 'type' : ''
      return {
        code: name,
        displayName: name,
        dataType: type,
        isPrimaryIdentity: false,
        identityType,
        generatesEvent,
        isEnum,
        actionField
      }
    })
    showSampling.value = true
    sampleJson.value = JSON.stringify(res?.sample || {}, null, 2)
    Message.success(`采样成功，已更新属性字段(${attributes.value.length}项)`)
    consoleLogger.info('属性列表更新完成', { count: attributes.value.length })
    consoleLogger.table(attributes.value)
    consoleLogger.groupEnd()
  } catch {
    Message.error('采样失败')
    consoleLogger.error('采样失败', { datasourceId: form.datasourceId, topic: form.topic })
  }
}
const mapValueType = (v: any): 'string'|'number'|'boolean'|'datetime'|'json' => {
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return 'datetime'
    return 'string'
  }
  if (typeof v === 'number') return 'number'
  if (typeof v === 'boolean') return 'boolean'
  if (v && typeof v === 'object') return 'json'
  return 'string'
}
const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
  const out: Record<string, any> = {}
  if (!obj || typeof obj !== 'object') return out
  Object.keys(obj).forEach((key: string) => {
    const val = obj[key]
    const path = prefix ? `${prefix}.${key}` : key
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const nested = flattenObject(val, path)
      Object.assign(out, nested)
    } else {
      out[path] = val
    }
  })
  return out
}
const ensureUniqueCodes = (fields: Array<{ name: string; type: string }>): Array<{ name: string; type: string }> => {
  const used = new Set<string>()
  return fields.map((f) => {
    let code = f.name || ''
    if (!code) code = `field_${used.size + 1}`
    let final = code
    let idx = 1
    while (used.has(final)) {
      final = `${code}_${idx++}`
    }
    used.add(final)
    return { name: final, type: f.type }
  })
}
const onPrimaryChange = (record: any) => {
  if (record.isPrimaryIdentity) {
    attributes.value.forEach((r: any) => {
      if (r !== record) r.isPrimaryIdentity = false
    })
    consoleLogger.info('设置主用户标识', { code: record.code })
  }
}
watch(attributes, (val: Array<any>) => {
  consoleLogger.info('属性列表变化', { count: val.length })
  consoleLogger.table(val)
}, { deep: true })
const copySample = async () => {
  try {
    await navigator.clipboard.writeText(sampleJson.value || '')
    Message.success('已复制样本JSON')
    consoleLogger.info('复制样本JSON')
  } catch {
    Message.error('复制失败')
    consoleLogger.error('复制样本JSON失败')
  }
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
.json-preview {
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.6;
  max-height: 320px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.json-preview-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
</style>
