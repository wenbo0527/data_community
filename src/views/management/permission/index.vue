<template>
  <div class="permission-management">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'PermissionManagement'
}
</script>

<style lang="less" scoped>
.permission-management {
  height: 100%;
  padding: 16px;
  background-color: #f5f6fa;
}
</style>