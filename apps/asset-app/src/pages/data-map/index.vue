<template>
  <TableDetail />
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { IconFolder } from '@arco-design/web-vue/es/icon';
import BusinessProcessFlow from '@/components/BusinessProcessFlow.vue';
import TableDetail from '@/pages/management/data-map/components/TableDetail.vue';

interface TableRecord {
  name: string;
  type: string;
  category: string;
  domain: string;
  description: string;
}

interface SearchFormData {
  name: string;
  type: string;
}

interface PaginationData {
  total: number;
  current: number;
  pageSize: number;
}

// 状态定义
const loading = ref<boolean>(false);
const treeLoading = ref<boolean>(false);
const tableLoading = ref<boolean>(false);
const detailVisible = ref(false);
const currentTable = ref<TableRecord | null>(null)
const treeData = ref<any[]>([]);
const tableData = ref<TableRecord[]>([]);
const searchForm = ref<SearchFormData>({
  name: '',
  type: ''
});
const pagination = ref<PaginationData>({
  total: 0,
  current: 1,
  pageSize: 10
});

// 方法定义
const handleTreeSelect = (selectedKeys: string[]) => {
  // 处理树节点选择
  console.log('Selected:', selectedKeys);
};

const handleSearch = () => {
  // 处理搜索
  console.log('Search form:', searchForm.value);
};

const onPageChange = (page: number) => {
  pagination.value.current = page;
  // 加载新页数据
};

const showDetail = (record: TableRecord) => {
  // 显示表详情
  currentTable.value = record  // 保持原有赋值逻辑
  detailVisible.value = true;
};

const addToFavorite = (record: TableRecord) => {
  // 添加到收藏
  console.log('Add to favorite:', record);
};

const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    dim: 'blue',
    fact: 'green',
    dwd: 'orange',
    dws: 'purple'
  };
  return colorMap[type] || 'gray';
};

// 监听路由参数变化
const route = useRoute();

const fetchTables = async () => {
  // 实现获取表数据的逻辑
};

watchEffect(() => {
  const tableName = route.query.tableName as string;
  if (tableName) {
    // 根据表名查找并显示详情
    const table = tableData.value.find(t => t.name === tableName);
    if (table) {
      showDetail(table);
    } else {
      // 如果表不在当前页，需要重新搜索
      searchForm.value.name = tableName;
      fetchTables();
    }
  }
});

onMounted(() => {
  fetchTables();
});
</script>

<style scoped>
.data-map {
  padding: 16px;
}

.tree-card {
  height: calc(100vh - 180px);
  overflow: auto;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  display: flex;
  align-items: center;
}
</style>