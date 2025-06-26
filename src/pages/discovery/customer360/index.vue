<template>
  <div class="customer-360-container">
    <!-- 只在主页面显示搜索部分，详情页面不显示 -->
    <div v-if="!$route.params.userId" class="search-section">
      <div class="search-header">
        <h2>客户360视图</h2>
        <p>请输入客户ID查询客户详细信息</p>
      </div>
      <div class="search-form">
        <a-input
          v-model="searchForm.userId"
          placeholder="请输入用户ID（如：887123）"
          class="search-input"
          size="large"
          @keyup.enter="handleSearch"
          :loading="loading"
        />
        <a-button 
          type="primary" 
          @click="handleSearch" 
          class="search-button"
          size="large"
          :loading="loading"
        >
          <IconSearch />
          搜索客户
        </a-button>
      </div>
      <div class="search-tips">
        <p>示例用户ID：887123、123</p>
      </div>
    </div>
    <!-- 子路由内容 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { fetchUserInfo } from '../../../mock/customer360'

const router = useRouter()
const loading = ref(false)

const searchForm = reactive({
  userId: ''
})

const handleSearch = async () => {
  if (!searchForm.userId.trim()) {
    Message.warning('请输入用户ID')
    return
  }
  
  loading.value = true
  
  try {
    const userInfo = await fetchUserInfo(searchForm.userId)
    
    if (userInfo.error) {
      Message.error(userInfo.message || '查询失败')
      return
    }
    
    Message.success('查询成功，正在跳转到客户详情页...')
    
    const routeParams = {
       name: 'Customer360Detail',
       params: {
         userId: searchForm.userId
       }
     }
     
     try {
       // 在当前页面跳转到详情页
       await router.push(routeParams)
     } catch (routeError) {
       Message.error('页面打开失败，请稍后重试')
     }
    
  } catch (error) {
    Message.error('查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.customer-360-container {
  padding: 40px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-section {
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.search-header {
  margin-bottom: 32px;
}

.search-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.search-header p {
  font-size: 16px;
  color: #86909c;
  margin: 0;
}

.search-form {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  border-radius: 8px;
}

.search-button {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  padding: 0 24px;
}

.search-tips {
  text-align: left;
}

.search-tips p {
  font-size: 14px;
  color: #86909c;
  margin: 0;
  background: #f7f8fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #165dff;
}

@media (max-width: 768px) {
  .customer-360-container {
    padding: 20px 16px;
  }
  
  .search-section {
    padding: 32px 24px;
  }
  
  .search-form {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-input,
  .search-button {
    width: 100%;
  }
}
</style>