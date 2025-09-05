# ConditionGroup 组件布局优化方案

## 1. 当前问题分析

### 1.1 现状描述
当前 ConditionGroup.vue 组件中的条件配置采用垂直布局方式：
- 标签条件：标签选择器、操作符选择器、值输入框垂直排列
- 行为条件：事件名称、属性配置等垂直排列
- 每个条件项占用较多垂直空间
- 操作按钮独立放置在右侧

### 1.2 存在问题
1. **空间利用率低**：垂直布局导致页面需要大量滚动
2. **视觉密度不够**：条件较多时页面显得冗长
3. **操作效率低**：用户需要频繁滚动查看所有条件
4. **屏幕适配性差**：在宽屏显示器上浪费水平空间

## 2. 优化目标

- 提高空间利用率，减少垂直空间占用
- 改善用户体验，减少滚动操作
- 保持良好的可读性和操作便利性
- 确保响应式适配

## 3. 优化方案设计

### 3.1 布局结构调整

#### 3.1.1 标签条件行优化
**当前结构：**
```
[标签选择器]
[操作符选择器] 
[值输入框]
[操作按钮]
```

**优化后结构：**
```
[标签选择器] [操作符] [值输入框] [+] [-]
```

#### 3.1.2 行为条件优化
**当前结构：**
```
[事件名称]
[属性名] [操作符] [属性值] [删除]
[属性名] [操作符] [属性值] [删除]
```

**优化后结构：**
```
[事件名称] [添加属性]
[属性名] [操作符] [属性值] [删除]
[属性名] [操作符] [属性值] [删除]
```

### 3.2 宽度分配策略

#### 3.2.1 标签条件行宽度分配
- 标签选择器：35% (flex: 0 0 35%)
- 操作符选择器：20% (flex: 0 0 20%)
- 值输入框：30% (flex: 0 0 30%)
- 操作按钮区域：15% (flex: 0 0 15%)

#### 3.2.2 事件属性行宽度分配
- 属性名：30% (flex: 0 0 30%)
- 操作符：20% (flex: 0 0 20%)
- 属性值：35% (flex: 0 0 35%)
- 删除按钮：15% (flex: 0 0 15%)

## 4. CSS 样式优化方案

### 4.1 标签条件行样式

```css
/* 标签条件行 - 水平布局 */
.tag-condition-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 4px;
}

.tag-config {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.tag-config .form-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tag-config .form-group:nth-child(1) {
  flex: 0 0 35%; /* 标签选择器 */
}

.tag-config .form-group:nth-child(2) {
  flex: 0 0 20%; /* 操作符 */
}

.tag-config .form-group:nth-child(3) {
  flex: 0 0 30%; /* 值输入框 */
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 15%;
  justify-content: flex-end;
}

/* 表单标签优化 */
.form-label {
  font-size: 10px;
  color: #666;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 表单控件优化 */
.form-control {
  font-size: 12px;
  min-width: 0;
}
```

### 4.2 事件属性行样式

```css
/* 事件属性行 - 水平布局 */
.event-property-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  margin-bottom: 4px;
}

.property-name {
  flex: 0 0 30%;
  min-width: 0;
}

.property-operator {
  flex: 0 0 20%;
  min-width: 0;
}

.property-value {
  flex: 0 0 35%;
  min-width: 0;
}

.property-actions {
  flex: 0 0 15%;
  display: flex;
  justify-content: flex-end;
}
```

### 4.3 条件项容器优化

```css
/* 条件项包装器 */
.condition-item-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 6px;
  background: white;
  overflow: hidden;
}

/* 条件项头部 - 更紧凑 */
.condition-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  min-height: 28px;
}

.condition-index {
  font-size: 10px;
  color: #86909c;
  background: #e9ecef;
  padding: 1px 6px;
  border-radius: 8px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}
```

### 4.4 响应式适配

