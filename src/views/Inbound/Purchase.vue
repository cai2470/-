<template>
  <div class="purchase-inbound-page">
    <div class="page-header">
      <h1>采购入库</h1>
      <div class="header-actions">
        <el-button type="primary" @click="createPurchaseOrder">
          <el-icon><Plus /></el-icon>
          新建采购入库
        </el-button>
        <el-button type="success" @click="batchReceive">
          <el-icon><Check /></el-icon>
          批量收货
        </el-button>
        <el-button type="info" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" label-width="80px" :inline="true">
        <el-form-item label="采购单号">
          <el-input 
            v-model="filterForm.purchase_no" 
            placeholder="请输入采购单号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        
        <el-form-item label="供应商">
          <el-select 
            v-model="filterForm.supplier_id" 
            placeholder="请选择供应商"
            clearable
            style="width: 150px"
          >
            <el-option 
              v-for="supplier in suppliers" 
              :key="supplier.id"
              :label="supplier.name" 
              :value="supplier.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="收货状态">
          <el-select 
            v-model="filterForm.receive_status" 
            placeholder="收货状态"
            clearable
            style="width: 120px"
          >
            <el-option label="待收货" value="pending" />
            <el-option label="部分收货" value="partial" />
            <el-option label="已收货" value="received" />
            <el-option label="已验收" value="verified" />
            <el-option label="已入库" value="stored" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="紧急程度">
          <el-select 
            v-model="filterForm.urgency" 
            placeholder="紧急程度"
            clearable
            style="width: 120px"
          >
            <el-option label="紧急" value="urgent" />
            <el-option label="正常" value="normal" />
            <el-option label="不急" value="low" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预计到货">
          <el-date-picker
            v-model="filterForm.date_range"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="searchOrders">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card total">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Shopping /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总采购单</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card pending">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待收货</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card processing">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Loading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.processing }}</div>
            <div class="stat-label">处理中</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card completed">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 采购单列表 -->
    <el-card class="table-card">
      <el-table 
        :data="purchaseList" 
        stripe 
        v-loading="loading" 
        @selection-change="handleSelectionChange"
        max-height="600"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="purchase_no" label="采购单号" width="140" />
        <el-table-column prop="supplier_name" label="供应商" width="150" />
        <el-table-column prop="warehouse_name" label="目标仓库" width="120" />
        
        <el-table-column prop="total_quantity" label="采购数量" width="100" align="right" />
        <el-table-column prop="received_quantity" label="已收货" width="100" align="right" />
        <el-table-column prop="stored_quantity" label="已入库" width="100" align="right" />
        
        <el-table-column prop="total_amount" label="采购金额" width="120" align="right">
          <template #default="scope">
            ${{ parseFloat(scope.row.total_amount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="receive_status" label="收货状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusColor(scope.row.receive_status)">
              {{ getStatusText(scope.row.receive_status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="urgency" label="紧急程度" width="100">
          <template #default="scope">
            <el-tag 
              :type="getUrgencyColor(scope.row.urgency)"
              effect="plain"
            >
              {{ getUrgencyText(scope.row.urgency) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="expected_date" label="预计到货" width="150" />
        <el-table-column prop="actual_date" label="实际到货" width="150" />
        <el-table-column prop="created_by" label="采购员" width="100" />
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" type="info" @click="viewDetails(scope.row)">
              详情
            </el-button>
            <el-button 
              v-if="scope.row.receive_status === 'pending'" 
              size="small" 
              type="primary" 
              @click="startReceive(scope.row)"
            >
              开始收货
            </el-button>
            <el-button 
              v-if="scope.row.receive_status === 'received'" 
              size="small" 
              type="success" 
              @click="verifyOrder(scope.row)"
            >
              验收
            </el-button>
            <el-button 
              v-if="scope.row.receive_status === 'verified'" 
              size="small" 
              type="warning" 
              @click="storeOrder(scope.row)"
            >
              入库
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

    <!-- 新建采购入库对话框 -->
    <el-dialog 
      title="新建采购入库" 
      v-model="createDialogVisible" 
      width="900px"
      @close="resetCreateForm"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="采购单号" prop="purchase_no">
              <el-input 
                v-model="createForm.purchase_no" 
                placeholder="系统自动生成"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="供应商" prop="supplier_id">
              <el-select v-model="createForm.supplier_id" placeholder="请选择供应商" style="width: 100%">
                <el-option 
                  v-for="supplier in suppliers" 
                  :key="supplier.id"
                  :label="supplier.name" 
                  :value="supplier.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目标仓库" prop="warehouse_id">
              <el-select v-model="createForm.warehouse_id" placeholder="请选择仓库" style="width: 100%">
                <el-option 
                  v-for="warehouse in warehouses" 
                  :key="warehouse.id"
                  :label="warehouse.name" 
                  :value="warehouse.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="预计到货时间" prop="expected_date">
              <el-date-picker 
                v-model="createForm.expected_date" 
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="紧急程度" prop="urgency">
              <el-select v-model="createForm.urgency" placeholder="选择紧急程度" style="width: 100%">
                <el-option label="紧急" value="urgent" />
                <el-option label="正常" value="normal" />
                <el-option label="不急" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="采购员" prop="purchaser">
              <el-input 
                v-model="createForm.purchaser" 
                placeholder="请输入采购员姓名"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注">
          <el-input 
            v-model="createForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
        
        <!-- 商品明细 -->
        <el-form-item label="采购明细">
          <div class="product-details">
            <div class="detail-header">
              <el-button size="small" type="primary" @click="addProduct">
                <el-icon><Plus /></el-icon>
                添加商品
              </el-button>
            </div>
            
            <el-table :data="createForm.products" border size="small">
              <el-table-column prop="product_name" label="商品名称" min-width="200" />
              <el-table-column prop="product_code" label="商品编码" width="120" />
              <el-table-column prop="unit" label="单位" width="80" />
              <el-table-column label="采购数量" width="120">
                <template #default="scope">
                  <el-input-number 
                    v-model="scope.row.quantity" 
                    :min="1" 
                    size="small"
                    style="width: 100%"
                    @change="calculateAmount(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="采购单价($)" width="130">
                <template #default="scope">
                  <el-input-number 
                    v-model="scope.row.unit_price" 
                    :precision="2"
                    :min="0" 
                    size="small"
                    style="width: 100%"
                    @change="calculateAmount(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额($)" width="120" align="right">
                <template #default="scope">
                  ${{ parseFloat(scope.row.amount || 0).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column label="备注" width="150">
                <template #default="scope">
                  <el-input 
                    v-model="scope.row.remark" 
                    size="small"
                    placeholder="备注"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="removeProduct(scope.$index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="summary-info">
              <span><strong>总数量：{{ totalQuantity }}</strong></span>
              <span><strong>总金额：${{ totalAmount.toFixed(2) }}</strong></span>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate" :loading="creating">创建采购单</el-button>
      </template>
    </el-dialog>

    <!-- 收货对话框 -->
    <el-dialog 
      title="采购收货" 
      v-model="receiveDialogVisible" 
      width="800px"
      @close="resetReceiveForm"
    >
      <div v-if="currentOrder" class="receive-info">
        <el-descriptions title="采购单信息" :column="3" border size="small">
          <el-descriptions-item label="采购单号">{{ currentOrder.purchase_no }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentOrder.supplier_name }}</el-descriptions-item>
          <el-descriptions-item label="目标仓库">{{ currentOrder.warehouse_name }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="receive-products">
          <h3>收货明细</h3>
          <el-table :data="receiveItems" border size="small" max-height="300">
            <el-table-column prop="product_name" label="商品名称" min-width="200" />
            <el-table-column prop="product_code" label="商品编码" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="purchase_quantity" label="采购数量" width="120" align="right" />
            <el-table-column prop="received_quantity" label="已收数量" width="120" align="right" />
            <el-table-column label="本次收货" width="120">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.current_receive" 
                  :min="0" 
                  :max="scope.row.purchase_quantity - scope.row.received_quantity"
                  size="small"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="质量状态" width="120">
              <template #default="scope">
                <el-select v-model="scope.row.quality_status" size="small" style="width: 100%">
                  <el-option label="合格" value="qualified" />
                  <el-option label="不合格" value="unqualified" />
                  <el-option label="待检" value="pending" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="150">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.remark" 
                  size="small"
                  placeholder="备注"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="receiveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReceive" :loading="receiving">确认收货</el-button>
      </template>
    </el-dialog>

    <!-- 商品选择对话框 -->
    <el-dialog 
      title="选择商品" 
      v-model="productSelectDialogVisible" 
      width="800px"
    >
      <div class="product-selection">
        <!-- 搜索 -->
        <el-input 
          v-model="productSearchText"
          placeholder="搜索商品名称、编码"
          clearable
          prefix-icon="Search"
          style="width: 300px; margin-bottom: 20px"
        />
        
        <!-- 商品列表 -->
        <el-table 
          :data="filteredProducts" 
          stripe 
          max-height="400"
          @row-click="selectProduct"
          style="cursor: pointer"
        >
          <el-table-column prop="code" label="商品编码" width="120" />
          <el-table-column prop="name" label="商品名称" min-width="200" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="price" label="单价($)" width="120" align="right">
            <template #default="scope">
              ${{ parseFloat(scope.row.price || 0).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" type="primary" @click.stop="selectProduct(scope.row)">
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="productSelectDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { wmsAPI } from '@/utils/api.js'
// 性能测试工具已移除，功能已集成到主要代码中

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const receiving = ref(false)
const createDialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const productSelectDialogVisible = ref(false)
const createFormRef = ref()
const currentOrder = ref(null)
const selectedRows = ref([])
const productSearchText = ref('')

// 筛选表单
const filterForm = reactive({
  purchase_no: '',
  supplier_id: null,
  receive_status: '',
  urgency: '',
  date_range: []
})

// 新建表单
const createForm = reactive({
  purchase_no: '',
  supplier_id: null,
  warehouse_id: null,
  expected_date: '',
  urgency: 'normal',
  purchaser: '',
  remark: '',
  products: []
})

// 收货明细
const receiveItems = ref([])

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 基础数据
const suppliers = ref([])
const warehouses = ref([])
const availableProducts = ref([])
const purchaseList = ref([])

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  processing: 0,
  completed: 0
})

// 验证规则
const createRules = {
  supplier_id: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  warehouse_id: [
    { required: true, message: '请选择目标仓库', trigger: 'change' }
  ],
  expected_date: [
    { required: true, message: '请选择预计到货时间', trigger: 'change' }
  ],
  purchaser: [
    { required: true, message: '请输入采购员姓名', trigger: 'blur' }
  ]
}

// 计算属性
const totalQuantity = computed(() => {
  return createForm.products.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

const totalAmount = computed(() => {
  return createForm.products.reduce((sum, item) => sum + (item.amount || 0), 0)
})

// 过滤商品列表
const filteredProducts = computed(() => {
  if (!productSearchText.value) {
    return availableProducts.value
  }
  const searchText = productSearchText.value.toLowerCase()
  return availableProducts.value.filter(product => 
    product.name.toLowerCase().includes(searchText) ||
    product.code.toLowerCase().includes(searchText)
  )
})

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'warning',
    'partial': 'primary',
    'received': 'info',
    'verified': 'success',
    'stored': 'success'
  }
  return colorMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'pending': '待收货',
    'partial': '部分收货',
    'received': '已收货',
    'verified': '已验收',
    'stored': '已入库'
  }
  return textMap[status] || '未知'
}

// 获取紧急程度颜色
const getUrgencyColor = (urgency) => {
  const colorMap = {
    'urgent': 'danger',
    'normal': 'success',
    'low': 'info'
  }
  return colorMap[urgency] || 'info'
}

// 获取紧急程度文本
const getUrgencyText = (urgency) => {
  const textMap = {
    'urgent': '紧急',
    'normal': '正常',
    'low': '不急'
  }
  return textMap[urgency] || '未知'
}

// 生成采购单号
const generatePurchaseNo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0')
  return `PO${year}${month}${day}${time}`
}

// 加载基础数据
const loadBasicData = async () => {
  try {
    // 从localStorage加载供应商列表
    const storedSuppliers = localStorage.getItem('wms_suppliers')
    if (storedSuppliers) {
      const allSuppliers = JSON.parse(storedSuppliers)
      suppliers.value = allSuppliers.filter(s => s.status === 1).map(s => ({
        id: s.id,
        name: s.name,
        code: s.code
      }))
    } else {
      suppliers.value = [
        { id: 1, name: '华为技术有限公司', code: 'SUP001' },
        { id: 2, name: '小米科技有限公司', code: 'SUP002' },
        { id: 3, name: '苹果电子产品商贸有限公司', code: 'SUP003' },
        { id: 4, name: '联想集团有限公司', code: 'SUP004' }
      ]
    }

    // 从localStorage加载仓库列表
    const storedWarehouses = localStorage.getItem('wms_warehouses')
    if (storedWarehouses) {
      warehouses.value = JSON.parse(storedWarehouses)
    } else {
      warehouses.value = [
        { id: 1, name: '主仓库', code: 'WH001' },
        { id: 2, name: '北京仓库', code: 'WH002' },
        { id: 3, name: '上海仓库', code: 'WH003' }
      ]
    }

    // 从localStorage加载商品列表
    const storedProducts = localStorage.getItem('wms_products')
    if (storedProducts) {
      const products = JSON.parse(storedProducts)
    availableProducts.value = products.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      unit: p.unit || '台',
      price: parseFloat(p.price || 0)
    }))
    } else {
      availableProducts.value = [
        { id: 1, code: 'HW001', name: '华为P50 Pro', unit: '台', price: 999.99 },
        { id: 2, code: 'MI001', name: '小米12 Pro', unit: '台', price: 699.99 },
        { id: 3, code: 'IP001', name: 'iPhone 14 Pro', unit: '台', price: 1199.99 },
        { id: 4, code: 'LP001', name: 'ThinkPad X1 Carbon', unit: '台', price: 1899.99 },
        { id: 5, code: 'AC001', name: '美的空调', unit: '台', price: 449.99 }
      ]
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

// API降级处理函数
const handleAPIFallback = (error, operation) => {
  console.warn(`API ${operation} 失败，启用本地存储降级:`, error.message)
  
  // 返回模拟数据
  return [
    {
      id: 1,
      purchase_no: 'PO202401150001',
      supplier_name: '华为供应商',
      warehouse_name: '主仓库',
      total_quantity: 50,
      received_quantity: 0,
      stored_quantity: 0,
      total_amount: 349400.00,
      receive_status: 'pending',
      urgency: 'urgent',
      expected_date: '2024-01-16 14:00:00',
      actual_date: '',
      created_by: '张三'
    },
    {
      id: 2,
      purchase_no: 'PO202401140002',
      supplier_name: '小米供应商',
      warehouse_name: '北京仓库',
      total_quantity: 30,
      received_quantity: 30,
      stored_quantity: 0,
      total_amount: 140970.00,
      receive_status: 'received',
      urgency: 'normal',
      expected_date: '2024-01-15 10:00:00',
      actual_date: '2024-01-15 09:30:00',
      created_by: '李四'
    },
    {
      id: 3,
      purchase_no: 'PO202401130003',
      supplier_name: '苹果供应商',
      warehouse_name: '上海仓库',
      total_quantity: 25,
      received_quantity: 25,
      stored_quantity: 25,
      total_amount: 199975.00,
      receive_status: 'stored',
      urgency: 'normal',
      expected_date: '2024-01-14 16:00:00',
      actual_date: '2024-01-14 15:45:00',
      created_by: '王五'
    }
  ]
}

// 加载采购单数据
const loadPurchaseData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {}
    if (filterForm.purchase_no) params.purchase_no = filterForm.purchase_no
    if (filterForm.supplier_id) params.supplier_id = filterForm.supplier_id
    if (filterForm.receive_status) params.status = filterForm.receive_status
    if (filterForm.urgency) params.urgency = filterForm.urgency
    if (filterForm.date_range && filterForm.date_range.length === 2) {
      params.start_date = filterForm.date_range[0]
      params.end_date = filterForm.date_range[1]
    }
    
    // 分页参数
    params.page = pagination.page
    params.page_size = pagination.size
    
    // 记录API调用用于性能监控
    // 性能监控已移除，使用内置日志
    
    // 调用API获取采购入库单数据
    const response = await wmsAPI.getInboundOrders(params)
    
    // 处理不同的响应格式
    let purchaseData = []
    let newTotal = 0
    
    if (Array.isArray(response)) {
      purchaseData = response
      newTotal = response.length
    } else if (response && Array.isArray(response.results)) {
      purchaseData = response.results
      newTotal = response.count || response.total || response.results.length
    } else if (response && Array.isArray(response.data)) {
      purchaseData = response.data
      newTotal = response.total || response.data.length
    } else if (response && Array.isArray(response.purchase_orders)) {
      purchaseData = response.purchase_orders
      newTotal = response.total || response.purchase_orders.length
    }
    
    // 🔧 避免无意义的响应式更新
    if (pagination.total !== newTotal) {
      pagination.total = newTotal
    }
    
    purchaseList.value = purchaseData
    
    // 更新统计数据
    updatePurchaseStats(purchaseData)
    
    console.log('✓ API调用成功，加载采购入库数据:', {
      total: purchaseData.length,
      pending: stats.pending,
      processing: stats.processing,
      completed: stats.completed
    })
    
  } catch (error) {
    console.error('采购入库API调用失败:', error)
    
    // API失败时的降级处理
    const fallbackData = handleAPIFallback(error, '获取采购入库单')
    purchaseList.value = fallbackData
    
    // 🔧 避免无意义的响应式更新
    if (pagination.total !== fallbackData.length) {
      pagination.total = fallbackData.length
    }
    
    // 更新统计数据
    updatePurchaseStats(fallbackData)
    
    // 检查是否启用降级模式
    const enableLocalStorage = import.meta.env.VITE_ENABLE_LOCAL_STORAGE === 'true'
    if (!enableLocalStorage) {
      ElMessage.warning('API连接失败，请检查网络连接')
    }
    
  } finally {
    loading.value = false
  }
}

// 更新采购统计数据
const updatePurchaseStats = (data) => {
  stats.total = data.length
  stats.pending = data.filter(item => item.receive_status === 'pending').length
  stats.processing = data.filter(item => ['partial', 'received', 'verified'].includes(item.receive_status)).length
  stats.completed = data.filter(item => item.receive_status === 'stored').length
}

// 搜索
const searchOrders = () => {
  loadPurchaseData()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    purchase_no: '',
    supplier_id: null,
    receive_status: '',
    urgency: '',
    date_range: []
  })
  loadPurchaseData()
}

// 新建采购入库
const createPurchaseOrder = () => {
  createForm.purchase_no = generatePurchaseNo()
  createDialogVisible.value = true
}

// 批量收货
const batchReceive = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要批量收货的采购单')
    return
  }
  ElMessage.info(`批量收货 ${selectedRows.value.length} 个采购单`)
}

// 导出数据
const exportData = () => {
  ElMessage.info('采购数据导出功能开发中...')
}

// 查看详情
const viewDetails = (order) => {
  ElMessage.info(`查看采购单详情: ${order.purchase_no}`)
}

// 开始收货
const startReceive = (order) => {
  currentOrder.value = order
  loadReceiveItems(order.id)
  receiveDialogVisible.value = true
}

// 验收订单
const verifyOrder = (order) => {
  ElMessage.success(`采购单 ${order.purchase_no} 验收完成`)
  loadPurchaseData()
}

// 入库订单
const storeOrder = (order) => {
  ElMessage.success(`采购单 ${order.purchase_no} 入库完成`)
  loadPurchaseData()
}

// 加载收货明细
const loadReceiveItems = async (orderId) => {
  try {
    // 模拟API调用
    const mockItems = [
      {
        id: 1,
        product_name: '华为P50 Pro',
        product_code: 'HW001',
        unit: '台',
        purchase_quantity: 30,
        received_quantity: 0,
        current_receive: 0,
        quality_status: 'qualified',
        remark: ''
      },
      {
        id: 2,
        product_name: 'iPhone 14 Pro',
        product_code: 'IP001',
        unit: '台',
        purchase_quantity: 20,
        received_quantity: 0,
        current_receive: 0,
        quality_status: 'qualified',
        remark: ''
      }
    ]
    
    receiveItems.value = mockItems
  } catch (error) {
    ElMessage.error('加载收货明细失败')
  }
}

// 添加商品
const addProduct = () => {
  // 显示商品选择对话框
  productSelectDialogVisible.value = true
}

// 选择商品
const selectProduct = (product) => {
  createForm.products.push({
    product_id: product.id,
    product_code: product.code,
    product_name: product.name,
    unit: product.unit,
    quantity: 1,
    unit_price: product.price,
    amount: product.price,
    remark: ''
  })
  productSelectDialogVisible.value = false
}

// 移除商品
const removeProduct = (index) => {
  createForm.products.splice(index, 1)
}

// 计算金额
const calculateAmount = (product) => {
  product.amount = (product.quantity || 0) * (product.unit_price || 0)
}

// 提交创建
const submitCreate = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    
    if (createForm.products.length === 0) {
      ElMessage.warning('请添加采购商品')
      return
    }
    
    creating.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('采购单创建成功')
    createDialogVisible.value = false
    loadPurchaseData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('创建失败')
    }
  } finally {
    creating.value = false
  }
}

