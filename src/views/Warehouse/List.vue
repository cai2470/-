<template>
  <div class="warehouse-page">
    <div class="page-header">
      <h1>仓库管理</h1>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加仓库
      </el-button>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px" :inline="true">
        <el-form-item label="仓库名称">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入仓库名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="仓库编码">
          <el-input 
            v-model="searchForm.code" 
            placeholder="请输入仓库编码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="仓库状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option 
              v-for="status in statusOptions" 
              :key="status.value"
              :label="status.label" 
              :value="status.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchWarehouses">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 仓库列表 -->
    <el-card class="table-card">
      <el-table :data="warehouses" stripe v-loading="loading">
        <el-table-column prop="code" label="仓库编码" width="120" />
        <el-table-column prop="name" label="仓库名称" min-width="200" />
        <el-table-column prop="type" label="仓库类型" width="100" />
        <el-table-column prop="manager" label="负责人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="address" label="仓库地址" min-width="250" />
        <el-table-column prop="area" label="面积(㎡)" width="100" align="right" />
        <el-table-column prop="zone_count" label="库区数" width="80" align="right" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="editWarehouse(scope.row)">编辑</el-button>
            <el-button size="small" type="info" @click="viewZones(scope.row)">库区</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button 
              size="small" 
              type="danger"
              @click="deleteWarehouse(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑仓库对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="600px"
      @close="resetForm"
    >
      <el-form :model="warehouseForm" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库编码" prop="code">
              <el-input v-model="warehouseForm.code" placeholder="请输入仓库编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓库名称" prop="name">
              <el-input v-model="warehouseForm.name" placeholder="请输入仓库名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库类型" prop="type">
              <el-select v-model="warehouseForm.type" placeholder="请选择类型" style="width: 100%">
                <el-option 
                  v-for="type in warehouseTypeOptions" 
                  :key="type.value"
                  :label="type.label" 
                  :value="type.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="manager">
              <el-input v-model="warehouseForm.manager" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="warehouseForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积(㎡)" prop="area">
              <el-input-number 
                v-model="warehouseForm.area" 
                :min="0"
                placeholder="面积"
                style="width: 100%; min-width: 150px;"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="仓库地址" prop="address">
          <el-input 
            v-model="warehouseForm.address" 
            type="textarea" 
            :rows="3"
            placeholder="请输入仓库详细地址"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="warehouseForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveWarehouse" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getStatusOptions, getWarehouseTypeOptions } from '@/utils/filterOptions'
import { wmsAPI } from '@/utils/api.js'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加仓库')
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  status: ''
})

// 仓库表单
const warehouseForm = reactive({
  id: null,
  code: '',
  name: '',
  type: '',
  manager: '',
  phone: '',
  address: '',
  area: null,
  remark: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 仓库列表
const warehouses = ref([])
const statusOptions = ref([])
const warehouseTypeOptions = ref([])

// 表单验证规则
const rules = {
  code: [
    { required: true, message: '请输入仓库编码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择仓库类型', trigger: 'change' }
  ],
  manager: [
    { required: true, message: '请输入负责人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入仓库地址', trigger: 'blur' }
  ]
}

// API降级处理函数
const handleAPIFallback = (error, operation) => {
  console.warn(`API ${operation} 失败，启用本地存储降级:`, error.message)
  
  // 从本地存储加载数据
  const stored = localStorage.getItem('wms_warehouses')
  if (stored) {
    try {
      const data = JSON.parse(stored)
      return Array.isArray(data) ? data : []
    } catch (parseError) {
      console.error('解析本地存储数据失败:', parseError)
      return []
    }
  }
  return []
}

// 从本地存储加载数据
const loadFromStorage = () => {
  const stored = localStorage.getItem('wms_warehouses')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('解析本地存储数据失败:', error)
    }
  }
  return null
}

// 保存数据到本地存储
const saveToStorage = (data) => {
  try {
    localStorage.setItem('wms_warehouses', JSON.stringify(data))
  } catch (error) {
    console.error('保存到本地存储失败:', error)
  }
}

