// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API_ENDPOINTS, TOKEN_KEY } from '@/config/apiConfig';

// 创建自定义请求实例以支持FormData
const formDataRequest = async (url: string, body: FormData, options?: { [key: string]: any }) => {
  return request(url, {
    method: 'POST',
    headers: {
      // 不设置Content-Type，让浏览器自动设置multipart/form-data
      ...(options?.headers || {}), // 合并自定义headers
    },
    data: body,
    timeout: 45000, // 增加超时时间到45秒
    ...(options || {}),
  });
};

// 带重试机制的请求函数
const retryRequest = async (fn: Function, maxRetries: number = 2, delay: number = 1000) => {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      // 只对特定错误类型进行重试
      if (error.name === 'TimeoutError' || 
          error.message?.includes('timeout') || 
          error.response?.status === 504 ||
          error.message?.includes('None response')) {
        lastError = error;
        // 如果不是最后一次尝试，则等待后重试
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          console.log(`请求失败，正在进行第${i + 1}次重试...`);
        }
      } else {
        // 其他错误类型直接抛出
        throw error;
      }
    }
  }
  
  // 所有重试都失败后，抛出最后一次的错误
  throw lastError || new Error('请求失败');
};

/**
 * 获取当前用户信息
 * GET /api/auth/user
 */
export async function currentUser(options?: { [key: string]: any }) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data: {
      user: API.CurrentUser;
    };
  }>(API_ENDPOINTS.CURRENT_USER, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/auth/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  // 将username转换为email以兼容旧表单
  const loginData = {
    email: body.email || body.username,
    password: body.password,
  };
  
  return request<API.LoginResult>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: loginData,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}

