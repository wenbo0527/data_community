<template>
  <div class="audience-create">
    <!-- 面包屑导航 -->
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item>
        <router-link to="/exploration/customer-center">客户中心</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/exploration/customer-center/audience-system/audience-management">人群管理</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>{{ getPageTitle() }}</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">{{ getPageTitle() }}</h2>
        <p class="page-description">{{ getPageDescription() }}</p>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="content-section">
      <a-card class="form-card">
        <template #title>
          <span class="card-title">基本信息</span>
        </template>
        <a-form :model="audienceForm.basic" layout="vertical" class="basic-form">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="人群名称" required>
                <a-input v-model="audienceForm.basic.name" placeholder="请输入人群名称" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="人群类型" required>
                <a-select v-model="audienceForm.basic.audienceType" placeholder="请选择人群类型">
                  <a-option value="static">静态人群</a-option>
                  <a-option value="dynamic">动态人群</a-option>
                  <a-option value="computed">计算人群</a-option>
                  <a-option value="rule">规则人群</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="共享级别" required>
                <a-select v-model="audienceForm.basic.shareLevel" placeholder="请选择共享级别">
                  <a-option value="public">公开</a-option>
                  <a-option value="private">私有</a-option>
                  <a-option value="team">团队</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="更新频率">
                <a-select v-model="audienceForm.basic.updateFrequency" placeholder="请选择更新频率">
                  <a-option value="realtime">实时</a-option>
                  <a-option value="daily">每日</a-option>
                  <a-option value="weekly">每周</a-option>
                  <a-option value="monthly">每月</a-option>
                  <a-option value="manual">手动</a-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="有效期">
                <a-date-picker 
                  v-model="audienceForm.basic.expireDate" 
                  placeholder="请选择有效期"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="人群描述">
            <a-textarea 
              v-model="audienceForm.basic.description" 
              placeholder="请输入人群描述"
              :rows="4"
            />
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 规则配置 -->
    <div class="content-section" v-if="createMode === 'rule'">
      <a-card class="form-card">
        <template #title>
          <span class="card-title">人群圈选规则</span>
        </template>
        <template #extra>
          <span class="card-hint">使用下方工具配置人群圈选规则</span>
        </template>
        <div class="rules-config-section">
          <CDPRuleBuilderForm
            v-model="audienceForm.cdpRule"
          />
        </div>
      </a-card>
    </div>

    <!-- 数据导入 -->
    <div class="content-section" v-if="createMode === 'import'">
      <a-card class="form-card">
        <template #title>
          <span class="card-title">数据导入配置</span>
        </template>
        <template #extra>
          <span class="card-description">通过文件上传、数据库导入或API接口导入人群数据</span>
        </template>
        <div class="import-config-section">
          <a-form :model="audienceForm.import" layout="vertical">
            <a-form-item label="导入方式">
              <a-radio-group v-model="audienceForm.import.method">
                <a-radio value="file">文件上传</a-radio>
                <a-radio value="database">数据库导入</a-radio>
                <a-radio value="api">API接口</a-radio>
              </a-radio-group>
            </a-form-item>
            
            <!-- 文件上传 -->
            <div v-if="audienceForm.import.method === 'file'">
              <a-form-item label="上传文件">
                <a-upload
                  :file-list="audienceForm.import.fileList"
                  :show-file-list="true"
                  :auto-upload="false"
                  accept=".csv,.xlsx,.json"
                  @change="handleFileChange"
                >
                  <template #upload-button>
                    <div class="upload-area">
                      <IconUpload style="font-size: 48px; color: #c9cdd4;" />
                      <div style="margin-top: 8px;">点击或拖拽文件到此处上传</div>
                      <div style="color: #86909c; font-size: 12px; margin-top: 4px;">支持 CSV、Excel、JSON 格式</div>
                    </div>
                  </template>
                </a-upload>
              </a-form-item>
            </div>
          </a-form>
        </div>
      </a-card>
    </div>

    <!-- 预览结果区域 -->
    <div v-if="showPreviewResult" class="preview-result-section">
      <a-card>
        <div class="preview-result-header">
          <h3>预计算结果</h3>
          <p class="section-description">根据当前配置的规则预计算出的人群规模和统计信息</p>
        </div>
        
        <div class="preview-result-content">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-statistic title="预估人群规模" :value="previewStats.totalCount" suffix="人" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="规则条件数" :value="previewStats.ruleCount" suffix="个" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="数据覆盖率" :value="previewStats.coverage" suffix="%" :precision="2" />
            </a-col>
            <a-col :span="6">
              <a-statistic title="预计执行时间" :value="previewStats.estimatedTime" suffix="分钟" />
            </a-col>
          </a-row>
        </div>
      </a-card>
    </div>

    <!-- 页面底部按钮 -->
    <div class="page-footer">
      <a-space>
        <a-button @click="goBack">取消</a-button>
        <a-button 
          v-if="!showPreviewResult" 
          type="primary" 
          @click="preCalculate" 
          :loading="preCalculating"
          :disabled="!canPreCalculate"
        >
          预计算
        </a-button>
        <a-button 
          v-if="showPreviewResult" 
          type="primary" 
          @click="saveAudience" 
          :loading="saving"
        >
          {{ isEditMode ? '保存' : '创建' }}
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUpload } from '@arco-design/web-vue/es/icon'
import CDPRuleBuilderForm from '@/components/task/CDPRuleBuilderForm.vue'

const router = useRouter()
const route = useRoute()

// 获取创建模式和编辑状态
const createMode = ref(route.query.mode as string || 'rule') // rule | import
const isEditMode = ref(!!route.params.id)
const saving = ref(false)
const preCalculating = ref(false)
const showPreviewResult = ref(false)