// 加载仓库列表
const loadWarehouses = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {}
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.code) params.code = searchForm.code
    if (searchForm.status !== '') params.status = searchForm.status
    
    // 尝试API调用
    const response = await wmsAPI.getWarehouses(params)
    
    // 处理不同的响应格式
    let data = []
    if (Array.isArray(response)) {
      data = response
    } else if (response && Array.isArray(response.results)) {
      data = response.results
    } else if (response && Array.isArray(response.data)) {
      data = response.data
    } else if (response && Array.isArray(response.warehouses)) {
      data = response.warehouses
    }
    
    // 确保数据格式正确
    warehouses.value = data.map(warehouse => ({
      id: warehouse.id,
      code: warehouse.code || '',
      name: warehouse.name || '',
      type: warehouse.type || '',
      manager: warehouse.manager || '',
      phone: warehouse.phone || '',
      address: warehouse.address || '',
      area: warehouse.area || 0,
      zone_count: warehouse.zone_count || 0,
      status: warehouse.status || 1,
      remark: warehouse.remark || ''
    }))
    
    pagination.total = warehouses.value.length
    
    console.log('✓ API调用成功，加载仓库数据:', warehouses.value.length, '条')
    
  } catch (error) {
    console.error('仓库列表API调用失败:', error)
    
    // API失败时的降级处理
    const fallbackData = handleAPIFallback(error, '获取仓库列表')
    warehouses.value = Array.isArray(fallbackData) ? fallbackData : []
    pagination.total = warehouses.value.length
    
    // 检查是否启用降级模式
    const enableLocalStorage = import.meta.env.VITE_ENABLE_LOCAL_STORAGE === 'true'
    if (!enableLocalStorage) {
      ElMessage.warning('API连接失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}

// 加载基础数据
const loadBasicData = () => {
  // 加载状态选项
  statusOptions.value = getStatusOptions()
  // 加载仓库类型选项
  warehouseTypeOptions.value = getWarehouseTypeOptions()
}

// 搜索仓库
const searchWarehouses = () => {
  loadWarehouses()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    code: '',
    status: ''
  })
  loadWarehouses()
}

// 打开添加对话框
const openAddDialog = () => {
  dialogTitle.value = '添加仓库'
  dialogVisible.value = true
}

// 编辑仓库
const editWarehouse = (warehouse) => {
  dialogTitle.value = '编辑仓库'
  Object.assign(warehouseForm, warehouse)
  dialogVisible.value = true
}

// 查看库区
const viewZones = (warehouse) => {
  ElMessage.info(`查看 ${warehouse.name} 的库区管理`)
  // 这里可以跳转到库区管理页面
}

// 删除仓库
const deleteWarehouse = async (warehouse) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除仓库 "${warehouse.name}" 吗？此操作不可逆！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    try {
      // 尝试API删除
      await wmsAPI.deleteWarehouse(warehouse.id)
      
      // API成功后更新本地数据
      const index = warehouses.value.findIndex(w => w.id === warehouse.id)
      if (index !== -1) {
        warehouses.value.splice(index, 1)
        pagination.total = warehouses.value.length
        saveToStorage(warehouses.value)
      }
      
      ElMessage.success('删除成功')
      console.log('✓ API删除仓库成功:', warehouse.name)
      
    } catch (apiError) {
      console.error('API删除失败，使用本地删除:', apiError)
      
      // API失败时进行本地删除
      const index = warehouses.value.findIndex(w => w.id === warehouse.id)
      if (index !== -1) {
        warehouses.value.splice(index, 1)
        pagination.total = warehouses.value.length
        saveToStorage(warehouses.value)
        ElMessage.success('删除成功（本地模式）')
      }
    }
  } catch {
    // 用户取消操作
  }
}

