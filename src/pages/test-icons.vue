<template>
  <div class="test-icons-page">
    <h2>图标显示测试</h2>
    
    <div class="icon-test-section">
      <h3>Arco Design 图标测试</h3>
      
      <div class="icon-row">
        <span>IconPlus: </span>
        <IconPlus style="color: #165dff; font-size: 16px;" />
      </div>
      
      <div class="icon-row">
        <span>IconMinus: </span>
        <IconMinus style="color: #f53f3f; font-size: 16px;" />
      </div>
      
      <div class="icon-row">
        <span>IconDown: </span>
        <IconDown style="color: #666; font-size: 16px;" />
      </div>
      
      <div class="icon-row">
        <span>IconRight: </span>
        <IconRight style="color: #666; font-size: 16px;" />
      </div>
    </div>
    
    <div class="button-test-section">
      <h3>按钮图标测试</h3>
      
      <div class="button-row">
        <a-button type="text" size="small" class="test-btn add-btn">
          <IconPlus />
          添加
        </a-button>
        
        <a-button type="text" size="small" class="test-btn remove-btn">
          <IconMinus />
          删除
        </a-button>
      </div>
      
      <div class="button-row">
        <a-tooltip content="添加条件">
          <a-button type="text" size="mini" class="icon-only-btn add">
            <IconPlus />
          </a-button>
        </a-tooltip>
        
        <a-tooltip content="删除条件">
          <a-button type="text" size="mini" class="icon-only-btn remove">
            <IconMinus />
          </a-button>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconPlus, IconMinus, IconDown, IconRight } from '@arco-design/web-vue/es/icon'
</script>

<style scoped>
.test-icons-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.icon-test-section,
.button-test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.icon-row,
.button-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.icon-row span {
  min-width: 100px;
  font-weight: 500;
}

.test-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
}

.test-btn.add-btn {
  color: #165dff;
  border: 1px solid #165dff;
}

.test-btn.add-btn:hover {
  background: #e8f3ff;
}

.test-btn.remove-btn {
  color: #f53f3f;
  border: 1px solid #f53f3f;
}

.test-btn.remove-btn:hover {
  background: #ffece8;
}

.icon-only-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-only-btn.add {
  color: #165dff;
  border: 1px solid #165dff;
}

.icon-only-btn.add:hover {
  background: #e8f3ff;
}

.icon-only-btn.remove {
  color: #f53f3f;
  border: 1px solid #f53f3f;
}

.icon-only-btn.remove:hover {
  background: #ffece8;
}
</style>