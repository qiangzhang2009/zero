<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore, t } from '../i18n'
import { useUsageStore } from '../stores/usage'
import { getApiUrl } from '../config'

const router = useRouter()
const languageStore = useLanguageStore()
const usageStore = useUsageStore()
const lang = computed(() => languageStore.currentLanguage)

const orders = ref([])
const membership = ref(null)
const isLoading = ref(true)
const loadError = ref(false)
const showCancelConfirm = ref(false)

const userId = computed(() => {
  let id = localStorage.getItem('zhiJi_user_id')
  if (!id) {
    id = 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
    localStorage.setItem('zhiJi_user_id', id)
  }
  return id
})

async function loadData() {
  isLoading.value = true
  loadError.value = false
  try {
    const [ordersRes, memRes] = await Promise.all([
      fetch(`${getApiUrl()}/payment/orders/${userId.value}`),
      fetch(`${getApiUrl()}/payment/membership/${userId.value}`)
    ])
    const ordersData = await ordersRes.json()
    const memData = await memRes.json()
    if (ordersData.success) orders.value = ordersData.data
    if (memData.success) membership.value = memData.data
  } catch (e) {
    console.error('Failed to load account data:', e)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
  await usageStore.syncPaidCreditsFromServer()
}

const tierNames = {
  basic: { 'zh-CN': '基础会员', 'en': 'Basic', 'ja': 'ベーシック', 'ko': '베이직' },
  premium: { 'zh-CN': '高级会员', 'en': 'Premium', 'ja': 'プレミアム', 'ko': '프리미엄' },
  pro: { 'zh-CN': '专业会员', 'en': 'Pro', 'ja': 'プロ', 'ko': '프로' }
}

const tierName = computed(() => {
  if (!membership.value) return ''
  const tier = membership.value.tier
  return tierNames[tier]?.[lang.value] || tier
})

const daysLeft = computed(() => {
  if (!membership.value) return 0
  const exp = new Date(membership.value.expiresAt).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((exp - now) / (24 * 60 * 60 * 1000)))
})

const statusBadge = computed(() => {
  if (!membership.value) return null
  if (daysLeft.value <= 0) {
    return { text: t('account.expired', lang.value), color: 'expired' }
  }
  if (daysLeft.value <= 3) {
    return { text: t('account.expiring', lang.value), color: 'warning' }
  }
  return { text: t('account.active', lang.value), color: 'active' }
})

