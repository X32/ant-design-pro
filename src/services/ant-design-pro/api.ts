// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
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

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
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
