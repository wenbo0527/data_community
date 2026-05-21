import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  DebugLog,
  NodeExecutionContext,
  NodeExecutionResult,
  DataSourceConfig,
  SqlConfig,
  PythonConfig
} from '../types/workflow';

// 扩展的调试会话接口
interface DebugSession {
  id: string;
  workflowId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'stopped';
  breakpoints: string[];
  stepMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logs: DebugLog[];
  currentNodeId: string | null;
  executionStack: string[];
  variables: Map<string, any>;
  startTime: Date | null;
  endTime: Date | null;
}
import { WorkflowStorage } from './workflowStorage';

/**
 * 工作流调试器
 * 负责节点测试执行和全流程调试
 */
export class WorkflowDebugger {
  private static instance: WorkflowDebugger;
  private debugSessions: Map<string, DebugSession> = new Map();
  private executionResults: Map<string, NodeExecutionResult> = new Map();

  static getInstance(): WorkflowDebugger {
    if (!WorkflowDebugger.instance) {
      WorkflowDebugger.instance = new WorkflowDebugger();
    }
    return WorkflowDebugger.instance;
  }

  /**
   * 创建调试会话
   */
  createDebugSession(workflowId: string, config: {
    breakpoints?: string[];
    stepMode?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
  } = {}): DebugSession {
    const session: DebugSession = {
      id: WorkflowStorage.generateId(),
      workflowId,
      status: 'idle',
      breakpoints: config.breakpoints || [],
      stepMode: config.stepMode || false,
      logLevel: config.logLevel || 'info',
      logs: [],
      currentNodeId: null,
      executionStack: [],
      variables: new Map(),
      startTime: null,
      endTime: null
    };

    this.debugSessions.set(session.id, session);
    return session;
  }

  /**
   * 获取调试会话
   */
  getDebugSession(sessionId: string): DebugSession | null {
    return this.debugSessions.get(sessionId) || null;
  }

  /**
   * 删除调试会话
   */
  removeDebugSession(sessionId: string): boolean {
    return this.debugSessions.delete(sessionId);
  }

  /**
   * 测试单个节点
   */
  async testNode(
    node: WorkflowNode,
    inputData: any = null,
    context: Partial<NodeExecutionContext> = {}
  ): Promise<NodeExecutionResult> {
    const executionContext: NodeExecutionContext = {
      nodeId: node.id,
      workflowId: context.workflowId || 'test',
      sessionId: context.sessionId || 'test-session',
      inputData,
      parameters: context.parameters || {},
      environment: context.environment || 'test',
      timestamp: new Date()
    };

    const startTime = Date.now();
    let result: NodeExecutionResult;

    try {
      this.log(executionContext.sessionId, 'info', `开始测试节点: ${node.label}`, {
        nodeId: node.id,
        nodeType: node.type
      });

      switch (node.type) {
        case 'datasource':
          result = await this.executeDataSourceNode(node, executionContext);
          break;
        case 'sql':
          result = await this.executeSqlNode(node, executionContext);
          break;
        case 'python':
          result = await this.executePythonNode(node, executionContext);
          break;
        default:
          throw new Error(`不支持的节点类型: ${node.type}`);
      }

      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;
      result.success = true;

      this.log(executionContext.sessionId, 'info', `节点测试成功: ${node.label}`, {
        nodeId: node.id,
        executionTime,
        outputRows: result.outputData ? this.getDataRowCount(result.outputData) : 0
      });

    } catch (error) {
      const executionTime = Date.now() - startTime;
      result = {
        nodeId: node.id,
        success: false,
        error: error.message,
        errorDetails: error.stack,
        outputData: null,
        logs: [],
        executionTime,
        timestamp: new Date().toISOString()
      };

      this.log(executionContext.sessionId, 'error', `节点测试失败: ${node.label}`, {
        nodeId: node.id,
        error: error.message,
        executionTime
      });
    }

    // 缓存执行结果
    this.executionResults.set(node.id, result);
    return result;
  }

