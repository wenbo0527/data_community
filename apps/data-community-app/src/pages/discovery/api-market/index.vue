<template>
  <div class="api-market-page">
    <a-page-header title="API 市场" sub-title="数据服务 · 申请使用" :back="false">
      <template #extra>
        <a-button @click="goBack"><template #icon><icon-left /></template>返回</a-button>
      </template>
    </a-page-header>
    <div class="content-wrapper">
      <a-row :gutter="[16, 16]">
        <a-col v-for="api in apis" :key="api.id" :span="8">
          <a-card hoverable :bordered="false" class="api-card">
            <template #title>
              <a-space>
                <a-tag :color="methodColor(api.method)">{{ api.method }}</a-tag>
                <span>{{ api.name }}</span>
              </a-space>
            </template>
            <pre class="api-path">{{ api.path }}</pre>
            <p class="api-desc">{{ api.description }}</p>
            <div class="api-stats">
              <span>📊 {{ formatNumber(api.monthlyCalls) }}/月</span>
              <span>⭐ {{ api.rating }}</span>
              <span>⏱ {{ api.latency }}ms</span>
            </div>
            <a-divider />
            <a-row>
              <a-col :span="8"><div class="api-meta">成功率<br><strong>{{ api.successRate }}%</strong></div></a-col>
              <a-col :span="8"><div class="api-meta">QPS<br><strong>{{ api.qpsLimit }}</strong></div></a-col>
              <a-col :span="8"><div class="api-meta">分类<br><strong>{{ api.categoryLabel }}</strong></div></a-col>
            </a-row>
            <a-divider />
            <a-space>
              <a-button type="text" size="small" @click="openDetail(api)">详情</a-button>
              <a-button type="text" size="small" @click="openTryOut(api)">试调</a-button>
              <a-button type="text" size="small" @click="applyApi(api)">{{ api.applied ? '已申请' : '申请使用' }}</a-button>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 详情抽屉 -->
    <a-drawer :visible="!!detailApi" :title="detailApi?.name" :width="560" @cancel="closeDetail" @ok="closeDetail" :ok-text="'关闭'" :cancel-text="'关闭'">
      <a-descriptions v-if="detailApi" :column="1" size="medium" bordered>
        <a-descriptions-item label="API ID">{{ detailApi.id }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ detailApi.name }}</a-descriptions-item>
        <a-descriptions-item label="方法"><a-tag :color="methodColor(detailApi.method)">{{ detailApi.method }}</a-tag></a-descriptions-item>
        <a-descriptions-item label="路径"><code>{{ detailApi.path }}</code></a-descriptions-item>
        <a-descriptions-item label="分类">{{ detailApi.categoryLabel }}</a-descriptions-item>
        <a-descriptions-item label="月调用量">{{ formatNumber(detailApi.monthlyCalls) }}</a-descriptions-item>
        <a-descriptions-item label="评分">{{ detailApi.rating }}</a-descriptions-item>
        <a-descriptions-item label="延迟">{{ detailApi.latency }}ms</a-descriptions-item>
        <a-descriptions-item label="成功率">{{ detailApi.successRate }}%</a-descriptions-item>
        <a-descriptions-item label="QPS 上限">{{ detailApi.qpsLimit }}</a-descriptions-item>
        <a-descriptions-item label="描述">{{ detailApi.description }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>

    <!-- 试调抽屉 -->
    <a-drawer :visible="!!tryOutApi" :title="`试调: ${tryOutApi?.name || ''}`" :width="640" @cancel="closeTryOut" @ok="runTryOut" ok-text="执行" :cancel-text="'取消'">
      <a-form v-if="tryOutApi" :model="tryOutParams" layout="vertical" size="small">
        <a-form-item label="请求参数 (JSON)">
          <a-textarea v-model="tryOutParams.json" :rows="6" placeholder='{"userId":"u_001"}' />
        </a-form-item>
      </a-form>
      <a-divider />
      <pre v-if="tryOutResult" class="tryout-result">{{ tryOutResult }}</pre>
    </a-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { ApiStore } from '../../../mock/shared/dataset'

const router = useRouter()
// 直接复用公共 mock:A002 标记为已申请,其余未申请
const apis = ref(ApiStore.all().map(a => ({
  ...a,
  applied: a.id === 'A002'
})))
function methodColor(m: string) { return { GET: 'arcoblue', POST: 'green', PUT: 'orange', DELETE: 'red' }[m] || 'gray' }
function formatNumber(n: number) { if (n >= 10000) return (n / 10000).toFixed(1) + '万'; return n.toLocaleString() }

// 「详情」抽屉
const detailApi = ref<any>(null)
function openDetail(api: any) { detailApi.value = api }
function closeDetail() { detailApi.value = null }

// 「试调」抽屉
const tryOutApi = ref<any>(null)
const tryOutParams = ref<{ json: string }>({ json: '' })
const tryOutResult = ref('')
function openTryOut(api: any) {
  tryOutApi.value = api
  tryOutParams.value = { json: '{"userId":"u_001"}' }
  tryOutResult.value = ''
}
function closeTryOut() { tryOutApi.value = null; tryOutResult.value = '' }
function runTryOut() {
  // mock 响应
  tryOutResult.value = JSON.stringify({
    code: 0,
    message: 'success',
    data: { userId: 'u_001', name: '示例用户', score: 758, latencyMs: tryOutApi.value?.latency || 50 },
    requestId: 'req_' + Date.now()
  }, null, 2)
}

// 「申请使用」: 跳字段权限申请页,把 api 信息带到 query
function applyApi(api: any) {
  if (api.applied) { Message.warning('已申请过此 API'); return }
  router.push({
    path: 'management/permission/data-permission/apply',
    query: { resourceType: 'api', resourceId: api.id, resourceName: api.name }
  })
}

const goBack = () => router.push('discovery')
</script>
<style lang="scss" scoped>
.api-market-page { background: #f5f7fa; min-height: 100vh; }
.content-wrapper { padding: 0 24px 24px; }
.api-card {
  height: 100%;
  .api-path {
    background: #f5f7fa; padding: 6px 10px; border-radius: 4px;
    font-family: 'Menlo', monospace; font-size: 12px; color: #165dff; margin: 0 0 8px;
  }
  .api-desc { color: #86909c; font-size: 13px; min-height: 40px; }
  .api-stats { display: flex; gap: 12px; font-size: 12px; color: #4e5969; span { flex: 1; } }
  .api-meta { text-align: center; font-size: 11px; color: #86909c; strong { display: block; margin-top: 4px; font-size: 13px; color: #1d2129; } }
}
.tryout-result {
  background: #f5f7fa;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Menlo', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
