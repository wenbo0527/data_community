import type { MockMethod } from 'vite-plugin-mock';
import { mockUsers } from './customer360';

export default [
  {
    url: '/api/customer/:userId',
    method: 'get',
    response: ({ url }: { url: string }) => {
      console.log('[Mock API] 接收到请求:', url);
      
      const userId = url.split('/').pop();
      console.log('[Mock API] 提取的userId:', userId);
      
      if (!userId) {
        console.log('[Mock API] 错误: 缺少userId');
        return {
          error: 'Missing userId'
        };
      }
      
      // 直接从mockUsers获取数据
      const userData = mockUsers[userId];
      
      if (userData) {
        console.log('[Mock API] 返回用户数据:', {
          userId,
          dataKeys: Object.keys(userData),
          hasName: !!userData.name,
          totalProductsCount: userData.products?.length || 0 // 所有产品都是信贷产品
        });
        
        return userData;
      } else {
        console.log('[Mock API] 用户不存在:', userId);
        return {
          error: 'USER_NOT_FOUND',
          message: '找不到用户相关信息',
          userId: userId
        };
      }
    }
  }
] as MockMethod[];