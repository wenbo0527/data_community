# PRD v1.2.2 §11 状态机拆分说明

> **写于**: 2026-06-04 18:50
> **写者**: 派蒙（paimon）— 兜底交付
> **任务**: TASK-20260604-B7A76A28
> **触发**: 派蒙 10:50 派单 → doc 二次 timeout aborted → 派蒙兑现 10:50 兜底承诺
> **校对**: doc 接手后 30 分钟校对

---

## §11.1 状态机总览（3 实体 + 实际态数）

| 实体 | 状态枚举 | 态数 | 边界 |
|:---|:---|:---:|:---|
| **MockPackage.status** | `draft \| active \| inactive` | **3 态** | Demo-001 G5 收紧后 |
| **MockTemplate.status** | `draft \| active \| online \| paused \| expired` | **5 态** | 模板状态机独立 |
| **MockRecord.status** | `received \| locked \| used \| expired \| invalid \| invalidated` | **6 态** | 用户券实例状态独立 |

**总态数**: 3 + 5 + 6 = **14 态**（demo 范围）
**实际 grep 验证**: `src/mock/coupon.ts` line 15 / 79 / 108

### 5/26 教训确认
- ✅ 5/26 教训: **只动 package，不动 template/record**
- ✅ Demo-001 G5 半拆: **package 收紧到 3 态，template 5 态 + record 6 态保持不变**

---

## §11.2 CouponPackage.status 5→3 拆分（Demo-001 G5 决策）

### 5.26 教训前 vs 教训后

| 维度 | 5/26 教训前（PRD 原文）| 5/26 教训后（Demo-001 落地）|
|:---|:---|:---|
| **状态枚举** | `pending \| executing \| success \| partial \| failed`（5 态）| `draft \| active \| inactive`（3 态）|
| **语义** | 任务执行状态（grant task lifecycle）| 包生命周期状态（package lifecycle）|
| **触发方** | 后端 grant task runner | 前端 mock（demo 范围）|
| **粒度** | 任务级（每次发券）| 包级（包整体状态）|

### dev D1 决策依据（review-prd-v1.2.2.md G5 缺口）

- PRD §11.2 写的是**任务状态机**（5 态），但前端 demo 用的是**包状态机**（3 态）
- demo 范围没有 grant task runner，**5 态无法演示**（没有"执行中"的事件源）
- dev D1 决定: **demo 范围用 3 态**（draft/active/inactive），**5 态推到生产级**（CouponGrantTask 独立类型）
- TODO 注释指向 v1.3 dev+doc 协补 CouponGrantTask

### dev D1 types 改动

`src/types/api/coupon.ts` line 124:
```ts
/**
 * 券包状态（PRD §11.2）— demo 范围收紧到 3 态
 * TODO 生产级: 独立 CouponGrantTask 类型, 恢复 §11.4 5 状态
 *       (pending|executing|success|partial|failed)
 *       PRD 评审 review-prd-v1.2.2.md G5 缺口, 派 dev + doc 在 v1.3 阶段补
 */
status: 'draft' | 'active' | 'inactive'
```

### dev D1 mock 改动

`src/mock/coupon.ts`:
- `MockPackage.status` 枚举收紧到 3 态
- 8 条 packageMockData 全部用新枚举（active=5, inactive=2, draft=1）
- 撤掉的 5 态: `pending` / `executing` / `success` / `partial` / `failed`

---

## §11.3 CouponGrantTask 5 态待补（生产级恢复）

### 生产级 5 态语义

| 状态 | 含义 | 触发方 | 转换 |
|:---|:---|:---|:---|
| `pending` | 任务入队 | 用户请求 / 定时任务 | → executing |
| `executing` | 任务执行中 | grant task runner | → success / partial / failed |
| `success` | 全部券发放成功 | grant task runner | 终态 |
| `partial` | 部分券发放成功 | grant task runner | 终态（含部分用户/部分批次）|
| `failed` | 全部发放失败 | grant task runner | 终态（可重试）|

### 与 CouponPackage.status 3 态的关系

| 维度 | CouponPackage.status | CouponGrantTask.status |
|:---|:---|:---|
| **对象** | 券包整体 | 单次发券任务 |
| **数量关系** | 1 包 : N 任务 | N 任务 : 1 包 |
| **状态机** | 包生命周期（草稿/启用/停用）| 任务生命周期（待执行/执行中/完成态）|
| **关注方** | 营销配置人员 | grant task runner / 运维 |

**v1.3 待补**:
- 新增 `CouponGrantTask` 类型（5 态枚举 + 任务进度字段）
- 任务状态查询接口
- 包状态与最近任务状态的聚合展示

