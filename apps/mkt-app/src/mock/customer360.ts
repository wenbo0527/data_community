/**
 * Customer 360 Mock Data
 * 用途：客户 360° 视图 mock（用户基本信息 + fetchUserInfo）
 * 来源：覆盖客户 360 全域（dmt/customer360）
 * 消费方：@/api/discovery.ts（直接 re-export）
 * 边界：纯前端 demo；mockUsers 为空（待填充）；fetchUserInfo 返回空 name
 */
export const mockUsers: User[] = []
export interface User { id: string; name?: string }
export const fetchUserInfo = async (id: string): Promise<User> => ({ id, name: '' })
