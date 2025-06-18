/**
 * 数据初始化工具
 * 为开发和演示环境提供基础数据
 * 生产环境应该从后端API获取数据
 */

import { ElMessage } from 'element-plus'

/**
 * 检查是否为开发环境
 */
const isDevelopment = import.meta.env.MODE === 'development'

/**
 * 存储配置
 */
const STORAGE_CONFIG = {
  prefix: 'wms_',
  expirationTime: 24 * 60 * 60 * 1000, // 24小时
}

/**
 * 数据存储工具
 */
export const DataStorage = {
  /**
   * 设置数据到localStorage（带过期时间）
   */
  setItem(key, data) {
    const item = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + STORAGE_CONFIG.expirationTime
    }
    localStorage.setItem(STORAGE_CONFIG.prefix + key, JSON.stringify(item))
  },

  /**
   * 从localStorage获取数据（自动检查过期）
   */
  getItem(key) {
    try {
      const item = JSON.parse(localStorage.getItem(STORAGE_CONFIG.prefix + key) || 'null')
      if (!item) return null
      
      // 检查是否过期
      if (item.expires && Date.now() > item.expires) {
        this.removeItem(key)
        return null
      }
      
      return item.data
    } catch (error) {
      console.warn(`解析存储数据失败: ${key}`, error)
      return null
    }
  },

  /**
   * 移除数据
   */
  removeItem(key) {
    localStorage.removeItem(STORAGE_CONFIG.prefix + key)
  },

  /**
   * 清除所有WMS相关数据
   */
  clear() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(STORAGE_CONFIG.prefix)
    )
    keys.forEach(key => localStorage.removeItem(key))
  }
}

/**
 * 基础数据模板
 */
const DataTemplates = {
  // 仓库模板
  warehouses: [
    { 
      id: 1, 
      name: '主仓库', 
      code: 'WH001', 
      status: '启用', 
      location: '北京市朝阳区',
      manager: '张经理',
      phone: '010-12345678',
      address: '北京市朝阳区科技园区1号',
      area: 5000,
      created_at: new Date().toLocaleString()
    },
    { 
      id: 2, 
      name: '分仓库', 
      code: 'WH002', 
      status: '启用', 
      location: '上海市浦东新区',
      manager: '李经理',
      phone: '021-87654321',
      address: '上海市浦东新区张江高科技园区2号',
      area: 3000,
      created_at: new Date().toLocaleString()
    }
  ],

  // 商品分类模板
  categories: [
    { id: 1, name: '电子产品', parent_id: null, code: 'CAT001', status: '启用' },
    { id: 2, name: '服装鞋帽', parent_id: null, code: 'CAT002', status: '启用' },
    { id: 3, name: '食品饮料', parent_id: null, code: 'CAT003', status: '启用' },
    { id: 4, name: '家居用品', parent_id: null, code: 'CAT004', status: '启用' }
  ],

  // 供应商模板
  suppliers: [
    { 
      id: 1, 
      name: '华为供应商', 
      code: 'SUP001', 
      contact: '张经理', 
      phone: '13800138001', 
      email: 'zhang@huawei.com',
      address: '深圳市南山区科技园',
      status: '启用',
      created_at: new Date().toLocaleString()
    },
    { 
      id: 2, 
      name: '小米供应商', 
      code: 'SUP002', 
      contact: '李经理', 
      phone: '13800138002', 
      email: 'li@xiaomi.com',
      address: '北京市海淀区中关村',
      status: '启用',
      created_at: new Date().toLocaleString()
    }
  ],

  // 客户模板
  customers: [
    { 
      id: 1, 
      name: '京东商城', 
      code: 'CUS001', 
      contact: '刘经理', 
      phone: '13900139001', 
      email: 'liu@jd.com',
      address: '北京市大兴区京东总部',
      status: '启用',
      created_at: new Date().toLocaleString()
    },
    { 
      id: 2, 
      name: '天猫超市', 
      code: 'CUS002', 
      contact: '马经理', 
      phone: '13900139002', 
      email: 'ma@tmall.com',
      address: '杭州市西湖区阿里巴巴园区',
      status: '启用',
      created_at: new Date().toLocaleString()
    }
  ],

  // 商品模板
  products: [
    {
      id: 1,
      code: 'P001',
      isku: 'SKU001',
      name: 'iPhone 15 Pro',
      category_id: 1,
      category_name: '电子产品',
      unit: '台',
      price: 7999.00,
      cost: 6500.00,
      min_stock: 10,
      barcode: '1234567890123',
      description: '苹果最新款手机',
      status: '上架',
      created_at: new Date().toLocaleString()
    },
    {
      id: 2,
      code: 'P002',
      isku: 'SKU002',
      name: '华为Mate60',
      category_id: 1,
      category_name: '电子产品',
      unit: '台',
      price: 5999.00,
      cost: 4800.00,
      min_stock: 15,
      barcode: '2345678901234',
      description: '华为旗舰手机',
      status: '上架',
      created_at: new Date().toLocaleString()
    }
  ]
}

