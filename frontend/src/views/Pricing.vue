<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '../i18n'
import { useUsageStore } from '../stores/usage'
import { getApiUrl, getWechatId } from '../config'

const router = useRouter()
const languageStore = useLanguageStore()
const usageStore = useUsageStore()

const currentLang = languageStore.currentLanguage

// 多语言翻译
const translations = {
  'zh-CN': {
    title: '选择您的智慧套餐',
    subtitle: '解锁更多命理智慧，开启全新篇章',
    creditTitle: '一次性购买点数',
    subTitle: '订阅会员 - 更划算',
    saveText: '节省 25%',
    popular: '推荐',
    credits: '次',
    unlimited: '无限次',
    perMonth: '/月',
    perYear: '/年',
    buyNow: '立即购买',
    subscribe: '立即订阅',
    currentPlan: '当前方案',
    currentSub: '已订阅',
    features: '功能详情',
    featureAll: '全部 19 大命理模块',
    featureCloud: '云端历史同步',
    featurePriority: '优先 AI 响应',
    featureSupport: '专属客服',
    featureUnlimited: '无限次每日对话',
    payTitle: '确认支付',
    payMock: '演示支付',
    payMockDesc: '当前为演示模式，点击下方按钮完成支付（不会产生真实费用）',
    payConfirm: '确认支付',
    payCancel: '取消',
    paySuccess: '支付成功！',
    paySuccessDesc: '您的套餐已激活',
    payFailed: '支付失败',
    payError: '请稍后重试',
    paymentMethod: '支付方式',
    free: '免费版',
    freeDesc: '每日 20 次免费',
    dailyLimit: '每日对话',
    loadError: '加载套餐失败，请刷新重试',
    tabCredits: '按次计费',
    tabSub: '订阅',
    daysLeft: '剩余',
    expires: '到期',
    refundPolicy: '购买后 7 天内未使用可申请退款',
    backHome: '返回首页',
    wechatTitle: '需要帮助?',
    wechatDesc: '添加客服微信',
  },
  'en': {
    title: 'Choose Your Wisdom Plan',
    subtitle: 'Unlock more wisdom, start a new chapter',
    creditTitle: 'One-time Credit Packs',
    subTitle: 'Subscriptions - Better Value',
    saveText: 'Save 25%',
    popular: 'Popular',
    credits: 'credits',
    unlimited: 'Unlimited',
    perMonth: '/mo',
    perYear: '/year',
    buyNow: 'Buy Now',
    subscribe: 'Subscribe',
    currentPlan: 'Current',
    currentSub: 'Active',
    features: 'Features',
    featureAll: 'All 19 modules',
    featureCloud: 'Cloud history',
    featurePriority: 'Priority AI',
    featureSupport: 'Dedicated support',
    featureUnlimited: 'Unlimited daily',
    payTitle: 'Confirm Payment',
    payMock: 'Demo Payment',
    payMockDesc: 'Demo mode - no real charge. Click below to complete.',
    payConfirm: 'Confirm Payment',
    payCancel: 'Cancel',
    paySuccess: 'Payment Successful!',
    paySuccessDesc: 'Your plan is now active',
    payFailed: 'Payment Failed',
    payError: 'Please try again later',
    paymentMethod: 'Payment Method',
    free: 'Free',
    freeDesc: '20 daily free',
    dailyLimit: 'Daily chats',
    loadError: 'Failed to load plans',
    tabCredits: 'Pay-as-you-go',
    tabSub: 'Subscribe',
    daysLeft: 'days left',
    expires: 'Expires',
    refundPolicy: '7-day refund for unused credits',
    backHome: 'Back to Home',
    wechatTitle: 'Need help?',
    wechatDesc: 'Contact via WeChat',
  },
  'ja': {
    title: 'プランを選択',
    subtitle: '智慧を解放し、新しい章を始めよう',
    creditTitle: 'クレジットパック',
    subTitle: 'サブスクリプション - お得',
    saveText: '25% お得',
    popular: '人気',
    credits: 'クレジット',
    unlimited: '無制限',
    perMonth: '/月',
    perYear: '/年',
    buyNow: '購入',
    subscribe: '購読',
    currentPlan: '現在',
    currentSub: '有効',
    features: '機能',
    featureAll: '全 19 モジュール',
    featureCloud: 'クラウド履歴',
    featurePriority: '優先 AI',
    featureSupport: '専用サポート',
    featureUnlimited: '無制限日次',
    payTitle: '支払い確認',
    payMock: 'デモ支払い',
    payMockDesc: 'デモモード - 実際の課金なし',
    payConfirm: '支払い確認',
    payCancel: 'キャンセル',
    paySuccess: '支払い成功！',
    paySuccessDesc: 'プランが有効になりました',
    payFailed: '支払い失敗',
    payError: '後でもう一度お試しください',
    paymentMethod: '支払い方法',
    free: '無料',
    freeDesc: '毎日 20 回無料',
    dailyLimit: '日次チャット',
    loadError: 'プランの読み込みに失敗',
    tabCredits: '従量課金',
    tabSub: '購読',
    daysLeft: '日残り',
    expires: '有効期限',
    refundPolicy: '未使用 7 日以内返金可',
    backHome: 'ホームへ',
    wechatTitle: 'ヘルプ',
    wechatDesc: 'WeChat で連絡',
  },
  'ko': {
    title: '플랜 선택',
    subtitle: '지혜를 열어 새로운 장을 시작하세요',
    creditTitle: '크레딧 팩',
    subTitle: '구독 - 더 좋은 가치',
    saveText: '25% 절약',
    popular: '인기',
    credits: '크레딧',
    unlimited: '무제한',
    perMonth: '/월',
    perYear: '/년',
    buyNow: '구매',
    subscribe: '구독',
    currentPlan: '현재',
    currentSub: '활성',
    features: '기능',
    featureAll: '전체 19 모듈',
    featureCloud: '클라우드 기록',
    featurePriority: '우선 AI',
    featureSupport: '전담 지원',
    featureUnlimited: '무제한 일일',
    payTitle: '결제 확인',
    payMock: '데모 결제',
    payMockDesc: '데모 모드 - 실제 청구 없음',
    payConfirm: '결제 확인',
    payCancel: '취소',
    paySuccess: '결제 성공!',
    paySuccessDesc: '플랜이 활성화되었습니다',
    payFailed: '결제 실패',
    payError: '나중에 다시 시도하세요',
    paymentMethod: '결제 방법',
    free: '무료',
    freeDesc: '매일 20회 무료',
    dailyLimit: '일일 채팅',
    loadError: '플랜 로드 실패',
    tabCredits: '종량제',
    tabSub: '구독',
    daysLeft: '일 남음',
    expires: '만료',
    refundPolicy: '미사용 7일 이내 환불',
    backHome: '홈으로',
    wechatTitle: '도움말',
    wechatDesc: 'WeChat 연락',
  }
}

