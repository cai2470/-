<template>
  <div class="api-test-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <h2>🔧 系统诊断与API测试</h2>
          <p>诊断localStorage问题并测试API接口连通性</p>
        </div>
      </template>

      <!-- localStorage诊断区域 -->
      <el-card class="diagnosis-section" shadow="never">
        <template #header>
          <div class="section-header">
            <h3>📊 localStorage诊断</h3>
            <div class="button-group">
              <el-button 
                type="primary" 
                :icon="monitoring ? 'VideoPause' : 'VideoPlay'"
                @click="toggleStorageMonitoring"
              >
                {{ monitoring ? '停止监控' : '开始监控' }}
              </el-button>
              <el-button type="info" @click="runStorageDiagnosis">
                重新诊断
              </el-button>
              <el-button type="danger" @click="cleanAllLocalStorage">
                清理localStorage
              </el-button>
            </div>
          </div>
        </template>

        <div v-if="storageInfo" class="diagnosis-info">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic 
                title="API可用性" 
                :value="storageInfo.apiAvailable ? '✅ 可用' : '❌ 不可用'"
                value-style="color: #409eff"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic 
                title="localStorage项目数" 
                :value="storageInfo.inspection.total"
                suffix="个"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic 
                title="发现问题" 
                :value="storageInfo.issues.length"
                suffix="个"
                :value-style="{ color: storageInfo.issues.length > 0 ? '#f56c6c' : '#67c23a' }"
              />
            </el-col>
          </el-row>

          <el-divider content-position="left">检测到的问题</el-divider>
          
          <div v-if="storageInfo.issues.length > 0">
            <el-alert
              v-for="(issue, index) in storageInfo.issues"
              :key="index"
              :title="`问题 ${index + 1}`"
              :description="issue"
              type="warning"
              :closable="false"
              class="issue-alert"
            />
          </div>
          <div v-else>
            <el-alert
              title="✅ 没有发现localStorage相关问题"
              type="success"
              :closable="false"
            />
          </div>

          <el-divider content-position="left">localStorage详情</el-divider>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item 
              v-for="(data, key) in storageInfo.inspection.businessData"
              :key="key"
              :label="key"
            >
              <el-tag :type="data.itemCount === 'invalid' ? 'danger' : 'info'">
                {{ data.preview }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- API测试区域 -->
      <el-card class="test-section" shadow="never">
        <template #header>
          <div class="section-header">
            <h3>🚀 API连通性测试</h3>
            <el-button 
              type="primary" 
              :loading="loading"
              @click="testAllAPIs"
            >
              {{ loading ? '测试中...' : '开始测试' }}
            </el-button>
          </div>
        </template>

        <div v-if="testResults.length > 0" class="test-results">
          <el-table :data="testResults" style="width: 100%" max-height="400">
            <el-table-column prop="name" label="API接口" width="200" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="结果信息" />
            <el-table-column label="响应时间" width="100">
              <template #default="{ row }">
                {{ row.responseTime }}ms
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { wmsAPI } from '@/utils/api.js'
import { 
  cleanWMSLocalStorage, 
  inspectLocalStorage, 
  diagnoseStorageIssues,
  monitorLocalStorage 
} from '@/utils/cleanLocalStorage.js'

const loading = ref(false)
const testResults = ref([])
const storageInfo = ref(null)
const monitoring = ref(false)
let monitorInstance = null

// localStorage诊断和清理
const runStorageDiagnosis = async () => {
  console.log('🏥 开始localStorage全面诊断...')
  
  try {
    const diagnosis = diagnoseStorageIssues()
    storageInfo.value = diagnosis
    
    ElMessage({
      type: diagnosis.issues.length > 0 ? 'warning' : 'success',
      message: diagnosis.issues.length > 0 
        ? `发现 ${diagnosis.issues.length} 个存储问题` 
        : 'localStorage状态正常',
      duration: 3000
    })
    
    console.log('诊断结果:', diagnosis)
    
  } catch (error) {
    console.error('诊断失败:', error)
    ElMessage.error('诊断过程中发生错误')
  }
}

const cleanAllLocalStorage = async () => {
  try {
    const result = await ElMessageBox.confirm(
      '确定要清理所有业务相关的localStorage数据吗？\n这将删除所有本地存储的供应商、产品、仓库等数据，系统将完全依赖数据库。',
      '清理确认',
      {
        confirmButtonText: '确定清理',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (result === 'confirm') {
      const cleanResult = cleanWMSLocalStorage()
      
      ElMessage.success(`清理完成！删除了 ${cleanResult.removed} 个数据项`)
      
      // 重新诊断
      setTimeout(() => {
        runStorageDiagnosis()
      }, 500)
    }
  } catch (error) {
    console.log('用户取消清理操作')
  }
}

const toggleStorageMonitoring = () => {
  if (monitoring.value) {
    // 停止监控
    if (monitorInstance) {
      monitorInstance.stop()
      monitorInstance = null
    }
    monitoring.value = false
    ElMessage.info('已停止localStorage监控')
  } else {
    // 开始监控
    monitorInstance = monitorLocalStorage()
    monitoring.value = true
    ElMessage.success('已开始localStorage监控，请查看控制台输出')
  }
}

// API测试功能（保留原有功能）
const testAllAPIs = async () => {
  loading.value = true
  testResults.value = []
  
  const apiTests = [
    // 基础数据API测试
    { name: '获取仓库列表', test: () => wmsAPI.getWarehouses() },
    { name: '获取供应商列表', test: () => wmsAPI.getSuppliers() },
    { name: '获取商品列表', test: () => wmsAPI.getProducts() },
    { name: '获取商品分类', test: () => wmsAPI.getCategories() },
    { name: '获取品牌列表', test: () => wmsAPI.getBrands() },
    { name: '获取客户列表', test: () => wmsAPI.getCustomers() },
    { name: '获取库区列表', test: () => wmsAPI.getZones() },
    { name: '获取库位列表', test: () => wmsAPI.getLocations() },
    
    // 业务流程API测试
    { name: '获取入库订单', test: () => wmsAPI.getInboundOrders() },
    { name: '获取出库订单', test: () => wmsAPI.getOutboundOrders() },
    { name: '获取库存记录', test: () => wmsAPI.getInventory() },
    { name: '获取库存变动', test: () => wmsAPI.getStockMovements() },
    
    // 系统管理API测试
    { name: '获取用户列表', test: () => wmsAPI.getUsers() },
    { name: '获取角色列表', test: () => wmsAPI.getRoles() },
    { name: '获取权限列表', test: () => wmsAPI.getPermissions() },
    
    // 删除功能测试（新增）
    { name: '删除API检查-商品分类', test: () => typeof wmsAPI.deleteCategory === 'function' ? Promise.resolve('函数存在') : Promise.reject('函数不存在') },
    { name: '删除API检查-品牌', test: () => typeof wmsAPI.deleteBrand === 'function' ? Promise.resolve('函数存在') : Promise.reject('函数不存在') },
    { name: '删除API检查-供应商', test: () => typeof wmsAPI.deleteSupplier === 'function' ? Promise.resolve('函数存在') : Promise.reject('函数不存在') },
    { name: '删除API检查-仓库', test: () => typeof wmsAPI.deleteWarehouse === 'function' ? Promise.resolve('函数存在') : Promise.reject('函数不存在') }
  ]
  
  for (const apiTest of apiTests) {
    const startTime = Date.now()
    try {
      const result = await apiTest.test()
      const endTime = Date.now()
      
      testResults.value.push({
        name: apiTest.name,
        status: 'success',
        message: '测试通过',
        data: result,
        responseTime: endTime - startTime
      })
      
      console.log(`✅ ${apiTest.name} - 成功`)
      
    } catch (error) {
      const endTime = Date.now()
      
      testResults.value.push({
        name: apiTest.name,
        status: 'error',
        message: error.message || '测试失败',
        error: error,
        responseTime: endTime - startTime
      })
      
      console.error(`❌ ${apiTest.name} - 失败:`, error)
    }
  }
  
  loading.value = false
  
  const successCount = testResults.value.filter(r => r.status === 'success').length
  const totalCount = testResults.value.length
  
  ElMessage({
    type: successCount === totalCount ? 'success' : 'warning',
    message: `API测试完成：${successCount}/${totalCount} 个通过`
  })
}

onMounted(() => {
  // 页面加载时自动运行诊断
  runStorageDiagnosis()
})
</script>

<style scoped>
.api-test-container {
  padding: 20px;
}

.page-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.card-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.diagnosis-section,
.test-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  color: #409eff;
}

.button-group {
  display: flex;
  gap: 10px;
}

.diagnosis-info {
  margin-top: 20px;
}

.issue-alert {
  margin-bottom: 10px;
}

.test-results {
  margin-top: 20px;
}
</style> 