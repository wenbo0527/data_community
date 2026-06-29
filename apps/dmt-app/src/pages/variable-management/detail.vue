<template>
  <div class="variable-detail-page">
    <div class="page-header">
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item @click="handleBackToList">变量中心</a-breadcrumb-item>
        <a-breadcrumb-item>变量详情</a-breadcrumb-item>
      </a-breadcrumb>

      <div class="header-content">
        <div class="title-section">
          <div class="title-wrapper">
            <h1 class="title">{{ variableData.name || '变量详情' }}</h1>
            <a-tag :color="getStatusColor(variableData.status)" class="status-tag" size="medium">{{ getStatusLabel(variableData.status) }}</a-tag>
          </div>

          <!-- 横向字段带：核心 / 辅助各占一行，每行内字段平均分布，呼吸感更足 -->
          <ParamGroup :items="headerInfo" :columns="4" :gap="20" />

          <!-- 描述：整行展示，2 行省略，避免逐字换行 -->
          <ParamGroup :items="descriptionInfo" :columns="1" :gap="0" class="header-description-group">
            <template #item-0="{ item }">
              <a-typography-paragraph
                :ellipsis="{ rows: 2, showTooltip: true, expandable: true }"
                style="margin: 0"
              >
                {{ item.value }}
              </a-typography-paragraph>
            </template>
          </ParamGroup>
        </div>

        <div class="actions">
          <a-button @click="handleBackToList">
            <template #icon><IconArrowLeft /></template>
            返回列表
          </a-button>
          <a-button type="outline" @click="handleDerive">
            <template #icon><IconCopy /></template>
            衍生
          </a-button>
          <a-button type="outline" @click="openGovernanceDrawer('accompany')">
            <template #icon><IconDriveFile /></template>
            陪跑
          </a-button>
          <a-button type="outline" @click="openGovernanceDrawer('evaluation')">
            <template #icon><IconExperiment /></template>
            评估
          </a-button>
          <a-button
            v-if="['draft', 'pending'].includes(String(variableData.status || ''))"
            type="primary"
            @click="openEnableApproval"
          >
            <template #icon><IconExperiment /></template>
            提交上线申请
          </a-button>
          <a-button type="primary" @click="handleEdit">
            <template #icon><IconEdit /></template>
            编辑
          </a-button>
          <a-dropdown trigger="click" @select="handleMoreSelect">
            <a-button>更多</a-button>
            <template #content>
              <a-doption value="toggle">{{ variableData.status === 'active' ? '停用' : '启用' }}</a-doption>
              <a-doption value="delete">删除</a-doption>
            </template>
          </a-dropdown>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <a-tabs v-model:active-key="activeTab" class="detail-tabs">
        <a-tab-pane key="basic" title="变量基础信息">
          <div class="tab-content">
            <ParamGroup title="基本属性" :items="basicInfo" :columns="3" />

            <ParamGroup title="技术属性" :items="technicalInfo" :columns="3" />

            <ParamGroup :title="typedProfileTitle" :items="typedProfileInfo" :columns="3" />

            <a-card title="质量指标" class="detail-card">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="quality-item">
                    <div class="quality-label">数据质量</div>
                    <div class="quality-value">
                      <a-progress
                        :percent="variableData.dataQuality"
                        :color="getQualityColor(variableData.dataQuality)"
                        size="large"
                      />
                      <span class="quality-text">{{ variableData.dataQuality }}%</span>
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="quality-item">
                    <div class="quality-label">缺失率</div>
                    <div class="quality-value">
                      <a-progress
                        :percent="variableData.missingRate"
                        status="exception"
                        size="large"
                      />
                      <span class="quality-text">{{ variableData.missingRate }}%</span>
                    </div>
                  </div>
                </a-col>
              </a-row>
              <a-row :gutter="16" style="margin-top: 16px;">
                <a-col :span="12">
                  <div class="quality-item">
                    <div class="quality-label">唯一值数量</div>
                    <div class="quality-value">
                      <span class="quality-number">{{ variableData.uniqueValueCount }}</span>
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="quality-item">
                    <div class="quality-label">更新频率</div>
                    <div class="quality-value">
                      <span class="quality-text">{{ variableData.updateFrequency }}</span>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </a-card>

            <a-card title="变量定义" class="detail-card">
              <div class="definition-content">
                {{ variableData.definition || '暂无定义' }}
              </div>
            </a-card>
          </div>
        </a-tab-pane>

        <a-tab-pane key="evaluation" title="变量评估">
          <div class="tab-content">
            <a-card title="评估概览" class="detail-card">
              <a-descriptions :data="evaluationInfo" :column="2" bordered />
            </a-card>

            <a-card title="关联分析报告" class="detail-card">
              <a-table :data="analysisReports" :columns="analysisReportColumns" row-key="id" :pagination="false">
                <template #source="{ record }">
                  <a-tag v-if="record.source === 'risk-app'" color="arcoblue">risk</a-tag>
                  <a-tag v-else color="green">dmt</a-tag>
                </template>
                <template #actions="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="handleViewAnalysisReport(record)">查看</a-button>
                    <a-button v-if="record.url" type="text" size="small" @click="handleCopyReportLink(record)">复制链接</a-button>
                  </a-space>
                </template>
                <template #empty><a-empty description="暂无关联报告" /></template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>

        <a-tab-pane key="governance" title="治理与生命周期">
          <div class="tab-content">
            <a-card title="生命周期阶段" class="detail-card">
              <a-descriptions :column="2" :data="lifecycleHeader" bordered />
              <a-divider style="margin: 12px 0" />
              <a-table :data="lifecycleStages" :pagination="false">
                <template #columns>
                  <a-table-column title="阶段" data-index="stage" :width="160" />
                  <a-table-column title="状态" :width="120">
                    <template #cell="{ record }"><a-tag :status="record.status==='completed'?'success':(record.status==='in_progress'?'warning':'default')">{{ record.statusLabel }}</a-tag></template>
                  </a-table-column>
                  <a-table-column title="开始时间" data-index="startDate" :width="160" />
                  <a-table-column title="结束时间" data-index="endDate" :width="160" />
                  <a-table-column title="说明" data-index="description" />
                </template>
                <template #empty><a-empty description="暂无阶段数据" /></template>
              </a-table>
            </a-card>

            <a-card title="评估与效果" class="detail-card">
              <a-descriptions :column="2" :data="effectSummary" bordered />
            </a-card>
          </div>
        </a-tab-pane>

        <a-tab-pane key="source" title="来源与血缘">
          <div class="tab-content">
            <a-card title="数据源信息" class="detail-card">
              <a-descriptions :data="sourceInfo" :column="2" bordered />
            </a-card>

            <a-card v-if="isExternalSource && hasAnyExternalRef" title="外数关联" class="detail-card">
              <a-space wrap>
                <a-button v-if="hasExternalArchive" type="primary" @click="openRiskExternalArchive">查看外数档案</a-button>
                <a-button v-if="hasExternalEvaluation" @click="openRiskExternalEvaluation">查看外数评估</a-button>
                <a-button v-if="hasExternalLifecycle" @click="openRiskExternalLifecycle">查看外数生命周期</a-button>
                <a-button @click="openRiskExternalService">查看外数服务</a-button>
              </a-space>
            </a-card>

            <a-card title="字段映射" class="detail-card">
              <a-table
                :data="fieldMappingData"
                :columns="fieldMappingColumns"
                row-key="id"
                :pagination="false"
              >
                <template #status="{ record }">
                  <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                    {{ record.status === 'active' ? '正常' : '异常' }}
                  </a-tag>
                </template>
              </a-table>
            </a-card>

            <a-card title="数据血缘" class="detail-card">
              <LineageGraph
                class="lineage-graph"
                :table-name="variableData.code || variableData.name || '变量'"
                :layers="2"
                :data-types="['Variable', 'Table', 'Metric', 'API']"
                :upstream="upstreamLineage"
                :downstream="downstreamLineage"
              />
            </a-card>
          </div>
        </a-tab-pane>

        <a-tab-pane key="usage" title="使用与分发">
          <div class="tab-content">
            <a-card title="使用统计" class="detail-card">
              <a-row :gutter="16">
                <a-col :span="6">
                  <div class="usage-stat">
                    <div class="stat-number">{{ usageStats.total }}</div>
                    <div class="stat-label">总使用次数</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="usage-stat">
                    <div class="stat-number">{{ usageStats.metrics }}</div>
                    <div class="stat-label">指标引用</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="usage-stat">
                    <div class="stat-number">{{ usageStats.models }}</div>
                    <div class="stat-label">模型使用</div>
                  </div>
                </a-col>
                <a-col :span="6">
                  <div class="usage-stat">
                    <div class="stat-number">{{ usageStats.reports }}</div>
                    <div class="stat-label">报表引用</div>
                  </div>
                </a-col>
              </a-row>
            </a-card>

            <a-card title="使用场景列表" class="detail-card">
              <a-table
                :data="usageScenarios"
                :columns="usageColumns"
                row-key="id"
                :pagination="usagePagination"
                @page-change="handleUsagePageChange"
              >
                <template #type="{ record }">
                  <a-tag :color="getUsageTypeColor(record.type)">
                    {{ getUsageTypeLabel(record.type) }}
                  </a-tag>
                </template>
                <template #actions="{ record }">
                  <a-space>
                    <a-button type="text" size="small" @click="handleViewUsage(record)">
                      查看
                    </a-button>
                    <a-button type="text" size="small" @click="handleGotoUsage(record)">
                      跳转
                    </a-button>
                  </a-space>
                </template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>

        <a-tab-pane key="versions" title="变更记录">
          <div class="tab-content">
            <a-card title="版本列表" class="detail-card">
              <a-table
                :data="versionList"
                :columns="versionColumns"
                row-key="id"
                :pagination="versionPagination"
                @page-change="handleVersionPageChange"
              >
                <template #version="{ record }">
                  <div class="version-info">
                    <div class="version-number">{{ record.version }}</div>
                    <a-tag v-if="record.isCurrent" color="green">当前版本</a-tag>
                  </div>
                </template>
                <template #changes="{ record }">
                  <div class="changes-content">
                    <div v-for="change in record.changes" :key="change" class="change-item">
                      • {{ change }}
                    </div>
                  </div>
                </template>
                <template #actions="{ record }">
                  <a-space>
                    <a-button 
                      v-if="!record.isCurrent" 
                      type="text" 
                      size="small" 
                      @click="handleCompareVersion(record)"
                    >
                      对比
                    </a-button>
                    <a-button 
                      v-if="!record.isCurrent" 
                      type="text" 
                      size="small" 
                      status="warning"
                      @click="handleRollbackVersion(record)"
                    >
                      回滚
                    </a-button>
                  </a-space>
                </template>
              </a-table>
            </a-card>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <a-drawer v-model:visible="enableApprovalVisible" title="启用审批（提交上线申请）" :width="640">
      <a-form :model="enableApprovalForm" layout="vertical">
        <a-form-item label="变量名称">
          <a-input :model-value="variableData.name" disabled />
        </a-form-item>
        <a-form-item label="变量编码">
          <a-input :model-value="variableData.code" disabled />
        </a-form-item>
        <a-form-item field="reason" label="启用原因" required>
          <a-textarea v-model="enableApprovalForm.reason" placeholder="请输入启用原因" :max-length="200" show-word-limit />
        </a-form-item>
        <a-form-item field="expectedOnlineTime" label="期望生效时间">
          <a-input v-model="enableApprovalForm.expectedOnlineTime" placeholder="例如：2026-06-25 18:00:00" />
        </a-form-item>
        <a-form-item field="approver" label="审批人" required>
          <a-select v-model="enableApprovalForm.approver" placeholder="请选择审批人">
            <a-option value="risk_data_lead">风险数据负责人</a-option>
            <a-option value="data_app_lead">数据应用负责人</a-option>
            <a-option value="dmt_admin">数据管理管理员</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model="enableApprovalForm.remark" placeholder="可选：补充说明" :max-length="200" show-word-limit />
        </a-form-item>
      </a-form>

      <a-alert type="info" :show-icon="false" style="margin-top: 8px">
        提交后 Demo 流程：自动通过审批 → 状态置为「已发布」→ 变量进入运营监控阶段。真实生产需走 OA 审批。
      </a-alert>

      <a-divider style="margin: 12px 0" />
      <a-space>
        <a-button @click="enableApprovalVisible = false">取消</a-button>
        <a-button type="primary" :loading="enableApprovalSubmitting" @click="submitEnableApproval">发起审批</a-button>
      </a-space>
    </a-drawer>

    <a-modal v-model:visible="reportPreviewVisible" :title="reportPreviewTitle" :footer="false" width="720px">
      <a-descriptions :data="reportPreviewMeta" :column="2" bordered />
      <a-divider />
      <a-table :data="reportPreviewFindings" :pagination="false" row-key="id">
        <template #columns>
          <a-table-column title="结论项" data-index="item" />
          <a-table-column title="结果" data-index="result" :width="160" />
          <a-table-column title="说明" data-index="desc" />
        </template>
        <template #empty><a-empty description="暂无内容" /></template>
      </a-table>
    </a-modal>

    <a-modal v-model:visible="deriveVisible" title="衍生变量（Demo）" ok-text="继续" cancel-text="取消" @ok="confirmDerive">
      <a-space direction="vertical" fill>
        <a-alert type="info" :show-icon="false">
          衍生变量可选择“发起探索课题”沉淀过程证据链，或“直接上线”进入上线与治理流程。
        </a-alert>
        <a-form :model="deriveForm" layout="vertical">
          <a-form-item label="新变量名称">
            <a-input v-model="deriveForm.name" allow-clear placeholder="例如：xxx_衍生" />
          </a-form-item>
          <a-form-item label="路径选择">
            <a-radio-group v-model="deriveForm.mode">
              <a-radio value="topic">发起探索课题</a-radio>
              <a-radio value="online">直接上线</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </a-space>
    </a-modal>

    <GovernanceActionDrawer
      v-model="governanceVisible"
      context-type="variable"
      :context-id="String(variableId)"
      :context-name="variableData.name"
      :default-tab="governanceDefaultTab"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { useVariableStore } from '@/store/modules/variable'
