<template>
  <div class="customer-profile">
    <a-tabs v-model:active-key="activeTab" type="card" class="profile-tabs">
      <a-tab-pane key="basic" title="客户基础画像">
        <BasicProfile :user-info="userInfo" />
      </a-tab-pane>
      <a-tab-pane key="credit" title="征信">
        <CreditProfile :user-info="userInfo" :credit-info="creditInfo" />
      </a-tab-pane>
      <a-tab-pane key="postloan" title="贷后管理">
        <PostLoanProfile :user-info="userInfo" :collection-records="collectionRecords" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasicProfile from './profile/BasicProfile.vue'
import CreditProfile from './profile/CreditProfile.vue'
import PostLoanProfile from './profile/PostLoanProfile.vue'

interface Props {
  userInfo?: any
  creditInfo?: any
  collectionRecords?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  userInfo: () => ({}),
  creditInfo: () => ({}),
  collectionRecords: () => []
})

const activeTab = ref('basic')
</script>

<style scoped>
.customer-profile {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.profile-tabs {
  min-height: 400px;
}

.profile-tabs :deep(.arco-tabs-content) {
  padding: 0;
}

.profile-tabs :deep(.arco-tabs-tab) {
  padding: 12px 24px;
  font-weight: 500;
}
</style>
