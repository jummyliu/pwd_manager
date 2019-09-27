// 剪切板
export default class Clipboard {
  flag = false
  data = null
  select = window.getSelection()

  constructor () {
    document.addEventListener('copy', this.handleCopy)
  }

  copy (data) {
    if (!document.queryCommandEnabled('copy') && this.select.isCollapsed) {
      const range = document.createRange()
      range.selectNodeContents(document.body)
      this.clean()
      this.select.addRange(range)
    }
    this.data = resolveData(data)
    this.flag = true
    // do copy
    document.execCommand('copy')
    // clean selection
    this.clean()
  }

  clean () {
    this.select.removeAllRanges()
    this.data = null
    this.flag = false
  }

  handleCopy = (e) => {
    if (this.flag) {
      const clip = getClipboardData(e)
      if (clip) {
        for (let key in this.data) {
          clip.setData(key, this.data[key])
        }
      }
      e.preventDefault()
    }
  }

  // 删除事件监听
  destroy () {
    document.removeEventListener('copy', this.handleCopy)
    delete this
  }
}

/**
 * 获取剪切板对象
 * @param {ClipboardEvent} e
 *
 * @returns clipboardData
 */
const getClipboardData = e => {
  if (!e) return null
  return e.clipboardData || window.clipboardData
}

// 处理数据
const resolveData = data => {
  const t = typeof data
  if (t === 'string' || t === 'number' || t === 'boolean') {
    return {
      'text/plain': data
    }
  } else if (data instanceof Node) {
    return {
      'text/html': new XMLSerializer().serializeToString(data)
    }
  } else if (data instanceof Object) {
    return data
  }
  return null
}
