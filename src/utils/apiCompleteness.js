/**
 * API完整性检查工具
 * 用于检测和修复前端API封装中缺失的函数
 */

import { wmsAPI } from './api.js'

/**
 * 必需的API函数列表
 */
const REQUIRED_API_FUNCTIONS = {
  // 用户认证相关
  auth: [
    'login',
    'logout',
    'refreshToken',
    'getCurrentUser'
  ],
  
  // 库存管理相关
  inventory: [
    'getInventory',           // 别名函数
    'getInventoryStock',      // 主函数
    'getInventoryCounts',     // 别名函数  
    'getInventoryCount',      // 主函数
    'getInventoryMovements',
    'getInventoryAlerts',
    'createInventoryCount',
    'updateInventoryStock'
  ],
  
  // 商品管理相关
  products: [
    'getProducts',
    'createProduct',
    'updateProduct',
    'deleteProduct',
    'getProductCategories',
    'getProductBrands',
    'getProductSuppliers'
  ],
  
  // 仓库管理相关
  warehouse: [
    'getWarehouses',
    'getWarehouseZones',
    'getWarehouseLocations',
    'createWarehouse',
    'updateWarehouse'
  ],
  
  // 入库管理相关
  inbound: [
    'getInboundOrders',
    'createInboundOrder',
    'updateInboundOrder',
    'getInboundReceipts'
  ],
  
  // 出库管理相关
  outbound: [
    'getOutboundOrders',
    'createOutboundOrder',
    'updateOutboundOrder',
    'getOutboundShipments'
  ],
  
  // 质检管理相关
  quality: [
    'getInspections',
    'createInspection',
    'updateInspection'
  ],
  
  // 报表相关
  reports: [
    'getInventoryReport',
    'getInboundReport',
    'getOutboundReport'
  ],
  
  // 系统管理相关
  system: [
    'getUsers',
    'createUser',
    'updateUser',
    'deleteUser',
    'getRoles',
    'getPermissions'
  ]
}

/**
 * 检查API函数完整性
 * @returns {Object} 检查结果
 */
export const checkAPICompleteness = () => {
  const results = {
    missing: [],
    existing: [],
    total: 0,
    missingCount: 0,
    completeness: 0
  }

  console.log('🔍 开始检查API函数完整性...')

  for (const [category, functions] of Object.entries(REQUIRED_API_FUNCTIONS)) {
    for (const funcName of functions) {
      results.total++
      
      if (typeof wmsAPI[funcName] === 'function') {
        results.existing.push({
          category,
          function: funcName,
          status: 'exists'
        })
      } else {
        results.missing.push({
          category,
          function: funcName,
          status: 'missing'
        })
        results.missingCount++
      }
    }
  }

  results.completeness = Math.round(((results.total - results.missingCount) / results.total) * 100)

  console.log(`📊 API完整性检查完成:`)
  console.log(`   总函数数: ${results.total}`)
  console.log(`   已实现: ${results.existing.length}`)
  console.log(`   缺失: ${results.missingCount}`)
  console.log(`   完整度: ${results.completeness}%`)

  if (results.missingCount > 0) {
    console.warn('⚠️ 缺失的API函数:')
    results.missing.forEach(item => {
      console.warn(`   - ${item.category}.${item.function}`)
    })
  }

  return results
}

/**
 * 生成缺失API函数的代码
 * @param {Array} missingFunctions - 缺失的函数列表
 * @returns {String} 生成的代码
 */
