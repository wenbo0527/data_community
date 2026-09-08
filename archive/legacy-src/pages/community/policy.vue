<template>
  <CommunityResource 
    :category="ResourceCategory.POLICY"
    :can-manage="canManage"
    @add="handleAdd"
    @edit="handleEdit"
    @view="handleView"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommunityResource from '@/components/community/CommunityResource.vue'
import { ResourceCategory } from '@/types/community'

const router = useRouter()

// 权限控制
const canManage = ref(true) // 根据实际权限设置

// 树形导航数据
const treeData = ref([
  {
    key: 'policy',
    title: '政策制度',
    count: 25,
    children: [
      { key: 'policy-law', title: '法律法规', count: 8 },
      { key: 'policy-management', title: '管理办法', count: 6 },
      { key: 'policy-standard', title: '行业标准', count: 5 },
      { key: 'policy-company', title: '公司制度', count: 6 }
    ]
  },
  {
    key: 'cases',
    title: '实践案例',
    count: 18,
    children: [
      { key: 'cases-success', title: '成功案例', count: 8 },
      { key: 'cases-analysis', title: '案例分析', count: 6 },
      { key: 'cases-best', title: '最佳实践', count: 4 }
    ]
  },
  {
    key: 'guide',
    title: '操作指南',
    count: 32,
    children: [
      { key: 'guide-basic', title: '基础指南', count: 12 },
      { key: 'guide-advanced', title: '进阶指南', count: 10 },
      { key: 'guide-expert', title: '专家指南', count: 10 }
    ]
  },
  {
    key: 'news',
    title: '社区动态',
    count: 15,
    children: [
      { key: 'news-announcement', title: '公告通知', count: 5 },
      { key: 'news-activity', title: '活动资讯', count: 6 },
      { key: 'news-update', title: '更新日志', count: 4 }
    ]
  }
])

// 所有文档数据
const allDocuments = ref([
  // 政策制度 - 法律法规
  { id: 1, title: '数据安全法实施细则', description: '关于《数据安全法》实施的具体细则和操作指南', type: 'policy-law', category: '政策制度', subcategory: '法律法规', author: '国家网信办', publishTime: '2024-01-15', updateTime: '2024-01-15', views: 156 },
  { id: 2, title: '网络安全法条例', description: '网络安全法相关条例和实施规范', type: 'policy-law', category: '政策制度', subcategory: '法律法规', author: '全国人大', publishTime: '2024-01-10', updateTime: '2024-01-12', views: 234 },
  
  // 政策制度 - 管理办法
  { id: 3, title: '个人信息保护管理办法', description: '个人信息保护相关管理办法和操作规范', type: 'policy-management', category: '政策制度', subcategory: '管理办法', author: '工信部', publishTime: '2024-01-08', updateTime: '2024-01-08', views: 189 },
  { id: 4, title: '数据跨境传输管理办法', description: '数据跨境传输的管理规定和审批流程', type: 'policy-management', category: '政策制度', subcategory: '管理办法', author: '网信办', publishTime: '2024-01-05', updateTime: '2024-01-06', views: 145 },
  
  // 政策制度 - 行业标准
  { id: 5, title: '金融行业数据标准', description: '金融行业数据质量评估标准和改进措施', type: 'policy-standard', category: '政策制度', subcategory: '行业标准', author: '银保监会', publishTime: '2024-01-03', updateTime: '2024-01-04', views: 267 },
  { id: 6, title: '电信行业数据规范', description: '电信行业数据管理和使用规范标准', type: 'policy-standard', category: '政策制度', subcategory: '行业标准', author: '工信部', publishTime: '2024-01-01', updateTime: '2024-01-02', views: 198 },
  
  // 实践案例 - 成功案例
  { id: 7, title: '某银行数据治理实践', description: '大型银行数据治理体系建设的成功经验', type: 'cases-success', category: '实践案例', subcategory: '成功案例', author: '张三', publishTime: '2023-12-28', updateTime: '2023-12-30', views: 312 },
  { id: 8, title: '互联网企业隐私保护案例', description: '知名互联网企业用户隐私保护的最佳实践', type: 'cases-success', category: '实践案例', subcategory: '成功案例', author: '李四', publishTime: '2023-12-25', updateTime: '2023-12-26', views: 278 },
  
  // 操作指南 - 基础指南
  { id: 9, title: '数据分类分级指南', description: '数据分类分级的基础操作指南和实施步骤', type: 'guide-basic', category: '操作指南', subcategory: '基础指南', author: '王五', publishTime: '2023-12-20', updateTime: '2023-12-22', views: 445 },
  { id: 10, title: '数据备份恢复指南', description: '数据备份和恢复的基础操作流程', type: 'guide-basic', category: '操作指南', subcategory: '基础指南', author: '赵六', publishTime: '2023-12-18', updateTime: '2023-12-19', views: 356 },
  
  // 社区动态 - 公告通知
  { id: 11, title: '社区规则更新通知', description: '社区管理规则和使用条款的最新更新', type: 'news-announcement', category: '社区动态', subcategory: '公告通知', author: '管理员', publishTime: '2023-12-15', updateTime: '2023-12-16', views: 523 },
  { id: 12, title: '系统维护公告', description: '系统定期维护和功能升级的相关公告', type: 'news-announcement', category: '社区动态', subcategory: '公告通知', author: '技术团队', publishTime: '2023-12-12', updateTime: '2023-12-13', views: 234 }
])

