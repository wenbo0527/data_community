<template>
  <div class="register-table-form">
    <a-steps changeable :current="currentStep" @change="setCurrentStep" line-less style="margin-bottom: 30px;">
      <a-step :description="isEditMode ? '编辑数据表' : '注册数据表'">基础信息</a-step>
      <a-step description="输入管理信息">管理信息</a-step>
      <a-step description="配置数据关系">数据关系</a-step>
      <a-step description="填写使用说明">使用说明</a-step>
      <a-step :description="isEditMode ? '编辑成功' : '注册成功'">完成{{ isEditMode ? '编辑' : '注册' }}</a-step>
    </a-steps>

    <!-- 第一步：基础信息 -->
    <div v-show="currentStep === 0" class="form-step">
      <a-form
        ref="formRef1"
        :model="formData.step1"
        :rules="step1Rules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="表的中文名" field="chineseName">
              <a-input 
                v-model="formData.step1.chineseName" 
                placeholder="请输入表的中文名" 
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <h3 style="margin-top: 20px; margin-bottom: 15px;">计算集群（Hive集群）</h3>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="库名称" field="hiveDatabase">
              <a-select 
                v-model="formData.step1.hiveDatabase" 
                placeholder="请选择库名称"
                :options="hiveDatabaseOptions"
                @change="handleHiveDatabaseChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="表名称" field="hiveTable">
              <a-select 
                v-model="formData.step1.hiveTable" 
                placeholder="请选择表名称"
                :options="hiveTableOptions"
                :disabled="!formData.step1.hiveDatabase"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <h3 style="margin-top: 20px; margin-bottom: 15px;">分析集群（Doris集群）</h3>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="库名称" field="dorisDatabase">
              <a-select 
                v-model="formData.step1.dorisDatabase" 
                placeholder="请选择库名称"
                :options="dorisDatabaseOptions"
                @change="handleDorisDatabaseChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="表名称" field="dorisTable">
              <a-select 
                v-model="formData.step1.dorisTable" 
                placeholder="请选择表名称"
                :options="dorisTableOptions"
                :disabled="!formData.step1.dorisDatabase"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="表描述信息" field="description">
          <a-textarea
            v-model="formData.step1.description"
            placeholder="请输入表描述信息"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </div>

    <!-- 第二步：管理信息 -->
    <div v-show="currentStep === 1" class="form-step">
      <a-form
        ref="formRef2"
        :model="formData.step2"
        :rules="step2Rules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="业务域" field="businessDomain">
              <a-select 
                v-model="formData.step2.businessDomain" 
                placeholder="请选择业务域"
              >
                <a-option value="user">用户域</a-option>
                <a-option value="transaction">交易域</a-option>
                <a-option value="product">产品域</a-option>
                <a-option value="marketing">营销域</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="主题域" field="topicDomain">
              <a-input 
                v-model="formData.step2.topicDomain" 
                placeholder="请输入主题域" 
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="管理人" field="manager">
          <a-input 
            v-model="formData.step2.manager" 
            placeholder="请输入管理人" 
          />
        </a-form-item>
        
        <a-form-item label="表标签" field="tableTags">
          <a-select 
            v-model="formData.step2.tableTags" 
            placeholder="请选择或创建标签"
            multiple
            allow-create
            allow-clear
          >
            <a-option value="重要数据">重要数据</a-option>
            <a-option value="敏感数据">敏感数据</a-option>
            <a-option value="高价值">高价值</a-option>
            <a-option value="实时数据">实时数据</a-option>
            <a-option value="历史数据">历史数据</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>

    <!-- 第三步：数据关系配置 -->
    <div v-show="currentStep === 2" class="form-step">
      <a-form
        ref="formRef3"
        :model="formData.step3"
        :rules="step3Rules"
        layout="vertical"
      >
        <!-- 字段关联关系维护 -->
        <a-form-item label="字段关联关系">
          <RelationEditorPanel 
  :field-name="formData.step1.chineseName" 
  :initial-relations="formData.step3.fieldRelations" 
  :current-table-name="formData.step1.chineseName"
  @save-relations="updateFieldRelations" 
