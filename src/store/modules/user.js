import { login, logout, getInfo} from '@/api/user'
import { getToken, setToken, removeToken,setTokenTime,removeTokenTime } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    userId:0,
    roles: [], // 角色权限控制按钮显示
    menus: [] // 菜单权限
  }
}



const state = getDefaultState()


const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles // 角色权限
  },
  SET_MENUS: (state, menus) => {
    state.menus = menus // 菜单权限
  },
  SET_USERID: (state, id) => {
    state.userId = id // 用户id
  }

}

const actions = {
  // user login
  //登陆
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response.data
        commit('SET_TOKEN', data.token)
        //设置token过期时间
        setTokenTime(data.expireTime)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response.data
        if (!data) {
          return reject('Verification failed, please Login again.')
        }
        const { name, avatar, roles, menus ,id} = data

        /**
         * 获取异步路由后加入404路由能解决刷新后【丢失路由跳转404页面】问题
         （因为异步获取路由优先级比静态路由表低，导致404路由在异步添加的路由之前）
         */
        menus.push({ 'path': '/404', 'component': '404', 'hide': 'true' }, {
          'path': '*',
          'redirect': '/404',
          'hidden': 'true'
        })
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLES', roles) // 角色权限
        commit('SET_MENUS', menus) // 菜单权限
        commit('SET_USERID', id) // 用户id
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        removeTokenTime()
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      // 如果后端有退出接口写在下面即可，这里直接退出也没问题
      removeToken() // must remove  token  first
      removeTokenTime()
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

