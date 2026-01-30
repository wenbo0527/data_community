<template>
  <a-layout>
    <a-layout-content class="content">
      <!-- 状态统计卡片 -->
      <a-row :gutter="16" class="status-cards">
        <a-col :span="6">
          <a-card class="status-card">
            <Statistic title="注册中" :value="statistics.registering" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="status-card">
            <Statistic title="待上线" :value="statistics.pending" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="status-card">
            <Statistic title="已上线" :value="statistics.online" />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="status-card">
            <Statistic title="已下线" :value="statistics.offline" />
          </a-card>
        </a-col>
      </a-row>

      <a-drawer
        v-model:visible="editModalVisible"
        title="编辑数据信息"
        width="600px"
        :footer="true"
      >
        <a-form :model="editForm" layout="vertical">
          <a-form-item label="数据种类">
            <a-select v-model="editForm.dataType" placeholder="请选择数据种类">
              <a-option value="核验类">核验类</a-option>
              <a-option value="评分类">评分类</a-option>
              <a-option value="标签类">标签类</a-option>
              <a-option value="名单类">名单类</a-option>
              <a-option value="价格评估类">价格评估类</a-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="数据分类">
            <a-input v-model="editForm.subType" placeholder="请输入数据分类" />
          </a-form-item>
          
          <a-form-item label="供应商">
            <a-input v-model="editForm.supplier" placeholder="请输入供应商" />
          </a-form-item>
          
          <a-form-item label="单价(元/次)">
            <a-input-number v-model="editForm.price" :min="0" />
          </a-form-item>
          
          <a-form-item label="描述信息">
            <a-textarea v-model="editForm.description" placeholder="请输入描述信息" />
          </a-form-item>
          
          <a-form-item label="落库表名">
            <a-input v-model="editForm.storageTable" placeholder="请输入落库表名" />
          </a-form-item>
          
          <a-form-item label="接口标签">
            <a-select v-model="editForm.interfaceTag" placeholder="请选择接口标签">
              <a-option value="主接口">主接口</a-option>
              <a-option value="备接口">备接口</a-option>
            </a-select>
          </a-form-item>
        </a-form>
        
        <template #footer>
          <a-space>
            <a-button @click="editModalVisible = false">取消</a-button>
            <a-button type="primary" @click="handleSave">保存</a-button>
          </a-space>
        </template>
      </a-drawer>
      <!-- 主要信息区 -->
      <a-card :bordered="false" class="main-info">
        <a-row :gutter="24">
          <a-col :span="18">
            <a-space direction="vertical" fill>
              <div class="title-section">
                <a-space align="center">
                  <a-button type="text" @click="handleGoBack">
                    <template #icon><IconLeft /></template>
                  </a-button>
                  <h2 class="data-title">{{ dataDetail.dataName }}</h2>
                  <div class="tag-group">
                    <a-tag :color="getTagColor(dataDetail.dataType)">{{ dataDetail.dataType }}</a-tag>
                    <a-tag v-if="dataDetail.subType" :color="getTagColor(dataDetail.subType)">
                      {{ dataDetail.subType }}
                    </a-tag>
                  </div>
                </a-space>
              </div>
              
              <a-descriptions :column="2" size="large" class="basic-info">
                <a-descriptions-item label="接口编号">{{ dataDetail.interfaceId }}</a-descriptions-item>
                <a-descriptions-item label="供应商">{{ dataDetail.supplier }}</a-descriptions-item>
                <a-descriptions-item label="单价">{{ dataDetail.price }}元/次</a-descriptions-item>
                <a-descriptions-item label="管理人员">{{ dataDetail.manager }}</a-descriptions-item>
                <a-descriptions-item label="描述信息" :span="2">{{ dataDetail.description || '暂无描述' }}</a-descriptions-item>
              </a-descriptions>
            </a-space>
          </a-col>
          
          <a-col :span="6" class="action-panel">
            <a-space>
              <a-button type="primary" @click="handleEdit">
                <template #icon><IconEdit /></template>
                编辑信息
              </a-button>
              <a-button
                type="text"
                :class="{ 'favorite-btn': true, 'is-favorite': dataDetail.isFavorite }"
                @click="toggleFavorite"
              >
                <template #icon>
                  <IconStarFill v-if="dataDetail.isFavorite" />
                  <IconStar v-else />
                </template>
                {{ dataDetail.isFavorite ? '取消收藏' : '收藏' }}
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
      
      <!-- 标签页区域 -->
      <a-card :bordered="false" class="main-card">
        <a-tabs>
          <a-tab-pane key="1" title="基本信息">
            <a-card :bordered="false" class="info-card">
              <a-descriptions :column="2" :data="combinedBasicInfo" />
              <a-divider style="margin: 16px 0" />
              <a-descriptions :column="2" :data="interfaceInfo" />
            </a-card>
          </a-tab-pane>
          
          <!-- 落库信息标签页内容 -->
          <a-tab-pane key="2" title="落库信息">
            <a-card :bordered="false" class="info-card">
              <a-descriptions :column="2" :data="storageInfo" />
              <a-divider style="margin: 16px 0" />
              <h3>表结构信息</h3>
              <a-table :columns="metadataColumns" :data="metadataData" :pagination="false" />
            </a-card>
          </a-tab-pane>

          <a-tab-pane key="3" title="产品入参">
            <a-card :bordered="false" class="info-card">
              <a-table :columns="inputColumns" :data="inputParams" :pagination="false" />
            </a-card>
          </a-tab-pane>

          <a-tab-pane key="4" title="产品出参">
            <a-card :bordered="false" class="info-card">
              <a-table :columns="outputColumns" :data="outputParams" :pagination="false" />
            </a-card>
          </a-tab-pane>

          <a-tab-pane key="5" title="调用及费用">
            <a-card :bordered="false" class="info-card">
              <a-descriptions :column="2" :data="usageInfo" />
            </a-card>
          </a-tab-pane>

          <a-tab-pane key="6" title="变量评估">
            <a-card :bordered="false" class="info-card">
              <a-descriptions :column="2" :data="evaluationInfo" />
            </a-card>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { goBack } from '@/router/utils'
