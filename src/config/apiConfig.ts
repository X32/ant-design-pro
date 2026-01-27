/**
 * API配置
 */

const isDev = process.env.NODE_ENV === 'development';

// 强制打印环境信息用于调试
console.log('========== [apiConfig.ts] 环境信息 ==========');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isDev:', isDev);

// API基础地址
// 开发环境：使用空字符串，通过 proxy.ts 代理到远程服务器
// 生产环境：直接使用远程 API 地址
export const API_BASE_URL = isDev ? '' :  'http://localhost:9002';
// export const API_BASE_URL = isDev ? '' : 'https://api.qtoplay.com';

// 临时强制使用空字符串进行调试
// export const API_BASE_URL = ''; // 强制走 proxy

console.log('API_BASE_URL:', API_BASE_URL);
console.log('================================================\n');

// API端点
export const API_ENDPOINTS = {
  // 认证相关 - 开发环境通过proxy代理到 http://localhost:9003
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  CURRENT_USER: `${API_BASE_URL}/api/auth/user`,
  UPDATE_USER_PROFILE: `${API_BASE_URL}/api/auth/user/profile`,
  UPDATE_USER_PASSWORD: `${API_BASE_URL}/api/auth/user/password`,
  SET_PASSWORD: `${API_BASE_URL}/api/auth/set-password`, // 设置/修改密码（支持两种方式）
  CHANGE_USERNAME: `${API_BASE_URL}/api/auth/change-username`, // 修改用户名

  // 短信验证码登录
  SMS_LOGIN: `${API_BASE_URL}/api/auth/sms/login`,
  SMS_SEND_CODE: `${API_BASE_URL}/api/auth/sms/send`,

  // 忘记密码
  FORGOT_PASSWORD_STEP1: `${API_BASE_URL}/api/auth/forgot-password/step1`, // 验证手机号并发送验证码
  FORGOT_PASSWORD_STEP2: `${API_BASE_URL}/api/auth/forgot-password/step2`, // 验证短信验证码
  FORGOT_PASSWORD_STEP3: `${API_BASE_URL}/api/auth/forgot-password/step3`, // 设置新密码

  // 音频上传和转写 - 开发环境通过proxy代理到 http://127.0.0.1:9002
  UPLOAD_AUDIO: `${API_BASE_URL}/api/upload/upload_audio`,
  TRANSCRIPTION_STATUS: `${API_BASE_URL}/api/upload/transcription_status`,

  // 口语分类管理相关
  ORAL_CATEGORIES: `${API_BASE_URL}/api/oral/categories`,
  ORAL_CATEGORIES_TREE: `${API_BASE_URL}/api/oral/categories/tree`,

  // 练习题管理相关
  ORAL_EXERCISES: `${API_BASE_URL}/api/oral/exercises`,
  ORAL_EXERCISES_SEARCH: `${API_BASE_URL}/api/oral/exercises/search`,

  // 通用文件上传
  UPLOAD: `${API_BASE_URL}/api/upload/upload`,

  // 试卷管理相关
  EXAM_PAPERS: `${API_BASE_URL}/api/exam/papers`,
  EXAM_PAPERS_SEARCH: `${API_BASE_URL}/api/exam/papers/search`,

  // 考试分类管理
  EXAM_CATEGORIES: `${API_BASE_URL}/api/exam/categories`,

  // 根据考试分类获取试卷
  EXAM_PAPERS_BY_CATEGORY: `${API_BASE_URL}/api/exam/papers/by-exam-category`,

  // 用户后台管理（管理员权限）- 开发环境通过proxy代理到 http://localhost:9003
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,

  // 公共考试接口（无需认证）- 开发环境通过proxy代理到 http://localhost:9002
  PUBLIC_EXAM_CATEGORIES: `${API_BASE_URL}/api/exam/public/categories`,
  PUBLIC_EXAM_PAPERS: `${API_BASE_URL}/api/exam/public/papers`,
  PUBLIC_EXAM_PAPER_DETAIL: `${API_BASE_URL}/api/exam/public/papers`, // 动态拼接 paper_id
  PUBLIC_EXAM_PAPER_QUESTIONS: `${API_BASE_URL}/api/exam/public/papers`, // 动态拼接 paper_id/questions

  // 订单管理（管理员权限）
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
  ADMIN_ORDER_DETAIL: `${API_BASE_URL}/api/admin/orders`, // 动态拼接 /{order_no}
  ADMIN_ORDER_WALLET_LOG: `${API_BASE_URL}/api/admin/orders`, // 动态拼接 /{order_no}/wallet_log

  // 订单统计（管理员权限）
  ADMIN_ORDERS_STATS_OVERVIEW: `${API_BASE_URL}/api/admin/orders/statistics/overview`,
  ADMIN_ORDERS_STATS_BY_STATUS: `${API_BASE_URL}/api/admin/orders/statistics/orders_by_status`,
  ADMIN_ORDERS_STATS_TREND: `${API_BASE_URL}/api/admin/orders/statistics/trend`,

  // 商品管理（管理员权限）
  ADMIN_ITEMS: `${API_BASE_URL}/api/admin/items`,
  ADMIN_ITEM_DETAIL: `${API_BASE_URL}/api/admin/items`, // 动态拼接 /{item_id}
  ADMIN_ITEM_STATUS: `${API_BASE_URL}/api/admin/items`, // 动态拼接 /{item_id}/status

  // 钱包管理（管理员权限）
  ADMIN_WALLETS: `${API_BASE_URL}/api/admin/wallets`,
  ADMIN_WALLET_DETAIL: `${API_BASE_URL}/api/admin/wallets`, // 动态拼接 /{user_id}
  ADMIN_WALLET_LOGS: `${API_BASE_URL}/api/admin/wallets`, // 动态拼接 /{user_id}/logs
  ADMIN_WALLET_ADJUST: `${API_BASE_URL}/api/admin/wallets`, // 动态拼接 /{user_id}/adjust
  ADMIN_GLOBAL_WALLET_LOGS: `${API_BASE_URL}/api/admin/wallet_logs/all`, // 全局钱包流水

  // 金币套餐相关
  COIN_PACKAGES: `${API_BASE_URL}/api/order/coin/packages`,

  // 创建金币订单
  CREATE_COIN_ORDER: `${API_BASE_URL}/api/order/coin/create`,

  // 模拟支付
  MOCK_PAY_ORDER: `${API_BASE_URL}/api/order/coin/mock_pay`,

  // 查询订单详情
  ORDER_DETAIL: `${API_BASE_URL}/api/order`,

  // 钱包相关
  WALLET_BALANCE: `${API_BASE_URL}/api/order/wallet/balance`, // 查询金币余额
  WALLET_CONSUME: `${API_BASE_URL}/api/order/wallet/consume`, // 金币支付
  WALLET_RECHARGE_LOGS: `${API_BASE_URL}/api/order/wallet/recharge_logs`, // 查询充值记录
  WALLET_CONSUME_LOGS: `${API_BASE_URL}/api/order/wallet/consume_logs`, // 查询消费记录
  WALLET_ALL_LOGS: `${API_BASE_URL}/api/order/wallet/all_logs`, // 查询所有流水

  // 口语练习会话管理 - 开发环境通过proxy代理到 http://127.0.0.1:9002
  SPOKEN_CONVERSATIONS: `${API_BASE_URL}/api/spoken/conversations`,
  SPOKEN_CONVERSATION_DETAIL: `${API_BASE_URL}/api/spoken/conversations`, // 动态拼接 /{conversation_id}
  SPOKEN_MESSAGES: `${API_BASE_URL}/api/spoken/conversations`, // 动态拼接 /{conversation_id}/messages
  SPOKEN_MESSAGE_TEXT: `${API_BASE_URL}/api/spoken/conversations`, // 动态拼接 /{conversation_id}/messages/text
  SPOKEN_MESSAGE_VOICE: `${API_BASE_URL}/api/spoken/conversations`, // 动态拼接 /{conversation_id}/messages/voice
  SPOKEN_MESSAGE_IMAGE: `${API_BASE_URL}/api/spoken/conversations`, // 动态拼接 /{conversation_id}/messages/image
  SPOKEN_MESSAGE_SCORE: `${API_BASE_URL}/api/spoken/conversations`, // 动态拼接 /{conversation_id}/messages/score
  SPOKEN_MESSAGE_DETAIL: `${API_BASE_URL}/api/spoken/messages`, // 动态拼接 /{message_id}
  SPOKEN_TRANSCRIPTION: `${API_BASE_URL}/api/spoken/messages`, // 动态拼接 /{message_id}/transcription

  // 管理员口语会话管理（包含用户信息）
  ADMIN_CONVERSATIONS: `${API_BASE_URL}/api/spoken/admin/conversations`,

  // 工作流类型管理
  WORKFLOW_TYPES: `${API_BASE_URL}/api/workflow-types/`,

  // 其他端点可以在这里添加
  // 统计管理（管理员权限）
  ADMIN_STATS_OVERVIEW: `${API_BASE_URL}/api/admin/statistics/overview`,
  ADMIN_TOP_ITEMS: `${API_BASE_URL}/api/admin/statistics/top_items`,
  ADMIN_AMOUNT_DISTRIBUTION: `${API_BASE_URL}/api/admin/statistics/amount_distribution`,
  ADMIN_PAYMENT_CHANNELS: `${API_BASE_URL}/api/admin/statistics/payment_channels`,
  ADMIN_USER_GROWTH: `${API_BASE_URL}/api/admin/statistics/user_growth`,
  ADMIN_REVENUE_COMPARISON: `${API_BASE_URL}/api/admin/statistics/revenue_comparison`,
};

// Token配置
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_ID_KEY = 'user_id';
export const CONVERSATION_ID_KEY = 'current_conversation_id';

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_ID_KEY,
  CONVERSATION_ID_KEY,
};
