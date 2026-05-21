<template>
  <div class="dfd-index">
    <a-layout class="layout">
      <a-layout-header>
        <div class="header-content">
          <h1>数据发现域 (DFD)</h1>
          <a-menu mode="horizontal" :default-selected-keys="['home']" router>
            <a-menu-item key="home" @click="$router.push('/')">首页</a-menu-item>
          </a-menu>
        </div>
      </a-layout-header>
      
      <a-layout-content class="content">
        <div class="index-intro">
          <h2>数据发现域</h2>
          <p>基于 PRD 文档定义的功能模块</p>
          
          <a-divider />
          
          <h3>功能清单</h3>
          <a-row :gutter="[16, 16]">
            <a-col :span="8" v-for="item in features" :key="item.path">
              <a-card hoverable @click="$router.push(item.path)">
                <template #title>
                  <span>{{ item.title }}</span>
                </template>
                <template #extra>
                  <a-tag :color="item.color">{{ item.category }}</a-tag>
                </template>
                <p>{{ item.description }}</p>
              </a-card>
            </a-col>
          </a-row>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
const features = [
  // 数据资产运营工具
  { path: '/lineage', title: '资产血缘分析', category: '运营工具', description: '分析数据资产的来源和流向', color: 'arcoblue' },
  { path: '/impact-analysis', title: '变更影响分析', category: '运营工具', description: '评估数据变更对下游的影响', color: 'arcoblue' },
  
  // 数据资产字典
  { path: '/asset-catalog', title: '资产目录列表', category: '资产字典', description: '查看和管理数据资产目录', color: 'green' },
  { path: '/favorites', title: '资产收藏', category: '资产字典', description: '管理收藏的数据资产', color: 'green' },
  
  // 数据要素字典
  { path: '/feature-dict', title: '特征字典列表', category: '要素字典', description: '管理特征元数据', color: 'orange' },
  { path: '/variable-dict', title: '变量字典列表', category: '要素字典', description: '管理变量元数据', color: 'orange' },
  { path: '/indicator-dict', title: '指标字典列表', category: '要素字典', description: '管理指标元数据', color: 'orange' },
  
  // 数据资源字典
  { path: '/data-resources', title: '资源列表', category: '资源字典', description: '管理数据资源', color: 'purple' },
  
  // 统一搜索
  { path: '/search', title: '统一搜索', category: '搜索', description: '统一的搜索入口', color: 'red' },
  
  // 其他功能
  { path: '/asset-overview', title: '资产总览', category: '其他', description: '数据资产总览', color: 'gray' },
  { path: '/asset-management', title: '资产管理', category: '其他', description: '资产管理功能', color: 'gray' },
  { path: '/data-map', title: '数据地图', category: '其他', description: '可视化数据地图', color: 'gray' },
  { path: '/feature-map', title: '特征地图', category: '其他', description: '特征关系可视化', color: 'gray' },
  { path: '/discovery', title: '数据发现', category: '其他', description: '发现新数据资产', color: 'gray' },
  { path: '/asset-guide', title: '资产指南', category: '其他', description: '数据资产使用指南', color: 'gray' }
]
</script>

<style scoped>
.dfd-index {
  width: 100%;
  min-height: 100vh;
}

.layout {
  min-height: 100vh;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-content h1 {
  color: #fff;
  margin: 0;
  font-size: 20px;
}

.content {
  padding: 24px;
}

.index-intro {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
}

.index-intro h2 {
  margin-bottom: 8px;
}

.index-intro h3 {
  margin-top: 16px;
  margin-bottom: 16px;
}

.index-intro p {
  color: #666;
  margin: 0;
}
</style>