function t(key) {
  return translations[currentLang]?.[key] || translations['zh-CN'][key] || key
}

const WECHAT_ID = getWechatId()
const activeTab = ref('credits') // 'credits' | 'subscription'
const plans = ref({ credits: [], subscriptions: [] })
const paymentMethods = ref([])
const isLoading = ref(true)
const loadError = ref(false)
const showPayModal = ref(false)
const currentOrder = ref(null)
const isProcessing = ref(false)
const payResult = ref(null) // 'success' | 'failed' | null
const currentMembership = ref(null)

// 货币格式
const currencySymbols = { USD: '$', CNY: '¥', JPY: '¥', KRW: '₩' }

function formatPrice(amount, currency) {
  const sym = currencySymbols[currency] || currency + ' '
  return `${sym}${amount.toFixed(2)}`
}

function getCurrency() {
  // 简化：根据语言返回
  const map = { 'zh-CN': 'CNY', 'ja': 'JPY', 'ko': 'KRW' }
  return map[currentLang] || 'USD'
}

const userId = computed(() => {
  let id = localStorage.getItem('zhiJi_user_id')
  if (!id) {
    id = 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
    localStorage.setItem('zhiJi_user_id', id)
  }
  return id
})

async function loadPlans() {
  isLoading.value = true
  loadError.value = false
  try {
    const [plansRes, methodsRes] = await Promise.all([
      fetch(`${getApiUrl()}/payment/plans`),
      fetch(`${getApiUrl()}/payment/methods`)
    ])
    const plansData = await plansRes.json()
    const methodsData = await methodsRes.json()
    if (plansData.success) {
      plans.value = plansData.data
    } else {
      loadError.value = true
    }
    if (methodsData.success) {
      paymentMethods.value = methodsData.data.filter(m => m.available)
    }
  } catch (e) {
    console.error('Failed to load plans:', e)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
  // 加载当前会员
  try {
    const memRes = await fetch(`${getApiUrl()}/payment/membership/${userId.value}`)
    const memData = await memRes.json()
    if (memData.success && memData.data) {
      currentMembership.value = memData.data
    }
  } catch (e) {
    console.warn('Failed to load membership:', e)
  }
  // 加载点数
  await usageStore.syncPaidCreditsFromServer()
}

async function handleBuy(plan, type) {
  if (type === 'credit') {
    currentOrder.value = { plan, type: 'credit' }
  } else {
    currentOrder.value = { plan, type: 'subscription' }
  }
  payResult.value = null
  showPayModal.value = true
}

async function confirmPayment() {
  if (!currentOrder.value) return
  isProcessing.value = true
  try {
    const { plan, type } = currentOrder.value
    // 1. 创建订单
    const createRes = await fetch(`${getApiUrl()}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId.value,
        planId: plan.id,
        paymentMethod: 'mock',
        type
      })
    })
    const createData = await createRes.json()
    if (!createData.success) throw new Error(createData.error || 'Failed to create order')

    const orderId = createData.data.order.id

    // 2. 执行 mock 支付
    const payRes = await fetch(`${getApiUrl()}/payment/mock-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    })
    const payData = await payRes.json()
    if (!payData.success) throw new Error(payData.error || 'Payment failed')

    // 3. 更新本地状态
    payResult.value = 'success'

    // 如果是 credit pack, 更新 paidCredits
    if (type === 'credit') {
      const newCredits = (parseInt(localStorage.getItem('zhiJi_paid_credits') || '0', 10) || 0) + plan.credits
      usageStore.setPaidCredits(newCredits)
      await usageStore.syncPaidCreditsFromServer()
    } else {
      // 订阅：刷新会员信息
      const memRes = await fetch(`${getApiUrl()}/payment/membership/${userId.value}`)
      const memData = await memRes.json()
      if (memData.success && memData.data) {
        currentMembership.value = memData.data
      }
    }
  } catch (e) {
    console.error('Payment error:', e)
    payResult.value = 'failed'
  } finally {
    isProcessing.value = false
  }
}

