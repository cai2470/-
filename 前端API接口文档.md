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
- **响应格式**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 验证令牌
- **路径**: `POST /api/auth/verify/`
- **描述**: 验证访问令牌是否有效
- **请求参数**:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
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
- **请求参数**:
```json
{
  "username": "updateuser",
  "email": "update@example.com",
  "first_name": "更新用户",
  "role": "manager",
  "is_active": true
}
```

### 删除用户
- **路径**: `DELETE /users/users/{id}/`
- **描述**: 删除用户

### 修改密码
- **路径**: `POST /users/change-password/`
- **描述**: 修改用户密码
- **请求参数**:
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass456",
  "confirm_password": "newpass456"
}
```

### 获取登录日志
- **路径**: `GET /users/login-logs/`
- **描述**: 获取用户登录日志
- **查询参数**:
  - `page`: 页码
  - `page_size`: 每页数量
  - `username`: 用户名筛选
  - `start_date`: 开始日期
  - `end_date`: 结束日期

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
- **响应格式**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "用户管理",
      "code": "user",
      "children": [
        {
          "id": 2,
          "name": "查看用户",
          "code": "user.view",
          "children": []
        },
        {
          "id": 3,
          "name": "创建用户",
          "code": "user.create",
          "children": []
        }
      ]
    }
  ]
}
```

### 按模块获取权限
- **路径**: `GET /api/users/permissions/by_module/`
- **描述**: 按模块获取权限列表
- **查询参数**:
  - `module`: 模块名称

### 同步权限
- **路径**: `POST /api/users/permissions/sync/`
- **描述**: 从Django模型同步权限到数据库

### 更新角色权限
- **路径**: `POST /api/users/roles/{id}/permissions/`
- **描述**: 更新角色的权限分配
- **请求参数**:
```json
{
  "permissions": [1, 2, 3, 4, 5]
}
```

### 获取角色权限
- **路径**: `GET /api/users/roles/{id}/permissions/`
- **描述**: 获取角色的权限列表

### 批量删除角色
- **路径**: `POST /api/users/roles/batch_delete/`
- **描述**: 批量删除角色
- **请求参数**:
```json
{
  "ids": [1, 2, 3]
}
```

### 批量更新角色状态
- **路径**: `POST /api/users/roles/batch_update_status/`
- **描述**: 批量更新角色激活状态
- **请求参数**:
```json
{
  "ids": [1, 2, 3],
  "is_active": true
}
```

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
  - `search`: 搜索关键词
  - `status`: 状态筛选
- **响应格式**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "A区",
      "code": "A001",
      "warehouse_id": 1,
      "warehouse_name": "主仓库",
      "type": "storage",
      "status": "active",
      "area": 500.0,
      "capacity": 5000,
      "description": "主存储区域"
    }
  ]
}
```

### 创建库区
- **路径**: `POST /warehouse/zones/`
- **描述**: 创建新库区
- **请求参数**:
```json
{
  "name": "B区",
  "code": "B001",
  "warehouse_id": 1,
  "type": "storage",
  "area": 300.0,
  "capacity": 3000,
  "description": "备用存储区域"
}
```

### 更新库区
- **路径**: `PUT /warehouse/zones/{id}/`
- **描述**: 更新库区信息

### 删除库区
- **路径**: `DELETE /warehouse/zones/{id}/`
- **描述**: 删除库区

### 库位管理
- **路径**: `GET /warehouse/locations/`
- **描述**: 获取库位列表
- **查询参数**:
  - `warehouse`: 仓库ID
  - `zone`: 库区ID
  - `status`: 状态
  - `search`: 搜索关键词
- **响应格式**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "A01-01-01",
      "code": "A010101",
      "warehouse_id": 1,
      "zone_id": 1,
      "type": "shelf",
      "status": "available",
      "capacity": 100,
      "current_stock": 85,
      "x_coordinate": 1,
      "y_coordinate": 1,
      "z_coordinate": 1
    }
  ]
}
```

### 创建库位
- **路径**: `POST /warehouse/locations/`
- **描述**: 创建新库位
- **请求参数**:
```json
{
  "name": "A01-01-02",
  "code": "A010102",
  "warehouse_id": 1,
  "zone_id": 1,
  "type": "shelf",
  "capacity": 100,
  "x_coordinate": 1,
  "y_coordinate": 1,
  "z_coordinate": 2
}
```

