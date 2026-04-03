<template>
  <div class="online-call-application">
    <a-page-header title="外数线上调用服务申请" subtitle="针对风险贷中单次或周期发起的线上调用服务申请">
      <template #extra>
        <a-button @click="goBack">返回</a-button>
      </template>
    </a-page-header>

    <a-card class="apply-card">
      <a-steps :current="currentStep" style="margin-bottom: 24px">
        <a-step title="基础信息" description="选择外数产品、团队经理和申请说明" />
        <a-step title="样本选择" description="选择样本库表" />
        <a-step title="参数绑定" description="绑定参数列并提交" />
      </a-steps>

      <div class="step-content">
        <!-- 步骤1：基础信息 -->
        <div v-show="currentStep === 0">
          <a-form :model="step1Form" layout="vertical" class="step-form">
            <a-form-item label="外数产品" field="product" required>
              <a-select v-model="step1Form.product" placeholder="请选择外数产品" allow-search allow-clear>
                <a-option v-for="p in productOptions" :key="p" :value="p">{{ p }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="团队经理" field="manager" required>
              <a-select v-model="step1Form.manager" placeholder="请选择团队经理" allow-search allow-clear>
                <a-option v-for="m in managerOptions" :key="m" :value="m">{{ m }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="申请说明" field="description" required>
              <a-textarea
                v-model="step1Form.description"
                placeholder="请描述申请该服务的业务背景和用途"
                :rows="4"
                :max-length="500"
                show-word-limit
              />
            </a-form-item>
          </a-form>
        </div>

        <!-- 步骤2：样本选择 -->
        <div v-show="currentStep === 1">
          <a-form :model="step2Form" layout="vertical" class="step-form">
            <a-form-item label="样本库表" field="sampleTable" required>
              <a-select
                v-model="step2Form.sampleTable"
                placeholder="请选择样本库表"
                allow-search
                @change="handleSampleTableChange"
              >
                <a-option v-for="t in sampleTableOptions" :key="t.id" :value="t.id">
                  {{ t.logicName }} (V{{ t.version }})
                </a-option>
              </a-select>
            </a-form-item>

            <a-alert v-if="selectedSampleTable" type="info" style="margin-top: 16px">
              <template #title>已选样本表信息</template>
              <a-descriptions :column="2" size="small">
                <a-descriptions-item label="样本表名称">{{ selectedSampleTable.logicName }}</a-descriptions-item>
                <a-descriptions-item label="当前版本">{{ selectedSampleTable.version }}</a-descriptions-item>
                <a-descriptions-item label="创建人">{{ selectedSampleTable.creator }}</a-descriptions-item>
                <a-descriptions-item label="更新时间">{{ selectedSampleTable.updateTime }}</a-descriptions-item>
              </a-descriptions>
            </a-alert>
          </a-form>
        </div>

        <!-- 步骤3：参数绑定 -->
        <div v-show="currentStep === 2">
          <a-form layout="vertical" class="step-form">
            <a-alert type="info" style="margin-bottom: 16px">
              请将样本表字段与外数产品的查询要素进行映射绑定。至少需要绑定身份证、手机号、姓名（如产品需要）。
            </a-alert>

            <a-table :data="step3Form.bindings" :pagination="false" row-key="key">
              <template #columns>
                <a-table-column title="产品要素" data-index="element" :width="180">
                  <template #cell="{ rowIndex }">
                    <a-select v-model="step3Form.bindings[rowIndex].element" placeholder="选择要素">
                      <a-option value="idCard">身份证</a-option>
                      <a-option value="name">姓名</a-option>
                      <a-option value="mobile">手机号</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="样本字段" data-index="sampleField" :width="180">
                  <template #cell="{ rowIndex }">
                    <a-select v-model="step3Form.bindings[rowIndex].sampleField" placeholder="选择字段">
                      <a-option v-for="f in sampleFields" :key="f" :value="f">{{ f }}</a-option>
                    </a-select>
                  </template>
                </a-table-column>
                <a-table-column title="映射说明" data-index="description">
                  <template #cell="{ rowIndex }">
                    <a-input v-model="step3Form.bindings[rowIndex].description" placeholder="可选说明" />
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="80" align="center">
                  <template #cell="{ rowIndex }">
                    <a-button
                      type="text"
                      status="danger"
                      size="small"
                      @click="removeBinding(rowIndex)"
                      :disabled="step3Form.bindings.length <= 1"
                    >
                      删除
                    </a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>

            <a-button type="outline" style="margin-top: 12px" @click="addBinding">
              <template #icon><icon-plus /></template>
              添加绑定
            </a-button>
          </a-form>
        </div>
      </div>

      <div class="step-footer">
        <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
        <a-space style="margin-left: auto">
          <a-button @click="goBack">取消</a-button>
          <a-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</a-button>
          <a-button v-if="currentStep === 2" type="primary" :loading="submitting" @click="submitApplication">
            提交申请
          </a-button>
        </a-space>
      </div>
    </a-card>

    <a-modal v-model:visible="successVisible" title="提交成功" :footer="false" closable @ok="goBack" @cancel="goBack">
      <a-result status="success" title="申请已提交">
        <template #subtitle>您的外数线上调用服务申请已成功提交，状态为「审批中」。</template>
        <template #extra>
          <a-button type="primary" @click="goBack">返回服务列表</a-button>
        </template>
      </a-result>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const currentStep = ref(0)
const submitting = ref(false)
const successVisible = ref(false)

const productOptions = ref(['芝麻信用评分', '腾讯征信分', '百行征信报告', '多头借贷查询', '运营商数据'])
const managerOptions = ref(['张三', '李四', '王五', '赵六', '钱七'])

const sampleTableOptions = ref([
  { id: 'sample_1', logicName: 'sample_risk_model_v1', version: 'V1.0', creator: '张三', updateTime: '2023-10-27 10:30:00' },
  { id: 'sample_2', logicName: 'sample_credit_check_v2', version: 'V1.1', creator: '李四', updateTime: '2023-10-25 15:20:00' },
  { id: 'sample_3', logicName: 'sample_fraud_detection_v1', version: 'V1.2', creator: '王五', updateTime: '2023-10-20 09:00:00' }
])

const step1Form = reactive({
  product: '',
  manager: '',
  description: ''
})

const step2Form = reactive({
  sampleTable: ''
})

const step3Form = reactive({
  bindings: [
    { key: 1, element: 'idCard', sampleField: '', description: '' },
    { key: 2, element: 'mobile', sampleField: '', description: '' },
    { key: 3, element: 'name', sampleField: '', description: '' }
  ]
})

const sampleFields = ref(['id_no', 'cert_num', 'name', 'cust_name', 'phone', 'mobile_no'])

const selectedSampleTable = computed(() => {
  return sampleTableOptions.value.find(t => t.id === step2Form.sampleTable)
})

const handleSampleTableChange = (value: string) => {
  if (value) {
    Message.success('已选择样本表')
    sampleFields.value = ['id_no', 'cert_num', 'name', 'cust_name', 'phone', 'mobile_no', 'email', 'address']
  }
}

const addBinding = () => {
  step3Form.bindings.push({
    key: Date.now(),
    element: '',
    sampleField: '',
    description: ''
  })
}

const removeBinding = (index: number) => {
  step3Form.bindings.splice(index, 1)
}

const nextStep = () => {
  if (currentStep.value === 0) {
    if (!step1Form.product) {
      Message.warning('请选择外数产品')
      return
    }
    if (!step1Form.manager) {
      Message.warning('请选择团队经理')
      return
    }
    if (!step1Form.description) {
      Message.warning('请填写申请说明')
      return
    }
  } else if (currentStep.value === 1) {
    if (!step2Form.sampleTable) {
      Message.warning('请选择样本库表')
      return
    }
  }
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const submitApplication = () => {
  const validBindings = step3Form.bindings.filter(b => b.element && b.sampleField)
  if (validBindings.length === 0) {
    Message.warning('请至少完成一项参数绑定')
    return
  }

  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    successVisible.value = true
  }, 1500)
}

const goBack = () => {
  successVisible.value = false
  router.push({ name: 'RiskExternalDataService' })
}
</script>

<style scoped>
.online-call-application {
  padding: 0 16px;
}

.apply-card {
  margin-top: 20px;
}

.step-content {
  min-height: 300px;
  padding: 16px 0;
}

.step-form {
  max-width: 600px;
}

.step-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--color-neutral-3);
}
</style>