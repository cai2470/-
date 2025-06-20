// API路径快速测试工具
// 测试后端提供的新API路径

import { wmsAPI } from './api.js'

/**
 * 测试库存相关API路径
 */
export async function testInventoryPaths() {
  console.log('🔍 开始测试库存管理API路径...')
  
  const tests = [
    {
      name: '库存查询',
      path: '/inventory/stock/',
      method: 'getInventoryStock',
      params: { page: 1, page_size: 5 }
    },
    {
      name: '库存预警',
      path: '/inventory/alerts/',
      method: 'getInventoryAlerts',
      params: { page: 1, page_size: 5 }
    },
    {
      name: '库存盘点',
      path: '/inventory/count/',
      method: 'getInventoryCount',
      params: { page: 1, page_size: 5 }
    },
    {
      name: '库存移动记录',
      path: '/inventory/movements/',
      method: 'getInventoryMovements',
      params: { page: 1, page_size: 5 }
    }
  ]
  
  const results = []
  
  for (const test of tests) {
    try {
      console.log(`🔄 测试 ${test.name} (${test.path})...`)
      const response = await wmsAPI[test.method](test.params)
      console.log(`✅ ${test.name} 测试成功:`, response)
      results.push({
        name: test.name,
        path: test.path,
        status: 'success',
        response: response
      })
    } catch (error) {
      console.error(`❌ ${test.name} 测试失败:`, error)
      results.push({
        name: test.name,
        path: test.path,
        status: 'error',
        error: error.message || error
      })
    }
  }
  
  return results
}

/**
 * 测试出库相关API路径
 */
export async function testOutboundPaths() {
  console.log('🔍 开始测试出库管理API路径...')
  
  const tests = [
    {
      name: '出库订单',
      path: '/outbound/orders/',
      method: 'getOutboundOrders',
      params: { page: 1, page_size: 5 }
    },
    {
      name: '出库统计',
      path: '/outbound/orders/stats/',
      method: 'getOutboundStats',
      params: {}
    }
  ]
  
  const results = []
  
  for (const test of tests) {
    try {
      console.log(`🔄 测试 ${test.name} (${test.path})...`)
      const response = await wmsAPI[test.method](test.params)
      console.log(`✅ ${test.name} 测试成功:`, response)
      results.push({
        name: test.name,
        path: test.path,
        status: 'success',
        response: response
      })
    } catch (error) {
      console.error(`❌ ${test.name} 测试失败:`, error)
      results.push({
        name: test.name,
        path: test.path,
        status: 'error',
        error: error.message || error
      })
    }
  }
  
  return results
}

/**
 * 测试所有新API路径
 */
export async function testAllNewPaths() {
  console.log('🚀 开始测试所有新API路径...')
  console.log('=====================================')
  
  const inventoryResults = await testInventoryPaths()
  const outboundResults = await testOutboundPaths()
  
  const allResults = [...inventoryResults, ...outboundResults]
  
  console.log('=====================================')
  console.log('📊 测试结果汇总:')
  console.log('=====================================')
  
  const successCount = allResults.filter(r => r.status === 'success').length
  const errorCount = allResults.filter(r => r.status === 'error').length
  
  console.log(`✅ 成功: ${successCount}/${allResults.length}`)
  console.log(`❌ 失败: ${errorCount}/${allResults.length}`)
  
  if (errorCount > 0) {
    console.log('\n❌ 失败的接口:')
    allResults
      .filter(r => r.status === 'error')
      .forEach(r => {
        console.log(`  - ${r.name} (${r.path}): ${r.error}`)
      })
  }
  
  if (successCount > 0) {
    console.log('\n✅ 成功的接口:')
    allResults
      .filter(r => r.status === 'success')
      .forEach(r => {
        console.log(`  - ${r.name} (${r.path})`)
      })
  }
  
  console.log('=====================================')
  
  return {
    total: allResults.length,
    success: successCount,
    error: errorCount,
    results: allResults
  }
}

/**
 * 浏览器控制台友好的测试方法
 */
export function createConsoleTestMethods() {
  // 全局方法，可以在浏览器控制台直接调用
  window.testNewAPIPaths = testAllNewPaths
  window.testInventoryAPIs = testInventoryPaths
  window.testOutboundAPIs = testOutboundPaths
  
  console.log('🎯 API路径测试方法已加载到浏览器控制台:')
  console.log('  - testNewAPIPaths() : 测试所有新API路径')
  console.log('  - testInventoryAPIs() : 测试库存管理API')
  console.log('  - testOutboundAPIs() : 测试出库管理API')
  console.log('\n示例用法: await testNewAPIPaths()')
}

// 在开发环境下自动加载到控制台
if (import.meta.env.DEV) {
  createConsoleTestMethods()
} 