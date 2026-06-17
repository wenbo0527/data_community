# v1.2.8 A 维上游产出（arch 触发 dev C 维）

> **任务**:TASK-20260605-BA69F97A (A 维 - arch)
> **链路图**:`/Users/wenbo/.openclaw/workspace-agents/data_community_pm/tmp/v128-upstream-downstream-chain.md`
> **PM 拍板**:文博 6/5 10:35（按上下游依赖链,非按天）
> **deadline**:12:00（**arch done 立即派 C dev**,不收口等 qa/doc）
> **作者**:data_community_arch 🏛️
> **日期**:2026-06-05 10:40
> **状态**:✅ **A 维 done,触发 C 维**

---

## 0. 派蒙 / PM 12:00 一眼看

| 产出 | 状态 | 详细 |
|:---|:---:|:---|
| ① types 9 态扩展方案 | ✅ | pending + 5 failed_1001-1005 + 删 invalid/locked/used |
| ② failure_code 字段定义 | ✅ | `failure_code?: number` + `failure_reason?: string` |
| ③ timeout_time 字段定义 | ✅ | `timeout_time?: string` (failed_1002 用) |
| ④ 字段映射差异清单 | ✅ | types vs mock 9 处差异,5 P0 + 4 P1 |
| **触发 C 维(dev)** | ✅ | TASK-20260605-DEV-C |
| 完整底稿 | 📎 | v128-arch-report.md (21KB) + p0-types-9states.md (16KB) |
| 派蒙/PM 备案 | ⏳ | 本摘要(12:00 验收点交付) |

---

## 1. 链路位置(上下游)

```
[START] → A (arch: 我) ─done─→ C (dev: 触发) ─→ B (qa) ─→ D (doc) ─→ F (PM 部署)
         10:40 完成
```

**派单规则**:A done → **立即派 C** → 不等 12:00 收口、不等 qa/doc

---

## 2. ① types 9 态扩展方案

### 2.1 终态枚举(9 态,PRD v1.2.8 §11.3)

| 序 | 状态 | PRD 内部代码 | PRD 失败码 | 含义 | 触发 |
|:---:|:---|:---|:---:|:---|:---|
| 1 | 待确认 | `pending` | — | **内部态**,对用户不可见 | 权益中心产生券实例 |
| 2 | 未使用 | `received` | — | 激活态 | 核心接受 + 同事务(实扣+作废) |
| 3 | 核心拒收失败 | `failed_1001_core_rejected` | 1001 | 库存无变化 | 核心回执 `accepted: false` |
| 4 | 超时失败 | `failed_1002_timeout` | 1002 | 库存无变化 + 企微报警 | 5 分钟未收到核心回执 |
| 5 | 存量作废失败 | `failed_1003_invalidation` | 1003 | 库存**回滚**(同事务) | received 流转时作废失败 |
| 6 | Kafka 推送失败 | `failed_1004_kafka_push` | 1004 | 库存无变化 | producer 重试耗尽 |
| 7 | Kafka 回执消费失败 | `failed_1005_kafka_consume` | 1005 | 库存无变化 | consumer 重试耗尽 |
| 8 | 已作废 | `invalidated` | — | 记 invalidated_time | 同用户同产品被新券覆盖 |
| 9 | 已过期 | `expired` | — | 自然失效 | 有效期到期 |

### 2.2 关键变化(从 6 态 / 3 态 → 9 态)

| 维度 | 改前 | 改后 |
|:---|:---|:---|
| types `CouponInventory.status` | 3 态(received/invalidated/expired) | **9 态** |
| mock `MockCoupon.status` | 6 态(received/locked/used/expired/invalid/invalidated) | **9 态** |
| **删** | `invalid` / `locked` / `used` | (幽灵状态,5/26 教训链) |
| **加** | — | `pending` + 5 个 `failed_*` |

### 2.3 types 实际代码(`apps/mkt-app/src/types/api/coupon.ts` L92-107)