/**
 * 数据初始化管理器
 */
export class DataInitializer {
  constructor() {
    this.initialized = false
  }

  /**
   * 检查数据是否需要初始化
   */
  needsInitialization() {
    // 检查关键数据是否存在
    const warehouses = DataStorage.getItem('warehouses')
    const products = DataStorage.getItem('products')
    
    return !warehouses || !products || warehouses.length === 0 || products.length === 0
  }

  /**
   * 初始化所有基础数据
   */
  async initializeAllData() {
    if (!isDevelopment && !this.needsInitialization()) {
      console.log('生产环境或数据已存在，跳过初始化')
      return
    }

    console.log('🚀 开始初始化系统基础数据...')

    try {
      this.initWarehouses()
      this.initCategories()
      this.initSuppliers()
      this.initCustomers()
      this.initProducts()
      this.initInventory()

      this.initialized = true
      DataStorage.setItem('init_timestamp', Date.now())
      
      console.log('✅ 系统基础数据初始化完成')
      
      if (isDevelopment) {
        ElMessage.success('演示数据初始化完成')
      }
    } catch (error) {
      console.error('❌ 系统基础数据初始化失败:', error)
      if (isDevelopment) {
        ElMessage.error('数据初始化失败: ' + error.message)
      }
    }
  }

  /**
   * 初始化仓库数据
   */
  initWarehouses() {
    const existing = DataStorage.getItem('warehouses')
    if (!existing || existing.length === 0) {
      DataStorage.setItem('warehouses', DataTemplates.warehouses)
      console.log('✅ 初始化仓库数据完成')
    }
  }

  /**
   * 初始化商品分类数据
   */
  initCategories() {
    const existing = DataStorage.getItem('categories')
    if (!existing || existing.length === 0) {
      DataStorage.setItem('categories', DataTemplates.categories)
      console.log('✅ 初始化商品分类数据完成')
    }
  }

  /**
   * 初始化供应商数据
   */
  initSuppliers() {
    const existing = DataStorage.getItem('suppliers')
    if (!existing || existing.length === 0) {
      DataStorage.setItem('suppliers', DataTemplates.suppliers)
      console.log('✅ 初始化供应商数据完成')
    }
  }

  /**
   * 初始化客户数据
   */
  initCustomers() {
    const existing = DataStorage.getItem('customers')
    if (!existing || existing.length === 0) {
      DataStorage.setItem('customers', DataTemplates.customers)
      console.log('✅ 初始化客户数据完成')
    }
  }

  /**
   * 初始化商品数据
   */
  initProducts() {
    const existing = DataStorage.getItem('products')
    if (!existing || existing.length === 0) {
      DataStorage.setItem('products', DataTemplates.products)
      console.log('✅ 初始化商品数据完成')
    }
  }

  /**
   * 初始化库存数据
   */
  initInventory() {
    const existing = DataStorage.getItem('inventory_stock')
    if (!existing || existing.length === 0) {
      const products = DataStorage.getItem('products') || []
      const warehouses = DataStorage.getItem('warehouses') || []
      
      const inventory = []
      let id = 1
      
      products.forEach(product => {
        warehouses.forEach(warehouse => {
          inventory.push({
            id: id++,
            product_id: product.id,
            product_code: product.code,
            product_name: product.name,
            warehouse_id: warehouse.id,
            warehouse_name: warehouse.name,
            current_stock: Math.floor(Math.random() * 100) + 50, // 50-150随机库存
            available_stock: Math.floor(Math.random() * 80) + 40, // 40-120可用库存
            reserved_stock: Math.floor(Math.random() * 10) + 5, // 5-15预留库存
            location: `A${String(id).padStart(3, '0')}`,
            updated_at: new Date().toLocaleString()
          })
        })
      })
      
      DataStorage.setItem('inventory_stock', inventory)
      console.log('✅ 初始化库存数据完成')
    }
  }

  /**
   * 重置所有数据
   */
  resetAllData() {
    DataStorage.clear()
    this.initialized = false
    console.log('🔄 所有数据已重置')
  }
}

// 创建全局实例
export const dataInitializer = new DataInitializer()

/**
 * 检查数据完整性
 */
export function checkDataIntegrity() {
  const requiredData = ['warehouses', 'products', 'suppliers', 'customers']
  
  for (const key of requiredData) {
    const data = DataStorage.getItem(key)
    if (!data || data.length === 0) {
      console.warn(`⚠️ 缺少${key}数据`)
      return false
    }
  }
  
  console.log('✅ 数据完整性检查通过')
  return true
}

/**
 * 应用启动时的数据初始化
 */
export async function initAllData() {
  await dataInitializer.initializeAllData()
}

// 默认导出
export default {
  DataStorage,
  DataInitializer,
  dataInitializer,
  initAllData,
  checkDataIntegrity
}