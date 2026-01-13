<template>
  <div class="domain-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <!-- 面包屑导航 -->
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>数据标准</a-breadcrumb-item>
        <a-breadcrumb-item>数据域管理</a-breadcrumb-item>
        <a-breadcrumb-item>数据域详情</a-breadcrumb-item>
      </a-breadcrumb>
      
      <!-- 标题和操作 -->
      <div class="header-content">
        <div class="title-section">
          <h1 class="metric-title">{{ detailData?.name }} <span class="sub-title">({{ detailData?.code }})</span></h1>
          <a-descriptions :column="2" class="header-basic-info" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="是否代码">
              <a-tag :color="detailData?.isCode ? 'blue' : 'gray'">
                {{ detailData?.isCode ? '是' : '否' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="关联标准代码" v-if="detailData?.isCode">
              {{ detailData?.standardCodeNo || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ detailData?.updateTime }}</a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div class="action-buttons">
          <a-button @click="goBack">
            <template #icon><IconArrowLeft /></template>
            返回列表
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
              <a-card class="detail-card" title="类型属性">
                <a-descriptions :column="2" bordered>
                  <a-descriptions-item label="业务数据类型">{{ detailData?.businessDataType }}</a-descriptions-item>
                  <a-descriptions-item label="逻辑数据类型">{{ detailData?.logicalDataType }}</a-descriptions-item>
                  <a-descriptions-item label="长度">{{ detailData?.length || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="精度">{{ detailData?.precision || '-' }}</a-descriptions-item>
                </a-descriptions>
              </a-card>
            </a-tab-pane>

            <a-tab-pane key="related" title="引用标准">
              <a-table :data="relatedStandards" :pagination="false">
                <template #columns>
                  <a-table-column title="标准编号" data-index="standardNo" />
                  <a-table-column title="标准名称" data-index="chineseName" />
                  <a-table-column title="状态" data-index="status" />
                </template>
              </a-table>
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
  IconEdit
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const activeTab = ref('basic')
const detailData = ref<any>(null)
const relatedStandards = ref<any[]>([])

const goBack = () => {
  router.push('/management/data-standard/domains')
}

const handleEdit = () => {
  router.push({
    name: 'DataDomainEdit',
    params: { id: detailData.value.id }
  })
}

const fetchDetail = async () => {
  loading.value = true
  setTimeout(() => {
    detailData.value = {
      id: route.params.id,
      name: '金额_18_2',
      code: 'AMT_18_2',
      isCode: false,
      standardCodeNo: '',
      businessDataType: '金额',
      logicalDataType: 'DECIMAL',
      length: 18,
      precision: 2,
      updateTime: '2023-10-02 14:30:00'
    }
    
    relatedStandards.value = [
      { standardNo: 'STD_002', chineseName: '账户余额', status: '已发布' }
    ]
    
    loading.value = false
  }, 500)
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.domain-detail {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
