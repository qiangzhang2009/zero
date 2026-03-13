import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 后台管理系统 API 地址
const TRACKING_API_URL = 'https://websites-admin.zxqconsulting.com/api/tracking'
const TENANT_SLUG = 'zero'

// 生成或获取用户ID
function getUserId() {
  let userId = localStorage.getItem('zhiJi_user_id')
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('zhiJi_user_id', userId)
  }
  return userId
}

// 计算档案完整度
function calculateProfileCompleteness(profile) {
  if (!profile) return 0
  let completeness = 0
  if (profile.name) completeness += 20
  if (profile.birthday) completeness += 30
  if (profile.hour) completeness += 20
  if (profile.gender) completeness += 10
  if (profile.bazi && Object.keys(profile.bazi).length > 0) completeness += 20
  return completeness
}

// 追踪档案创建/更新
function trackProfile(profileData, action = 'create') {
  try {
    const visitorId = getUserId()
    fetch(TRACKING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'profile_' + action,
        tenant_slug: TENANT_SLUG,
        visitor_id: visitorId,
        event_data: {
          profile_id: profileData.id || profileData.profile_id || 'default',
          profile_type: 'bazi',
          name: profileData.name,
          birthday: profileData.birthday,
          birth_time: profileData.hour,
          gender: profileData.gender,
          profile_data: profileData.bazi || {},
          completeness: calculateProfileCompleteness(profileData),
          timestamp: new Date().toISOString()
        }
      })
    })
  } catch (error) {
    console.warn('Failed to track profile:', error)
  }
}

export const useProfileStore = defineStore('profile', () => {
  // 档案列表
  const profiles = ref([])
  // 当前选中的档案
  const currentProfile = ref(null)
  // 档案存储键名
  const STORAGE_KEY = 'zhiJi_profiles'

  // 从本地存储加载档案
  function loadProfiles() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      profiles.value = JSON.parse(stored)
    } else {
      // 默认创建示例档案
      profiles.value = [
        {
          id: 'default',
          name: '我的档案',
          avatar: '👤',
          birthday: '',
          gender: '',
          createdAt: new Date().toISOString(),
          description: '默认档案'
        }
      ]
      saveProfiles()
    }
  }

  // 保存档案到本地存储
  function saveProfiles() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.value))
  }

  // 创建新档案
  function createProfile(profileData) {
    const newProfile = {
      id: 'profile_' + Date.now(),
      name: profileData.name || '新档案',
      avatar: profileData.avatar || '👤',
      birthday: profileData.birthday || '',
      gender: profileData.gender || '',
      hour: profileData.hour || '', // 时辰
      createdAt: new Date().toISOString(),
      description: profileData.description || '',
      // 八字信息
      bazi: {
        year: '',
        month: '',
        day: '',
        hour: ''
      }
    }
    profiles.value.push(newProfile)
    saveProfiles()
    // 追踪档案创建
    trackProfile(newProfile, 'create')
    return newProfile
  }

  // 更新档案
  function updateProfile(profileId, data) {
    const index = profiles.value.findIndex(p => p.id === profileId)
    if (index !== -1) {
      profiles.value[index] = { ...profiles.value[index], ...data }
      saveProfiles()
      
      // 追踪档案更新
      trackProfile(profiles.value[index], 'update')
      
      // 如果更新的是当前档案，也更新currentProfile
      if (currentProfile.value?.id === profileId) {
        currentProfile.value = profiles.value[index]
      }
    }
  }

  // 删除档案
  function deleteProfile(profileId) {
    profiles.value = profiles.value.filter(p => p.id !== profileId)
    saveProfiles()
    
    // 如果删除的是当前档案，重置为null
    if (currentProfile.value?.id === profileId) {
      currentProfile.value = null
    }
  }

  // 选择档案
  function selectProfile(profileId) {
    const profile = profiles.value.find(p => p.id === profileId)
    if (profile) {
      currentProfile.value = profile
      localStorage.setItem('currentProfileId', profileId)
    }
  }

  // 加载上次选择的档案
  function loadLastProfile() {
    const lastId = localStorage.getItem('currentProfileId')
    if (lastId) {
      selectProfile(lastId)
    } else if (profiles.value.length > 0) {
      selectProfile(profiles.value[0].id)
    }
  }

  // 初始化
  function init() {
    loadProfiles()
    loadLastProfile()
  }

  return {
    profiles,
    currentProfile,
    init,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    loadProfiles
  }
})
