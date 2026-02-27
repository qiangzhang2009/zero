<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useProfileStore } from '../stores/profile'
import { soundManager } from '../utils/sound'
import { voiceInput } from '../utils/voice'
import ProfileSelector from '../components/ProfileSelector.vue'
import ImageUpload from '../components/ImageUpload.vue'

const route = useRoute()
const chatStore = useChatStore()
const profileStore = useProfileStore()

const inputMessage = ref('')
const messagesContainer = ref(null)
const isStreaming = ref(false)
const inputRef = ref(null)

// 打字机效果相关
const displayText = ref('')
const isTyping = ref(false)
const currentMessageIndex = ref(-1)

// 新增：弹窗控制
const showProfileSelector = ref(false)
const showImageUpload = ref(false)

// 新增：语音输入状态
const isVoiceListening = ref(false)

// 音效 - 发送消息时
function playSendSound() {
  soundManager.playSend()
}

// 音效 - 收到回复时
function playReceiveSound() {
  soundManager.playReceive()
}

// 猜你想问 - 预制问题
const guessYouWantQuestions = computed(() => {
  const module = chatStore.currentModule
  const questions = {
    bazi: [
      '我的命有多好？',
      '我的五行喜用神是什么？',
      '今年事业发展如何？',
      '我的婚姻何时到来？',
      '财运亨通还是堪忧？'
    ],
    fengshui: [
      '我的房子缺角吗？',
      '财位在哪里？',
      '卧室应该怎么布置？',
      '大门朝向好吗？',
      '办公室风水注意什么？'
    ],
    tarot: [
      '我的爱情运如何？',
      '事业发展的建议？',
      '当前处境该如何选择？',
      '我和他有未来吗？',
      '下个月运势怎么样？'
    ],
    palm: [
      '我的事业线好吗？',
      '我的婚姻线如何？',
      '我的财运怎么样？',
      '生命线长吗？',
      '手掌透露什么秘密？'
    ],
    dream: [
      '我梦到蛇意味着什么？',
      '梦到去世的亲人',
      '飞翔的梦代表什么？',
      '梦见考试好不好？',
      '噩梦是凶兆吗？'
    ],
    zodiac: [
      '我的性格特点？',
      '我和什么星座最配？',
      '本月运势如何？',
      '适合什么职业？',
      '如何提升财运？'
    ],
    mbti: [
      '我的人格类型？',
      'INFP的特质？',
      'ENTJ适合的工作？',
      '如何与INTJ相处？',
      'MBTI能改变吗？'
    ],
    draw: [
      '求一支事业签',
      '求一支财运签',
      '求一支姻缘签',
      '求一支健康签',
      '今日运势如何？'
    ],
    default: [
      '我的运势怎么样？',
      '需要注意什么？',
      '适合做什么？',
      '何时有好运？',
      '如何提升运气？'
    ]
  }
  return questions[module] || questions.default
})

// 快捷输入建议
const inputSuggestions = computed(() => {
  const module = chatStore.currentModule
  const suggestions = {
    bazi: ['我的八字五行属什么？', '我的喜用神是什么？', '今年运势如何？'],
    fengshui: ['我的房子缺角吗？', '财位在哪里？', '卧室放什么植物好？'],
    tarot: ['我的爱情运如何？', '最近工作顺利吗？', '我应该选择A还是B？'],
    palm: ['我的事业线好吗？', '我的婚姻线如何？', '我的财运怎么样？'],
    dream: ['我梦到蛇意味着什么？', '梦到去世的亲人', '飞翔的梦代表什么？'],
    zodiac: ['我是狮子座，我的性格特点？', '我和白羊座配吗？', '本月运势如何？'],
    mbti: ['我可能是INFP吗？', 'ENTJ适合什么工作？', '如何和INTJ相处？'],
    draw: ['求一支事业签', '求一支财运签', '求一支姻缘签'],
    default: ['最近运气如何？', '本月运势怎么样？', '需要注意什么？']
  }
  return suggestions[module] || suggestions.default
})

const currentModule = computed(() => {
  return chatStore.modules.find(m => m.id === chatStore.currentModule)
})

