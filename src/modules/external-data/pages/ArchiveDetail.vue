<template>
  <div class="archive-detail">
    <div class="page-header">
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>外数档案</a-breadcrumb-item>
        <a-breadcrumb-item>产品详情</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-content">
        <div class="title-section">
          <h1 class="title">{{ header.name }}</h1>
          <a-descriptions :column="2" class="header-info" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="产品编码">{{ header.code || '—' }}</a-descriptions-item>
            <a-descriptions-item label="供应商"><a-tag>{{ header.supplier || '—' }}</a-tag></a-descriptions-item>
            <a-descriptions-item label="状态"><a-tag :status="statusTag(header.status)">{{ statusLabel(header.status) }}</a-tag></a-descriptions-item>
            <a-descriptions-item label="上线时间">{{ header.onlineTime || '—' }}</a-descriptions-item>
            <a-descriptions-item label="负责人">{{ header.manager || '—' }}</a-descriptions-item>
            <a-descriptions-item label="接口标签">{{ header.interfaceTag || '—' }}</a-descriptions-item>
          </a-descriptions>
        </div>
        <div class="actions">
          <a-button @click="goBackList"><template #icon><IconArrowLeft /></template>返回档案</a-button>
          <a-button type="outline" @click="goTechDetail"><template #icon><IconShareAlt /></template>技术详情</a-button>
          <a-button type="outline" @click="goMetadata"><template #icon><IconStorage /></template>元数据管理</a-button>
          <a-button type="primary" @click="editVisible = true"><template #icon><IconEdit /></template>编辑档案</a-button>
        </div>
      </div>
    </div>
    <div class="detail-content">
      <a-tabs v-model:active-key="activeTab" class="detail-tabs">
        <a-tab-pane key="product" title="产品信息">
          <a-card class="detail-card">
            <a-descriptions :column="2" :data="productBasic" />
            <a-divider style="margin: 16px 0" />
            <a-descriptions :column="2" :data="productExtra" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="tech" title="接口技术">
          <a-card class="detail-card">
            <a-descriptions :column="2" :data="techInfo" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="storage" title="落库信息">
          <a-card class="detail-card">
            <a-descriptions :column="2" :data="storageInfo" />
            <a-divider style="margin: 16px 0" />
            <h3>表结构</h3>
            <a-table :columns="metadataColumns" :data="metadataData" :pagination="false" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="inputs" title="产品入参">
          <a-card class="detail-card">
            <a-table :columns="inputColumns" :data="inputParams" :pagination="false" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="outputs" title="产品出参">
          <a-card class="detail-card">
            <a-table :columns="outputColumns" :data="outputParams" :pagination="false" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="usage" title="调用与费用">
          <a-card class="detail-card">
            <a-descriptions :column="2" :data="usageInfo" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="evaluation" title="评估索引">
          <a-card class="detail-card">
            <a-descriptions :column="2" :data="evaluationInfo" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="contracts" title="合同关联">
          <a-card class="detail-card">
            <a-table :data="relatedContracts" :pagination="false">
              <template #columns>
                <a-table-column title="合同名称" data-index="contractName" :width="240" />
                <a-table-column title="合同编号" data-index="contractNo" :width="160" />
                <a-table-column title="类型" :width="120">
                  <template #cell="{ record }">{{ record.contractType==='supplement'?'补充合同':'框架协议' }}</template>
                </a-table-column>
                <a-table-column title="金额" :width="160">
                  <template #cell="{ record }">{{ formatCurrency(record.amount) }}</template>
                </a-table-column>
                <a-table-column title="到期" :width="160">
                  <template #cell="{ record }">{{ formatDate(record.endDate) }}</template>
                </a-table-column>
                <a-table-column title="状态" data-index="status" :width="120" />
              </template>
              <template #empty><a-empty description="暂无关联合同" /></template>
            </a-table>
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="aliases" title="别名信息">
          <a-card class="detail-card">
            <a-table :data="aliasRows" :pagination="false">
              <template #columns>
                <a-table-column title="别名" data-index="alias" :width="200" />
                <a-table-column title="类型" data-index="type" :width="140" />
                <a-table-column title="状态" data-index="status" :width="120" />
                <a-table-column title="使用频率" data-index="usage" :width="120" />
              </template>
              <template #empty><a-empty description="暂无别名数据" /></template>
            </a-table>
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="maintenance" title="档案维护">
          <a-card class="detail-card">
            <a-timeline>
              <a-timeline-item v-for="log in maintenanceLogs" :key="log.id" :label="formatDateTime(log.time)">{{ log.text }}</a-timeline-item>
            </a-timeline>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </div>
    <a-modal v-model:visible="editVisible" title="编辑档案" :width="720" @ok="saveEdit">
      <a-form :model="editForm" layout="vertical">
        <a-form-item field="description" label="描述"><a-textarea v-model="editForm.description" :rows="3" /></a-form-item>
        <a-form-item field="tags" label="标签"><a-input-tag v-model="editForm.tags" allow-clear /></a-form-item>
        <a-form-item field="manager" label="负责人"><a-input v-model="editForm.manager" /></a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExternalDataStore } from '@/modules/external-data/stores/external-data'