  /**
   * 执行完整工作流
   */
  async executeWorkflow(
    workflow: Workflow,
    sessionId?: string,
    options: {
      stepMode?: boolean;
      breakpoints?: string[];
    } = {}
  ): Promise<DebugSession> {
    const session = sessionId 
      ? this.getDebugSession(sessionId)
      : this.createDebugSession(workflow.id, options);

    if (!session) {
      throw new Error('调试会话不存在');
    }

    session.status = 'running';
    session.startTime = new Date();

    try {
      this.log(session.id, 'info', `开始执行工作流: ${workflow.name}`, {
        workflowId: workflow.id,
        nodeCount: workflow.nodes.length
      });

      // 构建执行图
      const executionOrder = this.buildExecutionOrder(workflow.nodes, workflow.edges);
      
      // 按顺序执行节点
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) {
          this.log(session.id, 'error', 'Node not found', { nodeId });
          return session;
        }

        session.currentNodeId = node.id;

        // 检查断点
        if (session.breakpoints.includes(nodeId)) {
          session.status = 'paused';
          this.log(session.id, 'info', `在断点处暂停: ${node.label}`, { nodeId });
          break;
        }

        // 获取输入数据
        const inputData = this.getNodeInputData(nodeId, workflow.edges);
        
        // 执行节点
        const context: NodeExecutionContext = {
          nodeId,
          workflowId: workflow.id,
          sessionId: session.id,
          inputData,
          parameters: {},
          environment: 'debug',
          timestamp: new Date()
        };

        const result = await this.testNode(node, inputData, context);
        
        if (!result.success) {
          session.status = 'error';
          this.log(session.id, 'error', `工作流执行失败`, {
            nodeId,
            error: result.error
          });
          break;
        }

        // 步进模式
        if (session.stepMode) {
          session.status = 'paused';
          this.log(session.id, 'info', `步进模式暂停: ${node.label}`, { nodeId });
          break;
        }
      }

