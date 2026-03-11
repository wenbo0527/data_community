import cron from 'node-cron';
import type { StorageService } from './storage.js';
import type { MonitorService } from './monitor.js';
import type { AlertService } from './alert.js';
import type { MonitorSchedule, MonitorRun } from '../types/monitor.js';

export class SchedulerService {
  private jobs = new Map<string, cron.ScheduledTask>();
  
  constructor(
    private storage: StorageService,
    private monitor: MonitorService,
    private alert: AlertService
  ) {}

  async start() {
    console.log('Starting scheduler service...');
    
    // Load all enabled schedules
    const schedules = await this.storage.getSchedules();
    
    for (const schedule of schedules) {
      if (schedule.enabled) {
        await this.scheduleJob(schedule);
      }
    }
    
    console.log(`Scheduled ${this.jobs.size} jobs`);
  }

  async stop() {
    console.log('Stopping scheduler service...');
    
    for (const job of this.jobs.values()) {
      job.stop();
    }
    
    this.jobs.clear();
  }

  async scheduleJob(schedule: MonitorSchedule) {
    try {
      // Stop existing job if any
      await this.unscheduleJob(schedule.id);
      
      if (!schedule.enabled) {
        return;
      }
      
      console.log(`Scheduling job ${schedule.id} with cron: ${schedule.cron}`);
      
      const job = cron.schedule(schedule.cron, async () => {
        await this.executeSchedule(schedule);
      }, {
        scheduled: true,
        timezone: schedule.timezone
      });
      
      this.jobs.set(schedule.id, job);
    } catch (error) {
      console.error(`Failed to schedule job ${schedule.id}:`, error);
      throw error;
    }
  }

  async unscheduleJob(scheduleId: string) {
    const job = this.jobs.get(scheduleId);
    if (job) {
      job.stop();
      this.jobs.delete(scheduleId);
      console.log(`Unscheduled job ${scheduleId}`);
    }
  }

  private async executeSchedule(schedule: MonitorSchedule) {
    console.log(`Executing scheduled job ${schedule.id} for target ${schedule.targetId}`);
    
    try {
      // Check concurrency limits
      const runningJobs = await this.storage.getRunningJobs(schedule.targetId);
      if (runningJobs.length >= schedule.maxConcurrency) {
        console.log(`Target ${schedule.targetId} has reached max concurrency (${schedule.maxConcurrency}), skipping job ${schedule.id}`);
        return;
      }
      
      // Create a job record
      const jobId = crypto.randomUUID();
      const job = {
        id: jobId,
        scheduleId: schedule.id,
        targetId: schedule.targetId,
        status: 'running' as const,
        startedAt: new Date().toISOString(),
        completedAt: null
      };
      
      await this.storage.createJob(job);
      
      // Execute the monitoring
      let run: MonitorRun;
      let attempts = 0;
      const maxRetries = schedule.retryPolicy.maxRetries;
      
      while (attempts <= maxRetries) {
        try {
          run = await this.monitor.runCheck(schedule.targetId);
          
          // Update job status
          await this.storage.updateJob(jobId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            runId: run.id
          });
          
          console.log(`Scheduled job ${schedule.id} completed successfully`);
          return;
        } catch (error) {
          attempts++;
          console.error(`Scheduled job ${schedule.id} attempt ${attempts} failed:`, error);
          
          if (attempts <= maxRetries) {
            // Apply retry delay
            const delay = this.calculateRetryDelay(schedule.retryPolicy, attempts);
            console.log(`Retrying job ${schedule.id} in ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Max retries reached
            await this.storage.updateJob(jobId, {
              status: 'failed',
              completedAt: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            
            // Create alert for failed scheduled job
            await this.alert.createAlert({
              id: crypto.randomUUID(),
              targetId: schedule.targetId,
              scheduleId: schedule.id,
              level: 'error',
              message: `Scheduled monitoring job failed after ${maxRetries + 1} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
              state: 'open',
              createdAt: new Date().toISOString(),
              acknowledgedAt: null,
              resolvedAt: null
            });
            
            console.error(`Scheduled job ${schedule.id} failed after ${maxRetries + 1} attempts`);
            return;
          }
        }
      }
    } catch (error) {
      console.error(`Failed to execute scheduled job ${schedule.id}:`, error);
      
      // Create alert for execution failure
      await this.alert.createAlert({
        id: crypto.randomUUID(),
        targetId: schedule.targetId,
        scheduleId: schedule.id,
        level: 'error',
        message: `Failed to execute scheduled monitoring job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        state: 'open',
        createdAt: new Date().toISOString(),
        acknowledgedAt: null,
        resolvedAt: null
      });
    }
  }

  private calculateRetryDelay(retryPolicy: MonitorSchedule['retryPolicy'], attempt: number): number {
    if (retryPolicy.backoff === 'exponential') {
      return retryPolicy.delay * Math.pow(2, attempt - 1);
    }
    return retryPolicy.delay;
  }
}