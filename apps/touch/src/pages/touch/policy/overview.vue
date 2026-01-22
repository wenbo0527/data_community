<template>
  <a-card title="策略数据概览">
    <a-space direction="vertical" style="width: 100%">
      <a-form :model="query" layout="inline">
        <a-form-item field="type" label="触达类型">
          <a-select v-model="query.type" allow-clear placeholder="选择类型">
            <a-option value="短信">短信</a-option>
            <a-option value="AI外呼">AI外呼</a-option>
            <a-option value="人工外呼">人工外呼</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="vendor" label="供应商">
          <a-select v-model="query.vendor" allow-clear placeholder="选择供应商">
            <a-option value="阿里云短信">阿里云短信</a-option>
            <a-option value="腾讯云短信">腾讯云短信</a-option>
            <a-option value="百应">百应</a-option>
            <a-option value="九四">九四</a-option>
            <a-option value="人工电销">人工电销</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="taskId" label="任务ID">
          <a-input v-model="query.taskId" allow-clear placeholder="输入任务ID" />
        </a-form-item>
        <a-form-item field="batchId" label="批次ID">
          <a-input v-model="query.batchId" allow-clear placeholder="输入批次ID" />
        </a-form-item>
        <a-form-item field="dateRange" label="任务下发时间">
          <a-range-picker v-model="query.dateRange" style="width: 260px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="load">查询</a-button>
          <a-button style="margin-left:8px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
      <a-table
        :data="list"
        row-key="id"
        :pagination="pagination"
        :bordered="false"
        :expanded-keys="expandedKeys"
        @expand="onExpand"
      >
        <template #columns>
          <a-table-column title="分组" :width="220">
            <template #cell="{ record }">
              <span v-if="record.taskId && record.taskId !== '-'">
                {{ record.taskName }}（{{ record.taskId }}）
              </span>
              <span v-else-if="record.vendor && record.vendor !== '-'">
                {{ record.vendor }}
              </span>
              <span v-else>
                {{ record.type }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="触达类型" data-index="type" :width="120" />
          <a-table-column title="任务ID" data-index="taskId" :width="120" />
          <a-table-column title="批次ID" data-index="batchId" :width="120" />
          <a-table-column title="下发成功率(%)" data-index="sendRate" :width="140" />
          <a-table-column title="触达成功" data-index="success" :width="120" />
          <a-table-column title="触达成功率(%)" data-index="successRate" :width="140" />
          <a-table-column title="触达失败" data-index="fail" :width="120" />
          <a-table-column title="操作" :width="120">
            <template #cell="{ record }">
              <a-link @click="goDetail(record)">详情</a-link>
            </template>
          </a-table-column>
        </template>
        <template #expand-icon="{ expanded }">
          <icon-right v-if="!expanded" />
          <icon-down v-else />
        </template>
      </a-table>
    </a-space>
  </a-card>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getOverviewData } from '../../../services/queryService'
const router = useRouter()
const query = reactive<{ type?: string, vendor?: string, taskId?: string, batchId?: string, dateRange?: any[] }>({})
const list = ref<any[]>([])
const pagination = reactive({ pageSize: 10 })
const expandedKeys = ref<string[]>([])
function flattenKeys(nodes: any[]): string[] {
  const keys: string[] = []
  const walk = (arr: any[]) => {
    arr.forEach(n => {
      keys.push(n.id)
      if (Array.isArray(n.children)) walk(n.children)
    })
  }
  walk(nodes)
  return keys
}
async function load() {
  const data = await getOverviewData(query)
  list.value = data
  expandedKeys.value = flattenKeys(data)
}
function reset() {
  query.type = undefined
  query.vendor = undefined
  query.taskId = undefined
  query.batchId = undefined
  query.dateRange = undefined
  load()
}
function onExpand(keys: string[]) {
  expandedKeys.value = keys as string[]
}
function goDetail(record: any) {
  const params: any = {}
  if (record.taskId && record.taskId !== '-') params.taskId = record.taskId
  if (record.batchId && record.batchId !== '-') params.batchId = record.batchId
  router.push({ path: '/touch/query/detail', query: params })
}
load()
</script>
