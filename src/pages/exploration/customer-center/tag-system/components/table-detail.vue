<template>
  <div class="table-detail">
    <a-descriptions :column="2" bordered>
      <a-descriptions-item label="表名称">
        {{ tableData.tableName }}
      </a-descriptions-item>
      <a-descriptions-item label="表描述">
        {{ tableData.tableDesc }}
      </a-descriptions-item>
      <a-descriptions-item label="数据源">
        <a-tag>{{ tableData.dataSource }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="记录数">
        {{ formatNumber(tableData.recordCount) }}
      </a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag :color="getStatusColor(tableData.status)">
          {{ getStatusText(tableData.status) }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="主键字段">
        <a-tag color="blue">{{ tableData.primaryKey }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="ID映射状态">
        <a-space>
          <icon-check-circle v-if="tableData.mappingStatus === 'configured'" style="color: #00b42a" />
          <icon-close-circle v-else-if="tableData.mappingStatus === 'not_configured'" style="color: #f53f3f" />
          <icon-minus-circle v-else style="color: #c9cdd4" />
          <span>{{ getMappingStatusText(tableData.mappingStatus) }}</span>
        </a-space>
      </a-descriptions-item>
      <a-descriptions-item label="标识类型">
        <a-tag v-if="tableData.identityType" :color="getIdentityTypeColor(tableData.identityType)">
          {{ getIdentityTypeText(tableData.identityType) }}
        </a-tag>
        <span v-else>-</span>
      </a-descriptions-item>
      <a-descriptions-item label="创建时间" :span="2">
        {{ tableData.createTime }}
      </a-descriptions-item>
      <a-descriptions-item label="更新时间" :span="2">
        {{ tableData.updateTime }}
      </a-descriptions-item>
    </a-descriptions>

    <!-- ID映射规则详情 -->
    <div v-if="tableData.mappingRule" class="mapping-detail">
      <h4>ID映射规则</h4>
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="映射算法">
          <a-tag color="blue">{{ getAlgorithmText(tableData.mappingRule.algorithm) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="匹配置信度">
          {{ (tableData.mappingRule.confidence * 100).toFixed(1) }}%
        </a-descriptions-item>
        <a-descriptions-item label="映射字段" :span="2">
          <a-space>
            <a-tag v-for="field in tableData.mappingRule.fields" :key="field">
              {{ field }}
            </a-tag>
          </a-space>
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <!-- 表结构信息 -->
    <div class="schema-info">
      <h4>表结构信息</h4>
      <a-table :columns="schemaColumns" :data="mockSchemaData" size="small">
        <template #fieldType="{ record }">
          <a-tag size="small" :color="getFieldTypeColor(record.fieldType)">
            {{ record.fieldType }}
          </a-tag>
        </template>
        <template #isPrimaryKey="{ record }">
          <icon-check-circle v-if="record.isPrimaryKey" style="color: #00b42a" />
          <icon-close-circle v-else style="color: #c9cdd4" />
        </template>
        <template #isMappingField="{ record }">
          <icon-check-circle v-if="record.isMappingField" style="color: #00b42a" />
          <icon-close-circle v-else style="color: #c9cdd4" />
        </template>
      </a-table>
    </div>

    <!-- 底部操作按钮 -->
    <div class="detail-actions">
      <a-space>
        <a-button 
          v-if="tableData.mappingStatus !== 'configured'" 
          type="primary"
          @click="handleConfigureMapping"
        >
          配置ID映射
        </a-button>
        <a-button v-else type="primary" @click="handleEditMapping">
          编辑ID映射
        </a-button>
        <a-button @click="handleViewData">
          查看数据
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IconCheckCircle, IconCloseCircle, IconMinusCircle } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  tableData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit-mapping'])

const router = useRouter()

// 表结构列配置
const schemaColumns = [
  {
    title: '字段名',
    dataIndex: 'fieldName',
    width: 150
  },
  {
    title: '字段类型',
    dataIndex: 'fieldType',
    width: 100,
    slotName: 'fieldType'
  },
  {
    title: '字段描述',
    dataIndex: 'fieldDesc',
    ellipsis: true
  },
  {
    title: '主键',
    dataIndex: 'isPrimaryKey',
    width: 80,
    align: 'center',
    slotName: 'isPrimaryKey'
  },
  {
    title: '映射字段',
    dataIndex: 'isMappingField',
    width: 100,
    align: 'center',
    slotName: 'isMappingField'
  }
]

// 模拟表结构数据
const mockSchemaData = computed(() => {
  const baseFields = [
    {
      fieldName: props.tableData.primaryKey,
      fieldType: 'STRING',
      fieldDesc: '主键字段',
      isPrimaryKey: true,
      isMappingField: props.tableData.mappingRule?.fields.includes(props.tableData.primaryKey) || false
    }
  ]

  // 根据标识类型添加常用字段
  const identityFields = {
    person: [
      { fieldName: 'mobile', fieldType: 'STRING', fieldDesc: '手机号' },
      { fieldName: 'id_card', fieldType: 'STRING', fieldDesc: '身份证号' },
      { fieldName: 'email', fieldType: 'STRING', fieldDesc: '邮箱' },
      { fieldName: 'user_name', fieldType: 'STRING', fieldDesc: '用户名' }
    ],
    device: [
      { fieldName: 'device_id', fieldType: 'STRING', fieldDesc: '设备ID' },
      { fieldName: 'imei', fieldType: 'STRING', fieldDesc: 'IMEI' },
      { fieldName: 'mac_address', fieldType: 'STRING', fieldDesc: 'MAC地址' },
      { fieldName: 'os_type', fieldType: 'STRING', fieldDesc: '操作系统' }
    ],
    enterprise: [
      { fieldName: 'enterprise_name', fieldType: 'STRING', fieldDesc: '企业名称' },
      { fieldName: 'business_license', fieldType: 'STRING', fieldDesc: '营业执照号' },
      { fieldName: 'tax_id', fieldType: 'STRING', fieldDesc: '税务登记号' },
      { fieldName: 'legal_person', fieldType: 'STRING', fieldDesc: '法人' }
    ],
    family: [
      { fieldName: 'family_id', fieldType: 'STRING', fieldDesc: '家庭ID' },
      { fieldName: 'householder_name', fieldType: 'STRING', fieldDesc: '户主姓名' },
      { fieldName: 'householder_id', fieldType: 'STRING', fieldDesc: '户主身份证' },
      { fieldName: 'address', fieldType: 'STRING', fieldDesc: '家庭地址' }
    ]
  }

  const fields = identityFields[props.tableData.identityType] || []
  
  return [
    ...baseFields,
    ...fields.map(field => ({
      ...field,
      isPrimaryKey: false,
      isMappingField: props.tableData.mappingRule?.fields.includes(field.fieldName) || false
    }))
  ]
})

// 状态相关方法
const getStatusColor = (status) => {
  const colorMap = {
    active: 'green',
    inactive: 'red',
    pending: 'orange'
  }
  return colorMap[status] || 'gray'
}

const getStatusText = (status) => {
  const textMap = {
    active: '活跃',
    inactive: '停用',
    pending: '待处理'
  }
  return textMap[status] || status
}

const getMappingStatusText = (status) => {
  const textMap = {
    configured: '已配置',
    not_configured: '未配置',
    pending: '待配置'
  }
  return textMap[status] || '未配置'
}

const getIdentityTypeColor = (type) => {
  const colorMap = {
    person: 'blue',
    device: 'green',
    enterprise: 'orange',
    family: 'purple'
  }
  return colorMap[type] || 'gray'
}

const getIdentityTypeText = (type) => {
  const textMap = {
    person: '个人',
    device: '设备',
    enterprise: '企业',
    family: '家庭'
  }
  return textMap[type] || type
}

const getAlgorithmText = (algorithm) => {
  const textMap = {
    exact_match: '精确匹配',
    fuzzy_match: '模糊匹配',
    md5: 'MD5哈希',
    sha256: 'SHA256哈希'
  }
  return textMap[algorithm] || algorithm
}

const getFieldTypeColor = (fieldType) => {
  const colorMap = {
    STRING: 'blue',
    INTEGER: 'green',
    DOUBLE: 'orange',
    BOOLEAN: 'purple',
    DATE: 'red'
  }
  return colorMap[fieldType] || 'gray'
}

const formatNumber = (num) => {
  return num.toLocaleString()
}

// 事件处理
const handleConfigureMapping = () => {
  router.push({
    path: '/exploration/customer-center/tag-system/table-registration',
    query: { 
      tableId: props.tableData.id, 
      mode: 'mapping',
      tableName: props.tableData.tableName 
    }
  })
}

const handleEditMapping = () => {
  emit('edit-mapping', props.tableData)
  router.push({
    path: '/exploration/customer-center/tag-system/table-registration',
    query: { 
      tableId: props.tableData.id, 
      mode: 'edit',
      tableName: props.tableData.tableName 
    }
  })
}

const handleViewData = () => {
  // 这里可以跳转到数据预览页面
  console.log('查看数据:', props.tableData.tableName)
}
</script>

<style scoped lang="less">
.table-detail {
  padding: 0;
  
  .mapping-detail,
  .schema-info {
    margin-top: 24px;
    
    h4 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .detail-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);
    text-align: right;
  }
}
</style>