```css
/* 平板适配 (768px - 1024px) */
@media (max-width: 1024px) {
  .tag-config .form-group:nth-child(1) {
    flex: 0 0 40%; /* 标签选择器加宽 */
  }
  
  .tag-config .form-group:nth-child(2) {
    flex: 0 0 25%; /* 操作符加宽 */
  }
  
  .tag-config .form-group:nth-child(3) {
    flex: 0 0 35%; /* 值输入框保持 */
  }
}

/* 手机适配 (< 768px) */
@media (max-width: 768px) {
  .tag-condition-row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
  
  .tag-config {
    flex-direction: column;
    gap: 6px;
  }
  
  .tag-config .form-group {
    flex: 1 1 auto;
  }
  
  .tag-actions {
    flex-direction: row;
    justify-content: center;
    flex: none;
  }
  
  .event-property-item {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
  
  .property-name,
  .property-operator,
  .property-value {
    flex: 1 1 auto;
  }
}
```

## 5. 用户体验优化

### 5.1 视觉层次优化
- 使用更浅的背景色区分不同条件行
- 减小内边距，增加信息密度
- 优化按钮尺寸，保持操作便利性

### 5.2 交互优化
- 保持hover效果和焦点状态
- 确保按钮点击区域足够大
- 添加适当的过渡动画

### 5.3 可访问性
- 保持合适的颜色对比度
- 确保键盘导航顺序合理
- 保留必要的提示信息

## 6. 实施步骤

### 6.1 第一阶段：样式调整
1. 修改 `.tag-condition-row` 样式，改为水平布局
2. 调整 `.tag-config` 和 `.form-group` 的flex属性
3. 优化 `.tag-actions` 按钮组布局
4. 测试标签条件的显示效果

### 6.2 第二阶段：事件条件优化
1. 修改 `.event-property-item` 样式
2. 调整属性字段的宽度分配
3. 优化事件配置区域的整体布局
4. 测试行为条件的显示效果

### 6.3 第三阶段：响应式适配
1. 添加媒体查询规则
2. 测试不同屏幕尺寸下的显示效果
3. 调整移动端的布局方案
4. 验证触摸操作的便利性

### 6.4 第四阶段：细节优化
1. 调整间距和颜色
2. 优化动画效果
3. 完善可访问性
4. 进行全面测试

## 7. 预期效果

### 7.1 空间利用率提升
- 垂直空间占用减少约 40%
- 单屏可显示更多条件项
- 减少滚动操作需求

### 7.2 用户体验改善
- 条件配置更加直观
- 操作流程更加顺畅
- 视觉层次更加清晰

### 7.3 适配性增强
- 桌面端充分利用水平空间
- 移动端保持良好可用性
- 不同分辨率下均有良好表现

## 8. 注意事项

1. **渐进式实施**：建议分阶段实施，每个阶段充分测试
2. **兼容性考虑**：确保在不同浏览器下表现一致
3. **性能影响**：新的布局不应影响组件渲染性能
4. **用户反馈**：实施后收集用户反馈，持续优化
5. **回退方案**：准备回退到原有布局的方案，以防出现问题

## 9. 逻辑关系布局设计

### 9.1 树状层级结构设计

#### 9.1.1 整体布局架构
基于图片中展示的条件组结构，采用树状层级布局：

**层级结构示意：**
```
├─ 标签规则 (可选择且/或逻辑)
│  ├─ 条件1: [标签选择器] [操作符] [值] [+] [-]
│  ├─ 且/或 (绿色连接符)
│  └─ 条件2: [标签选择器] [操作符] [值] [+] [-]
├─ 行为 (可选择且/或逻辑)
│  ├─ 事件条件1
│  ├─ 且/或 (绿色连接符)
│  └─ 事件条件2
└─ 存为 (可选择且/或逻辑)
   └─ 存储条件
```

#### 9.1.2 左侧连接线设计
实现树状结构的视觉连接线：

