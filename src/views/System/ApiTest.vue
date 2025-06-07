<template>
  <div class="api-test-page">
    <div class="page-header">
      <h1>API接口测试</h1>
      <div class="header-actions">
        <el-button type="success" @click="testAllAPIs">
          <el-icon><Promotion /></el-icon>
          测试所有接口
        </el-button>
        <el-button type="info" @click="clearResults">
          <el-icon><Refresh /></el-icon>
          清空结果
        </el-button>
      </div>
    </div>

    <!-- API连接状态 -->
    <el-card class="status-card">
      <div class="status-header">
        <h3>API连接状态</h3>
        <el-tag :type="apiStatus.type" size="large">
          {{ apiStatus.text }}
        </el-tag>
      </div>
      <div class="status-info">
        <p><strong>基础URL：</strong>{{ baseURL }}</p>
        <p><strong>认证状态：</strong>{{ authStatus }}</p>
        <p><strong>最后测试：</strong>{{ lastTestTime || '未测试' }}</p>
      </div>
    </el-card>

    <!-- 接口测试列表 -->
    <div class="test-sections">
      <!-- 系统接口 -->
      <el-card class="test-section">
        <template #header>
          <div class="section-header">
            <h3>🏠 系统接口</h3>
            <el-button size="small" @click="testSystemAPIs">测试本组</el-button>
          </div>
        </template>
        
        <div class="api-list">
          <div class="api-item" v-for="api in systemAPIs" :key="api.name">
            <div class="api-info">
              <span class="api-method" :class="api.method.toLowerCase()">{{ api.method }}</span>
              <span class="api-path">{{ api.path }}</span>
              <span class="api-desc">{{ api.description }}</span>
            </div>
            <div class="api-actions">
              <el-button size="small" @click="testSingleAPI(api)" :loading="api.testing">
                测试
              </el-button>
            </div>
            <div class="api-result" v-if="api.result">
              <el-tag :type="api.result.success ? 'success' : 'danger'" size="small">
                {{ api.result.success ? '成功' : '失败' }}
              </el-tag>
              <span class="result-message">{{ api.result.message }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 认证接口 -->
      <el-card class="test-section">
        <template #header>
          <div class="section-header">
            <h3>🔐 认证接口</h3>
            <el-button size="small" @click="testAuthAPIs">测试本组</el-button>
          </div>
        </template>
        
        <div class="api-list">
          <div class="api-item" v-for="api in authAPIs" :key="api.name">
            <div class="api-info">
              <span class="api-method" :class="api.method.toLowerCase()">{{ api.method }}</span>
              <span class="api-path">{{ api.path }}</span>
              <span class="api-desc">{{ api.description }}</span>
            </div>
            <div class="api-actions">
              <el-button size="small" @click="testSingleAPI(api)" :loading="api.testing">
                测试
              </el-button>
            </div>
            <div class="api-result" v-if="api.result">
              <el-tag :type="api.result.success ? 'success' : 'danger'" size="small">
                {{ api.result.success ? '成功' : '失败' }}
              </el-tag>
              <span class="result-message">{{ api.result.message }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 业务接口 -->
      <el-card class="test-section">
        <template #header>
          <div class="section-header">
            <h3>📦 业务接口</h3>
            <el-button size="small" @click="testBusinessAPIs">测试本组</el-button>
          </div>
        </template>
        
        <div class="api-list">
          <div class="api-item" v-for="api in businessAPIs" :key="api.name">
            <div class="api-info">
              <span class="api-method" :class="api.method.toLowerCase()">{{ api.method }}</span>
              <span class="api-path">{{ api.path }}</span>
              <span class="api-desc">{{ api.description }}</span>
            </div>
            <div class="api-actions">
              <el-button size="small" @click="testSingleAPI(api)" :loading="api.testing">
                测试
              </el-button>
            </div>
            <div class="api-result" v-if="api.result">
              <el-tag :type="api.result.success ? 'success' : 'danger'" size="small">
                {{ api.result.success ? '成功' : '失败' }}
              </el-tag>
              <span class="result-message">{{ api.result.message }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 测试接口 -->
      <el-card class="test-section">
        <template #header>
          <div class="section-header">
            <h3>🧪 测试接口</h3>
            <el-button size="small" @click="testTestAPIs">测试本组</el-button>
          </div>
        </template>
        
        <div class="api-list">
          <div class="api-item" v-for="api in testAPIs" :key="api.name">
            <div class="api-info">
              <span class="api-method" :class="api.method.toLowerCase()">{{ api.method }}</span>
              <span class="api-path">{{ api.path }}</span>
              <span class="api-desc">{{ api.description }}</span>
            </div>
            <div class="api-actions">
              <el-button size="small" @click="testSingleAPI(api)" :loading="api.testing">
                测试
              </el-button>
            </div>
            <div class="api-result" v-if="api.result">
              <el-tag :type="api.result.success ? 'success' : 'danger'" size="small">
                {{ api.result.success ? '成功' : '失败' }}
              </el-tag>
              <span class="result-message">{{ api.result.message }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 测试结果汇总 -->
    <el-card class="summary-card" v-if="testResults.length > 0">
      <template #header>
        <h3>📊 测试结果汇总</h3>
      </template>
      
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">总测试数</span>
          <span class="stat-value">{{ testResults.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成功数</span>
          <span class="stat-value success">{{ successCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">失败数</span>
          <span class="stat-value error">{{ failCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成功率</span>
          <span class="stat-value">{{ successRate }}%</span>
        </div>
      </div>

      <el-table :data="testResults" stripe size="small" max-height="300">
        <el-table-column prop="name" label="接口" width="200" />
        <el-table-column prop="method" label="方法" width="80" />
        <el-table-column prop="path" label="路径" min-width="200" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.success ? 'success' : 'danger'" size="small">
              {{ scope.row.success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="结果" min-width="200" />
        <el-table-column prop="timestamp" label="测试时间" width="160" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Promotion, Refresh } from '@element-plus/icons-vue'
import api from '@/utils/api'

// 响应式数据
const baseURL = ref('')
const authStatus = ref('未登录')
const lastTestTime = ref('')
const testResults = ref([])

// API状态
const apiStatus = reactive({
  type: 'info',
  text: '未测试'
})

// 系统接口列表
const systemAPIs = ref([
  {
    name: 'healthCheck',
    method: 'GET',
    path: '/',
    description: '健康检查',
    testing: false,
    result: null
  },
  {
    name: 'getApiInfo',
    method: 'GET',
    path: '/api/',
    description: '获取API信息',
    testing: false,
    result: null
  }
])

// 认证接口列表
const authAPIs = ref([
  {
    name: 'register',
    method: 'POST',
    path: '/api/auth/register/',
    description: '用户注册',
    testing: false,
    result: null
  },
  {
    name: 'login',
    method: 'POST',
    path: '/api/auth/login/',
    description: '用户登录',
    testing: false,
    result: null
  },
  {
    name: 'getCurrentUser',
    method: 'GET',
    path: '/api/auth/user/',
    description: '获取用户信息',
    testing: false,
    result: null
  },
  {
    name: 'logout',
    method: 'POST',
    path: '/api/auth/logout/',
    description: '用户登出',
    testing: false,
    result: null
  }
])

// 业务接口列表
const businessAPIs = ref([
  {
    name: 'getProducts',
    method: 'GET',
    path: '/api/products/',
    description: '获取商品列表',
    testing: false,
    result: null
  },
  {
    name: 'getInventory',
    method: 'GET',
    path: '/api/inventory/',
    description: '获取库存信息',
    testing: false,
    result: null
  }
])

// 测试接口列表
const testAPIs = ref([
  {
    name: 'testProtected',
    method: 'GET',
    path: '/api/test/protected/',
    description: '受保护接口测试',
    testing: false,
    result: null
  },
  {
    name: 'testGet',
    method: 'GET',
    path: '/api/test/get/',
    description: 'GET请求测试',
    testing: false,
    result: null
  },
  {
    name: 'testPost',
    method: 'POST',
    path: '/api/test/post/',
    description: 'POST请求测试',
    testing: false,
    result: null
  }
])

// 计算属性
const successCount = computed(() => {
  return testResults.value.filter(r => r.success).length
})

const failCount = computed(() => {
  return testResults.value.filter(r => !r.success).length
})

const successRate = computed(() => {
  if (testResults.value.length === 0) return 0
  return Math.round((successCount.value / testResults.value.length) * 100)
})

// 测试单个API
const testSingleAPI = async (apiItem) => {
  apiItem.testing = true
  const startTime = Date.now()
  
  try {
    let result = null
    let success = false
    let message = ''
    
    console.log(`🔄 测试接口: ${apiItem.method} ${apiItem.path}`)
    
    switch (apiItem.name) {
      case 'healthCheck':
        result = await api.healthCheck()
        success = !!result.status
        message = result.message || '服务正常'
        break
        
      case 'getApiInfo':
        result = await api.getApiInfo()
        success = !!result.name
        message = `API: ${result.name} v${result.version}`
        break
        
      case 'register':
        try {
          result = await api.register({
            username: 'test_' + Date.now(),
            email: `test${Date.now()}@example.com`,
            password: '123456'
          })
          success = result.success !== false
          message = result.message || '注册成功'
        } catch (error) {
          success = false
          message = error.response?.data?.error || error.message
        }
        break
        
      case 'login':
        try {
          result = await api.login({
            username: 'admin',
            password: '123456'
          })
          success = result.success !== false && !!result.tokens
          message = success ? '登录成功' : '登录失败'
        } catch (error) {
          success = false
          message = error.response?.data?.error || error.message
        }
        break
        
      case 'getCurrentUser':
        try {
          result = await api.getCurrentUser()
          success = !!result.user
          message = result.user ? `用户: ${result.user.username}` : '获取用户信息失败'
        } catch (error) {
          success = false
          message = error.response?.data?.error || error.message
        }
        break
        
      case 'logout':
        try {
          await api.logout()
          success = true
          message = '登出成功'
        } catch (error) {
          success = false
          message = error.response?.data?.error || error.message
        }
        break
        
      case 'getProducts':
        result = await api.getProducts({ page: 1, pageSize: 10 })
        success = !!result.products
        message = result.products ? `加载${result.products.length}个商品` : '获取商品失败'
        break
        
      case 'getInventory':
        result = await api.getInventory()
        success = !!result.inventory
        message = result.inventory ? `加载${result.inventory.length}条库存` : '获取库存失败'
        break
        
      case 'testProtected':
        try {
          result = await api.testProtected()
          success = result.protected === true
          message = result.message || '受保护接口测试成功'
        } catch (error) {
          success = false
          message = error.response?.data?.error || error.message
        }
        break
        
      case 'testGet':
        result = await api.testGet({ test: 'value', frontend: true })
        success = result.method === 'GET'
        message = 'GET请求测试成功'
        break
        
      case 'testPost':
        result = await api.testPost({ test: 'data' })
        success = result.method === 'POST'
        message = 'POST请求测试成功'
        break
        
      default:
        throw new Error('未知的测试接口')
    }
    
    // 更新结果
    apiItem.result = { success, message }
    
    // 添加到测试结果
    testResults.value.push({
      name: apiItem.description,
      method: apiItem.method,
      path: apiItem.path,
      success,
      message,
      timestamp: new Date().toLocaleString(),
      duration: Date.now() - startTime
    })
    
    console.log(`${success ? '✅' : '❌'} ${apiItem.path}: ${message}`)
    
  } catch (error) {
    console.error(`❌ ${apiItem.path} 测试失败:`, error)
    
    const message = error.response?.data?.error || error.message || '请求失败'
    apiItem.result = { success: false, message }
    
    testResults.value.push({
      name: apiItem.description,
      method: apiItem.method,
      path: apiItem.path,
      success: false,
      message,
      timestamp: new Date().toLocaleString(),
      duration: Date.now() - startTime
    })
  } finally {
    apiItem.testing = false
  }
}

// 测试所有系统接口
const testSystemAPIs = async () => {
  for (const apiItem of systemAPIs.value) {
    await testSingleAPI(apiItem)
  }
}

// 测试所有认证接口
const testAuthAPIs = async () => {
  for (const apiItem of authAPIs.value) {
    await testSingleAPI(apiItem)
  }
}

// 测试所有业务接口
const testBusinessAPIs = async () => {
  for (const apiItem of businessAPIs.value) {
    await testSingleAPI(apiItem)
  }
}

// 测试所有测试接口
const testTestAPIs = async () => {
  for (const apiItem of testAPIs.value) {
    await testSingleAPI(apiItem)
  }
}

// 测试所有接口
const testAllAPIs = async () => {
  ElMessage.info('开始测试所有API接口...')
  clearResults()
  
  try {
    // 先测试基础连接
    await testSystemAPIs()
    
    // 测试认证
    await testAuthAPIs()
    
    // 测试业务接口
    await testBusinessAPIs()
    
    // 测试专用测试接口
    await testTestAPIs()
    
    // 更新状态
    updateAPIStatus()
    lastTestTime.value = new Date().toLocaleString()
    
    ElMessage.success('所有API测试完成')
  } catch (error) {
    ElMessage.error('API测试过程中出现错误')
  }
}

// 更新API状态
const updateAPIStatus = () => {
  const allAPIs = [...systemAPIs.value, ...authAPIs.value, ...businessAPIs.value, ...testAPIs.value]
  const testedAPIs = allAPIs.filter(api => api.result)
  const successfulAPIs = testedAPIs.filter(api => api.result.success)
  
  if (testedAPIs.length === 0) {
    apiStatus.type = 'info'
    apiStatus.text = '未测试'
  } else if (successfulAPIs.length === testedAPIs.length) {
    apiStatus.type = 'success'
    apiStatus.text = '全部正常'
  } else if (successfulAPIs.length > 0) {
    apiStatus.type = 'warning'
    apiStatus.text = '部分正常'
  } else {
    apiStatus.type = 'danger'
    apiStatus.text = '连接失败'
  }
}

// 清空测试结果
const clearResults = () => {
  testResults.value = []
  
  // 清空所有API的结果
  const allAPIs = [...systemAPIs.value, ...authAPIs.value, ...businessAPIs.value, ...testAPIs.value]
  allAPIs.forEach(api => {
    api.result = null
    api.testing = false
  })
  
  apiStatus.type = 'info'
  apiStatus.text = '未测试'
}

// 检查认证状态
const checkAuthStatus = () => {
  if (api.isAuthenticated()) {
    const user = api.getCurrentUserLocal()
    authStatus.value = user ? `已登录: ${user.username}` : '已登录'
  } else {
    authStatus.value = '未登录'
  }
}

onMounted(() => {
  baseURL.value = import.meta.env.VITE_API_BASE_URL || 'https://jdegylyrnsyf.sealoshzh.site'
  checkAuthStatus()
})
</script>

<style lang="scss" scoped>
.api-test-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.status-card {
  margin-bottom: 20px;
  
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    h3 {
      margin: 0;
      color: #303133;
    }
  }
  
  .status-info {
    p {
      margin: 5px 0;
      color: #606266;
      font-size: 14px;
    }
  }
}

.test-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.test-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      color: #303133;
    }
  }
  
  .api-list {
    .api-item {
      padding: 15px 0;
      border-bottom: 1px solid #ebeef5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .api-info {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        
        .api-method {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          
          &.get {
            background: #e7f4ff;
            color: #409eff;
          }
          
          &.post {
            background: #f0f9ff;
            color: #67c23a;
          }
          
          &.put {
            background: #fdf6ec;
            color: #e6a23c;
          }
          
          &.delete {
            background: #fef0f0;
            color: #f56c6c;
          }
        }
        
        .api-path {
          font-family: monospace;
          color: #606266;
          font-size: 13px;
        }
        
        .api-desc {
          color: #909399;
          font-size: 13px;
        }
      }
      
      .api-actions {
        margin-bottom: 8px;
      }
      
      .api-result {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .result-message {
          font-size: 12px;
          color: #606266;
        }
      }
    }
  }
}

.summary-card {
  .summary-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
    
    .stat-item {
      text-align: center;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 8px;
      
      .stat-label {
        display: block;
        font-size: 14px;
        color: #909399;
        margin-bottom: 5px;
      }
      
      .stat-value {
        display: block;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        
        &.success {
          color: #67c23a;
        }
        
        &.error {
          color: #f56c6c;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .api-test-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    
    h1 {
      font-size: 20px;
    }
    
    .header-actions {
      width: 100%;
      justify-content: center;
    }
  }
  
  .test-sections {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
    
    .stat-item {
      padding: 10px !important;
      
      .stat-value {
        font-size: 20px !important;
      }
    }
  }
}
</style> 