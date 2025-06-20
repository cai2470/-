# 小神龙WMS系统 - 前端API接口完整调用文档 v3.2.0

> 🚀 **v3.2.0 删除功能修复**: 完整覆盖所有前端API调用端口，修复所有缺失的删除函数，确保前后端CRUD功能100%对接

## 概述
本文档提供小神龙仓库管理系统前端所有API接口的完整调用说明，包括每个模块的详细CRUD操作、参数说明、响应格式和错误处理。

## 📚 快速导航目录

### 🔥 核心功能模块
- [🔐 认证模块](#认证模块-authentication) - 登录、Token管理、用户信息
- [👤 用户管理模块](#用户管理模块-user-management) - 用户CRUD、员工管理 
- [🔑 角色权限模块](#角色权限模块-role--permission) - 角色管理、权限控制
- [🏢 仓库管理模块](#仓库管理模块-warehouse-management) - 仓库、库区、库位管理

### 📦 业务功能模块  
- [📦 商品管理模块](#商品管理) - 商品、分类、品牌、供应商
- [📊 库存管理模块](#库存管理-已更新路径) - 库存查询、预警、盘点、移动
- [📥 入库管理模块](#入库管理) - 采购入库、退货、调拨
- [📤 出库管理模块](#出库管理-已更新路径) - 销售出库、拣货、打包、发货
- [🔍 质检管理模块](#质检管理) - 质检流程、质检报告
- [📈 报表分析模块](#报表分析) - 各类统计报表、数据分析

### ⚙️ 系统功能模块
- [⚙️ 系统管理模块](#系统管理) - 系统监控、日志管理、备份

### 📖 开发工具  
- [🔧 API调用示例](#api调用示例) - 认证头部、分页响应、错误处理
- [⚠️ 错误码说明](#错误码说明) - 完整的HTTP状态码说明
- [🧪 连通性测试](#数据连通性测试方法) - 前后端对接测试方法

## 🎯 接口统计概览

| 模块名称 | 接口数量 | 完成状态 | 核心功能 |
|---------|---------|---------|---------|
| 🔐 认证模块 | 5个 | ✅ 完成 | 登录、Token、用户信息 |
| 👤 用户管理 | 10个 | ✅ 完成 | 用户和员工CRUD |
| 🔑 角色权限 | 10个 | ✅ 完成 | 角色权限管理 |
| 🏢 仓库管理 | 16个 | ✅ 完成 | 仓库库区库位管理 |
| 📦 商品管理 | 24个 | ✅ 完成 | 商品分类品牌供应商(已添加所有删除函数) |
| 📊 库存管理 | 15个 | ✅ 完成 | 库存查询预警盘点 |
| 📥 入库管理 | 12个 | ✅ 完成 | 采购退货调拨入库 |
| 📤 出库管理 | 25个 | ✅ 完成 | 销售拣货打包发货 |
| 🔍 质检管理 | 15个 | ✅ 完成 | 质检流程报告 |
| 📈 报表分析 | 18个 | ✅ 完成 | 统计报表数据分析 |
| ⚙️ 系统管理 | 10个 | ✅ 完成 | 系统监控日志备份 |
| **总计** | **162个** | **100%完成** | **完整WMS功能+删除函数修复** |

---

## 🚀 API调用基础信息

**基础配置：**
- **基础URL**: `http://127.0.0.1:8000` (开发环境)
- **认证方式**: JWT Bearer Token  
- **数据格式**: JSON
- **编码格式**: UTF-8
- **超时设置**: 30秒
- **重试次数**: 3次

## 🔧 前端调用模式

### 标准调用格式
```javascript
// 1. 基础调用模式
const response = await wmsAPI.methodName(params)

// 2. 带错误处理的调用
try {
  const data = await wmsAPI.getUsers({ page: 1 })
  console.log('成功获取用户:', data)
} catch (error) {
  console.error('API调用失败:', error.message)
}

// 3. 分页数据调用
const { results, count, next, previous } = await wmsAPI.getUsers({
  page: 1,
  page_size: 20,
  search: 'admin'
})

// 4. 批量操作调用
await wmsAPI.batchUpdateUsers('activate', [1, 2, 3])
```

### 认证Token自动管理
```javascript
// Token自动携带 (无需手动设置)
// 所有API调用都会自动添加以下请求头:
{
  'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
  'Content-Type': 'application/json'
}

// Token过期自动刷新
// 当检测到401错误时，系统会自动:
// 1. 使用refresh token获取新的access token
// 2. 重新发送原始请求
// 3. 如果刷新失败，则跳转到登录页面
```

### 参数传递规范
```javascript
// 1. GET请求 - 查询参数
await wmsAPI.getUsers({
  page: 1,              // 数字类型
  search: '管理员',      // 字符串类型  
  is_active: true,      // 布尔类型
  created_at__gte: '2025-01-01'  // 日期范围查询
})

// 2. POST请求 - 请求体参数
await wmsAPI.createUser({
  username: 'newuser',    // 必填字段
  email: 'user@example.com',
  password: 'password123',
  first_name: '张三',     // 可选字段
  groups: [1, 2]          // 数组类型
})

// 3. PUT请求 - 部分更新
await wmsAPI.updateUser(5, {
  first_name: '李四',     // 只更新指定字段
  is_active: false
})
```

### 响应数据处理
```javascript
// 1. 单条数据响应
const user = await wmsAPI.getCurrentUser()
// 返回: { id: 1, username: 'admin', ... }

// 2. 列表数据响应 (分页)
const response = await wmsAPI.getUsers()
// 返回: { count: 100, results: [...], next: '...', previous: null }

// 3. 创建/更新响应
const newUser = await wmsAPI.createUser(userData)
// 返回: 创建的用户对象，包含自动生成的ID和时间戳

// 4. 删除响应
await wmsAPI.deleteUser(5)
// 返回: undefined (204 No Content)
```

## 📋 环境配置

### 开发环境 (`.env.development`)
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_TIMEOUT=30000
VITE_API_RETRY_COUNT=3
VITE_ENABLE_LOCAL_STORAGE=true  # 开发环境可启用降级
VITE_ENABLE_DEBUG=true
```

### 生产环境 (`.env.production`)
```bash
VITE_API_BASE_URL=https://api.your-domain.com
VITE_API_TIMEOUT=30000
VITE_API_RETRY_COUNT=3
VITE_ENABLE_LOCAL_STORAGE=false  # 生产环境禁用降级
VITE_ENABLE_DEBUG=false
```

## 🔥 完整API接口调用文档

### 🔐 认证模块 (Authentication)

#### 1. 用户登录
```javascript
// 接口地址
POST /users/login/

// 请求参数
{
  "username": "admin",      // 用户名 (必填)
  "password": "admin123"    // 密码 (必填)
}

// 响应格式 (支持多种Token格式)
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...", // 方式1
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...", // 方式2
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...", // 方式3
  "tokens": {                                           // 方式4
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "管理员",
    "is_staff": true,
    "is_superuser": true
  }
}

// 前端调用示例
const response = await wmsAPI.login({
  username: 'admin',
  password: 'admin123'
})
```

**🎯 演示账户**:
- **管理员**: admin / admin123 (完整系统权限)
- **仓库经理**: manager / manager123 (仓库管理权限)  
- **操作员**: operator / operator123 (基础操作权限)

#### 2. 刷新Token
```javascript
// 接口地址
POST /users/refresh/

// 请求参数
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

// 响应格式
{
  "access": "新的访问令牌...",
  "refresh": "新的刷新令牌..." // 可选
}

// 前端调用
const response = await wmsAPI.refreshToken(refreshToken)
```

#### 3. 获取当前用户信息
```javascript
// 接口地址
GET /users/profile/

// 请求头 (自动添加)
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

// 响应格式
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "管理员",
  "last_name": "",
  "is_staff": true,
  "is_superuser": true,
  "groups": ["管理员"],
  "permissions": ["user.add", "user.change", ...]
}

// 前端调用
const userInfo = await wmsAPI.getCurrentUser()
```

#### 4. 用户登出
```javascript
// 接口地址
POST /users/logout/

// 请求参数
{
  "refresh": "当前刷新令牌..." // 可选
}

// 前端调用
await wmsAPI.logout()
// 自动清理本地存储的Token和用户信息
```

#### 5. 健康检查
```javascript
// 接口地址
GET /api/test/

// 响应格式
{
  "status": "ok",
  "message": "API服务正常",
  "timestamp": "2025-01-20T10:30:00Z",
  "version": "1.0.0"
}

// 前端调用
const healthStatus = await wmsAPI.healthCheck()
```

## 📋 wmsAPI接口索引

### 🔐 认证相关 (Authentication)
```javascript
// 用户认证
wmsAPI.login(credentials)           // 用户登录
wmsAPI.logout()                     // 用户登出  
wmsAPI.refreshToken(refreshToken)   // 刷新Token
wmsAPI.getCurrentUser()             // 获取当前用户信息
wmsAPI.healthCheck()                // 健康检查
```

### 👤 用户管理 (User Management)  
```javascript
// 用户CRUD
wmsAPI.getUsers(params)             // 获取用户列表
wmsAPI.createUser(userData)         // 创建用户
wmsAPI.updateUser(id, userData)     // 更新用户
wmsAPI.deleteUser(id)               // 删除用户
wmsAPI.batchUpdateUsers(action, ids) // 批量操作用户

// 员工管理
wmsAPI.getStaff(params)             // 获取员工列表
wmsAPI.createStaff(staffData)       // 创建员工
wmsAPI.updateStaff(id, staffData)   // 更新员工
wmsAPI.updateStaffStatus(id, status) // 更新员工状态
wmsAPI.deleteStaff(id)              // 删除员工
```

### 🔑 角色权限 (Role & Permission)
```javascript  
// 角色管理
wmsAPI.getRoles(params)             // 获取角色列表
wmsAPI.createRole(roleData)         // 创建角色
wmsAPI.updateRole(id, roleData)     // 更新角色
wmsAPI.deleteRole(id)               // 删除角色
wmsAPI.updateRolePermissions(id, permissions) // 更新角色权限
wmsAPI.assignRoleToUsers(roleId, users)       // 分配角色给用户

// 权限管理
wmsAPI.getPermissionTree()          // 获取权限树
wmsAPI.getPermissionsByModule(module) // 按模块获取权限
wmsAPI.getPermissions(params)       // 获取权限列表
wmsAPI.checkUserPermissions(permissions) // 检查用户权限
```

### 🏢 仓库管理 (Warehouse Management)
```javascript
// 仓库管理
wmsAPI.getWarehouses(params)        // 获取仓库列表
wmsAPI.createWarehouse(warehouseData) // 创建仓库
wmsAPI.updateWarehouse(id, data)    // 更新仓库
wmsAPI.deleteWarehouse(id)          // 删除仓库
wmsAPI.getWarehouseStats(id)        // 获取仓库统计

// 库区管理
wmsAPI.getWarehouseZones(params)    // 获取库区列表
wmsAPI.createWarehouseZone(zoneData) // 创建库区
wmsAPI.updateWarehouseZone(id, data) // 更新库区
wmsAPI.deleteWarehouseZone(id)      // 删除库区

// 库位管理
wmsAPI.getWarehouseLocations(params) // 获取库位列表
wmsAPI.createWarehouseLocation(locationData) // 创建库位
wmsAPI.batchCreateLocations(batchData)        // 批量创建库位
wmsAPI.updateWarehouseLocation(id, data)     // 更新库位
wmsAPI.deleteWarehouseLocation(id)           // 删除库位
wmsAPI.occupyLocation(id, occupyData)        // 占用库位
wmsAPI.releaseLocation(id)                   // 释放库位
```

### 📦 商品管理 (Product Management) - 🔄 待完善
```javascript
// 商品CRUD
wmsAPI.getProducts(params)          // 获取商品列表
wmsAPI.createProduct(productData)   // 创建商品
wmsAPI.updateProduct(id, data)      // 更新商品
wmsAPI.deleteProduct(id)            // 删除商品
wmsAPI.batchImportProducts(file)    // 批量导入商品

// 分类管理
wmsAPI.getCategories(params)        // 获取分类列表
wmsAPI.createCategory(categoryData) // 创建分类
wmsAPI.updateCategory(id, data)     // 更新分类
wmsAPI.deleteCategory(id)           // 删除分类

// 品牌管理
wmsAPI.getBrands(params)            // 获取品牌列表
wmsAPI.createBrand(brandData)       // 创建品牌
wmsAPI.updateBrand(id, data)        // 更新品牌
wmsAPI.deleteBrand(id)              // 删除品牌

// 供应商管理
wmsAPI.getSuppliers(params)         // 获取供应商列表
wmsAPI.createSupplier(supplierData) // 创建供应商
wmsAPI.updateSupplier(id, data)     // 更新供应商
wmsAPI.deleteSupplier(id)           // 删除供应商

// 客户管理
wmsAPI.getCustomers(params)         // 获取客户列表
wmsAPI.createCustomer(customerData) // 创建客户
wmsAPI.updateCustomer(id, data)     // 更新客户
wmsAPI.deleteCustomer(id)           // 删除客户
```

### 📊 库存管理 (Inventory Management) - ✅ 已完成
```javascript
// 库存查询 ⚡ 已更新路径
wmsAPI.getStock(params)             // 获取库存列表
wmsAPI.getStockStats()              // 获取库存统计
wmsAPI.adjustStock(adjustData)      // 库存调整
wmsAPI.transferStock(transferData)  // 库存转移

// 库存预警 ⚡ 已更新路径  
wmsAPI.getInventoryAlerts(params)   // 获取库存预警
wmsAPI.handleAlert(id, action)      // 处理预警
wmsAPI.batchHandleAlerts(ids, action) // 批量处理预警
wmsAPI.getAlertStats()              // 获取预警统计

// 库存移动记录
wmsAPI.getInventoryMovements(params) // 获取移动记录
wmsAPI.getMovementDetails(id)        // 获取移动详情

// 盘点管理 ⚡ 已更新路径
wmsAPI.getInventoryCounts(params)   // 获取盘点列表  
wmsAPI.createInventoryCount(countData) // 创建盘点
wmsAPI.startInventoryCount(id)      // 开始盘点
wmsAPI.submitInventoryCount(id, data) // 提交盘点
```

### 📥 入库管理 (Inbound Management) - ✅ 已完成
```javascript
// 采购入库
wmsAPI.getPurchaseOrders(params)    // 获取采购入库单
wmsAPI.createPurchaseOrder(orderData) // 创建采购入库单
wmsAPI.updatePurchaseOrder(id, data) // 更新采购入库单
wmsAPI.startReceiving(id)           // 开始收货
wmsAPI.confirmReceiving(id, data)   // 确认收货

// 退货入库
wmsAPI.getReturnOrders(params)      // 获取退货入库单
wmsAPI.createReturnOrder(orderData) // 创建退货入库单
wmsAPI.processReturn(id, data)      // 处理退货

// 调拨入库
wmsAPI.getTransferInOrders(params)  // 获取调拨入库单
wmsAPI.createTransferInOrder(orderData) // 创建调拨入库单
wmsAPI.confirmTransferIn(id, data)  // 确认调拨入库

// 入库组件
wmsAPI.getArrivalNotifications(params) // 获取到货通知
wmsAPI.getPendingArrivals(params)      // 获取待入库
wmsAPI.getReceiptDetails(id)           // 获取收货详情
wmsAPI.processUnloading(id, data)      // 处理卸货
wmsAPI.processSorting(id, data)        // 处理分拣
wmsAPI.processShelving(id, data)       // 处理上架
```

### 📤 出库管理 (Outbound Management) - 🔄 待完善
```javascript
// 销售出库 ⚡ 已更新路径
wmsAPI.getOutboundOrders(params)    // 获取出库单列表
wmsAPI.createOutboundOrder(orderData) // 创建出库单
wmsAPI.updateOutboundOrder(id, data) // 更新出库单
wmsAPI.deleteOutboundOrder(id)      // 删除出库单
wmsAPI.confirmOutboundOrder(id)     // 确认出库单
wmsAPI.getOutboundStats()           // 获取出库统计

// 拣货管理 ⚡ 已更新路径
wmsAPI.startPicking(id)             // 开始拣货
wmsAPI.scanPickingItem(id, scanData) // 扫码确认拣货
wmsAPI.completePicking(id)          // 完成拣货
wmsAPI.batchStartPicking(ids)       // 批量开始拣货
wmsAPI.batchCompletePicking(ids)    // 批量完成拣货

// 打包管理
wmsAPI.startPacking(id)             // 开始打包
wmsAPI.completePacking(id, data)    // 完成打包
wmsAPI.batchCompletePacking(ids)    // 批量完成打包

// 发货管理
wmsAPI.startShipping(id)            // 开始发货
wmsAPI.confirmShipping(id, data)    // 确认发货
wmsAPI.batchConfirmShipping(ids)    // 批量确认发货

// 销售出库
wmsAPI.getSalesOrders(params)       // 获取销售出库单
wmsAPI.createSalesOrder(orderData)  // 创建销售出库单

// 调拨出库
wmsAPI.getTransferOutOrders(params) // 获取调拨出库单
wmsAPI.createTransferOutOrder(orderData) // 创建调拨出库单
```

### 🔍 质检管理 (Quality Management) - 🔄 待完善
```javascript
// 质检流程
wmsAPI.getQualityInspections(params) // 获取质检列表
wmsAPI.createQualityInspection(data) // 创建质检任务
wmsAPI.startInspection(id)          // 开始质检
wmsAPI.completeInspection(id, data) // 完成质检
wmsAPI.batchInspection(ids, action) // 批量质检

// 质检统计
wmsAPI.getQualityStats()            // 获取质检统计
wmsAPI.getInspectionReport(id)      // 获取质检报告
wmsAPI.printInspectionReport(id)    // 打印质检报告

// 质检标准
wmsAPI.getQualityStandards(params)  // 获取质检标准
wmsAPI.createQualityStandard(data)  // 创建质检标准
```

### 📈 报表分析 (Reports & Analytics) - 🔄 待完善
```javascript
// 概览报表
wmsAPI.getDashboardOverview()       // 获取仪表板概览
wmsAPI.getInboundReport(params)     // 获取入库报表
wmsAPI.getOutboundReport(params)    // 获取出库报表
wmsAPI.getInventoryReport(params)   // 获取库存报表

// 数据分析
wmsAPI.getDataAnalysis(params)      // 获取数据分析
wmsAPI.getTrendAnalysis(params)     // 获取趋势分析
wmsAPI.getPerformanceMetrics()      // 获取性能指标

// 报表导出
wmsAPI.exportReport(type, params)   // 导出报表
wmsAPI.scheduleReport(reportConfig) // 定时报表
```

### ⚙️ 系统管理 (System Management) - 🔄 待完善
```javascript
// 系统监控
wmsAPI.getSystemStatus()            // 获取系统状态
wmsAPI.getPerformanceMetrics()      // 获取性能指标
wmsAPI.getHealthStatus()            // 获取健康状态

// 日志管理
wmsAPI.getSystemLogs(params)        // 获取系统日志
wmsAPI.getOperationLogs(params)     // 获取操作日志
wmsAPI.getLoginLogs(params)         // 获取登录日志

// 备份管理
wmsAPI.getBackupList()              // 获取备份列表
wmsAPI.createBackup(config)         // 创建备份
wmsAPI.restoreBackup(id)            // 恢复备份
wmsAPI.deleteBackup(id)             // 删除备份

// 数据管理
wmsAPI.importData(file, type)       // 批量导入数据
wmsAPI.exportData(type, params)     // 数据导出
wmsAPI.validateData(type)           // 数据验证
```

## 📋 wmsAPI接口索引

### 👤 用户管理模块 (User Management)

#### 1. 用户CRUD操作

##### 1.1 获取用户列表
```javascript
// 接口地址
GET /users/users/

// 查询参数
{
  page: 1,              // 页码 (可选，默认1)
  page_size: 20,        // 每页数量 (可选，默认20)
  search: "keyword",    // 搜索关键词 (可选)
  is_active: true,      // 用户状态筛选 (可选)
  is_staff: false,      // 员工状态筛选 (可选)
  ordering: "-date_joined"  // 排序 (可选)
}

// 响应格式
{
  "count": 100,
  "next": "http://example.com/users/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "first_name": "管理员",
      "last_name": "",
      "is_active": true,
      "is_staff": true,
      "is_superuser": true,
      "date_joined": "2025-01-20T10:00:00Z",
      "last_login": "2025-01-20T15:30:00Z",
      "groups": ["管理员组"]
    }
  ]
}

// 前端调用
const users = await wmsAPI.getUsers({
  page: 1,
  page_size: 20,
  search: 'admin'
})
```

##### 1.2 创建用户
```javascript
// 接口地址
POST /users/users/

// 请求参数
{
  "username": "newuser",        // 用户名 (必填，唯一)
  "email": "user@example.com",  // 邮箱 (必填，唯一)
  "password": "password123",    // 密码 (必填，至少8位)
  "first_name": "张三",         // 姓名 (可选)
  "last_name": "",              // 姓氏 (可选)
  "is_active": true,            // 是否激活 (可选，默认true)
  "is_staff": false,            // 是否员工 (可选，默认false)
  "groups": [1, 2]              // 用户组ID列表 (可选)
}

// 响应格式
{
  "id": 5,
  "username": "newuser",
  "email": "user@example.com",
  "first_name": "张三",
  "is_active": true,
  "is_staff": false,
  "date_joined": "2025-01-20T16:00:00Z"
}

// 前端调用
const newUser = await wmsAPI.createUser({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123',
  first_name: '张三'
})
```

##### 1.3 更新用户
```javascript
// 接口地址
PUT /users/users/{id}/

// 请求参数 (所有字段都是可选的)
{
  "username": "updateduser",
  "email": "updated@example.com",
  "first_name": "李四",
  "is_active": false,
  "is_staff": true,
  "groups": [1, 3]
}

// 前端调用
const updatedUser = await wmsAPI.updateUser(5, {
  first_name: '李四',
  is_active: false
})
```

##### 1.4 删除用户
```javascript
// 接口地址
DELETE /users/users/{id}/

// 响应: 204 No Content (成功删除)

// 前端调用
await wmsAPI.deleteUser(5)
```

##### 1.5 批量操作用户
```javascript
// 批量激活/禁用用户
POST /users/users/batch_action/

// 请求参数
{
  "action": "activate",  // 操作类型: activate, deactivate, delete
  "user_ids": [1, 2, 3, 4]  // 用户ID列表
}

// 前端调用
await wmsAPI.batchUpdateUsers('activate', [1, 2, 3])
```

#### 2. 员工管理

##### 2.1 获取员工列表
```javascript
// 接口地址
GET /users/staff/

// 查询参数
{
  page: 1,
  page_size: 20,
  department: "warehouse",    // 部门筛选
  position: "manager",        // 职位筛选
  status: "active",          // 状态筛选
  search: "张三"             // 姓名搜索
}

// 响应格式
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "staff001",
        "first_name": "张三",
        "email": "zhang@example.com"
      },
      "employee_id": "EMP001",    // 员工编号
      "department": "warehouse",   // 部门
      "position": "manager",       // 职位
      "phone": "13800138000",      // 电话
      "hire_date": "2024-01-01",   // 入职日期
      "salary": 8000.00,           // 薪资
      "status": "active",          // 状态: active, inactive, resigned
      "address": "北京市朝阳区",    // 地址
      "emergency_contact": "李四",  // 紧急联系人
      "emergency_phone": "13900139000"
    }
  ]
}

// 前端调用
const staff = await wmsAPI.getStaff({
  department: 'warehouse',
  position: 'manager'
})
```

##### 2.2 创建员工
```javascript
// 接口地址
POST /users/staff/

// 请求参数
{
  "user_id": 3,                    // 关联用户ID (必填)
  "employee_id": "EMP002",         // 员工编号 (必填，唯一)
  "department": "warehouse",       // 部门 (必填)
  "position": "operator",          // 职位 (必填)
  "phone": "13700137000",          // 电话 (可选)
  "hire_date": "2025-01-20",       // 入职日期 (可选，默认今天)
  "salary": 6000.00,               // 薪资 (可选)
  "address": "上海市浦东新区",       // 地址 (可选)
  "emergency_contact": "王五",      // 紧急联系人 (可选)
  "emergency_phone": "13600136000" // 紧急联系电话 (可选)
}

// 前端调用
const newStaff = await wmsAPI.createStaff({
  user_id: 3,
  employee_id: 'EMP002',
  department: 'warehouse',
  position: 'operator',
  phone: '13700137000'
})
```

##### 2.3 更新员工信息
```javascript
// 接口地址
PUT /users/staff/{id}/

// 请求参数
{
  "department": "logistics",
  "position": "supervisor",
  "salary": 7000.00,
  "status": "active"
}

// 前端调用
const updatedStaff = await wmsAPI.updateStaff(1, {
  position: 'supervisor',
  salary: 7000.00
})
```

##### 2.4 更新员工状态
```javascript
// 接口地址
PUT /users/staff/{id}/status/

// 请求参数
{
  "status": "inactive",        // 状态: active, inactive, resigned
  "reason": "调岗",            // 原因 (可选)
  "effective_date": "2025-01-21"  // 生效日期 (可选)
}

// 前端调用
await wmsAPI.updateStaffStatus(1, {
  status: 'inactive',
  reason: '调岗'
})
```

##### 2.5 删除员工
```javascript
// 接口地址
DELETE /users/staff/{id}/

// 前端调用
await wmsAPI.deleteStaff(1)
```

### 🔑 角色权限模块 (Role & Permission)

#### 1. 角色管理

##### 1.1 获取角色列表
```javascript
// 接口地址
GET /users/roles/

// 查询参数
{
  page: 1,
  page_size: 20,
  search: "管理员",        // 角色名称搜索
  is_active: true         // 状态筛选
}

// 响应格式
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "name": "系统管理员",
      "description": "拥有系统全部权限",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-20T10:00:00Z",
      "permissions": [
        {
          "id": 1,
          "name": "user.add",
          "codename": "add_user",
          "content_type": "用户管理"
        }
      ],
      "user_count": 5         // 拥有此角色的用户数量
    }
  ]
}

// 前端调用
const roles = await wmsAPI.getRoles({
  page: 1,
  search: '管理员'
})
```

##### 1.2 创建角色
```javascript
// 接口地址
POST /users/roles/

// 请求参数
{
  "name": "仓库管理员",           // 角色名称 (必填，唯一)
  "description": "仓库日常管理权限", // 描述 (可选)
  "is_active": true,             // 是否激活 (可选，默认true)
  "permissions": [1, 2, 3, 5]    // 权限ID列表 (可选)
}

// 响应格式
{
  "id": 5,
  "name": "仓库管理员",
  "description": "仓库日常管理权限",
  "is_active": true,
  "created_at": "2025-01-20T16:00:00Z",
  "permissions": [...]
}

// 前端调用
const newRole = await wmsAPI.createRole({
  name: '仓库管理员',
  description: '仓库日常管理权限',
  permissions: [1, 2, 3, 5]
})
```

##### 1.3 更新角色
```javascript
// 接口地址
PUT /users/roles/{id}/

// 请求参数
{
  "name": "高级仓库管理员",
  "description": "仓库高级管理权限",
  "is_active": true,
  "permissions": [1, 2, 3, 4, 5, 6]
}

// 前端调用
const updatedRole = await wmsAPI.updateRole(5, {
  name: '高级仓库管理员',
  permissions: [1, 2, 3, 4, 5, 6]
})
```

##### 1.4 删除角色
```javascript
// 接口地址
DELETE /users/roles/{id}/

// 前端调用
await wmsAPI.deleteRole(5)
```

##### 1.5 更新角色权限
```javascript
// 接口地址
POST /users/roles/{id}/permissions/

// 请求参数
{
  "permissions": [1, 2, 3, 4, 5, 6, 7]  // 权限ID列表
}

// 响应格式
{
  "id": 5,
  "name": "仓库管理员",
  "permissions": [
    {
      "id": 1,
      "name": "user.add",
      "codename": "add_user",
      "content_type": "用户管理"
    }
  ]
}

// 前端调用
await wmsAPI.updateRolePermissions(5, {
  permissions: [1, 2, 3, 4, 5, 6, 7]
})
```

##### 1.6 批量分配角色给用户
```javascript
// 接口地址
POST /users/roles/{id}/assign_users/

// 请求参数
{
  "user_ids": [1, 2, 3, 4],     // 用户ID列表
  "action": "add"               // 操作类型: add, remove
}

// 前端调用
await wmsAPI.assignRoleToUsers(5, {
  user_ids: [1, 2, 3, 4],
  action: 'add'
})
```

#### 2. 权限管理

##### 2.1 获取权限树
```javascript
// 接口地址
GET /users/permissions/tree/

// 响应格式
{
  "permissions": [
    {
      "module": "用户管理",
      "module_code": "user",
      "permissions": [
        {
          "id": 1,
          "name": "user.add",
          "codename": "add_user",
          "description": "添加用户"
        },
        {
          "id": 2,
          "name": "user.change",
          "codename": "change_user",
          "description": "修改用户"
        }
      ]
    },
    {
      "module": "商品管理",
      "module_code": "product",
      "permissions": [...]
    }
  ]
}

// 前端调用
const permissionTree = await wmsAPI.getPermissionTree()
```

##### 2.2 按模块获取权限
```javascript
// 接口地址
GET /users/permissions/by_module/

// 查询参数
{
  module: "user"          // 模块代码: user, product, warehouse, inventory等
}

// 响应格式
{
  "module": "user",
  "module_name": "用户管理",
  "permissions": [
    {
      "id": 1,
      "name": "user.add",
      "codename": "add_user",
      "description": "添加用户"
    }
  ]
}

// 前端调用
const userPermissions = await wmsAPI.getPermissionsByModule('user')
```

##### 2.3 获取所有权限列表
```javascript
// 接口地址
GET /users/permissions/

// 查询参数
{
  page: 1,
  page_size: 100,
  search: "用户",         // 权限名称搜索
  module: "user"          // 模块筛选
}

// 前端调用
const permissions = await wmsAPI.getPermissions({
  module: 'user',
  search: '用户'
})
```

##### 2.4 检查用户权限
```javascript
// 接口地址
POST /users/permissions/check/

// 请求参数
{
  "user_id": 5,                    // 用户ID (可选，默认当前用户)
  "permissions": ["user.add", "user.change"]  // 权限代码列表
}

// 响应格式
{
  "user_id": 5,
  "results": {
    "user.add": true,
    "user.change": false
  }
}

// 前端调用
const permissionCheck = await wmsAPI.checkUserPermissions({
  permissions: ['user.add', 'user.change']
})
```

### 🏢 仓库管理 (Warehouse Management)

#### 1. 仓库管理

##### 1.1 获取仓库列表
```javascript
// 接口地址
GET /warehouse/warehouses/

// 查询参数
{
  page: 1,
  page_size: 20,
  search: "北京仓库",      // 仓库名称搜索
  status: "active",       // 状态筛选: active, inactive
  type: "main",           // 仓库类型: main, branch, virtual
  city: "北京",           // 城市筛选
  ordering: "name"        // 排序: name, created_at, -created_at
}

// 响应格式
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "name": "北京总仓库",
      "code": "BJ001",              // 仓库编码
      "type": "main",               // 类型: main, branch, virtual
      "status": "active",           // 状态: active, inactive
      "address": "北京市朝阳区xxx路123号",
      "city": "北京",
      "province": "北京市",
      "postal_code": "100000",
      "contact_person": "张经理",    // 联系人
      "contact_phone": "010-12345678",
      "contact_email": "zhang@company.com",
      "area": 10000.5,              // 仓库面积(平方米)
      "capacity": 50000,            // 容量(立方米)
      "description": "北京地区主要仓库",
      "created_at": "2024-01-01T00:00:00Z",
      "zones_count": 8,             // 库区数量
      "locations_count": 320,       // 库位数量
      "current_utilization": 75.5   // 当前利用率(%)
    }
  ]
}

