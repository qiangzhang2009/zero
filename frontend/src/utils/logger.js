/**
 * 日志工具 - 生产环境自动禁用调试日志
 */

// 保存原始 console 方法
const originalLog = console.log
const originalInfo = console.info
const originalDebug = console.debug
const originalWarn = console.warn

// 是否启用调试日志（开发环境启用，生产环境禁用）
const isDev = import.meta.env.DEV
const ENABLE_DEBUG_LOGS = isDev || import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true'

/**
 * 调试日志 - 仅在开发环境或明确启用时输出
 */
export function debug(...args) {
  if (ENABLE_DEBUG_LOGS) {
    originalLog('[DEBUG]', ...args)
  }
}

/**
 * 信息日志 - 始终输出
 */
export function info(...args) {
  originalInfo('[INFO]', ...args)
}

/**
 * 警告日志 - 始终输出
 */
export function warn(...args) {
  originalWarn('[WARN]', ...args)
}

/**
 * 错误日志 - 始终输出
 */
export function error(...args) {
  originalError('[ERROR]', ...args)
}

const originalError = console.error

// 导出 enableDebugLogs 用于运行时切换
export function setDebugLogsEnabled(enabled) {
  if (enabled) {
    console.log = originalLog
    console.info = originalInfo
    console.debug = originalDebug
  } else {
    console.log = () => {}
    console.info = () => {}
    console.debug = () => {}
  }
}

export default {
  debug,
  info,
  warn,
  error,
  setDebugLogsEnabled,
}
