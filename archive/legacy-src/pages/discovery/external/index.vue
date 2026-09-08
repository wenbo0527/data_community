<template>
  <div class="external-data-page">
      <a-tabs default-active-key="1" type="rounded">
        <a-tab-pane key="1" title="产品页面">
          <a-row :gutter="[24, 24]">
            <a-col :span="24">
              <a-card title="外部数据" :bordered="false">
            <template #extra>
              <a-space>
                <a-button type="primary" @click="showEditModal = true">
                  <template #icon>
                    <IconPlus />
                  </template>
                  新增产品
                </a-button>
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

            <a-row :gutter="[16, 16]">
              <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in filteredData" :key="item.interfaceId">
                <a-card :bordered="true" class="data-card" hoverable>
                  <template #title>
                    <div class="card-header">
                      <span class="data-name"><router-link :to="`/discovery/external/detail/${item.interfaceId}`">{{ item.dataName || '外部数据' }}</router-link></span>
                      <a-space>
                        <a-tag :color="getTagColor(item.dataType)">
                          {{ item.dataType }}
                        </a-tag>
                        <a-tag :color="getTagColor(item.subType)" v-if="item.subType">
                          {{ item.subType }}
                        </a-tag>
                        <IconStarFill
                          v-if="item.isFavorite"
                          :style="{ color: '#FFD700', cursor: 'pointer' }"
                          @click="toggleFavorite(item)"
                        />
                        <IconStar
                          v-else
                          :style="{ cursor: 'pointer' }"
                          @click="toggleFavorite(item)"
                        />
                      </a-space>
                    </div>
                  </template>
                  <div class="card-content">
                    <div class="info-item">
                      <span class="label">接口编号：</span>
                      <a-space>
                        <template v-if="item.isPrimary">
                          <a-link :style="{ color: '#165DFF' }">{{ item.interfaceId }}</a-link>
                          <a-link v-if="item.backupInterfaceId" :style="{ color: '#86909C' }">{{ item.backupInterfaceId }}</a-link>
                        </template>
                        <template v-else>
                          <a-link v-if="item.primaryInterfaceId" :style="{ color: '#165DFF' }">{{ item.primaryInterfaceId }}</a-link>
                          <a-link :style="{ color: '#86909C' }">{{ item.interfaceId }}</a-link>
                        </template>
                      </a-space>
                    </div>
                    <div class="info-item">
                      <span class="label">数据管理：</span>
                      <span>{{ item.dataManagement }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">上线时间：</span>
                      <span>{{ item.onlineTime }}</span>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>
        </a-tab-pane>
        <a-tab-pane key="2" title="接口页面">
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
                        v-for="item in tableData.value" 
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
            <template #product-extra>
              <a-space>
                <a-button type="primary" @click="showEditModal = true">
                  <template #icon>
                    <IconPlus />
                  </template>
                  新增产品
                </a-button>
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
                <a-row :gutter="[16, 16]">
                  <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in filteredData" :key="item.interfaceId">
                    <a-card :bordered="true" class="data-card" hoverable>
                      <template #title>
                        <div class="card-header">
                          <span class="data-name">{{ item.dataName || '外部数据' }}</span>
                        </div>
                      </template>
                      <div class="card-content">
                        <div class="info-item">
                          <span class="label">接口编号：</span>
                          <span>{{ item.interfaceId }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">数据管理：</span>
                          <span>{{ item.dataManagement }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">上线时间：</span>
                          <span>{{ item.onlineTime }}</span>
                        </div>
                      </div>
                    </a-card>
                  </a-col>
                </a-row>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
  </div>

  <a-modal 
    v-model:visible="showEditModal" 
    title="新增产品"
    @ok="handleAddProduct"
    @cancel="showEditModal = false"
  >
    <a-form :model="editForm" layout="vertical">
      <a-form-item label="产品名称" field="dataName">
        <a-input v-model="editForm.dataName" placeholder="请输入产品名称" />
      </a-form-item>
      <a-form-item label="接口列表" field="interfaces">
        <a-table :data="editForm.interfaces" :columns="interfaceColumns" size="small">
          <template #interfaceId="{ record }">
            <a-select
              v-model="record.interfaceId"
              placeholder="请选择或搜索接口编号"
              allow-search
              allow-clear
              :filter-option="filterOption"
            >
              <a-option 
                v-for="item in tableData.value" 
                :key="item.interfaceId" 
                :value="item.interfaceId"
              >
                {{ item.dataName }} ({{ item.interfaceId }})
              </a-option>
            </a-select>
          </template>
          <template #operations="{ record, rowIndex }">
            <a-button type="text" @click="addBackupInterface">
              <template #icon><IconPlus /></template>
            </a-button>
            <a-button v-if="rowIndex > 0" type="text" status="danger" @click="removeInterface(rowIndex)">
              <template #icon><IconDelete /></template>
            </a-button>
          </template>
        </a-table>
      </a-form-item>
      <a-form-item label="数源种类" field="dataType">
        <a-select v-model="editForm.dataType" placeholder="请选择数据类型">
          <a-option value="核验类">核验类</a-option>
          <a-option value="评分类">评分类</a-option>
          <a-option value="标签类">标签类</a-option>
          <a-option value="名单类">名单类</a-option>
          <a-option value="价格评估类">价格评估类</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="数源分类" field="subType">
        <a-select v-model="editForm.subType" placeholder="请选择子类型">
          <a-option value="身份核验类">身份核验类</a-option>
          <a-option value="信用评分">信用评分</a-option>
          <a-option value="用户画像">用户画像</a-option>
          <a-option value="风险名单">风险名单</a-option>
          <a-option value="资产评估">资产评估</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="数据管理" field="dataManagement">
        <a-select v-model="editForm.dataManagement" placeholder="请选择数据管理员">
          <a-option value="张三">张三</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="上线时间" field="onlineTime">
        <a-date-picker v-model="editForm.onlineTime" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { IconStar, IconStarFill, IconPlus, IconDelete } from '@arco-design/web-vue/es/icon'

const loading = ref(false)
const searchText = ref('')
const showEditModal = ref(false)
const editForm = ref({
  dataName: '',
  interfaces: [
    { type: '主接口', interfaceId: '' }
  ],
  dataType: '',
  subType: '',
  dataManagement: '登陆账号',
  onlineTime: ''
})

const filterForm = ref({
  dataType: undefined,
  dataCategory: undefined,
  supplier: ''
})

const columns = [
  {
    title: '接口编号',
    dataIndex: 'interfaceId',
    slotName: 'interfaceId'
  },
  {
    title: '数据管理',
    dataIndex: 'dataManagement'
  },
  {
    title: '上线时间',
    dataIndex: 'onlineTime'
  },
  {
    title: '数据类型',
    slotName: 'dataType'
  }
]

const tableData = ref([
  {
    interfaceId: 'WS_CELLPHONE',
    backupInterfaceId: 'WS_CELLPHONE_BACKUP',
    dataManagement: '张三',
    onlineTime: '2023-12-08',
    dataType: '核验类',
    subType: '身份核验类',
    isPrimary: true,
    isFavorite: false,
    dataName: '手机号核验服务'
  },
  {
    interfaceId: 'WS_CREDIT_SCORE_BACKUP',
    primaryInterfaceId: 'WS_CREDIT_SCORE',
    dataManagement: '张三',
    onlineTime: '2023-12-10',
    dataType: '评分类',
    subType: '信用评分',
    isPrimary: false,
    isFavorite: true,
    dataName: '个人信用评分'
  },
  {
    interfaceId: 'WS_USER_TAGS',
    backupInterfaceId: 'WS_USER_TAGS_BACKUP',
    dataManagement: '张三',
    onlineTime: '2023-12-12',
    dataType: '标签类',
    subType: '用户画像',
    isPrimary: true,
    isFavorite: false,
    dataName: '用户标签服务'
  },
  {
    interfaceId: 'WS_BLACK_LIST',
    backupInterfaceId: 'WS_BLACK_LIST_BACKUP',
    dataManagement: '张三',
    onlineTime: '2023-12-15',
    dataType: '名单类',
    subType: '风险名单',
    isPrimary: true,
    isFavorite: false,
    dataName: '风险名单查询'
  },
  {
    interfaceId: 'WS_PRICE_EVAL_BACKUP',
    primaryInterfaceId: 'WS_PRICE_EVAL',
    dataManagement: '张三',
    onlineTime: '2023-12-18',
    dataType: '价格评估类',
    subType: '资产评估',
    isPrimary: false,
    isFavorite: true,
    dataName: '资产价格评估'
  }
])

const toggleFavorite = (item) => {
  item.isFavorite = !item.isFavorite
}

const interfaceColumns = [
  {
    title: '接口类型',
    dataIndex: 'type',
    width: 120,
    editable: false
  },
  {
    title: '接口编号',
    dataIndex: 'interfaceId',
    slotName: 'interfaceId'
  },
  {
    title: '操作',
    slotName: 'operations',
    width: 100
  }
]

const addBackupInterface = () => {
  const backupCount = editForm.value.interfaces.filter(i => i.type.includes('备接口')).length
  editForm.value.interfaces.push({
    type: `备接口${backupCount + 1}`,
    interfaceId: ''
  })
}

const removeInterface = (index) => {
  editForm.value.interfaces.splice(index, 1)
}

const handleAddProduct = () => {
  const primaryInterface = editForm.value.interfaces.find(i => i.type === '主接口')
  const backupInterfaces = editForm.value.interfaces.filter(i => i.type.includes('备接口'))
  
  tableData.value.push({
    ...editForm.value,
    interfaceId: primaryInterface?.interfaceId || '',
    backupInterfaceId: backupInterfaces.map(i => i.interfaceId).join(','),
    isPrimary: true,
    isFavorite: false
  })
  showEditModal.value = false
  editForm.value = {
    dataName: '',
    interfaceId: '',
    dataType: '',
    subType: '',
    dataManagement: '登陆账号',
    onlineTime: ''
  }
}

const filteredData = computed(() => {
  let result = tableData.value

  // 应用搜索过滤
  if (searchText.value) {
    result = result.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText.value.toLowerCase())
      )
    )
  }

  // 应用数据类型过滤
  if (filterForm.value.dataType && filterForm.value.dataType !== '不限') {
    result = result.filter(item => item.dataType === filterForm.value.dataType)
  }

  return result
})

const getTagColor = (type) => {
  const colorMap = {
    '核验类': 'blue',
    '评分类': 'orange',
    '标签类': 'green',
    '名单类': 'red',
    '价格评估类': 'purple',
    '身份核验类': 'cyan',
    '信用评分': 'gold',
    '用户画像': 'lime',
    '风险名单': 'magenta',
    '资产评估': 'geekblue'
  }
  return colorMap[type] || 'gray'
}

const selectedProduct = ref('')

const filterOption = (inputValue, option) => {
  return (
    option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
    option._children.toLowerCase().includes(inputValue.toLowerCase())
  )
}

const handleSearch = (value) => {
  searchText.value = value
}
</script>

<style scoped>
.external-data-page {
  padding: 24px;
  background: #f5f6f7;
}

.filter-form {
  margin-bottom: 24px;
}

.data-card {
  height: 100%;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  overflow: hidden;
}

.info-item .label {
  color: #86909c;
  margin-right: 8px;
  min-width: 70px;
  flex-shrink: 0;
}

.info-item a-space {
  width: calc(100% - 78px);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.info-item a-link {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-name {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}
</style>