# 画布拖拽边界检查修复测试指南

## 🎯 修复内容

### 主要问题
- **画布显示移动但节点位置不变** - 可能是边界检查过于严格导致
- **临时禁用边界检查** - 用于测试是否是边界限制问题

### 修复措施
1. **临时禁用边界检查** - 移除 `isWithinBounds` 限制
2. **增加详细平移日志** - 显示每次平移的具体数值
3. **保持事件传递修复** - 确保鼠标事件正确传递

## 🧪 测试步骤

### 1. 基础拖拽测试
```bash
# 1. 刷新页面，确保最新代码生效
# 2. 打开浏览器开发者工具控制台
# 3. 在画布空白区域按下鼠标左键并拖拽
# 4. 观察控制台日志和画布变化
```

### 2. 预期日志输出
```
🖱️ [CanvasPanZoomManager] 鼠标按下事件触发
🚀 [CanvasPanZoomManager] 开始拖拽操作
🔄 [CanvasPanZoomManager] 执行平移: {
  smoothedDelta: { x: 数值, y: 数值 },
  currentTranslate: { tx: 当前X, ty: 当前Y },
  newTranslate: { tx: 新X, ty: 新Y }
}
🔚 [CanvasPanZoomManager] 拖拽结束
```

### 3. 关键检查点

#### ✅ 成功标志
- [ ] 控制台显示 "执行平移" 日志
- [ ] `smoothedDelta` 有非零数值
- [ ] `currentTranslate` 和 `newTranslate` 数值不同
- [ ] 节点相对于画布的位置发生变化
- [ ] 画布背景网格移动

#### ❌ 问题标志
- [ ] 没有 "执行平移" 日志
- [ ] `smoothedDelta` 始终为 0
- [ ] `currentTranslate` 和 `newTranslate` 相同
- [ ] 节点位置完全不变

## 🔍 详细诊断

### 场景1: 有平移日志但节点不动
**可能原因**: X6 图形的 translate 方法未生效
**解决方案**: 
```javascript
// 在控制台手动测试
graph.translate(50, 50)  // 应该看到画布移动
```

### 场景2: 无平移日志
**可能原因**: 累积算法阈值过高
**解决方案**: 检查 `shouldProcess` 条件

### 场景3: 平移数值过小
**可能原因**: 平滑因子过高或灵敏度过低
**解决方案**: 调整 `smoothingFactor` 和 `sensitivity`

## 🛠️ 手动测试命令

### 在浏览器控制台执行
```javascript
// 1. 检查 CanvasPanZoomManager 实例
console.log('PanZoomManager:', window.panZoomManager || panZoomManager)

// 2. 手动测试画布平移
if (graph) {
  console.log('当前平移状态:', graph.translate())
  graph.translate(100, 50)  // 向右下移动
  console.log('平移后状态:', graph.translate())
}

// 3. 检查边界设置
if (panZoomManager) {
  console.log('边界设置:', panZoomManager.restrictArea)
}

// 4. 测试灵敏度
if (panZoomManager) {
  console.log('当前灵敏度:', panZoomManager.getCurrentSensitivity())
}
```

## 📊 性能指标

### 正常拖拽指标
- **响应延迟**: < 16ms (60fps)
- **平移增量**: 0.1-10px per move
- **累积阈值**: > 1px 触发处理
- **平滑因子**: 0.95 (保留95%的累积)

### 异常指标
- **无响应**: 平移增量始终为0
- **过度平滑**: 平移增量 < 0.01px
- **跳跃**: 平移增量 > 50px

## 🔧 问题排查

### 1. 边界检查问题
```javascript
// 检查当前位置是否在边界内
const currentPos = graph.translate()
const withinBounds = panZoomManager.isWithinBounds(currentPos.tx, currentPos.ty)
console.log('当前位置在边界内:', withinBounds)
```

### 2. 事件传递问题
```javascript
// 检查事件监听器
const container = graph.container
console.log('容器事件监听器:', getEventListeners(container))
```

### 3. X6 配置问题
```javascript
// 检查 scroller 配置
console.log('Scroller配置:', graph.scroller?.options)
```

## 🎯 测试用例

### 用例1: 基础拖拽
1. 在空白区域按下鼠标
2. 水平拖拽 100px
3. 预期: 节点相对位置改变

### 用例2: 垂直拖拽
1. 在空白区域按下鼠标
2. 垂直拖拽 100px
3. 预期: 节点相对位置改变

### 用例3: 对角拖拽
1. 在空白区域按下鼠标
2. 对角拖拽 100px
3. 预期: 节点相对位置改变

### 用例4: 快速拖拽
1. 快速拖拽画布
2. 预期: 平滑跟随，无跳跃

## 📝 测试记录

### 测试环境
- 浏览器: ___________
- 时间: ___________
- 代码版本: 边界检查已禁用

### 测试结果
- [ ] 基础拖拽: 通过/失败
- [ ] 垂直拖拽: 通过/失败  
- [ ] 对角拖拽: 通过/失败
- [ ] 快速拖拽: 通过/失败

### 问题记录
```
问题描述: 
复现步骤:
错误日志:
解决方案:
```

## 🔄 下一步

### 如果测试通过
1. 重新启用边界检查
2. 调整边界范围
3. 优化边界检查逻辑

### 如果测试失败
1. 检查 X6 图形配置
2. 验证事件传递链
3. 调试累积算法参数

## 📞 支持

如果遇到问题，请提供：
1. 完整的控制台日志
2. 测试步骤描述
3. 预期vs实际结果
4. 浏览器和环境信息