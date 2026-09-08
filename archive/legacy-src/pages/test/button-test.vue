<template>
  <div class="button-test-page">
    <div class="page-header">
      <h1>按钮显示测试页面</h1>
      <p>测试 audience-create 页面中所有按钮的显示情况</p>
    </div>

    <div class="test-sections">
      <!-- ConditionConfig 组件按钮测试 -->
      <div class="test-section">
        <h2>ConditionConfig 组件按钮</h2>
        
        <div class="button-group">
          <h3>1. 添加条件组按钮</h3>
          <a-button type="dashed" @click="logButtonClick('添加条件组')" class="add-group-btn">
            <template #icon><IconPlus /></template>
            添加条件组
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.plus">{{ iconStatus.plus }}</span></span>
          </div>
        </div>

        <div class="button-group">
          <h3>2. 添加排除条件组按钮</h3>
          <a-button type="dashed" @click="logButtonClick('添加排除条件组')" class="add-exclude-group-btn">
            <template #icon><IconPlus /></template>
            添加排除条件组
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.plus">{{ iconStatus.plus }}</span></span>
          </div>
        </div>

        <div class="button-group">
          <h3>3. 条件组间逻辑连接符</h3>
          <div 
            class="cross-group-logic-indicator clickable and"
            @click="logButtonClick('切换条件组间逻辑')"
          >
            <span class="logic-text">{{ crossGroupLogic === 'and' ? '且' : '或' }}</span>
          </div>
          <div class="button-status">
            <span>当前逻辑: {{ crossGroupLogic }}</span>
          </div>
        </div>
      </div>

      <!-- ConditionGroup 组件按钮测试 -->
      <div class="test-section">
        <h2>ConditionGroup 组件按钮</h2>
        
        <div class="button-group">
          <h3>4. 删除条件组按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('删除条件组')" 
            class="action-btn danger"
          >
            <IconMinus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.minus">{{ iconStatus.minus }}</span></span>
          </div>
        </div>

        <div class="button-group">
          <h3>5. 切换条件组逻辑按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('切换条件组逻辑')" 
            class="logic-btn"
          >
            {{ groupLogic === 'and' ? 'AND' : 'OR' }}
          </a-button>
          <div class="button-status">
            <span>当前逻辑: {{ groupLogic }}</span>
          </div>
        </div>

        <div class="button-group" data-test-id="button-6">
          <h3>6. 折叠/展开按钮</h3>
          <a-button 
            type="text" 
            size="mini" 
            @click="logButtonClick('切换折叠状态')" 
            class="collapse-btn"
          >
            <IconDown v-if="!collapsed" />
            <IconRight v-else />
          </a-button>
          <div class="button-status">
            <span>折叠状态: {{ collapsed ? '已折叠' : '已展开' }}</span>
            <span>图标状态: <span :class="iconStatusClass.down">{{ iconStatus.down }}</span> / <span :class="iconStatusClass.right">{{ iconStatus.right }}</span></span>
          </div>
        </div>

        <div class="button-group" data-test-id="button-7">
          <h3>7. 添加标签条件按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('添加标签条件')" 
            class="action-btn add"
          >
            <IconPlus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.plus">{{ iconStatus.plus }}</span></span>
          </div>
        </div>

        <div class="button-group">
          <h3>8. 删除标签条件按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('删除标签条件')" 
            class="action-btn danger"
          >
            <IconMinus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.minus">{{ iconStatus.minus }}</span></span>
          </div>
        </div>

        <div class="button-group">
          <h3>9. 标签行内操作按钮</h3>
          <div class="tag-actions">
            <a-button 
              type="primary" 
              size="small" 
              @click="logButtonClick('标签行内添加')" 
              class="tag-action-btn add-btn"
            >
              <IconPlus :size="24" />
            </a-button>
            
            <a-button 
              type="primary" 
              size="small" 
              @click="logButtonClick('标签行内删除')" 
              class="tag-action-btn remove-btn"
              status="danger"
            >
              <IconMinus :size="24" />
            </a-button>
          </div>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.plus">{{ iconStatus.plus }}</span> / <span :class="iconStatusClass.minus">{{ iconStatus.minus }}</span></span>
          </div>
        </div>

        <div class="button-group" data-test-id="button-10">
          <h3>10. 删除属性按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('删除属性')" 
            class="action-btn danger"
          >
            <IconMinus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.minus">{{ iconStatus.minus }}</span></span>
          </div>
        </div>

        <div class="button-group" data-test-id="button-11">
          <h3>11. 添加标签按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('添加标签')" 
            class="action-btn add"
          >
            <IconPlus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.plus">{{ iconStatus.plus }}</span></span>
          </div>
        </div>

        <div class="button-group" data-test-id="button-12">
          <h3>12. 删除标签按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('删除标签')" 
            class="action-btn danger"
          >
            <IconMinus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.minus">{{ iconStatus.minus }}</span></span>
          </div>
        </div>

        <div class="button-group" data-test-id="button-13">
          <h3>13. 删除明细数据条件按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('删除明细数据条件')" 
            class="action-btn danger"
          >
            <IconMinus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.minus">{{ iconStatus.minus }}</span></span>
          </div>
        </div>

        <div class="button-group" data-test-id="button-14">
          <h3>14. 添加事件属性按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('添加事件属性')" 
            class="action-btn add"
          >
            <IconPlus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.plus">{{ iconStatus.plus }}</span></span>
          </div>
        </div>

        <div class="button-group" data-test-id="button-15">
          <h3>15. 删除事件属性按钮</h3>
          <a-button 
            type="text" 
            size="small" 
            @click="logButtonClick('删除事件属性')" 
            class="action-btn danger"
          >
            <IconMinus />
          </a-button>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatusClass.minus">{{ iconStatus.minus }}</span></span>
          </div>
        </div>
      </div>

      <!-- 底部按钮测试 -->
      <div class="test-section">
        <h2>底部添加条件按钮</h2>
        
        <div class="button-group">
          <h3>16. 底部添加条件按钮组</h3>
          <div class="add-condition-buttons">
            <a-button type="dashed" size="small" @click="logButtonClick('底部添加属性')" class="add-condition-btn">
              <template #icon><IconPlus /></template>
              添加属性
            </a-button>
            
            <a-button type="dashed" size="small" @click="logButtonClick('底部添加行为')" class="add-condition-btn">
              <template #icon><IconPlus /></template>
              添加行为
            </a-button>
            
            <a-button type="dashed" size="small" @click="logButtonClick('底部添加明细')" class="add-condition-btn">
              <template #icon><IconPlus /></template>
              添加明细
            </a-button>
          </div>
          <div class="button-status">
            <span>图标状态: <span :class="iconStatus.plus">{{ iconStatus.plus }}</span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 日志区域 -->
    <div class="log-section">
      <h2>按钮点击日志</h2>
      <div class="log-container">
        <div v-for="(log, index) in clickLogs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <a-button @click="clearLogs" size="small" type="outline">清空日志</a-button>
    </div>

    <!-- 图标检查结果 -->
    <div class="icon-check-section">
      <h2>图标检查结果</h2>
      <div class="icon-check-results">
        <div class="icon-result">
          <span>IconPlus: </span>
          <span :class="iconStatusClass.plus">{{ iconStatus.plus }}</span>
        </div>
        <div class="icon-result">
          <span>IconMinus: </span>
          <span :class="iconStatusClass.minus">{{ iconStatus.minus }}</span>
        </div>
        <div class="icon-result">
          <span>IconDown: </span>
          <span :class="iconStatusClass.down">{{ iconStatus.down }}</span>
        </div>
        <div class="icon-result">
          <span>IconRight: </span>
          <span :class="iconStatusClass.right">{{ iconStatus.right }}</span>
        </div>
      </div>
    </div>

    <!-- 按钮可见性测试 -->
    <div class="visibility-test-section">
      <h2>按钮可见性测试</h2>
      <div class="visibility-test-controls">
        <a-button @click="runVisibilityTest" type="primary" size="small">运行可见性测试</a-button>
        <a-button @click="highlightProblematicButtons" type="outline" size="small">高亮问题按钮</a-button>
      </div>
      <div class="visibility-results" v-if="visibilityResults.length > 0">
        <h3>测试结果:</h3>
        <div v-for="result in visibilityResults" :key="result.id" class="visibility-result-item" :class="result.status">
          <span class="result-icon">{{ result.status === 'visible' ? '✅' : '❌' }}</span>
          <span class="result-text">{{ result.name }}: {{ result.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { IconPlus, IconMinus, IconDown, IconRight } from '@arco-design/web-vue/es/icon'

// 响应式数据
const crossGroupLogic = ref('and')
const groupLogic = ref('and')
const collapsed = ref(false)
const clickLogs = ref<Array<{time: string, message: string}>>([])

// 图标状态检查
const iconStatus = ref({
  plus: '检查中...',
  minus: '检查中...',
  down: '检查中...',
  right: '检查中...'
})

// 可见性测试结果
const visibilityResults = ref([])

// 图标状态样式类
const iconStatusClass = computed(() => ({
  plus: iconStatus.value.plus.includes('✅') ? 'success' : 'error',
  minus: iconStatus.value.minus.includes('✅') ? 'success' : 'error',
  down: iconStatus.value.down.includes('✅') ? 'success' : 'error',
  right: iconStatus.value.right.includes('✅') ? 'success' : 'error'
}))

// 按钮点击日志
const logButtonClick = (buttonName: string) => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString()
  clickLogs.value.unshift({
    time: timeStr,
    message: `点击了 ${buttonName} 按钮`
  })
  
  console.log(`[${timeStr}] 按钮点击: ${buttonName}`)
  
  // 特殊逻辑处理
  if (buttonName === '切换条件组间逻辑') {
    crossGroupLogic.value = crossGroupLogic.value === 'and' ? 'or' : 'and'
  } else if (buttonName === '切换条件组逻辑') {
    groupLogic.value = groupLogic.value === 'and' ? 'or' : 'and'
  } else if (buttonName === '切换折叠状态') {
    collapsed.value = !collapsed.value
  }
}

// 清空日志
const clearLogs = () => {
  clickLogs.value = []
  console.log('日志已清空')
}

// 检查图标是否正确加载
const checkIconStatus = () => {
  try {
    // 检查图标组件是否存在
    iconStatus.value.plus = IconPlus ? '✅ 正常' : '❌ 未加载'
    iconStatus.value.minus = IconMinus ? '✅ 正常' : '❌ 未加载'
    iconStatus.value.down = IconDown ? '✅ 正常' : '❌ 未加载'
    iconStatus.value.right = IconRight ? '✅ 正常' : '❌ 未加载'
    
    console.log('图标检查完成:', iconStatus.value)
    console.log('图标组件详情:', {
      IconPlus: IconPlus,
      IconMinus: IconMinus,
      IconDown: IconDown,
      IconRight: IconRight
    })
  } catch (error) {
    console.error('图标检查出错:', error)
    Object.keys(iconStatus.value).forEach(key => {
      iconStatus.value[key as keyof typeof iconStatus.value] = '❌ 错误'
    })
  }
}

// 检查按钮渲染状态
const checkButtonRendering = () => {
  console.log('开始检查按钮渲染状态...')
  
  // 检查6-15号按钮的DOM元素
  setTimeout(() => {
    const buttons = {
      6: document.querySelector('.collapse-btn'),
      7: document.querySelectorAll('.condition-type-add-btn')[0],
      8: document.querySelectorAll('.condition-remove-btn')[0],
      9: document.querySelector('.tag-actions'),
      10: document.querySelectorAll('.condition-type-add-btn')[1],
      11: document.querySelectorAll('.condition-remove-btn')[1],
      12: document.querySelectorAll('.condition-type-add-btn')[2],
      13: document.querySelectorAll('.condition-remove-btn')[2],
      14: document.querySelector('.add-property-btn'),
      15: document.querySelector('.remove-property-btn')
    }
    
    Object.entries(buttons).forEach(([num, element]) => {
      if (element) {
        console.log(`按钮 ${num}: ✅ 已渲染`, element)
        // 检查按钮内的图标
        const icon = element.querySelector('svg') || element.querySelector('[class*="icon"]')
        if (icon) {
          console.log(`  └─ 图标: ✅ 已渲染`, icon)
        } else {
          console.warn(`  └─ 图标: ⚠️ 未找到`)
        }
        // 检查按钮样式
        const styles = window.getComputedStyle(element)
        console.log(`  └─ 显示状态: ${styles.display}, 可见性: ${styles.visibility}, 透明度: ${styles.opacity}`)
      } else {
        console.error(`按钮 ${num}: ❌ 未找到DOM元素`)
      }
    })
    
    // 额外检查所有按钮组
    const buttonGroups = document.querySelectorAll('.button-group')
    console.log(`总共找到 ${buttonGroups.length} 个按钮组`)
    buttonGroups.forEach((group, index) => {
      const title = group.querySelector('h3')?.textContent
      const button = group.querySelector('button, .a-btn')
      console.log(`按钮组 ${index + 1}: ${title} - 按钮存在: ${!!button}`)
    })
  }, 1000)
}

// 添加实时DOM监控
const startDOMMonitoring = () => {
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && (node as Element).matches('.button-group, button, .a-btn')) {
              console.log('DOM变化: 新增按钮相关元素', node)
            }
          })
        }
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    console.log('DOM监控已启动')
  }
}

