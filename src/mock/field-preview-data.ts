import { MockMethod } from 'vite-plugin-mock';

// 字段预览数据
export const fieldPreviewData = {
  // 检测到的字段
  detectedFields: ['date', 'product', 'value', 'count', 'rate'],
  
  // 样本数据（前5行）
  sampleData: [
    { date: '2023-01-01', product: 'Product A', value: 100, count: 10, rate: '0.1' },
    { date: '2023-01-02', product: 'Product B', value: 200, count: 20, rate: '0.15' },
    { date: '2023-01-03', product: 'Product C', value: 150, count: 15, rate: '0.12' },
    { date: '2023-01-04', product: 'Product A', value: 300, count: 30, rate: '0.2' },
    { date: '2023-01-05', product: 'Product B', value: 250, count: 25, rate: '0.18' }
  ],
  
  // 文件信息
  fileInfo: {
    name: 'demo_data.csv',
    size: 1024,
    type: 'text/csv'
  }
};

// 模拟上传文件并返回字段预览数据
const mockUploadFile = () => {
  return {
    code: 200,
    message: '文件上传成功',
    data: fieldPreviewData
  };
};

export default [
  // 模拟文件上传API
  {
    url: '/api/external-data-evaluation/upload',
    method: 'post',
    response: () => {
      return mockUploadFile();
    }
  }
] as MockMethod[];