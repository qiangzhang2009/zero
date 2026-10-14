/**
 * 应用配置 - 统一管理所有 API 地址和常量
 * 所有配置必须通过环境变量读取，不允许硬编码
 */

// 动态读取环境变量（每次调用都读取最新值）
function getApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL
  // 开发环境使用 localhost
  if (import.meta.env.DEV) {
    return envUrl || 'http://localhost:3000/api'
  }
  // 生产环境：优先用环境变量，否则用生产环境默认后端
  if (!envUrl) {
    console.warn('⚠️ VITE_API_URL 环境变量未配置，使用生产环境默认值')
    return 'https://zero-backend-jrvz.onrender.com/api'
  }
  return envUrl
}

function getTrackingApiUrl() {
  return import.meta.env.VITE_TRACKING_API_URL || 'https://websites-admin.zxqconsulting.com/api/tracking'
}

function getTenantSlug() {
  return import.meta.env.VITE_TENANT_SLUG || 'zero'
}

// 应用信息（静态配置）
export const APP_CONFIG = {
  // 版本信息
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // 微信客服 ID（联系升级用）
  WECHAT_ID: import.meta.env.VITE_WECHAT_ID || '',

  // 管理员密码环境变量名
  ADMIN_PASSWORD_ENV: 'ADMIN_PASSWORD',
}

// 导出获取函数
export {
  getApiUrl,
  getTrackingApiUrl,
  getTenantSlug,
}

export function getWechatId() {
  return APP_CONFIG.WECHAT_ID
}

export default APP_CONFIG
