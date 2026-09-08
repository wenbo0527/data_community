<template>
  <div class="external-data-evaluation">
    <div class="page-header">
      <h2>外数评估中心</h2>
      <p class="page-description">从引入、质量、风险、价值、监控等维度进行评估</p>
    </div>
    <a-tabs default-active-key="introduction">
      <a-tab-pane key="introduction" title="引入评估">
        <IntroductionEvaluation />
      </a-tab-pane>
      <a-tab-pane key="quality" title="质量评估">
        <QualityEvaluation />
      </a-tab-pane>
      <a-tab-pane key="risk" title="风险评估">
        <RiskEvaluation />
      </a-tab-pane>
      <a-tab-pane key="value" title="价值评估">
        <ValueEvaluation />
      </a-tab-pane>
      <a-tab-pane key="monitoring" title="监控评估">
        <MonitoringEvaluation />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import IntroductionEvaluation from './components/IntroductionEvaluation.vue'
import QualityEvaluation from './components/QualityEvaluation.vue'
import RiskEvaluation from './components/RiskEvaluation.vue'
import ValueEvaluation from './components/ValueEvaluation.vue'
import MonitoringEvaluation from './components/MonitoringEvaluation.vue'
</script>

<style scoped>
.page-header { margin-bottom: 16px; }
.page-description { color: var(--color-text-2); }
</style>