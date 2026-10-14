<script setup>
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useLanguageStore } from '../i18n'
import { computed, ref, onMounted } from 'vue'

const router = useRouter()
const chatStore = useChatStore()
const languageStore = useLanguageStore()

// MBTI弹窗控制
const showMbtiPopup = ref(false)
const hasSeenMbtiPopup = ref(true)

onMounted(() => {
  // 检查用户是否已经看过MBTI弹窗
  const seen = localStorage.getItem('has_seen_mbti_popup')
  if (!seen) {
    hasSeenMbtiPopup.value = false
    // 延迟1秒显示弹窗，让页面先加载完成
    setTimeout(() => {
      showMbtiPopup.value = true
    }, 1000)
  }
})

function closeMbtiPopup() {
  showMbtiPopup.value = false
  localStorage.setItem('has_seen_mbti_popup', 'true')
}

function startMbtiTest() {
  closeMbtiPopup()
  chatStore.setModule('mbti')
  router.push('/chat/mbti')
}

// 直接使用 languageStore.currentLanguage 来获取当前语言
const currentLang = computed(() => languageStore.currentLanguage)

// 翻译辅助函数 - 使用统一的 translations.js
import { homeTranslations } from '../i18n/translations'

const t = (key) => {
  const lang = currentLang.value?.value || currentLang.value || 'zh-CN'
  const translations = homeTranslations[lang] || homeTranslations['zh-CN']
  return translations[key] || translations['zh-CN']?.[key] || key
}

// 使用计算属性
const heroTitle = computed(() => t('heroTitle'))
const heroSubtitle = computed(() => t('heroSubtitle'))
const startBtn = computed(() => t('startBtn'))
const feature1 = computed(() => t('feature1'))
const feature2 = computed(() => t('feature2'))
const feature3 = computed(() => t('feature3'))
const exploreServices = computed(() => t('exploreServices'))
const questionTitle = computed(() => t('questionTitle'))
const questionSubtitle = computed(() => t('questionSubtitle'))
const askPlaceholder = computed(() => t('askPlaceholder'))
const askBtn = computed(() => t('askBtn'))
const footer = computed(() => t('footer'))

const features = [
  { icon: '📊', titleKey: 'modules.bazi', descKey: 'modules.baziDesc', color: 'from-blue-500 to-cyan-400' },
  { icon: '🏠', titleKey: 'modules.fengshui', descKey: 'modules.fengshuiDesc', color: 'from-green-500 to-emerald-400' },
  { icon: '🃏', titleKey: 'modules.tarot', descKey: 'modules.tarotDesc', color: 'from-purple-500 to-violet-400' },
  { icon: '✋', titleKey: 'modules.palm', descKey: 'modules.palmDesc', color: 'from-orange-500 to-amber-400' },
  { icon: '🌙', titleKey: 'modules.dream', descKey: 'modules.dreamDesc', color: 'from-indigo-500 to-blue-400' }
]

function startChat(moduleId) {
  chatStore.setModule(moduleId)
  router.push(`/chat/${moduleId}`)
}

// 获取模块ID
function getModuleId(index) {
  const ids = ['bazi', 'fengshui', 'tarot', 'palm', 'dream']
  return ids[index] || 'bazi'
}
</script>

<template>
  <div class="home">
    <!-- MBTI测试弹窗 -->
    <div v-if="showMbtiPopup" class="mbti-popup-overlay" @click.self="closeMbtiPopup">
      <div class="mbti-popup">
        <button class="mbti-popup-close" @click="closeMbtiPopup">×</button>
        <div class="mbti-popup-icon">🎯</div>
        <h2 class="mbti-popup-title">发现真实的自己</h2>
        <p class="mbti-popup-desc">MBTI职业性格测试，帮助您深入了解性格特点，发现潜在优势</p>
        <div class="mbti-popup-versions">
          <button class="mbti-version-btn" @click="startMbtiTest">
            <span class="version-name">立即测试</span>
            <span class="version-arrow">→</span>
          </button>
        </div>
        <button class="mbti-popup-skip" @click="closeMbtiPopup">暂不测试</button>
      </div>
    </div>
    
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
        <div class="bg-orb bg-orb-3"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-logo">
          <img src="/logo.png" :alt="t('appName')" class="logo-img" />
        </div>
        <h1 class="hero-title" v-html="heroTitle"></h1>
        <p class="hero-subtitle" v-html="heroSubtitle"></p>
        <button class="start-btn" @click="startChat('bazi')">
          <span class="btn-text">{{ startBtn }}</span>
          <span class="btn-icon">→</span>
        </button>
      </div>

      <div class="hero-features">
        <div class="feature-item">
          <span class="feature-icon">⏰</span>
          <span>{{ feature1 }}</span>
        </div>
        <div class="feature-divider"></div>
        <div class="feature-item">
          <span class="feature-icon">📚</span>
          <span>{{ feature2 }}</span>
        </div>
        <div class="feature-divider"></div>
        <div class="feature-item">
          <span class="feature-icon">🎯</span>
          <span>{{ feature3 }}</span>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="features-section">
      <h2 class="section-title">
        <span class="title-icon">✦</span>
        {{ exploreServices }}
        <span class="title-icon">✦</span>
      </h2>
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.title"
          class="feature-card"
          :class="feature.color"
          @click="startChat(getModuleId(index))"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <span class="card-icon">{{ feature.icon }}</span>
            <h3 class="card-title">{{ t(feature.titleKey) }}</h3>
            <p class="card-desc">{{ t(feature.descKey) }}</p>
            <div class="card-arrow">→</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Question -->
    <section class="quick-question">
      <div class="question-box">
        <div class="question-decor question-decor-left">☯</div>
        <h2 class="question-title">{{ questionTitle }}</h2>
        <p class="question-subtitle">{{ questionSubtitle }}</p>
        <div class="question-input-wrap">
          <input 
            type="text" 
            :placeholder="askPlaceholder"
            class="question-input"
            @keyup.enter="startChat('bazi')"
          />
          <button class="ask-btn" @click="startChat('bazi')">
            <span>{{ askBtn }}</span>
            <span class="ask-icon">➤</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="footer">
      <p>{{ footer }}</p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

