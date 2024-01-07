/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  //todo 限制登陆账号
  const valid_map = ['admin', 'editor','2001','liming']
  return valid_map.indexOf(str.trim()) >= 0
}
