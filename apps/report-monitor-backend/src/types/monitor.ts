export interface MonitorTarget {
  id: string;
  name: string;
  url: string;
  authType: 'password' | 'sso' | 'cookie' | 'script';
  authConfig?: Record<string, any>;
  proxyProfile?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorRule {
  id: string;
  targetId: string;
  type: 'exists' | 'visible' | 'textMatch' | 'nonEmpty' | 'tableRows' | 'minPerf' | 'maxPerf' | 'networkOk' | 'screenshotDiff';
  selector?: string;
  expect?: string | number;
  threshold?: number;
  requestMatch?: {
    url?: string;
    method?: string;
  };
  responseAssert?: {
    status?: number;
    hasField?: string;
  };
  ignoreAreas?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  enabled: boolean;
}

export interface MonitorSchedule {
  id: string;
  targetId: string;
  cron: string;
  timezone: string;
  maxConcurrency: number;
  retryPolicy: {
    maxRetries: number;
    backoff: 'fixed' | 'exponential';
    delay: number;
  };
  enabled: boolean;
}

export interface MonitorRun {
  id: string;
  targetId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout';
  duration: number;
  errors: Array<{
    ruleId: string;
    type: string;
    message: string;
    screenshot?: string;
  }>;
  screenshotRef?: string;
  harRef?: string;
  metrics: {
    loadTime?: number;
    domContentLoaded?: number;
    firstPaint?: number;
  };
  createdAt: string;
}

export interface Alert {
  id: string;
  runId: string;
  targetId: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  channel: ('email' | 'sms' | 'webhook' | 'internal')[];
  message: string;
  state: 'open' | 'acknowledged' | 'closed';
  createdAt: string;
  acknowledgedAt?: string;
  closedAt?: string;
}