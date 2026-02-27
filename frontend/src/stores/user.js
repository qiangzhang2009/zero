import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const points = ref(100) // 初始积分
  const isLoggedIn = computed(() => !!user.value)

  // 模拟登录
  function login() {
    user.value = {
      id: 'user_' + Date.now(),
      name: '访客',
      avatar: '👤',
      createdAt: new Date().toISOString()
    }
  }

  // 签到
  function checkIn() {
    const today = new Date().toDateString()
    const lastCheckIn = localStorage.getItem('lastCheckIn')
    
    if (lastCheckIn === today) {
      return { success: false, message: '今天已经签到过了' }
    }
    
    points.value += 10
    localStorage.setItem('lastCheckIn', today)
    return { success: true, message: '签到成功，获得10积分' }
  }

  // 使用积分进行对话
  function usePoints(amount = 1) {
    if (points.value >= amount) {
      points.value -= amount
      return true
    }
    return false
  }

  return {
    user,
    points,
    isLoggedIn,
    login,
    checkIn,
    usePoints
  }
})
