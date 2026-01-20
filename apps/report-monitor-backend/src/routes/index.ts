import { Router } from 'express';
import { z } from 'zod';
import type { StorageService } from '../services/storage.js';
import type { MonitorService } from '../services/monitor.js';
import type { AlertService } from '../services/alert.js';
import type { SchedulerService } from '../services/scheduler.js';
import type { ExplorerService } from '../services/explorer.js';

const targetSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  authType: z.enum(['password', 'sso', 'cookie', 'script']),
  authConfig: z.object({}).optional(),
  proxyProfile: z.string().optional(),
  active: z.boolean().default(true)
});

const ruleSchema = z.object({
  targetId: z.string().uuid(),
  type: z.enum(['exists', 'visible', 'textMatch', 'nonEmpty', 'tableRows', 'minPerf', 'maxPerf', 'networkOk', 'screenshotDiff']),
  selector: z.string().optional(),
  expect: z.union([z.string(), z.number()]).optional(),
  threshold: z.number().optional(),
  enabled: z.boolean().default(true)
});

const scheduleSchema = z.object({
  targetId: z.string().uuid(),
  cron: z.string(),
  timezone: z.string().default('UTC'),
  maxConcurrency: z.number().int().min(1).max(10).default(1),
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).max(5).default(2),
    backoff: z.enum(['fixed', 'exponential']).default('exponential'),
    delay: z.number().int().min(1000).default(2000)
  }).default({}),
  enabled: z.boolean().default(true)
});