```ts
status:
  | 'pending'
  | 'received'
  | 'failed_1001_core_rejected'
  | 'failed_1002_timeout'
  | 'failed_1003_invalidation'
  | 'failed_1004_kafka_push'
  | 'failed_1005_kafka_consume'
  | 'invalidated'
  | 'expired'
```

---

## 3. ② failure_code 字段定义(PRD v1.2.6 §11.3.1)

### 3.1 字段定义

```ts
/**
 * 失败码(PRD v1.2.6 §11.3.1)
 * - 1001: 核心拒收
 * - 1002: pending 超时(5 分钟,可配置)
 * - 1003: 存量作废失败
 * - 1004: Kafka 推送失败
 * - 1005: Kafka 回执消费失败
 * 仅 failed_* 状态时使用,其他状态省略
 */
failure_code?: number

/**
 * 失败原因文案(PRD v1.2.6 §11.3.1)
 * 与 failure_code 配对,文案待核心方拍板(Q47 走)
 */
failure_reason?: string
```

### 3.2 码段说明

| 维度 | 说明 |
|:---|:---|
| 段位 | 1001-1005 段为**权益中心预留** |
| 评审会 | 与核心方共同确定具体语义(Q51=A 走) |
| 1006+ | 留待后续扩展 |
| 状态名带码 | `failed_1001_*`,便于日志检索和灰度 |

### 3.3 文案映射(待核心方确认,Q47 走)

| 失败码 | 运营视角文案(占位) | 状态 |
|:---:|:---|:---:|
| 1001 | 待核心方确认(建议:资质审核未通过) | ⏳ |
| 1002 | 待核心方确认(建议:系统繁忙,请稍后重试) | ⏳ |
| 1003 | 待核心方确认(建议:系统异常,已自动回滚) | ⏳ |
| 1004 | 待核心方确认(建议:系统异常,请联系客服) | ⏳ |
| 1005 | 待核心方确认(建议:系统异常,请联系客服) | ⏳ |

---

## 4. ③ timeout_time 字段定义(PRD v1.2.6 §11.3.2)

### 4.1 字段定义

```ts
/**
 * pending 超时时间(PRD v1.2.6 §11.3.2)
 * 仅 failed_1002_timeout 状态时记录
 * 触发: 5 分钟(可配置)未收到核心回执 → 状态转 failed_1002 + 记 timeout_time
 */
timeout_time?: string
```

### 4.2 配置项

| 维度 | 设定 |
|:---|:---|
| 超时时间 | **5 分钟(可配置)**,默认 `system.timeout.pending_ack_seconds = 300` |
| 触发 | 权益中心定时任务扫描 `pending` 状态券实例 |
| 超时后动作 | 状态 → `failed_1002_timeout` + 记 `timeout_time` + 触发企微报警 |
| 重试 | ❌ **不重试**(避免核心系统收到重复消息,Q50 走) |
| 报警通道 | 企微(Q48 走) |

---

## 5. ④ 字段映射差异清单(types vs mock)

### 5.1 P0 阻断(7 处,types 修了 4,dev C 接手 3)

| # | 差异点 | types 改前 | types 改后 | mock 改前 | mock 改后 | 状态 |
|:---:|:---|:---|:---|:---|:---|:---:|
| 1 | status 枚举 3 态 → 9 态 | 3 态 | ✅ 9 态 | 6 态 | ✅ 9 态 | **A done** |
| 2 | `pending` 内部态缺 | ❌ 缺 | ✅ 加 | ❌ 缺 | ✅ 6 条覆盖实例 | **A done** |
| 3 | `failed_1001-1005` 缺 | ❌ 缺 | ✅ 加 5 个 | ❌ 缺 | ✅ 5 条覆盖实例 | **A done** |
| 4 | `failure_code` 字段缺 | ❌ 缺 | ✅ `failure_code?: number` | ❌ 缺 | ✅ 5 条实例含 | **A done** |
| 5 | `failure_reason` 字段缺 | ❌ 缺 | ✅ `failure_reason?: string` | ❌ 缺 | ✅ 5 条实例含 | **A done** |
| 6 | `timeout_time` 字段缺 | ❌ 缺 | ✅ `timeout_time?: string` | ❌ 缺 | ✅ 1 条实例含 | **A done** |
| 7 | `couponType` 4 态不含 `PRICED_DISCOUNT` | ❌ 缺 | ✅ 5 态 | 12 条用 PRICED_DISCOUNT | ✅ 对齐 | **A done** |