import { IconLeft, IconEdit, IconStar, IconStarFill } from '@arco-design/web-vue/es/icon'
import { Statistic } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

import { generateExternalDataDetail, generateExternalDataStatistics } from '@/mock/external-data-v1'

const statistics = ref(generateExternalDataStatistics())

const dataDetail = ref({
  interfaceId: '',
  dataName: '',
  dataType: '',
  subType: '',
  supplier: '',
  description: '',
  price: 0,
  inputParams: [],
  metadataData: [],
  manager: '',
  isFavorite: false,
  apiUrl: '',
  targetTable: '',
  status: '',
  interfaceTag: '',
  onlineTime: '',
  updateFrequency: '',
  dataSource: '',
  requestMethod: '',
  headers: '',
  timeout: 0,
  qpsLimit: 0,
  
  // 落库信息
  storageInfo: [],
  metadataData: [],
  
  // 产品入参
  inputParams: [],
  
  // 产品出参
  outputParams: [],
  
  // 调用及费用
  usageInfo: [],
  
  // 变量评估
  evaluationInfo: []
})

const getTagColor = (type) => {
  const colors = {
    '核验类': 'arcoblue',
    '评分类': 'orangered',
    '标签类': 'green',
    '名单类': 'purple',
    '价格评估类': 'gold',
    '身份核验类': 'blue',
    '信用评分': 'orange',
    '用户画像': 'green',
    '风险名单': 'red',
    '资产评估': 'gold'
  }
  return colors[type] || 'gray'
}

const toggleFavorite = () => {
  dataDetail.value.isFavorite = !dataDetail.value.isFavorite
}

const editModalVisible = ref(false)
const editForm = ref({
  dataType: '',
  subType: '',
  supplier: '',
  price: 0,
  description: '',
  storageTable: '',
  interfaceTag: ''
})