// 确认收货
const confirmReceive = async () => {
  try {
    const totalReceive = receiveItems.value.reduce((sum, item) => sum + (item.current_receive || 0), 0)
    if (totalReceive === 0) {
      ElMessage.warning('请输入收货数量')
      return
    }
    
    receiving.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('收货完成')
    receiveDialogVisible.value = false
    loadPurchaseData()
  } catch (error) {
    ElMessage.error('收货失败')
  } finally {
    receiving.value = false
  }
}

// 重置表单
const resetCreateForm = () => {
  if (createFormRef.value) {
    createFormRef.value.resetFields()
  }
  Object.assign(createForm, {
    purchase_no: '',
    supplier_id: null,
    warehouse_id: null,
    expected_date: '',
    urgency: 'normal',
    purchaser: '',
    remark: '',
    products: []
  })
}

const resetReceiveForm = () => {
  receiveItems.value = []
  currentOrder.value = null
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页处理
const handleSizeChange = (size) => {
  console.log('🔄 分页大小变化:', size, '当前页:', pagination.page)
  if (pagination.size !== size) {
    pagination.size = size
    pagination.page = 1  // 重置到第一页
    loadPurchaseData()
  }
}

const handleCurrentChange = (page) => {
  console.log('🔄 页码变化:', page, '当前分页大小:', pagination.size)
  if (pagination.page !== page) {
    pagination.page = page
    loadPurchaseData()
  }
}

onMounted(() => {
  loadBasicData()
  loadPurchaseData()
})
</script>

<style lang="scss" scoped>
.purchase-inbound-page {
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

.filter-card, .table-card {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  .stat-card {
    &.total {
      border-left: 4px solid #409EFF;
      
      .stat-icon {
        background: linear-gradient(45deg, #409EFF, #66B1FF);
      }
    }
    
    &.pending {
      border-left: 4px solid #E6A23C;
      
      .stat-icon {
        background: linear-gradient(45deg, #E6A23C, #EEBE77);
      }
    }
    
    &.processing {
      border-left: 4px solid #909399;
      
      .stat-icon {
        background: linear-gradient(45deg, #909399, #B1B3B8);
      }
    }
    
    &.completed {
      border-left: 4px solid #67C23A;
      
      .stat-icon {
        background: linear-gradient(45deg, #67C23A, #85CE61);
      }
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      
      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        
        .el-icon {
          font-size: 24px;
          color: white;
        }
      }
      
      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.product-details {
  .detail-header {
    margin-bottom: 15px;
  }
  
  .summary-info {
    margin-top: 15px;
    text-align: right;
    color: #303133;
    
    span {
      margin-left: 20px;
    }
  }
}

.receive-info {
  .receive-products {
    margin-top: 20px;
    
    h3 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .purchase-inbound-page {
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
      flex-wrap: wrap;
    }
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  :deep(.el-form--inline .el-form-item) {
    margin-right: 0;
    margin-bottom: 15px;
    width: 100%;
    
    .el-form-item__content {
      width: 100%;
      
      .el-input, .el-select, .el-date-picker {
        width: 100% !important;
      }
    }
  }
  
  :deep(.el-table) {
    font-size: 12px;
    
    .el-button {
      padding: 5px 8px;
      font-size: 11px;
      margin: 2px;
    }
  }
}
</style>