import { buildRiskAppUrl } from '@/utils/appLinks'
import { LineageGraph } from '@app/lineage-graph'
import { IconArrowLeft, IconEdit, IconCopy, IconDriveFile, IconExperiment } from '@arco-design/web-vue/es/icon'
import { PROFILE_FIELD_SCHEMAS, LIFECYCLE_SUPPLEMENT_GUIDE } from '@/mock/variable-management/profile-schemas'
import { VariableDraftStore } from '@/mock/variable-management/variable-draft-store'
import { VariableStatusStore } from '@/mock/variable-management/variable-status-store'
import { ExploreStore } from '@/mock/explore/explore-store'
import GovernanceActionDrawer from '@/components/common/GovernanceActionDrawer.vue'
import ParamGroup from '@/components/common/ParamGroup.vue'

const router = useRouter()
const route = useRoute()
const variableStore = useVariableStore()
const variableId = computed(() => String(route.params.id || ''))

// 当前激活的标签页
const activeTab = ref('basic')

// 头部辅助信息（创建人/更新时间）默认折叠，避免首屏过密
const headerInfoExpanded = ref([])

// 变量数据
const variableData = computed(() => variableStore.currentVariable || {
  id: '',
  name: '',
  code: '',
  type: '',
  status: '',
  description: '',
  dataSource: '',
  dataSourceName: '',
  sourceField: '',
  updateFrequency: '',
  dataQuality: 0,
  missingRate: 0,
  uniqueValueCount: 0,
  definition: '',
  creator: '',
  createdAt: '',
  updatedAt: '',
  sourceType: '',
  sourceRefs: {},
  category: '',
  profile: {}
})

