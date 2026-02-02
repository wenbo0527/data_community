<template>
  <div class="table-collection-grid">
    <!-- 操作栏 -->
    <div class="grid-header" v-if="!loading">
      <div class="header-left">
        <span class="collection-count">共 {{ totalCount }} 个集合</span>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="handleCreateCollection">
          <template #icon>
            <IconPlus />
          </template>
          新增集合
        </a-button>
      </div>
    </div>
    
    <!-- 骨架屏加载状态 -->
    <template v-if="loading">
      <a-row :gutter="[16, 16]">
        <a-col v-for="i in 6" :key="i" :span="8">
          <a-skeleton>
            <a-skeleton-shape shape="square" :style="{ width: '100%', height: '200px' }" />
          </a-skeleton>
        </a-col>
      </a-row>
    </template>
    
    <!-- 表集合网格 -->
    <template v-else>
      <a-row :gutter="[16, 16]" v-if="displayCollections.length > 0">
        <a-col 
          v-for="collection in displayCollections" 
          :key="collection.id" 
          :xs="24" :sm="12" :md="12" :lg="8" :xl="6"
        >
          <a-card 
            class="collection-card" 
            hoverable 
            @click="handleCollectionClick(collection)"
          >
            <div class="card-content">
              <div class="card-title">
                <h4 class="title-text" :title="collection.name">
                  {{ collection.name }}
                  <span v-if="collection.isRecommended" class="recommended-icon">
                    <IconThumbUpFill />
                  </span>
                </h4>
                <div class="title-actions">
                  <a-tooltip content="申请权限">
                    <a-button 
                      type="text" 
                      size="mini" 
                      @click.stop="handleRequestPermission(collection)"
                      class="permission-btn"
                    >
                      <IconLock />
                    </a-button>
                  </a-tooltip>
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click.stop="toggleFavorite(collection)"
                    :class="{ 'favorited': collection.isFavorite }"
                  >
                    <IconStarFill v-if="collection.isFavorite" />
                    <IconStar v-else />
                  </a-button>
                  <a-dropdown @select="handleActionSelect" @click.stop>
                    <a-button type="text" size="mini" @click.stop>
                      <IconMore />
                    </a-button>
                    <template #content>
                      <a-doption :value="{ action: 'edit', collection: collection }">
                        <template #icon><IconEdit /></template>
                        编辑集合
                      </a-doption>
                      <a-doption :value="{ action: 'delete', collection: collection }" class="danger-option">
                        <template #icon><IconDelete /></template>
                        删除集合
                      </a-doption>
                    </template>
                  </a-dropdown>
                </div>
              </div>
              
              <!-- 统计信息区域 -->
              <div class="collection-stats">
                <a-tag size="small" :color="getCollectionColor(collection.type)">
                  {{ collection.type || '通用' }}
                </a-tag>
                <span class="table-count">{{ collection.tables.length }}张表</span>
              </div>
            
              <p class="card-description" :title="collection.description || '暂无描述'">
                {{ collection.description || '暂无描述' }}
              </p>
            </div>
          </a-card>
        </a-col>
      </a-row>
      
      <!-- 空状态 -->
      <a-empty v-else class="empty-state">
        <template #description>
          <span>暂无表集合</span>
        </template>
        <template #footer>
          <a-button type="primary" @click="$emit('create-collection')">
            创建第一个集合
          </a-button>
        </template>
      </a-empty>
    </template>
    
    <!-- 分页 -->
    <div v-if="!loading && totalCount > pageSize" class="pagination-wrapper">
      <a-pagination 
        v-model:current="currentPage"
        :total="totalCount"
        :page-size="pageSize"
        :show-total="true"
        :show-jumper="true"
        :show-page-size="true"
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  IconStar, IconStarFill, IconMore, IconEdit, 
  IconDelete, IconPlus, IconThumbUpFill, IconLock 
} from '@arco-design/web-vue/es/icon'
import { Message, Modal } from '@arco-design/web-vue'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface TableItem {
  name: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: any[]
}

interface TableCollection {
  id: string
  name: string
  description: string
  type?: string
  tables: TableItem[]
  owner?: string
  updateTime?: string
  isFavorite?: boolean
  isRecommended?: boolean
}