```css
/* 条件组容器 - 树状结构 */
.condition-groups-container {
  position: relative;
  padding-left: 20px;
}

/* 左侧主连接线 */
.condition-groups-container::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  border-radius: 1px;
}

/* 条件组分支连接线 */
.condition-group-card {
  position: relative;
  margin-bottom: 12px;
}

.condition-group-card::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 16px;
  width: 12px;
  height: 2px;
  background: #10b981;
  border-radius: 1px;
}

/* 条件组节点圆点 */
.condition-group-card::after {
  content: '';
  position: absolute;
  left: -16px;
  top: 12px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #10b981;
}
```

### 9.2 统一组级逻辑控制设计

#### 9.2.1 设计理念
为了简化用户操作和提高逻辑关系的清晰度，采用统一的组级逻辑控制方案：
- 每个条件组只有一个全局的且/或逻辑控制
- 组内所有条件都遵循这个统一的逻辑关系
- 移除条件间的单独逻辑连接符，避免复杂性
- 通过视觉设计让用户明确知道所有条件的逻辑关系

#### 9.2.2 统一逻辑指示器设计

```css
/* 条件组统一逻辑指示器 */
.group-logic-indicator {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
  color: #065f46;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
  z-index: 3;
}

.group-logic-indicator.or-logic {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
  color: #92400e;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.2);
}

/* 条件项间的连接线 - 不显示逻辑符 */
.condition-connector-line {
  position: relative;
  margin: 4px 0;
  padding-left: 24px;
}

.condition-connector-line::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  width: 12px;
  height: 2px;
  background: #10b981;
  transform: translateY(-50%);
}

/* 条件组内容区域 */
.condition-group-content {
  position: relative;
}

/* 统一逻辑关系的视觉提示 */
.condition-group-content::before {
  content: attr(data-logic-type);
  position: absolute;
  left: -16px;
  top: 20px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  background: linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
  color: #065f46;
  font-size: 9px;
  font-weight: 600;
  padding: 8px 2px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.15);
  z-index: 2;
}

.condition-group-content[data-logic-type="或"]::before {
  background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
  color: #92400e;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.15);
}
```

#### 9.2.3 条件项布局优化

```css
/* 条件项容器 - 统一逻辑关系下的条件 */
.condition-item-wrapper {
  position: relative;
  margin-left: 16px;
  margin-bottom: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  overflow: hidden;
}

/* 条件项左侧连接线 */
.condition-item-wrapper::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 20px;
  width: 16px;
  height: 2px;
  background: #10b981;
}

/* 条件项节点 */
.condition-item-wrapper::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 16px;
  width: 6px;
  height: 6px;
  background: #10b981;
  border: 1px solid white;
  border-radius: 50%;
}

/* 条件行内容 */
.tag-condition-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  margin: 0;
}

/* 条件项序号指示器 */
.condition-item-index {
  position: absolute;
  left: -28px;
  top: 12px;
  width: 16px;
  height: 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: #6b7280;
  z-index: 2;
}

/* 多条件时的视觉分组 */
.condition-item-wrapper:not(:last-child) {
  border-bottom: 2px solid #10b981;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.condition-item-wrapper:not(:first-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  margin-top: -1px;
}
```

### 9.3 条件组头部统一逻辑控制

#### 9.3.1 全局逻辑控制器设计
在条件组头部设置统一的逻辑控制器，控制组内所有条件的逻辑关系：

```css
/* 条件组头部 */
.condition-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
  position: relative;
}

/* 条件组标题区域 */
.group-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.group-description {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 全局逻辑控制区域 */
.global-logic-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logic-control-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* 统一逻辑切换器 */
.unified-logic-toggle {
  display: flex;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.unified-logic-btn {
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 50px;
}

.unified-logic-btn.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: scale(1.02);
}

.unified-logic-btn.active.or-logic {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.unified-logic-btn:hover:not(.active) {
  background: #f9fafb;
  color: #374151;
  transform: translateY(-1px);
}

/* 逻辑状态指示器 */
.logic-status-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.logic-status-indicator.or-logic {
  background: #f59e0b;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}
```

#### 9.3.2 条件组操作按钮区域

