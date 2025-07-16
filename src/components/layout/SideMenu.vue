<template>
  <div class="side-menu-container">
    <!-- 搜索框 -->
    <div class="menu-search" v-if="!collapsed && !isDetailPage">
      <a-input-search 
        v-model="searchText" 
        placeholder="搜索菜单" 
        allow-clear 
        size="small"
        @input="handleSearch"
      />
    </div>
    
    <!-- 菜单 -->
    <a-menu
      :style="{ width: '100%' }"
      :collapsed="collapsed"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      @menu-item-click="handleMenuClick"
      @sub-menu-click="handleSubMenuClick"
      show-collapse-button
      :active-key-style="{ 
        color: 'rgb(var(--primary-6))', 
        fontWeight: 'bold', 
        borderLeft: '3px solid rgb(var(--primary-6))', 
        paddingLeft: '13px' 
      }"
      :hover-key-style="{ backgroundColor: 'var(--color-fill-2)' }"
      :item-margin="8"
    >
      <MenuItemRenderer 
        :items="filteredMenuItems" 
        @item-click="handleMenuClick"
      />
    </a-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { convertToMenuTree, getMenuItemByPath, getMenuItemByRouteName } from '../../config/menuConfig'
import { navigateTo } from '../../router/utils'
import MenuItemRenderer from './MenuItemRenderer.vue'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  activeModule: {
    type: String,
    default: 'discovery'
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  isDetailPage: {
    type: Boolean,
    default: false
  }
})

// 搜索文本
const searchText = ref('')

// 选中的菜单项
const selectedKeys = ref([])

// 展开的子菜单
const openKeys = ref([])

// 原始菜单数据
const menuItems = computed(() => {
  return convertToMenuTree(props.activeModule)
})

// 过滤后的菜单数据
const filteredMenuItems = computed(() => {
  if (!searchText.value) {
    return menuItems.value
  }
  
  return filterMenuItems(menuItems.value, searchText.value.toLowerCase())
})

// 过滤菜单项
const filterMenuItems = (items, searchTerm) => {
  const result = []
  
  for (const item of items) {
    if (item.title.toLowerCase().includes(searchTerm)) {
      result.push(item)
    } else if (item.children) {
      const filteredChildren = filterMenuItems(item.children, searchTerm)
      if (filteredChildren.length > 0) {
        result.push({
          ...item,
          children: filteredChildren
        })
      }
    }
  }
  
  return result
}

// 处理搜索
const handleSearch = () => {
  // 搜索时自动展开所有匹配的父级菜单
  if (searchText.value) {
    const newOpenKeys = []
    const collectOpenKeys = (items, parentKey = '') => {
      for (const item of items) {
        if (item.children) {
          const currentKey = parentKey ? `${parentKey}-${item.key}` : item.key
          newOpenKeys.push(currentKey)
          collectOpenKeys(item.children, currentKey)
        }
      }
    }
    collectOpenKeys(filteredMenuItems.value)
    openKeys.value = newOpenKeys
  }
}

// 处理菜单项点击
const handleMenuClick = (item) => {
  try {
    if (typeof item === 'string') {
      // 兼容旧的字符串key格式，移除前缀
      let targetKey = item
      if (item.startsWith('item-')) {
        targetKey = item.replace('item-', '')
      } else if (item.startsWith('sub-')) {
        targetKey = item.replace('sub-', '')
      }
      
      selectedKeys.value = [targetKey]
      
      // 查找菜单项对应的路径
      const findMenuPath = (items, targetKey) => {
        for (const menuItem of items) {
          if (menuItem.key === targetKey) {
            return menuItem.path
          }
          if (menuItem.children) {
            const childPath = findMenuPath(menuItem.children, targetKey)
            if (childPath) return childPath
          }
        }
        return null
      }
      
      const menuPath = findMenuPath(menuItems.value, targetKey)
      if (menuPath) {
        navigateTo(router, menuPath)
      } else {
        console.warn(`未找到菜单项 ${targetKey} 对应的路径`)
      }
    } else if (item && item.path) {
      // 新的对象格式
      router.push(item.path)
      selectedKeys.value = [item.key]
    }
  } catch (error) {
    console.error('侧边菜单点击错误:', error)
  }
}

// 处理子菜单点击
const handleSubMenuClick = (key) => {
  const index = openKeys.value.indexOf(key)
  if (index > -1) {
    openKeys.value.splice(index, 1)
  } else {
    openKeys.value.push(key)
  }
}

// 根据当前路由更新选中状态
const updateSelectedFromRoute = () => {
  const menuInfo = getMenuItemByRouteName(route.name)
  if (menuInfo && menuInfo.item) {
    selectedKeys.value = [menuInfo.item.key]
    
    // 自动展开父级菜单
    if (menuInfo.parent) {
      const parentKeys = []
      let currentParent = menuInfo.parent
      while (currentParent) {
        parentKeys.unshift(currentParent)
        // 这里可以扩展为查找更深层的父级关系
        break
      }
      openKeys.value = [...new Set([...openKeys.value, ...parentKeys])]
    }
  }
}

// 监听路由变化
watch(
  () => route.name,
  () => {
    updateSelectedFromRoute()
  },
  { immediate: true }
)

// 监听活动模块变化，重置菜单状态
watch(
  () => props.activeModule,
  () => {
    selectedKeys.value = []
    openKeys.value = []
    searchText.value = ''
    updateSelectedFromRoute()
  }
)

// 暴露方法给父组件
defineExpose({
  clearSearch: () => {
    searchText.value = ''
  },
  setSelectedKeys: (keys) => {
    selectedKeys.value = keys
  }
})
</script>

<style scoped>
.side-menu-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-search {
  padding: 12px;
  border-bottom: 1px solid var(--color-border-2);
}

:deep(.arco-menu) {
  flex: 1;
  overflow-y: auto;
}

:deep(.arco-menu-item) {
  margin: 4px 8px;
  border-radius: 6px;
}

:deep(.arco-menu-sub) {
  margin: 4px 8px;
  border-radius: 6px;
}

:deep(.arco-menu-item:hover) {
  background-color: var(--color-fill-2);
}

:deep(.arco-menu-sub-menu-title:hover) {
  background-color: var(--color-fill-2);
}
</style>