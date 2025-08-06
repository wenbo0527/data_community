import fs from 'fs';
import path from 'path';

/**
 * Vite插件：集成日志服务
 * 在开发服务器中提供日志API端点，无需单独启动日志服务器
 */
export function logServerPlugin() {
  const LOG_FILE_PATH = path.resolve(process.cwd(), 'docs/key-project-docs/技术方案/实时控制台日志.log');
  
  // 确保目录存在
  const ensureDirectoryExists = (filePath) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  };

  return {
    name: 'log-server-plugin',
    configureServer(server) {
      // 添加日志API中间件
      server.middlewares.use('/api/write-log', (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', () => {
          try {
            const { content } = JSON.parse(body);
            
            if (!content) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: '日志内容不能为空' }));
              return;
            }

            ensureDirectoryExists(LOG_FILE_PATH);
            
            // 写入文件（覆盖模式）
            fs.writeFileSync(LOG_FILE_PATH, content, 'utf8');
            
            console.log(`✅ 日志已写入: ${LOG_FILE_PATH}`);
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            res.end(JSON.stringify({ 
              success: true, 
              message: '日志写入成功',
              filePath: LOG_FILE_PATH,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error('❌ 写入日志失败:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: '写入日志失败', 
              details: error.message 
            }));
          }
        });
      });

      // 添加日志追加API
      server.middlewares.use('/api/append-log', (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', () => {
          try {
            const { content } = JSON.parse(body);
            
            if (!content) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: '日志内容不能为空' }));
              return;
            }

            ensureDirectoryExists(LOG_FILE_PATH);
            
            // 追加到文件
            fs.appendFileSync(LOG_FILE_PATH, content, 'utf8');
            
            console.log(`✅ 日志已追加: ${LOG_FILE_PATH}`);
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            res.end(JSON.stringify({ 
              success: true, 
              message: '日志追加成功',
              filePath: LOG_FILE_PATH,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error('❌ 追加日志失败:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: '追加日志失败', 
              details: error.message 
            }));
          }
        });
      });

      // 添加健康检查API
      server.middlewares.use('/api/health', (req, res, next) => {
        if (req.method !== 'GET') {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        res.end(JSON.stringify({ 
          status: 'ok', 
          message: '日志服务运行正常',
          timestamp: new Date().toISOString(),
          logPath: LOG_FILE_PATH
        }));
      });

      // 处理OPTIONS预检请求
      server.middlewares.use('/api/*', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          res.end();
          return;
        }
        next();
      });

      console.log('📝 日志服务已集成到开发服务器');
      console.log(`📁 日志文件路径: ${LOG_FILE_PATH}`);
      console.log('🔗 可用的日志API端点:');
      console.log('   POST /api/write-log   - 写入日志');
      console.log('   POST /api/append-log  - 追加日志');
      console.log('   GET  /api/health      - 健康检查');
    }
  };
}