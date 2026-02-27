<script setup>
import { ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile'

const emit = defineEmits(['close'])
const profileStore = useProfileStore()

const showCreateForm = ref(false)
const newProfile = ref({
  name: '',
  birthday: '',
  gender: '',
  hour: '',
  description: ''
})

const avatarOptions = ['👤', '👨', '👩', '🧑', '👴', '👵', '🧙', '🧚', '🧛', '🧜']
const selectedAvatar = ref('👤')

// 创建档案
function createProfile() {
  if (!newProfile.value.name) return
  
  profileStore.createProfile({
    ...newProfile.value,
    avatar: selectedAvatar.value
  })
  
  // 选择新创建的档案
  const profiles = profileStore.profiles
  if (profiles.length > 0) {
    profileStore.selectProfile(profiles[profiles.length - 1].id)
  }
  
  showCreateForm.value = false
  resetForm()
}

// 删除档案
function deleteProfile(profileId) {
  if (confirm('确定要删除这个档案吗？')) {
    profileStore.deleteProfile(profileId)
  }
}

// 选择档案
function selectProfileAndClose(profileId) {
  profileStore.selectProfile(profileId)
  emit('close')
}

function resetForm() {
  newProfile.value = {
    name: '',
    birthday: '',
    gender: '',
    hour: '',
    description: ''
  }
  selectedAvatar.value = '👤'
}
</script>

<template>
  <div class="profile-selector-overlay" @click.self="emit('close')">
    <div class="profile-selector">
      <div class="selector-header">
        <h3>选择档案</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>
      
      <!-- 档案列表 -->
      <div class="profile-list" v-if="!showCreateForm">
        <div 
          v-for="profile in profileStore.profiles" 
          :key="profile.id"
          class="profile-item"
          :class="{ active: profileStore.currentProfile?.id === profile.id }"
          @click="selectProfileAndClose(profile.id)"
        >
          <span class="profile-avatar">{{ profile.avatar }}</span>
          <div class="profile-info">
            <span class="profile-name">{{ profile.name }}</span>
            <span class="profile-desc" v-if="profile.birthday">{{ profile.birthday }}</span>
          </div>
          <button 
            class="delete-btn" 
            @click.stop="deleteProfile(profile.id)"
            v-if="profileStore.profiles.length > 1"
          >
            🗑️
          </button>
        </div>
        
        <!-- 创建新档案按钮 -->
        <button class="create-btn" @click="showCreateForm = true">
          <span class="plus-icon">+</span>
          <span>创建新档案</span>
        </button>
      </div>
      
      <!-- 创建档案表单 -->
      <div class="create-form" v-else>
        <h4>创建新档案</h4>
        
        <div class="form-group">
          <label>选择头像</label>
          <div class="avatar-grid">
            <button 
              v-for="avatar in avatarOptions" 
              :key="avatar"
              class="avatar-option"
              :class="{ selected: selectedAvatar === avatar }"
              @click="selectedAvatar = avatar"
            >
              {{ avatar }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>姓名</label>
          <input 
            v-model="newProfile.name" 
            type="text" 
            placeholder="请输入姓名"
          />
        </div>
        
        <div class="form-group">
          <label>出生日期</label>
          <input 
            v-model="newProfile.birthday" 
            type="date" 
          />
        </div>
        
        <div class="form-group">
          <label>时辰</label>
          <select v-model="newProfile.hour">
            <option value="">请选择时辰</option>
            <option value="子时">子时 (23:00-01:00)</option>
            <option value="丑时">丑时 (01:00-03:00)</option>
            <option value="寅时">寅时 (03:00-05:00)</option>
            <option value="卯时">卯时 (05:00-07:00)</option>
            <option value="辰时">辰时 (07:00-09:00)</option>
            <option value="巳时">巳时 (09:00-11:00)</option>
            <option value="午时">午时 (11:00-13:00)</option>
            <option value="未时">未时 (13:00-15:00)</option>
            <option value="申时">申时 (15:00-17:00)</option>
            <option value="酉时">酉时 (17:00-19:00)</option>
            <option value="戌时">戌时 (19:00-21:00)</option>
            <option value="亥时">亥时 (21:00-23:00)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>性别</label>
          <div class="gender-options">
            <button 
              class="gender-btn"
              :class="{ selected: newProfile.gender === '男' }"
              @click="newProfile.gender = '男'"
            >
              👨 男
            </button>
            <button 
              class="gender-btn"
              :class="{ selected: newProfile.gender === '女' }"
              @click="newProfile.gender = '女'"
            >
              👩 女
            </button>
          </div>
        </div>
        
        <div class="form-actions">
          <button class="cancel-btn" @click="showCreateForm = false">取消</button>
          <button class="submit-btn" @click="createProfile">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-selector-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.profile-selector {
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.selector-header h3 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
}

.profile-list {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.profile-item.active {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1));
  border-color: rgba(251, 191, 36, 0.3);
}

.profile-avatar {
  font-size: 32px;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-name {
  color: #fff;
  font-weight: 500;
}

.profile-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.delete-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.create-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px dashed rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  color: #fbbf24;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: rgba(251, 191, 36, 0.2);
}

.plus-icon {
  font-size: 20px;
}

/* 创建表单 */
.create-form {
  padding: 20px;
}

.create-form h4 {
  color: #fff;
  margin: 0 0 20px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: rgba(251, 191, 36, 0.5);
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.avatar-option {
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.avatar-option.selected {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
}

.gender-options {
  display: flex;
  gap: 12px;
}

.gender-btn {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.gender-btn.selected {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
}

.submit-btn {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  color: #1a1a2e;
  font-weight: 600;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn:hover {
  transform: scale(1.02);
}
</style>
