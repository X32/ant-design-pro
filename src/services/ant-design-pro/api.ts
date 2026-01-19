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

/** 更新用户个人信息 */
export async function updateUserProfile(
  data: { email?: string; name?: string },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message?: string;
    data?: any;
  }>(API_ENDPOINTS.UPDATE_USER_PROFILE, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}

/** 修改用户密码 */
export async function updateUserPassword(
  data: { old_password: string; new_password: string },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message?: string;
  }>(API_ENDPOINTS.UPDATE_USER_PASSWORD, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}

/**
 * 设置/修改密码（支持两种方式）
 * POST /api/auth/set-password
 * 
 * 方式1：首次设置密码（不需要旧密码）
 * 参数：{ new_password: string }
 * 
 * 方式2：修改密码（需要旧密码）
 * 参数：{ old_password: string, new_password: string }
 */
export async function setPassword(
  data: {
    new_password: string;
    old_password?: string;  // 可选，如果提供则会验证旧密码
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message: string;
    data?: {
      is_first_set?: boolean;  // 是否首次设置密码
    };
  }>(API_ENDPOINTS.SET_PASSWORD, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}

/**
 * 修改用户名
 * POST /api/auth/change-username
 * 
 * @param data.new_username - 新的用户名
 */
export async function changeUsername(
  data: {
    new_username: string;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message: string;
    data?: {
      user: {
        id: number;
        email: string;
        username: string;
        phone: string | null;
        is_active: number;
        is_superuser: number;
        created_at: string;
        updated_at: string;
      };
      username_updated: boolean;
      old_username: string;
      new_username: string;
    };
  }>(API_ENDPOINTS.CHANGE_USERNAME, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
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
  const loginData = {
    username: body.email,  // 表单字段名仍为email，但发送时使用username
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

/**
 * 发送短信验证码
 * POST /api/auth/sms/send
 */
export async function sendSmsCode(
  params: {
    phone_number: string;
  },
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    message: string;
    data?: {
      phone_number: string;
      expire_minutes: number;      // 验证码有效期（分钟）
      remaining_seconds: number;   // 剩余有效时间（秒）
    };
  }>(API_ENDPOINTS.SMS_SEND_CODE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 短信验证码登录
 * POST /api/auth/sms/login
 */
export async function smsLogin(
  params: {
    phone_number: string;
    code: string;
  },
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    message: string;
    data: {
      access_token: string;
      token_type: string;
      user: {
        id: number;
        email: string;
        is_active: boolean;
        is_superuser: boolean;
      };
      phone_number: string;
      login_method: string;
      auto_registered?: boolean; // 是否首次登录自动注册
    };
  }>(API_ENDPOINTS.SMS_LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 忘记密码 Step1: 验证手机号并发送验证码
 * POST /api/auth/forgot-password/step1
 */
export async function forgotPasswordStep1(
  params: {
    phone_number: string;
  },
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    message: string;
    data?: {
      phone_number: string;
      user_id: number;
      expire_minutes: number;
      remaining_seconds: number;
      next_step: string;
    };
  }>(API_ENDPOINTS.FORGOT_PASSWORD_STEP1, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 忘记密码 Step2: 验证短信验证码
 * POST /api/auth/forgot-password/step2
 */
export async function forgotPasswordStep2(
  params: {
    phone_number: string;
    code: string;
  },
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    message: string;
    data?: {
      phone_number: string;
      user_id: number;
      verified: boolean;
      next_step: string;
    };
  }>(API_ENDPOINTS.FORGOT_PASSWORD_STEP2, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 忘记密码 Step3: 设置新密码
 * POST /api/auth/forgot-password/step3
 */
export async function forgotPasswordStep3(
  params: {
    phone_number: string;
    code: string;
    new_password: string;
  },
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    message: string;
    data?: {
      access_token: string;
      token_type: string;
      user: {
        id: number;
        email: string;
        phone: string;
        is_active: boolean;
        is_superuser: boolean;
        created_at: string;
        updated_at: string;
      };
      phone_number: string;
      password_reset: boolean;
    };
  }>(API_ENDPOINTS.FORGOT_PASSWORD_STEP3, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}

/**
 * 查询金币余额
 * GET /api/order/wallet/balance
 */
export async function getWalletBalance(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message: string;
    data: {
      user_id: number;
      balance: number;          // 可用余额（金币数量）
      frozen_balance: number;   // 冻结余额
      exists: boolean;          // 钱包是否存在
    };
  }>(API_ENDPOINTS.WALLET_BALANCE, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 金币支付
 * POST /api/order/wallet/consume
 * 
 * @param params.coin_amount - 消费金币数量（必须大于0）
 * @param params.biz_type - 业务类型：consume_conversation | consume_practice | consume_exam
 * @param params.biz_id - 业务ID（关联的业务记录ID）
 * @param params.remark - 备注说明（可选）
 */
export async function consumeCoins(
  params: {
    coin_amount: number;
    biz_type: 'consume_conversation' | 'consume_practice' | 'consume_exam';
    biz_id: number;
    remark?: string;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message: string;
    data: {
      user_id: number;
      consumed_amount: number;   // 本次消费的金币数量
      balance_before: number;    // 消费前余额
      balance_after: number;     // 消费后余额
      log_id: number;            // 钱包流水记录ID
      biz_type: string;          // 业务类型
      biz_id: number;            // 业务ID
    };
  }>(API_ENDPOINTS.WALLET_CONSUME, {
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
 * 查询充值记录
 * GET /api/order/wallet/recharge_logs
 * 
 * 只返回 change_amount > 0 的充值流水
 * 
 * @param params.page - 页码（从1开始，默认1）
 * @param params.page_size - 每页数量（默认20，最大100）
 */
export async function getRechargeLog(
  params?: {
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message: string;
    logs: Array<{
      id: number;
      change_amount: number;      // 变动金额（正数=充值）
      balance_before: number;     // 变动前余额
      balance_after: number;      // 变动后余额
      biz_type: string;           // 业务类型（recharge_order）
      remark: string;             // 备注说明
      created_at: string;         // 创建时间
    }>;
    total: number;               // 充值记录总数
    page: number;                // 当前页码
    page_size: number;           // 每页数量
  }>(API_ENDPOINTS.WALLET_RECHARGE_LOGS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params,
    ...(options || {}),
  });
}

/**
 * 查询消费记录
 * GET /api/order/wallet/consume_logs
 * 
 * 只返回 change_amount < 0 的消费流水
 * 
 * @param params.page - 页码（从1开始，默认1）
 * @param params.page_size - 每页数量（默认20，最大100）
 */
export async function getConsumeLog(
  params?: {
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message: string;
    logs: Array<{
      id: number;
      change_amount: number;      // 变动金额（负数=消费）
      balance_before: number;     // 变动前余额
      balance_after: number;      // 变动后余额
      biz_type: string;           // 业务类型（consume_*）
      remark: string;             // 备注说明
      created_at: string;         // 创建时间
    }>;
    total: number;               // 消费记录总数
    page: number;                // 当前页码
    page_size: number;           // 每页数量
  }>(API_ENDPOINTS.WALLET_CONSUME_LOGS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params,
    ...(options || {}),
  });
}

/**
 * 查询所有流水
 * GET /api/order/wallet/all_logs
 * 
 * 返回所有流水记录（包括充值和消费）
 * 
 * @param params.page - 页码（从1开始，默认1）
 * @param params.page_size - 每页数量（默认20，最大100）
 */
export async function getAllWalletLog(
  params?: {
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message: string;
    logs: Array<{
      id: number;
      change_amount: number;      // 变动金额（正数=充值，负数=消费）
      balance_before: number;     // 变动前余额
      balance_after: number;      // 变动后余额
      biz_type: string;           // 业务类型
      remark: string;             // 备注说明
      created_at: string;         // 创建时间
    }>;
    total: number;               // 记录总数
    page: number;                // 当前页码
    page_size: number;           // 每页数量
  }>(API_ENDPOINTS.WALLET_ALL_LOGS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params,
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
  workflow_type?: string;
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
  workflow_type?: string;
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
  workflow_type?: string;
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
  workflow_type?: string;
  exercise?: {
    id?: number;
    category_id: number;
    title: string;
    content: string;
    image_url?: string | null;
    workflow_type?: string;
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

// ==================== 用户管理 API ====================

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

/**
 * 创建用户参数
 */
export interface CreateUserParams {
  email: string;
  password: string;
  is_superuser?: boolean;
}

/**
 * 更新用户参数
 */
export interface UpdateUserParams {
  email?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

/**
 * 获取用户列表（分页）
 * GET /api/admin/users
 */
export async function getUserList(
  params?: {
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: {
      users: UserInfo[];
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    };
    message?: string;
  }>(API_ENDPOINTS.ADMIN_USERS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params,
    ...(options || {}),
  });
}

/**
 * 获取单个用户详情
 * GET /api/admin/users/{user_id}
 */
export async function getUserDetail(
  userId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: {
      user: UserInfo;
    };
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 创建用户（后台）
 * POST /api/admin/users
 */
export async function createUser(
  params: CreateUserParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: {
      user: UserInfo;
    };
    message?: string;
  }>(API_ENDPOINTS.ADMIN_USERS, {
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
 * 更新用户信息
 * PUT /api/admin/users/{user_id}
 */
export async function updateUser(
  userId: number,
  params: UpdateUserParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: {
      user: UserInfo;
    };
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`, {
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
 * 删除用户（软删除）
 * DELETE /api/admin/users/{user_id}
 */
export async function deleteUser(
  userId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: {
      message: string;
    };
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/**
 * 获取统计信息
 * GET /api/admin/stats
 */
export async function getAdminStats(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    data?: {
      total_users: number;
      active_users: number;
    };
    message?: string;
  }>(API_ENDPOINTS.ADMIN_STATS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

// ==================== 公共考试接口（无需认证）====================

/** 获取公开的考试分类列表 */
export async function getPublicExamCategories(
  params?: {
    only_active?: boolean;
  },
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    data: any[];
    total: number;
    message?: string;
  }>(API_ENDPOINTS.PUBLIC_EXAM_CATEGORIES, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 获取公开的试卷列表 */
export async function getPublicExamPapers(
  params?: {
    exam_category_id?: number;
    apply_category_id?: number;
    only_active?: boolean;
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    data: any[];
    total: number;
    message?: string;
  }>(API_ENDPOINTS.PUBLIC_EXAM_PAPERS, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 获取公开的试卷详情 */
export async function getPublicExamPaperDetail(
  paperId: number,
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    data: any;
    message?: string;
  }>(`${API_ENDPOINTS.PUBLIC_EXAM_PAPER_DETAIL}/${paperId}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取公开的试卷题目列表 */
export async function getPublicExamPaperQuestions(
  paperId: number,
  options?: { [key: string]: any },
) {
  return request<{
    success: boolean;
    data: any[];
    total: number;
    message?: string;
  }>(`${API_ENDPOINTS.PUBLIC_EXAM_PAPER_QUESTIONS}/${paperId}/questions`, {
    method: 'GET',
    ...(options || {}),
  });
}

// ==================== 订单管理 API ====================

/** 订单列表查询参数 */
export interface AdminOrderParams {
  page?: number;
  page_size?: number;
  status?: string;  // CREATED/PAID/COMPLETED/CANCELED
  user_id?: number;
  order_no?: string;
  start_date?: string;  // YYYY-MM-DD
  end_date?: string;    // YYYY-MM-DD
  sort_by?: string;     // created_at/updated_at/total_amount/user_id/id
  sort_order?: string;  // asc/desc
}

/** 订单数据类型 */
export interface OrderItem {
  id: number;
  order_no: string;
  user_id: number;
  user_email: string;
  item_name: string;
  coin_amount: number;
  total_amount: number;  // 单位：分
  status: string;        // CREATED/PAID/COMPLETED/CANCELED
  pay_channel: string;
  created_at: string;
  updated_at: string;
  has_wallet_log: boolean;
}

/** 订单详情类型 */
export interface OrderDetail {
  order: {
    id: number;
    order_no: string;
    user_id: number;
    item_id: number;
    item_name: string;
    coin_amount: number;
    item_price: number;
    quantity: number;
    total_amount: number;
    status: string;
    pay_channel: string;
    pay_order_no: string;
    expired_at: string;
    created_at: string;
    updated_at: string;
  };
  user: {
    user_id: number;
    email: string;
    created_at: string;
    is_active: boolean;
    current_balance: number;
    total_orders: number;
    total_recharge_amount: number;
  };
  wallet_logs: Array<{
    id: number;
    change_amount: number;
    balance_before: number;
    balance_after: number;
    biz_type: string;
    biz_id: number;
    remark: string;
    created_at: string;
  }>;
  has_wallet_log: boolean;
}

/** 统计概览数据类型 */
export interface OrderStatsOverview {
  today: {
    orders: number;
    amount: number;
    users: number;
    success_rate: number;
  };
  total: {
    orders: number;
    amount: number;
    users: number;
    avg_amount: number;
  };
  current: {
    pending_orders: number;
    abnormal_orders: number;
    total_balance: number;
  };
}

/** 订单趋势数据类型 */
export interface OrderTrendItem {
  date: string;
  orders: number;
  amount: number;
  completed_orders: number;
}

/** 获取订单列表（管理员） */
export async function getAdminOrders(
  params: AdminOrderParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: OrderItem[];
    total: number;
    page: number;
    page_size: number;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_ORDERS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params,
    ...(options || {}),
  });
}

/** 获取订单详情（管理员） */
export async function getAdminOrderDetail(
  orderNo: string,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: OrderDetail;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_ORDER_DETAIL}/${orderNo}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 获取订单钱包流水（管理员） */
export async function getAdminOrderWalletLog(
  orderNo: string,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: any;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_ORDER_WALLET_LOG}/${orderNo}/wallet_log`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 获取订单统计概览 */
export async function getOrderStatsOverview(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: OrderStatsOverview;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_ORDERS_STATS_OVERVIEW, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 获取订单状态分布 */
export async function getOrderStatsByStatus(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: Record<string, { count: number; total_amount: number }>;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_ORDERS_STATS_BY_STATUS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 获取订单趋势数据 */
export async function getOrderStatsTrend(
  days: number = 30,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: {
      days: number;
      trend: OrderTrendItem[];
    };
    message?: string;
  }>(API_ENDPOINTS.ADMIN_ORDERS_STATS_TREND, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params: { days },
    ...(options || {}),
  });
}

// ==================== 商品管理 API ====================

/** 商品数据类型 */
export interface ProductItem {
  id: number;
  item_type: string;
  name: string;
  description: string;
  coin_amount: number;
  price: number;        // 单位：分
  currency: string;
  status: number;       // 1=上架，0=下架
  status_label: string;
  created_at: string;
  updated_at: string;
}

/** 创建/更新商品参数 */
export interface ProductFormData {
  name: string;
  description?: string;
  coin_amount: number;
  price: number;
  currency?: string;
  status?: number;
}

/** 获取商品列表 */
export async function getAdminItems(
  params?: { item_type?: string; status?: number },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: ProductItem[];
    total: number;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_ITEMS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params,
    ...(options || {}),
  });
}

/** 获取商品详情 */
export async function getAdminItemDetail(
  itemId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: ProductItem;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_ITEM_DETAIL}/${itemId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 创建商品 */
export async function createAdminItem(
  data: ProductFormData,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: ProductItem;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_ITEMS, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}

/** 更新商品 */
export async function updateAdminItem(
  itemId: number,
  data: Partial<ProductFormData>,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: ProductItem;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_ITEM_DETAIL}/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}

/** 更新商品状态（上架/下架） */
export async function updateAdminItemStatus(
  itemId: number,
  status: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_ITEM_STATUS}/${itemId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: { status },
    ...(options || {}),
  });
}

/** 删除商品（软删除） */
export async function deleteAdminItem(
  itemId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_ITEM_DETAIL}/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

// ==================== 钱包管理 API ====================

/** 钱包列表数据类型 */
export interface WalletItem {
  id: number;
  user_id: number;
  email: string;
  username: string;
  balance: number;
  frozen_balance: number;
  total_recharge: number;
  total_consume: number;
  last_transaction_time: string;
  created_at: string;
  updated_at: string;
}

/** 钱包列表查询参数 */
export interface WalletListParams {
  page?: number;
  page_size?: number;
  min_balance?: number;
  max_balance?: number;
  user_id?: number;
  user_email?: string;
  sort_by?: string;     // balance/frozen_balance/created_at/updated_at/user_id
  sort_order?: string;  // asc/desc
}

/** 钱包详情数据类型 */
export interface WalletDetail {
  wallet: {
    id: number;
    user_id: number;
    balance: number;
    frozen_balance: number;
    created_at: string;
    updated_at: string;
  };
  user: {
    user_id: number;
    email: string;
    username: string;
    is_active: boolean;
    created_at: string;
  };
  statistics: {
    total_recharge: number;
    total_consume: number;
    transaction_count: number;
    last_transaction_time: string;
  };
}

/** 钱包流水数据类型 */
export interface WalletLog {
  id: number;
  user_id: number;
  change_amount: number;
  balance_before: number;
  balance_after: number;
  biz_type: string;  // recharge_order/consume/admin_adjust/refund
  biz_id: number;
  remark: string;
  created_at: string;
}

/** 钱包调整参数 */
export interface WalletAdjustParams {
  change_amount: number;
  remark: string;
}

/** 获取钱包列表 */
export async function getAdminWallets(
  params?: WalletListParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: WalletItem[];
    total: number;
    page: number;
    page_size: number;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_WALLETS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params,
    ...(options || {}),
  });
}

/** 获取钱包详情 */
export async function getAdminWalletDetail(
  userId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: WalletDetail;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_WALLET_DETAIL}/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 获取钱包流水 */
export async function getAdminWalletLogs(
  userId: number,
  params?: { page?: number; page_size?: number },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: WalletLog[];
    total: number;
    page: number;
    page_size: number;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_WALLET_LOGS}/${userId}/logs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params,
    ...(options || {}),
  });
}

/** 手动调整钱包余额 */
export async function adjustAdminWallet(
  userId: number,
  data: WalletAdjustParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    message?: string;
  }>(`${API_ENDPOINTS.ADMIN_WALLET_ADJUST}/${userId}/adjust`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}

/** 全局钱包流水查询参数 */
export interface GlobalWalletLogParams {
  user_id?: number;
  start_date?: string;  // YYYY-MM-DD
  end_date?: string;    // YYYY-MM-DD
  biz_type?: string;    // recharge_order/consume/admin_adjust/refund
  min_amount?: number;
  max_amount?: number;
  page?: number;
  page_size?: number;
}

/** 获取全局钱包流水 */
export async function getGlobalWalletLogs(
  params?: GlobalWalletLogParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: WalletLog[];
    total: number;
    page: number;
    page_size: number;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_GLOBAL_WALLET_LOGS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params,
    ...(options || {}),
  });
}
// ==================== 统计管理 API ====================

/** 统计概览数据类型 */
export interface StatsOverview {
  today: {
    orders: number;
    amount: number;  // 单位：分
    users: number;
    success_rate: number;
  };
  total: {
    orders: number;
    amount: number;  // 单位：分
    users: number;
    avg_amount: number;  // 单位：分
  };
  current: {
    pending_orders: number;
    abnormal_orders: number;
    total_balance: number;  // 单位：分
    online_users: number;
  };
}

/** 热门商品数据类型 */
export interface TopItem {
  item_name: string;
  sales_count: number;
  total_sales: number;  // 单位：分
}

/** 金额分布数据类型 */
export interface AmountDistributionItem {
  range: string;
  count: number;
  total_amount: number;  // 单位：分
}

/** 支付渠道数据类型 */
export interface PaymentChannelItem {
  channel: string;
  count: number;
  total_amount: number;  // 单位：分
  completed_count: number;
}

/** 用户增长数据类型 */
export interface UserGrowthItem {
  date: string;
  new_users: number;
}

/** 收入对比数据类型 */
export interface RevenueComparison {
  current: {
    revenue: number;  // 单位：分
    orders: number;
  };
  previous: {
    revenue: number;  // 单位：分
    orders: number;
  };
  growth: {
    revenue_growth: number;  // 百分比
    orders_growth: number;   // 百分比
  };
}

/** 获取统计概览 */
export async function getAdminStatsOverview(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{
    success: boolean;
    data: StatsOverview;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_STATS_OVERVIEW, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 获取热门商品排行 */
export async function getAdminTopItems(
  limit: number = 10,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{ 
    success: boolean;
    data: { items: TopItem[] };
    message?: string;
  }>(API_ENDPOINTS.ADMIN_TOP_ITEMS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params: { limit },
    ...(options || {}),
  });
}

/** 获取金额分布统计 */
export async function getAdminAmountDistribution(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{ 
    success: boolean;
    data: { distribution: AmountDistributionItem[] };
    message?: string;
  }>(API_ENDPOINTS.ADMIN_AMOUNT_DISTRIBUTION, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 获取支付渠道分布 */
export async function getAdminPaymentChannels(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{ 
    success: boolean;
    data: { channels: PaymentChannelItem[] };
    message?: string;
  }>(API_ENDPOINTS.ADMIN_PAYMENT_CHANNELS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

/** 获取用户增长趋势 */
export async function getAdminUserGrowth(
  days: number = 30,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{ 
    success: boolean;
    data: { growth: UserGrowthItem[] };
    message?: string;
  }>(API_ENDPOINTS.ADMIN_USER_GROWTH, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params: { days },
    ...(options || {}),
  });
}

/** 获取收入对比统计 */
export async function getAdminRevenueComparison(
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);

  return request<{ 
    success: boolean;
    data: RevenueComparison;
    message?: string;
  }>(API_ENDPOINTS.ADMIN_REVENUE_COMPARISON, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    ...(options || {}),
  });
}

// ==================== 金币套餐管理 API ====================

/** 金币套餐数据类型 */
export interface CoinPackage {
  id: number;
  name: string;
  description: string;
  coin_amount: number;
  price: number;
  currency: string;
}

/** 金币套餐列表响应类型 */
export interface CoinPackageListResponse {
  success: boolean;
  data: CoinPackage[];
  total: number;
  message?: string;
}

/** 获取金币套餐列表
 * GET /api/order/coin/packages
 */
export async function getCoinPackages(
  options?: { [key: string]: any },
) {
  return request<CoinPackageListResponse>(API_ENDPOINTS.COIN_PACKAGES, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

// ==================== 口语练习会话管理 API ====================

/** 口语会话数据类型 */
export interface SpokenConversation {
  id: number;
  user_id: number;
  user_email?: string;              // 🆕 管理员接口返回：用户邮箱
  user_is_superuser?: boolean;      // 🆕 管理员接口返回：是否超级用户
  exercise_id?: number;
  workflow_type?: string;
  title?: string;
  status: 'active' | 'completed' | 'archived';
  total_messages: number;
  total_rounds: number;
  last_message_time?: string;
  created_at: string;
  updated_at?: string;
  last_message_preview?: string;
}

/** 口语消息数据类型 */
export interface SpokenMessage {
  id: number;
  conversation_id: number;
  user_id: number;
  sender: 'user' | 'ai';
  message_type: 'text' | 'voice' | 'image' | 'score';
  content: string;
  round_num?: number;
  timestamp: string;
  audio_file_path?: string;
  audio_url?: string;
  transcription_text?: string;
  transcription_status?: 'pending' | 'processing' | 'done' | 'failed';
  image_url?: string;
  total_score?: string;
  dimension_scores?: string;
  advantages?: string;
  disadvantages?: string;
  suggestions?: string;
  improved_answer?: string;
  raw_text?: string;
}

/** 创建口语会话请求参数 */
export interface CreateSpokenConversationParams {
  exercise_id?: number;
  workflow_type?: string;
  title?: string;
}

/** 创建口语会话响应 */
export interface CreateSpokenConversationResponse {
  success: boolean;
  message?: string;
  data: SpokenConversation;
}

/** 获取口语会话列表响应 */
export interface GetSpokenConversationsResponse {
  success: boolean;
  data: SpokenConversation[];
  total: number;
}

/** 获取口语消息列表响应 */
export interface GetSpokenMessagesResponse {
  success: boolean;
  data: SpokenMessage[];
  total: number;
  conversation?: {
    id: number;
    title?: string;
    status: string;
  };
  message?: string;
  error_code?: string;
}

/** 创建文本消息请求参数 */
export interface CreateTextMessageParams {
  sender: 'user' | 'ai';
  content: string;
  round_num?: number;
  created_at?: string;
}

/** 创建语音消息请求参数 */
export interface CreateVoiceMessageParams {
  sender: 'user' | 'ai';
  audio_file_path?: string;
  audio_url?: string;
  transcription_text?: string; // ⭐ 新增：转写文本
  round_num?: number;
  task_id?: string;
  created_at?: string;
}

/** 创建图片消息请求参数 */
export interface CreateImageMessageParams {
  image_url: string;
  round_num?: number;
  image_width?: number;
  image_height?: number;
  created_at?: string;
}

/** 创建评分消息请求参数 */
export interface CreateScoreMessageParams {
  raw_text: string;
  round_num?: number;
  total_score?: string;
  dimension_scores?: string;
  advantages?: string;
  disadvantages?: string;
  suggestions?: string;
  improved_answer?: string;
  created_at?: string;
}

/** 更新转写请求参数 */
export interface UpdateTranscriptionParams {
  transcription_text: string;
  status?: 'pending' | 'processing' | 'done' | 'failed';
}

/** 更新会话请求参数 */
export interface UpdateSpokenConversationParams {
  title?: string;
  status?: 'active' | 'completed' | 'archived';
}

/**
 * 创建口语练习会话
 * POST /api/spoken/conversations
 */
export async function createSpokenConversation(
  params: CreateSpokenConversationParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<CreateSpokenConversationResponse>(API_ENDPOINTS.SPOKEN_CONVERSATIONS, {
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
 * 获取口语练习会话列表
 * GET /api/spoken/conversations
 * @param user_id 管理员可传入指定用户ID获取其他用户数据
 */
export async function getSpokenConversations(
  params?: {
    status_filter?: 'active' | 'completed' | 'archived';
    limit?: number;
    offset?: number;
    user_id?: number;  // 👑 管理员可传入用户ID获取其他用户数据
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<GetSpokenConversationsResponse>(API_ENDPOINTS.SPOKEN_CONVERSATIONS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params: params,
    ...(options || {}),
  });
}

/**
 * 管理员获取所有用户的口语练习会话列表（包含用户信息）
 * GET /api/admin/conversations
 */
export async function getAdminSpokenConversations(
  params?: {
    status_filter?: 'active' | 'completed' | 'archived';
    limit?: number;
    offset?: number;
    user_id?: number;  // 🆕 支持按用户 ID 搜索
  },
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<GetSpokenConversationsResponse>(API_ENDPOINTS.ADMIN_CONVERSATIONS, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params: params,
    ...(options || {}),
  });
}

/**
 * 获取单个会话详情
 * GET /api/spoken/conversations/{conversation_id}
 */
export async function getSpokenConversationDetail(
  conversationId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data: SpokenConversation }>(
    `${API_ENDPOINTS.SPOKEN_CONVERSATION_DETAIL}/${conversationId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      ...(options || {}),
    }
  );
}

/**
 * 更新会话
 * PUT /api/spoken/conversations/{conversation_id}
 */
export async function updateSpokenConversation(
  conversationId: number,
  params: UpdateSpokenConversationParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data: SpokenConversation }>(
    `${API_ENDPOINTS.SPOKEN_CONVERSATION_DETAIL}/${conversationId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: params,
      ...(options || {}),
    }
  );
}

/**
 * 删除口语练习会话
 * DELETE /api/spoken/conversations/{conversation_id}
 * @param conversationId 会话 ID
 * @param hardDelete 是否硬删除（默认 false 为软删除）
 */
export async function deleteSpokenConversation(
  conversationId: number,
  hardDelete: boolean = false,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{
    success: boolean;
    message?: string;
    data: {
      conversation_id: number;
      delete_type: 'soft' | 'hard';
    };
    error_code?: string;
  }>(
    `${API_ENDPOINTS.SPOKEN_CONVERSATION_DETAIL}/${conversationId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        hard_delete: hardDelete,
      },
      ...(options || {}),
    }
  );
}

/**
 * 获取会话的消息列表
 * GET /api/spoken/conversations/{conversation_id}/messages
 */
export async function getSpokenMessages(
  conversationId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<GetSpokenMessagesResponse>(
    `${API_ENDPOINTS.SPOKEN_MESSAGES}/${conversationId}/messages`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      ...(options || {}),
    }
  );
}

/**
 * 创建文本消息
 * POST /api/spoken/conversations/{conversation_id}/messages/text
 */
export async function createSpokenTextMessage(
  conversationId: number,
  params: CreateTextMessageParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data: SpokenMessage }>(
    `${API_ENDPOINTS.SPOKEN_MESSAGE_TEXT}/${conversationId}/messages/text`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: params,
      ...(options || {}),
    }
  );
}

/**
 * 创建语音消息
 * POST /api/spoken/conversations/{conversation_id}/messages/voice
 */
export async function createSpokenVoiceMessage(
  conversationId: number,
  params: CreateVoiceMessageParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data: SpokenMessage }>(
    `${API_ENDPOINTS.SPOKEN_MESSAGE_VOICE}/${conversationId}/messages/voice`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: params,
      ...(options || {}),
    }
  );
}

/**
 * 创建图片消息
 * POST /api/spoken/conversations/{conversation_id}/messages/image
 */
export async function createSpokenImageMessage(
  conversationId: number,
  params: CreateImageMessageParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data: SpokenMessage }>(
    `${API_ENDPOINTS.SPOKEN_MESSAGE_IMAGE}/${conversationId}/messages/image`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: params,
      ...(options || {}),
    }
  );
}

/**
 * 创建评分消息
 * POST /api/spoken/conversations/{conversation_id}/messages/score
 */
export async function createSpokenScoreMessage(
  conversationId: number,
  params: CreateScoreMessageParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data: SpokenMessage }>(
    `${API_ENDPOINTS.SPOKEN_MESSAGE_SCORE}/${conversationId}/messages/score`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: params,
      ...(options || {}),
    }
  );
}

/**
 * 更新语音消息的转写结果
 * PUT /api/spoken/messages/{message_id}/transcription
 */
export async function updateSpokenMessageTranscription(
  messageId: number,
  params: UpdateTranscriptionParams,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string }>(
    `${API_ENDPOINTS.SPOKEN_TRANSCRIPTION}/${messageId}/transcription`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: params,
      ...(options || {}),
    }
  );
}

