<!--
  特征评估 Tab（v3 精简版）
  - 关联分析报告
  - 分支报告（Excel 上传 + 历史记录）
  - 关联外数评估中心
-->
<template>
  <div class="tab-content">
    <!-- ============ 1. 关联分析报告 ============ -->
    <a-card title="关联分析报告" class="detail-card">
      <a-table :data="analysisReports" :columns="analysisReportColumns" row-key="id" :pagination="false">
        <template #source="{ record }">
          <a-tag v-if="record.source === 'risk-app'" color="arcoblue">外数评估中心</a-tag>
          <a-tag v-else-if="record.source === 'dmt-app'" color="green">特征评估</a-tag>
          <a-tag v-else color="purple">分支报告</a-tag>
        </template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="$emit('view-report', record)">查看</a-button>
            <a-button v-if="record.url" type="text" size="small" @click="$emit('copy-link', record)">复制链接</a-button>
          </a-space>
        </template>
        <template #empty><a-empty description="暂无关联报告" /></template>
      </a-table>
    </a-card>

    <!-- ============ 2. 分支报告（Excel 上传）============ -->
    <a-card title="分支报告" class="detail-card">
      <a-alert type="info" :show-icon="false" style="margin-bottom: 12px">
        分支报告用于记录离线/分支维度的评估结果（如某次专项分析、灰度评估、回溯分析）。
        支持上传 .xlsx/.xls/.csv 格式的 Excel 报告附件，上传后可下载/查看/删除。
      </a-alert>

      <a-upload
        :custom-request="customUpload"
        :before-upload="beforeUpload"
        :show-file-list="false"
        accept=".xlsx,.xls,.csv"
        @change="onUploadChange"
      >
        <a-space>
          <a-button type="primary">
            <icon-upload /> 上传 Excel 报告
          </a-button>
          <span class="upload-hint">支持 .xlsx / .xls / .csv，单文件不超过 10MB</span>
        </a-space>
      </a-upload>

      <a-divider style="margin: 12px 0">已上传的分支报告</a-divider>

      <a-table
        :data="branchReports"
        :columns="branchReportColumns"
        row-key="id"
        :pagination="false"
        size="small"
      >
        <template #size="{ record }">{{ formatSize(record.size) }}</template>
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="downloadBranchReport(record)">下载</a-button>
            <a-button type="text" size="small" status="danger" @click="removeBranchReport(record)">删除</a-button>
          </a-space>
        </template>
        <template #empty><a-empty description="暂无分支报告" /></template>
      </a-table>
    </a-card>

    <!-- ============ 3. 关联外数评估中心 ============ -->
    <a-card title="关联外数评估中心" class="detail-card">
      <template v-if="isExternal">
        <a-row v-if="isExternalLinked" :gutter="12" align="center">
          <a-col :span="16">
            <a-alert type="success" :show-icon="false">
              已关联外数评估中心，评估单号：
              <strong>{{ externalEvalId }}</strong>
              ，点击下方按钮可在外数评估中心查看完整评估结果与报告。
            </a-alert>
          </a-col>
          <a-col :span="8" style="text-align: right">
            <a-space>
              <a-button type="primary" @click="openExternalEvaluation">
                <icon-link /> 前往外数评估中心
              </a-button>
              <a-button status="danger" @click="unlinkExternalEvaluation">解除关联</a-button>
            </a-space>
          </a-col>
        </a-row>
        <a-row v-else :gutter="12" align="center">
          <a-col :span="16">
            <a-alert type="warning" :show-icon="false">
              当前特征来自外数来源，尚未关联外数评估中心。点击下方按钮跳转到外数评估中心完成评估后将自动回填关联。
            </a-alert>
          </a-col>
          <a-col :span="8" style="text-align: right">
            <a-button type="primary" @click="linkExternalEvaluation">
              <icon-link /> 关联外数评估中心
            </a-button>
          </a-col>
        </a-row>
      </template>
      <a-empty v-else description="当前特征非外数来源，无需关联外数评估中心" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'

interface Props {
  /** 兼容旧版（保留 evaluationInfo 但不再渲染）*/
  evaluationInfo?: any[]
  analysisReports: any[]
  analysisReportColumns: any[]
  /** 是否外数来源 */
  isExternal?: boolean
  /** 是否已关联外数评估 */
  isExternalLinked?: boolean
  /** 外数评估单号 */
  externalEvalId?: string
  /** 跳转外数评估中心回调 */
  onOpenExternalEvaluation?: () => void
  /** 解除外数评估关联回调 */
  onUnlinkExternalEvaluation?: () => void
  /** 关联外数评估回调（生成新的评估单号）*/
  onLinkExternalEvaluation?: () => Promise<string> | string
  /** 用于唯一标识分支报告（通常为特征ID）*/
  branchStorageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  evaluationInfo: () => [],
  isExternal: false,
  isExternalLinked: false,
  externalEvalId: '',
  branchStorageKey: 'branch-reports:default'
})

defineEmits<{
  (e: 'view-report', record: any): void
  (e: 'copy-link', record: any): void
}>()