const variableCategory = computed(() => {
  const v = variableStore.currentVariable || {}
  if (v.category) return v.category
  if (v.sourceType === 'credit') return 'credit'
  if (v.sourceType === 'external') return 'external'
  if (v.sourceType === 'internal') return 'behavior'
  return 'behavior'
})

const typedProfileTitle = computed(() => {
  if (variableCategory.value === 'external') return '外数字段基础信息'
  if (variableCategory.value === 'credit') return '征信变量基础信息'
  return '行为变量基础信息'
})

// header 字段带：核心信息（编码/类型/来源/数据源/创建人/更新时间）
const headerInfo = computed(() => [
  { label: '变量编码', value: variableData.value.code || '—' },
  { label: '变量类型', value: getTypeLabel(variableData.value.type) || '—' },
  { label: '来源类型', value: sourceTypeLabel.value || '—' },
  { label: '数据源', value: variableData.value.dataSourceName || '—' },
  { label: '创建人', value: variableData.value.creator || '—' },
  { label: '更新时间', value: variableData.value.updatedAt || '—' }
])

// header 描述
const descriptionInfo = computed(() => [
  { label: '描述', value: variableData.value.description || '—' }
])

const typedProfileInfo = computed(() => {
  const v = variableStore.currentVariable || {}
  const profile = v.profile || {}
  const schema = PROFILE_FIELD_SCHEMAS[variableCategory.value] || []
  return schema.map((f) => ({
    label: f.label,
    value: profile[f.key] != null && profile[f.key] !== '' ? String(profile[f.key]) : '无'
  }))
})

