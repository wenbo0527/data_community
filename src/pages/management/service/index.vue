<template>
  <div class="content">
    <div class="page-header">
      <h2>数据服务</h2>
    </div>
    
    <a-row :gutter="[24, 24]">
      <a-col :span="6" v-for="service in serviceList" :key="service.id">
        <a-card class="service-card" hoverable>
          <div class="service-content">
            <h3 class="service-title">{{ service.title }}</h3>
            <p class="service-description">{{ service.description }}</p>
            <div class="service-footer">
              <a-button type="primary" @click="handleApply(service)">申请</a-button>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const serviceList = ref([
  {
    id: 1,
    title: '在线数据明细申请',
    description: '在线调用外部数据API接口，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
  },
  {
    id: 2,
    title: '外置数据回溯申请',
    description: '在线调用外部数据API接口，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
  },
  {
    id: 3,
    title: '离线数据任务申请',
    description: '离线数据任务是指在一次性申请，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
  },
  {
    id: 4,
    title: '全量变量回溯申请',
    description: '过往历史数据全量变量回溯申请，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
  },
  {
    id: 5,
    title: '数据文件清洗申请',
    description: '对接数据文件上传至指定文件夹，需要提供外名、身份证、手机号等信息，并根据返回的数据进行业务处理。'
  },
  {
    id: 6,
    title: '风险合规外数查询',
    description: '查询客户风险合规相关外部数据，支持身份证号查询和批量回溯两种模式，可按时间筛选并生成查询确认列表。'
  },
  {
    id: 8,
    title: 'API管理',
    description: '支持向导式创建API：逻辑表选择、参数设置、高级配置，自动生成SQL。'
  }
])

const handleApply = (service) => {
  if (service.id === 4) {
    // 全量变量回溯申请，跳转到专门的申请页面
    router.push('/management/service/backtrack')
  } else if (service.id === 6) {
    // 客户资金用途外数查询，跳转到专门的查询页面
    router.push('/management/service/fund-usage-query')
  } else if (service.id === 8) {
    // API管理
    router.push('/management/service/api-management')
  } else {
    Message.success(`已提交${service.title}申请`)
  }
}
</script>

<style scoped>
.content {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.service-card {
  height: 100%;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.service-content {
  padding: 8px;
  height: 200px;
  display: flex;
  flex-direction: column;
}

.service-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.service-description {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0 0 16px 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.service-footer {
  margin-top: auto;
  text-align: center;
}

.service-footer .arco-btn {
  width: 80px;
}
</style>
