/**
 * External Data Mock（burndown + warning）
 * 用途：燃尽图与预警数据生成器占位（返回空数组）
 * 来源：覆盖 dmt 资产管理外部数据视图
 * 消费方：dmt 资产详情等页面（外部数据面板）
 * 边界：纯前端 demo；当前为占位实现（空数组）
 */
export const generateBurndownData = () => []
export const generateWarningData = () => []
const mockData: unknown[] = []
export default mockData
