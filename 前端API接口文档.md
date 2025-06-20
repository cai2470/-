# 小神龙WMS系统 - 前端API接口文档 v2.9.0

> ⚡ **v2.9.0 更新说明**: 根据后端要求，已更新API路径配置，移除部分接口的 `/api` 前缀

## 概述
本文档描述小神龙仓库管理系统前端API接口定义和集成说明。

---

## 🗂️ 后端需求澄清表格（Django+DRF+PostgreSQL 版）

| 模块/问题           | 说明/选项 | 你的需求/备注 |
|--------------------|-----------|--------------|
| **1. 用户与权限体系** |           |              |
| 用户体系           | 1. Django自带User<br>2. 自定义扩展User（如增加员工号、手机号等） |              |
| 角色与权限         | 1. RBAC（角色-权限）<br>2. 仅分管理员/普通用户<br>3. 其他 |              |
| 权限粒度           | 1. 接口级别（API粒度）<br>2. 页面/模块级别<br>3. 其他 |              |
| 需要特殊字段吗？   | 如：员工编号、职位、部门、手机号等 |              |
| **2. 组织结构**     |           |              |
| 员工与用户关系     | 1. 员工=用户（同一张表）<br>2. 员工和用户分开（有外键关系） |              |
| 组织层级           | 1. 仅公司<br>2. 公司-部门-岗位<br>3. 其他 |              |
| **3. 仓库/商品/库存等核心模型** |           |              |
| 商品字段           | 例：条码、规格、单位、品牌、分类、图片等 |              |
| 仓库/库区/库位字段 | 例：仓库地址、库区类型、库位编码等 |              |
| 商品分类/品牌/供应商 | 1. 是否有多级分类？<br>2. 供应商有特殊属性吗？ |              |
| **4. 业务流程**     |           |              |
| 入库/出库/盘点/质检流程 | 1. 是否有审批流？<br>2. 是否有多级状态？<br>3. 是否需要操作日志？ |              |
| 状态流转           | 1. 需详细记录<br>2. 仅保留当前状态 |              |
| **5. 报表与导出**   |           |              |
| 报表数据量         | 1. 大（需异步/定时任务）<br>2. 小（同步即可） |              |
| 导出格式           | 1. Excel/CSV<br>2. PDF<br>3. 打印<br>4. 其他 |              |
| **6. 其他技术细节** |           |              |
| 多租户需求         | 1. 需要（多公司/多仓库隔离）<br>2. 不需要 |              |
| 第三方系统对接     | 1. 需要（如ERP、物流）<br>2. 不需要 |              |
| 多语言支持         | 1. 需要<br>2. 不需要 |              |
| 其他补充           |           |              |

---

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

### 📊 库存管理 ⚡ **已更新路径**

#### 库存查询
- **列表**: `GET /inventory/stock/` ⚡
- **统计**: `GET /inventory/stock/stats/` ⚡
- **调整**: `POST /inventory/stock/adjust/` ⚡
- **转移**: `POST /inventory/stock/transfer/` ⚡

#### 库存预警
- **列表**: `GET /inventory/alerts/` ⚡
- **处理**: `POST /inventory/alerts/{id}/handle/` ⚡
- **批量处理**: `POST /inventory/alerts/batch_handle/` ⚡
- **统计**: `GET /inventory/alerts/stats/` ⚡

#### 库存移动
- **记录**: `GET /inventory/movements/` ⚡
- **详情**: `GET /inventory/movements/{id}/` ⚡

#### 盘点管理
- **列表**: `GET /inventory/count/` ⚡
- **创建**: `POST /inventory/count/` ⚡
- **开始**: `POST /inventory/count/{id}/start/` ⚡
- **提交**: `POST /inventory/count/{id}/submit/` ⚡

### 📥 入库管理

#### 入库单
- **列表**: `GET /inbound/purchase-orders/`
- **创建**: `POST /inbound/purchase-orders/`
- **开始收货**: `POST /inbound/purchase-orders/{id}/start_receive/`
- **确认收货**: `POST /inbound/purchase-orders/{id}/confirm_receive/`

#### 退货管理
- **列表**: `GET /inbound/return-orders/`
- **创建**: `POST /inbound/return-orders/`

### 📤 出库管理 ⚡ **已更新路径**

#### 出库单管理
- **列表**: `GET /outbound/orders/` ⚡ (支持分页: `?page=1&page_size=20&status=pending`)
- **创建**: `POST /outbound/orders/` ⚡
- **更新**: `PUT /outbound/orders/{id}/` ⚡
- **删除**: `DELETE /outbound/orders/{id}/` ⚡
- **确认**: `POST /outbound/orders/{id}/confirm/` ⚡
- **统计**: `GET /outbound/orders/stats/` ⚡

#### 拣货管理
- **开始拣货**: `POST /outbound/picking/{id}/start/` ⚡
- **扫码确认**: `POST /outbound/picking/{id}/scan/` ⚡
- **完成拣货**: `POST /outbound/picking/{id}/complete/` ⚡
- **批量开始拣货**: `POST /outbound/picking/batch_start/` ⚡
- **批量完成拣货**: `POST /outbound/picking/batch_complete/` ⚡

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

**文档版本**: v2.9.0  
**最后更新**: 2025-01-20  
**修复状态**: ✅ API路径已更新，支持后端新路径配置  
**GitHub**: [小神龙WMS前端](https://github.com/xiaoshenlong/wms-frontend)

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