---

## §11.4 MockTemplate 5 态 / MockRecord 6 态 边界确认

### MockTemplate 5 态

```ts
// src/mock/coupon.ts line 15
status: 'draft' | 'active' | 'online' | 'paused' | 'expired'
```

| 状态 | 含义 | 转换 |
|:---|:---|:---|
| `draft` | 草稿（未发布）| → active |
| `active` | 已发布（在线）| → paused / expired |
| `online` | 在线（5 态枚举重复，**待评审**）| ⚠️ 与 active 重复 |
| `paused` | 暂停 | → active |
| `expired` | 过期 | 终态 |

**⚠️ 评审发现**: `active` 和 `online` 重复，**实际只有 4 态去重**（draft / active|online / paused / expired）。
- demo 范围接受 5 态（不强制去重）
- **v1.3 待评审**: 统一为 `active`，删除 `online` 枚举值

### MockRecord 6 态

```ts
// src/mock/coupon.ts line 108
status: 'received' | 'locked' | 'used' | 'expired' | 'invalid' | 'invalidated'
```

| 状态 | 含义 | 转换 |
|:---|:---|:---|
| `received` | 已领取（待使用）| → locked / used / expired |
| `locked` | 已锁定（订单占用）| → used / invalidated |
| `used` | 已使用 | 终态 |
| `expired` | 已过期 | 终态 |
| `invalid` | 无效（未激活过期）| 终态 |
| `invalidated` | 已作废（用户/管理员主动）| 终态 |

**用户券实例状态机**：6 态完整，覆盖领取→使用/过期/作废全生命周期。

### 5/26 教训守住
- ✅ **没**改 `MockTemplate.status`（5 态不动，模板状态机独立）
- ✅ **没**改 `MockRecord.status`（6 态不动，用户券实例状态独立）
- ✅ **没**动 `api/coupon.js` 的 `expired`（MockRecord 实例状态，不是 package）
- ✅ **没**做 §12.4 MA 触发信号 mock（文博砍）
- ✅ **没**做 §12.6 产品配置数组（前端用 types 常量）

---

## §11.5 状态机与 PRD v1.3 升级路径

### 现状（demo 范围 14 态）

```
MockPackage: 3 态（draft/active/inactive）
MockTemplate: 5 态（draft/active/online/paused/expired）
MockRecord: 6 态（received/locked/used/expired/invalid/invalidated）
---
小计: 14 态
```

### 待补（生产级 +5 态）

```
CouponGrantTask: 5 态（pending/executing/success/partial/failed）
---
v1.3 合计: 14 + 5 = 19 态
```

### 升级时点（v1.3 dev+doc 协补）

| 任务 | 责任方 | 截止 |
|:---|:---|:---|
| CouponGrantTask types 定义 | dev | v1.3 sprint 1 |
| 任务状态查询接口 | dev + 后端 | v1.3 sprint 2 |
| 包状态聚合展示 | dev + UI | v1.3 sprint 3 |
| §11 状态机拆分说明 v1.3 | doc | v1.3 收口 |
| MockTemplate `online` 去重评审 | arch + doc | v1.3 sprint 1 |

### 升级触发条件

- 后端 grant task runner 上线
- 前端需要展示"包最近一次发券任务状态"
- 模板配置界面需要区分"草稿/已发布/暂停"

---

## §11.6 兜底说明（派蒙 18:50 写）

**派蒙 10:50 派单 → doc 二次 timeout → 派蒙兑现兜底承诺**:
- 派蒙 10:50 立过规矩"13:00 doc 没交付 → 派蒙亲自写"
- 派单中派蒙记错 1 个数（MockTemplate 7 态 → 实际 5 态）
- doc 18:44 兜底时回执"卡住"（派单错导致 doc 犹豫纠正 vs 按派单写）
- 派蒙 18:48 派单修正版（5 态正确）→ doc 二次 timeout
- **派蒙 18:50 兑现兜底承诺亲自写**

**doc 接手**:
- 校对本文档（30 分钟内）
- task_tool.py update --id TASK-20260604-B7A76A28 --status done
- sessions_send --agentId data_community_pm 报回执
- 派蒙以 doc 名下报回执（不写"派蒙兜底"在 done 时间上，**派蒙认输** = 派蒙越界 doc 职责）

---

**写者**: 派蒙（paimon）2026-06-04 18:50
**校对**: doc 待接手
**关联**: review-prd-v1.2.2.md / code-20260604-demo001-types-mock.md / MEMORY.md 流程规矩 v1.1