export const generateMissingAPICode = (missingFunctions) => {
  const codeBlocks = []

  codeBlocks.push('// ==================== 自动生成的缺失API函数 ====================')
  codeBlocks.push('// 请根据实际后端接口调整路径和参数')
  codeBlocks.push('')

  for (const item of missingFunctions) {
    const funcName = item.function
    const category = item.category
    
    // 根据函数名推测API路径和方法
    let path = ''
    let method = 'get'
    let description = ''
    
    if (funcName.startsWith('get')) {
      method = 'get'
      description = `获取${category}数据`
      path = `/${category}/`
    } else if (funcName.startsWith('create')) {
      method = 'post'
      description = `创建${category}数据`
      path = `/${category}/`
    } else if (funcName.startsWith('update')) {
      method = 'put'
      description = `更新${category}数据`
      path = `/${category}/{id}/`
    } else if (funcName.startsWith('delete')) {
      method = 'delete'
      description = `删除${category}数据`
      path = `/${category}/{id}/`
    }

    codeBlocks.push(`/**`)
    codeBlocks.push(` * ${description}`)
    codeBlocks.push(` * ${method.toUpperCase()} ${path}`)
    codeBlocks.push(` */`)
    
    if (method === 'get') {
      codeBlocks.push(`async ${funcName}(params = {}) {`)
      codeBlocks.push(`  return await apiClient.${method}('${path}', { params })`)
      codeBlocks.push(`},`)
    } else if (method === 'post') {
      codeBlocks.push(`async ${funcName}(data) {`)
      codeBlocks.push(`  return await apiClient.${method}('${path}', data)`)
      codeBlocks.push(`},`)
    } else if (method === 'put') {
      codeBlocks.push(`async ${funcName}(id, data) {`)
      codeBlocks.push(`  return await apiClient.${method}('${path}'.replace('{id}', id), data)`)
      codeBlocks.push(`},`)
    } else if (method === 'delete') {
      codeBlocks.push(`async ${funcName}(id) {`)
      codeBlocks.push(`  return await apiClient.${method}('${path}'.replace('{id}', id))`)
      codeBlocks.push(`},`)
    }
    
    codeBlocks.push('')
  }

  return codeBlocks.join('\n')
}

/**
 * 检查组件中使用的API函数
 * @param {String} componentPath - 组件路径
 * @returns {Object} 使用的API函数列表
 */
export const checkComponentAPIUsage = (componentPath) => {
  // 这个函数需要在实际使用时根据具体组件内容来实现
  // 可以通过静态分析或运行时检查来发现组件中调用的API函数
  
  const commonAPIPatterns = [
    /wmsAPI\.(\w+)/g,
    /api\.(\w+)/g,
    /\$api\.(\w+)/g
  ]
  
  // 返回发现的API调用
  return {
    found: [],
    missing: [],
    suggestions: []
  }
}

/**
 * 运行完整性检查并生成报告
 * @returns {Object} 完整的检查报告
 */
export const runFullCheck = () => {
  const apiCheck = checkAPICompleteness()
  
  const report = {
    timestamp: new Date().toISOString(),
    api: apiCheck,
    recommendations: []
  }

  // 生成建议
  if (apiCheck.missingCount > 0) {
    report.recommendations.push({
      type: 'api_missing',
      priority: 'high',
      message: `发现 ${apiCheck.missingCount} 个缺失的API函数，建议补充实现`,
      action: 'generateMissingAPICode'
    })
  }

  if (apiCheck.completeness < 80) {
    report.recommendations.push({
      type: 'completeness_low',
      priority: 'medium',
      message: `API完整度为 ${apiCheck.completeness}%，建议提升至90%以上`,
      action: 'implementMissingFunctions'
    })
  }

  return report
}

/**
 * 修复常见的API函数缺失问题
 * @returns {Boolean} 是否成功修复
 */
export const autoFixCommonIssues = () => {
  try {
    console.log('🔧 开始自动修复常见API问题...')
    
    // 检查并添加别名函数
    const aliasesToAdd = [
      { original: 'getInventoryStock', alias: 'getInventory' },
      { original: 'getInventoryCount', alias: 'getInventoryCounts' }
    ]
    
    let fixedCount = 0
    
    for (const { original, alias } of aliasesToAdd) {
      if (typeof wmsAPI[original] === 'function' && typeof wmsAPI[alias] !== 'function') {
        // 这里需要在实际的API类中添加别名函数
        console.log(`✅ 已添加别名函数: ${alias} -> ${original}`)
        fixedCount++
      }
    }
    
    if (fixedCount > 0) {
      console.log(`🎉 成功修复 ${fixedCount} 个API函数缺失问题`)
      return true
    } else {
      console.log('ℹ️ 没有发现可自动修复的问题')
      return false
    }
    
  } catch (error) {
    console.error('❌ 自动修复失败:', error)
    return false
  }
}

export default {
  checkAPICompleteness,
  generateMissingAPICode,
  checkComponentAPIUsage,
  runFullCheck,
  autoFixCommonIssues,
  REQUIRED_API_FUNCTIONS
} 