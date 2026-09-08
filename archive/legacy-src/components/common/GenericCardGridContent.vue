<template>
  <div class="generic-card-grid-content">
    <!-- 骨架屏加载状态 -->
    <template v-if="loading">
      <a-row :gutter="gutter">
        <a-col v-for="i in skeletonCount" :key="i" v-bind="gridCols">
          <a-skeleton>
            <a-skeleton-shape shape="square" :style="{ width: '100%', height: cardMinHeight }" />
          </a-skeleton>
        </a-col>
      </a-row>
    </template>

    <!-- 空状态 -->
    <template v-else-if="items.length === 0">
      <div class="empty-state">
        <slot name="empty">
          <a-empty :description="emptyText" />
        </slot>
      </div>
    </template>

    <!-- 卡片网格 -->
    <template v-else>
      <a-row :gutter="gutter">
        <a-col v-for="item in items" :key="item.id || item.key" v-bind="gridCols">
          <a-card
            class="generic-card"
            :class="cardClasses"
            :hoverable="hoverable"
            @click="handleCardClick(item)"
          >
            <div class="card-content">
              <!-- 卡片标题 -->
              <div class="card-title">
                <slot name="card-title" :item="item">
                  <h4 class="title-text" :title="getTitle(item)">
                    {{ getTitle(item) }}
                  </h4>
                </slot>
              </div>

              <!-- 卡片描述 -->
              <div class="card-description">
                <slot name="card-description" :item="item">
                  <p class="description-text" :title="getDescription(item)">
                    {{ getDescription(item) }}
                  </p>
                </slot>
              </div>

              <!-- 卡片统计信息 -->
              <div class="card-stats" v-if="hasStatsSlot">
                <slot name="card-stats" :item="item"></slot>
              </div>

              <!-- 卡片操作按钮 -->
              <div class="card-actions" v-if="hasActionsSlot">
                <slot name="card-actions" :item="item"></slot>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="showPagination">
        <a-pagination
          :current="currentPage"
          :page-size="pageSize"
          :total="total"
          @change="handlePageChange"
          @show-size-change="handlePageSizeChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

// Props 定义（从父组件透传）
const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  gridCols: {
    type: Object,
    default: () => ({
      xs: 24,
      sm: 12,
      md: 12,
      lg: 8,
      xl: 6
    })
  },
  cardMinHeight: {
    type: [String, Number],
    default: '200px'
  },
  gutter: {
    type: Array,
    default: () => [16, 16]
  },
  hoverable: {
    type: Boolean,
    default: true
  },
  clickable: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 12
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

// Emits 定义（从父组件透传）
const emit = defineEmits([
  'card-click',
  'page-change',
  'page-size-change'
])

// 计算属性
const skeletonCount = computed(() => {
  // 根据当前网格列数计算骨架屏数量
  const lg = props.gridCols.lg || 8
  return Math.max(6, (24 / lg) * 2)
})

const hasStatsSlot = computed(() => {
  return !!Object.keys(useSlots()).includes('card-stats')
})

const hasActionsSlot = computed(() => {
  return !!Object.keys(useSlots()).includes('card-actions')
})

const cardClasses = computed(() => {
  return [
    'generic-card-item',
    {
      'is-clickable': props.clickable
    }
  ]
})

// 辅助方法
const getTitle = (item) => {
  return item.name || item.title || item.label || ''
}

const getDescription = (item) => {
  return item.description || item.desc || item.summary || ''
}

// 事件处理
const handleCardClick = (item) => {
  if (props.clickable) {
    emit('card-click', item)
  }
}

const handlePageChange = (page) => {
  emit('page-change', page)
}

const handlePageSizeChange = (size) => {
  emit('page-size-change', size)
}
</script>

<style scoped>
.generic-card-grid-content {
  width: 100%;
}

.empty-state {
  padding: 48px 0;
  text-align: center;
}

.generic-card {
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.generic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #165dff;
}

.generic-card.is-clickable {
  cursor: pointer;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-title {
  margin-bottom: 8px;
}

.title-text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-description {
  flex: 1;
  margin-bottom: 8px;
}

.description-text {
  margin: 0;
  font-size: 13px;
  color: #4e5969;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-stats {
  margin-bottom: 8px;
}

.card-actions {
  margin-top: auto;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
