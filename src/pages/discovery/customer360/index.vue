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
          @keyup.enter="handleExactSearch"
          :loading="loading"
        />
        <a-button 
          type="primary" 
          @click="handleExactSearch" 
          class="search-button"
          size="large"
          :loading="loading"
        >
          <IconSearch />
          搜索客户
        </a-button>
        <a-button 
          type="text"
          class="fuzzy-toggle"
          @click="toggleFuzzy"
        >
          <template #icon>
            <IconCaretUp v-if="fuzzyVisible" />
            <IconCaretDown v-else />
          </template>
          {{ fuzzyVisible ? '收起模糊搜索' : '模糊搜索' }}
        </a-button>
      </div>
      <div class="search-tips">
        <p>示例用户ID：887123、123</p>
      </div>

      <div v-if="fuzzyVisible" class="fuzzy-search-area">
        <div class="fuzzy-search-header">
          <IconInfoCircleFill style="color: #165dff; margin-right: 8px;" />
          <span>模糊搜索：支持根据姓名或身份证号后6位进行快速查询（选填）</span>
        </div>
        
        <a-form :model="fuzzyForm" layout="inline" class="fuzzy-form">
          <a-form-item label="姓名" field="name">
            <a-input
              v-model="fuzzyForm.name"
              placeholder="请输入姓名"
              allow-clear
              @keyup.enter="handleFuzzySearch"
            />
          </a-form-item>
          <a-form-item label="身份证后6位" field="idCardTail">
            <a-input
              v-model="fuzzyForm.idCardTail"
              placeholder="请输入后6位"
              allow-clear
              @keyup.enter="handleFuzzySearch"
            />
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              @click="handleFuzzySearch"
              :loading="loading"
            >
              <template #icon><IconSearch /></template>
              搜索
            </a-button>
          </a-form-item>
        </a-form>

        <div
          v-if="hasSearched"
          :class="['search-results', { 'search-results-visible': searchResults.length || hasSearched }]"
        >
          <div v-if="searchResults.length">
            <div class="search-results-header">
              <span v-if="jumpCountdown > 0" class="jump-indicator">
                <a-spin size="small" />
                自动跳转中 ({{ jumpCountdown }}s)... 
                <a-button type="text" size="mini" @click="cancelJump">取消</a-button>
              </span>
              <span v-else>共找到 <strong>{{ searchResults.length }}</strong> 个匹配客户，点击行进入详情</span>
            </div>
            <a-table
              :data="searchResults"
              :loading="loading"
              :pagination="false"
              row-key="userId"
              size="small"
              class="search-result-table"
              :scroll="{ x: 480 }"
              @row-click="handleResultRowClick"
            >
              <template #columns>
                <a-table-column title="统一客户ID" data-index="userId" :width="120" fixed="left" />
                <a-table-column title="姓名" data-index="name" :width="120" fixed="left" />
                <a-table-column title="产品名称" data-index="productNames" :width="240">
                  <template #cell="{ record }">
                    <div class="list-tags">
                      <template v-for="(name, index) in record.productNames" :key="name">
                        <a-tooltip :content="name" v-if="index < 1">
                          <a-tag size="small" color="orange" class="name-tag">{{ name }}</a-tag>
                        </a-tooltip>
                      </template>
                      <a-popover v-if="record.productNames.length > 1" title="全部产品名称">
                        <a-tag size="small" color="orange" class="more-tag">
                          +{{ record.productNames.length - 1 }}
                        </a-tag>
                        <template #content>
                          <div class="popover-tags">
                            <a-tag v-for="name in record.productNames" :key="name" size="small" color="orange" class="pop-tag">{{ name }}</a-tag>
                          </div>
                        </template>
                      </a-popover>
                      <span v-if="!record.productNames.length" class="empty-text">-</span>
                    </div>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </div>
          <div v-else class="search-empty">
            <a-empty description="未找到匹配的客户，请尝试其他关键词" />
          </div>
        </div>
      </div>
    </div>
    <!-- 子路由内容 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
console.log('🌟🌟🌟 INDEX.VUE SCRIPT SETUP 开始执行 🌟🌟🌟')
console.log('🌟 当前时间:', new Date().toLocaleString())
console.log('🌟 当前URL:', window.location.href)

import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { IconSearch, IconCaretDown, IconCaretUp, IconInfoCircleFill } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { mockUsers, fetchUserInfo } from '../../../mock/customer360'

const route = useRoute()

// 监听路由变化
watch(() => route.params.userId, (newUserId: string | string[] | undefined) => {
  console.log('🌟 路由参数变化 - userId:', newUserId)
  console.log('🌟 当前路由名称:', route.name)
  console.log('🌟 当前路由路径:', route.path)
  console.log('🌟 当前路由完整参数:', route.params)
}, { immediate: true })

const router = useRouter()
const loading = ref(false)
const fuzzyVisible = ref(false)
const searchResults = ref([] as any[])
const hasSearched = ref(false)
const jumpTimer = ref<any>(null)
const jumpCountdown = ref(0)

const searchForm = reactive({
  userId: ''
})
const fuzzyForm = reactive({
  name: '',
  idCardTail: ''
})

