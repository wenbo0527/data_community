<template>
  <div class="customer-360-container">
    <!-- 只在主页面显示搜索部分，详情页面不显示 -->
    <div v-if="!$route.params.userId" class="search-section">
      <div class="search-header">
        <h2>客户360视图</h2>
        <p>请输入客户ID查询客户详细信息</p>
      </div>

      <!-- 搜索模式切换 -->
      <div class="search-mode-tabs">
        <a-radio-group v-model="searchMode" type="button" size="medium">
          <a-radio value="exact">精确搜索</a-radio>
          <a-radio value="fuzzy">模糊搜索</a-radio>
          <a-radio value="product">产品授信时间查询</a-radio>
        </a-radio-group>
      </div>

      <!-- 精确搜索表单（Mode 1） -->
      <div v-if="searchMode === 'exact'" class="exact-search-area">
        <a-form :model="searchForm" layout="inline" class="exact-form">
          <a-form-item label="客户ID">
            <a-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID（如：887123）"
              allow-clear
              @keyup.enter="handleExactSearch"
              style="width: 300px"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleExactSearch" :loading="loading">
              <template #icon><IconSearch /></template>
              查询
            </a-button>
          </a-form-item>
        </a-form>
        <div class="search-tips">
          <p>示例用户ID：887123、123</p>
        </div>
      </div>

      <!-- 模糊搜索表单（Mode 2） -->
      <div v-if="searchMode === 'fuzzy'" class="fuzzy-search-area">
        <div class="fuzzy-search-header">
          <IconInfoCircleFill style="color: var(--subapp-primary); margin-right: 8px;" />
          <span>请完整输入客户姓名和身份证后 6 位</span>
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
            <a-button type="primary" @click="handleFuzzySearch" :loading="loading">
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

      <!-- 产品授信时间查询表单（Mode 3） -->
      <div v-if="searchMode === 'product'" class="product-search-area">
        <div class="product-search-header">
          <IconInfoCircleFill style="color: #165dff; margin-right: 8px;" />
          <span>按产品名称和授信时间范围筛选客户</span>
        </div>
        <a-form :model="productForm" layout="inline" class="product-form">
          <a-form-item label="产品名称">
            <a-select
              v-model="productForm.productCode"
              placeholder="请选择产品"
              allow-search
              allow-clear
              style="width: 200px"
            >
              <a-option v-for="p in PRODUCT_LIST" :key="p.productCode" :value="p.productCode">
                {{ p.productName }} ({{ p.productCode }})
              </a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="授信时间">
            <a-range-picker
              v-model="productForm.creditRange"
              format="YYYY-MM-DD"
              :placeholder="['开始日期', '结束日期']"
              style="width: 260px"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleProductCreditSearch" :loading="loading">
              <template #icon><IconSearch /></template>
              查询
            </a-button>
            <a-button style="margin-left: 8px" @click="handleProductCreditReset">重置</a-button>
          </a-form-item>
        </a-form>

        <!-- 查询结果 -->
        <div v-if="productSearchDone" class="product-results">
          <div v-if="productSearchResults.length" class="search-results-header">
            共找到 <strong>{{ productSearchResults.length }}</strong> 个匹配客户，点击行进入详情
          </div>
          <a-table
            v-if="productSearchResults.length"
            :data="productSearchResults"
            :loading="loading"
            :pagination="{ pageSize: 20 }"
            row-key="userId"
            size="small"
            class="search-result-table"
            :scroll="{ x: 640 }"
            @row-click="handleProductResultRowClick"
          >
            <template #columns>
              <a-table-column title="统一客户ID" data-index="userId" :width="120" fixed="left" />
              <a-table-column title="姓名" data-index="name" :width="120" fixed="left" />
              <a-table-column title="产品名称" data-index="productName" :width="160" />
              <a-table-column title="授信时间" data-index="creditTime" :width="120" />
              <a-table-column title="状态" data-index="creditStatus" :width="100">
                <template #cell="{ record }">
                  <a-tag v-if="record.creditStatus === '正常'" color="green" size="small">{{ record.creditStatus }}</a-tag>
                  <a-tag v-else-if="record.creditStatus === '冻结'" color="gray" size="small">{{ record.creditStatus }}</a-tag>
                  <a-tag v-else color="red" size="small">{{ record.creditStatus }}</a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <div v-else class="search-empty">
            <a-empty description="未找到匹配的客户" />
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
import { mockUsers, fetchUserInfo } from '@/mock/customer360'
import { PRODUCT_LIST } from '@/mock/products'

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

// 产品授信时间查询
type SearchMode = 'exact' | 'fuzzy' | 'product'
const searchMode = ref<SearchMode>('exact')
const productForm = reactive({
  productCode: '',
  creditRange: []
})
const productSearchResults = ref<any[]>([])
const productSearchDone = ref(false)

