<template>
  <PageContainer>
    <PageHeader
      :title="contextTitle"
      sub-title="申请访问受限字段 · 待 Owner 审批通过后方可使用"
      show-back
      back-text="返回"
      @back="onBack"
    />

    <!-- 从其它页面带过来的资源上下文(API / 数据标准等) -->
    <a-alert
      v-if="contextResourceName"
      type="info"
      :show-icon="true"
      style="margin-bottom: 16px"
    >
      正在为资源「{{ contextResourceName }}」申请字段权限({{ contextResourceType }})
    </a-alert>

    <!-- 3 步骤指示器 -->
    <a-steps :current="currentStep" class="apply-steps">
      <a-step title="选择资源" description="选择要访问的数据字段" />
      <a-step title="填写原因" description="说明使用场景" />
      <a-step title="等待审批" description="Owner 审批" />
    </a-steps>

    <!-- Step 1: 选择资源 -->
    <div v-if="currentStep === 1" class="step-content">
      <a-card :bordered="false" title="选择受限字段">
        <template #extra>
          <a-input-search
            v-model="searchKeyword"
            placeholder="搜索字段 / 表名"
            style="width: 280px;"
          />
        </template>

        <a-table
          :data="filteredFields"
          :pagination="{ pageSize: 10 }"
          row-key="key"
          :row-selection="rowSelection"
        >
          <template #columns>
            <a-table-column type="checkbox" :width="40" />
            <a-table-column title="字段" data-index="fieldName" :width="160">
              <template #cell="{ record }">
                <code>{{ record.fieldName }}</code>
              </template>
            </a-table-column>
            <a-table-column title="所属表" data-index="tableName" :width="140">
              <template #cell="{ record }">
                <a-link @click="onViewTable(record.tableName)">{{ record.tableName }}</a-link>
              </template>
            </a-table-column>
            <a-table-column title="敏感级别" :width="100">
              <template #cell="{ record }">
                <a-tag :color="sensitivityColor(record.sensitivity)" size="small">
                  {{ record.sensitivity }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="所属要素" data-index="elementName">
              <template #cell="{ record }">
                <a-tag v-if="record.elementName" color="purple" size="small">{{ record.elementName }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="说明" data-index="comment" :ellipsis="true" />
          </template>
        </a-table>

        <div class="step-actions">
          <a-space>
            <a-tag color="blue">已选 {{ selectedKeys.length }} 个字段</a-tag>
            <a-button type="primary" :disabled="selectedKeys.length === 0" @click="onNext">
              下一步
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>

    <!-- Step 2: 填写原因 -->
    <div v-if="currentStep === 2" class="step-content">
      <a-card :bordered="false" title="填写申请信息">
        <a-form :model="applyForm" layout="vertical">
          <a-form-item label="申请的字段">
            <a-space wrap>
              <a-tag
                v-for="key in selectedKeys"
                :key="key"
                color="arcoblue"
                closable
                @close="onRemoveField(key)"
              >
                {{ getFieldLabel(key) }}
              </a-tag>
            </a-space>
          </a-form-item>

          <a-form-item label="使用场景" required>
            <a-textarea
              v-model="applyForm.reason"
              placeholder="详细说明使用这些字段的业务场景,如:用于风控反欺诈分析、客户画像建模..."
              :auto-size="{ minRows: 4, maxRows: 6 }"
              :max-length="500"
              show-word-limit
            />
          </a-form-item>

          <a-form-item label="使用周期" required>
            <a-radio-group v-model="applyForm.duration">
              <a-radio value="7d">7 天(临时查询)</a-radio>
              <a-radio value="30d">30 天(项目周期)</a-radio>
              <a-radio value="90d">90 天(中长期分析)</a-radio>
              <a-radio value="permanent">长期(定期使用)</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="使用方式">
            <a-checkbox-group v-model="applyForm.usage">
              <a-checkbox value="query">查询/导出</a-checkbox>
              <a-checkbox value="analysis">分析建模</a-checkbox>
              <a-checkbox value="dashboard">看板展示</a-checkbox>
              <a-checkbox value="report">报表生成</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <a-form-item label="紧急程度">
            <a-rate v-model="applyForm.urgency" :count="5" />
            <span class="rate-tip">
              {{ urgencyText }}
            </span>
          </a-form-item>

          <a-form-item label="通知方式">
            <a-checkbox v-model="applyForm.notifyEmail">邮件通知</a-checkbox>
            <a-checkbox v-model="applyForm.notifySite">站内消息</a-checkbox>
            <a-checkbox v-model="applyForm.notifySms" :disabled="applyForm.urgency < 4">短信通知</a-checkbox>
          </a-form-item>

          <a-form-item label="上传附件(可选)">
            <a-upload
              :file-list="applyForm.attachments"
              :auto-upload="false"
              @change="onFileChange"
              tip="上传业务说明文档/项目方案"
            >
              <a-button>选择文件</a-button>
            </a-upload>
          </a-form-item>
        </a-form>

        <div class="step-actions">
          <a-space>
            <a-button @click="currentStep = 1">上一步</a-button>
            <a-button
              type="primary"
              :loading="submitting"
              :disabled="!canSubmit"
              @click="onSubmit"
            >
              提交申请
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>

    <!-- Step 3: 等待审批 -->
    <div v-if="currentStep === 3" class="step-content">
      <a-card :bordered="false">
        <a-result
          status="success"
          title="申请已提交"
          :sub-title="`审批 ID: ${submittedId}`"
        >
          <template #extra>
            <a-space>
              <a-statistic title="申请字段" :value="selectedKeys.length" />
              <a-statistic title="预计审批时长" value="1-3 天" />
            </a-space>
          </template>
        </a-result>

        <a-divider>申请进度</a-divider>

        <a-timeline>
          <a-timeline-item label="刚刚" type="primary">
            <div class="timeline-content">
              <strong>已提交</strong>
              <p>您于 {{ submittedTime }} 提交了 {{ selectedKeys.length }} 个字段的访问权限申请</p>
            </div>
          </a-timeline-item>
          <a-timeline-item label="待审批">
            <div class="timeline-content">
              <strong>Owner 审批中</strong>
              <p>预计 1-3 个工作日</p>
              <a-tag color="orange">审批中</a-tag>
            </div>
          </a-timeline-item>
          <a-timeline-item>
            <div class="timeline-content">
              <strong>结果通知</strong>
              <p>审批结果将通过站内信 / 邮件 / 短信通知</p>
            </div>
          </a-timeline-item>
          <a-timeline-item>
            <div class="timeline-content">
              <strong>自动开通</strong>
              <p>审批通过后系统自动开通,无需人工操作</p>
            </div>
          </a-timeline-item>
        </a-timeline>

        <div class="step-actions">
          <a-space>
            <a-button @click="onReset">新建申请</a-button>
            <a-button type="primary" @click="onViewApplications">
              查看我的申请
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useRouter, useRoute } from 'vue-router'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'
import { FieldLinkStore } from '@/mock-shared/lineage'
// 2026-08-06:workflow-directory 在 DFD 那边为同名文件,保留 @/mock/shared/ 以避免歧义
import { ApplicationStore } from '@/mock-shared/workflow-directory'
import { TaxonomyStore } from '@/mock-shared/classification-taxonomy'
import { PermissionStore } from '@/mock-shared/permission-store'

const router = useRouter()
const route = useRoute()

// 从其它页面带过来的资源上下文(query.resourceType / resourceId / resourceName)
const contextResourceType = ref('')
const contextResourceId = ref('')
const contextResourceName = ref('')
const contextTitle = ref('权限申请')

onMounted(() => {
  const q = route.query
  if (q.resourceType || q.resourceId || q.resourceName) {
    contextResourceType.value = String(q.resourceType || '')
    contextResourceId.value = String(q.resourceId || '')
    contextResourceName.value = String(q.resourceName || '')
    contextTitle.value = `权限申请 · ${contextResourceName.value}`
  }
})

const currentStep = ref(1)
const submitting = ref(false)
const submittedId = ref('')
const submittedTime = ref('')

// Step 1 数据
const searchKeyword = ref('')
const selectedKeys = ref<string[]>([])
const rowSelection = {
  type: 'checkbox' as const,
  showCheckedAll: true
}

// 字段数据(从 FieldLinkStore + 标准字段推导)
const availableFields = computed(() => {
  const links = FieldLinkStore.list()
  return links
    .filter(l => l.sensitivityLevel && l.sensitivityLevel !== 'L1')
    .map(l => {
      const taxonomy = l.businessElementId
        ? TaxonomyStore.byCode(l.businessElementId)
        : null
      return {
        key: `${l.tableName}.${l.fieldName}`,
        fieldName: l.fieldName,
        tableName: l.tableName,
        sensitivity: l.sensitivityLevel,
        elementName: l.businessElementId,
        comment: getFieldComment(l.tableName, l.fieldName)
      }
    })
})

function getFieldComment(tableName: string, fieldName: string): string {
  const comments: Record<string, string> = {
    'id_card_no': '个人身份证号,18 位',
    'mobile': '11 位手机号',
    'apply_amt': '贷款申请金额',
    'used_credit': '已使用授信',
    'overdue_days': '当前逾期天数',
    'credit_score': '信用评分 0-1000',
    'risk_level': '风险等级'
  }
  return comments[fieldName] || ''
}

const filteredFields = computed(() => {
  const kw = searchKeyword.value.toLowerCase()
  if (!kw) return availableFields.value
  return availableFields.value.filter(f =>
    f.fieldName.toLowerCase().includes(kw) ||
    f.tableName.toLowerCase().includes(kw) ||
    f.elementName?.toLowerCase().includes(kw)
  )
})

const onViewTable = (tableName: string) => {
  router.push(`discovery/asset-catalog?table=${tableName}`)
}

const onRemoveField = (key: string) => {
  selectedKeys.value = selectedKeys.value.filter(k => k !== key)
}

const getFieldLabel = (key: string) => {
  const field = availableFields.value.find(f => f.key === key)
  return field ? `${field.tableName}.${field.fieldName}` : key
}

// Step 2 数据
const applyForm = reactive({
  reason: '',
  duration: '30d',
  usage: [] as string[],
  urgency: 3,
  notifyEmail: true,
  notifySite: true,
  notifySms: false,
  attachments: [] as any[]
})

const urgencyText = computed(() => {
  return ['', '可稍后', '普通', '较急', '紧急', '非常紧急'][applyForm.urgency] || ''
})

const canSubmit = computed(() =>
  applyForm.reason.trim().length >= 10 &&
  applyForm.usage.length > 0 &&
  selectedKeys.value.length > 0
)

const onFileChange = (fileList: any) => {
  applyForm.attachments = fileList
}

const onNext = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请至少选择一个字段')
    return
  }
  currentStep.value = 2
}

