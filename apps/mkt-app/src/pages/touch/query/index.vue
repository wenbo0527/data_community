<template>
  <div class="touch-query-index">
    <div class="query-header">
      <h2 class="query-title">触达查询</h2>
      <p class="query-desc">支持按任务、客户、渠道、时间等多维度查询触达记录</p>
    </div>

    <a-tabs default-active-key="marketing-list" @change="handleTabChange">
      <a-tab-pane key="marketing-list" title="营销触达">
        <div class="tab-content">
          <div class="tab-nav-cards">
            <router-link to="/touch/query/marketing-list" class="nav-card">
              <div class="nav-card-icon">📋</div>
              <div class="nav-card-info">
                <div class="nav-card-title">营销触达列表</div>
                <div class="nav-card-desc">查看所有营销触达任务记录</div>
              </div>
            </router-link>
            <router-link to="/touch/query/marketing-search" class="nav-card">
              <div class="nav-card-icon">🔍</div>
              <div class="nav-card-info">
                <div class="nav-card-title">营销触达搜索</div>
                <div class="nav-card-desc">多条件组合搜索触达记录</div>
              </div>
            </router-link>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="sms" title="短信">
        <div class="tab-content">
          <div class="tab-nav-cards">
            <router-link to="/touch/query/sms-records" class="nav-card">
              <div class="nav-card-icon">💬</div>
              <div class="nav-card-info">
                <div class="nav-card-title">短信发送记录</div>
                <div class="nav-card-desc">查看短信发送明细与状态</div>
              </div>
            </router-link>
            <router-link to="/touch/query/ai-sms-vendor-records" class="nav-card">
              <div class="nav-card-icon">📡</div>
              <div class="nav-card-info">
                <div class="nav-card-title">AI短信厂商记录</div>
                <div class="nav-card-desc">AI短信渠道发送厂商明细</div>
              </div>
            </router-link>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="call" title="外呼">
        <div class="tab-content">
          <div class="tab-nav-cards">
            <router-link to="/touch/query/ai-call-records" class="nav-card">
              <div class="nav-card-icon">🤖</div>
              <div class="nav-card-info">
                <div class="nav-card-title">AI呼叫记录</div>
                <div class="nav-card-desc">AI外呼任务执行记录</div>
              </div>
            </router-link>
            <router-link to="/touch/query/manual-call-records" class="nav-card">
              <div class="nav-card-icon">📞</div>
              <div class="nav-card-info">
                <div class="nav-card-title">人工呼叫记录</div>
                <div class="nav-card-desc">人工电销呼叫明细</div>
              </div>
            </router-link>
            <router-link to="/touch/query/manual-sms-vendor-records" class="nav-card">
              <div class="nav-card-icon">📱</div>
              <div class="nav-card-info">
                <div class="nav-card-title">人工短信厂商记录</div>
                <div class="nav-card-desc">人工短信渠道厂商明细</div>
              </div>
            </router-link>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="detail" title="触达详情">
        <div class="tab-content">
          <router-link to="/touch/query/detail" class="nav-card">
            <div class="nav-card-icon">📊</div>
            <div class="nav-card-info">
              <div class="nav-card-title">触达详情</div>
              <div class="nav-card-desc">单次触达任务的完整执行链路</div>
            </div>
          </router-link>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleTabChange = (key) => {
  // Tab change can be used for analytics tracking if needed
}
</script>

<style scoped>
.touch-query-index {
  padding: 20px;
}

.query-header {
  margin-bottom: 24px;
}

.query-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 8px;
}

.query-desc {
  font-size: 14px;
  color: var(--color-text-3);
  margin: 0;
}

.tab-content {
  padding: 8px 0;
}

.tab-nav-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  min-width: 280px;
  flex: 1;
  transition: all 0.2s ease;
}

.nav-card:hover {
  border-color: rgb(var(--primary-5));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.nav-card-icon {
  font-size: 32px;
  line-height: 1;
}

.nav-card-info {
  flex: 1;
}

.nav-card-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 4px;
}

.nav-card-desc {
  font-size: 13px;
  color: var(--color-text-3);
}
</style>
