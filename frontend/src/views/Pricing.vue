<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '../i18n'
import { useUsageStore } from '../stores/usage'

const router = useRouter()
const languageStore = useLanguageStore()
const usageStore = useUsageStore()

const currentLang = languageStore.currentLanguage
const t = (key) => {
  const translations = {
    'zh-CN': {
      title: '选择您的专属套餐',
      subtitle: '解锁更多智慧，开启命途新篇章',
      free: '免费版',
      freePrice: '¥0',
      freePer: '永久免费',
      basic: '基础版',
      basicPrice: '¥29',
      basicPer: '/月',
      pro: '专业版',
      proPrice: '¥99',
      proPer: '/月',
      dailyLimit: '每日对话',
      times: '次',
      unlimited: '无限次',
      features1: '19大命理模块全解锁',
      features2: '历史记录云端同步',
      features3: '优先AI响应',
      features4: '专属客服支持',
      current: '当前方案',
      upgrade: '立即升级',
      contact: '联系升级',
      features: '功能对比',
      featureAll: '全部命理模块',
      featureCloud: '历史云同步',
      featurePriority: '优先AI响应',
      featureSupport: '专属客服',
      daily_chat: '每日对话次数',
      consultTitle: '升级咨询',
      consultDesc: '扫码添加客服微信，获取专属优惠',
      wechatNote: '转账备注您的账号即可开通',
      backHome: '返回首页',
      wechatTitle: '添加客服微信',
      wechatDesc: '扫码联系客服，转账后为您充值',
      copyWechat: '复制微信号'
    },
    'en': {
      title: 'Choose Your Plan',
      subtitle: 'Unlock more wisdom, start a new chapter',
      free: 'Free',
      freePrice: '$0',
      freePer: 'Forever free',
      basic: 'Basic',
      basicPrice: '$9',
      basicPer: '/month',
      pro: 'Professional',
      proPrice: '$29',
      proPer: '/month',
      dailyLimit: 'Daily chats',
      times: '',
      unlimited: 'Unlimited',
      features1: 'All 19 fortune modules',
      features2: 'Cloud sync history',
      features3: 'Priority AI response',
      features4: 'Dedicated support',
      current: 'Current Plan',
      upgrade: 'Upgrade Now',
      contact: 'Contact to Upgrade',
      features: 'Features',
      featureAll: 'All modules',
      featureCloud: 'Cloud sync',
      featurePriority: 'Priority AI',
      featureSupport: 'Dedicated support',
      daily_chat: 'Daily messages',
      consultTitle: 'Upgrade Consultation',
      consultDesc: 'Scan to add WeChat support',
      wechatNote: 'Note your account when transferring',
      backHome: 'Back to Home'
    },
    'ja': {
      title: 'プランを選択',
      subtitle: '更なる智慧を解き放ち、新しい扉をを開こう',
      free: '無料版',
      freePrice: '¥0',
      freePer: '永久無料',
      basic: '基本版',
      basicPrice: '¥1400',
      basicPer: '/月',
      pro: 'プロ版',
      proPrice: '¥4500',
      proPer: '/月',
      dailyLimit: '每日チャット',
      times: '回',
      unlimited: '無制限',
      features1: '全19モジュール',
      features2: 'クラウド同期',
      features3: '優先AI応答',
      features4: '専用サポート',
      current: '現在のプラン',
      upgrade: 'アップグレード',
      contact: 'アップグレード連絡',
      features: '機能比較',
      featureAll: '全モジュール',
      featureCloud: 'クラウド同期',
      featurePriority: '優先AI',
      featureSupport: '専用サポート',
      daily_chat: '每日メッセージ',
      consultTitle: 'アップグレード相談',
      consultDesc: 'WeChatサポートをスキャン',
      wechatNote: '送金時にアカウントを記入',
      backHome: 'ホームに戻る'
    }
  }
  const lang = currentLang
  return translations[lang]?.[key] || translations['zh-CN'][key] || key
}

const showContact = ref(false)
const WECHAT_ID = '3740977'

function openContact() {
  showContact.value = true
}

function closeContact() {
  showContact.value = false
}

function goHome() {
  router.push('/')
}