// Step 3 提交(2026-08-06:同时写入 PermissionStore,与审批/进度页数据打通)
const onSubmit = async () => {
  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 800))
    const id = `PERM-${Date.now()}`

    // 为每个字段创建申请
    selectedKeys.value.forEach(key => {
      const [table, field] = key.split('.')
      const fieldData = availableFields.value.find(f => f.key === key)
      // 旧 ApplicationStore(通知中心)
      ApplicationStore.add({
        type: 'permission_apply',
        title: `申请访问「${table}.${field}」字段`,
        applicantId: 'user-zhangsan',
        applicantName: '张三',
        resourceId: `field:${table}.${field}`,
        resourceName: `${table}.${field}`,
        resourceType: '字段',
        reason: applyForm.reason,
        status: 'pending',
        duration: applyForm.duration
      })
      // 新 PermissionStore(权限流程)
      PermissionStore.createDraft({
        applicant: '王运营',
        applicantDept: '数据运营组',
        tablePath: table,
        fieldName: field,
        fieldDesc: (fieldData as any)?.label || '',
        reason: applyForm.reason,
        purpose: 'data-analysis',
        scope: 'read',
        validMonths: applyForm.duration
      })
    })

    submittedId.value = id
    submittedTime.value = new Date().toLocaleString('zh-CN')
    currentStep.value = 3
    Message.success('申请已提交,等待审批')
  } finally {
    submitting.value = false
  }
}

