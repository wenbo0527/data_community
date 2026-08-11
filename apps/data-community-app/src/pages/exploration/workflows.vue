<template>
  <PageContainer>
    <PageHeader title="分析工作流" sub-title="可视化编排数据采集、清洗、计算、推送全流程">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
        <a-button type="primary" style="margin-left: 8px">
          <template #icon><icon-plus /></template>
          新建工作流
        </a-button>
      </template>
    </PageHeader>

    <a-card>
      <a-table
        :columns="columns"
        :data="workflows"
        :pagination="{ pageSize: 10, showTotal: true }"
        row-key="id"
        stripe
        size="medium"
      >
        <template #name="{ record }">
          <a-link @click="openWorkflow(record)">{{ record.name }}</a-link>
        </template>
        <template #status="{ record }">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>
        <template #nodes="{ record }">{{ record.nodes }}</template>
        <template #lastRunAt="{ record }">{{ record.lastRunAt || '尚未运行' }}</template>
      </a-table>
    </a-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '@/components-dca/common/PageContainer.vue'
import PageHeader from '@/components-dca/common/PageHeader.vue'

const router = useRouter()
const workflows = ref<any[]>([])

onMounted(() => {
  workflows.value = [
    { id: 'W001', name: '日活计算工作流', status: 'running', nodes: 8, owner: '王运营', lastRunAt: '今天 02:00', description: '从登录日志聚合计算 DAU/MAU 等指标' },
    { id: 'W002', name: '风险评分计算', status: 'running', nodes: 12, owner: '张风控', lastRunAt: '今天 03:00', description: '基于 XGBoost 模型计算用户风险评分' },
    { id: 'W003', name: '客户标签刷新', status: 'running', nodes: 25, owner: '王运营', lastRunAt: '今天 01:00', description: '刷新 156 个标签' },
    { id: 'W004', name: '逾期监控工作流', status: 'running', nodes: 6, owner: '张风控', lastRunAt: '实时', description: '实时监控逾期事件并触发预警' },
    { id: 'W005', name: '客群圈选 - 高价值理财', status: 'stopped', nodes: 4, owner: '陈营销', lastRunAt: '昨天 14:30', description: '基于 AUM 和活跃度圈选' },
    { id: 'W006', name: '数据资产血缘采集', status: 'running', nodes: 10, owner: '李产品', lastRunAt: '每天 00:30', description: '采集所有表的字段血缘' }
  ]
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '工作流名', dataIndex: 'name', slotName: 'name' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
  { title: '节点数', dataIndex: 'nodes', slotName: 'nodes', width: 100 },
  { title: 'Owner', dataIndex: 'owner', width: 100 },
  { title: '最近运行', dataIndex: 'lastRunAt', slotName: 'lastRunAt', width: 160 },
  { title: '描述', dataIndex: 'description' }
]

function statusColor(s: string) {
  return { running: 'green', stopped: 'gray', failed: 'red', draft: 'orange' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { running: '运行中', stopped: '已停止', failed: '失败', draft: '草稿' }[s] || s
}

function openWorkflow(w: any) {
  // 2026-08-06:改为 name + params,避免 vue-router 4 解析带冒号路径时的 warning
  router.push({ name: 'workflow-editor', params: { id: w.id } })
}

const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
/* 2026-08-06 统一:页面背景/高度/最大宽度由 PageContainer 提供 */
</style>