```css
/* 条件组操作按钮 */
.group-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/* 条件计数器 */
.condition-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
  background: #f9fafb;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.condition-counter .count-number {
  font-weight: 600;
  color: #10b981;
}

/* 添加条件按钮 */
.add-condition-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 11px;
  color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #10b981;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-condition-btn:hover {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
}

/* 删除条件组按钮 */
.delete-group-btn {
  display: flex;
  align-items: center;
  padding: 6px;
  color: #ef4444;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-group-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

/* 折叠/展开按钮 */
.collapse-toggle-btn {
  display: flex;
  align-items: center;
  padding: 4px;
  color: #6b7280;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-toggle-btn:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

/* 逻辑关系说明提示 */
.logic-explanation {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 1000;
}

.condition-group-header:hover .logic-explanation {
  opacity: 1;
}
```

### 9.4 统一逻辑控制的交互设计

#### 9.4.1 全局逻辑状态反馈
当用户切换全局逻辑时，整个条件组提供视觉反馈：

```css
/* 全局逻辑状态反馈 */
.condition-group-wrapper.and-logic {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, rgba(240, 253, 244, 0.3) 100%);
}

.condition-group-wrapper.or-logic {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, rgba(255, 251, 235, 0.3) 100%);
}

/* 条件项统一逻辑指示 */
.condition-item-wrapper.unified-and {
  border-left: 2px solid #10b981;
}

.condition-item-wrapper.unified-or {
  border-left: 2px solid #f59e0b;
}

/* 逻辑切换动画 */
.unified-logic-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.unified-logic-btn.switching {
  transform: scale(0.95);
  opacity: 0.7;
}

/* 条件组逻辑变更动画 */
.condition-group-wrapper.logic-changing {
  transform: scale(1.01);
  transition: transform 0.2s ease;
}

.condition-group-wrapper.logic-changing .condition-item-wrapper {
  animation: logicPulse 0.4s ease;
}

@keyframes logicPulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}
```

#### 9.4.2 统一逻辑说明和预览
提供清晰的逻辑关系说明，帮助用户理解统一逻辑控制的作用：

```css
/* 统一逻辑说明面板 */
.unified-logic-explanation {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 100;
}

.global-logic-controls:hover .unified-logic-explanation {
  opacity: 1;
  transform: translateY(0);
}

/* 说明内容 */
.logic-explanation-content {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.5;
}

.logic-explanation-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.logic-example {
  background: #f9fafb;
  padding: 6px 8px;
  border-radius: 4px;
  margin-top: 6px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 10px;
}

.logic-example.and-example {
  border-left: 3px solid #10b981;
}

.logic-example.or-example {
  border-left: 3px solid #f59e0b;
}

/* 条件计数和逻辑状态 */
.logic-status-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #6b7280;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.status-indicator.or-status {
  background: #f59e0b;
}
```

#### 9.4.3 响应式适配
确保统一逻辑控制在不同屏幕尺寸下都能正常工作：

```css
/* 移动端适配 */
@media (max-width: 768px) {
  .condition-group-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
  }
  
  .global-logic-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .unified-logic-toggle {
    flex: 1;
    max-width: 200px;
  }
  
  .unified-logic-btn {
    flex: 1;
    padding: 8px 12px;
    font-size: 11px;
  }
  
  .condition-counter {
    order: -1;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .unified-logic-explanation {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 320px;
    border-radius: 8px;
  }
  
  .group-logic-indicator {
    font-size: 8px;
    padding: 1px 4px;
  }
  
  .condition-group-content::before {
    font-size: 8px;
    padding: 6px 1px;
  }
  
  .logic-control-label {
    display: none;
  }
}

/* 超小屏幕 */
@media (max-width: 360px) {
  .unified-logic-btn {
    font-size: 10px;
    padding: 6px 8px;
    min-width: 40px;
  }
  
  .condition-counter {
    font-size: 10px;
    padding: 3px 6px;
  }
}
```

### 9.5 响应式逻辑显示方案

