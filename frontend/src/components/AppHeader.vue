<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '../i18n'
import { useUsageStore } from '../stores/usage'
import LanguageSelector from './LanguageSelector.vue'

const router = useRouter()
const languageStore = useLanguageStore()
const usageStore = useUsageStore()
const isMenuOpen = ref(false)
const showWechatModal = ref(false)

onMounted(() => {
  usageStore.loadUsage()
  usageStore.syncPaidCreditsFromServer()
})

function openWechat() {
  showWechatModal.value = true
}

function closeWechat() {
  showWechatModal.value = false
}
</script>

<template>
  <header class="header-box">
    <div class="header">
      <div class="left" @click="router.push('/')">
        <img src="/logo.png" alt="知几" class="logo" />
        <span class="logo-text">{{ languageStore.t('appName') }}</span>
      </div>
      <div class="right">
        <!-- 升级按钮 -->
        <button class="upgrade-btn" @click="router.push('/pricing')">
          <span class="upgrade-icon">👑</span>
          <span class="upgrade-text">升级</span>
        </button>

        <!-- 用量显示 -->
        <div v-if="!usageStore.isAdmin" class="usage-badge" :class="{ 'usage-low': usageStore.getRemaining() <= 5 }">
          <span class="usage-icon">💬</span>
          <span class="usage-text">{{ usageStore.hasPaidCredits() ? usageStore.getRemaining() + ' 积分' : usageStore.getRemaining() + '/' + usageStore.dailyLimit + ' 次' }}</span>
        </div>

        <!-- 语言选择器 -->
        <LanguageSelector />

        <div class="func-icon" @click="isMenuOpen = !isMenuOpen">
          <span class="menu-btn">☰</span>
        </div>
      </div>
    </div>

    <!-- 微信联系弹窗 -->
    <div v-if="showWechatModal" class="wechat-modal-overlay" @click.self="closeWechat">
      <div class="wechat-modal">
        <button class="wechat-close" @click="closeWechat">×</button>
        <div class="wechat-icon">💬</div>
        <h3 class="wechat-title">添加客服微信</h3>
        <p class="wechat-desc">扫码联系客服，转账后为您充值</p>
        <div class="wechat-qr">
          <div class="qr-placeholder">
            <div class="qr-icon">📱</div>
            <p class="qr-label">微信号</p>
            <p class="qr-value">3740977</p>
          </div>
        </div>
        <p class="wechat-note">转账时备注您的账号即可开通</p>
        <button class="wechat-copy" @click="() => { navigator.clipboard?.writeText('3740977'); alert('微信号已复制') }">
          复制微信号
        </button>
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

.usage-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.usage-badge:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
}

.usage-icon {
  font-size: 14px;
}

.usage-text {
  font-weight: 500;
}

.usage-low {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.4);
  color: #fbbf24;
}

.usage-low .usage-text {
  color: #fbbf24;
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

  .upgrade-text {
    display: none;
  }

  .upgrade-btn {
    padding: 6px 10px;
  }
}

/* 升级按钮 */
.upgrade-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 20px;
  color: #1a1a2e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 2px 12px rgba(251, 191, 36, 0.3);
  text-decoration: none;
}

.upgrade-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.5);
}

.upgrade-icon {
  font-size: 14px;
}

/* 微信联系弹窗 */
.wechat-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
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

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.wechat-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  padding: 40px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  position: relative;
  border: 1px solid rgba(251, 191, 36, 0.25);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.4s ease;
}

.wechat-close {
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

.wechat-close:hover {
  color: #fbbf24;
}

.wechat-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.wechat-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
}

.wechat-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 24px;
}

.wechat-qr {
  margin-bottom: 20px;
}

.qr-placeholder {
  background: rgba(255, 255, 255, 0.04);
  border: 2px dashed rgba(251, 191, 36, 0.3);
  border-radius: 16px;
  padding: 28px;
  display: inline-block;
}

.qr-icon {
  font-size: 44px;
  margin-bottom: 10px;
}

.qr-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin-bottom: 6px;
}

.qr-value {
  color: #fbbf24;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}

.wechat-note {
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  margin-bottom: 20px;
}

.wechat-copy {
  padding: 12px 28px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 12px;
  color: #1a1a2e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.wechat-copy:hover {
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.4);
  transform: translateY(-1px);
}
</style>