const evaluationInfo = computed(() => {
  const hasRiskEval = isExternalSource.value && hasExternalEvaluation.value
  return [
    { label: '评估状态', value: hasRiskEval ? '已关联外数评估' : '变量质量评估' },
    { label: '评估得分', value: variableData.value.quality != null ? `${variableData.value.quality}` : (variableData.value.dataQuality ? `${variableData.value.dataQuality}` : '—') },
    { label: '缺失率', value: variableData.value.missingRate != null ? `${variableData.value.missingRate}%` : '—' },
    { label: '更新时间', value: variableData.value.updatedAt || '—' }
  ]
})

const analysisReports = ref([])
const analysisReportColumns = [
  { title: '报告名称', dataIndex: 'name' },
  { title: '报告类型', dataIndex: 'type', width: 140 },
  { title: '来源', dataIndex: 'source', slotName: 'source', width: 100 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 160 }
]

const reportPreviewVisible = ref(false)
const reportPreviewTitle = ref('报告预览')
const reportPreviewMeta = ref([])
const reportPreviewFindings = ref([])

const governanceVisible = ref(false)
const governanceDefaultTab = ref('online')

const openGovernanceDrawer = (tab) => {
  governanceDefaultTab.value = tab
  governanceVisible.value = true
}

watch(
  () => route.query.action,
  (val) => {
    if (val === 'online') {
      // 草稿/课题生成的草稿：直接打开"提交上线申请"抽屉
      if (['draft', 'pending'].includes(String(variableData.value.status || ''))) {
        openEnableApproval()
      } else {
        openGovernanceDrawer('online')
      }
    }
  },
  { immediate: true }
)

const deriveVisible = ref(false)
const deriveForm = reactive({
  name: '',
  mode: 'topic'
})

const enableApprovalVisible = ref(false)
const enableApprovalSubmitting = ref(false)
const enableApprovalForm = reactive({
  reason: '',
  expectedOnlineTime: '',
  approver: 'dmt_admin',
  remark: ''
})

const openEnableApproval = () => {
  enableApprovalForm.reason = ''
  enableApprovalForm.expectedOnlineTime = ''
  enableApprovalForm.approver = 'dmt_admin'
  enableApprovalForm.remark = ''
  enableApprovalVisible.value = true
}

const submitEnableApproval = async () => {
  if (!enableApprovalForm.reason.trim()) {
    Message.warning('请输入启用原因')
    return
  }
  if (!enableApprovalForm.approver) {
    Message.warning('请选择审批人')
    return
  }
  enableApprovalSubmitting.value = true
  // Demo 流程：模拟审批耗时 600ms
  await new Promise((r) => setTimeout(r, 600))
  const record = VariableStatusStore.submitForOnline({
    variableId: variableId.value,
    reason: enableApprovalForm.reason.trim(),
    expectedOnlineTime: enableApprovalForm.expectedOnlineTime.trim(),
    approver: enableApprovalForm.approver
  })
  // 记录审计事件
  if (variableData.value.draftSource?.topicId) {
    ExploreStore.addAuditEvent({
      topicId: variableData.value.draftSource.topicId,
      operator: 'Demo 用户',
      action: '上线',
      field: 'variable',
      beforeValue: variableData.value.draftSource.topicId,
      afterValue: String(variableId.value),
      reason: enableApprovalForm.reason.trim()
    })
  }
  // 刷新当前变量数据
  await variableStore.fetchVariableDetail(variableId.value)
  enableApprovalSubmitting.value = false
  enableApprovalVisible.value = false
  Message.success(`已上线：审批单 ${record.id}（审批人：${record.approver}）`)
}

