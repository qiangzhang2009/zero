<script setup>
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const chatStore = useChatStore()

const features = [
  { icon: '📊', title: '生辰八字', desc: '揭开人生的密码图谱', color: 'from-blue-500 to-cyan-400' },
  { icon: '🏠', title: '风水布局', desc: '调和空间，激发潜能', color: 'from-green-500 to-emerald-400' },
  { icon: '🃏', title: '塔罗牌', desc: '神秘而智慧的占卜', color: 'from-purple-500 to-violet-400' },
  { icon: '✋', title: '手相揭秘', desc: '掌纹中的命运轨迹', color: 'from-orange-500 to-amber-400' },
  { icon: '🌙', title: '周公解梦', desc: '让梦境化作生命启示', color: 'from-indigo-500 to-blue-400' }
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
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
        <div class="bg-orb bg-orb-3"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-logo">
          <img src="/logo.png" alt="知几" class="logo-img" />
        </div>
        <h1 class="hero-title">古老智慧的低语<br/>指引你的未来</h1>
        <p class="hero-subtitle">"知几者，动之微，吉之先见者也"<br/>寻求清晰，开启命途，发现真我</p>
        <button class="start-btn" @click="startChat('bazi')">
          <span class="btn-text">开始探索</span>
          <span class="btn-icon">→</span>
        </button>
      </div>
      
      <div class="hero-features">
        <div class="feature-item">
          <span class="feature-icon">⏰</span>
          <span>随时随地</span>
        </div>
        <div class="feature-divider"></div>
        <div class="feature-item">
          <span class="feature-icon">📚</span>
          <span>19+测算</span>
        </div>
        <div class="feature-divider"></div>
        <div class="feature-item">
          <span class="feature-icon">🎯</span>
          <span>精准解读</span>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="features-section">
      <h2 class="section-title">
        <span class="title-icon">✦</span>
        探索服务
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
            <h3 class="card-title">{{ feature.title }}</h3>
            <p class="card-desc">{{ feature.desc }}</p>
            <div class="card-arrow">→</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Question -->
    <section class="quick-question">
      <div class="question-box">
        <div class="question-decor question-decor-left">☯</div>
        <h2 class="question-title">有问题？随时问我</h2>
        <p class="question-subtitle">知几会结合古老智慧与现代AI为你解答</p>
        <div class="question-input-wrap">
          <input 
            type="text" 
            placeholder="现在是换工作的好时机吗？"
            class="question-input"
            @keyup.enter="startChat('bazi')"
          />
          <button class="ask-btn" @click="startChat('bazi')">
            <span>询问</span>
            <span class="ask-icon">➤</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 知几 · 古老智慧，现代解读</p>
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
</style>
