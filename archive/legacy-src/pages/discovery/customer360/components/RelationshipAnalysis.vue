<template>
  <div class="relationship-analysis">
    <!-- 分析类型选择 -->
    <div class="analysis-header">
      <a-radio-group v-model="analysisType" type="button" size="small">
        <a-radio value="strength">关系强度分析</a-radio>
        <a-radio value="risk">风险传导分析</a-radio>
        <a-radio value="path">关系路径分析</a-radio>
        <a-radio value="cluster">关系聚类分析</a-radio>
      </a-radio-group>
      
      <a-button 
        type="primary" 
        size="small" 
        @click="runAnalysis"
        :loading="analyzing"
      >
        <template #icon><icon-play-arrow /></template>
        开始分析
      </a-button>
    </div>
    
    <!-- 关系强度分析 -->
    <div v-if="analysisType === 'strength'" class="strength-analysis">
      <div class="analysis-title">
        <icon-link />关系强度分析
      </div>
      
      <div class="strength-metrics">
        <div class="metric-card">
          <div class="metric-label">平均关系强度</div>
          <div class="metric-value">{{ strengthMetrics.average.toFixed(2) }}</div>
          <div class="metric-trend" :class="strengthMetrics.trend"