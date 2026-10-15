<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '../i18n'
import { tLegal } from '../i18n/legal'

const languageStore = useLanguageStore()
const currentLang = computed(() => languageStore.currentLanguage)

const props = defineProps({
  variant: {
    type: String,
    default: 'modal', // 'modal' | 'footer' | 'inline'
    validator: (v) => ['modal', 'footer', 'inline'].includes(v),
  },
  showOnMount: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'accept'])

const showModal = ref(false)
const showDetails = ref(false)
const hasAgreed = ref(false)

const t = (key) => tLegal(key, currentLang.value)

onMounted(() => {
  if (props.showOnMount) {
    const agreed = localStorage.getItem('zhiJi_disclaimer_agreed')
    if (!agreed) {
      setTimeout(() => {
        showModal.value = true
      }, 500)
    }
  }
})

function accept() {
  localStorage.setItem('zhiJi_disclaimer_agreed', JSON.stringify({
    lang: currentLang.value,
    timestamp: new Date().toISOString(),
  }))
  hasAgreed.value = true
  showModal.value = false
  emit('accept')
}

function close() {
  showModal.value = false
  emit('close')
}

function openDetails() {
  showDetails.value = true
}
</script>

<template>
  <!-- Modal Variant: 全屏免责弹窗 -->
  <div v-if="variant === 'modal' && showModal" class="disclaimer-overlay" @click.self="close">
    <div class="disclaimer-modal">
      <button class="modal-close" @click="close">×</button>
      <div class="modal-icon">⚠️</div>
      <h2 class="modal-title">{{ t('disclaimer.full.title') }}</h2>
      <p class="modal-intro">{{ t('disclaimer.full.intro') }}</p>
      <div class="disclaimer-sections">
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section1Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section1Text') }}</p>
        </div>
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section2Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section2Text') }}</p>
        </div>
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section3Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section3Text') }}</p>
        </div>
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section4Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section4Text') }}</p>
        </div>
      </div>
      <label class="agree-check">
        <input type="checkbox" v-model="hasAgreed" />
        <span>{{ t('disclaimer.full.agree') }}</span>
      </label>
      <button
        class="continue-btn"
        :disabled="!hasAgreed"
        @click="accept"
      >
        {{ t('disclaimer.full.continue') }}
      </button>
    </div>
  </div>

  <!-- Footer Variant: 首页底部条 -->
  <div v-else-if="variant === 'footer'" class="disclaimer-footer">
    <div class="footer-content">
      <span class="footer-icon">⚠️</span>
      <span class="footer-text">{{ t('disclaimer.short') }}</span>
      <button class="footer-link" @click="openDetails">{{ t('cookie.learnMore') }}</button>
    </div>
  </div>

  <!-- Inline Variant: 简短内联条 -->
  <div v-else-if="variant === 'inline'" class="disclaimer-inline">
    <span class="inline-icon">⚠️</span>
    <span class="inline-text">{{ t('disclaimer.short') }}</span>
  </div>

  <!-- 详情弹窗 -->
  <div v-if="showDetails" class="disclaimer-overlay" @click.self="showDetails = false">
    <div class="disclaimer-modal">
      <button class="modal-close" @click="showDetails = false">×</button>
      <div class="modal-icon">⚠️</div>
      <h2 class="modal-title">{{ t('disclaimer.full.title') }}</h2>
      <p class="modal-intro">{{ t('disclaimer.full.intro') }}</p>
      <div class="disclaimer-sections">
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section1Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section1Text') }}</p>
        </div>
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section2Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section2Text') }}</p>
        </div>
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section3Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section3Text') }}</p>
        </div>
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section4Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section4Text') }}</p>
        </div>
        <div class="section">
          <h3 class="section-title">{{ t('disclaimer.full.section5Title') }}</h3>
          <p class="section-text">{{ t('disclaimer.full.section5Text') }}</p>
        </div>
      </div>
      <button class="continue-btn" @click="showDetails = false">{{ t('disclaimer.full.continue') }}</button>
    </div>
  </div>
</template>

<style scoped>
.disclaimer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.disclaimer-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  padding: 32px 28px;
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid rgba(251, 191, 36, 0.3);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-close {
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

.modal-close:hover {
  color: #fbbf24;
}

.modal-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin-bottom: 12px;
}

.modal-intro {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 20px;
}

.disclaimer-sections {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 14px 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 6px;
}

.section-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
}

.agree-check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.agree-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #fbbf24;
}

.continue-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 14px;
  color: #1a1a2e;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.continue-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.continue-btn:not(:disabled):hover {
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
  transform: translateY(-2px);
}

/* Footer variant */
.disclaimer-footer {
  background: rgba(251, 191, 36, 0.05);
  border-top: 1px solid rgba(251, 191, 36, 0.15);
  padding: 12px 20px;
  text-align: center;
  margin-top: 30px;
}

.footer-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-icon {
  font-size: 14px;
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.footer-link {
  background: none;
  border: none;
  color: #fbbf24;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-left: 4px;
}

.footer-link:hover {
  color: #f59e0b;
}

/* Inline variant */
.disclaimer-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.inline-icon {
  font-size: 14px;
}

/* Mobile responsive */
@media (max-width: 600px) {
  .disclaimer-modal {
    padding: 24px 20px;
  }
  .modal-title {
    font-size: 18px;
  }
  .modal-intro {
    font-size: 13px;
  }
  .section-title {
    font-size: 13px;
  }
  .section-text {
    font-size: 12px;
  }
}
</style>
