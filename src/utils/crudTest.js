/**
 * 增删改查功能测试工具
 * 用于诊断和测试WMS系统的CRUD操作
 */

import { wmsAPI } from './api.js'
import { ElMessage, ElMessageBox } from 'element-plus'

class CRUDTester {
  constructor() {
    this.testResults = []
    this.currentTest = null
  }

  /**
   * 记录测试结果
   */
  logResult(operation, module, success, data = null, error = null) {
    const result = {
      timestamp: new Date().toISOString(),
      operation,
      module,
      success,
      data,
      error: error?.message || error,
      statusCode: error?.response?.status
    }
    this.testResults.push(result)
    
    const status = success ? '✅' : '❌'
    const message = success ? '成功' : `失败: ${error?.message || error}`
    console.log(`${status} [${module}] ${operation} - ${message}`)
    
    if (data) {
      console.log('📊 返回数据:', data)
    }
    
    return result
  }

  /**
   * 测试仓库模块的完整CRUD操作
   */
  async testWarehouseCRUD() {
    console.log('🧪 开始测试仓库模块 CRUD 操作...')
    let createdWarehouse = null
    
    try {
      // 1. 测试创建（Create）
      console.log('\n1️⃣ 测试创建仓库...')
      const testWarehouseData = {
        name: `测试仓库_${Date.now()}`,
        code: `TEST_${Date.now()}`,
        type: 'main',
        manager: '测试管理员',
        phone: '13800138000',
        address: '测试地址123号',
        area: 100,
        remark: '自动化测试创建'
      }
      
      try {
        const createResult = await wmsAPI.createWarehouse(testWarehouseData)
        createdWarehouse = createResult
        this.logResult('创建', '仓库', true, createResult)
        
        // 2. 测试读取（Read）
        console.log('\n2️⃣ 测试读取仓库列表...')
        try {
          const readResult = await wmsAPI.getWarehouses()
          this.logResult('读取', '仓库', true, { count: readResult?.length || readResult?.results?.length || 0 })
          
          // 3. 测试更新（Update）
          if (createdWarehouse?.id) {
            console.log('\n3️⃣ 测试更新仓库...')
            const updateData = {
              ...testWarehouseData,
              name: `${testWarehouseData.name}_已更新`,
              manager: '更新后的管理员',
              phone: '13900139000',
              remark: '自动化测试更新'
            }
            
            try {
              const updateResult = await wmsAPI.updateWarehouse(createdWarehouse.id, updateData)
              this.logResult('更新', '仓库', true, updateResult)
              
              // 4. 测试删除（Delete）
              console.log('\n4️⃣ 测试删除仓库...')
              try {
                await wmsAPI.deleteWarehouse(createdWarehouse.id)
                this.logResult('删除', '仓库', true)
              } catch (deleteError) {
                this.logResult('删除', '仓库', false, null, deleteError)
              }
            } catch (updateError) {
              this.logResult('更新', '仓库', false, null, updateError)
              // 如果更新失败，仍然尝试删除
              try {
                await wmsAPI.deleteWarehouse(createdWarehouse.id)
                this.logResult('删除', '仓库', true, null, '更新失败后的清理删除')
              } catch (cleanupError) {
                this.logResult('删除', '仓库', false, null, cleanupError)
              }
            }
          } else {
            this.logResult('更新', '仓库', false, null, '无法获取创建的仓库ID')
            this.logResult('删除', '仓库', false, null, '无法获取创建的仓库ID')
          }
        } catch (readError) {
          this.logResult('读取', '仓库', false, null, readError)
        }
      } catch (createError) {
        this.logResult('创建', '仓库', false, null, createError)
      }
    } catch (error) {
      console.error('❌ 仓库CRUD测试失败:', error)
    }
    
    console.log('\n✅ 仓库模块 CRUD 测试完成')
    return this.getModuleResults('仓库')
  }

