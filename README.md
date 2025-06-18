# 小神龙仓库管理系统 (前端)

一个基于 Vue 3 + Element Plus 的现代化仓库管理系统前端项目。

## 🚀 技术栈

- **框架**: Vue 3 + Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **样式**: SCSS
- **图表**: ECharts
- **工具库**: Lodash, Day.js

## 📦 功能模块

- **用户管理**: 登录认证、权限控制
- **仓库管理**: 仓库信息、库区、库位管理
- **商品管理**: 商品基础信息、分类、品牌、供应商、客户
- **库存管理**: 库存查询、预警、盘点、变动记录
- **入库管理**: 采购入库、退货入库、调拨入库
- **出库管理**: 销售出库、调拨出库、拣货打包发货
- **质量管理**: 质检标准、质检记录
- **报表中心**: 库存报表、进出库统计、数据分析
- **系统管理**: 用户、角色、权限、日志、设置

## 🛠️ 开发环境

### 系统要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问地址: http://localhost:3000

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 🔧 项目配置

### 后端API配置
项目配置了API代理，开发环境下会将 `/api` 请求代理到 `http://127.0.0.1:8000`

如需修改后端地址，请编辑 `vite.config.js` 文件中的 proxy 配置。

### 环境变量
项目支持以下环境变量：
- `VITE_API_BASE_URL`: API基础地址
- `VITE_APP_TITLE`: 应用标题

## 📝 开发说明

### 目录结构
```
src/
├── api/           # API接口
├── components/    # 通用组件
├── router/        # 路由配置
├── stores/        # 状态管理
├── styles/        # 样式文件
├── utils/         # 工具函数
├── views/         # 页面组件
├── App.vue        # 根组件
└── main.js        # 入口文件
```

### 代码规范
- 使用 Vue 3 Composition API
- 遵循 ESLint 配置的代码规范
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### API集成
目前项目使用localStorage作为数据存储，用于开发和演示。
生产环境请配置真实的后端API服务。

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)

## 📄 许可证

MIT License