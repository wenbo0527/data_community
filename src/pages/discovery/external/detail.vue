<template>
  <a-layout>
    <a-layout-content class="content">
      <!-- 主要信息区 -->
      <a-card :bordered="false" class="main-info">
        <a-row :gutter="24">
          <a-col :span="18">
            <a-space direction="vertical" fill>
              <div class="title-section">
                <a-space align="center">
                  <a-button type="text" @click="$router.back()">
                    <template #icon><icon-left /></template>
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
                <a-descriptions-item label="产品分类">{{ dataDetail.category }}</a-descriptions-item>
                <a-descriptions-item label="管理人员">{{ dataDetail.manager }}</a-descriptions-item>
                <a-descriptions-item label="供应商">{{ dataDetail.supplier }}</a-descriptions-item>
                <a-descriptions-item label="单价">{{ dataDetail.price }}元/次</a-descriptions-item>
                <a-descriptions-item label="产品描述" :span="2">{{ dataDetail.description }}</a-descriptions-item>
              </a-descriptions>
            </a-space>
          </a-col>
          
          <a-col :span="6" class="action-panel">
            <a-space>
              <a-button type="primary" @click="handleEdit">
                <template #icon><icon-edit /></template>
                编辑信息
              </a-button>
              <a-button
                type="text"
                :class="{ 'favorite-btn': true, 'is-favorite': dataDetail.isFavorite }"
                @click="toggleFavorite"
              >
                <template #icon>
                  <icon-star-fill v-if="dataDetail.isFavorite" />
                  <icon-star v-else />
                </template>
                {{ dataDetail.isFavorite ? '取消收藏' : '收藏' }}
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>

      <!-- 接口切换 -->
      <a-alert
        v-if="!dataDetail.isPrimary"
        type="warning"
        :style="{ margin: '16px 0' }"
      >
        当前查看的是备用接口信息，可切换至主接口查看
      </a-alert>
      <a-radio-group
        v-model="dataDetail.isPrimary"
        type="button"
        :style="{ marginBottom: '16px' }"
        @change="handleInterfaceChange"
      >
        <a-radio :value="true">主接口</a-radio>
        <a-radio :value="false">备用接口</a-radio>
      </a-radio-group>

      <!-- 标签页区域 -->
      <a-card :bordered="false" class="main-card">
        <a-tabs>
          <a-tab-pane key="1" title="基本信息">
            <a-card :bordered="false" class="info-card">
              <a-descriptions :column="2" :data="combinedBasicInfo" />
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

    <!-- 编辑抽屉 -->
    <a-drawer
      :visible="editDrawerVisible"
      @cancel="handleEditCancel"
      @ok="handleEditSubmit"
      title="编辑信息"
      width="600px"
    >
      <a-form :model="editForm" ref="editFormRef" :rules="editFormRules">
        <a-form-item field="category" label="产品分类" required>
          <a-select v-model="editForm.category">
            <a-option value="核验类">核验类</a-option>
            <a-option value="评分类">评分类</a-option>
            <a-option value="标签类">标签类</a-option>
            <a-option value="名单类">名单类</a-option>
            <a-option value="价格评估类">价格评估类</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="interfaceType" label="接口类型" required>
          <a-radio-group v-model="editForm.interfaceType">
            <a-radio value="主接口">主接口</a-radio>
            <a-radio value="备用接口">备用接口</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="tableName" label="落库表名" required>
          <a-input v-model="editForm.tableName" placeholder="请输入落库表名" />
        </a-form-item>
        <a-form-item field="supplier" label="供应商" required>
          <a-input v-model="editForm.supplier" placeholder="请输入供应商" />
        </a-form-item>
        <a-form-item field="price" label="单价" required>
          <a-input-number v-model="editForm.price" placeholder="请输入单价" :min="0" :precision="3" />
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-textarea v-model="editForm.description" placeholder="请输入描述信息" />
        </a-form-item>
      </a-form>
    </a-drawer>
  </a-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconLeft, IconEdit, IconStar, IconStarFill } from '@arco-design/web-vue/es/icon'

const route = useRoute()

