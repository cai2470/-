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
                @click="checkDataSource"
                type="warning"
                plain
                :loading="checkingAPI"
              >
                🎯 数据源检查
              </el-button>
              <el-button 
                size="small" 
                @click="cleanLocalData"
                type="danger"
                plain
                :loading="cleaning"
              >
                🧹 清理本地数据
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 数据源检查 -->
        <div class="data-source-section">
          <h3 style="margin-bottom: 15px; color: #409EFF;">🔍 数据库连接状态检查</h3>
          <el-button 
            type="info" 
            @click="checkDatabaseConnection" 
            :loading="checking"
            size="small"
            style="margin-bottom: 10px; width: 100%;"
          >
            {{ checking ? '检查中...' : '全面检查数据库连接' }}
          </el-button>
          
          <!-- 检查结果显示 -->
          <div v-if="checkResults.length > 0" class="check-results">
            <div v-for="(result, index) in checkResults" :key="index" class="check-item">
              <el-tag 
                :type="result.status === 'success' ? 'success' : 'danger'"
                size="small"
                style="margin-right: 8px;"
              >
                {{ result.status === 'success' ? '✅' : '❌' }}
              </el-tag>
              <span class="check-name">{{ result.name }}</span>
              <span class="check-detail">{{ result.detail }}</span>
            </div>
            
            <div class="check-summary" style="margin-top: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
              <strong>检查汇总：</strong>
              <span style="color: #67C23A;">成功 {{ successCount }}</span> / 
              <span style="color: #F56C6C;">失败 {{ failedCount }}</span> / 
              <span style="color: #909399;">总计 {{ checkResults.length }}</span>
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { cleanWMSLocalStorage, inspectLocalStorage, diagnoseStorageIssues } from '@/utils/cleanLocalStorage'
import { wmsAPI } from '@/utils/api.js'
// 测试工具已移除，改为使用内置的简单测试

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)
const testing = ref(false)
const checkingAPI = ref(false)
const cleaning = ref(false)

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

// 简化的连接测试
const testConnection = async () => {
  testing.value = true
  try {
    console.log('🔗 开始连接测试...')
    // 使用导入的wmsAPI进行健康检查
    const result = await wmsAPI.healthCheck()
    if (result) {
      ElMessage.success('后端连接正常')
      console.log('✅ 连接测试成功')
    } else {
      throw new Error('健康检查失败')
    }
  } catch (error) {
    console.error('连接测试失败:', error)
    ElMessage.error('连接测试失败，请检查后端服务是否启动')
  } finally {
    testing.value = false
  }
}

// 简化的API测试
const testFullAPI = async () => {
  testing.value = true
  try {
    console.log('🧪 开始API测试...')
    // 尝试获取基础数据来测试API
    const [users, products, warehouses] = await Promise.all([
      wmsAPI.getUsers({ page: 1, page_size: 1 }),
      wmsAPI.getProducts({ page: 1, page_size: 1 }),
      wmsAPI.getWarehouses({ page: 1, page_size: 1 })
    ])
    
    console.log('✅ API测试完成:', {
      users: users ? '✅' : '❌',
      products: products ? '✅' : '❌', 
      warehouses: warehouses ? '✅' : '❌'
    })
    
    ElMessage.success('API功能测试完成，查看控制台获取详情')
  } catch (error) {
    console.error('API测试失败:', error)
    ElMessage.error('API测试失败，请确保后端服务正在运行')
  } finally {
    testing.value = false
  }
}

// 简化的健康检查
const checkDataSource = async () => {
  checkingAPI.value = true
  try {
    console.log('🎯 开始数据源检查...')
    
    // 检查API连接
    await wmsAPI.healthCheck()
    console.log('✅ API连接正常')
    
    // 检查本地数据状态
    const inspection = inspectLocalStorage()
    const diagnosis = diagnoseStorageIssues()
    
    if (inspection.total > 0) {
      ElMessage.warning('检测到本地存储数据，建议清理后使用纯数据库模式')
    } else {
      ElMessage.success('系统处于纯数据库模式，数据源状态正常')
    }
    
  } catch (error) {
    console.error('❌ 数据源检查失败:', error)
    ElMessage.error('数据源检查失败')
  } finally {
    checkingAPI.value = false
  }
}

