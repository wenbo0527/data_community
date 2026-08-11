<!--
  批量导入衍生需求 · 文档 A1 R19
  - 下载 Excel 模板（CSV 格式）
  - 上传文件后预览解析
  - 批量创建
-->
<template>
  <a-modal
    :visible="visible"
    title="批量导入衍生需求（A1 R19）"
    :width="840"
    :ok-loading="submitting"
    :ok-text="okText"
    :cancel-text="cancelText || '取消'"
    :mask-closable="false"
    @ok="onOk"
    @cancel="onCancel"
  >
    <a-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      支持批量导入衍生需求，先下载 Excel 模板填写，然后上传 CSV 文件。导入前可在下方预览表格。
    </a-alert>

    <a-tabs :active-key="activeTab" @change="activeTab = $event as string">
      <!-- ============ Tab 1: 下载模板 ============ -->
      <a-tab-pane key="template" title="1. 下载模板">
        <div class="template-section">
          <p>点击下方按钮下载 Excel 模板（CSV 格式，可用 Excel 打开）。</p>
          <a-space>
            <a-button type="primary" @click="handleDownloadTemplate">
              <template #icon><icon-download /></template>
              下载 Excel 模板
            </a-button>
            <a-tag color="gray">共 19 个必填列</a-tag>
          </a-space>
          <a-divider />
          <p style="color: var(--color-text-3); font-size: 13px">模板字段说明：</p>
          <a-table
            :data="templateFields"
            :columns="templateFieldColumns"
            :pagination="false"
            size="small"
          />
        </div>
      </a-tab-pane>

      <!-- ============ Tab 2: 上传文件 ============ -->
      <a-tab-pane key="upload" title="2. 上传文件">
        <a-upload
          :custom-request="handleUpload"
          :show-file-list="false"
          accept=".csv,.txt"
          :auto-upload="true"
        >
          <template #upload-button>
            <a-button type="primary">
              <template #icon><icon-upload /></template>
              选择 CSV 文件
            </a-button>
          </template>
        </a-upload>
        <a-alert v-if="parsedRows.length > 0" type="success" :show-icon="false" style="margin: 16px 0">
          已解析 {{ parsedRows.length }} 条记录，下面是预览
        </a-alert>
        <a-alert v-if="parseError" type="error" :show-icon="false" style="margin: 16px 0">
          {{ parseError }}
        </a-alert>
      </a-tab-pane>

      <!-- ============ Tab 3: 预览数据 ============ -->
      <a-tab-pane key="preview" :title="`3. 预览（${parsedRows.length} 条）`" :disabled="parsedRows.length === 0">
        <a-empty v-if="parsedRows.length === 0" description="请先上传 CSV 文件" />
        <a-table
          v-else
          :data="parsedRows"
          :columns="previewColumns"
          :pagination="{ pageSize: 5 }"
          size="small"
        />
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

interface Props {
  visible: boolean
  okText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  okText: '导入',
  cancelText: '取消'
})

const emit = defineEmits<{
  (e: 'ok', rows: any[]): void
  (e: 'cancel'): void
}>()

const activeTab = ref('template')
const submitting = ref(false)
const parsedRows = ref<any[]>([])
const parseError = ref('')

// 模板字段（19 列）
const templateFields = [
  { field: 'name', label: '需求名称', required: true, example: '近30日大额交易次数' },
  { field: 'businessScene', label: '业务场景', required: true, example: '贷中' },
  { field: 'featureEnName', label: '特征英文名', required: true, example: 'MIDLOAN_BIGTXN_CNT_30D' },
  { field: 'featureCnName', label: '特征中文名', required: true, example: '近30日大额交易次数' },
  { field: 'fieldType', label: '字段类型', required: true, example: 'Integer' },
  { field: 'processingLogic', label: '加工逻辑', required: true, example: '从 dwd_trade_detail 过滤 amount >= 5000' },
  { field: 'defaultValue', label: '默认值', required: false, example: '0' },
  { field: 'l1Category', label: '一级分类', required: true, example: 'credit_grant' },
  { field: 'l2Category', label: '二级分类', required: true, example: 'credit_grant_amount' },
  { field: 'sourceTableAfter', label: '源表(后)', required: true, example: 'ads_midloan_bigtxn_30d' },
  { field: 'sourceTableBefore', label: '源表(前)', required: true, example: 'dwd_trade_detail' },
  { field: 'dataSource', label: '数据源', required: true, example: 'Hbase' },
  { field: 'dataFreshness', label: '数据时效', required: true, example: 'offline_t1' },
  { field: 'developer', label: '开发人员', required: true, example: '王数仓' },
  { field: 'expectedEffect', label: '预期效果', required: false, example: '识别异常消费模式' },
  { field: 'productScope', label: '产品范围', required: true, example: '现金贷' },
  { field: 'listType', label: '名单类型', required: false, example: 'none' },
  { field: 'batch', label: '批次', required: false, example: '2026Q3' },
  { field: 'acceptor', label: '验收人', required: false, example: '小李' }
]

const templateFieldColumns = [
  { title: '字段名', dataIndex: 'field' },
  { title: '中文名', dataIndex: 'label' },
  { title: '必填', slotName: 'required' },
  { title: '示例', dataIndex: 'example' }
]

const previewColumns = [
  { title: '需求名称', dataIndex: 'name', width: 180 },
  { title: '业务场景', dataIndex: 'businessScene', width: 80 },
  { title: '特征英文名', dataIndex: 'featureEnName', width: 180 },
  { title: '字段类型', dataIndex: 'fieldType', width: 80 },
  { title: '数据源', dataIndex: 'dataSource', width: 80 },
  { title: '数据时效', dataIndex: 'dataFreshness', width: 100 }
]

// 下载 CSV 模板
function handleDownloadTemplate() {
  const headers = templateFields.map(f => f.field).join(',')
  const exampleRow = templateFields.map(f => f.example).join(',')
  const csv = `${headers}\n${exampleRow}`
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `衍生需求批量导入模板_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  Message.success('模板已下载')
}

// 上传文件解析
const handleUpload = (options: any) => {
  const { fileItem } = options
  const file = fileItem.file
  if (!file) {
    parseError.value = '文件读取失败'
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    parseCSV(text)
  }
  reader.onerror = () => {
    parseError.value = '文件读取失败'
  }
  reader.readAsText(file, 'UTF-8')
}

function parseCSV(text: string) {
  parseError.value = ''
  parsedRows.value = []
  try {
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    if (lines.length < 2) {
      parseError.value = '文件至少需要包含表头 + 1 条数据'
      return
    }
    const headers = lines[0].split(',').map(h => h.trim())
    const rows: any[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((h, idx) => {
        row[h] = values[idx] || ''
      })
      // 必填字段校验
      if (!row.name || !row.featureEnName) {
        parseError.value = `第 ${i + 1} 行：需求名称和特征英文名为必填`
        parsedRows.value = []
        return
      }
      rows.push(row)
    }
    parsedRows.value = rows
    activeTab.value = 'preview'
    Message.success(`成功解析 ${rows.length} 条记录`)
  } catch (err) {
    parseError.value = 'CSV 解析失败：' + (err as Error).message
  }
}

function onOk() {
  if (parsedRows.value.length === 0) {
    Message.warning('请先上传并解析 CSV 文件')
    return
  }
  submitting.value = true
  try {
    emit('ok', parsedRows.value)
  } finally {
    submitting.value = false
  }
}

function onCancel() {
  emit('cancel')
}
</script>

<style scoped>
.template-section {
  padding: 8px 0;
}
</style>