// 计算基本信息
const combinedBasicInfo = computed(() => [
  {
    label: '接口编号',
    value: dataDetail.value.interfaceId
  },
  {
    label: '数据管理',
    value: dataDetail.value.manager
  },
  {
    label: '上线时间',
    value: dataDetail.value.onlineTime
  },
  {
    label: '更新频率',
    value: dataDetail.value.updateFrequency
  },
  {
    label: '请求方式',
    value: dataDetail.value.requestMethod
  },
  {
    label: '测试环境地址',
    value: dataDetail.value.testUrl
  },
  {
    label: '生产环境地址',
    value: dataDetail.value.productionUrl
  },
  {
    label: '超时时间',
    value: `${dataDetail.value.timeout}秒`
  },
  {
    label: '重试次数',
    value: dataDetail.value.retryCount
  },
  {
    label: '缓存时间',
    value: `${dataDetail.value.cacheTime}秒`
  }
])

// 标签颜色映射
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

// 数据详情
const dataDetail = ref({
  dataName: '手机号核验服务',
  dataType: '核验类',
  subType: '身份核验类',
  category: '核验类',
  manager: '李明',
  supplier: '数据服务商A',
  price: 0.8,
  description: '提供手机号实名认证及在网时长查询服务，支持批量查询，实时响应',
  isPrimary: true,
  isFavorite: false,
  interfaceId: 'WS_CELLPHONE_V2',
  onlineTime: '2024-01-15',
  updateFrequency: '实时',
  requestMethod: 'POST',
  testUrl: 'https://test-api.example.com/api/v2/verify/phone',
  productionUrl: 'https://api.example.com/api/v2/verify/phone',
  timeout: 1.5,
  retryCount: 2,
  cacheTime: 1800
})

// 编辑表单
const editDrawerVisible = ref(false)
const editFormRef = ref(null)
const editForm = ref({
  category: '',
  interfaceType: '',
  tableName: '',
  supplier: '',
  price: 0,
  description: ''
})

// 表单校验规则
const editFormRules = {
  category: [{ required: true, message: '请选择产品分类' }],
  interfaceType: [{ required: true, message: '请选择接口类型' }],
  tableName: [{ required: true, message: '请输入落库表名' }],
  supplier: [{ required: true, message: '请输入供应商' }],
  price: [{ required: true, message: '请输入单价' }]
}


// 功能信息
const functionInfo = ref([
  { label: '接口编号', value: 'WS_CELLPHONE_V2' },
  { label: '数据管理', value: 'dws_prd_phone_verify' },
  { label: '上线时间', value: '2024-01-15' },
  { label: '更新频率', value: '实时' }
])

// 接口信息
const interfaceInfo = ref([
  { label: '请求方式', value: 'POST' },
  { label: '测试环境地址', value: 'https://test-api.example.com/api/v2/verify/phone' },
  { label: '生产环境地址', value: 'https://api.example.com/api/v2/verify/phone' },
  { label: '超时时间', value: '1500ms' },
  { label: '重试次数', value: '2次' },
  { label: '缓存时间', value: '30分钟' },
  { label: '上线时间', value: '2024-01-15' },
  { label: '报文格式', value: 'JSON' },
  { label: '请求编码', value: 'UTF-8' }
])

// 落库信息
const storageInfo = ref([
  { label: '落库表名', value: 'dws_verify_phone_result_v2' },
  { label: '落库频率', value: '准实时' },
  { label: '保存天数', value: '365天' },
  { label: '压缩方式', value: 'ORC' },
  { label: '分区字段', value: 'dt,hour' },
  { label: '主键字段', value: 'request_id,phone' }
])

// 表的元数据信息
const metadataColumns = [
  { title: '字段中文名', dataIndex: 'chineseName' },
  { title: '字段英文名', dataIndex: 'englishName' },
  { title: '字段类型', dataIndex: 'fieldType' },
  { title: '是否必填', dataIndex: 'required' },
  { title: '备注', dataIndex: 'remark' }
]

const metadataData = [
  {
    chineseName: '请求ID',
    englishName: 'request_id',
    fieldType: 'string',
    required: '是',
    remark: '唯一标识请求的ID'
  },
  {
    chineseName: '手机号',
    englishName: 'phone',
    fieldType: 'string',
    required: '是',
    remark: '待验证的手机号码'
  },
  {
    chineseName: '验证结果',
    englishName: 'verify_result',
    fieldType: 'boolean',
    required: '是',
    remark: '验证是否通过'
  },
  {
    chineseName: '在网状态',
    englishName: 'status',
    fieldType: 'string',
    required: '是',
    remark: '手机号在网状态'
  },
  {
    chineseName: '在网时长',
    englishName: 'duration',
    fieldType: 'integer',
    required: '否',
    remark: '手机号在网时长（月）'
  },
  {
    chineseName: '运营商',
    englishName: 'operator',
    fieldType: 'string',
    required: '是',
    remark: '手机号所属运营商'
  },
  {
    chineseName: '创建时间',
    englishName: 'create_time',
    fieldType: 'timestamp',
    required: '是',
    remark: '数据创建时间'
  },
  {
    chineseName: '更新时间',
    englishName: 'update_time',
    fieldType: 'timestamp',
    required: '是',
    remark: '数据更新时间'
  }
]