/**
 * 获取消息详情
 * GET /api/spoken/messages/{message_id}
 */
export async function getSpokenMessageDetail(
  messageId: number,
  options?: { [key: string]: any },
) {
  const token = localStorage.getItem(TOKEN_KEY);
  
  return request<{ success: boolean; message?: string; data: SpokenMessage }>(
    `${API_ENDPOINTS.SPOKEN_MESSAGE_DETAIL}/${messageId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      ...(options || {}),
    }
  );
}

// ==================== 工作流类型管理 ====================

/**
 * 获取工作流类型列表（分页）
 * GET /api/workflow-types
 */
export async function getWorkflowTypes(
  params?: {
    only_active?: boolean;
    page?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  // 不需要在这里手动设置 token,请求拦截器会自动添加
  const requestConfig = {
    method: 'GET',
    params,
    ...(options || {}),
  };

  return request<API.WorkflowTypeListResponse>(API_ENDPOINTS.WORKFLOW_TYPES, requestConfig);
}

/**
 * 获取工作流类型详情
 * GET /api/workflow-types/{option_id}
 */
export async function getWorkflowTypeDetail(
  optionId: number,
  options?: { [key: string]: any },
) {
  // 不需要在这里手动设置 token，请求拦截器会自动添加
  return request<API.WorkflowTypeDetailResponse>(
    `${API_ENDPOINTS.WORKFLOW_TYPES}/${optionId}`,
    {
      method: 'GET',
      ...(options || {}),
    },
  );
}

/**
 * 创建工作流类型选项
 * POST /api/workflow-types
 */
export async function createWorkflowType(
  data: {
    label: string;
    value: string;
    price: number;
    description?: string;
    sort?: number;
  },
  options?: { [key: string]: any },
) {
  // 不需要在这里手动设置 token,请求拦截器会自动添加
  return request<API.WorkflowTypeDetailResponse>(API_ENDPOINTS.WORKFLOW_TYPES, {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/**
 * 更新工作流类型选项
 * PUT /api/workflow-types/{option_id}
 */
export async function updateWorkflowType(
  optionId: number,
  data: {
    label?: string;
    price?: number;
    description?: string;
    sort?: number;
    is_active?: number;
  },
  options?: { [key: string]: any },
) {
  // 不需要在这里手动设置 token,请求拦截器会自动添加
  return request<API.WorkflowTypeDetailResponse>(
    `${API_ENDPOINTS.WORKFLOW_TYPES}/${optionId}`,
    {
      method: 'PUT',
      data,
      ...(options || {}),
    },
  );
}

/**
 * 删除工作流类型选项（软删除）
 * DELETE /api/workflow-types/{option_id}
 */
export async function deleteWorkflowType(
  optionId: number,
  options?: { [key: string]: any },
) {
  // 不需要在这里手动设置 token,请求拦截器会自动添加
  return request<{
    success: boolean;
    message?: string;
    data: null;
  }>(`${API_ENDPOINTS.WORKFLOW_TYPES}/${optionId}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
