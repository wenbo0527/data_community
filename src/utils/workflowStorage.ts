import type {
  Workflow,
  DataSourceStorage,
  WorkflowStorage as WorkflowStorageType,
  AppSettings,
  FileDataSource,
  DatabaseConnection
} from '../types/workflow';

/**
 * 工作流本地存储管理工具类
 */
export class WorkflowStorage {
  private static readonly STORAGE_KEYS = {
    WORKFLOWS: 'workflow_storage_workflows',
    DATA_SOURCES: 'workflow_storage_data_sources',
    SETTINGS: 'workflow_storage_settings'
  };

  /**
   * 获取所有工作流
   */
  static getWorkflows(): Workflow[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.WORKFLOWS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取工作流数据失败:', error);
      return [];
    }
  }

  /**
   * 保存工作流
   */
  static saveWorkflow(workflow: Workflow): boolean {
    try {
      const workflows = this.getWorkflows();
      const existingIndex = workflows.findIndex(w => w.id === workflow.id);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = { ...workflow, updatedAt: new Date().toISOString() };
      } else {
        workflows.push(workflow);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
      return true;
    } catch (error) {
      console.error('保存工作流失败:', error);
      return false;
    }
  }

  /**
   * 获取单个工作流
   */
  static getWorkflow(id: string): Workflow | null {
    const workflows = this.getWorkflows();
    return workflows.find(w => w.id === id) || null;
  }

  /**
   * 删除工作流
   */
  static deleteWorkflow(id: string): boolean {
    try {
      const workflows = this.getWorkflows();
      const filteredWorkflows = workflows.filter(w => w.id !== id);
      localStorage.setItem(this.STORAGE_KEYS.WORKFLOWS, JSON.stringify(filteredWorkflows));
      return true;
    } catch (error) {
      console.error('删除工作流失败:', error);
      return false;
    }
  }

  /**
   * 获取数据源配置
   */
  static getDataSources(): DataSourceStorage {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.DATA_SOURCES);
      return data ? JSON.parse(data) : { files: [], databases: [] };
    } catch (error) {
      console.error('获取数据源配置失败:', error);
      return { files: [], databases: [] };
    }
  }

  /**
   * 保存文件数据源
   */
  static saveFileDataSource(fileDataSource: FileDataSource): boolean {
    try {
      const dataSources = this.getDataSources();
      const existingIndex = dataSources.files.findIndex(f => f.id === fileDataSource.id);
      
      if (existingIndex >= 0) {
        dataSources.files[existingIndex] = fileDataSource;
      } else {
        dataSources.files.push(fileDataSource);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.DATA_SOURCES, JSON.stringify(dataSources));
      return true;
    } catch (error) {
      console.error('保存文件数据源失败:', error);
      return false;
    }
  }

  /**
   * 保存数据库连接
   */
  static saveDatabaseConnection(dbConnection: DatabaseConnection): boolean {
    try {
      const dataSources = this.getDataSources();
      const existingIndex = dataSources.databases.findIndex(db => db.id === dbConnection.id);
      
      if (existingIndex >= 0) {
        dataSources.databases[existingIndex] = dbConnection;
      } else {
        dataSources.databases.push(dbConnection);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.DATA_SOURCES, JSON.stringify(dataSources));
      return true;
    } catch (error) {
      console.error('保存数据库连接失败:', error);
      return false;
    }
  }

  /**
   * 删除数据源
   */
  static deleteDataSource(id: string, type: 'file' | 'database'): boolean {
    try {
      const dataSources = this.getDataSources();
      
      if (type === 'file') {
        dataSources.files = dataSources.files.filter(f => f.id !== id);
      } else {
        dataSources.databases = dataSources.databases.filter(db => db.id !== id);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.DATA_SOURCES, JSON.stringify(dataSources));
      return true;
    } catch (error) {
      console.error('删除数据源失败:', error);
      return false;
    }
  }

  /**
   * 获取应用设置
   */
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        autoSave: true,
        debugMode: false,
        theme: 'light'
      };
    } catch (error) {
      console.error('获取应用设置失败:', error);
      return {
        autoSave: true,
        debugMode: false,
        theme: 'light'
      };
    }
  }

  /**
   * 保存应用设置
   */
  static saveSettings(settings: AppSettings): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('保存应用设置失败:', error);
      return false;
    }
  }

  /**
   * 生成唯一ID
   */
  static generateId(): string {
    return 'workflow_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 清空所有数据
   */
  static clearAll(): boolean {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }

  /**
   * 导出数据
   */
  static exportData(): WorkflowStorageType {
    return {
      workflows: this.getWorkflows(),
      dataSources: this.getDataSources(),
      settings: this.getSettings()
    };
  }

  /**
   * 导入数据
   */
  static importData(data: WorkflowStorageType): boolean {
    try {
      if (data.workflows) {
        localStorage.setItem(this.STORAGE_KEYS.WORKFLOWS, JSON.stringify(data.workflows));
      }
      if (data.dataSources) {
        localStorage.setItem(this.STORAGE_KEYS.DATA_SOURCES, JSON.stringify(data.dataSources));
      }
      if (data.settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

}

export default WorkflowStorage;