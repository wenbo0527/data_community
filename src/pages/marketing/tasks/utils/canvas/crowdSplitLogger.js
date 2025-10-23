/**
 * 人群分流节点专用日志工具
 * 提供结构化的日志记录，便于问题定位和调试
 */

class CrowdSplitLogger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    this.sessionId = this.generateSessionId()
    this.logs = []
    this.maxLogs = 1000 // 最大日志条数
  }

  generateSessionId() {
    return `crowd-split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  formatTimestamp() {
    return new Date().toISOString()
  }

  createLogEntry(level, category, message, data = null) {
    const entry = {
      timestamp: this.formatTimestamp(),
      sessionId: this.sessionId,
      level,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null
    }

    // 添加到内存日志
    this.logs.push(entry)
    
    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    return entry
  }

  shouldLog(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    return levels[level] >= levels[this.logLevel]
  }

  log(level, category, message, data = null) {
    if (!this.shouldLog(level)) return

    const entry = this.createLogEntry(level, category, message, data)
    const prefix = `[CrowdSplit-${this.sessionId.slice(-6)}]`
    
    switch (level) {
      case 'debug':
        console.debug(`${prefix}[${category}] ${message}`, data || '')
        break
      case 'info':
        console.info(`${prefix}[${category}] ${message}`, data || '')
        break
      case 'warn':
        console.warn(`${prefix}[${category}] ${message}`, data || '')
        break
      case 'error':
        console.error(`${prefix}[${category}] ${message}`, data || '')
        break
    }

    return entry
  }

  // 便捷方法
  debug(category, message, data) {
    return this.log('debug', category, message, data)
  }

  info(category, message, data) {
    return this.log('info', category, message, data)
  }

  warn(category, message, data) {
    return this.log('warn', category, message, data)
  }

  error(category, message, data) {
    return this.log('error', category, message, data)
  }

  // 特定业务日志方法
  logFormDataChange(action, data) {
    return this.debug('FORM_DATA', `表单数据变更: ${action}`, {
      action,
      formData: data,
      crowdLayersCount: data?.crowdLayers?.length || 0,
      selectedCrowds: data?.crowdLayers?.filter(l => l.crowdId)?.length || 0
    })
  }

  logValidation(isValid, errors, formData) {
    return this.debug('VALIDATION', `表单验证结果: ${isValid ? '通过' : '失败'}`, {
      isValid,
      errors,
      crowdLayersCount: formData?.crowdLayers?.length || 0,
      selectedCrowds: formData?.crowdLayers?.filter(l => l.crowdId)?.length || 0,
      crowdIds: formData?.crowdLayers?.map(l => l.crowdId) || []
    })
  }

  logCrowdSelection(index, crowdId, crowdName) {
    return this.info('CROWD_SELECT', `人群选择: 层级${index} -> ${crowdName}(${crowdId})`, {
      index,
      crowdId,
      crowdName
    })
  }

  logLayerOperation(operation, index, layerData) {
    return this.info('LAYER_OP', `层级操作: ${operation} 索引${index}`, {
      operation,
      index,
      layerData,
      totalLayers: layerData?.length
    })
  }

  logApiCall(url, method, status, responseTime, error = null) {
    const level = error ? 'error' : 'info'
    return this.log(level, 'API_CALL', `API调用: ${method} ${url} -> ${status}`, {
      url,
      method,
      status,
      responseTime,
      error
    })
  }

  logSubmit(configData, isValid) {
    return this.info('SUBMIT', `表单提交: ${isValid ? '成功' : '失败'}`, {
      isValid,
      configData,
      crowdLayersCount: configData?.crowdLayers?.length || 0
    })
  }

  // 获取日志摘要
  getLogSummary() {
    const summary = {
      sessionId: this.sessionId,
      totalLogs: this.logs.length,
      logsByLevel: {},
      logsByCategory: {},
      recentErrors: [],
      recentWarnings: []
    }

    this.logs.forEach(log => {
      // 按级别统计
      summary.logsByLevel[log.level] = (summary.logsByLevel[log.level] || 0) + 1
      
      // 按类别统计
      summary.logsByCategory[log.category] = (summary.logsByCategory[log.category] || 0) + 1
      
      // 收集最近的错误和警告
      if (log.level === 'error') {
        summary.recentErrors.push(log)
      } else if (log.level === 'warn') {
        summary.recentWarnings.push(log)
      }
    })

    // 只保留最近的10条错误和警告
    summary.recentErrors = summary.recentErrors.slice(-10)
    summary.recentWarnings = summary.recentWarnings.slice(-10)

    return summary
  }

  // 导出日志
  exportLogs() {
    return {
      sessionId: this.sessionId,
      exportTime: this.formatTimestamp(),
      logs: this.logs,
      summary: this.getLogSummary()
    }
  }

  // 清空日志
  clearLogs() {
    this.logs = []
    this.info('SYSTEM', '日志已清空')
  }
}

// 创建全局实例
const crowdSplitLogger = new CrowdSplitLogger()

export default crowdSplitLogger