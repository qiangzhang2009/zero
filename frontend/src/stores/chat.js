import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import axios from 'axios'
import { useProfileStore } from './profile'

const API_URL = import.meta.env.VITE_API_URL || '/api'

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

export const useChatStore = defineStore('chat', () => {
  const messages = ref(loadFromStorage('chat_messages', []))
  const currentModule = ref(loadFromStorage('chat_current_module', 'bazi'))
  const isLoading = ref(false)
  const history = ref(loadFromStorage('chat_history', []))

  // 监听消息变化，自动保存到localStorage
  watch(messages, (newMessages) => {
    saveToStorage('chat_messages', newMessages)
  }, { deep: true })

  // 监听当前模块变化
  watch(currentModule, (newModule) => {
    saveToStorage('chat_current_module', newModule)
  })

  // 监听历史记录变化
  watch(history, (newHistory) => {
    saveToStorage('chat_history', newHistory)
  }, { deep: true })

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
        } : null
      })
      
      const aiMessage = response.data.data.message
      
      // 更新最后一条消息
      messages.value.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: Date.now()
      })
      
      // 更新历史
      history.value[history.value.length - 1] = { role: 'assistant', content: aiMessage }
      
    } catch (error) {
      messages.value.push({
        role: 'assistant',
        content: '抱歉，发生了错误，请稍后再试。',
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
    currentModule.value = moduleId
    messages.value = []
    history.value = []
  }

  // 清空对话
  function clearChat() {
    messages.value = []
    history.value = []
    // 清除localStorage
    localStorage.removeItem('chat_messages')
    localStorage.removeItem('chat_history')
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
        } : null
      })
      
      const aiMessage = response.data.data.message
      
      // 更新最后一条消息
      messages.value.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: Date.now()
      })
      
      // 更新历史
      history.value[history.value.length - 1] = { role: 'assistant', content: aiMessage }
      
    } catch (error) {
      messages.value.push({
        role: 'assistant',
        content: '抱歉，发生了错误，请稍后再试。',
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
    clearChat
  }
})
