# 画布拖拽问题调试指南

## 🔍 问题描述
用户反馈画布无法拖拽，需要通过调试日志定位具体原因。

## 🛠️ 已添加的调试日志

### 1. CanvasPanZoomManager 调试日志

#### handleMouseDown 方法
- **鼠标按下事件触发**: 记录鼠标按钮、坐标、目标元素信息
- **空白区域检查**: 详细记录空白区域判断逻辑
- **修饰键状态**: 记录 Shift、Ctrl、Space 键状态
- **拖拽条件判断**: 详细分析拖拽条件是否满足
- **拖拽状态设置**: 记录拖拽开始时的状态

#### handleMouseMove 方法
- **拖拽移动计算**: 记录移动距离、灵敏度调整
- **边界检查**: 记录边界限制和阻力应用
- **平移执行**: 记录实际的平移操作

### 2. TaskFlowCanvas 调试日志

#### 画布容器事件
- **容器信息**: 记录画布容器的基本信息
- **鼠标事件**: 在捕获阶段监听鼠标事件
- **事件传播**: 记录事件的传播过程

#### X6 画布事件
- **空白区域事件**: 监听 `blank:mousedown`、`blank:mousemove`、`blank:mouseup`
- **节点拖拽事件**: 监听节点拖拽开始事件
- **配置检查**: 检查 scroller 配置是否正确

## 🔧 调试步骤

### 1. 打开浏览器开发者工具
```bash
F12 或 右键 -> 检查元素
```

### 2. 查看控制台日志
在控制台中查找以下关键日志：

#### 正常拖拽流程应该看到：
```
🔗 [TaskFlowCanvas] 开始绑定画布事件
📦 [TaskFlowCanvas] 画布容器信息: {...}
⚙️ [TaskFlowCanvas] 画布配置信息: {...}
🔍 [TaskFlowCanvas] Scroller状态检查: {...}
🖱️ [TaskFlowCanvas] 画布容器鼠标按下事件: {...}
🖱️ [TaskFlowCanvas] 画布空白区域鼠标按下: {...}
🖱️ [CanvasPanZoomManager] 鼠标按下事件触发: {...}
🎯 [CanvasPanZoomManager] 空白区域检查: {...}
⌨️ [CanvasPanZoomManager] 修饰键状态: {...}
🚀 [CanvasPanZoomManager] 拖拽条件判断: {...}
✅ [CanvasPanZoomManager] 开始拖拽操作
```

#### 如果拖拽失败，会看到：
```
❌ [CanvasPanZoomManager] 拖拽条件不满足，无法开始拖拽
❌ [CanvasPanZoomManager] 拒绝原因: [具体原因]
```

### 3. 常见问题排查

#### 问题1: 不是空白区域
**现象**: 日志显示 `拒绝原因: 不是空白区域`
**原因**: 点击的不是画布空白区域，可能点击到了节点、连接线或其他元素
**解决**: 确保点击画布的空白区域

#### 问题2: 修饰键冲突
**现象**: 日志显示修饰键状态异常
**原因**: Shift 键被按下，但没有启用临时拖拽模式
**解决**: 
- 松开 Shift 键再尝试拖拽
- 或者按住 Space 键启用临时拖拽模式

#### 问题3: Scroller 配置问题
**现象**: Scroller 状态检查显示异常
**原因**: X6 的 scroller 配置可能有问题
**解决**: 检查 scroller 配置是否正确

#### 问题4: 事件冲突
**现象**: 画布容器事件触发但 CanvasPanZoomManager 事件未触发
**原因**: 事件被其他组件拦截
**解决**: 检查事件传播链，确保事件能正确传递

## 🎯 重点检查项

### 1. 空白区域判断逻辑
```javascript
const isBlankArea = target === this.graph.container || 
                   target.classList.contains('x6-graph-svg') ||
                   target.classList.contains('x6-graph-svg-stage') ||
                   target.tagName === 'svg'
```

### 2. 拖拽条件判断
```javascript
const canPan = isBlankArea && e.button === 0 && (
  this.tempPanningEnabled || // 空格键临时启用
  !this.isShiftPressed // 非Shift键模式下直接拖拽
)
```

### 3. Scroller 配置
```javascript
scroller: {
  enabled: true,
  pannable: true,
  modifiers: [] // 应该为空数组
}
```

## 📋 调试清单

- [ ] 确认浏览器控制台已打开
- [ ] 确认在画布空白区域点击
- [ ] 检查是否按住了 Shift 键
- [ ] 查看空白区域检查日志
- [ ] 查看修饰键状态日志
- [ ] 查看拖拽条件判断日志
- [ ] 检查 Scroller 配置状态
- [ ] 确认事件传播链正常

## 🔄 测试用例

### 测试1: 基本拖拽
1. 在画布空白区域按下鼠标左键
2. 拖拽鼠标
3. 松开鼠标
4. 检查画布是否移动

### 测试2: 空格键拖拽
1. 按住 Space 键
2. 在画布任意位置按下鼠标左键
3. 拖拽鼠标
4. 松开鼠标和 Space 键
5. 检查画布是否移动

### 测试3: 不同拖拽模式
1. 点击工具栏的拖拽模式按钮（默认/精确/快速）
2. 重复基本拖拽测试
3. 检查不同模式下的拖拽效果

## 📞 问题反馈

如果通过调试日志发现了具体问题，请记录：
1. 具体的错误日志
2. 操作步骤
3. 浏览器版本
4. 是否在特定条件下才出现问题

这些信息将帮助快速定位和解决问题。