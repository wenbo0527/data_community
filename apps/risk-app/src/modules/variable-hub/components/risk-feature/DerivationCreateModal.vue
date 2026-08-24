<template>
  <a-modal
    :visible="visible"
    :title="title || '新建需求'"
    :width="960"
    :ok-loading="submitting"
    :ok-text="okText || '提交'"
    :cancel-text="cancelText || '取消'"
    :mask-closable="false"
    @ok="onOk"
    @cancel="onCancel"
  >
    <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
      <!-- 区块 1：需求管理信息 -->
      <div class="form-section">
        <div class="section-title">需求管理信息</div>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="需求名称" field="name" required>
              <a-input v-model="form.name" :max-length="50" placeholder="≤50字" show-word-limit />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="业务场景" field="businessScene" required>
              <a-select v-model="form.businessScene">
                <a-option value="贷前">贷前</a-option>
                <a-option value="贷中">贷中</a-option>
                <a-option value="贷后">贷后</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="品类" field="category">
              <a-select v-model="form.category" disabled>
                <a-option value="midloan_behavior">贷中行为（锁定）</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关联数据源" field="dataSource" required>
              <a-select v-model="form.dataSource">
                <a-option value="Hbase">Hbase（贷中行为品类）</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="数据时效" field="dataFreshness">
              <a-select v-model="form.dataFreshness" allow-clear placeholder="可选">
                <a-option v-for="opt in DATA_FRESHNESS" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="开发人员" field="developer" required>
              <a-select v-model="form.developer" placeholder="从数仓团队成员选择">
                <a-option value="王数仓">王数仓</a-option>
                <a-option value="李数仓">李数仓</a-option>
                <a-option value="张数仓">张数仓</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="处理人" field="handler">
              <a-select v-model="form.handler" allow-clear placeholder="选择业务方处理人">
                <a-option value="业务方-张三">业务方-张三</a-option>
                <a-option value="业务方-李四">业务方-李四</a-option>
                <a-option value="业务方-王五">业务方-王五</a-option>
                <a-option value="业务方-赵六">业务方-赵六</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="业务同步等级" field="syncLevel">
              <a-select v-model="form.syncLevel" allow-clear placeholder="选择同步等级">
                <a-option value="S">S级（核心）</a-option>
                <a-option value="A">A级（重要）</a-option>
                <a-option value="B">B级（一般）</a-option>
                <a-option value="C">C级（低优先）</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="预期效果" field="expectedEffect" required>
              <a-textarea v-model="form.expectedEffect" :max-length="200" show-word-limit placeholder="≤200字" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 区块 2：特征核心属性 -->
      <div class="form-section">
        <div class="section-title">特征核心属性</div>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="特征英文名" field="featureEnName" required>
              <a-input v-model="form.featureEnName" :max-length="30" placeholder="英文大小写+下划线，≤30字" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="中文名" field="featureCnName" required>
              <a-input v-model="form.featureCnName" placeholder="不可重复" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="字段类型" field="fieldType" required>
              <a-select v-model="form.fieldType">
                <a-option v-for="opt in FIELD_TYPES" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="默认值" field="defaultValue">
              <a-input v-model="form.defaultValue" placeholder="可选" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="加工逻辑" field="processingLogic" required>
              <a-textarea v-model="form.processingLogic" :rows="3" placeholder="长文本，描述特征的衍生/计算规则" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 区块 3：特征分类信息 -->
      <div class="form-section">
        <div class="section-title">特征分类信息</div>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="特征分类" field="categoryLocked">
              <a-select v-model="form.categoryLocked" disabled>
                <a-option value="midloan_behavior">贷中行为（锁定）</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="一级分类" field="l1Category" required>
              <a-select v-model="form.l1Category" placeholder="选择一级分类">
                <a-option v-for="opt in MIDLOAN_L1_CATEGORIES" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="二级分类" field="l2Category" required>
              <a-input v-model="form.l2Category" placeholder="与一级联动（如：还款_波动率）" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 区块 4：来源与时效（可选） -->
      <div class="form-section">
        <div class="section-title">来源与时效（可选）</div>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="标准化后来源表" field="sourceTableAfter">
              <a-input v-model="form.sourceTableAfter" placeholder="如：ads_xxx" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="标准化前来源表" field="sourceTableBefore">
              <a-input v-model="form.sourceTableBefore" placeholder="如：dwd_xxx" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="原特征英文名" field="originFeatureEnName">
              <a-input v-model="form.originFeatureEnName" placeholder="可选" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <a-alert type="info" :show-icon="false" style="margin-top:8px">
        提交后将生成需求 ID <b>DRV-{{ todayYmd }}-NNNN</b>，状态：<a-tag color="blue">需求受理</a-tag>
      </a-alert>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { DATA_FRESHNESS, FIELD_TYPES, MIDLOAN_L1_CATEGORIES } from '@/modules/variable-hub/constants/riskCategoryMap'

const props = defineProps({
  visible: Boolean,
  initial: Object,
  title: String,
  okText: String,
  cancelText: String
})
const emit = defineEmits(['ok', 'cancel'])

const formRef = ref(null)
const submitting = ref(false)

const todayYmd = computed(() => new Date().toISOString().slice(0, 10).replace(/-/g, ''))

const form = reactive({
  name: '',
  businessScene: '贷中',
  category: 'midloan_behavior',
  categoryLocked: 'midloan_behavior',
  dataSource: 'Hbase',
  dataFreshness: '',
  developer: '',
  handler: '',
  syncLevel: '',
  expectedEffect: '',
  featureEnName: '',
  featureCnName: '',
  fieldType: 'Integer',
  defaultValue: '',
  processingLogic: '',
  l1Category: '',
  l2Category: '',
  sourceTableAfter: '',
  sourceTableBefore: '',
  originFeatureEnName: ''
})

const rules = {
  name: [{ required: true, message: '需求名称必填' }],
  expectedEffect: [{ required: true, message: '预期效果必填' }],
  developer: [{ required: true, message: '开发人员必填' }],
  featureEnName: [
    { required: true, message: '特征英文名必填' },
    { match: /^[A-Za-z][A-Za-z0-9_]*$/, message: '只允许英文/数字/下划线，且不能以数字开头' }
  ],
  featureCnName: [{ required: true, message: '中文名必填' }],
  fieldType: [{ required: true, message: '字段类型必填' }],
  processingLogic: [{ required: true, message: '加工逻辑必填' }],
  l1Category: [{ required: true, message: '一级分类必填' }],
  l2Category: [{ required: true, message: '二级分类必填' }]
}

const onOk = async () => {
  if (!formRef.value) return
  try {
    const errors = await formRef.value.validate()
    if (errors) {
      Message.warning('请补全必填项')
      return
    }
    submitting.value = true
    emit('ok', { ...form })
  } finally {
    submitting.value = false
  }
}

const onCancel = () => emit('cancel')
</script>

<style scoped>
.form-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--color-border-2, #e5e6eb);
}
.form-section:last-of-type {
  border-bottom: none;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text-1, #1d2129);
}
</style>