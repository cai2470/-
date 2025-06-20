/**
 * 数据验证工具函数
 * 用于确保前端组件接收到的数据格式正确，避免undefined值导致的Vue警告
 */

/**
 * 验证并清理选择器选项数据
 * @param {Array} data - 原始数据数组
 * @param {Array} defaultData - 默认数据
 * @param {Object} config - 验证配置
 * @returns {Array} 验证后的数据
 */
export const validateSelectOptions = (data, defaultData = [], config = {}) => {
  const {
    requiredFields = ['id', 'label', 'value'],
    validator = null,
    mapper = null,
    sortBy = 'label'
  } = config

  try {
    // 检查数据是否为数组
    if (!Array.isArray(data)) {
      console.warn('⚠️ 数据验证: 输入数据不是数组格式，使用默认数据')
      return defaultData
    }

    // 过滤无效数据
    let validData = data.filter(item => {
      if (!item || typeof item !== 'object') return false
      
      // 检查必需字段
      for (const field of requiredFields) {
        if (item[field] === undefined || item[field] === null) {
          return false
        }
      }
      
      // 自定义验证器
      if (validator && typeof validator === 'function') {
        return validator(item)
      }
      
      return true
    })

    // 映射数据格式
    if (mapper && typeof mapper === 'function') {
      validData = validData.map(mapper)
    }

    // 最终验证：确保所有必需字段存在且不为undefined
    validData = validData.filter(item => {
      return requiredFields.every(field => 
        item[field] !== undefined && 
        item[field] !== null && 
        item[field] !== ''
      )
    })

    // 排序
    if (sortBy && validData.length > 0) {
      validData.sort((a, b) => {
        const aValue = a[sortBy] || ''
        const bValue = b[sortBy] || ''
        return aValue.toString().localeCompare(bValue.toString())
      })
    }

    // 如果没有有效数据，返回默认数据
    if (validData.length === 0) {
      console.warn('⚠️ 数据验证: 没有有效数据，使用默认数据')
      return defaultData
    }

    console.log(`✅ 数据验证完成: ${validData.length} 个有效选项`)
    return validData

  } catch (error) {
    console.error('❌ 数据验证失败:', error)
    return defaultData
  }
}

/**
 * 验证表格数据
 * @param {Array} data - 表格数据
 * @param {Array} defaultData - 默认数据
 * @param {Object} config - 验证配置
 * @returns {Array} 验证后的表格数据
 */
export const validateTableData = (data, defaultData = [], config = {}) => {
  const {
    requiredFields = ['id'],
    allowEmptyFields = [],
    validator = null,
    mapper = null
  } = config

  try {
    if (!Array.isArray(data)) {
      console.warn('⚠️ 表格数据验证: 输入数据不是数组格式')
      return defaultData
    }

    let validData = data.filter(item => {
      if (!item || typeof item !== 'object') return false
      
      // 检查必需字段
      for (const field of requiredFields) {
        if (!allowEmptyFields.includes(field) && 
            (item[field] === undefined || item[field] === null)) {
          return false
        }
      }
      
      if (validator && typeof validator === 'function') {
        return validator(item)
      }
      
      return true
    })

    if (mapper && typeof mapper === 'function') {
      validData = validData.map(mapper)
    }

    console.log(`✅ 表格数据验证完成: ${validData.length} 条有效记录`)
    return validData

  } catch (error) {
    console.error('❌ 表格数据验证失败:', error)
    return defaultData
  }
}

/**
 * 验证API响应数据
 * @param {*} response - API响应
 * @param {Object} config - 验证配置
 * @returns {Object} 标准化的响应数据
 */