      if (session.status === 'running') {
        session.status = 'completed';
        this.log(session.id, 'info', `工作流执行完成: ${workflow.name}`, {
          workflowId: workflow.id
        });
      }

    } catch (error) {
      session.status = 'error';
      this.log(session.id, 'error', `工作流执行异常: ${error.message}`, {
        workflowId: workflow.id,
        error: error.message
      });
    } finally {
      session.endTime = new Date();
    }

    return session;
  }

  /**
   * 继续执行（从断点或步进）
   */
  async continueExecution(sessionId: string): Promise<DebugSession> {
    const session = this.getDebugSession(sessionId);
    if (!session || session.status !== 'paused') {
      throw new Error('无效的调试会话状态');
    }

    const workflow = WorkflowStorage.getWorkflow(session.workflowId);
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    return this.executeWorkflow(workflow, sessionId);
  }

  /**
   * 停止执行
   */
  stopExecution(sessionId: string): boolean {
    const session = this.getDebugSession(sessionId);
    if (!session) return false;

    session.status = 'stopped';
    session.endTime = new Date();
    
    this.log(sessionId, 'info', '工作流执行已停止', {
      workflowId: session.workflowId
    });

    return true;
  }

  /**
   * 执行数据源节点
   */
  private async executeDataSourceNode(
    node: WorkflowNode,
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult> {
    const config = node.data.config as DataSourceConfig;
    
    // 模拟数据源执行
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let outputData;
    
    if (config.type === 'file') {
      const dataSources = WorkflowStorage.getDataSources();
      const fileSource = dataSources.files.find(f => f.fileName === config.fileData?.fileName);
      
      if (!fileSource) {
        throw new Error('文件数据源不存在');
      }
      
      // 解析文件数据
      if (fileSource.fileType === 'csv') {
        const lines = fileSource.content.split('\n');
        const headers = lines[0].split(',');
        const rows = lines.slice(1, 100).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          return row;
        });
        outputData = rows;
      } else {
        outputData = { content: fileSource.content };
      }
    } else {
      // 模拟数据库查询结果
      outputData = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `数据 ${i + 1}`,
        value: Math.random() * 100
      }));
    }

    return {
      nodeId: node.id,
      success: true,
      outputData,
      logs: [`数据源节点执行完成，输出 ${this.getDataRowCount(outputData)} 行数据`],
      executionTime: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行SQL节点
   */
  private async executeSqlNode(
    node: WorkflowNode,
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult> {
    const config = node.data.config as SqlConfig;
    
    if (!config.query?.trim()) {
      throw new Error('SQL查询语句不能为空');
    }

    // 模拟SQL执行
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟查询结果
    const outputData = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      column1: `值 ${i + 1}`,
      column2: Math.random() * 100,
      column3: new Date().toISOString().split('T')[0]
    }));

    return {
      nodeId: node.id,
      success: true,
      outputData,
      logs: [
        `SQL查询执行完成`,
        `查询语句: ${config.query.substring(0, 100)}...`,
        `返回 ${outputData.length} 行数据`
      ],
      executionTime: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行Python节点
   */
  private async executePythonNode(
    node: WorkflowNode,
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult> {
    const config = node.data.config as PythonConfig;
    
    if (!config.script?.trim()) {
      throw new Error('Python代码不能为空');
    }

    // 模拟Python执行
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟处理结果
    const inputData = context.inputData || [];
    const outputData = Array.isArray(inputData) 
      ? inputData.map((item: any, index: number) => ({
          ...item,
          processed: true,
          index,
          timestamp: new Date().toISOString()
        }))
      : { processed: true, result: 'Python代码执行完成' };

    return {
      nodeId: node.id,
      success: true,
      outputData,
      logs: [
        `Python代码执行完成`,
        `代码行数: ${config.script.split('\n').length}`,
        `使用包: ${config.dependencies?.join(', ') || '无'}`,
        `输出数据: ${this.getDataRowCount(outputData)} 行`
      ],
      executionTime: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 构建执行顺序
   */
  private buildExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // 初始化
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    // 构建邻接表和入度
    edges.forEach(edge => {
      const from = edge.source;
      const to = edge.target;
      
      adjList.get(from)?.push(to);
      inDegree.set(to, (inDegree.get(to) || 0) + 1);
    });

    // 拓扑排序
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);
      
      adjList.get(current)?.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    return order;
  }

  /**
   * 获取节点输入数据
   */
  private getNodeInputData(nodeId: string, edges: WorkflowEdge[]): any {
    const inputEdges = edges.filter(edge => edge.target === nodeId);
    
    if (inputEdges.length === 0) {
      return null;
    }

    // 获取第一个输入节点的输出数据
    const sourceNodeId = inputEdges[0].source;
    const result = this.executionResults.get(sourceNodeId);
    
    return result?.outputData || null;
  }

  /**
   * 记录日志
   */
  private log(
    sessionId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): void {
    const session = this.getDebugSession(sessionId);
    if (!session) return;

    const log: DebugLog = {
      id: WorkflowStorage.generateId(),
      sessionId,
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    session.logs.push(log);

    // 限制日志数量
    if (session.logs.length > 1000) {
      session.logs = session.logs.slice(-500);
    }
  }

  /**
   * 获取数据行数
   */
  private getDataRowCount(data: any): number {
    if (Array.isArray(data)) {
      return data.length;
    }
    if (data && typeof data === 'object') {
      return 1;
    }
    return 0;
  }

  /**
   * 获取节点执行结果
   */
  getNodeExecutionResult(nodeId: string): NodeExecutionResult | null {
    return this.executionResults.get(nodeId) || null;
  }

  /**
   * 清除执行结果缓存
   */
  clearExecutionResults(): void {
    this.executionResults.clear();
  }

  /**
   * 获取所有调试会话
   */
  getAllDebugSessions(): DebugSession[] {
    return Array.from(this.debugSessions.values());
  }

  /**
   * 清理过期的调试会话
   */
  cleanupExpiredSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    this.debugSessions.forEach((session, sessionId) => {
      const sessionTime = session.startTime ? new Date(session.startTime).getTime() : now;
      if (now - sessionTime > maxAge) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      this.debugSessions.delete(sessionId);
    });
  }
}

// 导出单例实例
export const workflowDebugger = WorkflowDebugger.getInstance();