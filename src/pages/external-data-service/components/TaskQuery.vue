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
import { ref, computed, onMounted } from 'vue'
import { useExternalDataStore } from '../../../store/modules/external-data'

const store = useExternalDataStore()
const keyword = ref('')
const columns = [
  { title: '任务ID', dataIndex: 'id' },
  { title: '任务名称', dataIndex: 'taskName' },
  { title: '状态', dataIndex: 'status' },
  { title: '进度', dataIndex: 'progress' },
  { title: '创建时间', dataIndex: 'createTime' }
]
const list = computed(() => store.tasks)
const filtered = computed(() =>
  list.value.filter(item =>
    !keyword.value || String(item.taskName).includes(keyword.value)
  )
)

onMounted(() => {
  store.fetchTasks()
})
</script>

<style scoped>
.task-query { }
</style>