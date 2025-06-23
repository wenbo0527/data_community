<template>
  <a-layout>
    <a-layout-content class="content">
      <a-tabs default-active-key="1" type="rounded">
        <a-tab-pane key="1" title="产品页面">
          <a-modal 
            v-model:visible="showEditModal" 
            title="新建数据产品"
            width="600px"
            :mask-closable="false"
            @ok="handleSubmit"
            @cancel="handleCancel"
          >
          <a-modal 
            v-model:visible="showBatchModal" 
            title="批量变更数据"
            width="600px"
            :mask-closable="false"
            @ok="handleBatchSubmit"
            @cancel="handleBatchCancel"
          >
            <a-form :model="batchForm" layout="vertical">
              <a-form-item label="上传文件" required>
                <a-upload
                  :show-file-list="false"
                  @change="handleFileChange"
                >
                  <template #upload-button>
                    <a-button type="outline">
                      <template #icon>
                        <icon-upload />
                      </template>
                      点击上传
                    </a-button>
                  </template>
                </a-upload>
                <div v-if="batchFile" style="margin-top: 8px">
                  已选择: {{ batchFile.name }}
                </div>
              </a-form-item>
              <a-form-item label="模板下载">
                <a-button type="text" @click="downloadTemplate">
                  <template #icon>
                    <icon-download />
                  </template>
                  下载模板
                </a-button>
              </a-form-item>
            </a-form>
          </a-modal>
            <a-form :model="editForm" layout="vertical">
              <a-form-item field="interfaceName" label="接口名称" required>
                <a-input v-model="editForm.interfaceName" placeholder="请输入接口名称" />
              </a-form-item>
              <a-form-item field="dataType" label="数源种类" required>
                <a-select v-model="editForm.dataType" placeholder="请选择数源种类">
                  <a-option value="核验类">核验类</a-option>
                  <a-option value="评分类">评分类</a-option>
                  <a-option value="标签类">标签类</a-option>
                  <a-option value="名单类">名单类</a-option>
                  <a-option value="价格评估类">价格评估类</a-option>
                </a-select>
              </a-form-item>
              <a-form-item field="dataCategory" label="分类" required>
                <a-select v-model="editForm.dataCategory" placeholder="请选择分类">
                  <a-option value="身份核验类">身份核验类</a-option>
                  <a-option value="信用评分">信用评分</a-option>
                  <a-option value="用户画像">用户画像</a-option>
                  <a-option value="风险名单">风险名单</a-option>
                  <a-option value="资产评估">资产评估</a-option>
                </a-select>
              </a-form-item>
              <a-form-item field="supplier" label="供应商">
                <a-input v-model="editForm.supplier" placeholder="请输入供应商" />
              </a-form-item>
              <a-form-item field="description" label="描述">
                <a-textarea v-model="editForm.description" placeholder="请输入描述" />
              </a-form-item>
            </a-form>
          </a-modal>
          <a-row :gutter="[24, 24]">
            <a-col :span="24">
              <a-card title="外部数据v1" :bordered="false">
                <template #extra>
                  <a-space>
                    <a-button type="primary" @click="showEditModal = true">
                      <template #icon>
                        <icon-plus />
                      </template>
                      新增产品
                    </a-button>
                    <a-button type="primary" @click="showBatchModal = true">
                      <template #icon>
                        <icon-upload />
                      </template>
                      批量变更
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
                      <a-option value="身份核验类">身份核验类</a-option>
                      <a-option value="信用评分">信用评分</a-option>
                      <a-option value="用户画像">用户画像</a-option>
                      <a-option value="风险名单">风险名单</a-option>
                      <a-option value="资产评估">资产评估</a-option>
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
                          <span class="data-name">
                            <router-link :to="`/external-data-v1/detail/${item.interfaceId}`">
                              {{ item.dataName }}
                            </router-link>
                          </span>
                          <a-space>
                            <a-tag :color="getTagColor(item.dataType)">
                              {{ item.dataType }}
                            </a-tag>
                            <a-tag :color="getTagColor(item.subType)" v-if="item.subType">
                              {{ item.subType }}
                            </a-tag>
                            <a-tag color="green" v-if="item.isPrimary">
                              主接口
                            </a-tag>
                            <a-tag color="orange" v-else>
                              备接口
                            </a-tag>
                          </a-space>
                        </div>
                      </template>
                      <div class="card-content">
                        <div class="info-item">
                          <span class="label">接口编号：</span>
                          <span>{{ item.interfaceId }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">供应商：</span>
                          <span>{{ item.supplier }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">状态：</span>
                          <span>{{ item.status }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">单价：</span>
                          <span>{{ item.price }}元/次</span>
                        </div>
                        <div class="info-item">
                          <span class="label">管理人员：</span>
                          <span>{{ item.manager }}</span>
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
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IconStar, IconStarFill, IconPlus, IconUpload, IconDownload } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const searchText = ref('')
const showEditModal = ref(false)
const showBatchModal = ref(false)
const batchFile = ref(null)
const editForm = ref({
  interfaceName: '',
  dataType: '',
  dataCategory: '',
  supplier: '',
  description: ''
})
const filterForm = ref({
  dataType: undefined,
  dataCategory: undefined,
  supplier: ''
})

// 导入mock数据
import { generateExternalDataDetail } from '@/mock/external-data-v1'

// 初始化数据列表
const dataList = ref([
  generateExternalDataDetail('EXT001'),
  generateExternalDataDetail('EXT002')
])

const filteredData = computed(() => {
  return dataList.value.filter(item => {
    const matchesSearch = 
      (item.dataName && item.dataName.toLowerCase().includes(searchText.value.toLowerCase())) || 
      (item.interfaceId && item.interfaceId.toLowerCase().includes(searchText.value.toLowerCase())) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchText.value.toLowerCase()))
    
    const matchesFilter = 
      (!filterForm.value.dataType || filterForm.value.dataType === '不限' || item.dataType === filterForm.value.dataType) &&
      (!filterForm.value.dataCategory || filterForm.value.dataCategory === '不限' || item.subType === filterForm.value.dataCategory) &&
      (!filterForm.value.supplier || item.supplier === filterForm.value.supplier)
    
    return matchesSearch && matchesFilter
  })
})

const getTagColor = (type) => {
  const colors = {
    '核验类': 'arcoblue',
    '评分类': 'orangered',
    '标签类': 'green',
    '名单类': 'purple',
    '价格评估类': 'gold'
  }
  return colors[type] || 'gray'
}

const handleSearch = (value) => {
  searchText.value = value
}

const handleSubmit = () => {
  // 这里添加提交逻辑
  console.log('提交表单:', editForm.value)
  showEditModal.value = false
}

const handleCancel = () => {
  showEditModal.value = false
}

const handleBatchSubmit = () => {
  if (!batchFile.value) {
    Message.error('请先上传文件')
    return
  }
  // 这里添加批量提交逻辑
  console.log('批量提交文件:', batchFile.value)
  showBatchModal.value = false
}

const handleBatchCancel = () => {
  showBatchModal.value = false
}

const handleFileChange = (file) => {
  batchFile.value = file
}
</script>

<style scoped>
.content {
  padding: 16px;
  background: #f5f5f5;
}

.data-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-name {
  font-weight: 500;
}

.info-item {
  margin-bottom: 8px;
}

.label {
  color: #86909C;
}
</style>