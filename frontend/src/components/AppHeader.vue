<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '../i18n'
import LanguageSelector from './LanguageSelector.vue'

const router = useRouter()
const languageStore = useLanguageStore()
const isMenuOpen = ref(false)
</script>

<template>
  <header class="header-box">
    <div class="header">
      <div class="left" @click="router.push('/')">
        <img src="/logo.png" alt="知几" class="logo" />
        <span class="logo-text">{{ languageStore.t('appName') }}</span>
      </div>
      <div class="right">
        <!-- 语言选择器 -->
        <LanguageSelector />
        
        <div class="func-icon" @click="isMenuOpen = !isMenuOpen">
          <span class="menu-btn">☰</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-box {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.func-icon {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.func-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-btn {
  font-size: 20px;
  color: #fff;
}

@media (max-width: 768px) {
  .header {
    padding: 10px 12px;
  }
  
  .logo {
    width: 32px;
    height: 32px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .right {
    gap: 8px;
  }
  
  .func-icon {
    padding: 6px;
  }
  
  .menu-btn {
    font-size: 18px;
  }
}
</style>
