import type { MonitorTarget, MonitorRule, MonitorSchedule, MonitorRun, Alert } from '@/types/monitor';

const API_BASE = 'http://localhost:3001/api';

class ApiService {
  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Targets
  async getTargets(): Promise<MonitorTarget[]> {
    return this.fetchJson('/targets');
  }

  async createTarget(target: Omit<MonitorTarget, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonitorTarget> {
    return this.fetchJson('/targets', {
      method: 'POST',
      body: JSON.stringify(target),
    });
  }

  async updateTarget(id: string, target: Partial<MonitorTarget>): Promise<MonitorTarget> {
    return this.fetchJson(`/targets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(target),
    });
  }

  async deleteTarget(id: string): Promise<void> {
    await this.fetchJson(`/targets/${id}`, { method: 'DELETE' });
  }

  // Rules
  async getRules(): Promise<MonitorRule[]> {
    return this.fetchJson('/rules');
  }

  async createRule(rule: Omit<MonitorRule, 'id'>): Promise<MonitorRule> {
    return this.fetchJson('/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async updateRule(id: string, rule: Partial<MonitorRule>): Promise<MonitorRule> {
    return this.fetchJson(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
  }

  async deleteRule(id: string): Promise<void> {
    await this.fetchJson(`/rules/${id}`, { method: 'DELETE' });
  }

  // Schedules
  async getSchedules(): Promise<MonitorSchedule[]> {
    return this.fetchJson('/schedules');
  }

  async createSchedule(schedule: Omit<MonitorSchedule, 'id'>): Promise<MonitorSchedule> {
    return this.fetchJson('/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  async updateSchedule(id: string, schedule: Partial<MonitorSchedule>): Promise<MonitorSchedule> {
    return this.fetchJson(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.fetchJson(`/schedules/${id}`, { method: 'DELETE' });
  }

  // Runs
  async getRuns(): Promise<MonitorRun[]> {
    return this.fetchJson('/runs');
  }

  async getRun(id: string): Promise<MonitorRun> {
    return this.fetchJson(`/runs/${id}`);
  }

  async triggerRun(targetId: string): Promise<MonitorRun> {
    return this.fetchJson('/runs/trigger', {
      method: 'POST',
      body: JSON.stringify({ targetId }),
    });
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return this.fetchJson('/alerts');
  }

  async updateAlert(id: string, alert: Partial<Alert>): Promise<Alert> {
    return this.fetchJson(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alert),
    });
  }

  // Exploration Mode
  async createExplorationSession(targetId: string): Promise<any> {
    return this.fetchJson(`/explore/${targetId}`, {
      method: 'POST',
    });
  }

  async getExplorationSession(sessionId: string): Promise<any> {
    return this.fetchJson(`/explore/${sessionId}`);
  }

  async analyzeExplorationSession(sessionId: string): Promise<any> {
    return this.fetchJson(`/explore/${sessionId}/analyze`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();