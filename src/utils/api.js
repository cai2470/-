/**
 * 小神龙仓库管理系统 - 统一API接口工具
 * 版本: v2.0.0
 * 说明: 移除localStorage依赖，所有数据通过API获取
 */

import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import router from '@/router'

// API 基础配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  retryCount: parseInt(import.meta.env.VITE_API_RETRY_COUNT) || 3,
  headers: {
    'Content-Type': 'application/json'
  }
}

// 创建axios实例
const apiClient = axios.create(API_CONFIG)

// 请求重试配置
let retryQueue = new Map()

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('wms_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求标识
    config.requestId = `${config.method}_${config.url}_${Date.now()}`
    
    // 显示加载状态（可选）
    if (config.showLoading !== false) {
      config.loadingInstance = ElLoading.service({
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, {
        data: config.data,
        params: config.params,
        headers: config.headers
      })
    }
    
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
    
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.log('✅ API Response:', response.config.url, data)
    }
    
    // 统一响应格式处理
    if (data && data.success === false) {
      const errorMsg = data.error || data.message || '请求失败'
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
    
    // 返回响应数据
    return data
  },
  async (error) => {
    // 关闭加载状态
    if (error.config?.loadingInstance) {
      error.config.loadingInstance.close()
    }
    
    const { config, response } = error
    const status = response?.status
    const data = response?.data
    
    console.error('❌ API Error:', {
      status,
      url: config?.url,
      method: config?.method,
      data: data,
      message: error.message
    })
    
    // 处理特定状态码
    switch (status) {
      case 401:
        await handleUnauthorized()
        break
      case 403:
        ElMessage.error('权限不足，请联系管理员')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器内部错误，请稍后重试')
        break
      case 502:
      case 503:
      case 504:
        // 网络错误，尝试重试
        if (config && shouldRetry(config)) {
          return retry(config)
        }
        ElMessage.error('网络连接异常，请检查网络设置')
        break
      default:
        const errorMsg = data?.error || data?.message || error.message || `请求失败 (${status})`
        ElMessage.error(errorMsg)
    }
    
    return Promise.reject(error)
  }
)

// 处理401未授权
async function handleUnauthorized() {
  ElMessage.error('登录已过期，请重新登录')
  
  // 清理认证信息
  localStorage.removeItem('wms_access_token')
  localStorage.removeItem('wms_refresh_token')
  localStorage.removeItem('wms_user_info')
  
  // 跳转到登录页
  if (router.currentRoute.value.path !== '/login') {
    await router.push('/login')
  }
}

// 判断是否应该重试
function shouldRetry(config) {
  const retryCount = config.__retryCount || 0
  return retryCount < API_CONFIG.retryCount
}

// 请求重试
function retry(config) {
  config.__retryCount = (config.__retryCount || 0) + 1
  
  const delayTime = Math.pow(2, config.__retryCount) * 1000 // 指数退避
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`🔄 Retrying request (${config.__retryCount}/${API_CONFIG.retryCount}):`, config.url)
      resolve(apiClient(config))
    }, delayTime)
  })
}

/**
 * 小神龙WMS统一API类
 */
class WmsAPI {
  
  // ==================== 认证接口 ====================
  
  /**
   * 用户登录
   * POST /users/login/ 或 POST /api/auth/login/
   */
  async login(credentials) {
    try {
    const { username, password } = credentials
      
      // 尝试主要登录接口
      let response
      try {
        response = await apiClient.post('/users/login/', { username, password })
      } catch (error) {
        // 备用登录接口
        response = await apiClient.post('/api/auth/login/', { username, password })
      }
    
    // 保存认证信息
    if (response.success && response.tokens) {
      localStorage.setItem('wms_access_token', response.tokens.access)
      localStorage.setItem('wms_refresh_token', response.tokens.refresh)
      localStorage.setItem('wms_user_info', JSON.stringify(response.user))
      
      ElMessage.success('登录成功')
      console.log('✅ 登录成功，用户信息已保存')
    }
    
    return response
    } catch (error) {
      // 如果API失败且启用本地存储降级
      if (import.meta.env.VITE_ENABLE_LOCAL_STORAGE === 'true') {
        return this.loginFallback(credentials)
      }
      throw error
    }
  }
  