  /**
   * 测试供应商模块的完整CRUD操作
   */
  async testSupplierCRUD() {
    console.log('\n🧪 开始测试供应商模块 CRUD 操作...')
    let createdSupplier = null
    
    try {
      // 1. 测试创建（Create）
      console.log('\n1️⃣ 测试创建供应商...')
      const testSupplierData = {
        name: `测试供应商_${Date.now()}`,
        code: `SUP_${Date.now()}`,
        contact: '测试联系人',
        phone: '13800138001',
        email: 'test@supplier.com',
        address: '测试供应商地址456号',
        credit_rating: 5,
        cooperation_type: '长期合作',
        remark: '自动化测试创建'
      }
      
      try {
        const createResult = await wmsAPI.createSupplier(testSupplierData)
        createdSupplier = createResult
        this.logResult('创建', '供应商', true, createResult)
        
        // 2. 测试读取（Read）
        console.log('\n2️⃣ 测试读取供应商列表...')
        try {
          const readResult = await wmsAPI.getSuppliers()
          this.logResult('读取', '供应商', true, { count: readResult?.length || readResult?.results?.length || 0 })
          
          // 3. 测试更新（Update）
          if (createdSupplier?.id) {
            console.log('\n3️⃣ 测试更新供应商...')
            const updateData = {
              ...testSupplierData,
              name: `${testSupplierData.name}_已更新`,
              contact: '更新后的联系人',
              phone: '13900139001',
              remark: '自动化测试更新'
            }
            
            try {
              const updateResult = await wmsAPI.updateSupplier(createdSupplier.id, updateData)
              this.logResult('更新', '供应商', true, updateResult)
              
              // 4. 测试删除（Delete）
              console.log('\n4️⃣ 测试删除供应商...')
              try {
                await wmsAPI.deleteSupplier(createdSupplier.id)
                this.logResult('删除', '供应商', true)
              } catch (deleteError) {
                this.logResult('删除', '供应商', false, null, deleteError)
              }
            } catch (updateError) {
              this.logResult('更新', '供应商', false, null, updateError)
              // 如果更新失败，仍然尝试删除
              try {
                await wmsAPI.deleteSupplier(createdSupplier.id)
                this.logResult('删除', '供应商', true, null, '更新失败后的清理删除')
              } catch (cleanupError) {
                this.logResult('删除', '供应商', false, null, cleanupError)
              }
            }
          } else {
            this.logResult('更新', '供应商', false, null, '无法获取创建的供应商ID')
            this.logResult('删除', '供应商', false, null, '无法获取创建的供应商ID')
          }
        } catch (readError) {
          this.logResult('读取', '供应商', false, null, readError)
        }
      } catch (createError) {
        this.logResult('创建', '供应商', false, null, createError)
      }
    } catch (error) {
      console.error('❌ 供应商CRUD测试失败:', error)
    }
    
    console.log('\n✅ 供应商模块 CRUD 测试完成')
    return this.getModuleResults('供应商')
  }

  /**
   * 测试商品模块的完整CRUD操作
   */
  async testProductCRUD() {
    console.log('\n🧪 开始测试商品模块 CRUD 操作...')
    let createdProduct = null
    
    try {
      // 1. 测试创建（Create）
      console.log('\n1️⃣ 测试创建商品...')
      const testProductData = {
        name: `测试商品_${Date.now()}`,
        code: `PRD_${Date.now()}`,
        barcode: `${Date.now()}`,
        category_id: 1, // 假设存在
        brand_id: 1, // 假设存在
        supplier_id: 1, // 假设存在
        description: '自动化测试商品',
        specifications: '测试规格',
        unit: 'unit',
        price: 99.99,
        min_stock: 10
      }
      
      try {
        const createResult = await wmsAPI.createProduct(testProductData)
        createdProduct = createResult
        this.logResult('创建', '商品', true, createResult)
        
        // 2. 测试读取（Read）
        console.log('\n2️⃣ 测试读取商品列表...')
        try {
          const readResult = await wmsAPI.getProducts()
          this.logResult('读取', '商品', true, { count: readResult?.length || readResult?.results?.length || 0 })
          
          // 3. 测试更新（Update）
          if (createdProduct?.id) {
            console.log('\n3️⃣ 测试更新商品...')
            const updateData = {
              ...testProductData,
              name: `${testProductData.name}_已更新`,
              price: 199.99,
              description: '自动化测试更新'
            }
            
            try {
              const updateResult = await wmsAPI.updateProduct(createdProduct.id, updateData)
              this.logResult('更新', '商品', true, updateResult)
              
              // 4. 测试删除（Delete）
              console.log('\n4️⃣ 测试删除商品...')
              try {
                await wmsAPI.deleteProduct(createdProduct.id)
                this.logResult('删除', '商品', true)
              } catch (deleteError) {
                this.logResult('删除', '商品', false, null, deleteError)
              }
            } catch (updateError) {
              this.logResult('更新', '商品', false, null, updateError)
              // 如果更新失败，仍然尝试删除
              try {
                await wmsAPI.deleteProduct(createdProduct.id)
                this.logResult('删除', '商品', true, null, '更新失败后的清理删除')
              } catch (cleanupError) {
                this.logResult('删除', '商品', false, null, cleanupError)
              }
            }
          } else {
            this.logResult('更新', '商品', false, null, '无法获取创建的商品ID')
            this.logResult('删除', '商品', false, null, '无法获取创建的商品ID')
          }
        } catch (readError) {
          this.logResult('读取', '商品', false, null, readError)
        }
      } catch (createError) {
        this.logResult('创建', '商品', false, null, createError)
      }
    } catch (error) {
      console.error('❌ 商品CRUD测试失败:', error)
    }
    
    console.log('\n✅ 商品模块 CRUD 测试完成')
    return this.getModuleResults('商品')
  }

