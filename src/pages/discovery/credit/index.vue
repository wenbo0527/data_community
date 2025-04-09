<template>
  <a-layout>
    <a-layout-content class="content">
      <a-row :gutter="[24, 24]">
        <a-col :span="24">
          <a-card title="征信变量" :bordered="false">
            <!-- 变量详情抽屉 -->
            <a-drawer
              v-model:visible="drawerVisible"
              :width="600"
              title="变量详情"
              @cancel="closeDrawer"
            >
              <template #title>
                <div class="drawer-title">
                  <span>{{ currentVariable.name }}</span>
                  <a-tag :color="getStatusColor(currentVariable.status)">{{ currentVariable.status }}</a-tag>
                </div>
              </template>
              
              <a-descriptions :column="1" :title="'基本信息'" :data="basicInfo" />
              
              <a-divider />
              
              <a-descriptions :column="1" :title="'加工逻辑'">
                <a-descriptions-item label="加工逻辑">
                  {{ currentVariable.logic || '暂无加工逻辑' }}
                </a-descriptions-item>
              </a-descriptions>
              
              <a-divider />
              
              <a-descriptions :column="1" :title="'默认值'">
                <a-descriptions-item label="默认值">
                  {{ currentVariable.defaultValue || '无' }}
                </a-descriptions-item>
              </a-descriptions>
              
              <a-divider />
              
              <a-descriptions :column="1" :title="'批次'">
                <a-descriptions-item label="批次">
                  {{ currentVariable.batch || '暂无批次信息' }}
                </a-descriptions-item>
              </a-descriptions>
              
              <a-divider />
              
              <a-descriptions :column="1" :title="'备注'">
                <a-descriptions-item label="备注">
                  {{ currentVariable.remark || '暂无备注' }}
                </a-descriptions-item>
              </a-descriptions>
            </a-drawer>
            <template #extra>
              <a-space>
                <a-button type="primary" @click="handleBatchUpload">
                  <template #icon><icon-upload /></template>
                  批量上传
                </a-button>
                <a-button @click="handleDownloadTemplate">
                  <template #icon><icon-download /></template>
                  下载模板
                </a-button>
                <a-input-search
                  v-model="searchText"
                  placeholder="搜索变量"
                  style="width: 200px"
                  @search="handleSearch"
                />
              </a-space>
            </template>

            <a-form :model="filterForm" layout="inline" class="filter-form">
              <a-form-item field="variableTag" label="变量标签">
                <a-select
                  v-model="filterForm.variableTag"
                  placeholder="请选择标签"
                  style="width: 200px"
                  allow-clear
                >
                  <a-option value="不限">不限</a-option>
                  <a-option value="个人信息">个人信息</a-option>
                  <a-option value="信用卡">信用卡</a-option>
                  <a-option value="贷款">贷款</a-option>
                  <a-option value="逾期">逾期</a-option>
                </a-select>
              </a-form-item>
              <a-form-item field="category" label="一级分类">
                <a-select
                  v-model="filterForm.category"
                  placeholder="请选择分类"
                  style="width: 200px"
                  allow-clear
                >
                  <a-option value="不限">不限</a-option>
                  <a-option value="身份信息">身份信息</a-option>
                  <a-option value="信用信息">信用信息</a-option>
                  <a-option value="资产信息">资产信息</a-option>
                  <a-option value="负债信息">负债信息</a-option>
                </a-select>
              </a-form-item>
              <a-form-item field="supplier" label="供应商">
                <a-input
                  v-model="filterForm.supplier"
                  placeholder="供应商名称"
                  style="width: 200px"
                  allow-clear
                />
              </a-form-item>
            </a-form>

            <a-table :columns="columns" :data="filteredData" :pagination="{ pageSize: 10 }" :loading="loading">
              <template #status="{ record }">
                <a-tag :color="getStatusColor(record.status)">
                  {{ record.status }}
                </a-tag>
              </template>
              <template #operations="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="handleView(record)">查看</a-button>
                  <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
                  <a-popconfirm
                    content="确定要删除这条记录吗？"
                    @ok="handleDelete(record)"
                  >
                    <a-button type="text" size="small" status="danger">删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUpload, IconDownload } from '@arco-design/web-vue/es/icon'

const searchText = ref('')
const loading = ref(false)
const drawerVisible = ref(false)
const currentVariable = ref({})

const filterForm = ref({
  variableTag: '不限',
  category: '不限',
  supplier: ''
})

const basicInfo = computed(() => [
  {
    label: '变量英文名',
    value: currentVariable.value.englishName
  },
  {
    label: '变量中文名',
    value: currentVariable.value.chineseName
  },
  {
    label: '一级分类',
    value: currentVariable.value.primaryCategory
  },
  {
    label: '二级分类',
    value: currentVariable.value.secondaryCategory
  },
  {
    label: '标签',
    value: currentVariable.value.tag
  },
  {
    label: '供应商',
    value: currentVariable.value.supplier
  }
])

const handleSearch = (value) => {
  console.log('搜索:', value)
}

const handleBatchUpload = () => {
  Message.info('批量上传功能模拟')
}

const handleDownloadTemplate = () => {
  Message.info('模板下载功能模拟')
}

const handleView = (record) => {
  currentVariable.value = record
  drawerVisible.value = true
}

const handleEdit = (record) => {
  console.log('编辑记录:', record)
}

const handleDelete = (record) => {
  console.log('删除记录:', record)
}

const closeDrawer = () => {
  drawerVisible.value = false
  currentVariable.value = {}
}

const getStatusColor = (status) => {
  const colorMap = {
    '已上线': 'green',
    '待上线': 'orange',
    '已下线': 'red'
  }
  return colorMap[status] || 'blue'
}

const columns = [
  { title: '一级分类', dataIndex: 'primaryCategory', width: 120, align: 'center' },
  { title: '二级分类', dataIndex: 'secondaryCategory', width: 120, align: 'center' },
  { title: '变量英文名', dataIndex: 'englishName', width: 150, align: 'left', slotName: 'englishName' },
  { title: '变量中文名', dataIndex: 'chineseName', width: 150, align: 'left' },
  { title: '标签', dataIndex: 'tag', width: 100, align: 'center' },
  { title: '批次', dataIndex: 'batch', width: 100, align: 'center' },
  { title: '上线时间', dataIndex: 'onlineTime', width: 120, align: 'center' },
  { title: '操作', slotName: 'operations', width: 150, align: 'center' }
]

const mockData = [
  {
    primaryCategory: '身份信息',
    secondaryCategory: '基础信息',
    englishName: 'basic_info',
    chineseName: '个人基础信息',
    tag: '个人信息',
    batch: 'B20231201',
    onlineTime: '2023-12-01'
  }
]

const filteredData = computed(() => {
  return mockData
})
</script>

<style scoped>
.content {
  padding: 20px;
}

.filter-form {
  margin-bottom: 16px;
}
</style>

<template #englishName="{ record }">
  <a-link @click="handleView(record)">{{ record.englishName }}</a-link>
</template>