// 运行可见性测试
const runVisibilityTest = () => {
  console.log('开始运行可见性测试...')
  visibilityResults.value = []
  
  const buttonTests = [
    { id: 6, name: '6. 折叠/展开按钮', selector: '.collapse-btn' },
    { id: 7, name: '7. 添加标签条件按钮', selector: '.condition-type-add-btn' },
    { id: 8, name: '8. 删除标签条件按钮', selector: '.condition-remove-btn' },
    { id: 9, name: '9. 标签行内操作按钮', selector: '.tag-action-btn' },
    { id: 10, name: '10. 添加行为条件按钮', selector: '.add-condition-btn' },
    { id: 11, name: '11. 删除行为条件按钮', selector: '.condition-remove-btn' },
    { id: 12, name: '12. 添加明细数据条件按钮', selector: '.add-condition-btn' },
    { id: 13, name: '13. 删除明细数据条件按钮', selector: '.condition-remove-btn' },
    { id: 14, name: '14. 添加事件属性按钮', selector: '.add-property-btn' },
    { id: 15, name: '15. 删除事件属性按钮', selector: '.remove-property-btn' }
  ]
  
  buttonTests.forEach(test => {
    const elements = document.querySelectorAll(test.selector)
    const isVisible = elements.length > 0 && Array.from(elements).some(el => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
    })
    
    visibilityResults.value.push({
      id: test.id,
      name: test.name,
      status: isVisible ? 'visible' : 'hidden',
      message: isVisible ? '可见' : `未找到或不可见 (找到${elements.length}个元素)`
    })
  })
  
  console.log('可见性测试完成:', visibilityResults.value)
}

