<template>
  <div class="standard-detail-page">
    <a-page-header :title="`标准详情 · ${standard?.name || ''}`" :subtitle="`编码: ${standardId}`">
      <template #extra>
        <a-button @click="goBack">返回列表</a-button>
        <a-button @click="applyPermission">
          <template #icon><icon-lock /></template>申请字段权限
        </a-button>
        <a-button type="primary" @click="goEdit">
          <template #icon><icon-edit /></template>编辑
        </a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16" v-if="standard">
      <a-col :span="16">
        <a-card :bordered="false" title="基本信息">
          <a-descriptions :column="2" bordered size="medium">
            <a-descriptions-item label="标准编码">{{ standard.code }}</a-descriptions-item>
            <a-descriptions-item label="标准名称">{{ standard.name }}</a-descriptions-item>
            <a-descriptions-item label="分类">{{ standard.category }}</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="statusColor(standard.status)">{{ statusLabel(standard.status) }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="数据类型">
              <a-tag color="cyan">{{ standard.dataType }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="长度/精度">{{ standard.length }} / {{ standard.scale || '-' }}</a-descriptions-item>
            <a-descriptions-item label="负责人">{{ standard.owner }}</a-descriptions-item>
            <a-descriptions-item label="合规率">{{ standard.complianceRate }}%</a-descriptions-item>
            <a-descriptions-item label="定义" :span="2">{{ standard.definition }}</a-descriptions-item>
            <a-descriptions-item label="取值范围" :span="2">
              <pre class="formula">{{ standard.valueRange }}</pre>
            </a-descriptions-item>
            <a-descriptions-item label="规则示例" :span="2">
              <pre class="formula">{{ standard.example }}</pre>
            </a-descriptions-item>
            <a-descriptions-item label="标签" :span="2">
              <a-tag v-for="t in (standard.tags || [])" :key="t" color="green">{{ t }}</a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card :bordered="false" title="已应用字段" style="margin-top: 16px">
          <a-table
            :columns="appliedColumns"
            :data="standard.appliedFields || []"
            :pagination="{ pageSize: 10 }"
            row-key="fullPath"
            size="medium"
          >
            <template #compliance="{ record }">
              <a-tag :color="record.compliant ? 'green' : 'red'">
                {{ record.compliant ? '✓ 合规' : '✗ 不合规' }}
              </a-tag>
            </template>
            <template #actions="{ record }">
              <a-link @click="viewField(record)">查看</a-link>
              <a-divider direction="vertical" />
              <a-link @click="governField(record)">治理</a-link>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card :bordered="false" title="操作历史">
          <a-timeline>
            <a-timeline-item v-for="(h, i) in history" :key="i">
              <strong>{{ h.action }}</strong>
              <p style="margin: 4px 0; color: #86909c">{{ h.user }} · {{ h.time }}</p>
              <p>{{ h.note }}</p>
            </a-timeline-item>
          </a-timeline>
        </a-card>

        <a-card :bordered="false" title="相关标准" style="margin-top: 16px">
          <a-list size="small">
            <a-list-item v-for="(r, i) in related" :key="i">
              <a-link @click="goToStandard(r.code)">{{ r.code }} · {{ r.name }}</a-link>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
    <a-empty v-else description="标准不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { StandardStore } from '@/mock/shared/standard-store'

const route = useRoute()
const router = useRouter()

const standardId = route.params.code as string
const standard = ref<any>(null)

onMounted(() => {
  const all = StandardStore.getStandards()
  standard.value = all.find(s => s.code === standardId) || all[0]
})

const appliedColumns = [
  { title: '字段路径', dataIndex: 'fullPath' },
  { title: '当前值', dataIndex: 'sample', width: 130 },
  { title: '合规', dataIndex: 'compliant', slotName: 'compliance', width: 100 },
  { title: '操作', dataIndex: 'actions', slotName: 'actions', width: 120 }
]

const history = [
  { action: '编辑标准', user: '李数据', time: '2025-07-15 10:30', note: '更新了取值范围' },
  { action: '审核通过', user: '张主管', time: '2025-07-10 14:20', note: '合规性审核通过' },
  { action: '提交审核', user: '李数据', time: '2025-07-08 09:15', note: '首次提交' },
  { action: '创建标准', user: '李数据', time: '2025-07-05 16:45', note: '初始版本' }
]

const related = ref([
  { code: 'S002', name: '身份证号' },
  { code: 'S003', name: '手机号' },
  { code: 'S004', name: '邮箱地址' }
])

function statusColor(s: string) {
  return { published: 'green', draft: 'orange', deprecated: 'gray' }[s] || 'gray'
}
function statusLabel(s: string) {
  return { published: '已发布', draft: '草稿', deprecated: '已弃用' }[s] || s
}

function goEdit() {
  router.push({ name: 'data-standard', query: { edit: standardId } })
}
function goBack() {
  router.push('management/data-standard/standards')
}
function goToStandard(code: string) {
  // 标准详情页本身就是路由 `/management/data-standard/detail/:code`,
  // 直接走 vue-router,不再使用 window.location.href 整页刷新(那会绕过守卫并破坏 SPA 状态)
  router.push({ name: 'data-standard-detail', params: { code } })
}

// 「申请字段权限」:把当前标准编码带到申请页 query
function applyPermission() {
  router.push({
    path: 'management/permission/data-permission/apply',
    query: {
      resourceType: 'dataStandard',
      resourceId: standardId,
      resourceName: standard.value?.name || standardId
    }
  })
}

// 「查看」「治理」:都跳到对应字段在数据地图的详情视图
function viewField(record: any) {
  const [domain, table, field] = (record.fullPath || '').split('.')
  if (domain && table) {
    router.push({ path: 'discovery/data-map', query: { domain, table, focusField: field } })
  } else {
    router.push('discovery/data-map')
  }
}
function governField(record: any) {
  // 治理动作跳到元数据建模,带字段路径作为上下文
  router.push({ path: 'management/metadata/modeling', query: { fieldPath: record.fullPath } })
}
</script>

<style lang="scss" scoped>
.standard-detail-page {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;

  .formula {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-family: 'Menlo', monospace;
    font-size: 13px;
    color: #165dff;
    margin: 0;
  }
}
</style>