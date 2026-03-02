<script setup>
import { ref, nextTick, watch } from 'vue'
import { useLanguageStore, supportedLanguages, getLanguageByCode, t, detectSystemLanguage } from '../i18n'

const emit = defineEmits(['close'])
const languageStore = useLanguageStore()

const isOpen = ref(false)
const listRef = ref(null)

function selectLanguage(code) {
  languageStore.setLanguage(code)
  isOpen.value = false
  emit('close')
}

// 重置为系统语言
function resetToSystemLanguage() {
  const systemLang = detectSystemLanguage()
  languageStore.setLanguage(systemLang)
  isOpen.value = false
  emit('close')
}

// 打开时确保滚动到顶部
async function openDropdown() {
  isOpen.value = true
  await nextTick()
  if (listRef.value) {
    listRef.value.scrollTop = 0
  }
}

function getCurrentLangInfo() {
  return getLanguageByCode(languageStore.currentLanguage)
}
</script>

<template>
  <div class="language-selector">
    <!-- 当前语言显示 -->
    <button class="language-btn" @click="openDropdown">
      <span class="lang-flag">{{ getCurrentLangInfo().flag }}</span>
      <span class="lang-name">{{ getCurrentLangInfo().nativeName }}</span>
      <span class="lang-arrow">▼</span>
    </button>
    
    <!-- 语言列表弹窗 -->
    <Transition name="fade">
      <div v-if="isOpen" class="language-dropdown">
        <div class="dropdown-header">
          <span>{{ t('language.title', languageStore.currentLanguage) }}</span>
          <button class="close-btn" @click="isOpen = false">✕</button>
        </div>
        
        <!-- 重置为系统语言按钮 -->
        <div class="system-lang-reset">
          <button class="reset-btn" @click="resetToSystemLanguage">
            <span class="reset-icon">🔄</span>
            <span>{{ t('language.switch', languageStore.currentLanguage) }}</span>
          </button>
        </div>
        
        <div class="language-list" ref="listRef">
          <button 
            v-for="lang in supportedLanguages" 
            :key="lang.code"
            class="language-option"
            :class="{ active: languageStore.currentLanguage === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <span class="option-flag">{{ lang.flag }}</span>
            <span class="option-name">{{ lang.nativeName }}</span>
            <span v-if="languageStore.currentLanguage === lang.code" class="check-icon">✓</span>
          </button>
        </div>
      </div>
    </Transition>
    
    <!-- 点击遮罩关闭 -->
    <div v-if="isOpen" class="overlay" @click="isOpen = false"></div>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.language-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.lang-flag {
  font-size: 16px;
}

.lang-arrow {
  font-size: 10px;
  opacity: 0.6;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 280px;
  max-height: 400px;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: #fff;
  font-size: 14px;
}

.system-lang-reset {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 10px;
  color: #fbbf24;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.5);
}

.reset-icon {
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #fff;
}

.language-list {
  padding: 8px;
  max-height: 340px;
  overflow-y: auto;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.language-option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.language-option.active {
  background: rgba(251, 191, 36, 0.15);
}

.option-flag {
  font-size: 20px;
}

.option-name {
  flex: 1;
  font-size: 14px;
}

.check-icon {
  color: #fbbf24;
  font-weight: bold;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .language-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 360px;
    max-height: 80vh;
    border-radius: 20px;
  }
  
  .dropdown-header {
    flex-shrink: 0;
    padding: 16px 20px;
  }
  
  .system-lang-reset {
    padding: 12px 16px;
  }
  
  .language-list {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    max-height: 55vh;
    padding: 8px 12px 20px;
  }
  
  .language-option {
    padding: 16px 20px;
  }
  
  .overlay {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
  }
}
</style>
