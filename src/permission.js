import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Layout from '@/layout'
import _import from '@/router/_import_proudction'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

// 路由拦截器
router.beforeEach(async(to, from, next) => {
  // 进度条加载
  NProgress.start()
  // 获取page标题
  document.title = getPageTitle(to.meta.title)
  // 获取token决定用户是否可以登录
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // 如果已登录，则重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // 每次刷新都会执行try获取用户信息，所以getInfo必须要有，后端不提供怎么办？揍他
          await store.dispatch('user/getInfo')
          // **在这里做动态路由**
          if (store.getters.menus.length < 1) {
            global.antRouter = []
            next()
          }
          const menus = filterAsyncRouter(store.getters.menus) // 过滤路由

          router.addRoutes(menus) // 动态添加路由
          global.antRouter = menus // 将路由数据传递给全局变量，做侧边栏菜单渲染工作

          next({ ...to, replace: true })
        } catch (error) {
          // 移除token去登录页
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* 没有token */
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果该路由在白名单内, 放行
      next()
    } else {
      // 不在白名单内不允许通过重定向到登录页
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})


// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {

  const accessedRouters = asyncRouterMap.filter(route => {
    if (route.component) {
      if (route.component === 'Layout') { // Layout组件特殊处理
        route.component = Layout
      } else {
        route.component = _import(route.component)// 导入组件
      }
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
  return accessedRouters
}

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
