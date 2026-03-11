// 通知管理API服务层

import type { 
  Notification, 
  Category, 
  NotificationListParams,
  NotificationListResponse,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  ApiResponse,
  OperationLog
} from '@/types/notification';

import { NotificationMockService } from '@/mock/notification';

// 通知管理API类
class NotificationAPI {
  
  /**
   * 获取通知列表
   * @param params 查询参数
   * @returns 通知列表响应
   */
  static async getNotifications(params: NotificationListParams = {}): Promise<NotificationListResponse> {
    try {
      // 在实际项目中，这里会调用真实的API
      // const response = await fetch('/api/notifications', {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(params)
      // });
      // return await response.json();
      
      // 目前使用Mock数据
      return await NotificationMockService.getNotifications(params);
    } catch (error) {
      console.error('获取通知列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个通知详情
   * @param id 通知ID
   * @returns 通知详情
   */
  static async getNotification(id: string): Promise<ApiResponse<Notification>> {
    try {
      return await NotificationMockService.getNotification(id);
    } catch (error) {
      console.error('获取通知详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建通知
   * @param data 通知数据
   * @returns 创建结果
   */
  static async createNotification(data: CreateNotificationRequest): Promise<ApiResponse<Notification>> {
    try {
      return await NotificationMockService.createNotification(data);
    } catch (error) {
      console.error('创建通知失败:', error);
      throw error;
    }
  }

  /**
   * 更新通知
   * @param id 通知ID
   * @param data 更新数据
   * @returns 更新结果
   */
  static async updateNotification(id: string, data: UpdateNotificationRequest): Promise<ApiResponse<Notification>> {
    try {
      return await NotificationMockService.updateNotification(id, data);
    } catch (error) {
      console.error('更新通知失败:', error);
      throw error;
    }
  }

  /**
   * 删除通知
   * @param id 通知ID
   * @returns 删除结果
   */
  static async deleteNotification(id: string): Promise<ApiResponse> {
    try {
      return await NotificationMockService.deleteNotification(id);
    } catch (error) {
      console.error('删除通知失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除通知
   * @param ids 通知ID数组
   * @returns 删除结果
   */
  static async batchDeleteNotifications(ids: string[]): Promise<ApiResponse> {
    try {
      const promises = ids.map(id => this.deleteNotification(id));
      await Promise.all(promises);
      return {
        success: true,
        message: '批量删除成功'
      };
    } catch (error) {
      console.error('批量删除通知失败:', error);
      throw error;
    }
  }

  /**
   * 发布通知
   * @param id 通知ID
   * @returns 发布结果
   */
  static async publishNotification(id: string): Promise<ApiResponse<Notification>> {
    try {
      return await this.updateNotification(id, { 
        status: 'published',
        publishAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('发布通知失败:', error);
      throw error;
    }
  }

  /**
   * 批量发布通知
   * @param ids 通知ID数组
   * @returns 发布结果
   */
  static async batchPublishNotifications(ids: string[]): Promise<ApiResponse> {
    try {
      const promises = ids.map(id => this.publishNotification(id));
      await Promise.all(promises);
      return {
        success: true,
        message: '批量发布成功'
      };
    } catch (error) {
      console.error('批量发布通知失败:', error);
      throw error;
    }
  }

  /**
   * 归档通知
   * @param id 通知ID
   * @returns 归档结果
   */
  static async archiveNotification(id: string): Promise<ApiResponse<Notification>> {
    try {
      return await this.updateNotification(id, { status: 'archived' });
    } catch (error) {
      console.error('归档通知失败:', error);
      throw error;
    }
  }
}

// 分类管理API类
class CategoryAPI {
  
  /**
   * 获取分类列表
   * @returns 分类列表
   */
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      return await NotificationMockService.getCategories();
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建分类
   * @param data 分类数据
   * @returns 创建结果
   */
  static async createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      // 实际项目中调用真实API
      // 这里暂时返回模拟数据
      const newCategory: Category = {
        id: Date.now().toString(),
        name: data.name || '',
        color: data.color || '#165dff',
        icon: data.icon || 'IconNotification',
        sortOrder: data.sortOrder || 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: newCategory
      };
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  }

  /**
   * 更新分类
   * @param id 分类ID
   * @param data 更新数据
   * @returns 更新结果
   */
  static async updateCategory(id: string, data: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      // 实际项目中调用真实API
      return {
        success: true,
        data: { ...data, id } as Category
      };
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  }

  /**
   * 删除分类
   * @param id 分类ID
   * @returns 删除结果
   */
  static async deleteCategory(id: string): Promise<ApiResponse> {
    try {
      // 实际项目中调用真实API
      return {
        success: true,
        message: '删除成功'
      };
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  }
}

// 文件上传API类
class FileUploadAPI {
  
  /**
   * 上传文件
   * @param file 文件对象
   * @param notificationId 关联的通知ID（可选）
   * @returns 上传结果
   */
  static async uploadFile(file: File, notificationId?: string): Promise<ApiResponse> {
    try {
      return await NotificationMockService.uploadFile(file);
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   * @param fileId 文件ID
   * @returns 删除结果
   */
  static async deleteFile(fileId: string): Promise<ApiResponse> {
    try {
      // 实际项目中调用真实API
      return {
        success: true,
        message: '文件删除成功'
      };
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  }

  /**
   * 获取文件下载链接
   * @param filePath 文件路径
   * @returns 下载链接
   */
  static getDownloadUrl(filePath: string): string {
    // 实际项目中返回真实的下载链接
    return `${window.location.origin}${filePath}`;
  }
}

// 操作日志API类
class OperationLogAPI {
  
  /**
   * 获取操作日志
   * @param notificationId 通知ID
   * @returns 操作日志列表
   */
  static async getOperationLogs(notificationId: string): Promise<ApiResponse<OperationLog[]>> {
    try {
      return await NotificationMockService.getOperationLogs(notificationId);
    } catch (error) {
      console.error('获取操作日志失败:', error);
      throw error;
    }
  }

  /**
   * 记录操作日志
   * @param data 日志数据
   * @returns 记录结果
   */
  static async logOperation(data: {
    notificationId: string;
    operation: string;
    details: string;
  }): Promise<ApiResponse> {
    try {
      // 实际项目中调用真实API记录日志
      console.log('记录操作日志:', data);
      return {
        success: true,
        message: '日志记录成功'
      };
    } catch (error) {
      console.error('记录操作日志失败:', error);
      throw error;
    }
  }
}

// 默认导出
export default NotificationAPI;

// 导出所有API类
export { NotificationAPI, CategoryAPI, FileUploadAPI, OperationLogAPI };