<template>
  <div class="instance-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="goBack">
          <template #icon><IconArrowLeft /></template>
          返回
        </a-button>
        <h2 class="page-title">实例详情</h2>
      </div>
      <div class="header-right">
        <a-button @click="goBack">返回列表</a-button>
      </div>
    </div>

    <a-spin :loading="loading" tip="加载中..." style="width: 100%">
      <template v-if="instance">
        <!-- 基本信息 -->
        <a-card title="基本信息" class="detail-section">
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="任务名称">
              {{ instance.taskName }}
            </a-descriptions-item>
            <a-descriptions-item label="运行状态">
              <a-badge
                :status="statusMap[instance.status]?.status"
                :text="statusMap[instance.status]?.text"
              />
            </a-descriptions-item>
            <a-descriptions-item label="校验规则数">
              {{ instance.results?.length || 0 }} 条
            </a-descriptions-item>
            <a-descriptions-item label="运行时间">
              {{ instance.runTime }}
            </a-descriptions-item>
            <a-descriptions-item label="完成时间">
              {{ instance.finishTime }}
            </a-descriptions-item>
            <a-descriptions-item label="执行耗时">
              <span class="duration-text">{{ instance.duration }}s</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 校验结果 -->
        <a-card title="校验结果" class="detail-section">
          <a-table
            :data="instance.results || []"
            :pagination="false"
            :bordered="{ wrapper: true, cell: true }"
          >
            <template #columns>
              <a-table-column title="规则名称" data-index="ruleName" />
              <a-table-column title="校验类型" data-index="type" :width="100">
                <template #cell="{ record }">
                  <a-tag :color="record.type === 'count' ? 'arcoblue' : 'orangered'" size="small">
                    {{ record.type === 'count' ? 'count' : 'sum' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="源端值" data-index="sourceValue" :width="120" />
              <a-table-column title="目标端值" data-index="targetValue" :width="120" />
              <a-table-column title="差异值" data-index="diffValue" :width="100">
                <template #cell="{ record }">
                  <span :class="{ 'diff-red-text': record.diffValue > 0 }">
                    {{ record.diffValue }}
                  </span>
                </template>
              </a-table-column>
              <a-table-column title="结果" data-index="isConsistent" :width="100">
                <template #cell="{ record }">
                  <a-badge
                    :status="record.isConsistent ? 'success' : 'warning'"
                    :text="record.isConsistent ? '一致' : '不一致'"
                  />
                </template>
              </a-table-column>
            </template>
          </a-table>

          <div class="result-summary">
            <a-alert
              :type="instance.status === 'consistent' ? 'success' : instance.status === 'inconsistent' ? 'warning' : 'error'"
            >
              <template #title>
                <span v-if="instance.status === 'consistent'">
                  校验结果：全部一致 — {{ instance.results?.length || 0 }} 条规则校验通过
                </span>
                <span v-else-if="instance.status === 'inconsistent'">
                  校验结果：不一致 — {{ getInconsistentCount(instance) }} 条规则不一致，已推送告警到数字社区
                </span>
                <span v-else>
                  校验结果：执行失败 — 任务执行过程中出现异常，请查看下方日志
                </span>
              </template>
            </a-alert>
          </div>
        </a-card>

        <!-- 执行日志 -->
        <a-card title="执行日志" class="detail-section">
          <div class="log-container">
            <pre class="log-content">{{ instance.log }}</pre>
          </div>
        </a-card>
      </template>

      <a-empty v-else-if="!loading" description="未找到实例数据" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconArrowLeft } from '@arco-design/web-vue/es/icon'
import { getInstanceDetail } from '../../../../mock/api/dataQuality'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const instance = ref<any>(null)

const statusMap: Record<string, { status: any; text: string }> = {
  consistent: { status: 'success', text: '一致' },
  inconsistent: { status: 'warning', text: '不一致' },
  failed: { status: 'danger', text: '执行失败' }
}

const getInconsistentCount = (data: any) => {
  if (!data?.results) return 0
  return data.results.filter((r: any) => !r.isConsistent).length
}

const goBack = () => {
  router.back()
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getInstanceDetail(route.params.id as string)
    instance.value = data
  } catch (e: any) {
    Message.error(e?.message || '加载实例详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.instance-detail {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.detail-section {
  margin-bottom: 20px;
}

.diff-red-text {
  color: #f53f3f;
  font-weight: 600;
}

.result-summary {
  margin-top: 20px;
}

.log-container {
  background: #1d2129;
  border-radius: 6px;
  overflow: hidden;
}

.log-content {
  margin: 0;
  padding: 20px;
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #e5e6eb;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>