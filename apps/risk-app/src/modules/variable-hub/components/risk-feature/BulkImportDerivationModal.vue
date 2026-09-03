<!--
  批量导入需求
  - 不限定模板：解析 Excel/CSV 中匹配"特征英文名""中文名"的列
  - 支持手动添加需求行
  - 挂载统一附件（所有需求共享同一附件）
-->
<template>
  <a-modal
    :visible="visible"
    title="批量导入需求"
    :width="900"
    :ok-loading="submitting"
    :ok-text="`导入（${rows.length} 条）`"
    :cancel-text="cancelText || '取消'"
    :mask-closable="false"
    @ok="onOk"
    @cancel="onCancel"
  >
    <a-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      上传 Excel/CSV 文件自动解析"特征英文名"和"中文名"列（不限定模板格式），也可手动添加行。统一附件将挂载到所有需求。
    </a-alert>

    <!-- 统一附件 -->
    <div class="attachment-section">
      <span class="section-label">统一附件</span>
      <a-upload
        :custom-request="handleAttachmentUpload"
        :show-file-list="false"
        :before-upload="beforeAttachmentUpload"
        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.zip"
      >
        <a-button>
          <template #icon><icon-upload /></template>
          {{ sharedAttachment ? sharedAttachment.name : '上传统一附件' }}
        </a-button>
      </a-upload>
      <span v-if="sharedAttachment" class="attachment-info">
        <icon-file /> {{ sharedAttachment.name }}（{{ formatSize(sharedAttachment.size) }}）
        <a-link style="margin-left: 8px" @click="sharedAttachment = null">移除</a-link>
      </span>
      <span v-else class="attachment-hint">（选填，将挂载到本次所有需求）</span>
    </div>

    <a-divider />

    <!-- 操作栏 -->
    <div class="toolbar">
      <a-space>
        <a-upload
          :custom-request="handleFileUpload"
          :show-file-list="false"
          accept=".xlsx,.xls,.csv"
        >
          <a-button type="primary">
            <template #icon><icon-upload /></template>
            上传 Excel/CSV 解析
          </a-button>
        </a-upload>
        <a-button @click="addRow">
          <template #icon><icon-plus /></template>
          手动添加一行
        </a-button>
      </a-space>
      <span class="row-count">共 {{ rows.length }} 条</span>
    </div>

    <a-alert v-if="parseError" type="error" :show-icon="false" style="margin: 12px 0">
      {{ parseError }}
    </a-alert>
    <a-alert v-if="parseSuccess" type="success" :show-icon="false" style="margin: 12px 0">
      {{ parseSuccess }}
    </a-alert>

    <!-- 数据行表格 -->
    <a-table
      v-if="rows.length > 0"
      :data="rows"
      :columns="tableColumns"
      :pagination="{ pageSize: 8 }"
      :scroll="{ x: 2000 }"
      size="small"
      style="margin-top: 12px"
    >
      <template #variableEnName="{ rowIndex }">
        <a-input v-model="rows[rowIndex].variableEnName" placeholder="特征英文名" size="small" />
      </template>
      <template #variableCnName="{ rowIndex }">
        <a-input v-model="rows[rowIndex].variableCnName" placeholder="中文名" size="small" />
      </template>
      <template #fieldType="{ rowIndex }">
        <a-select v-model="rows[rowIndex].fieldType" size="small" style="width: 100%">
          <a-option value="Integer">Integer</a-option>
          <a-option value="Double">Double</a-option>
          <a-option value="Boolean">Boolean</a-option>
          <a-option value="String">String</a-option>
        </a-select>
      </template>
      <template #variableMeaning="{ rowIndex }">
        <a-input v-model="rows[rowIndex].variableMeaning" placeholder="特征含义" size="small" />
      </template>
      <template #processingLogic="{ rowIndex }">
        <a-input v-model="rows[rowIndex].processingLogic" placeholder="取数逻辑" size="small" />
      </template>
      <template #dimension="{ rowIndex }">
        <a-input v-model="rows[rowIndex].dimension" placeholder="维度" size="small" />
      </template>
      <template #dataFreshness="{ rowIndex }">
        <a-select v-model="rows[rowIndex].dataFreshness" size="small" style="width: 100%">
          <a-option value="实时">实时</a-option>
          <a-option value="离线T-1">离线T-1</a-option>
          <a-option value="离线T-2">离线T-2</a-option>
        </a-select>
      </template>
      <template #defaultValue="{ rowIndex }">
        <a-input v-model="rows[rowIndex].defaultValue" placeholder="默认值" size="small" />
      </template>
      <template #proposer="{ rowIndex }">
        <a-input v-model="rows[rowIndex].proposer" placeholder="需求人" size="small" />
      </template>
      <template #backtrackPeriod="{ rowIndex }">
        <a-input v-model="rows[rowIndex].backtrackPeriod" placeholder="回溯时间段" size="small" />
      </template>
      <template #expectedLaunchDate="{ rowIndex }">
        <a-input v-model="rows[rowIndex].expectedLaunchDate" placeholder="逾期上线时间" size="small" />
      </template>
      <template #expectedEffect="{ rowIndex }">
        <a-input v-model="rows[rowIndex].expectedEffect" placeholder="效果字段" size="small" />
      </template>
      <template #operation="{ rowIndex }">
        <a-button type="text" size="small" status="danger" @click="removeRow(rowIndex)">
          <template #icon><icon-delete /></template>
        </a-button>
      </template>
    </a-table>
    <a-empty v-else description="暂无数据，请上传文件或手动添加" style="margin: 24px 0" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import * as XLSX from 'xlsx'

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