const handleExactSearch = async () => {
  cancelJump()
  if (!searchForm.userId.trim()) {
    Message.warning('请输入用户ID')
    return
  }

  loading.value = true

  try {
    const userInfo = await fetchUserInfo(searchForm.userId)

    if ((userInfo as any).error) {
      Message.error((userInfo as any).message || '查询失败')
      return
    }

    Message.success('查询成功，正在跳转到客户详情页...')

    await router.push({
      name: 'Customer360Detail',
      params: {
        userId: searchForm.userId
      }
    })
  } catch (error) {
    Message.error('查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const toggleFuzzy = () => {
  cancelJump()
  fuzzyVisible.value = !fuzzyVisible.value
  if (!fuzzyVisible.value) {
    hasSearched.value = false
    searchResults.value = []
    fuzzyForm.name = ''
    fuzzyForm.idCardTail = ''
  }
}

const cancelJump = () => {
  if (jumpTimer.value) {
    clearTimeout(jumpTimer.value)
    jumpTimer.value = null
    jumpCountdown.value = 0
    Message.info('自动跳转已取消')
  }
}

const handleFuzzySearch = () => {
  cancelJump()
  const name = fuzzyForm.name.trim()
  const idCardTailInput = fuzzyForm.idCardTail.trim()

  if (!name && !idCardTailInput) {
    Message.warning('请输入姓名或身份证后6位')
    return
  }

  loading.value = true
  hasSearched.value = true

  const results: any[] = []

  Object.keys(mockUsers).forEach((userId) => {
    const user = (mockUsers as any)[userId]
    if (!user) return

    const userName = String(user.name || '')
    const idCard = String(user.idCard || '')
    const customerLevel = user.customerLevel || ''
    const status = user.status || ''
    const mobile = String(user.mobile || '')

    // 模糊匹配逻辑：如果输入了姓名，则匹配姓名；如果输入了身份证后6位，则匹配身份证
    const nameMatch = name ? userName.includes(name) : true
    const idCardTail = idCard.slice(-6)
    const idCardMatch = idCardTailInput
      ? idCardTail.includes(idCardTailInput) || idCard.includes(idCardTailInput)
      : true

    if (nameMatch && idCardMatch) {
      // 仅提取产品名称用于列表展示
      const productNames = (user.products || []).map((p: any) => p.productName).filter(Boolean)

      results.push({
        userId,
        name: userName,
        mobile,
        idCard,
        customerLevel,
        status,
        productNames
      })
    }
  })

  searchResults.value = results

  if (!results.length) {
    // 没找到结果，不需要额外跳转
  } else if (results.length === 1) {
    const only = results[0]
    jumpCountdown.value = 3
    
    const startTimer = () => {
      jumpTimer.value = setTimeout(() => {
        if (jumpCountdown.value > 1) {
          jumpCountdown.value--
          startTimer()
        } else {
          router.push({
            name: 'Customer360Detail',
            params: {
              userId: String(only.userId)
            }
          })
          jumpTimer.value = null
          jumpCountdown.value = 0
        }
      }, 1000)
    }
    
    Message.info({
      content: `匹配到 1 位客户，${jumpCountdown.value}秒后自动跳转...`,
      duration: 3000
    })
    startTimer()
  } else {
    Message.success(`匹配到 ${results.length} 位客户`)
  }

  loading.value = false
}

const handleResultRowClick = (record: any) => {
  if (!record?.userId) return

  router.push({
    name: 'Customer360Detail',
    params: {
      userId: String(record.userId)
    }
  })
}
</script>

<style scoped>
.customer-360-container {
  padding: 20px 16px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-section {
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  width: 100%;
  text-align: center;
}

.search-header {
  margin-bottom: 24px;
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
  justify-content: center;
}

.search-input {
  max-width: 400px;
  border-radius: 8px;
}

.search-button {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  padding: 0 24px;
}

.fuzzy-toggle {
  margin-left: 8px;
  color: #4e5969;
}

.fuzzy-toggle:hover {
  background-color: #f2f3f5;
}

.search-tips {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
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

.fuzzy-search-area {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f2f3f5;
  text-align: left;
}

.fuzzy-search-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 13px;
  color: #4e5969;
}

.fuzzy-form {
  margin-bottom: 8px;
}

.fuzzy-form :deep(.arco-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.search-results {
  margin-top: 20px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.search-results-visible {
  opacity: 1;
  transform: translateY(0);
}

.search-results-header {
  margin-bottom: 12px;
  font-size: 14px;
  color: #1d2129;
}

.search-results-header strong {
  color: #165dff;
  font-size: 16px;
}

.jump-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #165dff;
  font-weight: 500;
}

.search-empty {
  padding: 24px 0;
}

.list-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.id-tag, .name-tag {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

.more-tag {
  cursor: pointer;
}

.popover-tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
}

.pop-tag {
  width: 100%;
  justify-content: center;
}

.empty-text {
  color: #c9ccd3;
}

.search-result-table :deep(.arco-table-tr) {
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-table :deep(.arco-table-tr:hover) {
  background-color: #f2f3f5;
}

.search-result-table :deep(.arco-tag) {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .search-results,
  .search-section {
    transition: none;
  }
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
