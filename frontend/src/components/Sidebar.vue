<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const searchQuery = ref('')
const hoveredModule = ref(null)

const filteredModules = computed(() => {
  if (!searchQuery.value) return chatStore.modules
  return chatStore.modules.filter(m => 
    m.name.includes(searchQuery.value) || m.description.includes(searchQuery.value)
  )
})

function selectModule(moduleId) {
  chatStore.setModule(moduleId)
  router.push(`/chat/${moduleId}`)
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar-open': true }">
    <div class="sidebar-header">
      <h2 class="sidebar-title">
        <span class="title-icon">✦</span>
        功能
      </h2>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索..." 
        class="search-input"
      />
    </div>
    <nav class="module-list">
      <div 
        v-for="module in filteredModules" 
        :key="module.id"
        class="module-item"
        :class="{ active: chatStore.currentModule === module.id }"
        @click="selectModule(module.id)"
        @mouseenter="hoveredModule = module.id"
        @mouseleave="hoveredModule = null"
      >
        <span class="module-icon">{{ module.icon }}</span>
        <div class="module-info">
          <span class="module-name">{{ module.name }}</span>
          <span class="module-desc">{{ module.description }}</span>
        </div>
        <transition name="slide">
          <span v-if="chatStore.currentModule === module.id" class="active-indicator">→</span>
        </transition>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="brand-mini">
        <img src="/logo.png" alt="知几" class="footer-logo" />
        <span>知几 © 2026</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: rgba(26, 26, 46, 0.85);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.sidebar-header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #fbbf24;
  font-size: 12px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 13px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.module-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
}

.module-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 4px;
}

.module-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.module-item.active {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.module-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: linear-gradient(180deg, #fbbf24, #f59e0b);
  border-radius: 0 2px 2px 0;
}

.module-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.module-info {
  flex: 1;
  min-width: 0;
}

.module-name {
  display: block;
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  margin-bottom: 2px;
}

.module-desc {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-indicator {
  color: #fbbf24;
  font-size: 14px;
  flex-shrink: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-5px);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.brand-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.footer-logo {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