#### 9.5.1 不同屏幕尺寸的适配

```css
/* 桌面端 - 完整树状结构 */
@media (min-width: 1024px) {
  .condition-groups-container {
    padding-left: 24px;
  }
  
  .condition-group-card::before {
    width: 16px;
  }
  
  .condition-item-wrapper {
    margin-left: 20px;
  }
  
  .logic-connector-badge {
    font-size: 11px;
    padding: 4px 12px;
  }
}

/* 平板端 - 简化树状结构 */
@media (min-width: 768px) and (max-width: 1023px) {
  .condition-groups-container {
    padding-left: 16px;
  }
  
  .condition-groups-container::before {
    width: 1px;
  }
  
  .condition-group-card::before {
    width: 8px;
  }
  
  .condition-item-wrapper {
    margin-left: 12px;
  }
  
  .logic-connector-badge {
    font-size: 10px;
    padding: 3px 8px;
  }
}

/* 移动端 - 扁平化布局 */
@media (max-width: 767px) {
  .condition-groups-container {
    padding-left: 0;
  }
  
  .condition-groups-container::before {
    display: none;
  }
  
  .condition-group-card::before,
  .condition-group-card::after {
    display: none;
  }
  
  .condition-item-wrapper {
    margin-left: 0;
  }
  
  .condition-item-wrapper::before,
  .condition-item-wrapper::after {
    display: none;
  }
  
  .condition-logic-connector {
    padding-left: 0;
    justify-content: center;
  }
  
  .condition-logic-connector::before {
    display: none;
  }
  
  .logic-connector-badge {
    font-size: 12px;
    padding: 6px 16px;
  }
}
```

#### 9.5.2 逻辑关系可读性优化

```css
/* 逻辑路径高亮 */
.condition-groups-container.logic-highlight .condition-groups-container::before {
  background: linear-gradient(180deg, #10b981 0%, #059669 50%, #047857 100%);
  width: 3px;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
  animation: pathPulse 2s ease-in-out infinite;
}

@keyframes pathPulse {
  0%, 100% { 
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
  }
  50% { 
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.6);
  }
}

/* 活跃条件组高亮 */
.condition-group-card.active {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.condition-group-card.active::before,
.condition-group-card.active::after {
  background: #059669;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

/* 条件项激活状态 */
.condition-item-wrapper.active {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.condition-item-wrapper.active::before,
.condition-item-wrapper.active::after {
  background: #059669;
}

/* 逻辑连接符激活状态 */
.logic-connector-badge.active {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  transform: scale(1.05);
}

/* 错误状态显示 */
.condition-item-wrapper.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.condition-item-wrapper.error::before,
.condition-item-wrapper.error::after {
  background: #ef4444;
}

.logic-connector-badge.error {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  border-color: #ef4444;
  color: #991b1b;
}
```

### 9.6 用户体验优化功能

#### 9.6.1 逻辑关系预览面板

```css
/* 浮动逻辑预览面板 */
.logic-preview-panel {
  position: fixed;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 280px;
  font-size: 12px;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-50%) translateX(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logic-preview-panel.visible {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

/* 预览面板标题 */
.logic-preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

/* 逻辑关系项 */
.logic-preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #f9fafb;
  transition: background 0.2s ease;
}

.logic-preview-item:hover {
  background: #f0fdf4;
}

.logic-preview-item .logic-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}

.logic-preview-item.or-logic .logic-indicator {
  background: #f59e0b;
}

.logic-preview-item .logic-text {
  flex: 1;
  font-size: 11px;
  color: #6b7280;
}

.logic-preview-item .logic-count {
  font-size: 10px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;
}

/* 预览面板关闭按钮 */
.logic-preview-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.logic-preview-close:hover {
  background: #f3f4f6;
  color: #6b7280;
}
```

## 10. 技术实现要点

### 10.1 统一逻辑控制的数据结构
为支持统一逻辑控制，需要调整数据结构：

