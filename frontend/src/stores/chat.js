import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import axios from 'axios'
import { useProfileStore } from './profile'

// 处理可能的 /api 后缀，避免路径重复
let apiBase = import.meta.env.VITE_API_URL || ''
// 如果是 Vercel 部署（相对路径），使用 Railway API
if (!apiBase || apiBase === '/api') {
  apiBase = 'https://zero-production-4a85.up.railway.app/api'
}
const API_URL = apiBase

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

  // 模块介绍 - 乔布斯风格：简洁、温暖、有画面感
  const moduleIntros = {
    bazi: '生辰八字，藏着您一生的命运密码。让我们一起探索您五行八字的奥秘，了解您的性格、天赋与运势走向。请告诉我您的出生年月日时。',
    fengshui: '风水之道，在于人与自然的和谐共生。我来帮您解读环境中的能量奥秘，让您的居所成为滋养身心的港湾。请描述您想了解的空间。',
    tarot: '塔罗牌是心灵的镜子，每一张牌都蕴含着智慧的启示。静心思考您的问题，让我为您揭开命运的层层面纱。请问您想探索哪方面的困惑？',
    palm: '掌纹是生命的日记，记录着您走过的每一步。让我为您解读掌纹中的故事，洞察您的性格特质与命运轨迹。请描述您想了解的手相特征。',
    zodiac: '星座是星空写给人类的诗篇，诉说着性格与命运的古老秘密。让我们一起探索星座的奥秘，了解您独特的星芒特质。请告诉我您的出生月日。',
    mbti: '您好，欢迎参与MBTI职业性格测试。MBTI旨在帮助人们更深入地了解自己的性格特点和行为偏好。接下来，我将基于您的回答，为您生成一份详细的性格类型分析报告。',
    draw: '每一次抽签，都是与古老智慧的对话。静心默念您的问题，然后抽取一支属于您的签诗，让我为您解读其中的启示。',
    huangdi: '《黄帝内经》是中华养生智慧的瑰宝，蕴含着天人合一的奥秘。让我们一起探索这部经典，寻求身心健康之道。请问您想了解哪方面的养生知识？',
    lifenumber: '生命灵数是出生日期蕴含的能量密码，揭示着您的天赋才华与人生使命。让我们一起解读您独特的生命数字。请告诉我您的出生日期。',
    ziwei: '紫微斗数是中国古代皇家命理绝学，宏观呈现您一生的命运图谱。让我们一起探索您的紫微命盘，洞察命运起伏与人生机遇。请提供您的出生信息。',
    zhouyi: '《周易》是群经之首，大道之源。天地变化之道，尽在其中。让我们一起通过易经智慧，解答您心中的困惑。请告诉我您想问的事情。',
    naming: '名字是一个人的符号，承载着父母的期望与人生的祝福。让我们一起探讨姓名的奥秘，为您找到最适合的名字。请告诉我您的需求。',
    marriage: '百年修得同船渡，千年修得共枕眠。两个人的相遇，是缘分的交织。让我们一起解读您们的缘分深浅与婚姻走向。请提供两人的出生信息。',
    company: '商海如战场，一个好名字是企业的第一印象。让我们一起为您打造一个寓意深远、朗朗上口的商业名称。请告诉我您的行业和期望。',
    luckyday: '天时地利人和，成功需要顺势而为。让我们一起选择最适合您的好日子，让大事小事都能顺应天时。请告诉我您想选择日期的事情。',
    digital: '数字蕴含着宇宙的能量密码，每个数字都有其独特的振动频率。让我们一起解读您生命中的数字奥秘。请选择一个数字或告诉我您的出生日期。',
    daodejing: '《道德经》言：道可道，非常道。让我们一起领悟这部智慧之海的深邃内涵，寻求心灵的宁静与人生的智慧。请问您想探讨哪一章的内容？',
    question: '易者，变也。穷则变，变则通。让我们通过易经八卦，为您答疑解惑，指引迷津。请告诉我您想问的事情。'
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
