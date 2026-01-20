import { v4 as uuidv4 } from 'uuid';
import type { Alert, MonitorRun } from '../types/monitor.js';
import type { StorageService } from './storage.js';

export class AlertService {
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async createAlert(run: MonitorRun, targetName: string): Promise<Alert | null> {
    if (run.status === 'success' || run.errors.length === 0) {
      return null;
    }

    const criticalErrors = run.errors.filter(e => 
      e.type === 'networkOk' || e.type === 'screenshotDiff' || e.type === 'system_error'
    );
    
    const level = criticalErrors.length > 0 ? 'critical' : 'error';
    
    const alert: Alert = {
      id: uuidv4(),
      runId: run.id,
      targetId: run.targetId,
      level,
      channel: ['internal', 'email'],
      message: this.generateAlertMessage(run, targetName),
      state: 'open',
      createdAt: new Date().toISOString()
    };

    const alerts = await this.storage.getAlerts();
    alerts.unshift(alert);
    await this.storage.saveAlerts(alerts);

    return alert;
  }

  private generateAlertMessage(run: MonitorRun, targetName: string): string {
    const errorCount = run.errors.length;
    const errorTypes = [...new Set(run.errors.map(e => e.type))].join(', ');
    
    let message = `监控目标 "${targetName}" 检测失败`;
    message += `\n错误数量: ${errorCount}`;
    message += `\n错误类型: ${errorTypes}`;
    message += `\n运行ID: ${run.id}`;
    message += `\n持续时间: ${run.duration}ms`;
    
    if (run.errors.length > 0) {
      message += `\n\n详细错误:`;
      run.errors.forEach((error, index) => {
        message += `\n${index + 1}. ${error.type}: ${error.message}`;
      });
    }

    return message;
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    const alerts = await this.storage.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return false;
    }

    alert.state = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    await this.storage.saveAlerts(alerts);
    
    return true;
  }

  async closeAlert(alertId: string): Promise<boolean> {
    const alerts = await this.storage.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return false;
    }

    alert.state = 'closed';
    alert.closedAt = new Date().toISOString();
    await this.storage.saveAlerts(alerts);
    
    return true;
  }

  async getOpenAlerts(): Promise<Alert[]> {
    const alerts = await this.storage.getAlerts();
    return alerts.filter(a => a.state === 'open');
  }

  async getAllAlerts(limit: number = 100): Promise<Alert[]> {
    const alerts = await this.storage.getAlerts();
    return alerts.slice(0, limit);
  }
}