  /**
   * 登录降级方案（仅在开发时使用）
   */
  loginFallback(credentials) {
    console.warn('🔄 使用登录降级方案')
    
    const mockUsers = [
      { username: 'admin', password: 'admin123', role: 'admin', name: '系统管理员' },
      { username: 'manager', password: 'manager123', role: 'manager', name: '仓库经理' },
      { username: 'operator', password: 'operator123', role: 'operator', name: '操作员' },
      { username: 'testuser', password: '123456', role: 'staff', name: '测试用户' }
    ]
    
    const user = mockUsers.find(u => 
      u.username === credentials.username && u.password === credentials.password
    )
    
    if (user) {
      const mockTokens = {
        access: 'mock_access_token_' + Date.now(),
        refresh: 'mock_refresh_token_' + Date.now()
      }
      
      localStorage.setItem('wms_access_token', mockTokens.access)
      localStorage.setItem('wms_refresh_token', mockTokens.refresh)
      localStorage.setItem('wms_user_info', JSON.stringify({
        id: Math.floor(Math.random() * 1000),
        username: user.username,
        name: user.name,
        role: user.role
      }))
      
      ElMessage.success('登录成功（演示模式）')
      return {
        success: true,
        tokens: mockTokens,
        user: { username: user.username, name: user.name, role: user.role }
      }
    } else {
      throw new Error('用户名或密码错误')
    }
  }
  