import { useContractStore } from '@/modules/budget/stores/contract'
import { IconArrowLeft, IconEdit, IconStorage, IconShareAlt } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { generateExternalDataDetail } from '@/mock/external-data-v1'
import DateUtils from '@/utils/dateUtils'

const route = useRoute()
const router = useRouter()
const store = useExternalDataStore()
const contractStore = useContractStore()

const activeTab = ref('product')
const dataId = computed(() => String(route.params.id || ''))
const header = ref<any>({})
const editVisible = ref(false)
const editForm = ref({ description: '', tags: [] as string[], manager: '' })

const goBackList = () => { router.push({ path: '/risk/external-data/archive' }) }
const goTechDetail = () => { router.push({ path: `/external-data-v1/detail/${header.value.interfaceId || 'EXT001'}`, query: { from: 'archive', archiveId: dataId.value } }) }
const goMetadata = () => { router.push({ path: '/discovery/asset-management/external-data-management', query: { from: 'archive', archiveId: dataId.value } }) }

const statusLabel = (s?: string) => s === 'importing' ? '引入中' : s === 'online' ? '已上线' : s === 'pending_evaluation' ? '待评估' : s === 'archived' ? '已归档' : '—'
const statusTag = (s?: string) => s === 'online' ? 'success' : s === 'pending_evaluation' ? 'warning' : s === 'importing' ? 'warning' : 'default'
const formatDate = (d?: string | Date) => { try { return DateUtils.formatDate(d || '') } catch { return '—' } }
const formatDateTime = (d?: string | Date) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }
const formatCurrency = (n?: number) => { try { if (n == null) return '—'; return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) } catch { return '—' } }

const productBasic = computed(() => [
  { label: '接口编号', value: header.value.interfaceId || '—' },
  { label: '供应商', value: header.value.supplier || '—' },
  { label: '单价', value: header.value.price ? `${header.value.price}元/次` : '—' },
  { label: '管理人员', value: header.value.manager || '—' },
  { label: '上线时间', value: header.value.onlineTime || '—' },
  { label: '接口状态', value: header.value.status || '—' },
  { label: '接口标签', value: header.value.interfaceTag || '—' },
  { label: '更新频率', value: header.value.updateFrequency || '—' },
  { label: '数据来源', value: header.value.dataSource || '—' }
])

const productExtra = computed(() => [
  { label: '描述信息', value: header.value.description || '—' },
  { label: '标签', value: (header.value.tags || []).join('、') || '—' }
])

const techInfo = computed(() => [
  { label: '请求方式', value: header.value.requestMethod || '—' },
  { label: '请求地址', value: header.value.apiUrl || '—' },
  { label: 'Headers', value: header.value.headers || '—' },
  { label: '请求超时', value: header.value.timeout ? `${header.value.timeout}秒` : '—' },
  { label: 'QPS限制', value: header.value.qpsLimit ? `${header.value.qpsLimit}次/秒` : '—' },
  { label: '目标表', value: header.value.targetTable || '—' }
])

const storageInfo = computed(() => [
  { label: '落库表名', value: header.value.targetTable || '—' },
  { label: '数据格式', value: 'JSON' },
  { label: '更新频率', value: header.value.updateFrequency || '—' },
  { label: '数据来源', value: header.value.dataSource || '—' }
])

const inputParams = ref<any[]>([])
const outputParams = ref<any[]>([])
const usageInfo = ref<any[]>([])
const evaluationInfo = ref<any[]>([])
const metadataData = ref<any[]>([])

const metadataColumns = [
  { title: '字段名称', dataIndex: 'field' },
  { title: '字段类型', dataIndex: 'type' },
  { title: '字段说明', dataIndex: 'comment' }
]

const inputColumns = [
  { title: '参数名称', dataIndex: 'name' },
  { title: '参数类型', dataIndex: 'type' },
  { title: '是否必填', dataIndex: 'required', render: ({ record }: any) => record.required ? '是' : '否' },
  { title: '参数说明', dataIndex: 'description' }
]

const outputColumns = [
  { title: '参数名称', dataIndex: 'name' },
  { title: '参数类型', dataIndex: 'type' },
  { title: '参数说明', dataIndex: 'description' }
]

const relatedContracts = computed(() => {
  const supplier = header.value?.supplier
  if (!supplier) return []
  return contractStore.list.filter((c: any) => c.supplier === supplier)
})

