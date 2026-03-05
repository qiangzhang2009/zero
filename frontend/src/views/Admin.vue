<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态
const isLoggedIn = ref(false)
const password = ref('')
const loading = ref(false)
const error = ref('')
const currentTab = ref('dashboard')

// 数据
const stats = ref(null)
const users = ref([])
const chats = ref([])
const modules = ref([])
const userPage = ref(1)
const chatPage = ref(1)
const selectedChat = ref(null)

// 新增：用户档案、会员、分析
const profiles = ref([])
const memberships = ref([])
const analytics = ref(null)
const profilePage = ref(1)
const membershipPage = ref(1)
const selectedUserProfile = ref(null)

// 新增：会员表单数据
const newMember = ref({
  userId: '',
  plan: 'monthly',
  days: 30,
  amount: 0
})

// 计划名称映射
function getPlanName(plan) {
  const names = {
    monthly: '月度会员',
    quarterly: '季度会员',
    yearly: '年度会员',
    lifetime: '终身会员'
  }
  return names[plan] || plan
}

// 提交会员
async function submitMembership() {
  if (!newMember.value.userId) {
    alert('请输入用户ID')
    return
  }
  await addMembership(newMember.value.userId, newMember.value.plan, newMember.value.days, newMember.value.amount)
  newMember.value = { userId: '', plan: 'monthly', days: 30, amount: 0 }
}

// 删除会员
async function deleteMembership(userId) {
  if (!confirm('确定要删除该会员资格吗？')) return
  const data = await adminFetch(`${ADMIN_API}/admin/membership/${userId}?adminKey=${getToken()}`, {
    method: 'DELETE'
  })
  if (data.success) {
    loadMemberships()
  }
}

// 常量 - 直接硬编码正确的 API 地址
const RAILWAY_API = 'https://zero-production-4a85.up.railway.app/api'
const ADMIN_API = RAILWAY_API

// 调试用
console.log('[Admin] ADMIN_API:', ADMIN_API)

