import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getApiUrl } from '../config'

const DAILY_LIMIT = 10
const STORAGE_KEY = 'zhiJi_usage'
const ADMIN_KEY = 'zhiJi_is_admin'
const PAID_CREDITS_KEY = 'zhiJi_paid_credits'
const USER_ID_KEY = 'zhiJi_user_id'

function getAPIUrl() {
  const apiBase = import.meta.env.VITE_API_URL || ''
  if (!apiBase || apiBase === '/api') {
    return getApiUrl()
  }
  return apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`
}

function getUserId() {
  return localStorage.getItem(USER_ID_KEY) || ''
}

export const useUsageStore = defineStore('usage', () => {
  const todayUsage = ref(0)
  // 注意：isAdmin 已不再通过 localStorage 设置
// 管理员权限必须通过后端认证（login 后台管理）
// 保留 isAdmin 字段是为了向后兼容和显示，但实际上权限由后端校验
const isAdmin = ref(false)
const isAdminAuthenticated = ref(false)

// 验证管理员状态（通过调用后端 API）
async function verifyAdminStatus() {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    isAdminAuthenticated.value = false
    isAdmin.value = false
    return false
  }
  
  try {
    // 调用后端验证 token 是否有效
    const apiUrl = getAPIUrl()
    const res = await fetch(`${apiUrl}/admin/stats?adminKey=${token}`)
    if (res.ok) {
      isAdminAuthenticated.value = true
      isAdmin.value = true
      return true
    } else {
      // Token 无效，清除
      localStorage.removeItem('admin_token')
      isAdminAuthenticated.value = false
      isAdmin.value = false
      return false
    }
  } catch (e) {
    console.warn('Failed to verify admin status:', e)
    return false
  }
}
  const dailyLimit = ref(DAILY_LIMIT)
  const paidCredits = ref(0)

  function getTodayDate() {
    return new Date().toDateString()
  }

  function loadUsage() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const today = getTodayDate()
      if (stored.date !== today) {
        todayUsage.value = 0
        saveUsage()
      } else {
        todayUsage.value = stored.count || 0
      }
    } catch {
      todayUsage.value = 0
      saveUsage()
    }
    // 不再从 localStorage 读取 is_admin
    // 管理员权限通过后端验证
    paidCredits.value = parseInt(localStorage.getItem(PAID_CREDITS_KEY) || '0', 10)
  }

  async function syncPaidCreditsFromServer() {
    const userId = getUserId()
    if (!userId) return
    try {
      const res = await fetch(`${getAPIUrl()}/credits/${userId}`)
      const data = await res.json()
      if (data.success && data.data) {
        paidCredits.value = data.data.credits || 0
        localStorage.setItem(PAID_CREDITS_KEY, String(paidCredits.value))
      }
    } catch (e) {
      console.warn('Failed to sync paid credits from server:', e)
    }
  }

  function canUse() {
    if (isAdmin.value) return true
    if (paidCredits.value > 0) return true
    return todayUsage.value < dailyLimit.value
  }

  function recordUse() {
    if (isAdmin.value) return
    if (paidCredits.value > 0) {
      paidCredits.value--
      savePaidCredits()
      return
    }
    todayUsage.value++
    saveUsage()
  }

  function saveUsage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: getTodayDate(),
        count: todayUsage.value
      }))
    } catch (e) {
      console.warn('Failed to save usage:', e)
    }
  }

  function savePaidCredits() {
    try {
      localStorage.setItem(PAID_CREDITS_KEY, String(paidCredits.value))
    } catch (e) {
      console.warn('Failed to save paid credits:', e)
    }
  }

  function getRemaining() {
    if (isAdmin.value) return Infinity
    if (paidCredits.value > 0) return paidCredits.value
    return Math.max(0, dailyLimit.value - todayUsage.value)
  }

  function isLimited() {
    if (isAdmin.value) return false
    if (paidCredits.value > 0) return false
    return todayUsage.value >= dailyLimit.value
  }

  function resetUsage() {
    todayUsage.value = 0
    saveUsage()
  }

  // setAdmin 已废弃 - 管理员权限必须通过后端验证
  function setAdmin(value) {
    console.warn('setAdmin is deprecated. Admin status is managed by backend.')
  }

  function setPaidCredits(credits) {
    paidCredits.value = credits
    savePaidCredits()
  }

  function getPaidCredits() {
    return paidCredits.value
  }

  function hasPaidCredits() {
    return paidCredits.value > 0
  }

  return {
    todayUsage,
    isAdmin,
    isAdminAuthenticated,
    dailyLimit,
    paidCredits,
    loadUsage,
    syncPaidCreditsFromServer,
    verifyAdminStatus,
    canUse,
    recordUse,
    saveUsage,
    getRemaining,
    isLimited,
    resetUsage,
    setAdmin,  // 保留为 deprecated，调用时会发出警告
    setPaidCredits,
    getPaidCredits,
    hasPaidCredits
  }
})
