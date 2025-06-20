import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wmsAPI } from '@/utils/api'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref({})
  const permissions = ref([])
  const roles = ref([])
  const isLoggedIn = ref(false)

  // 计算属性
  const userName = computed(() => userInfo.value.username || '')
  const userRole = computed(() => userInfo.value.role || '')
  const avatar = computed(() => userInfo.value.avatar || '')

  // 获取存储的token
  const getStoredToken = () => {
    return localStorage.getItem('wms_access_token')
  }

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    isLoggedIn.value = true
    // 同时存储到localStorage作为备份
    localStorage.setItem('wms_user_info', JSON.stringify(info))
  }

  // 设置权限
  const setPermissions = (perms) => {
    permissions.value = perms
  }

  // 设置角色
  const setRoles = (roleList) => {
    roles.value = roleList
  }

  // 登录
  const login = async (loginData) => {
    try {
      console.log('🔄 用户store开始登录流程...')
      
      // 使用wmsAPI进行登录（已包含API和降级逻辑）
      const response = await wmsAPI.login(loginData)
      
      if (response && response.success) {
        console.log('✅ API登录成功:', response)
        
        // 设置用户信息
        if (response.user) {
          setUserInfo(response.user)
        } else {
          // 如果登录响应中没有用户信息，尝试获取
          try {
            const userInfoData = await wmsAPI.getCurrentUser()
            if (userInfoData) {
              setUserInfo(userInfoData)
            }
          } catch (error) {
            console.warn('获取用户信息失败，使用基础信息:', error)
            setUserInfo({
              username: loginData.username,
              role: '用户'
            })
          }
        }
        
        // 设置基础权限
        const userRole = response.user?.role || '用户'
        setRoles([userRole])
        
        // 根据角色设置权限
        const rolePermissions = getRolePermissions(userRole)
        setPermissions(rolePermissions)
        
        ElMessage.success('登录成功')
        return { success: true, data: response }
      } else {
        throw new Error('登录响应异常')
      }
      
    } catch (error) {
      console.error('❌ 登录失败:', error)
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      throw error
    }
  }

  // 根据角色获取权限
  const getRolePermissions = (role) => {
    const permissionMap = {
      '超级管理员': ['*'], // 所有权限
      '系统管理员': ['*'],
      '管理员': ['*'],
      '仓库管理员': [
        'warehouse:read', 'warehouse:write',
        'inventory:read', 'inventory:write',
        'products:read', 'products:write',
        'inbound:read', 'inbound:write',
        'outbound:read', 'outbound:write',
        'reports:read'
      ],
      '仓库经理': [
        'warehouse:read', 'warehouse:write',
        'inventory:read', 'inventory:write',
        'products:read', 'products:write',
        'inbound:read', 'inbound:write',
        'outbound:read', 'outbound:write',
        'reports:read'
      ],
      '操作员': [
        'warehouse:read',
        'inventory:read', 'inventory:write',
        'products:read',
        'inbound:read', 'inbound:write',
        'outbound:read', 'outbound:write'
      ],
      '测试用户': [
        'warehouse:read',
        'inventory:read',
        'products:read'
      ]
    }
    
    return permissionMap[role] || ['basic:read']
  }

  // 登出
  const logout = async () => {
    try {
      // 尝试调用API登出
      await wmsAPI.logout()
    } catch (error) {
      console.warn('API登出失败，继续本地登出:', error)
    } finally {
      // 清除所有状态和存储
      clearUserState()
      ElMessage.success('已退出登录')
    }
  }

  // 清除用户状态
  const clearUserState = () => {
    userInfo.value = {}
    permissions.value = []
    roles.value = []
    isLoggedIn.value = false
    
    // 清除wmsAPI相关存储
    wmsAPI.clearAuthData()
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      // 调用wmsAPI获取用户信息
      const userInfoData = await wmsAPI.getCurrentUser()
      if (userInfoData) {
        setUserInfo(userInfoData)
        return userInfoData
      }
    } catch (error) {
      console.warn('获取用户信息失败:', error)
      
      // 如果API失败，尝试从localStorage恢复
      const stored = localStorage.getItem('wms_user_info')
      if (stored) {
        try {
          const info = JSON.parse(stored)
          setUserInfo(info)
          return info
        } catch (parseError) {
          console.error('解析存储的用户信息失败:', parseError)
        }
      }
      
      return null
    }
  }

  // 更新用户信息
  const updateUserInfo = async (data) => {
    try {
      // 调用API更新用户信息
      const updated = await wmsAPI.updateUser(userInfo.value.id, data)
      if (updated) {
        setUserInfo({ ...userInfo.value, ...updated })
        ElMessage.success('用户信息更新成功')
        return updated
      }
    } catch (error) {
      console.warn('API更新失败，仅更新本地数据:', error)
      // 本地更新
      const updated = { ...userInfo.value, ...data }
      setUserInfo(updated)
      ElMessage.success('用户信息更新成功（本地）')
      return updated
    }
  }

  // 检查权限
  const hasPermission = (permission) => {
    if (!permission) return true
    if (permissions.value.includes('*')) return true // 超级管理员
    return permissions.value.includes(permission)
  }

  // 检查角色
  const hasRole = (role) => {
    if (!role) return true
    return roles.value.includes(role)
  }

  // 初始化用户状态
  const initUser = async () => {
    const token = getStoredToken()
    if (token) {
      try {
        await getUserInfo()
      } catch (error) {
        console.warn('初始化用户信息失败，可能需要重新登录', error)
        clearUserState()
      }
    }
  }

  // 检查登录状态
  const checkAuthStatus = () => {
    const token = getStoredToken()
    return !!token && !!userInfo.value.id
  }

  return {
    // 状态
    userInfo,
    permissions,
    roles,
    isLoggedIn,
    
    // 计算属性
    userName,
    userRole,
    avatar,
    
    // 方法
    login,
    logout,
    getUserInfo,
    updateUserInfo,
    initUser,
    hasPermission,
    hasRole,
    checkAuthStatus,
    setUserInfo,
    setPermissions,
    setRoles,
    clearUserState
  }
})