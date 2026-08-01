/**
 * Shared Metadata Store Mock（共享元数据仓）
 * 用途：跨模块共享元数据字典（标签/字段/字典/枚举统一存储）
 * 来源：覆盖 dmt/mkt 跨模块元数据
 * 消费方：@/stores/tagSystem/* 等
 * 边界：纯前端 demo；当前为空对象占位（待填充）
 */
export const metadataStore: Record<string, unknown> = {}
