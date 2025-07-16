/**
 * 连接预览错误处理工具
 */

export class ConnectionPreviewError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'ConnectionPreviewError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export const ERROR_CODES = {
  INVALID_NODE: 'INVALID_NODE',
  MISSING_BRANCH_MANAGER: 'MISSING_BRANCH_MANAGER',
  GRAPH_NOT_INITIALIZED: 'GRAPH_NOT_INITIALIZED',
  PREVIEW_CREATION_FAILED: 'PREVIEW_CREATION_FAILED',
  SNAP_DETECTION_FAILED: 'SNAP_DETECTION_FAILED',
  EVENT_HANDLER_ERROR: 'EVENT_HANDLER_ERROR'
};

export class ConnectionPreviewLogger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  error(message, context = {}) {
    if (this.shouldLog('error')) {
      console.error(`🚨 [ConnectionPreview] ${message}`, context);
    }
  }

  warn(message, context = {}) {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ [ConnectionPreview] ${message}`, context);
    }
  }

  info(message, context = {}) {
    if (this.shouldLog('info')) {
      console.log(`ℹ️ [ConnectionPreview] ${message}`, context);
    }
  }

  debug(message, context = {}) {
    if (this.shouldLog('debug')) {
      console.log(`🔍 [ConnectionPreview] ${message}`, context);
    }
  }
}

/**
 * 安全执行函数，捕获并处理错误
 */
export function safeExecute(fn, context = '', logger = null) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      const errorMessage = `执行失败 [${context}]: ${error.message}`;
      
      if (logger) {
        logger.error(errorMessage, { error, args });
      } else {
        console.error(errorMessage, error);
      }
      
      throw new ConnectionPreviewError(
        errorMessage,
        ERROR_CODES.EVENT_HANDLER_ERROR,
        { originalError: error, context, args }
      );
    }
  };
}

/**
 * 节点验证工具
 */
export function validateNode(node, context = '') {
  if (!node) {
    throw new ConnectionPreviewError(
      `节点对象为空 [${context}]`,
      ERROR_CODES.INVALID_NODE,
      { node, context }
    );
  }

  if (typeof node.getData !== 'function') {
    throw new ConnectionPreviewError(
      `节点对象缺少getData方法 [${context}]`,
      ERROR_CODES.INVALID_NODE,
      { node, context }
    );
  }

  if (typeof node.getPosition !== 'function') {
    throw new ConnectionPreviewError(
      `节点对象缺少getPosition方法 [${context}]`,
      ERROR_CODES.INVALID_NODE,
      { node, context }
    );
  }

  if (typeof node.getSize !== 'function') {
    throw new ConnectionPreviewError(
      `节点对象缺少getSize方法 [${context}]`,
      ERROR_CODES.INVALID_NODE,
      { node, context }
    );
  }

  return true;
}

/**
 * 图形对象验证工具
 */
export function validateGraph(graph, context = '') {
  if (!graph) {
    throw new ConnectionPreviewError(
      `图形对象为空 [${context}]`,
      ERROR_CODES.GRAPH_NOT_INITIALIZED,
      { graph, context }
    );
  }

  const requiredMethods = ['addEdge', 'addNode', 'removeCell', 'hasCell', 'getNodes'];
  
  for (const method of requiredMethods) {
    if (typeof graph[method] !== 'function') {
      throw new ConnectionPreviewError(
        `图形对象缺少${method}方法 [${context}]`,
        ERROR_CODES.GRAPH_NOT_INITIALIZED,
        { graph, method, context }
      );
    }
  }

  return true;
}