/* Hero Section */
.hero {
  position: relative;
  padding: 60px 20px 40px;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;
}

.bg-orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  top: -100px;
  left: -50px;
}

.bg-orb-2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  top: 50px;
  right: -80px;
  animation-delay: -3s;
}

.bg-orb-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #34d399, #10b981);
  bottom: -50px;
  left: 30%;
  animation-delay: -5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-logo {
  margin-bottom: 24px;
}

.logo-img {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 15px 50px rgba(251, 191, 36, 0.5); }
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #fbbf24 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  line-height: 1.3;
}

.hero-subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 36px;
  line-height: 1.8;
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 30px;
  color: #1a1a2e;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px rgba(251, 191, 36, 0.5);
}

.btn-icon {
  transition: transform 0.3s;
}

.start-btn:hover .btn-icon {
  transform: translateX(4px);
}

.hero-features {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 50px;
  padding: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.feature-icon {
  font-size: 18px;
}

.feature-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}

/* Features Section */
.features-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 36px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.title-icon {
  color: #fbbf24;
  font-size: 18px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-from), var(--color-to));
  opacity: 0;
  transition: opacity 0.4s;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(251, 191, 36, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.feature-card:hover::before {
  opacity: 0.1;
}

.feature-card.from-blue-500 { --color-from: #3b82f6; --color-to: #22d3ee; }
.feature-card.from-green-500 { --color-from: #22c55e; --color-to: #34d399; }
.feature-card.from-purple-500 { --color-from: #a855f7; --color-to: #8b5cf6; }
.feature-card.from-orange-500 { --color-from: #f97316; --color-to: #fbbf24; }
.feature-card.from-indigo-500 { --color-from: #6366f1; --color-to: #60a5fa; }

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
  transform: rotate(30deg);
}

.feature-card:hover .card-glow {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-icon {
  font-size: 42px;
  display: block;
  margin-bottom: 14px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

.card-arrow {
  font-size: 20px;
  color: #fbbf24;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Quick Question */
.quick-question {
  max-width: 700px;
  margin: 50px auto;
  padding: 0 20px;
}

.question-box {
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.question-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}

.question-decor {
  position: absolute;
  font-size: 60px;
  opacity: 0.1;
}

.question-decor-left {
  top: 20px;
  left: 20px;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.question-title {
  font-size: 24px;
  color: #fff;
  margin-bottom: 10px;
}

.question-subtitle {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 28px;
}

.question-input-wrap {
  display: flex;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.question-input {
  flex: 1;
  padding: 16px 22px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 15px;
  transition: all 0.2s;
}

.question-input:focus {
  outline: none;
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.question-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.ask-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 30px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ask-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);
}

.ask-icon {
  transition: transform 0.2s;
}

.ask-btn:hover .ask-icon {
  transform: translateX(3px);
}

/* Footer */
.footer {
  text-align: center;
  padding: 30px 20px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }
  
  .hero-subtitle br {
    display: none;
  }
  
  .hero-features {
    flex-direction: column;
    gap: 12px;
  }
  
  .feature-divider {
    width: 40px;
    height: 1px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .feature-card {
    padding: 20px;
  }
  
  .card-icon {
    font-size: 32px;
  }
  
  .question-input-wrap {
    flex-direction: column;
  }
  
  .question-box {
    padding: 28px;
  }
}

/* MBTI弹窗样式 */
.mbti-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.mbti-popup {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  padding: 40px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  position: relative;
  border: 1px solid rgba(251, 191, 36, 0.2);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.4s ease;
}

.mbti-popup-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.mbti-popup-close:hover {
  color: #fbbf24;
}

.mbti-popup-icon {
  font-size: 56px;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.mbti-popup-title {
  font-size: 26px;
  font-weight: 700;
  color: #fbf2d4;
  margin-bottom: 12px;
}

.mbti-popup-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 28px;
}

.mbti-popup-versions {
  margin-bottom: 16px;
}

.mbti-popup .mbti-version-btn {
  width: 100%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  border-radius: 14px;
  padding: 18px 24px;
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.mbti-popup .mbti-version-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
}

.version-arrow {
  font-size: 20px;
}

.mbti-popup-skip {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;
}

.mbti-popup-skip:hover {
  color: rgba(255, 255, 255, 0.8);
}
</style>
