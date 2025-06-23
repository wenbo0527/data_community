<template>
  <div class="search-container">
    <div class="logo">
      <h1>客户360查询</h1>
    </div>
    <div class="search-box">
      <a-input
        v-model="userId"
        placeholder="请输入用户ID进行查询"
        class="search-input"
        @press-enter="handleSearch"
      />
      <a-button type="primary" @click="handleSearch" class="search-button">
        <SearchOutlined /> 搜索
      </a-button>
    </div>
    <div v-if="loading" class="loading-container">
      <Spin :size="20" />
    </div>
  </div>
<router-view />
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { SearchOutlined } from '@ant-design/icons-vue';
import { Message, Spin } from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import { fetchUserInfo } from '@/api/discovery';

const userId = ref('');
const loading = ref(false);
const router = useRouter();

const handleSearch = async () => {
  if (!userId) {
    Message.warning('请输入用户ID');
    return;
  }
  loading.value = true;
  try {
    const userData = await fetchUserInfo(userId.value);
    if (userData) {
      router.push(`/discovery/customer360/${userId.value}`);
    } else {
      Message.warning('未找到该用户信息');
    }
  } catch (error) {
    Message.error('查询失败，请重试');
    console.error('Search error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.logo h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #1890ff;
}

.search-box {
  display: flex;
  margin-bottom: 30px;
  height: 48px;
}

.search-input {
  flex: 1;
  border-radius: 24px 0 0 24px !important;
}

.search-button {
  border-radius: 0 24px 24px 0 !important;
  padding: 0 20px;
}

.search-results {
  margin-top: 20px;
  text-align: left;
}

.search-results h3 {
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.no-results,
.loading-container {
  margin-top: 40px;
}
</style>