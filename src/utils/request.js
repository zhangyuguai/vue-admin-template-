import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken,setToken,removeToken,getTokenTime,setTokenTime,removeTokenTime } from '@/utils/auth'
import router from '@/router'
//导入刷新token
import {refreshTokenApi} from '@/api/user'

/**
 * 刷新token
 */
function refreshTokenInfo(){
//设置请求参数
  let param = {
    token:getToken()
  }
  return refreshTokenApi(param).then(res=>res);
}
//定义变量，标识是否刷新token
let isRefresh = false;

/// 创建axios 赋给变量service
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 500000 // 5s请求超时
})

// 请求拦截器
// todo 请求头添加token
service.interceptors.request.use(
  config => {
    debugger;
    //获取当前系统时间
    let currentTime = new Date().getTime();
    //获取token过期时间
    let expireTime = getTokenTime();
    //判断token是否过期
    if(expireTime>0){
      //计算时间
      let min = (expireTime - currentTime) / 1000 / 60;
      //如果token离过期时间相差10分钟，则刷新token
      if(min<10){
        //判断是否刷新
        if(!isRefresh){
            //标识刷新
          isRefresh = true;
            //调用刷新token的方法
          return refreshTokenInfo().then(res=>{
            const {success,data}=res.data
            console.log(res.data);
            debugger;
            //判断是否成功
            if(success){
              console.log('token',data.token)
              console.log('过期时间',data.expireTime)
            //设置新的token和过期时间
              setToken(data.token);
              setTokenTime(data.expireTime);
              console.log('新token',getToken())
              //将新的token添加到header头部
              config.headers['token'] = getToken()
            }
            return config;
          }).catch(error=>{
          }).finally(()=>{
            //修改是否刷新token的状态
            isRefresh = false;
          });
        }
      }
  }
    if (store.getters.token) {
      config.headers['token'] = getToken() // 改成后端要求的token键值
    }
    return config
  },
  error => {
    //清空token
    removeToken()
    //清空token过期时间
    removeTokenTime();
    return Promise.reject(error)
  }
)

// 响应拦截器
// todo 处理响应结果
service.interceptors.response.use(
  response => {

    const message = response.data.msg
    const code = response.data.code
    if (code !== 200) { // 改成后端响应成功的状态码
      switch (code) { // 响应错误判断
        case 401:
          if (router.currentRoute.name === 'login') {
            return Promise.reject(new Error(message))
          } else {
            Message({
              message: message,
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
            message: message,
            type: 'error'
          })
          break
        case 2000:
          debugger;
            Message({
              message:message,
              type: 'success'
            })
          return response;
        case 600:
        store.dispatch('user/resetToken').then(() => {
          //清空token
          removeToken()
          //清空token过期时间
          removeTokenTime();
          location.reload()  // 重复登录的情况
        })
          break;
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
