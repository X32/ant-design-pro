// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 发送验证码 POST /api/login/captcha */
export async function getFakeCaptcha(
  params: {
    // query
    /** 手机号 */
    phone?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.FakeCaptcha>('/api/login/captcha', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 微信登录接口
 * POST /api/auth/wechat/login
 * 
 * @param data.code - 微信授权码（必填）
 * @returns 登录成功返回用户信息和 token
 */
export async function wechatLogin(
  data: {
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
        username: string;
        wechat_openid?: string;
        wechat_unionid?: string;
        wechat_nickname?: string;
        wechat_avatar?: string;
        login_type: string;
        is_active: boolean;
        is_superuser: boolean;
        created_at: string;
      };
      login_method: string;
      is_new_user: boolean;
      auto_registered?: boolean;
    };
  }>('/api/auth/wechat/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    ...(options || {}),
  });
}
