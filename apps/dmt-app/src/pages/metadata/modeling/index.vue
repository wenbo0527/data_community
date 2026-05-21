<template>
  <div class="metadata-modeling-container">
    <div class="page-header">
      <h2>元数据建模</h2>
      <p class="description">构建元数据模型，定义实体绑定、血缘关系与数据标准映射。</p>
    </div>

    <a-tabs default-active-key="entity-binding" type="rounded">
      <!-- 实体绑定 -->
      <a-tab-pane key="entity-binding" title="实体绑定">
        <div class="tab-content">
          <div class="toolbar">
            <a-button type="primary" @click="showBindModal">
              <template #icon><IconLink /></template>
              绑定业务实体
            </a-button>
            <a-input-search placeholder="搜索表名" style="width: 240px; margin-left: 16px;" />
          </div>
          <a-table :data="entityBindingData" :pagination="false">
            <template #columns>
              <a-table-column title="物理表名" data-index="tableName" />
              <a-table-column title="所属库" data-index="database" />
              <a-table-column title="绑定业务域" data-index="businessDomain">
                <template #cell="{ record }">
                  <a-tag color="arcoblue">{{ record.businessDomain }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="绑定业务实体" data-index="businessEntity">
                <template #cell="{ record }">
                  <a-tag color="purple">{{ record.businessEntity }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status">
                <template #cell="{ record }">
                  <a-badge status="success" text="已绑定" />
                </template>
              </a-table-column>
              <a-table-column title="操作">
                <template #cell="{ record, rowIndex }">
                  <a-button type="text" size="small" status="danger" @click="unbindEntity(rowIndex)">解除绑定</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 血缘构建 -->
      <a-tab-pane key="lineage" title="血缘构建">
        <div class="tab-content">
          <div class="toolbar">
            <a-button type="primary" @click="autoParseLineage">
              <template #icon><IconBranch /></template>
              自动解析血缘
            </a-button>
            <a-button style="margin-left: 8px" @click="showLineageModal">手动添加关系</a-button>
          </div>
          <a-table :data="lineageData" :pagination="false">
            <template #columns>
              <a-table-column title="上游表 (Source)" data-index="sourceTable" />
              <a-table-column title="下游表 (Target)" data-index="targetTable" />
              <a-table-column title="转换逻辑" data-index="transformLogic" ellipsis tooltip />
              <a-table-column title="关系类型" data-index="type">
                <template #cell="{ record }">
                  <a-tag>{{ record.type }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作">
                <template #cell>
                  <a-button type="text" size="small" @click="viewLineageGraph">查看图谱</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 标准映射 -->
      <a-tab-pane key="standard-mapping" title="标准映射">
        <div class="tab-content">
          <div class="toolbar">
            <a-button type="primary" @click="autoMapStandards">
              <template #icon><IconCheckCircle /></template>
              智能匹配标准
            </a-button>
          </div>
          <a-table :data="standardMappingData" :pagination="false">
            <template #columns>
              <a-table-column title="物理字段" data-index="fieldName" />
              <a-table-column title="所属表" data-index="tableName" />
              <a-table-column title="映射数据标准" data-index="standardCode">
                <template #cell="{ record }">
                  <a-space>
                    <a-tag color="orange">{{ record.standardCode }}</a-tag>
                    <span>{{ record.standardName }}</span>
                  </a-space>
                </template>
              </a-table-column>
              <a-table-column title="一致性状态" data-index="compliance">
                <template #cell="{ record }">
                   <a-tag :color="record.compliance === 'compliant' ? 'green' : 'red'">
                     {{ record.compliance === 'compliant' ? '符合' : '不符合' }}
                   </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作">
                <template #cell="{ record, rowIndex }">
                  <a-button type="text" size="small" @click="showMappingModal(record, rowIndex)">修正映射</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 弹窗：绑定业务实体 -->
    <a-modal v-model:visible="bindModalVisible" title="绑定业务实体" @ok="handleBindSubmit" @cancel="bindModalVisible = false">
      <a-form :model="bindForm" layout="vertical">
        <a-form-item label="物理表名" required>
          <a-select v-model="bindForm.tableName" placeholder="请选择物理表名" allow-search>
            <a-option v-for="table in availableTables" :key="table" :value="table">{{ table }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属库" required>
          <a-select v-model="bindForm.database" placeholder="请选择所属库" allow-create>
            <a-option value="credit_core_db">credit_core_db</a-option>
            <a-option value="crm_db">crm_db</a-option>
            <a-option value="payment_gw">payment_gw</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="业务域" required>
          <a-select v-model="bindForm.businessDomain" placeholder="请选择业务域">
            <a-option v-for="domain in availableDomains" :key="domain.code" :value="domain.name">{{ domain.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="业务实体" required>
          <a-select v-model="bindForm.businessEntity" placeholder="请选择业务实体" :disabled="!bindForm.businessDomain">
            <a-option v-for="entity in filteredEntities" :key="entity.code" :value="entity.name">{{ entity.name }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 弹窗：手动添加血缘关系 -->
    <a-modal v-model:visible="lineageModalVisible" title="添加血缘关系" @ok="handleLineageSubmit" @cancel="lineageModalVisible = false">
      <a-form :model="lineageForm" layout="vertical">
        <a-form-item label="上游表 (Source)" required>
          <a-select v-model="lineageForm.sourceTable" placeholder="请选择上游表名" allow-search>
            <a-option v-for="table in availableTables" :key="table" :value="table">{{ table }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="下游表 (Target)" required>
          <a-select v-model="lineageForm.targetTable" placeholder="请选择下游表名" allow-search>
            <a-option v-for="table in availableTables" :key="table" :value="table">{{ table }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关系类型" required>
          <a-select v-model="lineageForm.type" placeholder="请选择关系类型">
            <a-option value="ETL">ETL</a-option>
            <a-option value="Aggregation">Aggregation</a-option>
            <a-option value="Join">Join</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="转换逻辑">
          <a-textarea v-model="lineageForm.transformLogic" placeholder="请输入转换逻辑或SQL片段" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 弹窗：修正标准映射 -->
    <a-modal v-model:visible="mappingModalVisible" title="修正标准映射" @ok="handleMappingSubmit" @cancel="mappingModalVisible = false">
      <a-form :model="mappingForm" layout="vertical">
        <a-form-item label="物理字段">
          <a-input v-model="mappingForm.fieldName" disabled />
        </a-form-item>
        <a-form-item label="所属表">
          <a-input v-model="mappingForm.tableName" disabled />
        </a-form-item>
        <a-form-item label="映射数据标准" required>
          <a-select v-model="mappingForm.standardCode" placeholder="请选择数据标准" allow-search>
            <a-option v-for="std in availableStandards" :key="std.id" :value="std.standardNo">
              {{ std.standardNo }} ({{ std.chineseName }})
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="一致性状态" required>
          <a-radio-group v-model="mappingForm.compliance">
            <a-radio value="compliant">符合</a-radio>
            <a-radio value="non_compliant">不符合</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconLink, IconBranch, IconCheckCircle } from '@arco-design/web-vue/es/icon'
import { BusinessConceptStore } from '@/mock/shared/business-concept-store'
import { MetadataStore } from '@/mock/shared/metadata-store'
import { StandardStore } from '@/mock/shared/standard-store'

const router = useRouter()

// ===== Store Data =====
const availableTables = computed(() => MetadataStore.getTables().map(t => t.name))
const availableDomains = computed(() => BusinessConceptStore.getDomains())
const availableEntities = computed(() => BusinessConceptStore.getEntities())
const availableStandards = computed(() => StandardStore.getStandards())

// ===== 实体绑定逻辑 =====
const entityBindingData = ref([
  { id: 1, tableName: 'dwd_user_register', database: 'user_center_db', businessDomain: '客户域', businessEntity: '客户', status: 'bound' },
  { id: 2, tableName: 'dwd_realname_auth', database: 'user_center_db', businessDomain: '客户域', businessEntity: '客户', status: 'bound' },
  { id: 3, tableName: 'dwd_credit_apply', database: 'credit_core_db', businessDomain: '授信域', businessEntity: '授信申请', status: 'bound' },
  { id: 4, tableName: 'dwd_loan_drawdown', database: 'credit_core_db', businessDomain: '支用域', businessEntity: '支用单', status: 'bound' },
  { id: 5, tableName: 'dws_repayment_plan', database: 'repayment_db', businessDomain: '还款域', businessEntity: '还款计划', status: 'bound' },
  { id: 6, tableName: 'dws_post_loan_monitor', database: 'risk_db', businessDomain: '贷后域', businessEntity: '贷后记录', status: 'unbound' },
])

const bindModalVisible = ref(false)
const bindForm = reactive({
  tableName: '',
  database: '',
  businessDomain: '',
  businessEntity: ''
})

// 根据选择的业务域过滤业务实体
const filteredEntities = computed(() => {
  if (!bindForm.businessDomain) return availableEntities.value
  const domain = availableDomains.value.find(d => d.name === bindForm.businessDomain)
  if (!domain) return availableEntities.value
  return availableEntities.value.filter(e => e.domainCode === domain.code)
})

const showBindModal = () => {
  bindForm.tableName = ''
  bindForm.database = ''
  bindForm.businessDomain = ''
  bindForm.businessEntity = ''
  bindModalVisible.value = true
}

const handleBindSubmit = () => {
  if (!bindForm.tableName || !bindForm.database || !bindForm.businessDomain || !bindForm.businessEntity) {
    Message.warning('请填写完整的绑定信息')
    return false
  }
  entityBindingData.value.push({
    id: Date.now(),
    tableName: bindForm.tableName,
    database: bindForm.database,
    businessDomain: bindForm.businessDomain,
    businessEntity: bindForm.businessEntity,
    status: 'bound'
  })
  Message.success('绑定成功')
  bindModalVisible.value = false
}

const unbindEntity = (index: number) => {
  entityBindingData.value.splice(index, 1)
  Message.success('已解除绑定')
}

// ===== 血缘构建逻辑 =====
const lineageData = ref([
  { id: 1, sourceTable: 'dwd_user_register', targetTable: 'dwd_realname_auth', transformLogic: 'join register_info on user_id', type: 'Join' },
  { id: 2, sourceTable: 'dwd_realname_auth', targetTable: 'dwd_credit_apply', transformLogic: 'select * where auth_status = "SUCCESS"', type: 'Filter' },
  { id: 3, sourceTable: 'dwd_credit_apply', targetTable: 'dwd_loan_drawdown', transformLogic: 'join credit_info on apply_id', type: 'ETL' },
  { id: 4, sourceTable: 'dwd_loan_drawdown', targetTable: 'dws_repayment_plan', transformLogic: 'generate plan by term and rate', type: 'Calculation' },
  { id: 5, sourceTable: 'dws_repayment_plan', targetTable: 'dws_post_loan_monitor', transformLogic: 'aggregate overdue status', type: 'Aggregation' }
])

const lineageModalVisible = ref(false)
const lineageForm = reactive({
  sourceTable: '',
  targetTable: '',
  transformLogic: '',
  type: ''
})

const autoParseLineage = () => {
  Message.success('已触发自动化血缘解析任务，后台运行中...')
}

const showLineageModal = () => {
  lineageForm.sourceTable = ''
  lineageForm.targetTable = ''
  lineageForm.transformLogic = ''
  lineageForm.type = ''
  lineageModalVisible.value = true
}

const handleLineageSubmit = () => {
  if (!lineageForm.sourceTable || !lineageForm.targetTable || !lineageForm.type) {
    Message.warning('请填写完整的血缘信息')
    return false
  }
  lineageData.value.push({
    id: Date.now(),
    sourceTable: lineageForm.sourceTable,
    targetTable: lineageForm.targetTable,
    transformLogic: lineageForm.transformLogic,
    type: lineageForm.type
  })
  Message.success('添加成功')
  lineageModalVisible.value = false
}

const viewLineageGraph = () => {
  Message.info('正在打开血缘图谱分析页...')
  router.push('/discovery/lineage')
}

// ===== 标准映射逻辑 =====
const standardMappingData = ref([
  { id: 1, fieldName: 'user_id', tableName: 'dwd_user_register', standardCode: 'STD_ID_001', standardName: '用户ID', compliance: 'compliant' },
  { id: 2, fieldName: 'id_card', tableName: 'dwd_realname_auth', standardCode: 'STD_ID_002', standardName: '身份证号', compliance: 'compliant' },
  { id: 3, fieldName: 'apply_amount', tableName: 'dwd_credit_apply', standardCode: 'STD_AMT_001', standardName: '申请金额', compliance: 'compliant' },
  { id: 4, fieldName: 'drawdown_amount', tableName: 'dwd_loan_drawdown', standardCode: 'STD_AMT_002', standardName: '支用金额', compliance: 'compliant' },
  { id: 5, fieldName: 'due_amount', tableName: 'dws_repayment_plan', standardCode: 'STD_AMT_003', standardName: '应还金额', compliance: 'compliant' },
  { id: 6, fieldName: 'overdue_days', tableName: 'dws_post_loan_monitor', standardCode: 'STD_NUM_001', standardName: '逾期天数', compliance: 'non_compliant' },
])

const mappingModalVisible = ref(false)
const currentMappingIndex = ref(-1)
const mappingForm = reactive({
  fieldName: '',
  tableName: '',
  standardCode: '',
  standardName: '',
  compliance: ''
})

const autoMapStandards = () => {
  Message.success('已触发智能标准匹配任务，这可能需要几分钟时间...')
}

const showMappingModal = (record: any, index: number) => {
  currentMappingIndex.value = index
  mappingForm.fieldName = record.fieldName
  mappingForm.tableName = record.tableName
  mappingForm.standardCode = record.standardCode
  mappingForm.standardName = record.standardName
  mappingForm.compliance = record.compliance
  mappingModalVisible.value = true
}

const handleMappingSubmit = () => {
  if (currentMappingIndex.value > -1) {
    const selectedStandard = availableStandards.value.find(s => s.standardNo === mappingForm.standardCode)
    
    standardMappingData.value[currentMappingIndex.value].standardCode = mappingForm.standardCode
    standardMappingData.value[currentMappingIndex.value].standardName = selectedStandard ? selectedStandard.chineseName : ''
    standardMappingData.value[currentMappingIndex.value].compliance = mappingForm.compliance
    Message.success('修正映射成功')
  }
  mappingModalVisible.value = false
}
</script>

<style scoped>
.metadata-modeling-container {
  padding: 24px;
  background-color: var(--color-bg-1);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
}

.description {
  color: var(--color-text-3);
  margin: 0;
}

.tab-content {
  padding-top: 16px;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
</style>