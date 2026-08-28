<template>
  <div class="explore-taxonomy-page">
    <div class="page-header">
      <div>
        <h2>探索分类管理</h2>
        <p>维护“特征类型 → 探索分类（一级/二级）”的映射，用于特征探索全景的分类展开（Demo）。</p>
      </div>
      <a-space>
        <a-button type="outline" @click="router.push('/explore/map')">返回全景页</a-button>
        <a-button type="primary" @click="handleReset">重置为默认</a-button>
      </a-space>
    </div>

    <a-row :gutter="16">
      <a-col :span="8">
        <a-card title="分类树" :bordered="false" class="panel-card">
          <a-tree
            :data="treeData"
            block-node
            v-model:selected-keys="selectedKeys"
            @select="handleSelect"
          />
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card :bordered="false" class="panel-card">
          <template #title>
            <div class="detail-header">
              <span>节点详情</span>
              <a-tag v-if="currentNode">{{ currentNode.kind === 'type' ? '特征类型' : '探索分类' }}</a-tag>
            </div>
          </template>

          <a-empty v-if="!currentNode" description="请选择左侧树节点" />

          <div v-else>
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="节点ID">{{ currentNode.id }}</a-descriptions-item>
              <a-descriptions-item label="层级">{{ currentNode.kind === 'type' ? '类型' : currentNode.parentId ? '二级分类' : '一级分类' }}</a-descriptions-item>
              <a-descriptions-item label="归属类型" :span="2">{{ currentNode.typeTitle }}</a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <a-form :model="editForm" layout="vertical">
              <a-form-item label="名称">
                <a-input v-model="editForm.title" allow-clear />
              </a-form-item>
              <a-form-item v-if="currentNode.kind === 'type'" label="描述">
                <a-textarea v-model="editForm.description" :max-length="120" show-word-limit />
              </a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSave">保存</a-button>
                <a-button v-if="currentNode.kind === 'type'" @click="openAddCategoryModal('level1')">新增一级分类</a-button>
                <a-button v-else @click="openAddCategoryModal('child')">新增子分类</a-button>
              </a-space>
            </a-form>

            <a-divider />

            <a-alert type="info" :show-icon="false">
              修改配置后，特征探索全景页建议刷新页面以读取最新配置（Demo 版不做实时订阅）。
            </a-alert>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-modal v-model:visible="addVisible" :title="addTitle" ok-text="创建" cancel-text="取消" @ok="handleAddSubmit">
      <a-form :model="addForm" layout="vertical">
        <a-form-item label="名称">
          <a-input v-model="addForm.title" placeholder="请输入分类名称" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { ExploreTaxonomyStore, type ExploreTaxonomyConfig, type ExploreTaxonomyCategory } from '@/modules/variable-hub/mock/explore/explore-taxonomy-store'

type TreeNodeKind = 'type' | 'category'

type TreeNode = {
  id: string
  key: string
  title: string
  kind: TreeNodeKind
  parentId?: string
  typeId: string
  typeTitle: string
}

const router = useRouter()
const config = ref<ExploreTaxonomyConfig>(ExploreTaxonomyStore.getConfig())

const selectedKeys = ref<string[]>([])
const currentNode = ref<TreeNode | null>(null)

const editForm = reactive({
  title: '',
  description: ''
})

const treeData = computed(() => {
  return config.value.types.map((type) => ({
    key: `type:${type.id}`,
    title: type.title,
    children: type.categories.map((cat) => buildCategoryNode(type.id, type.title, cat))
  }))
})

function buildCategoryNode(typeId: string, typeTitle: string, category: ExploreTaxonomyCategory): any {
  return {
    key: `cat:${typeId}:${category.id}`,
    title: category.title,
    children: Array.isArray(category.children) ? category.children.map((child) => buildCategoryNode(typeId, typeTitle, child)) : undefined
  }
}

function findNodeByKey(key: string): TreeNode | null {
  const [kind, typeId, nodeId] = key.split(':')
  if (kind === 'type') {
    const type = config.value.types.find((t) => t.id === typeId)
    if (!type) return null
    return {
      id: type.id,
      key,
      title: type.title,
      kind: 'type',
      typeId: type.id,
      typeTitle: type.title
    }
  }
  if (kind === 'cat') {
    const type = config.value.types.find((t) => t.id === typeId)
    if (!type) return null
    const parentInfo = findCategoryParent(type.categories, nodeId)
    const title = findCategoryTitle(type.categories, nodeId) || nodeId
    return {
      id: nodeId,
      key,
      title,
      kind: 'category',
      parentId: parentInfo?.parentId,
      typeId: type.id,
      typeTitle: type.title
    }
  }
  return null
}

