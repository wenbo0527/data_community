<template>
  <div class="sign-report-detail">
    <a-page-header :title="isCreate ? '新增签报' : (report?.reportNo || '签报详情')" @back="goBack" />

    <a-spin :loading="loading && !isCreate" style="width: 100%">
      <a-space direction="vertical" fill style="width: 100%">
        <!-- 签报基础信息 -->
        <a-card title="签报信息" :bordered="true">
          <!-- 创建模式：可编辑表单 -->
          <a-form v-if="isCreate" ref="baseFormRef" :model="createForm" :rules="createRules" layout="vertical">
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item field="reportNo" label="签报号" required>
                  <a-input v-model="createForm.reportNo" placeholder="示例：签报〔2026〕69号" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="reportDate" label="签报日期" required>
                  <a-date-picker v-model="createForm.reportDate" style="width: 100%" placeholder="选择日期" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item field="title" label="签报标题" required>
              <a-input v-model="createForm.title" placeholder="示例：关于采购朴道低利率客群风险前筛数据服务项目的请示" />
            </a-form-item>
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item field="totalAmount" label="签报金额（元）" required>
                  <a-input-number v-model="createForm.totalAmount" :min="0" :step="1000" style="width: 100%" placeholder="签报总金额" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="initiator" label="签报发起人">
                  <a-input v-model="createForm.initiator" placeholder="非必填" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <!-- 编辑模式：只读展示（R18: 签报号自动填充，不可编辑） -->
          <a-descriptions v-else :column="3" :data="[
            { label: '签报号', value: report?.reportNo || '—' },
            { label: '签报标题', value: report?.title || '—' },
            { label: '签报金额（元）', value: formatAmount(report?.totalAmount) },
            { label: '签报日期', value: report?.reportDate || '—' },
            { label: '签报发起人', value: report?.initiator || '—' },
            { label: '创建时间', value: formatDate(report?.createdAt) }
          ]" />
        </a-card>

        <!-- 合作机构分摊明细 -->
        <a-card title="合作机构分摊明细" :bordered="true">
          <template #extra>
            <a-space>
              <span style="color: var(--color-text-3); font-size: 12px;">
                分摊金额合计：{{ formatAmount(sumNoticeAmount) }}
                <template v-if="report || isCreate"> / 签报金额：{{ formatAmount(isCreate ? createForm.totalAmount : report?.totalAmount) }}</template>
              </span>
              <a-button type="primary" size="small" @click="addPartnerOrg">添加合作机构</a-button>
            </a-space>
          </template>

          <a-table :data="partnerOrgs" :pagination="false" row-key="_key">
            <template #columns>
              <a-table-column title="合作机构" :width="260">
                <template #cell="{ record }">
                  <a-select v-model="record.partnerOrg" allow-search allow-clear placeholder="选择合作机构" style="width: 100%">
                    <a-option v-for="name in partnerOrgNames" :key="name" :value="name">{{ name }}</a-option>
                  </a-select>
                </template>
              </a-table-column>
              <a-table-column title="统一社会信用代码" :width="200">
                <template #cell="{ record }">
                  <a-input v-model="record.creditCode" placeholder="91110105MA01YFE547" />
                </template>
              </a-table-column>
              <a-table-column title="签报/成交通知书金额（元）" :width="200">
                <template #cell="{ record }">
                  <a-input-number v-model="record.noticeAmount" :min="0" :step="1000" style="width: 100%" placeholder="该合作机构分摊金额" />
                </template>
              </a-table-column>
              <a-table-column title="签报初始占用金额（元）" :width="200">
                <template #cell="{ record }">
                  <a-input-number v-model="record.initialOccupiedAmount" :min="0" :step="1000" style="width: 100%" placeholder="默认0" />
                </template>
              </a-table-column>
              <a-table-column title="附件" :width="240">
                <template #cell="{ record }">
                  <a-upload
                    :file-list="record._fileList"
                    :auto-upload="false"
                    accept=".doc,.docx,.pdf"
                    :before-upload="(file: any) => { onAttachmentSelect(file, record); return false }"
                    @remove="(file: any) => onAttachmentRemove(file, record)"
                    multiple
                    :show-file-list="true"
                  />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="80" fixed="right">
                <template #cell="{ rowIndex }">
                  <a-button type="text" status="danger" size="small" @click="removePartnerOrg(rowIndex)">删除</a-button>
                </template>
              </a-table-column>
            </template>
            <template #empty><a-empty description="暂无合作机构，请点击「添加合作机构」" /></template>
          </a-table>

          <!-- 金额校验提示 -->
          <a-alert
            v-if="(report || isCreate) && partnerOrgs.length > 0"
            :type="amountValid ? 'success' : 'warning'"
            style="margin-top: 12px"
            :message="amountValid ? '分摊金额合计与签报金额一致' : `分摊金额合计(${formatAmount(sumNoticeAmount)})与签报金额(${formatAmount(currentTotalAmount)})不一致，差额${formatAmount(Math.abs(currentTotalAmount - sumNoticeAmount))}元`"
          />
        </a-card>

        <!-- 操作按钮 -->
        <div style="text-align: right">
          <a-space>
            <a-button @click="goBack">返回列表</a-button>
            <a-button type="primary" :loading="saving" @click="saveDetail">保存</a-button>
          </a-space>
        </div>
      </a-space>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useSignReportStore } from '../stores/signReport'
