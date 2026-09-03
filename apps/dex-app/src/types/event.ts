// 事件中心核心类型定义

export interface EventData {
  id: string;
  eventName: string;
  eventType: '系统事件' | '业务事件' | '用户事件' | '营销事件' | '风控事件';
  eventSource: '核心事件' | 'APP埋点事件';
  acquireMethod: '采样' | '上传';
  triggerCondition: string;
  status: '草稿' | '上线' | '下线';
  createTime: string;
  updateTime: string;
  updatedBy?: string;
  owner: string;
  description: string;
  registryKey: string;
}

export interface VirtualEventData {
  id: string;
  eventName: string;
  eventId: string;
  scenario: string[];
  status: '已上线' | '已下线' | '草稿';
  updater: string;
  updateTime: string;
  createTime: string;
  description: string;
  realEventId: string | null;
  version: number;
  versions: VirtualEventVersion[];
  expireAt?: string;
  archived?: boolean;
  outputFields?: OutputField[];
  permissions?: string[];
  combineType?: 'OR' | 'AND';
  combineEvents?: string[];
}

export interface OutputField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  mapping: string;
}

export interface VirtualEventVersion {
  version: number;
  updatedAt: string;
  updater: string;
  description?: string;
}

export interface ConditionGroup {
  id: number;
  conditions: Condition[];
}

export interface Condition {
  field: string;
  operator: string;
  value: string;
  logic: '等于' | '不等于' | '包含';
}

export interface SampleStats {
  eventId: string;
  eventName: string;
  totalMessages: number;
  totalSize: number;
  avgMessageSize: number;
  messageTypes: MessageTypeStats[];
  hourlyDistribution: HourlyMessageDistribution[];
  dailyDistribution: DailyMessageDistribution[];
  messageDetails: MessageDetail[];
  messageTrends: MessageTrend[];
  contentAnalysis: ContentAnalysis;
}

export interface HourlyStat {
  hour: string;
  clicks: number;
  conversions: number;
  errors: number;
}

export interface DailyStat {
  date: string;
  clicks: number;
  conversions: number;
  errors: number;
}

export interface WeeklyStat {
  week: string;
  clicks: number;
  conversions: number;
  errors: number;
}

export interface UserPathNode {
  nodeId: string;
  nodeName: string;
  visits: number;
  conversions: number;
  dropoffs: number;
  nextNodes: string[];
}

export interface Anomaly {
  id: string;
  type: 'spike' | 'drop' | 'pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: string;
  value: number;
  threshold: number;
}

export interface HourlyDistribution {
  hour: string;
  triggers: number;
  uniqueUsers: number;
  avgResponseTime: number;
  errors: number;
}

export interface DailyDistribution {
  date: string;
  triggers: number;
  uniqueUsers: number;
  avgResponseTime: number;
  errors: number;
}

export interface UserEventDetail {
  id: string;
  userId: string;
  eventTime: string;
  eventData: Record<string, any>;
  responseTime: number;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
  userAgent: string;
  ipAddress: string;
  deviceInfo: DeviceInfo;
  location?: LocationInfo;
}

export interface DeviceInfo {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  screenResolution: string;
}

export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface EventTrend {
  timestamp: string;
  triggerCount: number;
  uniqueUsers: number;
  movingAverage: number;
  trend: 'up' | 'down' | 'stable';
  changeRate: number;
}

export interface EventAnomaly {
  id: string;
  type: 'spike' | 'drop' | 'pattern' | 'response_time';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: string;
  value: number;
  threshold: number;
  affectedUsers: number;
}

export interface TopUser {
  userId: string;
  triggerCount: number;
  lastTriggerTime: string;
  avgResponseTime: number;
  errorCount: number;
}

export interface MessageTypeStats {
  type: string;
  count: number;
  percentage: number;
  avgSize: number;
}

export interface HourlyMessageDistribution {
  hour: string;
  messageCount: number;
  totalSize: number;
  avgSize: number;
}

export interface DailyMessageDistribution {
  date: string;
  messageCount: number;
  totalSize: number;
  avgSize: number;
}

export interface MessageDetail {
  id: string;
  timestamp: string;
  messageType: string;
  size: number;
  content: Record<string, any>;
  properties?: MessageProperty[];
  format: 'json' | 'xml' | 'text' | 'binary';
}

export interface MessageProperty {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'object';
}

export interface MessageTrend {
  timestamp: string;
  messageCount: number;
  totalSize: number;
  avgSize: number;
  trend: 'up' | 'down' | 'stable';
  changeRate: number;
}

export interface ContentAnalysis {
  topFields: FieldAnalysis[];
  fieldTypes: Record<string, number>;
  contentPatterns: ContentPattern[];
  sizeDistribution: SizeDistribution[];
}

export interface FieldAnalysis {
  fieldName: string;
  occurrence: number;
  coverage: number;
  valueExamples: (string | number | boolean)[];
}

export interface ContentPattern {
  pattern: string;
  count: number;
  percentage: number;
  description: string;
}

export interface SizeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface KafkaTopic {
  name: string;
  partitions: number;
  replicationFactor: number;
  consumerGroups: ConsumerGroup[];
}

export interface ConsumerGroup {
  groupId: string;
  lag: number;
  members: number;
  state: 'Stable' | 'PreparingRebalance' | 'CompletingRebalance' | 'Empty' | 'Dead';
}

export interface KafkaDatasource {
  id: string;
  name: string;
  bootstrapServers: string;
  securityProtocol: 'PLAINTEXT' | 'SSL' | 'SASL_PLAINTEXT' | 'SASL_SSL';
  saslMechanism?: 'PLAIN' | 'SCRAM-SHA-256' | 'SCRAM-SHA-512';
  username?: string;
  password?: string;
  status: 'connected' | 'disconnected' | 'error';
  topics: KafkaTopic[];
  createdAt: string;
  updatedAt: string;
}
