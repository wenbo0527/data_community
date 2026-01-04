<template>
  <div class="api-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <!-- 面包屑导航 -->
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>数据要素</a-breadcrumb-item>
        <a-breadcrumb-item>API集市</a-breadcrumb-item>
        <a-breadcrumb-item>API详情</a-breadcrumb-item>
      </a-breadcrumb>
      
      <!-- API标题和操作 -->
      <div class="header-content">
        <div class="title-section">
          <div class="title-row">
            <h1 class="api-title">{{ apiDetail?.name }}</h1>
            <a-tag color="blue" size="small" class="version-tag">V1.0</a-tag>
          </div>
          <a-descriptions :column="3" class="header-basic-info" :label-style="{ 'font-weight': 600 }">
            <a-descriptions-item label="API ID">{{ apiId }}</a-descriptions-item>
            <a-descriptions-item label="所属项目">{{ apiDetail?.project || 'QA_test2' }}</a-descriptions-item>
            <a-descriptions-item label="负责人">{{ apiDetail?.owner || '管理员' }}</a-descriptions-item>
            <a-descriptions-item label="数据源">{{ apiDetail?.database }}</a-descriptions-item>
            <a-descriptions-item label="逻辑表">{{ apiDetail?.table }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ apiDetail?.updateTime }}</a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div class="action-buttons">
          <a-button @click="goBack">
            <template #icon><IconArrowLeft /></template>
            返回集市
          </a-button>
          <a-button type="primary">
            申请权限
          </a-button>
        </div>
      </div>
    </div>

    <!-- 详情内容 -->
    <div class="detail-content" v-if="apiDetail">
      <div class="content-layout">
        <div class="main-content">
          <a-tabs class="detail-tabs" v-model:active-key="activeTab">
            <!-- 基础信息与参数配置 -->
            <a-tab-pane key="config" title="配置详情">
              <div class="tab-pane-content">
                <!-- 基础信息卡片 -->
                <a-card class="detail-card">
                  <template #title>
                    <span class="card-title">基础信息</span>
                  </template>
                  <a-descriptions :column="2" :label-style="{ 'font-weight': 600 }">
                    <a-descriptions-item label="API 名称">
                      <span class="highlight-text">{{ apiDetail.name }}</span>
                    </a-descriptions-item>
                    <a-descriptions-item label="API ID">
                      {{ apiId }}
                    </a-descriptions-item>
                    <a-descriptions-item label="数据源">
                      <a-tag color="arcoblue">{{ apiDetail.database }}</a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item label="物理表">
                      <a-tag color="green">{{ apiDetail.table }}</a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item label="负责人">
                      {{ apiDetail.owner || '管理员' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="更新时间">
                      {{ apiDetail.updateTime }}
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>

                <!-- 请求参数 -->
                <a-card class="detail-card">
                  <template #title>
                    <span class="card-title">请求参数</span>
                  </template>
                  <div v-if="apiDetail.advanced?.enablePagination" class="common-params-info">
                    <div class="info-title">公共请求参数</div>
                    <a-descriptions :column="2" size="small" bordered>
                      <a-descriptions-item label="pageNum">当前页号 (Integer, 必填)</a-descriptions-item>
                      <a-descriptions-item label="pageSize">页面大小 (Integer, 必填)</a-descriptions-item>
                    </a-descriptions>
                  </div>
                  <a-table :data="apiDetail.requestParams" :pagination="false" size="small" :bordered="{ cell: true }">
                    <template #columns>
                      <a-table-column title="参数名称" data-index="name" />
                      <a-table-column title="参数类型" data-index="type" />
                      <a-table-column title="操作符" data-index="operator" />
                      <a-table-column title="是否必选">
                        <template #cell="{ record }">
                          <a-tag :color="record.required ? 'red' : 'gray'" size="mini">
                            {{ record.required ? '是' : '否' }}
                          </a-tag>
                        </template>
                      </a-table-column>
                      <a-table-column title="示例值" data-index="example" />
                      <a-table-column title="默认值" data-index="defaultValue" />
                    </template>
                  </a-table>
                </a-card>

                <!-- 返回参数 -->
                <a-card class="detail-card">
                  <template #title>
                    <span class="card-title">返回参数</span>
                  </template>
                  <div v-if="apiDetail.advanced?.enablePagination" class="common-params-info">
                    <div class="info-title">公共返回参数</div>
                    <a-descriptions :column="apiDetail.advanced.withTotal ? 3 : 2" size="small" bordered>
                      <a-descriptions-item label="pageNum">当前页号</a-descriptions-item>
                      <a-descriptions-item label="pageSize">页面大小</a-descriptions-item>
                      <a-descriptions-item v-if="apiDetail.advanced.withTotal" label="TotalCnt">总记录数</a-descriptions-item>
                    </a-descriptions>
                  </div>
                  <a-table :data="apiDetail.responseParams" :pagination="false" size="small" :bordered="{ cell: true }">
                    <template #columns>
                      <a-table-column title="参数名称" data-index="name" />
                      <a-table-column title="绑定字段" data-index="bindField" />
                      <a-table-column title="类型" data-index="type" />
                      <a-table-column title="安全等级" data-index="securityLevel" />
                      <a-table-column title="描述" data-index="description" />
                    </template>
                  </a-table>
                </a-card>
              </div>
            </a-tab-pane>

            <!-- SQL逻辑 -->
            <a-tab-pane key="sql" title="SQL逻辑">
              <div class="tab-pane-content">
                <a-card class="detail-card">
                  <template #title>
                    <span class="card-title">SQL逻辑</span>
                  </template>
                  <div class="sql-preview-box">
                    <pre><code>{{ apiDetail.sql }}</code></pre>
                  </div>
                </a-card>
              </div>
            </a-tab-pane>

            <!-- 调用信息 -->
            <a-tab-pane key="call-info" title="调用信息">
              <div class="tab-pane-content">
                <a-card class="detail-card">
                  <template #title>
                    <span class="card-title">接口地址</span>
                  </template>
                  <div class="url-box">
                    <a-tag color="green" size="large" class="method-tag">POST</a-tag>
                    <span class="api-url">/api/v1/query/{{ apiId }}</span>
                    <a-button type="text" size="small">
                      <template #icon><IconCopy /></template>
                      复制
                    </a-button>
                  </div>
                </a-card>

                <a-card class="detail-card">
                  <template #title>
                    <span class="card-title">请求代码示例 (cURL)</span>
                  </template>
                  <div class="code-box">
                    <pre><code>curl -X POST "http://domain.com/api/v1/query/{{ apiId }}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{{ JSON.stringify(requestExample, null, 2) }}'</code></pre>
                  </div>
                </a-card>

                <a-card class="detail-card">
                  <template #title>
                    <span class="card-title">返回结果示例</span>
                  </template>
                  <div class="code-box">
                    <pre><code>{{ JSON.stringify(responseExample, null, 2) }}</code></pre>
                  </div>
                </a-card>
              </div>
            </a-tab-pane>

            <!-- 高级配置 -->
            <a-tab-pane key="advanced" title="高级配置">
              <div class="tab-pane-content">
                <a-card class="detail-card">
                  <template #title>
                    <span class="card-title">高级配置</span>
                  </template>
                  <a-descriptions :column="1" bordered size="small">
                    <a-descriptions-item label="缓存策略">
                      {{ apiDetail.advanced.cacheStrategy === 'off' ? '不缓存' : (apiDetail.advanced.cacheStrategy === 'system' ? '系统策略' : '自定义') }}
                    </a-descriptions-item>
                    <a-descriptions-item label="缓存有效期 (秒)" v-if="apiDetail.advanced.cacheStrategy !== 'off'">
                      {{ apiDetail.advanced.cacheSeconds || apiDetail.advanced.cacheTime }}
                    </a-descriptions-item>
                    <a-descriptions-item label="返回格式">
                      {{ apiDetail.advanced.returnFormat }}
                    </a-descriptions-item>
                    <a-descriptions-item label="启用分页">
                      {{ apiDetail.advanced.enablePagination ? '是' : '否' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="包含总数" v-if="apiDetail.advanced.enablePagination">
                      {{ apiDetail.advanced.withTotal ? '是' : '否' }}
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IconArrowLeft,
  IconCopy
} from '@arco-design/web-vue/es/icon'

const route = useRoute()
const router = useRouter()
const apiId = computed(() => route.params.id as string)
const apiDetail = ref<any>(null)
const activeTab = ref('config')

const STORAGE_KEY = 'api.management.list'

const loadDetail = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    const list = JSON.parse(raw)
    apiDetail.value = list.find((item: any) => String(item.id) === apiId.value)
  }
}

const requestExample = computed(() => {
  const params: Record<string, any> = {}
  if (apiDetail.value?.requestParams) {
    apiDetail.value.requestParams.forEach((p: any) => {
      params[p.name] = p.example || (p.type === 'int' ? 0 : '')
    })
  }
  if (apiDetail.value?.advanced?.enablePagination) {
    params.pageNum = 1
    params.pageSize = 10
  }
  return params
})

const responseExample = computed(() => {
  const data: Record<string, any> = {}
  if (apiDetail.value?.responseParams) {
    apiDetail.value.responseParams.forEach((p: any) => {
      data[p.name] = p.example || (p.type === 'int' ? 1 : 'text')
    })
  }
  
  if (apiDetail.value?.advanced?.enablePagination) {
    return {
      code: 200,
      message: "success",
      data: [data],
      totalCnt: 1,
      pageNum: 1,
      pageSize: 10
    }
  }
  
  return {
    code: 200,
    message: "success",
    data: [data]
  }
})

const goBack = () => {
  router.push('/discovery/api-market')
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.api-detail {
  padding: 24px;
  background: #f4f7f9;
  min-height: calc(100vh - 64px);
}

.page-header {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.breadcrumb {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.api-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.header-basic-info {
  max-width: 900px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.detail-content {
  padding: 0;
}

.content-layout {
  display: flex;
  gap: 24px;
}

.main-content {
  flex: 1;
}

.detail-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-weight: 600;
  color: #1d2129;
  font-size: 16px;
}

.highlight-text {
  color: #165dff;
  font-weight: 600;
}

.tab-pane-content {
  padding: 16px 0;
}

.common-params-info {
  margin-bottom: 16px;
  background: #f7f8fa;
  padding: 12px;
  border-radius: 4px;
}

.info-title {
  font-size: 13px;
  font-weight: 600;
  color: #4e5969;
  margin-bottom: 8px;
}

.sql-preview-box {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
  font-family: 'Monaco', 'Menlo', monospace;
}

.sql-preview-box pre {
  margin: 0;
  white-space: pre-wrap;
}

.url-box {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5e6eb;
}

.method-tag {
  font-weight: 600;
}

.api-url {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  color: #1d2129;
  flex: 1;
}

.code-box {
  background: #1d2129;
  color: #fff;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  overflow-x: auto;
}

.code-box pre {
  margin: 0;
}

:deep(.arco-descriptions-item-label) {
  color: #86909c;
}

:deep(.arco-descriptions-item-value) {
  color: #1d2129;
}

:deep(.arco-card-header) {
  border-bottom: 1px solid #f2f3f5;
  padding: 16px 20px;
}

:deep(.arco-card-body) {
  padding: 20px;
}
</style>
