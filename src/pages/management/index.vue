<template>
  <a-layout>
    <a-layout-content class="content">
      <a-row :gutter="[24, 24]">
        <a-col :span="6" v-for="(service, index) in services" :key="index">
          <a-card hoverable>
            <a-card-meta :title="service.title" :description="service.description" />
            <div class="card-actions">
              <a-button type="primary" @click="handleApply(service.type)">申请</a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'

const services = ref([
  {
    title: '在线批量调用申请',
    description: '在线调用外部API以批量获取数据，需提供账号、密码等认证信息。',
    avatar: 'B',
    type: 'batch'
  },
  {
    title: '外数离线回溯申请',
    description: '离线方式获取历史外部数据，需明确时间范围和数据项。',
    avatar: 'O',
    type: 'offline'
  },
  {
    title: '周期跑批任务申请',
    description: '定期自动执行的数据获取任务，可设置执行周期和通知方式。',
    avatar: 'P',
    type: 'periodic'
  },
  {
    title: '全量变量回溯申请',
    description: '获取所有变量的历史数据，支持按时间范围分批处理。',
    avatar: 'F',
    type: 'full'
  },
  {
    title: '数据文件落库申请',
    description: '将数据文件导入到数据库中，支持多种文件格式。',
    avatar: 'D',
    type: 'import'
  }
])

const handleApply = (type) => {
  console.log('申请服务类型:', type)
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 48px;
}

.logo img {
  height: 32px;
  margin-right: 12px;
}

.content {
  padding: 24px;
  background: #f5f6f7;
}

.card-actions {
  margin-top: 16px;
  text-align: right;
}

:deep(.arco-card-meta-title) {
  color: #165DFF;
}
</style>