interface TableCollectionGridEmits {
  (e: 'collection-click', collection: TableCollection): void
  (e: 'create-collection'): void
  (e: 'edit-collection', collection: TableCollection): void
  (e: 'delete-collection', collection: TableCollection): void
  (e: 'favorite-change', collection: TableCollection, isFavorite: boolean): void
}

const props = defineProps<{
  collections: TableCollection[]
  loading?: boolean
  pageSize?: number
}>()

const emit = defineEmits<TableCollectionGridEmits>()

const currentPage = ref(1)
const pageSize = ref(props.pageSize || 12)

// 计算显示的集合
const displayCollections = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.collections.slice(start, end)
})

const totalCount = computed(() => props.collections.length)

// 获取集合类型颜色
const getCollectionColor = (type?: string) => {
  const colors: Record<string, string> = {
    '业务流程': 'blue',
    '数据分析': 'green',
    '风险管控': 'red',
    '用户画像': 'purple',
    '营销活动': 'orange'
  }
  return colors[type || '通用'] || 'gray'
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    // 如果是不到1分钟前的数据，特殊展示
    if (diffInSeconds < 60) {
      return '刚刚'
    }
    
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: zhCN 
    })
  } catch {
    return '未知'
  }
}

// 处理集合点击
const handleCollectionClick = (collection: TableCollection) => {
  emit('collection-click', collection)
}

// 处理创建集合
const handleCreateCollection = () => {
  emit('create-collection')
}

// 切换收藏状态
const toggleFavorite = (collection: TableCollection) => {
  const newFavoriteState = !collection.isFavorite
  emit('favorite-change', collection, newFavoriteState)
  
  if (newFavoriteState) {
    Message.success('已添加到收藏')
    // 用户需求：点击收藏后，支持一键权限申请
    Modal.confirm({
      title: '权限申请',
      content: `已收藏集合 "${collection.name}"，是否同步申请该集合下所有表的访问权限？`,
      okText: '立即申请',
      cancelText: '稍后处理',
      onOk: () => {
        handleRequestPermission(collection)
      }
    })
  } else {
    Message.success('已取消收藏')
  }
}

// 申请权限
const handleRequestPermission = (collection: TableCollection) => {
  Modal.confirm({
    title: '确认申请权限',
    content: `确定要申请集合 "${collection.name}" 的访问权限吗？申请将发送至数据负责人 ${collection.owner || '管理员'}。`,
    okText: '确定申请',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        Message.success(`集合 "${collection.name}" 的权限申请已提交`)
      } catch (error) {
        Message.error('申请失败，请重试')
      }
    }
  })
}

// 处理操作选择
const handleActionSelect = (value: string | number | Record<string, any>) => {
  console.log('[TableCollectionGrid] handleActionSelect called with value:', value, 'type:', typeof value)
  
  // 如果传递的是对象，直接使用
  if (typeof value === 'object' && value !== null && 'action' in value && 'collection' in value) {
    console.log('[TableCollectionGrid] Received collection object directly:', value)
    const { action, collection } = value
    
    switch (action) {
      case 'edit':
        console.log('[TableCollectionGrid] Emitting edit-collection event for collection:', collection)
        emit('edit-collection', collection)
        break
      case 'delete':
        console.log('[TableCollectionGrid] Handling delete for collection:', collection)
        handleDeleteCollection(collection)
        break
      default:
        console.warn('[TableCollectionGrid] Unknown action:', action)
    }
    return
  }
  
  // 保持原有的字符串处理方式
  const [action, id] = (value as string).split('-')
  console.log('[TableCollectionGrid] Parsed action and id:', { action, id })
  const collection = props.collections.find((c: TableCollection) => c.id === id)
  
  if (!collection) {
    console.warn('[TableCollectionGrid] Collection not found for id:', id)
    return
  }
  
  console.log('[TableCollectionGrid] Found collection:', collection)
  
  switch (action) {
    case 'edit':
      console.log('[TableCollectionGrid] Emitting edit-collection event for collection:', collection)
      emit('edit-collection', collection)
      break
    case 'delete':
      console.log('[TableCollectionGrid] Handling delete for collection:', collection)
      handleDeleteCollection(collection)
      break
    default:
      console.warn('[TableCollectionGrid] Unknown action:', action)
  }
}


