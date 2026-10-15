<template>
  <div v-if="visible" class="age-gate-overlay" @click.self="onBlockClick">
    <div class="age-gate-modal">
      <div class="age-gate-icon">🔞</div>
      <h2 class="age-gate-title">{{ title }}</h2>
      <p class="age-gate-message">{{ message }}</p>

      <div class="age-gate-buttons">
        <button class="age-btn age-btn-confirm" @click="confirm">
          <span class="age-btn-icon">✓</span>
          {{ confirmText }}
        </button>
        <button class="age-btn age-btn-reject" @click="reject">
          <span class="age-btn-icon">✕</span>
          {{ rejectText }}
        </button>
      </div>

      <p class="age-gate-terms">
        <span class="age-terms-icon">📜</span>
        {{ termsText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore, t } from '../i18n'

const emit = defineEmits(['confirmed', 'rejected'])

const languageStore = useLanguageStore()
const lang = computed(() => languageStore.currentLanguage)

const title = computed(() => t('ageVerify.title', lang.value))
const message = computed(() => t('ageVerify.message', lang.value))
const confirmText = computed(() => t('ageVerify.confirm', lang.value))
const rejectText = computed(() => t('ageVerify.reject', lang.value))
const termsText = computed(() => t('ageVerify.terms', lang.value))

const visible = ref(false)
const STORAGE_KEY = 'zhiJi_age_verified'

onMounted(() => {
  // 检查是否已经验证过
  const verified = localStorage.getItem(STORAGE_KEY)
  if (!verified) {
    // 延迟显示避免页面闪烁
    setTimeout(() => {
      visible.value = true
    }, 500)
  } else {
    // 已经验证过
    emit('confirmed')
  }
})

function confirm() {
  localStorage.setItem(STORAGE_KEY, 'true')
  visible.value = false
  emit('confirmed')
}

function reject() {
  visible.value = false
  emit('rejected')
}

function onBlockClick() {
  // 阻止点击遮罩关闭
}
</script>

<style scoped>
.age-gate-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(20px);
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.age-gate-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 440px;
  width: 90%;
  text-align: center;
  border: 1px solid rgba(251,191,36,0.3);
  box-shadow: 0 30px 80px rgba(0,0,0,0.7);
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.age-gate-icon {
  font-size: 72px;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 12px rgba(251,191,36,0.4));
}

.age-gate-title {
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
}

.age-gate-message {
  color: rgba(255,255,255,0.8);
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 32px;
}

.age-gate-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.age-btn {
  flex: 1;
  padding: 14px 20px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.age-btn-confirm {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #1a1a2e;
}
.age-btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251,191,36,0.4);
}

.age-btn-reject {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
}
.age-btn-reject:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.age-btn-icon { font-size: 16px; }

.age-gate-terms {
  color: rgba(255,255,255,0.4);
  font-size: 11px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.age-terms-icon { font-size: 12px; }

@media (max-width: 600px) {
  .age-gate-modal { padding: 32px 24px; }
  .age-gate-title { font-size: 22px; }
  .age-gate-message { font-size: 14px; }
  .age-gate-icon { font-size: 56px; }
}
</style>