const submitting = ref(false)
const parseError = ref('')
const parseSuccess = ref('')

// ============ 统一附件 ============
const sharedAttachment = ref<{ name: string; size: number; uploadedAt: string } | null>(null)

function formatSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

function beforeAttachmentUpload(file: any) {
  if (file.size > MAX_FILE_SIZE) {
    Message.error('文件超过 10MB 上限')
    return false
  }
  return true
}

function handleAttachmentUpload(option: any) {
  const file = option.fileItem?.file
  if (!file) return
  sharedAttachment.value = {
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  option.onSuccess?.(file)
}

// ============ 数据行 ============
interface DataRow {
  variableEnName: string
  variableCnName: string
  fieldType: string
  variableMeaning: string
  processingLogic: string
  dimension: string
  dataFreshness: string
  defaultValue: string
  proposer: string
  backtrackPeriod: string
  expectedLaunchDate: string
  expectedEffect: string
}

function createEmptyRow(): DataRow {
  return {
    variableEnName: '', variableCnName: '', fieldType: 'Integer',
    variableMeaning: '', processingLogic: '', dimension: '用户维度',
    dataFreshness: '离线T-1', defaultValue: '0', proposer: '',
    backtrackPeriod: '', expectedLaunchDate: '', expectedEffect: ''
  }
}

const rows = reactive<DataRow[]>([])

const tableColumns = [
  { title: '特征英文名', slotName: 'variableEnName', width: 200 },
  { title: '中文名', slotName: 'variableCnName', width: 160 },
  { title: '字段类型', slotName: 'fieldType', width: 120 },
  { title: '特征含义', slotName: 'variableMeaning', width: 200 },
  { title: '取数逻辑', slotName: 'processingLogic', width: 240 },
  { title: '维度', slotName: 'dimension', width: 120 },
  { title: '时效性', slotName: 'dataFreshness', width: 120 },
  { title: '默认值', slotName: 'defaultValue', width: 100 },
  { title: '需求人', slotName: 'proposer', width: 120 },
  { title: '回溯时间段', slotName: 'backtrackPeriod', width: 180 },
  { title: '逾期上线时间', slotName: 'expectedLaunchDate', width: 140 },
  { title: '效果字段', slotName: 'expectedEffect', width: 200 },
  { title: '操作', slotName: 'operation', width: 70, align: 'center' as const, fixed: 'right' as const }
]

function addRow() {
  rows.push(createEmptyRow())
}

function removeRow(idx: number) {
  rows.splice(idx, 1)
}

// ============ 文件解析（不限定模板） ============
/** 在表头中查找匹配关键词的列索引 */
function findColumnIndex(headers: string[], keywords: string[]): number {
  for (const keyword of keywords) {
    const idx = headers.findIndex(h => h.toLowerCase().includes(keyword.toLowerCase()))
    if (idx >= 0) return idx
  }
  return -1
}

function handleFileUpload(option: any) {
  const file = option.fileItem?.file
  if (!file) {
    parseError.value = '文件读取失败'
    return
  }

  const isCSV = /\.csv$/i.test(file.name)
  if (isCSV) {
    // CSV 用文本方式读取
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSVText(text)
    }
    reader.onerror = () => { parseError.value = '文件读取失败' }
    reader.readAsText(file, 'UTF-8')
  } else {
    // Excel 用 XLSX 解析
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          parseError.value = 'Excel 文件无有效工作表'
          return
        }
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' })
        parseJsonRows(json)
      } catch (err) {
        parseError.value = 'Excel 解析失败：' + (err as Error).message
      }
    }
    reader.onerror = () => { parseError.value = '文件读取失败' }
    reader.readAsArrayBuffer(file)
  }
  option.onSuccess?.(file)
}

function parseCSVText(text: string) {
  parseError.value = ''
  parseSuccess.value = ''
  try {
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    if (lines.length < 2) {
      parseError.value = '文件至少需要包含表头 + 1 条数据'
      return
    }
    const headers = lines[0].split(',').map(h => h.trim())
    const json: Record<string, any>[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: Record<string, any> = {}
      headers.forEach((h, idx) => { row[h] = values[idx] || '' })
      json.push(row)
    }
    parseJsonRows(json)
  } catch (err) {
    parseError.value = 'CSV 解析失败：' + (err as Error).message
  }
}

