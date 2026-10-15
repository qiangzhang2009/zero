<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '../i18n'
import { tLegal } from '../i18n/legal'

const router = useRouter()
const languageStore = useLanguageStore()
const currentLang = computed(() => languageStore.currentLanguage)
const t = (key) => tLegal(key, currentLang.value)

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="privacy-page">
    <!-- Header -->
    <header class="privacy-header">
      <button class="back-btn" @click="goHome">
        <span>←</span> {{ t('privacy.backHome') }}
      </button>
      <h1 class="privacy-title">{{ t('privacy.title') }}</h1>
      <p class="privacy-updated">{{ t('privacy.lastUpdated') }}</p>
    </header>

    <!-- Content -->
    <article class="privacy-content">
      <p class="intro">{{ t('privacy.intro') }}</p>

      <section class="policy-section">
        <h2>{{ t('privacy.section1Title') }}</h2>
        <p>{{ t('privacy.section1Content') }}</p>
      </section>

      <section class="policy-section">
        <h2>{{ t('privacy.section2Title') }}</h2>
        <p>{{ t('privacy.section2Content') }}</p>
      </section>

      <section class="policy-section">
        <h2>{{ t('privacy.section3Title') }}</h2>
        <p>{{ t('privacy.section3Content') }}</p>
      </section>

      <section class="policy-section">
        <h2>{{ t('privacy.section4Title') }}</h2>
        <p>{{ t('privacy.section4Content') }}</p>
      </section>

      <section class="policy-section">
        <h2>{{ t('privacy.section5Title') }}</h2>
        <p>{{ t('privacy.section5Content') }}</p>
      </section>

      <section class="policy-section">
        <h2>{{ t('privacy.section6Title') }}</h2>
        <p>{{ t('privacy.section6Content') }}</p>
      </section>

      <section class="policy-section">
        <h2>{{ t('privacy.section7Title') }}</h2>
        <p>{{ t('privacy.section7Content') }}</p>
      </section>

      <section class="policy-section">
        <h2>{{ t('privacy.section8Title') }}</h2>
        <p>{{ t('privacy.section8Content') }}</p>
      </section>
    </article>

    <!-- Footer -->
    <footer class="privacy-footer">
      <button class="back-bottom-btn" @click="goHome">{{ t('privacy.backHome') }}</button>
    </footer>
  </div>
</template>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
  padding: 40px 20px 60px;
}

.privacy-header {
  max-width: 800px;
  margin: 0 auto 40px;
  text-align: center;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.privacy-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #fbbf24 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.privacy-updated {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.privacy-content {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px;
}

.intro {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.policy-section {
  margin-bottom: 28px;
}

.policy-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 10px;
}

.policy-section p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.8;
}

.privacy-footer {
  max-width: 800px;
  margin: 32px auto 0;
  text-align: center;
}

.back-bottom-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 24px;
  color: #1a1a2e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-bottom-btn:hover {
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .privacy-title {
    font-size: 24px;
  }
  .privacy-content {
    padding: 24px 20px;
  }
  .policy-section h2 {
    font-size: 16px;
  }
  .policy-section p {
    font-size: 13px;
  }
}
</style>
