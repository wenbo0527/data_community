import axios from 'axios';

/**
 * 获取外部数据评估报告列表
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.reportType - 报告类型
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise} 评估报告列表
 */
export function getEvaluationReports(params = {}) {
  return axios.get('/api/external-data-evaluation/list', { params });
}

/**
 * 获取外部数据评估报告详情
 * @param {number} id - 报告ID
 * @returns {Promise} 评估报告详情
 */
export function getEvaluationReportDetail(id) {
  return axios.get(`/api/external-data-evaluation/detail/${id}`);
}

/**
 * 创建外部数据评估报告
 * @param {FormData} formData - 表单数据
 * @returns {Promise} 创建结果
 */
export function createEvaluationReport(formData) {
  return axios.post('/api/external-data-evaluation/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 获取已注册的外数产品列表
 * @returns {Promise} 产品列表
 */
export function getRegisteredProducts() {
  return axios.get('/api/external-data-evaluation/products');
}

/**
 * 发布报告
 * @param {number} id - 报告ID
 * @returns {Promise} 发布结果
 */
export function publishReport(id) {
  return axios.post(`/api/external-data-evaluation/publish/${id}`);
}

/**
 * 归档报告
 * @param {number} id - 报告ID
 * @returns {Promise} 归档结果
 */
export function archiveReport(id) {
  return axios.post(`/api/external-data-evaluation/archive/${id}`);
}