<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useProfileStore } from '../stores/profile'
import { useLanguageStore } from '../i18n'
import { soundManager } from '../utils/sound'
import { voiceInput } from '../utils/voice'
import ProfileSelector from '../components/ProfileSelector.vue'
import ImageUpload from '../components/ImageUpload.vue'
import { questionTranslations, greetingTranslations, namePrefixTranslations, suggestionsTranslations } from '../i18n/translations'
import { marked } from 'marked'
import { mbtiQuestions, mbtiDescriptions, calculateMBTI } from '../data/mbti'

const route = useRoute()
const chatStore = useChatStore()
const profileStore = useProfileStore()
const languageStore = useLanguageStore()

const inputMessage = ref('')
const messagesContainer = ref(null)
const isStreaming = ref(false)
const inputRef = ref(null)

// 追踪工具埋点辅助函数
const track = (toolName, action, params = {}) => {
  if (typeof window !== 'undefined' && window.zxqTrack) {
    window.zxqTrack.tool(toolName, action, params)
  }
}

// 解析 Markdown 为 HTML
const renderMarkdown = (text) => {
  if (!text) return ''
  // 配置 marked 选项
  marked.setOptions({
    breaks: true,
    gfm: true
  })
  return marked.parse(text)
}

// 格式化消息内容（解析 Markdown）
const formatContent = (content) => {
  if (!content) return ''
  return renderMarkdown(content)
}

// MBTI 测试相关函数
const startMbtiTest = (version) => {
  mbtiTestVersion.value = version
  mbtiCurrentQuestion.value = 0
  mbtiAnswers.value = []
  mbtiTestResult.value = null
  showMbtiTest.value = true
  // 追踪 MBTI 开始
  track('MBTI测试', 'start', { test_version: version })
}

const selectMbtiOption = (option) => {
  const questions = mbtiQuestions[mbtiTestVersion.value] || mbtiQuestions.simple
  mbtiAnswers.value.push({
    question: mbtiCurrentQuestion.value,
    dimension: questions[mbtiCurrentQuestion.value].dimension,
    value: option.value,
    text: option.text
  })
  
  if (mbtiCurrentQuestion.value < questions.length - 1) {
    mbtiCurrentQuestion.value++
  } else {
    // 完成测试，计算结果
    finishMbtiTest()
  }
}

const finishMbtiTest = () => {
  const type = calculateMBTI(mbtiAnswers.value)
  mbtiTestResult.value = {
    type,
    ...mbtiDescriptions[type]
  }
  // 追踪 MBTI 完成
  track('MBTI测试', 'complete', {
    mbti_type: type,
    test_version: mbtiTestVersion.value,
    answers_count: mbtiAnswers.value.length,
  })
  // 发送结果给 AI 分析
  const resultText = `我完成了MBTI测试，测试版本：${mbtiTestVersion.value === 'simple' ? '简易版' : mbtiTestVersion.value === 'standard' ? '标准版' : '完整版'}。我的MBTI类型是：${type}（${mbtiTestResult.value.name}）。`
  sendMessage(resultText)
  showMbtiTest.value = false
}

const closeMbtiTest = () => {
  showMbtiTest.value = false
  mbtiTestResult.value = null
  mbtiCurrentQuestion.value = 0
  mbtiAnswers.value = []
}

const currentMbtiQuestion = computed(() => {
  const questions = mbtiQuestions[mbtiTestVersion.value] || mbtiQuestions.simple
  return questions[mbtiCurrentQuestion.value]
})

const mbtiProgress = computed(() => {
  const questions = mbtiQuestions[mbtiTestVersion.value] || mbtiQuestions.simple
  return ((mbtiCurrentQuestion.value + 1) / questions.length) * 100
})

// 打字机效果相关
const displayText = ref('')
const isTyping = ref(false)
const currentMessageIndex = ref(-1)

// 新增：弹窗控制
const showProfileSelector = ref(false)
const showImageUpload = ref(false)

// MBTI 测试相关状态
const showMbtiTest = ref(false)
const mbtiTestVersion = ref('simple') // simple, standard, full
const mbtiCurrentQuestion = ref(0)
const mbtiAnswers = ref([])
const mbtiTestResult = ref(null)
const mbtiShowVersionSelect = ref(false)

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

// 猜你想问 - 预制问题（多语言版本）
const guessYouWantQuestions = computed(() => {
  const module = chatStore.currentModule
  const lang = languageStore.currentLanguage.value
  const translations = questionTranslations[lang] || questionTranslations['en'] || questionTranslations['zh-CN']
  return translations[module] || translations.default
})

