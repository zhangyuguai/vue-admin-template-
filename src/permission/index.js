import store from '@/store'
export default function hasPermission(params){
  console.log(65555)
  let tag = false;//标识是否拥有权限
  //从vuex中取出用户权限
  const roles = store.getters && store.getters.roles
//循环遍历权限字段列表
  for (let i = 0; i < roles.length; i++) {
//判断当前权限字段是否与参数传递过来的字段一致
    if(roles[i] === params){
      tag = true;
      break;
    }
  }
  return tag;
}

