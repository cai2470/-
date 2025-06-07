# 小神龙仓库管理系统 - Django+MongoDB后端开发提示词

## 项目概述

请基于已有的Vue 3前端仓库管理系统，开发一个使用Django + MongoDB的后端API服务。系统主要用于仓库商品管理、库存管理、进出库管理等功能。

### 技术栈要求
- **后端框架**: Django 4.2+ 
- **数据库**: MongoDB (使用 mongoengine ORM)
- **认证**: JWT Token (使用 djangorestframework-simplejwt)
- **API框架**: Django REST Framework
- **文档**: drf-yasg (Swagger文档)
- **跨域**: django-cors-headers
- **图片处理**: Pillow
- **文件存储**: 本地存储或云存储

## 核心功能模块

### 1. 用户认证与权限管理
- JWT Token认证（Access Token + Refresh Token）
- 用户注册、登录、登出
- 权限分级：超级管理员、管理员、操作员、只读用户
- 用户信息管理

### 2. 商品管理模块
- 商品基础信息CRUD
- 商品分类管理
- 品牌管理
- 供应商管理
- 商品图片上传和管理
- 商品属性动态配置
- 批量导入/导出(Excel/CSV)

### 3. 库存管理模块
- 实时库存查询
- 库存调整记录
- 最低库存预警
- 库存盘点功能
- 库存变动历史

### 4. 入库管理模块
- 入库单创建和管理
- 入库审批流程
- 入库商品验收
- 入库单据打印

### 5. 出库管理模块
- 出库单创建和管理
- 出库审批流程
- 出库商品确认
- 出库单据打印

### 6. 质量管理模块
- 质检标准配置
- 质检记录管理
- 不合格品处理
- 质检报告生成

### 7. 报表统计模块
- 库存报表
- 进出库统计
- 商品流转分析
- 预警报表

## 数据库模型设计

### 用户相关模型
```python
# 用户模型
class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    role = models.CharField(choices=ROLE_CHOICES)
    department = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 商品相关模型
```python
# 商品分类
class Category(Document):
    name = StringField(required=True, unique=True)
    parent = ReferenceField('self')
    description = StringField()
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.now)

# 品牌
class Brand(Document):
    name = StringField(required=True, unique=True)
    description = StringField()
    logo = StringField()
    is_active = BooleanField(default=True)

# 供应商
class Supplier(Document):
    name = StringField(required=True)
    code = StringField(required=True, unique=True)
    contact_person = StringField()
    phone = StringField()
    email = StringField()
    address = StringField()
    is_active = BooleanField(default=True)

# 商品
class Product(Document):
    code = StringField(required=True, unique=True)  # 商品编码
    isku = StringField()  # iSKU编码
    name = StringField(required=True)  # 商品名称
    category = ReferenceField(Category, required=True)
    brand = ReferenceField(Brand)
    supplier = ReferenceField(Supplier)
    unit = StringField(required=True)  # 单位
    price = DecimalField(min_value=0)  # 单价
    cost = DecimalField(min_value=0)  # 成本价
    min_stock = IntField(default=10)  # 最低库存
    description = StringField()  # 商品描述
    specifications = StringField()  # 规格说明
    barcode = StringField()  # 条形码
    images = ListField(StringField())  # 图片列表
    attributes = ListField(DictField())  # 商品属性
    status = StringField(choices=STATUS_CHOICES, default='active')
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)
```

### 库存相关模型
```python
# 库存
class Inventory(Document):
    product = ReferenceField(Product, required=True)
    warehouse = ReferenceField(Warehouse)
    quantity = IntField(default=0)  # 当前库存
    reserved_quantity = IntField(default=0)  # 预留库存
    available_quantity = IntField(default=0)  # 可用库存
    updated_at = DateTimeField(default=datetime.now)

# 库存变动记录
class InventoryTransaction(Document):
    product = ReferenceField(Product, required=True)
    transaction_type = StringField(choices=TRANSACTION_TYPES)  # 入库/出库/调整
    quantity = IntField(required=True)  # 变动数量（正数入库，负数出库）
    reference_id = StringField()  # 关联单据ID
    reason = StringField()  # 变动原因
    operator = ReferenceField('User')
    created_at = DateTimeField(default=datetime.now)