const handleDerive = () => {
  deriveForm.name = `${variableData.value.name || '变量'}_衍生`
  deriveForm.mode = 'topic'
  deriveVisible.value = true
}

const confirmDerive = () => {
  const name = deriveForm.name?.trim() || `${variableData.value.name || '变量'}_衍生`
  if (deriveForm.mode === 'topic') {
    Message.info('已进入探索课题列表，可在课题详情内决策采纳后生成草稿回到台账')
    router.push('/explore/topics')
    return
  }
  const draft = VariableDraftStore.addDraft({
    name,
    code: `DERIVE_${Date.now()}`,
    category: variableCategory.value,
    sourceType: variableData.value.sourceType,
    dataSourceName: '变量中心（Demo）',
    description: `由 ${variableData.value.id} 衍生生成的变量草稿（Demo）`,
    draftSource: { derivedFromId: variableData.value.id }
  })
  router.push({ name: 'VariableAssetDetail', params: { id: draft.id, mode: 'edit' }, query: { action: 'online' } })
}

const handleViewAnalysisReport = (record) => {
  if (record?.url) {
    window.open(record.url, '_blank')
    return
  }
  if (record?.preview) {
    reportPreviewTitle.value = record.name || '报告预览'
    reportPreviewMeta.value = [
      { label: '报告类型', value: record.type || '—' },
      { label: '来源', value: record.source || '—' },
      { label: '更新时间', value: record.updatedAt || '—' },
      { label: '关联变量', value: variableData.value.name || '—' }
    ]
    reportPreviewFindings.value = Array.isArray(record.preview.findings) ? record.preview.findings : []
    reportPreviewVisible.value = true
    return
  }
  Message.info('暂无可预览内容')
}

const handleCopyReportLink = async (record) => {
  const url = record?.url
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    Message.success('链接已复制')
  } catch {
    Message.info(url)
  }
}

const buildAnalysisReports = () => {
  const v = variableStore.currentVariable
  const list = []

  if (v?.sourceType === 'external' && v?.sourceRefs?.externalEvaluationId) {
    const id = v.sourceRefs.externalEvaluationId
    list.push({
      id: `risk-eval-${id}`,
      name: '外数评估报告',
      type: '外数评估',
      source: 'risk-app',
      updatedAt: v.updatedAt || '—',
      url: buildRiskAppUrl(`/risk/external-data/evaluation/${id}`)
    })
  }

  list.push({
    id: 'var-eval-001',
    name: '变量质量评估报告',
    type: '变量评估',
    source: 'dmt-app',
    updatedAt: v?.updatedAt || '—',
    preview: {
      findings: [
        { id: 'f1', item: '数据质量', result: v?.dataQuality != null ? `${v.dataQuality}%` : '—', desc: '基于缺失率、唯一值数量等规则的综合评分' },
        { id: 'f2', item: '缺失率', result: v?.missingRate != null ? `${v.missingRate}%` : '—', desc: '缺失值比例越低越好' },
        { id: 'f3', item: '唯一值数量', result: v?.uniqueValueCount ?? '—', desc: '用于评估变量区分度与稳定性' }
      ]
    }
  })

  analysisReports.value = list
}

const sourceTypeLabel = computed(() => {
  if (variableData.value.sourceType === 'external') return '外数'
  if (variableData.value.sourceType === 'credit') return '征信'
  if (variableData.value.sourceType === 'internal') return '内数'
  return variableData.value.sourceType || '—'
})

const isExternalSource = computed(() => variableData.value.sourceType === 'external')
const externalRefs = computed(() => (variableData.value.sourceRefs || {}))
const hasExternalArchive = computed(() => !!externalRefs.value.externalArchiveId)
const hasExternalEvaluation = computed(() => !!externalRefs.value.externalEvaluationId)
const hasExternalService = computed(() => !!externalRefs.value.externalServiceId)
const hasExternalLifecycle = computed(() => !!externalRefs.value.externalLifecycleId)
const hasAnyExternalRef = computed(() => hasExternalArchive.value || hasExternalEvaluation.value || hasExternalService.value || hasExternalLifecycle.value)

const openRiskExternalArchive = () => {
  const id = externalRefs.value.externalArchiveId
  if (!id) return
  window.open(buildRiskAppUrl(`/risk/external-data/archive/${id}`), '_blank')
}

const openRiskExternalEvaluation = () => {
  const id = externalRefs.value.externalEvaluationId
  if (!id) return
  window.open(buildRiskAppUrl(`/risk/external-data/evaluation/${id}`), '_blank')
}

const openRiskExternalService = () => {
  const id = externalRefs.value.externalServiceId
  if (id) {
    window.open(buildRiskAppUrl(`/risk/external-data/service?id=${encodeURIComponent(String(id))}`), '_blank')
    return
  }
  window.open(buildRiskAppUrl('/risk/external-data/service'), '_blank')
}

const openRiskExternalLifecycle = () => {
  const id = externalRefs.value.externalLifecycleId
  if (!id) return
  window.open(buildRiskAppUrl(`/risk/external-data/lifecycle/${id}`), '_blank')
}

