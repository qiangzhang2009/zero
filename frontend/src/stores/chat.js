import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import axios from 'axios'
import { useProfileStore } from './profile'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// 前端敏感词过滤函数（额外保障）
function filterClientSensitiveWords(message) {
  if (!message) return message
  // 过滤 deepseek 相关的敏感词
  const sensitiveWords = [
    'deepseek', 'DeepSeek', 'DEEPSEEK', 'Deepseek',
    '深度求索', '深度搜索', 'deep seek', 'deep-seek',
    'DS模型', 'ds模型', 'DS的', 'ds的'
  ]
  
  let filtered = message
  for (const word of sensitiveWords) {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '知几')
  }
  
  return filtered
}

// 生成或获取用户ID
function getUserId() {
  let userId = localStorage.getItem('zhiJi_user_id')
  if (!userId) {
    // 生成唯一的用户ID
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('zhiJi_user_id', userId)
  }
  return userId
}

// 从localStorage加载保存的数据
function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

// 保存到localStorage
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

// 获取当前模块对应的消息存储key
function getModuleMessagesKey(moduleId) {
  return `chat_messages_${moduleId}`
}

export const useChatStore = defineStore('chat', () => {
  // 加载当前模块的消息
  const currentModule = ref(loadFromStorage('chat_current_module', 'bazi'))
  const messages = ref(loadFromStorage(getModuleMessagesKey(currentModule.value), []))
  const isLoading = ref(false)
  const history = ref(loadFromStorage(`chat_history_${currentModule.value}`, []))
  
  // 记录上次保存到服务器的聊天记录ID
  const lastSavedChatId = ref(loadFromStorage('last_saved_chat_id', null))

  // 监听消息变化，自动保存到localStorage
  watch(messages, (newMessages) => {
    saveToStorage(getModuleMessagesKey(currentModule.value), newMessages)
  }, { deep: true })

  // 监听当前模块变化，加载对应模块的消息
  watch(currentModule, (newModule) => {
    saveToStorage('chat_current_module', newModule)
    // 切换模块时，加载该模块保存的消息
    messages.value = loadFromStorage(getModuleMessagesKey(newModule), [])
    history.value = loadFromStorage(`chat_history_${newModule}`, [])
  })

  // 监听历史记录变化
  watch(history, (newHistory) => {
    saveToStorage(`chat_history_${currentModule.value}`, newHistory)
  }, { deep: true })

  // 从服务器加载历史聊天记录
  async function loadChatFromServer() {
    const userId = getUserId()
    
    try {
      // 获取聊天记录列表
      const response = await axios.get(`${API_URL}/chat/history`, {
        params: { userId, limit: 20 }
      })
      
      if (response.data.success && response.data.data.history) {
        const historyList = response.data.data.history
        
        // 如果有历史记录，尝试加载最新一个与当前模块匹配的记录
        if (historyList.length > 0) {
          // 查找当前模块的最新记录
          const moduleHistory = historyList.filter(h => h.module === currentModule.value)
          
          if (moduleHistory.length > 0) {
            // 获取最新记录的详情
            const latestChat = moduleHistory[0]
            
            try {
              const detailResponse = await axios.get(`${API_URL}/chat/${latestChat.id}`, {
                params: { userId }
              })
              
              if (detailResponse.data.success && detailResponse.data.data.messages) {
                // 只有当本地没有消息时才加载服务器的消息
                if (messages.value.length === 0) {
                  messages.value = detailResponse.data.data.messages
                  saveToStorage(getModuleMessagesKey(currentModule.value), messages.value)
                  
                  // 同时更新历史记录
                  const historyMessages = []
                  for (const msg of detailResponse.data.data.messages) {
                    historyMessages.push({ role: msg.role, content: msg.content })
                  }
                  history.value = historyMessages
                  saveToStorage(`chat_history_${currentModule.value}`, history.value)
                  
                  lastSavedChatId.value = latestChat.id
                  saveToStorage('last_saved_chat_id', latestChat.id)
                  
                  console.log('成功从服务器加载聊天记录')
                }
              }
            } catch (detailError) {
              console.warn('获取聊天记录详情失败:', detailError.message)
            }
          }
        }
      }
    } catch (error) {
      console.warn('从服务器加载聊天记录失败:', error.message)
    }
  }

  // 初始化时尝试从服务器加载聊天记录
  // 延迟一下确保页面完全加载
  setTimeout(() => {
    if (messages.value.length === 0) {
      loadChatFromServer()
    }
  }, 1500)

  // 功能模块列表
  const modules = ref([
    { id: 'bazi', name: '八字', icon: '📊', description: '生辰八字分析' },
    { id: 'fengshui', name: '风水', icon: '🏠', description: '风水布局咨询' },
    { id: 'tarot', name: '塔罗', icon: '🃏', description: '塔罗牌占卜' },
    { id: 'palm', name: '手相', icon: '✋', description: '手相揭秘' },
    { id: 'dream', name: '梦境', icon: '🌙', description: '周公解梦' },
    { id: 'zodiac', name: '星座', icon: '⭐', description: '星座运势' },
    { id: 'mbti', name: 'MBTI', icon: '🎯', description: '人格测试' },
    { id: 'draw', name: '抽签', icon: '🎋', description: '求签问卜' },
    { id: 'huangdi', name: '黄帝内经', icon: '📜', description: '养生智慧' },
    { id: 'lifenumber', name: '生命灵数', icon: '🔢', description: '数字能量' },
    { id: 'ziwei', name: '紫微斗数', icon: '🌟', description: '斗数命盘' },
    { id: 'zhouyi', name: '周易', icon: '☯️', description: '易经占卜' },
    { id: 'naming', name: '起名', icon: '✏️', description: '姓名评测' },
    { id: 'marriage', name: '婚配', icon: '💑', description: '婚姻配对' },
    { id: 'company', name: '公司起名', icon: '🏢', description: '商业命名' },
    { id: 'luckyday', name: '吉日', icon: '📅', description: '黄道吉日' },
    { id: 'digital', name: '数字命理', icon: '🔢', description: '数字分析' },
    { id: 'daodejing', name: '道德经', icon: '📖', description: '经典智慧' },
    { id: 'question', name: '问卦', icon: '🔮', description: '易经问卜' }
  ])

  // 模块介绍
  const moduleIntros = {
    bazi: '我是资深八字命理大师，精通五行八卦。请问您的出生年月日时是什么？',
    fengshui: '我是资深风水大师，长期深入研究风水学。请问您想了解哪方面的风水问题？',
    tarot: '欢迎来到塔罗牌的神秘世界。请告诉我您想要进行占卜的问题。',
    palm: '我是手相大师，通过掌纹可以了解您的命运轨迹。请描述您的掌纹特征。',
    dream: '每个梦境都承载着讯息。请告诉我您梦到了什么？',
    zodiac: '我是星座大师，为您解读星座的奥秘。请告诉我您的出生月日。',
    mbti: '我是MBTI人格分析师，帮助您了解自己的性格特点。',
    draw: '我是抽签解签大师。请静心思考您的问题，然后告诉我。',
    huangdi: '我是《黄帝内经》研究专家，精通中医养生之道。',
    lifenumber: '我是生命灵数分析师。请告诉我您的出生日期。',
    ziwei: '我是紫微斗数命理大师。请提供您的出生信息。',
    zhouyi: '我是《周易》研究专家，运用易经智慧为您答疑解惑。',
    naming: '我是姓名学专家，为您提供专业的起名和姓名评测服务。',
    marriage: '我是婚恋配对专家，为您分析两人之间的缘分。',
    company: '我是商业命名专家，为您的公司提供寓意吉祥的名字。',
    luckyday: '我是黄道吉日选择专家，为您挑选最适合的日子。',
    digital: '我是数字命理分析师，为您解读数字中的能量密码。',
    daodejing: '我是《道德经》研究专家，与您分享道家智慧。',
    question: '我是易经占卜大师。请告诉我您想问的事情。'
  }

  // 发送消息
  async function sendMessage(content) {
    if (!content.trim()) return
    
    // 获取当前档案信息
    const profileStore = useProfileStore()
    const profile = profileStore.currentProfile
    
    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: content,
      timestamp: Date.now()
    })
    
    // 更新历史记录
    history.value.push(
      { role: 'user', content: content },
      { role: 'assistant', content: '' }
    )
    
    isLoading.value = true
    
    // 获取用户本地时间
    const userLocalTime = new Date().toISOString();
    
    try {
      const response = await axios.post(`${API_URL}/chat/${currentModule.value}`, {
        message: content,
        history: history.value.slice(0, -1),
        profile: profile ? {
          name: profile.name,
          birthday: profile.birthday,
          gender: profile.gender,
          hour: profile.hour,
          bazi: profile.bazi
        } : null,
        userTime: userLocalTime
      })
      
      const aiMessage = response.data.data.message
      
      // 前端过滤敏感词（额外保障）
      const filteredMessage = filterClientSensitiveWords(aiMessage)
      
      // 更新最后一条消息
      messages.value.push({
        role: 'assistant',
        content: filteredMessage,
        timestamp: Date.now()
      })
      
      // 更新历史
      history.value[history.value.length - 1] = { role: 'assistant', content: filteredMessage }
      
    } catch (error) {
      let errorMsg = '抱歉，发生了错误，请稍后再试。'
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      }
      
      messages.value.push({
        role: 'assistant',
        content: errorMsg,
        timestamp: Date.now()
      })
    } finally {
      isLoading.value = false
      
      // 保存聊天记录到服务器
      saveChatToServer()
    }
  }

  // 保存聊天记录到服务器
  async function saveChatToServer() {
    if (messages.value.length === 0) return
    
    const profileStore = useProfileStore()
    const profile = profileStore.currentProfile
    
    try {
      await axios.post(`${API_URL}/chat/save`, {
        module: currentModule.value,
        messages: messages.value,
        userId: getUserId(), // 添加用户ID
        profile: profile ? {
          name: profile.name,
          birthday: profile.birthday,
          gender: profile.gender
        } : null
      })
    } catch (error) {
      console.warn('Failed to save chat to server:', error)
    }
  }

  // 切换模块
  function setModule(moduleId) {
    // 切换模块，保留当前模块的消息（已通过watch自动保存）
    currentModule.value = moduleId
    // messages 和 history 会通过 watch 自动加载对应模块的数据
  }

  // 清空当前模块对话
  function clearChat() {
    messages.value = []
    history.value = []
    // 清除当前模块的localStorage
    localStorage.removeItem(getModuleMessagesKey(currentModule.value))
    localStorage.removeItem(`chat_history_${currentModule.value}`)
  }

  // 发送带图片的消息
  async function sendMessageWithImage(content, imageBase64) {
    if (!content.trim()) return
    
    // 获取当前档案信息
    const profileStore = useProfileStore()
    const profile = profileStore.currentProfile
    
    // 更新历史记录
    history.value.push(
      { role: 'user', content: content, image: imageBase64 },
      { role: 'assistant', content: '' }
    )
    
    isLoading.value = true
    
    // 获取用户本地时间
    const userLocalTime = new Date().toISOString();
    
    try {
      const response = await axios.post(`${API_URL}/chat/${currentModule.value}`, {
        message: content,
        image: imageBase64,
        history: history.value.slice(0, -1),
        profile: profile ? {
          name: profile.name,
          birthday: profile.birthday,
          gender: profile.gender,
          hour: profile.hour,
          bazi: profile.bazi
        } : null,
        userTime: userLocalTime
      })
      
      const aiMessage = response.data.data.message
      
      // 前端过滤敏感词（额外保障）
      const filteredMessage = filterClientSensitiveWords(aiMessage)
      
      // 更新最后一条消息
      messages.value.push({
        role: 'assistant',
        content: filteredMessage,
        timestamp: Date.now()
      })
      
      // 更新历史
      history.value[history.value.length - 1] = { role: 'assistant', content: filteredMessage }
      
    } catch (error) {
      let errorMsg = '抱歉，发生了错误，请稍后再试。'
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      }
      
      messages.value.push({
        role: 'assistant',
        content: errorMsg,
        timestamp: Date.now()
      })
    } finally {
      isLoading.value = false
      
      // 保存聊天记录到服务器
      saveChatToServer()
    }
  }

  return {
    messages,
    currentModule,
    isLoading,
    history,
    modules,
    moduleIntros,
    sendMessage,
    sendMessageWithImage,
    setModule,
    clearChat,
    loadChatFromServer
  }
})