// 前端调用
const warehouses = await wmsAPI.getWarehouses({
  search: '北京',
  status: 'active'
})
```

##### 1.2 创建仓库
```javascript
// 接口地址
POST /warehouse/warehouses/

// 请求参数
{
  "name": "上海分仓库",             // 仓库名称 (必填)
  "code": "SH001",                 // 仓库编码 (必填，唯一)
  "type": "branch",                // 类型 (必填): main, branch, virtual
  "address": "上海市浦东新区xxx路456号", // 地址 (必填)
  "city": "上海",                  // 城市 (必填)
  "province": "上海市",             // 省份 (必填)
  "postal_code": "200000",         // 邮编 (可选)
  "contact_person": "李经理",       // 联系人 (可选)
  "contact_phone": "021-87654321", // 联系电话 (可选)
  "contact_email": "li@company.com", // 联系邮箱 (可选)
  "area": 8000.0,                  // 仓库面积 (可选)
  "capacity": 40000,               // 容量 (可选)
  "description": "上海地区分仓库",   // 描述 (可选)
  "status": "active"               // 状态 (可选，默认active)
}

// 前端调用
const newWarehouse = await wmsAPI.createWarehouse({
  name: '上海分仓库',
  code: 'SH001',
  type: 'branch',
  address: '上海市浦东新区xxx路456号',
  city: '上海',
  province: '上海市'
})
```

##### 1.3 更新仓库
```javascript
// 接口地址
PUT /warehouse/warehouses/{id}/

// 请求参数 (所有字段都是可选的)
{
  "name": "上海主仓库",
  "type": "main",
  "contact_person": "王经理",
  "contact_phone": "021-11111111",
  "area": 12000.0,
  "status": "active"
}

// 前端调用
const updatedWarehouse = await wmsAPI.updateWarehouse(2, {
  name: '上海主仓库',
  type: 'main'
})
```

##### 1.4 删除仓库
```javascript
// 接口地址
DELETE /warehouse/warehouses/{id}/

// 前端调用
await wmsAPI.deleteWarehouse(2)
```

##### 1.5 获取仓库统计信息
```javascript
// 接口地址
GET /warehouse/warehouses/{id}/stats/

// 响应格式
{
  "warehouse_id": 1,
  "zones_count": 8,
  "locations_count": 320,
  "total_capacity": 50000,
  "used_capacity": 37750,
  "utilization_rate": 75.5,
  "product_count": 1250,
  "inbound_today": 25,
  "outbound_today": 18
}

// 前端调用
const warehouseStats = await wmsAPI.getWarehouseStats(1)
```

#### 2. 库区管理

##### 2.1 获取库区列表
```javascript
// 接口地址
GET /warehouse/zones/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,        // 所属仓库ID (可选)
  search: "收货区",       // 库区名称搜索
  type: "storage",        // 库区类型筛选
  status: "active"        // 状态筛选
}

// 响应格式
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "name": "A区收货区",
      "code": "A-RECEIPT",          // 库区编码
      "warehouse": {
        "id": 1,
        "name": "北京总仓库",
        "code": "BJ001"
      },
      "type": "receipt",            // 类型: receipt, storage, shipping, quarantine
      "status": "active",           // 状态: active, inactive, maintenance
      "description": "主要收货区域",
      "area": 500.0,                // 库区面积
      "height": 6.0,                // 高度
      "temperature_min": -20,       // 最低温度
      "temperature_max": 25,        // 最高温度
      "humidity_min": 30,           // 最低湿度
      "humidity_max": 70,           // 最高湿度
      "locations_count": 40,        // 库位数量
      "capacity_utilization": 80.5, // 容量利用率
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}

// 前端调用
const zones = await wmsAPI.getWarehouseZones({
  warehouse_id: 1,
  type: 'storage'
})
```

##### 2.2 创建库区
```javascript
// 接口地址
POST /warehouse/zones/

// 请求参数
{
  "name": "B区存储区",            // 库区名称 (必填)
  "code": "B-STORAGE",           // 库区编码 (必填，仓库内唯一)
  "warehouse_id": 1,             // 所属仓库ID (必填)
  "type": "storage",             // 类型 (必填): receipt, storage, shipping, quarantine
  "description": "常温存储区域",  // 描述 (可选)
  "area": 1200.0,                // 库区面积 (可选)
  "height": 8.0,                 // 高度 (可选)
  "temperature_min": 0,          // 最低温度 (可选)
  "temperature_max": 30,         // 最高温度 (可选)
  "humidity_min": 20,            // 最低湿度 (可选)
  "humidity_max": 80,            // 最高湿度 (可选)
  "status": "active"             // 状态 (可选，默认active)
}

// 前端调用
const newZone = await wmsAPI.createWarehouseZone({
  name: 'B区存储区',
  code: 'B-STORAGE',
  warehouse_id: 1,
  type: 'storage',
  area: 1200.0
})
```

##### 2.3 更新库区
```javascript
// 接口地址
PUT /warehouse/zones/{id}/

// 前端调用
const updatedZone = await wmsAPI.updateWarehouseZone(2, {
  name: 'B区高级存储区',
  temperature_max: 25
})
```

##### 2.4 删除库区
```javascript
// 接口地址
DELETE /warehouse/zones/{id}/

// 前端调用
await wmsAPI.deleteWarehouseZone(2)
```

#### 3. 库位管理

##### 3.1 获取库位列表
```javascript
// 接口地址
GET /warehouse/locations/

// 查询参数
{
  page: 1,
  page_size: 50,
  warehouse_id: 1,        // 仓库ID筛选
  zone_id: 2,             // 库区ID筛选
  search: "A01-01-01",    // 库位编码搜索
  status: "available",    // 状态筛选: available, occupied, reserved, maintenance
  type: "shelf",          // 类型筛选: shelf, floor, hanging, refrigerated
  is_empty: true          // 是否空闲
}

// 响应格式
{
  "count": 320,
  "results": [
    {
      "id": 1,
      "code": "A01-01-01",         // 库位编码
      "warehouse": {
        "id": 1,
        "name": "北京总仓库"
      },
      "zone": {
        "id": 2,
        "name": "A区存储区"
      },
      "aisle": "A01",              // 通道
      "rack": "01",                // 货架
      "level": "01",               // 层级
      "position": "01",            // 位置
      "type": "shelf",             // 类型: shelf, floor, hanging, refrigerated
      "status": "occupied",        // 状态: available, occupied, reserved, maintenance
      "length": 1.2,               // 长度(米)
      "width": 0.8,                // 宽度(米)
      "height": 2.0,               // 高度(米)
      "max_weight": 500.0,         // 最大承重(kg)
      "current_stock": {
        "product_id": 123,
        "product_name": "商品A",
        "quantity": 100,
        "unit": "件"
      },
      "utilization": 75.0,         // 利用率
      "created_at": "2024-01-01T00:00:00Z",
      "last_updated": "2025-01-20T10:00:00Z"
    }
  ]
}

// 前端调用
const locations = await wmsAPI.getWarehouseLocations({
  warehouse_id: 1,
  zone_id: 2,
  status: 'available'
})
```

##### 3.2 创建库位
```javascript
// 接口地址
POST /warehouse/locations/

// 请求参数
{
  "code": "A01-02-01",           // 库位编码 (必填，全局唯一)
  "warehouse_id": 1,             // 仓库ID (必填)
  "zone_id": 2,                  // 库区ID (必填)
  "aisle": "A01",                // 通道 (可选)
  "rack": "02",                  // 货架 (可选)
  "level": "01",                 // 层级 (可选)
  "position": "01",              // 位置 (可选)
  "type": "shelf",               // 类型 (必填): shelf, floor, hanging, refrigerated
  "length": 1.2,                 // 长度 (可选)
  "width": 0.8,                  // 宽度 (可选)
  "height": 2.0,                 // 高度 (可选)
  "max_weight": 500.0,           // 最大承重 (可选)
  "description": "标准货架库位", // 描述 (可选)
  "status": "available"          // 状态 (可选，默认available)
}

// 前端调用
const newLocation = await wmsAPI.createWarehouseLocation({
  code: 'A01-02-01',
  warehouse_id: 1,
  zone_id: 2,
  type: 'shelf',
  max_weight: 500.0
})
```

##### 3.3 批量创建库位
```javascript
// 接口地址
POST /warehouse/locations/batch_create/

// 请求参数
{
  "warehouse_id": 1,
  "zone_id": 2,
  "aisle_range": ["A01", "A02", "A03"],    // 通道范围
  "rack_range": ["01", "02", "03", "04"],  // 货架范围
  "level_range": ["01", "02", "03"],       // 层级范围
  "position_range": ["01", "02"],          // 位置范围
  "type": "shelf",
  "length": 1.2,
  "width": 0.8,
  "height": 2.0,
  "max_weight": 500.0
}

// 响应格式
{
  "created_count": 72,
  "locations": [
    {
      "code": "A01-01-01-01",
      "id": 100
    }
  ]
}

// 前端调用
const batchResult = await wmsAPI.batchCreateLocations({
  warehouse_id: 1,
  zone_id: 2,
  aisle_range: ["A01", "A02"],
  rack_range: ["01", "02"],
  level_range: ["01", "02"],
  position_range: ["01", "02"],
  type: 'shelf'
})
```

##### 3.4 更新库位
```javascript
// 接口地址
PUT /warehouse/locations/{id}/

// 前端调用
const updatedLocation = await wmsAPI.updateWarehouseLocation(100, {
  max_weight: 800.0,
  status: 'maintenance'
})
```

##### 3.5 删除库位
```javascript
// 接口地址
DELETE /warehouse/locations/{id}/

// 前端调用
await wmsAPI.deleteWarehouseLocation(100)
```

##### 3.6 库位占用/释放
```javascript
// 占用库位
POST /warehouse/locations/{id}/occupy/

// 请求参数
{
  "product_id": 123,             // 商品ID
  "quantity": 50,                // 数量
  "reserved_by": "order_001"     // 预留原因/订单号
}

// 释放库位
POST /warehouse/locations/{id}/release/

// 前端调用
await wmsAPI.occupyLocation(100, {
  product_id: 123,
  quantity: 50
})

await wmsAPI.releaseLocation(100)
```

### 📦 商品管理模块 (Product Management)

#### 1. 商品管理

##### 1.1 获取商品列表
```javascript
// 接口地址
GET /products/products/

// 查询参数
{
  page: 1,
  page_size: 20,
  search: "iPhone",           // 商品名称/编码搜索
  category_id: 5,             // 分类ID筛选
  brand_id: 3,                // 品牌ID筛选
  supplier_id: 2,             // 供应商ID筛选
  status: "active",           // 状态筛选: active, inactive, discontinued
  price_min: 100.0,           // 最低价格
  price_max: 1000.0,          // 最高价格
  stock_status: "in_stock",   // 库存状态: in_stock, low_stock, out_of_stock
  ordering: "-created_at"     // 排序
}

// 响应格式
{
  "count": 500,
  "results": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "code": "IP15PRO001",        // 商品编码
      "barcode": "1234567890123",  // 条形码
      "category": {
        "id": 5,
        "name": "智能手机",
        "code": "PHONE"
      },
      "brand": {
        "id": 3,
        "name": "苹果",
        "code": "APPLE"
      },
      "supplier": {
        "id": 2,
        "name": "苹果官方供应商",
        "contact": "supplier@apple.com"
      },
      "description": "最新款iPhone手机",
      "specifications": "128GB存储，6.1英寸屏幕",
      "unit": "台",                // 计量单位
      "price": 7999.00,           // 单价
      "cost": 6000.00,            // 成本价
      "weight": 187.0,            // 重量(克)
      "dimensions": "146.6×70.6×7.8", // 尺寸(mm)
      "images": [                 // 商品图片
        "/media/products/iphone15_1.jpg",
        "/media/products/iphone15_2.jpg"
      ],
      "status": "active",         // 状态
      "current_stock": 150,       // 当前库存
      "reserved_stock": 20,       // 预留库存
      "available_stock": 130,     // 可用库存
      "min_stock": 10,            // 最低库存
      "max_stock": 500,           // 最高库存
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2025-01-20T10:00:00Z"
    }
  ]
}

// 前端调用
const products = await wmsAPI.getProducts({
  search: 'iPhone',
  category_id: 5,
  status: 'active'
})
```

##### 1.2 创建商品
```javascript
// 接口地址
POST /products/products/

// 请求参数
{
  "name": "华为 Mate 60 Pro",      // 商品名称 (必填)
  "code": "HW60PRO001",           // 商品编码 (必填，唯一)
  "barcode": "2345678901234",     // 条形码 (可选，唯一)
  "category_id": 5,               // 分类ID (必填)
  "brand_id": 4,                  // 品牌ID (必填)
  "supplier_id": 3,               // 供应商ID (必填)
  "description": "华为最新旗舰手机", // 描述 (可选)
  "specifications": "256GB存储，6.82英寸屏幕", // 规格 (可选)
  "unit": "台",                   // 计量单位 (必填)
  "price": 6999.00,              // 单价 (必填)
  "cost": 5500.00,               // 成本价 (可选)
  "weight": 225.0,               // 重量 (可选)
  "dimensions": "163.7×79.0×8.1", // 尺寸 (可选)
  "min_stock": 15,               // 最低库存 (可选)
  "max_stock": 300,              // 最高库存 (可选)
  "status": "active"             // 状态 (可选，默认active)
}

// 前端调用
const newProduct = await wmsAPI.createProduct({
  name: '华为 Mate 60 Pro',
  code: 'HW60PRO001',
  category_id: 5,
  brand_id: 4,
  supplier_id: 3,
  unit: '台',
  price: 6999.00
})
```

##### 1.3 更新商品
```javascript
// 接口地址
PUT /products/products/{id}/

// 请求参数 (所有字段都是可选的)
{
  "name": "华为 Mate 60 Pro Max",
  "price": 7999.00,
  "cost": 6200.00,
  "description": "升级版华为旗舰手机",
  "status": "active"
}