/** 从 JSON 行数组中提取各字段（不限定模板，按关键词匹配列名） */
function parseJsonRows(json: Record<string, any>[]) {
  if (!json.length) {
    parseError.value = '未解析到有效数据行'
    return
  }

  const allKeys = Object.keys(json[0])

  // 按关键词匹配各列
  const findKey = (patterns: RegExp): string | undefined =>
    allKeys.find(k => patterns.test(k))

  const enNameKey = findKey(/英文名|english.?name|variable.?en.?name|特征名/i)
  const cnNameKey = findKey(/中文名|chinese.?name|cn.?name|特征名/i)
  const fieldTypeKey = findKey(/字段类型|类型|field.?type|data.?type/i)
  const meaningKey = findKey(/含义|特征含义|描述|description|meaning|备注/i)
  const logicKey = findKey(/取数逻辑|加工逻辑|逻辑|processing|logic/i)
  const dimensionKey = findKey(/维度|dimension|粒度/i)
  const freshnessKey = findKey(/时效|时效性|freshness|实时|离线/i)
  const defaultKey = findKey(/默认值|default/i)
  const proposerKey = findKey(/需求人|提出人|proposer|申请人/i)
  const backtrackKey = findKey(/回溯|追溯|backtrack/i)
  const launchKey = findKey(/上线|逾期|launch|deadline|预期时间/i)
  const effectKey = findKey(/效果|预期效果|effect|expected/i)

  if (!enNameKey && !cnNameKey) {
    parseError.value = `未找到"特征英文名"或"中文名"列，请检查文件列名。当前列：${allKeys.join('、')}`
    return
  }

  const getVal = (r: Record<string, any>, key?: string) => key ? String(r[key] ?? '').trim() : ''

  const parsed: DataRow[] = json.map((r) => ({
    variableEnName: getVal(r, enNameKey),
    variableCnName: getVal(r, cnNameKey),
    fieldType: getVal(r, fieldTypeKey) || 'Integer',
    variableMeaning: getVal(r, meaningKey),
    processingLogic: getVal(r, logicKey),
    dimension: getVal(r, dimensionKey) || '用户维度',
    dataFreshness: getVal(r, freshnessKey) || '离线T-1',
    defaultValue: getVal(r, defaultKey) || '0',
    proposer: getVal(r, proposerKey),
    backtrackPeriod: getVal(r, backtrackKey),
    expectedLaunchDate: getVal(r, launchKey),
    expectedEffect: getVal(r, effectKey)
  })).filter(r => r.variableEnName || r.variableCnName)

  if (!parsed.length) {
    parseError.value = '解析到的行均为空数据'
    return
  }

  rows.splice(rows.length, 0, ...parsed)
  parseError.value = ''
  const matched = [enNameKey, cnNameKey, fieldTypeKey, meaningKey, logicKey].filter(Boolean)
  parseSuccess.value = `成功解析 ${parsed.length} 条（匹配列：${matched.join('、')}）`
  Message.success(`已添加 ${parsed.length} 条数据`)
}

// ============ 提交 ============
function onOk() {
  if (rows.length === 0) {
    Message.warning('请至少添加一条需求')
    return
  }
  // 校验：每行至少有特征英文名或中文名
  const invalid = rows.findIndex(r => !r.variableEnName.trim() && !r.variableCnName.trim())
  if (invalid >= 0) {
    Message.warning(`第 ${invalid + 1} 行：特征英文名和中文名不能同时为空`)
    return
  }

  submitting.value = true
  try {
    // 所有解析行作为 Excel 原始数据快照，挂载到每条需求
    const excelSnapshot = rows.map((r) => ({
      variableEnName: r.variableEnName,
      variableCnName: r.variableCnName,
      fieldType: r.fieldType,
      variableMeaning: r.variableMeaning,
      processingLogic: r.processingLogic,
      dimension: r.dimension,
      dataFreshness: r.dataFreshness,
      defaultValue: r.defaultValue,
      proposer: r.proposer,
      backtrackPeriod: r.backtrackPeriod,
      expectedLaunchDate: r.expectedLaunchDate,
      expectedEffect: r.expectedEffect
    }))
    const payloads = rows.map((r) => ({
      name: r.variableCnName || r.variableEnName,
      featureEnName: r.variableEnName,
      featureCnName: r.variableCnName,
      fieldType: r.fieldType,
      processingLogic: r.processingLogic,
      defaultValue: r.defaultValue,
      dataFreshness: r.dataFreshness,
      expectedEffect: r.expectedEffect,
      requirementDescription: r.variableMeaning,
      handler: r.proposer,
      attachment: sharedAttachment.value,
      excelData: excelSnapshot,
      // 保留默认值，确保 store 正常工作
      businessScene: '贷中',
      category: 'midloan_behavior',
      dataSource: 'Hbase'
    }))
    emit('ok', payloads)
  } finally {
    submitting.value = false
  }
}

function onCancel() {
  emit('cancel')
}

// 打开时重置
watch(
  () => props.visible,
  (v) => {
    if (v) {
      rows.splice(0, rows.length)
      sharedAttachment.value = null
      parseError.value = ''
      parseSuccess.value = ''
    }
  }
)
</script>

<style scoped>
.attachment-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.section-label {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}
.attachment-info {
  color: var(--color-text-3);
  font-size: 13px;
}
.attachment-hint {
  color: var(--color-text-4);
  font-size: 13px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.row-count {
  color: var(--color-text-3);
  font-size: 13px;
}
</style>