// 删除集合
const handleDeleteCollection = (collection: TableCollection) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除集合 "${collection.name}" 吗？此操作不可撤销。`,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { status: 'danger' },
    onOk: () => {
      emit('delete-collection', collection)
      Message.success(`集合 "${collection.name}" 删除成功`)
    }
  })
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 监听集合变化，重置分页
watch(() => props.collections.length, () => {
  if (currentPage.value > Math.ceil(props.collections.length / pageSize.value)) {
    currentPage.value = 1
  }
})
</script>

<style scoped>
.table-collection-grid {
  padding: 0;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e6eb;
}

.header-left {
  display: flex;
  align-items: center;
}

.collection-count {
  font-size: 14px;
  color: var(--color-text-2);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collection-card {
  position: relative;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  transition: all 0.2s ease;
  cursor: pointer;
  height: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.recommended-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  color: #ff4757;
  font-size: 14px;
  animation: thumbBounce 2s infinite;
}

@keyframes thumbBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.collection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #165dff;
}

.collection-card :deep(.arco-card-body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.collection-cover {
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  padding: 24px;
  color: white;
  position: relative;
  min-height: 100px;
}

.cover-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
}

.collection-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.collection-stats :deep(.arco-tag) {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.table-count {
  font-size: 13px;
  font-weight: 500;
  color: #86909c;
}

.card-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.permission-btn {
  color: var(--color-text-3);
  transition: all 0.2s;
}

.permission-btn:hover {
  color: #165dff;
  background-color: rgba(22, 93, 255, 0.1);
}

.favorited {
  color: #ffb400 !important;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.title-actions {
  display: flex;
  gap: 4px;
  opacity: 1;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.title-actions :deep(.arco-btn) {
  padding: 4px;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: #86909c;
  border: 1px solid #e5e6eb;
}

.title-actions :deep(.arco-btn:hover) {
  color: #165dff;
  border-color: #165dff;
  background: #e8f3ff;
}

.title-actions :deep(.arco-btn.favorited) {
  color: #ff7d00;
}

.title-actions :deep(.arco-btn.favorited:hover) {
  color: #ff9a2e;
}

.danger-option {
  color: #f53f3f !important;
}

.danger-option:hover {
  background: #ffece8 !important;
}

.card-description {
  font-size: 14px;
  color: #86909c;
  line-height: 1.57;
  margin-bottom: 20px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 44px;
}

.card-footer {
  margin-top: auto;
}

.table-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  min-height: 28px;
}



.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #86909c;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c9cdd4;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 8px;
  color: #4e5969;
  font-weight: 500;
}

.empty-description {
  font-size: 14px;
  color: #86909c;
  line-height: 1.57;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .table-collection-grid :deep(.arco-col) {
    padding: 0 8px 16px;
  }
  
  .collection-card {
    min-height: 280px;
  }
  
  .card-content {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .collection-cover {
    padding: 20px;
    min-height: 80px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .title-text {
    font-size: 15px;
  }
  
  .card-description {
    font-size: 13px;
    min-height: 39px;
  }
  
  .table-collection-grid :deep(.arco-col) {
    padding: 0 8px 16px;
  }
  
  .collection-card {
    min-height: 260px;
  }
  
  .title-actions {
    opacity: 1; /* 移动端始终显示操作按钮 */
  }
  
  .empty-state {
    padding: 40px 16px;
  }
}

@media (max-width: 480px) {
  .table-collection-grid :deep(.arco-row) {
    margin: 0 -8px;
  }
  
  .table-collection-grid :deep(.arco-col) {
    padding: 0 8px 16px;
  }
  
  .collection-cover {
    padding: 16px;
    min-height: 70px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .title-text {
    font-size: 14px;
  }
  
  .card-description {
    font-size: 12px;
    min-height: 36px;
    margin-bottom: 16px;
  }
  
  .collection-card {
    min-height: 240px;
  }
  
  .card-title {
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .empty-state {
    padding: 32px 12px;
  }
  
  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }
  
  .empty-text {
    font-size: 14px;
  }
  
  .empty-description {
    font-size: 12px;
  }
}
</style>