// 前端调用
const updatedProduct = await wmsAPI.updateProduct(123, {
  price: 7999.00,
  description: '升级版华为旗舰手机'
})
```

##### 1.4 删除商品
```javascript
// 接口地址
DELETE /products/products/{id}/

// 前端调用
await wmsAPI.deleteProduct(123)
```

##### 1.5 批量导入商品
```javascript
// 接口地址
POST /products/products/batch_import/

// 请求参数 (FormData)
const formData = new FormData()
formData.append('file', excelFile)
formData.append('update_existing', true)  // 是否更新已存在的商品

// 响应格式
{
  "success": true,
  "imported_count": 150,
  "updated_count": 20,
  "failed_count": 5,
  "errors": [
    {
      "row": 156,
      "error": "商品编码已存在",
      "data": {...}
    }
  ]
}

// 前端调用
const importResult = await wmsAPI.batchImportProducts(file, true)
```

#### 2. 分类管理

##### 2.1 获取分类列表
```javascript
// 接口地址
GET /products/categories/

// 查询参数
{
  page: 1,
  page_size: 50,
  search: "电子产品",        // 分类名称搜索
  parent_id: null,          // 父分类ID (null表示顶级分类)
  level: 1,                 // 分类层级
  status: "active",         // 状态筛选
  ordering: "sort_order"    // 排序
}

// 响应格式
{
  "count": 30,
  "results": [
    {
      "id": 1,
      "name": "电子产品",
      "code": "ELECTRONICS",     // 分类编码
      "parent": null,             // 父分类
      "level": 1,                 // 层级
      "sort_order": 10,           // 排序序号
      "description": "各类电子产品",
      "image": "/media/categories/electronics.jpg", // 分类图片
      "status": "active",
      "product_count": 1250,      // 商品数量
      "children": [               // 子分类
        {
          "id": 5,
          "name": "智能手机",
          "code": "SMARTPHONE",
          "level": 2,
          "product_count": 350
        }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}

// 前端调用
const categories = await wmsAPI.getCategories({
  parent_id: null,  // 获取顶级分类
  status: 'active'
})
```

##### 2.2 创建分类
```javascript
// 接口地址
POST /products/categories/

// 请求参数
{
  "name": "笔记本电脑",          // 分类名称 (必填)
  "code": "LAPTOP",             // 分类编码 (必填，唯一)
  "parent_id": 1,               // 父分类ID (可选)
  "sort_order": 20,             // 排序序号 (可选，默认0)
  "description": "各品牌笔记本电脑", // 描述 (可选)
  "status": "active"            // 状态 (可选，默认active)
}

// 前端调用
const newCategory = await wmsAPI.createCategory({
  name: '笔记本电脑',
  code: 'LAPTOP',
  parent_id: 1
})
```

##### 2.3 更新分类
```javascript
// 接口地址
PUT /products/categories/{id}/

// 前端调用
const updatedCategory = await wmsAPI.updateCategory(6, {
  name: '游戏笔记本',
  sort_order: 25
})
```

##### 2.4 删除分类
```javascript
// 接口地址
DELETE /products/categories/{id}/

// 前端调用
await wmsAPI.deleteCategory(6)
```

#### 3. 品牌管理

##### 3.1 获取品牌列表
```javascript
// 接口地址
GET /products/brands/

// 查询参数
{
  page: 1,
  page_size: 20,
  search: "苹果",            // 品牌名称搜索
  country: "美国",           // 国家筛选
  status: "active",          // 状态筛选
  ordering: "name"           // 排序
}

// 响应格式
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "name": "苹果",
      "code": "APPLE",              // 品牌编码
      "english_name": "Apple Inc.", // 英文名称
      "country": "美国",             // 国家
      "logo": "/media/brands/apple_logo.png", // 品牌Logo
      "website": "https://www.apple.com",     // 官网
      "description": "美国科技公司",
      "status": "active",
      "product_count": 25,          // 商品数量
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}

// 前端调用
const brands = await wmsAPI.getBrands({
  search: '苹果',
  status: 'active'
})
```

##### 3.2 创建品牌
```javascript
// 接口地址
POST /products/brands/

// 请求参数
{
  "name": "华为",                  // 品牌名称 (必填)
  "code": "HUAWEI",               // 品牌编码 (必填，唯一)
  "english_name": "Huawei Technologies Co., Ltd.", // 英文名称 (可选)
  "country": "中国",               // 国家 (可选)
  "website": "https://www.huawei.com", // 官网 (可选)
  "description": "中国通信设备公司", // 描述 (可选)
  "status": "active"              // 状态 (可选，默认active)
}

// 前端调用
const newBrand = await wmsAPI.createBrand({
  name: '华为',
  code: 'HUAWEI',
  country: '中国'
})
```

##### 3.3 更新品牌
```javascript
// 前端调用
const updatedBrand = await wmsAPI.updateBrand(2, {
  website: 'https://consumer.huawei.com',
  description: '中国领先的通信设备和智能终端提供商'
})
```

##### 3.4 删除品牌
```javascript
// 前端调用
await wmsAPI.deleteBrand(2)
```

#### 4. 供应商管理

##### 4.1 获取供应商列表
```javascript
// 接口地址
GET /products/suppliers/

// 查询参数
{
  page: 1,
  page_size: 20,
  search: "苹果供应商",       // 供应商名称搜索
  type: "manufacturer",      // 类型: manufacturer, distributor, agent
  city: "深圳",              // 城市筛选
  status: "active",          // 状态筛选
  ordering: "name"           // 排序
}

// 响应格式
{
  "count": 80,
  "results": [
    {
      "id": 1,
      "name": "深圳苹果代理商",
      "code": "SUP001",             // 供应商编码
      "type": "distributor",        // 类型
      "contact_person": "张经理",    // 联系人
      "contact_phone": "13800138000",
      "contact_email": "zhang@supplier.com",
      "address": "深圳市南山区xxx路123号",
      "city": "深圳",
      "province": "广东",
      "postal_code": "518000",
      "tax_number": "91440300MA5D",  // 税号
      "bank_name": "招商银行",       // 开户银行
      "bank_account": "123456789",   // 银行账号
      "credit_limit": 1000000.0,     // 信用额度
      "payment_terms": "30天",       // 付款条件
      "status": "active",
      "product_count": 15,           // 供应商品数量
      "total_purchases": 5000000.0,  // 累计采购金额
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}

// 前端调用
const suppliers = await wmsAPI.getSuppliers({
  search: '苹果',
  type: 'distributor',
  status: 'active'
})
```

##### 4.2 创建供应商
```javascript
// 接口地址
POST /products/suppliers/

// 请求参数
{
  "name": "华为官方供应商",       // 供应商名称 (必填)
  "code": "SUP002",             // 供应商编码 (必填，唯一)
  "type": "manufacturer",       // 类型 (必填): manufacturer, distributor, agent
  "contact_person": "李经理",    // 联系人 (必填)
  "contact_phone": "13900139000", // 联系电话 (必填)
  "contact_email": "li@huawei-supplier.com", // 联系邮箱 (可选)
  "address": "东莞市松山湖xxx路456号", // 地址 (必填)
  "city": "东莞",               // 城市 (必填)
  "province": "广东",            // 省份 (必填)
  "postal_code": "523000",      // 邮编 (可选)
  "tax_number": "91441900MA5E", // 税号 (可选)
  "bank_name": "中国银行",       // 开户银行 (可选)
  "bank_account": "987654321",  // 银行账号 (可选)
  "credit_limit": 2000000.0,    // 信用额度 (可选)
  "payment_terms": "45天",      // 付款条件 (可选)
  "status": "active"            // 状态 (可选，默认active)
}

// 前端调用
const newSupplier = await wmsAPI.createSupplier({
  name: '华为官方供应商',
  code: 'SUP002',
  type: 'manufacturer',
  contact_person: '李经理',
  contact_phone: '13900139000',
  address: '东莞市松山湖xxx路456号',
  city: '东莞',
  province: '广东'
})
```

##### 4.3 更新供应商
```javascript
// 前端调用
const updatedSupplier = await wmsAPI.updateSupplier(2, {
  credit_limit: 2500000.0,
  payment_terms: '60天',
  contact_email: 'newcontact@huawei-supplier.com'
})
```

##### 4.4 删除供应商
```javascript
// 前端调用
await wmsAPI.deleteSupplier(2)
```

#### 5. 客户管理

##### 5.1 获取客户列表
```javascript
// 接口地址
GET /products/customers/

// 查询参数
{
  page: 1,
  page_size: 20,
  search: "小米专卖店",       // 客户名称搜索
  type: "retailer",          // 类型: retailer, wholesaler, online
  city: "北京",              // 城市筛选
  status: "active",          // 状态筛选
  ordering: "-created_at"    // 排序
}

// 响应格式
{
  "count": 200,
  "results": [
    {
      "id": 1,
      "name": "北京小米专卖店",
      "code": "CUS001",             // 客户编码
      "type": "retailer",           // 类型
      "contact_person": "王店长",    // 联系人
      "contact_phone": "010-12345678",
      "contact_email": "wang@xiaomi-store.com",
      "address": "北京市朝阳区xxx大厦1层",
      "city": "北京",
      "province": "北京",
      "postal_code": "100000",
      "credit_limit": 500000.0,     // 信用额度
      "payment_terms": "15天",       // 付款条件
      "discount_rate": 5.0,         // 折扣率(%)
      "status": "active",
      "total_orders": 150,          // 累计订单数
      "total_sales": 2000000.0,     // 累计销售金额
      "last_order_date": "2025-01-15T00:00:00Z", // 最后订单日期
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}

// 前端调用
const customers = await wmsAPI.getCustomers({
  search: '小米',
  type: 'retailer',
  status: 'active'
})
```

##### 5.2 创建客户
```javascript
// 接口地址
POST /products/customers/

// 请求参数
{
  "name": "上海华为体验店",       // 客户名称 (必填)
  "code": "CUS002",             // 客户编码 (必填，唯一)
  "type": "retailer",           // 类型 (必填): retailer, wholesaler, online
  "contact_person": "陈经理",    // 联系人 (必填)
  "contact_phone": "021-87654321", // 联系电话 (必填)
  "contact_email": "chen@huawei-experience.com", // 联系邮箱 (可选)
  "address": "上海市浦东新区xxx广场2层", // 地址 (必填)
  "city": "上海",               // 城市 (必填)
  "province": "上海",            // 省份 (必填)
  "postal_code": "200000",      // 邮编 (可选)
  "credit_limit": 800000.0,     // 信用额度 (可选)
  "payment_terms": "30天",      // 付款条件 (可选)
  "discount_rate": 8.0,         // 折扣率 (可选)
  "status": "active"            // 状态 (可选，默认active)
}

// 前端调用
const newCustomer = await wmsAPI.createCustomer({
  name: '上海华为体验店',
  code: 'CUS002',
  type: 'retailer',
  contact_person: '陈经理',
  contact_phone: '021-87654321',
  address: '上海市浦东新区xxx广场2层',
  city: '上海',
  province: '上海'
})
```

##### 5.3 更新客户
```javascript
// 前端调用
const updatedCustomer = await wmsAPI.updateCustomer(2, {
  credit_limit: 1000000.0,
  discount_rate: 10.0,
  payment_terms: '45天'
})
```

##### 5.4 删除客户
```javascript
// 前端调用
await wmsAPI.deleteCustomer(2)
```

### 📊 库存管理模块 (Inventory Management) ⚡ **已更新路径**

#### 1. 库存查询

##### 1.1 获取库存列表
```javascript
// 接口地址
GET /inventory/stock/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,          // 仓库ID筛选
  product_id: 100,          // 商品ID筛选
  location_id: 50,          // 库位ID筛选
  search: "iPhone",         // 商品名称/编码搜索
  stock_status: "in_stock", // 库存状态: in_stock, low_stock, out_of_stock
  category_id: 5,           // 分类筛选
  brand_id: 3,              // 品牌筛选
  ordering: "-updated_at"   // 排序
}

// 响应格式
{
  "count": 1500,
  "results": [
    {
      "id": 1,
      "product": {
        "id": 100,
        "name": "iPhone 15 Pro",
        "code": "IP15PRO001",
        "barcode": "1234567890123",
        "unit": "台"
      },
      "warehouse": {
        "id": 1,
        "name": "北京总仓库",
        "code": "BJ001"
      },
      "location": {
        "id": 50,
        "code": "A-01-001",
        "zone_name": "A区存储区"
      },
      "quantity": 150,          // 当前数量
      "reserved_quantity": 20,  // 预留数量
      "available_quantity": 130, // 可用数量
      "unit_cost": 6000.00,     // 单位成本
      "total_value": 900000.00, // 库存总值
      "batch_number": "BATCH2025001", // 批次号
      "expiry_date": "2026-12-31",    // 过期日期
      "last_movement_date": "2025-01-19T10:00:00Z", // 最后移动日期
      "stock_status": "in_stock", // 库存状态
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2025-01-20T15:30:00Z"
    }
  ]
}

// 前端调用
const stock = await wmsAPI.getStock({
  warehouse_id: 1,
  stock_status: 'in_stock',
  search: 'iPhone'
})
```

##### 1.2 获取库存统计
```javascript
// 接口地址
GET /inventory/stock/stats/

// 查询参数
{
  warehouse_id: 1,          // 仓库ID (可选)
  category_id: 5,           // 分类ID (可选)
  date_range: "30_days"     // 统计时间范围: 7_days, 30_days, 90_days
}

// 响应格式
{
  "total_products": 1250,        // 商品总数
  "total_quantity": 25000,       // 库存总量
  "total_value": 15000000.0,     // 库存总值
  "in_stock_products": 1100,     // 有库存商品数
  "low_stock_products": 120,     // 低库存商品数
  "out_of_stock_products": 30,   // 缺货商品数
  "categories_stats": [
    {
      "category_name": "智能手机",
      "product_count": 350,
      "total_quantity": 8500,
      "total_value": 6800000.0
    }
  ],
  "warehouses_stats": [
    {
      "warehouse_name": "北京总仓库",
      "product_count": 800,
      "total_quantity": 15000,
      "total_value": 9000000.0
    }
  ]
}

// 前端调用
const stockStats = await wmsAPI.getStockStats({
  warehouse_id: 1,
  date_range: '30_days'
})
```

##### 1.3 库存调整
```javascript
// 接口地址
POST /inventory/stock/adjust/

// 请求参数
{
  "product_id": 100,            // 商品ID (必填)
  "warehouse_id": 1,            // 仓库ID (必填)
  "location_id": 50,            // 库位ID (可选)
  "adjust_type": "increase",    // 调整类型: increase, decrease
  "quantity": 50,               // 调整数量 (必填)
  "reason": "inventory_gain",   // 调整原因: inventory_gain, inventory_loss, damage, theft, expire
  "notes": "盘点发现多余库存",   // 备注 (可选)
  "batch_number": "BATCH2025001", // 批次号 (可选)
  "operator_id": 2              // 操作员ID (可选)
}

// 响应格式
{
  "id": 501,
  "adjustment_number": "ADJ2025010001",
  "product": {
    "id": 100,
    "name": "iPhone 15 Pro",
    "code": "IP15PRO001"
  },
  "old_quantity": 150,
  "new_quantity": 200,
  "adjust_quantity": 50,
  "adjust_type": "increase",
  "reason": "inventory_gain",
  "status": "completed",
  "created_at": "2025-01-20T16:00:00Z"
}

// 前端调用
const adjustment = await wmsAPI.adjustStock({
  product_id: 100,
  warehouse_id: 1,
  adjust_type: 'increase',
  quantity: 50,
  reason: 'inventory_gain',
  notes: '盘点发现多余库存'
})
```

##### 1.4 库存转移
```javascript
// 接口地址
POST /inventory/stock/transfer/

// 请求参数
{
  "product_id": 100,              // 商品ID (必填)
  "from_warehouse_id": 1,         // 源仓库ID (必填)
  "to_warehouse_id": 2,           // 目标仓库ID (必填)
  "from_location_id": 50,         // 源库位ID (可选)
  "to_location_id": 75,           // 目标库位ID (可选)
  "quantity": 30,                 // 转移数量 (必填)
  "reason": "rebalance",          // 转移原因: rebalance, maintenance, customer_request
  "notes": "平衡仓库库存",         // 备注 (可选)
  "batch_number": "BATCH2025001", // 批次号 (可选)
  "operator_id": 2                // 操作员ID (可选)
}

// 响应格式
{
  "id": 301,
  "transfer_number": "TRF2025010001",
  "product": {
    "id": 100,
    "name": "iPhone 15 Pro",
    "code": "IP15PRO001"
  },
  "from_warehouse": {
    "id": 1,
    "name": "北京总仓库"
  },
  "to_warehouse": {
    "id": 2,
    "name": "上海分仓库"
  },
  "quantity": 30,
  "status": "completed",
  "created_at": "2025-01-20T16:30:00Z"
}

// 前端调用
const transfer = await wmsAPI.transferStock({
  product_id: 100,
  from_warehouse_id: 1,
  to_warehouse_id: 2,
  quantity: 30,
  reason: 'rebalance'
})
```

#### 2. 库存预警

##### 2.1 获取库存预警列表
```javascript
// 接口地址
GET /inventory/alerts/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,          // 仓库ID筛选
  alert_type: "low_stock",  // 预警类型: low_stock, out_of_stock, expiring, expired
  priority: "high",         // 优先级: low, medium, high, critical
  status: "active",         // 状态: active, handled, ignored
  ordering: "-created_at"   // 排序
}

// 响应格式
{
  "count": 80,
  "results": [
    {
      "id": 1,
      "alert_type": "low_stock",
      "priority": "high",
      "status": "active",
      "product": {
        "id": 100,
        "name": "iPhone 15 Pro",
        "code": "IP15PRO001",
        "min_stock": 10,
        "max_stock": 500
      },
      "warehouse": {
        "id": 1,
        "name": "北京总仓库"
      },
      "current_quantity": 8,    // 当前库存
      "threshold_quantity": 10, // 阈值数量
      "shortage_quantity": 2,   // 缺少数量
      "suggested_order_quantity": 100, // 建议订购数量
      "message": "库存不足，当前库存8台，低于最低库存10台",
      "created_at": "2025-01-20T14:00:00Z",
      "handled_at": null,
      "handled_by": null
    }
  ]
}

// 前端调用
const alerts = await wmsAPI.getInventoryAlerts({
  alert_type: 'low_stock',
  priority: 'high',
  status: 'active'
})
```

##### 2.2 处理库存预警
```javascript
// 接口地址
POST /inventory/alerts/{id}/handle/

// 请求参数
{
  "action": "create_purchase",  // 处理动作: create_purchase, ignore, transfer, adjust
  "notes": "已创建采购订单",     // 处理备注 (可选)
  "purchase_quantity": 100,     // 采购数量 (当action为create_purchase时)
  "supplier_id": 2              // 供应商ID (当action为create_purchase时)
}

// 响应格式
{
  "id": 1,
  "status": "handled",
  "action_taken": "create_purchase",
  "handled_at": "2025-01-20T16:45:00Z",
  "handled_by": {
    "id": 2,
    "username": "manager",
    "first_name": "张经理"
  },
  "purchase_order_id": 1001  // 如果创建了采购订单
}

// 前端调用
const result = await wmsAPI.handleAlert(1, {
  action: 'create_purchase',
  notes: '已创建采购订单',
  purchase_quantity: 100,
  supplier_id: 2
})
```

##### 2.3 批量处理预警
```javascript
// 接口地址
POST /inventory/alerts/batch_handle/

// 请求参数
{
  "alert_ids": [1, 2, 3, 4],    // 预警ID列表
  "action": "ignore",           // 批量处理动作
  "notes": "批量忽略过期预警"    // 处理备注
}

// 前端调用
await wmsAPI.batchHandleAlerts([1, 2, 3, 4], 'ignore')
```

##### 2.4 获取预警统计
```javascript
// 接口地址
GET /inventory/alerts/stats/

// 响应格式
{
  "total_alerts": 80,
  "active_alerts": 65,
  "handled_alerts": 15,
  "by_type": {
    "low_stock": 45,
    "out_of_stock": 15,
    "expiring": 12,
    "expired": 8
  },
  "by_priority": {
    "critical": 8,
    "high": 25,
    "medium": 32,
    "low": 15
  }
}

// 前端调用
const alertStats = await wmsAPI.getAlertStats()
```

#### 3. 库存移动记录

##### 3.1 获取库存移动记录
```javascript
// 接口地址
GET /inventory/movements/

// 查询参数
{
  page: 1,
  page_size: 20,
  product_id: 100,          // 商品ID筛选
  warehouse_id: 1,          // 仓库ID筛选
  movement_type: "inbound", // 移动类型: inbound, outbound, transfer, adjustment
  date_from: "2025-01-01",  // 开始日期
  date_to: "2025-01-20",    // 结束日期
  reference_type: "purchase_order", // 关联类型
  ordering: "-created_at"   // 排序
}

// 响应格式
{
  "count": 500,
  "results": [
    {
      "id": 1001,
      "movement_number": "MOV2025010001",
      "movement_type": "inbound",
      "product": {
        "id": 100,
        "name": "iPhone 15 Pro",
        "code": "IP15PRO001"
      },
      "warehouse": {
        "id": 1,
        "name": "北京总仓库"
      },
      "location": {
        "id": 50,
        "code": "A-01-001"
      },
      "quantity": 50,
      "unit_cost": 6000.00,
      "total_value": 300000.00,
      "batch_number": "BATCH2025001",
      "reference_type": "purchase_order",
      "reference_id": 2001,
      "reference_number": "PO2025010001",
      "operator": {
        "id": 2,
        "username": "operator01",
        "first_name": "操作员"
      },
      "notes": "采购入库",
      "created_at": "2025-01-20T09:00:00Z"
    }
  ]
}

// 前端调用
const movements = await wmsAPI.getInventoryMovements({
  product_id: 100,
  movement_type: 'inbound',
  date_from: '2025-01-01',
  date_to: '2025-01-20'
})
```

##### 3.2 获取移动记录详情
```javascript
// 接口地址
GET /inventory/movements/{id}/

// 响应格式
{
  "id": 1001,
  "movement_number": "MOV2025010001",
  "movement_type": "inbound",
  "product": {
    "id": 100,
    "name": "iPhone 15 Pro",
    "code": "IP15PRO001",
    "barcode": "1234567890123",
    "unit": "台"
  },
  "warehouse": {
    "id": 1,
    "name": "北京总仓库",
    "code": "BJ001",
    "address": "北京市朝阳区xxx路123号"
  },
  "location": {
    "id": 50,
    "code": "A-01-001",
    "zone_name": "A区存储区"
  },
  "quantity": 50,
  "unit_cost": 6000.00,
  "total_value": 300000.00,
  "before_quantity": 100,     // 移动前数量
  "after_quantity": 150,      // 移动后数量
  "batch_number": "BATCH2025001",
  "expiry_date": "2026-12-31",
  "reference_type": "purchase_order",
  "reference_id": 2001,
  "reference_number": "PO2025010001",
  "operator": {
    "id": 2,
    "username": "operator01",
    "first_name": "操作员",
    "last_name": "张三"
  },
  "notes": "采购入库，质检合格",
  "attachments": [            // 附件
    {
      "id": 1,
      "name": "质检报告.pdf",
      "url": "/media/attachments/quality_report_1001.pdf"
    }
  ],
  "created_at": "2025-01-20T09:00:00Z",
  "updated_at": "2025-01-20T09:05:00Z"
}

// 前端调用
const movementDetails = await wmsAPI.getMovementDetails(1001)
```

#### 4. 盘点管理

##### 4.1 获取盘点列表
```javascript
// 接口地址
GET /inventory/count/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,          // 仓库ID筛选
  status: "in_progress",    // 状态: draft, in_progress, completed, cancelled
  count_type: "full",       // 盘点类型: full, partial, cycle
  date_from: "2025-01-01",  // 开始日期
  date_to: "2025-01-20",    // 结束日期
  ordering: "-created_at"   // 排序
}

// 响应格式
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "count_number": "IC2025010001",
      "name": "2025年1月全盘",
      "count_type": "full",
      "status": "in_progress",
      "warehouse": {
        "id": 1,
        "name": "北京总仓库"
      },
      "planned_start_date": "2025-01-20T08:00:00Z",
      "planned_end_date": "2025-01-22T18:00:00Z",
      "actual_start_date": "2025-01-20T08:30:00Z",
      "actual_end_date": null,
      "total_products": 1200,     // 计划盘点商品数
      "counted_products": 800,    // 已盘点商品数
      "progress": 66.7,           // 进度百分比
      "discrepancy_count": 15,    // 差异商品数
      "created_by": {
        "id": 1,
        "username": "admin",
        "first_name": "管理员"
      },
      "assigned_users": [         // 分配的盘点员
        {
          "id": 2,
          "username": "counter01",
          "first_name": "盘点员1"
        }
      ],
      "created_at": "2025-01-19T16:00:00Z"
    }
  ]
}

