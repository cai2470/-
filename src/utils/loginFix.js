/**
 * 登录修复工具
 * 用于解决localStorage监控导致的登录问题
 */

// 认证相关的localStorage键名
const AUTH_KEYS = [
  'wms_access_token',
  'wms_refresh_token', 
  'wms_token',
  'wms_user_info',
  'wms_remember_username',
  'user_token',
  'access_token',
  'refresh_token'
]

/**
 * 检查认证状态
 */
export const checkAuthState = () => {
  const authData = {}
  
  AUTH_KEYS.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      authData[key] = value
    }
  })
  
  console.log('🔍 当前认证状态:', authData)
  
  const hasToken = !!(authData.wms_access_token || authData.access_token || authData.wms_token)
  const hasUserInfo = !!authData.wms_user_info
  
  return {
    hasToken,
    hasUserInfo,
    authData,
    canLogin: true  // 总是允许登录
  }
}

/**
 * 清理损坏的认证数据
 */
export const clearCorruptedAuth = () => {
  console.log('🧹 清理可能损坏的认证数据...')
  
  AUTH_KEYS.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      try {
        // 如果是JSON数据，尝试解析
        if (value.startsWith('{') || value.startsWith('[')) {
          JSON.parse(value)
        }
      } catch (error) {
        console.warn(`🗑️ 删除损坏的认证数据: ${key}`)
        localStorage.removeItem(key)
      }
    }
  })
}

/**
 * 重置登录环境
 */
export const resetLoginEnvironment = () => {
  console.log('🔄 重置登录环境...')
  
  // 1. 清理可能损坏的认证数据
  clearCorruptedAuth()
  
  // 2. 确保API可用
  if (window.wmsAPI) {
    console.log('✅ wmsAPI 可用')
  } else {
    console.error('❌ wmsAPI 不可用')
  }
  
  // 3. 停止所有可能的localStorage监控
  if (window.localStorageMonitor) {
    try {
      window.localStorageMonitor.stop()
      console.log('🛑 已停止localStorage监控')
    } catch (error) {
      console.warn('停止监控失败:', error)
    }
  }
  
  // 4. 检查最终状态
  const authState = checkAuthState()
  console.log('🎯 登录环境重置完成:', authState)
  
  return authState
}

/**
 * 手动登录测试
 */
export const testManualLogin = async (username = 'admin', password = 'admin123') => {
  console.log('🧪 开始手动登录测试...')
  
  try {
    // 1. 重置环境
    resetLoginEnvironment()
    
    // 2. 尝试登录
    if (!window.wmsAPI) {
      throw new Error('wmsAPI 不可用')
    }
    
    const result = await window.wmsAPI.login({ username, password })
    console.log('✅ 手动登录测试成功:', result)
    
    return { success: true, data: result }
    
  } catch (error) {
    console.error('❌ 手动登录测试失败:', error)
    return { success: false, error: error.message }
  }
}

// 全局暴露
if (typeof window !== 'undefined') {
  window.loginFix = {
    checkAuthState,
    clearCorruptedAuth,
    resetLoginEnvironment,
    testManualLogin
  }
  
  console.log('🔧 登录修复工具已加载，可使用: window.loginFix')
} 