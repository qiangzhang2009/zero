import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { modulePrompts, callAPI } from './services/aiService.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 获取当前日期和时间（用于AI上下文）
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentDay = now.getDate();
const currentHour = now.getHours();
const currentMinute = now.getMinutes();
const currentDateString = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

// 当前的完整时间信息，用于system prompt
const currentDateTimeInfo = `当前日期：${currentYear}年${currentMonth}月${currentDay}日，时间：${currentTimeString}。请注意，现在是${currentYear}年，不是其他年份。在回答与时间相关的问题时（如运势、命运、吉日选择等），请务必以这个日期为基础进行计算和回答。`;

// 辅助函数：获取用户时间信息
function getUserDateTime(userTime) {
  // 版本标记 - 确认新代码已部署
  const VERSION = 'v2.2026.03.01';
  
  console.log(`[${VERSION}] getUserDateTime called with userTime:`, userTime);
  
  let date;
  if (userTime) {
    // 使用用户传来的时间
    try {
      date = new Date(userTime);
      console.log(`[${VERSION}] Parsed date:`, date.toISOString());
      if (isNaN(date.getTime())) {
        console.log(`[${VERSION}] Invalid date, using server time`);
        date = new Date();
      }
    } catch (e) {
      console.log(`[${VERSION}] Date parse error:`, e);
      date = new Date();
    }
  } else {
    console.log(`[${VERSION}] No userTime provided, using server time`);
    date = new Date();
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const timezoneOffset = -date.getTimezoneOffset();
  const timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const timezoneMinutes = Math.abs(timezoneOffset) % 60;
  const timezoneStr = `${timezoneOffset >= 0 ? '+' : '-'}${timezoneHours.toString().padStart(2, '0')}:${timezoneMinutes.toString().padStart(2, '0')}`;
  
  const result = `当前日期：${year}年${month}月${day}日，时间：${timeString}（用户本地时间，时区UTC${timezoneStr}）。请注意，现在是${year}年（2026年），不是2024年或其他年份。在回答与时间相关的问题时（如运势、命运、吉日选择等），请务必以这个日期为基础进行计算和回答，绝对不要使用2024年或更早的年份。`;
  
  console.log(`[${VERSION}] Final result:`, result);
  
  return result;
}

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

// 过滤回复中的敏感词
function filterSensitiveWords(message) {
  // 过滤 deepseek 相关的敏感词 - 更全面的匹配
  const sensitiveWords = [
    'deepseek', 'DeepSeek', 'DEEPSEEK', 'Deepseek',
    '深度求索', '深度搜索', 'deep seek', 'deep-seek',
    'DS模型', 'ds模型', 'DS的', 'ds的'
  ];
  
  let filtered = message;
  for (const word of sensitiveWords) {
    // 将敏感词替换为"知几"（产品名称）
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '知几');
  }
  
  // 额外处理：移除可能遗漏的变体
  filtered = filtered.replace(/[Dd][Ee][E][Pp][Ss][E][E][Kk]/g, '知几');
  filtered = filtered.replace(/[Dd]eep[S]eek/g, '知几');
  
  return filtered;
}

