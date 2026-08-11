<template>
  <div class="notifications-page">
    <a-page-header title="任务中心" sub-title="统一管理通知、待办、审批、告警 · 一站式跟进所有待处理事项">
      <template #extra>
        <a-button @click="goBack">返回</a-button>
        <a-button @click="markAllRead">全部已读</a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :span="6">
        <a-card :bordered="false" title="通知分类">
          <a-empty v-if="categories.length === 0" />
          <div
            v-for="c in categories" :key="c.code"
            class="category-item"
            :class="{ active: selectedCategory?.code === c.code }"
            @click="selectCategory(c)"
          >
            <span class="icon">{{ c.icon }}</span>
            <strong>{{ c.name }}</strong>
            <a-badge v-if="c.unread > 0" :count="c.unread" :max-count="99" />
          </div>
        </a-card>
      </a-col>

      <a-col :span="18">
        <a-card :bordered="false" :title="selectedCategory ? `${selectedCategory.name} - 通知列表` : '通知列表'">
          <template v-if="selectedCategory">
            <a-tabs v-model:active-key="filterRead" @change="onFilterChange">
              <a-tab-pane key="all" title="全部" />
              <a-tab-pane key="unread" title="未读" />
              <a-tab-pane key="read" title="已读" />
            </a-tabs>
            <a-list>
              <a-list-item v-for="(n, i) in filteredNotifications" :key="i" :class="{ unread: !n.read }">
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ background: n.color }">{{ n.icon }}</a-avatar>
                  </template>
                  <template #title>
                    <strong>{{ n.title }}</strong>
                    <a-tag v-if="!n.read" color="red" size="small" style="margin-left: 8px">未读</a-tag>
                  </template>
                  <template #description>
                    <div>{{ n.content }}</div>
                    <div style="color: #86909c; font-size: 12px; margin-top: 4px">{{ n.time }}</div>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-link @click="markRead(n)">{{ n.read ? '已读' : '标为已读' }}</a-link>
                  <a-divider direction="vertical" />
                  <a-link>查看详情</a-link>
                </template>
              </a-list-item>
            </a-list>
          </template>
          <a-empty v-else description="从左侧选择通知分类" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const categories = ref([
  { code: 'system', name: '系统通知', icon: '🔔', unread: 3 },
  { code: 'todo', name: '待办提醒', icon: '📋', unread: 5 },
  { code: 'approval', name: '审批通知', icon: '✅', unread: 2 },
  { code: 'alert', name: '告警通知', icon: '⚠', unread: 1 },
  { code: 'activity', name: '活动通知', icon: '🎉', unread: 0 }
])

const selectedCategory = ref<any>(null)
const filterRead = ref('all')

const notifications = ref<any[]>([])

function selectCategory(c: any) {
  selectedCategory.value = c
  // 加载对应分类的通知
  if (c.code === 'system') {
    notifications.value = [
      { title: '系统升级通知', content: '数据社区将于本周日 02:00-04:00 进行例行升级,期间部分功能不可用。', time: '今天 14:30', read: false, icon: '🔔', color: '#165dff' },
      { title: '新功能上线', content: '数据地图新增"收藏管理"功能,支持按收藏集分类管理。', time: '今天 09:15', read: false, icon: '🆕', color: '#00b42a' },
      { title: '数据源更新', content: 'dws_risk_score 数据源已升级到 v3.2,字段口径有调整,请关注。', time: '昨天 18:20', read: true, icon: '🔄', color: '#ff7d00' }
    ]
  } else if (c.code === 'todo') {
    notifications.value = [
      { title: '字段权限待审批', content: '王运营 提交的 3 个字段权限申请等待您的审批。', time: '今天 11:30', read: false, icon: '🔒', color: '#f53f3f' },
      { title: 'API 待发布', content: '您创建的"用户标签查询 API" 已通过审核,请发布。', time: '今天 10:00', read: false, icon: '🚀', color: '#722ed1' },
      { title: '指标待确认', content: '12 个业务指标口径待与业务方对齐。', time: '昨天 16:45', read: false, icon: '🎯', color: '#165dff' },
      { title: '周报待提交', content: '本周数据治理周报尚未提交,请尽快完成。', time: '昨天 09:00', read: true, icon: '📝', color: '#86909c' }
    ]
  } else if (c.code === 'approval') {
    notifications.value = [
      { title: '权限申请已通过', content: '您的字段权限申请已通过,可以访问 dim_user 表的全部字段。', time: '今天 15:20', read: false, icon: '✅', color: '#00b42a' },
      { title: 'API 上架已审核', content: '您提交的"客户余额查询 API" 已通过平台审核。', time: '昨天 17:00', read: false, icon: '✅', color: '#00b42a' }
    ]
  } else if (c.code === 'alert') {
    notifications.value = [
      { title: '数据质量告警', content: 'dim_user 表完整度从 95% 下降到 78%,请检查。', time: '今天 10:00', read: false, icon: '⚠', color: '#f53f3f' }
    ]
  } else {
    notifications.value = []
  }
}

const filteredNotifications = computed(() => {
  if (filterRead.value === 'all') return notifications.value
  if (filterRead.value === 'unread') return notifications.value.filter(n => !n.read)
  if (filterRead.value === 'read') return notifications.value.filter(n => n.read)
  return notifications.value
})

function markRead(n: any) {
  n.read = true
  Message.success('已标记为已读')
}

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
  Message.success('全部已读')
}

function onFilterChange() {
  // 触发 computed 重算
}

const goBack = () => router.push('management')
</script>

<style lang="scss" scoped>
.notifications-page {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
  .category-item {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 6px;
    cursor: pointer;
    background: #fafbfc;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    &:hover { background: #f2f3f5; }
    &.active { background: #e8f3ff; }
    .icon { font-size: 18px; }
  }
  :deep(.arco-list-item.unread) {
    background: #f0f7ff;
    border-left: 3px solid #165dff;
  }
}
</style>