/** 获取对话列表 GET /api/v1/conversations/list */
export async function getConversationList(
  params: {
    // query
    /** 用户ID */
    user_id: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.ConversationList>('/api/v1/conversations/list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取会话详情 GET /conversations/{conversation_id} */
export async function getConversationDetail(
  params: {
    // path
    /** 会话ID */
    conversation_id: number;
    // query
    /** 用户ID */
    user_id: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.ConversationDetail>(`/api/v1/conversations/${params.conversation_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      user_id: params.user_id,
    },
    ...(options || {}),
  });
}

/** 删除消息 DELETE /conversations/messages/{message_id} */
export async function deleteMessage(
  params: {
    // path
    /** 消息ID */
    message_id: number;
    // query
    /** 用户ID */
    user_id: number;
  },
  options?: { [key: string]: any },
) {
  return request<void>(`/api/v1/conversations/messages/${params.message_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      user_id: params.user_id,
    },
    ...(options || {}),
  });
}

/** 创建消息 POST /conversations/{conversation_id}/messages */
export async function createMessage(
  params: {
    // path
    /** 会话ID */
    conversation_id: number;
    // query
    /** 用户ID */
    user_id: number;
  },
  body: {
    /** 消息角色 */
    role: 'user' | 'assistant' | 'examiner';
    /** 消息序号 */
    seq: number;
    /** 消息内容列表 */
    contents: Array<{
      /** 内容类型 */
      content_type: string;
      /** 文本内容 */
      text: string;
      /** 内容序号 */
      seq: number;
    }>;
  },
  options?: { [key: string]: any },
) {
  return request<any>(`/api/v1/conversations/${params.conversation_id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      user_id: params.user_id,
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传音频文件并转写为文字 POST /api/upload_audio */
export async function uploadAudioWithTranscription(
  audioBlob: Blob,
  filename: string = 'recording.wav',
  language: 'auto' | 'zh' | 'en' = 'auto',
  userId?: number | string,
  token?: string,
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  
  // 构建URL，添加language参数
  const url = `${API_ENDPOINTS.UPLOAD_AUDIO}?language=${language}`;
  
  // 构建自定义headers，添加用户认证信息
  const customHeaders: Record<string, string> = {};
  if (userId) {
    customHeaders['X-User-ID'] = String(userId);
  }
  if (token) {
    customHeaders['X-Token'] = token;
  }
  
  try {
    // 使用带重试机制的请求函数，传入自定义headers
    const response = await retryRequest(
      () => formDataRequest(url, formData, { 
        ...options, 
        headers: {
          ...customHeaders,
          ...(options?.headers || {})
        }
      }), 
      2, 
      1000
    );
    return response;
  } catch (error: any) {
    // 增强错误处理和用户友好的提示
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      throw new Error('音频上传超时，请检查网络连接或稍后重试');
    }
    if (error.response?.status === 504) {
      throw new Error('网关超时，上传服务器暂时无法访问');
    }
    if (error.message?.includes('None response')) {
      throw new Error('未收到服务器响应，请确认上传服务器是否正常运行');
    }
    if (error.response?.status === 401) {
      throw new Error('认证失败，请检查token是否有效');
    }
    if (error.response?.status >= 500) {
      throw new Error('服务器内部错误，请稍后重试');
    }
    throw new Error(error.message || '音频上传失败，请重试');
  }
}

/** 查询转写状态 GET /api/transcription_status */
export async function getTranscriptionStatus(
  taskId: string,
  options?: { [key: string]: any },
) {
  return request<API.TranscriptionStatusResponse>(`${API_ENDPOINTS.TRANSCRIPTION_STATUS}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      task_id: taskId,
    },
    ...(options || {}),
  });
}

/** 上传音频文件 POST /api/upload */
export async function uploadAudioFile(
  audioBlob: Blob,
  filename: string = 'recording.wav',
  uploadUrl: string = '/api/upload',
  token?: string,
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  
  // 强制使用正确的上传地址，绕过代理冲突
  let url = '/api/upload';
  if (uploadUrl.includes('http')) {
    url = uploadUrl; // 如果提供了完整URL，则使用它
  }
  
  if (token) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}token=${token}`;
  }
  
  try {
    // 使用带重试机制的请求函数
    const response = await retryRequest(() => formDataRequest(url, formData, options), 2, 1000);
    return response;
  } catch (error: any) {
    // 增强错误处理和用户友好的提示
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      throw new Error('音频上传超时，请检查网络连接或稍后重试');
    }
    if (error.response?.status === 504) {
      throw new Error('网关超时，上传服务器暂时无法访问');
    }
    if (error.message?.includes('None response')) {
      throw new Error('未收到服务器响应，请确认上传服务器是否正常运行');
    }
    // 添加更多错误类型处理
    if (error.response?.status === 401) {
      throw new Error('认证失败，请检查token是否有效');
    }
    if (error.response?.status >= 500) {
      throw new Error('服务器内部错误，请稍后重试');
    }
    throw new Error(error.message || '音频上传失败，请重试');
  }
}

// ==================== 口语分类管理 API ====================

/**
 * 口语分类接口类型定义
 */
export interface OralCategory {
  /** 分类ID */
  id: number;
  /** 分类名称 */
  name: string;
  /** 父级分类ID，0表示根分类 */
  parent_id: number;
  /** 分类层级 1/2/3 */
  level: number;
  /** 排序值 */
  sort: number;
  /** 子分类列表 */
  children?: OralCategory[];
  /** 创建时间 */
  create_time?: string;
  /** 更新时间 */
  update_time?: string;
}

/**
 * 口语分类树 API 响应接口
 */
export interface OralCategoryTreeResponse {
  /** 请求是否成功 */
  success: boolean;
  /** 分类树数据 */
  data: OralCategory[];
  /** 数据总数 */
  total?: number;
}

/**
 * 口语分类列表 API 响应接口
 */
export interface OralCategoryListResponse {
  /** 请求是否成功 */
  success: boolean;
  /** 分类列表数据 */
  data: OralCategory[];
  /** 数据总数 */
  total?: number;
}

/**
 * 创建分类请求体
 */
export interface CreateCategoryParams {
  /** 分类名称 */
  name: string;
  /** 父级分类ID，0表示根分类 */
  parent_id: number;
  /** 排序值 */
  sort: number;
}

/**
 * 更新分类请求体
 */
export interface UpdateCategoryParams {
  /** 分类名称（可选） */
  name?: string;
  /** 排序值（可选） */
  sort?: number;
}

/**
 * 获取分类列表查询参数
 */
export interface GetCategoriesParams {
  /** 分类层级 1/2/3（可选） */
  level?: number;
  /** 父级分类ID（可选） */
  parent_id?: number;
}

/**
 * 创建口语分类
 * POST /api/oral/categories
 */
export async function createOralCategory(
  params: CreateCategoryParams,
  options?: { [key: string]: any },
) {
  // 从localStorage获取token
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<OralCategory>(API_ENDPOINTS.ORAL_CATEGORIES, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 获取口语分类列表
 * GET /api/oral/categories
 */
export async function getOralCategories(
  params?: GetCategoriesParams,
  options?: { [key: string]: any },
) {
  // 从localStorage获取token
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<OralCategoryListResponse>(API_ENDPOINTS.ORAL_CATEGORIES, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: params,
    ...(options || {}),
  });
}

/**
 * 获取口语分类树
 * GET /api/oral/categories/tree
 */
export async function getOralCategoriesTree(
  options?: { [key: string]: any },
) {
  // 从localStorage获取token
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<OralCategoryTreeResponse>(API_ENDPOINTS.ORAL_CATEGORIES_TREE, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 更新口语分类
 * PUT /api/oral/categories/{category_id}
 */
export async function updateOralCategory(
  categoryId: number,
  params: UpdateCategoryParams,
  options?: { [key: string]: any },
) {
  // 从localStorage获取token
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<OralCategory>(`${API_ENDPOINTS.ORAL_CATEGORIES}/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 删除口语分类
 * DELETE /api/oral/categories/{category_id}
 * 注意：若存在子分类或关联练习题，将返回 400，无法删除
 */
export async function deleteOralCategory(
  categoryId: number,
  options?: { [key: string]: any },
) {
  // 从LocalStorage获取token
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<void>(`${API_ENDPOINTS.ORAL_CATEGORIES}/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

// ==================== 练习题管理相关 API ====================

/**
 * 练习题接口
 * 对应 API 返回的练习题数据结构
 */
export interface OralExercise {
  id: number;
  category_id: number;
  title: string;
  content: string;
  image_url?: string;
  difficulty: number;
  is_active: number;
  create_time?: string;
  update_time?: string;
}

/**
 * 练习题列表响应
 */
export interface OralExerciseListResponse {
  success: boolean;
  data: OralExercise[];
  total?: number;
}

/**
 * 练习题详情响应
 */
export interface OralExerciseDetailResponse {
  success: boolean;
  data: OralExercise;
}

/**
 * 创建练习题请求参数
 */
export interface CreateOralExerciseParams {
  category_id: number;
  title: string;
  content: string;
  image_url?: string;
  difficulty?: number;
  is_active?: number;
}

/**
 * 更新练习题请求参数
 * PUT /api/oral/exercises/{exercise_id}
 */
export interface UpdateOralExerciseParams {
  category_id?: number;
  title?: string;
  content?: string;
  image_url?: string;
  difficulty?: number;
  is_active?: number;
}

/**
 * 获取练习题列表查询参数
 * GET /api/oral/exercises
 */
export interface GetOralExercisesParams {
  /** 分类ID（必填，三级分类ID） */
  category_id: number;
  /** 是否仅返回启用题目，默认 true */
  only_active?: boolean;
}

/**
 * 获取练习题列表
 * GET /api/oral/exercises
 */
export async function getOralExercises(
  params?: GetOralExercisesParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<OralExerciseListResponse>(API_ENDPOINTS.ORAL_EXERCISES, {
    method: 'GET',
    params: params,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 获取练习题详情
 * GET /api/oral/exercises/{exercise_id}
 */
export async function getOralExerciseDetail(
  exerciseId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<OralExerciseDetailResponse>(`${API_ENDPOINTS.ORAL_EXERCISES}/${exerciseId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 创建练习题
 * POST /api/oral/exercises
 */
export async function createOralExercise(
  params: CreateOralExerciseParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<OralExerciseDetailResponse>(API_ENDPOINTS.ORAL_EXERCISES, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 更新练习题
 * PUT /api/oral/exercises/{exercise_id}
 */
export async function updateOralExercise(
  exerciseId: number,
  params: UpdateOralExerciseParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<OralExerciseDetailResponse>(`${API_ENDPOINTS.ORAL_EXERCISES}/${exerciseId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 删除练习题
 * DELETE /api/oral/exercises/{exercise_id}
 */
export async function deleteOralExercise(
  exerciseId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<void>(`${API_ENDPOINTS.ORAL_EXERCISES}/${exerciseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 搜索练习题查询参数
 */
export interface SearchOralExercisesParams {
  /** 标题关键词（必填），支持模糊搜索 */
  title: string;
  /** 分类ID（可选），限定在某分类下搜索 */
  category_id?: number;
  /** 是否仅返回启用题目，默认 true */
  only_active?: boolean;
  /** 页码，默认 1 */
  page?: number;
  /** 每页数量，默认 20，最大 100 */
  page_size?: number;
}

/**
 * 搜索练习题响应
 */
export interface SearchOralExercisesResponse {
  success: boolean;
  message?: string;
  data: OralExercise[];
  total: number;
}

/**
 * 搜索练习题（按标题关键词）
 * GET /api/oral/exercises/search
 */
export async function searchOralExercises(
  params: SearchOralExercisesParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<SearchOralExercisesResponse>(API_ENDPOINTS.ORAL_EXERCISES_SEARCH, {
    method: 'GET',
    params: params,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

// ==================== 通用文件上传 API ====================

/**
 * 文件上传响应接口
 */
export interface UploadResponse {
  success: boolean;
  message?: string;
  url?: string;        // 上传成功后的文件URL
  file_path?: string;  // 文件路径
}

/**
 * 通用文件上传
 * POST /api/upload
 * @param file 要上传的文件
 * @param options 额外选项
 */
export async function uploadFile(
  file: File | Blob,
  filename?: string,
  options?: { [key: string]: any },
): Promise<UploadResponse> {
  const token = localStorage.getItem(TOKEN_KEY);
  const formData = new FormData();
  
  if (file instanceof File) {
    formData.append('file', file, filename || file.name);
  } else {
    formData.append('file', file, filename || 'upload');
  }
  
  return request<UploadResponse>(API_ENDPOINTS.UPLOAD, {
    method: 'POST',
    data: formData,
    headers: {
      'Authorization': `Bearer ${token}`,
      // 不设置Content-Type，让浏览器自动设置multipart/form-data
    },
    ...(options || {}),
  });
}

// ==================== 试卷管理 API ====================

/**
 * 试卷接口
 */
export interface ExamPaper {
  id: number;
  paper_code: string;
  paper_name: string;
  total_score: number;
  apply_category_id: number;
  is_active: number;
  create_time?: string;
  update_time?: string;
}

/**
 * 创建试卷请求参数
 */
export interface CreateExamPaperParams {
  paper_code: string;
  paper_name: string;
  total_score?: number;
  apply_category_id?: number;
  is_active?: number;
}

/**
 * 更新试卷请求参数
 */
export interface UpdateExamPaperParams {
  paper_name?: string;
  total_score?: number;
  apply_category_id?: number;
  exam_category_id?: number;
  is_active?: number;
}

/**
 * 试卷列表响应
 */
export interface ExamPaperListResponse {
  success: boolean;
  message?: string;
  data: ExamPaper[];
  total: number;
}

/**
 * 试卷详情响应
 */
export interface ExamPaperDetailResponse {
  success: boolean;
  message?: string;
  data: ExamPaper;
}

/**
 * 试卷题目关联接口
 */
export interface PaperQuestion {
  id: number;
  paper_id: number;
  exercise_id: number;
  question_score: number;
  sort: number;
  exercise?: {
    id?: number;
    category_id: number;
    title: string;
    content: string;
    image_url?: string;
    difficulty: number;
    is_active: number;
  };
  create_time?: string;
  update_time?: string;
}

/**
 * 试卷题目列表响应
 */
export interface PaperQuestionListResponse {
  success: boolean;
  message?: string;
  data: PaperQuestion[];
  total: number;
}

/**
 * 添加题目到试卷请求参数
 */
export interface AddQuestionToPaperParams {
  exercise_id: number;
  question_score?: number;
  sort?: number;
}

/**
 * 获取试卷列表
 * GET /api/exam/papers
 */
export async function getExamPapers(
  params?: {
    apply_category_id?: number;
    only_active?: boolean;
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<ExamPaperListResponse>(API_ENDPOINTS.EXAM_PAPERS, {
    method: 'GET',
    params: params,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 搜索试卷
 * GET /api/exam/papers/search
 */
export async function searchExamPapers(
  params?: {
    keyword?: string;
    apply_category_id?: number;
    only_active?: boolean;
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<ExamPaperListResponse>(API_ENDPOINTS.EXAM_PAPERS_SEARCH, {
    method: 'GET',
    params: params,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 获取试卷详情
 * GET /api/exam/papers/{paper_id}
 */
export async function getExamPaperDetail(
  paperId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<ExamPaperDetailResponse>(`${API_ENDPOINTS.EXAM_PAPERS}/${paperId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 创建试卷
 * POST /api/exam/papers
 */
export async function createExamPaper(
  params: CreateExamPaperParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<ExamPaperDetailResponse>(API_ENDPOINTS.EXAM_PAPERS, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 更新试卷
 * PUT /api/exam/papers/{paper_id}
 */
export async function updateExamPaper(
  paperId: number,
  params: UpdateExamPaperParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<ExamPaperDetailResponse>(`${API_ENDPOINTS.EXAM_PAPERS}/${paperId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 删除试卷
 * DELETE /api/exam/papers/{paper_id}
 */
export async function deleteExamPaper(
  paperId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string }>(`${API_ENDPOINTS.EXAM_PAPERS}/${paperId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 获取试卷所有题目
 * GET /api/exam/papers/{paper_id}/questions
 */
export async function getPaperQuestions(
  paperId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<PaperQuestionListResponse>(`${API_ENDPOINTS.EXAM_PAPERS}/${paperId}/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 添加题目到试卷
 * POST /api/exam/papers/{paper_id}/questions
 */
export async function addQuestionToPaper(
  paperId: number,
  params: AddQuestionToPaperParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data?: { record_id: number } }>(
    `${API_ENDPOINTS.EXAM_PAPERS}/${paperId}/questions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: params,
      ...(options || {}),
    },
  );
}

/**
 * 批量添加题目到试卷
 * POST /api/exam/papers/{paper_id}/questions/batch
 */
export async function batchAddQuestionsToPaper(
  paperId: number,
  questions: AddQuestionToPaperParams[],
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data?: { record_ids: number[]; total: number; success: number } }>(
    `${API_ENDPOINTS.EXAM_PAPERS}/${paperId}/questions/batch`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { questions },
      ...(options || {}),
    },
  );
}

/**
 * 更新试卷中题目信息
 * PUT /api/exam/papers/{paper_id}/questions/{exercise_id}
 */
export async function updatePaperQuestion(
  paperId: number,
  exerciseId: number,
  params: { question_score?: number; sort?: number },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string }>(
    `${API_ENDPOINTS.EXAM_PAPERS}/${paperId}/questions/${exerciseId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: params,
      ...(options || {}),
    },
  );
}

/**
 * 从试卷移除题目
 * DELETE /api/exam/papers/{paper_id}/questions/{exercise_id}
 */
export async function removeQuestionFromPaper(
  paperId: number,
  exerciseId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string }>(
    `${API_ENDPOINTS.EXAM_PAPERS}/${paperId}/questions/${exerciseId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    },
  );
}

// ==================== 考试分类管理接口 ====================

/**
 * 考试分类接口类型
 */
export interface ExamCategory {
  id: number;
  name: string;
  description?: string;
  sort: number;
  is_active: number;
  create_time?: string;
  update_time?: string;
}

/**
 * 创建考试分类参数
 */
export interface CreateExamCategoryParams {
  name: string;
  description?: string;
  sort?: number;
  is_active?: number;
}

/**
 * 更新考试分类参数
 */
export interface UpdateExamCategoryParams {
  name?: string;
  description?: string;
  sort?: number;
  is_active?: number;
}

/**
 * 获取考试分类列表
 * GET /api/exam/categories
 */
export async function getExamCategories(
  params?: {
    only_active?: boolean;
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: ExamCategory[];
    total?: number;
    message?: string;
  }>(API_ENDPOINTS.EXAM_CATEGORIES, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params,
    ...(options || {}),
  });
}

/**
 * 获取考试分类详情
 * GET /api/exam/categories/{category_id}
 */
export async function getExamCategoryDetail(
  categoryId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: ExamCategory;
    message?: string;
  }>(`${API_ENDPOINTS.EXAM_CATEGORIES}/${categoryId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/**
 * 创建考试分类
 * POST /api/exam/categories
 */
export async function createExamCategory(
  params: CreateExamCategoryParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: ExamCategory;
    message?: string;
  }>(API_ENDPOINTS.EXAM_CATEGORIES, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 更新考试分类
 * PUT /api/exam/categories/{category_id}
 */
export async function updateExamCategory(
  categoryId: number,
  params: UpdateExamCategoryParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: ExamCategory;
    message?: string;
  }>(`${API_ENDPOINTS.EXAM_CATEGORIES}/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 删除考试分类（软删除）
 * DELETE /api/exam/categories/{category_id}
 */
export async function deleteExamCategory(
  categoryId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message?: string;
  }>(`${API_ENDPOINTS.EXAM_CATEGORIES}/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/**
 * 根据考试分类ID获取试卷列表
 * GET /api/exam/papers/by-exam-category
 */
export async function getExamPapersByCategory(
  params: {
    exam_category_id: number;
    only_active?: boolean;
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: ExamPaper[];
    total?: number;
    message?: string;
  }>(API_ENDPOINTS.EXAM_PAPERS_BY_CATEGORY, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params,
    ...(options || {}),
  });
}