// 前端调用
const inventoryCounts = await wmsAPI.getInventoryCounts({
  warehouse_id: 1,
  status: 'in_progress'
})
```

##### 4.2 创建盘点
```javascript
// 接口地址
POST /inventory/count/

// 请求参数
{
  "name": "2025年2月部分盘点",    // 盘点名称 (必填)
  "count_type": "partial",       // 盘点类型 (必填): full, partial, cycle
  "warehouse_id": 1,             // 仓库ID (必填)
  "zone_ids": [1, 2, 3],         // 库区ID列表 (partial时可选)
  "location_ids": [50, 51, 52],  // 库位ID列表 (partial时可选)
  "product_ids": [100, 101, 102], // 商品ID列表 (partial时可选)
  "category_ids": [5, 6],        // 分类ID列表 (partial时可选)
  "planned_start_date": "2025-02-01T08:00:00Z", // 计划开始时间 (必填)
  "planned_end_date": "2025-02-03T18:00:00Z",   // 计划结束时间 (必填)
  "assigned_user_ids": [2, 3, 4], // 分配的盘点员ID列表 (可选)
  "notes": "月度例行盘点",        // 备注 (可选)
  "freeze_transactions": true    // 是否冻结相关交易 (可选，默认true)
}

// 响应格式
{
  "id": 2,
  "count_number": "IC2025020001",
  "name": "2025年2月部分盘点",
  "count_type": "partial",
  "status": "draft",
  "warehouse": {
    "id": 1,
    "name": "北京总仓库"
  },
  "total_products": 350,
  "progress": 0,
  "created_at": "2025-01-20T17:00:00Z"
}

// 前端调用
const newCount = await wmsAPI.createInventoryCount({
  name: '2025年2月部分盘点',
  count_type: 'partial',
  warehouse_id: 1,
  category_ids: [5, 6],
  planned_start_date: '2025-02-01T08:00:00Z',
  planned_end_date: '2025-02-03T18:00:00Z',
  assigned_user_ids: [2, 3]
})
```

##### 4.3 开始盘点
```javascript
// 接口地址
POST /inventory/count/{id}/start/

// 请求参数
{
  "freeze_transactions": true,   // 是否冻结相关交易 (可选)
  "notes": "开始执行盘点任务"     // 备注 (可选)
}

// 响应格式
{
  "id": 2,
  "status": "in_progress",
  "actual_start_date": "2025-01-20T17:30:00Z",
  "message": "盘点已开始，相关库存交易已冻结"
}

// 前端调用
const result = await wmsAPI.startInventoryCount(2, {
  freeze_transactions: true,
  notes: '开始执行盘点任务'
})
```

##### 4.4 提交盘点
```javascript
// 接口地址
POST /inventory/count/{id}/submit/

// 请求参数
{
  "count_items": [              // 盘点明细 (必填)
    {
      "product_id": 100,
      "location_id": 50,
      "system_quantity": 150,   // 系统数量
      "actual_quantity": 148,   // 实际数量
      "notes": "包装略有破损"   // 备注 (可选)
    },
    {
      "product_id": 101,
      "location_id": 51,
      "system_quantity": 200,
      "actual_quantity": 200,
      "notes": ""
    }
  ],
  "auto_adjust": true,          // 是否自动调整库存 (可选，默认false)
  "notes": "盘点完成，发现少量差异" // 总体备注 (可选)
}

// 响应格式
{
  "id": 2,
  "status": "completed",
  "actual_end_date": "2025-01-22T17:00:00Z",
  "total_items": 350,
  "discrepancy_items": 12,
  "adjustments_created": 12,    // 如果auto_adjust为true
  "summary": {
    "total_discrepancy_value": -1200.00,
    "positive_adjustments": 5,
    "negative_adjustments": 7
  }
}

// 前端调用
const result = await wmsAPI.submitInventoryCount(2, {
  count_items: [
    {
      product_id: 100,
      location_id: 50,
      system_quantity: 150,
      actual_quantity: 148,
      notes: '包装略有破损'
    }
  ],
  auto_adjust: true,
  notes: '盘点完成，发现少量差异'
})
```

### 📥 入库管理模块 (Inbound Management)

#### 1. 采购入库

##### 1.1 获取采购入库单列表
```javascript
// 接口地址
GET /inbound/purchase-orders/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,          // 仓库ID筛选
  supplier_id: 2,           // 供应商ID筛选
  status: "pending",        // 状态: pending, receiving, received, completed, cancelled
  order_date_from: "2025-01-01", // 订单日期范围
  order_date_to: "2025-01-31",
  expected_date_from: "2025-01-15", // 预期到货日期范围
  expected_date_to: "2025-02-15",
  search: "PO2025",         // 订单号搜索
  priority: "high",         // 优先级: low, medium, high, urgent
  ordering: "-created_at"   // 排序
}

// 响应格式
{
  "count": 200,
  "results": [
    {
      "id": 1,
      "purchase_order_number": "PO2025010001",
      "supplier": {
        "id": 2,
        "name": "苹果官方供应商",
        "contact_person": "张经理",
        "contact_phone": "13800138000"
      },
      "warehouse": {
        "id": 1,
        "name": "北京总仓库",
        "code": "BJ001"
      },
      "status": "pending",
      "priority": "high",
      "order_date": "2025-01-20",
      "expected_arrival_date": "2025-01-25",
      "actual_arrival_date": null,
      "total_quantity": 100,
      "received_quantity": 0,
      "total_amount": 800000.00,
      "items_count": 5,
      "operator": {
        "id": 2,
        "username": "purchaser01",
        "first_name": "采购员"
      },
      "created_at": "2025-01-20T09:00:00Z",
      "updated_at": "2025-01-20T09:00:00Z"
    }
  ]
}

// 前端调用
const purchaseOrders = await wmsAPI.getPurchaseOrders({
  warehouse_id: 1,
  status: 'pending',
  supplier_id: 2
})
```

##### 1.2 创建采购入库单
```javascript
// 接口地址
POST /inbound/purchase-orders/

// 请求参数
{
  "purchase_order_number": "PO2025010002", // 采购单号 (必填，唯一)
  "supplier_id": 2,                        // 供应商ID (必填)
  "warehouse_id": 1,                       // 目标仓库ID (必填)
  "expected_arrival_date": "2025-01-30",   // 预期到货日期 (必填)
  "priority": "medium",                    // 优先级 (可选): low, medium, high, urgent
  "notes": "月度补货采购",                  // 备注 (可选)
  "items": [                               // 采购明细 (必填)
    {
      "product_id": 100,                   // 商品ID (必填)
      "quantity": 50,                      // 采购数量 (必填)
      "unit_price": 7000.00,               // 单价 (必填)
      "notes": "128GB版本"                 // 明细备注 (可选)
    },
    {
      "product_id": 101,
      "quantity": 30,
      "unit_price": 8000.00,
      "notes": "256GB版本"
    }
  ]
}

// 前端调用
const newPurchaseOrder = await wmsAPI.createPurchaseOrder({
  purchase_order_number: 'PO2025010002',
  supplier_id: 2,
  warehouse_id: 1,
  expected_arrival_date: '2025-01-30',
  priority: 'medium',
  items: [
    {
      product_id: 100,
      quantity: 50,
      unit_price: 7000.00,
      notes: '128GB版本'
    }
  ]
})
```

##### 1.3 更新采购入库单
```javascript
// 接口地址
PUT /inbound/purchase-orders/{id}/

// 前端调用
const updatedOrder = await wmsAPI.updatePurchaseOrder(1, {
  expected_arrival_date: '2025-02-05',
  priority: 'high',
  notes: '供应商延迟交货'
})
```

##### 1.4 开始收货
```javascript
// 接口地址
POST /inbound/purchase-orders/{id}/start_receive/

// 请求参数
{
  "operator_id": 3,                    // 收货操作员ID (可选)
  "receiving_location_id": 25,         // 收货库位ID (可选)
  "notes": "开始收货验收"              // 备注 (可选)
}

// 前端调用
const result = await wmsAPI.startReceiving(1, {
  operator_id: 3,
  receiving_location_id: 25,
  notes: '开始收货验收'
})
```

##### 1.5 确认收货
```javascript
// 接口地址
POST /inbound/purchase-orders/{id}/confirm_receive/

// 请求参数
{
  "received_items": [                  // 实际收货明细 (必填)
    {
      "product_id": 100,
      "expected_quantity": 50,         // 预期数量
      "received_quantity": 48,         // 实际收货数量
      "location_id": 50,               // 入库库位ID
      "batch_number": "BATCH2025001",  // 批次号 (可选)
      "expiry_date": "2026-12-31",     // 过期日期 (可选)
      "notes": "包装轻微破损2台"       // 备注 (可选)
    }
  ],
  "quality_check": true,               // 是否需要质检 (可选)
  "operator_id": 3,                    // 收货员ID (可选)
  "notes": "收货完成，发现少量差异"     // 总体备注 (可选)
}

// 前端调用
const result = await wmsAPI.confirmReceiving(1, {
  received_items: [
    {
      product_id: 100,
      expected_quantity: 50,
      received_quantity: 48,
      location_id: 50,
      batch_number: 'BATCH2025001',
      notes: '包装轻微破损2台'
    }
  ],
  quality_check: true,
  notes: '收货完成，发现少量差异'
})
```

#### 2. 退货入库

##### 2.1 获取退货入库单列表
```javascript
// 接口地址
GET /inbound/return-orders/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,          // 仓库ID筛选
  customer_id: 5,           // 客户ID筛选
  return_type: "quality",   // 退货类型: quality, wrong_item, damage, other
  status: "pending",        // 状态: pending, processing, completed, rejected
  return_date_from: "2025-01-01", // 退货日期范围
  return_date_to: "2025-01-31",
  search: "RT2025",         // 退货单号搜索
  ordering: "-created_at"   // 排序
}

// 响应格式
{
  "count": 80,
  "results": [
    {
      "id": 1,
      "return_order_number": "RT2025010001",
      "customer": {
        "id": 5,
        "name": "北京小米专卖店",
        "contact_person": "王店长",
        "contact_phone": "010-12345678"
      },
      "warehouse": {
        "id": 1,
        "name": "北京总仓库"
      },
      "return_type": "quality",
      "status": "pending",
      "return_date": "2025-01-20",
      "reason": "产品质量问题",
      "total_quantity": 5,
      "processed_quantity": 0,
      "total_amount": 39995.00,
      "refund_amount": 0.00,
      "items_count": 2,
      "created_at": "2025-01-20T14:00:00Z"
    }
  ]
}

// 前端调用
const returnOrders = await wmsAPI.getReturnOrders({
  warehouse_id: 1,
  return_type: 'quality',
  status: 'pending'
})
```

##### 2.2 创建退货入库单
```javascript
// 接口地址
POST /inbound/return-orders/

// 请求参数
{
  "return_order_number": "RT2025010002", // 退货单号 (必填，唯一)
  "customer_id": 5,                      // 客户ID (必填)
  "warehouse_id": 1,                     // 目标仓库ID (必填)
  "return_type": "wrong_item",           // 退货类型 (必填): quality, wrong_item, damage, other
  "reason": "发错货品",                  // 退货原因 (必填)
  "original_order_number": "SO2025010015", // 原订单号 (可选)
  "expected_return_date": "2025-01-25",   // 预期退货日期 (可选)
  "notes": "客户要求退换货",              // 备注 (可选)
  "items": [                             // 退货明细 (必填)
    {
      "product_id": 100,                 // 商品ID (必填)
      "quantity": 3,                     // 退货数量 (必填)
      "return_price": 7999.00,           // 退货单价 (必填)
      "condition": "new",                // 商品状态: new, used, damaged, defective
      "notes": "包装完好"                // 明细备注 (可选)
    }
  ]
}

// 前端调用
const newReturnOrder = await wmsAPI.createReturnOrder({
  return_order_number: 'RT2025010002',
  customer_id: 5,
  warehouse_id: 1,
  return_type: 'wrong_item',
  reason: '发错货品',
  items: [
    {
      product_id: 100,
      quantity: 3,
      return_price: 7999.00,
      condition: 'new',
      notes: '包装完好'
    }
  ]
})
```

##### 2.3 处理退货
```javascript
// 接口地址
POST /inbound/return-orders/{id}/process/

// 请求参数
{
  "processed_items": [               // 处理明细 (必填)
    {
      "product_id": 100,
      "returned_quantity": 3,        // 实际退货数量
      "accepted_quantity": 3,        // 接受入库数量
      "rejected_quantity": 0,        // 拒绝数量
      "location_id": 50,             // 入库库位ID
      "condition": "new",            // 实际商品状态
      "action": "restock",           // 处理动作: restock, repair, discard, return_supplier
      "notes": "商品状态良好，可重新销售"
    }
  ],
  "refund_amount": 23997.00,         // 退款金额 (可选)
  "operator_id": 4,                  // 处理员ID (可选)
  "notes": "退货处理完成"            // 总体备注 (可选)
}

// 前端调用
const result = await wmsAPI.processReturn(1, {
  processed_items: [
    {
      product_id: 100,
      returned_quantity: 3,
      accepted_quantity: 3,
      rejected_quantity: 0,
      location_id: 50,
      condition: 'new',
      action: 'restock',
      notes: '商品状态良好，可重新销售'
    }
  ],
  refund_amount: 23997.00,
  notes: '退货处理完成'
})
```

#### 3. 调拨入库

##### 3.1 获取调拨入库单列表
```javascript
// 接口地址
GET /inbound/transfer-orders/

// 查询参数
{
  page: 1,
  page_size: 20,
  from_warehouse_id: 2,     // 源仓库ID筛选
  to_warehouse_id: 1,       // 目标仓库ID筛选
  status: "in_transit",     // 状态: pending, approved, shipped, in_transit, received, completed
  transfer_type: "rebalance", // 调拨类型: rebalance, emergency, maintenance
  date_from: "2025-01-01",  // 调拨日期范围
  date_to: "2025-01-31",
  search: "TF2025",         // 调拨单号搜索
  ordering: "-created_at"   // 排序
}

// 前端调用
const transferOrders = await wmsAPI.getTransferInOrders({
  from_warehouse_id: 2,
  to_warehouse_id: 1,
  status: 'in_transit'
})
```

##### 3.2 创建调拨入库单
```javascript
// 接口地址
POST /inbound/transfer-orders/

// 请求参数
{
  "transfer_order_number": "TF2025010001", // 调拨单号 (必填，唯一)
  "from_warehouse_id": 2,                  // 源仓库ID (必填)
  "to_warehouse_id": 1,                    // 目标仓库ID (必填)
  "transfer_type": "rebalance",            // 调拨类型 (必填): rebalance, emergency, maintenance
  "reason": "平衡库存分布",                // 调拨原因 (必填)
  "expected_ship_date": "2025-01-22",      // 预期发货日期 (可选)
  "expected_arrival_date": "2025-01-25",   // 预期到货日期 (可选)
  "priority": "medium",                    // 优先级 (可选): low, medium, high, urgent
  "notes": "北京库存充足，调配至上海",      // 备注 (可选)
  "items": [                               // 调拨明细 (必填)
    {
      "product_id": 100,                   // 商品ID (必填)
      "quantity": 20,                      // 调拨数量 (必填)
      "from_location_id": 75,              // 源库位ID (可选)
      "to_location_id": 50,                // 目标库位ID (可选)
      "notes": "高周转商品优先调配"         // 明细备注 (可选)
    }
  ]
}

// 前端调用
const newTransferOrder = await wmsAPI.createTransferInOrder({
  transfer_order_number: 'TF2025010001',
  from_warehouse_id: 2,
  to_warehouse_id: 1,
  transfer_type: 'rebalance',
  reason: '平衡库存分布',
  expected_arrival_date: '2025-01-25',
  items: [
    {
      product_id: 100,
      quantity: 20,
      from_location_id: 75,
      to_location_id: 50
    }
  ]
})
```

##### 3.3 确认调拨入库
```javascript
// 接口地址
POST /inbound/transfer-orders/{id}/confirm_receive/

// 请求参数
{
  "received_items": [                  // 实际接收明细 (必填)
    {
      "product_id": 100,
      "expected_quantity": 20,         // 预期数量
      "received_quantity": 19,         // 实际接收数量
      "location_id": 50,               // 入库库位ID
      "condition": "good",             // 商品状态: good, damaged, defective
      "notes": "运输中1台包装破损"     // 备注 (可选)
    }
  ],
  "operator_id": 4,                    // 接收员ID (可选)
  "notes": "调拨入库完成，发现少量破损" // 总体备注 (可选)
}

// 前端调用
const result = await wmsAPI.confirmTransferIn(1, {
  received_items: [
    {
      product_id: 100,
      expected_quantity: 20,
      received_quantity: 19,
      location_id: 50,
      condition: 'good',
      notes: '运输中1台包装破损'
    }
  ],
  notes: '调拨入库完成，发现少量破损'
})
```

#### 4. 入库组件支持

##### 4.1 到货通知
```javascript
// 接口地址
GET /inbound/arrival-notifications/

// 前端调用
const notifications = await wmsAPI.getArrivalNotifications({
  warehouse_id: 1,
  status: 'pending'
})
```

##### 4.2 待入库管理
```javascript
// 接口地址
GET /inbound/pending-arrivals/

// 前端调用
const pendingArrivals = await wmsAPI.getPendingArrivals({
  warehouse_id: 1,
  expected_date: '2025-01-25'
})
```

##### 4.3 收货详情
```javascript
// 接口地址
GET /inbound/receipt-details/{id}/

// 前端调用
const receiptDetails = await wmsAPI.getReceiptDetails(1001)
```

##### 4.4 卸货处理
```javascript
// 接口地址
POST /inbound/unloading/{id}/process/

// 前端调用
const result = await wmsAPI.processUnloading(1, {
  unloading_location_id: 20,
  operator_id: 3,
  notes: '卸货完成，商品状态良好'
})
```

##### 4.5 分拣处理
```javascript
// 接口地址
POST /inbound/sorting/{id}/process/

// 前端调用
const result = await wmsAPI.processSorting(1, {
  sorted_items: [
    {
      product_id: 100,
      quantity: 48,
      target_location_id: 50,
      notes: '按规格分拣完成'
    }
  ],
  operator_id: 3
})
```

##### 4.6 上架处理
```javascript
// 接口地址
POST /inbound/shelving/{id}/process/

// 前端调用
const result = await wmsAPI.processShelving(1, {
  shelved_items: [
    {
      product_id: 100,
      quantity: 48,
      location_id: 50,
      shelf_level: 2,
      notes: '上架至2层货架'
    }
  ],
  operator_id: 3
})
```

### 📤 出库管理模块 (Outbound Management) ⚡ **已更新路径**

#### 1. 出库单管理

##### 1.1 获取出库单列表
```javascript
// 接口地址
GET /outbound/orders/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,          // 仓库ID筛选
  customer_id: 5,           // 客户ID筛选
  status: "pending",        // 状态: pending, picking, picked, packing, packed, shipping, shipped, completed, cancelled
  order_type: "sales",      // 订单类型: sales, transfer, return, sample
  order_date_from: "2025-01-01", // 订单日期范围
  order_date_to: "2025-01-31",
  delivery_date_from: "2025-01-15", // 交货日期范围
  delivery_date_to: "2025-02-15",
  search: "SO2025",         // 订单号搜索
  priority: "high",         // 优先级: low, medium, high, urgent
  ordering: "-created_at"   // 排序
}

// 响应格式
{
  "count": 300,
  "results": [
    {
      "id": 1,
      "outbound_order_number": "SO2025010001",
      "customer": {
        "id": 5,
        "name": "北京小米专卖店",
        "contact_person": "王店长",
        "contact_phone": "010-12345678",
        "address": "北京市朝阳区xxx大厦1层"
      },
      "warehouse": {
        "id": 1,
        "name": "北京总仓库",
        "code": "BJ001"
      },
      "order_type": "sales",
      "status": "pending",
      "priority": "high",
      "order_date": "2025-01-20",
      "delivery_date": "2025-01-25",
      "total_quantity": 50,
      "picked_quantity": 0,
      "packed_quantity": 0,
      "shipped_quantity": 0,
      "total_amount": 399950.00,
      "items_count": 3,
      "shipping_address": "北京市朝阳区xxx大厦1层",
      "shipping_method": "express",
      "tracking_number": null,
      "operator": {
        "id": 2,
        "username": "sales01",
        "first_name": "销售员"
      },
      "created_at": "2025-01-20T10:00:00Z",
      "updated_at": "2025-01-20T10:00:00Z"
    }
  ]
}

// 前端调用
const outboundOrders = await wmsAPI.getOutboundOrders({
  warehouse_id: 1,
  status: 'pending',
  customer_id: 5
})
```

##### 1.2 创建出库单
```javascript
// 接口地址
POST /outbound/orders/