/>
        </a-form-item>
      </a-form>
    </div>

    <!-- 第四步：使用说明 -->
    <div v-show="currentStep === 3" class="form-step">
      <a-form
        ref="formRef4"
        :model="formData.step4"
        :rules="step4Rules"
        layout="vertical"
      >
        <a-form-item label="使用说明" field="usageInstructions">
          <a-textarea
            v-model="formData.step4.usageInstructions"
            placeholder="请输入使用说明，支持Markdown格式"
            :rows="8"
          />
        </a-form-item>
      </a-form>
    </div>

    <!-- 完成注册/编辑 -->
    <div v-show="currentStep === 4" class="form-step success-step">
      <a-result 
        status="success" 
        :title="isEditMode ? '编辑成功' : '注册成功'" 
        :subtitle="isEditMode ? '表信息已更新' : '您可以返回表管理页面查看已注册的表信息'"
      >
        <template #extra>
          <a-space>
            <a-button @click="handleBack">{{ isEditMode ? '返回列表' : '继续注册' }}</a-button>
            <a-button type="primary" @click="handleFinish">{{ isEditMode ? '查看详情' : '查看表详情' }}</a-button>
          </a-space>
        </template>
      </a-result>
    </div>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <a-button 
        v-if="currentStep > 0 && currentStep < 4" 
        @click="prevStep"
        style="margin-right: 10px;"
      >
        上一步
      </a-button>
      <a-button 
        v-if="currentStep < 3" 
        type="primary" 
        @click="nextStep"
      >
        下一步
      </a-button>
      <a-button 
        v-if="currentStep === 3" 
        type="primary" 
        @click="submitForm"
      >
        提交注册
      </a-button>
      <a-button 
        v-if="currentStep < 4" 
        @click="handleBack"
        style="margin-left: 10px;"
      >
        取消
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, type Ref } from 'vue'
import { Message, Notification } from '@arco-design/web-vue'
import { useRouter, useRoute } from 'vue-router'
import { mockTables as tableManagementData } from '../../../../mock/data-map.js'
import { hiveDatabases, dorisDatabases, hiveTables, dorisTables } from '../../../../mock/tableData.js'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import RelationEditorPanel from '../../data-map/components/RelationEditorPanel.vue'

const router = useRouter()
const route = useRoute()

// 检查是否为编辑模式
const isEditMode = computed(() => route.query.mode === 'edit')
const editingId = computed(() => route.query.id)

// 在编辑模式下加载表数据
import { onMounted } from 'vue'
onMounted(() => {
  if (isEditMode.value && editingId.value) {
    // 查找对应的表数据
    const tableData = tableManagementData.find(item => item.name === editingId.value)
    if (tableData) {
      // 将表数据映射到表单字段
      // 注意：这里的映射需要根据实际的表结构进行调整
      formData.step1.chineseName = tableData.name
      formData.step1.description = tableData.description
      formData.step2.businessDomain = tableData.domain === '用户域' ? 'user' : 
                                   tableData.domain === '贷前分析' ? 'transaction' : 
                                   tableData.domain === '产品数据' ? 'product' : 'marketing'
      formData.step2.topicDomain = tableData.domain
      formData.step2.manager = tableData.owner
      
      // 加载字段关联关系数据
      if (tableData.fieldRelations && Array.isArray(tableData.fieldRelations)) {
        formData.step3.fieldRelations = [...tableData.fieldRelations]
      }
      
      // 设置页面标题
      document.title = `编辑表 - ${tableData.name}`
    }
  }
})

// 当前步骤
const currentStep: Ref<number> = ref(0)

