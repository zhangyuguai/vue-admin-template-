import request from '@/utils/request'

//todo 修改接口地址
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
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

export function refreshTokenApi(params) {
  return request({
    url: '/user/refreshToken',
    method:'get',
    params:params
  })
}

//------------------------用户管理api----------------------------------------------
/**
 * 获取用户列表
 * @returns {*}
 */
export function getUserList(params) {
  return request({
    url: '/normal/user/list',
    method: 'get',
    params: params
  })
}

/**
 * 添加用户
 * @returns {*}
 */
export function addUser(data) {
  return request({
    url: '/normal/user/add',
    method: 'post',
    data
  })
}

/**
 * 修改用户
 * @returns {*}
 */
export function updateUser(data) {
  return request({
    url: '/normal/user/update',
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @returns {*}
 */
export function deleteUser(id) {
  return request({
    url: `/normal/user/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 查询用户角色列表
 */
export function getAssignRoleList(params) {
  return request({
    url: '/normal/user/getRoleListForAssign',
    method: 'get',
    params: params
  })
}

/**
 * 获取分配角色列表数据
 */
export function getRoleIdByUserId(id) {
  return request({
    url: `/normal/user/getRoleByUserId/${id}`,
    method: 'get'
  })
}

/**
 * 保存用户角色信息
 */
export function saveUserRole(data) {
  return request({
    url: '/normal/user/saveUserRole',
    method: 'post',
    data
  })
}


