import type { Page } from 'playwright';
import type { StorageService } from './storage.js';

export interface ExplorerSession {
  id: string;
  targetId: string;
  pageUrl: string;
  createdAt: string;
  elements: ExplorerElement[];
  networkRequests: NetworkRequest[];
  screenshots: string[];
}

export interface ExplorerElement {
  selector: string;
  tagName: string;
  textContent?: string;
  attributes: Record<string, string>;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  isClickable: boolean;
  uniquenessScore: number;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  responseTime?: number;
  size?: number;
  type: 'xhr' | 'fetch' | 'document' | 'script' | 'stylesheet' | 'image' | 'other';
}

export interface RuleRecommendation {
  type: 'exists' | 'visible' | 'textMatch' | 'nonEmpty' | 'tableRows' | 'minPerf' | 'maxPerf' | 'networkOk';
  selector?: string;
  expect?: string | number;
  threshold?: number;
  description: string;
  confidence: number;
  reason: string;
}

export class ExplorerService {
  private sessions = new Map<string, ExplorerSession>();
  private pagePool: Page[] = [];
  private maxPages = 3;

  constructor(private storage: StorageService) {}

  async createSession(targetId: string, pageUrl: string): Promise<ExplorerSession> {
    const sessionId = crypto.randomUUID();
    const session: ExplorerSession = {
      id: sessionId,
      targetId,
      pageUrl,
      createdAt: new Date().toISOString(),
      elements: [],
      networkRequests: [],
      screenshots: []
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<ExplorerSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async explorePage(sessionId: string, page: Page): Promise<ExplorerSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Capture network requests
    const networkRequests = await this.captureNetworkRequests(page);
    
    // Extract DOM elements
    const elements = await this.extractElements(page);
    
    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: true });
    const screenshotPath = await this.storage.saveScreenshot(
      session.targetId,
      `explore_${Date.now()}.png`,
      screenshot
    );

    // Update session
    session.elements = elements;
    session.networkRequests = networkRequests;
    session.screenshots.push(screenshotPath);