// 调用及费用信息
const usageInfo = ref([
  { label: '计费方式', value: '阶梯计费' },
  { label: '单价', value: '0.8元/次起' },
  { label: '最小起订量', value: '5000次' },
  { label: '账期', value: '预付费' }
])

// 变量评估信息
const evaluationInfo = ref([
  { label: '准确率', value: '99.95%' },
  { label: '响应时间', value: '平均150ms' },
  { label: '覆盖率', value: '99.5%' },
  { label: '稳定性', value: '99.995%' }
])

// 入参表格配置
const inputColumns = [
  { title: '参数名', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type' },
  { title: '是否必填', dataIndex: 'required' },
  { title: '描述', dataIndex: 'description' }
]

// 入参数据
const inputParams = [
  {
    name: 'phone',
    type: 'string',
    required: '是',
    description: '手机号码，支持单个或批量查询（最多100个）'
  },
  {
    name: 'checkItems',
    type: 'array',
    required: '否',
    description: '查询项目，可选值：["status", "duration"]'
  },
  {
    name: 'source',
    type: 'string',
    required: '否',
    description: '调用来源，用于统计'
  }
]

// 出参表格配置
const outputColumns = [
  { title: '参数名', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type' },
  { title: '描述', dataIndex: 'description' }
]

// 出参数据
const outputParams = [
  {
    name: 'isValid',
    type: 'boolean',
    description: '号码是否有效'
  },
  {
    name: 'status',
    type: 'string',
    description: '在网状态：正常/停机/销号/空号'
  },
  {
    name: 'duration',
    type: 'number',
    description: '在网时长（月）'
  },
  {
    name: 'operator',
    type: 'string',
    description: '运营商信息'
  },
  {
    name: 'message',
    type: 'string',
    description: '结果说明'
  }
]

// 收藏切换
const toggleFavorite = () => {
  dataDetail.value.isFavorite = !dataDetail.value.isFavorite
}

// 编辑相关方法
const handleEdit = () => {
  editForm.value = {
    category: dataDetail.value.category,
    interfaceType: dataDetail.value.isPrimary ? '主接口' : '备用接口',
    tableName: storageInfo.value[0].value,
    supplier: dataDetail.value.supplier,
    price: dataDetail.value.price,
    description: dataDetail.value.description
  }
  editDrawerVisible.value = true
}

const handleEditCancel = () => {
  editDrawerVisible.value = false
  editFormRef.value?.resetFields()
}

const handleEditSubmit = async () => {
  try {
    await editFormRef.value?.validate()
    // TODO: 调用接口保存数据
    console.log('保存编辑数据:', editForm.value)
    // 模拟保存成功
    dataDetail.value = {
      ...dataDetail.value,
      category: editForm.value.category,
      isPrimary: editForm.value.interfaceType === '主接口',
      supplier: editForm.value.supplier,
      price: editForm.value.price,
      description: editForm.value.description
    }
    storageInfo.value[0].value = editForm.value.tableName
    Message.success('保存成功')
    editDrawerVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 接口切换方法
const handleInterfaceChange = async (value) => {
  try {
    // TODO: 调用接口获取对应数据
    console.log('切换到', value ? '主接口' : '备用接口')
    // 模拟加载数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 更新界面数据
    updateInterfaceData(value)
    Message.success(`已切换到${value ? '主接口' : '备用接口'}`)
  } catch (error) {
    Message.error('接口切换失败')
  }
}

// 更新接口相关数据
const updateInterfaceData = (isPrimary) => {
  if (isPrimary) {
    functionInfo.value[0].value = 'WS_CELLPHONE'
    interfaceInfo.value[1].value = '/api/v1/verify/phone'
  } else {
    functionInfo.value[0].value = 'WS_CELLPHONE_BACKUP'
    interfaceInfo.value[1].value = '/api/v1/verify/phone/backup'
  }
}

// 获取路由参数
const interfaceId = computed(() => route.params.id)

// 在组件挂载时获取数据
onMounted(async () => {
  try {
    // TODO: 根据interfaceId获取数据详情
    console.log('获取数据详情:', interfaceId.value)
    // 模拟异步获取数据
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    Message.error('获取数据详情失败')
  }
})
</script>
