<template>
  <a-layout>
    <a-layout-content class="content">
      <a-row :gutter="[24, 24]">
        <a-col :span="24">
          <a-card title="外部数据" :bordered="false">
            <template #extra>
              <a-space>
                <a-input-search
                  v-model="searchText"
                  placeholder="搜索数据"
                  style="width: 200px"
                  @search="handleSearch"
                />
              </a-space>
            </template>

            <a-form :model="filterForm" layout="inline" class="filter-form">
              <a-form-item field="dataType" label="数据种类">
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
              <a-form-item field="dataCategory" label="数据分类">
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
                        <icon-star-fill
                          v-if="item.isFavorite"
                          :style="{ color: '#FFD700', cursor: 'pointer' }"
                          @click="toggleFavorite(item)"
                        />
                        <icon-star
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
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { IconStar, IconStarFill } from '@arco-design/web-vue/es/icon'

const loading = ref(false)
const searchText = ref('')

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
    dataManagement: 'dws_prd_abcd',
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
    dataManagement: 'dws_prd_efgh',
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
    dataManagement: 'dws_prd_ijkl',
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
    dataManagement: 'dws_prd_mnop',
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
    dataManagement: 'dws_prd_qrst',
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

const handleSearch = (value) => {
  searchText.value = value
}
</script>

<style scoped>
.content {
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