const plans = [
  {
    key: 'free',
    icon: '🌱',
    color: 'from-slate-500 to-slate-600',
    borderColor: 'rgba(255,255,255,0.1)',
    highlight: false
  },
  {
    key: 'basic',
    icon: '⭐',
    color: 'from-amber-500 to-orange-500',
    borderColor: 'rgba(251,191,36,0.3)',
    highlight: true
  },
  {
    key: 'pro',
    icon: '👑',
    color: 'from-purple-500 to-violet-600',
    borderColor: 'rgba(168,85,247,0.3)',
    highlight: false
  }
]

const featureList = [
  { key: 'featureAll', icon: '📚' },
  { key: 'featureCloud', icon: '☁️' },
  { key: 'featurePriority', icon: '⚡' },
  { key: 'featureSupport', icon: '💎' }
]

function isCurrentPlan(key) {
  if (key === 'free') return true
  return false
}
</script>

<template>
  <div class="pricing-page">
    <!-- Header -->
    <header class="pricing-header">
      <div class="header-bg">
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
      </div>
      <button class="back-btn" @click="goHome">
        <span>←</span> {{ t('backHome') }}
      </button>
      <div class="header-content">
        <h1 class="pricing-title">{{ t('title') }}</h1>
        <p class="pricing-subtitle">{{ t('subtitle') }}</p>
      </div>
    </header>

    <!-- Plans -->
    <section class="plans-section">
      <div class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.key"
          class="plan-card"
          :class="[plan.color, { 'plan-highlight': plan.highlight }]"
          :style="{ borderColor: plan.borderColor }"
        >
          <div v-if="plan.highlight" class="popular-badge">推荐</div>

          <div class="plan-icon">{{ plan.icon }}</div>
          <h3 class="plan-name">{{ t(plan.key) }}</h3>

          <div class="plan-price">
            <span class="price-num">{{ t(plan.key + 'Price') }}</span>
            <span class="price-per">{{ t(plan.key + 'Per') }}</span>
          </div>

          <div class="plan-daily">
            <span class="daily-label">{{ t('dailyLimit') }}</span>
            <span class="daily-value">
              {{ plan.key === 'pro' ? t('unlimited') : (plan.key === 'free' ? '20' : '100') + t('times') }}
            </span>
          </div>

          <ul class="plan-features">
            <li v-for="feature in featureList" :key="feature.key">
              <span class="feature-icon">{{ feature.icon }}</span>
              <span class="feature-text">{{ t(feature.key) }}</span>
              <span class="feature-check" v-if="plan.key === 'basic' || plan.key === 'pro'">✓</span>
              <span class="feature-check limited" v-else-if="feature.key === 'featureAll'">✓</span>
              <span class="feature-check" v-else>—</span>
            </li>
          </ul>

          <div class="plan-action">
            <div v-if="isCurrentPlan(plan.key)" class="current-badge">
              {{ t('current') }}
            </div>
            <button
              v-else
              class="upgrade-btn"
              :class="{ 'upgrade-btn-highlight': plan.highlight }"
              @click="openContact"
            >
              {{ plan.key === 'free' ? t('contact') : t('upgrade') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Table -->
    <section class="feature-section">
      <h2 class="section-title">
        <span class="title-icon">✦</span>
        {{ t('features') }}
        <span class="title-icon">✦</span>
      </h2>
      <div class="feature-table">
        <div class="table-header">
          <div class="table-cell"></div>
          <div class="table-cell">🌱 {{ t('free') }}</div>
          <div class="table-cell highlight-cell">⭐ {{ t('basic') }}</div>
          <div class="table-cell">👑 {{ t('pro') }}</div>
        </div>
        <div class="table-row" v-for="feature in featureList" :key="feature.key">
          <div class="table-cell label-cell">
            <span class="feature-icon">{{ feature.icon }}</span>
            {{ t(feature.key) }}
          </div>
          <div class="table-cell">✓</div>
          <div class="table-cell highlight-cell">✓</div>
          <div class="table-cell">✓</div>
        </div>
        <div class="table-row">
          <div class="table-cell label-cell">
            <span class="feature-icon">💬</span>
            {{ t('daily_chat') }}
          </div>
          <div class="table-cell">20</div>
          <div class="table-cell highlight-cell">100</div>
          <div class="table-cell">{{ t('unlimited') }}</div>
        </div>
      </div>
    </section>

    <!-- Contact Modal -->
    <div v-if="showContact" class="modal-overlay" @click.self="closeContact">
      <div class="contact-modal">
        <button class="modal-close" @click="closeContact">×</button>
        <div class="modal-icon">💬</div>
        <h3 class="modal-title">{{ t('consultTitle') }}</h3>
        <p class="modal-desc">{{ t('consultDesc') }}</p>
        <div class="qr-placeholder">
          <div class="qr-box">
            <div class="qr-icon">📱</div>
            <p class="qr-text">微信号</p>
            <p class="qr-hint">{{ WECHAT_ID }}</p>
          </div>
        </div>
        <p class="modal-note">{{ t('wechatNote') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pricing-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
  padding-bottom: 60px;
}

/* Header */
.pricing-header {
  position: relative;
  text-align: center;
  padding: 60px 20px 40px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.bg-orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  top: -100px;
  left: -50px;
}

.bg-orb-2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  top: -50px;
  right: -80px;
}

.back-btn {
  position: relative;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 30px;
}

.back-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.header-content {
  position: relative;
  z-index: 1;
}

.pricing-title {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #fbbf24 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.pricing-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.6);
}

/* Plans */
.plans-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 900px) {
  .plans-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
}

.plan-card {
  position: relative;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.plan-highlight {
  background: linear-gradient(145deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 100%);
  border: 2px solid rgba(251,191,36,0.4);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a1a2e;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 20px;
  border-radius: 20px;
}

.plan-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.plan-name {
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
}

.plan-price {
  margin-bottom: 12px;
}

.price-num {
  font-size: 42px;
  font-weight: 700;
  color: #fff;
}

.price-per {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
}

.plan-daily {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
}

.daily-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.daily-value {
  font-size: 18px;
  font-weight: 600;
  color: #fbbf24;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  text-align: left;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}

.plan-features li:last-child {
  border-bottom: none;
}

.feature-icon {
  font-size: 16px;
}

.feature-text {
  flex: 1;
}

.feature-check {
  color: #34d399;
  font-weight: bold;
}

.feature-check.limited {
  color: #34d399;
}

.plan-action {
  margin-top: auto;
}

.current-badge {
  display: inline-block;
  padding: 12px 28px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  color: rgba(255,255,255,0.5);
  font-size: 14px;
}

.upgrade-btn {
  width: 100%;
  padding: 14px 24px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 24px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.upgrade-btn:hover {
  background: rgba(255,255,255,0.2);
}

.upgrade-btn-highlight {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #1a1a2e;
}

.upgrade-btn-highlight:hover {
  box-shadow: 0 8px 24px rgba(251,191,36,0.4);
}

/* Feature Table */
.feature-section {
  max-width: 800px;
  margin: 60px auto 0;
  padding: 0 20px;
}

.section-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 32px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.title-icon {
  color: #fbbf24;
  font-size: 18px;
}

.feature-table {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  overflow: hidden;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
}

.table-header {
  background: rgba(255,255,255,0.03);
  font-weight: 600;
  font-size: 14px;
}

.table-row {
  border-top: 1px solid rgba(255,255,255,0.05);
  font-size: 14px;
}

.table-cell {
  padding: 16px;
  text-align: center;
  color: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.highlight-cell {
  background: rgba(251,191,36,0.05);
  color: #fbbf24;
}

.label-cell {
  justify-content: flex-start;
  font-weight: 500;
  color: rgba(255,255,255,0.9);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.contact-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
  border: 1px solid rgba(251,191,36,0.2);
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
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
  color: rgba(255,255,255,0.5);
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
  font-size: 56px;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.modal-desc {
  color: rgba(255,255,255,0.7);
  font-size: 15px;
  margin-bottom: 24px;
}

.qr-placeholder {
  margin-bottom: 20px;
}

.qr-box {
  background: rgba(255,255,255,0.05);
  border: 2px dashed rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 32px;
  display: inline-block;
}

.qr-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.qr-text {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  margin-bottom: 8px;
}

.qr-hint {
  color: #fbbf24;
  font-size: 16px;
  font-weight: 600;
}

.modal-note {
  color: rgba(255,255,255,0.5);
  font-size: 13px;
}

/* Responsive */
@media (max-width: 600px) {
  .pricing-title {
    font-size: 28px;
  }

  .plan-card {
    padding: 24px 20px;
  }

  .price-num {
    font-size: 36px;
  }

  .feature-table {
    font-size: 12px;
  }

  .table-cell {
    padding: 12px 8px;
  }
}
</style>
