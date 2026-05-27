<template>
  <a-layout class="mkt-layout" :class="{ 'collapsed': collapsed }">
    <!-- 顶部导航 -->
    <a-layout-header class="header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-text">🏛️ 营销域 (MKT)</span>
        </div>
      </div>
      <div class="header-right">
        <a-button type="text" @click="handleToggle">
          {{ collapsed ? '展开' : '收起' }}
        </a-button>
      </div>
    </a-layout-header>

    <a-layout>
      <!-- 侧边栏 -->
      <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible width="220" class="sider">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          mode="inline"
          theme="light"
          @click="handleMenuClick"
        >
          <!-- 权益中心 -->
          <a-sub-menu key="benefit">
            <template #title>
              <span class="menu-group-title">
                <span class="menu-group-icon">📦</span>
                权益中心
              </span>
            </template>
            <a-menu-item key="/benefit">
              <span>权益首页</span>
            </a-menu-item>
            <a-sub-menu key="coupon-group" title="券管理">
              <a-menu-item key="/benefit/template">券模板管理</a-menu-item>
              <a-menu-item key="/benefit/management">券管理</a-menu-item>
              <a-menu-item key="/benefit/package">券包管理</a-menu-item>
              <a-menu-item key="/benefit/inventory">券库存管理</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="alert-group" title="预警中心">
              <a-menu-item key="/marketing/alert/management">预警管理</a-menu-item>
              <a-menu-item key="/marketing/alert/rules">预警规则</a-menu-item>
              <a-menu-item key="/marketing/alert/rules/create">创建预警规则</a-menu-item>
              <a-menu-item key="/marketing/alert/history">预警历史</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="stats-group" title="统计分析">
              <a-menu-item key="/benefit/statistics">权益统计</a-menu-item>
              <a-menu-item key="/benefit/logs">权益日志</a-menu-item>
            </a-sub-menu>
          </a-sub-menu>

          <!-- 触达系统 -->
          <a-sub-menu key="touch">
            <template #title>
              <span class="menu-group-title">
                <span class="menu-group-icon">📢</span>
                触达系统
              </span>
            </template>
            <a-menu-item key="/touch">
              <span>触达首页</span>
            </a-menu-item>
            <a-sub-menu key="policy-group" title="策略管理">
              <a-menu-item key="/touch/policy/overview">策略数据概览</a-menu-item>
              <a-menu-item key="/touch/policy/template">策略模板</a-menu-item>
              <a-menu-item key="/touch/policy/template/create">创建策略模板</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="query-group" title="触达查询">
              <a-menu-item key="/touch/query">触达查询</a-menu-item>
              <a-menu-item key="/touch/query/detail">触达详情</a-menu-item>
              <a-menu-item key="/touch/query/ai-call-records">AI呼叫记录</a-menu-item>
              <a-menu-item key="/touch/query/ai-sms-vendor-records">AI短信厂商记录</a-menu-item>
              <a-menu-item key="/touch/query/manual-call-records">人工呼叫记录</a-menu-item>
              <a-menu-item key="/touch/query/sms-records">短信记录</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="channel-group" title="渠道管理">
              <a-menu-item key="/touch/channel">渠道管理</a-menu-item>
              <a-menu-item key="/touch/channel/sms-template">短信模板</a-menu-item>
              <a-menu-item key="/touch/channel/sms-template/create">创建短信模板</a-menu-item>
              <a-menu-item key="/touch/channel/ai-call-template">AI外呼模板</a-menu-item>
              <a-menu-item key="/touch/channel/manual-call-template">人工电销模板</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="vendor-group" title="厂商管理">
              <a-menu-item key="/touch/channel/vendors">厂商管理</a-menu-item>
              <a-menu-item key="/touch/channel/vendors/sms">短信厂商</a-menu-item>
              <a-menu-item key="/touch/channel/vendors/ai">AI厂商</a-menu-item>
              <a-menu-item key="/touch/channel/blacklist">黑名单管理</a-menu-item>
              <a-menu-item key="/touch/channel/alert">渠道预警</a-menu-item>
              <a-menu-item key="/touch/channel/rate-limit">渠道限流</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="system-group" title="系统配置">
              <a-menu-item key="/touch/system">系统概览</a-menu-item>
              <a-menu-item key="/touch/system/dictionary">系统词典</a-menu-item>
              <a-menu-item key="/touch/manual-sms">手动短信</a-menu-item>
            </a-sub-menu>
          </a-sub-menu>

          <!-- 客群中心 -->
          <a-sub-menu key="customer">
            <template #title>
              <span class="menu-group-title">
                <span class="menu-group-icon">👥</span>
                客群中心
              </span>
            </template>
            <a-menu-item key="/customer">
              <span>客群首页</span>
            </a-menu-item>
            <a-sub-menu key="audience-group" title="人群管理">
              <a-menu-item key="/customer/list">人群列表</a-menu-item>
              <a-menu-item key="/customer/selector">人群圈选</a-menu-item>
              <a-menu-item key="/customer/portrait">客户画像</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="event-group" title="事件中心">
              <a-menu-item key="/customer/event-center">事件首页</a-menu-item>
              <a-menu-item key="/customer/event-management">事件管理</a-menu-item>
              <a-menu-item key="/customer/virtual-events">虚拟事件</a-menu-item>
              <a-menu-item key="/customer/sample-stats">样本统计</a-menu-item>
              <a-menu-item key="/customer/kafka-datasource">Kafka数据源</a-menu-item>
            </a-sub-menu>
          </a-sub-menu>

          <!-- 人工电销工作台 -->
          <a-sub-menu key="call-group">
            <template #title>
              <span class="menu-group-title">
                <span class="menu-group-icon">📞</span>
                人工电销工作台
              </span>
            </template>
            <a-menu-item key="/call">
              <span>数据看板</span>
            </a-menu-item>
            <a-menu-item key="/call/task">任务列表</a-menu-item>
            <a-menu-item key="/call/list">名单管理</a-menu-item>
            <a-menu-item key="/call/record">通话记录</a-menu-item>
            <a-menu-item key="/call/agent">坐席管理</a-menu-item>
            <a-menu-item key="/call/team">班组管理</a-menu-item>
            <a-menu-item key="/call/settings">系统设置</a-menu-item>
          </a-sub-menu>

          <!-- 横向画布 -->
          <a-menu-item key="/canvas">
            <span class="menu-group-icon">🎨</span>
            <span>横向画布</span>
          </a-menu-item>

          <!-- 任务中心 -->
          <a-menu-item key="/marketing/tasks/horizontal">
            <span class="menu-group-icon">📋</span>
            <span>任务中心</span>
          </a-menu-item>

          <!-- 标签体系 (客群中心下) -->
          <a-sub-menu key="tag-system">
            <template #title>
              <span class="menu-group-title">
                <span class="menu-group-icon">🏷️</span>
                标签体系
              </span>
            </template>
            <a-menu-item key="/customer/tag-management">标签管理</a-menu-item>
            <a-menu-item key="/customer/tag-create">创建标签</a-menu-item>
            <a-menu-item key="/customer/tag-system">标签系统</a-menu-item>
            <a-menu-item key="/customer/tag-table">标签表管理</a-menu-item>
            <a-menu-item key="/customer/attribute-management">属性管理</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>

      <!-- 主内容区 -->
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>(['benefit', 'touch', 'customer', 'call-group', 'tag-system'])

watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath]
  // 自动展开对应的子菜单
  if (newPath.startsWith('/benefit')) openKeys.value = ['benefit']
  else if (newPath.startsWith('/touch')) openKeys.value = ['touch']
  else if (newPath.startsWith('/customer')) openKeys.value = ['customer', 'tag-system']
  else if (newPath.startsWith('/call')) openKeys.value = ['call-group']
  else if (newPath.startsWith('/marketing/alert')) openKeys.value = ['benefit']
})

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

const handleToggle = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.mkt-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.sider {
  background: #fff;
  overflow-y: auto;
  border-right: 1px solid #e5e6e8;
}

.content {
  background: #f5f6f7;
  padding: 16px;
  overflow-y: auto;
}

.menu-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.menu-group-icon {
  font-size: 14px;
}
</style>