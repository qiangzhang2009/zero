import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 初始化数据追踪
const TENANT_SLUG = 'zero' // 知几网站
const TRACKING_URL = 'https://website-backend-admin.vercel.app/api/tracking'

// 获取或生成访客ID
function getVisitorId() {
  let visitorId = localStorage.getItem('zt_visitor_id')
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('zt_visitor_id', visitorId)
  }
  return visitorId
}

// 获取或生成会话ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('zt_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('zt_session_id', sessionId)
  }
  return sessionId
}

// 发送追踪事件
function track(eventType, eventData = {}) {
  const data = {
    event_type: eventType,
    tenant_slug: TENANT_SLUG,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    timestamp: new Date().toISOString(),
    website_url: window.location.origin,
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    event_data: eventData
  }
  
  navigator.sendBeacon
    ? navigator.sendBeacon(TRACKING_URL, JSON.stringify(data))
    : fetch(TRACKING_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
        keepalive: true
      }).catch(() => {})
}

// 追踪页面浏览
track('page_view', {page_path: window.location.pathname, page_title: document.title})

// 暴露给全局
window.zxqTrack = {
  tool: (toolName, action, params) => track('tool_interaction', {tool_name: toolName, action, ...params}),
  form: (formName, fields, result) => track('form_submit', {form_name: formName, fields, submit_result: result}),
  custom: (eventName, data) => track('custom', {event_name: eventName, ...data})
}

// 追踪表单提交
document.addEventListener('submit', (e) => {
  const form = e.target
  if (form.tagName !== 'FORM') return
  const formName = form.name || form.id || 'anonymous'
  const formData = new FormData(form)
  const fields = {}
  formData.forEach((value, key) => { fields[key] = value })
  setTimeout(() => window.zxqTrack.form(formName, fields, 'success'), 500)
})

app.mount('#app')
