<template>
  <div class="notification-stats">
    <a-row :gutter="12">
      <a-col :span="6" v-for="stat in stats" :key="stat.category">
        <a-card 
          class="stat-card" 
          :class="{ 'clickable': stat.count > 0 }"
          @click="handleCategoryClick(stat.category)"
        >
          <div class="stat-content">
            <div class="stat-icon">
              <component :is="stat.icon" :style="{ color: stat.color }" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stat.count }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
            <div class="stat-trend" v-if="stat.trend">
              <a-tag 
                :color="stat.trend > 0 ? 'green' : stat.trend < 0 ? 'red' : 'blue'" 
                size="small"
              >
                {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}
              </a-tag>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IconSafe, 
  IconFile, 
  IconBook, 
  IconNotification 
} from '@arco-design/web-vue/es/icon'
import { ResourceCategory } from '@/types/community'

const router = useRouter()

// 统计数据
const stats = ref([
  {
    category: ResourceCategory.POLICY,
    label: '政策制度',
    icon: IconSafe,
    color: '#165dff',
    count: 0,
    trend: 0
  },
  {
    category: ResourceCategory.CASES,
    label: '实践案例',
    icon: IconFile,
    color: '#00b42a',
    count: 0,
    trend: 0
  },
  {
    category: ResourceCategory.GUIDE,
    label: '操作指南',
    icon: IconBook,
    color: '#ff7d00',
    count: 0,
    trend: 0
  },
  {
    category: ResourceCategory.NEWS,
    label: '社区动态',
    icon: IconNotification,
    color: '#f53f3f',
    count: 0,
    trend: 0
  }
])

// 获取通知统计数据
const fetchNotificationStats = async () => {
  try {
    // 导入通知API服务
    const NotificationAPI = (await import('@/api/notification')).default
    
    // 获取各分类的通知统计
    for (const stat of stats.value) {
      const response = await NotificationAPI.getNotifications({
        category: stat.category,
        status: 'published',
        pageSize: 1,
        page: 1
      })
      
      if (response.success) {
        stat.count = response.data.total || 0
        
        // 获取今日新增数量作为趋势
        const todayResponse = await NotificationAPI.getNotifications({
          category: stat.category,
          status: 'published',
          publishTimeStart: new Date().toISOString().split('T')[0],
          pageSize: 1,
          page: 1
        })
        
        if (todayResponse.success) {
          stat.trend = todayResponse.data.total || 0
        }
      }
    }
  } catch (error) {
    console.error('获取通知统计失败:', error)
    // 使用模拟数据作为降级方案
    stats.value = [
      {
        category: ResourceCategory.POLICY,
        label: '政策制度',
        icon: IconSafe,
        color: '#165dff',
        count: 12,
        trend: 2
      },
      {
        category: ResourceCategory.CASES,
        label: '实践案例',
        icon: IconFile,
        color: '#00b42a',
        count: 8,
        trend: 1
      },
      {
        category: ResourceCategory.GUIDE,
        label: '操作指南',
        icon: IconBook,
        color: '#ff7d00',
        count: 15,
        trend: 3
      },
      {
        category: ResourceCategory.NEWS,
        label: '社区动态',
        icon: IconNotification,
        color: '#f53f3f',
        count: 6,
        trend: 1
      }
    ]
  }
}

// 点击分类卡片
const handleCategoryClick = (category) => {
  // 跳转到社区资源页面，并选中对应的分类
  router.push({
    path: '/community',
    query: { category }
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNotificationStats()
})

// 暴露刷新方法供父组件调用
defineExpose({
  refresh: fetchNotificationStats
})
</script>

<style scoped>
.notification-stats {
  width: 100%;
}

.stat-card {
  cursor: default;
  transition: all 0.3s ease;
  border: 1px solid #e5e6eb;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.stat-icon {
  font-size: 24px;
  margin-right: 12px;
}

.stat-info {
  flex: 1;
  text-align: left;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86909c;
  line-height: 1;
}

.stat-trend {
  margin-left: 8px;
}
</style>