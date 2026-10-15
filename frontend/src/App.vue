<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import Sidebar from './components/Sidebar.vue'
import MobileNav from './components/MobileNav.vue'
import CookieConsent from './components/CookieConsent.vue'
import { useChatStore } from './stores/chat'

const chatStore = useChatStore()

// 移动端侧边栏抽屉状态
const showMobileSidebar = ref(false)
const isMobile = ref(false)

function checkScreen() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showMobileSidebar.value = false
  }
}

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})

function toggleMobileSidebar() {
  showMobileSidebar.value = !showMobileSidebar.value
}

function closeMobileSidebar() {
  showMobileSidebar.value = false
}
</script>

<template>
  <div class="app-container">
    <AppHeader @toggle-sidebar="toggleMobileSidebar" />
    <div class="main-wrapper">
      <!-- 移动端遮罩层 -->
      <Transition name="fade">
        <div v-if="isMobile && showMobileSidebar" class="sidebar-overlay" @click="closeMobileSidebar"></div>
      </Transition>
      <!-- 侧边栏（桌面端常显，移动端受控） -->
      <Sidebar 
        v-if="!isMobile || showMobileSidebar" 
        @close="closeMobileSidebar"
      />
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <MobileNav />
    <!-- 全站 Cookie 同意横幅 (GDPR 合规) -->
    <CookieConsent />
  </div>
</template>

<style scoped>
.app-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .main-wrapper {
    flex-direction: column;
  }
  
  .content-area {
    padding-bottom: 80px;
  }
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