    return session;
  }

  private async extractElements(page: Page): Promise<ExplorerElement[]> {
    return await page.evaluate(() => {
      const elements: ExplorerElement[] = [];
      const allElements = document.querySelectorAll('*');
      
      // Common interactive and content elements
      const interestingSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'span', 'div',
        'table', 'thead', 'tbody', 'tr', 'td', 'th',
        'button', 'a', 'input', 'select', 'textarea',
        '[role="button"]', '[role="link"]', '[role="heading"]',
        '.ant-table', '.el-table', '.arco-table', // Common table classes
        '.chart', '.graph', '.plot', // Common chart classes
        '[data-testid]', '[data-qa]', '[data-cy]' // Test selectors
      ];

      for (const selector of interestingSelectors) {
        const elems = document.querySelectorAll(selector);
        elems.forEach((elem, index) => {
          if (elements.length >= 100) return; // Limit to prevent memory issues
          
          const rect = elem.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(elem);
          
          // Skip hidden elements
          if (rect.width === 0 || rect.height === 0 || 
              computedStyle.display === 'none' || 
              computedStyle.visibility === 'hidden') {
            return;
          }

          // Generate unique selector
          const selector = this.generateUniqueSelector(elem);
          
          elements.push({
            selector,
            tagName: elem.tagName.toLowerCase(),
            textContent: elem.textContent?.trim().substring(0, 200),
            attributes: this.getImportantAttributes(elem),
            boundingBox: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            isVisible: true,
            isClickable: this.isClickable(elem, computedStyle),
            uniquenessScore: this.calculateUniquenessScore(elem, selector)
          });
        });
      }

      return elements;
    });
  }

  private generateUniqueSelector(element: Element): string {
    // Try ID first
    if (element.id) {
      return `#${element.id}`;
    }

    // Try data attributes
    const dataAttrs = ['data-testid', 'data-qa', 'data-cy', 'data-id'];
    for (const attr of dataAttrs) {
      const value = element.getAttribute(attr);
      if (value) {
        return `[${attr}="${value}"]`;
      }
    }

    // Try class names
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        const uniqueClass = classes.find(c => 
          document.querySelectorAll(`.${c}`).length === 1
        );
        if (uniqueClass) {
          return `.${uniqueClass}`;
        }
      }
    }

    // Fallback to tag with nth-child
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === element.tagName
      );
      if (siblings.length === 1) {
        return `${parent.tagName.toLowerCase()} > ${element.tagName.toLowerCase()}`;
      } else {
        const index = siblings.indexOf(element) + 1;
        return `${parent.tagName.toLowerCase()} > ${element.tagName.toLowerCase()}:nth-child(${index})`;
      }
    }

    return element.tagName.toLowerCase();
  }

  private getImportantAttributes(element: Element): Record<string, string> {
    const importantAttrs = [
      'href', 'src', 'alt', 'title', 'placeholder', 'value',
      'type', 'name', 'role', 'aria-label'
    ];
    
    const attributes: Record<string, string> = {};
    
    importantAttrs.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) {
        attributes[attr] = value;
      }
    });

    return attributes;
  }

  private isClickable(element: Element, computedStyle: CSSStyleDeclaration): boolean {
    const clickableTags = ['button', 'a', 'input', 'select', 'textarea'];
    const clickableRoles = ['button', 'link', 'menuitem', 'tab'];
    
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    return clickableTags.includes(tagName) || 
           clickableRoles.includes(role || '') ||
           computedStyle.cursor === 'pointer' ||
           element.getAttribute('onclick') !== null;
  }

  private calculateUniquenessScore(element: Element, selector: string): number {
    try {
      const matches = document.querySelectorAll(selector);
      return matches.length === 1 ? 1.0 : 0.5;
    } catch {
      return 0.1;
    }
  }

  private async captureNetworkRequests(page: Page): Promise<NetworkRequest[]> {
    const requests: NetworkRequest[] = [];
    
    // Get all network activity from the page
    const client = await page.context().newCDPSession(page);
    
    await client.send('Network.enable');
    
    client.on('Network.requestWillBeSent', (params) => {
      requests.push({
        url: params.request.url,
        method: params.request.method,
        type: this.categorizeRequestType(params.request.url),
      });
    });

    client.on('Network.responseReceived', (params) => {
      const request = requests.find(r => r.url === params.response.url);
      if (request) {
        request.status = params.response.status;
        request.responseTime = params.response.timing?.receiveHeadersEnd;
        request.size = params.response.encodedDataLength;
      }
    });

    // Wait a bit to capture requests
    await page.waitForTimeout(1000);
    
    return requests.filter(r => 
      r.url.includes('api') || 
      r.url.includes('data') || 
      r.type === 'xhr' || 
      r.type === 'fetch'
    );
  }

  private categorizeRequestType(url: string): NetworkRequest['type'] {
    if (url.includes('/api/') || url.endsWith('.json')) return 'xhr';
    if (url.includes('graphql')) return 'fetch';
    if (url.endsWith('.js')) return 'script';
    if (url.endsWith('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg)$/)) return 'image';
    return 'other';
  }

  generateRuleRecommendations(session: ExplorerSession): RuleRecommendation[] {
    const recommendations: RuleRecommendation[] = [];

    // Check for tables
    const tables = session.elements.filter(e => e.tagName === 'table');
    if (tables.length > 0) {
      recommendations.push({
        type: 'tableRows',
        selector: tables[0].selector,
        expect: '1',
        description: '表格数据存在性检查',
        confidence: 0.9,
        reason: '检测到表格元素，建议验证数据行数'
      });
    }

    // Check for loading indicators
    const loadingElements = session.elements.filter(e => 
      e.textContent?.includes('加载') || 
      e.textContent?.includes('Loading') ||
      e.attributes.class?.includes('loading') ||
      e.attributes.class?.includes('spin')
    );
    
    if (loadingElements.length === 0) {
      recommendations.push({
        type: 'visible',
        selector: 'body',
        description: '页面加载完成检查',
        confidence: 0.8,
        reason: '未检测到加载指示器，页面可能已渲染完成'
      });
    }

    // Check for API requests
    const apiRequests = session.networkRequests.filter(r => 
      r.type === 'xhr' || r.type === 'fetch'
    );

    if (apiRequests.length > 0) {
      const failedRequests = apiRequests.filter(r => 
        r.status && r.status >= 400
      );

      if (failedRequests.length === 0) {
        recommendations.push({
          type: 'networkOk',
          description: 'API请求状态检查',
          confidence: 0.85,
          reason: '所有API请求均成功返回'
        });
      }
    }

    // Check for performance
    const slowRequests = session.networkRequests.filter(r => 
      r.responseTime && r.responseTime > 3000
    );

    if (slowRequests.length === 0) {
      recommendations.push({
        type: 'maxPerf',
        threshold: 3000,
        description: '页面加载性能检查',
        confidence: 0.75,
        reason: '网络请求响应时间均在3秒内'
      });
    }

    return recommendations;
  }

  async cleanup(): Promise<void> {
    for (const page of this.pagePool) {
      await page.close();
    }
    this.pagePool = [];
    this.sessions.clear();
  }
}