// 计算属性 - 过滤文档
const filteredDocuments = computed(() => {
  let filtered = allDocuments.value

  // 根据选中的树节点过滤
  if (selectedKeys.value.length > 0) {
    const selectedKey = selectedKeys.value[0]
    filtered = filtered.filter(doc => doc.type === selectedKey || doc.type.startsWith(selectedKey + '-'))
  }

  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.title.toLowerCase().includes(keyword) || 
      doc.description.toLowerCase().includes(keyword)
    )
  }

  // 排序
  if (sortBy.value === 'publishTime') {
    filtered.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
  } else if (sortBy.value === 'updateTime') {
    filtered.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
  } else if (sortBy.value === 'views') {
    filtered.sort((a, b) => b.views - a.views)
  }

  return filtered
})

// 方法
const handleTreeSelect = (selectedKeysValue) => {
  selectedKeys.value = selectedKeysValue
  updateCurrentPageInfo()
}

const handleTreeExpand = (expandedKeysValue) => {
  expandedKeys.value = expandedKeysValue
}

const updateCurrentPageInfo = () => {
  if (selectedKeys.value.length === 0) {
    currentCategory.value = '社区资源'
    currentSubcategory.value = ''
    currentTitle.value = '社区资源'
    currentDescription.value = '数据管理相关资源文档'
    return
  }

  const selectedKey = selectedKeys.value[0]
  const keyParts = selectedKey.split('-')
  
  if (keyParts.length === 1) {
    // 主分类
    switch (selectedKey) {
      case 'policy':
        currentCategory.value = '政策制度'
        currentSubcategory.value = ''
        currentTitle.value = '政策制度'
        currentDescription.value = '数据管理相关政策制度文档'
        break
      case 'cases':
        currentCategory.value = '实践案例'
        currentSubcategory.value = ''
        currentTitle.value = '实践案例'
        currentDescription.value = '数据管理实践案例和经验分享'
        break
      case 'guide':
        currentCategory.value = '操作指南'
        currentSubcategory.value = ''
        currentTitle.value = '操作指南'
        currentDescription.value = '数据管理操作指南和教程'
        break
      case 'news':
        currentCategory.value = '社区动态'
        currentSubcategory.value = ''
        currentTitle.value = '社区动态'
        currentDescription.value = '社区最新动态和公告信息'
        break
    }
  } else {
    // 子分类
    const mainCategory = keyParts[0]
    const subCategory = keyParts[1]
    
    switch (mainCategory) {
      case 'policy':
        currentCategory.value = '政策制度'
        switch (subCategory) {
          case 'law':
            currentSubcategory.value = '法律法规'
            currentTitle.value = '法律法规'
            currentDescription.value = '数据管理相关法律法规文档'
            break
          case 'management':
            currentSubcategory.value = '管理办法'
            currentTitle.value = '管理办法'
            currentDescription.value = '数据管理办法和规定'
            break
          case 'standard':
            currentSubcategory.value = '行业标准'
            currentTitle.value = '行业标准'
            currentDescription.value = '数据管理行业标准和规范'
            break
          case 'company':
            currentSubcategory.value = '公司制度'
            currentTitle.value = '公司制度'
            currentDescription.value = '公司内部数据管理制度'
            break
        }
        break
    }
  }
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const getDocumentIcon = (type) => {
  if (type.startsWith('policy')) return IconSafe
  if (type.startsWith('cases')) return IconFile
  if (type.startsWith('guide')) return IconBook
  if (type.startsWith('news')) return IconNotification
  return type === 'PDF' ? IconFile : IconBook
}

const viewDocument = (item) => {
  selectedPolicy.value = item
}

const handleAdd = () => {
  router.push('/notification/create')
}

// 生命周期
onMounted(() => {
  updateCurrentPageInfo()
})

// 旧的方法（保留兼容性）
const handleMenuClick = (key) => {
  router.push(`/community/${key}`)
}



const handleFilter = () => {
  // 筛选逻辑已在计算属性中实现
}

const getCategoryName = (category) => {
  const categoryMap = {
    law: '法律法规',
    management: '管理办法',
    'industry-standard': '行业标准',
    'local-standard': '地方标准',
    training: '培训指引',
    'national-standard': '国家标准',
    'company-policy': '公司制度'
  }
  return categoryMap[category] || category
}

const getCategoryColor = (category) => {
  const colorMap = {
    law: 'red',
    management: 'blue',
    'industry-standard': 'green',
    'local-standard': 'orange',
    training: 'purple',
    'national-standard': 'cyan',
    'company-policy': 'magenta'
  }
  return colorMap[category] || 'gray'
}

const getStatusName = (status) => {
  const statusMap = {
    active: '生效中',
    draft: '草案',
    archived: '已归档'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    active: 'green',
    draft: 'orange',
    archived: 'gray'
  }
  return colorMap[status] || 'gray'
}

const getCategoryIcon = (category) => {
  const iconMap = {
    security: 'IconSafe',
    privacy: 'IconFile',
    quality: 'IconBook',
    governance: 'IconNotification'
  }
  return iconMap[category] || 'IconFile'
}

const viewPolicy = (record) => {
  selectedPolicy.value = record
}

const editPolicy = (record) => {
  console.log('编辑政策:', record)
  // 这里可以跳转到编辑页面或打开编辑弹窗
}

const deletePolicy = (record) => {
  console.log('删除政策:', record)
  // 这里可以显示确认删除弹窗
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.policy-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.community-sider {
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sider-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.sider-header h3 {
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.community-menu {
  border-right: none;
}

.policy-content {
  padding: 24px;
}

.content-header {
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 8px 0 4px 0;
  color: #1d2129;
  font-size: 24px;
  font-weight: 600;
}

.header-description {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.content-body {
  background-color: #fff;
  border-radius: 6px;
  padding: 24px;
}

.filter-card {
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-card :deep(.arco-card-header) {
  border-bottom: 1px solid #e5e6eb;
  padding: 16px 20px;
}

.content-card :deep(.arco-card-body) {
  padding: 20px;
}

.policy-list {
  background: transparent;
}

.policy-item {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e5e6eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.policy-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #165dff;
}

.policy-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.policy-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.policy-title span {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.policy-description p {
  margin: 0 0 12px 0;
  color: #4e5969;
  font-size: 14px;
  line-height: 1.5;
}

.pdf-info {
  background: #f7f8fa;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  margin-bottom: 12px;
}

.file-size {
  color: #86909c;
  font-size: 12px;
}

.policy-meta {
  color: #86909c;
  font-size: 12px;
}
</style>