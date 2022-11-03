import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import router from '@/router'

/// 创建axios 赋给变量service
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // 5s请求超时
})

// 请求拦截器
// todo 请求头添加token
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['token'] = getToken() // 改成后端要求的token键值
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
// todo 处理响应结果
service.interceptors.response.use(
  response => {
    debugger;
    const message = response.data.message
    const code = response.data.code
    if (code !== 200) { // 改成后端响应成功的状态码
      switch (code) { // 响应错误判断
        case 401:
          if (router.currentRoute.name === 'login') {
            return Promise.reject(new Error(message))
          } else {
            Message({
              message: '您没有权限访问该资源',
              type: 'error'
            })
          }
          break
        case 403:
          Message({
            message: message,
            type: 'error'
          })
          break
        case 500:
          Message({
            message: '服务异常，请联系管理员',
            type: 'error'
          })
          break
        default:
          Message({
            message: message,
            type: 'error'
          })
      }
      // store.dispatch('user/resetToken').then(() => {
      //   location.reload()  // 重复登录的情况
      // })
      return Promise.reject(new Error(message || 'Error'))
    } else {
      return response
    }
  },
  error => {
    console.log('err' + error) // 响应错误
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
export default service
