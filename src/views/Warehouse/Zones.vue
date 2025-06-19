<template>
  <div class="zones-page">
    <div class="page-header">
      <h1>库区管理</h1>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加库区
      </el-button>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px" :inline="true">
        <el-form-item label="所属仓库">
          <el-select 
            v-model="searchForm.warehouse_id" 
            placeholder="请选择仓库"
            clearable
            style="width: 200px"
          >
            <el-option 
              v-for="warehouse in warehouses" 
              :key="warehouse.id"
              :label="warehouse.name" 
              :value="warehouse.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库区名称">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入库区名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="库区状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchZones">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 库区列表 -->
    <el-card class="table-card">
      <el-table :data="zones" stripe v-loading="loading">
        <el-table-column prop="code" label="库区编码" width="120" />
        <el-table-column prop="name" label="库区名称" width="150" />
        <el-table-column prop="warehouse_name" label="所属仓库" width="150" />
        <el-table-column prop="type" label="库区类型" width="120" />
        <el-table-column prop="temperature" label="温度要求" width="120" />
        <el-table-column prop="humidity" label="湿度要求" width="120" />
        <el-table-column prop="area" label="面积(㎡)" width="120" align="right" />
        <el-table-column prop="location_count" label="库位数" width="80" align="right" />
        <el-table-column prop="capacity" label="容量(吨)" width="100" align="right" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="editZone(scope.row)">编辑</el-button>
            <el-button size="small" type="info" @click="viewLocations(scope.row)">库位</el-button>
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
              @click="deleteZone(scope.row)"
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

    <!-- 添加/编辑库区对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="600px"
      @close="resetForm"
    >
      <el-form :model="zoneForm" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库区编码" prop="code">
              <el-input v-model="zoneForm.code" placeholder="请输入库区编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库区名称" prop="name">
              <el-input v-model="zoneForm.name" placeholder="请输入库区名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属仓库" prop="warehouse_id">
              <el-select v-model="zoneForm.warehouse_id" placeholder="请选择仓库" style="width: 100%">
                <el-option 
                  v-for="warehouse in warehouses" 
                  :key="warehouse.id"
                  :label="warehouse.name" 
                  :value="warehouse.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库区类型" prop="type">
              <el-select v-model="zoneForm.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="常温区" value="常温区" />
                <el-option label="冷藏区" value="冷藏区" />
                <el-option label="冷冻区" value="冷冻区" />
                <el-option label="危险品区" value="危险品区" />
                <el-option label="贵重品区" value="贵重品区" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="面积(㎡)" prop="area">
              <el-input-number 
                v-model="zoneForm.area" 
                :min="0"
                placeholder="面积"
                style="width: 130px;"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="容量(吨)" prop="capacity">
              <el-input-number 
                v-model="zoneForm.capacity" 
                :min="0"
                :precision="2"
                placeholder="容量"
                style="width: 130px;"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最大高度(米)">
              <el-input-number 
                v-model="zoneForm.max_height" 
                :min="0"
                :precision="1"
                placeholder="高度"
                style="width: 130px;"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="温度要求">
              <el-input v-model="zoneForm.temperature" placeholder="如：-18℃~-15℃" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="湿度要求">
              <el-input v-model="zoneForm.humidity" placeholder="如：45%~65%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注">
          <el-input 
            v-model="zoneForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveZone" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { wmsAPI } from '@/utils/api.js'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加库区')
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  warehouse_id: null,
  name: '',
  status: ''
})