// 切换状态
const toggleStatus = async (warehouse) => {
  const action = warehouse.status === 1 ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}仓库 "${warehouse.name}" 吗？`,
      '状态确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const newStatus = warehouse.status === 1 ? 0 : 1
    
    try {
      // 尝试API更新
      await wmsAPI.updateWarehouse(warehouse.id, { status: newStatus })
      
      // API成功后更新本地数据
      warehouse.status = newStatus
      saveToStorage(warehouses.value)
      ElMessage.success(`${action}成功`)
      console.log('✓ API更新仓库状态成功:', warehouse.name)
      
    } catch (apiError) {
      console.error('API状态更新失败，使用本地更新:', apiError)
      
      // API失败时进行本地更新
      warehouse.status = newStatus
      saveToStorage(warehouses.value)
      ElMessage.success(`${action}成功（本地模式）`)
    }
  } catch {
    // 用户取消操作
  }
}

// 保存仓库
const saveWarehouse = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    try {
      let result
      if (warehouseForm.id) {
        // 编辑模式 - API调用
        result = await wmsAPI.updateWarehouse(warehouseForm.id, warehouseForm)
        
        // API成功后更新本地数据
        const index = warehouses.value.findIndex(w => w.id === warehouseForm.id)
        if (index !== -1) {
          warehouses.value[index] = { 
            ...warehouseForm, 
            zone_count: warehouses.value[index].zone_count, 
            status: warehouses.value[index].status 
          }
        }
        ElMessage.success('编辑成功')
        console.log('✓ API更新仓库成功:', warehouseForm.name)
      } else {
        // 添加模式 - API调用
        result = await wmsAPI.createWarehouse(warehouseForm)
        
        // API成功后添加到本地数据
        const newWarehouse = {
          ...warehouseForm,
          id: result.id || Date.now(),
          zone_count: 0,
          status: 1
        }
        warehouses.value.unshift(newWarehouse)
        pagination.total = warehouses.value.length
        ElMessage.success('添加成功')
        console.log('✓ API创建仓库成功:', warehouseForm.name)
      }
      
      // 保存数据到本地存储
      saveToStorage(warehouses.value)
      
    } catch (apiError) {
      console.error('API保存失败，使用本地保存:', apiError)
      
      // API失败时的本地保存
      if (warehouseForm.id) {
        // 编辑模式
        const index = warehouses.value.findIndex(w => w.id === warehouseForm.id)
        if (index !== -1) {
          warehouses.value[index] = { 
            ...warehouseForm, 
            zone_count: warehouses.value[index].zone_count, 
            status: warehouses.value[index].status 
          }
        }
        ElMessage.success('编辑成功（本地模式）')
      } else {
        // 添加模式
        const newWarehouse = {
          ...warehouseForm,
          id: Date.now(),
          zone_count: 0,
          status: 1
        }
        warehouses.value.unshift(newWarehouse)
        pagination.total = warehouses.value.length
        ElMessage.success('添加成功（本地模式）')
      }
      
      saveToStorage(warehouses.value)
    }
    
    dialogVisible.value = false
    resetForm()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(warehouseForm, {
    id: null,
    code: '',
    name: '',
    type: '',
    manager: '',
    phone: '',
    address: '',
    area: null,
    remark: ''
  })
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  loadWarehouses()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadWarehouses()
}

onMounted(() => {
  loadBasicData()
  loadWarehouses()
})
</script>

<style lang="scss" scoped>
.warehouse-page {
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
}

.search-card, .table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

// 响应式设计
@media (max-width: 768px) {
  .warehouse-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    
    h1 {
      font-size: 20px;
    }
  }
  
  :deep(.el-form--inline .el-form-item) {
    margin-right: 0;
    margin-bottom: 15px;
    width: 100%;
    
    .el-form-item__content {
      width: 100%;
      
      .el-input, .el-select {
        width: 100% !important;
      }
    }
  }
  
  :deep(.el-table) {
    font-size: 12px;
    
    .el-button {
      padding: 5px 8px;
      font-size: 11px;
    }
  }
}
</style>