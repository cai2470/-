/**
 * 小神龙仓库管理系统 API 接口工具类
 * 基于官方API文档 v1.0.0
 * 基础URL: https://jdegylyrnsyf.sealoshzh.site
 */

import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import router from '@/router'

// API 基础配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://jdegylyrnsyf.sealoshzh.site',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// 创建axios实例
const apiClient = axios.create(API_CONFIG)

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('wms_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 显示加载状态
    if (config.showLoading !== false) {
      config.loadingInstance = ElLoading.service({
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.data || config.params)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 关闭加载状态
    if (response.config.loadingInstance) {
      response.config.loadingInstance.close()
    }
    
    const { data } = response
    console.log('✅ API Response:', response.config.url, data)
    
    // 根据API文档的响应格式处理
    if (data.success === false) {
      ElMessage.error(data.error || '请求失败')
      return Promise.reject(new Error(data.error || '请求失败'))
    }
    
    return data
  },
  (error) => {
    // 关闭加载状态
    if (error.config?.loadingInstance) {
      error.config.loadingInstance.close()
    }
    
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message)
    
    // 处理HTTP状态码
    const status = error.response?.status
    const message = error.response?.data?.error || error.message
    
    switch (status) {
      case 401:
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('wms_access_token')
        localStorage.removeItem('wms_refresh_token')
        localStorage.removeItem('wms_user_info')
        router.push('/login')
        break
      case 403:
        ElMessage.error('权限不足，请联系管理员')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器内部错误，请联系技术支持')
        break
      default:
        ElMessage.error(message || `请求失败 (${status})`)
    }
    
    return Promise.reject(error)
  }
)

/**
 * 小神龙WMS API 类
 */
class WmsAPI {
  
  // ==================== 系统接口 ====================
  
  /**
   * 健康检查
   * GET /
   */
  async healthCheck() {
    return await apiClient.get('/', { showLoading: false })
  }
  
  /**
   * 获取API信息
   * GET /api/
   */
  async getApiInfo() {
    return await apiClient.get('/api/', { showLoading: false })
  }
  
  // ==================== 认证接口 ====================
  
  /**
   * 用户注册
   * POST /api/auth/register/
   */
  async register(userData) {
    const { username, email, password } = userData
    return await apiClient.post('/api/auth/register/', {
      username,
      email, 
      password
    })
  }
  
  /**
   * 用户登录
   * POST /api/auth/login/
   */
  async login(credentials) {
    const { username, password } = credentials
    const response = await apiClient.post('/api/auth/login/', {
      username,
      password
    })
    
    // 保存认证信息
    if (response.success && response.tokens) {
      localStorage.setItem('wms_access_token', response.tokens.access)
      localStorage.setItem('wms_refresh_token', response.tokens.refresh)
      localStorage.setItem('wms_user_info', JSON.stringify(response.user))
      
      ElMessage.success('登录成功')
      console.log('✅ 登录成功，用户信息已保存')
    }
    
    return response
  }
  
  /**
   * 用户登出
   * POST /api/auth/logout/
   */
  async logout() {
    try {
      await apiClient.post('/api/auth/logout/')
    } catch (error) {
      console.warn('登出API调用失败，继续清理本地数据')
    } finally {
      // 清理本地存储
      localStorage.removeItem('wms_access_token')
      localStorage.removeItem('wms_refresh_token')
      localStorage.removeItem('wms_user_info')
      
      ElMessage.success('已安全登出')
      console.log('🔓 用户已登出，本地数据已清理')
    }
  }
  
  /**
   * 获取当前用户信息
   * GET /api/auth/user/
   */
  async getCurrentUser() {
    return await apiClient.get('/api/auth/user/')
  }
  
  // ==================== 业务接口 ====================
  
  /**
   * 获取商品列表
   * GET /api/products/
   */
  async getProducts(params = {}) {
    const queryParams = {
      page: params.page || 1,
      page_size: params.pageSize || 20,
      search: params.search || '',
      category: params.category || ''
    }
    
    // 移除空值参数
    Object.keys(queryParams).forEach(key => {
      if (!queryParams[key]) delete queryParams[key]
    })
    
    return await apiClient.get('/api/products/', { 
      params: queryParams,
      showLoading: false 
    })
  }
  
  /**
   * 获取库存信息
   * GET /api/inventory/
   */
  async getInventory(params = {}) {
    const queryParams = {
      product_id: params.productId,
      low_stock: params.lowStock
    }
    
    // 移除空值参数
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === '') {
        delete queryParams[key]
      }
    })
    
    return await apiClient.get('/api/inventory/', { 
      params: queryParams,
      showLoading: false 
    })
  }
  
  // ==================== 测试接口 ====================
  
  /**
   * 受保护接口测试
   * GET /api/test/protected/
   */
  async testProtected() {
    return await apiClient.get('/api/test/protected/')
  }
  
  /**
   * GET请求测试
   * GET /api/test/get/
   */
  async testGet(params = {}) {
    return await apiClient.get('/api/test/get/', { 
      params,
      showLoading: false 
    })
  }
  
  /**
   * POST请求测试
   * POST /api/test/post/
   */
  async testPost(data = {}) {
    return await apiClient.post('/api/test/post/', data)
  }
  
  // ==================== 工具方法 ====================
  
  /**
   * 检查认证状态
   */
  isAuthenticated() {
    return !!localStorage.getItem('wms_access_token')
  }
  
  /**
   * 获取当前用户信息（从本地存储）
   */
  getCurrentUserLocal() {
    const userInfo = localStorage.getItem('wms_user_info')
    return userInfo ? JSON.parse(userInfo) : null
  }
  
  /**
   * 获取访问令牌
   */
  getAccessToken() {
    return localStorage.getItem('wms_access_token')
  }
  
  /**
   * 获取刷新令牌
   */
  getRefreshToken() {
    return localStorage.getItem('wms_refresh_token')
  }
  
  /**
   * 清理认证信息
   */
  clearAuthData() {
    localStorage.removeItem('wms_access_token')
    localStorage.removeItem('wms_refresh_token')
    localStorage.removeItem('wms_user_info')
  }
  
  /**
   * 测试API连接
   */
  async testConnection() {
    try {
      console.log('🔄 测试API连接...')
      const response = await this.healthCheck()
      console.log('✅ API连接正常:', response)
      ElMessage.success('API连接正常')
      return true
    } catch (error) {
      console.error('❌ API连接失败:', error)
      ElMessage.error('API连接失败，请检查网络或服务器状态')
      return false
    }
  }
}

// 创建API实例
const api = new WmsAPI()

// 默认导出
export default api

// 命名导出
export { api, apiClient, WmsAPI }

// 兼容旧版本的导出方式
export const wmsAPI = api 