<template>
  <div class="unauthorized-page">
    <a-result
      status="403"
      title="403"
      sub-title="抱歉,您没有权限访问此页面"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" @click="$router.push('/home')">返回首页</a-button>
          <a-button @click="$router.back()">返回上一页</a-button>
        </a-space>
      </template>
    </a-result>

    <a-card title="权限详情" :bordered="false" style="margin-top: 24px; max-width: 600px; margin-left: auto; margin-right: auto;">
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="需要的角色">
          <a-tag color="orange">{{ requiredRole || '特定角色' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="当前角色">
          <a-tag>{{ currentRole || '匿名' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="如何获取权限">
          请联系数据治理组或管理员申请对应角色权限
        </a-descriptions-item>
        <a-descriptions-item label="页面路径">
          <code>{{ $route.path }}</code>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup>
/**
 * 无访问权限页 - 占位实现
 */
defineProps({
  requiredRole: { type: String, default: '' },
  currentRole: { type: String, default: '' }
})
</script>

<style scoped>
.unauthorized-page {
  padding: 48px 24px;
  text-align: center;
}
</style>