function closePayModal() {
  if (isProcessing.value) return
  showPayModal.value = false
  currentOrder.value = null
  payResult.value = null
}

function goHome() {
  router.push('/')
}

function getMembershipDaysLeft() {
  if (!currentMembership.value) return 0
  const exp = new Date(currentMembership.value.expiresAt).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((exp - now) / (24 * 60 * 60 * 1000)))
}

const featureList = computed(() => [
  { key: 'featureAll', icon: '📚' },
  { key: 'featureCloud', icon: '☁️' },
  { key: 'featurePriority', icon: '⚡' },
  { key: 'featureSupport', icon: '💎' }
])

onMounted(() => {
  loadPlans()
})
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

        <!-- 当前状态 -->
        <div class="current-status">
          <div class="status-item">
            <span class="status-icon">💰</span>
            <span class="status-label">{{ t('credits') }}:</span>
            <span class="status-value">{{ usageStore.paidCredits }}</span>
          </div>
          <div v-if="currentMembership" class="status-item">
            <span class="status-icon">👑</span>
            <span class="status-label">{{ currentMembership.tier }}:</span>
            <span class="status-value">{{ getMembershipDaysLeft() }} {{ t('daysLeft') }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'credits' }"
        @click="activeTab = 'credits'"
      >
        💎 {{ t('tabCredits') }}
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'subscription' }"
        @click="activeTab = 'subscription'"
      >
        👑 {{ t('tabSub') }}
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="isLoading" class="state-message">
      <div class="spinner"></div>
    </div>
    <div v-else-if="loadError" class="state-message error">
      {{ t('loadError') }}
      <button @click="loadPlans" class="retry-btn">↻</button>
    </div>

    <!-- Credit Packs -->
    <section v-else-if="activeTab === 'credits' && plans.credits.length" class="plans-section">
      <h2 class="section-title">{{ t('creditTitle') }}</h2>
      <div class="plans-grid">
        <div
          v-for="plan in plans.credits"
          :key="plan.id"
          class="plan-card"
          :class="{ 'plan-highlight': plan.popular }"
        >
          <div v-if="plan.popular" class="popular-badge">⭐ {{ t('popular') }}</div>
          <div class="plan-icon">{{ plan.id === 'starter' ? '🌱' : plan.id === 'explorer' ? '⭐' : plan.id === 'master' ? '👑' : '💎' }}</div>
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="price-num">{{ formatPrice(plan.price, getCurrency()) }}</span>
          </div>
          <div class="plan-credits">
            <span class="credits-num">{{ plan.credits }}</span>
            <span class="credits-label">{{ t('credits') }}</span>
          </div>
          <button class="upgrade-btn" :class="{ 'upgrade-btn-highlight': plan.popular }" @click="handleBuy(plan, 'credit')">
            {{ t('buyNow') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Subscription Plans -->
    <section v-else-if="activeTab === 'subscription' && plans.subscriptions.length" class="plans-section">
      <h2 class="section-title">{{ t('subTitle') }}</h2>
      <div class="plans-grid sub-grid">
        <div
          v-for="plan in plans.subscriptions"
          :key="plan.id"
          class="plan-card"
          :class="{ 'plan-highlight': plan.popular, 'plan-current': currentMembership?.tier === plan.tier }"
        >
          <div v-if="plan.popular" class="popular-badge">⭐ {{ t('popular') }}</div>
          <div v-if="plan.saveText" class="save-badge">{{ plan.saveText }}</div>
          <div class="plan-icon">{{ plan.tier === 'basic' ? '⭐' : plan.tier === 'premium' ? '💫' : '👑' }}</div>
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="price-num">{{ formatPrice(plan.price, getCurrency()) }}</span>
            <span class="price-per">{{ plan.period === 'month' ? t('perMonth') : t('perYear') }}</span>
          </div>
          <div class="plan-credits">
            <template v-if="plan.dailyCredits === -1">
              <span class="credits-num">∞</span>
              <span class="credits-label">{{ t('unlimited') }}</span>
            </template>
            <template v-else>
              <span class="credits-num">{{ plan.dailyCredits }}</span>
              <span class="credits-label">{{ t('credits') }} / {{ t('dailyLimit') }}</span>
            </template>
          </div>
          <ul class="plan-features">
            <li v-for="f in plan.features" :key="f">
              <span class="check">✓</span>
              <span class="feature-text">{{ f.replace(/_/g, ' ') }}</span>
            </li>
          </ul>
          <button
            class="upgrade-btn"
            :class="{
              'upgrade-btn-highlight': plan.popular,
              'current-btn': currentMembership?.tier === plan.tier
            }"
            :disabled="currentMembership?.tier === plan.tier"
            @click="handleBuy(plan, 'subscription')"
          >
            <span v-if="currentMembership?.tier === plan.tier">✓ {{ t('currentSub') }}</span>
            <span v-else>{{ t('subscribe') }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Refund Policy -->
    <p class="refund-policy">💡 {{ t('refundPolicy') }}</p>

    <!-- WeChat Support -->
    <div class="wechat-section">
      <p class="wechat-label">{{ t('wechatTitle') }}</p>
      <p class="wechat-id">{{ WECHAT_ID }} <span class="wechat-tag">{{ t('wechatDesc') }}</span></p>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPayModal" class="modal-overlay" @click.self="closePayModal">
      <div class="pay-modal">
        <button v-if="!isProcessing && payResult !== 'success'" class="modal-close" @click="closePayModal">×</button>

        <!-- 支付准备 -->
        <template v-if="!payResult">
          <div class="modal-icon">💳</div>
          <h3 class="modal-title">{{ t('payTitle') }}</h3>

          <div class="order-summary" v-if="currentOrder">
            <div class="summary-plan">{{ currentOrder.plan.name }}</div>
            <div class="summary-price">
              <span class="big-price">{{ formatPrice(currentOrder.plan.price, getCurrency()) }}</span>
              <span class="price-desc" v-if="currentOrder.type === 'subscription'">
                {{ currentOrder.plan.period === 'month' ? t('perMonth') : t('perYear') }}
              </span>
            </div>
            <div class="summary-detail" v-if="currentOrder.type === 'credit'">
              {{ currentOrder.plan.credits }} {{ t('credits') }}
            </div>
            <div class="summary-detail" v-else>
              <template v-if="currentOrder.plan.dailyCredits === -1">
                {{ t('unlimited') }} {{ t('dailyLimit') }}
              </template>
              <template v-else>
                {{ currentOrder.plan.dailyCredits }} {{ t('credits') }} / {{ t('dailyLimit') }}
              </template>
            </div>
          </div>

          <div class="payment-methods">
            <p class="methods-label">{{ t('paymentMethod') }}</p>
            <div v-for="m in paymentMethods" :key="m.id" class="method-item">
              <span class="method-icon">{{ m.icon }}</span>
              <span class="method-name">{{ m.name }}</span>
            </div>
          </div>

          <div class="demo-notice" v-if="paymentMethods.length === 0 || paymentMethods.some(m => m.id === 'mock')">
            🧪 {{ t('payMockDesc') }}
          </div>

          <button
            class="confirm-btn"
            :disabled="isProcessing"
            @click="confirmPayment"
          >
            <span v-if="!isProcessing">{{ t('payConfirm') }} {{ currentOrder ? formatPrice(currentOrder.plan.price, getCurrency()) : '' }}</span>
            <span v-else>⏳ ...</span>
          </button>
        </template>

        <!-- 支付成功 -->
        <template v-else-if="payResult === 'success'">
          <div class="success-icon">✅</div>
          <h3 class="success-title">{{ t('paySuccess') }}</h3>
          <p class="success-desc">{{ t('paySuccessDesc') }}</p>
          <button class="confirm-btn" @click="closePayModal">{{ t('backHome') }}</button>
        </template>

        <!-- 支付失败 -->
        <template v-else>
          <div class="success-icon error">❌</div>
          <h3 class="success-title">{{ t('payFailed') }}</h3>
          <p class="success-desc">{{ t('payError') }}</p>
          <button class="confirm-btn" @click="closePayModal">×</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pricing-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
  padding-bottom: 60px;
  color: #fff;
}

.pricing-header {
  position: relative;
  text-align: center;
  padding: 50px 20px 30px;
  overflow: hidden;
}

.header-bg { position: absolute; inset: 0; pointer-events: none; }
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}
.bg-orb-1 { width: 300px; height: 300px; background: linear-gradient(135deg, #fbbf24, #f59e0b); top: -100px; left: -50px; }
.bg-orb-2 { width: 250px; height: 250px; background: linear-gradient(135deg, #a855f7, #6366f1); top: -50px; right: -80px; }

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
  margin-bottom: 24px;
}
.back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.header-content { position: relative; z-index: 1; }

.pricing-title {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #fbbf24 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.pricing-subtitle { font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 16px; }

.current-status {
  display: inline-flex;
  gap: 16px;
  padding: 8px 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 24px;
  font-size: 14px;
}
.status-item { display: flex; align-items: center; gap: 4px; color: rgba(255,255,255,0.8); }
.status-icon { font-size: 16px; }
.status-label { color: rgba(255,255,255,0.5); }
.status-value { color: #fbbf24; font-weight: 600; }

/* Tabs */
.tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 20px 24px;
  max-width: 600px;
  margin: 0 auto;
}
.tab-btn {
  flex: 1;
  padding: 12px 20px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  color: rgba(255,255,255,0.7);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #1a1a2e;
  font-weight: 600;
}
.tab-btn:hover:not(.active) { background: rgba(255,255,255,0.1); }

/* States */
.state-message { text-align: center; padding: 40px; color: rgba(255,255,255,0.6); }
.state-message.error { color: #f87171; }
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
.retry-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  color: #fff;
  padding: 8px 16px;
  margin-left: 12px;
  cursor: pointer;
}

/* Plans */
.plans-section { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.section-title {
  text-align: center;
  font-size: 20px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 24px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.plans-grid.sub-grid { grid-template-columns: repeat(3, 1fr); max-width: 900px; margin: 0 auto; }

@media (max-width: 900px) {
  .plans-grid, .plans-grid.sub-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .plans-grid, .plans-grid.sub-grid { grid-template-columns: 1fr; }
}

.plan-card {
  position: relative;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  transition: all 0.3s;
}
.plan-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2); }
.plan-highlight {
  background: linear-gradient(145deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 100%);
  border: 2px solid rgba(251,191,36,0.4);
}
.plan-current { border: 2px solid rgba(52,211,153,0.5); }

.popular-badge, .save-badge {
  position: absolute;
  top: -10px;
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}
.popular-badge {
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a1a2e;
}
.save-badge {
  right: 16px;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #064e3b;
}

.plan-icon { font-size: 36px; margin-bottom: 8px; }
.plan-name { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #fff; }

.plan-price { margin-bottom: 12px; }
.price-num { font-size: 32px; font-weight: 700; color: #fff; }
.price-per { font-size: 13px; color: rgba(255,255,255,0.5); margin-left: 4px; }

.plan-credits {
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}
.credits-num { font-size: 24px; font-weight: 700; color: #fbbf24; }
.credits-label { font-size: 12px; color: rgba(255,255,255,0.6); }

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  text-align: left;
  font-size: 12px;
}
.plan-features li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  color: rgba(255,255,255,0.7);
}
.check { color: #34d399; font-weight: bold; }

.upgrade-btn {
  width: 100%;
  padding: 12px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.upgrade-btn:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
.upgrade-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.upgrade-btn-highlight {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #1a1a2e;
}
.upgrade-btn-highlight:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(251,191,36,0.4); }
.current-btn { background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.4); color: #34d399; }

/* Refund Policy */
.refund-policy {
  text-align: center;
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  margin: 32px 20px;
}

/* WeChat */
.wechat-section {
  text-align: center;
  padding: 16px 20px 40px;
  border-top: 1px solid rgba(255,255,255,0.05);
  margin: 0 20px;
}
.wechat-label { color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 4px; }
.wechat-id { color: #fbbf24; font-size: 15px; font-weight: 500; }
.wechat-tag { color: rgba(255,255,255,0.4); font-size: 12px; margin-left: 8px; }

/* Payment Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
  padding: 20px;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.pay-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  padding: 40px 32px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  position: relative;
  border: 1px solid rgba(251,191,36,0.2);
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
  animation: slideUp 0.4s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}
.modal-close:hover { color: #fbbf24; }

.modal-icon { font-size: 48px; margin-bottom: 12px; }
.modal-title { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 24px; }

.order-summary {
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}
.summary-plan { color: rgba(255,255,255,0.7); font-size: 13px; margin-bottom: 8px; }
.summary-price { display: flex; align-items: baseline; justify-content: center; gap: 6px; }
.big-price { font-size: 36px; font-weight: 700; color: #fbbf24; }
.price-desc { color: rgba(255,255,255,0.5); font-size: 14px; }
.summary-detail { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 8px; }

.payment-methods {
  margin-bottom: 20px;
  text-align: left;
}
.methods-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.method-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  margin-bottom: 6px;
  font-size: 14px;
}
.method-icon { font-size: 18px; }
.method-name { color: rgba(255,255,255,0.9); }

.demo-notice {
  background: rgba(251,191,36,0.1);
  border: 1px solid rgba(251,191,36,0.3);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: #fbbf24;
  margin-bottom: 20px;
}

.confirm-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 14px;
  color: #1a1a2e;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.confirm-btn:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(251,191,36,0.4); }
.confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.success-icon { font-size: 64px; margin-bottom: 16px; }
.success-icon.error { color: #f87171; }
.success-title { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.success-desc { color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 24px; }
</style>