const introMessage = computed(() => {
  const profile = profileStore.currentProfile
  let intro = chatStore.moduleIntros[chatStore.currentModule] || '您好，我是知几的AI助手，请问有什么可以帮您？'
  
  // 如果有档案信息，加入到开场白
  if (profile && profile.name) {
    intro = `${profile.name}，${intro}`
  }
  
  return intro
})

onMounted(() => {
  // 初始化档案
  profileStore.init()
  
  if (route.params.module) {
    chatStore.setModule(route.params.module)
  }
  if (chatStore.messages.length === 0) {
    chatStore.messages.push({
      role: 'assistant',
      content: introMessage.value,
      timestamp: Date.now(),
      typed: true
    })
  }
  inputRef.value?.focus()
})

watch(() => route.params.module, (newModule) => {
  if (newModule) {
    chatStore.setModule(newModule)
    chatStore.messages = [{
      role: 'assistant',
      content: introMessage.value,
      timestamp: Date.now(),
      typed: true
    }]
  }
})

// 打字机效果函数
async function typeText(text, messageIndex) {
  if (isTyping.value) return
  
  isTyping.value = true
  displayText.value = ''
  currentMessageIndex.value = messageIndex
  
  const chars = text.split('')
  for (let i = 0; i < chars.length; i++) {
    displayText.value += chars[i]
    await new Promise(resolve => setTimeout(resolve, 20))
    
    // 自动滚动
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
  
  // 更新实际消息内容
  if (chatStore.messages[messageIndex]) {
    chatStore.messages[messageIndex].content = displayText.value
    chatStore.messages[messageIndex].typed = true
  }
  
  isTyping.value = false
  displayText.value = ''
}

async function sendMessage() {
  if (!inputMessage.value.trim() || chatStore.isLoading) return
  
  const message = inputMessage.value
  inputMessage.value = ''
  isStreaming.value = true
  playSendSound() // 发送音效
  
  // 发送消息
  await chatStore.sendMessage(message)
  
  isStreaming.value = false
  
  // 对最新AI回复应用打字机效果
  await nextTick()
  const lastIndex = chatStore.messages.length - 1
  if (lastIndex >= 0 && chatStore.messages[lastIndex]?.role === 'assistant') {
    playReceiveSound() // 收到回复音效
    await typeText(chatStore.messages[lastIndex].content, lastIndex)
  }
  
  await nextTick()
  scrollToBottom()
  inputRef.value?.focus()
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function handleSuggestionClick(suggestion) {
  inputMessage.value = suggestion
  sendMessage()
}

// 复制消息
function copyMessage(content) {
  navigator.clipboard.writeText(content)
}

// 重新生成回复
async function regenerate() {
  if (chatStore.messages.length < 2) return
  
  // 获取倒数第二条用户消息
  let lastUserIndex = -1
  for (let i = chatStore.messages.length - 2; i >= 0; i--) {
    if (chatStore.messages[i].role === 'user') {
      lastUserIndex = i
      break
    }
  }
  
  if (lastUserIndex >= 0) {
    // 删除最后一条AI回复
    chatStore.messages.pop()
    // 重新发送
    isStreaming.value = true
    await chatStore.sendMessage(chatStore.messages[lastUserIndex].content)
    isStreaming.value = false
    
    // 应用打字机效果
    await nextTick()
    const lastIndex = chatStore.messages.length - 1
    if (lastIndex >= 0 && chatStore.messages[lastIndex]?.role === 'assistant') {
      await typeText(chatStore.messages[lastIndex].content, lastIndex)
    }
  }
}

const quickQuestions = [
  '最近运气如何？',
  '本月运势怎么样？',
  '适合做什么工作？',
  '我的桃花运如何？',
  '需要注意什么？'
]

async function askQuickQuestion(question) {
  inputMessage.value = question
  await sendMessage()
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 语音输入功能
function toggleVoiceInput() {
  if (isVoiceListening.value) {
    voiceInput.stop()
    isVoiceListening.value = false
  } else {
    // 设置语音识别回调
    voiceInput.onResult = (transcript) => {
      inputMessage.value = transcript
      isVoiceListening.value = false
    }
    
    voiceInput.onError = (error) => {
      console.error('语音识别错误:', error)
      isVoiceListening.value = false
      if (error === 'browser-not-supported') {
        alert('您的浏览器不支持语音识别功能')
      }
    }
    
    const started = voiceInput.start()
    if (started) {
      isVoiceListening.value = true
    }
  }
}

// 打开档案选择
function openProfileSelector() {
  showProfileSelector.value = true
}

// 打开图片上传
function openImageUpload() {
  showImageUpload.value = true
}
</script>

<template>
  <div class="chat-container">
    <!-- 顶部功能栏 -->
    <div class="chat-header">
      <div class="header-left">
        <span class="module-icon">{{ currentModule?.icon }}</span>
        <span class="module-name">{{ currentModule?.name }}</span>
        <span class="module-desc">{{ currentModule?.description }}</span>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="openImageUpload" title="上传图片">
          <span class="btn-icon">📷</span>
        </button>
        <button class="header-btn" @click="openProfileSelector" title="选择档案">
          <span class="btn-icon">👤</span>
          <span class="btn-text">{{ profileStore.currentProfile?.name || '档案' }}</span>
        </button>
        <button class="clear-btn" @click="chatStore.clearChat()">新对话</button>
      </div>
    </div>
    
    <div class="messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in chatStore.messages" 
        :key="index" 
        class="message" 
        :class="[msg.role, { typing: isTyping && currentMessageIndex === index }]"
      >
        <div class="message-avatar" :class="msg.role">
          <!-- 用户消息显示头像 -->
          <span v-if="msg.role === 'user'">{{ profileStore.currentProfile?.avatar || '你' }}</span>
          <span v-else>✨</span>
        </div>
        
        <div class="message-body">
          <div class="message-info">
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            <span v-if="msg.role === 'user'" class="message-status">已发送</span>
          </div>
          
          <!-- 用户消息显示图片 -->
          <div v-if="msg.role === 'user' && msg.image" class="message-image">
            <img :src="msg.image" alt="上传的图片" />
          </div>
          
          <div class="message-content" :class="msg.role">
            <span v-if="isTyping && currentMessageIndex === index">{{ displayText }}</span>
            <span v-else>{{ msg.content }}</span>
          </div>
          
          <!-- 消息操作按钮 -->
          <div v-if="msg.role === 'assistant' && msg.typed" class="message-actions">
            <button @click="copyMessage(msg.content)" title="复制">
              <span class="action-icon">📋</span> 复制
            </button>
            <button @click="regenerate" title="重新生成">
              <span class="action-icon">🔄</span> 重试
            </button>
          </div>
        </div>
      </div>
      
      <!-- 神秘 mystical 加载动画 -->
      <div v-if="chatStore.isLoading && !isTyping" class="message assistant loading-message">
        <div class="message-avatar assistant">
          <div class="avatar-glow"></div>
          <span>✨</span>
        </div>
        <div class="message-body">
          <div class="mystical-loading">
            <div class="loading-ring">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
            </div>
            <div class="loading-text">
              <span class="dot">倾</span>
              <span class="dot">听</span>
              <span class="dot">天</span>
              <span class="dot">机</span>
              <span class="dot">中</span>
              <span class="dot">...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 猜你想问 -->
    <div class="guess-section" v-if="!chatStore.isLoading && chatStore.messages.length > 0">
      <div class="guess-header">
        <span class="guess-icon">🔮</span>
        <span class="guess-title">猜你想问</span>
      </div>
      <div class="guess-questions">
        <button 
          v-for="question in guessYouWantQuestions" 
          :key="question"
          @click="handleSuggestionClick(question)"
          class="guess-btn"
        >
          {{ question }}
        </button>
      </div>
    </div>
    
    <!-- 快捷问题建议 -->
    <div class="suggestions" v-if="!chatStore.isLoading && chatStore.messages.length < 3">
      <span class="suggestions-label">试试这样问：</span>
      <div class="suggestions-list">
        <button 
          v-for="suggestion in inputSuggestions" 
          :key="suggestion"
          @click="handleSuggestionClick(suggestion)"
          class="suggestion-btn"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-tools">
        <button class="tool-btn" @click="openImageUpload" title="上传图片">
          📷
        </button>
        <button 
          class="tool-btn" 
          :class="{ listening: isVoiceListening }"
          @click="toggleVoiceInput" 
          title="语音输入"
        >
          {{ isVoiceListening ? '🔴' : '🎤' }}
        </button>
      </div>
      <div class="input-wrapper">
        <input 
          ref="inputRef"
          v-model="inputMessage" 
          type="text" 
          placeholder="输入您的问题..." 
          @keyup.enter="sendMessage"
          :disabled="chatStore.isLoading"
        />
      </div>
      <button 
        class="send-btn" 
        @click="sendMessage" 
        :disabled="chatStore.isLoading || !inputMessage.trim()"
      >
        <span v-if="!chatStore.isLoading">➤</span>
        <span v-else class="btn-loading">...</span>
      </button>
    </div>
    
    <!-- 档案选择弹窗 -->
    <ProfileSelector 
      v-if="showProfileSelector" 
      @close="showProfileSelector = false" 
    />
    
    <!-- 图片上传弹窗 -->
    <ImageUpload 
      :visible="showImageUpload" 
      @close="showImageUpload = false" 
    />
  </div>
</template>

<style scoped>
.chat-container { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  background: linear-gradient(180deg, rgba(26,26,46,0.3) 0%, rgba(26,26,46,0) 100%);
  position: relative;
}

/* 头部 */
.chat-header { 
  padding: 14px 20px; 
  border-bottom: 1px solid rgba(255,255,255,0.08); 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.header-btn:hover {
  background: rgba(255,255,255,0.15);
}

.btn-icon {
  font-size: 14px;
}

.module-icon { font-size: 26px; }
.module-name { font-size: 18px; font-weight: 600; color: #fff; }
.module-desc { font-size: 13px; color: rgba(255,255,255,0.5); }
.clear-btn { 
  padding: 6px 14px; 
  background: rgba(255,255,255,0.08); 
  border: 1px solid rgba(255,255,255,0.12); 
  border-radius: 20px; 
  color: rgba(255,255,255,0.7); 
  cursor: pointer; 
  font-size: 12px;
  transition: all 0.2s;
}
.clear-btn:hover { background: rgba(255,255,255,0.15); }

/* 消息区域 */
.messages { 
  flex: 1; 
  overflow-y: auto; 
  padding: 20px; 
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message { 
  display: flex; 
  gap: 12px; 
  animation: messageIn 0.3s ease;
}
@keyframes messageIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user { flex-direction: row-reverse; }

.message-avatar { 
  width: 38px; 
  height: 38px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 14px; 
  font-weight: 600;
  flex-shrink: 0; 
  position: relative;
}
.message-avatar.user { 
  background: linear-gradient(135deg, #667eea, #764ba2); 
  color: #fff;
}
.message-avatar.assistant { 
  background: linear-gradient(135deg, #fbbf24, #f59e0b); 
  color: #1a1a2e;
}

.avatar-glow { 
  position: absolute; 
  inset: -4px; 
  border-radius: 50%; 
  background: linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24); 
  animation: glowPulse 2s ease-in-out infinite; 
  opacity: 0.4; 
  z-index: 0; 
}
@keyframes glowPulse { 
  0%, 100% { opacity: 0.3; transform: scale(1); } 
  50% { opacity: 0.6; transform: scale(1.15); } 
}

.message-body { max-width: 75%; display: flex; flex-direction: column; gap: 4px; }

.message-info { 
  display: flex; 
  gap: 8px; 
  align-items: center; 
  font-size: 11px; 
  color: rgba(255,255,255,0.4);
  padding: 0 4px;
}
.message.user .message-info { justify-content: flex-end; }

.message-image {
  margin-bottom: 8px;
}

.message-image img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 12px;
  border: 2px solid rgba(255,255,255,0.1);
}

.message-content { 
  padding: 14px 18px; 
  border-radius: 18px; 
  background: rgba(255,255,255,0.08); 
  color: #fff; 
  line-height: 1.7; 
  white-space: pre-wrap; 
  font-size: 15px;
  position: relative;
}
.message-content.assistant {
  border-top-left-radius: 4px;
  background: linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08));
  border: 1px solid rgba(251,191,36,0.15);
}
.message-content.user {
  border-top-right-radius: 4px;
  background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2));
  border: 1px solid rgba(102,126,234,0.2);
}

/* 消息操作按钮 */
.message-actions {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  opacity: 0;
  transition: opacity 0.2s;
}
.message:hover .message-actions { opacity: 1; }

.message-actions button {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.2s;
}
.message-actions button:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
}
.action-icon { font-size: 12px; }

/* 神秘加载动画 */
.loading-message { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.mystical-loading { 
  display: flex; 
  align-items: center; 
  gap: 16px; 
  padding: 8px 4px; 
}

.loading-ring { position: relative; width: 44px; height: 44px; }
.ring { position: absolute; inset: 0; border: 2px solid transparent; border-radius: 50%; }
.ring-1 { border-top-color: #fbbf24; animation: spin 1.2s linear infinite; }
.ring-2 { border-right-color: #f59e0b; animation: spin 1.5s linear infinite reverse; }
.ring-3 { border-bottom-color: #fbbf24; animation: spin 0.8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.loading-text { display: flex; gap: 3px; font-size: 13px; color: rgba(251, 191, 36, 0.8); }
.dot { animation: textPulse 1.5s ease-in-out infinite; }
.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.1s; }
.dot:nth-child(3) { animation-delay: 0.2s; }
.dot:nth-child(4) { animation-delay: 0.3s; }
.dot:nth-child(5) { animation-delay: 0.4s; }
.dot:nth-child(6) { animation-delay: 0.5s; }
@keyframes textPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* 猜你想问 */
.guess-section {
  padding: 12px 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: rgba(26, 26, 46, 0.5);
}

.guess-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.guess-icon {
  font-size: 16px;
}

.guess-title {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}

.guess-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.guess-btn {
  padding: 8px 14px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 20px;
  color: rgba(251, 191, 36, 0.9);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.guess-btn:hover {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.4);
  transform: scale(1.02);
}

/* 建议区域 */
.suggestions {
  padding: 12px 20px 8px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.suggestions-label {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  display: block;
  margin-bottom: 8px;
}
.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.suggestion-btn {
  padding: 8px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.suggestion-btn:hover {
  background: rgba(251,191,36,0.15);
  border-color: rgba(251,191,36,0.3);
  color: #fbbf24;
}

/* 输入区域 */
.input-area { 
  padding: 12px 20px 20px; 
  display: flex; 
  gap: 12px; 
  align-items: center;
  background: rgba(26, 26, 46, 0.95);
  border-top: 1px solid rgba(255,255,255,0.08);
}

.input-tools {
  display: flex;
  gap: 8px;
}

.tool-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(255,255,255,0.15);
}

.tool-btn.listening {
  background: rgba(255, 59, 48, 0.2);
  border-color: rgba(255, 59, 48, 0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.input-wrapper input { 
  width: 100%;
  padding: 12px 16px; 
  border: 1px solid rgba(255,255,255,0.15); 
  border-radius: 24px; 
  background: rgba(255,255,255,0.08); 
  color: #fff; 
  font-size: 15px;
  transition: all 0.2s;
}
.input-wrapper input:focus {
  outline: none;
  border-color: rgba(251,191,36,0.5);
  background: rgba(255,255,255,0.12);
  box-shadow: 0 0 0 3px rgba(251,191,36,0.1);
}
.input-wrapper input::placeholder { color: rgba(255,255,255,0.4); }
.input-wrapper input:disabled { opacity: 0.5; }

.send-btn { 
  width: 46px; 
  height: 46px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b); 
  border: none; 
  border-radius: 50%; 
  color: #1a1a2e; 
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { 
  transform: scale(1.05); 
  box-shadow: 0 4px 20px rgba(251,191,36,0.4);
}
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-loading { font-size: 14px; }

/* 响应式 */
@media (max-width: 768px) {
  .chat-header { 
    padding: 12px 16px; 
    flex-wrap: wrap;
    gap: 10px;
  }
  .module-desc { display: none; }
  .header-btn .btn-text { display: none; }
  .messages { padding: 16px; }
  .message-body { max-width: 85%; }
  .message-content { padding: 12px 14px; font-size: 14px; }
  .message-actions { opacity: 1; }
  .input-area { padding: 12px 16px 16px; }
  .suggestions { padding: 12px 16px 8px; }
  .guess-section { padding: 12px 16px; }
  .input-tools { display: none; }
}
</style>
