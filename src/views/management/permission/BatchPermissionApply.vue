<template>
  <div class="batch-permission-apply">
    <a-card title="批量权限申请" class="batch-apply-card">
      <template #extra>
        <a-space>
          <a-button @click="showHelp = true">
            使用帮助
          </a-button>
          <a-button @click="goBack">
            返回
          </a-button>
        </a-space>
      </template>

      <!-- 步骤条 -->
      <a-steps :current="currentStep" class="apply-steps">
        <a-step title="选择资源" description="批量选择需要申请权限的资源" />
        <a-step title="配置策略" description="设置申请策略和参数" />
        <a-step title="冲突检测" description="检测并处理申请冲突" />
        <a-step title="预览提交" description="预览申请清单并提交" />
      </a-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 第一步：选择资源 -->
        <div v-if="currentStep === 0" class="step-panel">
          <batch-resource-selector
            v-model="selectedResources"
            :available-resources="availableResources"
            @file-import="handleFileImport"
            @resource-add="handleResourceAdd"
          />
        </div>

        <!-- 第二步：配置策略 -->
        <div v-if="currentStep === 1" class="step-panel">
          <batch-strategy-config
            v-model="strategyConfig"
            :resources="selectedResources"
            @template-saved="handleTemplateSaved"
          />
        </div>

        <!-- 第三步：冲突检测 -->
        <div v-if="currentStep === 2" class="step-panel">
          <conflict-detection
            :resources="selectedResources"
            :existing-permissions="existingPermissions"
            @conflict-detected="handleConflictDetected"
            @conflict-resolved="handleConflictResolved"
            @conflict-ignored="handleConflictIgnored"
          />
        </div>

        <!-- 第四步：预览提交 -->
        <div v-if="currentStep === 3" class="step-panel">
          <div class="preview-info">
            <a-alert
              :message="`共选择 ${selectedResources.length} 个资源，预计总审批时间：${totalEstimatedTime}`"
              type="info"
              show-icon
              class="preview-summary"
            />
          </div>
        </div>

        <!-- 提交成功 -->
        <div v-if="currentStep === 4" class="step-panel success-panel">
          <a-result
            status="success"
            title="批量申请提交成功！"
            :sub-title="`申请编号：${applicationNumber}，共 ${selectedResources.length} 个资源，预计${totalEstimatedTime}内完成审批`"
          >
            <template #extra>
              <a-space>
                <a-button type="primary" @click="handleContinueApply">
                  继续申请
                </a-button>
                <a-button @click="goToProgress">
                  查看进度
                </a-button>
                <a-button @click="goBack">
                  返回列表
                </a-button>
              </a-space>
            </template>
          </a-result>
        </div>
      </div>

      <!-- 步骤操作按钮 -->
      <div class="step-actions" v-if="currentStep < 4">
        <a-space>
          <a-button
            v-if="currentStep > 0"
            @click="currentStep--"
          >
            上一步
          </a-button>
          <a-button
            v-if="currentStep < 3"
            type="primary"
            @click="handleNextStep"
            :disabled="!canProceedToNextStep()"
          >
            下一步
          </a-button>
          <a-button
            v-if="currentStep === 3"
            type="primary"
            @click="handleSubmit"
            :loading="submitting"
            :disabled="hasUnresolvedConflicts"
          >
            提交申请
          </a-button>
        </a-space>
      </div>
    </a-card>

    <!-- 使用帮助弹窗 -->
    <a-modal
      v-model:visible="showHelp"
      title="批量权限申请使用帮助"
      :footer="null"
      width="80%"
    >
      <div class="help-content">
        <h3>使用流程</h3>
        <ol>
          <li><strong>选择资源</strong> - 通过文件导入、手动添加或系统推荐选择多个资源</li>
          <li><strong>配置策略</strong> - 统一设置权限类型、申请期限、申请理由等参数</li>
          <li><strong>冲突检测</strong> - 系统自动检测重复申请、已有权限等冲突</li>
          <li><strong>预览提交</strong> - 预览申请清单，确认无误后提交申请</li>
        </ol>
        
        <h3>文件导入说明</h3>
        <p>支持 Excel (.xlsx, .xls) 和 CSV 格式，文件大小不超过 10MB。</p>
        <p>文件必须包含以下列：</p>
        <ul>
          <li>资源名称（必填）</li>
          <li>资源类型（必填：table, metric, variable, external_data, collection, service）</li>
          <li>数据库类型（可选）</li>
          <li>业务模块（可选）</li>
          <li>敏感等级（可选：normal, sensitive, core）</li>
          <li>业务术语（可选，多个用逗号分隔）</li>
          <li>描述（可选）</li>
        </ul>
        
        <h3>冲突处理</h3>
        <ul>
          <li><strong>重复申请</strong> - 同一资源被多次申请，系统会自动去重</li>
          <li><strong>已有权限</strong> - 您已拥有该资源的权限，无需重复申请</li>
          <li><strong>权限冲突</strong> - 申请的权限与已有权限存在冲突</li>
        </ul>
        
        <h3>审批流程</h3>
        <p>系统会根据资源的敏感等级自动确定审批级别：</p>
        <ul>
          <li><strong>普通资源</strong> - 一级审批（直属上级）</li>
          <li><strong>敏感资源</strong> - 二级审批（直属上级→数据管理员）</li>
          <li><strong>核心资源</strong> - 三级审批（直属上级→业务负责人→数据管理员）</li>
          <li><strong>服务资源</strong> - 双审批（直属上级→技术负责人）</li>
        </ul>
      </div>
    </a-modal>

    <!-- 批量预览弹窗 -->
    <batch-preview-modal
      v-model:visible="showPreviewModal"
      :resources="selectedResources"
      :strategy="strategyConfig"
      @submit="handlePreviewSubmit"
      @cancel="showPreviewModal = false"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import BatchResourceSelector from './components/BatchResourceSelector.vue';
