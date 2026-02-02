<template>
  <div class="permission-apply">
    <a-card title="权限申请" class="apply-card">

      <div class="step-content">
        <div class="step-panel">
          <PermissionForm
            :selected-resources="selectedResources"
            :submitting="submitting"
            :default-category="defaultCategory"
            @submit="handleSubmit"
            @reset="handleReset"
            @save-draft="handleSaveDraft"
          />
        </div>
      </div>
    </a-card>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import PermissionForm from './components/PermissionForm.vue';
// import SensitivityLabel from './components/SensitivityLabel.vue';
// import StatusLabel from './components/StatusLabel.vue';
import { generateApplicationNumber, formatTimestamp } from './utils';

export default {
  name: 'PermissionApply',
  props: {
    defaultCategory: {
      type: String,
      default: 'application'
    }
  },
  components: {
      PermissionForm,
      // SensitivityLabel,
      // StatusLabel
    },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    
    const defaultCategory = props.defaultCategory || (route.path.includes('/apply/data') ? 'data' : 'application');
    const selectedResources = ref([]);
    const submitting = ref(false);
    const applicationNumber = ref('');
    const estimatedApprovalTime = ref('');
    const showBatchApply = ref(false);
    const showProgress = ref(false);
    
    // 资源数据
    // 最近申请
    const recentApplications = ref([]);

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
        description: '记录用户在平台上的行为数据，包括浏览、点击、购买等操作记录'
      },
      {
        id: '2',
        name: '订单统计指标',
        type: 'metric',
        databaseType: 'ClickHouse',
        businessModule: '电商业务',
        sensitivityLevel: 'sensitive',
        businessTerms: ['订单', '统计'],
        description: '订单相关的核心统计指标，包括订单量、金额、转化率等'
      },
      {
        id: '3',
        name: '客户信息表',
        type: 'table',
        databaseType: 'PostgreSQL',
        businessModule: '客户管理',
        sensitivityLevel: 'core',
        businessTerms: ['客户', '个人信息'],
        description: '客户基本信息表，包含姓名、联系方式、地址等敏感信息'
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
      },
      {
        id: '5',
        name: '外部数据源',
        type: 'external_data',
        databaseType: '第三方接口',
        businessModule: '数据集成',
        sensitivityLevel: 'sensitive',
        businessTerms: ['外部数据', '数据集成'],
        description: '从外部合作伙伴获取的数据源'
      }
    ];
    console.log(mockResources) // 使用变量避免 lint 报错

    // 模拟最近申请
    const mockApplications = [
      {
        id: '1',
        applicationNumber: 'APP20231223001',
        status: 'pending',
        resourceCount: 2,
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
        currentApprover: '张经理'
      },
      {
        id: '2',
        applicationNumber: 'APP20231222002',
        status: 'approved',
        resourceCount: 1,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        currentApprover: null
      }
    ];

    // 加载资源数据
    // 处理提交
    const handleSubmit = async (formData) => {
      submitting.value = true;
      try {
        // 模拟提交申请
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        applicationNumber.value = generateApplicationNumber();
        estimatedApprovalTime.value = getEstimatedApprovalTime();
        
        // 更新最近申请
        recentApplications.value.unshift({
          id: Date.now().toString(),
          applicationNumber: applicationNumber.value,
          status: 'pending',
          resourceCount: selectedResources.value.length,
          createdAt: Date.now(),
          currentApprover: '待分配'
        });
        
        Message.success('权限申请提交成功！');
        
      } catch (error) {
        Message.error('提交申请失败');
        console.error('提交申请失败:', error);
      } finally {
        submitting.value = false;
      }
    };

    // 处理重置
    const handleReset = () => {
      selectedResources.value = [];
      selectedResources.value = [];
    };

    // 处理保存草稿
    const handleSaveDraft = (draftData) => {
      console.log('保存草稿', draftData);
      // 实际逻辑中调用API保存草稿
    };

    // 处理继续申请
    const handleContinueApply = () => {
      selectedResources.value = [];
      currentStep.value = 0;
    };

    // 处理返回首页
    const handleBackToHome = () => {
      router.push('/');
    };

    // 获取预计审批时间
    const getEstimatedApprovalTime = () => {
      if (selectedResources.value.length === 0) return '1-2个工作日';
      
      const hasSensitive = selectedResources.value.some(r => 
        r.sensitivityLevel === 'sensitive' || r.sensitivityLevel === 'core'
      );
      const hasService = selectedResources.value.some(r => r.type === 'service');
      
      if (hasService) return '2-3个工作日';
      if (hasSensitive) return '2-3个工作日';
      return '1-2个工作日';
    };

    // 格式化时间
    const formatTime = (timestamp) => {
      return formatTimestamp(timestamp);
    };

    // 跳转到批量申请
    const goToBatchApply = () => {};

    // 跳转到进度页面
    const goToProgressPage = () => {
      // 未实现进度页面，提示并停留在当前页
      Message.info('进度查询未启用，可在当前页查看近期申请');
      router.push('/management/permission');
    };

    // 初始化
    onMounted(() => {
      // 加载最近申请
      recentApplications.value = mockApplications;
    });

    return {
      defaultCategory,
      selectedResources,
      submitting,
      applicationNumber,
      estimatedApprovalTime,
      showBatchApply,
      showProgress,
      recentApplications,
      handleSubmit,
      handleReset,
      handleSaveDraft,
      handleContinueApply,
      handleBackToHome,
      formatTime,
      goToBatchApply,
      goToProgressPage
    };
  }
};
</script>

<style lang="less" scoped>
.permission-apply {
  padding: 24px;
  background: #f5f6fa;
  min-height: 100vh;
}

.apply-card {
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

.step-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.batch-apply-content {
  padding: 24px;
  
  p {
    margin-bottom: 16px;
    font-size: 14px;
  }
  
  ul {
    margin-bottom: 24px;
    padding-left: 24px;
    
    li {
      margin-bottom: 8px;
      color: #595959;
    }
  }
}

.batch-apply-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.progress-content {
  padding: 24px;
}

.applications-list {
  .application-item {
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 16px;
    
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .app-number {
        font-weight: 500;
        color: #262626;
      }
    }
    
    .app-info {
      .info-item {
        display: flex;
        margin-bottom: 4px;
        
        .label {
          color: #8c8c8c;
          width: 100px;
          flex-shrink: 0;
        }
        
        .value {
          color: #262626;
        }
      }
    }
  }
}

.progress-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
