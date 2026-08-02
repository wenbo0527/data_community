<template>
  <a-card class="my-artifacts" :bordered="false">
    <template #title>
      <div class="panel-header">
        <icon-storage class="header-icon" />
        <span class="header-title">我的产出</span>
        <a-tag size="small">{{ totalCount }}</a-tag>
      </div>
    </template>
    <template #extra>
      <a-link @click="showAll = true">查看全部</a-link>
    </template>

    <a-tabs v-model:active-key="activeTab" size="small">
      <a-tab-pane v-for="tab in tabs" :key="tab.key">
        <template #title>
          {{ tab.title }} ({{ counts[tab.key] }})
        </template>
        <a-empty v-if="counts[tab.key] === 0" :description="`暂无${tab.title}`" />
        <a-list
          v-else
          :data="artifacts.filter(a => a.type === tab.key).slice(0, 4)"
          :bordered="false"
        >
          <template #item="item">
            <a-list-item class="artifact-item">
              <a-list-item-meta>
                <template #avatar>
                  <component :is="getIcon(item.item.type)" class="artifact-icon" />
                </template>
                <template #title>
                  <a-link @click="onOpen(item.item)">{{ item.item.title }}</a-link>
                </template>
                <template #description>
                  <span class="artifact-meta">
                    <a-tag v-if="item.item.status" size="small" :color="statusColor(item.item.status)">
                      {{ statusLabel(item.item.status) }}
                    </a-tag>
                    <span class="artifact-time">{{ item.item.time }}</span>
                  </span>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IconStorage,
  IconBranch,
  IconDesktop,
  IconUserGroup,
  IconTags,
  IconCalendar
} from '@arco-design/web-vue/es/icon'
import { useCrossNav } from '@/composables/useCrossNav'
import { useRoleStore } from '@/stores/role'
import { computed } from 'vue'

interface Artifact {
  id: string
  type: 'workflow' | 'dashboard' | 'audience' | 'tag' | 'report' | 'model'
  title: string
  status?: 'running' | 'success' | 'failed' | 'draft'
  time: string
  routeKey: string
  ownerId: string  // P1: 归属用户
}

const props = defineProps<{
  artifacts?: Artifact[]
}>()

const emit = defineEmits<{
  open: [artifact: Artifact]
}>()

const { go } = useCrossNav()
const activeTab = ref('workflow')
const showAll = ref(false)

// P1.3: 当前用户(从 role store 推断)
const roleStore = useRoleStore()

const roleToUserId: Record<string, string> = {
  data_engineer: 'user-zhangsan',
  data_admin: 'user-zhangsan',
  risk_analyst: 'user-fengkong',
  risk_manager: 'user-fengkong',
  loan_manager: 'user-xindai',
  operation_lead: 'user-yunying',
  marketing_lead: 'user-yingxiao',
  product_manager: 'user-chanpin',
  finance_lead: 'user-caiwu',
  admin: 'user-system'
}

const currentUserId = computed(() => roleToUserId[roleStore.currentRole] || 'user-zhangsan')

