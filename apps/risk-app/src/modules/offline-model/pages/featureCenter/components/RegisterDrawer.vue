<template>
  <a-drawer :visible="visible" width="90vw" title="注册特征" @cancel="handleClose" :mask-closable="false">
    <a-form ref="registerFormRef" :model="registerForm" :rules="registerRules" layout="vertical" class="register-form" auto-label-width validation-trigger="blur">
      <a-collapse :default-active-key="['basic', 'source', 'management']" :bordered="false">
        <!-- 第一部分：基础属性与分类 -->
        <a-collapse-item key="basic" header="1. 基础属性与分类">
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="特征大类" required field="majorCategory">
                <a-radio-group v-model="registerForm.majorCategory" type="button" size="small">
                  <a-radio value="credit">征信变量</a-radio>
                  <a-radio value="behavior">行为变量</a-radio>
                  <a-radio value="model_output">模型输出</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="特征编码" required field="code">
                <a-input v-model="registerForm.code" placeholder="如：score_v1" size="small" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="特征名称" required field="name">
                <a-input v-model="registerForm.name" placeholder="请输入名称" size="small" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="数据类型" required field="dataType">
                <a-select v-model="registerForm.dataType" placeholder="请选择" size="small">
                  <a-option value="int">int</a-option>
                  <a-option value="double">double</a-option>
                  <a-option value="string">string</a-option>
                  <a-option value="timestamp">timestamp</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="备注" field="remark">
                <a-textarea v-model="registerForm.remark" placeholder="请输入备注" :auto-size="{minRows:1,maxRows:3}" style="resize: none;" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-item>

        <!-- 第二部分：数据来源与加工逻辑 -->
        <a-collapse-item key="source" header="2. 数据来源与加工逻辑">

          <div class="mapping-section" style="margin-bottom: 24px">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 500;">数据来源配置</span>
            </div>

            <div v-if="registerForm.dataSourceMappings.length === 0" class="empty-mapping">
              <a-button type="outline" size="small" @click="addDataSourceMapping">
                <template #icon><icon-plus /></template>
                添加配置
              </a-button>
            </div>

            <div v-else class="mapping-table-container">
              <a-row :gutter="12" class="mapping-header-row" style="margin-bottom: 8px; font-size: 12px; color: var(--subapp-text-tertiary);">
                <a-col :span="4">模型类型</a-col>
                <a-col :span="5">来源表</a-col>
                <a-col :span="5">表主键</a-col>
                <a-col :span="4">字段名</a-col>
                <a-col :span="4">日期字段</a-col>
                <a-col :span="2">操作</a-col>
              </a-row>
              <div v-for="(mapping, mIdx) in registerForm.dataSourceMappings" :key="mIdx" class="mapping-row" style="margin-bottom: 8px;">
                <a-row :gutter="12" align="center">
                  <a-col :span="4">
                    <a-select v-model="mapping.modelType" placeholder="模型类型" size="small">
                      <a-option value="daily">日模型</a-option>
                      <a-option value="monthly">月模型</a-option>
                      <a-option value="other">其他模型</a-option>
                    </a-select>
                  </a-col>
                  <a-col :span="5">
                    <a-input v-model="mapping.sourceTable" placeholder="来源表名" size="small" />
                  </a-col>
                  <a-col :span="5">
                    <a-input v-model="mapping.tablePrimaryKey" placeholder="表主键" size="small" />
                  </a-col>
                  <a-col :span="4">
                    <a-input v-model="mapping.fieldName" placeholder="字段名" size="small" />
                  </a-col>
                  <a-col :span="4">
                    <a-input v-model="mapping.dateField" placeholder="日期字段" size="small" />
                  </a-col>
                  <a-col :span="2">
                    <a-space>
                      <a-button type="text" status="success" size="small" @click="addDataSourceMapping(mIdx)">
                        <template #icon><icon-plus /></template>
                      </a-button>
                      <a-button type="text" status="danger" size="small" @click="removeDataSourceMapping(mIdx)">
                        <template #icon><icon-minus /></template>
                      </a-button>
                    </a-space>
                  </a-col>
                </a-row>
              </div>
            </div>
          </div>

          <a-alert v-if="registerForm.majorCategory==='model_output'" type="info">
            来源自动填充为平台模型输出
          </a-alert>
        </a-collapse-item>

        <!-- 第三部分：管理信息与映射规则 -->
        <a-collapse-item key="management" header="3. 映射规则">

          <div class="mapping-section" style="margin-top: 16px">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 500;">默认值转化映射</span>
              <a-button type="outline" size="small" @click="addMappingGroup">
                <template #icon><icon-plus /></template>
                添加特征映射
              </a-button>
            </div>

            <div v-if="registerForm.defaultValueMappings.length === 0" class="empty-mapping">
              暂无映射规则，请点击上方按钮添加
            </div>

            <div v-else>
              <div v-for="(mapping, mIdx) in registerForm.defaultValueMappings" :key="mIdx" class="mapping-card" style="margin-bottom: 16px; border: 1px solid var(--subapp-border); padding: 12px; border-radius: 4px;">
                <a-row :gutter="12" align="center" style="margin-bottom: 12px;">
                  <a-col :span="20">
                     <a-form-item label="老特征名" label-col-flex="80px" style="margin-bottom:0" required>
                       <a-input v-model="mapping.oldFeatureName" placeholder="请输入老特征名" size="small" />
                     </a-form-item>
                  </a-col>
                  <a-col :span="4" style="text-align: right;">
                     <a-button type="text" status="danger" size="small" @click="removeMappingGroup(mIdx)">
                       删除分组
                     </a-button>
                  </a-col>
                </a-row>

                <div style="background: #f7f8fa; padding: 8px; border-radius: 4px;">
                   <a-row :gutter="12" style="margin-bottom: 8px; font-size: 12px; color: var(--subapp-text-tertiary);">
                     <a-col :span="10">原值</a-col>
                     <a-col :span="10">映射值</a-col>
                     <a-col :span="4">操作</a-col>
                   </a-row>
                   <div v-for="(rule, rIdx) in mapping.rules" :key="rIdx" style="margin-bottom: 8px;">
                     <a-row :gutter="12">
                       <a-col :span="10">
                         <a-input v-model="rule.origin" placeholder="原值" size="small" />
                       </a-col>
                       <a-col :span="10">
                         <a-input v-model="rule.target" placeholder="映射值" size="small" />
                       </a-col>
                       <a-col :span="4">
                         <a-space>
                           <a-button type="text" status="success" size="small" @click="addRule(mIdx, rIdx)">
                             <template #icon><icon-plus /></template>
                           </a-button>
                           <a-button type="text" status="danger" size="small" @click="removeRule(mIdx, rIdx)">
                             <template #icon><icon-minus /></template>
                           </a-button>
                         </a-space>
                       </a-col>
                     </a-row>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </a-collapse-item>
      </a-collapse>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="submitRegister">提交</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { featureAPI, modelAPI } from '@/modules/offline-model/api'
