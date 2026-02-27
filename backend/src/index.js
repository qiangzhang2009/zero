import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { modulePrompts, callAPI } from './services/aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加限制以支持图片

// 通用聊天处理器
async function chatHandler(req, res) {
  try {
    const { message, history = [] } = req.body;
    
    const messages = [
      { role: 'system', content: '你是知的AI助手，一个古老智慧与现代科技结合的命理咨询师。请用温暖、专业的方式回答用户的问题。' },
      ...history,
      { role: 'user', content: message }
    ];
    
    const response = await callAPI(messages);
    
    res.json({
      success: true,
      data: {
        message: response.data.choices[0].message.content
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 带模块上下文的聊天处理器
async function chatWithContextHandler(req, res) {
  try {
    const { module } = req.params;
    const { message, history = [], image } = req.body;
    
    const moduleConfig = modulePrompts[module] || {
      name: '知几',
      systemPrompt: '你是知的AI助手，一个古老智慧与现代科技结合的命理咨询师。请用温暖、专业的方式回答用户的问题。'
    };
    
    // 构建消息列表
    const messages = [
      { role: 'system', content: moduleConfig.systemPrompt },
      ...history
    ];
    
    // 如果有图片，构建多模态消息
    if (image) {
      // AI智慧服务支持图片输入的格式
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: image } }
        ]
      });
    } else {
      messages.push({ role: 'user', content: message });
    }
    
    const response = await callAPI(messages);
    
    res.json({
      success: true,
      data: {
        message: response.data.choices[0].message.content,
        module: moduleConfig.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 路由
app.post('/api/chat', chatHandler);
app.post('/api/chat/:module', chatWithContextHandler);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取所有模块列表
app.get('/api/modules', (req, res) => {
  const modules = Object.entries(modulePrompts).map(([id, config]) => ({
    id,
    name: config.name
  }));
  res.json({ success: true, data: modules });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`知几智慧服务运行在 http://localhost:${PORT}`);
});