// P1.3: 按用户的 mock 产出
const mockArtifacts: Artifact[] = [
  // 张三(数据工程师/数据治理)
  { id: 'a1', type: 'workflow', title: 'DAU 计算工作流', status: 'success', time: '今天 14:30', routeKey: 'exploration:workflows', ownerId: 'user-zhangsan' },
  { id: 'a2', type: 'tag', title: '高价值潜力标签 v2', status: 'success', time: '昨天 09:15', routeKey: 'exploration:tag-system', ownerId: 'user-zhangsan' },
  { id: 'a3', type: 'dashboard', title: '数据资产总览看板', status: 'success', time: '2 天前', routeKey: 'exploration:indicator-dashboard', ownerId: 'user-zhangsan' },
  { id: 'a4', type: 'audience', title: '数据质量监控人群', status: 'draft', time: '今天 10:00', routeKey: 'exploration:audience-management', ownerId: 'user-zhangsan' },

  // 风控值班
  { id: 'b1', type: 'audience', title: '严重逾期催收名单', status: 'success', time: '今天 11:20', routeKey: 'exploration:audience-management', ownerId: 'user-fengkong' },
  { id: 'b2', type: 'model', title: '欺诈检测模型 v2', status: 'failed', time: '昨天 22:00', routeKey: 'exploration:workflows', ownerId: 'user-fengkong' },
  { id: 'b3', type: 'dashboard', title: '风控监控看板', status: 'running', time: '今天 09:00', routeKey: 'exploration:indicator-dashboard', ownerId: 'user-fengkong' },
  { id: 'b4', type: 'report', title: '周催收报表', status: 'draft', time: '2 天前', routeKey: 'exploration:indicator-dashboard', ownerId: 'user-fengkong' },

  // 信贷经理
  { id: 'c1', type: 'workflow', title: '授信转化漏斗', status: 'running', time: '昨天 09:15', routeKey: 'exploration:workflows', ownerId: 'user-xindai' },
  { id: 'c2', type: 'dashboard', title: '贷款额度看板', status: 'success', time: '3 天前', routeKey: 'exploration:indicator-dashboard', ownerId: 'user-xindai' },
  { id: 'c3', type: 'audience', title: '高意向贷款人群', status: 'success', time: '今天 14:00', routeKey: 'exploration:audience-management', ownerId: 'user-xindai' },

  // 王运营
  { id: 'd1', type: 'audience', title: '高价值活跃用户', status: 'success', time: '今天 10:00', routeKey: 'exploration:audience-management', ownerId: 'user-yunying' },
  { id: 'd2', type: 'audience', title: '新注册用户', status: 'draft', time: '昨天 16:20', routeKey: 'exploration:audience-management', ownerId: 'user-yunying' },
  { id: 'd3', type: 'report', title: '本周运营复盘', status: 'success', time: '今天 18:00', routeKey: 'exploration:indicator-dashboard', ownerId: 'user-yunying' },
  { id: 'd4', type: 'tag', title: '近期活跃用户', status: 'success', time: '昨天 09:00', routeKey: 'exploration:tag-system', ownerId: 'user-yunying' },

  // 营销经理
  { id: 'e1', type: 'audience', title: '营销潜客人群', status: 'success', time: '今天 15:00', routeKey: 'exploration:audience-management', ownerId: 'user-yingxiao' },
  { id: 'e2', type: 'dashboard', title: '营销活动效果', status: 'success', time: '今天 11:00', routeKey: 'exploration:indicator-dashboard', ownerId: 'user-yingxiao' },

  // 产品经理
  { id: 'f1', type: 'audience', title: '新功能体验用户', status: 'draft', time: '昨天 14:00', routeKey: 'exploration:audience-management', ownerId: 'user-chanpin' },

  // 财务主管
  { id: 'g1', type: 'report', title: 'Q1 销售复盘', status: 'success', time: '上周', routeKey: 'exploration:indicator-dashboard', ownerId: 'user-caiwu' }
]

// P1.3: 按当前用户过滤(核心改动)
const artifacts = computed(() =>
  props.artifacts || mockArtifacts.filter(a => a.ownerId === currentUserId.value)
)

const tabs = [
  { key: 'workflow', title: '工作流' },
  { key: 'dashboard', title: '看板' },
  { key: 'audience', title: '人群' },
  { key: 'tag', title: '标签' },
  { key: 'report', title: '报表' },
  { key: 'model', title: '模型' }
]

const counts = computed(() => {
  const map: Record<string, number> = {}
  artifacts.value.forEach(a => {
    map[a.type] = (map[a.type] || 0) + 1
  })
  return map
})

const totalCount = computed(() => artifacts.value.length)

const getIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    workflow: IconBranch,
    dashboard: IconDesktop,
    audience: IconUserGroup,
    tag: IconTags,
    report: IconStorage,
    model: IconCalendar
  }
  return iconMap[type] || IconStorage
}

const statusColor = (s: string) => ({
  running: 'arcoblue',
  success: 'green',
  failed: 'red',
  draft: 'gray'
}[s] || 'gray')

const statusLabel = (s: string) => ({
  running: '运行中',
  success: '成功',
  failed: '失败',
  draft: '草稿'
}[s] || s)

const onOpen = (artifact: Artifact) => {
  emit('open', artifact)
  go(artifact.routeKey)
}
</script>

<style lang="scss" scoped>
.my-artifacts {
  background: #fff;
  border-radius: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;

  .header-icon {
    color: #165dff;
    font-size: 18px;
  }

  .header-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
  }
}

.artifact-item {
  cursor: pointer;
  transition: background-color 0.15s;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 4px;

  &:hover {
    background-color: #f7f8fa;
  }
}

.artifact-icon {
  font-size: 20px;
  color: #165dff;
}

.artifact-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.artifact-time {
  font-size: 12px;
  color: #86909c;
}
</style>