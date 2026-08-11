<template>
  <div class="notification-detail-content">
    <a-typography-paragraph>
      {{ notification?.content || '暂无内容' }}
    </a-typography-paragraph>
    <div v-if="notification?.attachments?.length" class="attachments">
      <div v-for="att in notification.attachments" :key="att.name" class="attachment-item">
        <a-link>{{ att.name }}</a-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  notification?: any
}>()
</script>

<style scoped>
.notification-detail-content {
  padding: 16px 0;
}
.attachments {
  margin-top: 12px;
}
.attachment-item {
  margin-bottom: 4px;
}
</style>