const paidOrders = computed(() => orders.value.filter(o => o.status === 'paid'))
const refundedOrders = computed(() => orders.value.filter(o => o.status === 'refunded'))

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString(lang.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function formatAmount(order) {
  const symbols = { USD: '$', CNY: '¥', JPY: '¥', KRW: '₩' }
  const sym = symbols[order.currency] || (order.currency + ' ')
  return `${sym}${order.amount.toFixed(2)}`
}

function goToPricing() {
  router.push('/pricing')
}

function goHome() {
  router.push('/')
}

async function requestRefund(orderId) {
  if (!confirm(t('account.confirmRefund', lang.value))) return
  try {
    const res = await fetch(`${getApiUrl()}/payment/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    })
    const data = await res.json()
    if (data.success) {
      await loadData()
    } else {
      alert(t('account.refundFailed', lang.value) + ': ' + data.error)
    }
  } catch (e) {
    alert(t('account.refundFailed', lang.value) + ': ' + e.message)
  }
}

const isEligibleForRefund = (order) => {
  if (order.status !== 'paid') return false
  const paidAt = new Date(order.paidAt || order.createdAt).getTime()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return Date.now() - paidAt < sevenDays && (order.type === 'credit' || order.dailyCredits === -1)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="account-page">
    <!-- Header -->
    <header class="account-header">
      <button class="back-btn" @click="goHome">
        <span>←</span> {{ t('account.backHome', lang) }}
      </button>
      <h1 class="account-title">👤 {{ t('account.title', lang) }}</h1>
      <p class="account-subtitle">{{ t('account.subtitle', lang) }}</p>
    </header>

    <div v-if="isLoading" class="state-message">
      <div class="spinner"></div>
    </div>

    <div v-else class="account-content">
      <!-- 当前会员卡片 -->
      <section class="membership-card-section">
        <div v-if="membership" class="membership-card" :class="statusBadge?.color">
          <div class="card-glow"></div>
          <div class="card-tier">
            <span class="tier-label">{{ t('account.currentTier', lang) }}</span>
            <span class="tier-name">{{ tierName }}</span>
          </div>
          <div class="card-details">
            <div class="detail-row">
              <span class="detail-label">{{ t('account.status', lang) }}</span>
              <span class="detail-value" :class="statusBadge?.color">{{ statusBadge?.text }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('account.expires', lang) }}</span>
              <span class="detail-value">{{ formatDate(membership.expiresAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('account.dailyLimit', lang) }}</span>
              <span class="detail-value">
                <template v-if="membership.dailyCredits === -1">∞ {{ t('account.unlimited', lang) }}</template>
                <template v-else>{{ membership.dailyCredits }}</template>
              </span>
            </div>
          </div>
          <div v-if="daysLeft > 0 && daysLeft <= 3" class="card-warning">
            ⚠️ {{ t('account.renewReminder', lang) }}
          </div>
        </div>

        <div v-else class="no-membership-card">
          <div class="no-sub-icon">📋</div>
          <p class="no-sub-text">{{ t('account.noMembership', lang) }}</p>
          <button class="upgrade-cta" @click="goToPricing">
            💎 {{ t('account.viewPlans', lang) }}
          </button>
        </div>
      </section>

      <!-- 余额 / Credits -->
      <section class="credits-section">
        <h2 class="section-title">💰 {{ t('account.creditsBalance', lang) }}</h2>
        <div class="credits-card">
          <div class="credits-amount">{{ usageStore.paidCredits }}</div>
          <div class="credits-label">{{ t('account.credits', lang) }}</div>
          <p class="credits-desc">{{ t('account.creditsDesc', lang) }}</p>
        </div>
      </section>

      <!-- 订单历史 -->
      <section class="orders-section">
        <h2 class="section-title">📜 {{ t('account.orderHistory', lang) }}</h2>

        <div v-if="orders.length === 0" class="empty-orders">
          {{ t('account.noOrders', lang) }}
        </div>

        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card" :class="order.status">
            <div class="order-header">
              <div class="order-name">
                <span class="order-icon">{{ order.type === 'credit' ? '💎' : '👑' }}</span>
                {{ order.planName }}
              </div>
              <div class="order-status" :class="order.status">
                {{ order.status === 'paid' ? t('account.statusPaid', lang) :
                   order.status === 'pending' ? t('account.statusPending', lang) :
                   order.status === 'refunded' ? t('account.statusRefunded', lang) :
                   order.status }}
              </div>
            </div>
            <div class="order-body">
              <div class="order-info">
                <div class="info-row">
                  <span class="info-label">{{ t('account.amount', lang) }}</span>
                  <span class="info-value">{{ formatAmount(order) }}</span>
                </div>
                <div v-if="order.credits" class="info-row">
                  <span class="info-label">{{ t('account.credits', lang) }}</span>
                  <span class="info-value">{{ order.credits }}</span>
                </div>
                <div v-if="order.dailyCredits === -1" class="info-row">
                  <span class="info-label">{{ t('account.dailyLimit', lang) }}</span>
                  <span class="info-value">∞ {{ t('account.unlimited', lang) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ t('account.date', lang) }}</span>
                  <span class="info-value">{{ formatDate(order.paidAt || order.createdAt) }}</span>
                </div>
              </div>
              <button
                v-if="isEligibleForRefund(order)"
                class="refund-btn"
                @click="requestRefund(order.id)"
              >
                ↩ {{ t('account.requestRefund', lang) }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 升级 CTA -->
      <section class="cta-section">
        <button class="cta-btn" @click="goToPricing">
          💎 {{ t('account.managePlan', lang) }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.account-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
  color: #fff;
  padding-bottom: 60px;
}

.account-header {
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

.account-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #fbbf24 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}
.account-subtitle { color: rgba(255,255,255,0.5); font-size: 14px; }

.state-message { text-align: center; padding: 60px; }
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #fbbf24;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.account-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Membership Card */
.membership-card-section { margin-bottom: 32px; }
.membership-card {
  position: relative;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(251,191,36,0.3);
  overflow: hidden;
}
.membership-card.warning { border-color: rgba(251,146,60,0.4); }
.membership-card.expired { border-color: rgba(248,113,113,0.3); }
.card-glow {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%);
  pointer-events: none;
}
.card-tier {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}
.tier-label { color: rgba(255,255,255,0.5); font-size: 12px; }
.tier-name { font-size: 28px; font-weight: 700; color: #fbbf24; }
.card-details { display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.detail-row:last-child { border-bottom: none; }
.detail-label { color: rgba(255,255,255,0.6); font-size: 13px; }
.detail-value { color: #fff; font-size: 14px; font-weight: 500; }
.detail-value.active { color: #34d399; }
.detail-value.warning { color: #fb923c; }
.detail-value.expired { color: #f87171; }
.card-warning {
  margin-top: 16px;
  padding: 10px 14px;
  background: rgba(251,146,60,0.1);
  border: 1px solid rgba(251,146,60,0.3);
  border-radius: 10px;
  font-size: 13px;
  color: #fb923c;
  position: relative;
  z-index: 1;
}

.no-membership-card {
  text-align: center;
  padding: 48px 20px;
  background: rgba(255,255,255,0.03);
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 20px;
}
.no-sub-icon { font-size: 48px; margin-bottom: 12px; }
.no-sub-text { color: rgba(255,255,255,0.6); margin-bottom: 20px; }
.upgrade-cta {
  padding: 12px 24px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 14px;
  color: #1a1a2e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Credits */
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.credits-section { margin-bottom: 32px; }
.credits-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}
.credits-amount {
  font-size: 48px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 4px;
}
.credits-label { color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 8px; }
.credits-desc { color: rgba(255,255,255,0.4); font-size: 12px; }

/* Orders */
.orders-section { margin-bottom: 32px; }
.orders-list { display: flex; flex-direction: column; gap: 12px; }
.empty-orders {
  text-align: center;
  padding: 32px;
  color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.1);
  border-radius: 16px;
}
.order-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 16px;
}
.order-card.refunded { opacity: 0.6; }
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.order-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}
.order-icon { font-size: 18px; }
.order-status {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}
.order-status.paid { background: rgba(52,211,153,0.15); color: #34d399; }
.order-status.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.order-status.refunded { background: rgba(248,113,113,0.15); color: #f87171; }

.order-body { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
.order-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.info-label { color: rgba(255,255,255,0.5); }
.info-value { color: rgba(255,255,255,0.9); }
.refund-btn {
  padding: 6px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.refund-btn:hover { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.3); color: #f87171; }

.cta-section { text-align: center; margin-top: 24px; }
.cta-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 16px;
  color: #1a1a2e;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(251,191,36,0.4); }

@media (max-width: 600px) {
  .back-btn { position: static; margin-bottom: 16px; }
  .order-body { flex-direction: column; align-items: stretch; }
  .refund-btn { align-self: flex-start; }
}
</style>