// 高亮问题按钮
const highlightProblematicButtons = () => {
  console.log('高亮问题按钮...')
  
  // 移除之前的高亮
  document.querySelectorAll('.highlight-problem').forEach(el => {
    el.classList.remove('highlight-problem')
  })
  
  // 高亮问题按钮
  visibilityResults.value.forEach(result => {
    if (result.status === 'hidden') {
      const buttonContainer = document.querySelector(`[data-test-id="button-${result.id}"]`)
      if (buttonContainer) {
        buttonContainer.classList.add('highlight-problem')
      }
    }
  })
}

// 组件挂载时检查图标
onMounted(() => {
  checkIconStatus()
  startDOMMonitoring()
  checkButtonRendering()
  console.log('按钮测试页面已加载')
  console.log('开始检查所有按钮的显示情况...')
  
  // 添加页面错误监听
  window.addEventListener('error', (e) => {
    console.error('页面错误:', e.error)
  })
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason)
  })
})
</script>

<style scoped>
.button-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h1 {
  color: #1d2129;
  margin-bottom: 8px;
}

.page-header p {
  color: #86909c;
  margin: 0;
}

.test-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.test-section {
  background: #f7f8fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.test-section h2 {
  color: #1d2129;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.button-group {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.button-group h3 {
  color: #4e5969;
  margin-bottom: 10px;
  font-size: 14px;
}

