import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './styles/index.scss'

// 导入数据初始化工具
import { initAllData, checkDataIntegrity } from './utils/initData'

// 导入localStorage诊断工具 - 修复导入错误
import { diagnoseStorageIssues, monitorLocalStorage, cleanWMSLocalStorage, inspectLocalStorage } from './utils/cleanLocalStorage.js'

// 导入登录修复工具
import './utils/loginFix.js'

// 导入CRUD测试工具
import './utils/crudTest.js'

// API路径测试工具已移除，功能已集成到主要代码中

// 创建Vue应用实例
const app = createApp(App)

// 注册Element Plus图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 安装插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('全局错误:', error)
  console.error('错误信息:', info)
  
  // 可以在这里添加错误上报逻辑
  // 例如发送到Sentry或其他错误监控服务
}

// 应用初始化
async function initializeApp() {
  try {
    console.log('🚀 正在初始化小神龙仓库管理系统...')
    
    // 开发环境下启动localStorage诊断和监控
    if (import.meta.env.MODE === 'development') {
      console.log('🔍 启动localStorage诊断...')
      
      // 执行诊断（但不启动监控，避免干扰登录）
      const diagnosis = diagnoseStorageIssues()
      
      if (diagnosis.issues.length > 0) {
        console.warn('⚠️ 检测到localStorage问题，建议运行: window.wmsDiagnostics.cleanWMSLocalStorage()')
      }
      
      // 注意：localStorage监控已暂时禁用以避免登录问题
      console.log('ℹ️ localStorage监控已禁用，可手动启动: window.wmsDiagnostics.monitorLocalStorage()')
    }
    
    // 检查数据完整性
    const hasValidData = checkDataIntegrity()
    
    // 如果数据不完整或在开发环境，初始化演示数据
    if (!hasValidData || import.meta.env.MODE === 'development') {
      console.log('📋 初始化系统基础数据...')
      await initAllData()
    }
    
    // 设置全局诊断工具（确保所有函数都可用）
    window.wmsDiagnostics = {
      diagnose: diagnoseStorageIssues,
      monitor: monitorLocalStorage,
      clean: cleanWMSLocalStorage,
      inspect: inspectLocalStorage,
      cleanWMSLocalStorage,
      monitorLocalStorage,
      diagnoseStorageIssues,
      inspectLocalStorage
    }
    
    console.log('✅ 系统初始化完成')
    
    // 添加开发模式提示
    if (import.meta.env.MODE === 'development') {
      console.log('%c🔧 开发模式', 'color: #409eff; font-weight: bold;')
      console.log('演示账号:')
      console.log('  管理员: admin / admin123')
      console.log('  仓库管理员: manager / manager123')  
      console.log('  操作员: operator / operator123')
    }
    
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    
    // 显示用户友好的错误信息
    if (import.meta.env.MODE === 'development') {
      alert(`应用初始化失败: ${error.message}`)
    }
  }
}

// 启动应用
initializeApp().then(() => {
  app.mount('#app')
}).catch(error => {
  console.error('应用启动失败:', error)
  // 即使初始化失败，也要挂载应用，让用户能看到界面
  app.mount('#app')
})