// 使用统计
const usageStats = ref({
  total: 0,
  metrics: 0,
  models: 0,
  reports: 0
})

// 使用场景分页
const usagePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 版本分页
const versionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 使用场景列表
const usageScenarios = ref([])

// 版本列表
const versionList = ref([])

// 字段映射数据
const fieldMappingData = ref([])

// 上游血缘数据
const upstreamLineage = ref([])

// 下游血缘数据
const downstreamLineage = ref([])

// 状态映射
const statusMap = {
  draft: { label: '草稿', color: 'gray' },
  pending: { label: '待审核', color: 'orange' },
  active: { label: '已发布', color: 'green' },
  inactive: { label: '已停用', color: 'red' },
  expired: { label: '已过期', color: 'lightgray' }
}

// 使用类型映射
const usageTypeMap = {
  metric: { label: '指标', color: 'blue' },
  model: { label: '模型', color: 'green' },
  report: { label: '报表', color: 'orange' },
  dashboard: { label: '仪表板', color: 'purple' }
}

// 基本信息
const basicInfo = computed(() => [
  { label: '变量名称', value: variableData.value.name },
  { label: '变量编码', value: variableData.value.code },
  { label: '变量类型', value: getTypeLabel(variableData.value.type) },
  { label: '创建人', value: variableData.value.creator },
  { label: '创建时间', value: variableData.value.createdAt },
  { label: '更新时间', value: variableData.value.updatedAt }
])

// 技术属性
const technicalInfo = computed(() => [
  { label: '数据源', value: variableData.value.dataSourceName },
  { label: '源字段', value: variableData.value.sourceField },
  { label: '更新频率', value: variableData.value.updateFrequency },
  { label: '描述', value: variableData.value.description || '暂无描述' }
])

// 数据源信息
const sourceInfo = computed(() => [
  { label: '数据源名称', value: variableData.value.dataSourceName },
  { label: '数据源类型', value: variableData.value.sourceType === 'external' ? '外数' : (variableData.value.sourceType === 'credit' ? '征信' : '内数') },
  { label: '连接信息', value: variableData.value.sourceType === 'external' ? '—' : 'PostgreSQL:10.0.0.1:5432/analytics' },
  { label: '最后同步时间', value: '—' }
])

// 获取状态标签
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusColor = (status) => statusMap[status]?.color || 'gray'

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    numerical: '数值型',
    categorical: '分类型',
    text: '文本型',
    datetime: '时间型',
    boolean: '布尔型'
  }
  return typeMap[type] || type
}

const lifecycleHeader = computed(() => ([
  { label: '当前阶段', value: lifecycleCurrent.value.stageLabel },
  { label: '当前状态', value: lifecycleCurrent.value.statusLabel },
  { label: '负责人', value: variableData.value.creator || '—' },
  { label: '最近更新时间', value: variableData.value.updatedAt || '—' }
]))

const effectSummary = computed(() => ([
  { label: '评估得分', value: variableData.value.quality != null ? `${variableData.value.quality}` : (variableData.value.dataQuality ? `${variableData.value.dataQuality}` : '—') },
  { label: '缺失率', value: variableData.value.missingRate != null ? `${variableData.value.missingRate}%` : '—' },
  { label: '唯一值数量', value: variableData.value.uniqueValueCount ?? '—' },
  { label: '更新频率', value: variableData.value.updateFrequency || '—' }
]))

const lifecycleCurrent = computed(() => {
  const status = variableData.value.status
  if (status === 'draft') return { stage: 'registration', stageLabel: '注册建档', status: 'in_progress', statusLabel: '进行中' }
  if (status === 'pending') return { stage: 'evaluation', stageLabel: '评估', status: 'in_progress', statusLabel: '进行中' }
  if (status === 'active') return { stage: 'operation', stageLabel: '运营监控', status: 'in_progress', statusLabel: '运行中' }
  if (status === 'inactive') return { stage: 'archived', stageLabel: '下线归档', status: 'completed', statusLabel: '已完成' }
  return { stage: 'registration', stageLabel: '注册建档', status: 'pending', statusLabel: '待开始' }
})

const lifecycleStages = computed(() => {
  const current = lifecycleCurrent.value.stage
  const order = ['registration', 'evaluation', 'accompany', 'publish', 'operation', 'archived']
  const labels = {
    registration: '注册建档',
    evaluation: '评估',
    accompany: '陪跑',
    publish: '发布上线',
    operation: '运营监控',
    archived: '下线归档'
  }
  const idx = order.indexOf(current)
  const now = new Date()
  const fmt = (d) => d.toISOString().slice(0, 10)
  return order.map((k, i) => {
    const status = i < idx ? 'completed' : (i === idx ? lifecycleCurrent.value.status : 'pending')
    const statusLabel = status === 'completed' ? '已完成' : (status === 'in_progress' ? '进行中' : '待开始')
    const startDate = i <= idx ? fmt(new Date(now.getTime() - (idx - i + 2) * 86400000)) : ''
    const endDate = (i < idx) ? fmt(new Date(now.getTime() - (idx - i + 1) * 86400000)) : ''
    const description = LIFECYCLE_SUPPLEMENT_GUIDE[k] || '—'
    return { stage: labels[k] || k, status, statusLabel, startDate, endDate, description }
  })
})

