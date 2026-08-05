<template>
  <div class="exploration-page">
    <a-page-header title="数据探索" sub-title="客群分析、标签体系、虚拟事件、工作流、看板">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
      </template>
    </a-page-header>

    <!-- 模块入口 -->
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card class="module-card" @click="go('exploration/customer-center/audience-system/audience-management')">
          <template #title><span><icon-user /> 客群管理</span></template>
          <p>基于标签 + 规则 + 行为圈选客群,创建活动受众</p>
          <div class="stats">
            <a-statistic title="我的客群" :value="32" />
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="module-card" @click="go('exploration/customer-center/tag-system')">
          <template #title><span><icon-tag /> 标签体系</span></template>
          <p>用户标签、行为标签、规则标签、模型标签的统一管理</p>
          <div class="stats">
            <a-statistic title="已建标签" :value="156" />
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="module-card" @click="go('exploration/customer-center/event-center')">
          <template #title><span><icon-thunderbolt /> 虚拟事件</span></template>
          <p>业务事件的虚拟化定义与触发追踪</p>
          <div class="stats">
            <a-statistic title="活跃事件" :value="48" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card class="module-card" @click="go('exploration/workflows')">
          <template #title><span><icon-flow /> 分析工作流</span></template>
          <p>可视化编排数据采集、清洗、计算、推送全流程</p>
          <div class="stats">
            <a-statistic title="我的工作流" :value="12" />
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="module-card" @click="go('exploration/indicator-dashboard')">
          <template #title><span><icon-dashboard /> 指标看板</span></template>
          <p>业务指标可视化、对比分析、趋势监控</p>
          <div class="stats">
            <a-statistic title="看板数量" :value="8" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近活动 -->
    <a-card title="最近探索活动" style="margin-top: 16px">
      <a-list>
        <a-list-item v-for="(a, idx) in recent" :key="idx">
          <a-list-item-meta>
            <template #avatar>
              <a-avatar :style="{ background: a.color }">{{ a.icon }}</a-avatar>
            </template>
            <template #title>{{ a.title }}</template>
            <template #description>{{ a.time }} · {{ a.summary }}</template>
          </a-list-item-meta>
        </a-list-item>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const recent = ref([
  { icon: '👥', color: '#165dff', title: '新建客群「高价值理财人群」', time: '今天 14:30', summary: '基于 AUM ≥ 100 万 + 近 30 天活跃,共 25,830 人' },
  { icon: '🏷', color: '#00b42a', title: '更新标签「VIP客户」', time: '今天 11:20', summary: '资产 ≥ 50 万且活跃,共 18,420 人' },
  { icon: '⚡', color: '#ff7d00', title: '触发事件「登录成功」', time: '昨天 16:45', summary: '1,250,830 次触发' },
  { icon: '📊', color: '#722ed1', title: '查看看板「DAU/MAU 趋势」', time: '昨天 09:15', summary: 'DAU 580K,MAU 2.3M' }
])

function go(path: string) {
  router.push(path)
}
const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.exploration-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .module-card {
    cursor: pointer;
    transition: all 0.2s;
    &:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

    p { color: #86909c; font-size: 13px; margin: 8px 0 12px; }
    .stats { padding-top: 12px; border-top: 1px solid #f2f3f5; }
  }
}
</style>