<template>
  <a-modal
    :visible="visible"
    :title="title"
    @cancel="handleCancel"
    @ok="handleOk"
    width="800px"
    :ok-loading="loading"
    :footer="mode === 'view' ? false : undefined"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" :disabled="mode === 'view'">
      <!-- 基础信息 -->
      <a-card title="基础信息" :bordered="false">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="category" label="标签类目">
              <a-input v-model="form.category" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="name" label="标签组名称">
              <a-input v-model="form.name" placeholder="请输入标签组名称" :max-length="20" show-word-limit />
              <template #help>支持中英文、数字，不超过20个字符</template>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="type" label="标签类型">
              <a-select v-model="form.type" placeholder="请选择" :disabled="mode !== 'create'">
                <a-option value="text">文本</a-option>
                <a-option value="rule">数据规则</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="priority" label="优先级">
              <a-select v-model="form.priority" placeholder="请选择">
                <a-option value="P0">P0</a-option>
                <a-option value="P1">P1</a-option>
                <a-option value="P2">P2</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="scope" label="展示范围">
              <a-select v-model="form.scope" placeholder="请选择">
                <a-option value="all">全部</a-option>
                <a-option value="management">管理侧</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="consumerDisplay" label="消费侧展示设置">
              <a-radio-group v-model="form.consumerDisplay">
                <a-radio value="independent">独立展示</a-radio>
                <a-radio value="more">收入"更多标签"</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="admins" label="管理员">
              <a-select v-model="form.admins" placeholder="请选择" multiple allow-create>
                <a-option>Admin</a-option>
                <a-option>User1</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="color" label="标签背景色">
              <a-color-picker v-model="form.color" show-preset />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item field="description" label="描述">
              <a-textarea v-model="form.description" placeholder="请输入描述" :max-length="200" show-word-limit />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>

      <!-- 标签设置 -->
      <a-card title="标签设置" :bordered="false" style="margin-top: 16px">
        <template v-if="form.type === 'text'">
          <div class="tag-list">
            <div v-for="(tag, index) in form.tags" :key="index" class="tag-item">
              <a-space direction="vertical" style="width: 100%">
                <a-space>
                  <a-input v-model="tag.value" placeholder="请输入标签值" style="width: 200px" />
                  <a-input v-model="tag.description" placeholder="请输入标签描述" style="width: 300px" />
                  <a-button type="text" status="danger" @click="removeTag(index)" :disabled="form.tags.length === 1">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </a-space>
              </a-space>
            </div>
            <a-button type="dashed" long @click="addTag" v-if="form.tags.length < 100" style="margin-top: 8px">
              <template #icon><icon-plus /></template>
              添加标签
            </a-button>
          </div>
        </template>

        <template v-else-if="form.type === 'rule'">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="ruleType" label="数据规则">
                <a-select v-model="form.ruleType" placeholder="请选择">
                  <a-option value="lifecycle">生命周期</a-option>
                  <a-option value="quality">质量保障</a-option>
                  <a-option value="releaseTime">资产发布时间</a-option>
                  <a-option value="viewTime">最近常看</a-option>
                  <a-option value="createTime">资产创建时间</a-option>
                  <a-option value="updateTime">资产更新时间</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="['releaseTime', 'createTime', 'updateTime'].includes(form.ruleType)">
              <a-form-item field="ruleValue" label="时间范围">
                <a-input-number v-model="form.ruleValue" placeholder="请输入天数" :min="1">
                  <template #suffix>天</template>
                </a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="form.ruleType === 'viewTime'">
               <a-form-item field="ruleValue" label="查看次数门槛">
                <a-input-number v-model="form.ruleValue" placeholder="请输入次数" :min="1">
                  <template #suffix>次</template>
                </a-input-number>
              </a-form-item>
            </a-col>
            
            <a-col :span="24">
              <a-alert :show-icon="false" style="margin-bottom: 16px">
                <template #title>
                  标签预览
                </template>
                <a-descriptions :column="2" bordered>
                   <a-descriptions-item label="标签展示">
                     {{ getTagDisplayPreview }}
                   </a-descriptions-item>
                   <a-descriptions-item label="标签个数">
                     {{ getTagCountPreview }}
                   </a-descriptions-item>
                </a-descriptions>
              </a-alert>
            </a-col>
          </a-row>
        </template>
      </a-card>

      <!-- 标签应用范围 -->
      <a-card title="标签应用范围" :bordered="false" style="margin-top: 16px">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item field="autoApply" label="自动应用">
               <a-switch v-model="form.autoApply">
                 <template #checked>开启</template>
                 <template #unchecked>关闭</template>
               </a-switch>
               <span style="margin-left: 8px; color: var(--color-text-3); font-size: 12px">开启后，每日自动打标</span>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item field="publishStatus" label="发布状态">
              <a-checkbox-group v-model="form.publishStatus">
                <a-checkbox value="published">已发布</a-checkbox>
                <a-checkbox value="unpublished">未发布</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="owner" label="负责人">
              <a-select v-model="form.owner" placeholder="请选择或输入负责人" multiple allow-create allow-clear>
                <a-option>张三</a-option>
                <a-option>李四</a-option>
                <a-option>王五</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
             <a-form-item field="businessScenario" label="业务场景">
              <a-select v-model="form.businessScenario" placeholder="请选择或输入业务场景" multiple allow-create allow-clear>
                <a-option>资产目录</a-option>
                <a-option>数据探索</a-option>
                <a-option>营销分析</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item field="assetType" label="资产类型">
              <a-select v-model="form.assetType" placeholder="请选择资产类型" multiple allow-clear>
                <a-option v-for="opt in assetTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>

    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  visible: Boolean,
  mode: {
    type: String,
    default: 'create' // create, edit, view
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const loading = ref(false)

const title = computed(() => {
  switch (props.mode) {
    case 'create': return '新建标签组'
    case 'edit': return '编辑标签组'
    case 'view': return '查看标签组'
    default: return '标签组'
  }
})

const form = reactive({
  category: '业务自定义',
  name: '',
  type: 'text',
  priority: 'P1',
  scope: 'all',
  consumerDisplay: 'independent',
  admins: [],
  color: '#165DFF',
  description: '',
  tags: [{ value: '', description: '' }],
  ruleType: '',
  ruleValue: 30,
  displayValue: '',
  tagCountType: 'dynamic',
  autoApply: false,
  publishStatus: [],
  owner: [],
  businessScenario: [],
  assetType: []
})

const assetTypeOptions = computed(() => {
  if (form.type === 'text') {
    return [
      { label: '表注册', value: 'table_register' },
      { label: '常用表创建', value: 'common_table' }
    ]
  } else if (form.type === 'rule') {
    return [
      { label: '数据表', value: 'data_table' },
      { label: '外数', value: 'external_data' },
      { label: '指标', value: 'metric' },
      { label: '变量', value: 'variable' }
    ]
  }
  return []
})

const getTagDisplayPreview = computed(() => {
  if (form.type !== 'rule') return '-'
  
  switch (form.ruleType) {
    case 'lifecycle':
      return 'TTL=N天'
    case 'quality':
      return '质量保障'
    case 'releaseTime':
      return `最近${form.ruleValue || 'N'}天发布`
    case 'viewTime':
      return '最近常看'
    case 'createTime':
      return `最近${form.ruleValue || 'N'}天创建`
    case 'updateTime':
      return `最近${form.ruleValue || 'N'}天更新`
    default:
      return '-'
  }
})

const getTagCountPreview = computed(() => {
  if (form.type !== 'rule') return '-'
  
  if (form.ruleType === 'lifecycle') {
    return '动态变化'
  } else if (['quality', 'releaseTime', 'viewTime', 'createTime', 'updateTime'].includes(form.ruleType)) {
    return '1'
  }
  return '-'
})

const rules = {
  name: [{ required: true, message: '请输入标签组名称' }],
  type: [{ required: true, message: '请选择标签类型' }],
  priority: [{ required: true, message: '请选择优先级' }],
  admins: [{ required: true, message: '请选择管理员' }]
}

watch(() => form.type, () => {
  form.assetType = []
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'create') {
      resetForm()
      form.admins = ['当前用户'] // Mock default user
    } else {
      // Fill form with props.data
      Object.assign(form, props.data)
      // Ensure tags array exists
      if (!form.tags || form.tags.length === 0) {
        form.tags = [{ value: '', description: '' }]
      }
    }
  }
})

const resetForm = () => {
  Object.assign(form, {
    category: '业务自定义',
    name: '',
    type: 'text',
    priority: 'P1',
    scope: 'all',
    consumerDisplay: 'independent',
    admins: [],
    color: '#165DFF',
    description: '',
    tags: [{ value: '', description: '' }],
    ruleType: '',
    ruleValue: 30,
    displayValue: '',
    tagCountType: 'dynamic',
    autoApply: false,
    publishStatus: [],
    owner: [],
    businessScenario: [],
    assetType: []
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const addTag = () => {
  if (form.tags.length < 100) {
    form.tags.push({ value: '', description: '' })
  }
}


const removeTag = (index) => {
  if (form.tags.length > 1) {
    form.tags.splice(index, 1)
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleOk = async () => {
  if (props.mode === 'view') {
    handleCancel()
    return
  }

  const res = await formRef.value?.validate()
  if (res) return

  loading.value = true
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    Message.success(props.mode === 'create' ? '创建成功' : '更新成功')
    emit('success')
    emit('update:visible', false)
  }, 1000)
}
</script>

<style scoped>
.tag-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
</style>
