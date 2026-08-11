<template>
  <div class="auto-classification">
    <a-page-header title="智能分级分类" class="page-header">
      <template #subtitle>
        <span class="header-subtitle">
          基于字段名 / 数据类型 / 业务归属,自动推荐敏感级别和分级
        </span>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <!-- 左侧:输入区 + 推荐结果 -->
      <a-col :span="14">
        <a-card title="单字段智能推荐" :bordered="false">
          <a-form :model="form" layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="字段名(必填)" required>
                  <a-input
                    v-model="form.fieldName"
                    placeholder="如 id_card_no / phone / apply_amt"
                    allow-clear
                    @input="runSuggest"
                  >
                    <template #prefix><IconFontColors /></template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="数据类型(必填)" required>
                  <a-input
                    v-model="form.dataType"
                    placeholder="如 VARCHAR(20) / BIGINT / DECIMAL(18,2)"
                    allow-clear
                    @input="runSuggest"
                  >
                    <template #prefix><IconCode /></template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="业务归属" required>
                  <a-select v-model="form.businessBelonging" @change="runSuggest">
                    <a-option value="零售">零售</a-option>
                    <a-option value="对公">对公</a-option>
                    <a-option value="风控">风控</a-option>
                    <a-option value="运营">运营</a-option>
                    <a-option value="财务">财务</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="所属业务域(可选)">
                  <a-select v-model="form.domainCode" allow-clear placeholder="选填,辅助判断">
                    <a-option v-for="d in domains" :key="d.code" :value="d.code">
                      {{ d.name }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>

          <a-divider>推荐结果</a-divider>

          <a-empty v-if="!suggestion" description="请输入字段名和数据类型" />

          <a-descriptions
            v-else
            :column="2"
            bordered
            size="small"
            class="suggestion-descriptions"
          >
            <a-descriptions-item label="数据类型分类">
              <a-tag color="arcoblue">{{ suggestion.dataTypeCategory }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="业务归属">
              <a-tag>{{ suggestion.businessBelonging }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="推荐敏感级别">
              <a-tag :color="getSensitivityColor(suggestion.defaultSensitivity)" size="large">
                {{ suggestion.defaultSensitivity }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="推荐分级">
              <a-tag :color="getGradeColor(suggestion.defaultGrade)">{{ suggestion.defaultGrade }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="推断理由" :span="2">
              {{ suggestion.reason }}
            </a-descriptions-item>
            <a-descriptions-item v-if="suggestion.legalBasis" label="法规依据" :span="2">
              <a-alert type="info" :show-icon="true">
                {{ suggestion.legalBasis }}
              </a-alert>
            </a-descriptions-item>
            <a-descriptions-item label="是否需人工确认" :span="2">
              <a-tag v-if="suggestion.requireManualConfirm" color="orange">
                <template #icon><IconExclamationCircle /></template>
                是 - 建议治理者复核
              </a-tag>
              <a-tag v-else color="green">
                <template #icon><IconCheckCircle /></template>
                否 - 可直接采用
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>

          <a-space style="margin-top: 16px" v-if="suggestion">
            <a-button type="primary" @click="applySuggestion" :disabled="suggestion.requireManualConfirm && !allowOverride">
              <template #icon><IconCheck /></template>
              采用推荐
            </a-button>
            <a-button @click="manualOverride" :disabled="!allowOverride">
              <template #icon><IconEdit /></template>
              手动调整
            </a-button>
            <a-checkbox v-model="allowOverride">
              允许覆写强制复核项
            </a-checkbox>
          </a-space>
        </a-card>

        <!-- 批量场景示例 -->
        <a-card title="典型批量场景演示" :bordered="false" style="margin-top: 16px">
          <p class="card-desc">展示一个表内多个字段一次性打标的推荐结果:</p>
          <a-table
            :data="batchDemoData"
            :pagination="false"
            :bordered="false"
            size="small"
          >
            <template #columns>
              <a-table-column title="字段名" data-index="fieldName">
                <template #cell="{ record }">
                  <code>{{ record.fieldName }}</code>
                </template>
              </a-table-column>
              <a-table-column title="数据类型" data-index="dataType">
                <template #cell="{ record }">
                  <a-tag size="small">{{ record.dataType }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="推荐级别" data-index="sensitivity" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="getSensitivityColor(record.sensitivity)">{{ record.sensitivity }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="推荐分级" data-index="grade" :width="80">
                <template #cell="{ record }">
                  <a-tag :color="getGradeColor(record.grade)">{{ record.grade }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="是否复核" data-index="requireConfirm" :width="80">
                <template #cell="{ record }">
                  <a-tag v-if="record.requireConfirm" color="orange" size="small">是</a-tag>
                  <a-tag v-else color="green" size="small">否</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="推断理由" data-index="reason" :ellipsis="true" />
            </template>
          </a-table>
        </a-card>
      </a-col>

      <!-- 右侧:矩阵规则 + 覆盖率统计 -->
      <a-col :span="10">
        <a-card title="分级分类规则矩阵" :bordered="false">
          <p class="card-desc">
            DCA 共 {{ matrixStats.total }} 条规则,按"数据类型 × 业务归属"推荐敏感级别。
            数据来源:<code>StandardClassifyMatrixStore</code>
          </p>
          <a-tabs default-active-key="by-domain">
            <a-tab-pane key="by-domain" title="按业务域">
              <div v-for="(items, domain) in groupedMatrix.byDomain" :key="domain" class="matrix-group">
                <h4 class="group-title">
                  <a-tag color="arcoblue">{{ domain }}</a-tag>
                  <span class="group-count">({{ items.length }} 条规则)</span>
                </h4>
                <a-row :gutter="[8, 8]">
                  <a-col v-for="item in items" :key="item.id" :span="12">
                    <div class="matrix-card">
                      <div class="card-header">
                        <a-tag size="small">{{ item.dataTypeCategory }}</a-tag>
                        <a-tag :color="getSensitivityColor(item.defaultSensitivity)" size="small">
                          {{ item.defaultSensitivity }}
                        </a-tag>
                      </div>
                      <p class="card-reason">{{ item.reason }}</p>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </a-tab-pane>
            <a-tab-pane key="by-sensitivity" title="按敏感级别">
              <div v-for="(items, level) in groupedMatrix.bySensitivity" :key="level" class="matrix-group">
                <h4 class="group-title">
                  <a-tag :color="getSensitivityColor(level)">{{ level }}</a-tag>
                  <span class="group-count">({{ items.length }} 条规则)</span>
                </h4>
                <a-row :gutter="[8, 8]">
                  <a-col v-for="item in items" :key="item.id" :span="12">
                    <div class="matrix-card">
                      <div class="card-header">
                        <a-tag size="small">{{ item.dataTypeCategory }}</a-tag>
                        <a-tag size="small">{{ item.businessBelonging }}</a-tag>
                      </div>
                      <p class="card-reason">{{ item.reason }}</p>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-card>

        <!-- 覆盖率统计 -->
        <a-card title="覆盖率统计" :bordered="false" style="margin-top: 16px">
          <a-statistic title="分级覆盖率(全字段)" :value="coveragePercent" :precision="1" suffix="%" />
          <a-progress :percent="coveragePercent" :show-text="false" />
          <a-divider />
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="已分级字段">
              {{ coverage.graded }} / {{ coverage.total }}
            </a-descriptions-item>
            <a-descriptions-item label="未分级字段">
              {{ coverage.ungraded }}
              <a-button type="text" size="mini" @click="goBatchGrade">
                <template #icon><IconThunderbolt /></template>
                一键批量分级
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="按敏感级别分布">
              <a-space>
                <a-tag color="green">L1: {{ matrixStats.bySensitivity.L1 }}</a-tag>
                <a-tag color="orange">L2: {{ matrixStats.bySensitivity.L2 }}</a-tag>
                <a-tag color="red">L3: {{ matrixStats.bySensitivity.L3 }}</a-tag>
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <!-- 手动调整弹窗 -->
    <a-modal
      v-model:visible="manualModalVisible"
      title="手动调整分级"
      @ok="confirmManual"
    >
      <a-alert type="warning" :show-icon="true" style="margin-bottom: 16px">
        手动调整将跳过矩阵推荐,适用于特殊业务场景。请填写调整理由以备审计。
      </a-alert>
      <a-form :model="manualForm" layout="vertical">
        <a-form-item label="敏感级别">
          <a-radio-group v-model="manualForm.sensitivity">
            <a-radio value="L1">L1 低敏</a-radio>
            <a-radio value="L2">L2 中敏</a-radio>
            <a-radio value="L3">L3 高敏</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="业务分级">
          <a-radio-group v-model="manualForm.grade">
            <a-radio value="一般">一般</a-radio>
            <a-radio value="重要">重要</a-radio>
            <a-radio value="关键">关键</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="调整理由" required>
          <a-textarea v-model="manualForm.reason" :rows="3" placeholder="请说明为什么手动覆盖..." />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
/**
 * 智能分级分类演示页(P1-B)
 *
 * 文档依据:
 *   §4.5 关键差距:自动化分级分类
 *   §13.3 落地路径:基于规则引擎的自动分级(2 个月)
 *
 * 演示基于字段名 + 数据类型 + 业务归属,通过矩阵自动推荐敏感级别。
 */
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  StandardClassifyMatrixStore,
  type StandardClassifyMatrix,
  type DataTypeCategory
} from '@/mock/shared/standard-classify-matrix'
import { TaxonomyStore, type TaxonomyNode } from '@/mock/shared/classification-taxonomy'
import {
    IconFontColors,
    IconCode,
    IconExclamationCircle,
  IconCheckCircle,
  IconCheck,
  IconEdit,
  IconThunderbolt
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

// === 表单 ===
const form = ref({
  fieldName: '',
  dataType: '',
  businessBelonging: '零售',
  domainCode: undefined as string | undefined
})

const allowOverride = ref(false)
const manualModalVisible = ref(false)
const manualForm = ref({
  sensitivity: 'L1',
  grade: '一般',
  reason: ''
})

// === 推荐结果 ===
const suggestion = ref<StandardClassifyMatrix | null>(null)

const runSuggest = () => {
  const { fieldName, dataType, businessBelonging } = form.value
  if (!fieldName.trim() || !dataType.trim()) {
    suggestion.value = null
    return
  }
  // 智能推断:先按数据类型推断分类,再按业务归属查找矩阵
  let result = StandardClassifyMatrixStore.inferFromType(dataType, businessBelonging as any)

  // 若按数据类型没命中,尝试按字段名关键字推断
  if (!result) {
    const fnLower = fieldName.toLowerCase()
    if (/id_card|idno|身份证/.test(fnLower)) {
      result = StandardClassifyMatrixStore.lookup({ dataTypeCategory: 'ID', businessBelonging: businessBelonging as any })
    } else if (/phone|mobile|tel/.test(fnLower)) {
      result = StandardClassifyMatrixStore.lookup({ dataTypeCategory: 'PHONE', businessBelonging: businessBelonging as any })
    } else if (/amt|amount|balance|loan|money|credit/.test(fnLower)) {
      result = StandardClassifyMatrixStore.lookup({ dataTypeCategory: 'AMT', businessBelonging: businessBelonging as any })
    } else if (/name|cust_name|user_name/.test(fnLower)) {
      result = StandardClassifyMatrixStore.lookup({ dataTypeCategory: 'NAME', businessBelonging: businessBelonging as any })
    } else if (/addr|address/.test(fnLower)) {
      result = StandardClassifyMatrixStore.lookup({ dataTypeCategory: 'ADDR', businessBelonging: businessBelonging as any })
    }
  }

  suggestion.value = result || null
}

// === 业务域 ===
const domains = computed(() => TaxonomyStore.byLevel(1))

// === 矩阵统计 ===
const matrixStats = computed(() => StandardClassifyMatrixStore.stats())

const groupedMatrix = computed(() => {
  const list = StandardClassifyMatrixStore.list()
  return {
    byDomain: list.reduce((acc, item) => {
      const k = item.businessBelonging
      if (!acc[k]) acc[k] = []
      acc[k].push(item)
      return acc
    }, {} as Record<string, StandardClassifyMatrix[]>),
    bySensitivity: list.reduce((acc, item) => {
      const k = item.defaultSensitivity
      if (!acc[k]) acc[k] = []
      acc[k].push(item)
      return acc
    }, {} as Record<string, StandardClassifyMatrix[]>)
  }
})

// === 覆盖率 ===
const coverage = ref({
  total: 856,
  graded: 720,
  ungraded: 136
})
const coveragePercent = computed(() => Math.round((coverage.value.graded / coverage.value.total) * 1000) / 10)

// === 批量场景演示 ===
const batchDemoData = computed(() => {
  // 模拟 dim_user 表的字段批量打标
  const demoFields = [
    { fieldName: 'user_id', dataType: 'BIGINT', businessBelonging: '零售' },
    { fieldName: 'id_card_no', dataType: 'VARCHAR(20)', businessBelonging: '零售' },
    { fieldName: 'user_name', dataType: 'VARCHAR(50)', businessBelonging: '零售' },
    { fieldName: 'mobile', dataType: 'VARCHAR(15)', businessBelonging: '零售' },
    { fieldName: 'address', dataType: 'VARCHAR(200)', businessBelonging: '零售' },
    { fieldName: 'balance', dataType: 'DECIMAL(18,2)', businessBelonging: '零售' },
    { fieldName: 'credit_score', dataType: 'INT', businessBelonging: '风控' },
    { fieldName: 'status', dataType: 'TINYINT', businessBelonging: '零售' }
  ] as { fieldName: string; dataType: string; businessBelonging: any }[]

  return demoFields.map(f => {
    const result = StandardClassifyMatrixStore.inferFromType(f.dataType, f.businessBelonging)
    return {
      fieldName: f.fieldName,
      dataType: f.dataType,
      sensitivity: result?.defaultSensitivity || 'NONE',
      grade: result?.defaultGrade || '-',
      requireConfirm: result?.requireManualConfirm || false,
      reason: result?.reason || '未命中矩阵,需人工判定'
    }
  })
})

// === 方法 ===
const applySuggestion = () => {
  Message.success(`已采用推荐: ${suggestion.value?.defaultSensitivity} / ${suggestion.value?.defaultGrade}`)
}

const manualOverride = () => {
  manualModalVisible.value = true
  manualForm.value = {
    sensitivity: suggestion.value?.defaultSensitivity || 'L1',
    grade: suggestion.value?.defaultGrade || '一般',
    reason: ''
  }
}

const confirmManual = () => {
  if (!manualForm.value.reason.trim()) {
    Message.warning('请填写调整理由')
    return
  }
  Message.success(`手动调整已提交,理由: ${manualForm.value.reason}`)
  manualModalVisible.value = false
}

const goBatchGrade = () => {
  Message.info('跳转到批量分级工具...')
  // router.push('/home/management/asset-management/listing-management/table-management')
}

// === 工具 ===
function getSensitivityColor(level: string): string {
  switch (level) {
    case 'L1': return 'green'
    case 'L2': return 'orange'
    case 'L3': return 'red'
    default: return 'gray'
  }
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case '一般': return 'gray'
    case '重要': return 'blue'
    case '关键': return 'red'
    default: return 'gray'
  }
}

// 演示:自动填充一个示例
watch(() => form.value.fieldName, () => {
  // 输入即推荐,无需手动触发
})
</script>

<style scoped>
.auto-classification {
  padding: 16px;
}
.page-header {
  margin-bottom: 12px;
  background: #fff;
}
.header-subtitle {
  color: var(--color-text-3);
  font-size: 13px;
}
.card-desc {
  color: var(--color-text-3);
  font-size: 13px;
  margin-bottom: 12px;
}
.suggestion-descriptions {
  margin-top: 8px;
}
.matrix-group {
  margin-bottom: 16px;
}
.group-title {
  margin: 12px 0;
  font-size: 14px;
}
.group-count {
  font-size: 12px;
  color: var(--color-text-3);
  margin-left: 4px;
}
.matrix-card {
  padding: 8px 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  background: var(--color-fill-1);
  height: 100%;
}
.card-header {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}
.card-reason {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-2);
  line-height: 1.5;
}
code {
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #165dff;
}
</style>