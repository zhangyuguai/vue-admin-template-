import request from '@/utils/request'


//todo 修改接口地址
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    params:data
  })
}


export function getInfo(token) {
  return request({
    url: '/user/getInfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