// 人群表单数据
const audienceForm = reactive({
  basic: {
    name: '',
    audienceType: 'rule',
    shareLevel: 'public',
    updateFrequency: 'daily',
    expireDate: null,
    description: ''
  },
  cdpRule: {
    ruleGroups: [],
    excludeGroups: [],
    crossGroupOperator: 'AND',
  },
  import: {
    method: 'file',
    fileList: [] as any[]
  }
})

// 预览统计数据
const previewStats = reactive({
  totalCount: 0,
  ruleCount: 0,
  coverage: 0,
  estimatedTime: 0
})

// 页面标题和描述
const getPageTitle = () => {
  if (isEditMode.value) {
    return '编辑人群'
  }
  return createMode.value === 'rule' ? '自定义规则创建人群' : '数据导入创建人群'
}

const getPageDescription = () => {
  if (isEditMode.value) {
    return '修改人群配置信息'
  }
  return createMode.value === 'rule' 
    ? '通过配置条件规则来定义人群范围，支持标签、事件、明细数据三种类型'
    : '通过文件上传、数据库导入或API接口导入人群数据'
}

// 计算属性：是否可以进行预计算
const canPreCalculate = computed(() => {
  // 基本信息必须填写完整
  if (!audienceForm.basic.name || !audienceForm.basic.audienceType) {
    return false
  }
  
  // 规则创建模式需要至少一个条件组
  if (createMode.value === 'rule' && audienceForm.cdpRule.ruleGroups.length === 0) {
    return false
  }
  
  // 导入模式需要上传文件
  if (createMode.value === 'import' && audienceForm.import.method === 'file' && audienceForm.import.fileList.length === 0) {
    return false
  }
  
  return true
})


// 文件上传处理
const handleFileChange = (fileList: any[]) => {
  audienceForm.import.fileList = fileList
}

// 预计算
const preCalculate = async () => {
  preCalculating.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新预览统计
    previewStats.totalCount = Math.floor(Math.random() * 100000) + 10000
    previewStats.ruleCount = audienceForm.cdpRule.ruleGroups.length
    previewStats.coverage = Math.floor(Math.random() * 30) + 70
    previewStats.estimatedTime = Math.floor(Math.random() * 10) + 1
    
    // 显示预览结果
    showPreviewResult.value = true
    
    Message.success('预计算完成')
  } catch (error) {
    Message.error('预计算失败')
  } finally {
    preCalculating.value = false
  }
}



// 保存人群
const saveAudience = async () => {
  // 基本信息校验
  if (!audienceForm.basic.name) {
    Message.warning('请填写人群名称')
    return
  }
  
  saving.value = true
  try {
    // 生成人群ID（如果是新建模式）
    const audienceId = isEditMode.value ? route.params.id : `AUD_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // 构建完整的人群数据
    const audienceData = {
      id: audienceId,
      ...audienceForm.basic,
      createMode: createMode.value,
      // 规则模式：直接使用 cdpRule；导入模式：使用 importConfig
      ...(createMode.value === 'rule' ? { cdpRule: audienceForm.cdpRule } : { importConfig: audienceForm.import }),
      createUser: '当前用户',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      status: 'active'
    }
    
    console.log('保存人群数据:', audienceData)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    Message.success(isEditMode.value ? '人群更新成功' : '人群创建成功')
    
    // 返回人群管理页面
    goBack()
  } catch (error) {
    Message.error(isEditMode.value ? '人群更新失败' : '人群创建失败')
  } finally {
    saving.value = false
  }
}

// 返回人群管理页面
const goBack = () => {
  router.push({ name: 'audience-management' })
}
</script>

<style scoped>
/* 页面容器 */
.audience-create {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.card-hint {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

.breadcrumb {
  margin-bottom: 20px;
}

.breadcrumb :deep(.arco-breadcrumb-item-link) {
  color: #165dff;
  text-decoration: none;
}

.breadcrumb :deep(.arco-breadcrumb-item-link:hover) {
  text-decoration: underline;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.breadcrumb {
  margin-bottom: 12px;
}

.breadcrumb :deep(.arco-breadcrumb-item-link) {
  color: #165dff;
  cursor: pointer;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.header-actions {
  flex-shrink: 0;
}

/* 内容区域 */
.content-section {
  margin-bottom: 20px;
}

.form-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.basic-form {
  padding: 20px;
}

/* 规则配置区域 */
.rules-config-section {
  padding: 20px;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.section-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

/* 导入配置区域 */
.import-config-section {
  padding: 20px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #c9cdd4;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #165dff;
  background: #f0f5ff;
}

/* 预览区域 */
.preview-section {
  padding: 20px;
}

.preview-stats {
  margin: 24px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e6eb;
}

/* 卡片标题样式 */
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.card-description {
  font-size: 14px;
  color: #86909c;
  margin-left: 8px;
}

.form-card {
  margin-bottom: 20px;
}

/* 统计卡片样式 */
.preview-stats :deep(.arco-statistic) {
  text-align: center;
}

.preview-stats :deep(.arco-statistic-title) {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 8px;
}

.preview-stats :deep(.arco-statistic-value) {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .audience-create {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .basic-form,
  .rules-config-section,
  .import-config-section,
  .preview-section {
    padding: 16px;
  }
  
  .preview-stats {
    padding: 16px;
  }
  
  .upload-area {
    padding: 30px 15px;
  }
}

/* 预览结果区域 */
.preview-result-section {
  margin-top: 20px;
}

.preview-result-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.preview-result-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.preview-result-content {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 页面底部按钮 */
.page-footer {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
}
</style>