.button-status {
  margin-top: 8px;
  font-size: 12px;
  color: #86909c;
}

.button-status span {
  margin-right: 15px;
}

.button-status .success {
  color: #00b42a;
}

.button-status .error {
  color: #f53f3f;
}

/* 按钮样式 - 复制原组件样式 */
.add-group-btn,
.add-exclude-group-btn {
  width: 200px;
}

.cross-group-logic-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cross-group-logic-indicator.and {
  background: #e8f4ff;
  color: #0e42d2;
  border: 1px solid #bedaff;
}

.cross-group-logic-indicator.or {
  background: #fff7e8;
  color: #ff7d00;
  border: 1px solid #ffcf8b;
}

.cross-group-logic-indicator:hover {
  opacity: 0.8;
}

.action-btn.danger {
  color: #f53f3f;
}

.action-btn.danger:hover {
  background: #ffece8;
}

.action-btn.add {
  color: #0e42d2;
}

.action-btn.add:hover {
  background: #e8f4ff;
}

.logic-btn {
  font-size: 11px;
  font-weight: 500;
  color: #0e42d2;
}

.collapse-btn {
  width: 20px;
  height: 20px;
}

.condition-type-add-btn,
.condition-remove-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  background: white;
  color: #999;
  transition: border-color 0.2s ease;
  cursor: pointer;
}

