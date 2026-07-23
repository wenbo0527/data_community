<template>
  <!-- @prd: notifications -->
  <div class="notifications-page">
    <a-card title="通知管理" :bordered="false">
      <a-empty description="通知功能规划中，详细需求待 Paimon 拍板。">
        <template #image>
          <icon-notification :size="48" />
        </template>
      </a-empty>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { IconNotification } from '@arco-design/web-vue/es/icon'
</script>