// 登录
async function login() {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const res = await fetch(`${ADMIN_API}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })
    const data = await res.json()
    
    if (data.success) {
      isLoggedIn.value = true
      localStorage.setItem('admin_token', data.token)
      loadStats()
      loadModules()
    } else {
      error.value = data.error || '登录失败'
    }
  } catch (e) {
    error.value = '连接服务器失败'
  } finally {
    loading.value = false
  }
}

// 登出
function logout() {
  isLoggedIn.value = false
  password.value = ''
  localStorage.removeItem('admin_token')
}

// 获取管理员Token
function getToken() {
  return localStorage.getItem('admin_token') || ''
}

// API请求封装
async function adminFetch(url, options = {}) {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  return res.json()
}

// 加载统计数据
async function loadStats() {
  const data = await adminFetch(`${ADMIN_API}/admin/stats?adminKey=${getToken()}`)
  if (data.success) {
    stats.value = data.data
  }
}

// 加载模块列表
async function loadModules() {
  const data = await adminFetch(`${ADMIN_API}/modules`)
  if (data.success) {
    modules.value = data.data
  }
}

// 加载用户列表
async function loadUsers(page = 1) {
  userPage.value = page
  const data = await adminFetch(`${ADMIN_API}/admin/users?adminKey=${getToken()}&page=${page}&limit=20`)
  if (data.success) {
    users.value = data.data.users
  }
}

// 加载聊天记录
async function loadChats(page = 1, module = '', userId = '') {
  chatPage.value = page
  let url = `${ADMIN_API}/admin/chats?adminKey=${getToken()}&page=${page}&limit=20`
  if (module) url += `&module=${module}`
  if (userId) url += `&userId=${userId}`
  const data = await adminFetch(url)
  if (data.success) {
    chats.value = data.data.chats
  }
}

// 查看聊天详情
async function viewChat(id) {
  const data = await adminFetch(`${ADMIN_API}/admin/chat/${id}?adminKey=${getToken()}`)
  if (data.success) {
    selectedChat.value = data.data
  }
}

// 关闭聊天详情
function closeChat() {
  selectedChat.value = null
}

// 加载用户档案
async function loadProfiles(page = 1) {
  profilePage.value = page
  const data = await adminFetch(`${ADMIN_API}/admin/user-profiles?adminKey=${getToken()}&page=${page}&limit=20`)
  if (data.success) {
    profiles.value = data.data.users
  }
}

// 加载会员列表
async function loadMemberships(page = 1) {
  membershipPage.value = page
  const data = await adminFetch(`${ADMIN_API}/admin/memberships?adminKey=${getToken()}&page=${page}&limit=20`)
  if (data.success) {
    memberships.value = data.data.memberships
  }
}

// 加载高级分析
async function loadAnalytics(period = 30) {
  const data = await adminFetch(`${ADMIN_API}/admin/analytics?adminKey=${getToken()}&period=${period}`)
  if (data.success) {
    analytics.value = data.data
  }
}

// 查看用户详情
async function viewUserProfile(userId) {
  const data = await adminFetch(`${ADMIN_API}/admin/user-profile/${userId}?adminKey=${getToken()}`)
  if (data.success) {
    selectedUserProfile.value = data.data
  }
}

// 关闭用户详情
function closeUserProfile() {
  selectedUserProfile.value = null
}

// 添加会员
async function addMembership(userId, plan, durationDays, amount) {
  const data = await adminFetch(`${ADMIN_API}/admin/membership?adminKey=${getToken()}`, {
    method: 'POST',
    body: JSON.stringify({ userId, plan, durationDays, amount })
  })
  if (data.success) {
    alert('会员添加成功！')
    loadMemberships()
  } else {
    alert('添加失败：' + data.error)
  }
}

// 导出数据
async function exportData(format = 'json', type = 'chats') {
  const url = `${ADMIN_API}/admin/export?adminKey=${getToken()}&format=${format}&type=${type}`
  window.open(url, '_blank')
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 格式化数字
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}

// 检查登录状态
onMounted(() => {
  const token = getToken()
  if (token) {
    isLoggedIn.value = true
    loadStats()
    loadModules()
  }
})
</script>

<template>
  <div class="admin-container">
    <!-- 登录页面 -->
    <div v-if="!isLoggedIn" class="login-page">
      <div class="login-box">
        <h1>知几 · 运营管理后台</h1>
        <p class="subtitle">ZhiJi Admin Panel</p>
        
        <form @submit.prevent="login" class="login-form">
          <input 
            type="password" 
            v-model="password" 
            placeholder="请输入管理员密码"
            class="password-input"
          />
          <button type="submit" :disabled="loading" class="login-btn">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>
    </div>
    
    <!-- 管理后台 -->
    <div v-else class="admin-panel">
      <!-- 顶部导航 -->
      <header class="admin-header">
        <div class="header-left">
          <h2>知几运营管理后台</h2>
        </div>
        <div class="header-right">
          <button @click="loadStats" class="refresh-btn">刷新数据</button>
          <button @click="logout" class="logout-btn">退出登录</button>
        </div>
      </header>
      
      <!-- 标签导航 -->
      <nav class="admin-tabs">
        <button 
          :class="{ active: currentTab === 'dashboard' }" 
          @click="currentTab = 'dashboard'"
        >
          数据概览
        </button>
        <button 
          :class="{ active: currentTab === 'users' }" 
          @click="currentTab = 'users'; loadUsers()"
        >
          用户管理
        </button>
        <button 
          :class="{ active: currentTab === 'profiles' }" 
          @click="currentTab = 'profiles'; loadProfiles()"
        >
          📋 用户档案
        </button>
        <button 
          :class="{ active: currentTab === 'memberships' }" 
          @click="currentTab = 'memberships'; loadMemberships()"
        >
          💎 会员管理
        </button>
        <button 
          :class="{ active: currentTab === 'analytics' }" 
          @click="currentTab = 'analytics'; loadAnalytics()"
        >
          📊 数据分析
        </button>
        <button 
          :class="{ active: currentTab === 'chats' }" 
          @click="currentTab = 'chats'; loadChats()"
        >
          聊天记录
        </button>
        <button 
          :class="{ active: currentTab === 'export' }" 
          @click="currentTab = 'export'"
        >
          数据导出
        </button>
      </nav>
      
      <!-- 内容区域 -->
      <main class="admin-content">
        <!-- 数据概览 -->
        <div v-if="currentTab === 'dashboard'" class="tab-content">
          <h3>数据概览</h3>
          
          <div v-if="stats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">总聊天数</div>
              <div class="stat-value">{{ formatNumber(stats.overview.totalChats) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">总用户数</div>
              <div class="stat-value">{{ formatNumber(stats.overview.totalUsers) }}</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-label">今日聊天</div>
              <div class="stat-value">{{ stats.overview.todayChats }}</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-label">今日用户</div>
              <div class="stat-value">{{ stats.overview.todayUsers }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">本周聊天</div>
              <div class="stat-value">{{ stats.overview.weekChats }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">本月聊天</div>
              <div class="stat-value">{{ stats.overview.monthChats }}</div>
            </div>
          </div>
          
          <!-- 模块使用统计 -->
          <div class="module-stats">
            <h4>模块使用统计</h4>
            <table class="data-table" v-if="stats && stats.moduleUsage.length">
              <thead>
                <tr>
                  <th>模块</th>
                  <th>使用次数</th>
                  <th>用户数</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mod in stats.moduleUsage" :key="mod.module">
                  <td>{{ mod.module }}</td>
                  <td>{{ mod.count }}</td>
                  <td>{{ mod.userCount }}</td>
                  <td>{{ ((mod.count / stats.overview.totalChats) * 100).toFixed(1) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 每日趋势 -->
          <div class="trend-chart">
            <h4>最近30天趋势</h4>
            <div class="chart-container">
              <div 
                v-for="day in stats?.dailyTrend" 
                :key="day.date" 
                class="chart-bar"
                :style="{ height: `${(day.count / Math.max(...(stats?.dailyTrend || [{count:1}]).map(d => d.count))) * 100}%` }"
                :title="`${day.date}: ${day.count}条`"
              ></div>
            </div>
            <div class="chart-labels">
              <span>30天前</span>
              <span>今天</span>
            </div>
          </div>
        </div>
        
        <!-- 用户管理 -->
        <div v-if="currentTab === 'users'" class="tab-content">
          <h3>用户管理</h3>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>用户ID</th>
                <th>聊天数</th>
                <th>使用模块</th>
                <th>首次对话</th>
                <th>最后对话</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.userId">
                <td>{{ user.userId.substring(0, 20) }}...</td>
                <td>{{ user.chatCount }}</td>
                <td>
                  <span v-for="mod in user.modules" :key="mod" class="module-tag">{{ mod }}</span>
                </td>
                <td>{{ formatDate(user.firstChat) }}</td>
                <td>{{ formatDate(user.lastChat) }}</td>
                <td>
                  <button @click="currentTab = 'chats'; loadChats(1, '', user.userId)" class="action-btn">
                    查看记录
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="pagination">
            <button @click="loadUsers(userPage - 1)" :disabled="userPage <= 1">上一页</button>
            <span>第 {{ userPage }} 页</span>
            <button @click="loadUsers(userPage + 1)" :disabled="users.length < 20">下一页</button>
          </div>
        </div>
        
        <!-- 聊天记录 -->
        <div v-if="currentTab === 'chats'" class="tab-content">
          <h3>聊天记录</h3>
          
          <div class="filter-bar">
            <select @change="loadChats(1, $event.target.value)" class="filter-select">
              <option value="">全部模块</option>
              <option v-for="mod in modules" :key="mod.id" :value="mod.id">{{ mod.name }}</option>
            </select>
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户</th>
                <th>模块</th>
                <th>消息数</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="chat in chats" :key="chat.id">
                <td>{{ chat.id.substring(0, 15) }}...</td>
                <td>{{ chat.userId?.substring(0, 10) || 'anonymous' }}...</td>
                <td>{{ chat.module }}</td>
                <td>{{ chat.messageCount }}</td>
                <td>{{ formatDate(chat.createdAt) }}</td>
                <td>
                  <button @click="viewChat(chat.id)" class="action-btn">查看</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="pagination">
            <button @click="loadChats(chatPage - 1)" :disabled="chatPage <= 1">上一页</button>
            <span>第 {{ chatPage }} 页</span>
            <button @click="loadChats(chatPage + 1)" :disabled="chats.length < 20">下一页</button>
          </div>
        </div>
        
        <!-- 数据导出 -->
        <div v-if="currentTab === 'export'" class="tab-content">
          <h3>数据导出</h3>
          
          <div class="export-options">
            <div class="export-card">
              <h4>聊天记录</h4>
              <p>完整的聊天记录数据</p>
              <button @click="exportData('json', 'chats')" class="export-btn">JSON</button>
              <button @click="exportData('csv', 'chats')" class="export-btn">CSV</button>
            </div>
            
            <div class="export-card">
              <h4>用户档案</h4>
              <p>用户信息和档案数据</p>
              <button @click="exportData('json', 'users')" class="export-btn">JSON</button>
              <button @click="exportData('csv', 'users')" class="export-btn">CSV</button>
            </div>
            
            <div class="export-card">
              <h4>会员数据</h4>
              <p>会员订阅和支付记录</p>
              <button @click="exportData('json', 'memberships')" class="export-btn">JSON</button>
              <button @click="exportData('csv', 'memberships')" class="export-btn">CSV</button>
            </div>
          </div>
        </div>
        
        <!-- 用户档案 -->
        <div v-if="currentTab === 'profiles'" class="tab-content">
          <h3>用户档案管理</h3>
          <p class="tab-desc">查看和管理所有用户的详细档案信息</p>
          
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>用户ID</th>
                  <th>姓名</th>
                  <th>生日</th>
                  <th>聊天次数</th>
                  <th>使用模块</th>
                  <th>最后活跃</th>
                  <th>会员状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="profile in profiles" :key="profile.userId">
                  <td>{{ profile.userId }}</td>
                  <td>{{ profile.profile?.name || '-' }}</td>
                  <td>{{ profile.profile?.birthday || '-' }}</td>
                  <td>{{ profile.totalChats || 0 }}</td>
                  <td>{{ (profile.modulesUsed || []).join(', ') }}</td>
                  <td>{{ formatDate(profile.lastActiveAt) }}</td>
                  <td>
                    <span :class="['badge', profile.isPremium ? 'premium' : 'free']">
                      {{ profile.isPremium ? '会员' : '免费' }}
                    </span>
                  </td>
                  <td>
                    <button @click="viewUserProfile(profile.userId)" class="action-btn">查看详情</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 会员管理 -->
        <div v-if="currentTab === 'memberships'" class="tab-content">
          <h3>会员管理</h3>
          <p class="tab-desc">管理用户会员订阅状态</p>
          
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-value">{{ memberships.length || 0 }}</div>
              <div class="stat-label">总会员数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ memberships.filter(m => m.active).length || 0 }}</div>
              <div class="stat-label">活跃会员</div>
            </div>
          </div>
          
          <div class="add-membership-form">
            <h4>添加会员</h4>
            <input v-model="newMember.userId" placeholder="用户ID" />
            <select v-model="newMember.plan">
              <option value="monthly">月度会员</option>
              <option value="quarterly">季度会员</option>
              <option value="yearly">年度会员</option>
              <option value="lifetime">终身会员</option>
            </select>
            <input v-model="newMember.days" type="number" placeholder="天数" />
            <input v-model="newMember.amount" type="number" placeholder="金额" />
            <button @click="submitMembership" class="submit-btn">添加</button>
          </div>
          
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>用户ID</th>
                  <th>计划</th>
                  <th>状态</th>
                  <th>开始日期</th>
                  <th>到期日期</th>
                  <th>金额</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in memberships" :key="m.userId">
                  <td>{{ m.userId }}</td>
                  <td>{{ getPlanName(m.plan) }}</td>
                  <td>
                    <span :class="['badge', m.active ? 'active' : 'expired']">
                      {{ m.active ? '活跃' : '已过期' }}
                    </span>
                  </td>
                  <td>{{ formatDate(m.startDate) }}</td>
                  <td>{{ formatDate(m.expiryDate) }}</td>
                  <td>¥{{ m.amount || 0 }}</td>
                  <td>
                    <button @click="deleteMembership(m.userId)" class="action-btn delete">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 数据分析 -->
        <div v-if="currentTab === 'analytics'" class="tab-content">
          <h3>高级数据分析</h3>
          
          <div class="analytics-controls">
            <select @change="loadAnalytics($event.target.value)">
              <option value="7">最近7天</option>
              <option value="30" selected>最近30天</option>
              <option value="90">最近90天</option>
            </select>
          </div>
          
          <div v-if="analytics" class="analytics-grid">
            <div class="stat-card large">
              <div class="stat-title">核心指标</div>
              <div class="stat-row">
                <div class="stat-item">
                  <div class="stat-value">{{ analytics.overview.totalChats }}</div>
                  <div class="stat-label">总对话数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ analytics.overview.totalUsers }}</div>
                  <div class="stat-label">活跃用户</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ analytics.overview.avgMessagesPerChat }}</div>
                  <div class="stat-label">平均消息数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ analytics.overview.premiumConversionRate }}%</div>
                  <div class="stat-label">付费转化率</div>
                </div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-title">模块使用排名</div>
              <div class="module-ranking">
                <div v-for="mod in analytics.moduleRanking.slice(0, 10)" :key="mod.module" class="module-item">
                  <span class="module-name">{{ mod.module }}</span>
                  <span class="module-count">{{ mod.count }}</span>
                  <span class="module-users">{{ mod.users }}人</span>
                </div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-title">用户参与度</div>
              <div class="engagement">
                <div class="engagement-item high">
                  <span class="engagement-label">高活跃</span>
                  <span class="engagement-value">{{ analytics.engagement.high }}</span>
                </div>
                <div class="engagement-item medium">
                  <span class="engagement-label">中活跃</span>
                  <span class="engagement-value">{{ analytics.engagement.medium }}</span>
                </div>
                <div class="engagement-item low">
                  <span class="engagement-label">低活跃</span>
                  <span class="engagement-value">{{ analytics.engagement.low }}</span>
                </div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-title">会员统计</div>
              <div class="premium-stats">
                <div class="premium-item">
                  <span>总会员数:</span>
                  <span>{{ analytics.premiumStats.total }}</span>
                </div>
                <div class="premium-item">
                  <span>总收入:</span>
                  <span>¥{{ analytics.premiumStats.revenue }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 聊天详情弹窗 -->
    <div v-if="selectedChat" class="modal-overlay" @click="closeChat">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>聊天详情</h3>
          <button @click="closeChat" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="chat-info">
            <p><strong>ID:</strong> {{ selectedChat.id }}</p>
            <p><strong>用户:</strong> {{ selectedChat.userId }}</p>
            <p><strong>模块:</strong> {{ selectedChat.module }}</p>
            <p><strong>创建时间:</strong> {{ formatDate(selectedChat.createdAt) }}</p>
            <p v-if="selectedChat.profile"><strong>档案:</strong> {{ selectedChat.profile.name }} ({{ selectedChat.profile.birthday }})</p>
          </div>
          <div class="chat-messages">
            <div 
              v-for="(msg, idx) in selectedChat.messages" 
              :key="idx" 
              class="message"
              :class="msg.role"
            >
              <div class="message-role">{{ msg.role === 'user' ? '用户' : 'AI' }}</div>
              <div class="message-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #0f0f23;
  color: #fff;
}

/* 登录页面 */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.login-box {
  background: #1a1a2e;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  width: 360px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.login-box h1 {
  font-size: 24px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-box .subtitle {
  color: #888;
  font-size: 14px;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-input {
  padding: 14px 16px;
  border: 1px solid #333;
  border-radius: 10px;
  background: #0f0f23;
  color: #fff;
  font-size: 14px;
}

.password-input:focus {
  outline: none;
  border-color: #fbbf24;
}

.login-btn {
  padding: 14px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 10px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #ef4444;
  margin-top: 16px;
  font-size: 14px;
}

/* 管理面板 */
.admin-panel {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1a1a2e;
  border-bottom: 1px solid #333;
}

.admin-header h2 {
  font-size: 18px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-right {
  display: flex;
  gap: 12px;
}

.refresh-btn, .logout-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.refresh-btn {
  background: #333;
  color: #fff;
}

.logout-btn {
  background: #ef4444;
  color: #fff;
}

/* 标签导航 */
.admin-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 24px;
  background: #1a1a2e;
  border-bottom: 1px solid #333;
}

.admin-tabs button {
  padding: 10px 20px;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.admin-tabs button:hover {
  background: #333;
  color: #fff;
}

.admin-tabs button.active {
  background: #fbbf24;
  color: #000;
  font-weight: 600;
}

/* 内容区域 */
.admin-content {
  flex: 1;
  padding: 24px;
}

.tab-content h3 {
  font-size: 20px;
  margin-bottom: 24px;
}

.tab-content h4 {
  font-size: 16px;
  margin: 24px 0 16px;
  color: #888;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #1a1a2e;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.stat-label {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fbbf24;
}

/* 数据表格 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #333;
}

.data-table th {
  background: #252540;
  color: #888;
  font-weight: 500;
  font-size: 13px;
}

.data-table tr:hover {
  background: #252540;
}

.module-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #333;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
  margin-bottom: 4px;
}

.action-btn {
  padding: 6px 12px;
  background: #333;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.action-btn:hover {
  background: #fbbf24;
  color: #000;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination button {
  padding: 8px 16px;
  background: #333;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 趋势图 */
.trend-chart {
  margin-top: 32px;
  padding: 24px;
  background: #1a1a2e;
  border-radius: 12px;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 120px;
  padding: 16px 0;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #fbbf24, #f59e0b);
  border-radius: 2px 2px 0 0;
  min-height: 2px;
  transition: all 0.3s;
  cursor: pointer;
}

.chart-bar:hover {
  background: #fff;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

/* 导出 */
.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.export-card {
  background: #1a1a2e;
  padding: 24px;
  border-radius: 12px;
}

.export-card h4 {
  margin: 0 0 8px;
  color: #fff;
}

.export-card p {
  color: #888;
  font-size: 14px;
  margin-bottom: 16px;
}

.export-btn {
  padding: 12px 24px;
  background: #fbbf24;
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.chat-info {
  background: #252540;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.chat-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #ccc;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
}

.message.user {
  background: #333;
  align-self: flex-end;
}

.message.assistant {
  background: #252540;
  align-self: flex-start;
}

.message-role {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.filter-bar {
  margin-bottom: 16px;
}

.filter-select {
  padding: 8px 16px;
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
}

/* 新增样式 */
.tab-desc {
  color: #888;
  margin-bottom: 16px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.badge.premium, .badge.active {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #000;
}

.badge.free, .badge.expired {
  background: #333;
  color: #888;
}

.data-table {
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #333;
}

.data-table th {
  background: #1a1a2e;
  font-weight: 600;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card.large .stat-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.add-membership-form {
  background: #1a1a2e;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.add-membership-form input, 
.add-membership-form select {
  padding: 8px 12px;
  background: #252540;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
}

.submit-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  border: none;
  border-radius: 6px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.analytics-controls {
  margin-bottom: 20px;
}

.analytics-controls select {
  padding: 8px 16px;
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
}

.module-ranking {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.module-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #252540;
  border-radius: 4px;
}

.module-name {
  color: #ffd700;
}

.module-count {
  color: #fff;
}

.module-users {
  color: #888;
}

.engagement {
  display: flex;
  gap: 12px;
}

.engagement-item {
  flex: 1;
  padding: 16px;
  text-align: center;
  border-radius: 8px;
}

.engagement-item.high {
  background: linear-gradient(135deg, #00c853, #00e676);
}

.engagement-item.medium {
  background: linear-gradient(135deg, #ff9800, #ffb300);
}

.engagement-item.low {
  background: linear-gradient(135deg, #9e9e9e, #bdbdbd);
}

.engagement-label {
  display: block;
  font-size: 12px;
  color: #000;
}

.engagement-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #000;
}

.premium-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.premium-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #252540;
  border-radius: 6px;
}
</style>