// 库区表单
const zoneForm = reactive({
  id: null,
  code: '',
  name: '',
  warehouse_id: null,
  type: '',
  area: null,
  capacity: null,
  max_height: null,
  temperature: '',
  humidity: '',
  remark: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 数据列表
const zones = ref([])
const warehouses = ref([])

// 表单验证规则
const rules = {
  code: [
    { required: true, message: '请输入库区编码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入库区名称', trigger: 'blur' }
  ],
  warehouse_id: [
    { required: true, message: '请选择所属仓库', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择库区类型', trigger: 'change' }
  ],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入容量', trigger: 'blur' }
  ]
}

// API降级处理函数
const handleAPIFallback = (error, operation) => {
  console.warn(`API ${operation} 失败，启用本地存储降级:`, error.message)
  
  // 从本地存储加载数据
  const stored = localStorage.getItem('wms_zones')
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

// 加载仓库列表
const loadWarehouses = async () => {
  try {
    // 尝试API调用
    const response = await wmsAPI.getWarehouses({ status: 1 })
    
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
    
    warehouses.value = data.filter(w => w.status === 1).map(w => ({
      id: w.id,
      name: w.name || '未知仓库',
      code: w.code || 'UNKNOWN'
    }))
    
    console.log('✓ API加载仓库列表成功:', warehouses.value.length, '个')
    
  } catch (error) {
    console.error('加载仓库列表API失败，使用降级数据:', error)
    
    // API失败时从localStorage加载仓库数据
    try {
      const storedWarehouses = JSON.parse(localStorage.getItem('wms_warehouses') || '[]')
      if (Array.isArray(storedWarehouses) && storedWarehouses.length > 0) {
        warehouses.value = storedWarehouses.filter(w => w.status === 1).map(w => ({
          id: w.id,
          name: w.name || '未知仓库',
          code: w.code || 'UNKNOWN'
        }))
      } else {
        // 如果没有存储数据，使用默认数据
        warehouses.value = [
          { id: 1, name: '主仓库', code: 'WH001' },
          { id: 2, name: '北京仓库', code: 'WH002' },
          { id: 3, name: '上海仓库', code: 'WH003' },
          { id: 4, name: '深圳仓库', code: 'WH004' }
        ]
      }
    } catch (parseError) {
      console.error('解析仓库数据失败:', parseError)
      // 出错时使用默认数据
      warehouses.value = [
        { id: 1, name: '主仓库', code: 'WH001' },
        { id: 2, name: '北京仓库', code: 'WH002' }
      ]
    }
  }
}

// 从本地存储加载数据
const loadFromStorage = () => {
  const stored = localStorage.getItem('wms_zones')
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
    localStorage.setItem('wms_zones', JSON.stringify(data))
  } catch (error) {
    console.error('保存到本地存储失败:', error)
  }
}

// 加载库区列表
const loadZones = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {}
    if (searchForm.warehouse_id) params.warehouse_id = searchForm.warehouse_id
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.status !== '') params.status = searchForm.status
    
    // 尝试API调用
    const response = await wmsAPI.getZones(params)
    
    // 处理不同的响应格式
    let data = []
    if (Array.isArray(response)) {
      data = response
    } else if (response && Array.isArray(response.results)) {
      data = response.results
    } else if (response && Array.isArray(response.data)) {
      data = response.data
    } else if (response && Array.isArray(response.zones)) {
      data = response.zones
    }
    
    // 确保数据格式正确并添加仓库名称
    zones.value = data.map(zone => {
      const warehouse = warehouses.value.find(w => w.id === zone.warehouse_id)
      return {
        id: zone.id,
        code: zone.code || '',
        name: zone.name || '',
        warehouse_id: zone.warehouse_id,
        warehouse_name: warehouse?.name || zone.warehouse_name || '未知仓库',
        type: zone.type || '',
        area: zone.area || 0,
        capacity: zone.capacity || 0,
        max_height: zone.max_height || 0,
        temperature: zone.temperature || '',
        humidity: zone.humidity || '',
        location_count: zone.location_count || 0,
        status: zone.status || 1,
        remark: zone.remark || ''
      }
    })
    
    pagination.total = zones.value.length
    
    console.log('✓ API调用成功，加载库区数据:', zones.value.length, '条')
    
  } catch (error) {
    console.error('库区列表API调用失败:', error)
    
    // API失败时的降级处理
    const fallbackData = handleAPIFallback(error, '获取库区列表')
    
    // 处理降级数据并添加仓库名称
    zones.value = fallbackData.map(zone => {
      const warehouse = warehouses.value.find(w => w.id === zone.warehouse_id)
      return {
        ...zone,
        warehouse_name: warehouse?.name || zone.warehouse_name || '未知仓库'
      }
    })
    
    pagination.total = zones.value.length
    
    // 检查是否启用降级模式
    const enableLocalStorage = import.meta.env.VITE_ENABLE_LOCAL_STORAGE === 'true'
    if (!enableLocalStorage) {
      ElMessage.warning('API连接失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}

// 搜索库区
const searchZones = () => {
  loadZones()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    warehouse_id: null,
    name: '',
    status: ''
  })
  loadZones()
}

// 打开添加对话框
const openAddDialog = () => {
  dialogTitle.value = '添加库区'
  dialogVisible.value = true
}

// 编辑库区
const editZone = (zone) => {
  dialogTitle.value = '编辑库区'
  Object.assign(zoneForm, zone)
  dialogVisible.value = true
}

// 查看库位
const viewLocations = (zone) => {
  ElMessage.info(`查看 ${zone.warehouse_name}-${zone.name} 的库位管理`)
}

// 切换状态
const toggleStatus = async (zone) => {
  const action = zone.status === 1 ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}库区 "${zone.warehouse_name}-${zone.name}" 吗？`,
      '状态确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const newStatus = zone.status === 1 ? 0 : 1
    
    try {
      // 尝试API更新
      await wmsAPI.updateZone(zone.id, { status: newStatus })
      
      // API成功后更新本地数据
      zone.status = newStatus
      saveToStorage(zones.value)
      ElMessage.success(`${action}成功`)
      console.log('✓ API更新库区状态成功:', zone.name)
      
    } catch (apiError) {
      console.error('API状态更新失败，使用本地更新:', apiError)
      
      // API失败时进行本地更新
      zone.status = newStatus
      saveToStorage(zones.value)
      ElMessage.success(`${action}成功（本地模式）`)
    }
  } catch {
    // 用户取消操作
  }
}

// 删除库区
const deleteZone = async (zone) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除库区 "${zone.warehouse_name}-${zone.name}" 吗？删除后无法恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    try {
      // 尝试API删除
      await wmsAPI.deleteZone(zone.id)
      
      // API成功后更新本地数据
      const index = zones.value.findIndex(z => z.id === zone.id)
      if (index !== -1) {
        zones.value.splice(index, 1)
        pagination.total = zones.value.length
        saveToStorage(zones.value)
      }
      
      ElMessage.success('删除成功')
      console.log('✓ API删除库区成功:', zone.name)
      
    } catch (apiError) {
      console.error('API删除失败，使用本地删除:', apiError)
      
      // API失败时进行本地删除
      const index = zones.value.findIndex(z => z.id === zone.id)
      if (index !== -1) {
        zones.value.splice(index, 1)
        pagination.total = zones.value.length
        saveToStorage(zones.value)
        ElMessage.success('删除成功（本地模式）')
      }
    }
  } catch {
    // 用户取消操作
  }
}

// 保存库区
const saveZone = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    try {
      let result
      if (zoneForm.id) {
        // 编辑模式 - API调用
        result = await wmsAPI.updateZone(zoneForm.id, zoneForm)
        
        // API成功后更新本地数据
        const index = zones.value.findIndex(z => z.id === zoneForm.id)
        if (index !== -1) {
          const warehouseName = warehouses.value.find(w => w.id === zoneForm.warehouse_id)?.name || ''
          zones.value[index] = { 
            ...zoneForm, 
            warehouse_name: warehouseName, 
            location_count: zones.value[index].location_count, 
            status: zones.value[index].status 
          }
        }
        ElMessage.success('编辑成功')
        console.log('✓ API更新库区成功:', zoneForm.name)
      } else {
        // 添加模式 - API调用
        result = await wmsAPI.createZone(zoneForm)
        
        // API成功后添加到本地数据
        const warehouseName = warehouses.value.find(w => w.id === zoneForm.warehouse_id)?.name || ''
        const newZone = {
          ...zoneForm,
          id: result.id || Date.now(),
          warehouse_name: warehouseName,
          location_count: 0,
          status: 1
        }
        zones.value.unshift(newZone)
        pagination.total = zones.value.length
        ElMessage.success('添加成功')
        console.log('✓ API创建库区成功:', zoneForm.name)
      }
      
      // 保存数据到本地存储
      saveToStorage(zones.value)
      
    } catch (apiError) {
      console.error('API保存失败，使用本地保存:', apiError)
      
      // API失败时的本地保存
      if (zoneForm.id) {
        // 编辑模式
        const index = zones.value.findIndex(z => z.id === zoneForm.id)
        if (index !== -1) {
          const warehouseName = warehouses.value.find(w => w.id === zoneForm.warehouse_id)?.name || ''
          zones.value[index] = { 
            ...zoneForm, 
            warehouse_name: warehouseName, 
            location_count: zones.value[index].location_count, 
            status: zones.value[index].status 
          }
        }
        ElMessage.success('编辑成功（本地模式）')
      } else {
        // 添加模式
        const warehouseName = warehouses.value.find(w => w.id === zoneForm.warehouse_id)?.name || ''
        const newZone = {
          ...zoneForm,
          id: Date.now(),
          warehouse_name: warehouseName,
          location_count: 0,
          status: 1
        }
        zones.value.unshift(newZone)
        pagination.total = zones.value.length
        ElMessage.success('添加成功（本地模式）')
      }
      
      saveToStorage(zones.value)
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
  Object.assign(zoneForm, {
    id: null,
    code: '',
    name: '',
    warehouse_id: null,
    type: '',
    area: null,
    capacity: null,
    max_height: null,
    temperature: '',
    humidity: '',
    remark: ''
  })
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  loadZones()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadZones()
}

onMounted(async () => {
  await loadWarehouses()
  loadZones()
})
</script>

<style lang="scss" scoped>
.zones-page {
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
  .zones-page {
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