/**
 * 统一 API 请求封装（mock）
 * 用途：项目无后端，统一通过 @/utils/mockRequest 拦截所有请求
 * 边界：禁止使用 @app/shared-api/request（真实 axios）
 */
import request from '@/utils/mockRequest'
export default request