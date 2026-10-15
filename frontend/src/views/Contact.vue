<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore, t } from '../i18n'
import { getWechatId, getWechatQR } from '../config'

const languageStore = useLanguageStore()
const lang = computed(() => languageStore.currentLanguage)
const WECHAT_ID = getWechatId()
const WECHAT_QR = getWechatQR()

const showCopied = ref(false)

function copyWechat() {
  // Clipboard API
  if (navigator.clipboard) {
    navigator.clipboard.writeText(WECHAT_ID).then(() => {
      showCopied.value = true
      setTimeout(() => { showCopied.value = false }, 2000)
    }).catch(() => {
      fallbackCopy()
    })
  } else {
    fallbackCopy()
  }
}

function fallbackCopy() {
  const input = document.createElement('input')
  input.value = WECHAT_ID
  document.body.appendChild(input)
  input.select()
  try {
    document.execCommand('copy')
    showCopied.value = true
    setTimeout(() => { showCopied.value = false }, 2000)
  } catch (e) {
    console.error('Copy failed:', e)
  }
  document.body.removeChild(input)
}

const contactMethods = computed(() => {
  const list = [
    {
      icon: '💬',
      title: t('contact.wechatTitle', lang.value),
      desc: t('contact.wechatDesc', lang.value),
      value: WECHAT_ID,
      action: 'copy'
    },
    {
      icon: '📧',
      title: t('contact.emailTitle', lang.value),
      desc: t('contact.emailDesc', lang.value),
      value: 'support@zhiji.ai',
      action: 'mailto'
    }
  ]
  return list
})
</script>

<template>
  <div class="contact-page">
    <header class="contact-header">
      <button class="back-btn" @click="$router.push('/')">
        <span>←</span> {{ t('contact.backHome', lang) }}
      </button>
      <h1 class="contact-title">💬 {{ t('contact.title', lang) }}</h1>
      <p class="contact-subtitle">{{ t('contact.subtitle', lang) }}</p>
    </header>

    <div class="contact-content">
      <!-- 主要客服方式 -->
      <section class="wechat-section">
        <div class="wechat-card">
          <div class="wechat-icon">💬</div>
          <h2 class="wechat-name">WeChat</h2>
          <p class="wechat-label">{{ t('contact.scanQR', lang) }}</p>

          <div class="qr-box">
            <img v-if="WECHAT_QR" :src="WECHAT_QR" alt="WeChat QR" class="qr-image" />
            <div v-else class="qr-placeholder">
              <div class="qr-icon">📱</div>
            </div>
          </div>

          <p class="wechat-id-label">{{ t('contact.wechatId', lang) }}</p>
          <div class="wechat-id-row">
            <code class="wechat-id">{{ WECHAT_ID }}</code>
            <button class="copy-btn" @click="copyWechat">
              <span v-if="!showCopied">📋</span>
              <span v-else>✓</span>
              {{ showCopied ? t('contact.copied', lang) : t('contact.copy', lang) }}
            </button>
          </div>
        </div>
      </section>

      <!-- 其他联系方式 -->
      <section class="methods-section">
        <h3 class="methods-title">{{ t('contact.otherMethods', lang) }}</h3>
        <div class="methods-list">
          <div v-for="m in contactMethods" :key="m.title" class="method-card">
            <span class="method-icon">{{ m.icon }}</span>
            <div class="method-content">
              <h4 class="method-name">{{ m.title }}</h4>
              <p class="method-desc">{{ m.desc }}</p>
              <a v-if="m.action === 'mailto'" :href="`mailto:${m.value}`" class="method-value">{{ m.value }}</a>
              <code v-else class="method-value">{{ m.value }}</code>
            </div>
          </div>
        </div>
      </section>

      <!-- 常见问题 -->
      <section class="faq-section">
        <h3 class="methods-title">{{ t('contact.faq', lang) }}</h3>
        <details class="faq-item">
          <summary class="faq-question">📌 {{ t('contact.faq1Q', lang) }}</summary>
          <p class="faq-answer">{{ t('contact.faq1A', lang) }}</p>
        </details>
        <details class="faq-item">
          <summary class="faq-question">💎 {{ t('contact.faq2Q', lang) }}</summary>
          <p class="faq-answer">{{ t('contact.faq2A', lang) }}</p>
        </details>
        <details class="faq-item">
          <summary class="faq-question">↩️ {{ t('contact.faq3Q', lang) }}</summary>
          <p class="faq-answer">{{ t('contact.faq3A', lang) }}</p>
        </details>
        <details class="faq-item">
          <summary class="faq-question">🌐 {{ t('contact.faq4Q', lang) }}</summary>
          <p class="faq-answer">{{ t('contact.faq4A', lang) }}</p>
        </details>
      </section>

      <!-- 工作时间 -->
      <section class="hours-section">
        <p class="hours-title">⏰ {{ t('contact.businessHours', lang) }}</p>
        <p class="hours-text">{{ t('contact.hoursDetail', lang) }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
  color: #fff;
  padding-bottom: 60px;
}