export const validateAPIResponse = (response, config = {}) => {
  const {
    dataPath = 'results',
    fallbackPaths = ['data', 'list', 'items'],
    defaultData = [],
    expectArray = true
  } = config

  try {
    if (!response || typeof response !== 'object') {
      console.warn('⚠️ API响应验证: 响应数据无效')
      return { data: defaultData, total: 0, success: false }
    }

    // 尝试从不同路径提取数据
    let extractedData = null
    const pathsToTry = [dataPath, ...fallbackPaths]
    
    for (const path of pathsToTry) {
      if (response[path] !== undefined) {
        extractedData = response[path]
        break
      }
    }

    // 如果没有找到数据，检查响应本身是否就是数据
    if (extractedData === null) {
      if (expectArray && Array.isArray(response)) {
        extractedData = response
      } else if (!expectArray) {
        extractedData = response
      } else {
        extractedData = defaultData
      }
    }

    // 验证数据类型
    if (expectArray && !Array.isArray(extractedData)) {
      console.warn('⚠️ API响应验证: 期望数组但收到其他类型')
      extractedData = defaultData
    }

    const total = response.count || response.total || 
                  (Array.isArray(extractedData) ? extractedData.length : 0)

    console.log('✅ API响应验证完成:', {
      dataType: Array.isArray(extractedData) ? '数组' : typeof extractedData,
      length: Array.isArray(extractedData) ? extractedData.length : 'N/A',
      total
    })

    return {
      data: extractedData,
      total,
      success: true,
      pagination: {
        current: response.current || 1,
        pageSize: response.pageSize || response.page_size || 20,
        total
      }
    }

  } catch (error) {
    console.error('❌ API响应验证失败:', error)
    return { data: defaultData, total: 0, success: false }
  }
}

/**
 * 验证表单数据
 * @param {Object} formData - 表单数据
 * @param {Object} rules - 验证规则
 * @returns {Object} 验证结果
 */
export const validateFormData = (formData, rules = {}) => {
  const errors = {}
  const warnings = []

  try {
    for (const [field, rule] of Object.entries(rules)) {
      const value = formData[field]
      
      // 必填验证
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = rule.message || `${field} 是必填项`
        continue
      }

      // 类型验证
      if (value !== undefined && value !== null && rule.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value
        if (actualType !== rule.type) {
          errors[field] = `${field} 类型错误，期望 ${rule.type}，实际 ${actualType}`
          continue
        }
      }

      // 自定义验证器
      if (rule.validator && typeof rule.validator === 'function') {
        const result = rule.validator(value, formData)
        if (result !== true) {
          errors[field] = result || `${field} 验证失败`
          continue
        }
      }

      // 检查undefined值
      if (value === undefined && !rule.allowUndefined) {
        warnings.push(`${field} 的值为 undefined，可能导致组件警告`)
      }
    }

    const isValid = Object.keys(errors).length === 0

    if (warnings.length > 0) {
      console.warn('⚠️ 表单数据警告:', warnings)
    }

    if (isValid) {
      console.log('✅ 表单数据验证通过')
    } else {
      console.error('❌ 表单数据验证失败:', errors)
    }

    return {
      isValid,
      errors,
      warnings
    }

  } catch (error) {
    console.error('❌ 表单验证过程出错:', error)
    return {
      isValid: false,
      errors: { _global: '验证过程出错' },
      warnings: []
    }
  }
}

/**
 * 创建安全的选择器选项
 * 确保所有选项都有有效的 key、label、value 属性
 * @param {Array} options - 原始选项
 * @param {Object} config - 配置
 * @returns {Array} 安全的选项数组
 */
export const createSafeSelectOptions = (options, config = {}) => {
  const {
    keyField = 'id',
    labelField = 'label',
    valueField = 'value',
    defaultLabel = '未知选项',
    defaultValue = ''
  } = config

  if (!Array.isArray(options)) {
    console.warn('⚠️ 创建安全选项: 输入不是数组')
    return []
  }

  return options
    .filter(option => option && typeof option === 'object')
    .map((option, index) => ({
      key: option[keyField] !== undefined ? option[keyField] : `option_${index}`,
      label: option[labelField] || option.name || defaultLabel,
      value: option[valueField] !== undefined ? option[valueField] : 
             (option[keyField] !== undefined ? option[keyField] : defaultValue)
    }))
    .filter(option => 
      option.key !== undefined && 
      option.label !== undefined && 
      option.value !== undefined
    )
}

export default {
  validateSelectOptions,
  validateTableData,
  validateAPIResponse,
  validateFormData,
  createSafeSelectOptions
} 