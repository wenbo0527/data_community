<template>
  <div :class="containerClasses">
    <!-- 外层卡片 -->
    <a-card v-if="showOuterCard" class="generic-card-grid-outer">
      <!-- 外层卡片标题 -->
      <template #title>
        <slot name="outer-card-title">
          {{ outerCardTitle }}
        </slot>
      </template>

      <!-- 外层卡片额外内容 -->
      <template #extra>
        <slot name="outer-card-extra"></slot>
      </template>

      <!-- 卡片网格内容 -->
      <template #default>
        <CardGridContent />
      </template>
    </a-card>

    <!-- 无外层卡片，直接显示网格 -->
    <CardGridContent v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CardGridContent from './GenericCardGridContent.vue'

// Props 定义
const props = defineProps({
  // 数据
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

  // 布局
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

  // 外层卡片
  showOuterCard: {
    type: Boolean,
    default: false
  },
  outerCardTitle: {
    type: String,
    default: ''
  },

  // 交互
  hoverable: {
    type: Boolean,
    default: true
  },
  clickable: {
    type: Boolean,
    default: true
  },

  // 分页
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

// Emits 定义
const emit = defineEmits([
  'card-click',
  'create-collection',
  'page-change',
  'page-size-change'
])

// 计算属性
const containerClasses = computed(() => {
  return [
    'generic-card-grid',
    {
      'is-loading': props.loading
    }
  ]
})

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
.generic-card-grid {
  width: 100%;
}

.generic-card-grid-outer {
  border-radius: 8px;
}
</style>
