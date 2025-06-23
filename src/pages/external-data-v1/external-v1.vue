<template>
  <a-layout>
    <a-layout-content class="content">
      <a-tabs default-active-key="1" type="rounded">
        <a-tab-pane key="1" title="接口页面">
          <a-row :gutter="[24, 24]">
            <a-col :span="24">
              <a-card title="接口列表" :bordered="false">
                <template #extra>
                  <a-space>
                    <a-select
                      v-model="selectedProduct"
                      placeholder="关联产品"
                      style="width: 200px"
                      allow-clear
                    >
                      <a-option 
                        v-for="item in tableData" 
                        :key="item.interfaceId" 
                        :value="item.interfaceId"
                      >
                        {{ item.dataName }}
                      </a-option>
                    </a-select>
                    <a-input-search
                      v-model="searchText"
                      placeholder="搜索数据"
                      style="width: 200px"
                      @search="handleSearch"
                    />
                  </a-space>
                </template>

                <a-form :model="filterForm" layout="inline" class="filter-form">
                  <a-form-item field="dataType" label="数源种类">
                    <a-radio-group
                      v-model="filterForm.dataType"
                      type="button"
                      style="margin-bottom: 8px"
                    >
                      <a-radio value="不限">不限</a-radio>
                      <a-radio value="核验类">核验类</a-radio>
                      <a-radio value="评分类">评分类</a-radio>
                      <a-radio value="标签类">标签类</a-radio>
                      <a-radio value="名单类">名单类</a-radio>
                      <a-radio value="价格评估类">价格评估类</a-radio>
                    </a-radio-group>
                  </a-form-item>
                  <a-form-item field="dataCategory" label="数源分类">
                    <a-select
                      v-model="filterForm.dataCategory"
                      placeholder="不限"
                      style="width: 120px"
                      allow-clear
                    >
                      <a-option value="不限">不限</a-option>
                      <a-option value="选项2">选项2</a-option>
                      <a-option value="选项3">选项3</a-option>
                      <a-option value="选项4">选项4</a-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item field="supplier" label="供应商">
                    <a-input
                      v-model="filterForm.supplier"
                      placeholder="供应商A"
                      style="width: 200px"
                      allow-clear
                    />
                  </a-form-item>
                </a-form>

                <a-table
                  :columns="columns"
                  :data="tableData"
                  :pagination="pagination"
                  @change="handleTableChange"
                >
                  <template #actions="{ record }">
                    <a-button type="text" @click="showDetail(record)">详情</a-button>
                  </template>
                </a-table>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { generateExternalProductData } from '@/mock/external-data'
import type { InterfaceItem } from '@/api/external'

const router = useRouter()

const columns = [
  {
    title: '接口编号',
    dataIndex: 'interfaceId',
    width: 120
  },
  {
    title: '接口名称',
    dataIndex: 'interfaceName',
    width: 150
  },
  {
    title: '数源种类',
    dataIndex: 'dataType',
    width: 100
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 120
  },
  {
    title: '单价(元/次)',
    dataIndex: 'price',
    width: 100
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 80
  }
]

const tableData = ref<InterfaceItem[]>([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const filterForm = ref({
  dataType: '不限',
  dataCategory: '',
  supplier: ''
})

const selectedProduct = ref('')
const searchText = ref('')

const loadData = async () => {
  const mockData = generateExternalProductData('产品A', 10).map((item, index) => ({
    interfaceId: `EXT-${index + 1}`,
    interfaceName: `外部接口${index + 1}`,
    dataType: ['核验类', '评分类', '标签类'][index % 3],
    supplier: ['供应商A', '供应商B', '供应商C'][index % 3],
    price: Number(item.pricePerCall),
    dataName: item.product
  }))
  
  tableData.value = mockData
  pagination.value.total = mockData.length
}

const handleSearch = () => {
  pagination.value.current = 1
  loadData()
}

const handleTableChange = (page: number) => {
  pagination.value.current = page
  loadData()
}

const showDetail = (record: any) => {
  router.push(`/discovery/external/detail/${record.interfaceId}`)
}

// 初始化加载数据
loadData()
</script>

<style scoped>
.content {
  padding: 16px;
  background-color: #f5f5f5;
}

.filter-form {
  margin-bottom: 16px;
}
</style>