### 更新库位
- **路径**: `PUT /warehouse/locations/{id}/`
- **描述**: 更新库位信息

### 删除库位
- **路径**: `DELETE /warehouse/locations/{id}/`
- **描述**: 删除库位

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
- **查询参数**:
  - `page`: 页码
  - `page_size`: 每页数量
  - `search`: 搜索关键词
  - `parent`: 父分类ID
- **响应格式**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "电子产品",
      "code": "ELECTRONICS",
      "parent_id": null,
      "level": 1,
      "sort_order": 1,
      "is_active": true,
      "children": [
        {
          "id": 2,
          "name": "手机",
          "code": "MOBILE",
          "parent_id": 1,
          "level": 2,
          "sort_order": 1,
          "is_active": true
        }
      ]
    }
  ]
}
```

### 创建商品分类
- **路径**: `POST /products/categories/`
- **描述**: 创建新的商品分类
- **请求参数**:
```json
{
  "name": "新分类",
  "code": "NEW_CATEGORY",
  "parent_id": 1,
  "sort_order": 1,
  "description": "分类描述"
}
```

### 更新商品分类
- **路径**: `PUT /products/categories/{id}/`
- **描述**: 更新商品分类信息

### 删除商品分类
- **路径**: `DELETE /products/categories/{id}/`
- **描述**: 删除商品分类

### 供应商管理
- **路径**: `GET /products/suppliers/`
- **描述**: 获取供应商列表
- **查询参数**:
  - `page`: 页码
  - `page_size`: 每页数量
  - `search`: 搜索关键词
  - `status`: 状态筛选
- **响应格式**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "华为供应商",
      "code": "SUP001",
      "contact_person": "张三",
      "phone": "13800138000",
      "email": "zhangsan@huawei.com",
      "address": "深圳市南山区",
      "status": "active",
      "credit_level": "A",
      "payment_terms": "月结30天"
    }
  ]
}
```

### 创建供应商
- **路径**: `POST /products/suppliers/`
- **描述**: 创建新供应商
- **请求参数**:
```json
{
  "name": "新供应商",
  "code": "SUP002",
  "contact_person": "李四",
  "phone": "13900139000",
  "email": "lisi@supplier.com",
  "address": "北京市朝阳区",
  "credit_level": "B",
  "payment_terms": "货到付款"
}
```

### 更新供应商
- **路径**: `PUT /products/suppliers/{id}/`
- **描述**: 更新供应商信息

### 删除供应商
- **路径**: `DELETE /products/suppliers/{id}/`
- **描述**: 删除供应商

### 品牌管理
- **路径**: `GET /products/brands/`
- **描述**: 获取品牌列表
- **查询参数**:
  - `page`: 页码
  - `page_size`: 每页数量
  - `search`: 搜索关键词
  - `status`: 状态筛选
- **响应格式**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "华为",
      "code": "HUAWEI",
      "logo": "/media/brands/huawei.png",
      "description": "华为技术有限公司",
      "website": "https://www.huawei.com",
      "status": "active"
    }
  ]
}
```

### 创建品牌
- **路径**: `POST /products/brands/`
- **描述**: 创建新品牌
- **请求参数**:
```json
{
  "name": "小米",
  "code": "XIAOMI",
  "description": "小米科技有限公司",
  "website": "https://www.mi.com"
}
```

### 更新品牌
- **路径**: `PUT /products/brands/{id}/`
- **描述**: 更新品牌信息

### 删除品牌
- **路径**: `DELETE /products/brands/{id}/`
- **描述**: 删除品牌

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
  "location_id": 1,
  "quantity": 10,
  "type": "increase",
  "reason": "盘点调整",
  "operator": "admin",
  "remark": "盘点发现差异"
}
```

### 批量库存调整
- **路径**: `POST /api/inventory/stock/batch_adjust/`
- **描述**: 批量库存调整
- **请求参数**:
```json
{
  "items": [
    {
      "product_id": 1,
      "warehouse_id": 1,
      "quantity": 10,
      "type": "increase",
      "reason": "盘点调整"
    },
    {
      "product_id": 2,
      "warehouse_id": 1,
      "quantity": 5,
      "type": "decrease",
      "reason": "损耗"
    }
  ],
  "operator": "admin"
}
```

