import request from '@/utils/request'

/**
 * 获取角色列表
 */
export function getRoleList(params){
  return request({
    url: `/role/list`,
    method: 'get',
    params:params
  })
}

/**
 *添加角色
 */
export function addRole(data){
  return request({
    url: `/role/addRole`,
    method: 'post',
    data
  })
}

/**
 *修改角色
 */
export function updateRole(data){
  return request({
    url: `/role/update`,
    method: 'put',
    data
  })
}


/**
 *删除角色
 */
export function deleteRole(id){
  return request({
    url: `/role/delete/${id}`,
    method: 'delete',
  })
}

/**
 *获取权限树
 */
export function getPermissionTree(params){
  return request({
    url: `/role/getAssignPermissionTree`,
    method: 'get',
    params:params
  })
}

/**
 *保存分配权限
 */
export function saveRolePermissions(data){
  return request({
    url: `/role/saveRoleAssign`,
    method: 'post',
    data
  })
}