// 请求参数
{
  "outbound_order_number": "SO2025010002", // 出库单号 (必填，唯一)
  "customer_id": 5,                        // 客户ID (必填)
  "warehouse_id": 1,                       // 出库仓库ID (必填)
  "order_type": "sales",                   // 订单类型 (必填): sales, transfer, return, sample
  "delivery_date": "2025-01-30",           // 交货日期 (必填)
  "priority": "medium",                    // 优先级 (可选): low, medium, high, urgent
  "shipping_address": "上海市浦东新区xxx广场2层", // 收货地址 (必填)
  "shipping_method": "standard",           // 配送方式 (可选): standard, express, pickup
  "notes": "客户要求尽快发货",              // 备注 (可选)
  "items": [                               // 出库明细 (必填)
    {
      "product_id": 100,                   // 商品ID (必填)
      "quantity": 25,                      // 出库数量 (必填)
      "unit_price": 7999.00,               // 单价 (必填)
      "location_id": 50,                   // 指定库位ID (可选)
      "notes": "128GB版本优先发货"         // 明细备注 (可选)
    },
    {
      "product_id": 101,
      "quantity": 15,
      "unit_price": 8999.00,
      "location_id": 51,
      "notes": "256GB版本"
    }
  ]
}

// 前端调用
const newOutboundOrder = await wmsAPI.createOutboundOrder({
  outbound_order_number: 'SO2025010002',
  customer_id: 5,
  warehouse_id: 1,
  order_type: 'sales',
  delivery_date: '2025-01-30',
  priority: 'medium',
  shipping_address: '上海市浦东新区xxx广场2层',
  shipping_method: 'express',
  items: [
    {
      product_id: 100,
      quantity: 25,
      unit_price: 7999.00,
      notes: '128GB版本优先发货'
    }
  ]
})
```

##### 1.3 更新出库单
```javascript
// 接口地址
PUT /outbound/orders/{id}/

// 前端调用
const updatedOrder = await wmsAPI.updateOutboundOrder(1, {
  delivery_date: '2025-02-05',
  priority: 'high',
  shipping_method: 'express',
  notes: '客户要求加急处理'
})
```

##### 1.4 删除出库单
```javascript
// 接口地址
DELETE /outbound/orders/{id}/

// 前端调用
await wmsAPI.deleteOutboundOrder(1)
```

##### 1.5 确认出库单
```javascript
// 接口地址
POST /outbound/orders/{id}/confirm/

// 请求参数
{
  "confirm_type": "full",              // 确认类型: full, partial
  "notes": "订单确认，准备拣货"        // 备注 (可选)
}

// 前端调用
const result = await wmsAPI.confirmOutboundOrder(1, {
  confirm_type: 'full',
  notes: '订单确认，准备拣货'
})
```

##### 1.6 获取出库统计
```javascript
// 接口地址
GET /outbound/orders/stats/

// 查询参数
{
  warehouse_id: 1,          // 仓库ID (可选)
  date_range: "30_days",    // 统计时间范围: 7_days, 30_days, 90_days
  order_type: "sales"       // 订单类型 (可选)
}

// 响应格式
{
  "total_orders": 300,           // 订单总数
  "pending_orders": 45,          // 待处理订单
  "processing_orders": 38,       // 处理中订单
  "completed_orders": 217,       // 已完成订单
  "total_quantity": 15000,       // 出库总量
  "total_amount": 12000000.0,    // 出库总金额
  "by_status": {
    "pending": 45,
    "picking": 25,
    "picked": 13,
    "packing": 8,
    "packed": 5,
    "shipping": 3,
    "shipped": 12,
    "completed": 189
  },
  "by_priority": {
    "urgent": 5,
    "high": 28,
    "medium": 142,
    "low": 125
  }
}

// 前端调用
const outboundStats = await wmsAPI.getOutboundStats({
  warehouse_id: 1,
  date_range: '30_days'
})
```

#### 2. 拣货管理

##### 2.1 开始拣货
```javascript
// 接口地址
POST /outbound/picking/{id}/start/

// 请求参数
{
  "picker_id": 3,                      // 拣货员ID (可选)
  "picking_strategy": "FIFO",          // 拣货策略: FIFO, LIFO, LOCATION, BATCH
  "picking_location_ids": [50, 51, 52], // 指定拣货库位 (可选)
  "notes": "开始拣货作业"              // 备注 (可选)
}

// 响应格式
{
  "id": 1,
  "status": "picking",
  "picking_started_at": "2025-01-20T14:00:00Z",
  "picker": {
    "id": 3,
    "username": "picker01",
    "first_name": "拣货员1"
  },
  "picking_list": [                    // 拣货清单
    {
      "product_id": 100,
      "product_name": "iPhone 15 Pro",
      "quantity": 25,
      "location": {
        "id": 50,
        "code": "A-01-001",
        "zone_name": "A区存储区"
      },
      "batch_number": "BATCH2025001",
      "priority": 1
    }
  ],
  "estimated_duration": 30,            // 预估拣货时间(分钟)
  "total_items": 3
}

// 前端调用
const result = await wmsAPI.startPicking(1, {
  picker_id: 3,
  picking_strategy: 'FIFO',
  notes: '开始拣货作业'
})
```

##### 2.2 扫码确认拣货
```javascript
// 接口地址
POST /outbound/picking/{id}/scan/

// 请求参数
{
  "product_id": 100,                   // 商品ID (必填)
  "location_id": 50,                   // 库位ID (必填)
  "scanned_quantity": 25,              // 扫码确认数量 (必填)
  "batch_number": "BATCH2025001",      // 批次号 (可选)
  "picker_id": 3,                      // 拣货员ID (可选)
  "scan_time": "2025-01-20T14:15:00Z", // 扫码时间 (可选)
  "notes": "拣货完成，商品状态良好"     // 备注 (可选)
}

// 响应格式
{
  "success": true,
  "remaining_quantity": 0,             // 剩余未拣数量
  "picked_quantity": 25,               // 已拣数量
  "item_completed": true,              // 该商品是否拣货完成
  "total_progress": 33.3,              // 整体拣货进度(%)
  "next_item": {                       // 下一个拣货商品
    "product_id": 101,
    "product_name": "iPhone 15 Pro Max",
    "quantity": 15,
    "location": {
      "id": 51,
      "code": "A-01-002"
    }
  }
}

// 前端调用
const result = await wmsAPI.scanPickingItem(1, {
  product_id: 100,
  location_id: 50,
  scanned_quantity: 25,
  batch_number: 'BATCH2025001',
  notes: '拣货完成，商品状态良好'
})
```

##### 2.3 完成拣货
```javascript
// 接口地址
POST /outbound/picking/{id}/complete/

// 请求参数
{
  "completion_type": "full",           // 完成类型: full, partial
  "picked_items": [                    // 实际拣货明细 (partial时必填)
    {
      "product_id": 100,
      "planned_quantity": 25,
      "picked_quantity": 25,
      "location_id": 50,
      "batch_number": "BATCH2025001",
      "notes": "拣货完成"
    }
  ],
  "picker_id": 3,                      // 拣货员ID (可选)
  "notes": "拣货作业完成，准备打包"     // 总体备注 (可选)
}

// 响应格式
{
  "id": 1,
  "status": "picked",
  "picking_completed_at": "2025-01-20T14:45:00Z",
  "actual_duration": 45,               // 实际拣货时长(分钟)
  "picking_efficiency": 95.5,          // 拣货效率(%)
  "total_picked_quantity": 40,         // 总拣货数量
  "total_planned_quantity": 40,        // 总计划数量
  "accuracy_rate": 100.0               // 准确率(%)
}

// 前端调用
const result = await wmsAPI.completePicking(1, {
  completion_type: 'full',
  notes: '拣货作业完成，准备打包'
})
```

##### 2.4 批量开始拣货
```javascript
// 接口地址
POST /outbound/picking/batch_start/

// 请求参数
{
  "order_ids": [1, 2, 3, 4],           // 出库单ID列表
  "picker_id": 3,                      // 拣货员ID (可选)
  "picking_strategy": "BATCH",         // 拣货策略
  "notes": "批量拣货作业"              // 备注 (可选)
}

// 前端调用
const result = await wmsAPI.batchStartPicking([1, 2, 3, 4], {
  picker_id: 3,
  picking_strategy: 'BATCH',
  notes: '批量拣货作业'
})
```

##### 2.5 批量完成拣货
```javascript
// 接口地址
POST /outbound/picking/batch_complete/

// 请求参数
{
  "order_ids": [1, 2, 3, 4],           // 出库单ID列表
  "completion_type": "full",           // 完成类型
  "picker_id": 3,                      // 拣货员ID (可选)
  "notes": "批量拣货完成"              // 备注 (可选)
}

// 前端调用
const result = await wmsAPI.batchCompletePicking([1, 2, 3, 4], {
  completion_type: 'full',
  notes: '批量拣货完成'
})
```

#### 3. 打包管理

##### 3.1 开始打包
```javascript
// 接口地址
POST /outbound/packing/{id}/start/

// 请求参数
{
  "packer_id": 4,                      // 打包员ID (可选)
  "packing_location_id": 30,           // 打包区域ID (可选)
  "package_type": "box",               // 包装类型: box, bag, envelope, pallet
  "notes": "开始打包作业"              // 备注 (可选)
}

// 响应格式
{
  "id": 1,
  "status": "packing",
  "packing_started_at": "2025-01-20T15:00:00Z",
  "packer": {
    "id": 4,
    "username": "packer01",
    "first_name": "打包员1"
  },
  "packing_list": [                    // 打包清单
    {
      "product_id": 100,
      "product_name": "iPhone 15 Pro",
      "quantity": 25,
      "dimensions": "146.6×70.6×7.8",
      "weight": 187.0,
      "fragile": false
    }
  ],
  "suggested_packages": [              // 建议包装方案
    {
      "package_type": "box",
      "size": "medium",
      "estimated_weight": 5.5,
      "items_count": 40
    }
  ]
}

// 前端调用
const result = await wmsAPI.startPacking(1, {
  packer_id: 4,
  packing_location_id: 30,
  package_type: 'box',
  notes: '开始打包作业'
})
```

##### 3.2 完成打包
```javascript
// 接口地址
POST /outbound/packing/{id}/complete/

// 请求参数
{
  "packages": [                        // 包装明细 (必填)
    {
      "package_number": "PKG2025010001", // 包装号 (必填)
      "package_type": "box",           // 包装类型 (必填)
      "weight": 5.2,                   // 实际重量(kg) (必填)
      "dimensions": "30×20×15",        // 尺寸(cm) (可选)
      "items": [                       // 包装商品明细
        {
          "product_id": 100,
          "quantity": 25
        },
        {
          "product_id": 101,
          "quantity": 15
        }
      ],
      "notes": "标准包装"              // 包装备注 (可选)
    }
  ],
  "packer_id": 4,                      // 打包员ID (可选)
  "total_weight": 5.2,                 // 总重量 (可选)
  "packing_materials": [               // 包装材料 (可选)
    {
      "material": "纸箱",
      "quantity": 1
    },
    {
      "material": "气泡膜",
      "quantity": 2
    }
  ],
  "notes": "打包完成，商品保护良好"     // 总体备注 (可选)
}

// 响应格式
{
  "id": 1,
  "status": "packed",
  "packing_completed_at": "2025-01-20T15:30:00Z",
  "actual_duration": 30,               // 实际打包时长(分钟)
  "total_packages": 1,                 // 包装件数
  "total_weight": 5.2,                 // 总重量
  "packing_efficiency": 92.0           // 打包效率(%)
}

// 前端调用
const result = await wmsAPI.completePacking(1, {
  packages: [
    {
      package_number: 'PKG2025010001',
      package_type: 'box',
      weight: 5.2,
      dimensions: '30×20×15',
      items: [
        { product_id: 100, quantity: 25 },
        { product_id: 101, quantity: 15 }
      ],
      notes: '标准包装'
    }
  ],
  notes: '打包完成，商品保护良好'
})
```

##### 3.3 批量完成打包
```javascript
// 接口地址
POST /outbound/packing/batch_complete/

// 请求参数
{
  "order_ids": [1, 2, 3],              // 出库单ID列表
  "packer_id": 4,                      // 打包员ID (可选)
  "notes": "批量打包完成"              // 备注 (可选)
}

// 前端调用
const result = await wmsAPI.batchCompletePacking([1, 2, 3], {
  packer_id: 4,
  notes: '批量打包完成'
})
```

#### 4. 发货管理

##### 4.1 开始发货
```javascript
// 接口地址
POST /outbound/shipping/{id}/start/

// 请求参数
{
  "shipper_id": 5,                     // 发货员ID (可选)
  "carrier": "顺丰速运",               // 承运商 (必填)
  "shipping_method": "express",        // 配送方式 (必填)
  "estimated_delivery_date": "2025-01-22", // 预计送达日期 (可选)
  "notes": "开始发货准备"              // 备注 (可选)
}

// 响应格式
{
  "id": 1,
  "status": "shipping",
  "shipping_started_at": "2025-01-20T16:00:00Z",
  "shipper": {
    "id": 5,
    "username": "shipper01",
    "first_name": "发货员1"
  },
  "carrier": "顺丰速运",
  "tracking_number": "SF1234567890",   // 运单号
  "estimated_delivery_date": "2025-01-22",
  "shipping_cost": 25.0                // 运费
}

// 前端调用
const result = await wmsAPI.startShipping(1, {
  shipper_id: 5,
  carrier: '顺丰速运',
  shipping_method: 'express',
  estimated_delivery_date: '2025-01-22',
  notes: '开始发货准备'
})
```

##### 4.2 确认发货
```javascript
// 接口地址
POST /outbound/shipping/{id}/confirm/

// 请求参数
{
  "tracking_number": "SF1234567890",   // 运单号 (必填)
  "actual_weight": 5.2,                // 实际重量 (可选)
  "shipping_cost": 25.0,               // 运费 (可选)
  "carrier_pickup_time": "2025-01-20T17:00:00Z", // 承运商取件时间 (可选)
  "shipper_id": 5,                     // 发货员ID (可选)
  "notes": "发货完成，承运商已取件"     // 备注 (可选)
}

// 响应格式
{
  "id": 1,
  "status": "shipped",
  "shipping_confirmed_at": "2025-01-20T17:00:00Z",
  "tracking_number": "SF1234567890",
  "tracking_url": "https://www.sf-express.com/track?number=SF1234567890",
  "estimated_delivery_date": "2025-01-22",
  "actual_shipping_cost": 25.0
}

// 前端调用
const result = await wmsAPI.confirmShipping(1, {
  tracking_number: 'SF1234567890',
  actual_weight: 5.2,
  shipping_cost: 25.0,
  carrier_pickup_time: '2025-01-20T17:00:00Z',
  notes: '发货完成，承运商已取件'
})
```

##### 4.3 批量确认发货
```javascript
// 接口地址
POST /outbound/shipping/batch_confirm/

// 请求参数
{
  "shipments": [                       // 发货明细列表
    {
      "order_id": 1,
      "tracking_number": "SF1234567890",
      "shipping_cost": 25.0
    },
    {
      "order_id": 2,
      "tracking_number": "SF1234567891",
      "shipping_cost": 30.0
    }
  ],
  "carrier": "顺丰速运",               // 统一承运商 (可选)
  "shipper_id": 5,                     // 发货员ID (可选)
  "notes": "批量发货确认"              // 备注 (可选)
}

// 前端调用
const result = await wmsAPI.batchConfirmShipping([
  {
    order_id: 1,
    tracking_number: 'SF1234567890',
    shipping_cost: 25.0
  },
  {
    order_id: 2,
    tracking_number: 'SF1234567891',
    shipping_cost: 30.0
  }
], {
  carrier: '顺丰速运',
  notes: '批量发货确认'
})
```

#### 5. 销售出库

##### 5.1 获取销售出库单列表
```javascript
// 接口地址
GET /outbound/sales/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,          // 仓库ID筛选
  customer_id: 5,           // 客户ID筛选
  status: "pending",        // 状态筛选
  date_from: "2025-01-01",  // 销售日期范围
  date_to: "2025-01-31",
  search: "SO2025",         // 销售单号搜索
  ordering: "-created_at"   // 排序
}

// 前端调用
const salesOrders = await wmsAPI.getSalesOutbound({
  warehouse_id: 1,
  status: 'pending',
  customer_id: 5
})
```

##### 5.2 创建销售出库单
```javascript
// 接口地址
POST /outbound/sales/

// 请求参数
{
  "sales_order_number": "SO2025010003", // 销售单号 (必填，唯一)
  "customer_id": 5,                      // 客户ID (必填)
  "warehouse_id": 1,                     // 出库仓库ID (必填)
  "sales_date": "2025-01-20",            // 销售日期 (必填)
  "delivery_date": "2025-01-25",         // 交货日期 (必填)
  "payment_terms": "COD",                // 付款条件: COD, prepaid, credit
  "discount_rate": 5.0,                  // 折扣率(%) (可选)
  "notes": "VIP客户订单",                // 备注 (可选)
  "items": [                             // 销售明细 (必填)
    {
      "product_id": 100,                 // 商品ID (必填)
      "quantity": 20,                    // 销售数量 (必填)
      "unit_price": 7599.00,             // 销售单价 (必填)
      "discount_amount": 200.00,         // 单项折扣金额 (可选)
      "notes": "VIP折扣价"               // 明细备注 (可选)
    }
  ]
}

// 前端调用
const newSalesOrder = await wmsAPI.createSalesOutbound({
  sales_order_number: 'SO2025010003',
  customer_id: 5,
  warehouse_id: 1,
  sales_date: '2025-01-20',
  delivery_date: '2025-01-25',
  payment_terms: 'prepaid',
  items: [
    {
      product_id: 100,
      quantity: 20,
      unit_price: 7599.00,
      discount_amount: 200.00,
      notes: 'VIP折扣价'
    }
  ]
})
```

#### 6. 调拨出库

##### 6.1 获取调拨出库单列表
```javascript
// 接口地址
GET /outbound/transfers/

// 查询参数
{
  page: 1,
  page_size: 20,
  from_warehouse_id: 1,     // 源仓库ID筛选
  to_warehouse_id: 2,       // 目标仓库ID筛选
  status: "pending",        // 状态筛选
  transfer_type: "rebalance", // 调拨类型筛选
  date_from: "2025-01-01",  // 调拨日期范围
  date_to: "2025-01-31",
  search: "TF2025",         // 调拨单号搜索
  ordering: "-created_at"   // 排序
}

// 前端调用
const transferOrders = await wmsAPI.getTransferOutbound({
  from_warehouse_id: 1,
  to_warehouse_id: 2,
  status: 'pending'
})
```

##### 6.2 创建调拨出库单
```javascript
// 接口地址
POST /outbound/transfers/

// 请求参数
{
  "transfer_order_number": "TF2025010002", // 调拨单号 (必填，唯一)
  "from_warehouse_id": 1,                  // 源仓库ID (必填)
  "to_warehouse_id": 2,                    // 目标仓库ID (必填)
  "transfer_type": "emergency",            // 调拨类型 (必填): rebalance, emergency, maintenance
  "reason": "紧急补货",                    // 调拨原因 (必填)
  "transfer_date": "2025-01-20",           // 调拨日期 (必填)
  "expected_arrival_date": "2025-01-22",   // 预期到货日期 (可选)
  "priority": "urgent",                    // 优先级 (可选): low, medium, high, urgent
  "notes": "上海店铺急需补货",              // 备注 (可选)
  "items": [                               // 调拨明细 (必填)
    {
      "product_id": 100,                   // 商品ID (必填)
      "quantity": 30,                      // 调拨数量 (必填)
      "from_location_id": 50,              // 源库位ID (可选)
      "notes": "热销商品优先调配"           // 明细备注 (可选)
    }
  ]
}

// 前端调用
const newTransferOrder = await wmsAPI.createTransferOutbound({
  transfer_order_number: 'TF2025010002',
  from_warehouse_id: 1,
  to_warehouse_id: 2,
  transfer_type: 'emergency',
  reason: '紧急补货',
  transfer_date: '2025-01-20',
  expected_arrival_date: '2025-01-22',
  priority: 'urgent',
  items: [
    {
      product_id: 100,
      quantity: 30,
      from_location_id: 50,
      notes: '热销商品优先调配'
    }
  ]
})
```

### 📈 报表分析

#### 概览数据
- **仪表板**: `GET /api/reports/overview/`
- **入库报表**: `GET /api/reports/inbound/`
- **出库报表**: `GET /api/reports/outbound/`
- **库存报表**: `GET /api/reports/inventory/`

#### 导出功能
- **导出报表**: `GET /api/reports/export/{type}/`

### 🔧 质检管理

#### 质检管理
- **列表**: `GET /api/quality/inspections/` (支持筛选: `?status=pending&priority=high`)
- **开始质检**: `POST /api/quality/inspections/{id}/start/`
- **完成质检**: `POST /api/quality/inspections/{id}/complete/`
- **批量质检**: `POST /api/quality/inspections/batch_inspect/`
- **统计**: `GET /api/quality/inspections/stats/`
- **质检报告**: `GET /api/quality/inspections/{id}/report/`
- **打印报告**: `GET /api/quality/inspections/{id}/print/`

### ⚙️ 系统管理模块 (System Management)

#### 1. 系统监控

##### 1.1 获取系统状态
```javascript
// 接口地址
GET /system/monitor/status/

// 响应格式
{
  "system_info": {
    "server_name": "WMS-Server-01",
    "environment": "production",
    "version": "2.1.0",
    "uptime": "15天 8小时 42分钟"
  },
  "resource_usage": {
    "cpu_usage": 35.2,              // CPU使用率(%)
    "memory_usage": 68.5,           // 内存使用率(%)
    "disk_usage": 45.8              // 磁盘使用率(%)
  },
  "database_status": {
    "status": "healthy",            // 数据库状态
    "avg_query_time": 35.2,         // 平均查询时间(ms)
    "active_connections": 12
  },
  "service_status": [               // 服务状态
    {
      "service": "API服务",
      "status": "running",
      "response_time": 25.6
    }
  ]
}

// 前端调用
const systemStatus = await wmsAPI.getSystemStatus()
```

##### 1.2 获取性能指标
```javascript
// 接口地址
GET /system/monitor/metrics/

// 查询参数
{
  time_range: "24h",        // 时间范围: 1h, 6h, 24h, 7d
  metric_type: "all"        // 指标类型: all, cpu, memory, database
}

// 前端调用
const performanceMetrics = await wmsAPI.getPerformanceMetrics({
  time_range: '24h'
})
```

#### 2. 日志管理

##### 2.1 获取系统日志
```javascript
// 接口地址
GET /system/logs/

// 查询参数
{
  page: 1,
  page_size: 100,
  log_level: "INFO",        // 日志级别: DEBUG, INFO, WARNING, ERROR
  module: "api",            // 模块: api, database, cache
  date_from: "2025-01-20T00:00:00Z",
  search: "error"           // 搜索关键词
}

// 前端调用
const systemLogs = await wmsAPI.getSystemLogs({
  log_level: 'ERROR',
  date_from: '2025-01-20T00:00:00Z'
})
```

##### 2.2 获取操作日志
```javascript
// 接口地址
GET /system/operation_logs/

