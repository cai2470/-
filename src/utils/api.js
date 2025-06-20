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
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      message: error.message
    })

    // 🔧 改进错误处理：显示具体的验证错误
    if (error.response?.status === 400 && error.response?.data) {
      const errorData = error.response.data
      let errorMessage = '请求参数错误：\n'
      
      // 处理DRF标准错误格式
      if (typeof errorData === 'object') {
        if (errorData.non_field_errors) {
          errorMessage += errorData.non_field_errors.join('\n')
        } else {
          // 处理字段级错误
          const fieldErrors = []
          Object.entries(errorData).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`)
            } else if (typeof errors === 'string') {
              fieldErrors.push(`${field}: ${errors}`)
            }
          })
          
          if (fieldErrors.length > 0) {
            errorMessage += fieldErrors.join('\n')
          } else {
            errorMessage += JSON.stringify(errorData, null, 2)
          }
        }
      } else {
        errorMessage += errorData
      }
      
      ElMessage.error({
        message: errorMessage,
        duration: 5000,
        showClose: true
      })
    } else if (error.response?.status === 401) {
      ElMessage.error('认证失败，请重新登录')
      // 跳转到登录页面
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足，无法访问该资源')
    } else if (error.response?.status === 404) {
      ElMessage.error('请求的资源不存在')
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器内部错误，请稍后重试')
    } else {
      ElMessage.error(error.message || '网络错误')
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
  
  // ==================== 数据转换和验证函数 ====================
  
  /**
   * 验证并转换供应商数据格式
   */
  _validateSupplierData(data) {
    return {
      name: data.name,
      code: data.code,
      contact_person: data.contact_person || data.contact,  // 字段映射
      contact_phone: data.contact_phone || data.phone,      // 字段映射  
      contact_email: data.contact_email || data.email || '',
      address: data.address,
      credit_rating: data.credit_rating || 3,
      cooperation_type: data.cooperation_type || '长期合作',
      remark: data.remark || ''
    }
  }
  
  /**
   * 验证并转换商品数据格式
   */
  _validateProductData(data) {
    // 单位映射
    const unitMapping = {
      '个': 'piece', '台': 'unit', '件': 'piece', '箱': 'box', 
      '套': 'set', '包': 'pack', '瓶': 'bottle', '袋': 'bag'
    }
    
    return {
      name: data.name,
      code: data.code,
      barcode: data.barcode || '',
      category_id: data.category_id,
      brand_id: data.brand_id,
      supplier_id: data.supplier_id,
      description: data.description || '',
      specifications: data.specifications || '',
      unit: unitMapping[data.unit] || data.unit || 'unit',
      price: parseFloat(data.price) || 0,
      min_stock: parseInt(data.min_stock) || 10,
      status: data.status || 'active',
      images: data.images || [],
      image: data.image || null
    }
  }
  
  /**
   * 验证并转换分类数据格式
   */
  _validateCategoryData(data) {
    return {
      name: data.name,
      code: data.code,
      parent_id: data.parent_id || null,
      sort_order: data.sort || data.sort_order || 0,
      description: data.description || '',
      status: data.status || 'active'
    }
  }
  
  /**
   * 验证并转换品牌数据格式
   */
  _validateBrandData(data) {
    return {
      name: data.name,
      code: data.code,
      english_name: data.english_name || data.name_en || '',
      country: data.country || '',
      founded_year: data.founded_year || null,
      sort_order: data.sort || data.sort_order || 0,
      logo: data.logo || '',
      description: data.description || '',
      status: data.status || 'active'
    }
  }
  
  /**
   * 验证并转换客户数据格式  
   */
  _validateCustomerData(data) {
    return {
      name: data.name,
      code: data.code,
      type: data.type || 'enterprise',
      level: data.level || 'normal',
      contact_person: data.contact_person || data.contact,
      contact_phone: data.contact_phone || data.phone,
      contact_email: data.contact_email || data.email || '',
      address: data.address,
      credit_limit: data.credit_limit || 0,
      status: data.status || 'active',
      remark: data.remark || ''
    }
  }
  
  /**
   * 验证并转换仓库数据格式
   */
  _validateWarehouseData(data) {
    // 只提取后端期待的字段，并确保数据格式正确
    const validatedData = {
      name: String(data.name || '').trim(),
      code: String(data.code || '').trim().toUpperCase(),
      type: String(data.type || 'normal').trim(),
      contact_person: String(data.manager || data.contact_person || '').trim(),  // 后端期望的字段名
      contact_phone: String(data.phone || data.contact_phone || '').trim(),      // 后端期望的字段名
      address: String(data.address || '').trim(),
      area: parseFloat(data.area) || 0,
      status: data.status === 'active' ? 1 : (data.status === 'inactive' ? 0 : (parseInt(data.status) || 1))
    }
    
    // 特殊处理某些字段以符合后端期望
    if (validatedData.type === '主仓库') {
      validatedData.type = 'main'
    } else if (validatedData.type === '配送中心') {
      validatedData.type = 'distribution'
    } else if (validatedData.type === '分拨中心') {
      validatedData.type = 'dispatch'
    }
    
    // 处理description字段（可能来自remark字段）
    if (data.description && String(data.description).trim()) {
      validatedData.description = String(data.description).trim()
    } else if (data.remark && String(data.remark).trim()) {
      validatedData.description = String(data.remark).trim()
    }
    
    // 移除空字符串字段
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] === '' || validatedData[key] === null || validatedData[key] === undefined) {
        delete validatedData[key]
      }
    })
    
    console.log('🔧 最终验证数据:', validatedData)
    
    return validatedData
  }
  
  /**
   * 验证并转换库区数据格式
   */
  _validateZoneData(data) {
    return {
      name: data.name,
      code: data.code,
      warehouse_id: data.warehouse_id,
      type: data.type || 'normal',
      area: parseFloat(data.area) || 0,
      capacity: parseInt(data.capacity) || 0,
      status: data.status || 'active',
      description: data.description || ''
    }
  }
  
  /**
   * 验证并转换库位数据格式
   */
  _validateLocationData(data) {
    return {
      name: data.name,
      code: data.code,
      zone_id: data.zone_id,
      type: data.type || 'normal',
      capacity: parseInt(data.capacity) || 1,
      status: data.status || 'active',
      description: data.description || ''
    }
  }
  
  // ==================== 基础HTTP请求方法 ====================
  
  // ==================== 认证接口 ====================
  
  /**
   * 用户登录
   * POST /auth/login/
   */
  async login(credentials) {
    try {
      console.log('🚀 开始API登录请求...')
      
      const response = await apiClient.post('/auth/login/', {
        username: credentials.username,
        password: credentials.password
      })
      
      console.log('📡 登录API响应:', response)
      
      // 处理多种可能的响应格式
      let tokenData = null
      let userData = null
      
      // 格式1: 直接在根对象中
      if (response.access) {
        tokenData = response
        userData = response.user || null
      }
      // 格式2: 在tokens子对象中
      else if (response.tokens) {
        tokenData = response.tokens
        userData = response.user || null
      }
      // 格式3: 在data子对象中
      else if (response.data) {
        if (response.data.access) {
          tokenData = response.data
          userData = response.data.user || null
        } else if (response.data.tokens) {
          tokenData = response.data.tokens
          userData = response.data.user || null
        }
      }
      // 格式4: token字段名不同
      else if (response.token) {
        tokenData = { access: response.token, refresh: response.refresh_token }
        userData = response.user || null
      }
      
      if (!tokenData || !tokenData.access) {
        throw new Error('登录响应格式异常：未找到有效Token')
      }
    
      // 保存认证信息
      localStorage.setItem('wms_access_token', tokenData.access)
      if (tokenData.refresh) {
        localStorage.setItem('wms_refresh_token', tokenData.refresh)
      }
      if (userData) {
        localStorage.setItem('wms_user_info', JSON.stringify(userData))
      }
      
      console.log('✅ 登录成功，Token已保存')
      ElMessage.success('登录成功')
      
      return {
        success: true,
        access: tokenData.access,
        refresh: tokenData.refresh,
        user: userData
      }
      
    } catch (error) {
      console.error('❌ 登录失败:', error)
      
      // 处理具体错误，不再使用降级
      if (error.response?.status === 401) {
        throw new Error('用户名或密码错误')
      } else if (error.response?.status === 400) {
        throw new Error('请求参数错误，请检查用户名和密码格式')
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('网络连接失败，请检查后端服务是否启动')
      } else {
        throw new Error(error.response?.data?.error || error.message || '登录失败')
      }
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
    return await apiClient.get('/users/staff/', { params })
  }
  
  /**
   * 创建员工
   * POST /api/staff/
   */
  async createStaff(staffData) {
    return await apiClient.post('/users/staff/', staffData)
  }
  
  /**
   * 更新员工
   * PUT /api/staff/{id}/
   */
  async updateStaff(id, staffData) {
    return await apiClient.put(`/users/staff/${id}/`, staffData)
  }
  
  /**
   * 删除员工
   * DELETE /api/staff/{id}/
   */
  async deleteStaff(id) {
    return await apiClient.delete(`/users/staff/${id}/`)
  }
  
  /**
   * 员工状态变更
   * PUT /api/staff/{id}/status/
   */
  async updateStaffStatus(id, statusData) {
    return await apiClient.put(`/users/staff/${id}/status/`, statusData)
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
    const validatedData = this._validateProductData(productData)
    console.log('🔄 创建商品 - 验证后的数据:', validatedData)
    return await apiClient.post('/products/products/', validatedData)
  }
  
  /**
   * 更新商品
   * PUT /products/products/{id}/
   */
  async updateProduct(id, productData) {
    const validatedData = this._validateProductData(productData)
    console.log('🔄 更新商品 - 验证后的数据:', validatedData)
    return await apiClient.put(`/products/products/${id}/`, validatedData)
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
    const validatedData = this._validateCategoryData(categoryData)
    console.log('🔄 创建分类 - 验证后的数据:', validatedData)
    return await apiClient.post('/products/categories/', validatedData)
  }
  
  /**
   * 更新分类
   * PUT /products/categories/{id}/
   */
  async updateCategory(id, categoryData) {
    const validatedData = this._validateCategoryData(categoryData)
    console.log('🔄 更新分类 - 验证后的数据:', validatedData)
    return await apiClient.put(`/products/categories/${id}/`, validatedData)
  }
  
  /**
   * 删除分类
   * DELETE /products/categories/{id}/
   */
  async deleteCategory(id) {
    return await apiClient.delete(`/products/categories/${id}/`)
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
    const validatedData = this._validateBrandData(brandData)
    console.log('🔄 创建品牌 - 验证后的数据:', validatedData)
    return await apiClient.post('/products/brands/', validatedData)
  }
  
  /**
   * 更新品牌
   * PUT /products/brands/{id}/
   */
  async updateBrand(id, brandData) {
    const validatedData = this._validateBrandData(brandData)
    console.log('🔄 更新品牌 - 验证后的数据:', validatedData)
    return await apiClient.put(`/products/brands/${id}/`, validatedData)
  }
  
  /**
   * 删除品牌
   * DELETE /products/brands/{id}/
   */
  async deleteBrand(id) {
    return await apiClient.delete(`/products/brands/${id}/`)
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
    const validatedData = this._validateSupplierData(supplierData)
    console.log('🔄 创建供应商 - 验证后的数据:', validatedData)
    return await apiClient.post('/products/suppliers/', validatedData)
  }
  
  /**
   * 更新供应商
   * PUT /products/suppliers/{id}/
   */
  async updateSupplier(id, supplierData) {
    const validatedData = this._validateSupplierData(supplierData)
    console.log('🔄 更新供应商 - 验证后的数据:', validatedData)
    return await apiClient.put(`/products/suppliers/${id}/`, validatedData)
  }
  
  /**
   * 删除供应商
   * DELETE /products/suppliers/{id}/
   */
  async deleteSupplier(id) {
    return await apiClient.delete(`/products/suppliers/${id}/`)
  }
  
  // ==================== 客户管理接口 ====================
  
  /**
   * 获取客户列表
   * GET /products/customers/
   */
  async getCustomers(params = {}) {
    return await apiClient.get('/products/customers/', { params })
  }
  
  /**
   * 创建客户
   * POST /products/customers/
   */
  async createCustomer(customerData) {
    const validatedData = this._validateCustomerData(customerData)
    console.log('🔄 创建客户 - 验证后的数据:', validatedData)
    return await apiClient.post('/products/customers/', validatedData)
  }
  
  /**
   * 更新客户
   * PUT /products/customers/{id}/
   */
  async updateCustomer(id, customerData) {
    const validatedData = this._validateCustomerData(customerData)
    console.log('🔄 更新客户 - 验证后的数据:', validatedData)
    return await apiClient.put(`/products/customers/${id}/`, validatedData)
  }
  
  /**
   * 删除客户
   * DELETE /products/customers/{id}/
   */
  async deleteCustomer(id) {
    return await apiClient.delete(`/products/customers/${id}/`)
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
    const validatedData = this._validateWarehouseData(warehouseData)
    console.log('🔄 创建仓库 - 验证后的数据:', validatedData)
    
    try {
      const response = await apiClient.post('/warehouse/warehouses/', validatedData)
      return response
    } catch (error) {
      // 详细错误日志
      console.error('🚨 创建仓库API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        requestData: validatedData
      })
      
      // 详细显示后端验证错误
      if (error.response?.data) {
        console.error('📋 后端验证错误详情:', error.response.data)
        if (error.response.data.details) {
          console.error('📝 字段验证错误:', error.response.data.details)
        }
      }
      
      // 如果400错误，尝试简化数据格式
      if (error.response?.status === 400) {
        console.log('🔄 尝试使用简化数据格式...')
        const simpleData = {
          name: warehouseData.name,
          code: warehouseData.code,
          type: warehouseData.type || '主仓库',
          contact_person: warehouseData.manager,  // 使用后端期望的字段名
          contact_phone: warehouseData.phone,     // 使用后端期望的字段名
          address: warehouseData.address
        }
        
        try {
          console.log('🔄 简化数据:', simpleData)
          const retryResponse = await apiClient.post('/warehouse/warehouses/', simpleData)
          console.log('✅ 简化数据创建成功')
          return retryResponse
        } catch (retryError) {
          console.error('🚨 简化数据仍然失败:', retryError.response?.data)
        }
      }
      
      throw error
    }
  }
  
  /**
   * 更新仓库
   * PUT /warehouse/warehouses/{id}/
   */
  async updateWarehouse(id, warehouseData) {
    const validatedData = this._validateWarehouseData(warehouseData)
    console.log('🔄 更新仓库 - 验证后的数据:', validatedData)
    return await apiClient.put(`/warehouse/warehouses/${id}/`, validatedData)
  }
  
  /**
   * 删除仓库
   * DELETE /warehouse/warehouses/{id}/
   */
  async deleteWarehouse(id) {
    return await apiClient.delete(`/warehouse/warehouses/${id}/`)
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
    const validatedData = this._validateZoneData(zoneData)
    console.log('🔄 创建库区 - 验证后的数据:', validatedData)
    return await apiClient.post('/warehouse/zones/', validatedData)
  }
  
  /**
   * 更新库区
   * PUT /warehouse/zones/{id}/
   */
  async updateZone(id, zoneData) {
    const validatedData = this._validateZoneData(zoneData)
    console.log('🔄 更新库区 - 验证后的数据:', validatedData)
    return await apiClient.put(`/warehouse/zones/${id}/`, validatedData)
  }
  
  /**
   * 删除库区
   * DELETE /warehouse/zones/{id}/
   */
  async deleteZone(id) {
    return await apiClient.delete(`/warehouse/zones/${id}/`)
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
    const validatedData = this._validateLocationData(locationData)
    console.log('🔄 创建库位 - 验证后的数据:', validatedData)
    return await apiClient.post('/warehouse/locations/', validatedData)
  }
  
  /**
   * 更新库位
   * PUT /warehouse/locations/{id}/
   */
  async updateLocation(id, locationData) {
    const validatedData = this._validateLocationData(locationData)
    console.log('🔄 更新库位 - 验证后的数据:', validatedData)
    return await apiClient.put(`/warehouse/locations/${id}/`, validatedData)
  }
  
  /**
   * 删除库位
   * DELETE /warehouse/locations/{id}/
   */
  async deleteLocation(id) {
    return await apiClient.delete(`/warehouse/locations/${id}/`)
  }
  
  // ==================== 库存管理接口 ====================
  
  /**
   * 获取库存列表
   * GET /inventory/stock/
   */
  async getInventoryStock(params = {}) {
    return await apiClient.get('/inventory/stock/', { params })
  }
  
  /**
   * 获取库存数据 (别名)
   * GET /inventory/stock/
   */
  async getInventory(params = {}) {
    return await this.getInventoryStock(params)
  }
  
  /**
   * 库存调整
   * POST /inventory/stock/adjust/
   */
  async adjustStock(adjustData) {
    return await apiClient.post('/inventory/stock/adjust/', adjustData)
  }
  
  /**
   * 获取库存预警
   * GET /inventory/alerts/
   */
  async getInventoryAlerts(params = {}) {
    return await apiClient.get('/inventory/alerts/', { params })
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
   * GET /inventory/movements/
   */
  async getInventoryMovements(params = {}) {
    return await apiClient.get('/inventory/movements/', { params })
  }
  
  /**
   * 获取盘点任务
   * GET /inventory/count/
   */
  async getInventoryCount(params = {}) {
    return await apiClient.get('/inventory/count/', { params })
  }
  
  /**
   * 获取盘点任务列表 (别名)
   * GET /inventory/count/
   */
  async getInventoryCounts(params = {}) {
    return await this.getInventoryCount(params)
  }
  
  /**
   * 创建盘点任务
   * POST /inventory/count/
   */
  async createInventoryCount(countData) {
    return await apiClient.post('/inventory/count/', countData)
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
   * GET /outbound/orders/
   */
  async getOutboundOrders(params = {}) {
    return await apiClient.get('/outbound/orders/', { params })
  }
  
  /**
   * 创建出库单
   * POST /outbound/orders/
   */
  async createOutboundOrder(orderData) {
    return await apiClient.post('/outbound/orders/', orderData)
  }
  
  /**
   * 更新出库单
   * PUT /outbound/orders/{id}/
   */
  async updateOutboundOrder(id, orderData) {
    return await apiClient.put(`/outbound/orders/${id}/`, orderData)
  }
  
  /**
   * 删除出库单
   * DELETE /outbound/orders/{id}/
   */
  async deleteOutboundOrder(id) {
    return await apiClient.delete(`/outbound/orders/${id}/`)
  }
  
  /**
   * 确认出库
   * POST /outbound/orders/{id}/confirm/
   */
  async confirmOutbound(id) {
    return await apiClient.post(`/outbound/orders/${id}/confirm/`)
  }
  
  /**
   * 确认出库单 (别名)
   */
  async confirmOutboundOrder(id) {
    return await this.confirmOutbound(id)
  }
  
  /**
   * 获取出库统计
   * GET /outbound/orders/stats/
   */
  async getOutboundStats() {
    return await apiClient.get('/outbound/orders/stats/')
  }
  
  /**
   * 批量开始拣货
   * POST /outbound/picking/batch_start/
   */
  async batchStartPicking(orderIds) {
    return await apiClient.post('/outbound/picking/batch_start/', {
      order_ids: orderIds
    })
  }
  
  /**
   * 批量完成拣货
   * POST /outbound/picking/batch_complete/
   */
  async batchCompletePicking(orderIds) {
    return await apiClient.post('/outbound/picking/batch_complete/', {
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
   * POST /outbound/picking/{id}/start/
   */
  async startPicking(id, pickerData) {
    return await apiClient.post(`/outbound/picking/${id}/start/`, pickerData)
  }
  
  /**
   * 扫码确认拣货
   * POST /outbound/picking/{id}/scan/
   */
  async scanPickingItem(id, scanData) {
    return await apiClient.post(`/outbound/picking/${id}/scan/`, scanData)
  }
  
  /**
   * 完成拣货
   * POST /outbound/picking/{id}/complete/
   */
  async completePicking(id) {
    return await apiClient.post(`/outbound/picking/${id}/complete/`)
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