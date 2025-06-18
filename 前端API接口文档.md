# 小神龙WMS系统 - 前端API接口文档

## 概述

本文档详细描述了小神龙仓库管理系统前端使用的所有API接口。基于对前端代码的完整分析，包含了所有业务模块的接口定义。

**API基础信息：**
- 基础URL: `http://127.0.0.1:8000` 或 `https://jdegylyrnsyf.sealoshzh.site`
- 认证方式: JWT Bearer Token
- 数据格式: JSON
- 字符编码: UTF-8

## 目录

1. [认证模块](#认证模块)
2. [用户管理](#用户管理)
3. [角色权限](#角色权限)
4. [仓库管理](#仓库管理)
5. [商品管理](#商品管理)
6. [库存管理](#库存管理)
7. [入库管理](#入库管理)
8. [出库管理](#出库管理)
9. [报表分析](#报表分析)
10. [系统管理](#系统管理)

## 认证模块

### 登录接口
- **路径**: `POST /users/login/` 或 `POST /api/auth/login/`
- **描述**: 用户登录认证
- **请求参数**:
```json
{
  "username": "admin",
  "password": "123456"
}
```
- **响应格式**:
```json
{
  "success": true,
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "管理员",
    "last_name": "",
    "is_active": true,
    "role": "admin"
  }
}
```

### 登出接口
- **路径**: `POST /users/logout/` 或 `POST /api/auth/logout/`
- **描述**: 用户登出
- **请求参数**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 刷新令牌
- **路径**: `POST /api/auth/refresh/`
- **描述**: 刷新访问令牌
- **请求参数**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 获取用户信息
- **路径**: `GET /users/profile/`
- **描述**: 获取当前用户信息
- **响应格式**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "管理员",
  "is_active": true,
  "role": "admin"
}
```

## 用户管理

### 获取用户列表
- **路径**: `GET /users/users/`
- **描述**: 获取用户列表（支持分页和筛选）
- **查询参数**:
  - `page`: 页码
  - `page_size`: 每页数量
  - `search`: 搜索关键词
  - `is_active`: 是否激活
- **响应格式**:
```json
{
  "count": 100,
  "next": "http://example.com/api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "first_name": "管理员",
      "is_active": true,
      "role": "admin",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 创建用户
- **路径**: `POST /users/users/`
- **描述**: 创建新用户
- **请求参数**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "123456",
  "first_name": "新用户",
  "role": "staff",
  "is_active": true
}
```

### 更新用户
- **路径**: `PUT /users/users/{id}/`
- **描述**: 更新用户信息

### 删除用户
- **路径**: `DELETE /users/users/{id}/`
- **描述**: 删除用户

## 角色权限

### 获取角色列表
- **路径**: `GET /api/users/roles/`
- **描述**: 获取角色列表
- **查询参数**:
  - `page`: 页码
  - `page_size`: 每页数量
  - `name`: 角色名称筛选
  - `is_active`: 是否激活

### 创建角色
- **路径**: `POST /api/users/roles/`
- **描述**: 创建新角色
- **请求参数**:
```json
{
  "name": "仓库管理员",
  "description": "负责仓库日常管理",
  "is_active": true
}
```

### 更新角色权限
- **路径**: `POST /api/users/roles/{id}/permissions/`
- **描述**: 更新角色权限
- **请求参数**:
```json
{
  "permissions": [1, 2, 3, 4, 5]
}
```

### 获取权限列表
- **路径**: `GET /api/users/permissions/`
- **描述**: 获取权限列表

### 获取权限树
- **路径**: `GET /api/users/permissions/tree/`
- **描述**: 获取权限树结构

## 仓库管理

### 获取仓库列表
- **路径**: `GET /warehouse/warehouses/`
- **描述**: 获取仓库列表
- **查询参数**:
  - `search`: 搜索关键词
  - `status`: 状态筛选
- **响应格式**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "主仓库",
      "code": "WH001",
      "address": "北京市朝阳区",
      "manager": "张三",
      "contact": "13800138000",
      "status": "active",
      "area": 1000.0,
      "capacity": 10000,
      "description": "主要存储仓库"
    }
  ]
}
```

### 创建仓库
- **路径**: `POST /warehouse/warehouses/`
- **描述**: 创建新仓库
- **请求参数**:
```json
{
  "name": "新仓库",
  "code": "WH002",
  "address": "上海市浦东新区",
  "manager": "李四",
  "contact": "13900139000",
  "area": 800.0,
  "capacity": 8000,
  "description": "备用仓库"
}
```

### 库区管理
- **路径**: `GET /warehouse/zones/`
- **描述**: 获取库区列表
- **查询参数**:
  - `warehouse`: 仓库ID筛选

### 库位管理
- **路径**: `GET /warehouse/locations/`
- **描述**: 获取库位列表
- **查询参数**:
  - `warehouse`: 仓库ID
  - `zone`: 库区ID
  - `status`: 状态

## 商品管理

### 获取商品列表
- **路径**: `GET /products/products/` 或 `GET /api/products/`
- **描述**: 获取商品列表
- **查询参数**:
  - `page`: 页码
  - `page_size`: 每页数量
  - `search`: 搜索关键词
  - `category`: 分类筛选
- **响应格式**:
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "华为手机",
      "sku": "HUAWEI001",
      "isku": "X001X0001",
      "category": "电子产品",
      "brand": "华为",
      "unit": "台",
      "price": 2999.99,
      "stock": 100,
      "min_stock": 10,
      "status": "active",
      "barcode": "6901443123456",
      "description": "华为最新款手机",
      "specifications": "6.1寸屏幕, 128GB存储",
      "images": [],
      "attributes": []
    }
  ],
  "total": 100,
  "page": 1
}
```

### 创建商品
- **路径**: `POST /products/products/`
- **描述**: 创建新商品
- **请求参数**:
```json
{
  "name": "新商品",
  "sku": "PROD001",
  "category": "分类名称",
  "brand": "品牌名称",
  "unit": "台",
  "price": 1999.99,
  "min_stock": 5,
  "description": "商品描述"
}
```

### 获取商品分类
- **路径**: `GET /products/categories/`
- **描述**: 获取商品分类列表

### 供应商管理
- **路径**: `GET /products/suppliers/`
- **描述**: 获取供应商列表
- **查询参数**:
  - `search`: 搜索关键词
  - `status`: 状态筛选

### 品牌管理
- **路径**: `GET /products/brands/`
- **描述**: 获取品牌列表

## 库存管理

### 获取库存列表
- **路径**: `GET /api/inventory/stock/`
- **描述**: 获取库存列表
- **查询参数**:
  - `product_id`: 商品ID
  - `warehouse_id`: 仓库ID
  - `low_stock`: 是否低库存预警
- **响应格式**:
```json
{
  "results": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "华为手机",
      "warehouse_id": 1,
      "warehouse_name": "主仓库",
      "current_stock": 100,
      "available_stock": 85,
      "reserved_stock": 15,
      "qualified_stock": 100,
      "unqualified_stock": 0,
      "min_stock": 10,
      "unit": "台",
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 库存调整
- **路径**: `POST /api/inventory/stock/adjust/`
- **描述**: 库存调整
- **请求参数**:
```json
{
  "product_id": 1,
  "warehouse_id": 1,
  "quantity": 10,
  "type": "increase",
  "reason": "盘点调整",
  "operator": "admin"
}
```

### 库存转移
- **路径**: `POST /api/inventory/stock/transfer/`
- **描述**: 库存转移
- **请求参数**:
```json
{
  "product_id": 1,
  "from_warehouse": 1,
  "to_warehouse": 2,
  "quantity": 50,
  "reason": "调拨转移"
}
```

### 库存移动记录
- **路径**: `GET /api/inventory/movements/`
- **描述**: 获取库存移动记录
- **查询参数**:
  - `product_id`: 商品ID
  - `warehouse_id`: 仓库ID
  - `type`: 移动类型
  - `start_date`: 开始日期
  - `end_date`: 结束日期

### 库存预警
- **路径**: `GET /api/inventory/alerts/`
- **描述**: 获取库存预警列表
- **查询参数**:
  - `status`: 预警状态
  - `warehouse_id`: 仓库ID

### 处理预警
- **路径**: `POST /api/inventory/alerts/{id}/handle/`
- **描述**: 处理库存预警

### 盘点管理
- **路径**: `GET /api/inventory/count/`
- **描述**: 获取盘点任务列表

### 创建盘点
- **路径**: `POST /api/inventory/count/`
- **描述**: 创建盘点任务
- **请求参数**:
```json
{
  "name": "年度盘点",
  "warehouse_id": 1,
  "type": "full",
  "planned_date": "2024-01-31",
  "description": "年度全盘盘点"
}
```

### 开始盘点
- **路径**: `POST /api/inventory/count/{id}/start/`
- **描述**: 开始盘点任务

### 提交盘点
- **路径**: `POST /api/inventory/count/{id}/submit/`
- **描述**: 提交盘点结果

## 入库管理

### 获取入库单列表
- **路径**: `GET /inbound/purchase-orders/`
- **描述**: 获取入库单列表
- **查询参数**:
  - `status`: 状态筛选
  - `supplier_id`: 供应商ID
  - `start_date`: 开始日期
  - `end_date`: 结束日期

### 创建入库单
- **路径**: `POST /inbound/purchase-orders/`
- **描述**: 创建入库单
- **请求参数**:
```json
{
  "order_no": "PO202401150001",
  "supplier_id": 1,
  "warehouse_id": 1,
  "expected_date": "2024-01-20",
  "items": [
    {
      "product_id": 1,
      "quantity": 100,
      "unit_price": 2999.99
    }
  ],
  "remark": "采购入库"
}
```

### 开始收货
- **路径**: `POST /inbound/purchase-orders/{id}/start_receive/`
- **描述**: 开始收货流程

### 确认收货
- **路径**: `POST /inbound/purchase-orders/{id}/confirm_receive/`
- **描述**: 确认收货
- **请求参数**:
```json
{
  "items": [
    {
      "product_id": 1,
      "received_quantity": 95,
      "qualified_quantity": 95,
      "unqualified_quantity": 0,
      "location_id": 1
    }
  ]
}
```

### 退货管理
- **路径**: `GET /inbound/return-orders/`
- **描述**: 获取退货单列表

### 调拨入库
- **路径**: `GET /inbound/transfer-in/`
- **描述**: 获取调拨入库列表

## 出库管理

### 获取出库单列表
- **路径**: `GET /api/outbound/orders/`
- **描述**: 获取出库单列表
- **查询参数**:
  - `status`: 状态筛选
  - `customer_id`: 客户ID
  - `start_date`: 开始日期
  - `end_date`: 结束日期

### 创建出库单
- **路径**: `POST /api/outbound/orders/`
- **描述**: 创建出库单
- **请求参数**:
```json
{
  "order_no": "SO202401150001",
  "customer_id": 1,
  "warehouse_id": 1,
  "delivery_date": "2024-01-18",
  "items": [
    {
      "product_id": 1,
      "quantity": 10,
      "unit_price": 2999.99
    }
  ],
  "remark": "销售出库"
}
```

### 确认出库单
- **路径**: `POST /api/outbound/orders/{id}/confirm/`
- **描述**: 确认出库单

### 开始拣货
- **路径**: `POST /api/outbound/picking/{id}/start/`
- **描述**: 开始拣货任务

### 拣货扫码
- **路径**: `POST /api/outbound/picking/{id}/scan/`
- **描述**: 拣货扫码确认
- **请求参数**:
```json
{
  "barcode": "6901443123456",
  "location_id": 1,
  "quantity": 5
}
```

### 销售出库
- **路径**: `GET /api/outbound/sales/`
- **描述**: 获取销售出库列表

### 调拨出库
- **路径**: `GET /api/outbound/transfer/`
- **描述**: 获取调拨出库列表

## 报表分析

### 获取概览数据
- **路径**: `GET /api/reports/overview/`
- **描述**: 获取仪表板概览数据
- **响应格式**:
```json
{
  "total_products": 1500,
  "total_stock": 50000,
  "low_stock_alerts": 25,
  "pending_inbound": 15,
  "pending_outbound": 8,
  "warehouse_utilization": 75.5
}
```

### 入库报表
- **路径**: `GET /api/reports/inbound/`
- **描述**: 获取入库报表数据
- **查询参数**:
  - `start_date`: 开始日期
  - `end_date`: 结束日期
  - `warehouse_id`: 仓库ID

### 出库报表
- **路径**: `GET /api/reports/outbound/`
- **描述**: 获取出库报表数据

### 库存报表
- **路径**: `GET /api/reports/inventory/`
- **描述**: 获取库存报表数据

### 导出报表
- **路径**: `GET /api/reports/export/{type}/`
- **描述**: 导出报表文件
- **响应格式**: 二进制文件流（Excel/CSV）

### 仓库利用率
- **路径**: `GET /api/reports/warehouse_utilization/`
- **描述**: 获取仓库利用率统计

### 商品周转率
- **路径**: `GET /api/reports/product_turnover/`
- **描述**: 获取商品周转率分析

## 系统管理

### 系统设置
- **路径**: `GET /api/system/settings/`
- **描述**: 获取系统设置

### 更新设置
- **路径**: `PUT /api/system/settings/`
- **描述**: 更新系统设置

### 系统日志
- **路径**: `GET /api/system/logs/`
- **描述**: 获取系统日志
- **查询参数**:
  - `level`: 日志级别
  - `start_date`: 开始日期
  - `end_date`: 结束日期

### 操作日志
- **路径**: `GET /api/system/operation_logs/`
- **描述**: 获取操作日志

### 登录日志
- **路径**: `GET /api/system/login_logs/`
- **描述**: 获取登录日志

### 系统监控
- **路径**: `GET /api/system/monitor/status/`
- **描述**: 获取系统状态
- **响应格式**:
```json
{
  "server_status": "running",
  "database_status": "connected",
  "memory_usage": 65.5,
  "cpu_usage": 25.8,
  "disk_usage": 45.2,
  "uptime": "5 days, 12:30:45"
}
```

### 数据备份
- **路径**: `GET /api/system/backup/`
- **描述**: 获取备份列表

### 创建备份
- **路径**: `POST /api/system/backup/`
- **描述**: 创建数据备份

### 系统维护
- **路径**: `POST /api/system/maintenance/clear_cache/`
- **描述**: 清理系统缓存

### 通知管理
- **路径**: `GET /api/system/notifications/`
- **描述**: 获取系统通知

## 测试接口

### 健康检查
- **路径**: `GET /`
- **描述**: API健康检查
- **响应格式**:
```json
{
  "status": "ok",
  "message": "WMS API服务正常运行",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### API信息
- **路径**: `GET /api/`
- **描述**: 获取API基本信息
- **响应格式**:
```json
{
  "name": "小神龙WMS API",
  "version": "1.0.0",
  "description": "仓库管理系统API接口"
}
```

### 受保护接口测试
- **路径**: `GET /api/test/protected/`
- **描述**: 测试JWT认证是否正常
- **响应格式**:
```json
{
  "protected": true,
  "user": "admin",
  "message": "认证成功"
}
```

### GET请求测试
- **路径**: `GET /api/test/get/`
- **描述**: 测试GET请求
- **查询参数**: 任意参数
- **响应格式**:
```json
{
  "method": "GET",
  "params": {...},
  "message": "GET请求测试成功"
}
```

### POST请求测试
- **路径**: `POST /api/test/post/`
- **描述**: 测试POST请求
- **请求参数**: 任意JSON数据
- **响应格式**:
```json
{
  "method": "POST",
  "data": {...},
  "message": "POST请求测试成功"
}
```

## 错误码说明

### HTTP状态码
- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权（需要登录）
- `403`: 禁止访问（权限不足）
- `404`: 资源不存在
- `500`: 服务器内部错误

### 业务错误码
```json
{
  "success": false,
  "error_code": "INVALID_STOCK",
  "error": "库存不足",
  "details": {
    "product_id": 1,
    "available": 5,
    "required": 10
  }
}
```

## 数据模型说明

### 用户模型
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "管理员",
  "last_name": "",
  "is_active": true,
  "role": "admin",
  "permissions": [],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 商品模型
```json
{
  "id": 1,
  "name": "华为手机",
  "sku": "HUAWEI001",
  "isku": "X001X0001",
  "category": "电子产品",
  "brand": "华为",
  "unit": "台",
  "price": 2999.99,
  "cost": 2500.00,
  "min_stock": 10,
  "max_stock": 1000,
  "status": "active",
  "barcode": "6901443123456",
  "description": "华为最新款手机",
  "specifications": "6.1寸屏幕, 128GB存储",
  "weight": 0.2,
  "dimensions": "15x7x0.8",
  "images": [],
  "attributes": [],
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 库存模型
```json
{
  "id": 1,
  "product_id": 1,
  "warehouse_id": 1,
  "location_id": 1,
  "current_stock": 100,
  "available_stock": 85,
  "reserved_stock": 15,
  "qualified_stock": 100,
  "unqualified_stock": 0,
  "frozen_stock": 0,
  "cost_price": 2500.00,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

## 注意事项

1. **认证要求**: 除了公开接口（如登录、健康检查），所有接口都需要在请求头中包含JWT令牌：
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   ```

2. **分页格式**: 列表接口统一使用Django REST framework的分页格式：
   ```json
   {
     "count": 100,
     "next": "http://example.com/api/products/?page=2",
     "previous": null,
     "results": [...]
   }
   ```

3. **时间格式**: 所有时间字段使用ISO 8601格式：`2024-01-15T10:30:00Z`

4. **文件上传**: 文件上传使用`multipart/form-data`格式

5. **批量操作**: 支持批量操作的接口通常有对应的`batch_`前缀

6. **软删除**: 大部分资源支持软删除，删除后状态变为`inactive`而不是物理删除

7. **降级策略**: 前端实现了API失败时的本地数据降级策略，确保系统可用性

## 更新日志

- **v1.0.0** (2024-01-15): 初始版本，包含所有核心功能接口
- 支持完整的仓库管理业务流程
- 实现JWT认证和权限控制
- 提供丰富的报表和分析功能
- 支持移动端扫码操作

---

**文档维护**: 请在API变更时及时更新此文档
**技术支持**: 如有疑问请联系开发团队