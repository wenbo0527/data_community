import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { MonitorTarget, MonitorRule, MonitorSchedule, MonitorRun, Alert } from '../types/monitor';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const CONFIG_DIR = path.join(DATA_DIR, 'config');
const RUNS_DIR = path.join(DATA_DIR, 'runs');
const SCREENSHOTS_DIR = path.join(DATA_DIR, 'screenshots');
const HAR_DIR = path.join(DATA_DIR, 'har');

export class StorageService {
  async initialize(): Promise<void> {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.mkdir(RUNS_DIR, { recursive: true });
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    await fs.mkdir(HAR_DIR, { recursive: true });
  }

  private async readJsonFile<T>(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeJsonFile(filePath: string, data: any): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async getTargets(): Promise<MonitorTarget[]> {
    const filePath = path.join(CONFIG_DIR, 'targets.json');
    return this.readJsonFile<MonitorTarget>(filePath);
  }

  async saveTargets(targets: MonitorTarget[]): Promise<void> {
    const filePath = path.join(CONFIG_DIR, 'targets.json');
    await this.writeJsonFile(filePath, targets);
  }

  async getRules(): Promise<MonitorRule[]> {
    const filePath = path.join(CONFIG_DIR, 'rules.json');
    return this.readJsonFile<MonitorRule>(filePath);
  }

  async saveRules(rules: MonitorRule[]): Promise<void> {
    const filePath = path.join(CONFIG_DIR, 'rules.json');
    await this.writeJsonFile(filePath, rules);
  }

  async getSchedules(): Promise<MonitorSchedule[]> {
    const filePath = path.join(CONFIG_DIR, 'schedules.json');
    return this.readJsonFile<MonitorSchedule>(filePath);
  }

  async saveSchedules(schedules: MonitorSchedule[]): Promise<void> {
    const filePath = path.join(CONFIG_DIR, 'schedules.json');
    await this.writeJsonFile(filePath, schedules);
  }

  async getRuns(limit: number = 100): Promise<MonitorRun[]> {
    const filePath = path.join(RUNS_DIR, 'runs.json');
    const runs = await this.readJsonFile<MonitorRun>(filePath);
    return runs.slice(0, limit);
  }

  async saveRun(run: MonitorRun): Promise<void> {
    const filePath = path.join(RUNS_DIR, 'runs.json');
    const runs = await this.getRuns();
    runs.unshift(run);
    
    if (runs.length > 1000) {
      runs.splice(1000);
    }
    
    await this.writeJsonFile(filePath, runs);
  }

  async getAlerts(): Promise<Alert[]> {
    const filePath = path.join(CONFIG_DIR, 'alerts.json');
    return this.readJsonFile<Alert>(filePath);
  }

  async saveAlerts(alerts: Alert[]): Promise<void> {
    const filePath = path.join(CONFIG_DIR, 'alerts.json');
    await this.writeJsonFile(filePath, alerts);
  }

  async saveScreenshot(targetId: string, runId: string, screenshot: Buffer): Promise<string> {
    const fileName = `${targetId}_${runId}_${Date.now()}.png`;
    const filePath = path.join(SCREENSHOTS_DIR, fileName);
    await fs.writeFile(filePath, screenshot);
    return fileName;
  }

  async saveHar(targetId: string, runId: string, har: any): Promise<string> {
    const fileName = `${targetId}_${runId}_${Date.now()}.har`;
    const filePath = path.join(HAR_DIR, fileName);
    await this.writeJsonFile(filePath, har);
    return fileName;
  }

  async getScreenshot(fileName: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(SCREENSHOTS_DIR, fileName);
      return await fs.readFile(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async getHar(fileName: string): Promise<any | null> {
    try {
      const filePath = path.join(HAR_DIR, fileName);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async cleanupOldFiles(days: number = 30): Promise<void> {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const cleanupDir = async (dir: string) => {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          if (stats.mtime.getTime() < cutoff) {
            await fs.unlink(filePath);
          }
        }
      } catch (error) {
        console.warn(`Cleanup failed for ${dir}:`, error);
      }
    };

    await Promise.all([
      cleanupDir(SCREENSHOTS_DIR),
      cleanupDir(HAR_DIR)
    ]);
  }

  // Job management methods
  async getRunningJobs(targetId: string): Promise<any[]> {
    const jobsDir = path.join(DATA_DIR, 'jobs');
    
    try {
      const files = await fs.readdir(jobsDir);
      const jobs = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(jobsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const job = JSON.parse(content);
          if (job.targetId === targetId && job.status === 'running') {
            jobs.push(job);
          }
        }
      }
      
      return jobs;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async createJob(job: any): Promise<void> {
    const jobsDir = path.join(DATA_DIR, 'jobs');
    const filePath = path.join(jobsDir, `${job.id}.json`);
    await this.writeJsonFile(filePath, job);
  }

  async updateJob(jobId: string, updates: Partial<any>): Promise<void> {
    const jobsDir = path.join(DATA_DIR, 'jobs');
    const filePath = path.join(jobsDir, `${jobId}.json`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const job = JSON.parse(content);
    const updatedJob = { ...job, ...updates };
    await this.writeJsonFile(filePath, updatedJob);
  }
}