  /**
   * 用户登出
   * POST /users/logout/ 或 POST /api/auth/logout/
   */
  async logout() {
    try {
      // 尝试调用登出接口
      try {
        await apiClient.post('/users/logout/')
      } catch (error) {
      await apiClient.post('/api/auth/logout/')
      }
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
   * GET /users/profile/
   */
  async getCurrentUser() {
    try {
      return await apiClient.get('/users/profile/')
    } catch (error) {
      // 降级：从本地存储获取
      const userInfo = localStorage.getItem('wms_user_info')
      if (userInfo) {
        return { success: true, user: JSON.parse(userInfo) }
      }
      throw error
    }
  }
  
  /**
   * 刷新令牌
   * POST /api/auth/refresh/
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('wms_refresh_token')
    if (!refreshToken) {
      throw new Error('没有刷新令牌')
    }
    
    const response = await apiClient.post('/api/auth/refresh/', {
      refresh: refreshToken
    })
    
    if (response.access) {
      localStorage.setItem('wms_access_token', response.access)
      if (response.refresh) {
        localStorage.setItem('wms_refresh_token', response.refresh)
      }
    }
    
    return response
  }
  
  // ==================== 用户管理接口 ====================
  
  /**
   * 获取用户列表
   * GET /users/users/
   */
  async getUsers(params = {}) {
    return await apiClient.get('/users/users/', { params })
  }
  
  /**
   * 创建用户
   * POST /users/users/
   */
  async createUser(userData) {
    return await apiClient.post('/users/users/', userData)
  }
  
  /**
   * 更新用户
   * PUT /users/users/{id}/
   */
  async updateUser(id, userData) {
    return await apiClient.put(`/users/users/${id}/`, userData)
  }
  
  /**
   * 删除用户
   * DELETE /users/users/{id}/
   */
  async deleteUser(id) {
    return await apiClient.delete(`/users/users/${id}/`)
  }
  
  /**
   * 修改密码
   * POST /users/change-password/
   */
  async changePassword(passwords) {
    return await apiClient.post('/users/change-password/', passwords)
  }
  
  // ==================== 角色权限接口 ====================
  
  /**
   * 获取角色列表
   * GET /api/users/roles/
   */
  async getRoles(params = {}) {
    return await apiClient.get('/api/users/roles/', { params })
  }
  
  /**
   * 创建角色
   * POST /api/users/roles/
   */
  async createRole(roleData) {
    return await apiClient.post('/api/users/roles/', roleData)
  }
  
  /**
   * 更新角色
   * PUT /api/users/roles/{id}/
   */
  async updateRole(id, roleData) {
    return await apiClient.put(`/api/users/roles/${id}/`, roleData)
  }
  
  /**
   * 删除角色
   * DELETE /api/users/roles/{id}/
   */
  async deleteRole(id) {
    return await apiClient.delete(`/api/users/roles/${id}/`)
  }
  
  /**
   * 获取权限列表
   * GET /api/users/permissions/
   */
  async getPermissions(params = {}) {
    return await apiClient.get('/api/users/permissions/', { params })
  }
  
  /**
   * 获取权限树
   * GET /api/users/permissions/tree/
   */
  async getPermissionTree() {
    return await apiClient.get('/api/users/permissions/tree/')
  }
  
  /**
   * 更新角色权限
   * POST /api/users/roles/{id}/permissions/
   */
  async updateRolePermissions(roleId, permissionIds) {
    return await apiClient.post(`/api/users/roles/${roleId}/permissions/`, {
      permissions: permissionIds
    })
  }
  
  // ==================== 员工管理接口 ====================
  
  /**
   * 获取员工列表
   * GET /api/staff/
   */
  async getStaff(params = {}) {
    return await apiClient.get('/api/staff/', { params })
  }
  
  /**
   * 创建员工
   * POST /api/staff/
   */
  async createStaff(staffData) {
    return await apiClient.post('/api/staff/', staffData)
  }
  
  /**
   * 更新员工
   * PUT /api/staff/{id}/
   */
  async updateStaff(id, staffData) {
    return await apiClient.put(`/api/staff/${id}/`, staffData)
  }
  
  /**
   * 删除员工
   * DELETE /api/staff/{id}/
   */
  async deleteStaff(id) {
    return await apiClient.delete(`/api/staff/${id}/`)
  }
  
  /**
   * 员工状态变更
   * PUT /api/staff/{id}/status/
   */
  async updateStaffStatus(id, statusData) {
    return await apiClient.put(`/api/staff/${id}/status/`, statusData)
  }
  
  // ==================== 商品管理接口 ====================
  
  /**
   * 获取商品列表
   * GET /products/products/ 或 GET /api/products/
   */
  async getProducts(params = {}) {
    try {
      return await apiClient.get('/products/products/', { params })
    } catch (error) {
      return await apiClient.get('/api/products/', { params })
    }
  }
  
  /**
   * 创建商品
   * POST /products/products/
   */
  async createProduct(productData) {
    return await apiClient.post('/products/products/', productData)
  }
  
  /**
   * 更新商品
   * PUT /products/products/{id}/
   */
  async updateProduct(id, productData) {
    return await apiClient.put(`/products/products/${id}/`, productData)
  }
  
  /**
   * 删除商品
   * DELETE /products/products/{id}/
   */
  async deleteProduct(id) {
    return await apiClient.delete(`/products/products/${id}/`)
  }
  
  /**
   * 获取商品分类
   * GET /products/categories/
   */
  async getCategories(params = {}) {
    return await apiClient.get('/products/categories/', { params })
  }
  
  /**
   * 创建商品分类
   * POST /products/categories/
   */
  async createCategory(categoryData) {
    return await apiClient.post('/products/categories/', categoryData)
  }
  
  /**
   * 获取品牌列表
   * GET /products/brands/
   */
  async getBrands(params = {}) {
    return await apiClient.get('/products/brands/', { params })
  }
  
  /**
   * 创建品牌
   * POST /products/brands/
   */
  async createBrand(brandData) {
    return await apiClient.post('/products/brands/', brandData)
  }
  
  /**
   * 获取供应商列表
   * GET /products/suppliers/
   */
  async getSuppliers(params = {}) {
    return await apiClient.get('/products/suppliers/', { params })
  }
  
  /**
   * 创建供应商
   * POST /products/suppliers/
   */
  async createSupplier(supplierData) {
    return await apiClient.post('/products/suppliers/', supplierData)
  }
  
  // ==================== 仓库管理接口 ====================
  
  /**
   * 获取仓库列表
   * GET /warehouse/warehouses/
   */
  async getWarehouses(params = {}) {
    return await apiClient.get('/warehouse/warehouses/', { params })
  }
  
  /**
   * 创建仓库
   * POST /warehouse/warehouses/
   */
  async createWarehouse(warehouseData) {
    return await apiClient.post('/warehouse/warehouses/', warehouseData)
  }
  
  /**
   * 获取库区列表
   * GET /warehouse/zones/
   */
  async getZones(params = {}) {
    return await apiClient.get('/warehouse/zones/', { params })
  }
  
  /**
   * 创建库区
   * POST /warehouse/zones/
   */
  async createZone(zoneData) {
    return await apiClient.post('/warehouse/zones/', zoneData)
  }
  
  /**
   * 获取库位列表
   * GET /warehouse/locations/
   */
  async getLocations(params = {}) {
    return await apiClient.get('/warehouse/locations/', { params })
  }
  
  /**
   * 创建库位
   * POST /warehouse/locations/
   */
  async createLocation(locationData) {
    return await apiClient.post('/warehouse/locations/', locationData)
  }
  
  // ==================== 库存管理接口 ====================
  
  /**
   * 获取库存列表
   * GET /api/inventory/stock/
   */
  async getInventoryStock(params = {}) {
    return await apiClient.get('/api/inventory/stock/', { params })
  }
  
  /**
   * 库存调整
   * POST /api/inventory/stock/adjust/
   */
  async adjustStock(adjustData) {
    return await apiClient.post('/api/inventory/stock/adjust/', adjustData)
  }
  
  /**
   * 获取库存预警
   * GET /api/inventory/alerts/
   */
  async getInventoryAlerts(params = {}) {
    return await apiClient.get('/api/inventory/alerts/', { params })
  }
  
  /**
   * 处理库存预警
   * POST /api/inventory/alerts/{id}/handle/
   */
  async handleAlert(id, handleData) {
    return await apiClient.post(`/api/inventory/alerts/${id}/handle/`, handleData)
  }
  
  /**
   * 获取库存移动记录
   * GET /api/inventory/movements/
   */
  async getInventoryMovements(params = {}) {
    return await apiClient.get('/api/inventory/movements/', { params })
  }
  
  /**
   * 获取盘点任务
   * GET /api/inventory/count/
   */
  async getInventoryCount(params = {}) {
    return await apiClient.get('/api/inventory/count/', { params })
  }
  
  /**
   * 创建盘点任务
   * POST /api/inventory/count/
   */
  async createInventoryCount(countData) {
    return await apiClient.post('/api/inventory/count/', countData)
  }
  
  // ==================== 入库管理接口 ====================
  
  /**
   * 获取入库单列表
   * GET /inbound/purchase-orders/
   */
  async getInboundOrders(params = {}) {
    return await apiClient.get('/inbound/purchase-orders/', { params })
  }
  
  /**
   * 创建入库单
   * POST /inbound/purchase-orders/
   */
  async createInboundOrder(orderData) {
    return await apiClient.post('/inbound/purchase-orders/', orderData)
  }
  
  /**
   * 确认收货
   * POST /inbound/purchase-orders/{id}/confirm_receive/
   */
  async confirmReceive(id, receiveData) {
    return await apiClient.post(`/inbound/purchase-orders/${id}/confirm_receive/`, receiveData)
  }
  
  /**
   * 获取退货单列表
   * GET /api/inbound/returns/
   */
  async getReturnOrders(params = {}) {
    return await apiClient.get('/api/inbound/returns/', { params })
  }
  
  /**
   * 创建退货单
   * POST /api/inbound/returns/
   */
  async createReturnOrder(returnData) {
    return await apiClient.post('/api/inbound/returns/', returnData)
  }
  
  /**
   * 处理退货
   * POST /api/inbound/returns/{id}/process/
   */
  async processReturn(id, processData) {
    return await apiClient.post(`/api/inbound/returns/${id}/process/`, processData)
  }
  
  /**
   * 获取调拨入库单列表
   * GET /api/inbound/transfers/
   */
  async getTransferInOrders(params = {}) {
    return await apiClient.get('/api/inbound/transfers/', { params })
  }
  
  /**
   * 创建调拨入库单
   * POST /api/inbound/transfers/
   */
  async createTransferInOrder(transferData) {
    return await apiClient.post('/api/inbound/transfers/', transferData)
  }
  
  /**
   * 确认调拨入库
   * POST /api/inbound/transfers/{id}/confirm/
   */
  async confirmTransferIn(id, confirmData) {
    return await apiClient.post(`/api/inbound/transfers/${id}/confirm/`, confirmData)
  }
  
  // ==================== 出库管理接口 ====================
  
  /**
   * 获取出库单列表
   * GET /api/outbound/orders/
   */
  async getOutboundOrders(params = {}) {
    return await apiClient.get('/api/outbound/orders/', { params })
  }
  
  /**
   * 创建出库单
   * POST /api/outbound/orders/
   */
  async createOutboundOrder(orderData) {
    return await apiClient.post('/api/outbound/orders/', orderData)
  }
  
  /**
   * 更新出库单
   * PUT /api/outbound/orders/{id}/
   */
  async updateOutboundOrder(id, orderData) {
    return await apiClient.put(`/api/outbound/orders/${id}/`, orderData)
  }
  
  /**
   * 删除出库单
   * DELETE /api/outbound/orders/{id}/
   */
  async deleteOutboundOrder(id) {
    return await apiClient.delete(`/api/outbound/orders/${id}/`)
  }
  
  /**
   * 确认出库
   * POST /api/outbound/orders/{id}/confirm/
   */
  async confirmOutbound(id) {
    return await apiClient.post(`/api/outbound/orders/${id}/confirm/`)
  }
  
  /**
   * 确认出库单 (别名)
   */
  async confirmOutboundOrder(id) {
    return await this.confirmOutbound(id)
  }
  
  /**
   * 获取出库统计
   * GET /api/outbound/orders/stats/
   */
  async getOutboundStats() {
    return await apiClient.get('/api/outbound/orders/stats/')
  }
  
  /**
   * 批量开始拣货
   * POST /api/outbound/picking/batch_start/
   */
  async batchStartPicking(orderIds) {
    return await apiClient.post('/api/outbound/picking/batch_start/', {
      order_ids: orderIds
    })
  }
  
  /**
   * 批量完成拣货
   * POST /api/outbound/picking/batch_complete/
   */
  async batchCompletePicking(orderIds) {
    return await apiClient.post('/api/outbound/picking/batch_complete/', {
      order_ids: orderIds
    })
  }
  
  /**
   * 批量完成打包
   * POST /api/outbound/packing/batch_complete/
   */
  async batchCompletePacking(orderIds) {
    return await apiClient.post('/api/outbound/packing/batch_complete/', {
      order_ids: orderIds
    })
  }
  
  /**
   * 批量确认发货
   * POST /api/outbound/shipping/batch_confirm/
   */
  async batchConfirmShipping(orderIds) {
    return await apiClient.post('/api/outbound/shipping/batch_confirm/', {
      order_ids: orderIds
    })
  }
  
  /**
   * 开始拣货
   * POST /api/outbound/picking/{id}/start/
   */
  async startPicking(id, pickerData) {
    return await apiClient.post(`/api/outbound/picking/${id}/start/`, pickerData)
  }
  
  /**
   * 扫码确认拣货
   * POST /api/outbound/picking/{id}/scan/
   */
  async scanPickingItem(id, scanData) {
    return await apiClient.post(`/api/outbound/picking/${id}/scan/`, scanData)
  }
  
  /**
   * 完成拣货
   * POST /api/outbound/picking/{id}/complete/
   */
  async completePicking(id) {
    return await apiClient.post(`/api/outbound/picking/${id}/complete/`)
  }
  
  /**
   * 开始打包
   * POST /api/outbound/packing/{id}/start/
   */
  async startPacking(id, packerData) {
    return await apiClient.post(`/api/outbound/packing/${id}/start/`, packerData)
  }
  
  /**
   * 完成打包
   * POST /api/outbound/packing/{id}/complete/
   */
  async completePacking(id, packingData) {
    return await apiClient.post(`/api/outbound/packing/${id}/complete/`, packingData)
  }
  
  /**
   * 开始发货
   * POST /api/outbound/shipping/{id}/start/
   */
  async startShipping(id, shippingData) {
    return await apiClient.post(`/api/outbound/shipping/${id}/start/`, shippingData)
  }
  
  /**
   * 确认发货
   * POST /api/outbound/shipping/{id}/confirm/
   */
  async confirmShipping(id) {
    return await apiClient.post(`/api/outbound/shipping/${id}/confirm/`)
  }
  
  /**
   * 获取销售出库单列表
   * GET /api/outbound/sales/
   */
  async getSalesOutbound(params = {}) {
    return await apiClient.get('/api/outbound/sales/', { params })
  }
  
  /**
   * 创建销售出库单
   * POST /api/outbound/sales/
   */
  async createSalesOutbound(salesData) {
    return await apiClient.post('/api/outbound/sales/', salesData)
  }
  
  /**
   * 获取调拨出库单列表
   * GET /api/outbound/transfers/
   */
  async getTransferOutbound(params = {}) {
    return await apiClient.get('/api/outbound/transfers/', { params })
  }
  
  /**
   * 创建调拨出库单
   * POST /api/outbound/transfers/
   */
  async createTransferOutbound(transferData) {
    return await apiClient.post('/api/outbound/transfers/', transferData)
  }
  
  // ==================== 报表分析接口 ====================
  
  /**
   * 获取概览数据
   * GET /api/reports/overview/
   */
  async getReportsOverview() {
    return await apiClient.get('/api/reports/overview/')
  }
  
  /**
   * 获取入库报表
   * GET /api/reports/inbound/
   */
  async getInboundReport(params = {}) {
    return await apiClient.get('/api/reports/inbound/', { params })
  }
  
  /**
   * 获取出库报表
   * GET /api/reports/outbound/
   */
  async getOutboundReport(params = {}) {
    return await apiClient.get('/api/reports/outbound/', { params })
  }
  
  /**
   * 获取库存报表
   * GET /api/reports/inventory/
   */
  async getInventoryReport(params = {}) {
    return await apiClient.get('/api/reports/inventory/', { params })
  }
  
  // ==================== 质检管理接口 ====================
  
  /**
   * 获取质检列表
   * GET /api/quality/inspections/
   */
  async getInspections(params = {}) {
    return await apiClient.get('/api/quality/inspections/', { params })
  }
  
  /**
   * 开始质检
   * POST /api/quality/inspections/{id}/start/
   */
  async startInspection(id, inspectorData) {
    return await apiClient.post(`/api/quality/inspections/${id}/start/`, inspectorData)
  }
  
  /**
   * 完成质检
   * POST /api/quality/inspections/{id}/complete/
   */
  async completeInspection(id, inspectionData) {
    return await apiClient.post(`/api/quality/inspections/${id}/complete/`, inspectionData)
  }
  
  /**
   * 批量质检
   * POST /api/quality/inspections/batch_inspect/
   */
  async batchInspect(inspectionIds, inspectionData) {
    return await apiClient.post('/api/quality/inspections/batch_inspect/', {
      inspection_ids: inspectionIds,
      ...inspectionData
    })
  }
  
  /**
   * 获取质检统计
   * GET /api/quality/inspections/stats/
   */
  async getInspectionStats() {
    return await apiClient.get('/api/quality/inspections/stats/')
  }
  
  /**
   * 获取质检报告
   * GET /api/quality/inspections/{id}/report/
   */
  async getInspectionReport(id) {
    return await apiClient.get(`/api/quality/inspections/${id}/report/`)
  }
  
  /**
   * 打印质检报告
   * GET /api/quality/inspections/{id}/print/
   */
  async printInspectionReport(id) {
    return await apiClient.get(`/api/quality/inspections/${id}/print/`, {
      responseType: 'blob'
    })
  }
  
  // ==================== 系统管理接口 ====================
  
  /**
   * 获取系统日志
   * GET /api/system/logs/
   */
  async getSystemLogs(params = {}) {
    return await apiClient.get('/api/system/logs/', { params })
  }
  
  /**
   * 获取操作日志
   * GET /api/system/operation_logs/
   */
  async getOperationLogs(params = {}) {
    return await apiClient.get('/api/system/operation_logs/', { params })
  }
  
  /**
   * 获取登录日志
   * GET /api/system/login_logs/
   */
  async getLoginLogs(params = {}) {
    return await apiClient.get('/api/system/login_logs/', { params })
  }
  
  /**
   * 获取系统状态
   * GET /api/system/monitor/status/
   */
  async getSystemStatus() {
    return await apiClient.get('/api/system/monitor/status/')
  }
  
  /**
   * 获取性能指标
   * GET /api/system/monitor/metrics/
   */
  async getPerformanceMetrics() {
    return await apiClient.get('/api/system/monitor/metrics/')
  }
  
  /**
   * 备份数据库
   * POST /api/system/backup/
   */
  async createBackup(backupData) {
    return await apiClient.post('/api/system/backup/', backupData)
  }
  
  /**
   * 获取备份列表
   * GET /api/system/backup/
   */
  async getBackupList(params = {}) {
    return await apiClient.get('/api/system/backup/', { params })
  }
  
  /**
   * 恢复备份
   * POST /api/system/backup/{id}/restore/
   */
  async restoreBackup(id) {
    return await apiClient.post(`/api/system/backup/${id}/restore/`)
  }
  
  /**
   * 删除备份
   * DELETE /api/system/backup/{id}/
   */
  async deleteBackup(id) {
    return await apiClient.delete(`/api/system/backup/${id}/`)
  }
  
  /**
   * API测试
   * GET /api/test/
   */
  async apiTest() {
    return await apiClient.get('/api/test/')
  }
  
  /**
   * 批量导入数据
   * POST /api/system/import/
   */
  async importData(importData) {
    return await apiClient.post('/api/system/import/', importData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
  
  /**
   * 导出数据
   * GET /api/system/export/
   */
  async exportData(params = {}) {
    return await apiClient.get('/api/system/export/', {
      params,
      responseType: 'blob'
    })
  }
  
  // ==================== 测试接口 ====================
  
  /**
   * 健康检查
   * GET /
   */
  async healthCheck() {
    return await apiClient.get('/', { showLoading: false })
  }
  
  /**
   * 测试保护接口
   * GET /api/test/protected/
   */
  async testProtected() {
    return await apiClient.get('/api/test/protected/')
  }
  
  /**
   * 连接测试
   */
  async testConnection() {
    try {
      const response = await this.healthCheck()
      console.log('✅ API连接测试成功:', response)
      return true
    } catch (error) {
      console.error('❌ API连接测试失败:', error)
      return false
    }
  }
  
  // ==================== 工具方法 ====================
  
  /**
   * 检查是否已认证
   */
  isAuthenticated() {
    return !!localStorage.getItem('wms_access_token')
  }
  
  /**
   * 获取本地用户信息
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
   * 清理认证数据
   */
  clearAuthData() {
    localStorage.removeItem('wms_access_token')
    localStorage.removeItem('wms_refresh_token')
    localStorage.removeItem('wms_user_info')
  }
}

// 创建API实例
const wmsAPI = new WmsAPI()

// 默认导出
export default wmsAPI

// 具名导出
export { wmsAPI, apiClient } 