// 快捷输入建议（多语言版本）
const inputSuggestions = computed(() => {
  const module = chatStore.currentModule
  const lang = languageStore.currentLanguage.value
  const translations = suggestionsTranslations[lang] || suggestionsTranslations['en'] || suggestionsTranslations['zh-CN']
  
  // MBTI 模块特殊处理：显示测试版本按钮
  if (module === 'mbti') {
    return ['开始简易版测试', '开始标准版测试']
  }
  
  return translations[module] || translations.default
})

const currentModule = computed(() => {
  return chatStore.modules.find(m => m.id === chatStore.currentModule)
})

const introMessage = computed(() => {
  const profile = profileStore.currentProfile
  const lang = languageStore.currentLanguage.value

  // 使用对应语言的开场白
  const moduleIntro = chatStore.moduleIntros[chatStore.currentModule]
  let intro = moduleIntro ? moduleIntro[lang] : null
  if (!intro) {
    // 如果没有对应语言版本，回退到中文
    intro = moduleIntro ? moduleIntro['zh-CN'] : (greetingTranslations[lang] || greetingTranslations['zh-CN'])
  }
  
  // 如果有档案信息，加入到开场白
  if (profile && profile.name) {
    const prefix = namePrefixTranslations[lang] || namePrefixTranslations['zh-CN']
    intro = `${profile.name}${prefix}${intro}`
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
    
    // MBTI 模块：自动弹出测试选择
    if (newModule === 'mbti') {
      setTimeout(() => {
        showMbtiTest.value = true
      }, 500)
    }
  }
})

