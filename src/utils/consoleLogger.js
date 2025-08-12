/**
 * 控制台日志捕获工具 - 简化版
 * 将浏览器控制台日志保存到技术方案目录
 */

class ConsoleLogger {
  constructor() {
    this.logBuffer = [];
    this.originalConsole = {};
    this.maxBufferSize = 500;
    this.flushInterval = 3000; // 3秒自动保存一次
    this.isInitialized = false;
    this.flushTimer = null;
    this.logServerUrl = window.location.origin; // 使用当前前端服务器地址
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    // 保存原始的控制台方法
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };

    // 重写控制台方法
    this.overrideConsole();
    
    // 启动定时保存
    this.startAutoSave();
    
    // 页面刷新时处理
    this.setupPageHandlers();
    
    this.isInitialized = true;
    this.addLog('INFO', 'ConsoleLogger', '🚀 控制台日志捕获系统已启动');
  }

  overrideConsole() {
    const self = this;
    
    console.log = function(...args) {
      self.originalConsole.log.apply(console, args);
      self.addLog('LOG', 'Console', self.formatArgs(args));
    };

    console.warn = function(...args) {
      self.originalConsole.warn.apply(console, args);
      self.addLog('WARN', 'Console', self.formatArgs(args));
    };

    console.error = function(...args) {
      self.originalConsole.error.apply(console, args);
      self.addLog('ERROR', 'Console', self.formatArgs(args));
    };

    console.info = function(...args) {
      self.originalConsole.info.apply(console, args);
      self.addLog('INFO', 'Console', self.formatArgs(args));
    };

    console.debug = function(...args) {
      self.originalConsole.debug.apply(console, args);
      self.addLog('DEBUG', 'Console', self.formatArgs(args));
    };
  }

  formatArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  addLog(level, source, message) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      source,
      message,
      url: window.location.href
    };

    this.logBuffer.push(logEntry);

    // 如果缓存超过最大大小，移除最旧的日志
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  formatLogEntry(entry) {
    const time = new Date(entry.timestamp).toLocaleString('zh-CN');
    return `[${time}] [${entry.level}] [${entry.source}] ${entry.message}`;
  }

  generateLogContent() {
    const header = `# 实时控制台日志
**生成时间：** ${new Date().toLocaleString('zh-CN')}
**页面URL：** ${window.location.href}
**用户代理：** ${navigator.userAgent}
**日志条数：** ${this.logBuffer.length}

---

`;

    const logs = this.logBuffer.map(entry => this.formatLogEntry(entry)).join('\n');
    
    const footer = `

---
**日志结束** - 总计 ${this.logBuffer.length} 条记录
**最后更新：** ${new Date().toLocaleString('zh-CN')}
`;
    
    return header + logs + footer;
  }



  async saveToFile() {
    // 如果日志服务器URL未设置或无效，则不尝试保存
    if (!this.logServerUrl || this.logServerUrl === 'http://localhost:5173' || this.logServerUrl === 'http://localhost:5174') {
      return;
    }
    
    const content = this.generateLogContent();
    
    try {
      const response = await fetch(`${this.logServerUrl}/api/write-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        console.log('✅ 日志已写入文件');
      } else {
        throw new Error(`API响应错误: ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ 日志写入失败:', error.message);
    }
  }



  startAutoSave() {
    // 定时自动保存
    setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.saveToFile();
      }
    }, this.flushInterval);
  }

  setupPageHandlers() {
    // 页面刷新前保存日志
    window.addEventListener('beforeunload', () => {
      if (this.logBuffer.length > 0) {
        this.saveToFile();
      }
    });

    // 页面加载完成后清空旧日志
    window.addEventListener('load', () => {
      this.clearOldLogs();
    });

    // 页面可见性变化时保存日志
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.logBuffer.length > 0) {
        this.saveToFile();
      }
    });
  }

  clearOldLogs() {
    // 清空当前缓存，开始新的日志记录
    this.logBuffer = [];
    this.addLog('INFO', 'ConsoleLogger', '📄 新页面加载，日志已重置');
  }

  // 手动保存日志
  async manualSave() {
    await this.saveToFile();
    this.addLog('INFO', 'ConsoleLogger', '✅ 手动保存日志完成');
  }

  // 清空当前日志
  async clearLogs() {
    this.logBuffer = [];
    
    try {
      // 通过API清空文件
      const response = await fetch(`${this.logServerUrl}/api/clear-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        this.addLog('INFO', 'ConsoleLogger', '🧹 日志已清空（包括技术方案目录文件）');
      } else {
        this.addLog('WARN', 'ConsoleLogger', '⚠️ API清空失败，仅清空内存缓存');
      }
    } catch (error) {
      this.addLog('WARN', 'ConsoleLogger', `⚠️ API清空失败，仅清空内存缓存: ${error.message}`);
    }
  }

  // 获取当前日志统计
  getLogStats() {
    const stats = {
      total: this.logBuffer.length,
      byLevel: {}
    };

    this.logBuffer.forEach(entry => {
      stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
    });

    return stats;
  }

  // 获取当前日志缓存
  getCurrentLogs() {
    return this.logBuffer;
  }

  // 销毁日志捕获器
  destroy() {
    if (!this.isInitialized) return;

    // 最后一次保存日志
    if (this.logBuffer.length > 0) {
      this.saveToFile();
    }

    // 恢复原始控制台方法
    Object.assign(console, this.originalConsole);
    
    this.isInitialized = false;
    this.originalConsole.log('📝 ConsoleLogger 已销毁');
  }
}

// 创建全局实例
let globalConsoleLogger = null;

export function initConsoleLogger() {
  if (!globalConsoleLogger) {
    globalConsoleLogger = new ConsoleLogger();
    
    // 添加全局方法到window对象，方便调试
    window.saveConsoleLogs = () => globalConsoleLogger.manualSave();
    window.clearConsoleLogs = () => globalConsoleLogger.clearLogs();
    window.getLogStats = () => globalConsoleLogger.getLogStats();
  }
  return globalConsoleLogger;
}

export function getConsoleLogger() {
  return globalConsoleLogger;
}

export function destroyConsoleLogger() {
  if (globalConsoleLogger) {
    globalConsoleLogger.destroy();
    globalConsoleLogger = null;
    
    // 清理全局方法
    delete window.saveConsoleLogs;
    delete window.clearConsoleLogs;
    delete window.getLogStats;
  }
}

// 自动初始化（在开发环境）
if (import.meta.env.DEV) {
  initConsoleLogger();
}

export default ConsoleLogger;