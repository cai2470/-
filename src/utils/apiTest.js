/**
 * 小神龙WMS API连通性测试工具
 * 用于测试前后端连接状态和数据传输
 */

import { wmsAPI } from './api.js'
import { ElMessage } from 'element-plus'

export class APIConnectionTest {
  constructor() {
    this.results = {
      connection: false,
      authentication: false,
      dataFetch: false,
      errors: []
    }
  }

  /**
   * 完整的API连通性测试
   */
  async runFullTest() {
    console.log('🔍 开始完整的API连通性测试...')
    this.resetResults()

    try {
      // 1. 测试基础连接
      await this.testConnection()
      
      // 2. 测试认证功能
      await this.testAuthentication()
      
      // 3. 测试数据获取
      await this.testDataFetch()
      
      // 4. 显示测试结果
      this.showResults()
      
      return this.results
    } catch (error) {
      console.error('❌ API测试过程中出现错误:', error)
      this.results.errors.push(`测试过程错误: ${error.message}`)
      return this.results
    }
  }

  /**
   * 测试基础连接
   */
  async testConnection() {
    console.log('🔗 测试1: 基础连接...')
    try {
      // 测试健康检查接口
      const response = await wmsAPI.healthCheck()
      console.log('✅ 基础连接成功:', response)
      this.results.connection = true
      
      // 测试API测试接口
      try {
        const testResponse = await wmsAPI.apiTest()
        console.log('✅ API测试接口响应:', testResponse)
      } catch (error) {
        console.warn('⚠️ API测试接口失败（非关键）:', error.message)
      }
      
    } catch (error) {
      console.error('❌ 基础连接失败:', error)
      this.results.connection = false
      this.results.errors.push(`连接失败: ${error.message}`)
      
      // 如果基础连接失败，检查后端服务状态
      this.checkBackendStatus()
    }
  }

  /**
   * 测试认证功能
   */
  async testAuthentication() {
    console.log('🔐 测试2: 认证功能...')
    
    // 预设测试账户
    const testAccounts = [
      { username: 'admin', password: 'admin123' },
      { username: 'manager', password: 'manager123' },
      { username: 'operator', password: 'operator123' }
    ]

    for (const account of testAccounts) {
      try {
        console.log(`🔄 尝试登录: ${account.username}`)
        const loginResult = await wmsAPI.login(account)
        
        if (loginResult && loginResult.success) {
          console.log(`✅ ${account.username} 登录成功`)
          this.results.authentication = true
          
          // 测试Token是否有效
          try {
            const userInfo = await wmsAPI.getCurrentUser()
            console.log('✅ Token验证成功，用户信息:', userInfo)
          } catch (tokenError) {
            console.warn('⚠️ Token验证失败:', tokenError.message)
          }
          
          break // 成功一个就够了
        }
      } catch (error) {
        console.warn(`⚠️ ${account.username} 登录失败:`, error.message)
        this.results.errors.push(`${account.username}登录失败: ${error.message}`)
      }
    }
    
    if (!this.results.authentication) {
      console.error('❌ 所有测试账户登录失败')
      this.results.errors.push('认证功能测试失败：所有预设账户都无法登录')
    }
  }

  /**
   * 测试数据获取
   */
  async testDataFetch() {
    console.log('📊 测试3: 数据获取功能...')
    
    const testApis = [
      { name: '用户列表', method: 'getUsers' },
      { name: '商品列表', method: 'getProducts' },
      { name: '仓库列表', method: 'getWarehouses' },
      { name: '库存列表', method: 'getInventoryStock' },
      { name: '入库订单', method: 'getInboundOrders' },
      { name: '出库订单', method: 'getOutboundOrders' }
    ]

    let successCount = 0
    
    for (const api of testApis) {
      try {
        console.log(`🔄 测试${api.name}接口...`)
        const result = await wmsAPI[api.method]({ page: 1, page_size: 5 })
        
        if (result) {
          console.log(`✅ ${api.name}接口成功:`, {
            type: typeof result,
            isArray: Array.isArray(result),
            hasResults: !!(result.results || result.length),
            count: result.count || result.length || 0
          })
          successCount++
        }
      } catch (error) {
        console.warn(`⚠️ ${api.name}接口失败:`, error.message)
        this.results.errors.push(`${api.name}接口失败: ${error.message}`)
      }
    }
    
    this.results.dataFetch = successCount > 0
    console.log(`📊 数据获取测试完成: ${successCount}/${testApis.length} 个接口成功`)
  }