// 表单引用
const formRef1: Ref<any> = ref(null)
const formRef2: Ref<any> = ref(null)
const formRef3: Ref<any> = ref(null)
const formRef4: Ref<any> = ref(null)

// 表单数据
const formData = reactive({
  step1: {
    chineseName: '',
    hiveDatabase: '',
    hiveTable: '',
    dorisDatabase: '',
    dorisTable: '',
    description: ''
  },
  step2: {
    businessDomain: '',
    topicDomain: '',
    manager: '',
    tableTags: []
  },
  step3: {
    fieldRelations: [] as FieldRelation[]
  },
  step4: {
    usageInstructions: ''
  }
})

// 字段关联关系数据结构
interface RelationFieldPair {
  sourceField: string
  targetField: string
}

interface FieldRelation {
  id?: string // 唯一标识符
  fieldName: string
  targetTable: string
  relationFields: RelationFieldPair[]
  relationType?: string
  relationDescription?: string
}

// 定义Hive和Doris表的类型
interface TableMap {
  [key: string]: string[];
}

// Hive库选项
const hiveDatabaseOptions = computed(() => {
  return hiveDatabases.map((db: string) => ({
    label: db,
    value: db
  }));
});

// Doris库选项
const dorisDatabaseOptions = computed(() => {
  return dorisDatabases.map((db: string) => ({
    label: db,
    value: db
  }));
});

// Hive表选项
const hiveTableOptions = computed(() => {
  if (!formData.step1.hiveDatabase) return [];
  const tables = (hiveTables as TableMap)[formData.step1.hiveDatabase] || [];
  return tables.map((table: string) => ({
    label: table,
    value: table
  }));
});

// Doris表选项
const dorisTableOptions = computed(() => {
  if (!formData.step1.dorisDatabase) return [];
  const tables = (dorisTables as TableMap)[formData.step1.dorisDatabase] || [];
  return tables.map((table: string) => ({
    label: table,
    value: table
  }));
});

// Hive库变化处理
const handleHiveDatabaseChange = (value: string): void => {
  formData.step1.hiveTable = '';
};

// Doris库变化处理
const handleDorisDatabaseChange = (value: string): void => {
  formData.step1.dorisTable = '';
};

// 验证规则
const step1Rules: Record<string, Array<{ required: boolean; message: string }>> = {
  chineseName: [
    { required: true, message: '请输入表的中文名' }
  ],
  hiveDatabase: [
    { required: true, message: '请选择Hive库名称' }
  ],
  hiveTable: [
    { required: true, message: '请选择Hive表名称' }
  ],
  dorisDatabase: [
    { required: true, message: '请选择Doris库名称' }
  ],
  dorisTable: [
    { required: true, message: '请选择Doris表名称' }
  ]
}

const step2Rules: Record<string, Array<{ required: boolean; message: string }>> = {
  businessDomain: [
    { required: true, message: '请选择业务域' }
  ],
  topicDomain: [
    { required: true, message: '请输入主题域' }
  ],
  manager: [
    { required: true, message: '请输入管理人' }
  ]
  // tableTags 字段不是必填的，所以不添加验证规则
}

// 在表单验证时添加日志
const logStep2Validation = () => {
  console.log('步骤2表单数据:', formData.step2);
  console.log('业务域:', formData.step2.businessDomain);
  console.log('主题域:', formData.step2.topicDomain);
  console.log('管理人:', formData.step2.manager);
}

const step3Rules: Record<string, Array<{ required: boolean; message: string }>> = {}

