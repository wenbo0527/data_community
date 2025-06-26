<template>
  <div class="basic-info">
    <a-skeleton v-if="!userInfo" :loading="true" />
    <a-descriptions v-else :column="{ xs: 1, sm: 2, md: 3 }" size="small">
      <a-descriptions-item label="姓名">{{ userInfo.name }}</a-descriptions-item>
      <a-descriptions-item label="年龄">{{ userInfo.age }}</a-descriptions-item>
      <a-descriptions-item label="性别">{{ userInfo.gender }}</a-descriptions-item>
      <a-descriptions-item label="手机号码">{{ userInfo.mobile }}</a-descriptions-item>
      <a-descriptions-item label="客户号">{{ userInfo.customerNo }}</a-descriptions-item>
      <a-descriptions-item label="户籍">{{ userInfo.address }}</a-descriptions-item>
      <a-descriptions-item label="身份证号">{{ userInfo.idCard }}</a-descriptions-item>
      <a-descriptions-item label="身份证有效期">{{ userInfo.idExpiry }}</a-descriptions-item>
      <a-descriptions-item label="用户状态">{{ userInfo.status }}</a-descriptions-item>
      <a-descriptions-item label="活体相似度">{{ userInfo.similarity }}</a-descriptions-item>
      <a-descriptions-item label="相似度阈值">{{ userInfo.threshold }}</a-descriptions-item>
      <a-descriptions-item label="错误信息">{{ userInfo.errorMsg }}</a-descriptions-item>
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

// 监听props变化，记录数据变化情况
watch(() => props.userInfo, (newVal) => {
  console.debug('[BasicInfo] userInfo数据变化:', {
    timestamp: Date.now(),
    hasData: !!newVal,
    hasError: newVal?.error,
    dataKeys: newVal ? Object.keys(newVal) : [],
    basicInfoFields: newVal ? {
      hasName: 'name' in newVal,
      nameValue: newVal.name,
      hasAge: 'age' in newVal,
      ageValue: newVal.age,
      hasGender: 'gender' in newVal,
      genderValue: newVal.gender,
      hasMobile: 'mobile' in newVal,
      mobileValue: newVal.mobile,
      hasCustomerNo: 'customerNo' in newVal,
      customerNoValue: newVal.customerNo,
      hasAddress: 'address' in newVal,
      addressValue: newVal.address,
      hasIdCard: 'idCard' in newVal,
      idCardValue: newVal.idCard,
      hasIdExpiry: 'idExpiry' in newVal,
      idExpiryValue: newVal.idExpiry,
      hasStatus: 'status' in newVal,
      statusValue: newVal.status,
      hasSimilarity: 'similarity' in newVal,
      similarityValue: newVal.similarity,
      hasThreshold: 'threshold' in newVal,
      thresholdValue: newVal.threshold,
      hasErrorMsg: 'errorMsg' in newVal,
      errorMsgValue: newVal.errorMsg
    } : null
  });
}, { immediate: true, deep: true });

onMounted(() => {
  console.debug('[BasicInfo] 组件挂载完成，初始数据:', {
    timestamp: Date.now(),
    hasUserInfo: !!props.userInfo,
    userInfoError: props.userInfo?.error
  });
});
</script>