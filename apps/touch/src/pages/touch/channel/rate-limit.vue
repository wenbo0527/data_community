<template>
  <a-card title="全局频控">
    <a-space direction="vertical" style="width:100%">
      <a-space>
        <a-button type="primary">新建</a-button>
      </a-space>
      <a-form :model="query" layout="inline">
        <a-form-item field="channel" label="控制渠道">
          <a-select v-model="query.channel" allow-clear placeholder="选择渠道">
            <a-option value="AI外呼">AI外呼</a-option>
            <a-option value="短信">短信</a-option>
            <a-option value="人工外呼">人工外呼</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="scene" label="控制场景">
          <a-select v-model="query.scene" allow-clear placeholder="选择场景">
            <a-option value="营销类">营销类</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="line" label="一级场景">
          <a-select v-model="query.line" allow-clear placeholder="选择场景">
            <a-option value="经审冷-停催">经审冷-停催</a-option>
            <a-option value="经审冷-黑催">经审冷-黑催</a-option>
            <a-option value="经催热-意向">经催热-意向</a-option>
            <a-option value="经催热-激活">经催热-激活</a-option>
            <a-option value="历史客户">历史客户</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="query.status" allow-clear placeholder="选择状态">
            <a-option value="使用中">使用中</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="load">查询</a-button>
          <a-button style="margin-left:8px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
      <a-table :data="list" row-key="id" :pagination="pagination">
        <template #columns>
          <a-table-column title="控制渠道" data-index="channel" :width="120" />
          <a-table-column title="控制场景" data-index="scene" :width="120" />
          <a-table-column title="一级场景" data-index="line" :width="160" />
          <a-table-column title="控制规则" data-index="rule" :width="160" />
          <a-table-column title="状态" data-index="status" :width="100" />
          <a-table-column title="最近" data-index="updatedAt" :width="180" />
          <a-table-column title="备注" data-index="remark" :width="100" />
          <a-table-column title="操作" :width="140">
            <template #cell="{ record }">
              <a-space>
                <a-link>查看</a-link>
                <a-link>编辑</a-link>
                <a-link status="danger">删除</a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-space>
  </a-card>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { listGlobalRateLimits } from '@/services/channelService'
const query = reactive<{ channel?: string, scene?: string, line?: string, status?: string }>({})
const list = ref<any[]>([])
const pagination = reactive({ pageSize: 10 })
async function load() {
  list.value = await listGlobalRateLimits(query)
}
function reset() {
  query.channel = undefined
  query.scene = undefined
  query.line = undefined
  query.status = undefined
  load()
}
load()
</script>
