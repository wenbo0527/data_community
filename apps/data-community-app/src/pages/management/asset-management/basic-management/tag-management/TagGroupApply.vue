<template>
  <a-modal
    :visible="visible"
    title="应用设置"
    @cancel="handleCancel"
    @ok="handleOk"
    width="600px"
    :ok-loading="loading"
  >
    <a-form :model="form" layout="vertical">
      <div class="info-block">
        <a-descriptions :column="1" title="标签组信息">
          <a-descriptions-item label="标签组名称">{{ data.name }}</a-descriptions-item>
          <a-descriptions-item label="规则类型">
            {{ getRuleTypeName(data.ruleType) }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <a-divider />

      <a-form-item field="autoApply" label="自动应用">
        <a-switch v-model="form.autoApply">
          <template #checked>开启</template>
          <template #unchecked>关闭</template>
        </a-switch>
        <template #help>开启后，每日凌晨将自动根据规则更新标签应用情况</template>
      </a-form-item>

      <a-form-item field="scope" label="应用范围">
        <a-card :bordered="true" class="scope-card">
          <a-form-item field="assetTypes" label="资产类型">
            <a-checkbox-group v-model="form.assetTypes">
              <a-checkbox value="table">表</a-checkbox>
              <a-checkbox value="api">API</a-checkbox>
              <a-checkbox value="indicator">指标</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item field="projects" label="所属项目">
            <a-select v-model="form.projects" placeholder="全部项目" multiple allow-clear>
              <a-option>Project A</a-option>
              <a-option>Project B</a-option>
            </a-select>
          </a-form-item>
        </a-card>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps({
  visible: Boolean,
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)
const form = reactive({
  autoApply: false,
  assetTypes: ['table'],
  projects: []
})

watch(() => props.visible, (val) => {
  if (val) {
    // Reset form or load existing settings
    form.autoApply = false
    form.assetTypes = ['table']
    form.projects = []
  }
})

const getRuleTypeName = (type) => {
  const map = {
    lifecycle: '生命周期',
    quality: '质量保障',
    releaseTime: '资产发布时间',
    viewTime: '最近浏览时间',
    createTime: '资产创建时间',
    updateTime: '资产更新时间'
  }
  return map[type] || type || '-'
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleOk = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    Message.success('应用设置已保存，正在后台执行...')
    emit('success')
    emit('update:visible', false)
  }, 1000)
}
</script>

<style scoped>
.info-block {
  padding: 0 12px;
}
.scope-card {
  background-color: var(--color-fill-2);
}
</style>
