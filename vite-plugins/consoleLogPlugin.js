/**
 * Vite插件：控制台日志文件写入
 * 提供API端点来处理前端日志写入到技术方案目录
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function consoleLogPlugin() {
  let logFilePath;
  
  return {
    name: 'console-log-plugin',
    configureServer(server) {
      // 设置日志文件路径
      logFilePath = path.resolve(__dirname, '../docs/key-project-docs/技术方案/实时控制台日志.log');
      
      // 确保目录存在
      const logDir = path.dirname(logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // 添加API路由
      server.middlewares.use('/api/write-log', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { content, action = 'write' } = JSON.parse(body);

            if (!content) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing content' }));
              return;
            }

            switch (action) {
              case 'write':
                await fs.promises.writeFile(logFilePath, content, 'utf8');
                break;
              case 'append':
                await fs.promises.appendFile(logFilePath, content, 'utf8');
                break;
              case 'clear':
                const clearContent = `# 实时控制台日志
**清空时间：** ${new Date().toLocaleString('zh-CN')}
**状态：** 日志已清空

---

`;
                await fs.promises.writeFile(logFilePath, clearContent, 'utf8');
                break;
              default:
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid action' }));
                return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              path: logFilePath,
              timestamp: new Date().toISOString()
            }));

          } catch (error) {
            console.error('Log write error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ 
              error: 'Failed to write log', 
              message: error.message 
            }));
          }
        });
      });

      // 页面刷新时清空日志的API
      server.middlewares.use('/api/clear-log', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        try {
          const clearContent = `# 实时控制台日志
**页面刷新时间：** ${new Date().toLocaleString('zh-CN')}
**状态：** 日志已清空，等待新的日志记录...

---

`;
          await fs.promises.writeFile(logFilePath, clearContent, 'utf8');
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Log cleared',
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Log clear error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ 
            error: 'Failed to clear log', 
            message: error.message 
          }));
        }
      });

      console.log(`📝 Console log plugin initialized. Log file: ${logFilePath}`);
    }
  };
}