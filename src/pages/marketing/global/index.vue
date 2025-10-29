<template>
  <div class="global-management">
    <a-card title="全局管理" :bordered="false">
      <div class="management-grid">
        <a-card 
          class="management-item" 
          hoverable
          @click="$router.push('/marketing/global/rules')"
        >
          <template #cover>
            <div class="item-icon">
              <icon-settings />
            </div>
          </template>
          <a-card-meta
            title="规则配置"
            description="管理全局业务规则和配置项"
          />
        </a-card>
        
        <a-card 
          class="management-item" 
          hoverable
          @click="$router.push('/marketing/alert/rules')"
        >
          <template #cover>
            <div class="item-icon">
              <icon-notification />
            </div>
          </template>
          <a-card-meta
            title="预警配置"
            description="配置监控预警规则和通知设置"
          />
        </a-card>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { IconSettings, IconNotification } from '@arco-design/web-vue/es/icon'
</script>

<style scoped>
.global-management {
  padding: 20px;
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.management-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.management-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  font-size: 32px;
  color: #165dff;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>