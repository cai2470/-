import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/request'
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
    return localStorage.getItem('access_token')
  }

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    isLoggedIn.value = true
    // 同时存储到localStorage作为备份
    localStorage.setItem('user_info', JSON.stringify(info))
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
      // 尝试调用真实API
      const response = await authAPI.login(loginData)
      
      if (response && response.access) {
        // 存储tokens
        localStorage.setItem('access_token', response.access)
        if (response.refresh) {
          localStorage.setItem('refresh_token', response.refresh)
        }
        
        // 设置用户信息
        if (response.user) {
          setUserInfo(response.user)
        }
        
        // 获取用户详细信息
        await getUserInfo()
        
        ElMessage.success('登录成功')
        return { success: true, data: response }
      }
    } catch (error) {
      // 如果API不可用，使用演示模式
      if (error.useLocalData || error.code === 'ERR_NETWORK') {
        console.warn('API不可用，使用演示模式登录')
        return await loginDemo(loginData)
      }
      
      const message = error.message || '登录失败'
      ElMessage.error(message)
      throw error
    }
  }

  // 演示模式登录（仅用于开发和演示）
  const loginDemo = async (loginData) => {
    const { username, password } = loginData
    
    // 预设的演示账号
    const demoAccounts = [
      {
        username: 'admin',
        password: 'admin123',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@xiaoshenlong.com',
          role: '超级管理员',
          avatar: '',
          department: '系统管理部',
          phone: '13800138000'
        }
      },
      {
        username: 'manager',
        password: 'manager123',
        user: {
          id: 2,
          username: 'manager',
          email: 'manager@xiaoshenlong.com',
          role: '仓库管理员',
          avatar: '',
          department: '仓储部',
          phone: '13800138001'
        }
      },
      {
        username: 'operator',
        password: 'operator123',
        user: {
          id: 3,
          username: 'operator',
          email: 'operator@xiaoshenlong.com',
          role: '操作员',
          avatar: '',
          department: '操作部',
          phone: '13800138002'
        }
      }
    ]
    
    const account = demoAccounts.find(acc => 
      acc.username === username && acc.password === password
    )
    
    if (account) {
      // 生成演示token
      const demoToken = `demo_token_${account.user.id}_${Date.now()}`
      
      localStorage.setItem('access_token', demoToken)
      localStorage.setItem('demo_mode', 'true')
      
      setUserInfo(account.user)
      
      // 设置演示权限
      const demoPermissions = account.user.role === '超级管理员' 
        ? ['*'] // 超级管理员拥有所有权限
        : ['warehouse:read', 'inventory:read', 'products:read']
      
      setPermissions(demoPermissions)
      setRoles([account.user.role])
      
      ElMessage.success(`演示模式登录成功 - ${account.user.role}`)
      return { success: true, data: { user: account.user, demo: true } }
    } else {
      throw new Error('用户名或密码错误')
    }
  }

  // 登出
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      
      // 如果不是演示模式，调用API登出
      if (!localStorage.getItem('demo_mode') && refreshToken) {
        try {
          await authAPI.logout(refreshToken)
        } catch (error) {
          console.warn('API登出失败，继续本地登出', error)
        }
      }
    } catch (error) {
      console.warn('登出API调用失败', error)
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
    
    // 清除存储
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('demo_mode')
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      // 如果是演示模式，从localStorage获取
      if (localStorage.getItem('demo_mode')) {
        const stored = localStorage.getItem('user_info')
        if (stored) {
          const info = JSON.parse(stored)
          setUserInfo(info)
          isLoggedIn.value = true
          return info
        }
        return null
      }
      
      // 调用API获取用户信息
      const userInfoData = await authAPI.getUserInfo()
      if (userInfoData) {
        setUserInfo(userInfoData)
        return userInfoData
      }
    } catch (error) {
      console.warn('获取用户信息失败', error)
      
      // 如果API失败，尝试从localStorage恢复
      const stored = localStorage.getItem('user_info')
      if (stored) {
        try {
          const info = JSON.parse(stored)
          setUserInfo(info)
          return info
        } catch (parseError) {
          console.error('解析存储的用户信息失败', parseError)
        }
      }
      
      return null
    }
  }

  // 更新用户信息
  const updateUserInfo = async (data) => {
    try {
      // 如果不是演示模式，调用API更新
      if (!localStorage.getItem('demo_mode')) {
        const updated = await authAPI.updateUserInfo(data)
        if (updated) {
          setUserInfo({ ...userInfo.value, ...updated })
          ElMessage.success('用户信息更新成功')
          return updated
        }
      } else {
        // 演示模式下直接更新本地数据
        const updated = { ...userInfo.value, ...data }
        setUserInfo(updated)
        ElMessage.success('用户信息更新成功（演示模式）')
        return updated
      }
    } catch (error) {
      const message = error.message || '更新用户信息失败'
      ElMessage.error(message)
      throw error
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