import { partnerOrgNames } from '../api/supplierDictionary'
import DateUtils from '@/utils/dateUtils'

const route = useRoute()
const router = useRouter()
const store = useSignReportStore()

// 判断是否为创建模式
const isCreate = computed(() => route.name === 'RiskBudgetSignReportCreate' || String(route.params.id || '') === 'new')

const loading = computed(() => store.loading)
const saving = ref(false)
const report = computed(() => store.detail)

// 创建模式表单
const baseFormRef = ref()
const createForm = reactive<{ reportNo: string; title: string; totalAmount: number | undefined; reportDate: string; initiator: string }>({
  reportNo: '', title: '', totalAmount: undefined, reportDate: '', initiator: ''
})
const createRules = {
  reportNo: [{ required: true, message: '请输入签报号' }],
  title: [{ required: true, message: '请输入签报标题' }],
  totalAmount: [{ required: true, message: '请输入签报金额' }],
  reportDate: [{ required: true, message: '请选择签报日期' }]
}

// 合作机构分摊明细（可编辑）
const partnerOrgs = reactive<any[]>([])

const currentTotalAmount = computed(() => isCreate.value ? Number(createForm.totalAmount || 0) : Number(report.value?.totalAmount || 0))
const sumNoticeAmount = computed(() =>
  partnerOrgs.reduce((sum, r) => sum + (Number(r.noticeAmount) || 0), 0)
)
// R7: V2 签报校验 - partnerOrgs 为空但签报金额>0 时应阻断
const amountValid = computed(() => {
  const totalAmt = currentTotalAmount.value
  // 创建模式下签报金额必填后必须有至少一家合作机构
  if (partnerOrgs.length === 0) return totalAmt === 0
  if (isCreate.value && !createForm.totalAmount) return false
  if (!isCreate.value && !report.value) return true
  return Math.abs(totalAmt - sumNoticeAmount.value) < 0.01
})

const addPartnerOrg = () => {
  partnerOrgs.push({
    _key: `org-${Date.now()}-${partnerOrgs.length}`,
    partnerOrg: '',
    creditCode: '',
    noticeAmount: undefined,
    initialOccupiedAmount: 0,
    attachments: [],
    _fileList: []
  })
}
const removePartnerOrg = (idx: number) => { partnerOrgs.splice(idx, 1) }

// PRD E4: 限制上传文件类型为.word/.pdf
const onAttachmentSelect = (file: any, record: any) => {
  const okType = /\.docx?$|\.pdf$/i.test(file.name)
  if (!okType) {
    Message.error('仅支持上传 .word / .pdf 文件')
    return false
  }
  if (!record._fileList) record._fileList = []
  record._fileList.push({ uid: file.uid, name: file.name, url: '' })
  if (!record.attachments) record.attachments = []
  record.attachments.push(file.name)
  return false
}
const onAttachmentRemove = (file: any, record: any) => {
  if (record._fileList) {
    const idx = record._fileList.findIndex((f: any) => f.uid === file.uid || f.name === file.name)
    if (idx >= 0) record._fileList.splice(idx, 1)
  }
  if (record.attachments) {
    const aidx = record.attachments.indexOf(file.name)
    if (aidx >= 0) record.attachments.splice(aidx, 1)
  }
  return true
}

