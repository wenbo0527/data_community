/**
 * TaskStorage - 任务存储管理工具类
 * 提供任务的本地存储、检索、删除等功能
 */
export class TaskStorage {
  static STORAGE_KEY = 'marketing_tasks';
  static STATS_KEY = 'marketing_tasks_stats';

  /**
   * 获取所有任务
   * @returns {Array} 任务列表
   */
  static getAllTasks() {
    try {
      const tasks = localStorage.getItem(this.STORAGE_KEY);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('获取任务列表失败:', error);
      return [];
    }
  }

  /**
   * 保存任务
   * @param {Object} task - 任务对象
   * @returns {boolean} 保存是否成功
   */
  static saveTask(task) {
    try {
      const tasks = this.getAllTasks();
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = { ...tasks[existingIndex], ...task };
      } else {
        task.id = task.id || Date.now().toString();
        task.createdAt = task.createdAt || new Date().toISOString();
        tasks.push(task);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      this.updateStats();
      console.log('任务保存成功:', task.id);
      return true;
    } catch (error) {
      console.error('保存任务失败:', error);
      return false;
    }
  }

  /**
   * 创建新任务
   * @param {Object} taskData - 任务数据
   * @returns {Object} 创建的任务对象
   */
  static createTask(taskData) {
    try {
      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: taskData.status || 'draft'
      };
      
      const success = this.saveTask(newTask);
      if (success) {
        console.log('✅ [TaskStorage] 创建新任务成功:', newTask.id);
        return newTask;
      } else {
        throw new Error('保存任务失败');
      }
    } catch (error) {
      console.error('❌ [TaskStorage] 创建任务失败:', error);
      throw error;
    }
  }

  /**
   * 更新现有任务
   * @param {string} taskId - 任务ID
   * @param {Object} taskData - 更新的任务数据
   * @returns {Object} 更新后的任务对象
   */
  static updateTask(taskId, taskData) {
    try {
      const updatedTask = {
        ...taskData,
        id: taskId,
        updatedAt: new Date().toISOString()
      };
      
      const success = this.saveTask(updatedTask);
      if (success) {
        console.log('✅ [TaskStorage] 更新任务成功:', taskId);
        return updatedTask;
      } else {
        throw new Error('保存任务失败');
      }
    } catch (error) {
      console.error('❌ [TaskStorage] 更新任务失败:', error);
      throw error;
    }
  }

  /**
   * 删除任务
   * @param {string} taskId - 任务ID
   * @returns {boolean} 删除是否成功
   */
  static deleteTask(taskId) {
    try {
      const tasks = this.getAllTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      
      if (filteredTasks.length === tasks.length) {
        console.warn('未找到要删除的任务:', taskId);
        return false;
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTasks));
      this.updateStats();
      console.log('任务删除成功:', taskId);
      return true;
    } catch (error) {
      console.error('删除任务失败:', error);
      return false;
    }
  }

  /**
   * 获取存储统计信息
   * @returns {Object} 统计信息对象
   */
  static getStorageStats() {
    try {
      const stats = localStorage.getItem(this.STATS_KEY);
      if (stats) {
        return JSON.parse(stats);
      }
      
      // 如果没有统计信息，生成默认统计
      const tasks = this.getAllTasks();
      const defaultStats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        runningTasks: tasks.filter(t => t.status === 'running').length,
        storageSize: this.getStorageSize(),
        lastUpdated: new Date().toISOString()
      };
      
      this.saveStats(defaultStats);
      return defaultStats;
    } catch (error) {
      console.error('获取存储统计失败:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        runningTasks: 0,
        storageSize: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 更新统计信息
   */
  static updateStats() {
    try {
      const tasks = this.getAllTasks();
      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        runningTasks: tasks.filter(t => t.status === 'running').length,
        storageSize: this.getStorageSize(),
        lastUpdated: new Date().toISOString()
      };
      
      this.saveStats(stats);
    } catch (error) {
      console.error('更新统计信息失败:', error);
    }
  }

  /**
   * 保存统计信息
   * @param {Object} stats - 统计信息对象
   */
  static saveStats(stats) {
    try {
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('保存统计信息失败:', error);
    }
  }

  /**
   * 获取存储大小（字节）
   * @returns {number} 存储大小
   */
  static getStorageSize() {
    try {
      const tasks = localStorage.getItem(this.STORAGE_KEY) || '';
      const stats = localStorage.getItem(this.STATS_KEY) || '';
      return new Blob([tasks + stats]).size;
    } catch (error) {
      console.error('计算存储大小失败:', error);
      return 0;
    }
  }

  /**
   * 根据条件查找任务
   * @param {Function} predicate - 查找条件函数
   * @returns {Array} 匹配的任务列表
   */
  static findTasks(predicate) {
    try {
      const tasks = this.getAllTasks();
      return tasks.filter(predicate);
    } catch (error) {
      console.error('查找任务失败:', error);
      return [];
    }
  }

  /**
   * 根据ID获取单个任务
   * @param {string} taskId - 任务ID
   * @returns {Object|null} 任务对象或null
   */
  static getTaskById(taskId) {
    try {
      const tasks = this.getAllTasks();
      return tasks.find(task => task.id === taskId) || null;
    } catch (error) {
      console.error('获取任务失败:', error);
      return null;
    }
  }

  /**
   * 清空所有任务
   * @returns {boolean} 清空是否成功
   */
  static clearAllTasks() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STATS_KEY);
      console.log('所有任务已清空');
      return true;
    } catch (error) {
      console.error('清空任务失败:', error);
      return false;
    }
  }

  /**
   * 导出任务数据
   * @returns {string} JSON格式的任务数据
   */
  static exportTasks() {
    try {
      const tasks = this.getAllTasks();
      const stats = this.getStorageStats();
      return JSON.stringify({
        tasks,
        stats,
        exportedAt: new Date().toISOString()
      }, null, 2);
    } catch (error) {
      console.error('导出任务失败:', error);
      return '{}';
    }
  }

  /**
   * 导入任务数据
   * @param {string} jsonData - JSON格式的任务数据
   * @returns {boolean} 导入是否成功
   */
  static importTasks(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks && Array.isArray(data.tasks)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.tasks));
        this.updateStats();
        console.log('任务导入成功，共导入', data.tasks.length, '个任务');
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入任务失败:', error);
      return false;
    }
  }
}

// 默认导出
export default TaskStorage;