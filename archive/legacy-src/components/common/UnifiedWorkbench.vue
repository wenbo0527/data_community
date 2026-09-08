<template>
  <div class="unified-workbench">
    <a-page-header title="统一工作台" class="page-header">
      <template #subtitle>
        <span class="header-subtitle">数据消费概览 + 跨模块快捷入口</span>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :span="6">
        <a-card><a-statistic title="今日访问" :value="2456" /></a-card>
      </a-col>
      <a-col :span="6">
        <a-card><a-statistic title="本周新增资产" :value="38" value-style="{ color: '#00B42A' }" /></a-card>
      </a-col>
      <a-col :span="6">
        <a-card><a-statistic title="待处理申请" :value="12" value-style="{ color: '#FF7D00' }" /></a-card>
      </a-col>
      <a-col :span="6">
        <a-card><a-statistic title="活跃用户" :value="186" /></a-card>
      </a-col>
    </a-row>

    <a-card title="快捷入口" style="margin-top: 16px">
      <a-row :gutter="[16, 16]">
        <a-col v-for="entry in entries" :key="entry.path" :xs="12" :sm="8" :md="6" :lg="4">
          <a-card class="entry-card" hoverable @click="$router.push(entry.path)">
            <div class="entry-icon">
              <span class="icon-emoji">{{ entry.icon }}</span>
            </div>
            <div class="entry-title">{{ entry.title }}</div>
            <div class="entry-desc">{{ entry.desc }}</div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <a-card title="最近活动" style="margin-top: 16px">
      <a-timeline>
        <a-timeline-item v-for="(act, idx) in activities" :key="idx">
          <div class="activity-title">{{ act.title }}</div>
          <div class="activity-meta">{{ act.user }} · {{ act.time }}</div>
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script setup>
/**
 * 统一工作台 - 占位实现
 *
 * 用于 exploration 域首页 / 其他场景的统一入口容器
 * @see 文档 §10.2 资产统计
 */

const entries = [
  { path: '/home/discovery/asset-overview', icon: '📊', title: '资产总览', desc: '查看全局资产' },
  { path: '/home/discovery/favorites', icon: '⭐', title: '我的关注', desc: '已收藏资源' },
  { path: '/home/discovery/search', icon: '🔍', title: '统一搜索', desc: '搜资产/指标' },
  { path: '/home/discovery/elements-dictionary', icon: '📚', title: '要素字典', desc: '指标/变量/特征' },
  { path: '/home/discovery/lineage', icon: '🔗', title: '数据血缘', desc: '上下游链路' },
  { path: '/home/discovery/impact-analysis', icon: '⚠️', title: '影响分析', desc: '下架前影响' },
  { path: '/home/management/data-standard/standards', icon: '📋', title: '数据标准', desc: '标准管理' },
  { path: '/home/management/permission/apply', icon: '🔐', title: '权限申请', desc: '我的申请' }
]

const activities = [
  { title: '新增资产 dim_user_v2', user: '张三', time: '2 小时前' },
  { title: '审批通过 APP-2025-003', user: '李四', time: '5 小时前' },
  { title: '数据标准稽核发现 12 个问题', user: '系统', time: '今天 09:00' },
  { title: '完成 DAU 指标定义更新', user: '营销经理', time: '昨天' }
]
</script>

<style scoped>
.unified-workbench { padding: 16px; }
.page-header { background: #fff; margin-bottom: 12px; }
.header-subtitle { color: var(--color-text-3); font-size: 13px; }
.entry-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.entry-card:hover {
  border-color: #165dff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
}
.entry-icon { font-size: 32px; margin-bottom: 8px; }
.icon-emoji { display: inline-block; }
.entry-title { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.entry-desc { font-size: 12px; color: var(--color-text-3); }
.activity-title { font-weight: 500; }
.activity-meta { font-size: 12px; color: var(--color-text-4); margin-top: 2px; }
</style>