const handleExactSearch = async () => {
  cancelJump()
  if (!searchForm.userId.trim()) {
    Message.warning('请输入用户ID')
    return
  }

  loading.value = true

  try {
    console.log('[DEBUG] 开始查询用户, userId:', searchForm.userId)
    const userInfo = await fetchUserInfo(searchForm.userId)
    console.log('[DEBUG] fetchUserInfo 返回:', userInfo)
    console.log('[DEBUG] userInfo.error:', (userInfo as any).error)
    console.log('[DEBUG] userInfo.message:', (userInfo as any).message)

    if ((userInfo as any).error) {
      Message.error((userInfo as any).message || '查询失败')
      return
    }

    Message.success('查询成功，正在跳转到客户详情页...')

    await router.push({
      name: 'Customer360Detail',
      query: {
        userId: searchForm.userId
      }
    })
  } catch (error) {
    console.error('[ERROR] 查询失败, 错误详情:', error)
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
    if (!user) {return}

    const userName = String(user.name || '')
    const idCard = String(user.idCard || '')
    const customerLevel = user.customerLevel || ''

    const nameMatch = name && userName.includes(name)
    const idCardMatch = idCardTailInput && idCard.endsWith(idCardTailInput)

    if (nameMatch || idCardMatch) {
      results.push({
        userId,
        name: userName,
        idCardTail: idCard.slice(-6),
        customerLevel,
        productNames: user.productNames || []
      })
    }
  })

  searchResults.value = results
  loading.value = false

  if (results.length === 1) {
    startJumpTimer(results[0].userId)
  } else if (results.length === 0) {
    Message.warning('未找到匹配的客户，请尝试其他关键词')
  } else {
    Message.success(`共找到 ${results.length} 个匹配客户`)
  }
}

const startJumpTimer = (userId: string) => {
  jumpCountdown.value = 3
  jumpTimer.value = setInterval(() => {
    jumpCountdown.value--
    if (jumpCountdown.value <= 0) {
      clearInterval(jumpTimer.value!)
      jumpTimer.value = null
      jumpCountdown.value = 0
      router.push({
        name: 'Customer360Detail',
        query: { userId }
      })
    }
  }, 1000)
}

const handleResultRowClick = (record: any) => {
  cancelJump()
  router.push({
    name: 'Customer360Detail',
    query: { userId: record.userId }
  })
}

// 产品授信时间搜索
const handleProductCreditSearch = async () => {
  cancelJump()
  if (!productForm.productCode) {
    Message.warning('请选择产品名称')
    return
  }

  loading.value = true
  productSearchDone.value = false

  try {
    const userIds = Object.keys(mockUsers)
    const results: any[] = []

    userIds.forEach((userId) => {
      const user = (mockUsers as any)[userId]
      if (!user || !user.creditRecords) return

      const matched = user.creditRecords.filter((record: any) => {
        const productMatch = record.productCode === productForm.productCode
        if (!productMatch) return false

        if (productForm.creditRange && productForm.creditRange.length === 2) {
          const creditTime = new Date(record.creditTime)
          const [start, end] = productForm.creditRange
          const startDate = new Date(start)
          const endDate = new Date(end)
          endDate.setHours(23, 59, 59, 999)
          return creditTime >= startDate && creditTime <= endDate
        }
        return true
      })

      if (matched.length > 0) {
        results.push({
          userId,
          name: user.name,
          productName: matched[0].productName,
          creditTime: matched[0].creditTime,
          creditStatus: matched[0].creditStatus
        })
      }
    })

    productSearchResults.value = results
    productSearchDone.value = true

    if (results.length === 0) {
      Message.warning('未找到匹配的客户')
    } else {
      Message.success(`共找到 ${results.length} 个匹配客户`)
    }
  } catch (error) {
    console.error('[ERROR] 产品授信查询失败:', error)
    Message.error('查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleProductCreditReset = () => {
  productForm.productCode = ''
  productForm.creditRange = []
  productSearchResults.value = []
  productSearchDone.value = false
}

const handleProductResultRowClick = (record: any) => {
  cancelJump()
  router.push({
    name: 'Customer360Detail',
    query: { userId: record.userId }
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
  color: var(--subapp-text-primary);
  margin-bottom: 8px;
}

.search-header p {
  font-size: 16px;
  color: var(--subapp-text-tertiary);
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
  color: var(--subapp-text-secondary);
}

.fuzzy-toggle:hover {
  background-color: var(--subapp-bg-secondary);
}

.search-tips {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.search-tips p {
  font-size: 14px;
  color: var(--subapp-text-tertiary);
  margin: 0;
  background: #f7f8fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid var(--subapp-primary);
}

.fuzzy-search-area {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid var(--subapp-bg-secondary);
  text-align: left;
}

.fuzzy-search-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--subapp-text-secondary);
}

.fuzzy-form {
  margin-bottom: 8px;
}

.fuzzy-form :deep(.arco-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.search-mode-tabs {
  margin-bottom: 24px;
}

.exact-search-area {
  margin-bottom: 16px;
}

.exact-form {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.exact-form :deep(.arco-form-item) {
  margin-bottom: 0;
}

.product-search-area {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid var(--subapp-bg-secondary);
  text-align: left;
}

.product-search-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--subapp-text-secondary);
}

.product-form {
  margin-bottom: 8px;
}

.product-form :deep(.arco-form-item) {
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
  color: var(--subapp-text-primary);
}

.search-results-header strong {
  color: var(--subapp-primary);
  font-size: 16px;
}

.jump-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--subapp-primary);
  font-weight: 500;
}

.search-empty {
  padding: 24px 0;
}

.product-results {
  margin-top: 20px;
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
  background-color: var(--subapp-bg-secondary);
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
</style>
