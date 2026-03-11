# 事件中心UI设计规范

## 1. 设计原则

### 1.1 一致性原则
- 保持界面元素、交互方式、视觉风格的一致性
- 统一的颜色体系、字体规范、间距标准
- 统一的图标风格和组件样式

### 1.2 可用性原则
- 简洁明了的界面布局，降低用户学习成本
- 清晰的信息层级，重要信息突出显示
- 友好的错误提示和操作反馈

### 1.3 专业桌面端设计原则
**专业级桌面体验**
- **超大画布设计**：基于1920×1080固定分辨率，充分利用大屏空间
- **专业级信息密度**：单屏展示复杂数据仪表板，减少页面切换
- **高级交互体系**：右键上下文菜单、悬停详情、拖拽操作、键盘快捷键
- **多窗口专业协作**：支持浏览器多标签页、多显示器扩展桌面
- **专业工具集成**：顶部工具栏、侧边面板、底部状态栏等专业布局

**专业屏幕适配**
- **标准分辨率**：1920×1080（专业级100%缩放基准）
- **专业显示器**：支持2560×1440、3840×2160高分辨率显示
- **高DPI专业优化**：125%、150%、200%缩放保持界面清晰锐利
- **多屏专业协作**：支持扩展桌面、镜像显示、分屏操作
- **色彩准确度**：支持sRGB、Adobe RGB专业色彩空间

## 2. 色彩体系

### 2.1 主色调
```css
/* 主品牌色 */
--primary-color: #165DFF;
--primary-light: #E8F2FF;
--primary-dark: #0E42D2;

/* 功能色 */
--success-color: #00B42A;
--warning-color: #FF7D00;
--error-color: #F53F3F;
--info-color: #14C9C9;

/* 中性色 */
--text-primary: #1D2129;
--text-secondary: #4E5969;
--text-disabled: #C9CDD4;
--border-color: #E5E6EB;
--background-color: #F2F3F5;
--white: #FFFFFF;
```

### 2.2 色彩使用规范
- **主色调**：用于主要按钮、链接、选中状态、重要提示
- **功能色**：用于状态标识、操作反馈、数据可视化
- **中性色**：用于文字、边框、背景、分割线

## 3. 字体规范

### 3.1 字体家族
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

### 3.2 字体大小
```css
/* 标题字体 */
--font-size-title-1: 20px;  /* 一级标题 */
--font-size-title-2: 18px;  /* 二级标题 */
--font-size-title-3: 16px;  /* 三级标题 */

/* 正文字体 */
--font-size-large: 16px;    /* 大字体 */
--font-size-base: 14px;     /* 标准字体 */
--font-size-small: 12px;    /* 小字体 */

/* 字体粗细 */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
```

### 3.3 行高规范
```css
--line-height-tight: 1.2;   /* 紧凑 */
--line-height-normal: 1.5;  /* 标准 */
--line-height-loose: 1.8;   /* 宽松 */
```

## 4. 间距系统

### 4.1 基础间距
```css
--spacing-1: 4px;   /* xs */
--spacing-2: 8px;   /* sm */
--spacing-3: 12px;  /* md */
--spacing-4: 16px;  /* lg */
--spacing-5: 20px;  /* xl */
--spacing-6: 24px;  /* 2xl */
--spacing-8: 32px;  /* 3xl */
--spacing-10: 40px; /* 4xl */
```

### 4.2 间距使用原则
- 组件内部间距使用小间距（xs-md）
- 组件之间间距使用中间距（lg-xl）
- 页面区块间距使用大间距（2xl-4xl）
- 保持8的倍数原则，确保视觉协调

## 5. 组件规范

### 5.1 按钮规范

**主要按钮**
```css
.a-button-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white);
  border-radius: 6px;
  padding: 6px 16px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}
```

**次要按钮**
```css
.a-button-secondary {
  background-color: var(--white);
  border-color: var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 6px 16px;
  font-size: var(--font-size-base);
}
```

**文字按钮**
```css
.a-button-text {
  background-color: transparent;
  border: none;
  color: var(--primary-color);
  padding: 6px 8px;
  font-size: var(--font-size-base);
}
```

### 5.2 输入框规范
```css
.a-input {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background-color: var(--white);
}

.a-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}
```

### 5.3 表格规范
```css
.a-table {
  background-color: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.a-table th {
  background-color: var(--background-color);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  padding: 12px 16px;
}

.a-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.a-table tr:hover {
  background-color: var(--background-color);
}
```