const step4Rules: Record<string, Array<{ required: boolean; message: string }>> = {
  usageInstructions: [
    { required: true, message: '请输入使用说明' }
  ]
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const nextStep = async () => {
  let valid = false
  
  console.log('尝试进入下一步，当前步骤:', currentStep.value);
  
  // 根据当前步骤验证表单
  if (currentStep.value === 0) {
    console.log('验证步骤0表单');
    const result = await formRef1.value?.validate()
    console.log('步骤0验证结果:', result);
    valid = result === undefined || result === null;
  } else if (currentStep.value === 1) {
    console.log('验证步骤1表单');
    logStep2Validation(); // 添加日志
    const result = await formRef2.value?.validate()
    console.log('步骤1验证结果:', result);
    console.log('步骤1验证结果类型:', typeof result);
    valid = result === undefined || result === null;
  } else if (currentStep.value === 2) {
    console.log('验证步骤2表单');
    const result = await formRef3.value?.validate()
    console.log('步骤2验证结果:', result);
    valid = result === undefined || result === null;
  }
  
  // 只有验证通过才进入下一步
  if (valid) {
    console.log('验证通过，进入下一步');
    currentStep.value++
  } else {
    console.log('验证失败，不进入下一步');
    Message.warning('请检查表单填写是否正确')
  }
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef4.value?.validate()
  
  if (valid) {
    // 模拟提交数据
    console.log('提交表单数据:', formData)
    
    if (isEditMode.value) {
      // 编辑模式：更新现有数据
      const index = tableManagementData.findIndex(item => item.name === editingId.value)
      if (index !== -1) {
        // 更新数据
        tableManagementData[index] = {
          ...tableManagementData[index],
          name: formData.step1.chineseName,
          description: formData.step1.description,
          domain: formData.step2.topicDomain,
          owner: formData.step2.manager,
          fieldRelations: formData.step3.fieldRelations,
          // 保留其他字段不变
          type: tableManagementData[index].type,
          category: tableManagementData[index].category,
          updateFrequency: tableManagementData[index].updateFrequency,
          fields: tableManagementData[index].fields
        }
      }
      
      // 显示编辑成功
      Notification.success({
        title: '编辑成功',
        content: '表信息已更新'
      })
    } else {
      // 新建模式：添加新数据
      // 添加新数据
      tableManagementData.push({
        name: formData.step1.chineseName,
        type: 'fact', // 默认类型
        category: 'DWD', // 默认分类
        domain: formData.step2.topicDomain,
        updateFrequency: '每日', // 默认更新频率
        owner: formData.step2.manager,
        description: formData.step1.description,
        fieldRelations: formData.step3.fieldRelations,
        fields: [] // 默认空字段数组
      })
      
      // 显示提交成功
      Notification.success({
        title: '提交成功',
        content: '表注册信息已提交'
      })
    }
    
    // 进入完成步骤
    currentStep.value++
  }
}

// 完成注册/编辑
const handleFinish = () => {
  if (isEditMode.value) {
    // 编辑模式：跳转到表详情页面
    router.push(`/discovery/data-map/table/${encodeURIComponent(editingId.value)}`)
  } else {
    // 新建模式：返回表管理页面
    router.push('/discovery/asset-management/table-management')
  }
}

// 返回表管理页面
const handleBack = () => {
  if (isEditMode.value) {
    // 编辑模式下返回表管理列表
    router.push('/discovery/asset-management/table-management')
  } else {
    // 新建模式下返回上一页
    router.go(-1)
  }
}

// 查看表详情
const handleViewTable = () => {
  // 跳转到表详情页面
  Message.info('查看表详情功能待实现')
}

// 设置当前步骤
const setCurrentStep = (step: number) => {
  currentStep.value = step
}

// 字段关联关系相关数据和方法
const relationEditorVisible = ref(false)
const currentEditingField = ref('')
const currentFieldRelations = ref<FieldRelation[]>([])
const editingRowIndex = ref(-1)
const originalRelation = ref<FieldRelation | null>(null)
const fieldRelations = computed(() => formData.step3.fieldRelations as FieldRelation[])

const addNewRelation = () => {
  // 添加一个空的关联关系对象
  fieldRelations.value.push({
    id: Date.now().toString(), // 生成唯一标识符
    fieldName: '',
    targetTable: '',
    relationFields: [{ sourceField: '', targetField: '' }],
    relationType: '字段关联'
  })
  // 设置为编辑模式，编辑新添加的行
  editingRowIndex.value = fieldRelations.value.length - 1
}

const editRelation = (index: number) => {
  // 保存原始数据以便取消时恢复
  originalRelation.value = JSON.parse(JSON.stringify(fieldRelations.value[index]))
  editingRowIndex.value = index
  
  // 如果当前字段没有关联关系，则初始化一个空的关系
  if (!formData.step3.fieldRelations[index]) {
    formData.step3.fieldRelations[index] = {
      id: Date.now().toString(),
      fieldName: formData.step1.chineseName || '',
      targetTable: '',
      relationFields: [{ sourceField: '', targetField: '' }],
      relationType: '字段关联'
    }
  }
}

const saveRelation = (index: number) => {
  // 获取当前编辑的关联关系
  const relation = fieldRelations.value[index]
  
  // 如果是新增的关联关系且字段名为空，设置为当前表名
  if (!relation.fieldName && formData.step1.chineseName) {
    relation.fieldName = formData.step1.chineseName
  }
  
  // 验证必填字段
  if (!relation.fieldName || !relation.targetTable) {
    Message.warning('请填写所有必填字段')
    return
  }
  
  if (relation.relationFields.some((pair: { sourceField: string; targetField: string }) => !pair.sourceField || !pair.targetField)) {
    Message.warning('请填写所有字段对的源字段和目标字段')
    return
  }
  
  // 退出编辑模式
  editingRowIndex.value = -1
  originalRelation.value = null
}

const cancelEdit = () => {
  // 如果是新增的行（字段名为空），则删除该行
  if (editingRowIndex.value >= 0) {
    const index = editingRowIndex.value
    if (!fieldRelations.value[index].fieldName) {
      fieldRelations.value.splice(index, 1)
      // 如果删除的行在编辑行之前，需要调整编辑行索引
      if (index < fieldRelations.value.length) {
        editingRowIndex.value = -1
      }
    } else if (originalRelation.value) {
      // 恢复原始数据
      fieldRelations.value[index] = { ...originalRelation.value }
      originalRelation.value = null
    }
  }
  editingRowIndex.value = -1
}

const deleteRelation = (index: number) => {
  formData.step3.fieldRelations.splice(index, 1)
  // 如果删除的行在编辑行之前，需要调整编辑行索引
  if (editingRowIndex.value > index) {
    editingRowIndex.value--
  } else if (editingRowIndex.value === index) {
    editingRowIndex.value = -1
  }
}

// 更新字段关联关系
const updateFieldRelations = (relations: FieldRelation[]) => {
  // 确保每个关系都有fieldName字段，并支持一个字段对应多条关联关系
  const relationsWithFieldName = relations.map(relation => ({
    ...relation,
    fieldName: relation.fieldName || formData.step1.chineseName
  }));
  formData.step3.fieldRelations = relationsWithFieldName;
}

// 废弃的方法
// const showRelationEditor = (fieldName) => {
//   currentFieldName.value = fieldName
//   currentFieldRelations.value = fieldRelations.value.filter(rel => rel.fieldName === fieldName)
//   relationEditorVisible.value = true
// }

// const saveRelations = (relations) => {
//   // 移除该字段的所有现有关系
//   fieldRelations.value = fieldRelations.value.filter(rel => rel.fieldName !== currentFieldName.value)
//   
//   // 添加新关系
//   fieldRelations.value.push(...relations)
//   
//   relationEditorVisible.value = false
// }
</script>

<style scoped>
.register-table-form {
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-step {
  min-height: 300px;
}

.success-step {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e5e6eb;
}

.blue-text {
  color: #1890ff;
}
.relation-header-container {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

.relation-title {
  font-weight: bold;
  font-size: 16px;
  display: block !important;
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

.relation-action {
  text-align: right;
  display: block !important;
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

</style>