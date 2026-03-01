<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useLanguageStore } from '../i18n'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const languageStore = useLanguageStore()
const isOpen = ref(false)
const showGuide = ref(false)

// 首次访问时显示引导提示
onMounted(() => {
  const hasSeenGuide = localStorage.getItem('zhiJi_mobile_nav_guide')
  if (!hasSeenGuide) {
    showGuide.value = true
    setTimeout(() => {
      showGuide.value = false
      localStorage.setItem('zhiJi_mobile_nav_guide', 'true')
    }, 3000)
  }
})

function selectModule(moduleId) {
  chatStore.setModule(moduleId)
  router.push(`/chat/${moduleId}`)
  isOpen.value = false
}

function closeGuide() {
  showGuide.value = false
  localStorage.setItem('zhiJi_mobile_nav_guide', 'true')
}
</script>

<template>
  <!-- 引导提示 -->
  <Transition name="guide">
    <div v-if="showGuide" class="mobile-guide-overlay" @click="closeGuide">
      <div class="guide-content" @click.stop>
        <div class="guide-arrow">👇</div>
        <div class="guide-text">{{ languageStore.t('chat.selectModule') }}</div>
        <button class="guide-btn" @click="closeGuide">知道了</button>
      </div>
    </div>
  </Transition>

  <!-- Mobile Menu Button -->
  <button class="mobile-menu-btn" @click="isOpen = !isOpen">
    <span class="menu-icon">{{ isOpen ? '✕' : '☰' }}</span>
    <span class="menu-text">{{ isOpen ? languageStore.t('chat.selectModule') : languageStore.t('modules.' + (chatStore.modules.find(m => m.id === chatStore.currentModule)?.id || 'bazi')) }}</span>
  </button>

  <!-- Mobile Menu Overlay -->
  <div class="mobile-menu-overlay" :class="{ open: isOpen }" @click="isOpen = false"></div>

  <!-- Mobile Menu -->
  <div class="mobile-menu" :class="{ open: isOpen }">
    <div class="mobile-menu-header">
      <span>{{ languageStore.t('chat.selectModule') }}</span>
      <button @click="isOpen = false">✕</button>
    </div>
    <div class="mobile-module-list">
      <div 
        v-for="module in chatStore.modules" 
        :key="module.id"
        class="mobile-module-item"
        :class="{ active: chatStore.currentModule === module.id }"
        @click="selectModule(module.id)"
      >
        <span class="module-icon">{{ module.icon }}</span>
        <span class="module-name">{{ languageStore.t('modules.' + module.id) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  padding: 16px 32px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 40px;
  color: #1a1a2e;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 25px rgba(251, 191, 36, 0.5);
  gap: 12px;
  align-items: center;
  animation: btnPulse 2s ease-in-out infinite;
  max-width: 90vw;
}

@keyframes btnPulse {
 0%, 100% { 
    transform: translateX(-50%) scale(1);
    box-shadow: 0 4px 25px rgba(251, 191, 36, 0.5);
  }
  50% { 
    transform: translateX(-50%) scale(1.02);
    box-shadow: 0 8px 35px rgba(251, 191, 36, 0.7);
  }
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
}

.menu-icon {
  font-size: 20px;
}

.mobile-menu-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.mobile-menu-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .mobile-menu-overlay {
    display: block;
  }
}

.mobile-menu {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 75vh;
  background: #1a1a2e;
  border-radius: 24px 24px 0 0;
  z-index: 101;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  overflow: hidden;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
}

.mobile-menu.open {
  transform: translateY(0);
}

.mobile-menu.open {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .mobile-menu {
    display: block;
  }
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
}

.mobile-menu-header button {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.mobile-module-list {
  padding: 12px;
  overflow-y: auto;
  max-height: 60vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.mobile-module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 16px;
  border-radius: 16px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  min-height: 90px;
}

.mobile-module-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.mobile-module-item.active {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3));
  border: 1px solid rgba(251, 191, 36, 0.5);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
}

.mobile-module-item .module-icon {
  font-size: 26px;
}

.mobile-module-item .module-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  text-align: center;
}

/* 引导提示样式 */
.mobile-guide-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 100px;
}

.guide-content {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  padding: 20px 30px;
  border-radius: 16px;
  text-align: center;
  color: #1a1a2e;
  animation: guideBounce 0.6s ease infinite;
}

@keyframes guideBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.guide-arrow {
  font-size: 32px;
  margin-bottom: 8px;
  animation: arrowBounce 0.6s ease infinite;
}

@keyframes arrowBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.guide-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.guide-btn {
  background: rgba(0, 0, 0, 0.2);
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
}

/* 引导动画 */
.guide-enter-active,
.guide-leave-active {
  transition: opacity 0.3s ease;
}

.guide-enter-from,
.guide-leave-to {
  opacity: 0;
}
</style>