const onBack = () => {
  router.back()
}

const onReset = () => {
  selectedKeys.value = []
  applyForm.reason = ''
  applyForm.duration = '30d'
  applyForm.usage = []
  applyForm.urgency = 3
  applyForm.notifyEmail = true
  applyForm.notifySite = true
  applyForm.notifySms = false
  applyForm.attachments = []
  currentStep.value = 1
}

const onViewApplications = () => {
  // 跳转到我的申请/收藏(实际应有独立页)
  router.push('discovery/favorites')
}

const sensitivityColor = (level: string) => ({
  L1: 'gray', L2: 'arcoblue', L3: 'orange', L4: 'red'
}[level] || 'gray')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
/* 保留内层 padding/max-width(页面宽度定制) */
.permission-apply-page {
  padding: 0 16px;

  .apply-steps {
    margin-bottom: 24px;
  }

  .step-content {
    margin-bottom: 24px;
  }

  .step-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--dca-border-light);
    text-align: right;
  }

  .rate-tip {
    margin-left: 12px;
    font-size: 13px;
    color: #86909c;
  }

  .timeline-content {
    strong {
      font-size: 14px;
      color: #1d2129;
    }

    p {
      margin: 4px 0;
      font-size: 13px;
      color: #4e5969;
    }
  }
}
</style>