```javascript
// 条件组数据结构
const conditionGroup = {
  id: 'group_1',
  type: 'tag', // tag, behavior, detail
  title: '标签规则',
  globalLogic: 'and', // 统一的逻辑关系：'and' 或 'or'
  conditions: [
    {
      id: 'condition_1',
      field: '用户标签',
      operator: '等于',
      value: 'VIP用户'
    },
    {
      id: 'condition_2', 
      field: '注册时间',
      operator: '大于',
      value: '30天前'
    },
    {
      id: 'condition_3',
      field: '活跃度',
      operator: '大于等于', 
      value: '80分'
    }
  ]
};

// 逻辑切换方法
const toggleGroupLogic = (groupId) => {
  const group = findGroupById(groupId);
  group.globalLogic = group.globalLogic === 'and' ? 'or' : 'and';
  
  // 触发UI更新
  updateGroupLogicDisplay(groupId, group.globalLogic);
  
  // 触发逻辑变更动画
  triggerLogicChangeAnimation(groupId);
};
```

### 10.2 统一逻辑控制的CSS实现

```css
/* 统一逻辑状态管理 */
.condition-group-wrapper {
  --logic-color: #10b981;
  --logic-bg: rgba(240, 253, 244, 0.3);
  --logic-border: #10b981;
}

.condition-group-wrapper[data-logic="or"] {
  --logic-color: #f59e0b;
  --logic-bg: rgba(255, 251, 235, 0.3);
  --logic-border: #f59e0b;
}

/* 使用CSS变量实现动态样式 */
.condition-group-wrapper {
  border-left: 4px solid var(--logic-border);
  background: linear-gradient(135deg, var(--logic-bg) 0%, transparent 100%);
  transition: all 0.3s ease;
}

.condition-item-wrapper {
  border-left: 2px solid var(--logic-color);
}

.unified-logic-btn.active {
  background: var(--logic-color);
  box-shadow: 0 2px 8px rgba(var(--logic-color), 0.3);
}

/* 逻辑切换动画 */
@keyframes logicTransition {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.02);
    filter: brightness(1.1);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.condition-group-wrapper.logic-changing {
  animation: logicTransition 0.5s ease;
}
```

### 10.3 Vue组件实现示例

```vue
<template>
  <div 
    class="condition-group-wrapper"
    :data-logic="groupData.globalLogic"
    :class="{
      'and-logic': groupData.globalLogic === 'and',
      'or-logic': groupData.globalLogic === 'or',
      'logic-changing': isLogicChanging
    }"
  >
    <!-- 条件组头部 -->
    <div class="condition-group-header">
      <div class="group-title-section">
        <h4 class="group-title">{{ groupData.title }}</h4>
        <span class="group-description">
          {{ getLogicDescription(groupData.globalLogic, groupData.conditions.length) }}
        </span>
      </div>
      
      <div class="global-logic-controls">
        <span class="logic-control-label">逻辑关系：</span>
        <div class="unified-logic-toggle">
          <button 
            class="unified-logic-btn"
            :class="{ active: groupData.globalLogic === 'and' }"
            @click="toggleLogic('and')"
          >
            且
          </button>
          <button 
            class="unified-logic-btn"
            :class="{ active: groupData.globalLogic === 'or', 'or-logic': groupData.globalLogic === 'or' }"
            @click="toggleLogic('or')"
          >
            或
          </button>
        </div>
        
        <div class="condition-counter">
          <span class="count-number">{{ groupData.conditions.length }}</span>
          <span>个条件</span>
        </div>
      </div>
    </div>
    
    <!-- 条件列表 -->
    <div 
      class="condition-group-content"
      :data-logic-type="groupData.globalLogic === 'and' ? '且' : '或'"
    >
      <div 
        v-for="(condition, index) in groupData.conditions"
        :key="condition.id"
        class="condition-item-wrapper"
        :class="{
          'unified-and': groupData.globalLogic === 'and',
          'unified-or': groupData.globalLogic === 'or'
        }"
      >
        <div class="condition-item-index">{{ index + 1 }}</div>
        <!-- 条件内容 -->
        <ConditionItem :condition="condition" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLogicChanging: false
    }
  },
  methods: {
    toggleLogic(newLogic) {
      if (this.groupData.globalLogic === newLogic) return;
      
      this.isLogicChanging = true;
      this.groupData.globalLogic = newLogic;
      
      // 动画结束后重置状态
      setTimeout(() => {
        this.isLogicChanging = false;
      }, 500);
      
      // 触发逻辑变更事件
      this.$emit('logic-changed', {
        groupId: this.groupData.id,
        newLogic: newLogic
      });
    },
    
    getLogicDescription(logic, count) {
      if (count <= 1) return '单个条件';
      return logic === 'and' 
        ? `所有${count}个条件都必须满足`
        : `${count}个条件中任意一个满足即可`;
    }
  }
}
</script>
```

