import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 每日用量限制：普通用户 20 次，管理员不限
const DAILY_LIMIT = 20
const STORAGE_KEY = 'zhiJi_usage'
const ADMIN_KEY = 'zhiJi_is_admin'

export const useUsageStore = defineStore('usage', () => {
  const todayUsage = ref(0)
  const isAdmin = ref(false)
  const dailyLimit = ref(DAILY_LIMIT)

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
  }

  function canUse() {
    if (isAdmin.value) return true
    return todayUsage.value < dailyLimit.value
  }

  function recordUse() {
    if (isAdmin.value) return
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

  function getRemaining() {
    if (isAdmin.value) return Infinity
    return Math.max(0, dailyLimit.value - todayUsage.value)
  }

  function isLimited() {
    return !isAdmin.value && todayUsage.value >= dailyLimit.value
  }

  function resetUsage() {
    todayUsage.value = 0
    saveUsage()
  }

  function setAdmin(value) {
    isAdmin.value = value
    localStorage.setItem(ADMIN_KEY, value ? 'true' : 'false')
  }

  return {
    todayUsage,
    isAdmin,
    dailyLimit,
    loadUsage,
    canUse,
    recordUse,
    getRemaining,
    isLimited,
    resetUsage,
    setAdmin
  }
})