// 监听语言变化，更新欢迎语
watch(() => languageStore.currentLanguage.value, () => {
  if (chatStore.messages.length > 0 && chatStore.messages[0].role === 'assistant') {
    chatStore.messages[0] = {
      ...chatStore.messages[0],
      content: introMessage.value
    }
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

  // 追踪用户发送消息（AI对话工具）
  const toolName = route.params.toolId ? String(route.params.toolId) : 'ai_chat'
  track(toolName, 'submit', {
    message_length: message.length,
    tool_section: 'chat',
    has_profile: !!profileStore.currentProfile,
  })
  
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
  // MBTI 模块：点击建议时开始测试
  if (chatStore.currentModule === 'mbti') {
    if (suggestion.includes('简易版')) {
      startMbtiTest('simple')
    } else if (suggestion.includes('标准版')) {
      startMbtiTest('standard')
    } else {
      startMbtiTest('simple')
    }
    return
  }
  
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
            <span v-else v-html="formatContent(msg.content)"></span>
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
    
    <!-- MBTI 测试弹窗 -->
    <div v-if="showMbtiTest" class="mbti-modal-overlay" @click.self="closeMbtiTest">
      <div class="mbti-modal">
        <div class="mbti-modal-header">
          <h3>MBTI性格测试 · {{ mbtiTestVersion === 'simple' ? '简易版' : mbtiTestVersion === 'standard' ? '标准版' : '完整版' }}</h3>
          <button class="close-btn" @click="closeMbtiTest">×</button>
        </div>
        
        <div class="mbti-modal-body">
          <!-- 选择测试版本 -->
          <div v-if="!mbtiTestResult && !currentMbtiQuestion" class="mbti-version-select">
            <div class="mbti-intro">
              <p>MBTI旨在帮助人们更深入地了解自己的性格特点和行为偏好。接下来，我将基于您的回答，为您生成一份详细的性格类型分析报告。</p>
            </div>
            <div class="mbti-version-options">
              <button class="mbti-version-btn" @click="startMbtiTest('simple')">
                <span class="version-name">简易版</span>
                <span class="version-desc">28题 · 约5分钟</span>
              </button>
              <button class="mbti-version-btn" @click="startMbtiTest('standard')">
                <span class="version-name">标准版</span>
                <span class="version-desc">93题 · 约15分钟</span>
              </button>
              <button class="mbti-version-btn" @click="startMbtiTest('full')">
                <span class="version-name">完整版</span>
                <span class="version-desc">200题 · 约30分钟</span>
              </button>
            </div>
            <button class="mbti-what-is" @click="sendMessage('MBTI是什么？')">什么是MBTI？</button>
          </div>
          
          <!-- 测试结果 -->
          <div v-if="mbtiTestResult" class="mbti-result">
            <div class="mbti-type">{{ mbtiTestResult.type }}</div>
            <div class="mbti-type-name">{{ mbtiTestResult.name }}</div>
            <p class="mbti-desc">{{ mbtiTestResult.desc }}</p>
            <div class="mbti-strengths">
              <span v-for="s in mbtiTestResult.strengths" :key="s" class="strength-tag">{{ s }}</span>
            </div>
            <p class="mbti-career">适合职业：{{ mbtiTestResult.career.join('、') }}</p>
            <button class="start-test-btn" @click="closeMbtiTest">开始探索</button>
          </div>
          
          <!-- 测试题目 -->
          <div v-else class="mbti-questions">
            <div class="mbti-progress-bar">
              <div class="mbti-progress" :style="{ width: mbtiProgress + '%' }"></div>
            </div>
            <div class="mbti-question-num">第 {{ mbtiCurrentQuestion + 1 }} 题</div>
            <div class="mbti-question-text">{{ currentMbtiQuestion?.question }}</div>
            <div class="mbti-options">
              <button 
                v-for="(option, idx) in currentMbtiQuestion?.options" 
                :key="idx"
                class="mbti-option"
                @click="selectMbtiOption(option)"
              >
                <span class="option-label">{{ String.fromCharCode(65 + idx) }}、</span>
                {{ option.text }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
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

/* Markdown 渲染样式 - 乔布斯风格简洁优雅 */
.message-content p {
  margin: 0 0 12px 0;
}
.message-content p:last-child {
  margin-bottom: 0;
}
.message-content h1,
.message-content h2,
.message-content h3,
.message-content h4 {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: #fbf2d4;
  line-height: 1.4;
}
.message-content h1 { font-size: 20px; }
.message-content h2 { font-size: 18px; }
.message-content h3 { font-size: 16px; }
.message-content h4 { font-size: 15px; }
.message-content ul,
.message-content ol {
  margin: 8px 0;
  padding-left: 20px;
}
.message-content li {
  margin: 4px 0;
  line-height: 1.6;
}
.message-content strong {
  color: #fbf2d4;
  font-weight: 600;
}
.message-content em {
  font-style: italic;
  color: rgba(251, 191, 36, 0.9);
}
.message-content code {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 13px;
}
.message-content pre {
  background: rgba(0, 0, 0, 0.4);
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}
.message-content pre code {
  background: none;
  padding: 0;
}
.message-content blockquote {
  border-left: 3px solid rgba(251, 191, 36, 0.5);
  margin: 12px 0;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(251, 191, 36, 0.05);
  border-radius: 0 8px 8px 0;
}
.message-content hr {
  border: none;
  border-top: 1px solid rgba(251, 191, 36, 0.2);
  margin: 16px 0;
}
.message-content a {
  color: #fbbf24;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.message-content a:hover {
  border-bottom-color: #fbbf24;
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

/* MBTI 测试弹窗样式 */
.mbti-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.mbti-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(251, 191, 36, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.mbti-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(251, 191, 36, 0.1);
}

.mbti-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fbf2d4;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #fbbf24;
}

.mbti-modal-body {
  padding: 24px;
}

.mbti-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-bottom: 20px;
  overflow: hidden;
}

.mbti-progress {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.mbti-question-num {
  font-size: 13px;
  color: rgba(251, 191, 36, 0.8);
  margin-bottom: 8px;
}

.mbti-question-text {
  font-size: 17px;
  color: #fff;
  line-height: 1.6;
  margin-bottom: 24px;
}

.mbti-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mbti-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 20px;
  text-align: left;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.mbti-option:hover {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.3);
  transform: translateX(4px);
}

.option-label {
  color: #fbbf24;
  font-weight: 600;
  margin-right: 4px;
}

/* 测试结果样式 */
.mbti-result {
  text-align: center;
  padding: 20px 0;
}

.mbti-type {
  font-size: 56px;
  font-weight: 700;
  color: #fbbf24;
  line-height: 1.2;
  text-shadow: 0 0 30px rgba(251, 191, 36, 0.4);
}

.mbti-type-name {
  font-size: 24px;
  color: #fbf2d4;
  margin-bottom: 16px;
}

.mbti-desc {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin-bottom: 20px;
}

.mbti-strengths {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.strength-tag {
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: #fbbf24;
}

.mbti-career {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 24px;
}

.start-test-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  border-radius: 25px;
  padding: 14px 40px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.start-test-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

/* 版本选择样式 */
.mbti-version-select {
  text-align: center;
}

.mbti-intro {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin-bottom: 24px;
  font-size: 15px;
}

.mbti-version-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.mbti-version-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 14px;
  padding: 18px 20px;
  text-align: left;
  color: #fff;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mbti-version-btn:hover {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.5);
  transform: translateX(6px);
}

.mbti-version-btn .version-name {
  font-size: 17px;
  font-weight: 600;
  color: #fbf2d4;
}

.mbti-version-btn .version-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.mbti-what-is {
  background: none;
  border: none;
  color: rgba(251, 191, 36, 0.8);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  text-decoration: underline;
  transition: color 0.2s;
}

.mbti-what-is:hover {
  color: #fbbf24;
}
</style>