const aliasRows = computed(() => {
  const tags = Array.isArray(header.value?.tags) ? header.value.tags : []
  const internal = tags.filter((t: string) => /内部|internal/i.test(t)).map((t: string, i: number) => ({ alias: t, type: '内部', status: '启用', usage: 100 - i * 5 }))
  const technical = tags.filter((t: string) => /技术|tech/i.test(t)).map((t: string, i: number) => ({ alias: t, type: '技术', status: '启用', usage: 80 - i * 5 }))
  const business = tags.filter((t: string) => /业务|biz/i.test(t)).map((t: string, i: number) => ({ alias: t, type: '业务', status: '启用', usage: 60 - i * 5 }))
  const external = [{ alias: header.value?.dataName || header.value?.name || '—', type: '外部', status: '启用', usage: 120 }]
  const other = tags.filter((t: string) => !/内部|internal|技术|tech|业务|biz/i.test(t)).map((t: string) => ({ alias: t, type: '其它', status: '启用', usage: 40 }))
  return [...internal, ...business, ...technical, ...external, ...other]
})

const maintenanceLogs = ref<any[]>([])

const loadDetail = async () => {
  try {
    await store.fetchProducts()
    await contractStore.fetchContractList({ page: 1, pageSize: 50 })
    const fromStore = (store.products || []).find((p: any) => String(p.id) === dataId.value)
    if (fromStore) {
      header.value = {
        name: fromStore.name || fromStore.productName || '—',
        code: fromStore.code || `ED-${fromStore.id}`,
        supplier: fromStore.supplier || fromStore.provider || '—',
        status: fromStore.status || 'importing',
        manager: '档案负责人',
        interfaceTag: '主接口',
        onlineTime: new Date().toISOString(),
        description: fromStore.description || '',
        tags: Array.isArray(fromStore.tags) ? fromStore.tags : ['外数','风控'],
        price: fromStore.unitPrice || 0,
        updateFrequency: '日',
        dataSource: '外部API',
        requestMethod: 'POST',
        apiUrl: '/api/external/call',
        headers: 'Authorization, Content-Type',
        timeout: 30,
        qpsLimit: 100,
        targetTable: fromStore.bottomTable || fromStore.dbTable || fromStore.tableName || 'dwd.external_table',
        interfaceId: `EXT${String(fromStore.id).padStart(3,'0')}`
      }
      inputParams.value = [
        { name: 'id_card', type: 'string', required: true, description: '身份证号' },
        { name: 'phone', type: 'string', required: false, description: '手机号' }
      ]
      outputParams.value = [
        { name: 'score', type: 'number', description: '风险评分' },
        { name: 'risk_level', type: 'string', description: '风险等级' }
      ]
      usageInfo.value = [
        { label: '近月调用量', value: '120,000' },
        { label: '近月费用', value: '¥85,000.00' },
        { label: 'QPS峰值', value: '150' }
      ]
      evaluationInfo.value = [
        { label: '最新评估得分', value: fromStore.evaluationScore ?? '—' },
        { label: '评估时间', value: new Date().toISOString() }
      ]
      metadataData.value = [
        { field: 'user_id', type: 'string', comment: '用户ID' },
        { field: 'score', type: 'number', comment: '风险评分' }
      ]
      maintenanceLogs.value = [
        { id: 1, time: new Date().toISOString(), text: '完成档案信息补充' },
        { id: 2, time: new Date(Date.now() - 86400000).toISOString(), text: '更新技术文档链接' }
      ]
    } else {
      const v1 = generateExternalDataDetail(dataId.value)
      header.value = { ...v1, name: v1.dataName, code: v1.interfaceId, supplier: v1.supplier, status: v1.status, manager: v1.manager, interfaceTag: v1.interfaceTag, onlineTime: v1.onlineTime, description: v1.description, tags: ['外数','风控'], price: v1.price, updateFrequency: v1.updateFrequency, dataSource: v1.dataSource, requestMethod: v1.requestMethod, apiUrl: v1.apiUrl, headers: v1.headers, timeout: v1.timeout, qpsLimit: v1.qpsLimit, targetTable: v1.targetTable, interfaceId: v1.interfaceId }
      inputParams.value = v1.inputParams || []
      outputParams.value = v1.outputParams || []
      usageInfo.value = v1.usageInfo || []
      evaluationInfo.value = v1.evaluationInfo || []
      metadataData.value = v1.metadataData || []
      maintenanceLogs.value = [
        { id: 1, time: new Date().toISOString(), text: '创建档案详情' }
      ]
    }
  } catch (e: any) {
    Message.error('加载详情失败')
  }
}

onMounted(loadDetail)

const saveEdit = () => {
  editVisible.value = false
  Message.success('档案已更新')
}
</script>

<style scoped>
.archive-detail { padding: 24px; min-height: calc(100vh - 64px); }
.breadcrumb { margin-bottom: 16px; }
.page-header { background: #f8f9fa; padding: 16px; border: 1px solid #e5e6eb; border-radius: 8px; margin-bottom: 16px; }
.header-content { display: flex; justify-content: space-between; align-items: flex-start; }
.title { margin: 0 0 8px; font-size: 22px; font-weight: 600; }
.actions :deep(.arco-btn) { margin-left: 8px; }
.detail-content { background: #fff; border: 1px solid #e5e6eb; border-radius: 8px; padding: 16px; }
.detail-card { margin-bottom: 16px; }
</style>
