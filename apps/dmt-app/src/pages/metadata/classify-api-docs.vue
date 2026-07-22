<template>
  <!-- @prd: classify -->
  <div class="classify-api-docs-page">
    <DmtPageHeader title="分级分类 API 文档" :sub-title="`对外提供分级分类标签查询接口（Demo 模式，仅展示）· 共 ${apis.length} 个接口`" />

    <a-row :gutter="16">
      <!-- 左侧 API 卡片列表 -->
      <a-col :span="8">
        <a-card title="接口列表">
          <a-space direction="vertical" style="width: 100%" :size="8">
            <a-card
              v-for="api in apis"
              :key="api.id"
              hoverable
              class="api-card"
              :class="{ active: selectedApi?.id === api.id }"
              @click="selectedApi = api"
            >
              <a-space>
                <a-tag :color="api.method === 'GET' ? 'green' : 'orange'">{{ api.method }}</a-tag>
                <span class="api-name">{{ api.name }}</span>
              </a-space>
              <div class="api-path">{{ api.path }}</div>
              <div class="api-summary">{{ api.summary }}</div>
            </a-card>
          </a-space>
        </a-card>
      </a-col>

      <!-- 右侧接口详情 -->
      <a-col :span="16">
        <a-card v-if="selectedApi">
          <template #title>
            <a-space>
              <a-tag :color="selectedApi.method === 'GET' ? 'green' : 'orange'" size="medium">{{ selectedApi.method }}</a-tag>
              <span class="detail-title">{{ selectedApi.name }}</span>
            </a-space>
            <div class="detail-path">{{ selectedApi.path }}</div>
          </template>

          <a-typography-paragraph>{{ selectedApi.summary }}</a-typography-paragraph>

          <a-divider>请求参数</a-divider>
          <a-table :data="selectedApi.request_params" :pagination="false" :bordered="true" size="small">
            <template #columns>
              <a-table-column title="参数名" data-index="name" :width="160" />
              <a-table-column title="类型" data-index="type" :width="100" />
              <a-table-column title="必填" :width="80">
                <template #cell="{ record }">
                  <a-tag v-if="record.required" color="red" size="small">是</a-tag>
                  <span v-else>否</span>
                </template>
              </a-table-column>
              <a-table-column title="说明" data-index="description" />
            </template>
          </a-table>

          <a-divider>响应参数</a-divider>
          <a-table :data="selectedApi.response_params" :pagination="false" :bordered="true" size="small">
            <template #columns>
              <a-table-column title="参数名" data-index="name" :width="220" />
              <a-table-column title="类型" data-index="type" :width="100" />
              <a-table-column title="说明" data-index="description" />
            </template>
          </a-table>

          <a-divider>请求示例</a-divider>
          <pre class="code-block">{{ selectedApi.request_example }}</pre>

          <a-divider>响应示例</a-divider>
          <pre class="code-block">{{ selectedApi.response_example }}</pre>

          <template v-if="selectedApi.error_codes?.length">
            <a-divider>错误码</a-divider>
            <a-table :data="selectedApi.error_codes" :pagination="false" :bordered="true" size="small">
              <template #columns>
                <a-table-column title="错误码" data-index="code" :width="120" />
                <a-table-column title="说明" data-index="message" />
              </template>
            </a-table>
          </template>
        </a-card>
        <a-empty v-else description="请选择左侧接口查看详情" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DmtPageHeader from '../../components/common/DmtPageHeader.vue'
import { classifyApiDocsData } from '@shared/classify-api-docs'
import type { ClassifyApiDoc } from '@shared/classify-types'

const apis = classifyApiDocsData
const selectedApi = ref<ClassifyApiDoc | null>(apis[0] || null)
</script>

<style scoped>
.classify-api-docs-page { padding: 16px 24px 24px; }
.api-card { cursor: pointer; transition: all 0.2s; border: 1px solid var(--color-border-2); }
.api-card:hover { border-color: #165DFF; }
.api-card.active { border-color: #165DFF; background: #f2f5ff; }
.api-name { font-weight: 500; }
.api-path { font-family: monospace; color: #4e5969; font-size: 12px; margin-top: 4px; }
.api-summary { color: #86909c; font-size: 12px; margin-top: 4px; }
.detail-title { font-size: 16px; font-weight: 600; }
.detail-path { font-family: monospace; color: #86909c; font-size: 13px; margin-top: 4px; }
.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
}
</style>