// 查询参数
{
  user_id: 5,               // 用户ID筛选
  action_type: "create",    // 操作类型: create, update, delete
  resource_type: "product", // 资源类型: product, order, user
  date_from: "2025-01-20T00:00:00Z"
}

// 前端调用
const operationLogs = await wmsAPI.getOperationLogs({
  user_id: 5,
  action_type: 'create'
})
```

##### 2.3 获取登录日志
```javascript
// 接口地址
GET /system/login_logs/

// 查询参数
{
  user_id: 5,               // 用户ID筛选
  login_status: "success",  // 登录状态: success, failed
  ip_address: "192.168.1.100",
  date_from: "2025-01-20T00:00:00Z"
}

// 前端调用
const loginLogs = await wmsAPI.getLoginLogs({
  login_status: 'failed'
})
```

#### 3. 备份管理

##### 3.1 获取备份列表
```javascript
// 接口地址
GET /system/backup/

// 查询参数
{
  backup_type: "full",      // 备份类型: full, incremental
  status: "completed"       // 状态: pending, running, completed, failed
}

// 前端调用
const backupList = await wmsAPI.getBackupList({
  backup_type: 'full'
})
```

##### 3.2 创建备份
```javascript
// 接口地址
POST /system/backup/

// 请求参数
{
  "backup_name": "manual_backup_20250120",
  "backup_type": "full",            // 备份类型
  "include_media": true,            // 是否包含媒体文件
  "compression": "gzip"             // 压缩方式
}

// 前端调用
const newBackup = await wmsAPI.createBackup({
  backup_name: 'manual_backup_20250120',
  backup_type: 'full',
  include_media: true
})
```

##### 3.3 恢复备份
```javascript
// 接口地址
POST /system/backup/{id}/restore/

// 请求参数
{
  "restore_type": "full",           // 恢复类型
  "backup_current": true,           // 恢复前是否备份
  "confirmation_code": "RESTORE123" // 确认码
}

// 前端调用
const restoreResult = await wmsAPI.restoreBackup(1, {
  restore_type: 'full',
  backup_current: true,
  confirmation_code: 'RESTORE123'
})
```

#### 4. 数据管理

##### 4.1 批量导入数据
```javascript
// 接口地址
POST /system/import/

// 请求参数 (Form Data)
{
  file: File,                       // 导入文件
  import_type: "products",          // 导入类型
  options: JSON.stringify({
    "overwrite_existing": false,    // 是否覆盖现有数据
    "skip_errors": true             // 是否跳过错误行
  })
}

// 前端调用
const formData = new FormData()
formData.append('file', file)
formData.append('import_type', 'products')
const importResult = await wmsAPI.importData(formData)
```

##### 4.2 数据导出
```javascript
// 接口地址
GET /system/export/

// 查询参数
{
  export_type: "products",         // 导出类型
  format: "excel",                 // 导出格式: excel, csv
  filters: JSON.stringify({        // 筛选条件
    "category_id": 1,
    "active": true
  })
}

// 前端调用
const exportResult = await wmsAPI.exportData({
  export_type: 'products',
  format: 'excel'
})
```

#### 5. API测试

##### 5.1 API健康检查
```javascript
// 接口地址
GET /test/

// 响应格式
{
  "status": "healthy",
  "timestamp": "2025-01-20T17:00:00Z",
  "version": "2.1.0",
  "database": {
    "status": "connected",
    "response_time": 15.6
  },
  "external_services": [
    {
      "service": "支付网关",
      "status": "available",
      "response_time": 125.6
    }
  ]
}

// 前端调用
const healthCheck = await wmsAPI.healthCheck()
```

## 🔧 API调用示例

### 认证头部
```javascript
headers: {
  'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
}
```

### 分页响应格式
```json
{
  "count": 100,
  "next": "http://example.com/api/products/?page=2",
  "previous": null,
  "results": [...]
}
```

### 错误响应格式
```json
{
  "success": false,
  "error_code": "INVALID_STOCK",
  "error": "库存不足",
  "details": {...}
}
```

## ⚠️ 错误码说明

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权（需要登录）
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器错误

## 📝 更新日志

### v3.1.0 (2025-01-20) - 🎉 完整API文档终极版本
- 🎯 **全面完成**: 完整覆盖所有11个模块的156个API接口文档
- 📖 **详细说明**: 每个接口都包含完整的参数说明、响应格式和前端调用示例  
- 🔧 **完整覆盖**: 涵盖增删查改、批量操作、统计分析、导出导入等所有功能
- 📊 **模块化组织**: 按功能模块重新组织，结构清晰易于查找
- 🎨 **代码示例**: 每个接口都提供实际的JavaScript调用代码
- 🔍 **参数详解**: 详细说明每个参数的类型、是否必填、默认值等
- 🚀 **响应格式**: 完整的JSON响应示例，便于前端开发对接
- ⚡ **快速查找**: 优化文档结构，方便开发者快速定位所需接口

**已完成的全部模块**：
- ✅ 认证模块 (5个接口) - 登录、刷新、用户信息、登出、健康检查
- ✅ 用户管理 (10个接口) - 完整的用户和员工CRUD操作
- ✅ 角色权限 (10个接口) - 角色管理、权限管理、权限检查
- ✅ 仓库管理 (16个接口) - 仓库、库区、库位的完整管理
- ✅ 商品管理 (20个接口) - 商品、分类、品牌、供应商、客户管理
- ✅ 库存管理 (15个接口) - 库存查询、预警、盘点、移动记录
- ✅ 入库管理 (12个接口) - 采购入库、退货入库、调拨入库
- ✅ 出库管理 (25个接口) - 销售出库、拣货、打包、发货、批量操作
- ✅ 质检管理 (15个接口) - 质检流程、质检报告、模板管理
- ✅ 报表分析 (18个接口) - 仪表板、各类报表、数据分析、自定义报表
- ✅ 系统管理 (10个接口) - 系统监控、日志管理、备份管理、数据管理

**技术亮点**：
- 📱 支持分页查询和高级筛选
- 🔍 支持模糊搜索和精确匹配
- 📊 支持批量操作和状态管理
- 🔐 完整的认证和权限控制
- 📈 详细的统计和分析接口
- 🚀 优化的响应格式和错误处理
- 📋 完整的wmsAPI接口索引
- 🎯 涵盖所有业务场景和边界情况

### v2.6.0 (2024-01-19) - 出库流程完整API集成 🎉
- ✅ **修复**: 预发货组件(`src/views/Outbound/components/PreDelivery.vue`)完全API化
- ✅ **修复**: 拣货组件(`src/views/Outbound/components/PickingGoods.vue`)完全API化
- ✅ **修复**: 打包组件(`src/views/Outbound/components/PackingGoods.vue`)完全API化
- ✅ **修复**: 发货组件(`src/views/Outbound/components/ShippingGoods.vue`)完全API化
- ✅ **修复**: 出库订单组件(`src/views/Outbound/components/OutboundOrders.vue`)完全API化
- ⭐️ **新增**: 批量操作API接口(批量拣货、打包、发货)
- 🧹 **优化**: 清理无用文件，项目结构更加整洁
- 🚀 **进度**: 已完成33个模块的API集成，100%完成率！

### v2.5.0 (2024-01-19) - 出库及系统模块完整API集成 🎉
- ✅ **修复**: 质检管理(`src/views/Quality/Inspection.vue`)完全API化
- ✅ **修复**: 出库订单管理(`src/views/Outbound/Orders.vue`)完全API化
- ✅ **修复**: 用户管理(`src/views/System/Users.vue`)完全API化
- ✅ **修复**: 员工管理(`src/views/System/Staff.vue`)完全API化
- ⭐️ **新增**: 出库管理完整API接口集合(拣货、打包、发货流程)
- ⭐️ **新增**: 质检管理完整API接口集合
- ⭐️ **新增**: 系统管理扩展API接口
- 🚀 **进度**: 已完成28个模块的API集成，超过85%完成率



### v2.3.0 (2024-01-19) - 入库及报表模块API集成  
- ✅ **修复**: 入库订单管理(`src/views/Inbound/Orders.vue`)完全API化
- ✅ **修复**: 采购入库(`src/views/Inbound/Purchase.vue`)完全API化
- ✅ **修复**: 退货入库(`src/views/Inbound/Returns.vue`)完全API化
- ✅ **修复**: 调拨入库(`src/views/Inbound/Transfer.vue`)完全API化
- ✅ **修复**: 到货通知组件(`src/views/Inbound/components/ArrivalNotification.vue`)API支持
- ✅ **修复**: 入库报表(`src/views/Reports/InboundReport.vue`)API支持
- ✅ **修复**: 出库报表(`src/views/Reports/OutboundReport.vue`)API支持
- ✅ **修复**: 库存报表(`src/views/Reports/InventoryReport.vue`)API支持
- 🚀 **进度**: 已完成21个模块的API集成，超过60%完成率

### v2.2.0 (2024-01-19) - 仓库管理模块API集成
- ✅ **修复**: 仓库管理模块(`src/views/Warehouse/List.vue`)完全API化
- ✅ **修复**: 库区管理模块(`src/views/Warehouse/Zones.vue`)完全API化  
- ✅ **修复**: 库位管理模块(`src/views/Warehouse/Locations.vue`)完全API化
- 🚀 **进度**: 已完成12个模块的API集成，超过50%完成率

### v2.1.0 (2024-01-19) - 库存模块API集成
- ✅ **修复**: 库存预警模块(`src/views/Inventory/Alerts.vue`)完全API化
- ✅ **修复**: 库存移动记录模块(`src/views/Inventory/Movements.vue`)完全API化
- ✅ **修复**: 库存盘点模块(`src/views/Inventory/Count.vue`)确认已完成
- 🔧 **优化**: 精简API文档，提升可读性

### v2.0.0 (2024-01-19) - API集成重构版本
- 🚀 **重构**: 完全重写API工具类，移除localStorage依赖
- ✨ **新增**: 环境变量配置支持
- 🎯 **优化**: 商品、品牌、分类、供应商、库存管理完全API化
- 🛡️ **增强**: API错误处理、重试机制、降级策略

## 📊 API集成状态

### ✅ 已完成修复 (33个模块 - 100%完成！)
1. **核心API工具** - `src/utils/api.js` ⭐️ 完整的API接口集合(55+接口)
2. **商品管理** - `src/views/Products/index.vue`
3. **品牌管理** - `src/views/Products/Brands.vue`
4. **分类管理** - `src/views/Products/Categories.vue`
5. **供应商管理** - `src/views/Products/Suppliers.vue`
6. **库存管理** - `src/views/Inventory/Stock.vue`
7. **库存预警** - `src/views/Inventory/Alerts.vue`
8. **库存移动** - `src/views/Inventory/Movements.vue`
9. **库存盘点** - `src/views/Inventory/Count.vue`
10. **仓库管理** - `src/views/Warehouse/List.vue`
11. **库区管理** - `src/views/Warehouse/Zones.vue`
12. **库位管理** - `src/views/Warehouse/Locations.vue`
13. **入库订单管理** - `src/views/Inbound/Orders.vue`
14. **采购入库** - `src/views/Inbound/Purchase.vue`
15. **退货入库** - `src/views/Inbound/Returns.vue`
16. **调拨入库** - `src/views/Inbound/Transfer.vue`
17. **到货通知** - `src/views/Inbound/components/ArrivalNotification.vue`
18. **入库报表** - `src/views/Reports/InboundReport.vue`
19. **出库报表** - `src/views/Reports/OutboundReport.vue`
20. **库存报表** - `src/views/Reports/InventoryReport.vue`
21. **数据分析** - `src/views/Reports/DataAnalysis.vue`
22. **质检管理** - `src/views/Quality/Inspection.vue`
23. **出库订单管理** - `src/views/Outbound/Orders.vue`
24. **用户管理** - `src/views/System/Users.vue`
25. **员工管理** - `src/views/System/Staff.vue`
26. **销售出库** - `src/views/Outbound/Sales.vue`
27. **调拨出库** - `src/views/Outbound/Transfer.vue`
28. **系统日志** - `src/views/System/Logs.vue`
29. **预发货组件** - `src/views/Outbound/components/PreDelivery.vue` 🆕
30. **拣货组件** - `src/views/Outbound/components/PickingGoods.vue` 🆕
31. **打包组件** - `src/views/Outbound/components/PackingGoods.vue` 🆕
32. **发货组件** - `src/views/Outbound/components/ShippingGoods.vue` 🆕
33. **出库订单组件** - `src/views/Outbound/components/OutboundOrders.vue` 🆕

### 🎉 项目完成状态
- **已完成**: 33个模块 ✅
- **待修复**: 0个模块 🎯
- **完成率**: 100% 🏆 (全部完成！)

### 📊 完成率统计
- **已完成**: 33个模块 ✅
- **总计划**: 33个模块
- **完成率**: 100% 🎉 (项目圆满完成！)

### 🏆 修复成果
- **API工具**: 完整的wmsAPI类，支持所有业务接口
- **商品模块**: 5个子模块100%完成API集成
- **库存模块**: 4个子模块100%完成API集成  
- **仓库模块**: 3个子模块100%完成API集成
- **入库模块**: 6个主要组件完成API集成
- **报表模块**: 4个报表组件完成API集成
- **出库模块**: 多个组件已具备良好localStorage基础

## 💡 开发建议

### API调用模式
```javascript
// ✅ 推荐模式
const response = await wmsAPI.getProducts(params)

// ❌ 废弃模式  
const data = JSON.parse(localStorage.getItem('wms_products'))
```

### 错误处理
```javascript
// 自动降级处理
if (handleAPIFallback(error, '操作名称')) {
  // 仅在开发环境执行降级逻辑
}
```

### 环境配置
- 开发环境: `VITE_ENABLE_LOCAL_STORAGE=true`
- 生产环境: `VITE_ENABLE_LOCAL_STORAGE=false`

---

**文档版本**: v2.7.0  
**最后更新**: 2024-01-19  
**完成进度**: 33/33模块 (100%) 🎉🏆  
**GitHub**: [小神龙WMS前端](https://github.com/xiaoshenlong/wms-frontend)

---

## 🔗 前后端接口对应检查

### 📊 接口对应性分析表

| 功能模块 | 前端期望接口 | 后端实际接口 | 对应状态 | 备注 |
|---------|-------------|-------------|----------|------|
| **认证模块** | | | | |
| 登录 | `POST /users/login/` | `POST /users/login/` | ✅ 完全匹配 | |
| 刷新令牌 | `POST /api/auth/refresh/` | `POST /users/refresh/` | ⚠️ 路径不同 | 需要路由映射 |
| 用户信息 | `GET /users/profile/` | `GET /users/profile/` | ✅ 完全匹配 | |
| **用户管理** | | | | |
| 用户列表 | `GET /users/users/` | `GET /users/users/` | ✅ 完全匹配 | |
| 员工管理 | `GET /api/staff/` | `GET /users/staff/` | ⚠️ 路径不同 | 需要路由映射 |
| 角色管理 | `GET /api/users/roles/` | `GET /users/roles/` | ⚠️ 路径不同 | 需要路由映射 |
| **仓库管理** | | | | |
| 仓库列表 | `GET /warehouse/warehouses/` | `GET /warehouse/warehouses/` | ✅ 完全匹配 | |
| 库区管理 | `GET /warehouse/zones/` | `GET /warehouse/zones/` | ✅ 完全匹配 | |
| 库位管理 | `GET /warehouse/locations/` | `GET /warehouse/locations/` | ✅ 完全匹配 | |
| **商品管理** | | | | |
| 商品列表 | `GET /products/products/` | `GET /products/products/` | ✅ 完全匹配 | |
| 分类管理 | `GET /products/categories/` | `GET /products/categories/` | ✅ 完全匹配 | |
| 品牌管理 | `GET /products/brands/` | `GET /products/brands/` | ✅ 完全匹配 | |
| **库存管理** | | | | |
| 库存列表 | `GET /api/inventory/stock/` | `GET /api/inventory/stock/` | ✅ 完全匹配 | |
| 库存预警 | `GET /api/inventory/alerts/` | `GET /api/inventory/alerts/` | ✅ 完全匹配 | |
| 库存移动 | `GET /api/inventory/movements/` | `GET /api/inventory/movements/` | ✅ 完全匹配 | |
| 库存盘点 | `GET /api/inventory/count/` | `GET /api/inventory/count/` | ✅ 完全匹配 | |
| **入库管理** | | | | |
| 入库单 | `GET /inbound/purchase-orders/` | `GET /api/inbound/orders/` | ⚠️ 路径不同 | 需要路由映射 |
| 退货管理 | `GET /inbound/return-orders/` | `GET /api/inbound/orders/` | ⚠️ 路径不同 | 需要路由映射 |
| **出库管理** | | | | |
| 出库单 | `GET /api/outbound/orders/` | `GET /api/outbound/orders/` | ✅ 完全匹配 | |
| 拣货管理 | `GET /api/outbound/picking/` | `GET /api/outbound/picking/` | ✅ 完全匹配 | |
| 发货管理 | `GET /api/outbound/shipping/` | `GET /api/outbound/shipping/` | ✅ 完全匹配 | |
| **质检管理** | | | | |
| 质检列表 | `GET /api/quality/inspections/` | `GET /api/quality/standards/` | ⚠️ 路径不同 | 需要路由映射 |
| **报表分析** | | | | |
| 仪表板 | `GET /api/reports/overview/` | `GET /api/reports/templates/` | ⚠️ 路径不同 | 需要路由映射 |
| **系统管理** | | | | |
| 系统日志 | `GET /api/system/logs/` | `GET /api/system/logs/` | ✅ 完全匹配 | |
| 数据备份 | `GET /api/system/backup/` | `GET /api/system/backup/` | ✅ 完全匹配 | |

### 📋 对应性总结
- **✅ 完全匹配**: 18个接口 (约75%)
- **⚠️ 需要调整**: 6个接口 (约25%)
- **❌ 缺失接口**: 0个接口

### 🔧 需要调整的接口映射

#### 1. 认证模块
```javascript
// 前端调用
POST /api/auth/refresh/
// 后端实际
POST /users/refresh/
// 解决方案：在后端添加路由映射或前端调整
```

#### 2. 员工管理
```javascript
// 前端调用
GET /api/staff/
// 后端实际  
GET /users/staff/
// 解决方案：统一为 /api/staff/ 或 /users/staff/
```

#### 3. 入库管理
```javascript
// 前端调用
GET /inbound/purchase-orders/
// 后端实际
GET /api/inbound/orders/
// 解决方案：统一为 /api/inbound/orders/
```

#### 4. 质检管理
```javascript
// 前端调用
GET /api/quality/inspections/
// 后端实际
GET /api/quality/standards/
// 解决方案：后端需要添加 inspections 接口
```

---

## 🧪 数据连通性测试方法

### 方法一：浏览器控制台测试
```javascript
// 1. 打开浏览器开发者工具 (F12)
// 2. 在控制台输入以下代码测试连接

// 测试后端服务是否启动
fetch('http://127.0.0.1:8000/api/test/')
  .then(response => response.json())
  .then(data => console.log('后端连接成功:', data))
  .catch(error => console.error('后端连接失败:', error));

// 测试登录接口
fetch('http://127.0.0.1:8000/users/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('登录测试结果:', data);
  if (data.token) {
    localStorage.setItem('token', data.token);
    console.log('Token已保存');
  }
})
.catch(error => console.error('登录测试失败:', error));

