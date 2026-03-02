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

// 辅助函数：获取用户平台信息
function getPlatformInfo(userAgent) {
  if (!userAgent) return 'unknown';
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) return 'mobile';
  if (userAgent.includes('iPad') || userAgent.includes('Tablet')) return 'tablet';
  return 'desktop';
}

// 聊天记录存储文件路径
const CHAT_HISTORY_FILE = path.join(process.cwd(), 'chat_history.json');

// 简单的管理员密码配置
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zhiJi_admin_2026';

// 用户档案存储文件路径
const USER_PROFILES_FILE = path.join(process.cwd(), 'user_profiles.json');

// 会员配置存储文件路径  
const MEMBERSHIPS_FILE = path.join(process.cwd(), 'memberships.json');

// 读取用户档案
function loadUserProfiles() {
  try {
    if (fs.existsSync(USER_PROFILES_FILE)) {
      const data = fs.readFileSync(USER_PROFILES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading user profiles:', error);
  }
  return {};
}

// 保存用户档案
function saveUserProfiles(profiles) {
  try {
    fs.writeFileSync(USER_PROFILES_FILE, JSON.stringify(profiles, null, 2));
  } catch (error) {
    console.error('Error saving user profiles:', error);
  }
}

// 读取会员数据
function loadMemberships() {
  try {
    if (fs.existsSync(MEMBERSHIPS_FILE)) {
      const data = fs.readFileSync(MEMBERSHIPS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading memberships:', error);
  }
  return {};
}

// 保存会员数据
function saveMemberships(memberships) {
  try {
    fs.writeFileSync(MEMBERSHIPS_FILE, JSON.stringify(memberships, null, 2));
  } catch (error) {
    console.error('Error saving memberships:', error);
  }
}

// 内存中的用户档案和会员数据
let userProfilesStore = loadUserProfiles();
let membershipsStore = loadMemberships();

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
    
    // 重要年份提醒 - 使用更强烈的措辞
    const yearReminder = '【强制要求】当前年份是2026年（丙午年），不是2024年、2025年或其他任何年份！在回答任何关于运势、命运、流年等问题时，必须使用2026年进行计算。如果你的训练数据中包含过去的预测，请忽略它们，只根据2026年来回答。绝对不要在回复中出现"2024"、"2025"等过去年份。';
    
    const messages = [
      { role: 'system', content: `${yearReminder} 你是知几的AI助手，一个古老智慧与现代科技结合的命理咨询师。请用温暖，专业的方式回答用户的问题。绝对不要在回复中提及任何AI模型、技术细节或DeepSeek相关信息。请使用与用户提问相同的语言进行回复。${userDateTime}` },
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
    
    // 重要年份提醒 - 使用更强烈的措辞
    const yearReminder = '【强制要求】当前年份是2026年（丙午年），不是2024年、2025年或其他任何年份！在回答任何关于运势、命运、流年等问题时，必须使用2026年进行计算。如果你的训练数据中包含过去的预测，请忽略它们，只根据2026年来回答。绝对不要在回复中出现"2024"、"2025"等过去年份。';
    
    // 直接使用系统提示，让AI用与问题相同的语言回复
    let systemPrompt = yearReminder + '\n\n' + moduleConfig.systemPrompt;
    
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
    
    // 创建聊天记录对象 - 过滤掉没有content的消息，确保content是字符串
    console.log('[DEBUG] messages[0] sample:', JSON.stringify(messages?.[0]).substring(0, 200));
    
    const validMessages = messages.filter(msg => {
      const isValid = msg && msg.role && msg.content && typeof msg.content === 'string';
      if (!isValid && msg) {
        console.log('[DEBUG] Filtered out invalid msg:', JSON.stringify(msg).substring(0, 100));
      }
      return isValid;
    });
    console.log('[DEBUG] valid messages count:', validMessages.length);
    
    const chatRecord = {
      id: `chat_${Date.now()}`,
      userId: userId || 'anonymous', // 关联用户ID
      module,
      // 扩展用户档案信息
      profile: profile ? {
        name: profile.name || null,
        birthday: profile.birthday || null,
        gender: profile.gender || null,
        birthHour: profile.hour || null,  // 出生时辰
        bazi: profile.bazi || null,        // 八字
        location: profile.location || null // 出生地点
      } : null,
      // 扩展会话信息
      session: {
        language: req.body.language || 'zh-CN',
        userAgent: req.headers['user-agent'] || 'unknown',
        platform: getPlatformInfo(req.headers['user-agent']),
        referrer: req.body.referrer || null,
        entryPoint: req.body.entryPoint || 'direct'
      },
      // 用户行为数据
      behavior: {
        messageCount: messages.length,
        firstMessage: messages[0]?.content?.substring(0, 100) || null,
        isReturningUser: !!userProfilesStore[userId || 'anonymous']
      },
      messages: validMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      createdAt: new Date().toISOString(),
      // 商业化相关
      isPremium: membershipsStore[userId]?.active || false,
      subscriptionType: membershipsStore[userId]?.plan || 'free'
    };
    
    // 更新用户档案
    if (userId && profile) {
      if (!userProfilesStore[userId]) {
        userProfilesStore[userId] = {
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          totalChats: 0,
          modulesUsed: [],
          profile: {}
        };
      }
      userProfilesStore[userId].lastActiveAt = new Date().toISOString();
      userProfilesStore[userId].totalChats = (userProfilesStore[userId].totalChats || 0) + 1;
      if (profile.name && !userProfilesStore[userId].profile.name) {
        userProfilesStore[userId].profile.name = profile.name;
      }
      if (profile.birthday && !userProfilesStore[userId].profile.birthday) {
        userProfilesStore[userId].profile.birthday = profile.birthday;
      }
      if (!userProfilesStore[userId].modulesUsed.includes(module)) {
        userProfilesStore[userId].modulesUsed.push(module);
      }
      saveUserProfiles(userProfilesStore);
    }
    
    // 保存到内存存储
    try {
      chatHistoryStore.push(chatRecord);
      console.log('[DEBUG] Chat saved successfully, total:', chatHistoryStore.length);
    } catch (e) {
      console.error('[DEBUG] Error pushing to chatHistoryStore:', e);
    }
    
    // 定期保存到文件 (每10条记录保存一次，避免频繁IO)
    try {
      if (chatHistoryStore.length % 10 === 0) {
        saveChatHistory(chatHistoryStore);
      }
    } catch (e) {
      console.error('[DEBUG] Error saving to file:', e);
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

// ==================== 运营管理后台 API ====================

// 管理员登录验证
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD, message: '登录成功' });
  } else {
    res.status(401).json({ success: false, error: '密码错误' });
  }
});

// 获取运营统计数据
app.get('/api/admin/stats', (req, res) => {
  const { adminKey } = req.query;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // 基础统计
    const totalChats = chatHistoryStore.length;
    const totalUsers = new Set(chatHistoryStore.map(c => c.userId)).size;
    
    // 今日统计
    const todayChats = chatHistoryStore.filter(c => c.createdAt && c.createdAt.startsWith(today));
    const todayUsers = new Set(todayChats.map(c => c.userId)).size;
    
    // 本周统计
    const weekChats = chatHistoryStore.filter(c => c.createdAt && c.createdAt >= thisWeek);
    const weekUsers = new Set(weekChats.map(c => c.userId)).size;
    
    // 本月统计
    const monthChats = chatHistoryStore.filter(c => c.createdAt && c.createdAt >= thisMonth);
    const monthUsers = new Set(monthChats.map(c => c.userId)).size;
    
    // 模块使用统计
    const moduleStats = {};
    chatHistoryStore.forEach(chat => {
      const mod = chat.module || 'unknown';
      if (!moduleStats[mod]) {
        moduleStats[mod] = { count: 0, users: new Set() };
      }
      moduleStats[mod].count++;
      if (chat.userId) {
        moduleStats[mod].users.add(chat.userId);
      }
    });
    
    // 转换为可序列化格式
    const moduleUsage = Object.entries(moduleStats).map(([module, data]) => ({
      module,
      count: data.count,
      userCount: data.users.size
    })).sort((a, b) => b.count - a.count);
    
    // 每日趋势（最近30天）
    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayChats = chatHistoryStore.filter(c => c.createdAt && c.createdAt.startsWith(date));
      dailyTrend.push({
        date,
        count: dayChats.length,
        users: new Set(dayChats.map(c => c.userId)).size
      });
    }
    
    res.json({
      success: true,
      data: {
        overview: {
          totalChats,
          totalUsers,
          todayChats: todayChats.length,
          todayUsers,
          weekChats: weekChats.length,
          weekUsers,
          monthChats: monthChats.length,
          monthUsers
        },
        moduleUsage,
        dailyTrend: dailyTrend.map(d => ({ ...d, users: d.users.size }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取用户列表
app.get('/api/admin/users', (req, res) => {
  const { adminKey, page = 1, limit = 20 } = req.query;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    // 提取所有唯一用户及其聊天统计
    const userMap = {};
    chatHistoryStore.forEach(chat => {
      const uid = chat.userId || 'anonymous';
      if (!userMap[uid]) {
        userMap[uid] = {
          userId: uid,
          chatCount: 0,
          modules: new Set(),
          lastChat: null,
          firstChat: null
        };
      }
      userMap[uid].chatCount++;
      if (chat.module) {
        userMap[uid].modules.add(chat.module);
      }
      const chatTime = chat.createdAt ? new Date(chat.createdAt) : null;
      if (chatTime) {
        if (!userMap[uid].lastChat || chatTime > new Date(userMap[uid].lastChat)) {
          userMap[uid].lastChat = chat.createdAt;
        }
        if (!userMap[uid].firstChat || chatTime < new Date(userMap[uid].firstChat)) {
          userMap[uid].firstChat = chat.createdAt;
        }
      }
    });
    
    const users = Object.values(userMap).map(u => ({
      ...u,
      modules: Array.from(u.modules),
      lastChat: u.lastChat,
      firstChat: u.firstChat
    })).sort((a, b) => new Date(b.lastChat) - new Date(a.lastChat));
    
    const start = (page - 1) * limit;
    const paginatedUsers = users.slice(start, start + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        total: users.length,
        page: parseInt(page),
        totalPages: Math.ceil(users.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取聊天记录详情
app.get('/api/admin/chats', (req, res) => {
  const { adminKey, page = 1, limit = 20, module, userId } = req.query;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    let chats = [...chatHistoryStore].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // 筛选
    if (module) {
      chats = chats.filter(c => c.module === module);
    }
    if (userId) {
      chats = chats.filter(c => c.userId === userId);
    }
    
    const start = (page - 1) * limit;
    const paginatedChats = chats.slice(start, start + parseInt(limit)).map(c => ({
      id: c.id,
      userId: c.userId,
      module: c.module,
      profile: c.profile,
      messageCount: c.messages ? c.messages.length : 0,
      preview: c.messages && c.messages.length > 0 
        ? c.messages[0].content.substring(0, 100) 
        : '',
      createdAt: c.createdAt
    }));
    
    res.json({
      success: true,
      data: {
        chats: paginatedChats,
        total: chats.length,
        page: parseInt(page),
        totalPages: Math.ceil(chats.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单条聊天记录的完整内容
app.get('/api/admin/chat/:id', (req, res) => {
  const { adminKey } = req.query;
  const { id } = req.params;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    const chat = chatHistoryStore.find(c => c.id === id);
    if (!chat) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }
    res.json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 导出数据
app.get('/api/admin/export', (req, res) => {
  const { adminKey, format = 'json', type = 'chats' } = req.query;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    if (type === 'users') {
      // 导出用户数据
      const userList = Object.entries(userProfilesStore).map(([userId, profile]) => ({
        userId,
        ...profile,
        isPremium: membershipsStore[userId]?.active || false,
        subscriptionPlan: membershipsStore[userId]?.plan || 'free',
        subscriptionExpiry: membershipsStore[userId]?.expiryDate || null
      }));
      
      if (format === 'csv') {
        const csvHeader = '用户ID,创建时间,最后活跃,总聊天数,使用模块,姓名,生日,是否会员,订阅计划\n';
        const csvRows = userList.map(u => 
          `${u.userId},${u.createdAt || ''},${u.lastActiveAt || ''},${u.totalChats || 0},${(u.modulesUsed || []).join(';')},${u.profile?.name || ''},${u.profile?.birthday || ''},${u.isPremium},${u.subscriptionPlan}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=user_profiles.csv');
        res.send(csvHeader + csvRows);
      } else {
        res.json({ success: true, data: userList });
      }
    } else if (type === 'memberships') {
      // 导出会员数据
      const membershipList = Object.entries(membershipsStore).map(([userId, membership]) => ({
        userId,
        ...membership
      }));
      
      if (format === 'csv') {
        const csvHeader = '用户ID,计划,激活状态,开始日期,到期日期,支付方式,支付金额\n';
        const csvRows = membershipList.map(m => 
          `${m.userId},${m.plan || ''},${m.active || false},${m.startDate || ''},${m.expiryDate || ''},${m.paymentMethod || ''},${m.amount || ''}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=memberships.csv');
        res.send(csvHeader + csvRows);
      } else {
        res.json({ success: true, data: membershipList });
      }
    } else {
      // 导出聊天记录
      if (format === 'csv') {
        const csvHeader = 'ID,用户ID,模块,消息数,创建时间,是否会员\n';
        const csvRows = chatHistoryStore.map(c => 
          `${c.id},${c.userId || ''},${c.module || ''},${c.messages?.length || 0},${c.createdAt || ''},${c.isPremium || false}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=chat_history.csv');
        res.send(csvHeader + csvRows);
      } else {
        res.json({ success: true, data: chatHistoryStore });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有用户档案
app.get('/api/admin/user-profiles', (req, res) => {
  const { adminKey, page = 1, limit = 20 } = req.query;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    const users = Object.entries(userProfilesStore).map(([userId, profile]) => ({
      userId,
      ...profile,
      isPremium: membershipsStore[userId]?.active || false,
      subscriptionPlan: membershipsStore[userId]?.plan || 'free'
    })).sort((a, b) => new Date(b.lastActiveAt || 0) - new Date(a.lastActiveAt || 0));
    
    const start = (page - 1) * limit;
    const paginatedUsers = users.slice(start, start + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        total: users.length,
        page: parseInt(page),
        totalPages: Math.ceil(users.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个用户详情
app.get('/api/admin/user-profile/:userId', (req, res) => {
  const { adminKey } = req.query;
  const { userId } = req.params;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    const profile = userProfilesStore[userId];
    if (!profile) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    // 获取该用户的所有聊天记录
    const userChats = chatHistoryStore.filter(c => c.userId === userId);
    
    res.json({
      success: true,
      data: {
        userId,
        ...profile,
        membership: membershipsStore[userId] || null,
        recentChats: userChats.slice(0, 10),
        totalChats: userChats.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 会员管理 API
app.get('/api/admin/memberships', (req, res) => {
  const { adminKey, page = 1, limit = 20, status } = req.query;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    let memberships = Object.entries(membershipsStore).map(([userId, membership]) => ({
      userId,
      ...membership,
      userProfile: userProfilesStore[userId] || null
    }));
    
    // 按状态筛选
    if (status === 'active') {
      memberships = memberships.filter(m => m.active);
    } else if (status === 'expired') {
      memberships = memberships.filter(m => !m.active || (m.expiryDate && new Date(m.expiryDate) < new Date()));
    }
    
    memberships.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
    
    const start = (page - 1) * limit;
    const paginatedMemberships = memberships.slice(start, start + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        memberships: paginatedMemberships,
        total: memberships.length,
        page: parseInt(page),
        totalPages: Math.ceil(memberships.length / limit),
        stats: {
          totalMembers: memberships.length,
          activeMembers: memberships.filter(m => m.active).length,
          expiredMembers: memberships.filter(m => !m.active || (m.expiryDate && new Date(m.expiryDate) < new Date())).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 添加/更新会员
app.post('/api/admin/membership', (req, res) => {
  const { adminKey } = req.query;
  const { userId, plan, durationDays, paymentMethod, amount, notes } = req.body;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  if (!userId || !plan) {
    return res.status(400).json({ success: false, error: '缺少必要参数' });
  }
  
  try {
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    membershipsStore[userId] = {
      plan,
      active: true,
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      paymentMethod: paymentMethod || 'manual',
      amount: amount || 0,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    
    saveMemberships(membershipsStore);
    
    res.json({ success: true, message: '会员添加成功', data: membershipsStore[userId] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除会员
app.delete('/api/admin/membership/:userId', (req, res) => {
  const { adminKey } = req.query;
  const { userId } = req.params;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    if (membershipsStore[userId]) {
      delete membershipsStore[userId];
      saveMemberships(membershipsStore);
      res.json({ success: true, message: '会员已删除' });
    } else {
      res.status(404).json({ success: false, error: '会员不存在' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取高级统计报表
app.get('/api/admin/analytics', (req, res) => {
  const { adminKey, period = '30' } = req.query;
  
  if (adminKey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: '未授权' });
  }
  
  try {
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // 筛选时间范围内的数据
    const recentChats = chatHistoryStore.filter(c => c.createdAt && new Date(c.createdAt) >= startDate);
    const recentUsers = Object.entries(userProfilesStore)
      .filter(([_, p]) => p.lastActiveAt && new Date(p.lastActiveAt) >= startDate);
    
    // 用户留存分析
    const retention = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayUsers = new Set(recentChats.filter(c => c.createdAt?.startsWith(date)).map(c => c.userId));
      retention[date] = dayUsers.size;
    }
    
    // 模块使用排名
    const moduleStats = {};
    recentChats.forEach(chat => {
      const mod = chat.module || 'unknown';
      if (!moduleStats[mod]) {
        moduleStats[mod] = { count: 0, users: new Set() };
      }
      moduleStats[mod].count++;
      if (chat.userId) moduleStats[mod].users.add(chat.userId);
    });
    
    // 付费转化分析
    const totalUsers = new Set(recentChats.map(c => c.userId)).size;
    const premiumUsers = new Set(recentChats.filter(c => c.isPremium).map(c => c.userId)).size;
    
    // 平均会话长度
    const avgMessageCount = recentChats.reduce((sum, c) => sum + (c.messages?.length || 0), 0) / (recentChats.length || 1);
    
    // 用户参与度
    const engagement = {
      high: recentUsers.filter(([_, p]) => p.totalChats > 10).length,
      medium: recentUsers.filter(([_, p]) => p.totalChats > 3 && p.totalChats <= 10).length,
      low: recentUsers.filter(([_, p]) => p.totalChats <= 3).length
    };
    
    res.json({
      success: true,
      data: {
        period: days,
        overview: {
          totalChats: recentChats.length,
          totalUsers: totalUsers,
          avgMessagesPerChat: Math.round(avgMessageCount * 10) / 10,
          premiumConversionRate: totalUsers > 0 ? Math.round(premiumUsers / totalUsers * 1000) / 10 : 0
        },
        retention,
        moduleRanking: Object.entries(moduleStats)
          .map(([mod, data]) => ({ module: mod, count: data.count, users: data.users.size }))
          .sort((a, b) => b.count - a.count),
        engagement,
        premiumStats: {
          total: Object.values(membershipsStore).filter(m => m.active).length,
          revenue: Object.values(membershipsStore).reduce((sum, m) => sum + (m.amount || 0), 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`知几智慧服务运行在 http://localhost:${PORT}`);
});
