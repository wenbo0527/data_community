<template>
  <div class="credit-variables">
    <div class="page-header">
      <h2>征信变量</h2>
      <a-space>
        <a-button type="primary" @click="showBatchUpload = true">
          <template #icon>
            <icon-upload />
          </template>
          批量上传
        </a-button>
        <a-button @click="downloadTemplate">
          <template #icon>
            <icon-download />
          </template>
          下载模板
        </a-button>
      </a-space>
    </div>
    
    <a-card :bordered="false">
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
       <!-- 搜索和筛选 -->
       <div class="search-section">
         <a-row :gutter="16">
           <a-col :span="8">
             <a-input-search
               v-model="searchKeyword"
               placeholder="搜索变量名称、描述"
               @search="handleSearch"
             />
           </a-col>
           <a-col :span="4">
             <a-select
               v-model="selectedTag"
               placeholder="变量标签"
               allow-clear
               @change="handleSearch"
             >
               <a-option value="高风险">高风险</a-option>
               <a-option value="中风险">中风险</a-option>
               <a-option value="低风险">低风险</a-option>
             </a-select>
           </a-col>
           <a-col :span="4">
             <a-select
               v-model="selectedCategory"
               placeholder="变量分类"
               allow-clear
               @change="handleSearch"
             >
               <a-option value="基础信息">基础信息</a-option>
               <a-option value="信贷记录">信贷记录</a-option>
               <a-option value="行为特征">行为特征</a-option>
             </a-select>
           </a-col>
           <a-col :span="4">
             <a-select
               v-model="selectedSupplier"
               placeholder="数据供应商"
               allow-clear
               @change="handleSearch"
             >
               <a-option value="人行征信">人行征信</a-option>
               <a-option value="百行征信">百行征信</a-option>
               <a-option value="芝麻信用">芝麻信用</a-option>
             </a-select>
           </a-col>
         </a-row>
       </div>

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
   </div>
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
.credit-variables {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.variable-name {
  color: #1890ff;
  cursor: pointer;
  font-weight: 500;
}

.variable-name:hover {
  text-decoration: underline;
}

.tag-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.drawer-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1d2129;
  border-bottom: 1px solid #e5e6eb;
  padding-bottom: 8px;
}
</style>