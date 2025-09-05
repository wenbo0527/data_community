<template>
  <div class="basic-profile">
    <!-- 客户概览 -->
    <div class="profile-section">
      <h3 class="section-title">客户概览</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">姓名：</span>
          <span class="value">{{ customerInfo.name || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">客户号：</span>
          <span class="value">{{ customerInfo.customerNo || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">身份证号：</span>
          <span class="value">{{ customerInfo.idCard || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">手机号：</span>
          <span class="value">{{ customerInfo.phone || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">年龄：</span>
          <span class="value">{{ customerInfo.age || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">性别：</span>
          <span class="value">{{ customerInfo.gender || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">户籍：</span>
          <span class="value">{{ customerInfo.domicile || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">身份证有效期：</span>
          <span class="value">{{ customerInfo.idCardExpiry || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户状态：</span>
          <a-tag :color="getStatusColor(customerInfo.status)">{{ customerInfo.status || '-' }}</a-tag>
        </div>
        <div class="info-item">
          <span class="label">自营总额度：</span>
          <span class="value amount">{{ formatAmount(customerInfo.totalCredit) }}</span>
        </div>
        <div class="info-item">
          <span class="label">自营已用额度：</span>
          <span class="value amount">{{ formatAmount(customerInfo.usedCredit) }}</span>
        </div>
      </div>
      
      <!-- 关系查询和联系人按钮 -->
      <div class="action-buttons">
        <a-button type="outline" @click="handleRelationshipQuery">
          <template #icon><IconUser /></template>
          关系查询
        </a-button>
        <a-button type="outline" @click="handleViewContacts">
          <template #icon><IconPhone /></template>
          查看联系人
        </a-button>
      </div>
    </div>

    <!-- 客户画像详细信息 -->
    <div v-if="userProfile" class="profile-section">
      <h3 class="section-title">客户画像</h3>
      
      <!-- 人口统计学特征 -->
      <div class="profile-subsection">
        <h4 class="subsection-title">人口统计学特征</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">年龄组：</span>
            <span class="value">{{ userProfile.demographics?.ageGroup || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别：</span>
            <span class="value">{{ userProfile.demographics?.genderLabel || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">地区类型：</span>
            <span class="value">{{ userProfile.demographics?.regionType || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">职业类型：</span>
            <span class="value">{{ userProfile.demographics?.occupationType || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">收入水平：</span>
            <span class="value">{{ userProfile.demographics?.incomeLevel || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 行为特征 -->
      <div class="profile-subsection">
        <h4 class="subsection-title">行为特征</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">登录活跃度：</span>
            <span class="value">{{ userProfile.behavior?.loginActivity || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">使用习惯：</span>
            <span class="value">{{ userProfile.behavior?.usageHabits || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">功能偏好：</span>
            <span class="value">{{ userProfile.behavior?.featurePreference || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">操作模式：</span>
            <span class="value">{{ userProfile.behavior?.operationPattern || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 消费特征 -->
      <div class="profile-subsection">
        <h4 class="subsection-title">消费特征</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">消费能力：</span>
            <span class="value">{{ userProfile.consumption?.spendingPower || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">消费频次：</span>
            <span class="value">{{ userProfile.consumption?.frequency || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">消费偏好：</span>
            <span class="value">{{ userProfile.consumption?.preference || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">时间模式：</span>
            <span class="value">{{ userProfile.consumption?.timePattern || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 风险特征 -->
      <div class="profile-subsection">
        <h4 class="subsection-title">风险特征</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">信用等级：</span>
            <a-tag :color="getRiskColor(userProfile.risk?.creditLevel)">{{ userProfile.risk?.creditLevel || '-' }}</a-tag>
          </div>
          <div class="info-item">
            <span class="label">风险类型：</span>
            <a-tag :color="getRiskColor(userProfile.risk?.riskType)">{{ userProfile.risk?.riskType || '-' }}</a-tag>
          </div>
          <div class="info-item">
            <span class="label">还款能力：</span>
            <span class="value">{{ userProfile.risk?.repaymentCapacity || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">控制水平：</span>
            <span class="value">{{ userProfile.risk?.controlLevel || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 产品偏好 -->
      <div class="profile-subsection">
        <h4 class="subsection-title">产品偏好</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">持有产品类型：</span>
            <span class="value">{{ userProfile.productPreference?.holdingTypes?.join(', ') || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">活跃程度：</span>
            <span class="value">{{ userProfile.productPreference?.activityLevel || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">价值贡献：</span>
            <span class="value">{{ userProfile.productPreference?.valueContribution || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">偏好渠道：</span>
            <span class="value">{{ userProfile.productPreference?.preferredChannels?.join(', ') || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">服务偏好：</span>
            <span class="value">{{ userProfile.productPreference?.servicePreference || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">生命周期阶段：</span>
            <span class="value">{{ userProfile.productPreference?.lifecycleStage || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 营销响应 -->
      <div class="profile-subsection">
        <h4 class="subsection-title">营销响应</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">敏感度：</span>
            <span class="value">{{ userProfile.marketingResponse?.sensitivity || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">最佳联系时间：</span>
            <span class="value">{{ userProfile.marketingResponse?.bestContactTime || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">有效渠道：</span>
            <span class="value">{{ userProfile.marketingResponse?.effectiveChannels?.join(', ') || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">频次偏好：</span>
            <span class="value">{{ userProfile.marketingResponse?.frequencyPreference || '-' }}</span>
          </div>
        </div>
      </div>
    </div>



    <!-- 关系查询抽屉 -->
    <a-drawer
      v-model:visible="relationshipDrawerVisible"
      title="关系查询"
      width="800px"
      placement="right"
    >
      <div class="relationship-content">
        <RelationshipQuery 
          :user-info="userInfo"
          :loading="false"
        />
      </div>
    </a-drawer>

    <!-- 联系人抽屉 -->
    <a-drawer
      v-model:visible="contactDrawerVisible"
      title="联系人信息"
      width="600px"
      placement="right"
    >
      <div class="contact-list">
        <a-table
          :data="contactList"
          :pagination="{
            current: currentPage,
            pageSize: pageSize,
            total: totalContacts,
            showTotal: true,
            showPageSize: true
          }"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #columns>
            <a-table-column title="姓名" data-index="name" />
            <a-table-column title="关系" data-index="relationship" />
            <a-table-column title="手机号" data-index="phone" />
            <a-table-column title="邮箱" data-index="email" />
            <a-table-column title="地址" data-index="address" />
          </template>
        </a-table>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconPhone } from '@arco-design/web-vue/es/icon'
import RelationshipQuery from '../RelationshipQuery.vue'

interface Props {
  userInfo?: any
}

const props = withDefaults(defineProps<Props>(), {
  userInfo: () => ({})
})

// 抽屉状态
const contactDrawerVisible = ref(false)
const relationshipDrawerVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalContacts = ref(0)

// 客户信息计算属性
const customerInfo = computed(() => {
  const basicInfo = props.userInfo?.basicInfo || {}
  return {
    name: basicInfo.name || props.userInfo?.name,
    customerNo: basicInfo.customerNo || props.userInfo?.customerNo,
    idCard: basicInfo.idCard || props.userInfo?.idCard,
    phone: basicInfo.phone || props.userInfo?.phone,
    age: basicInfo.age || props.userInfo?.age,
    gender: basicInfo.gender || props.userInfo?.gender,
    domicile: basicInfo.domicile || props.userInfo?.domicile,
    idCardExpiry: basicInfo.idCardExpiry || props.userInfo?.idCardExpiry,
    status: basicInfo.status || props.userInfo?.status || '正常',
    totalCredit: props.userInfo?.totalCredit || 0,
    usedCredit: props.userInfo?.usedCredit || 0
  }
})

// 客户画像信息
const userProfile = computed(() => props.userInfo?.userProfile)



// 联系人列表
const contactList = computed(() => {
  // 模拟联系人数据，实际应从API获取
  return [
    {
      name: '张三',
      relationship: '配偶',
      phone: '138****1234',
      email: 'zhangsan@example.com',
      address: '北京市朝阳区'
    },
    {
      name: '李四',
      relationship: '朋友',
      phone: '139****5678',
      email: 'lisi@example.com',
      address: '上海市浦东新区'
    }
  ]
})

// 格式化金额
const formatAmount = (amount: number) => {
  if (!amount) return '¥0.00'
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '正常': 'green',
    '冻结': 'red',
    '注销': 'gray',
    '待激活': 'orange'
  }
  return colorMap[status] || 'blue'
}

// 获取风险等级颜色
const getRiskColor = (riskLevel: string | undefined) => {
  if (!riskLevel) return 'default'
  
  switch (riskLevel) {
    case '低风险':
    case 'AAA':
    case 'AA':
      return 'green'
    case '中风险':
    case 'A':
    case 'BBB':
      return 'orange'
    case '高风险':
    case 'BB':
    case 'B':
    case 'CCC':
      return 'red'
    default:
      return 'default'
  }
}

// 处理关系查询
const handleRelationshipQuery = () => {
  relationshipDrawerVisible.value = true
}

// 处理查看联系人
const handleViewContacts = () => {
  contactDrawerVisible.value = true
  totalContacts.value = contactList.value.length
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 处理页面大小变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}


</script>

<style scoped>
.basic-profile {
  padding: 16px;
}

.profile-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 120px;
  flex-shrink: 0;
}

.value {
  color: #262626;
  font-weight: 400;
}

.value.amount {
  font-weight: 600;
  color: #1890ff;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.contact-list {
  padding: 16px 0;
}



.contact-list :deep(.arco-table) {
  border-radius: 6px;
}

.contact-list :deep(.arco-table-th) {
  background-color: #fafafa;
  font-weight: 600;
}

/* 客户画像样式 */
.profile-subsection {
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.subsection-title {
  font-size: 16px;
  font-weight: 500;
  color: #1890ff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.profile-subsection .info-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 0;
}

.profile-subsection .info-item {
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
}

.profile-subsection .info-item:last-child {
  border-bottom: none;
}

.profile-subsection .label {
  min-width: 120px;
  font-size: 14px;
}

.profile-subsection .value {
  font-size: 14px;
}
</style>