export function setupRoutes(
  app: Router,
  storage: StorageService,
  monitor: MonitorService,
  alert: AlertService,
  scheduler?: SchedulerService,
  explorer?: ExplorerService
) {
  app.get('/api/targets', async (req, res) => {
    try {
      const targets = await storage.getTargets();
      res.json(targets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch targets' });
    }
  });

  app.post('/api/targets', async (req, res) => {
    try {
      const data = targetSchema.parse(req.body);
      const targets = await storage.getTargets();
      
      const newTarget = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      targets.push(newTarget);
      await storage.saveTargets(targets);
      
      res.json(newTarget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create target' });
      }
    }
  });

  app.put('/api/targets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = targetSchema.partial().parse(req.body);
      
      const targets = await storage.getTargets();
      const index = targets.findIndex(t => t.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Target not found' });
      }
      
      targets[index] = {
        ...targets[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await storage.saveTargets(targets);
      res.json(targets[index]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update target' });
      }
    }
  });

  app.delete('/api/targets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const targets = await storage.getTargets();
      const filteredTargets = targets.filter(t => t.id !== id);
      
      if (filteredTargets.length === targets.length) {
        return res.status(404).json({ error: 'Target not found' });
      }
      
      await storage.saveTargets(filteredTargets);
      
      const rules = await storage.getRules();
      const filteredRules = rules.filter(r => r.targetId !== id);
      await storage.saveRules(filteredRules);
      
      const schedules = await storage.getSchedules();
      const filteredSchedules = schedules.filter(s => s.targetId !== id);
      await storage.saveSchedules(filteredSchedules);
      
      res.json({ message: 'Target deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete target' });
    }
  });

  app.get('/api/rules', async (req, res) => {
    try {
      const rules = await storage.getRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rules' });
    }
  });

  app.post('/api/rules', async (req, res) => {
    try {
      const data = ruleSchema.parse(req.body);
      const rules = await storage.getRules();
      
      const newRule = {
        id: crypto.randomUUID(),
        ...data
      };
      
      rules.push(newRule);
      await storage.saveRules(rules);
      
      res.json(newRule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create rule' });
      }
    }
  });

  app.put('/api/rules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = ruleSchema.partial().parse(req.body);
      
      const rules = await storage.getRules();
      const index = rules.findIndex(r => r.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Rule not found' });
      }
      
      rules[index] = { ...rules[index], ...data };
      await storage.saveRules(rules);
      
      res.json(rules[index]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update rule' });
      }
    }
  });

  app.delete('/api/rules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const rules = await storage.getRules();
      const filteredRules = rules.filter(r => r.id !== id);
      
      if (filteredRules.length === rules.length) {
        return res.status(404).json({ error: 'Rule not found' });
      }
      
      await storage.saveRules(filteredRules);
      res.json({ message: 'Rule deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete rule' });
    }
  });

  app.get('/api/schedules', async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  });

  app.post('/api/schedules', async (req, res) => {
    try {
      const data = scheduleSchema.parse(req.body);
      const schedules = await storage.getSchedules();
      
      const newSchedule = {
        id: crypto.randomUUID(),
        ...data
      };
      
      schedules.push(newSchedule);
      await storage.saveSchedules(schedules);
      
      // Schedule the job if scheduler is available
      if (scheduler) {
        await scheduler.scheduleJob(newSchedule);
      }
      
      res.json(newSchedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create schedule' });
      }
    }
  });

  app.get('/api/runs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const runs = await storage.getRuns(limit);
      res.json(runs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch runs' });
    }
  });

  app.get('/api/alerts', async (req, res) => {
    try {
      const state = req.query.state as string;
      const alerts = await storage.getAlerts();
      
      if (state) {
        const filteredAlerts = alerts.filter(a => a.state === state);
        res.json(filteredAlerts);
      } else {
        res.json(alerts);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.post('/api/alerts/:id/acknowledge', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await alert.acknowledgeAlert(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      res.json({ message: 'Alert acknowledged successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
  });

  app.post('/api/alerts/:id/close', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await alert.closeAlert(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      res.json({ message: 'Alert closed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to close alert' });
    }
  });

  app.post('/api/run/:targetId', async (req, res) => {
    try {
      const { targetId } = req.params;
      
      const targets = await storage.getTargets();
      const target = targets.find(t => t.id === targetId);
      
      if (!target) {
        return res.status(404).json({ error: 'Target not found' });
      }
      
      const rules = await storage.getRules();
      const targetRules = rules.filter(r => r.targetId === targetId && r.enabled);
      
      const run = await monitor.runMonitor(target, targetRules);
      await storage.saveRun(run);
      
      if (run.status === 'failed') {
        await alert.createAlert(run, target.name);
      }
      
      res.json(run);
    } catch (error) {
      res.status(500).json({ error: 'Failed to run monitor' });
    }
  });

  app.get('/api/screenshot/:fileName', async (req, res) => {
    try {
      const { fileName } = req.params;
      const screenshot = await storage.getScreenshot(fileName);
      
      if (!screenshot) {
        return res.status(404).json({ error: 'Screenshot not found' });
      }
      
      res.setHeader('Content-Type', 'image/png');
      res.send(screenshot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch screenshot' });
    }
  });

  app.get('/api/har/:fileName', async (req, res) => {
    try {
      const { fileName } = req.params;
      const har = await storage.getHar(fileName);
      
      if (!har) {
        return res.status(404).json({ error: 'HAR file not found' });
      }
      
      res.json(har);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch HAR file' });
    }
  });

  // Exploration Mode APIs
  app.post('/api/explore/:targetId', async (req, res) => {
    try {
      const { targetId } = req.params;
      
      if (!explorer) {
        return res.status(501).json({ error: 'Explorer service not available' });
      }
      
      const targets = await storage.getTargets();
      const target = targets.find(t => t.id === targetId);
      
      if (!target) {
        return res.status(404).json({ error: 'Target not found' });
      }
      
      // Create exploration session
      const session = await explorer.createSession(targetId, target.url);
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create exploration session' });
    }
  });

  app.get('/api/explore/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!explorer) {
        return res.status(501).json({ error: 'Explorer service not available' });
      }
      
      const session = await explorer.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get exploration session' });
    }
  });

  app.post('/api/explore/:sessionId/analyze', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!explorer) {
        return res.status(501).json({ error: 'Explorer service not available' });
      }
      
      const session = await explorer.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Generate rule recommendations
      const recommendations = explorer.generateRuleRecommendations(session);
      
      res.json({
        session,
        recommendations
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze exploration session' });
    }
  });
}