const handleEdit = () => {
  editForm.value = {
    dataType: dataDetail.value.dataType,
    subType: dataDetail.value.subType,
    supplier: dataDetail.value.supplier,
    price: dataDetail.value.price,
    description: dataDetail.value.description,
    storageTable: dataDetail.value.storageInfo?.[0]?.value || '',
    interfaceTag: dataDetail.value.interfaceTag || ''
  }
  editModalVisible.value = true
}

const handleSave = () => {
  dataDetail.value.dataType = editForm.value.dataType
  dataDetail.value.subType = editForm.value.subType
  dataDetail.value.supplier = editForm.value.supplier
  dataDetail.value.price = editForm.value.price
  dataDetail.value.description = editForm.value.description
  dataDetail.value.interfaceTag = editForm.value.interfaceTag
  
  if (dataDetail.value.storageInfo.length > 0) {
    dataDetail.value.storageInfo[0].value = editForm.value.storageTable
  }
  
  editModalVisible.value = false
}

const combinedBasicInfo = computed(() => [
  { label: '接口编号', value: dataDetail.value.interfaceId },
  { label: '数据分类', value: dataDetail.value.subType },
  { label: '供应商', value: dataDetail.value.supplier },
  { label: '单价', value: `${dataDetail.value.price}元/次` },
  { label: '管理人员', value: dataDetail.value.manager },
  { label: '上线时间', value: dataDetail.value.onlineTime },
  { label: '接口状态', value: dataDetail.value.status },
  { label: '接口标签', value: dataDetail.value.interfaceTag },
  { label: '更新频率', value: dataDetail.value.updateFrequency },
  { label: '数据来源', value: dataDetail.value.dataSource }
])

const interfaceInfo = computed(() => [
  { label: '请求方式', value: dataDetail.value.requestMethod },
  { label: '请求地址', value: dataDetail.value.apiUrl },
  { label: 'Headers', value: dataDetail.value.headers },
  { label: '请求超时', value: `${dataDetail.value.timeout}秒` },
  { label: 'QPS限制', value: `${dataDetail.value.qpsLimit}次/秒` },
  { label: '目标表', value: dataDetail.value.targetTable }
])

const storageInfo = computed(() => [
  { label: '落库表名', value: dataDetail.value.targetTable },
  { label: '数据格式', value: 'JSON' },
  { label: '更新频率', value: dataDetail.value.updateFrequency },
  { label: '数据来源', value: dataDetail.value.dataSource }
])

const outputParams = ref([])
const usageInfo = ref([])
const evaluationInfo = ref([])
const inputParams = ref([])
const metadataData = ref([])

onMounted(() => {
  // 根据路由参数获取数据详情
  dataDetail.value = generateExternalDataDetail(route.params.id)
  
  // 初始化表格数据
  outputParams.value = dataDetail.value.outputParams || []
  usageInfo.value = dataDetail.value.usageInfo || []
  evaluationInfo.value = dataDetail.value.evaluationInfo || []
})

const handleGoBack = () => goBack(router, '/external-data-v1/list')

const metadataColumns = [
  { title: '字段名称', dataIndex: 'field' },
  { title: '字段类型', dataIndex: 'type' },
  { title: '字段说明', dataIndex: 'comment' }
]

const inputColumns = [
  { title: '参数名称', dataIndex: 'name' },
  { title: '参数类型', dataIndex: 'type' },
  { title: '是否必填', dataIndex: 'required', render: ({ record }) => record.required ? '是' : '否' },
  { title: '参数说明', dataIndex: 'description' }
]

const outputColumns = [
  { title: '参数名称', dataIndex: 'name' },
  { title: '参数类型', dataIndex: 'type' },
  { title: '参数说明', dataIndex: 'description' }
]
</script>

<style scoped>
.content {
  padding: 16px;
  background: #f5f5f5;
}

.status-cards {
  margin-bottom: 16px;
}

.status-card {
  text-align: center;
  background: #fff;
  border-radius: 4px;
  
  :deep(.arco-statistic) {
    .arco-statistic-title {
      font-size: 14px;
      color: #666;
    }
    
    .arco-statistic-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  }
}
</style>
