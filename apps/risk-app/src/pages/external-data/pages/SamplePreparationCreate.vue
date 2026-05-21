<template>
  <div class="drawer-content">
    <!-- 1. 基础配置 -->
    <a-card title="基础配置" :bordered="false" class="section-card">
      <a-form :model="form" layout="vertical">
        <a-form-item label="目标服务类型" required>
          <a-select v-model="form.serviceType" placeholder="请选择服务类型" @change="handleServiceTypeChange">
            <a-option>在线批量调用</a-option>
            <a-option>外数离线回溯申请</a-option>
            <a-option>全量变量回溯申请</a-option>
            <a-option>风险合规离线回溯申请</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 2. 目标表配置 -->
    <a-card title="目标表配置" :bordered="false" class="section-card">
      <a-form :model="tableForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="存储类型" required>
              <a-radio-group v-model="tableForm.storageType" type="button">
                <a-radio value="doris">Doris</a-radio>
                <a-radio value="hive">Hive</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="集群/连接" required>
              <a-select v-model="tableForm.cluster" placeholder="请选择集群">
                <a-option>Common-Cluster-01</a-option>
                <a-option>Risk-Cluster-Pro</a-option>
                <a-option>Data-Warehouse-V2</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="数据库" required>
              <a-input v-model="tableForm.database" placeholder="请输入数据库名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="表名" required>
              <a-input v-model="tableForm.tableName" placeholder="请输入表名" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="表描述">
          <a-textarea v-model="tableForm.description" placeholder="请输入表的业务描述" :auto-size="{ minRows: 2, maxRows: 4 }" />
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 3. 数据逻辑配置 -->
    <a-card title="数据逻辑配置" :bordered="false" class="section-card">
      <template #extra>
        <a-button type="text" size="small" @click="parseSelect">
          <template #icon><icon-code /></template>
          解析 SQL 提取字段
        </a-button>
      </template>
      <a-form :model="sqlForm" layout="vertical">
        <a-alert type="info" class="mb-4">
          请输入 SELECT 查询语句，系统将自动解析字段用于建表。
        </a-alert>
        <a-form-item label="SELECT 查询语句" required>
          <a-textarea 
            v-model="sqlForm.content" 
            placeholder="SELECT id, name, age, created_at FROM source_table WHERE dt = '${bizdate}' ..." 
            :auto-size="{ minRows: 6, maxRows: 12 }"
            style="font-family: monospace;"
            @blur="parseSelect"
          />
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 4. 表结构定义 -->
    <a-card title="表结构定义" :bordered="false" class="section-card">
       <template #extra>
         <a-space>
           <a-button type="outline" size="mini" @click="loadStandardTemplate">
            <template #icon><icon-import /></template>
            加载标准模板
          </a-button>
          <a-button type="secondary" size="mini" @click="addColumn">
            <template #icon><icon-plus /></template>
            添加字段
          </a-button>
         </a-space>
      </template>
      
      <a-table :data="tableForm.columns" :pagination="false" size="mini" :scroll="{ y: 200 }">
        <template #columns>
          <a-table-column title="字段名" data-index="name" :width="120">
            <template #cell="{ record }">
              <a-input v-model="record.name" size="mini" />
            </template>
          </a-table-column>
          <a-table-column title="类型" data-index="type" :width="100">
            <template #cell="{ record }">
              <a-select v-model="record.type" size="mini">
                <a-option>STRING</a-option>
                <a-option>INT</a-option>
                <a-option>BIGINT</a-option>
                <a-option>DOUBLE</a-option>
                <a-option>DATE</a-option>
                <a-option>DATETIME</a-option>
                <a-option>VARCHAR</a-option>
                <a-option>DECIMAL</a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column title="注释" data-index="comment">
            <template #cell="{ record }">
              <a-input v-model="record.comment" size="mini" />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="50" align="center">
            <template #cell="{ rowIndex }">
              <a-button type="text" status="danger" size="mini" @click="removeColumn(rowIndex)">
                <template #icon><icon-delete /></template>
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 5. 调度配置 -->
    <a-card title="调度配置" :bordered="false" class="section-card">
      <a-form :model="scheduleForm" layout="vertical">
        <a-form-item label="执行策略" required>
          <a-radio-group v-model="scheduleForm.type" type="button">
            <a-radio value="single">单次执行</a-radio>
            <a-radio value="periodic">周期执行</a-radio>
          </a-radio-group>
        </a-form-item>

        <div v-if="scheduleForm.type === 'periodic'">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="调度周期" required>
                <a-select v-model="scheduleForm.cycle">
                  <a-option value="daily">每天</a-option>
                  <a-option value="weekly">每周</a-option>
                  <a-option value="monthly">每月</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="执行时间" required>
                <a-time-picker v-model="scheduleForm.time" format="HH:mm" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </a-card>

    <!-- 校验结果弹窗 -->
    <a-modal v-model:visible="validationVisible" title="校验结果" :footer="false" width="600px">
       <a-result v-if="validationResult.success" status="success" title="校验通过">
        <template #subtitle>
          样本表配置及 SQL 逻辑校验通过，任务已提交。
        </template>
        <template #extra>
          <a-space>
            <a-button type="primary" @click="goToCreateService">前往创建服务</a-button>
            <a-button @click="closeValidation">关闭</a-button>
          </a-space>
        </template>
      </a-result>

      <a-result v-else status="error" title="校验未通过">
          <template #subtitle>
          请检查以下问题并修正配置。
        </template>
      </a-result>
      
      <a-descriptions :column="1" bordered class="mt-4">
        <a-descriptions-item label="主键检查">
          <a-tag :color="validationResult.pkCheck ? 'green' : 'red'">
            {{ validationResult.pkCheck ? '通过' : '失败 (缺少必要主键)' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="必填字段检查">
            <a-tag :color="validationResult.fieldsCheck ? 'green' : 'red'">
            {{ validationResult.fieldsCheck ? '通过' : '失败 (缺少必要字段)' }}
          </a-tag>
        </a-descriptions-item>
          <a-descriptions-item label="字段类型检查">
            <a-tag :color="validationResult.typeCheck ? 'green' : 'red'">
            {{ validationResult.typeCheck ? '通过' : '失败 (字段类型不匹配)' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="数据结果校验">
          <a-tag :color="validationResult.dataCheck ? 'green' : 'gray'">
            {{ validationResult.dataCheck ? '通过' : (validationResult.hasDataRules ? '失败 (数据格式不符合规则)' : '未配置 (跳过)') }}
          </a-tag>
          <div v-if="validationResult.hasDataRules && !validationResult.dataCheck" style="margin-top: 8px; font-size: 12px; color: red;">
            Mock校验: 字段 [mobile] 数据格式不符合正则表达式 ^1[3-9]\d{9}$
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, defineEmits, defineExpose } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconImport, IconPlus, IconDelete, IconCode } from '@arco-design/web-vue/es/icon'

const emit = defineEmits(['success'])

const router = useRouter()
const isSubmitting = ref(false)
const validationVisible = ref(false)

// 表单数据
const form = reactive({ serviceType: '' })
const sqlForm = reactive({ content: '' })
const scheduleForm = reactive({
  type: 'single',
  cycle: 'daily',
  time: '00:00'
})
const tableForm = reactive({
  storageType: 'doris',
  cluster: '',
  database: '',
  tableName: '',
  description: '',
  columns: [
    { name: 'id', type: 'BIGINT', comment: '主键ID' }
  ]
})

const validationResult = reactive({
  success: false,
  pkCheck: false,
  fieldsCheck: false,
  typeCheck: false,
  dataCheck: false,
  hasDataRules: false
})

// 解析 SQL
const parseSelect = () => {
  if (!sqlForm.content) return

  try {
    const sql = sqlForm.content.trim()
    const selectMatch = sql.match(/select\s+(.*?)\s+from/is)
    
    if (selectMatch && selectMatch[1]) {
      const fieldStr = selectMatch[1]
      const fields = fieldStr.split(',').map(f => f.trim())
      
      const parsedCols = fields.map(field => {
        let name = field
        const asMatch = field.match(/(?:\s+as\s+|\s+)(\w+)$/i)
        if (asMatch) {
          name = asMatch[1]
        } else {
          const dotParts = field.split('.')
          name = dotParts[dotParts.length - 1]
        }
        name = name.replace(/[`'"]/g, '')
        
        return {
          name: name,
          type: 'STRING',
          comment: ''
        }
      }).filter(c => c.name && c.name !== '*')

      if (parsedCols.length > 0) {
        // 增量更新，保留已有字段的类型和注释
        const existingMap = new Map(tableForm.columns.map(c => [c.name, c]))
        const newColumns = parsedCols.map(c => {
          if (existingMap.has(c.name)) {
            return existingMap.get(c.name)
          }
          return c
        })
        tableForm.columns = newColumns
        Message.success(`解析成功，更新了 ${newColumns.length} 个字段`)
      }
    }
  } catch (e) {
    // 静默失败或轻微提示，不打断用户输入
    console.warn('SQL解析部分字段失败')
  }
}

// 模拟获取模版数据
const getTemplates = (serviceType: string) => {
  // 这里应该调用接口获取 ServiceValidationTemplate 中的数据
  // 为了演示，我们使用硬编码的模拟数据，模拟 ServiceValidationTemplate.vue 中的 mockTemplates
  const templates = [
    {
      serviceType: '在线批量调用',
      fields: [
        { name: 'request_id', type: 'STRING', comment: '请求ID' },
        { name: 'id_no', type: 'STRING', comment: '身份证号' },
        { name: 'mobile', type: 'STRING', comment: '手机号' },
        { name: 'name', type: 'STRING', comment: '姓名' }
      ]
    },
    {
      serviceType: '外数离线回溯申请',
      fields: [
        { name: 'primary_key', type: 'STRING', comment: '业务主键' },
        { name: 'event_time', type: 'DATETIME', comment: '发生时间' }
      ]
    }
  ]
  return templates.find(t => t.serviceType === serviceType)
}

// 加载标准模板
const loadStandardTemplate = () => {
  if (!form.serviceType) {
    Message.warning('请先选择服务类型')
    return
  }
  
  const template = getTemplates(form.serviceType)
  
  if (template) {
    const existingNames = tableForm.columns.map(c => c.name)
    const newCols = template.fields.filter(c => !existingNames.includes(c.name))
    tableForm.columns = [...newCols, ...tableForm.columns]
    Message.success(`已加载【${form.serviceType}】的标准字段模板`)
  } else {
    Message.info('当前服务类型暂无标准模版')
  }
}

const handleServiceTypeChange = () => {
  // 服务类型变更时可以做一些重置或提示
}

const addColumn = () => {
  tableForm.columns.push({ name: '', type: 'STRING', comment: '' })
}

const removeColumn = (index: number) => {
  tableForm.columns.splice(index, 1)
}

const handleSubmit = () => {
  // 基础校验
  if (!form.serviceType) {
    Message.warning('请选择目标服务类型')
    return
  }
  if (!sqlForm.content) {
    Message.warning('请输入数据查询逻辑')
    return
  }
  if (!tableForm.database || !tableForm.tableName) {
    Message.warning('请填写完整的数据库和表名称')
    return
  }

  isSubmitting.value = true
  
  // 模拟提交和校验过程
  setTimeout(() => {
    isSubmitting.value = false
    
    // 执行校验逻辑
    const hasKey = tableForm.columns.some(c => ['id_no', 'primary_key', 'request_id'].includes(c.name))
    
    validationResult.pkCheck = true
    validationResult.fieldsCheck = hasKey
    validationResult.typeCheck = true
    
    // 模拟数据结果校验
    // 如果没有配置数据规则，则视为通过（或跳过）
    // 为了模拟，我们假设 '在线批量调用' 且包含 'mobile' 时有规则，其他情况无规则
    if (form.serviceType === '在线批量调用' && tableForm.columns.some(c => c.name === 'mobile')) {
      validationResult.hasDataRules = true
      // 20% 概率校验失败
      validationResult.dataCheck = Math.random() > 0.2
    } else {
      validationResult.hasDataRules = false
      validationResult.dataCheck = true // 无规则视为通过
    }

    validationResult.success = validationResult.pkCheck && validationResult.fieldsCheck && validationResult.typeCheck && validationResult.dataCheck
    
    validationVisible.value = true
  }, 1500)
}

const closeValidation = () => {
  validationVisible.value = false
}

const goToCreateService = () => {
  validationVisible.value = false
  emit('success')
  router.push({
    name: 'RiskExternalDataService',
    query: { 
      action: 'create', 
      serviceType: form.serviceType, 
      sourceTable: `${tableForm.database}.${tableForm.tableName}` 
    }
  })
}

// 暴露给父组件调用
defineExpose({
  handleSubmit,
  isSubmitting
})
</script>

<style scoped>
.drawer-content {
  padding-bottom: 20px;
}

.section-card {
  margin-bottom: 16px;
  background-color: var(--color-fill-1);
  border-radius: 4px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
