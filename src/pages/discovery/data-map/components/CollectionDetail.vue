<template>
  <div class="collection-detail">
    <!-- 场景说明部分 -->
    <a-card class="collection-info">
      <a-typography-title :heading="4">
        {{ collection.name }}
      </a-typography-title>
      <a-typography-paragraph>
        {{ collection.description }}
      </a-typography-paragraph>
    </a-card>

    <!-- 常用表列表部分 -->
    <a-card class="table-list">
      <template #title>
        <a-space>
          <icon-table />
          常用表列表 (共{{ collection.tables.length }}个)
        </a-space>
      </template>
      <a-row :gutter="[16, 16]">
        <a-col v-for="table in collection.tables" :key="table.name" :span="8">
          <a-card class="table-card" hoverable @click="showTableDetail(table)">
            <template #title>
              <a-space align="center">
                <icon-table />
                <a-typography-title :heading="6" style="margin: 0">
                  {{ table.name }}
                </a-typography-title>
              </a-space>
            </template>
            <div class="table-info">
              <a-tag :color="getTypeColor(table.type)">{{ table.type }}</a-tag>
              <a-typography-paragraph :ellipsis="{ rows: 2 }" type="secondary" class="table-description">
                {{ table.description }}
              </a-typography-paragraph>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const getTypeColor = (type: string) => {
  // 类型颜色匹配逻辑
  return '#1890ff'
}
import { defineProps, defineEmits } from 'vue'
import IconTable from '@arco-design/web-vue/es/icon'
import { IconRight } from '@arco-design/web-vue/es/icon'

interface TableItem {
  [key: string]: any;
  name: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: TableField[]
}

interface TableField {
  name: string
  type: string
  description: string
}

interface TableCollection {
  id: string
  name: string
  description: string
  tables: TableItem[]
}

const props = defineProps<{
  collection: TableCollection
}>()

const emit = defineEmits<{
  (e: 'show-table-detail', table: TableItem): void
}>()

const showTableDetail = (table: TableItem) => {
  const router = useRouter()
router.push({
    name: 'TableDetail',
    params: { tableName: table.name },
    state: { table }
  })
}
</script>

<style scoped>
.collection-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.collection-info {
  margin-bottom: 16px;
}

.table-list {
  margin-top: 16px;
}

.table-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
}

.table-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.table-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-description {
  margin: 8px 0 0;
  color: var(--color-text-3);
}
</style>