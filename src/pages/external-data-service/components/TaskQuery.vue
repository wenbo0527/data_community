<template>
  <div class="task-query">
    <a-card title="任务查询" hoverable>
      <a-space direction="vertical" fill>
        <a-input v-model="keyword" placeholder="输入任务关键字" allow-clear />
        <a-table :columns="columns" :data="filtered" row-key="id" size="small" />
      </a-space>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const keyword = ref('')
const state = reactive({
  list: [
    { id: 101, name: '客户画像任务', status: '完成', owner: '张三' },
    { id: 102, name: '标签更新任务', status: '进行中', owner: '李四' },
    { id: 103, name: '报表导出任务', status: '失败', owner: '王五' }
  ]
})
const columns = [
  { title: '任务ID', dataIndex: 'id' },
  { title: '任务名称', dataIndex: 'name' },
  { title: '状态', dataIndex: 'status' },
  { title: '负责人', dataIndex: 'owner' }
]
const filtered = computed(() =>
  state.list.filter(item =>
    !keyword.value || String(item.name).includes(keyword.value)
  )
)
</script>

<style scoped>
.task-query { }
</style>