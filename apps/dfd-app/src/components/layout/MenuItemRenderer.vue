<template>
  <template v-for="item in items" :key="item.key">
    <!-- 有子菜单的菜单项 -->
    <a-sub-menu 
      v-if="item.children && item.children.length > 0"
      :key="`sub-${item.key}`"
    >
      <template #icon v-if="item.icon">
        <component :is="getIconComponent(item.icon)" />
      </template>
      <template #title>{{ item.title }}</template>
      
      <!-- 递归渲染子菜单 -->
      <MenuItemRenderer 
        :items="item.children" 
        @item-click="$emit('item-click', $event)"
      />
    </a-sub-menu>
    
    <!-- 单个菜单项 -->
    <a-menu-item 
      v-else
      :key="`item-${item.key}`"
      @click="$emit('item-click', item.key)"
    >
      <template #icon v-if="item.icon">
        <component :is="getIconComponent(item.icon)" />
      </template>
      <span class="menu-item-text">{{ item.title }}</span>
    </a-menu-item>
  </template>
</template>

<script setup>
import { 
  IconApps,
  IconRobot, 
  IconExperiment,
  IconDashboard,
  IconSafe,
  IconSend,
  IconHome,
  IconSearch
} from '@arco-design/web-vue/es/icon'

// Props
const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

// 事件
const emit = defineEmits(['item-click'])

// 图标映射
const iconMap = {
  'icon-apps': IconApps,
  'icon-robot': IconRobot,
  'icon-experiment': IconExperiment,
  'icon-dashboard': IconDashboard,
  'icon-safe': IconSafe,
  'icon-send': IconSend,
  'icon-home': IconHome,
  'icon-search': IconSearch
}

// 获取图标组件
const getIconComponent = (iconName) => {
  return iconMap[iconName] || IconApps
}
</script>

<style scoped>
.menu-item-text {
  font-size: 14px;
}

:deep(.arco-menu-item) {
  transition: all 0.2s ease;
}

:deep(.arco-menu-sub-menu-title) {
  transition: all 0.2s ease;
}
</style>