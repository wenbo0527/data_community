<template>
  <div class="standard-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <!-- 面包屑导航 -->
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>数据标准</a-breadcrumb-item>
        <a-breadcrumb-item>标准管理</a-breadcrumb-item>
        <a-breadcrumb-item>标准详情</a-breadcrumb-item>
      </a-breadcrumb>
      
      <!-- 标题和操作 -->
      <div class="header-content">
        <div class="title-section">
          <h1 class="metric-title">{{ detailData?.chineseName }} <span class="sub-title">({{ detailData?.standardNo }})</span></h1>
          <div class="metric-meta"></div>
          <a-descriptions :column="2" class="header-basic-info" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="英文简称">{{ detailData?.englishAbbr }}</a-descriptions-item>
            <a-descriptions-item label="归属主题">{{ detailData?.subject }}</a-descriptions-item>
            <a-descriptions-item label="所属域">
              <a-tag color="arcoblue">{{ detailData?.domain }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="归口部门">{{ detailData?.department }}</a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-tag :color="detailData?.status === 'published' ? 'green' : 'orange'">
                {{ detailData?.status === 'published' ? '已发布' : '草稿' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ detailData?.updateTime }}</a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div class="action-buttons">
          <a-button @click="goBack">
            <template #icon><IconArrowLeft /></template>
            返回列表
          </a-button>
          <a-button type="primary" status="success" v-if="detailData?.status !== 'published'">
            <template #icon><IconCheckCircle /></template>
            发布
          </a-button>
          <a-button type="primary" @click="handleEdit">
            <template #icon><IconEdit /></template>
            编辑
          </a-button>
        </div>
      </div>
    </div>

    <!-- 详情内容 -->
    <div class="detail-content" v-if="!loading">
      <div class="content-layout">
        <!-- 主要内容区域 -->
        <div class="main-content">
          <a-tabs class="detail-tabs" v-model:active-key="activeTab">
            <a-tab-pane key="basic" title="基础属性">
              <a-card class="detail-card" title="数据属性">
                <a-descriptions :column="2" bordered>
                  <a-descriptions-item label="数据类型">{{ detailData?.dataType }}</a-descriptions-item>
                  <a-descriptions-item label="数据长度">{{ detailData?.length || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="数据精度">{{ detailData?.precision || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="默认值">{{ detailData?.defaultValue || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="取值范围">{{ detailData?.valueRange || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="格式要求">{{ detailData?.format || '-' }}</a-descriptions-item>
                </a-descriptions>
              </a-card>

              <a-card class="detail-card" title="业务属性" style="margin-top: 16px;">
                <a-descriptions :column="1" bordered>
                  <a-descriptions-item label="业务定义">
                    {{ detailData?.businessDefinition || '暂无定义' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="业务规则">
                    {{ detailData?.businessRules || '暂无规则' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="来源依据">
                    {{ detailData?.source || '暂无' }}
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-tab-pane>

            <a-tab-pane key="relation" title="关联资产">
              <a-empty description="暂无关联资产信息" />
            </a-tab-pane>

            <a-tab-pane key="history" title="变更记录">
               <a-timeline class="version-timeline" mode="left">
                <a-timeline-item label="2023-10-01" dotColor="green">
                  <div class="version-content">
                    <div class="version-title">标准发布 (v1.0)</div>
                    <div class="version-desc">初始版本发布，审批人：张三 (首席数据官)</div>
                  </div>
                </a-timeline-item>
                <a-timeline-item label="2023-09-20" dotColor="blue">
                  <div class="version-content">
                    <div class="version-title">专家审核通过</div>
                    <div class="version-desc">审核意见：符合行业规范，建议发布。</div>
                  </div>
                </a-timeline-item>
                <a-timeline-item label="2023-09-15">
                  <div class="version-content">
                    <div class="version-title">草稿创建</div>
                    <div class="version-desc">创建人：李四 (数据分析师)</div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </a-tab-pane>
            <a-tab-pane key="approval" title="审批流">
              <a-steps direction="vertical" :current="3" size="small">
                <a-step title="提交申请" description="2023-09-15 10:00:00" />
                <a-step title="数据专家审核" description="2023-09-20 14:30:00" />
                <a-step title="部门负责人终审" description="2023-10-01 09:00:00" />
                <a-step title="已发布" description="当前状态" />
              </a-steps>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-container">
      <a-spin :size="32" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IconArrowLeft,
  IconEdit,
  IconCheckCircle
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const activeTab = ref('basic')
const detailData = ref<any>(null)

const goBack = () => {
  router.push('/management/data-standard/standards')
}

const handleEdit = () => {
  router.push({
    name: 'StandardEdit',
    params: { id: detailData.value.id }
  })
}

const fetchDetail = async () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据，实际应根据 route.params.id 获取
    detailData.value = {
      id: route.params.id,
      standardNo: 'STD-USER-001',
      chineseName: '用户注册手机号',
      englishAbbr: 'user_mobile',
      subject: '客户主题',
      domain: '客户域',
      department: '用户运营部',
      status: 'published',
      updateTime: '2023-10-01 12:00:00',
      dataType: 'String',
      length: '11',
      precision: '',
      defaultValue: '',
      valueRange: '11位数字',
      format: 'YYYY-MM-DD',
      businessDefinition: '用户注册时使用的手机号码，用于身份验证和联系。',
      businessRules: '必须为11位有效手机号码，且不能重复。',
      source: '国家实名制要求'
    }
    loading.value = false
  }, 500)
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.standard-detail {
  padding: 20px;
  background-color: var(--color-bg-2);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  flex: 1;
}

.metric-title {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-1);
  display: flex;
  align-items: baseline;
}

.sub-title {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-3);
  margin-left: 12px;
}

.header-basic-info {
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.detail-content {
  margin-top: 24px;
}

.content-layout {
  display: flex;
  gap: 24px;
}

.main-content {
  flex: 1;
  min-width: 0; 
}

.detail-tabs {
  background: var(--color-bg-1);
  padding: 16px;
  border-radius: 4px;
}

.detail-card {
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
}

:deep(.arco-descriptions-item-label) {
  color: var(--color-text-2);
}

:deep(.arco-descriptions-item-value) {
  color: var(--color-text-1);
}

.version-timeline {
  margin-top: 20px;
  padding: 0 20px;
}

.version-content {
  padding: 8px 12px;
  background: var(--color-fill-2);
  border-radius: 4px;
}

.version-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.version-desc {
  color: var(--color-text-3);
  font-size: 13px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
