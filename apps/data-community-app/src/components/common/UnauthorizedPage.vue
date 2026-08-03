<template>
  <div class="unauthorized-page">
    <a-result
      status="warning"
      title="无访问权限"
      :sub-title="subTitle"
    >
      <template #icon>
        <icon-lock style="font-size: 64px; color: #ff7d00;" />
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="onSwitchRole">
            <template #icon><icon-user /></template>
            切换角色
          </a-button>
          <a-button @click="onGoHome">
            <template #icon><icon-home /></template>
            返回首页
          </a-button>
        </a-space>
      </template>
    </a-result>

    <a-card class="info-card" :bordered="false">
      <a-descriptions title="详细信息" :column="1">
        <a-descriptions-item label="您当前角色">
          <a-tag :color="roleStore.currentRoleDef.color">
            {{ roleStore.currentRoleDef.avatar }} {{ roleStore.currentRoleDef.label }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="您的部门">{{ roleStore.currentRoleDef.department }}</a-descriptions-item>
        <a-descriptions-item v-if="requiredRole" label="该页面需要角色">
          <a-tag v-for="r in requiredRole.split(',')" :key="r" size="small" color="red" style="margin-right: 4px;">{{ roleLabel(r) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item v-if="fromPath" label="来源页面">
          <code>{{ fromPath }}</code>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IconLock, IconUser, IconHome } from '@arco-design/web-vue/es/icon'
import { useRoleStore } from '@/stores/role'
import { ROLE_DEFINITIONS, type UserRole } from '@/types/roles'

const route = useRoute()
const router = useRouter()
const roleStore = useRoleStore()

const fromPath = computed(() => route.query.from as string || '')
const requiredRole = computed(() => route.query.requiredRole as string || '')

const subTitle = computed(() => {
  if (fromPath.value) {
    return `您尝试访问 ${fromPath.value} 但当前角色无权访问`
  }
  return '请切换到具有访问权限的角色,或联系管理员'
})

const roleLabel = (role: string) => {
  const def = ROLE_DEFINITIONS[role as UserRole]
  return def ? `${def.avatar} ${def.label}` : role
}

const onSwitchRole = () => {
  // 跳转到任何工作台都行,RoleSwitcher 会在那里显示
  const path = roleStore.defaultLanding.startsWith('/')
    ? roleStore.defaultLanding.substring(1)
    : roleStore.defaultLanding
  router.push(path)
}

const onGoHome = () => {
  const path = roleStore.defaultLanding.startsWith('/')
    ? roleStore.defaultLanding.substring(1)
    : roleStore.defaultLanding
  router.push(path)
}
</script>

<style lang="scss" scoped>
.unauthorized-page {
  padding: 32px;
  max-width: 800px;
  margin: 64px auto;
}

.info-card {
  margin-top: 24px;
}
</style>