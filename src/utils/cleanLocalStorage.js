/**
 * localStorage 清理和调试工具
 * 用于诊断和解决本地存储与API数据同步问题
 */

// 需要清理的localStorage键名（保留登录相关）
const WMS_STORAGE_KEYS = [
  'wms_suppliers',
  'wms_warehouses', 
  'wms_products',
  'wms_categories',
  'wms_brands',
  'wms_users',
  'wms_staff',
  'wms_customers',
  'wms_zones',
  'wms_locations',
  'wms_roles',
  'wms_permissions',
  'inventory_stock',
  'inbound_orders',
  'outbound_orders',
  'wms_stock_movements',
  'inventory_counts',
  'wms_alerts',
  'stock_movements'
]

// 保留的localStorage键名（登录状态等）
const KEEP_KEYS = [
  'wms_token',
  'wms_access_token',
  'wms_refresh_token',
  'wms_user_info',
  'wms_remember_username',
  'wms_language',
  'wms_theme',
  'user_token',
  'access_token',
  'refresh_token'
]

/**
 * 清理所有WMS业务数据localStorage
 */
export const cleanWMSLocalStorage = () => {
  console.log('🧹 开始清理WMS localStorage数据...')
  
  let removedCount = 0
  let keptCount = 0
  
  WMS_STORAGE_KEYS.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      removedCount++
      console.log(`❌ 已删除: ${key}`)
    }
  })
  
  KEEP_KEYS.forEach(key => {
    if (localStorage.getItem(key)) {
      keptCount++
      console.log(`✅ 保留: ${key}`)
    }
  })
  
  console.log(`🎯 清理完成！删除了 ${removedCount} 个业务数据项，保留了 ${keptCount} 个系统配置项`)
  
  return {
    removed: removedCount,
    kept: keptCount,
    removedKeys: WMS_STORAGE_KEYS.filter(key => !localStorage.getItem(key))
  }
}

/**
 * 检查localStorage中的数据
 */
export const inspectLocalStorage = () => {
  console.log('🔍 检查localStorage中的WMS数据:')
  
  const inspection = {
    businessData: {},
    systemData: {},
    total: 0
  }
  
  // 检查业务数据
  WMS_STORAGE_KEYS.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        const count = Array.isArray(parsed) ? parsed.length : 1
        inspection.businessData[key] = {
          exists: true,
          size: data.length,
          itemCount: count,
          preview: Array.isArray(parsed) ? `Array(${count})` : typeof parsed
        }
        inspection.total++
        console.log(`📊 ${key}: ${count} 条记录 (${data.length} 字符)`)
      } catch (e) {
        inspection.businessData[key] = {
          exists: true,
          size: data.length,
          itemCount: 'invalid',
          preview: 'parse error'
        }
        console.log(`⚠️ ${key}: 数据格式错误`)
      }
    }
  })
  
  // 检查系统数据
  KEEP_KEYS.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      inspection.systemData[key] = {
        exists: true,
        size: data.length,
        preview: data.substring(0, 50) + (data.length > 50 ? '...' : '')
      }
      console.log(`🔧 ${key}: ${data.substring(0, 30)}${data.length > 30 ? '...' : ''}`)
    }
  })
  
  return inspection
}

/**
 * 监控localStorage操作
 */
export const monitorLocalStorage = () => {
  console.log('👀 开始监控localStorage操作...')
  
  // 保存原始方法
  const originalSetItem = localStorage.setItem
  const originalGetItem = localStorage.getItem
  const originalRemoveItem = localStorage.removeItem
  
  // 重写setItem
  localStorage.setItem = function(key, value) {
    if (WMS_STORAGE_KEYS.includes(key)) {
      console.warn(`🚨 检测到localStorage写入操作: ${key}`)
      console.trace('调用栈:')
      
      // 检查是否应该使用API
      if (window.wmsAPI) {
        console.error(`❌ 错误：应该使用API而不是localStorage保存 ${key}`)
      }
    }
    return originalSetItem.call(this, key, value)
  }
  
  // 重写getItem
  localStorage.getItem = function(key) {
    if (WMS_STORAGE_KEYS.includes(key)) {
      console.warn(`🔍 检测到localStorage读取操作: ${key}`)
      
      // 检查是否应该使用API
      if (window.wmsAPI) {
        console.error(`❌ 错误：应该使用API而不是localStorage读取 ${key}`)
      }
    }
    return originalGetItem.call(this, key)
  }
  
  // 重写removeItem
  localStorage.removeItem = function(key) {
    if (WMS_STORAGE_KEYS.includes(key)) {
      console.log(`🗑️ 检测到localStorage删除操作: ${key}`)
    }
    return originalRemoveItem.call(this, key)
  }
  
  return {
    stop: () => {
      localStorage.setItem = originalSetItem
      localStorage.getItem = originalGetItem
      localStorage.removeItem = originalRemoveItem
      console.log('🛑 停止监控localStorage操作')
    }
  }
}

/**
 * 执行完整的localStorage诊断
 */
export const diagnoseStorageIssues = () => {
  console.log('🏥 开始localStorage诊断...')
  
  // 1. 检查当前状态
  const inspection = inspectLocalStorage()
  
  // 2. 检查API可用性
  const apiAvailable = !!window.wmsAPI
  console.log(`🔌 API可用性: ${apiAvailable ? '✅ 可用' : '❌ 不可用'}`)
  
  // 3. 分析问题
  const issues = []
  
  if (inspection.total > 0 && apiAvailable) {
    issues.push('检测到localStorage中存在业务数据，但API已可用，可能存在数据同步问题')
  }
  
  if (inspection.total === 0 && !apiAvailable) {
    issues.push('localStorage和API都不可用，系统无法正常工作')
  }
  
  Object.keys(inspection.businessData).forEach(key => {
    const data = inspection.businessData[key]
    if (data.itemCount === 'invalid') {
      issues.push(`${key} 数据格式错误`)
    }
  })
  
  console.log('🚨 发现的问题:')
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`)
  })
  
  return {
    inspection,
    apiAvailable,
    issues
  }
}

// 全局暴露诊断工具
if (typeof window !== 'undefined') {
  window.wmsDiagnostics = {
    cleanWMSLocalStorage,
    inspectLocalStorage,
    monitorLocalStorage,
    diagnoseStorageIssues
  }
} 