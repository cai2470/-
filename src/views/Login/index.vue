<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-form">
        <div class="login-header">
          <div class="logo-icon">🐉</div>
          <h2>小神龙仓库管理系统</h2>
          <p>Warehouse Management System</p>
        </div>
        
        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="loginRules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="demo-account">
          <el-divider>演示账户（无需后端服务器）</el-divider>
          <div class="demo-buttons">
            <el-button 
              size="small" 
              @click="fillDemoAccount('admin')"
              type="primary"
              plain
            >
              🔐 管理员: admin / 123456
            </el-button>
            <el-button 
              size="small" 
              @click="fillDemoAccount('manager')"
              type="success"
              plain
            >
              📦 仓库经理: manager / manager123
            </el-button>
            <el-button 
              size="small" 
              @click="fillDemoAccount('operator')"
              type="warning"
              plain
            >
              👷 操作员: operator / operator123
            </el-button>
            <el-button 
              size="small" 
              @click="fillDemoAccount('testuser')"
              type="info"
              plain
            >
              👤 测试用户: testuser / 123456
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="login-footer">
      <p>&copy; 2024 小神龙仓库管理系统. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 填充演示账户
const fillDemoAccount = (type) => {
  const account = demoAccounts[type]
  if (account) {
    loginForm.username = account.username
    loginForm.password = account.password
    ElMessage.info(`已填充${account.user.first_name}账户信息`)
  }
}

// 本地演示账户
const demoAccounts = {
  'admin': {
    username: 'admin',
    password: '123456',
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      first_name: '系统管理员',
      role: 'admin',
      permissions: ['all']
    }
  },
  'testuser': {
    username: 'testuser', 
    password: '123456',
    user: {
      id: 2,
      username: 'testuser',
      email: 'test@example.com',
      first_name: '测试用户',
      role: 'user',
      permissions: ['read']
    }
  },
  'manager': {
    username: 'manager',
    password: 'manager123',
    user: {
      id: 3,
      username: 'manager',
      email: 'manager@example.com', 
      first_name: '仓库经理',
      role: 'manager',
      permissions: ['warehouse', 'inventory']
    }
  },
  'operator': {
    username: 'operator',
    password: 'operator123',
    user: {
      id: 4,
      username: 'operator',
      email: 'operator@example.com',
      first_name: '操作员',
      role: 'operator', 
      permissions: ['basic']
    }
  }
}

// 本地登录验证
const localLogin = (username, password) => {
  const account = demoAccounts[username]
  if (account && account.password === password) {
    // 模拟登录成功，保存用户信息
    const mockTokens = {
      access: 'mock_access_token_' + Date.now(),
      refresh: 'mock_refresh_token_' + Date.now()
    }
    
    // 保存到localStorage
    localStorage.setItem('wms_access_token', mockTokens.access)
    localStorage.setItem('wms_refresh_token', mockTokens.refresh)
    localStorage.setItem('wms_user_info', JSON.stringify(account.user))
    
    return {
      success: true,
      tokens: mockTokens,
      user: account.user,
      message: '本地演示登录成功'
    }
  }
  
  throw new Error('用户名或密码错误')
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        let response = null
        
        try {
          // 首先尝试真实API登录
          console.log('🔄 尝试API登录...')
          response = await api.login({
            username: loginForm.username,
            password: loginForm.password
          })
          console.log('✅ API登录成功:', response)
          ElMessage.success('登录成功')
        } catch (apiError) {
          // API失败，降级到本地登录
          console.warn('⚠️ API登录失败，使用本地演示登录:', apiError.message)
          
          try {
            response = localLogin(loginForm.username, loginForm.password)
            console.log('✅ 本地登录成功:', response)
            ElMessage.success('演示模式登录成功')
          } catch (localError) {
            throw new Error('登录失败：' + localError.message)
          }
        }
        
        // 更新用户store
        if (response && response.user) {
          userStore.setUser(response.user)
        }
        
        // 检测设备类型，移动设备跳转到移动端
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        if (isMobile) {
          router.push('/mobile/dashboard')
        } else {
          router.push('/')
        }
        
      } catch (error) {
        console.error('❌ 登录失败:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}

// 移除自动API测试，避免不必要的错误
// 系统会在用户登录时自动检测API可用性
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
    
    .logo-icon {
      font-size: 64px;
      margin-bottom: 16px;
      display: block;
    }
    
    h2 {
      color: #303133;
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    p {
      color: #909399;
      margin: 0;
      font-size: 14px;
    }
  }
  
  .login-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
  
  .demo-account {
    margin-top: 20px;
    
    .demo-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      
      .el-button {
        width: 100%;
        font-size: 12px;
        padding: 8px 12px;
      }
    }
  }
}

.login-footer {
  margin-top: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

// 响应式设计
@media (max-width: 480px) {
  .login-form {
    padding: 30px 20px;
    margin: 0 10px;
    
    .login-header {
      h2 {
        font-size: 20px;
      }
    }
  }
}
</style>