import BatchStrategyConfig from './components/BatchStrategyConfig.vue';
import ConflictDetection from './components/ConflictDetection.vue';
import BatchPreviewModal from './components/BatchPreviewModal.vue';
import { generateApplicationNumber } from './utils';

export default {
  name: 'BatchPermissionApply',
  components: {
    BatchResourceSelector,
    BatchStrategyConfig,
    ConflictDetection,
    BatchPreviewModal
  },
  setup() {
    const router = useRouter();
    
    const currentStep = ref(0);
    const selectedResources = ref([]);
    const strategyConfig = ref({
      permissionTypes: ['view'],
      duration: 'permanent',
      expireDate: null,
      reason: '',
      groupConfig: 'unified',
      urgency: 'normal',
      priority: 3
    });
    const submitting = ref(false);
    const applicationNumber = ref('');
    const showHelp = ref(false);
    const showPreviewModal = ref(false);
    
    // 冲突相关
    const conflicts = ref([]);
    const hasUnresolvedConflicts = ref(false);
    
    // 资源数据
    const availableResources = ref([]);
    const existingPermissions = ref([]);

    // 模拟资源数据
    const mockResources = [
      {
        id: '1',
        name: '用户行为数据表',
        type: 'table',
        databaseType: 'MySQL',
        businessModule: '用户分析',
        sensitivityLevel: 'normal',
        businessTerms: ['用户行为', '数据分析'],
        description: '记录用户在平台上的行为数据'
      },
      {
        id: '2',
        name: '订单统计指标',
        type: 'metric',
        databaseType: 'ClickHouse',
        businessModule: '电商业务',
        sensitivityLevel: 'sensitive',
        businessTerms: ['订单', '统计'],
        description: '订单相关的核心统计指标'
      },
      {
        id: '3',
        name: '客户信息表',
        type: 'table',
        databaseType: 'PostgreSQL',
        businessModule: '客户管理',
        sensitivityLevel: 'core',
        businessTerms: ['客户', '个人信息'],
        description: '客户基本信息表'
      },
      {
        id: '4',
        name: 'API调用服务',
        type: 'service',
        databaseType: 'REST API',
        businessModule: '系统服务',
        sensitivityLevel: 'normal',
        businessTerms: ['API', '服务调用'],
        description: '提供数据查询和处理的API服务接口'
      }
    ];

    // 模拟已有权限
    const mockExistingPermissions = [
      {
        resourceId: '1',
        permissionType: 'view',
        grantedAt: Date.now() - 30 * 24 * 60 * 60 * 1000
      }
    ];

    // 计算属性
    const totalEstimatedTime = computed(() => {
      if (selectedResources.value.length === 0) return '1-2个工作日';
      
      const hasSensitive = selectedResources.value.some(r => 
        r.sensitivityLevel === 'sensitive' || r.sensitivityLevel === 'core'
      );
      const hasService = selectedResources.value.some(r => r.type === 'service');
      
      if (hasService) return '2-3个工作日';
      if (hasSensitive) return '2-3个工作日';
      return '1-2个工作日';
    });

    // 处理方法
    const handleNextStep = () => {
      if (currentStep.value === 0 && selectedResources.value.length === 0) {
        Message.warning('请先选择资源');
        return;
      }
      
      if (currentStep.value === 1) {
        if (!strategyConfig.value.reason || strategyConfig.value.reason.trim().length < 10) {
          Message.warning('请填写申请理由，至少10个字符');
          return;
        }
      }
      
      if (currentStep.value === 2) {
        // 检查是否有未解决的冲突
        if (hasUnresolvedConflicts.value) {
          Message.warning('请先处理所有冲突');
          return;
        }
      }
      
      if (currentStep.value === 3) {
        // 显示预览弹窗
        showPreviewModal.value = true;
        return;
      }
      
      currentStep.value++;
    };

    const handleSubmit = async () => {
      submitting.value = true;
      try {
        // 模拟提交申请
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        applicationNumber.value = generateApplicationNumber();
        currentStep.value = 4;
        
        Message.success(`批量申请提交成功！申请编号：${applicationNumber.value}`);
      } catch (error) {
        Message.error('提交申请失败');
        console.error('提交申请失败:', error);
      } finally {
        submitting.value = false;
      }
    };

    const handlePreviewSubmit = (data) => {
      showPreviewModal.value = false;
      handleSubmit();
    };

    const canProceedToNextStep = () => {
      switch (currentStep.value) {
        case 0:
          return selectedResources.value.length > 0;
        case 1:
          return strategyConfig.value.reason && strategyConfig.value.reason.trim().length >= 10;
        case 2:
          return !hasUnresolvedConflicts.value;
        case 3:
          return true;
        default:
          return false;
      }
    };

    const handleFileImport = (data) => {
      Message.success(`成功导入 ${data.length} 个资源`);
    };

    const handleResourceAdd = (resource) => {
      // 资源添加处理
    };

    const handleTemplateSaved = (template) => {
      Message.success(`模板 "${template.name}" 保存成功`);
    };

    const handleConflictDetected = (detectedConflicts) => {
      conflicts.value = detectedConflicts;
      hasUnresolvedConflicts.value = detectedConflicts.length > 0;
    };

    const handleConflictResolved = (data) => {
      // 处理冲突解决
      if (data.action === 'remove_resource') {
        // 从选择的资源中移除
        selectedResources.value = selectedResources.value.filter(
          r => !data.updatedResources || data.updatedResources.some(ur => ur.id === r.id)
        );
      }
      
      // 重新检查是否还有未解决的冲突
      hasUnresolvedConflicts.value = conflicts.value.length > 0;
    };

    const handleConflictIgnored = (conflict) => {
      // 处理冲突忽略
      Message.info(`已忽略冲突：${conflict.resourceName}`);
    };

    const handleContinueApply = () => {
      // 重置表单，继续申请
      currentStep.value = 0;
      selectedResources.value = [];
      strategyConfig.value = {
        permissionTypes: ['view'],
        duration: 'permanent',
        expireDate: null,
        reason: '',
        groupConfig: 'unified',
        urgency: 'normal',
        priority: 3
      };
      conflicts.value = [];
      hasUnresolvedConflicts.value = false;
    };

    const goToProgress = () => {
      // 未实现进度页面，保持在当前模块并提示
      Message.info('申请已提交，进度可在当前页面查看最近申请');
      router.push('/management/permission');
    };

    const goBack = () => {
      router.push('/management/permission');
    };

    // 初始化
    onMounted(() => {
      availableResources.value = mockResources;
      existingPermissions.value = mockExistingPermissions;
    });

    return {
      currentStep,
      selectedResources,
      strategyConfig,
      submitting,
      applicationNumber,
      showHelp,
      showPreviewModal,
      conflicts,
      hasUnresolvedConflicts,
      availableResources,
      existingPermissions,
      totalEstimatedTime,
      handleNextStep,
      handleSubmit,
      handlePreviewSubmit,
      canProceedToNextStep,
      handleFileImport,
      handleResourceAdd,
      handleTemplateSaved,
      handleConflictDetected,
      handleConflictResolved,
      handleConflictIgnored,
      handleContinueApply,
      goToProgress,
      goBack
    };
  }
};
</script>

<style lang="less" scoped>
.batch-permission-apply {
  padding: 24px;
  background: #f5f6fa;
  min-height: 100vh;
}

.batch-apply-card {
  margin: 0 auto;
  max-width: 1200px;
}

.apply-steps {
  margin-bottom: 32px;
}

.step-content {
  min-height: 600px;
}

.step-panel {
  padding: 24px 0;
}

.success-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.preview-info {
  margin-bottom: 24px;
}

.preview-summary {
  margin-bottom: 16px;
}

.step-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.help-content {
  padding: 24px;
  
  h3 {
    margin-bottom: 16px;
    color: #262626;
  }
  
  h4 {
    margin: 16px 0 8px 0;
    color: #595959;
  }
  
  ol, ul {
    margin-bottom: 16px;
    padding-left: 24px;
  }
  
  li {
    margin-bottom: 8px;
    line-height: 1.6;
  }
  
  p {
    margin-bottom: 12px;
    line-height: 1.6;
  }
  
  strong {
    color: #1890ff;
  }
}
</style>
