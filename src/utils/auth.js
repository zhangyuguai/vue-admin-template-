import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'
//定义token过期时间的key
const timeKey = "expireTime";

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
/*
* 获取token过期时间
* @returns
*/
export function getTokenTime(){
  return Cookies.get(timeKey);
}


/**
 * 设置token过期时间
 * @returns
 */
export function setTokenTime(time){
  return Cookies.set(timeKey,time);
}

/**
 * 清空token过期时间
 * @returns
 */
export function removeTokenTime(){
  return Cookies.remove(timeKey);
}