  /**
   * 检查后端服务状态
   */
  checkBackendStatus() {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    console.log(`🔍 检查后端服务状态: ${backendUrl}`)
    
    // 提供诊断信息
    const diagnostics = [
      `🌐 后端地址: ${backendUrl}`,
      `🔧 请确认后端服务已启动: python manage.py runserver`,
      `📱 可访问管理界面: ${backendUrl}/admin/`,
      `📖 可访问API文档: ${backendUrl}/swagger/`,
      `🧪 可访问测试接口: ${backendUrl}/api/test/`
    ]
    
    diagnostics.forEach(msg => console.log(msg))
    this.results.errors.push('后端连接失败，请检查服务状态')
  }

  /**
   * 重置测试结果
   */
  resetResults() {
    this.results = {
      connection: false,
      authentication: false,
      dataFetch: false,
      errors: []
    }
  }

  /**
   * 显示测试结果
   */
  showResults() {
    console.log('\n📋 API连通性测试结果:')
    console.log('=====================================')
    console.log(`🔗 基础连接: ${this.results.connection ? '✅ 成功' : '❌ 失败'}`)
    console.log(`🔐 认证功能: ${this.results.authentication ? '✅ 成功' : '❌ 失败'}`)
    console.log(`📊 数据获取: ${this.results.dataFetch ? '✅ 成功' : '❌ 失败'}`)
    
    if (this.results.errors.length > 0) {
      console.log('\n⚠️ 发现的问题:')
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    }
    
    // 总体评估
    const successCount = [
      this.results.connection,
      this.results.authentication,
      this.results.dataFetch
    ].filter(Boolean).length
    
    const status = successCount === 3 ? '完全正常' : 
                   successCount === 2 ? '基本正常' :
                   successCount === 1 ? '部分可用' : '连接失败'
    
    console.log(`\n🎯 总体状态: ${status} (${successCount}/3)`)
    console.log('=====================================\n')
    
    // 用户提示
    if (successCount === 3) {
      ElMessage.success('🎉 API连接测试完全成功！前后端对接正常')
    } else if (successCount >= 1) {
      ElMessage.warning(`⚠️ API部分功能正常 (${successCount}/3)，请检查错误信息`)
    } else {
      ElMessage.error('❌ API连接测试失败，请检查后端服务状态')
    }
  }

  /**
   * 快速连接测试（仅测试基础连接）
   */
  async quickTest() {
    console.log('⚡ 快速连接测试...')
    try {
      const isConnected = await wmsAPI.testConnection()
      if (isConnected) {
        console.log('✅ 后端服务连接正常')
        ElMessage.success('后端服务连接正常')
        return true
      } else {
        console.log('❌ 后端服务连接失败')
        ElMessage.error('后端服务连接失败，请检查服务状态')
        return false
      }
    } catch (error) {
      console.error('❌ 快速测试失败:', error)
      ElMessage.error(`连接测试失败: ${error.message}`)
      return false
    }
  }

  /**
   * 登录功能专项测试
   */
  async testLoginOnly(username = 'admin', password = 'admin123') {
    console.log(`🔐 专项测试登录功能: ${username}`)
    try {
      const result = await wmsAPI.login({ username, password })
      if (result && result.success) {
        console.log('✅ 登录测试成功:', result)
        ElMessage.success(`登录测试成功: ${username}`)
        return result
      } else {
        throw new Error('登录响应异常')
      }
    } catch (error) {
      console.error('❌ 登录测试失败:', error)
      ElMessage.error(`登录测试失败: ${error.message}`)
      throw error
    }
  }
}

// 创建全局测试实例
export const apiTest = new APIConnectionTest()

// 便捷方法导出
export const testAPI = () => apiTest.runFullTest()
export const quickTestAPI = () => apiTest.quickTest()
export const testLogin = (username, password) => apiTest.testLoginOnly(username, password)

// 浏览器控制台友好的全局方法
if (typeof window !== 'undefined') {
  window.testWmsAPI = testAPI
  window.testWmsConnection = quickTestAPI
  window.testWmsLogin = testLogin
} 