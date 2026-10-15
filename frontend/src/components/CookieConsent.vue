<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '../i18n'
import { tLegal } from '../i18n/legal'
import { useRouter } from 'vue-router'

const languageStore = useLanguageStore()
const router = useRouter()
const currentLang = computed(() => languageStore.currentLanguage)
const t = (key) => tLegal(key, currentLang.value)

const showBanner = ref(false)

onMounted(() => {
  // 延迟显示，避免与免责声明冲突
  setTimeout(() => {
    const consent = localStorage.getItem('zhiJi_cookie_consent')
    if (!consent) {
      showBanner.value = true
    }
  }, 1500)
})

function accept() {
  localStorage.setItem('zhiJi_cookie_consent', JSON.stringify({
    accepted: true,
    timestamp: new Date().toISOString(),
    lang: currentLang.value,
  }))
  showBanner.value = false
}

function reject() {
  localStorage.setItem('zhiJi_cookie_consent', JSON.stringify({
    accepted: false,
    timestamp: new Date().toISOString(),
    lang: currentLang.value,
  }))
  showBanner.value = false
}

function viewPrivacy() {
  router.push('/privacy')
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="showBanner" class="cookie-banner">
      <div class="cookie-content">
        <div class="cookie-icon">🍪</div>
        <div class="cookie-text">
          <h4 class="cookie-title">{{ t('cookie.title') }}</h4>
          <p class="cookie-message">{{ t('cookie.message') }}</p>
        </div>
        <div class="cookie-actions">
          <button class="btn-learn" @click="viewPrivacy">{{ t('cookie.learnMore') }}</button>
          <button class="btn-reject" @click="reject">{{ t('cookie.reject') }}</button>
          <button class="btn-accept" @click="accept">{{ t('cookie.accept') }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 8888;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-top: 1px solid rgba(251, 191, 36, 0.3);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
  padding: 16px 20px;
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.cookie-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.cookie-text {
  flex: 1;
  min-width: 0;
}

.cookie-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
}

.cookie-message {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
}

.cookie-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-learn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-learn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.btn-reject {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reject:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-accept {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #1a1a2e;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-accept:hover {
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  transform: translateY(-1px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

@media (max-width: 768px) {
  .cookie-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .cookie-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .cookie-icon {
    font-size: 28px;
  }
}
</style>
