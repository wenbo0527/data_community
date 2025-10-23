// 通知管理系统Mock数据

import type { 
  Notification, 
  Category, 
  NotificationDocument, 
  OperationLog,
  NotificationListResponse,
  ApiResponse 
} from '@/types/notification';

// 分类Mock数据
export const mockCategories: Category[] = [
  {
    id: '1',
    name: '社区发布',
    color: '#722ed1',
    icon: 'IconNotification',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '使用指南',
    color: '#165dff',
    icon: 'IconBook',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: '案例库',
    color: '#00d084',
    icon: 'IconFile',
    sortOrder: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// 通知文档Mock数据
export const mockDocuments: NotificationDocument[] = [
  {
    id: 'doc1',
    notificationId: '1',
    fileName: '数据社区平台使用指南V2.0.pdf',
    filePath: '/uploads/documents/guide-v2.pdf',
    fileType: 'application/pdf',
    fileSize: 2048576,
    uploadedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'doc2',
    notificationId: '2',
    fileName: '新功能演示视频.mp4',
    filePath: '/uploads/documents/demo-video.mp4',
    fileType: 'video/mp4',
    fileSize: 15728640,
    uploadedAt: '2024-01-16T14:30:00Z'
  }
];

// 通知Mock数据
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '数据社区平台使用指南V2.0发布',
    content: '亲爱的用户，我们很高兴地宣布数据社区平台使用指南V2.0正式发布！本次更新包含了最新的功能介绍、操作流程和最佳实践案例。新版指南涵盖了数据分析、可视化图表、协作功能等核心模块的详细说明，帮助您更好地使用平台功能。',
    categoryId: '2',
    category: mockCategories[1],
    status: 'published',
    priority: 1,
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    publishedAt: '2024-01-15T10:00:00Z',
    documents: [mockDocuments[0]]
  },
  {
    id: '2',
    title: '新增数据可视化功能上线',
    content: '我们为数据社区平台新增了强大的数据可视化功能！现在您可以通过拖拽方式创建各种图表，包括柱状图、折线图、饼图、散点图等。新功能支持实时数据更新、交互式操作和自定义样式设置。',
    categoryId: '1',
    category: mockCategories[0],
    status: 'published',
    priority: 2,
    createdBy: 'admin',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    publishedAt: '2024-01-16T14:30:00Z',
    documents: [mockDocuments[1]]
  },
  {
    id: '3',
    title: '电商数据分析最佳实践案例',
    content: '本案例展示了如何使用数据社区平台进行电商数据分析。通过真实的电商数据，演示了用户行为分析、销售趋势预测、商品推荐算法等核心功能的应用。案例包含完整的数据处理流程和可视化展示。',
    categoryId: '3',
    category: mockCategories[2],
    status: 'published',
    priority: 0,
    createdBy: 'editor',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
    publishedAt: '2024-01-17T09:15:00Z',
    documents: []
  },
  {
    id: '4',
    title: '系统维护通知',
    content: '为了提供更好的服务体验，我们将于本周六凌晨2:00-4:00进行系统维护升级。维护期间平台将暂时无法访问，请您提前做好相关准备。维护完成后，系统性能将得到显著提升。',
    categoryId: '1',
    category: mockCategories[0],
    status: 'draft',
    priority: 3,
    createdBy: 'admin',
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    documents: []
  }
];

// 操作日志Mock数据
export const mockOperationLogs: OperationLog[] = [
  {
    id: 'log1',
    userId: 'admin',
    notificationId: '1',
    operation: 'create',
    details: '创建通知：数据社区平台使用指南V2.0发布',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'log2',
    userId: 'admin',
    notificationId: '1',
    operation: 'publish',
    details: '发布通知：数据社区平台使用指南V2.0发布',
    createdAt: '2024-01-15T10:05:00Z'
  },
  {
    id: 'log3',
    userId: 'admin',
    notificationId: '2',
    operation: 'create',
    details: '创建通知：新增数据可视化功能上线',
    createdAt: '2024-01-16T14:30:00Z'
  }
];

// Mock API服务类
export class NotificationMockService {
  // 获取通知列表
  static async getNotifications(params: any = {}): Promise<NotificationListResponse> {
    const { page = 1, pageSize = 10, category, status, keyword } = params;
    
    let filteredNotifications = [...mockNotifications];
    
    // 分类筛选
    if (category) {
      filteredNotifications = filteredNotifications.filter(n => n.categoryId === category);
    }
    
    // 状态筛选
    if (status) {
      filteredNotifications = filteredNotifications.filter(n => n.status === status);
    }
    
    // 关键词搜索
    if (keyword) {
      filteredNotifications = filteredNotifications.filter(n => 
        n.title.includes(keyword) || n.content.includes(keyword)
      );
    }
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filteredNotifications.slice(start, end);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            list,
            total: filteredNotifications.length
          }
        });
      }, 300);
    });
  }
  
  // 获取单个通知
  static async getNotification(id: string): Promise<ApiResponse<Notification>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notification = mockNotifications.find(n => n.id === id);
        if (notification) {
          resolve({
            success: true,
            data: notification
          });
        } else {
          resolve({
            success: false,
            message: '通知不存在'
          });
        }
      }, 200);
    });
  }
  
  // 创建通知
  static async createNotification(data: any): Promise<ApiResponse<Notification>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...data,
          status: 'draft',
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documents: []
        };
        
        mockNotifications.unshift(newNotification);
        
        resolve({
          success: true,
          data: newNotification
        });
      }, 500);
    });
  }
  
  // 更新通知
  static async updateNotification(id: string, data: any): Promise<ApiResponse<Notification>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockNotifications.findIndex(n => n.id === id);
        if (index !== -1) {
          mockNotifications[index] = {
            ...mockNotifications[index],
            ...data,
            updatedAt: new Date().toISOString()
          };
          
          resolve({
            success: true,
            data: mockNotifications[index]
          });
        } else {
          resolve({
            success: false,
            message: '通知不存在'
          });
        }
      }, 400);
    });
  }
  
  // 删除通知
  static async deleteNotification(id: string): Promise<ApiResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockNotifications.findIndex(n => n.id === id);
        if (index !== -1) {
          mockNotifications.splice(index, 1);
          resolve({
            success: true
          });
        } else {
          resolve({
            success: false,
            message: '通知不存在'
          });
        }
      }, 300);
    });
  }
  
  // 获取分类列表
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockCategories
        });
      }, 200);
    });
  }
  
  // 文件上传
  static async uploadFile(file: File): Promise<ApiResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFile = {
          id: Date.now().toString(),
          fileName: file.name,
          filePath: `/uploads/documents/${file.name}`,
          fileType: file.type,
          fileSize: file.size
        };
        
        resolve({
          success: true,
          data: mockFile
        });
      }, 1000);
    });
  }
  
  // 获取操作日志
  static async getOperationLogs(notificationId: string): Promise<ApiResponse<OperationLog[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs = mockOperationLogs.filter(log => log.notificationId === notificationId);
        resolve({
          success: true,
          data: logs
        });
      }, 200);
    });
  }
}