### 库存预留
- **路径**: `POST /api/inventory/stock/reserve/`
- **描述**: 库存预留（为出库单预留库存）
- **请求参数**:
```json
{
  "product_id": 1,
  "warehouse_id": 1,
  "quantity": 20,
  "order_no": "SO202401150001",
  "expires_at": "2024-01-20T10:00:00Z"
}
```

### 取消库存预留
- **路径**: `POST /api/inventory/stock/unreserve/`
- **描述**: 取消库存预留
- **请求参数**:
```json
{
  "product_id": 1,
  "warehouse_id": 1,
  "quantity": 20,
  "order_no": "SO202401150001"
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
  "from_location": 1,
  "to_location": 5,
  "quantity": 50,
  "reason": "调拨转移",
  "operator": "manager"
}
```

### 获取库存统计
- **路径**: `GET /api/inventory/stock/stats/`
- **描述**: 获取库存统计信息
- **查询参数**:
  - `warehouse_id`: 仓库ID
  - `category_id`: 分类ID
- **响应格式**:
```json
{
  "total_products": 1500,
  "total_stock": 50000,
  "total_value": 15000000.00,
  "low_stock_count": 25,
  "zero_stock_count": 8,
  "overstock_count": 12
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
- **请求参数**:
```json
{
  "action": "handled",
  "remark": "已安排补货",
  "handler": "admin"
}
```

### 忽略预警
- **路径**: `POST /api/inventory/alerts/{id}/ignore/`
- **描述**: 忽略库存预警
- **请求参数**:
```json
{
  "reason": "暂时不需要补货"
}
```

### 批量处理预警
- **路径**: `POST /api/inventory/alerts/batch_handle/`
- **描述**: 批量处理库存预警
- **请求参数**:
```json
{
  "ids": [1, 2, 3],
  "action": "handled",
  "remark": "批量处理预警"
}
```

### 获取预警统计
- **路径**: `GET /api/inventory/alerts/stats/`
- **描述**: 获取库存预警统计
- **响应格式**:
```json
{
  "total": 50,
  "new": 15,
  "handled": 30,
  "ignored": 5,
  "by_type": {
    "low_stock": 25,
    "zero_stock": 10,
    "overstock": 15
  }
}
```

### 盘点管理
- **路径**: `GET /api/inventory/count/`
- **描述**: 获取盘点任务列表
- **查询参数**:
  - `status`: 状态筛选
  - `warehouse_id`: 仓库ID
  - `start_date`: 开始日期
  - `end_date`: 结束日期

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
  "description": "年度全盘盘点",
  "items": [
    {
      "product_id": 1,
      "location_id": 1,
      "expected_quantity": 100
    }
  ]
}
```

### 开始盘点
- **路径**: `POST /api/inventory/count/{id}/start/`
- **描述**: 开始盘点任务

### 完成盘点
- **路径**: `POST /api/inventory/count/{id}/complete/`
- **描述**: 完成盘点任务

### 提交盘点
- **路径**: `POST /api/inventory/count/{id}/submit/`
- **描述**: 提交盘点结果
- **请求参数**:
```json
{
  "items": [
    {
      "product_id": 1,
      "location_id": 1,
      "expected_quantity": 100,
      "actual_quantity": 95,
      "difference": -5,
      "remark": "损耗"
    }
  ]
}
```

### 审核盘点
- **路径**: `POST /api/inventory/count/{id}/review/`
- **描述**: 审核盘点结果
- **请求参数**:
```json
{
  "status": "approved",
  "remark": "审核通过",
  "reviewer": "manager"
}
```

### 盘点扫码
- **路径**: `POST /api/inventory/count/{id}/scan/`
- **描述**: 盘点扫码确认
- **请求参数**:
```json
{
  "barcode": "6901443123456",
  "location_code": "A01-01-01",
  "quantity": 10
}
```

### 获取盘点明细
- **路径**: `GET /api/inventory/count/{id}/items/`
- **描述**: 获取盘点任务的明细项目

