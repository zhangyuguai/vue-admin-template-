// 开发环境导入组件
module.exports = file => (resolve)=>require(['@/views' + file + '.vue'],resolve) // vue-loader at least v13.0.0+