// 获取质量颜色
const getQualityColor = (quality) => {
  if (quality >= 95) return 'var(--subapp-success)'
  if (quality >= 80) return 'var(--subapp-warning)'
  return 'var(--subapp-danger)'
}

// 获取使用类型标签和颜色
const getUsageTypeLabel = (type) => usageTypeMap[type]?.label || type
const getUsageTypeColor = (type) => usageTypeMap[type]?.color || 'gray'

// 使用场景表格列
const usageColumns = [
  { title: '场景名称', dataIndex: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 100 },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '描述', dataIndex: 'description' },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 120, fixed: 'right' }
]

// 版本表格列
const versionColumns = [
  { title: '版本', dataIndex: 'version', slotName: 'version', width: 120 },
  { title: '变更描述', dataIndex: 'description', width: 200 },
  { title: '变更内容', dataIndex: 'changes', slotName: 'changes' },
  { title: '创建人', dataIndex: 'creator', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 120, fixed: 'right' }
]

// 字段映射表格列
const fieldMappingColumns = [
  { title: '字段名', dataIndex: 'fieldName', width: 150 },
  { title: '数据类型', dataIndex: 'dataType', width: 100 },
  { title: '是否主键', dataIndex: 'isPrimaryKey', width: 80, render: ({ record }) => record.isPrimaryKey ? '是' : '否' },
  { title: '是否可空', dataIndex: 'isNullable', width: 80, render: ({ record }) => record.isNullable ? '是' : '否' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '描述', dataIndex: 'description' }
]

// 获取变量详情
const fetchVariableDetail = async () => {
  try {
    const variableId = route.params.id
    
    if (!variableId) {
      Message.error('变量ID不能为空')
      return
    }
    
    await variableStore.fetchVariableDetail(variableId)
    buildAnalysisReports()
    
    // Mock字段映射数据
    fieldMappingData.value = [
      {
        id: '1',
        fieldName: 'age',
        dataType: 'INTEGER',
        isPrimaryKey: false,
        isNullable: true,
        status: 'active',
        description: '用户年龄'
      },
      {
        id: '2',
        fieldName: 'user_id',
        dataType: 'BIGINT',
        isPrimaryKey: true,
        isNullable: false,
        status: 'active',
        description: '用户ID'
      }
    ]

    // Mock血缘数据
    upstreamLineage.value = [
      { id: 'table_001', name: '用户注册表', type: 'table' },
      { id: 'table_002', name: '用户认证表', type: 'table' }
    ]

    downstreamLineage.value = [
      { id: 'metric_001', name: '用户平均年龄', type: 'metric' },
      { id: 'model_001', name: '信用评分模型', type: 'model' },
      { id: 'report_001', name: '用户画像报告', type: 'report' }
    ]

  } catch (error) {
    console.error('获取变量详情失败:', error)
    Message.error('获取变量详情失败')
  }
}

// 获取使用场景
const fetchUsageScenarios = async () => {
  try {
    // Mock数据
    usageScenarios.value = [
      {
        id: 'usage_001',
        name: '用户平均年龄指标',
        type: 'metric',
        creator: '李四',
        createdAt: '2024-01-10 09:30:00',
        description: '计算所有用户的平均年龄，用于用户画像分析'
      },
      {
        id: 'usage_002',
        name: '信用评分模型',
        type: 'model',
        creator: '王五',
        createdAt: '2024-01-12 14:20:00',
        description: '使用用户年龄作为特征之一，构建信用评分模型'
      },
      {
        id: 'usage_003',
        name: '用户画像报告',
        type: 'report',
        creator: '赵六',
        createdAt: '2024-01-15 11:15:00',
        description: '在用户画像报告中展示年龄分布情况'
      }
    ]
    usagePagination.total = 3
    
    // Mock使用统计
    usageStats.value = {
      total: 15,
      metrics: 8,
      models: 4,
      reports: 3
    }
  } catch (error) {
    console.error('获取使用场景失败:', error)
    Message.error('获取使用场景失败')
  }
}

// 获取版本历史
const fetchVersionHistory = async () => {
  try {
    // Mock数据
    versionList.value = [
      {
        id: 'ver_003',
        version: 'v1.2.0',
        isCurrent: true,
        description: '优化数据质量监控',
        changes: ['新增数据质量监控规则', '优化缺失值处理逻辑'],
        creator: '张三',
        createdAt: '2024-01-15 14:30:00'
      },
      {
        id: 'ver_002',
        version: 'v1.1.0',
        isCurrent: false,
        description: '扩展数据源',
        changes: ['新增用户认证表作为数据源', '优化数据更新频率'],
        creator: '李四',
        createdAt: '2024-01-10 10:20:00'
      },
      {
        id: 'ver_001',
        version: 'v1.0.0',
        isCurrent: false,
        description: '初始版本',
        changes: ['创建用户年龄变量', '配置基础数据质量规则'],
        creator: '张三',
        createdAt: '2024-01-01 10:00:00'
      }
    ]
    versionPagination.total = 3
  } catch (error) {
    console.error('获取版本历史失败:', error)
    Message.error('获取版本历史失败')
  }
}

// 返回列表
const handleBackToList = () => {
  router.push('/variable-management')
}

