// 生产环境导入组件
module.exports = file => (resolve)=>require(['@/views' + file + '.vue'],resolve)