.condition-type-add-btn:hover {
  border-color: #0e42d2;
  color: #0e42d2;
}

.condition-remove-btn:hover {
  border-color: #f53f3f;
  color: #f53f3f;
}

.tag-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.tag-action-btn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  background: white;
  color: #999;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tag-action-btn.add-btn:hover {
  border-color: #0e42d2;
  color: #0e42d2;
}

.tag-action-btn.remove-btn:hover {
  border-color: #f53f3f;
  color: #f53f3f;
}

.add-condition-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.add-condition-btn {
  min-width: 100px;
}

.add-property-btn,
.remove-property-btn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  background: white;
  color: #999;
  transition: all 0.2s ease;
  cursor: pointer;
}

.add-property-btn:hover {
  border-color: #0e42d2;
  color: #0e42d2;
}

.remove-property-btn:hover {
  border-color: #f53f3f;
  color: #f53f3f;
}

/* 日志区域样式 */
.log-section {
  margin-top: 30px;
  background: #f7f8fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.log-section h2 {
  color: #1d2129;
  margin-bottom: 15px;
}

.log-container {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.log-item {
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #86909c;
  margin-right: 10px;
}

.log-message {
  color: #1d2129;
}

/* 图标检查结果样式 */
.icon-check-section {
  margin-top: 30px;
  background: #f7f8fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.icon-check-section h2 {
  color: #1d2129;
  margin-bottom: 15px;
}

.icon-check-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.icon-result {
  background: white;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  font-size: 14px;
}

.icon-result .success {
  color: #00b42a;
  font-weight: 500;
}

.icon-result .error {
  color: #f53f3f;
  font-weight: 500;
}

/* 可见性测试样式 */
.visibility-test-section {
  margin-top: 20px;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 8px;
  border: 1px solid #d1ecf1;
}

.visibility-test-controls {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.visibility-results {
  margin-top: 15px;
}

.visibility-result-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 5px 0;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.visibility-result-item.visible {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.visibility-result-item.hidden {
  background: #fff2f0;
  border-color: #ffccc7;
}

.result-icon {
  margin-right: 8px;
  font-size: 16px;
}

.result-text {
  flex: 1;
}

/* 问题按钮高亮样式 */
.highlight-problem {
  outline: 3px solid #ff4d4f !important;
  outline-offset: 2px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { outline-color: #ff4d4f; }
  51%, 100% { outline-color: transparent; }
}
</style>