import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { StorageService } from './services/storage.js';
import { MonitorService } from './services/monitor.js';
import { AlertService } from './services/alert.js';
import { SchedulerService } from './services/scheduler.js';
import { ExplorerService } from './services/explorer.js';
import { setupRoutes } from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

const storageService = new StorageService();
const monitorService = new MonitorService(storageService);
const alertService = new AlertService(storageService);
const schedulerService = new SchedulerService(storageService, monitorService, alertService);
const explorerService = new ExplorerService(storageService);

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupRoutes(app, storageService, monitorService, alertService, schedulerService, explorerService);

async function startServer() {
  try {
    await storageService.initialize();
    console.log('Storage service initialized');
    
    // Start scheduler service
    await schedulerService.start();
    console.log('Scheduler service started');
    
    app.listen(PORT, () => {
      console.log(`Report Monitor Backend running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();