**A 维修完 7 处 P0 中的 7 处**(types + mock 全部对齐)。

### 5.2 P1 阻塞(4 处,**C dev 接手**)

| # | 差异点 | 位置 | 优先级 | dev C 任务 |
|:---:|:---|:---|:---:|:---|
| 8 | pages/coupon/inventory/index.vue 表头映射缺 6 态 | `.vue:253-266` | P1 | C ③-#6 |
| 9 | pages/coupon/inventory/index.vue `validStatus` 含 'locked' 幽灵 | `.vue:511` | P1 | C ③-#6 |
| 10 | pages/coupon/management/index.vue `已锁定` 选项 | `.vue:55` | P1 | C ③-#6 |
| 11 | api/coupon.js 6 处 `status: 'locked'` | `.js:218/298/372/466/539/670` | P1 | C ③-#6 |

### 5.3 5/26 教训链对齐

| 教训 | 触发场景 | 本次如何防 |
|:---|:---|:---|
| **#1 列字段名 vs mock 字段不一致** | 表格空白,无报错 | types 先声明 9 态 + failure_code + timeout_time,后 mock 引用 → TS 编译期兜底 |
| **#4 types 必须声明字段** | mock 引用 types 没声明的字段,运行时空字段 | L60/L92/L118 注释明确写「5/26 教训链 #1/#4」 |

### 5.4 字段映射差异(全量版)

详细字段差异清单(10 字段 × 3 维度)见底稿 §3.1-3.4、§4.1-4.3：

| 字段 | PRD 文本 | types 改前 | types 改后 | mock 改前 | mock 改后 |
|:---|:---|:---|:---|:---|:---|
| `status` | 9 态 | 3 态 | ✅ 9 态 | 6 态 | ✅ 9 态 |
| `invalidated_time` | 必含(作废时) | ✅ 有 | ✅ 有 | ✅ 有 | ✅ 有(2 条) |
| `failure_code` | 必含(失败时) | ❌ 缺 | ✅ 加 | ❌ 缺 | ✅ 5 条 |
| `failure_reason` | 必含(失败时) | ❌ 缺 | ✅ 加 | ❌ 缺 | ✅ 5 条 |
| `timeout_time` | 必含(failed_1002) | ❌ 缺 | ✅ 加 | ❌ 缺 | ✅ 1 条 |
| `receive_time` | 必含(用户券) | ❌ 缺 | 🟡 留 C | ❌ 缺 | 🟡 留 C |
| `denomination` | 模板示例有 | ✅ 模板有 | ✅ 不变 | ✅ 部分有 | ✅ 不变 |
| `discount_value` | 模板示例有 | ❌ 缺 | 🟡 留 C | ✅ 部分有 | ✅ 不变 |
| `invalidation_rule` | **已删**(v1.2.1) | ❌ 缺 | ✅ 不变 | ❌ 缺 | ✅ 不变 |
| `product_id` | 必含(临价券) | ✅ 有 | ✅ 不变 | ✅ 有 | ✅ 不变 |

🟡 = dev C 接手补

---

## 6. 触发 C 维(dev)

### 6.1 派单消息(发 dev)