## 11. 风险评估

### 11.1 低风险
- CSS样式调整
- 响应式布局优化
- 逻辑连接符的视觉设计

### 11.2 中风险
- 表单控件宽度分配可能需要多次调整
- 不同内容长度下的显示效果需要验证
- 逻辑切换交互的用户学习成本

### 11.3 高风险
- 移动端布局的复杂性
- 现有用户的使用习惯改变
- 复杂逻辑关系的可读性挑战

建议在开发环境充分测试后，先在小范围用户中试用，收集反馈后再全面推广。特别需要关注逻辑关系的直观性和操作便利性。

## 12. 实施计划

### 12.1 第一阶段：数据结构调整（1天）
1. **数据模型更新**
   - 为条件组添加 `globalLogic` 字段
   - 移除条件间的单独逻辑字段
   - 更新相关的数据处理逻辑

2. **API接口调整**
   - 修改保存和读取逻辑
   - 确保向后兼容性
   - 添加数据迁移脚本

### 12.2 第二阶段：基础布局优化（1-2天）
1. **表单布局调整**
   - 修改 `.tag-condition-row` 的 flex 布局
   - 调整各表单控件的宽度分配
   - 实现基本的水平排列

2. **统一逻辑控制器**
   - 实现条件组头部的逻辑切换器
   - 添加条件计数器
   - 移除条件间的逻辑连接符

### 12.3 第三阶段：视觉设计实现（2天）
1. **统一逻辑指示器**
   - 实现全局逻辑状态的视觉反馈
   - 添加条件项的统一逻辑指示
   - 完善逻辑状态的颜色系统

2. **响应式适配**
   - 添加移动端断点样式
   - 优化小屏幕下的逻辑控制器显示
   - 确保触摸设备的可用性

### 12.4 第四阶段：交互体验优化（1-2天）
1. **动画和微交互**
   - 添加逻辑切换动画
   - 实现条件组状态变更的视觉反馈
   - 完善hover和focus效果

2. **用户体验优化**
   - 添加逻辑关系说明提示
   - 实现逻辑状态的实时预览
   - 优化操作流程的引导

### 12.5 第五阶段：测试和发布（1-2天）
1. **全面测试**
   - 功能测试（重点测试逻辑切换）
   - 兼容性测试
   - 用户体验测试
   - 数据迁移测试

2. **文档和培训**
   - 更新用户使用指南
   - 制作逻辑控制的操作说明
   - 准备用户培训材料
   - 记录变更内容和注意事项

### 12.6 关键里程碑
- **Day 1**: 数据结构调整完成
- **Day 3**: 基础布局和逻辑控制器完成
- **Day 5**: 视觉设计和响应式适配完成
- **Day 7**: 交互优化和用户体验完成
- **Day 8-9**: 测试和发布准备完成

### 12.7 风险缓解措施
1. **数据兼容性**
   - 提供数据迁移脚本
   - 保留旧版本数据格式的读取能力
   - 设置灰度发布策略

2. **用户适应性**
   - 提供操作引导和帮助文档
   - 设置功能开关，允许渐进式推广
   - 收集用户反馈并快速响应