  /**
   * 运行全部CRUD测试
   */
  async runAllTests() {
    console.log('🚀 开始运行全部 CRUD 测试...')
    this.testResults = []
    
    // 清空控制台
    console.clear()
    
    const startTime = Date.now()
    
    // 运行各模块测试
    const warehouseResults = await this.testWarehouseCRUD()
    const supplierResults = await this.testSupplierCRUD()
    const productResults = await this.testProductCRUD()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 生成综合报告
    const report = this.generateReport(duration)
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 CRUD 测试完整报告')
    console.log('='.repeat(60))
    console.log(report)
    
    // 弹窗显示结果
    const summary = this.getSummary()
    ElMessageBox.alert(
      `测试完成！耗时: ${duration}ms\n\n${summary}`,
      'CRUD测试报告',
      {
        confirmButtonText: '确定',
        type: summary.includes('全部成功') ? 'success' : 'warning'
      }
    )
    
    return {
      results: this.testResults,
      summary,
      duration,
      warehouseResults,
      supplierResults,
      productResults
    }
  }

  /**
   * 获取特定模块的测试结果
   */
  getModuleResults(module) {
    return this.testResults.filter(r => r.module === module)
  }

  /**
   * 生成详细报告
   */
  generateReport(duration) {
    const modules = ['仓库', '供应商', '商品']
    let report = `测试耗时: ${duration}ms\n\n`
    
    modules.forEach(module => {
      const results = this.getModuleResults(module)
      const operations = ['创建', '读取', '更新', '删除']
      
      report += `📦 ${module}模块:\n`
      operations.forEach(op => {
        const result = results.find(r => r.operation === op)
        if (result) {
          const status = result.success ? '✅' : '❌'
          const error = result.success ? '' : ` (${result.error})`
          report += `  ${status} ${op}${error}\n`
        } else {
          report += `  ⏸️ ${op} (未测试)\n`
        }
      })
      report += '\n'
    })
    
    return report
  }

  /**
   * 获取测试摘要
   */
  getSummary() {
    const total = this.testResults.length
    const success = this.testResults.filter(r => r.success).length
    const failed = total - success
    
    if (failed === 0) {
      return `全部成功 ✅ (${success}/${total})`
    } else {
      return `部分失败 ⚠️ (成功: ${success}, 失败: ${failed})`
    }
  }

  /**
   * 诊断字段映射问题
   */
  async diagnoseFieldMapping() {
    console.log('🔍 开始诊断字段映射问题...')
    
    try {
      // 测试获取仓库数据，检查字段格式
      const warehouses = await wmsAPI.getWarehouses()
      const warehouseData = warehouses?.results?.[0] || warehouses?.[0]
      
      if (warehouseData) {
        console.log('📋 后端返回的仓库字段:')
        console.log('- ID:', warehouseData.id)
        console.log('- 名称:', warehouseData.name)
        console.log('- 编码:', warehouseData.code)
        console.log('- 联系人字段:', {
          contact_person: warehouseData.contact_person,
          manager: warehouseData.manager
        })
        console.log('- 电话字段:', {
          contact_phone: warehouseData.contact_phone,
          phone: warehouseData.phone
        })
        
        // 检查字段映射问题
        const hasNewFields = warehouseData.contact_person !== undefined || warehouseData.contact_phone !== undefined
        const hasOldFields = warehouseData.manager !== undefined || warehouseData.phone !== undefined
        
        if (hasNewFields && !hasOldFields) {
          console.log('⚠️ 发现字段映射问题:')
          console.log('  - 后端使用: contact_person, contact_phone')
          console.log('  - 前端期望: manager, phone')
          console.log('  - 建议: 更新前端字段映射')
        } else if (hasOldFields && !hasNewFields) {
          console.log('✅ 字段映射正常 (使用旧字段格式)')
        } else if (hasNewFields && hasOldFields) {
          console.log('ℹ️ 同时存在新旧字段，映射已处理')
        } else {
          console.log('❓ 无法确定字段格式')
        }
      } else {
        console.log('❌ 无法获取仓库数据用于字段诊断')
      }
    } catch (error) {
      console.error('❌ 字段映射诊断失败:', error)
    }
  }
}

// 创建全局实例
const crudTester = new CRUDTester()

// 导出供控制台使用
window.crudTester = crudTester

// 便捷方法
window.testCRUD = () => crudTester.runAllTests()
window.testWarehouse = () => crudTester.testWarehouseCRUD()
window.testSupplier = () => crudTester.testSupplierCRUD()
window.testProduct = () => crudTester.testProductCRUD()
window.diagnoseFields = () => crudTester.diagnoseFieldMapping()

console.log('🧪 CRUD测试工具已加载!')
console.log('💡 使用方法:')
console.log('  - testCRUD() - 运行全部测试')
console.log('  - testWarehouse() - 测试仓库模块') 
console.log('  - testSupplier() - 测试供应商模块')
console.log('  - testProduct() - 测试商品模块')
console.log('  - diagnoseFields() - 诊断字段映射')

export default crudTester 