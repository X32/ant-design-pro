/**
 * API配置
 */

const isDev = process.env.NODE_ENV === 'development';

// API基础地址
// 开发环境使用代理，直接使用相对路径
// 生产环境使用实际的API地址
export const API_BASE_URL = isDev ? '' : 'https://your-production-api.com';

// API端点
export const API_ENDPOINTS = {
  // 认证相关 - 开发环境通过proxy代理到 http://localhost:9003
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  CURRENT_USER: `${API_BASE_URL}/api/auth/user`,

  // 音频上传和转写 - 开发环境通过proxy代理到 http://127.0.0.1:9001
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

  // 其他端点可以在这里添加
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