// ============ 分支报告 ============
interface BranchReport {
  id: string
  name: string
  size: number
  uploadedAt: string
  uploader: string
  remark?: string
}

const branchReports = ref<BranchReport[]>([])

function loadBranchReports() {
  try {
    const raw = localStorage.getItem(props.branchStorageKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) branchReports.value = parsed
    }
  } catch {
    // ignore
  }
}

function saveBranchReports() {
  try {
    localStorage.setItem(props.branchStorageKey, JSON.stringify(branchReports.value))
  } catch {
    // ignore
  }
}

watch(() => props.branchStorageKey, () => loadBranchReports(), { immediate: true })

// 文件大小格式化
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// 上传前的校验
function beforeUpload(file: any) {
  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    Message.error(`文件大小超过 10MB 上限`)
    return false
  }
  const name = file.name.toLowerCase()
  if (!/\.(xlsx|xls|csv)$/.test(name)) {
    Message.error('仅支持 .xlsx / .xls / .csv 格式')
    return false
  }
  return true
}

function onUploadChange(_fileList: any) {
  // 真实附件已通过 customRequest 保存到 localStorage
}

const uploading = ref(false)

/** 自定义上传（mock：保存文件信息到 localStorage）*/
function customUpload(option: any) {
  const file = option.fileItem?.file
  if (!file) return
  uploading.value = true
  // 模拟异步
  setTimeout(() => {
    const item: BranchReport = {
      id: `BR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      uploader: '小李',
      remark: ''
    }
    branchReports.value = [item, ...branchReports.value]
    saveBranchReports()
    uploading.value = false
    Message.success(`已上传：${file.name}`)
    // 把新分支报告也作为分析报告同步到关联分析报告区
    option.onSuccess?.(item)
  }, 400)
}

function downloadBranchReport(record: BranchReport) {
  // mock 下载：生成一个空 CSV 并下载
  const blob = new Blob(['评估指标,数值\n示例,仅作演示\n'], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = record.name.replace(/\.(xlsx|xls)$/, '.csv')
  a.click()
  URL.revokeObjectURL(a.href)
  Message.success(`已触发下载：${record.name}`)
}

function removeBranchReport(record: BranchReport) {
  Modal.confirm({
    title: '确认删除分支报告？',
    content: `删除后无法恢复：「${record.name}」`,
    okText: '确认删除',
    cancelText: '取消',
    okButtonProps: { status: 'danger' },
    onOk: () => {
      branchReports.value = branchReports.value.filter(r => r.id !== record.id)
      saveBranchReports()
      Message.success('已删除')
    }
  })
}

const branchReportColumns = [
  { title: '文件名', dataIndex: 'name', ellipsis: true },
  { title: '大小', dataIndex: 'size', slotName: 'size', width: 100 },
  { title: '上传人', dataIndex: 'uploader', width: 100 },
  { title: '上传时间', dataIndex: 'uploadedAt', width: 180 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 160 }
]

// ============ 关联外数评估中心 ============
function openExternalEvaluation() {
  if (props.onOpenExternalEvaluation) {
    props.onOpenExternalEvaluation()
  } else {
    Message.info('跳转回调未配置')
  }
}

function unlinkExternalEvaluation() {
  Modal.confirm({
    title: '确认解除关联？',
    content: '解除后将无法在特征评估页直接查看外数评估结果。',
    okText: '确认解除',
    cancelText: '取消',
    okButtonProps: { status: 'danger' },
    onOk: () => {
      props.onUnlinkExternalEvaluation?.()
      Message.success('已解除关联')
    }
  })
}

async function linkExternalEvaluation() {
  Modal.confirm({
    title: '关联外数评估中心？',
    content: '点击确认后将跳转外数评估中心完成评估，完成后系统将自动回填关联信息。',
    okText: '前往关联',
    cancelText: '取消',
    onOk: async () => {
      try {
        const id = await (props.onLinkExternalEvaluation?.() || Promise.resolve(`EXT-EVAL-${Date.now()}`))
        Message.success(`已生成评估单号：${id}，关联建立完成`)
      } catch (e: any) {
        Message.error(e?.message || '关联失败')
      }
    }
  })
}

// ============ 关联外数评估中心（end）============
</script>

<style scoped lang="less">
.eval-cell {
  background: var(--color-fill-1);
  border-radius: 4px;
  padding: 12px;
  text-align: center;

  .eval-label {
    color: var(--color-text-3);
    font-size: 13px;
    margin-bottom: 6px;
  }

  .eval-value {
    margin: 4px 0;

    .big {
      font-size: 28px;
      font-weight: 600;
      color: var(--color-text-1);
    }

    .unit {
      font-size: 14px;
      color: var(--color-text-3);
      margin-left: 2px;
    }
  }

  .eval-foot {
    font-size: 12px;
    color: var(--color-text-3);
  }

  &.mini {
    padding: 8px;

    .eval-value .big {
      font-size: 22px;
    }
  }

  &.eval-state {
    .eval-value :deep(.arco-tag) {
      font-size: 14px;
      padding: 4px 12px;
    }
  }
}

.upload-hint {
  color: var(--color-text-3);
  font-size: 12px;
}
</style>