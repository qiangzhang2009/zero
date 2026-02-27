import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { modulePrompts, callAPI } from './services/aiService.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 聊天记录存储文件路径
const CHAT_HISTORY_FILE = path.join(process.cwd(), 'chat_history.json');

// 简单的管理员密码配置
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zhiJi_admin_2026';

// 读取聊天历史记录
function loadChatHistory() {
  try {
    if (fs.existsSync(CHAT_HISTORY_FILE)) {
      const data = fs.readFileSync(CHAT_HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
  return [];
}

// 保存聊天历史记录
function saveChatHistory(history) {
  try {
    fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

// 内存中的聊天历史记录 (用于快速访问)
let chatHistoryStore = loadChatHistory();

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
    const { message, history = [], image, profile } = req.body;
    
    const moduleConfig = modulePrompts[module] || {
      name: '知几',
      systemPrompt: '你是知几的AI助手，一个古老智慧与现代科技结合的命理咨询师。请用温暖、专业的方式回答用户的问题。'
    };
    
    // 如果有用户档案信息，将其加入到system prompt中
    let systemPrompt = moduleConfig.systemPrompt;
    if (profile && profile.name) {
      const profileInfo = [];
      profileInfo.push(`用户姓名: ${profile.name}`);
      if (profile.birthday) {
        profileInfo.push(`出生日期: ${profile.birthday}`);
      }
      if (profile.gender) {
        profileInfo.push(`性别: ${profile.gender}`);
      }
      if (profile.hour) {
        profileInfo.push(`出生时辰: ${profile.hour}`);
      }
      // 如果有八字信息
      if (profile.bazi) {
        const { year, month, day, hour } = profile.bazi;
        if (year && month && day) {
          const baziStr = `${year}年${month}月${day}日`;
          profileInfo.push(`八字: ${baziStr}${hour ? hour + '时' : ''}`);
        }
      }
      
      if (profileInfo.length > 1) { // 除了姓名还有其他信息
        systemPrompt = `${systemPrompt}\n\n【用户档案信息】\n${profileInfo.join('\n')}\n\n请在回答中结合用户的档案信息进行分析，如果用户问到八字相关问题，请根据其出生信息进行解读。`;
      } else {
        systemPrompt = `${systemPrompt}\n\n【用户档案】\n${profileInfo.join('\n')}`;
      }
    }
    
    // 构建消息列表
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history
    ];
    
    let response;
    
    // 如果有图片，构建多模态消息
    if (image) {
      try {
        // 尝试发送带图片的消息
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: message + '\n\n[用户上传了一张图片，请根据图片内容进行分析解读]' },
            { type: 'image_url', image_url: { url: image } }
          ]
        });
        response = await callAPI(messages);
      } catch (imgError) {
        // 如果图片发送失败，尝试只用文字
        console.log('图片识别暂不可用，使用文字模式:', imgError.message);
        messages.push({ role: 'user', content: message });
        response = await callAPI(messages);
      }
    } else {
      messages.push({ role: 'user', content: message });
      response = await callAPI(messages);
    }
    
    res.json({
      success: true,
      data: {
        message: response.data.choices[0].message.content,
        module: moduleConfig.name
      }
    });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: '服务暂时不可用，请稍后再试'
    });
  }
}

// 路由
app.post('/api/chat', chatHandler);
app.post('/api/chat/:module', chatWithContextHandler);

// 保存聊天记录到服务器
app.post('/api/chat/save', (req, res) => {
  try {
    const { module, messages, profile, userId } = req.body;
    
    if (!module || !messages) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    // 创建聊天记录对象
    const chatRecord = {
      id: `chat_${Date.now()}`,
      userId: userId || 'anonymous', // 关联用户ID
      module,
      profile: profile ? {
        name: profile.name,
        birthday: profile.birthday,
        gender: profile.gender
      } : null,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      createdAt: new Date().toISOString()
    };
    
    // 保存到内存存储
    chatHistoryStore.push(chatRecord);
    
    // 定期保存到文件 (每10条记录保存一次，避免频繁IO)
    if (chatHistoryStore.length % 10 === 0) {
      saveChatHistory(chatHistoryStore);
    }
    
    res.json({
      success: true,
      data: {
        id: chatRecord.id,
        message: '聊天记录已保存'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取聊天记录列表
app.get('/api/chat/history', (req, res) => {
  try {
    const { limit = 50, offset = 0, userId, adminKey } = req.query;
    
    let filteredHistory = chatHistoryStore;
    
    // 管理员可以查看所有数据
    if (adminKey === ADMIN_PASSWORD) {
      // 管理员模式，返回所有记录
      console.log('Admin access granted');
    } else if (userId) {
      // 普通用户只能查看自己的记录
      filteredHistory = chatHistoryStore.filter(record => record.userId === userId);
    } else {
      // 没有提供userId，只返回最近的匿名记录
      filteredHistory = chatHistoryStore.filter(record => !record.userId || record.userId === 'anonymous');
    }
    
    const history = filteredHistory
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .map(record => ({
        id: record.id,
        userId: record.userId,
        module: record.module,
        profileName: record.profile?.name,
        messageCount: record.messages.length,
        createdAt: record.createdAt
      }));
    
    res.json({
      success: true,
      data: {
        total: filteredHistory.length,
        history
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 管理员获取完整聊天记录详情
app.get('/api/admin/chat/:id', (req, res) => {
  try {
    const { adminKey } = req.query;
    const { id } = req.params;
    
    if (adminKey !== ADMIN_PASSWORD) {
      return res.status(403).json({
        success: false,
        error: '无权限访问'
      });
    }
    
    const record = chatHistoryStore.find(r => r.id === id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: '记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
