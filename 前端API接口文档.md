# 小神龙WMS系统 - 前端API接口文档 v2.6.0

## 概述
本文档描述小神龙仓库管理系统前端API接口定义和集成说明。

**API基础信息：**
- 基础URL: `http://127.0.0.1:8000` 
- 认证方式: JWT Bearer Token
- 数据格式: JSON

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

## 核心API接口

### 🔐 认证模块

#### 登录
- **接口**: `POST /users/login/`
- **参数**: `{ "username": "admin", "password": "admin123" }`
- **响应**: `{ "success": true, "tokens": { "access": "...", "refresh": "..." }, "user": {...} }`

**演示账户**:
- 管理员: admin / admin123
- 仓库经理: manager / manager123  
- 操作员: operator / operator123

#### 刷新令牌
- **接口**: `POST /api/auth/refresh/`
- **参数**: `{ "refresh": "..." }`

#### 获取用户信息
- **接口**: `GET /users/profile/`

### 👤 用户管理

#### 用户CRUD
- **列表**: `GET /users/users/` (支持分页: `?page=1&page_size=20&search=keyword`)
- **创建**: `POST /users/users/`
- **更新**: `PUT /users/users/{id}/`
- **删除**: `DELETE /users/users/{id}/`

#### 员工管理
- **列表**: `GET /api/staff/` (支持筛选: `?department=warehouse&position=manager`)
- **创建**: `POST /api/staff/`
- **更新**: `PUT /api/staff/{id}/`
- **状态变更**: `PUT /api/staff/{id}/status/`

### 🔑 角色权限

#### 角色管理
- **列表**: `GET /api/users/roles/`
- **创建**: `POST /api/users/roles/`
- **更新权限**: `POST /api/users/roles/{id}/permissions/`

#### 权限管理
- **权限树**: `GET /api/users/permissions/tree/`
- **按模块**: `GET /api/users/permissions/by_module/?module=user`

### 🏢 仓库管理

#### 仓库
- **列表**: `GET /warehouse/warehouses/`
- **创建**: `POST /warehouse/warehouses/`

#### 库区
- **列表**: `GET /warehouse/zones/`
- **创建**: `POST /warehouse/zones/`

#### 库位
- **列表**: `GET /warehouse/locations/`
- **创建**: `POST /warehouse/locations/`

### 📦 商品管理

#### 商品
- **列表**: `GET /products/products/` 或 `GET /api/products/`
- **创建**: `POST /products/products/`
- **更新**: `PUT /products/products/{id}/`
- **删除**: `DELETE /products/products/{id}/`

#### 分类
- **列表**: `GET /products/categories/`
- **创建**: `POST /products/categories/`

#### 品牌
- **列表**: `GET /products/brands/`
- **创建**: `POST /products/brands/`

#### 供应商
- **列表**: `GET /products/suppliers/`
- **创建**: `POST /products/suppliers/`

### 📊 库存管理

#### 库存查询
- **列表**: `GET /api/inventory/stock/`
- **统计**: `GET /api/inventory/stock/stats/`
- **调整**: `POST /api/inventory/stock/adjust/`
- **转移**: `POST /api/inventory/stock/transfer/`

#### 库存预警
- **列表**: `GET /api/inventory/alerts/`
- **处理**: `POST /api/inventory/alerts/{id}/handle/`
- **批量处理**: `POST /api/inventory/alerts/batch_handle/`
- **统计**: `GET /api/inventory/alerts/stats/`

#### 库存移动
- **记录**: `GET /api/inventory/movements/`
- **详情**: `GET /api/inventory/movements/{id}/`

#### 盘点管理
- **列表**: `GET /api/inventory/count/`
- **创建**: `POST /api/inventory/count/`
- **开始**: `POST /api/inventory/count/{id}/start/`
- **提交**: `POST /api/inventory/count/{id}/submit/`

### 📥 入库管理

#### 入库单
- **列表**: `GET /inbound/purchase-orders/`
- **创建**: `POST /inbound/purchase-orders/`
- **开始收货**: `POST /inbound/purchase-orders/{id}/start_receive/`
- **确认收货**: `POST /inbound/purchase-orders/{id}/confirm_receive/`

#### 退货管理
- **列表**: `GET /inbound/return-orders/`
- **创建**: `POST /inbound/return-orders/`

### 📤 出库管理

#### 出库单管理
- **列表**: `GET /api/outbound/orders/` (支持分页: `?page=1&page_size=20&status=pending`)
- **创建**: `POST /api/outbound/orders/`
- **更新**: `PUT /api/outbound/orders/{id}/`
- **删除**: `DELETE /api/outbound/orders/{id}/`
- **确认**: `POST /api/outbound/orders/{id}/confirm/`
- **统计**: `GET /api/outbound/orders/stats/`

#### 拣货管理
- **开始拣货**: `POST /api/outbound/picking/{id}/start/`
- **扫码确认**: `POST /api/outbound/picking/{id}/scan/`
- **完成拣货**: `POST /api/outbound/picking/{id}/complete/`
- **批量开始拣货**: `POST /api/outbound/picking/batch_start/`
- **批量完成拣货**: `POST /api/outbound/picking/batch_complete/`

#### 打包管理
- **开始打包**: `POST /api/outbound/packing/{id}/start/`
- **完成打包**: `POST /api/outbound/packing/{id}/complete/`
- **批量完成打包**: `POST /api/outbound/packing/batch_complete/`

#### 发货管理
- **开始发货**: `POST /api/outbound/shipping/{id}/start/`
- **确认发货**: `POST /api/outbound/shipping/{id}/confirm/`
- **批量确认发货**: `POST /api/outbound/shipping/batch_confirm/`

#### 销售出库
- **列表**: `GET /api/outbound/sales/`
- **创建**: `POST /api/outbound/sales/`

#### 调拨出库
- **列表**: `GET /api/outbound/transfers/`
- **创建**: `POST /api/outbound/transfers/`

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

### ⚙️ 系统管理

#### 系统监控
- **状态**: `GET /api/system/monitor/status/`
- **性能指标**: `GET /api/system/monitor/metrics/`

#### 日志管理
- **系统日志**: `GET /api/system/logs/`
- **操作日志**: `GET /api/system/operation_logs/`
- **登录日志**: `GET /api/system/login_logs/`

#### 备份管理
- **备份列表**: `GET /api/system/backup/`
- **创建备份**: `POST /api/system/backup/`
- **恢复备份**: `POST /api/system/backup/{id}/restore/`
- **删除备份**: `DELETE /api/system/backup/{id}/`

#### 数据管理
- **批量导入**: `POST /api/system/import/`
- **数据导出**: `GET /api/system/export/`
- **API测试**: `GET /api/test/`

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

### v2.4.0 (2024-01-19) - 核心API工具增强版本
- ⭐️ **新增**: 完整的出库管理API接口(15个新接口)
- ⭐️ **新增**: 完整的质检管理API接口(7个新接口)  
- ⭐️ **新增**: 扩展的系统管理API接口(10个新接口)
- 🛡️ **增强**: API错误处理和降级机制
- 📊 **优化**: 统一的分页和筛选参数格式

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

**文档版本**: v2.6.0  
**最后更新**: 2024-01-19  
**完成进度**: 33/33模块 (100%) 🎉🏆  
**GitHub**: [小神龙WMS前端](https://github.com/xiaoshenlong/wms-frontend)