// 出库页面性能测试工具
// 用于验证无限加载问题是否修复

/**
 * 监控页面API请求频率
 */
export function monitorAPIRequests() {
  const requestLog = []
  const originalFetch = window.fetch
  
  // 拦截fetch请求
  window.fetch = function(...args) {
    const url = args[0]
    const timestamp = new Date().toLocaleTimeString()
    
    // 记录出库相关的API请求
    if (url.includes('/outbound/') || url.includes('/inventory/') || url.includes('/stats')) {
      requestLog.push({
        url,
        timestamp,
        type: 'fetch'
      })
      
      console.log(`🌐 API请求: ${url} - ${timestamp}`)
    }
    
    return originalFetch.apply(this, args)
  }
  
  // 返回日志查看函数
  return {
    getRequestLog: () => requestLog,
    getRequestFrequency: () => {
      const now = Date.now()
      const recent = requestLog.filter(req => 
        new Date(`2024-01-20 ${req.timestamp}`) > new Date(now - 60000) // 最近1分钟
      )
      return recent.length
    },
    clearLog: () => {
      requestLog.length = 0
      console.log('📋 请求日志已清空')
    },
    showSummary: () => {
      console.group('📊 API请求统计')
      console.log('总请求数:', requestLog.length)
      console.log('最近1分钟请求数:', this.getRequestFrequency())
      
      // 按URL分组统计
      const urlStats = {}
      requestLog.forEach(req => {
        urlStats[req.url] = (urlStats[req.url] || 0) + 1
      })
      
      console.table(urlStats)
      console.groupEnd()
    }
  }
}

/**
 * 检测定时器是否正常工作
 */
export function detectTimers() {
  const timers = []
  const originalSetInterval = window.setInterval
  const originalClearInterval = window.clearInterval
  
  window.setInterval = function(callback, delay, ...args) {
    const timerId = originalSetInterval.call(this, callback, delay, ...args)
    timers.push({
      id: timerId,
      delay,
      created: new Date().toLocaleTimeString(),
      type: 'interval'
    })
    
    console.log(`⏰ 定时器创建: ID=${timerId}, 间隔=${delay}ms, 时间=${new Date().toLocaleTimeString()}`)
    return timerId
  }
  
  window.clearInterval = function(timerId) {
    const index = timers.findIndex(t => t.id === timerId)
    if (index !== -1) {
      const timer = timers[index]
      console.log(`🗑️ 定时器清理: ID=${timerId}, 原间隔=${timer.delay}ms`)
      timers.splice(index, 1)
    }
    return originalClearInterval.call(this, timerId)
  }
  
  return {
    getActiveTimers: () => timers,
    showTimerStatus: () => {
      console.group('⏰ 定时器状态')
      console.log('活跃定时器数量:', timers.length)
      if (timers.length > 0) {
        console.table(timers)
      }
      console.groupEnd()
    }
  }
}

/**
 * 性能测试主函数
 */
export function startOutboundPerformanceTest() {
  console.log('🚀 开始出库页面性能测试...')
  
  const requestMonitor = monitorAPIRequests()
  const timerDetector = detectTimers()
  
  // 每30秒输出一次统计报告
  const reportInterval = setInterval(() => {
    console.group('📈 性能测试报告')
    console.log('测试时间:', new Date().toLocaleString())
    
    // API请求统计
    const recentRequests = requestMonitor.getRequestFrequency()
    console.log('最近1分钟API请求数:', recentRequests)
    
    if (recentRequests > 5) {
      console.warn('⚠️  API请求频率过高，可能存在无限加载问题')
    } else if (recentRequests === 0) {
      console.info('✅ API请求频率正常，无异常活动')
    } else {
      console.info('ℹ️  API请求频率正常')
    }
    
    // 定时器统计
    timerDetector.showTimerStatus()
    
    console.groupEnd()
  }, 30000)
  
  // 返回控制函数
  return {
    stop: () => {
      clearInterval(reportInterval)
      console.log('🛑 性能测试已停止')
    },
    getReport: () => {
      return {
        requests: requestMonitor.getRequestLog(),
        timers: timerDetector.getActiveTimers(),
        summary: requestMonitor.showSummary()
      }
    },
    showSummary: () => {
      requestMonitor.showSummary()
      timerDetector.showTimerStatus()
    }
  }
}

// 全局暴露测试函数，便于在控制台使用
if (typeof window !== 'undefined') {
  window.outboundPerfTest = {
    start: startOutboundPerformanceTest,
    monitor: monitorAPIRequests,
    detectTimers: detectTimers
  }
  
  console.log('🔧 出库页面性能测试工具已加载')
  console.log('使用方法: window.outboundPerfTest.start()')
} 