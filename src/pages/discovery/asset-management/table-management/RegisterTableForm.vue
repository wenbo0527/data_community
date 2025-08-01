<template>
  <div class="register-table-form">
    <a-steps changeable :current="currentStep" @change="setCurrentStep" line-less style="margin-bottom: 30px;">
      <a-step description="注册数据表">基础信息</a-step>
      <a-step description="输入管理信息">管理信息</a-step>
      <a-step description="填写使用说明">使用说明</a-step>
      <a-step description="注册成功">完成注册</a-step>
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

    <!-- 第三步：使用说明 -->
    <div v-show="currentStep === 2" class="form-step">
      <a-form
        ref="formRef3"
        :model="formData.step3"
        :rules="step3Rules"
        layout="vertical"
      >
        <a-form-item label="使用说明" field="usageInstructions">
          <a-textarea
            v-model="formData.step3.usageInstructions"
            placeholder="请输入使用说明，支持Markdown格式"
            :rows="8"
          />
        </a-form-item>
      </a-form>
    </div>

    <!-- 第四步：完成注册 -->
    <div v-show="currentStep === 3" class="form-step success-step">
      <a-result 
        status="success" 
        title="表注册成功" 
        subtitle="您已成功注册数据表，可以继续其他操作"
      >
        <template #extra>
          <a-space>
            <a-button type="primary" @click="handleFinish">完成</a-button>
            <a-button @click="handleViewTable">查看表详情</a-button>
            <a-button @click="handleBack">返回表管理</a-button>
          </a-space>
        </template>
      </a-result>
    </div>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <a-button 
        v-if="currentStep > 0 && currentStep < 3" 
        @click="prevStep"
        style="margin-right: 10px;"
      >
        上一步
      </a-button>
      <a-button 
        v-if="currentStep < 2" 
        type="primary" 
        @click="nextStep"
      >
        下一步
      </a-button>
      <a-button 
        v-if="currentStep === 2" 
        type="primary" 
        @click="submitForm"
      >
        提交注册
      </a-button>
      <a-button 
        v-if="currentStep < 3" 
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
import { useRouter } from 'vue-router'
import { hiveDatabases, dorisDatabases, hiveTables, dorisTables } from '../../../../mock/tableData.js'

const router = useRouter()

// 当前步骤
const currentStep: Ref<number> = ref(0)

// 表单引用
const formRef1: Ref<any> = ref(null)
const formRef2: Ref<any> = ref(null)
const formRef3: Ref<any> = ref(null)

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
    usageInstructions: ''
  }
})

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
  const tables = hiveTables[formData.step1.hiveDatabase] || [];
  return tables.map((table: string) => ({
    label: table,
    value: table
  }));
});

// Doris表选项
const dorisTableOptions = computed(() => {
  if (!formData.step1.dorisDatabase) return [];
  const tables = dorisTables[formData.step1.dorisDatabase] || [];
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

const step3Rules: Record<string, Array<{ required: boolean; message: string }>> = {
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
  
  // 根据当前步骤验证表单
  if (currentStep.value === 0) {
    valid = await formRef1.value?.validate()
  } else if (currentStep.value === 1) {
    valid = await formRef2.value?.validate()
  }
  
  if (valid) {
    currentStep.value++
  }
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef3.value?.validate()
  
  if (valid) {
    // 模拟提交数据
    console.log('提交表单数据:', formData)
    
    // 显示提交成功
    Notification.success({
      title: '提交成功',
      content: '表注册信息已提交'
    })
    
    // 进入完成步骤
    currentStep.value++
  }
}

// 完成注册
const handleFinish = () => {
  // 返回表管理页面
  router.push('/discovery/asset-management/table-management')
}

// 返回表管理页面
const handleBack = () => {
  router.go(-1)
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
</style>