import { registerRules, level1Options, getEffectiveLevel1Options, typeMap } from '../shared'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'success'])

const modelList = ref([])
const registerFormRef = ref(null)

const registerForm = reactive({
  majorCategory: 'credit',
  level1: '',
  level2: '',
  code: '',
  name: '',
  processingLogic: '',
  dataType: 'double',
  defaultValue: '',
  batch: '',
  proposer: '',
  developer: '',
  onlineTime: '',
  accepter: '',
  remark: '',
  modelCode: '',
  modelType: ['daily'],
  updateFrequency: '按需',
  defaultValueMappings: [{ oldFeatureName: '', rules: [{ origin: '', target: '' }] }],
  dataSourceMappings: [{ modelType: 'daily', sourceTable: '', fieldName: '', tablePrimaryKey: '', dateField: '' }]
})

const effectiveLevel1Options = computed(() => getEffectiveLevel1Options(registerForm.majorCategory))

// 抽屉打开时加载模型列表
watch(() => props.visible, async (val) => {
  if (val) {
    try {
      const res = await modelAPI.getModels({ page: 1, pageSize: 200 })
      modelList.value = res.success ? res.data : []
    } catch (err) {
      console.error('获取模型列表失败:', err)
      Message.error({ content: '获取模型列表失败', duration: 6000 })
    }
  }
})