### 5.4 卡片规范
```css
.a-card {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.a-card-header {
  font-size: var(--font-size-title-3);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 16px;
}
```

## 6. 图标规范

### 6.1 图标风格
- 使用线性图标，线条粗细统一为2px
- 图标尺寸标准化：16px、20px、24px
- 保持图标风格简洁、现代、易识别

### 6.2 常用图标
```css
/* 操作图标 */
.icon-plus      /* 新增 */
.icon-edit      /* 编辑 */
.icon-delete    /* 删除 */
.icon-search    /* 搜索 */
.icon-filter    /* 筛选 */
.icon-sort      /* 排序 */

/* 状态图标 */
.icon-success   /* 成功 */
.icon-warning   /* 警告 */
.icon-error     /* 错误 */
.icon-info      /* 信息 */

/* 导航图标 */
.icon-arrow-left    /* 返回 */
.icon-arrow-right   /* 前进 */
.icon-arrow-up      /* 上升 */
.icon-arrow-down    /* 下降 */
```

## 7. 布局规范

### 7.1 页面布局
```css
/* 页面容器 */
.page-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

/* 内容区域 */
.content-area {
  background-color: var(--white);
  border-radius: 8px;
  padding: 24px;
  margin-top: 16px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
```

### 7.2 栅格系统
```css
/* 基于24栅格系统 */
.a-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
}

.a-col {
  padding: 0 12px;
  flex: 0 0 auto;
}

.a-col-6  { flex: 0 0 25%; }    /* 6/24 */
.a-col-8  { flex: 0 0 33.33%; } /* 8/24 */
.a-col-12 { flex: 0 0 50%; }    /* 12/24 */
.a-col-16 { flex: 0 0 66.67%; } /* 16/24 */
.a-col-18 { flex: 0 0 75%; }    /* 18/24 */
.a-col-24 { flex: 0 0 100%; }   /* 24/24 */
```

## 8. 交互规范

### 8.1 按钮交互
```css
/* 悬停效果 */
.a-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

/* 点击效果 */
.a-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 禁用状态 */
.a-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 8.2 表单交互
- 实时验证：输入时即时验证并给出反馈
- 错误提示：在输入框下方显示具体错误信息
- 成功反馈：操作成功后显示成功提示
- 加载状态：长时间操作显示加载动画

### 8.3 表格交互
- 排序：点击表头进行排序，显示排序图标
- 筛选：表头提供筛选功能，支持多条件筛选
- 分页：底部显示分页控件，支持页码跳转
- 批量操作：支持多选，提供批量操作按钮

## 9. 响应式设计

### 9.1 断点设置
```css
/* 响应式断点 */
--screen-xs: 480px;   /* 超小屏 */
--screen-sm: 768px;   /* 小屏 */
--screen-md: 1024px;  /* 中屏 */
--screen-lg: 1440px;  /* 大屏 */
--screen-xl: 1920px;  /* 超大屏 */
```

### 9.2 适配策略
- **桌面端优先**：基于1920×1080设计，向下适配
- **平板适配**：768px-1024px，调整布局和字体大小
- **移动端**：<768px，简化功能，优化触摸体验

## 10. 可访问性规范

### 10.1 键盘导航
- 支持Tab键顺序导航
- 提供键盘快捷键操作
- 焦点状态清晰可见

### 10.2 屏幕阅读器
- 为图片提供alt属性
- 使用语义化HTML标签
- 提供ARIA标签支持

### 10.3 色彩对比
- 确保文字与背景对比度≥4.5:1
- 重要信息不依赖颜色传达
- 提供色盲友好的配色方案

## 11. 动效规范

### 11.1 过渡动效
```css
/* 标准过渡 */
.transition-standard {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 减速过渡 */
.transition-decelerate {
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

/* 加速过渡 */
.transition-accelerate {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}
```

### 11.2 动效使用场景
- **页面切换**：使用减速过渡，时长300ms
- **悬停效果**：使用标准过渡，时长200ms
- **展开收起**：使用加速过渡，时长200ms
- **加载动画**：循环动画，时长1000ms

## 12. 设计交付规范

### 12.1 设计稿规范
- 使用1440×900画布尺寸
- 提供完整的交互流程图
- 标注所有间距、颜色、字体大小
- 提供切图资源和图标文件

### 12.2 前端实现规范
- 使用CSS变量定义设计token
- 组件化开发，提高复用性
- 提供完整的样式文档
- 支持主题定制和扩展