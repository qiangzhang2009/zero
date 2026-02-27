import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    return newProfile
  }

  // 更新档案
  function updateProfile(profileId, data) {
    const index = profiles.value.findIndex(p => p.id === profileId)
    if (index !== -1) {
      profiles.value[index] = { ...profiles.value[index], ...data }
      saveProfiles()
      
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