.contact-header {
  position: relative;
  text-align: center;
  padding: 40px 20px 20px;
}
.back-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  cursor: pointer;
}
.back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.contact-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #fbbf24 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}
.contact-subtitle { color: rgba(255,255,255,0.5); font-size: 14px; }

.contact-content { max-width: 600px; margin: 0 auto; padding: 0 20px; }

/* WeChat */
.wechat-section { margin-bottom: 32px; }
.wechat-card {
  background: linear-gradient(145deg, rgba(34,197,94,0.1) 0%, rgba(16,185,129,0.05) 100%);
  border: 1px solid rgba(34,197,94,0.3);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
}
.wechat-icon {
  font-size: 56px;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 12px rgba(34,197,94,0.4));
}
.wechat-name {
  font-size: 24px;
  font-weight: 700;
  color: #22c55e;
  margin-bottom: 8px;
}
.wechat-label { color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 20px; }

.qr-box {
  display: inline-block;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;
}
.qr-image { display: block; width: 200px; height: 200px; }
.qr-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
}
.qr-icon { font-size: 80px; }

.wechat-id-label { color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 8px; }
.wechat-id-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.wechat-id {
  font-family: 'Menlo', monospace;
  font-size: 16px;
  font-weight: 600;
  color: #fbbf24;
  background: rgba(255,255,255,0.05);
  padding: 8px 12px;
  border-radius: 8px;
}
.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(34,197,94,0.15);
  border: 1px solid rgba(34,197,94,0.3);
  border-radius: 8px;
  color: #22c55e;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.copy-btn:hover { background: rgba(34,197,94,0.25); }

/* Methods */
.methods-section { margin-bottom: 32px; }
.methods-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  margin-bottom: 12px;
}
.methods-list { display: flex; flex-direction: column; gap: 8px; }
.method-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
}
.method-icon { font-size: 24px; }
.method-content { flex: 1; }
.method-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.method-desc { color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 6px; }
.method-value {
  font-size: 13px;
  color: #fbbf24;
  text-decoration: none;
}
a.method-value:hover { text-decoration: underline; }

/* FAQ */
.faq-section { margin-bottom: 32px; }
.faq-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  margin-bottom: 8px;
  overflow: hidden;
}
.faq-question {
  padding: 14px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #fff;
  list-style: none;
  position: relative;
}
.faq-question::after {
  content: '+';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: #fbbf24;
  transition: transform 0.2s;
}
.faq-item[open] .faq-question::after { content: '−'; }
.faq-answer {
  padding: 0 16px 16px;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}

/* Hours */
.hours-section {
  text-align: center;
  padding: 20px;
  background: rgba(255,255,255,0.03);
  border: 1px dashed rgba(255,255,255,0.1);
  border-radius: 16px;
}
.hours-title { color: #fbbf24; font-size: 14px; font-weight: 500; margin-bottom: 6px; }
.hours-text { color: rgba(255,255,255,0.5); font-size: 12px; }

@media (max-width: 600px) {
  .back-btn { position: static; margin-bottom: 16px; }
  .qr-image, .qr-placeholder { width: 160px; height: 160px; }
  .qr-icon { font-size: 60px; }
}
</style>
