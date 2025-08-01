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
            <icon-plus />
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
                </h4>
                <div class="title-actions">
                  <a-button 
                    type="text" 
                    size="mini" 
                    @click.stop="toggleFavorite(collection)"
                    :class="{ 'favorited': collection.isFavorite }"
                  >
                    <icon-star-fill v-if="collection.isFavorite" />
                    <icon-star v-else />
                  </a-button>
                  <a-dropdown @select="handleActionSelect">
                    <a-button type="text" size="mini" @click.stop>
                      <icon-more />
                    </a-button>
                    <template #content>
                      <a-doption :value="`edit-${collection.id}`">
                        <icon-edit />编辑
                      </a-doption>
                      <a-doption :value="`delete-${collection.id}`" class="danger-option">
                        <icon-delete />删除
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
              
              <div class="card-footer">
                <div class="table-tags">
                  <a-tag 
                    v-for="table in collection.tables.slice(0, 3)" 
                    :key="table.name"
                    size="small"
                    class="table-tag"
                  >
                    {{ table.name }}
                  </a-tag>
                  <span 
                    v-if="collection.tables.length > 3" 
                    class="more-tables"
                  >
                    +{{ collection.tables.length - 3 }}个表
                  </span>
                </div>
                
                <div class="footer-meta">
                  <span class="meta-item">
                    {{ collection.owner || '未指定' }}
                  </span>
                  <span class="meta-item">
                    {{ formatDate(collection.updateTime) }}
                  </span>
                </div>
              </div>
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
  IconCopy, IconDelete, IconPlus 
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
}

interface TableCollectionGridEmits {
  (e: 'collection-click', collection: TableCollection): void
  (e: 'create-collection'): void
  (e: 'edit-collection', collection: TableCollection): void
  (e: 'copy-collection', collection: TableCollection): void
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
    return formatDistanceToNow(new Date(dateString), { 
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
  
  Message.success(newFavoriteState ? '已添加到收藏' : '已取消收藏')
}

// 处理操作选择
const handleActionSelect = (value: string) => {
  const [action, id] = value.split('-')
  const collection = props.collections.find(c => c.id === id)
  
  if (!collection) return
  
  switch (action) {
    case 'edit':
      emit('edit-collection', collection)
      break
    case 'copy':
      handleCopyCollection(collection)
      break
    case 'delete':
      handleDeleteCollection(collection)
      break
  }
}


// 复制集合
const handleCopyCollection = (collection: TableCollection) => {
  const copiedCollection = {
    ...collection,
    id: Date.now().toString(),
    name: `${collection.name} (副本)`,
    createTime: new Date().toISOString()
  }
  emit('copy-collection', copiedCollection)
  Message.success('集合已复制')
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
      Message.success('集合已删除')
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
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.collection-card:hover .title-actions {
  opacity: 1;
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

.table-tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #e8f3ff;
  color: #165dff;
  border: 1px solid #b8d4ff;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.table-tag:hover {
  background: #d4e8ff;
  border-color: #9cc5ff;
}

.more-tables {
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
  padding: 4px 8px;
  background: #f7f8fa;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}

.footer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #86909c;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
}

.meta-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
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
  
  .table-tags {
    gap: 6px;
    margin-bottom: 12px;
  }
  
  .footer-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    font-size: 11px;
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