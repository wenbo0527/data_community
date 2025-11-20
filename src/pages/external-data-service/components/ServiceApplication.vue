<template>
  <div class="service-application">
    <a-card title="服务申请" hoverable>
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="customer" label="客户名称" required>
              <a-input v-model="form.customer" placeholder="请输入客户名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="type" label="服务类型" required>
              <a-select v-model="form.type" placeholder="请选择服务类型">
                <a-option value="data">数据实施</a-option>
                <a-option value="tech">技术支持</a-option>
                <a-option value="consult">业务咨询</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="desc" label="服务说明">
          <a-textarea v-model="form.desc" placeholder="请填写需求说明" :auto-size="{ minRows: 3, maxRows: 6 }" />
        </a-form-item>
        <div class="actions">
          <a-space>
            <a-button type="primary" @click="submit">提交申请</a-button>
            <a-button @click="reset">重置</a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useExternalDataStore } from '../../../store/modules/external-data'

const store = useExternalDataStore()
const form = reactive({ customer: '', type: undefined, desc: '' })

const submit = async () => {
  if (!form.customer || !form.type) {
    Message.warning('请填写必填项：客户名称与服务类型')
    return
  }
  const taskName = `${form.customer}-${form.type}-服务任务`
  const ok = await store.createTaskAction({
    taskName,
    config: {
      productName: form.customer,
      reportType: '产品级效果评估',
      analysisPeriod: ''
    }
  })
  if (ok) {
    Message.success('已提交服务申请并创建任务')
    reset()
  } else {
    Message.error(store.error || '任务创建失败')
  }
}
const reset = () => {
  form.customer = ''
  form.type = void 0
  form.desc = ''
}
</script>

<style scoped>
.actions { margin-top: 8px; }
</style>