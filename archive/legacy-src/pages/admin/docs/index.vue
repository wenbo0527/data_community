<template>
  <div class="doc-list-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">文档管理</h1>
        <p class="page-description">管理社区文档内容与分级路径</p>
      </div>
      <div class="header-right">
        <a-space>
          <a-button type="primary" @click="handleCreate">
            <template #icon><IconPlus /></template>
            新建文档
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon><IconRefresh /></template>
            刷新
          </a-button>
        </a-space>
      </div>
    </div>

    <a-layout class="doc-layout">
      <a-layout-sider :width="240" class="doc-sider">
        <div class="sider-header">
          <span class="sider-title">文档目录</span>
          <a-button type="text" size="mini" @click="selectedKeys = []">重置</a-button>
        </div>
        <div class="tree-container">
          <a-tree
            v-model:selected-keys="selectedKeys"
            :data="treeData"
            show-line
            block-node
            class="doc-tree"
          />
        </div>
      </a-layout-sider>
      
      <a-layout-content class="doc-content-area">
        <a-card class="table-card" :bordered="false">
          <template #title>
            <div class="table-header">
              <a-breadcrumb>
                <a-breadcrumb-item @click="selectedKeys = []" class="clickable-breadcrumb">全部文档</a-breadcrumb-item>
                <a-breadcrumb-item v-for="p in selectedPath" :key="p">{{ p }}</a-breadcrumb-item>
              </a-breadcrumb>
              <a-input-search 
                v-model="searchKeyword" 
                placeholder="搜索文档标题..." 
                style="width: 240px" 
                allow-clear
              />
            </div>
          </template>
          
          <a-table
            :data="filteredDocs"
            :columns="columns"
            :loading="loading"
            :pagination="pagination"
          >
            <template #title="{ record }">
              <a-link @click="handlePreview(record)">{{ record.title }}</a-link>
            </template>
            <template #categoryPath="{ record }">
              <a-space size="mini" wrap>
                <a-tag v-for="(p, index) in record.categoryPath" :key="index" size="small" color="arcoblue">
                  {{ p }}
                </a-tag>
                <span v-if="!record.categoryPath?.length" class="empty-text">-</span>
              </a-space>
            </template>
            <template #operations="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  <template #icon><IconEdit /></template>
                  编辑
                </a-button>
                <a-popconfirm content="确定删除该文档吗？此操作不可恢复。" type="warning" @ok="handleDelete(record)">
                  <a-button type="text" status="danger" size="small">
                    <template #icon><IconDelete /></template>
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table>
        </a-card>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { 
  IconPlus, 
  IconRefresh, 
  IconEdit, 
  IconDelete, 
  IconFolder, 
  IconFile 
} from '@arco-design/web-vue/es/icon'
import { listDocs, deleteDoc } from '@/api/docsLocal'
import type { DocSummary } from '@/api/docsLocal'

const router = useRouter()
const loading = ref(false)
const docList = ref<DocSummary[]>([])
const selectedKeys = ref<string[]>([])
const searchKeyword = ref('')

const pagination = {
  pageSize: 10,
  showTotal: true
}

const columns = [
  { title: '文档标题', dataIndex: 'title', slotName: 'title' },
  { title: 'Slug', dataIndex: 'slug' },
  { title: '分级路径', slotName: 'categoryPath' },
  { title: '操作', slotName: 'operations', width: 160 }
]

const fetchDocs = async () => {
  loading.value = true
  try {
    docList.value = await listDocs()
  } catch (error) {
    Message.error('获取文档列表失败')
  } finally {
    loading.value = false
  }
}

const treeData = computed(() => {
  const root: any[] = []
  
  docList.value.forEach((doc: DocSummary) => {
    let currentLevel = root
    const path = doc.categoryPath || []
    
    path.forEach((folderName: string, index: number) => {
      let folder = currentLevel.find((item: any) => item.title === folderName && item.isFolder)
      if (!folder) {
        folder = {
          key: `folder-${path.slice(0, index + 1).join('/')}`,
          title: folderName,
          isFolder: true,
          children: [],
          icon: () => h(IconFolder)
        }
        currentLevel.push(folder)
      }
      currentLevel = folder.children
    })
  })

  // Sort folders alphabetically
  const sortItems = (items: any[]) => {
    items.sort((a, b) => a.title.localeCompare(b.title))
    items.forEach((item: any) => {
      if (item.children) sortItems(item.children)
    })
  }
  sortItems(root)
  
  return root
})

const selectedPath = computed(() => {
  if (selectedKeys.value.length === 0) return []
  const key = selectedKeys.value[0]
  if (key.startsWith('folder-')) {
    return key.replace('folder-', '').split('/')
  }
  return []
})

const filteredDocs = computed(() => {
  let res = docList.value

  // Filter by category path from tree
  if (selectedPath.value.length > 0) {
    res = res.filter((doc: DocSummary) => {
      const docPath = doc.categoryPath || []
      return selectedPath.value.every((p: string, i: number) => docPath[i] === p)
    })
  }

  // Filter by keyword
  if (searchKeyword.value) {
    const k = searchKeyword.value.toLowerCase()
    res = res.filter((doc: DocSummary) => 
      doc.title.toLowerCase().includes(k) || 
      doc.slug.toLowerCase().includes(k)
    )
  }

  return res
})

const handleCreate = () => {
  router.push('/admin/docs/create')
}

const handleRefresh = () => {
  fetchDocs()
  Message.success('已刷新')
}

const handleEdit = (record: DocSummary) => {
  router.push(`/admin/docs/edit/${encodeURIComponent(record.slug)}`)
}

const handlePreview = (record: DocSummary) => {
  window.open(`/docs/${encodeURIComponent(record.slug)}`, '_blank')
}

const handleDelete = async (record: DocSummary) => {
  try {
    await deleteDoc(record.slug)
    Message.success('删除成功')
    fetchDocs()
  } catch (error) {
    Message.error('删除失败')
  }
}

onMounted(() => {
  fetchDocs()
})

// Need h for icon
import { h } from 'vue'
</script>

<style scoped>
.doc-list-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #86909c;
}

.doc-layout {
  background: transparent;
  gap: 16px;
}

.doc-sider {
  background: white;
  border-radius: 4px;
  padding: 16px;
  border: 1px solid #e5e6eb;
}

.sider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f3f5;
}

.sider-title {
  font-weight: 600;
  font-size: 14px;
}

.tree-container {
  overflow-y: auto;
  max-height: 600px;
}

.doc-content-area {
  background: transparent;
}

.table-card {
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clickable-breadcrumb {
  cursor: pointer;
  transition: color 0.2s;
}

.clickable-breadcrumb:hover {
  color: var(--color-primary-light-4);
}

.empty-text {
  color: #c9cdd4;
}

:deep(.arco-table-cell) {
  white-space: nowrap;
}

:deep(.arco-tree-node-title) {
  font-size: 13px;
}
</style>
