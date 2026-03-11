<template>
  <a-layout class="touch-layout">
    <a-layout-sider class="touch-sider" :width="220" breakpoint="lg">
      <div class="sider-title">触达系统</div>
      <a-menu
        v-model:selected-keys="selectedKeys"
        :default-selected-keys="[defaultKey]"
        @menu-item-click="onMenuClick"
      >
        <a-menu-item key="/touch">触达首页</a-menu-item>
        <a-sub-menu key="/touch/system">
          <template #title>系统管理</template>
          <a-menu-item key="/touch/system">系统概览</a-menu-item>
          <a-menu-item key="/touch/system/dictionary">字典管理</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="/touch/policy">
          <template #title>策略管理</template>
          <a-menu-item key="/touch/policy/template">策略模板</a-menu-item>
          <a-menu-item key="/touch/policy/overview">数据概览</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="/touch/channel">
          <template #title>渠道管理</template>
          <a-menu-item key="/touch/channel/manual-call-template">人工外呼模板</a-menu-item>
          <a-menu-item key="/touch/channel/sms-template">短信模板</a-menu-item>
          <a-menu-item key="/touch/channel/ai-call-template">AI外呼模板</a-menu-item>
          <a-menu-item key="/touch/channel/alert">预警管理</a-menu-item>
          <a-menu-item key="/touch/channel/rate-limit">全局频控</a-menu-item>
          <a-menu-item key="/touch/channel/blacklist">黑名单管理</a-menu-item>
          <a-sub-menu key="/touch/channel/vendors">
            <template #title>供应商管理</template>
            <a-menu-item key="/touch/channel/vendors">总览</a-menu-item>
            <a-menu-item key="/touch/channel/vendors/ai">AI供应商</a-menu-item>
            <a-menu-item key="/touch/channel/vendors/sms">短信供应商</a-menu-item>
          </a-sub-menu>
        </a-sub-menu>
        <a-sub-menu key="/touch/query">
          <template #title>触达查询</template>
          <a-menu-item key="/touch/query">总览</a-menu-item>
          <a-menu-item key="/touch/query/detail">触达查询明细</a-menu-item>
          <a-menu-item key="/touch/query/sms-records">短信发送记录</a-menu-item>
          <a-menu-item key="/touch/query/ai-call-records">AI外呼记录</a-menu-item>
          <a-menu-item key="/touch/query/ai-sms-vendor-records">AI厂商短信记录</a-menu-item>
          <a-menu-item key="/touch/query/manual-call-records">人工外呼记录</a-menu-item>
          <a-menu-item key="/touch/query/manual-sms-vendor-records">人工厂商短信记录</a-menu-item>
          <a-menu-item key="/touch/query/marketing-search">营销记录查询</a-menu-item>
          <a-menu-item key="/touch/query/marketing-list">营销记录列表</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="/touch/manual-sms">
          <template #title>手工短信</template>
          <a-menu-item key="/touch/manual-sms">新建手工短信</a-menu-item>
          <a-menu-item key="/touch/manual-sms/list">手工短信列表</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content class="touch-content">
        <div class="touch-header" v-if="$route.name !== 'TouchIndex'">
          <a-breadcrumb>
            <a-breadcrumb-item>触达系统</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentPageTitle }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentPageTitle = computed(() => route.meta.title || route.name || '')

const selectedKeys = ref([])
const defaultKey = '/touch'

const updateSelected = () => {
  const p = route.path || defaultKey
  selectedKeys.value = [p.startsWith('/touch') ? p : defaultKey]
}
updateSelected()

watch(() => route.path, () => updateSelected(), { immediate: false })

const onMenuClick = (key) => {
  if (key && key !== route.path) router.push(key)
}
</script>

<style scoped>
.touch-layout {
  width: 100%;
  height: 100%;
}
.touch-sider {
  height: 100%;
  overflow: auto;
  border-right: 1px solid var(--color-border);
}
.sider-title {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 600;
}
.touch-header {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}
.touch-content {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
