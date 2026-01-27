/**
 * 微信登录配置
 * 使用前请先在微信开放平台申请网站应用
 * https://open.weixin.qq.com/
 */

export const WECHAT_CONFIG = {
  // 微信开放平台应用AppID
  appid: process.env.REACT_APP_WECHAT_APPID || 'wx491ad4ddc518cfb9',
  
  // 授权作用域（网站应用固定值）
  scope: 'snsapi_login',
  
  // 回调地址（需在微信开放平台配置白名单）
  // 微信扫码后会重定向到此地址，并携带code参数
  getRedirectUri: () => {
    const origin = window.location.origin;
    const currentPath = window.location.pathname;
    
    // 回调到当前页面，前端会自动处理URL中的code参数
    // 注意：根路径 / 需要特殊处理，重定向到 /home
    const redirectPath = currentPath === '/' ? '/home' : currentPath;
    return `${origin}${redirectPath}`;
  },
  
  // 二维码样式：black 或 white
  style: 'black',
  
  // 是否在当前页面跳转（建议false，使用后端回调处理）
  selfRedirect: false,
};

export default WECHAT_CONFIG;
