<script setup>
import { ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { useLanguageStore } from '../i18n'

const emit = defineEmits(['close'])
const profileStore = useProfileStore()
const languageStore = useLanguageStore()

const showCreateForm = ref(false)
const editingProfile = ref(null)

// 统一的表单数据
const formData = ref({
  name: '',
  birthday: '',
  gender: '',
  hour: '',
  description: ''
})
const formAvatar = ref('👤')

const avatarOptions = ['👤', '👨', '👩', '🧑', '👴', '👵', '🧙', '🧚', '🧛', '🧜']

// 快速年份选择
const currentYear = new Date().getFullYear()
const years = computed(() => {
  const list = []
  for (let i = currentYear; i >= currentYear - 100; i--) {
    list.push(i)
  }
  return list
})

const months = computed(() => {
  const lang = languageStore.currentLanguage
  const monthLabels = {
    'zh-CN': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'ja': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    'ko': ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    'default': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  }
  const labels = monthLabels[lang] || monthLabels['default']
  return labels.map((label, index) => ({ value: index + 1, label }))
})
const days = computed(() => {
  const list = []
  for (let i = 1; i <= 31; i++) {
    list.push(i)
  }
  return list
})

// 分离年月日
const selectedYear = ref(currentYear - 30)
const selectedMonth = ref(1)
const selectedDay = ref(1)

// 计算生日字符串
const birthdayValue = computed(() => {
  return `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
})

// 创建档案
function createProfile() {
  if (!formData.value.name) return
  
  profileStore.createProfile({
    ...formData.value,
    birthday: birthdayValue.value,
    avatar: formAvatar.value
  })
  
  // 选择新创建的档案
  const profiles = profileStore.profiles
  if (profiles.length > 0) {
    profileStore.selectProfile(profiles[profiles.length - 1].id)
  }
  
  showCreateForm.value = false
  resetForm()
}

// 开始编辑档案
function startEdit(profile) {
  editingProfile.value = profile.id
  formData.value = {
    name: profile.name,
    birthday: profile.birthday || '',
    gender: profile.gender || '',
    hour: profile.hour || '',
    description: profile.description || ''
  }
  formAvatar.value = profile.avatar || '👤'
  
  // 解析生日
  if (profile.birthday) {
    const parts = profile.birthday.split('-')
    if (parts.length >= 3) {
      selectedYear.value = parseInt(parts[0])
      selectedMonth.value = parseInt(parts[1])
      selectedDay.value = parseInt(parts[2])
    }
  } else {
    selectedYear.value = currentYear - 30
    selectedMonth.value = 1
    selectedDay.value = 1
  }
}

// 保存编辑
function saveEdit() {
  if (!formData.value.name || !editingProfile.value) return
  
  profileStore.updateProfile(editingProfile.value, {
    ...formData.value,
    birthday: birthdayValue.value,
    avatar: formAvatar.value
  })
  
  cancelEdit()
}

// 取消编辑
function cancelEdit() {
  editingProfile.value = null
  formData.value = {
    name: '',
    birthday: '',
    gender: '',
    hour: '',
    description: ''
  }
  formAvatar.value = '👤'
  selectedYear.value = currentYear - 30
  selectedMonth.value = 1
  selectedDay.value = 1
}

// 删除档案
function deleteProfile(profileId) {
  if (confirm(languageStore.t('profile.confirmDelete'))) {
    profileStore.deleteProfile(profileId)
  }
}

// 选择档案
function selectProfileAndClose(profileId) {
  profileStore.selectProfile(profileId)
  emit('close')
}

function resetForm() {
  formData.value = {
    name: '',
    birthday: '',
    gender: '',
    hour: '',
    description: ''
  }
  formAvatar.value = '👤'
  selectedYear.value = currentYear - 30
  selectedMonth.value = 1
  selectedDay.value = 1
}

function goBack() {
  if (editingProfile.value) {
    cancelEdit()
  } else if (showCreateForm.value) {
    showCreateForm.value = false
  }
}
</script>

<template>
  <div class="profile-selector-overlay" @click.self="emit('close')">
    <div class="profile-selector">
      <div class="selector-header">
        <h3>{{ editingProfile ? languageStore.t('profile.editProfile') : (showCreateForm ? languageStore.t('profile.createProfile') : languageStore.t('profile.selectProfile')) }}</h3>
        <button class="close-btn" @click="goBack">
          {{ editingProfile || showCreateForm ? '← ' + languageStore.t('back') : '✕' }}
        </button>
      </div>
      
      <!-- 档案列表 -->
      <div class="profile-list" v-if="!showCreateForm && !editingProfile">
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
            class="edit-btn" 
            @click.stop="startEdit(profile)"
            title="修改"
          >
            ✏️
          </button>
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
          <span>{{ languageStore.t('profile.createProfile') }}</span>
        </button>
      </div>
      
      <!-- 创建/编辑档案表单 -->
      <div class="create-form" v-else>
        <div class="form-scroll-area">
          <div class="form-group">
            <label>选择头像</label>
            <div class="avatar-grid">
              <button 
                v-for="avatar in avatarOptions" 
                :key="avatar"
                class="avatar-option"
                :class="{ selected: formAvatar === avatar }"
                @click="formAvatar = avatar"
              >
                {{ avatar }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ languageStore.t('profile.name') }} {{ languageStore.t('profile.required') }}</label>
            <input 
              v-model="formData.name" 
              type="text" 
              :placeholder="languageStore.t('profile.name')"
            />
          </div>
          
          <div class="form-group">
            <label>{{ languageStore.t('profile.birthday') }}</label>
            <div class="date-picker">
              <select v-model="selectedYear" class="year-select">
                <option v-for="year in years" :key="year" :value="year">{{ year }}年</option>
              </select>
              <select v-model="selectedMonth" class="month-select">
                <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
              </select>
              <select v-model="selectedDay" class="day-select">
                <option v-for="day in days" :key="day" :value="day">{{ day }}日</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ languageStore.t('profile.birthTime') }}</label>
            <select v-model="formData.hour">
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
            <label>{{ languageStore.t('profile.gender') }}</label>
            <div class="gender-options">
              <button 
                class="gender-btn"
                :class="{ selected: formData.gender === '男' }"
                @click="formData.gender = '男'"
              >
                👨 男
              </button>
              <button 
                class="gender-btn"
                :class="{ selected: formData.gender === '女' }"
                @click="formData.gender = '女'"
              >
                👩 女
              </button>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button class="cancel-btn" @click="goBack">{{ languageStore.t('profile.cancel') }}</button>
          <button class="submit-btn" @click="editingProfile ? saveEdit() : createProfile()">
            {{ editingProfile ? languageStore.t('profile.save') : languageStore.t('profile.create') }}
          </button>
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
  padding: 20px;
}

.profile-selector {
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.selector-header h3 {
  color: #fff;
  font-size: 17px;
  margin: 0;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.profile-list {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
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
  min-width: 0;
}

.profile-name {
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 4px;
}

.edit-btn:hover,
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
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  -webkit-overflow-scrolling: touch;
}

.create-form h4 {
  color: #fff;
  margin: 0 0 16px;
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

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
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

/* 日期选择器 */
.date-picker {
  display: flex;
  gap: 8px;
}

.date-picker select {
  flex: 1;
  min-width: 0;
}

.year-select {
  flex: 1.3 !important;
}

.month-select,
.day-select {
  flex: 1 !important;
}

.gender-options {
  display: flex;
  gap: 12px;
}

.gender-btn {
  flex: 1;
  padding: 14px;
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
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  background: #1a1a2e;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
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
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

/* 手机端优化 */
@media (max-width: 480px) {
  .profile-selector {
    max-height: 90vh;
    border-radius: 16px;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  
  .avatar-option {
    padding: 8px;
    font-size: 20px;
  }
  
  .date-picker {
    flex-wrap: wrap;
  }
  
  .date-picker select {
    flex: 1 1 calc(33% - 6px) !important;
  }
  
  .gender-btn {
    padding: 14px 10px;
    font-size: 13px;
  }
}
</style>
