/**
 * 日志写入API
 * 处理前端发送的日志数据并写入到技术方案目录
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LogWriter {
  constructor() {
    this.baseDir = path.resolve(__dirname, '../../docs/key-project-docs/技术方案');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async writeLog(filePath, content) {
    try {
      const fullPath = path.join(this.baseDir, path.basename(filePath));
      
      // 确保文件路径安全
      if (!fullPath.startsWith(this.baseDir)) {
        throw new Error('Invalid file path');
      }

      await fs.promises.writeFile(fullPath, content, 'utf8');
      return { success: true, path: fullPath };
    } catch (error) {
      console.error('Failed to write log file:', error);
      throw error;
    }
  }

  async appendLog(filePath, content) {
    try {
      const fullPath = path.join(this.baseDir, path.basename(filePath));
      
      if (!fullPath.startsWith(this.baseDir)) {
        throw new Error('Invalid file path');
      }

      await fs.promises.appendFile(fullPath, content, 'utf8');
      return { success: true, path: fullPath };
    } catch (error) {
      console.error('Failed to append log file:', error);
      throw error;
    }
  }

  async clearLog(filePath) {
    try {
      const fullPath = path.join(this.baseDir, path.basename(filePath));
      
      if (!fullPath.startsWith(this.baseDir)) {
        throw new Error('Invalid file path');
      }

      const clearContent = `# 实时控制台日志
**清空时间：** ${new Date().toLocaleString('zh-CN')}
**状态：** 日志已清空

---

`;
      await fs.promises.writeFile(fullPath, clearContent, 'utf8');
      return { success: true, path: fullPath };
    } catch (error) {
      console.error('Failed to clear log file:', error);
      throw error;
    }
  }
}

const logWriter = new LogWriter();

// Express.js 路由处理器
export async function handleWriteLog(req, res) {
  try {
    const { filePath, content, action = 'write' } = req.body;

    if (!filePath || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: filePath and content' 
      });
    }

    let result;
    switch (action) {
      case 'write':
        result = await logWriter.writeLog(filePath, content);
        break;
      case 'append':
        result = await logWriter.appendLog(filePath, content);
        break;
      case 'clear':
        result = await logWriter.clearLog(filePath);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to write log', 
      message: error.message 
    });
  }
}

export default logWriter;