<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const isOpen = ref(false)

function selectModule(moduleId) {
  chatStore.setModule(moduleId)
  router.push(`/chat/${moduleId}`)
  isOpen.value = false
}
</script>

<template>
  <!-- Mobile Menu Button -->
  <button class="mobile-menu-btn" @click="isOpen = !isOpen">
    <span class="menu-icon">{{ isOpen ? '✕' : '☰' }}</span>
    <span class="menu-text">{{ chatStore.modules.find(m => m.id === chatStore.currentModule)?.name || '功能' }}</span>
  </button>

  <!-- Mobile Menu Overlay -->
  <div class="mobile-menu-overlay" :class="{ open: isOpen }" @click="isOpen = false"></div>

  <!-- Mobile Menu -->
  <div class="mobile-menu" :class="{ open: isOpen }">
    <div class="mobile-menu-header">
      <span>选择功能</span>
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
        <span class="module-name">{{ module.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  padding: 12px 24px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 30px;
  color: #1a1a2e;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);
  gap: 8px;
  align-items: center;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
}

.menu-icon {
  font-size: 18px;
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
  max-height: 70vh;
  background: #1a1a2e;
  border-radius: 20px 20px 0 0;
  z-index: 101;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  overflow: hidden;
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
  padding: 16px;
  overflow-y: auto;
  max-height: 60vh;
}

.mobile-module-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-module-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-module-item.active {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.mobile-module-item .module-icon {
  font-size: 22px;
}

.mobile-module-item .module-name {
  font-size: 16px;
  color: #fff;
}
</style>