const goBack = () => router.push('/budget/sign-reports')

const saveDetail = async () => {
  // 创建模式：先校验基础表单
  if (isCreate.value) {
    try { await baseFormRef.value?.validate() } catch { Message.error('请完整填写必填项'); return }
    if (!createForm.reportNo || !createForm.title || !createForm.totalAmount || !createForm.reportDate) {
      Message.error('必填项不能为空'); return
    }
  }

  // 校验合作机构必填项
  for (const org of partnerOrgs) {
    if (!org.partnerOrg) { Message.error('请填写合作机构'); return }
    if (!org.creditCode) { Message.error('请填写统一社会信用代码'); return }
    if (org.noticeAmount === undefined || org.noticeAmount === null) { Message.error('请填写签报/成交通知书金额'); return }
    if (org.initialOccupiedAmount === undefined || org.initialOccupiedAmount === null) { Message.error('请填写签报初始占用金额'); return }
  }

  // PRD V2: 签报总金额 ≥ Σ(签报/成交通知书金额)
  if (partnerOrgs.length > 0 && !amountValid.value) {
    const diff = currentTotalAmount.value - sumNoticeAmount.value
    Message.error(`签报总金额不足，差额${formatAmount(Math.abs(diff))}元`)
    return
  }

  saving.value = true
  try {
    const payload = partnerOrgs.map(o => ({
      partnerOrg: o.partnerOrg,
      creditCode: o.creditCode,
      noticeAmount: Number(o.noticeAmount) || 0,
      initialOccupiedAmount: Number(o.initialOccupiedAmount) || 0,
      attachments: o.attachments || []
    }))

    if (isCreate.value) {
      // 创建模式：新建签报
      // R3: 直接通过 API 拿到 id 跳转，避免 store.list[0] 异步竞争
      const { createSignReport: apiCreate } = await import('../api/signReport')
      const created = await apiCreate({
        reportNo: createForm.reportNo,
        title: createForm.title,
        totalAmount: Number(createForm.totalAmount),
        reportDate: createForm.reportDate,
        initiator: createForm.initiator,
        partnerOrgs: payload
      })
      if (created?.id) {
        Message.success('签报创建成功')
        router.replace(`/budget/sign-reports/${created.id}`)
      } else {
        Message.error('创建失败')
      }
    } else {
      // 编辑模式：更新合作机构明细
      if (!report.value) return
      await store.update(report.value.id, { partnerOrgs: payload })
      Message.success('保存成功')
    }
  } catch {
    Message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const formatAmount = (n?: number) => {
  if (n === undefined || n === null) return '—'
  return Number(n).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
}
const formatDate = (d?: string) => { try { return DateUtils.formatDateTime(d || '') } catch { return '—' } }

onMounted(async () => {
  if (isCreate.value) {
    // 创建模式：不需要加载数据
    return
  }
  const id = String(route.params.id || '')
  if (!id) { Message.error('缺少签报ID'); return }
  await store.fetchDetail(id)
  if (report.value?.partnerOrgs?.length) {
    partnerOrgs.splice(0)
    report.value.partnerOrgs.forEach((o: any, idx: number) => {
      partnerOrgs.push({
        _key: `org-${idx}`,
        partnerOrg: o.partnerOrg || '',
        creditCode: o.creditCode || '',
        noticeAmount: o.noticeAmount,
        initialOccupiedAmount: o.initialOccupiedAmount ?? 0,
        attachments: o.attachments || [],
        _fileList: (o.attachments || []).map((name: string, i: number) => ({ uid: `existing-${idx}-${i}`, name, url: '' }))
      })
    })
  }
})
</script>

<style scoped>
.sign-report-detail { width: 100%; }
</style>