const handleMoreSelect = (val) => {
  if (val === 'toggle') handleToggleStatus()
  if (val === 'delete') handleDelete()
}

// 编辑变量
const handleEdit = () => {
  Message.info('编辑功能开发中...')
}

// 切换状态
const handleToggleStatus = async () => {
  try {
    const action = variableData.value.status === 'active' ? '停用' : '启用'

    if (action === '启用') {
      openEnableApproval()
      return
    }

    Modal.confirm({
      title: '确认操作',
      content: `确定要${action}变量"${variableData.value.name}"吗？`,
      onOk: async () => {
        try {
          VariableStatusStore.setStatus(variableId.value, 'inactive', 'Demo 用户', '台账直接停用')
          if (variableStore.currentVariable) {
            variableStore.currentVariable = { ...variableStore.currentVariable, status: 'inactive' }
          }
          Message.success(`变量已${action}`)
        } catch (error) {
          Message.error('状态更新失败')
        }
      }
    })
  } catch (error) {
    Message.error('状态更新失败')
  }
}

// 删除变量
const handleDelete = async () => {
  try {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除变量"${variableData.value.name}"吗？此操作不可恢复。`,
      okText: '删除',
      okButtonProps: { status: 'danger' },
      onOk: async () => {
        try {
          Message.success('变量已删除')
          router.push('/variable-management')
        } catch (error) {
          Message.error('删除失败')
        }
      }
    })
  } catch (error) {
    Message.error('删除失败')
  }
}

// 查看使用场景
const handleViewUsage = (record) => {
  Message.info(`查看${record.name}详情`)
}

// 跳转到使用场景
const handleGotoUsage = (record) => {
  // 根据类型跳转到不同的页面
  const routes = {
    metric: '/metrics',
    model: '/models',
    report: '/reports',
    dashboard: '/dashboards'
  }
  const route = routes[record.type] || '/'
  router.push(`${route}/${record.id}`)
}

// 版本对比
const handleCompareVersion = (record) => {
  Message.info(`对比版本: ${record.version}`)
}

// 版本回滚
const handleRollbackVersion = (record) => {
  Modal.confirm({
    title: '确认回滚',
    content: `确定要回滚到版本"${record.version}"吗？`,
    onOk: async () => {
      Message.success('版本回滚成功')
      fetchVersionHistory()
    }
  })
}

// 使用场景分页
const handleUsagePageChange = (page) => {
  usagePagination.current = page
  fetchUsageScenarios()
}

// 版本分页
const handleVersionPageChange = (page) => {
  versionPagination.current = page
  fetchVersionHistory()
}

// 初始化
onMounted(() => {
  fetchVariableDetail()
  fetchUsageScenarios()
  fetchVersionHistory()
})
</script>

<style scoped>
.variable-detail-page {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background-color: var(--color-fill-2);
}

.page-header {
  background: #fff;
  padding: 20px 24px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}

.breadcrumb {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.title-section {
  flex: 1 1 400px;
  min-width: 0;
  margin-right: 24px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
  line-height: 1.4;
}

.status-tag {
  margin-left: 12px;
}

.header-info {
  margin-top: 8px;
}

/* header 字段带：4 列下每列宽度足够容纳长字符串 */
.header-info :deep(.param-value) {
  word-break: break-all;
  line-height: 1.6;
}

/* 横向字段带：已迁移到 ParamGroup 组件（columns=6，瀑布流布局，无表格） */
.header-description-group {
  margin-top: 8px;
}

.header-description-group :deep(.param-group-item) {
  break-inside: avoid;
}

.description-text {
  color: var(--color-text-2);
  display: inline-block;
  max-width: 100%;
  white-space: normal;
  line-height: 1.5;
}

.actions {
  flex-shrink: 0;
}

.actions :deep(.arco-btn) {
  margin-left: 12px;
}

.tab-content {
  padding: 0;
}

.detail-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  min-height: 500px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}

.detail-tabs :deep(.arco-tabs-nav-tab) {
  justify-content: flex-start;
}

.detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid var(--color-border-2);
}

.detail-card :deep(.arco-card-header) {
  border-bottom: 1px solid var(--color-border-1);
  padding: 12px 16px;
  background-color: var(--color-fill-1);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.detail-card :deep(.arco-card-header-title) {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-1);
}

.detail-card :deep(.arco-card-body) {
  padding: 20px 16px;
}

:deep(.arco-descriptions-item-label-inline) {
  color: var(--color-text-3);
  font-weight: 400;
}

:deep(.arco-descriptions-item-value-inline) {
  color: var(--color-text-1);
}

.quality-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--color-fill-2);
  border-radius: 6px;
}

.quality-label {
  font-size: 14px;
  color: var(--color-text-3);
  min-width: 80px;
}

.quality-value {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.quality-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
  min-width: 60px;
}

.quality-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-1);
}

.definition-content {
  padding: 16px;
  background-color: var(--color-fill-2);
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-1);
  min-height: 100px;
}

.lineage-graph {
  height: 520px;
}

.usage-stat {
  text-align: center;
  padding: 16px;
  background-color: var(--color-fill-2);
  border-radius: 6px;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-success-6);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-3);
}

.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-number {
  font-weight: 600;
  color: var(--color-text-1);
}

.changes-content {
  max-height: 100px;
  overflow-y: auto;
}

.change-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
</style>