// 特征大类变化时联动一级分类
watch(() => registerForm.majorCategory, (cat) => {
  if (cat === 'model_output') {
    registerForm.level1 = 'model_outputs'
    registerForm.level2 = ''
    registerForm.dataSourceMappings = []
  } else if (cat === 'credit') {
    if (registerForm.level1 !== 'credit_report' && registerForm.level1 !== 'credit_history') {
      registerForm.level1 = 'credit_report'
    }
  } else if (cat === 'behavior') {
    if (registerForm.level1 !== 'transaction_behavior' && registerForm.level1 !== 'activity') {
      registerForm.level1 = 'transaction_behavior'
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const addMappingGroup = () => {
  registerForm.defaultValueMappings.push({ oldFeatureName: '', rules: [{ origin: '', target: '' }] })
}
const removeMappingGroup = (index) => {
  registerForm.defaultValueMappings.splice(index, 1)
}
const addRule = (gIdx, rIdx) => {
  registerForm.defaultValueMappings[gIdx].rules.splice(rIdx + 1, 0, { origin: '', target: '' })
}
const removeRule = (gIdx, rIdx) => {
  const rules = registerForm.defaultValueMappings[gIdx].rules
  if (rules.length > 1) {
    rules.splice(rIdx, 1)
  } else {
    rules[rIdx] = { origin: '', target: '' }
  }
}

const addDataSourceMapping = (index) => {
  if (typeof index === 'number') {
    registerForm.dataSourceMappings.splice(index + 1, 0, { modelType: 'daily', sourceTable: '', fieldName: '', tablePrimaryKey: '', dateField: '' })
  } else {
    registerForm.dataSourceMappings.push({ modelType: 'daily', sourceTable: '', fieldName: '', tablePrimaryKey: '', dateField: '' })
  }
}
const removeDataSourceMapping = (index) => {
  registerForm.dataSourceMappings.splice(index, 1)
}

const submitRegister = async () => {
  const errors = await registerFormRef.value?.validate()
  if (errors) return

  const isModelOutput = registerForm.majorCategory === 'model_output'
  if (isModelOutput && !registerForm.modelCode) {
    Message.error({ content: '请选择已注册的模型', duration: 6000 })
    return
  }

  const selectedModel = isModelOutput ? (modelList.value || []).find(m => m.code === registerForm.modelCode) : null

  const dailyMapping = registerForm.dataSourceMappings.find(m => m.modelType === 'daily')
  const monthlyMapping = registerForm.dataSourceMappings.find(m => m.modelType === 'monthly')

  const payload = {
    name: registerForm.name,
    code: registerForm.code,
    type: typeMap(registerForm.dataType),
    description: registerForm.processingLogic || '',
    dataSource: (isModelOutput && !registerForm.modelType.includes('daily')) ? '平台模型输出' : (dailyMapping?.sourceTable || ''),
    monthlyDataSource: monthlyMapping?.sourceTable || '',
    updateFrequency: registerForm.modelType.includes('monthly') ? '月度' : (registerForm.updateFrequency || '按需'),
    majorCategory: registerForm.majorCategory,
    level1: isModelOutput ? 'model_outputs' : registerForm.level1,
    level2: isModelOutput ? (registerForm.modelCode || '') : registerForm.level2,
    batch: registerForm.batch,
    proposer: registerForm.proposer,
    developer: registerForm.developer,
    onlineTime: registerForm.onlineTime,
    accepter: registerForm.accepter,
    remark: registerForm.remark,
    sourceType: isModelOutput ? 'model_output' : '',
    sourceRefId: isModelOutput ? (registerForm.modelCode || '') : '',
    creator: isModelOutput ? (selectedModel?.creator || '平台模型') : undefined,
    modelType: registerForm.modelType,
    defaultValueMappings: registerForm.defaultValueMappings,
    dataSourceMappings: registerForm.dataSourceMappings
  }

  try {
    const res = await featureAPI.createFeature(payload)
    if (res.success) {
      Message.success({ content: res.message || '创建成功', duration: 3000 })
      emit('update:visible', false)
      emit('success')
    } else {
      Message.error({ content: res.message || '创建失败', duration: 6000 })
    }
  } catch (error) {
    console.error('创建特征失败:', error)
    Message.error({ content: '创建失败', duration: 6000 })
  }
}
</script>

<style scoped>
.register-form {
  padding: 0 4px;
}
.empty-mapping {
  text-align: center;
  padding: 32px;
  background: #f7f8fa;
  border-radius: 4px;
  color: var(--subapp-text-tertiary);
  border: 1px dashed var(--subapp-border);
}
</style>