// 通用聊天处理器（简单对话）
async function chatHandler(req, res) {
  try {
    const { message, history = [], userTime } = req.body;
    
    // 获取用户时间或使用服务器时间
    const userDateTime = getUserDateTime(userTime);
    
    // 过滤掉没有content的消息（可能只有图片），确保每条消息都有role和content
    // 同时也过滤掉content是数组的消息（多模态消息）
    const validHistory = history.filter(msg => 
      msg && msg.role && 
      msg.content && 
      typeof msg.content === 'string' && 
      msg.content.trim().length > 0
    );
    
    // 详细日志：打印每条消息的结构
    console.log('[DEBUG] ===== CHAT HANDLER START =====');
    console.log('[DEBUG] userTime:', userTime);
    console.log('[DEBUG] history count:', history.length);
    if (history.length > 0) {
      console.log('[DEBUG] First history item keys:', Object.keys(history[0]));
      console.log('[DEBUG] First history item:', JSON.stringify(history[0]).substring(0, 200));
    }
    console.log('[DEBUG] After filter validHistory count:', validHistory.length);
    
    const messages = [
      { role: 'system', content: `你是知几的AI助手，一个古老智慧与现代科技结合的命理咨询师。请用温暖，专业的方式回答用户的问题。绝对不要在回复中提及任何AI模型、技术细节或DeepSeek相关信息。请使用与用户提问相同的语言进行回复。${userDateTime}` },
      ...validHistory,
      { role: 'user', content: message }
    ];
    
    console.log('[DEBUG] Final messages:', messages.length);
    console.log('[DEBUG] messages[0]:', messages[0]?.role, messages[0]?.content?.substring(0, 50));
    console.log('[DEBUG] messages[1]:', messages[1]?.role, 'has content:', !!messages[1]?.content);
    console.log('[DEBUG] ===== CHAT HANDLER END =====');
    
    let response;
    try {
      response = await callAPI(messages);
    } catch (apiError) {
      console.error('[DEBUG] API call failed:', apiError.message);
      console.error('[DEBUG] API error response:', JSON.stringify(apiError.response?.data || {}).substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        error: 'API call failed: ' + apiError.message
      });
    }
    
    // 过滤回复中的敏感词
    const rawMessage = response.data.choices[0].message.content;
    const filteredMessage = filterSensitiveWords(rawMessage);
    
    res.json({
      success: true,
      data: {
        message: filteredMessage
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
    const { message, history = [], image, profile, userTime } = req.body;
    
    // 获取用户时间信息
    const userDateTime = getUserDateTime(userTime);
    
    const moduleConfig = modulePrompts[module] || {
      name: '知几',
      systemPrompt: `你是知几的AI助手，一个古老智慧与现代科技结合的命理咨询师。请用温暖、专业的方式回答用户的问题。请使用与用户提问相同的语言进行回复。绝对不要在回复中提及任何AI模型、技术细节或DeepSeek相关信息。`
    };
    
    // 直接使用系统提示，让AI用与问题相同的语言回复
    let systemPrompt = moduleConfig.systemPrompt;
    
    // 添加当前日期时间信息
    systemPrompt += `\n\n${userDateTime}`;
    
    if (profile && profile.name) {
      const profileInfo = [];
      // 简化标签，使用通用中文
      const nameLabel = '姓名';
      const birthdayLabel = '出生日期';
      const genderLabel = '性别';
      const hourLabel = '出生时辰';
      
      profileInfo.push(`${nameLabel}: ${profile.name}`);
      if (profile.birthday) {
        profileInfo.push(`${birthdayLabel}: ${profile.birthday}`);
      }
      if (profile.gender) {
        profileInfo.push(`${genderLabel}: ${profile.gender}`);
      }
      if (profile.hour) {
        profileInfo.push(`${hourLabel}: ${profile.hour}`);
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
    
    // 过滤掉没有content的消息（可能只有图片），确保每条消息都有role和content
    const validHistory = history.filter(msg => 
      msg && msg.role && 
      msg.content && 
      typeof msg.content === 'string' && 
      msg.content.trim().length > 0
    );
    
    // 详细日志
    console.log('[DEBUG] ===== CHAT WITH CONTEXT HANDLER =====');
    console.log('[DEBUG] module:', module);
    console.log('[DEBUG] history count:', history.length, 'validHistory:', validHistory.length);
    if (history.length > 0) {
      console.log('[DEBUG] First history item keys:', Object.keys(history[0]));
    }
    
    // 构建消息列表
    const messages = [
      { role: 'system', content: systemPrompt },
      ...validHistory
    ];
    
    console.log('[DEBUG] Final messages:', messages.length);
    
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
    
    // 过滤回复中的敏感词
    const rawMessage = response.data.choices[0].message.content;
    const filteredMessage = filterSensitiveWords(rawMessage);
    
    res.json({
      success: true,
      data: {
        message: filteredMessage,
        module: moduleConfig.name
      }
    });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    
    // 检查是否是图片相关错误
    let errorMessage = '抱歉，服务暂时不可用，请稍后再试。'
    if (error.message && error.message.includes('图片识别')) {
      errorMessage = error.message
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
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
    
    console.log('[DEBUG] /api/chat/save called');
    console.log('[DEBUG] module:', module);
    console.log('[DEBUG] messages count:', messages?.length);
    console.log('[DEBUG] first message keys:', messages?.[0] ? Object.keys(messages[0]) : 'none');
    
    if (!module || !messages) {
      console.log('[DEBUG] Missing required parameters');
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    // 创建聊天记录对象 - 过滤掉没有content的消息
    const validMessages = messages.filter(msg => msg && msg.role && msg.content);
    console.log('[DEBUG] valid messages count:', validMessages.length);
    
    const chatRecord = {
      id: `chat_${Date.now()}`,
      userId: userId || 'anonymous', // 关联用户ID
      module,
      profile: profile ? {
        name: profile.name,
        birthday: profile.birthday,
        gender: profile.gender
      } : null,
      messages: validMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      createdAt: new Date().toISOString()
    };
    
    // 保存到内存存储
    chatHistoryStore.push(chatRecord);
    
    console.log('[DEBUG] Chat saved successfully, total:', chatHistoryStore.length);
    
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

// 用户获取自己的聊天记录详情
app.get('/api/chat/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    const record = chatHistoryStore.find(r => r.id === id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: '记录不存在'
      });
    }
    
    // 验证用户权限（管理员可以看到所有，普通用户只能看自己的）
    if (userId && record.userId && record.userId !== userId && record.userId !== 'anonymous') {
      return res.status(403).json({
        success: false,
        error: '无权限访问'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: record.id,
        module: record.module,
        profile: record.profile,
        messages: record.messages,
        createdAt: record.createdAt
      }
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