### 更新盘点明细
- **路径**: `PUT /api/inventory/count/{count_id}/items/{item_id}/`
- **描述**: 更新盘点明细项目

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
      "location_id": 1,
      "batch_no": "BATCH001",
      "production_date": "2024-01-10",
      "expiry_date": "2025-01-10"
    }
  ],
  "inspector": "quality_manager",
  "inspect_date": "2024-01-16"
}
```

### 入库完成
- **路径**: `POST /inbound/purchase-orders/{id}/complete/`
- **描述**: 入库完成

### 取消入库单
- **路径**: `POST /inbound/purchase-orders/{id}/cancel/`
- **描述**: 取消入库单
- **请求参数**:
```json
{
  "reason": "供应商取消订单"
}
```

### 退货管理
- **路径**: `GET /inbound/return-orders/`
- **描述**: 获取退货单列表
- **查询参数**:
  - `status`: 状态筛选
  - `supplier_id`: 供应商ID
  - `start_date`: 开始日期
  - `end_date`: 结束日期

### 创建退货单
- **路径**: `POST /inbound/return-orders/`
- **描述**: 创建退货单
- **请求参数**:
```json
{
  "return_no": "RT202401150001",
  "supplier_id": 1,
  "warehouse_id": 1,
  "reason": "质量问题",
  "items": [
    {
      "product_id": 1,
      "quantity": 5,
      "reason": "产品损坏"
    }
  ]
}
```

### 确认退货
- **路径**: `POST /inbound/return-orders/{id}/confirm/`
- **描述**: 确认退货出库

### 调拨入库
- **路径**: `GET /inbound/transfer-in/`
- **描述**: 获取调拨入库列表
- **查询参数**:
  - `status`: 状态筛选
  - `from_warehouse`: 来源仓库ID
  - `to_warehouse`: 目标仓库ID

### 创建调拨入库
- **路径**: `POST /inbound/transfer-in/`
- **描述**: 创建调拨入库单
- **请求参数**:
```json
{
  "transfer_no": "TI202401150001",
  "from_warehouse": 1,
  "to_warehouse": 2,
  "items": [
    {
      "product_id": 1,
      "quantity": 30,
      "from_location": 1,
      "to_location": 5
    }
  ],
  "reason": "库存调配"
}
```

### 确认调拨入库
- **路径**: `POST /inbound/transfer-in/{id}/confirm/`
- **描述**: 确认调拨入库

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
  "quantity": 5,
  "picker": "operator1"
}
```

### 完成拣货
- **路径**: `POST /api/outbound/picking/{id}/complete/`
- **描述**: 完成拣货任务
- **请求参数**:
```json
{
  "items": [
    {
      "product_id": 1,
      "location_id": 1,
      "picked_quantity": 10,
      "batch_no": "BATCH001"
    }
  ]
}
```

### 销售出库
- **路径**: `GET /api/outbound/sales/`
- **描述**: 获取销售出库列表
- **查询参数**:
  - `status`: 状态筛选
  - `customer_id`: 客户ID
  - `start_date`: 开始日期
  - `end_date`: 结束日期

