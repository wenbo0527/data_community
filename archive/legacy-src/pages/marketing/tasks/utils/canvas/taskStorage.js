/**
 * 任务数据本地存储工具类
 * 用于测试画布保存和加载功能
 */

const STORAGE_KEY = 'marketing_tasks'
const TASK_COUNTER_KEY = 'task_counter'

export class TaskStorage {
  /**
   * 获取所有任务
   */
  static getAllTasks() {
    try {
      const tasks = localStorage.getItem(STORAGE_KEY)
      return tasks ? JSON.parse(tasks) : []
    } catch (error) {
      console.error('获取任务列表失败:', error)
      return []
    }
  }

  /**
   * 根据ID获取任务
   */
  static getTaskById(id) {
    try {
      const tasks = this.getAllTasks()
      return tasks.find(task => task.id === id)
    } catch (error) {
      console.error('获取任务失败:', error)
      return null
    }
  }

  /**
   * 保存任务
   */
  static saveTask(taskData) {
    try {
      const tasks = this.getAllTasks()
      const existingIndex = tasks.findIndex(task => task.id === taskData.id)
      
      const taskToSave = {
        ...taskData,
        updateTime: new Date().toLocaleString('zh-CN'),
        version: taskData.version || 1
      }

      if (existingIndex >= 0) {
        // 更新现有任务
        tasks[existingIndex] = taskToSave
      } else {
        // 新建任务
        if (!taskToSave.id) {
          taskToSave.id = this.generateTaskId()
        }
        taskToSave.createTime = taskToSave.createTime || new Date().toLocaleString('zh-CN')
        tasks.push(taskToSave)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
      
      console.log('✅ [TaskStorage] 任务保存成功:', {
        id: taskToSave.id,
        name: taskToSave.name,
        nodesCount: taskToSave.canvasData?.nodes?.length || 0,
        connectionsCount: taskToSave.canvasData?.connections?.length || 0
      })
      
      return taskToSave
    } catch (error) {
      console.error('❌ [TaskStorage] 保存任务失败:', error)
      throw error
    }
  }

  /**
   * 删除任务
   */
  static deleteTask(id) {
    try {
      const tasks = this.getAllTasks()
      const filteredTasks = tasks.filter(task => task.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTasks))
      
      console.log('✅ [TaskStorage] 任务删除成功:', id)
      return true
    } catch (error) {
      console.error('❌ [TaskStorage] 删除任务失败:', error)
      return false
    }
  }

  /**
   * 生成任务ID
   */
  static generateTaskId() {
    try {
      let counter = parseInt(localStorage.getItem(TASK_COUNTER_KEY) || '0')
      counter++
      localStorage.setItem(TASK_COUNTER_KEY, counter.toString())
      return counter
    } catch (error) {
      console.error('生成任务ID失败:', error)
      throw new Error(`生成任务ID失败: ${error.message}`)
    }
  }

  /**
   * 清空所有任务（测试用）
   */
  static clearAllTasks() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TASK_COUNTER_KEY)
      console.log('✅ [TaskStorage] 所有任务已清空')
      return true
    } catch (error) {
      console.error('❌ [TaskStorage] 清空任务失败:', error)
      return false
    }
  }

  /**
   * 导出任务数据（用于备份）
   */
  static exportTasks() {
    try {
      const tasks = this.getAllTasks()
      const exportData = {
        tasks,
        exportTime: new Date().toLocaleString('zh-CN'),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `marketing_tasks_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      console.log('✅ [TaskStorage] 任务数据导出成功')
      return true
    } catch (error) {
      console.error('❌ [TaskStorage] 导出任务失败:', error)
      return false
    }
  }

  /**
   * 导入任务数据（用于恢复）
   */
  static importTasks(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target.result)
            if (importData.tasks && Array.isArray(importData.tasks)) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(importData.tasks))
              console.log('✅ [TaskStorage] 任务数据导入成功:', importData.tasks.length)
              resolve(importData.tasks)
            } else {
              throw new Error('无效的任务数据格式')
            }
          } catch (parseError) {
            console.error('❌ [TaskStorage] 解析导入数据失败:', parseError)
            reject(parseError)
          }
        }
        reader.onerror = () => {
          console.error('❌ [TaskStorage] 读取文件失败')
          reject(new Error('读取文件失败'))
        }
        reader.readAsText(file)
      } catch (error) {
        console.error('❌ [TaskStorage] 导入任务失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 获取存储统计信息
   */
  static getStorageStats() {
    try {
      const tasks = this.getAllTasks()
      const totalSize = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size
      
      return {
        taskCount: tasks.length,
        storageSize: totalSize,
        storageSizeFormatted: this.formatBytes(totalSize),
        lastUpdate: tasks.length > 0 ? Math.max(...tasks.map(t => new Date(t.updateTime || t.createTime).getTime())) : null
      }
    } catch (error) {
      console.error('获取存储统计失败:', error)
      return {
        taskCount: 0,
        storageSize: 0,
        storageSizeFormatted: '0 B',
        lastUpdate: null
      }
    }
  }

  /**
   * 创建新任务（便捷方法）
   */
  static createTask(taskData) {
    const newTask = {
      ...taskData,
      id: this.generateTaskId(),
      createTime: new Date().toLocaleString('zh-CN'),
      status: taskData.status || 'draft'
    }
    return this.saveTask(newTask)
  }

  /**
   * 更新现有任务（便捷方法）
   */
  static updateTask(id, taskData) {
    const updatedTask = {
      ...taskData,
      id: id,
      updateTime: new Date().toLocaleString('zh-CN')
    }
    return this.saveTask(updatedTask)
  }

  /**
   * 格式化字节大小
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export default TaskStorage