// 清理本地数据
const cleanLocalData = async () => {
  cleaning.value = true
  try {
    console.log('🧹 开始清理本地数据...')
    
    // 使用工具清理业务数据
    const result = cleanWMSLocalStorage()
    
    // 显示清理后状态
    const inspection = inspectLocalStorage()
    
    ElMessage.success(`本地数据清理完成，清理了 ${result.removed} 个存储项`)
    
  } catch (error) {
    console.error('❌ 本地数据清理失败:', error)
    ElMessage.error('本地数据清理失败')
  } finally {
    cleaning.value = false
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

// 数据库检查相关
const checking = ref(false)
const checkResults = ref([])

// 计算成功和失败的数量
const successCount = computed(() => checkResults.value.filter(r => r.status === 'success').length)
const failedCount = computed(() => checkResults.value.filter(r => r.status === 'failed').length)

// 全面检查数据库连接
const checkDatabaseConnection = async () => {
  checking.value = true
  checkResults.value = []
  
  const checkList = [
    // 基础数据接口
    { name: '用户认证', api: () => wmsAPI.getCurrentUser() },
    { name: '商品列表', api: () => wmsAPI.getProducts({ page_size: 1 }) },
    { name: '商品分类', api: () => wmsAPI.getCategories({ page_size: 1 }) },
    { name: '品牌列表', api: () => wmsAPI.getBrands({ page_size: 1 }) },
    { name: '供应商列表', api: () => wmsAPI.getSuppliers({ page_size: 1 }) },
    { name: '客户列表', api: () => wmsAPI.getCustomers({ page_size: 1 }) },
    
    // 仓库数据接口
    { name: '仓库列表', api: () => wmsAPI.getWarehouses({ page_size: 1 }) },
    { name: '库区列表', api: () => wmsAPI.getZones({ page_size: 1 }) },
    { name: '库位列表', api: () => wmsAPI.getLocations({ page_size: 1 }) },
    
    // 库存数据接口
    { name: '库存数据', api: () => wmsAPI.getInventoryStock({ page_size: 1 }) },
    { name: '库存变动', api: () => wmsAPI.getInventoryMovements({ page_size: 1 }) },
    { name: '库存预警', api: () => wmsAPI.getInventoryAlerts({ page_size: 1 }) },
    { name: '库存盘点', api: () => wmsAPI.getInventoryCount({ page_size: 1 }) },
    
    // 入库数据接口
    { name: '入库订单', api: () => wmsAPI.getInboundOrders({ page_size: 1 }) },
    { name: '采购入库', api: () => wmsAPI.getInboundPurchase({ page_size: 1 }) },
    
    // 出库数据接口
    { name: '出库订单', api: () => wmsAPI.getOutboundOrders({ page_size: 1 }) },
    { name: '销售出库', api: () => wmsAPI.getOutboundSales({ page_size: 1 }) },
    
    // 系统数据接口
    { name: '用户管理', api: () => wmsAPI.getUsers({ page_size: 1 }) },
    { name: '角色管理', api: () => wmsAPI.getRoles({ page_size: 1 }) },
    { name: '权限管理', api: () => wmsAPI.getPermissions({ page_size: 1 }) }
  ]
  
  console.log('🔍 开始全面检查数据库连接...')
  
  // 并发检查所有接口
  const promises = checkList.map(async (item) => {
    try {
      const startTime = Date.now()
      const result = await item.api()
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // 检查响应数据的完整性
      let detail = `${responseTime}ms`
      if (result) {
        if (result.count !== undefined) {
          detail += ` | 数据量: ${result.count}`
        } else if (Array.isArray(result)) {
          detail += ` | 数据量: ${result.length}`
        } else if (result.results && Array.isArray(result.results)) {
          detail += ` | 数据量: ${result.results.length}`
        }
      }
      
      return {
        name: item.name,
        status: 'success',
        detail: detail,
        responseTime: responseTime
      }
    } catch (error) {
      console.error(`❌ ${item.name} 检查失败:`, error)
      return {
        name: item.name,
        status: 'failed',
        detail: error.response?.status ? `HTTP ${error.response.status}` : error.message,
        error: error
      }
    }
  })
  
  // 等待所有检查完成
  const results = await Promise.all(promises)
  checkResults.value = results.sort((a, b) => {
    // 先按状态排序（成功的在前），再按名称排序
    if (a.status !== b.status) {
      return a.status === 'success' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
  
  const successCount = results.filter(r => r.status === 'success').length
  const failedCount = results.filter(r => r.status === 'failed').length
  
  console.log(`✅ 数据库连接检查完成: 成功 ${successCount}/${results.length}，失败 ${failedCount}`)
  
  if (failedCount === 0) {
    ElMessage.success(`🎉 所有接口连接正常！共检查 ${results.length} 个接口`)
  } else if (successCount > 0) {
    ElMessage.warning(`⚠️ 部分接口异常：${successCount} 个正常，${failedCount} 个异常`)
  } else {
    ElMessage.error(`❌ 所有接口都无法连接，请检查后端服务`)
  }
  
  checking.value = false
}
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

.data-source-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.check-results {
  max-height: 300px;
  overflow-y: auto;
  background: white;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.check-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.check-item:last-child {
  border-bottom: none;
}

.check-name {
  font-weight: 500;
  min-width: 100px;
  margin-right: 10px;
}

.check-detail {
  color: #666;
  font-size: 12px;
  flex: 1;
}
</style>