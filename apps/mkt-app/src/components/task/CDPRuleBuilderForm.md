# CDPRuleBuilderForm 组件说明

> 路径：`apps/mkt-app/src/components/task/CDPRuleBuilderForm.vue`
> 状态：截至 2026-07-29 的当前实现描述

## 1. 整体定位

**CDPRuleBuilderForm** 是 mkt-app 营销域里"人群圈选 / 规则创建"的核心组件。它承担**用户画像圈选**的规则编辑功能——把多个"条件组"组合起来，定义"满足 / 排除"的人群范围。

适用场景：营销域的人群圈选页（CDP / 客群圈选）。

## 2. 顶层结构

```
┌─ cdp-rule-builder ─────────────────────────────────────┐
│ ┌─ summary-bar（顶部摘要）────────────────────────┐    │
│ │  逻辑摘要：满足/排除条件    预估：6,651 人       │    │
│ └────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─ rule-section（客群逻辑 / 满足区）─────────────┐     │
│ │  [+ 添加条件组]                                 │     │
│ └────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─ rule-section exclude-section（排除逻辑）─────┐     │
│ │  [+ 添加排除条件组]                             │     │
│ └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## 3. 核心概念

| 概念 | 含义 |
|------|------|
| **条件组（group）** | 一组条件的容器，每个组有自己的 AND/OR（组内关系） |
| **条件（condition）** | 单条规则："字段 + 操作符 + 值"（如"城市 包含 北京"） |
| **满足区 / 排除区** | 满足区=包含的人群；排除区=从满足区里去掉的人群 |
| **组间 AND/OR** | 满足区所有组之间的统一关系（满足区初始为 AND，排除区初始为 OR） |

## 4. 数据模型

```typescript
const ruleData = {
  ruleGroups: [           // 满足区组列表
    {
      id: string,
      name: string,                          // 条件组名称（可编辑）
      groupOperator: 'AND' | 'OR',         // 组内条件间的关系
      conditions: [
        {
          id: string,
          fieldId: string,                   // 选中的字段（标签或事件）
          operator: string,                  // 操作符（包含、=、≥ 等）
          value: any,                        // 单值
          values: any[],                     // 多值（如多选）
          timeWindowType: 'recent7' | 'recent30' | 'recent90' | 'custom' | null,
          timeWindowCustom: [Date, Date] | null
        }
      ]
    }
  ],
  excludeGroups: [...],                       // 排除区（结构同 ruleGroups）
  crossGroupOperator: 'AND' | 'OR',           // 满足区组间关系
  crossExcludeGroupOperator: 'AND' | 'OR'     // 排除区组间关系
}
```

## 5. 条件组卡片结构

```
┌─ rule-group-card（条件组卡片）───────────────────┐
│ ┌─ group-header ───────────────────────────┐    │
│ │ [输入框：条件组名称]              [🗑]  │    │
│ └─────────────────────────────────────────┘    │
│                                                   │
│ [且/或]  ┌─ conditions-list ──────────────┐     │
│   ┃      │  [🏷️ 标签] 城市 ▾ 包含 ▾ [X] │     │
│   ┃      │  [⚡ 事件] 加购 ▾ 发生 [X]   │     │
│   ┃      │  [+ 添加标签] [+ 添加事件]    │     │
│   ┃      └────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
```

### 5.1 元素清单

| 元素 | 作用 |
|------|------|
| `group-header` | 名称输入 + 删除按钮 |
| `group-operator` | **左侧**的"且/或" + 竖向轨道（组内关系） |
| `conditions-list` | 右侧的条件行 + 添加按钮 |

### 5.2 条件行结构

| 元素 | 作用 |
|------|------|
| `condition-type` | 🏷️ 标签（绿）/ ⚡ 事件（橙）/ 未选（灰） |
| `condition-field` | 字段下拉选择 |
| `condition-operator` | 操作符下拉选择（包含、=、≥、< 等） |
| `condition-value` | 值输入（输入框 / 下拉 / 时间范围） |
| `condition-delete` | 删除该条条件（仅多条时显示） |

## 6. "且/或"的两层语义

| 层级 | 字段 | 作用 |
|------|------|------|
| **组内** | `group.groupOperator` | 一个组内多条条件之间的关系（AND=全满足 / OR=任一满足） |
| **组间** | `ruleData.crossGroupOperator` | 多个组之间的关系（满足区 / 排除区各一个） |

### 6.1 组内 AND/OR（`group-operator`）

- **位置**：每张条件组卡片的**左外侧**
- **视觉**：
  - 左侧 2px 竖向轨道，**贯穿整个卡片高度**
  - 上下各 8px 短横（`::before/::after`），形成"括号"视觉
  - 中间圆角描边胶囊（**蓝=AND / 紫=OR**）
  - 胶囊**位于轨道垂直中点**（用 `position: absolute; top: 50%`）
- **交互**：点击胶囊切换 `AND ↔ OR`
- **绑定**：`group-content[data-group-op="..."]` 决定轨道 + 胶囊颜色

### 6.2 组间 AND/OR（`cross-group-operator`）

- **位置**：在两张卡片**之间**的左外侧
- **视觉**：
  - 固定 48px 高度的"短竖线 + 居中胶囊"容器
  - 上下各 15px 短竖线
  - 中间圆角描边胶囊（**蓝=AND / 紫=OR**）
  - 胶囊**位于容器垂直中点**（`position: absolute; top: 50%`）
- **交互**：点击胶囊切换 `AND ↔ OR`
- **绑定**：`cross-group-wrapper[data-cross-op="..."]` 决定轨道 + 胶囊颜色

### 6.3 差异

| 维度 | 组内 | 组间 |
|------|------|------|
| 容器 | rule-group-card（动态高度） | 固定 48px 容器 |
| 位置 | 卡片左外侧 | 卡片之间的左外侧 |
| 数量 | 每张卡片 1 个 | N 张卡片有 N-1 个 |
| 视觉形态 | 贯穿整个卡片 + 短横括号 | 短竖线 + 居中胶囊 |

## 7. 交互

| 操作 | 函数 | 说明 |
|------|------|------|
| 添加条件组 | `addGroup()` | 在 ruleGroups 末尾 push 一个新 group |
| 添加排除组 | `addExcludeGroup()` | 在 excludeGroups 末尾 push |
| 删除条件组 | `removeGroup(groupIndex)` | splice 数组 |
| 添加标签条件 | `addTagCondition(groupIndex)` | push 一个 fieldId=null 的 condition |
| 添加事件条件 | `addEventCondition(groupIndex)` | 同上 |
| 删除条件 | `removeCondition(groupIndex, condIndex)` | splice |
| 字段变化 | `onFieldChange(groupIndex, condIndex, fieldId)` | 重置 value/values/operator/timeWindowType |
| 切换组内 AND/OR | 点击 group-operator-badge | 直接赋值 `group.groupOperator` |
| 切换组间 AND/OR | 点击 cross-group-badge | 调用 `toggleCrossGroupOperator()` |
| 切换排除组间 | 点击 cross-group-badge（exclude） | 调用 `toggleCrossExcludeGroupOperator()` |

## 8. 计算属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `estimatedCount` | `computed` | 预估人数（mock 值 6651） |
| `logicSummary` | `computed` | 逻辑摘要文本（如"城市 包含 且 加购 发生过"） |

## 9. CSS 类清单（50 个）

### 9.1 布局容器（6 个）

- `.cdp-rule-builder`
- `.rule-section` / `.exclude-section`
- `.section-header` / `.section-title`
- `.summary-bar` / `.add-group-row` / `.add-condition-row`

### 9.2 摘要区（6 个）

- `.logic-summary` / `.summary-label` / `.summary-text`
- `.estimate-count` / `.estimate-label` / `.estimate-value`

### 9.3 组间且/或（4 个 + 2 修饰）

- `.cross-group-wrapper` (含 `[data-cross-op="AND|OR"]`)
- `.cross-group-operator` (含 `.exclude-cross`)
- `.cross-group-line` (含 `.cross-group-line-top` / `.cross-group-line-bottom`)
- `.cross-group-badge` (含 `:hover`)

### 9.4 条件组卡片（7 个 + 2 修饰）

- `.rule-group-card` (含 `.exclude-card`)
- `.group-header` / `.group-name-input`
- `.group-content` (含 `[data-group-op="AND|OR"]`)
- `.group-operator` (含 `::before/::after`)
- `.group-operator-line` / `.group-operator-badge`

### 9.5 条件行（9 个 + 2 修饰）

- `.conditions-list` (含 `.has-border`)
- `.condition-row` / `.condition-type`
- `.type-tag` (含 `.type-tag-empty`)
- `.condition-field` / `.condition-operator` / `.condition-value`
- `.condition-delete` / `.event-hint`

## 10. 视觉风格

| 元素 | 样式 |
|------|------|
| 卡片边框 | **虚线** (#c9cdd4) + 圆角 6px + `margin-left: 12px` |
| 卡片头 | **透明背景**（无深色块） |
| 卡片轨道 | 左侧 2px 竖线，**贯穿整个卡片**高度 |
| 短横括号 | 卡片**顶部 + 底部** 各 8px 短横（`::before/::after`） |
| 胶囊 | 圆角描边，**蓝=AND / 紫=OR**，可点击切换 |
| 条件 tag | 🏷️ 标签（绿）/ ⚡ 事件（橙）/ 未选（灰） |
| 排除区卡片 | 边框用红色虚线 (#fac8c8) + 浅红背景 (#fff8f8) |
| 满足区组间默认 | AND（蓝） |
| 排除区组间默认 | OR（紫） |

## 11. 数据流向

```
┌─────────────────────────────────────────────────────┐
│ 父组件（CDP / 客群圈选页）                            │
│   │                                                  │
│   ├─ <CDPRuleBuilderForm :initial="ruleData" />    │
│   │                                                  │
│   ├─ @save="handleSave"                             │
│   │                                                  │
│   └─ 拿到编辑后的 ruleData → 提交后端 → 返回圈选人数 │
└─────────────────────────────────────────────────────┘
```

## 12. 使用入口

- **直接引用**：[`audience-create.vue`](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/mkt-app/src/pages/customer/audience-system/audience-create.vue)（人群创建页"圈选规则"标签）
- **路由**：`/marketing/exploration/customer-center/audience-system/audience-create`

## 13. 后续改造方向

待办事项（按火山引擎风格对齐）：

1. **组内"且"位置**：当前在条件行**中点**（已通过 `position: absolute; top: 50%` 实现），需继续微调视觉
2. **轨道短横长度**：当前 8px 短横，可能太短
3. **卡片缩进**：`margin-left: 12px + padding-left: 12px` 双重缩进，可考虑合并
4. **预估人数**：当前 mock 6651，可对接后端 API
5. **更多条件类型**：当前只有"标签 / 事件"，火山引擎还有"人群群 / 期望数据 / 主体属性"

## 14. 修改历史

| 轮次 | 改动 |
|------|------|
| Round 1 | 卡片边框 solid → dashed、header 背景透明化、卡片缩进 12px |
| Round 1 | group-operator 改造为竖向轨道 + `::before/::after` 短横 |
| Round 2 | group-operator-badge `<a-select>` → 可点击 div |
| Round 2 | 新增 condition-type 标签（🏷️ / ⚡） |
| Round 2 | group-content 加 data-group-op 属性（颜色联动） |
| Round 3 | cross-group-operator 从 wrapper 顶部移进 v-for 内部 |
| Round 3 | cross-group-line 拆分为 top + bottom |
| Round A | cross-group-operator 高度 min → fixed 48px，badge absolute 居中 |
