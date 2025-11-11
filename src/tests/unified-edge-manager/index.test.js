/**
 * UnifiedEdgeManager 测试套件索引
 * 
 * 本文件作为 UnifiedEdgeManager 所有测试的入口点，
 * 导入并组织所有相关的测试模块。
 * 
 * 测试覆盖范围：
 * - 核心功能测试 (core-functionality.test.js)
 * - 端口验证测试 (port-validation.test.js) 
 * - 边界情况测试 (edge-cases.test.js)
 * - 性能测试 (performance.test.js)
 * - 集成测试 (integration.test.js)
 * - 错误恢复测试 (error-recovery.test.js)
 * - 高级场景测试 (advanced-scenarios.test.js)
 * 
 * 目标覆盖率：90%+
 */

// 导入所有测试模块
import './core-functionality.test.js';
import './port-validation.test.js';
import './edge-cases.test.js';
import './performance.test.js';
import './integration.test.js';
import './error-recovery.test.js';
import './advanced-scenarios.test.js';

/**
 * 测试覆盖范围说明：
 * 
 * 1. core-functionality.test.js - 核心功能测试
 *    - UnifiedEdgeManager 初始化和销毁
 *    - 预览线管理（创建、删除、查询）
 *    - 连接线管理（创建、转换）
 *    - 批量操作和缓存管理
 * 
 * 2. port-validation.test.js - 端口验证测试
 *    - 端口方向验证（out -> in）
 *    - 端口连接验证
 *    - 预览线端口验证
 *    - 自定义端口配置
 * 
 * 3. edge-cases.test.js - 边界情况测试
 *    - 异常输入处理
 *    - 资源限制测试
 *    - 并发操作测试
 *    - 内存管理测试
 *    - 数据一致性测试
 * 
 * 4. performance.test.js - 性能测试
 *    - 大规模预览线创建性能
 *    - 内存泄漏检测
 *    - 并发操作性能
 *    - 查询性能优化
 *    - 批量操作优化
 * 
 * 5. integration.test.js - 集成测试
 *    - UnifiedEdgeManager 与 PreviewLineSystem 集成
 *    - 端到端预览线创建和转换
 *    - 多组件协作测试
 *    - 真实场景模拟
 *    - 系统级错误处理
 * 
 * 6. error-recovery.test.js - 错误恢复测试
 *    - 网络异常错误恢复
 *    - 图实例异常降级处理
 *    - 数据不一致自动修复
 *    - 批量操作错误恢复
 *    - 系统健康监控
 * 
 * 测试覆盖目标：90%+
 * 包含单元测试、集成测试、性能测试、错误恢复测试
 */

export default {
  name: 'UnifiedEdgeManager Test Suite',
  version: '1.0.0',
  description: '统一边系统完整测试套件',
  testFiles: [
    'core-functionality.test.js',
    'port-validation.test.js', 
    'edge-cases.test.js',
    'performance.test.js',
    'integration.test.js',
    'error-recovery.test.js'
  ],
  coverage: {
    target: '90%',
    includes: [
      'UnifiedEdgeManager core functionality',
      'Port validation and direction checking',
      'Edge cases and error handling',
      'Performance optimization',
      'System integration',
      'Error recovery mechanisms'
    ]
  }
};