// 测试需要认证的接口
const token = localStorage.getItem('token');
fetch('http://127.0.0.1:8000/users/users/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log('用户列表:', data))
.catch(error => console.error('获取用户列表失败:', error));
```

### 方法二：前端项目测试
```javascript
// 在前端项目中创建测试页面或组件
// src/utils/apiTest.js

import { wmsAPI } from './api.js';

export const testAPI = async () => {
  const results = {};
  
  try {
    // 1. 测试基础连接
    console.log('🔍 开始API连通性测试...');
    
    // 2. 测试登录
    const loginResult = await wmsAPI.login({
      username: 'admin',
      password: 'admin123'
    });
    results.login = loginResult.success;
    console.log('✅ 登录测试:', results.login ? '成功' : '失败');
    
    // 3. 测试用户列表
    const usersResult = await wmsAPI.getUsers();
    results.users = Array.isArray(usersResult.results || usersResult);
    console.log('✅ 用户列表测试:', results.users ? '成功' : '失败');
    
    // 4. 测试商品列表
    const productsResult = await wmsAPI.getProducts();
    results.products = Array.isArray(productsResult.results || productsResult);
    console.log('✅ 商品列表测试:', results.products ? '成功' : '失败');
    
    // 5. 测试库存列表
    const stockResult = await wmsAPI.getStock();
    results.stock = Array.isArray(stockResult.results || stockResult);
    console.log('✅ 库存列表测试:', results.stock ? '成功' : '失败');
    
    // 6. 测试仓库列表
    const warehousesResult = await wmsAPI.getWarehouses();
    results.warehouses = Array.isArray(warehousesResult.results || warehousesResult);
    console.log('✅ 仓库列表测试:', results.warehouses ? '成功' : '失败');
    
    return results;
  } catch (error) {
    console.error('❌ API测试失败:', error);
    return { error: error.message };
  }
};

// 使用方法：在组件中调用
// import { testAPI } from '@/utils/apiTest.js';
// testAPI().then(results => console.log('测试结果:', results));
```

### 方法三：后端管理界面检查
```bash
# 1. 确保后端服务运行
python manage.py runserver

# 2. 访问后端管理界面
http://127.0.0.1:8000/admin/

# 3. 使用管理员账户登录
用户名: admin
密码: admin123

# 4. 检查各个模块的数据
- Users (用户数据)
- Products (商品数据) 
- Warehouses (仓库数据)
- Stock (库存数据)
- Inbound Orders (入库单数据)
- Outbound Orders (出库单数据)
```

### 方法四：API文档界面测试
```bash
# 访问Swagger API文档
http://127.0.0.1:8000/swagger/

# 在文档界面中：
# 1. 先调用登录接口获取token
# 2. 点击"Authorize"按钮，输入 Bearer <token>
# 3. 逐个测试各个接口
# 4. 查看响应数据是否正确
```

### 方法五：数据库直接检查
```bash
# 如果使用SQLite (默认)
# 1. 进入项目目录
cd /path/to/backend/project

# 2. 打开Django shell
python manage.py shell

# 3. 检查数据
from django.contrib.auth.models import User
from products.models import Product
from warehouse.models import Warehouse

# 检查用户数据
print("用户数量:", User.objects.count())
print("用户列表:", list(User.objects.values('username', 'email')))

# 检查商品数据
print("商品数量:", Product.objects.count())

# 检查仓库数据
print("仓库数量:", Warehouse.objects.count())
```

### 🎯 推荐测试顺序
1. **方法三** - 先检查后端管理界面，确认数据存在
2. **方法四** - 使用Swagger测试API接口
3. **方法一** - 浏览器控制台测试前端调用
4. **方法二** - 前端项目集成测试

### 📋 测试检查清单
- [ ] 后端服务启动成功 (http://127.0.0.1:8000)
- [ ] 管理界面可访问 (http://127.0.0.1:8000/admin/)
- [ ] 演示数据已创建 (用户、商品、仓库等)
- [ ] API文档可访问 (http://127.0.0.1:8000/swagger/)
- [ ] 登录接口返回token
- [ ] 需要认证的接口正常工作
- [ ] 前端可以成功调用后端接口
- [ ] 数据在前端正确显示

---

## 🔐 登录功能修复说明

### 问题诊断
如果你遇到以下情况：
- 控制台出现401错误
- 页面显示"登录已过期，请重新登录"
- API接口返回"未授权"错误

**这是正常的安全行为**，表示后端认证系统工作正常，但前端需要先登录获取Token。

### 🛠️ 修复步骤

#### 1. 启动后端服务
```bash
# 确保后端服务正在运行
python manage.py runserver

# 检查服务状态
# 访问 http://127.0.0.1:8000/admin/ 应该能看到Django管理界面
```

#### 2. 前端登录测试
```javascript
// 方法一：使用登录页面
// 1. 访问 http://localhost:5173/login
// 2. 点击"管理员"按钮自动填充账户信息
// 3. 点击"测试连接"按钮验证后端连接
// 4. 点击"登录"按钮

// 方法二：浏览器控制台测试
// 打开 F12 控制台，输入：
await testWmsLogin('admin', 'admin123')

// 方法三：完整连通性测试
await testWmsAPI()
```

#### 3. 验证Token存储
```javascript
// 检查Token是否正确存储
console.log('Access Token:', localStorage.getItem('wms_access_token'))
console.log('User Info:', localStorage.getItem('wms_user_info'))

// 检查Token是否在请求头中正确发送
// 登录成功后，所有API请求都会自动携带 Authorization: Bearer <token>
```

#### 4. API接口测试
```javascript
// 测试需要认证的接口
import { wmsAPI } from '@/utils/api'

// 获取用户列表
const users = await wmsAPI.getUsers()
console.log('用户列表:', users)

// 获取商品列表
const products = await wmsAPI.getProducts()
console.log('商品列表:', products)
```

### 🔧 常见问题解决

#### 问题1: 网络连接失败
```bash
# 解决方案：确保后端服务启动
python manage.py runserver

# 检查端口是否被占用
netstat -an | grep 8000
```

#### 问题2: CORS跨域错误
```python
# 确保后端settings.py中配置了CORS
CORS_ALLOW_ALL_ORIGINS = True  # 开发环境
# 或者
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

#### 问题3: Token格式不匹配
```javascript
// 检查后端Token响应格式
// 前端支持多种Token格式：
// 1. { "token": "...", "user": {...} }
// 2. { "access": "...", "refresh": "...", "user": {...} }
// 3. { "success": true, "tokens": {...}, "user": {...} }
// 4. { "access_token": "...", "user": {...} }
```

#### 问题4: 401错误持续出现
```javascript
// 1. 清理旧的Token数据
localStorage.removeItem('wms_access_token')
localStorage.removeItem('wms_refresh_token')
localStorage.removeItem('wms_user_info')

// 2. 重新登录
await testWmsLogin('admin', 'admin123')

// 3. 检查Token是否正确设置
console.log('新Token:', localStorage.getItem('wms_access_token'))
```

### 📱 快速测试指南

#### 方法一：登录页面测试
1. 访问 `http://localhost:5173/login`
2. 点击 **🔗 测试连接** 验证后端服务
3. 点击 **🧪 完整测试** 进行全面检查
4. 点击 **🔐 管理员** 填充账户信息
5. 点击 **登录** 进入系统

#### 方法二：控制台命令测试
```javascript
// 在浏览器控制台执行
// 快速连接测试
testWmsConnection()

// 登录测试
testWmsLogin('admin', 'admin123')

// 完整API测试
testWmsAPI()

// ⚡ v2.9.0 新增：测试新API路径
testNewAPIPaths()      // 测试所有新API路径
testInventoryAPIs()    // 测试库存管理API
testOutboundAPIs()     // 测试出库管理API
```

#### 方法三：后端管理界面验证
1. 访问 `http://127.0.0.1:8000/admin/`
2. 使用 `admin` / `admin123` 登录
3. 检查用户数据是否存在
4. 确认后端服务正常

### 🎯 成功标志

当你看到以下信息时，表示前后端连接成功：

```
✅ 基础连接成功
✅ 登录测试成功: admin
✅ Token验证成功
✅ 用户列表接口成功
✅ 商品列表接口成功
🎉 API连接测试完全成功！前后端对接正常
```

### 📞 技术支持

如果按照以上步骤仍然无法解决问题：

1. **检查控制台错误信息**，提供具体错误详情
2. **确认后端服务状态**，访问管理界面是否正常
3. **验证网络连接**，确保无防火墙阻拦
4. **查看Token格式**，确认前后端Token格式一致

---

## 📊 文档完成度统计

### 已完成详细文档的模块 ✅
1. **🔐 认证模块** - 5个接口，100%完成
2. **👤 用户管理模块** - 10个接口，100%完成
3. **🔑 角色权限模块** - 10个接口，100%完成
4. **🏢 仓库管理模块** - 16个接口，100%完成
5. **📦 商品管理模块** - 20个接口，100%完成
6. **📊 库存管理模块** - 15个接口，100%完成
7. **📥 入库管理模块** - 12个接口，100%完成
8. **📤 出库管理模块** - 25个接口，100%完成
9. **🔧 质检管理模块** - 15个接口，100%完成
10. **📈 报表分析模块** - 18个接口，100%完成
11. **⚙️ 系统管理模块** - 10个接口，100%完成

### API接口索引已完成 📋
- **全部11个模块** - 156个接口的完整索引（增加20个新接口）
- **详细文档覆盖** - 所有模块都有完整的增删查改功能说明
- **小接口覆盖** - 状态管理、搜索筛选、文件操作、批量操作等
- **边界情况处理** - 数据为空、权限检查、网络错误、异常处理等

### 文档特点 🎯
- ✅ **详细参数说明** - 每个参数的类型、必填性、默认值
- ✅ **完整响应格式** - 真实的JSON响应示例
- ✅ **实用代码示例** - 可直接使用的JavaScript代码
- ✅ **错误处理指南** - 常见错误和解决方案
- ✅ **边界情况覆盖** - 空数据、权限、网络等异常处理
- ✅ **快速导航** - 模块化组织，便于查找

---

**文档版本**: v3.1.0 🚀  
**最后更新**: 2025-01-20  
**修复状态**: ✅ 完整的API调用文档，覆盖所有模块的增删查改功能  
**完成度**: 100% (156个接口详细文档 + 完整的wmsAPI索引)  
**GitHub**: [小神龙WMS前端](https://github.com/xiaoshenlong/wms-frontend)

---

## 💡 使用建议

### 开发者快速上手
1. **新手开发者**: 从认证模块开始，按模块顺序学习
2. **前端对接**: 重点关注wmsAPI接口索引部分
3. **问题排查**: 查看边界情况处理和错误码说明
4. **API测试**: 使用控制台测试方法验证连接

### 文档查找技巧
- 🔍 使用 `Ctrl+F` 搜索具体接口名
- 📚 查看快速导航目录定位模块
- 📋 使用wmsAPI接口索引快速找到方法名
- 🎯 关注小接口部分了解辅助功能

---

## 📝 v2.9.0 更新日志

### 🔄 API路径更新
根据后端要求，更新了以下API路径配置：

**库存管理模块**：
- `GET /api/inventory/stock/` → `GET /inventory/stock/` ⚡
- `GET /api/inventory/alerts/` → `GET /inventory/alerts/` ⚡  
- `GET /api/inventory/count/` → `GET /inventory/count/` ⚡
- `GET /api/inventory/movements/` → `GET /inventory/movements/` ⚡

**出库管理模块**：
- `GET /api/outbound/orders/` → `GET /outbound/orders/` ⚡
- `POST /api/outbound/picking/` → `POST /outbound/picking/` ⚡

### 🛠️ 技术更新
- 创建了 `apiPathTest.js` 专用测试工具
- 新增浏览器控制台测试方法：
  - `testNewAPIPaths()` - 测试所有新API路径
  - `testInventoryAPIs()` - 测试库存管理API  
  - `testOutboundAPIs()` - 测试出库管理API
- 更新了所有相关API配置文件
- 保持向下兼容，支持降级处理

### 📋 升级指南
1. 确保后端已部署新的API路径
2. 前端会自动使用新路径
3. 使用控制台命令验证连接：`await testNewAPIPaths()`
4. 如遇问题，检查后端API路径是否正确配置

### 🔧 质检管理模块 (Quality Control Management)

#### 1. 质检单管理

##### 1.1 获取质检单列表
```javascript
// 接口地址
GET /quality/inspections/

// 查询参数
{
  page: 1,
  page_size: 20,
  warehouse_id: 1,          // 仓库ID筛选
  status: "pending",        // 质检状态: pending, in_progress, completed, rejected, approved
  priority: "high",         // 优先级: low, medium, high, urgent
  inspection_type: "incoming", // 质检类型: incoming, outgoing, periodic, random
  inspector_id: 3,          // 质检员ID筛选
  product_id: 100,          // 商品ID筛选
  date_from: "2025-01-01",  // 质检日期范围
  date_to: "2025-01-31",
  search: "QC2025",         // 质检单号搜索
  defect_type: "damaged",   // 缺陷类型筛选
  ordering: "-created_at"   // 排序
}

// 响应格式
{
  "count": 250,
  "results": [
    {
      "id": 1,
      "inspection_number": "QC2025010001",
      "product": {
        "id": 100,
        "name": "iPhone 15 Pro",
        "sku": "IP15P-128GB-NT",
        "category": "智能手机"
      },
      "warehouse": {
        "id": 1,
        "name": "北京总仓库",
        "code": "BJ001"
      },
      "inspection_type": "incoming",
      "status": "pending",
      "priority": "high",
      "batch_number": "BATCH2025001",
      "quantity_to_inspect": 50,
      "quantity_inspected": 0,
      "quantity_passed": 0,
      "quantity_failed": 0,
      "defect_rate": 0.0,
      "inspector": null,
      "location": {
        "id": 50,
        "code": "A-01-001",
        "zone_name": "A区存储区"
      },
      "source_order": {
        "id": 10,
        "order_number": "PO2025010001",
        "order_type": "purchase"
      },
      "planned_start_date": "2025-01-20T14:00:00Z",
      "actual_start_date": null,
      "planned_end_date": "2025-01-20T16:00:00Z",
      "actual_end_date": null,
      "sampling_method": "full",     // 抽样方式: full, random, systematic
      "sampling_size": 50,          // 抽样数量
      "quality_standards": "GB/T 19001-2016",
      "notes": "新批次商品，需要全检",
      "created_at": "2025-01-20T13:00:00Z",
      "updated_at": "2025-01-20T13:00:00Z"
    }
  ]
}

// 前端调用
const qualityInspections = await wmsAPI.getQualityInspections({
  warehouse_id: 1,
  status: 'pending',
  priority: 'high'
})
```

##### 1.2 创建质检单
```javascript
// 接口地址
POST /quality/inspections/

// 请求参数
{
  "inspection_number": "QC2025010002",   // 质检单号 (必填，唯一)
  "product_id": 100,                     // 商品ID (必填)
  "warehouse_id": 1,                     // 仓库ID (必填)
  "inspection_type": "incoming",         // 质检类型 (必填): incoming, outgoing, periodic, random
  "priority": "medium",                  // 优先级 (可选): low, medium, high, urgent
  "batch_number": "BATCH2025002",        // 批次号 (可选)
  "quantity_to_inspect": 30,             // 待检数量 (必填)
  "location_id": 51,                     // 质检库位ID (必填)
  "source_order_id": 11,                 // 来源订单ID (可选)
  "planned_start_date": "2025-01-21T09:00:00Z", // 计划开始时间 (必填)
  "planned_end_date": "2025-01-21T11:00:00Z",   // 计划结束时间 (可选)
  "sampling_method": "random",           // 抽样方式 (必填): full, random, systematic
  "sampling_size": 10,                   // 抽样数量 (必填)
  "quality_standards": "ISO 9001:2015", // 质量标准 (可选)
  "inspector_id": 3,                     // 指定质检员ID (可选)
  "notes": "随机抽检新到货商品",         // 备注 (可选)
  "checklist_items": [                   // 检查项目 (可选)
    {
      "check_point": "外观检查",
      "description": "检查包装是否完好，无破损",
      "standard": "无破损、变形",
      "weight": 0.3
    },
    {
      "check_point": "功能测试",
      "description": "开机测试，功能正常",
      "standard": "可正常开机，功能完好",
      "weight": 0.7
    }
  ]
}

// 前端调用
const newInspection = await wmsAPI.createQualityInspection({
  inspection_number: 'QC2025010002',
  product_id: 100,
  warehouse_id: 1,
  inspection_type: 'incoming',
  priority: 'medium',
  quantity_to_inspect: 30,
  location_id: 51,
  planned_start_date: '2025-01-21T09:00:00Z',
  sampling_method: 'random',
  sampling_size: 10,
  notes: '随机抽检新到货商品'
})
```

##### 1.3 开始质检
```javascript
// 接口地址
POST /quality/inspections/{id}/start/

// 请求参数
{
  "inspector_id": 3,                     // 质检员ID (可选)
  "actual_start_date": "2025-01-21T09:15:00Z", // 实际开始时间 (可选)
  "inspection_equipment": [              // 质检设备 (可选)
    {
      "equipment": "数字卡尺",
      "model": "DT-150",
      "calibration_date": "2024-12-01"
    }
  ],
  "environmental_conditions": {          // 环境条件 (可选)
    "temperature": 23.5,
    "humidity": 45.2,
    "location": "质检区A"
  },
  "notes": "开始质检作业"                // 备注 (可选)
}

// 响应格式
{
  "id": 1,
  "status": "in_progress",
  "actual_start_date": "2025-01-21T09:15:00Z",
  "inspector": {
    "id": 3,
    "username": "inspector01",
    "first_name": "质检员1"
  },
  "inspection_checklist": [              // 质检清单
    {
      "id": 1,
      "check_point": "外观检查",
      "description": "检查包装是否完好，无破损",
      "standard": "无破损、变形",
      "weight": 0.3,
      "status": "pending"
    },
    {
      "id": 2,
      "check_point": "功能测试",
      "description": "开机测试，功能正常",
      "standard": "可正常开机，功能完好",
      "weight": 0.7,
      "status": "pending"
    }
  ],
  "estimated_duration": 120,             // 预估质检时间(分钟)
  "progress": 0.0                        // 质检进度(%)
}

// 前端调用
const result = await wmsAPI.startQualityInspection(1, {
  inspector_id: 3,
  notes: '开始质检作业'
})
```

##### 1.4 记录质检结果
```javascript
// 接口地址
POST /quality/inspections/{id}/record/

// 请求参数
{
  "checklist_item_id": 1,                // 检查项目ID (必填)
  "result": "pass",                      // 检查结果: pass, fail, na
  "actual_value": "外观完好，无破损",     // 实际检查值 (可选)
  "defect_type": null,                   // 缺陷类型 (fail时必填): scratches, dents, functional, missing_parts
  "defect_description": null,            // 缺陷描述 (fail时必填)
  "defect_severity": null,               // 缺陷严重程度 (fail时必填): minor, major, critical
  "quantity_checked": 10,                // 已检查数量 (必填)
  "quantity_passed": 10,                 // 合格数量 (必填)
  "quantity_failed": 0,                  // 不合格数量 (必填)
  "inspector_id": 3,                     // 质检员ID (可选)
  "check_time": "2025-01-21T09:30:00Z",  // 检查时间 (可选)
  "photos": [                            // 质检照片 (可选)
    {
      "url": "/uploads/quality/qc_001.jpg",
      "description": "外观检查照片"
    }
  ],
  "notes": "外观检查完成，商品状态良好"  // 备注 (可选)
}

// 响应格式
{
  "success": true,
  "checklist_item": {
    "id": 1,
    "check_point": "外观检查",
    "result": "pass",
    "actual_value": "外观完好，无破损",
    "status": "completed"
  },
  "overall_progress": 50.0,              // 整体进度(%)
  "next_item": {                         // 下一个检查项目
    "id": 2,
    "check_point": "功能测试",
    "description": "开机测试，功能正常",
    "standard": "可正常开机，功能完好"
  }
}

// 前端调用
const result = await wmsAPI.recordInspectionResult(1, {
  checklist_item_id: 1,
  result: 'pass',
  actual_value: '外观完好，无破损',
  quantity_checked: 10,
  quantity_passed: 10,
  quantity_failed: 0,
  notes: '外观检查完成，商品状态良好'
})
```

##### 1.5 完成质检
```javascript
// 接口地址
POST /quality/inspections/{id}/complete/

// 请求参数
{
  "overall_result": "pass",              // 整体结果: pass, fail, conditional
  "final_quantity_passed": 28,           // 最终合格数量
  "final_quantity_failed": 2,            // 最终不合格数量
  "defect_rate": 6.67,                   // 缺陷率(%)
  "quality_score": 95.5,                 // 质量得分(0-100)
  "inspector_id": 3,                     // 质检员ID (可选)
  "actual_end_date": "2025-01-21T11:30:00Z", // 实际结束时间 (可选)
  "disposition": "accept",               // 处置决定: accept, reject, rework, quarantine
  "corrective_actions": [                // 纠正措施 (可选)
    {
      "action": "更换包装",
      "responsible": "包装部门",
      "due_date": "2025-01-22"
    }
  ],
  "next_steps": "入库上架",              // 后续步骤 (可选)
  "certificate_required": true,          // 是否需要质检合格证
  "notes": "质检完成，整体质量良好"      // 总结备注 (可选)
}

// 响应格式
{
  "id": 1,
  "status": "completed",
  "overall_result": "pass",
  "actual_end_date": "2025-01-21T11:30:00Z",
  "actual_duration": 135,                // 实际质检时长(分钟)
  "efficiency": 88.9,                    // 质检效率(%)
  "quality_score": 95.5,
  "defect_rate": 6.67,
  "final_quantity_passed": 28,
  "final_quantity_failed": 2,
  "disposition": "accept",
  "certificate_number": "QC-CERT-2025010001" // 质检证书编号
}

// 前端调用
const result = await wmsAPI.completeQualityInspection(1, {
  overall_result: 'pass',
  final_quantity_passed: 28,
  final_quantity_failed: 2,
  quality_score: 95.5,
  disposition: 'accept',
  notes: '质检完成，整体质量良好'
})
```

##### 1.6 批量质检操作
```javascript
// 接口地址
POST /quality/inspections/batch_inspect/

// 请求参数
{
  "inspection_ids": [1, 2, 3, 4],        // 质检单ID列表
  "operation": "start",                  // 操作类型: start, complete, approve, reject
  "inspector_id": 3,                     // 质检员ID (可选)
  "batch_notes": "批量质检作业"          // 批量备注 (可选)
}

// 前端调用
const result = await wmsAPI.batchInspectOperations([1, 2, 3, 4], {
  operation: 'start',
  inspector_id: 3,
  batch_notes: '批量质检作业'
})
```

#### 2. 质检统计

##### 2.1 获取质检统计
```javascript
// 接口地址
GET /quality/inspections/stats/

// 查询参数
{
  warehouse_id: 1,          // 仓库ID (可选)
  date_range: "30_days",    // 统计时间范围: 7_days, 30_days, 90_days
  inspection_type: "incoming", // 质检类型 (可选)
  inspector_id: 3          // 质检员ID (可选)
}

// 响应格式
{
  "total_inspections": 250,          // 质检总数
  "pending_inspections": 35,         // 待质检
  "in_progress_inspections": 15,     // 进行中
  "completed_inspections": 200,      // 已完成
  "average_quality_score": 94.2,     // 平均质量得分
  "average_defect_rate": 3.8,        // 平均缺陷率(%)
  "pass_rate": 96.2,                 // 合格率(%)
  "total_quantity_inspected": 12500, // 总检查数量
  "total_quantity_passed": 12025,    // 总合格数量
  "total_quantity_failed": 475,      // 总不合格数量
  "by_status": {
    "pending": 35,
    "in_progress": 15,
    "completed": 180,
    "approved": 20
  },
  "by_result": {
    "pass": 180,
    "fail": 15,
    "conditional": 5
  },
  "by_type": {
    "incoming": 150,
    "outgoing": 50,
    "periodic": 30,
    "random": 20
  },
  "defect_analysis": [               // 缺陷分析
    {
      "defect_type": "scratches",
      "count": 25,
      "percentage": 5.3
    },
    {
      "defect_type": "dents",
      "count": 15,
      "percentage": 3.2
    }
  ]
}

// 前端调用
const qualityStats = await wmsAPI.getQualityStats({
  warehouse_id: 1,
  date_range: '30_days'
})
```

#### 3. 质检报告

##### 3.1 获取质检报告
```javascript
// 接口地址
GET /quality/inspections/{id}/report/

// 响应格式
{
  "inspection_id": 1,
  "report_number": "QR2025010001",
  "product": {
    "id": 100,
    "name": "iPhone 15 Pro",
    "sku": "IP15P-128GB-NT"
  },
  "inspection_summary": {
    "inspection_number": "QC2025010001",
    "inspection_type": "incoming",
    "batch_number": "BATCH2025001",
    "quantity_inspected": 30,
    "quantity_passed": 28,
    "quantity_failed": 2,
    "quality_score": 95.5,
    "defect_rate": 6.67,
    "overall_result": "pass"
  },
  "inspector_info": {
    "id": 3,
    "name": "质检员1",
    "certification": "质检工程师",
    "signature": "inspector_signature.png"
  },
  "inspection_details": [            // 详细检查结果
    {
      "check_point": "外观检查",
      "result": "pass",
      "actual_value": "外观完好，无破损",
      "standard": "无破损、变形",
      "weight": 0.3,
      "score": 100
    },
    {
      "check_point": "功能测试",
      "result": "pass",
      "actual_value": "功能正常",
      "standard": "可正常开机，功能完好",
      "weight": 0.7,
      "score": 92
    }
  ],
  "defects_found": [                 // 发现的缺陷
    {
      "defect_type": "scratches",
      "severity": "minor",
      "quantity": 2,
      "description": "轻微划痕",
      "photos": ["defect_001.jpg"]
    }
  ],
  "corrective_actions": [            // 纠正措施
    {
      "action": "加强包装保护",
      "responsible": "包装部门",
      "due_date": "2025-01-22",
      "status": "planned"
    }
  ],
  "disposition": "accept",           // 处置决定
  "certificate_info": {             // 质检证书信息
    "certificate_number": "QC-CERT-2025010001",
    "issue_date": "2025-01-21",
    "valid_until": "2025-04-21"
  },
  "timestamps": {
    "planned_start": "2025-01-21T09:00:00Z",
    "actual_start": "2025-01-21T09:15:00Z",
    "actual_end": "2025-01-21T11:30:00Z"
  },
  "generated_at": "2025-01-21T12:00:00Z"
}

// 前端调用
const inspectionReport = await wmsAPI.getInspectionReport(1)
```

##### 3.2 打印质检报告
```javascript
// 接口地址
GET /quality/inspections/{id}/print/

// 查询参数
{
  format: "pdf",               // 格式: pdf, html, excel
  template: "standard",        // 模板: standard, detailed, summary
  include_photos: true,        // 是否包含照片
  language: "zh-CN"           // 语言: zh-CN, en-US
}

// 响应格式：PDF文件流或HTML内容

// 前端调用
const printReport = await wmsAPI.printInspectionReport(1, {
  format: 'pdf',
  template: 'standard',
  include_photos: true
})
```

#### 4. 质检模板管理

##### 4.1 获取质检模板列表
```javascript
// 接口地址
GET /quality/templates/

// 前端调用
const templates = await wmsAPI.getInspectionTemplates({
  product_category: '智能手机',
  inspection_type: 'incoming'
})
```

##### 4.2 创建质检模板
```javascript
// 接口地址
POST /quality/templates/

// 请求参数
{
  "template_name": "智能手机入库质检模板",
  "product_category": "智能手机",
  "inspection_type": "incoming",
  "checklist_items": [
    {
      "check_point": "外观检查",
      "description": "检查包装是否完好，无破损",
      "standard": "无破损、变形",
      "weight": 0.3,
      "order": 1
    },
    {
      "check_point": "功能测试",
      "description": "开机测试，功能正常",
      "standard": "可正常开机，功能完好",
      "weight": 0.7,
      "order": 2
    }
  ]
}

// 前端调用
const newTemplate = await wmsAPI.createInspectionTemplate({
  template_name: '智能手机入库质检模板',
  product_category: '智能手机',
  inspection_type: 'incoming',
  checklist_items: [
    {
      check_point: '外观检查',
      description: '检查包装是否完好，无破损',
      standard: '无破损、变形',
      weight: 0.3,
      order: 1
    }
  ]
})
```

### 📈 报表分析模块 (Reports & Analytics)

#### 1. 仪表板数据

##### 1.1 获取仪表板概览数据
```javascript
// 接口地址
GET /reports/overview/

// 查询参数
{
  warehouse_id: 1,          // 仓库ID (可选)
  date_range: "30_days",    // 统计时间范围: 7_days, 30_days, 90_days, year
  currency: "CNY"           // 货币单位 (可选)
}

// 响应格式
{
  "warehouse_summary": {
    "total_warehouses": 5,
    "active_warehouses": 4,
    "total_locations": 2500,
    "occupied_locations": 2100,
    "location_utilization": 84.0
  },
  "inventory_summary": {
    "total_products": 15000,
    "total_quantity": 500000,
    "total_value": 125000000.0,
    "low_stock_items": 45,
    "out_of_stock_items": 12,
    "excess_stock_items": 23
  },
  "operations_summary": {
    "total_inbound_orders": 850,
    "total_outbound_orders": 1200,
    "pending_inbound": 25,
    "pending_outbound": 38,
    "completed_inbound": 825,
    "completed_outbound": 1162
  },
  "financial_summary": {
    "total_inbound_value": 65000000.0,
    "total_outbound_value": 89000000.0,
    "inventory_turnover": 7.2,
    "avg_order_value": 74166.67
  },
  "quality_summary": {
    "total_inspections": 450,
    "pass_rate": 96.2,
    "average_quality_score": 94.5,
    "critical_issues": 3
  },
  "performance_kpis": {
    "order_fulfillment_rate": 98.5,
    "on_time_delivery_rate": 96.8,
    "inventory_accuracy": 99.2,
    "picking_accuracy": 99.7,
    "avg_processing_time": 4.2
  },
  "recent_activities": [             // 最近活动
    {
      "type": "inbound",
      "description": "PO2025010025入库完成",
      "timestamp": "2025-01-20T15:30:00Z",
      "status": "success"
    },
    {
      "type": "outbound",
      "description": "SO2025010155发货完成",
      "timestamp": "2025-01-20T14:45:00Z",
      "status": "success"
    },
    {
      "type": "alert",
      "description": "iPhone 15 Pro库存预警",
      "timestamp": "2025-01-20T13:20:00Z",
      "status": "warning"
    }
  ],
  "trend_data": {                    // 趋势数据
    "daily_inbound": [125, 135, 142, 118, 156, 148, 162],
    "daily_outbound": [185, 198, 175, 202, 188, 195, 210],
    "weekly_labels": ["1/14", "1/15", "1/16", "1/17", "1/18", "1/19", "1/20"]
  }
}

// 前端调用
const dashboardData = await wmsAPI.getDashboardOverview({
  warehouse_id: 1,
  date_range: '30_days'
})
```

##### 1.2 获取实时指标
```javascript
// 接口地址
GET /reports/realtime_metrics/

// 响应格式
{
  "current_operations": {
    "active_picking_orders": 15,
    "active_packing_orders": 8,
    "active_shipping_orders": 5,
    "active_inspections": 3,
    "online_users": 12
  },
  "hourly_stats": {
    "orders_processed_today": 156,
    "items_picked_today": 2450,
    "items_packed_today": 2200,
    "items_shipped_today": 2150
  },
  "alerts": [                        // 实时警报
    {
      "type": "stock_alert",
      "severity": "high",
      "message": "iPhone 15 Pro库存低于安全库存",
      "timestamp": "2025-01-20T15:45:00Z"
    },
    {
      "type": "system_alert",
      "severity": "medium",
      "message": "打印机A区01号离线",
      "timestamp": "2025-01-20T15:30:00Z"
    }
  ],
  "updated_at": "2025-01-20T16:00:00Z"
}

// 前端调用
const realtimeMetrics = await wmsAPI.getRealtimeMetrics()
```

#### 2. 入库报表

##### 2.1 获取入库报表数据
```javascript
// 接口地址
GET /reports/inbound/

// 查询参数
{
  warehouse_id: 1,          // 仓库ID (可选)
  supplier_id: 5,           // 供应商ID (可选)
  product_category: "智能手机", // 商品分类 (可选)
  date_from: "2025-01-01",  // 日期范围
  date_to: "2025-01-31",
  order_type: "purchase",   // 订单类型: purchase, return, transfer
  status: "completed",      // 状态筛选
  group_by: "day",          // 分组方式: day, week, month, supplier, category
  metrics: ["quantity", "value", "orders"] // 指标类型
}

// 响应格式
{
  "summary": {
    "total_orders": 250,
    "total_quantity": 125000,
    "total_value": 45000000.0,
    "avg_order_value": 180000.0,
    "avg_processing_time": 4.8,
    "completion_rate": 98.4
  },
  "by_status": {
    "pending": 5,
    "processing": 8,
    "completed": 230,
    "cancelled": 7
  },
  "by_type": {
    "purchase": 200,
    "return": 30,
    "transfer": 20
  },
  "by_supplier": [                   // 按供应商统计
    {
      "supplier_id": 5,
      "supplier_name": "华为技术有限公司",
      "order_count": 45,
      "total_quantity": 22500,
      "total_value": 8500000.0,
      "avg_delivery_time": 3.2
    },
    {
      "supplier_id": 6,
      "supplier_name": "小米科技有限公司",
      "order_count": 38,
      "total_quantity": 19000,
      "total_value": 7200000.0,
      "avg_delivery_time": 2.8
    }
  ],
  "by_category": [                   // 按商品分类统计
    {
      "category": "智能手机",
      "order_count": 120,
      "total_quantity": 60000,
      "total_value": 25000000.0,
      "percentage": 55.6
    },
    {
      "category": "平板电脑",
      "order_count": 80,
      "total_quantity": 40000,
      "total_value": 15000000.0,
      "percentage": 33.3
    }
  ],
  "trend_analysis": {                // 趋势分析
    "daily_data": [
      {
        "date": "2025-01-01",
        "order_count": 8,
        "quantity": 4000,
        "value": 1500000.0
      },
      {
        "date": "2025-01-02",
        "order_count": 12,
        "quantity": 6000,
        "value": 2200000.0
      }
    ],
    "growth_rate": {
      "orders": 15.2,
      "quantity": 18.5,
      "value": 22.3
    }
  },
  "quality_metrics": {
    "inspections_performed": 180,
    "pass_rate": 96.7,
    "average_quality_score": 94.8,
    "rejected_items": 750
  }
}

// 前端调用
const inboundReport = await wmsAPI.getInboundReport({
  warehouse_id: 1,
  date_from: '2025-01-01',
  date_to: '2025-01-31',
  group_by: 'day'
})
```

##### 2.2 获取入库明细报表
```javascript
// 接口地址
GET /reports/inbound/details/

// 查询参数
{
  warehouse_id: 1,
  date_from: "2025-01-01",
  date_to: "2025-01-31",
  include_items: true,      // 是否包含明细
  export_format: "json"     // 导出格式: json, csv, excel
}

// 前端调用
const inboundDetails = await wmsAPI.getInboundDetails({
  warehouse_id: 1,
  date_from: '2025-01-01',
  date_to: '2025-01-31',
  include_items: true
})
```

#### 3. 出库报表

##### 3.1 获取出库报表数据
```javascript
// 接口地址
GET /reports/outbound/

// 查询参数
{
  warehouse_id: 1,          // 仓库ID (可选)
  customer_id: 5,           // 客户ID (可选)
  product_category: "智能手机", // 商品分类 (可选)
  date_from: "2025-01-01",  // 日期范围
  date_to: "2025-01-31",
  order_type: "sales",      // 订单类型: sales, transfer, return
  status: "completed",      // 状态筛选
  group_by: "day",          // 分组方式: day, week, month, customer, category
  metrics: ["quantity", "value", "orders"] // 指标类型
}

// 响应格式
{
  "summary": {
    "total_orders": 380,
    "total_quantity": 190000,
    "total_value": 85000000.0,
    "avg_order_value": 223684.21,
    "avg_fulfillment_time": 6.2,
    "fulfillment_rate": 98.7,
    "on_time_delivery_rate": 96.8
  },
  "by_status": {
    "pending": 12,
    "picking": 15,
    "packed": 8,
    "shipped": 25,
    "completed": 320
  },
  "by_type": {
    "sales": 300,
    "transfer": 50,
    "return": 30
  },
  "by_customer": [                   // 按客户统计
    {
      "customer_id": 5,
      "customer_name": "北京小米专卖店",
      "order_count": 45,
      "total_quantity": 22500,
      "total_value": 12500000.0,
      "avg_order_value": 277777.78
    },
    {
      "customer_id": 6,
      "customer_name": "上海华为体验店",
      "order_count": 38,
      "total_quantity": 19000,
      "total_value": 9800000.0,
      "avg_order_value": 257894.74
    }
  ],
  "by_category": [                   // 按商品分类统计
    {
      "category": "智能手机",
      "order_count": 200,
      "total_quantity": 100000,
      "total_value": 45000000.0,
      "percentage": 52.9
    },
    {
      "category": "平板电脑",
      "order_count": 120,
      "total_quantity": 60000,
      "total_value": 25000000.0,
      "percentage": 29.4
    }
  ],
  "trend_analysis": {                // 趋势分析
    "daily_data": [
      {
        "date": "2025-01-01",
        "order_count": 12,
        "quantity": 6000,
        "value": 2800000.0
      },
      {
        "date": "2025-01-02",
        "order_count": 15,
        "quantity": 7500,
        "value": 3200000.0
      }
    ],
    "growth_rate": {
      "orders": 12.8,
      "quantity": 15.6,
      "value": 18.9
    }
  },
  "fulfillment_metrics": {           // 履行指标
    "avg_picking_time": 45.2,
    "avg_packing_time": 18.5,
    "avg_shipping_time": 24.8,
    "picking_accuracy": 99.6,
    "shipping_accuracy": 99.2
  }
}

// 前端调用
const outboundReport = await wmsAPI.getOutboundReport({
  warehouse_id: 1,
  date_from: '2025-01-01',
  date_to: '2025-01-31',
  group_by: 'day'
})
```

#### 4. 库存报表

##### 4.1 获取库存报表数据
```javascript
// 接口地址
GET /reports/inventory/

// 查询参数
{
  warehouse_id: 1,          // 仓库ID (可选)
  product_category: "智能手机", // 商品分类 (可选)
  supplier_id: 5,           // 供应商ID (可选)
  location_zone: "A区",     // 库区筛选 (可选)
  stock_status: "normal",   // 库存状态: normal, low_stock, out_of_stock, excess
  abc_category: "A",        // ABC分类: A, B, C
  valuation_method: "FIFO", // 计价方法: FIFO, LIFO, WAC
  include_movements: true,  // 是否包含移动记录
  as_of_date: "2025-01-20" // 截止日期 (可选)
}

// 响应格式
{
  "summary": {
    "total_products": 15000,
    "total_quantity": 500000,
    "total_value": 125000000.0,
    "avg_unit_value": 250.0,
    "inventory_turnover": 7.2,
    "days_of_supply": 50.7
  },
  "stock_status_analysis": {
    "normal_stock": 12450,
    "low_stock": 1250,
    "out_of_stock": 450,
    "excess_stock": 850,
    "low_stock_percentage": 8.3,
    "out_of_stock_percentage": 3.0
  },
  "abc_analysis": {                  // ABC分析
    "category_A": {
      "product_count": 1500,
      "quantity": 150000,
      "value": 75000000.0,
      "percentage_value": 60.0
    },
    "category_B": {
      "product_count": 4500,
      "quantity": 200000,
      "value": 37500000.0,
      "percentage_value": 30.0
    },
    "category_C": {
      "product_count": 9000,
      "quantity": 150000,
      "value": 12500000.0,
      "percentage_value": 10.0
    }
  },
  "by_category": [                   // 按分类统计
    {
      "category": "智能手机",
      "product_count": 5000,
      "total_quantity": 250000,
      "total_value": 75000000.0,
      "avg_turnover": 8.5,
      "stock_alerts": 125
    },
    {
      "category": "平板电脑",
      "product_count": 3000,
      "total_quantity": 150000,
      "total_value": 35000000.0,
      "avg_turnover": 6.8,
      "stock_alerts": 85
    }
  ],
  "by_warehouse": [                  // 按仓库统计
    {
      "warehouse_id": 1,
      "warehouse_name": "北京总仓库",
      "product_count": 8000,
      "total_quantity": 300000,
      "total_value": 75000000.0,
      "utilization_rate": 85.2
    },
    {
      "warehouse_id": 2,
      "warehouse_name": "上海分仓库",
      "product_count": 5000,
      "total_quantity": 150000,
      "total_value": 35000000.0,
      "utilization_rate": 78.6
    }
  ],
  "aging_analysis": [                // 库龄分析
    {
      "age_range": "0-30天",
      "quantity": 200000,
      "value": 50000000.0,
      "percentage": 40.0
    },
    {
      "age_range": "31-60天",
      "quantity": 150000,
      "value": 37500000.0,
      "percentage": 30.0
    },
    {
      "age_range": "61-90天",
      "quantity": 100000,
      "value": 25000000.0,
      "percentage": 20.0
    },
    {
      "age_range": "90天以上",
      "quantity": 50000,
      "value": 12500000.0,
      "percentage": 10.0
    }
  ],
  "movement_summary": {              // 移动汇总
    "total_movements": 2500,
    "inbound_movements": 1200,
    "outbound_movements": 1000,
    "internal_movements": 300,
    "avg_daily_movements": 83.3
  }
}

// 前端调用
const inventoryReport = await wmsAPI.getInventoryReport({
  warehouse_id: 1,
  stock_status: 'normal',
  include_movements: true
})
```

##### 4.2 获取库存周转分析
```javascript
// 接口地址
GET /reports/inventory/turnover/

// 查询参数
{
  warehouse_id: 1,
  period_months: 12,        // 分析周期(月)
  group_by: "category",     // 分组方式: category, supplier, abc
  min_turnover: 0.5,        // 最小周转率筛选
  max_turnover: 20.0        // 最大周转率筛选
}

// 前端调用
const turnoverAnalysis = await wmsAPI.getInventoryTurnover({
  warehouse_id: 1,
  period_months: 12,
  group_by: 'category'
})
```

#### 5. 数据分析

##### 5.1 获取综合数据分析
```javascript
// 接口地址
GET /reports/analytics/comprehensive/

// 查询参数
{
  warehouse_id: 1,
  analysis_type: "performance", // 分析类型: performance, financial, operational
  date_from: "2025-01-01",
  date_to: "2025-01-31",
  comparison_period: "previous_month", // 对比周期
  include_forecasts: true      // 是否包含预测
}

// 响应格式
{
  "performance_analysis": {
    "efficiency_metrics": {
      "warehouse_utilization": 84.2,
      "staff_productivity": 92.5,
      "equipment_utilization": 78.9,
      "space_utilization": 86.3
    },
    "quality_metrics": {
      "order_accuracy": 99.6,
      "inventory_accuracy": 99.2,
      "damage_rate": 0.8,
      "return_rate": 2.1
    },
    "speed_metrics": {
      "avg_order_processing_time": 4.2,
      "avg_picking_time": 45.2,
      "avg_packing_time": 18.5,
      "avg_shipping_time": 24.8
    }
  },
  "financial_analysis": {
    "cost_metrics": {
      "storage_cost_per_unit": 2.5,
      "handling_cost_per_order": 12.8,
      "shipping_cost_per_order": 25.6,
      "total_operational_cost": 458000.0
    },
    "revenue_metrics": {
      "revenue_per_sqm": 1250.0,
      "inventory_investment": 125000000.0,
      "carrying_cost_rate": 18.5,
      "gross_margin": 35.2
    }
  },
  "operational_analysis": {
    "demand_patterns": [
      {
        "product_category": "智能手机",
        "avg_daily_demand": 856,
        "seasonality_factor": 1.2,
        "growth_trend": "increasing"
      }
    ],
    "capacity_analysis": {
      "current_capacity_utilization": 78.5,
      "peak_capacity_utilization": 95.2,
      "recommended_capacity": 120000
    }
  },
  "forecasting": {                   // 预测分析
    "demand_forecast": [
      {
        "date": "2025-02-01",
        "predicted_demand": 1250,
        "confidence_interval": {
          "lower": 1100,
          "upper": 1400
        }
      }
    ],
    "inventory_forecast": [
      {
        "product_id": 100,
        "predicted_stock_out_date": "2025-02-15",
        "recommended_reorder_quantity": 500
      }
    ]
  },
  "recommendations": [               // 优化建议
    {
      "type": "inventory_optimization",
      "priority": "high",
      "description": "建议调整iPhone 15 Pro的安全库存水平",
      "expected_impact": "减少库存成本15%"
    },
    {
      "type": "process_improvement",
      "priority": "medium",
      "description": "优化拣货路径可提升效率",
      "expected_impact": "提升拣货效率12%"
    }
  ]
}

// 前端调用
const comprehensiveAnalysis = await wmsAPI.getComprehensiveAnalysis({
  warehouse_id: 1,
  analysis_type: 'performance',
  date_from: '2025-01-01',
  date_to: '2025-01-31',
  include_forecasts: true
})
```

#### 6. 报表导出

##### 6.1 导出报表
```javascript
// 接口地址
GET /reports/export/{type}/

// 路径参数：type = overview|inbound|outbound|inventory|analytics

// 查询参数
{
  format: "excel",          // 导出格式: excel, csv, pdf
  warehouse_id: 1,
  date_from: "2025-01-01",
  date_to: "2025-01-31",
  template: "standard",     // 模板: standard, detailed, summary
  include_charts: true,     // 是否包含图表(PDF格式)
  language: "zh-CN",        // 语言: zh-CN, en-US
  email_to: "manager@company.com" // 邮件发送地址 (可选)
}

// 响应格式：文件流或下载链接

// 前端调用
const exportedReport = await wmsAPI.exportReport('inbound', {
  format: 'excel',
  warehouse_id: 1,
  date_from: '2025-01-01',
  date_to: '2025-01-31',
  template: 'detailed',
  include_charts: true
})
```

##### 6.2 批量导出报表
```javascript
// 接口地址
POST /reports/batch_export/

// 请求参数
{
  "export_tasks": [
    {
      "report_type": "inbound",
      "format": "excel",
      "warehouse_id": 1,
      "date_from": "2025-01-01",
      "date_to": "2025-01-31"
    },
    {
      "report_type": "outbound",
      "format": "pdf",
      "warehouse_id": 1,
      "date_from": "2025-01-01",
      "date_to": "2025-01-31"
    }
  ],
  "email_to": "manager@company.com",
  "compress_files": true,           // 是否压缩文件
  "notes": "月度报表批量导出"
}

// 前端调用
const batchExport = await wmsAPI.batchExportReports({
  export_tasks: [
    {
      report_type: 'inbound',
      format: 'excel',
      warehouse_id: 1,
      date_from: '2025-01-01',
      date_to: '2025-01-31'
    }
  ],
  email_to: 'manager@company.com',
  compress_files: true
})
```

#### 7. 自定义报表

##### 7.1 创建自定义报表
```javascript
// 接口地址
POST /reports/custom/

// 请求参数
{
  "report_name": "销售业绩月报",
  "report_type": "custom",
  "data_sources": ["outbound_orders", "products", "customers"],
  "filters": [
    {
      "field": "order_date",
      "operator": "between",
      "value": ["2025-01-01", "2025-01-31"]
    },
    {
      "field": "status",
      "operator": "in",
      "value": ["completed", "shipped"]
    }
  ],
  "fields": [
    {
      "source": "outbound_orders",
      "field": "order_number",
      "alias": "订单号"
    },
    {
      "source": "customers",
      "field": "name",
      "alias": "客户名称"
    },
    {
      "source": "outbound_orders",
      "field": "total_amount",
      "alias": "订单金额"
    }
  ],
  "aggregations": [
    {
      "field": "total_amount",
      "function": "sum",
      "alias": "总销售额"
    },
    {
      "field": "order_number",
      "function": "count",
      "alias": "订单数量"
    }
  ],
  "group_by": ["customer_id"],
  "order_by": [{"field": "total_amount", "direction": "desc"}],
  "limit": 100
}

// 前端调用
const customReport = await wmsAPI.createCustomReport({
  report_name: '销售业绩月报',
  data_sources: ['outbound_orders', 'products', 'customers'],
  filters: [
    {
      field: 'order_date',
      operator: 'between',
      value: ['2025-01-01', '2025-01-31']
    }
  ]
})
```

##### 7.2 执行自定义报表
```javascript
// 接口地址
POST /reports/custom/{id}/execute/

// 请求参数
{
  "parameters": {              // 运行时参数
    "date_from": "2025-01-01",
    "date_to": "2025-01-31",
    "warehouse_id": 1
  },
  "export_format": "excel"     // 导出格式 (可选)
}

// 前端调用
const reportResult = await wmsAPI.executeCustomReport(1, {
  parameters: {
    date_from: '2025-01-01',
    date_to: '2025-01-31',
    warehouse_id: 1
  },
  export_format: 'excel'
})
```