function findCategoryTitle(categories: ExploreTaxonomyCategory[], id: string): string | null {
  for (const item of categories) {
    if (item.id === id) return item.title
    if (item.children?.length) {
      const result = findCategoryTitle(item.children, id)
      if (result) return result
    }
  }
  return null
}

function findCategoryParent(categories: ExploreTaxonomyCategory[], id: string, parentId?: string): { parentId?: string } | null {
  for (const item of categories) {
    if (item.id === id) return { parentId }
    if (item.children?.length) {
      const result = findCategoryParent(item.children, id, item.id)
      if (result) return result
    }
  }
  return null
}

function handleSelect(keys: string[]) {
  if (!keys.length) return
  const node = findNodeByKey(keys[0])
  currentNode.value = node
  if (node) {
    editForm.title = node.title
    editForm.description = node.kind === 'type' ? (config.value.types.find((t) => t.id === node.typeId)?.description || '') : ''
  }
}

watch(
  () => config.value,
  () => {
    const key = selectedKeys.value[0]
    if (!key) return
    currentNode.value = findNodeByKey(key)
  },
  { deep: true }
)

function handleSave() {
  if (!currentNode.value) return
  const title = editForm.title.trim()
  if (!title) {
    Message.warning('名称不能为空')
    return
  }
  const next = { ...config.value }
  next.types = next.types.map((type) => {
    if (currentNode.value?.kind === 'type' && type.id === currentNode.value.typeId) {
      return { ...type, title, description: editForm.description.trim() }
    }
    if (currentNode.value?.kind === 'category' && type.id === currentNode.value.typeId) {
      return { ...type, categories: updateCategoryTitle(type.categories, currentNode.value.id, title) }
    }
    return type
  })
  config.value = next
  ExploreTaxonomyStore.saveConfig(next)
  Message.success('已保存（Demo）')
}

function updateCategoryTitle(categories: ExploreTaxonomyCategory[], categoryId: string, title: string): ExploreTaxonomyCategory[] {
  return categories.map((item) => {
    if (item.id === categoryId) {
      return { ...item, title }
    }
    if (item.children?.length) {
      return { ...item, children: updateCategoryTitle(item.children, categoryId, title) }
    }
    return item
  })
}

const addVisible = ref(false)
const addMode = ref<'level1' | 'child'>('level1')
const addForm = reactive({ title: '' })

const addTitle = computed(() => (addMode.value === 'level1' ? '新增一级分类' : '新增子分类'))

function openAddCategoryModal(mode: 'level1' | 'child') {
  if (!currentNode.value) return
  addMode.value = mode
  addForm.title = ''
  addVisible.value = true
}

function handleAddSubmit() {
  if (!currentNode.value) return
  const title = addForm.title.trim()
  if (!title) {
    Message.warning('名称不能为空')
    return
  }
  const id = `${currentNode.value.typeId}-${Date.now()}`
  const next = { ...config.value }
  next.types = next.types.map((type) => {
    if (type.id !== currentNode.value?.typeId) return type
    if (addMode.value === 'level1') {
      return { ...type, categories: [...type.categories, { id, title }] }
    }
    return { ...type, categories: appendCategoryChild(type.categories, currentNode.value?.id || '', { id, title }) }
  })
  config.value = next
  ExploreTaxonomyStore.saveConfig(next)
  Message.success('已创建（Demo）')
}

function appendCategoryChild(categories: ExploreTaxonomyCategory[], parentId: string, child: ExploreTaxonomyCategory): ExploreTaxonomyCategory[] {
  return categories.map((item) => {
    if (item.id === parentId) {
      const children = Array.isArray(item.children) ? item.children : []
      return { ...item, children: [...children, child] }
    }
    if (item.children?.length) {
      return { ...item, children: appendCategoryChild(item.children, parentId, child) }
    }
    return item
  })
}

function handleReset() {
  ExploreTaxonomyStore.reset()
  config.value = ExploreTaxonomyStore.getConfig()
  selectedKeys.value = []
  currentNode.value = null
  Message.success('已重置为默认（Demo）')
}
</script>

<style scoped>
.explore-taxonomy-page {
  min-height: calc(100vh - 88px);
  background: #f7f8fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
}

.page-header p {
  margin: 8px 0 0;
  color: #4e5969;
}

.panel-card {
  box-shadow: 0 8px 20px rgba(15, 35, 95, 0.06);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>