```

## API接口设计

### 认证接口
```
POST /api/auth/login/          # 用户登录
POST /api/auth/refresh/        # 刷新Token
POST /api/auth/logout/         # 用户登出
GET  /api/auth/me/            # 获取当前用户信息
```

### 商品管理接口
```
GET    /api/products/                    # 获取商品列表
POST   /api/products/                    # 创建商品
GET    /api/products/{id}/               # 获取商品详情
PUT    /api/products/{id}/               # 更新商品
DELETE /api/products/{id}/               # 删除商品
POST   /api/products/import/             # 批量导入商品
GET    /api/products/export/             # 导出商品数据
POST   /api/products/{id}/upload-image/  # 上传商品图片
```

### 分类管理接口
```
GET    /api/categories/        # 获取分类列表
POST   /api/categories/        # 创建分类
PUT    /api/categories/{id}/   # 更新分类
DELETE /api/categories/{id}/   # 删除分类
```

### 库存管理接口
```
GET    /api/inventory/                    # 获取库存列表
GET    /api/inventory/product/{id}/       # 获取指定商品库存
POST   /api/inventory/adjust/             # 库存调整
GET    /api/inventory/transactions/       # 库存变动记录
GET    /api/inventory/low-stock/          # 低库存预警
```

### 入库管理接口
```
GET    /api/inbound/           # 获取入库单列表
POST   /api/inbound/           # 创建入库单
GET    /api/inbound/{id}/      # 获取入库单详情
PUT    /api/inbound/{id}/      # 更新入库单
POST   /api/inbound/{id}/confirm/  # 确认入库
```

### 出库管理接口
```
GET    /api/outbound/          # 获取出库单列表
POST   /api/outbound/          # 创建出库单
GET    /api/outbound/{id}/     # 获取出库单详情
PUT    /api/outbound/{id}/     # 更新出库单
POST   /api/outbound/{id}/confirm/  # 确认出库
```

## 项目结构要求

```
xiaoshenlong_wms_backend/
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── __init__.py
│   ├── authentication/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── products/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── utils.py
│   ├── inventory/
│   ├── inbound/
│   ├── outbound/
│   ├── quality/
│   └── reports/
├── utils/
│   ├── __init__.py
│   ├── pagination.py
│   ├── permissions.py
│   ├── exceptions.py
│   └── helpers.py
├── media/
├── static/
├── requirements.txt
├── manage.py
└── README.md
```

## 具体实现要求

### 1. 认证与权限
- 使用JWT Token认证
- 实现Role-Based Access Control (RBAC)
- 支持Token自动刷新
- 记录用户操作日志

### 2. 数据验证
- 使用DRF Serializers进行数据验证
- 商品编码唯一性验证
- 库存数量不能为负数
- 图片文件格式和大小限制

### 3. 错误处理
- 统一的错误响应格式
- 详细的错误码和错误信息
- 异常日志记录

### 4. 性能优化
- 数据库查询优化
- 分页功能
- 缓存机制（Redis）
- 图片压缩和缩略图

### 5. 安全要求
- SQL注入防护
- XSS防护
- CSRF防护
- 文件上传安全检查
- API访问频率限制

### 6. 数据迁移
- 提供初始数据迁移脚本
- 支持从Excel导入基础数据
- 数据备份和恢复功能

## 部署要求

### 开发环境
- Python 3.9+
- MongoDB 4.4+
- Redis 6.0+（可选，用于缓存）

### 生产环境
- Docker容器化部署
- Nginx反向代理
- SSL证书配置
- 日志收集和监控

## API文档要求
- 使用drf-yasg生成Swagger文档
- 详细的接口说明和参数说明
- 请求/响应示例
- 错误码说明

## 测试要求
- 单元测试覆盖率 >= 80%
- 集成测试
- API接口测试
- 性能测试

## 额外功能（可选）
- 二维码/条形码生成
- 短信/邮件通知
- 数据报表导出（PDF/Excel）
- 移动端API适配
- WebSocket实时通知
- 定时任务（库存预警、报表生成）

请基于以上要求，创建一个完整的Django+MongoDB后端项目，确保与前端Vue项目完美对接。 