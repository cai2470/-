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
          <el-divider>演示账户</el-divider>
          <div class="demo-buttons">
            <el-button 
              size="small" 
              @click="fillDemoAccount('admin')"
              type="primary"
              plain
            >
              🔐 管理员
            </el-button>
            <el-button 
              size="small" 
              @click="fillDemoAccount('manager')"
              type="success"
              plain
            >
              📦 仓库经理
            </el-button>
            <el-button 
              size="small" 
              @click="fillDemoAccount('operator')"
              type="warning"
              plain
            >
              👷 操作员
            </el-button>
          </div>
          
          <div class="test-section" style="margin-top: 16px;">
            <el-divider>连接测试</el-divider>
            <div class="test-buttons">
              <el-button 
                size="small" 
                @click="testConnection"
                type="info"
                plain
                :loading="testing"
              >
                🔗 测试连接
              </el-button>
              <el-button 
                size="small" 
                @click="testFullAPI"
                type="success"
                plain
                :loading="testing"
              >
                🧪 完整测试
              </el-button>
              <el-button 
                size="small" 
                @click="checkAPIHealth"
                type="warning"
                plain
                :loading="checkingAPI"
              >
                🔧 API检查
              </el-button>
            </div>
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
import { quickTestAPI, testAPI } from '@/utils/apiTest'
import { checkAPICompleteness, runFullCheck } from '@/utils/apiCompleteness'
import { validateSelectOptions, createSafeSelectOptions } from '@/utils/dataValidator'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)
const testing = ref(false)
const checkingAPI = ref(false)

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

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        console.log('🔄 开始登录流程...')
        
        // 使用用户store进行登录
        const result = await userStore.login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        if (result && result.success) {
          console.log('✅ 登录成功，准备跳转...')
          
          // 记住密码功能
          if (loginForm.remember) {
            localStorage.setItem('wms_remember_username', loginForm.username)
          } else {
            localStorage.removeItem('wms_remember_username')
          }
          
          // 检测设备类型并跳转
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          if (isMobile) {
            await router.push('/mobile/dashboard')
          } else {
            await router.push('/')
          }
        } else {
          throw new Error('登录响应异常')
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

// 测试连接
const testConnection = async () => {
  testing.value = true
  try {
    console.log('🔗 开始连接测试...')
    await quickTestAPI()
  } catch (error) {
    console.error('连接测试失败:', error)
  } finally {
    testing.value = false
  }
}

// 完整API测试
const testFullAPI = async () => {
  testing.value = true
  try {
    console.log('🧪 开始完整API测试...')
    const results = await testAPI()
    console.log('测试结果:', results)
  } catch (error) {
    console.error('完整测试失败:', error)
  } finally {
    testing.value = false
  }
}

// API健康检查
const checkAPIHealth = async () => {
  checkingAPI.value = true
  try {
    console.log('🔧 开始API健康检查...')
    
    // 1. 检查API完整性
    const completenessResult = checkAPICompleteness()
    
    // 2. 运行完整检查
    const fullReport = runFullCheck()
    
    // 3. 检查数据验证
    console.log('📊 数据验证测试...')
    
    // 测试选择器选项验证
    const testOptions = [
      { id: 1, name: '测试选项1' },
      { id: 2, name: '测试选项2' },
      null, // 无效数据
      { id: undefined, name: '无效选项' }, // 无效数据
      { id: 3, name: '测试选项3' }
    ]
    
    const safeOptions = createSafeSelectOptions(testOptions, {
      keyField: 'id',
      labelField: 'name',
      valueField: 'id'
    })
    
    console.log('✅ 选择器选项验证完成:', safeOptions)
    
    // 4. 显示检查结果
    const summary = {
      api完整度: `${completenessResult.completeness}%`,
      缺失函数: completenessResult.missingCount,
      建议数量: fullReport.recommendations.length,
      数据验证: '正常'
    }
    
    console.log('📋 健康检查报告:', summary)
    
    if (completenessResult.completeness >= 90) {
      ElMessage.success(`API健康状况良好 (${completenessResult.completeness}%)`)
    } else if (completenessResult.completeness >= 70) {
      ElMessage.warning(`API需要改进 (${completenessResult.completeness}%)，缺失${completenessResult.missingCount}个函数`)
    } else {
      ElMessage.error(`API存在严重问题 (${completenessResult.completeness}%)，请查看控制台详情`)
    }
    
  } catch (error) {
    console.error('❌ API健康检查失败:', error)
    ElMessage.error('API健康检查失败')
  } finally {
    checkingAPI.value = false
  }
}

// 页面初始化时尝试恢复记住的用户名
const initRememberUser = () => {
  const rememberedUsername = localStorage.getItem('wms_remember_username')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    loginForm.remember = true
  }
}

// 初始化
initRememberUser()
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