### 创建销售出库
- **路径**: `POST /api/outbound/sales/`
- **描述**: 创建销售出库单
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
  "shipping_address": "北京市朝阳区xxx街道xxx号",
  "contact_person": "张先生",
  "contact_phone": "13800138000"
}
```

### 获取销售统计
- **路径**: `GET /api/outbound/sales/stats/`
- **描述**: 获取销售出库统计
- **查询参数**:
  - `start_date`: 开始日期
  - `end_date`: 结束日期

### 调拨出库
- **路径**: `GET /api/outbound/transfer/`
- **描述**: 获取调拨出库列表
- **查询参数**:
  - `status`: 状态筛选
  - `from_warehouse`: 来源仓库ID
  - `to_warehouse`: 目标仓库ID

### 创建调拨出库
- **路径**: `POST /api/outbound/transfer/`
- **描述**: 创建调拨出库单
- **请求参数**:
```json
{
  "transfer_no": "TO202401150001",
  "from_warehouse": 1,
  "to_warehouse": 2,
  "items": [
    {
      "product_id": 1,
      "quantity": 20,
      "from_location": 1
    }
  ],
  "reason": "库存调配"
}
```

### 确认调拨出库
- **路径**: `POST /api/outbound/transfer/{id}/confirm/`
- **描述**: 确认调拨出库

### 出库明细管理
- **路径**: `GET /api/outbound/items/`
- **描述**: 获取出库明细列表
- **查询参数**:
  - `order_id`: 出库单ID
  - `product_id`: 商品ID

### 添加出库明细
- **路径**: `POST /api/outbound/items/`
- **描述**: 添加出库明细项目

### 更新出库明细
- **路径**: `PUT /api/outbound/items/{id}/`
- **描述**: 更新出库明细项目

### 删除出库明细
- **路径**: `DELETE /api/outbound/items/{id}/`
- **描述**: 删除出库明细项目

### 批量确认出库
- **路径**: `POST /api/outbound/orders/batch_confirm/`
- **描述**: 批量确认出库单
- **请求参数**:
```json
{
  "ids": [1, 2, 3]
}
```

### 批量取消出库
- **路径**: `POST /api/outbound/orders/batch_cancel/`
- **描述**: 批量取消出库单
- **请求参数**:
```json
{
  "ids": [1, 2, 3],
  "reason": "客户取消订单"
}
```

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
- **查询参数**:
  - `start_date`: 开始日期
  - `end_date`: 结束日期
  - `warehouse_id`: 仓库ID

### 获取趋势数据
- **路径**: `GET /api/reports/trend/`
- **描述**: 获取业务趋势数据
- **查询参数**:
  - `type`: 趋势类型（inbound/outbound/inventory）
  - `start_date`: 开始日期
  - `end_date`: 结束日期
  - `period`: 时间周期（day/week/month）

### 获取排行数据
- **路径**: `GET /api/reports/ranking/`
- **描述**: 获取排行榜数据
- **查询参数**:
  - `type`: 排行类型（product/customer/supplier）
  - `metric`: 排行指标（quantity/amount/frequency）
  - `start_date`: 开始日期
  - `end_date`: 结束日期
  - `limit`: 返回数量限制

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

### 获取性能指标
- **路径**: `GET /api/system/monitor/metrics/`
- **描述**: 获取系统性能指标
- **查询参数**:
  - `start_time`: 开始时间
  - `end_time`: 结束时间

### 获取数据库状态
- **路径**: `GET /api/system/monitor/database/`
- **描述**: 获取数据库连接状态

### 获取存储状态
- **路径**: `GET /api/system/monitor/storage/`
- **描述**: 获取存储空间状态

### 清理日志
- **路径**: `POST /api/system/logs/clean/`
- **描述**: 清理系统日志
- **请求参数**:
```json
{
  "days": 30,
  "level": "INFO"
}
```

### 导出日志
- **路径**: `GET /api/system/logs/export/`
- **描述**: 导出系统日志
- **响应格式**: 文件下载

### 获取日志统计
- **路径**: `GET /api/system/logs/stats/`
- **描述**: 获取日志统计信息

### 导出操作日志
- **路径**: `GET /api/system/operation_logs/export/`
- **描述**: 导出操作日志

### 获取登录统计
- **路径**: `GET /api/system/login_logs/stats/`
- **描述**: 获取登录统计信息

### 导出登录日志
- **路径**: `GET /api/system/login_logs/export/`
- **描述**: 导出登录日志

### 下载备份
- **路径**: `GET /api/system/backup/{id}/download/`
- **描述**: 下载备份文件

### 恢复备份
- **路径**: `POST /api/system/backup/{id}/restore/`
- **描述**: 恢复数据备份

### 开启维护模式
- **路径**: `POST /api/system/maintenance/enable/`
- **描述**: 开启系统维护模式
- **请求参数**:
```json
{
  "reason": "系统升级",
  "estimated_duration": 120
}
```

### 关闭维护模式
- **路径**: `POST /api/system/maintenance/disable/`
- **描述**: 关闭系统维护模式

### 重建索引
- **路径**: `POST /api/system/maintenance/rebuild_index/`
- **描述**: 重建数据库索引

### 优化数据库
- **路径**: `POST /api/system/maintenance/optimize_db/`
- **描述**: 优化数据库性能

### 系统配置管理
- **路径**: `GET /api/system/config/`
- **描述**: 获取系统配置列表

### 获取配置详情
- **路径**: `GET /api/system/config/{key}/`
- **描述**: 获取指定配置项

### 更新配置
- **路径**: `PUT /api/system/config/{key}/`
- **描述**: 更新配置项
- **请求参数**:
```json
{
  "value": "new_value",
  "description": "配置描述"
}
```

### 批量更新配置
- **路径**: `POST /api/system/config/batch_update/`
- **描述**: 批量更新配置项

### 重置配置
- **路径**: `POST /api/system/config/{key}/reset/`
- **描述**: 重置配置项为默认值

### 获取版本信息
- **路径**: `GET /api/system/info/version/`
- **描述**: 获取系统版本信息

### 检查更新
- **路径**: `GET /api/system/info/check_update/`
- **描述**: 检查系统更新

### 通知管理
- **路径**: `GET /api/system/notifications/`
- **描述**: 获取系统通知
- **查询参数**:
  - `status`: 通知状态
  - `type`: 通知类型
  - `start_date`: 开始日期
  - `end_date`: 结束日期

### 创建通知
- **路径**: `POST /api/system/notifications/`
- **描述**: 创建系统通知
- **请求参数**:
```json
{
  "title": "系统维护通知",
  "content": "系统将于今晚10点进行维护",
  "type": "system",
  "priority": "high",
  "target_users": [1, 2, 3]
}
```

### 标记通知已读
- **路径**: `POST /api/system/notifications/{id}/read/`
- **描述**: 标记通知为已读

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

## 后端实现建议

### 技术栈推荐
- **框架**: Django + Django REST Framework
- **数据库**: PostgreSQL (推荐) 或 MySQL
- **缓存**: Redis
- **消息队列**: Celery + Redis
- **文件存储**: 本地存储 或 云存储(OSS/S3)

### 数据库设计要点
1. **用户权限表**: users, roles, permissions, user_roles, role_permissions
2. **仓库相关表**: warehouses, zones, locations
3. **商品相关表**: products, categories, brands, suppliers
4. **库存相关表**: inventory_stock, inventory_movements, inventory_alerts
5. **业务单据表**: inbound_orders, outbound_orders, transfer_orders
6. **系统管理表**: system_logs, operation_logs, notifications

### 核心功能实现
1. **JWT认证**: 使用djangorestframework-simplejwt
2. **权限控制**: 基于角色的权限控制(RBAC)
3. **分页**: 使用DRF的PageNumberPagination
4. **文件上传**: 支持图片和文档上传
5. **数据导出**: 支持Excel和CSV格式导出
6. **实时通知**: WebSocket或长轮询实现

### API接口标准
1. **RESTful设计**: 遵循REST API设计规范
2. **统一响应格式**: 
   ```json
   {
     "success": true,
     "data": {},
     "message": "操作成功",
     "code": 200
   }
   ```
3. **错误处理**: 统一的错误码和错误信息
4. **API版本控制**: 使用URL路径版本控制
5. **API文档**: 使用Swagger/OpenAPI自动生成

### 性能优化
1. **数据库优化**: 合理设计索引，避免N+1查询
2. **缓存策略**: 缓存热点数据和查询结果
3. **分页加载**: 大数据量列表使用分页
4. **异步任务**: 耗时操作使用异步处理
5. **CDN加速**: 静态资源使用CDN

### 安全考虑
1. **输入验证**: 严格验证所有输入参数
2. **SQL注入防护**: 使用ORM，避免拼接SQL
3. **CSRF防护**: 启用CSRF保护
4. **XSS防护**: 过滤和转义用户输入
5. **敏感数据**: 密码等敏感信息加密存储

### 部署建议
1. **容器化**: 使用Docker进行容器化部署
2. **负载均衡**: 使用Nginx做反向代理和负载均衡
3. **数据备份**: 定期备份数据库
4. **监控告警**: 部署监控系统
5. **日志管理**: 集中化日志管理

## 更新日志

- **v1.1.0** (2024-01-16): 完善版本，新增详细接口定义
  - 补充所有CRUD接口的请求参数和响应格式
  - 新增批量操作、扫码、审核等业务接口
  - 完善库存管理、盘点、预警等复杂业务流程
  - 新增系统监控、配置管理、通知等系统级接口
  - 提供后端实现建议和技术栈推荐

- **v1.0.0** (2024-01-15): 初始版本，包含所有核心功能接口
  - 支持完整的仓库管理业务流程
  - 实现JWT认证和权限控制
  - 提供丰富的报表和分析功能
  - 支持移动端扫码操作

---

**文档维护**: 请在API变更时及时更新此文档  
**技术支持**: 如有疑问请联系开发团队  
**GitHub仓库**: [小神龙WMS前端](https://github.com/xiaoshenlong/wms-frontend)  
**演示地址**: http://localhost:3000 (演示账户: admin/admin123)