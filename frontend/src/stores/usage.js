import { defineStore } from 'pinia'
import { ref } from 'vue'

const DAILY_LIMIT = 10
const STORAGE_KEY = 'zhiJi_usage'
const ADMIN_KEY = 'zhiJi_is_admin'
const PAID_CREDITS_KEY = 'zhiJi_paid_credits'
const USER_ID_KEY = 'zhiJi_user_id'

function getAPIUrl() {
  let apiBase = import.meta.env.VITE_API_URL || ''
  if (!apiBase || apiBase === '/api') {
    apiBase = 'https://zero-backend-jrvz.onrender.com/api'
  }
  return apiBase
}

function getUserId() {
  return localStorage.getItem(USER_ID_KEY) || ''
}

export const useUsageStore = defineStore('usage', () => {
  const todayUsage = ref(0)
  const isAdmin = ref(false)
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
    isAdmin.value = localStorage.getItem(ADMIN_KEY) === 'true'
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

  function setAdmin(value) {
    isAdmin.value = value
    localStorage.setItem(ADMIN_KEY, value ? 'true' : 'false')
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
    dailyLimit,
    paidCredits,
    loadUsage,
    syncPaidCreditsFromServer,
    canUse,
    recordUse,
    saveUsage,
    getRemaining,
    isLimited,
    resetUsage,
    setAdmin,
    setPaidCredits,
    getPaidCredits,
    hasPaidCredits
  }
})
