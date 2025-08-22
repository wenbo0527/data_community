<template>
  <div class="basic-info">
    <a-skeleton v-if="!userInfo" :loading="true" />
    <a-descriptions v-else :column="{ xs: 1, sm: 2, md: 3 }" size="small">
      <a-descriptions-item label="姓名">{{ userInfo.basicInfo?.name || userInfo.name || '-' }}</a-descriptions-item>
      <a-descriptions-item label="年龄">{{ userInfo.basicInfo?.age || userInfo.age || '-' }}</a-descriptions-item>
      <a-descriptions-item label="性别">{{ userInfo.basicInfo?.gender || userInfo.gender || '-' }}</a-descriptions-item>
      <a-descriptions-item label="手机号码">{{ userInfo.basicInfo?.phone || userInfo.mobile || userInfo.phone || '-' }}</a-descriptions-item>
      <a-descriptions-item label="客户号">{{ userInfo.basicInfo?.customerNo || userInfo.customerNo || '-' }}</a-descriptions-item>
      <a-descriptions-item label="户籍">{{ userInfo.basicInfo?.address || userInfo.address || '-' }}</a-descriptions-item>
      <a-descriptions-item label="身份证号">{{ userInfo.basicInfo?.idCard || userInfo.idCard || '-' }}</a-descriptions-item>
      <a-descriptions-item label="身份证有效期">{{ userInfo.basicInfo?.idExpiry || userInfo.idExpiry || '-' }}</a-descriptions-item>
      <a-descriptions-item label="用户状态">{{ userInfo.basicInfo?.status || userInfo.status || '-' }}</a-descriptions-item>
      <a-descriptions-item label="活体相似度">{{ userInfo.basicInfo?.similarity || userInfo.similarity || '-' }}</a-descriptions-item>
      <a-descriptions-item label="相似度阈值">{{ userInfo.basicInfo?.threshold || userInfo.threshold || '-' }}</a-descriptions-item>
      <a-descriptions-item label="错误信息">{{ userInfo.basicInfo?.errorMsg || userInfo.errorMsg || '-' }}</a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['debug-info'])

// 发送调试信息到父组件
const sendDebugInfo = (type, message, data = null) => {
  emit('debug-info', {
    component: 'BasicInfo',
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

// 监听props变化，记录数据变化情况
watch(() => props.userInfo, (newVal) => {
  sendDebugInfo('props-change', 'userInfo数据变化', {
    hasData: !!newVal,
    hasError: newVal?.error,
    dataKeys: newVal ? Object.keys(newVal) : [],
    basicInfoFields: newVal ? {
      hasName: 'name' in newVal,
      hasAge: 'age' in newVal,
      hasGender: 'gender' in newVal,
      hasMobile: 'mobile' in newVal,
      hasCustomerNo: 'customerNo' in newVal,
      hasAddress: 'address' in newVal,
      hasIdCard: 'idCard' in newVal,
      hasIdExpiry: 'idExpiry' in newVal,
      hasStatus: 'status' in newVal,
      hasSimilarity: 'similarity' in newVal,
      hasThreshold: 'threshold' in newVal,
      hasErrorMsg: 'errorMsg' in newVal
    } : null
  });
}, { immediate: true, deep: true });

onMounted(() => {
  sendDebugInfo('mounted', 'BasicInfo组件挂载完成', {
    hasUserInfo: !!props.userInfo,
    userInfoError: props.userInfo?.error
  });
});
</script>