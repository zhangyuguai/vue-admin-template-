import request from '@/utils/request'

/**
 * 获取菜单数据
 * @param params
 * @returns {*}
 */
export function getMenuList(params) {
  return request({
    url: '/permission/list',
    method: 'get',
    params:params
  })
}


/**
 * 获取父级菜单
 * @param params
 * @returns {*}
 */
export function getParent() {
  return request({
    url: '/permission/parent/list',
    method: 'get',
  })
}

/**
 * 添加
 * @param params
 * @returns {*}
 */
export function add(data) {
  return request({
    url: '/permission/addMenu',
    method: 'post',
    data
  })
}

/**
 * 修改
 * @param params
 * @returns {*}
 */
export function updateMenu(data) {
  return request({
    url: '/permission/update',
    method: 'put',
    data
  })
}

/**
 * 检查是否有子菜单
 * @param params
 * @returns {*}
 */
export function checkPermission(id) {
  return request({
    url: `/permission/check/${id}`,
    method: 'get',

  })
}

/**
 * 删除菜单
 * @param params
 * @returns {*}
 */
export function delPermission(id) {
  return request({
    url: `/permission/delete/${id}`,
    method: 'delete',
  })
}