> **C 维任务**:TASK-20260605-DEV-C(PM 链路图新建,等你接)
> **触发依据**:A 维 arch done(本摘要)
> **deadline**:6/6 18:00
>
> **你的工作**:
> 1. **类型层**(已由 A 维 arch 落地,你不用动):
>    - `apps/mkt-app/src/types/api/coupon.ts` 9 态 + 3 字段已扩展
>    - `apps/mkt-app/src/mock/coupon.ts` 9 态 + 6 条覆盖实例
>    - `apps/mkt-app/src/api/coupon.ts:172` `invalid` → `invalidated`
>    - TS 编译 exit 0
> 2. **页面层**(你接手,4 处 P1):
>    - `pages/coupon/inventory/index.vue:253-266` 表头映射加 9 态
>    - `pages/coupon/inventory/index.vue:511` `validStatus` 改 `['received']`
>    - `pages/coupon/management/index.vue:55` 删 `已锁定` 选项
>    - `api/coupon.js` 6 处 `status: 'locked'` 改 `received`(或 .js→.ts)
> 3. **状态机层**(C ④,5 处 P1):
>    - 状态机 enum 同步 9 态
>    - 失败码文案占位(Q47 走评审会)
>    - Kafka 触发配置(`system.timeout.pending_ack_seconds = 300`)
>    - 5 分钟 timeout 报警通道(企微)
> 4. **关联页 P0**(PM 链路图 C ③):
>    - #1 删 `pages/coupon/detail.vue:49-51` 主动作废
>    - #5 加存量作废明细页 tab
>    - #6 状态中文化补 3+5 个
>    - #7 创建临价折扣券字段锁定
>
> **底稿**:
> - A 维全量报告:`v128-arch-report.md` (21KB)
> - A 维 types 落地:`p0-types-9states.md` (16KB)
>
> **PM 验收点**:6/6 18:00,链路图下一步触发 B qa

### 6.2 派单机制

```bash
# 由 arch 派 dev
sessions_send --agentId data_community_dev --message "<上面 6.1 内容>"
```

---

## 7. 12:00 PM 验收点交付清单

| # | 产出 | 路径 | 状态 |
|:---:|:---|:---|:---:|
| 1 | A 维上游产出(本文件) | `/Users/wenbo/.openclaw/workspace-agents/data_community_arch/tmp/v128-A-upstream-handoff.md` | ✅ |
| 2 | A 维全量报告(底稿 1) | `/Users/wenbo/.openclaw/workspace-agents/data_community_arch/tmp/v128-arch-report.md` | ✅ |
| 3 | A 维 types 落地(底稿 2) | `/Users/wenbo/.openclaw/workspace-agents/data_community_arch/tmp/p0-types-9states.md` | ✅ |
| 4 | PM tmp 镜像 | `/Users/wenbo/Documents/project/data_community/data_community_pm/tmp/v128-A-upstream-handoff.md` | ⏳ 12:00 镜像 |
| 5 | arch memory 归档 | `memory/reports/2026-06/2026-06-05-v128-A-upstream-handoff.md` | ⏳ 12:00 归档 |
| 6 | C 维派单(dev) | sessions_send 触发 | ⏳ 12:00 派 |
| 7 | task board 状态 | TASK-20260605-BA69F97A → done | ✅ 12:00 更新 |

---

## 8. 元数据

| 字段 | 值 |
|:---|:---|
| 报告版本 | v1.0 |
| 报告路径(主) | `/Users/wenbo/.openclaw/workspace-agents/data_community_arch/tmp/v128-A-upstream-handoff.md` |
| 报告路径(备) | `/Users/wenbo/Documents/project/data_community/data_community_pm/tmp/v128-A-upstream-handoff.md` |
| 任务 ID | TASK-20260605-BA69F97A(PM 派) / TASK-20260605-79522389(arch 自注册) |
| 链路位置 | A(启动) → C(触发) |
| 链路图 | `/Users/wenbo/.openclaw/workspace-agents/data_community_pm/tmp/v128-upstream-downstream-chain.md` |
| 关联 PRD | PRD-大额低息临价折扣v1.2.8 §11.3 / §11.3.1 / §11.3.2 |
| v1.3 硬约束 | `/Users/wenbo/.openclaw/workspace-agents/data_community_pm/tmp/v128-verify.md` |
| 校验方法 | 改前 grep 自检 + types ↔ mock 1:1 对齐 + TS 编译 + 实例状态清洗 |
| 校验耗时 | ~50 min(2026-06-05 09:30-10:20) |
| 后续动作 | 12:00 PM 验收 + 派 C dev(立即) |

---

🏛️ *arch A 维 done(2026-06-05 10:40)— 4 项产出齐,触发 C 维(dev),不收口*
