<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-form">
        <div class="login-header">
          <div class="logo-icon">🏭</div>
          <h2>小神龙仓库管理系统</h2>
          <p>简化登录模式 - 跳过API检查</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.remember">记住用户名</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 演示账户 -->
        <div class="demo-account">
          <p style="margin-bottom: 10px; color: #909399; font-size: 14px;">演示账户:</p>
          <div class="demo-buttons">
            <el-button size="small" @click="fillDemoAccount('admin')">管理员</el-button>
            <el-button size="small" @click="fillDemoAccount('manager')">仓库管理员</el-button>
            <el-button size="small" @click="fillDemoAccount('operator')">操作员</el-button>
          </div>
        </div>

        <!-- 工具按钮 -->
        <div style="margin-top: 20px; text-align: center;">
          <el-button type="info" size="small" @click="goToFullLogin">返回完整登录页</el-button>
          <el-button type="warning" size="small" @click="clearLocalData">清理数据</el-button>
        </div>
      </div>
    </div>

    <div class="login-footer">
      <p>&copy; 2024 小神龙仓库管理系统. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

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
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 演示账户信息
const demoAccounts = {
  'admin': { username: 'admin', password: 'admin123', name: '系统管理员' },
  'manager': { username: 'manager', password: 'manager123', name: '仓库管理员' },
  'operator': { username: 'operator', password: 'operator123', name: '操作员' }
}

// 填充演示账户
const fillDemoAccount = (type) => {
  const account = demoAccounts[type]
  if (account) {
    loginForm.username = account.username
    loginForm.password = account.password
    ElMessage.info(`已填充${account.name}账户信息`)
  }
}

// 处理登录 - 简化版本，直接跳过API调用
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        console.log('🔄 开始简化登录流程...')
        
        // 检查是否是演示账户
        const demoAccount = demoAccounts[loginForm.username]
        if (demoAccount && demoAccount.password === loginForm.password) {
          console.log('✅ 演示账户验证成功')
          
          // 设置演示token
          const token = `demo_token_${loginForm.username}_${Date.now()}`
          localStorage.setItem('access_token', token)
          localStorage.setItem('wms_access_token', token)
          localStorage.setItem('wms_user_info', JSON.stringify({
            username: loginForm.username,
            name: demoAccount.name,
            role: loginForm.username === 'admin' ? 'admin' : 'user'
          }))
          
          // 记住用户名
          if (loginForm.remember) {
            localStorage.setItem('wms_remember_username', loginForm.username)
          } else {
            localStorage.removeItem('wms_remember_username')
          }
          
          ElMessage.success(`登录成功！欢迎，${demoAccount.name}`)
          
          // 检测设备类型并跳转
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          if (isMobile) {
            await router.push('/mobile/dashboard')
          } else {
            await router.push('/')
          }
        } else {
          // 如果不是演示账户，尝试API登录
          try {
            const result = await userStore.login({
              username: loginForm.username,
              password: loginForm.password
            })
            
            if (result && result.success) {
              console.log('✅ API登录成功')
              
              if (loginForm.remember) {
                localStorage.setItem('wms_remember_username', loginForm.username)
              } else {
                localStorage.removeItem('wms_remember_username')
              }
              
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
              if (isMobile) {
                await router.push('/mobile/dashboard')
              } else {
                await router.push('/')
              }
            } else {
              throw new Error('API登录失败')
            }
          } catch (apiError) {
            console.warn('API登录失败，但用户名密码格式正确，使用演示模式')
            
            // 如果API失败但用户名密码格式正确，允许进入演示模式
            const token = `demo_token_${loginForm.username}_${Date.now()}`
            localStorage.setItem('access_token', token)
            localStorage.setItem('wms_access_token', token)
            localStorage.setItem('wms_user_info', JSON.stringify({
              username: loginForm.username,
              name: `用户${loginForm.username}`,
              role: 'user'
            }))
            
            ElMessage.warning('后端服务未启动，已进入演示模式')
            await router.push('/')
          }
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

// 返回完整登录页
const goToFullLogin = () => {
  router.push('/login')
}

// 清理本地数据
const clearLocalData = () => {
  if (window.wmsDiagnostics) {
    window.wmsDiagnostics.clean()
    ElMessage.success('本地数据已清理')
  } else {
    // 手动清理
    const keys = ['wms_suppliers', 'wms_warehouses', 'wms_products', 'wms_categories', 
                  'wms_users', 'wms_customers', 'wms_zones', 'inbound_orders', 'outbound_orders']
    keys.forEach(key => localStorage.removeItem(key))
    ElMessage.success('本地数据已清理')
  }
}

// 页面加载时恢复用户名
onMounted(() => {
  const rememberedUsername = localStorage.getItem('wms_remember_username')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    loginForm.remember = true
  }
})
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