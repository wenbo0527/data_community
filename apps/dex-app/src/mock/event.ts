// 共享 mkt mock/event.ts（TASK-20260720-F3722534 方案 C 实施 · 候选 #266 v1.0 锁版守）
// 根除双仓不一致：dex 通过相对路径 import mkt 完整 mock（809 行 → 9 行 stub）
// 文博 16:32 拍 A · PM A' 自治 · 派蒙 broker 拍 2+4
export * from '../../../mkt-app/src/mock/event'
export { default } from '../../../mkt-app/src/mock/event'