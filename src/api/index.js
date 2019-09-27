// import mocha from './mocha'

// 加载目录下所有的js
const requireFile = require.context(
  // 其组件目录的相对路径
  './',
  // 是否查询其子目录
  false,
  // 匹配基础组件文件名的正则表达式
  /\S+\.js$/
)

const api = {}

requireFile.keys().forEach(fileName => {
  // 获取配置
  const config = requireFile(fileName)
  // 获取名字（剥去文件名的开头 `./` 和结尾的扩展名）
  const name = fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
  // 导出除 index 之外的变量
  if (name.toLowerCase() !== 'index') {
    api[name] = config.default || config
  }
})

// export default mocha

export default api
